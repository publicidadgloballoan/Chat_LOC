from flask import Flask, request, jsonify, send_from_directory
import json
import os
import requests
import sqlite3
import re
import subprocess
import threading
import multimedia_decoder
import logging
import time
import secrets
import sys
import psutil
import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import queue

# --- CONFIGURACIÓN ESTRATÉGICA ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(os.path.dirname(__file__), "nucleo_debug.log")),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
EVO_URL = "http://127.0.0.1:8080"
EVO_API_KEY = "03d27a0c34fa708178148142d6f5eedc86cd5e3a"
EVO_INSTANCE = "chatbot_punto_a"
TG_URL = "http://127.0.0.1:8082"
TG_INSTANCE = "colaboratium_ia_bot"

CONFIG_DIR = os.path.join(os.path.dirname(__file__), "config")
DB_PATH = os.path.join(CONFIG_DIR, "brain_sessions.db")

# Control de Concurrencia y Saturacion
processing_count = 0
MAX_CONCURRENT = 5
ADMIN_PHONES = ["5491136822400", "5491100000000"] 
COMMAND_LOG_PATH = os.path.join(os.path.dirname(__file__), "command_logs.json")
CUSTOM_COMMANDS_PATH = os.path.join(os.path.dirname(__file__), "custom_commands.json")
MEDIA_LIB_DIR = os.path.join(os.path.dirname(__file__), "assets")
os.makedirs(MEDIA_LIB_DIR, exist_ok=True)
processing_contacts = set() # Global dedup for MKT loop
ia_queue = queue.PriorityQueue()
SYSTEM_STATUS = {
    "cpu": 0, 
    "queue_size": 0, 
    "stress_mode": False, 
    "latencies": [],
    "workers_active": 0,
    "last_worker_heartbeat": 0,
    "processing_now": 0
}

# --- IN-MEMORY CACHE (KERNEL v2) ---
knowledge_cache = {}   # {inst_name: {"data": str, "ts": float, "size": int}}
config_cache = {}      # {inst_name: {"a1": dict, "a2": dict, "a3": dict, "ts": float}}
conversation_cache = {} # {(phone, inst_name): [{"role": "user/assistant", "content": str, "ts": float}]}
CACHE_TTL = 300        # 5 minutos

# --- SWARM LOAD BALANCER ---
swarm_state = {
    "orchestrators": {},  # {inst_name: {"agents": [...], "next_idx": 0, "warmup_limit": 20}}
    "agents": {},         # {inst_name: {"parent": str, "load": 0, "status": "idle", "max_hourly": 50}}
}

def cache_get_knowledge(inst_name):
    """Obtiene conocimiento de caché o disco. Reduce latencia de ~200ms a ~0ms."""
    now = time.time()
    cached = knowledge_cache.get(inst_name)
    if cached and (now - cached["ts"]) < CACHE_TTL:
        logger.info(f" [CACHE-HIT] Conocimiento de {inst_name} desde RAM ({cached['size']} chars)")
        return cached["data"]
    
    # Cache miss - leer de disco
    knowledge = ""
    
    # NUEVO: Primero incluir el ia_prompt de A1 si existe
    conf_a1, _, _ = cache_get_config(inst_name)
    ia_prompt_manual = conf_a1.get("ia_prompt", "")
    if ia_prompt_manual:
        knowledge += f"REGLAS E INSTRUCCIONES ESPECÍFICAS:\n{ia_prompt_manual}\n\n"

    kp = os.path.join(CONFIG_DIR, inst_name, "knowledge.txt")
    if os.path.exists(kp):
        knowledge += open(kp, "r", encoding="utf-8").read() + "\n\n"
    
    consolidated_path = os.path.join(CONFIG_DIR, inst_name, "consolidated_knowledge.md")
    # 1. Cargar JSONs estructurados (PRIORIDAD ALTA)
    # Buscar en raíz y en subdirectorio 'configs'
    json_dirs = [os.path.join(CONFIG_DIR, inst_name), os.path.join(CONFIG_DIR, inst_name, "configs")]
    for jdir in json_dirs:
        for json_file in ["pricing.json", "identity.json", "logistics.json"]:
            jp = os.path.join(jdir, json_file)
            if os.path.exists(jp):
                try:
                    with open(jp, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        knowledge += f"\n--- DATOS DE {json_file.split('.')[0].upper()} (OFICIAL) ---\n"
                        knowledge += json.dumps(data, indent=2, ensure_ascii=False) + "\n"
                except: pass

    # 2. Cargar conocimiento consolidado (CONTEXTO ADICIONAL)
    # Buscar en raíz y en subdirectorio 'knowledge'
    kn_paths = [
        os.path.join(CONFIG_DIR, inst_name, "consolidated_knowledge.md"),
        os.path.join(CONFIG_DIR, inst_name, "knowledge", "consolidated_knowledge.md"),
        os.path.join(CONFIG_DIR, inst_name, "knowledge.txt"),
        os.path.join(CONFIG_DIR, inst_name, "knowledge", "knowledge.txt")
    ]
    for kp in kn_paths:
        if os.path.exists(kp) and os.path.getsize(kp) > 0:
            with open(kp, "r", encoding="utf-8") as f:
                knowledge += f"\n--- CONOCIMIENTO HISTÓRICO / CHATS ({os.path.basename(kp)}) ---\n"
                knowledge += f.read()
    
    knowledge_cache[inst_name] = {"data": knowledge, "ts": now, "size": len(knowledge)}
    logger.info(f" [CACHE-MISS] Conocimiento de {inst_name} cargado a RAM ({len(knowledge)} chars)")
    return knowledge

def cache_get_history(phone, inst_name, limit=10):
    """Obtiene el historial de conversación desde RAM o DB."""
    key = (phone, inst_name)
    if key in conversation_cache:
        # Retornar los últimos 'limit' mensajes
        return conversation_cache[key][-limit:]
    
    # Cache miss - Cargar desde DB logs
    try:
        conn = sqlite3.connect(DB_PATH, timeout=30)
        conn.execute("PRAGMA busy_timeout = 30000")
        c = conn.cursor()
        c.execute("SELECT direction, message FROM logs WHERE phone=? AND instance=? ORDER BY created_at DESC LIMIT ?", (phone, inst_name, limit))
        rows = c.fetchall()
        conn.close()
        
        history = []
        for r in reversed(rows):
            role = "assistant" if r[0] == "out" else "user"
            history.append({"role": role, "content": r[1]})
        
        conversation_cache[key] = history
        return history
    except:
        return []

def cache_add_message(phone, inst_name, role, content):
    """Agrega un mensaje al historial en RAM."""
    key = (phone, inst_name)
    if key not in conversation_cache:
        cache_get_history(phone, inst_name) # Inicializar si no existe
    
    conversation_cache[key].append({"role": role, "content": content})
    # Mantener solo los últimos 20 mensajes en RAM para no saturar
    if len(conversation_cache[key]) > 20:
        conversation_cache[key] = conversation_cache[key][-20:]

def cache_get_config(inst_name):
    """Obtiene configuración A1/A2/A3 de caché o disco."""
    now = time.time()
    cached = config_cache.get(inst_name)
    if cached and (now - cached["ts"]) < CACHE_TTL:
        return cached["a1"], cached["a2"], cached["a3"]
    
    conf_a1, conf_a2, conf_a3 = {}, {}, {}
    for key, fname in [("a1", "config_a1.json"), ("a2", "config_a2.json"), ("a3", "config_a3.json")]:
        possible_paths = [
            os.path.join(CONFIG_DIR, inst_name, fname),
            os.path.join(CONFIG_DIR, inst_name, "configs", fname)
        ]
        found_data = {}
        for fp in possible_paths:
            if os.path.exists(fp):
                try:
                    found_data = json.load(open(fp, "r", encoding="utf-8"))
                    break
                except: pass
        if key == "a1": conf_a1 = found_data
        elif key == "a2": conf_a2 = found_data
        elif key == "a3": conf_a3 = found_data
    
    config_cache[inst_name] = {"a1": conf_a1, "a2": conf_a2, "a3": conf_a3, "ts": now}
    return conf_a1, conf_a2, conf_a3

def cache_invalidate(inst_name):
    """Invalida caché cuando se actualiza conocimiento."""
    knowledge_cache.pop(inst_name, None)
    config_cache.pop(inst_name, None)
    logger.info(f" [CACHE] Invalidado caché para {inst_name}")

def swarm_get_next_agent(orchestrator_name):
    """Round Robin: obtiene el siguiente agente disponible del enjambre."""
    orch = swarm_state["orchestrators"].get(orchestrator_name)
    if not orch or not orch["agents"]:
        return None
    
    agents = orch["agents"]
    attempts = 0
    while attempts < len(agents):
        idx = orch["next_idx"] % len(agents)
        orch["next_idx"] = (orch["next_idx"] + 1)
        agent_name = agents[idx]
        agent = swarm_state["agents"].get(agent_name, {})
        
        if agent.get("status") == "connected" and agent.get("load", 0) < agent.get("max_hourly", 50):
            agent["load"] = agent.get("load", 0) + 1
            return agent_name, agent
        attempts += 1
    
    return None  # Todos ocupados/desconectados

def get_cache_stats():
    """Estadísticas de uso de caché para #Systema#."""
    import sys
    total_kb = sum(sys.getsizeof(v.get("data", "")) for v in knowledge_cache.values()) / 1024
    return {
        "knowledge_entries": len(knowledge_cache),
        "config_entries": len(config_cache),
        "total_cache_kb": f"{total_kb:.1f}KB",
        "swarm_orchestrators": len(swarm_state["orchestrators"]),
        "swarm_agents": len(swarm_state["agents"]),
    }

def cpu_monitor_loop():
    """Monitorea el uso de CPU y actualiza el estado global."""
    global SYSTEM_STATUS
    while True:
        try:
            SYSTEM_STATUS["cpu"] = psutil.cpu_percent(interval=1)
            SYSTEM_STATUS["queue_size"] = ia_queue.qsize()
        except: pass
        time.sleep(2)

def ia_queue_worker(worker_id):
    """Procesador de cola con backoff por saturación de CPU."""
    logger.info(f" [QUEUE] Iniciando trabajador de cola IA #{worker_id}...")
    global SYSTEM_STATUS
    while True:
        try:
            # Heartbeat
            SYSTEM_STATUS["last_worker_heartbeat"] = time.time()
            
            try:
                # El PriorityQueue devuelve (prioridad, tarea)
                priority, task = ia_queue.get(timeout=5)
            except queue.Empty:
                continue

            if task is None: break
            
            # Backoff si el sistema está saturado (>90% CPU)
            while SYSTEM_STATUS["cpu"] > 90:
                logger.warning(f" [SATURACION] Worker #{worker_id} - CPU al {SYSTEM_STATUS['cpu']}%. Pausando...")
                time.sleep(5)
            
            # Procesar tarea
            SYSTEM_STATUS["workers_active"] += 1
            SYSTEM_STATUS["processing_now"] += 1
            start_time = time.time()
            try:
                phone = task.get('phone', 'unknown')
                logger.info(f" [QUEUE] Worker #{worker_id} procesando tarea [PRIO={priority}] para {phone}...")
                process_ia_async(**task)
                duration = time.time() - start_time
                logger.info(f" [QUEUE] Worker #{worker_id} finalizó tarea para {phone} en {duration:.2f}s")
            except Exception as e:
                logger.error(f" [QUEUE-PROC-ERR] Worker #{worker_id} en task {task.get('phone')}: {e}")
            finally:
                SYSTEM_STATUS["workers_active"] -= 1
                SYSTEM_STATUS["processing_now"] -= 1
                ia_queue.task_done()
        except Exception as e:
            logger.error(f" [QUEUE-ERR] Worker #{worker_id}: {e}")
            time.sleep(1)

# Iniciar hilos de control
threading.Thread(target=cpu_monitor_loop, daemon=True).start()
for i in range(MAX_CONCURRENT):
    threading.Thread(target=ia_queue_worker, args=(i,), daemon=True).start()

# --- BASE DE DATOS (NUEVA ARQUITECTURA SILO) ---
def init_db():
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.execute("PRAGMA journal_mode=WAL") # Habilitar modo WAL para concurrencia masiva
    conn.execute("PRAGMA busy_timeout = 30000")
    c = conn.cursor()
    
    # Las tablas ya fueron reseteadas en la ejecucion anterior.
    # Ahora las mantenemos persistentes.

    # PRIMARY KEY es (phone, instance) para que Juan hablando con Nico NO sea el mismo Juan hablando con Global
    c.execute('''CREATE TABLE IF NOT EXISTS sessions 
                 (phone TEXT, instance TEXT, state TEXT, manual INTEGER, name TEXT, channel TEXT, 
                  pending_handoff INTEGER DEFAULT 0, last_summary TEXT, name_confirmed INTEGER DEFAULT 0,
                  last_incoming_at DATETIME, last_outgoing_at DATETIME,
                  trace_id TEXT, last_origin TEXT DEFAULT 'BOT',
                  PRIMARY KEY (phone, instance))''')

    # Migración de columnas faltantes para sessions (compatibilidad con bases de datos previas)
    try:
        c.execute("SELECT last_origin FROM sessions LIMIT 1")
    except sqlite3.OperationalError:
        try:
            c.execute("ALTER TABLE sessions ADD COLUMN last_origin TEXT DEFAULT 'BOT'")
        except Exception as e:
            logger.error(f" [DB-MIGRATE] Error agregando last_origin a sessions: {e}")
    
    c.execute('''CREATE TABLE IF NOT EXISTS logs
                 (phone TEXT, instance TEXT, message TEXT, direction TEXT, 
                  trace_id TEXT, origin TEXT,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    
    # NUEVAS TABLAS MKT EMISIVO
    c.execute('''CREATE TABLE IF NOT EXISTS mkt_campaigns
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, status TEXT DEFAULT 'active', 
                  template TEXT, media_path TEXT, delay_seconds INTEGER DEFAULT 30, 
                  metadata TEXT, company_id INTEGER,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    # Migración de columnas faltantes para mkt_campaigns (compatibilidad)
    try:
        c.execute("SELECT metadata FROM mkt_campaigns LIMIT 1")
    except sqlite3.OperationalError:
        try:
            c.execute("ALTER TABLE mkt_campaigns ADD COLUMN metadata TEXT")
        except Exception as e:
            logger.error(f" [DB-MIGRATE] Error agregando metadata a mkt_campaigns: {e}")

    try:
        c.execute("SELECT company_id FROM mkt_campaigns LIMIT 1")
    except sqlite3.OperationalError:
        try:
            c.execute("ALTER TABLE mkt_campaigns ADD COLUMN company_id INTEGER")
        except Exception as e:
            logger.error(f" [DB-MIGRATE] Error agregando company_id a mkt_campaigns: {e}")
    
    c.execute('''CREATE TABLE IF NOT EXISTS mkt_contacts
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, campaign_id INTEGER, trace_id TEXT, 
                  phone TEXT, email TEXT, name TEXT, status TEXT DEFAULT 'pending', 
                  channel TEXT DEFAULT 'WA', metadata TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY(campaign_id) REFERENCES mkt_campaigns(id))''')

    c.execute('''CREATE TABLE IF NOT EXISTS mkt_templates
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, content TEXT, 
                  subject TEXT, media_path TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS mkt_execution_logs
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, campaign_id INTEGER, 
                  contact_name TEXT, channel TEXT, status TEXT, message TEXT, 
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS rubros 
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS tickets
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT, channel TEXT, 
                  status TEXT DEFAULT 'open', summary TEXT, a3 INTEGER DEFAULT 0,
                  assigned_to TEXT, priority TEXT DEFAULT 'normal',
                  metadata TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    
    # Insert default rubros if empty
    c.execute("SELECT count(*) FROM rubros")
    if c.fetchone()[0] == 0:
        for r in ['CLIENTES', 'VENDEDORES', 'PROVEEDORES', 'SOPORTE', 'MKT']:
            c.execute("INSERT OR IGNORE INTO rubros (name) VALUES (?)", (r,))

    c.execute('''CREATE TABLE IF NOT EXISTS contacts_agenda
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT, email TEXT, 
                  instagram TEXT, facebook TEXT, linkedin TEXT, telegram TEXT,
                  dni TEXT, address TEXT, cbu TEXT, alias TEXT, bank TEXT, branch TEXT,
                  last_channel TEXT, origin TEXT, group_name TEXT, metadata TEXT, 
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  UNIQUE(phone))''')

    c.execute('''CREATE TABLE IF NOT EXISTS mkt_templates
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, content TEXT, 
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS companies
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS connections
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, company_id INTEGER, instance TEXT, phone TEXT, channel TEXT,
                  FOREIGN KEY(company_id) REFERENCES companies(id))''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS telemetry
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, instance TEXT, type TEXT, duration REAL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS processed_msgs
                 (msg_id TEXT PRIMARY KEY, instance TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    
    # Verificar si companies esta vacio para meter el default
    c.execute("SELECT COUNT(*) FROM companies")
    if c.fetchone()[0] == 0:
        c.execute("INSERT INTO companies (name) VALUES (?)", ('PUNTO A - DEFAULT',))
        comp_id = c.lastrowid
        c.execute("INSERT INTO connections (company_id, instance, channel) VALUES (?, ?, ?)", 
                  (comp_id, 'chatbot_punto_a', 'whatsapp'))
        
    conn.commit()
    conn.close()
    logger.info(" [DB] Base de datos limpia y lista con arquitectura de Silos.")

# --- HELPERS DE SESIÓN ---
def log_message(phone, instance, message, direction, trace_id=None, origin='CLIENTE'):
    try:
        conn = sqlite3.connect(DB_PATH, timeout=30)
        conn.execute("PRAGMA busy_timeout = 30000")
        c = conn.cursor()
        c.execute("INSERT INTO logs (phone, instance, message, direction, trace_id, origin) VALUES (?, ?, ?, ?, ?, ?)", 
                  (phone, instance, str(message), direction, trace_id, origin))
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f" [!] Error Log DB: {e}")

def get_session(phone, instance):
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.execute("PRAGMA busy_timeout = 30000")
    c = conn.cursor()
    c.execute("SELECT state, manual, name, channel, instance, pending_handoff, name_confirmed, last_summary FROM sessions WHERE phone=? AND instance=?", (phone, instance))
    res = c.fetchone()
    conn.close()
    if res:
        logger.info(f" [DB-DEBUG] get_session for {phone} in {instance} returned: {res}")
        # FORZAR MANUAL 0 PARA PRUEBAS SI ES EL NUMERO DEL USER
        if "5491136822400" in str(phone):
            res_list = list(res)
            res_list[1] = 0 # manual
            return tuple(res_list)
    return res if res else ("MENU", 0, None, "whatsapp", instance, 0, 0, None)

def update_session(phone, instance, state=None, manual=None, name=None, channel=None, pending_handoff=None, summary=None, name_confirmed=None, update_incoming=False, update_outgoing=False, last_origin='BOT'):
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.execute("PRAGMA busy_timeout = 30000")
    c = conn.cursor()
    c.execute("INSERT OR IGNORE INTO sessions (phone, instance, state, manual, name_confirmed, last_origin) VALUES (?, ?, 'MENU', 0, 0, ?)", (phone, instance, last_origin))
    
    upd = []
    params = []
    if state is not None: upd.append("state=?"); params.append(state)
    if manual is not None: upd.append("manual=?"); params.append(manual)
    if name is not None: upd.append("name=?"); params.append(name)
    if channel is not None: upd.append("channel=?"); params.append(channel)
    if pending_handoff is not None: upd.append("pending_handoff=?"); params.append(pending_handoff)
    if summary is not None: upd.append("last_summary=?"); params.append(summary)
    if name_confirmed is not None: upd.append("name_confirmed=?"); params.append(name_confirmed)
    if update_incoming: upd.append("last_incoming_at=CURRENT_TIMESTAMP")
    if update_outgoing: upd.append("last_outgoing_at=CURRENT_TIMESTAMP")
    
    upd.append("last_origin=?"); params.append(last_origin)
    
    if upd:
        sql = f"UPDATE sessions SET {', '.join(upd)} WHERE phone=? AND instance=?"
        params.extend([phone, instance])
        c.execute(sql, tuple(params))
    conn.commit()
    conn.close()

def log_message(phone, instance, message, direction, trace_id=None, origin='IA'):
    """Registra mensaje en base de datos. Prioriza la conexion si es posible."""
    try:
        conn = sqlite3.connect(DB_PATH, timeout=30)
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA busy_timeout = 30000")
        c = conn.cursor()
        # Asegurarse de que el mensaje sea string
        msg_str = str(message) if message else ""
        c.execute("INSERT INTO logs (phone, instance, message, direction, trace_id, origin) VALUES (?, ?, ?, ?, ?, ?)", 
                  (phone, instance, msg_str, direction, trace_id, origin))
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f" [DB-ERR] log_message: {e}")

def log_command(admin_phone, instance, command, response):
    try:
        logs = []
        if os.path.exists(COMMAND_LOG_PATH):
            with open(COMMAND_LOG_PATH, 'r', encoding='utf-8') as f: logs = json.load(f)
        logs.append({
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "admin": admin_phone,
            "instance": instance,
            "command": command,
            "response": response[:100] + ("..." if len(response) > 100 else "")
        })
        with open(COMMAND_LOG_PATH, 'w', encoding='utf-8') as f: json.dump(logs[-500:], f, indent=4, ensure_ascii=False)
    except Exception as e: logger.error(f" [LOG-CMD] Error: {e}")

def get_company_media_path(company_id, file_name=None):
    base = MEDIA_LIB_DIR
    if company_id:
        try:
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute("SELECT name FROM companies WHERE id=?", (company_id,))
            row = c.fetchone()
            conn.close()
            if row:
                folder_name = row[0].lower()
                base = os.path.join(MEDIA_LIB_DIR, folder_name)
            else:
                base = os.path.join(MEDIA_LIB_DIR, f"company_{company_id}")
        except:
            base = os.path.join(MEDIA_LIB_DIR, f"company_{company_id}")
    
    if not os.path.exists(base): os.makedirs(base, exist_ok=True)
    if file_name:
        return os.path.join(base, file_name)
    return base

def sync_media_manifest(company_id=None):
    try:
        target_dir = get_company_media_path(company_id)
        
        if not os.path.exists(target_dir):
             os.makedirs(target_dir, exist_ok=True)
             if not company_id: return []
        
        manifest_path = os.path.join(target_dir, "manifest.json")
        if not os.path.exists(manifest_path):
            manifest = []
        else:
            with open(manifest_path, "r", encoding="utf-8") as f: 
                try: manifest = json.load(f)
                except: manifest = []
        
        files = [f for f in os.listdir(target_dir) if os.path.isfile(os.path.join(target_dir, f)) and f != "manifest.json"]
        existing_names = [m.get('name') for m in manifest if isinstance(m, dict)]
        
        for f in files:
            if f not in existing_names:
                ext = f.split('.')[-1].lower()
                m_type = 'Documentos'
                if ext in ['png', 'jpg', 'jpeg', 'gif']: m_type = 'Fotos'
                elif ext in ['mp4', 'mov', 'avi']: m_type = 'Videos'
                elif ext in ['xlsx', 'csv']: m_type = 'Tablas'
                manifest.append({"name": f, "type": m_type, "context": "", "summary": ""})
        
        manifest = [m for m in manifest if isinstance(m, dict) and m.get('name') in files]
        with open(manifest_path, "w", encoding="utf-8") as f: json.dump(manifest, f, indent=4, ensure_ascii=False)
        return manifest
    except Exception as e: 
        logger.error(f" [MEDIA-SYNC] ERROR: {e}")
        return []

def get_system_stats():
    import psutil
    cpu = psutil.cpu_percent()
    ram = psutil.virtual_memory()
    return {
        "cpu": f"{cpu}%",
        "ram_total": f"{ram.total / (1024**3):.1f}GB",
        "ram_avail": f"{ram.available / (1024**3):.1f}GB",
        "ram_used": f"{ram.percent}%"
    }

def query_ollama(user_msg, system_prompt="Eres un asistente útil.", inst_name="default", history=None):
    max_retries = 2
    for attempt in range(max_retries):
        try:
            ia_options = {"num_ctx": 4096, "temperature": 0.3, "num_predict": 800}
            try:
                _, conf_a2, _ = cache_get_config(inst_name)
                ia_options.update({k: v for k, v in conf_a2.items() if k in ia_options})
            except: pass

            logger.info(f" [OLLAMA] Querying for {inst_name} (Attempt {attempt+1}/{max_retries}) ctx={ia_options['num_ctx']}...")
            
            messages = [{"role": "system", "content": system_prompt + "\n\nCRITICAL: DO NOT SEND ANY LINKS OR URLs. If you mention photos, just say they are being sent. NEVER invent Imgur or similar links."}]
            if history:
                messages.extend(history)
            
            if not history or history[-1]["content"] != user_msg:
                messages.append({"role": "user", "content": user_msg})

            r = requests.post("http://localhost:11434/api/chat", json={
                "model": "llama3.2:3b-instruct-q4_K_M",
                "messages": messages,
                "options": ia_options, 
                "stream": False
            }, timeout=45) # Reducido timeout para no bloquear workers eternamente
            
            if r.status_code != 200:
                logger.error(f" [OLLAMA] Error {r.status_code}: {r.text}")
                if attempt < max_retries - 1: continue
                return f"Error de motor IA (HTTP {r.status_code})"
                
            res = r.json().get('message', {}).get('content', '')
            logger.info(f" [OLLAMA] Respuesta recibida ({len(res)} chars)")
            if not res:
                if attempt < max_retries - 1: continue
                return "Error: IA no generó respuesta."
            return res

        except Exception as e:
            logger.error(f" [OLLAMA ERROR] Intento {attempt+1}: {e}")
            if attempt < max_retries - 1:
                time.sleep(1)
                continue
            return f"Error crítico de motor IA: {str(e)[:50]}"
    return "Error crítico de motor IA"

def get_chat_summary(phone, inst):
    """Genera un resumen de la conversación usando Ollama"""
    try:
        conn = sqlite3.connect(DB_PATH, timeout=30)
        conn.execute("PRAGMA busy_timeout = 30000")
        c = conn.cursor()
        c.execute("SELECT message, direction FROM logs WHERE phone=? AND instance=? ORDER BY created_at DESC LIMIT 50", (phone, inst))
        rows = c.fetchall()
        conn.close()
        
        if not rows: return "No hay historial suficiente para resumir."
        
        history = "\n".join([f"{'IA' if r[1]=='out' else 'Cliente'}: {r[0]}" for r in reversed(rows)])
        ai_prompt = f"Resume los puntos clave de esta conversación con el cliente {phone}. Menciona qué busca, su interés principal y si hay algún problema pendiente:\n\n{history}\n\nResumen conciso (máximo 5 líneas):"
        summary = query_ollama(ai_prompt, "Conversation Summarizer")
        return summary
    except Exception as e:
        logger.error(f" [SUMMARIZE-ERR] {e}")
        return "Error al generar resumen."

# --- API DASHBOARD ---
@app.route('/api/data', methods=['GET', 'POST'])
def handle_api_data():
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.execute("PRAGMA busy_timeout = 30000")
    c = conn.cursor()
    data = request.get_json(silent=True) or {}
    action = data.get('action') or request.args.get('action')

    if request.method == 'GET' and action:
        if action == 'get_mkt_logs':
            try:
                c.execute("SELECT id, campaign_id, contact_name, channel, status, message, created_at FROM mkt_execution_logs ORDER BY created_at DESC LIMIT 50")
                logs = [{"id": r[0], "campId": r[1], "name": r[2], "channel": r[3], "status": r[4], "msg": r[5], "time": r[6]} for r in c.fetchall()]
                return jsonify({"success": True, "logs": logs})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'get_dash_state':
            try:
                c.execute("SELECT metadata FROM telemetry WHERE phone='DASHBOARD_STATE'")
                row = c.fetchone()
                state = json.loads(row[0]) if row else {"compId": 1, "instance": "general"}
                return jsonify({"success": True, "state": state})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'get_tickets':
            try:
                status_filter = request.args.get('status')
                company_id = request.args.get('companyId')
                
                query = "SELECT id, phone, channel, status, summary, a3, assigned_to, priority, created_at, summary_ia FROM tickets"
                params = []
                where_clauses = []
                
                if company_id:
                    where_clauses.append("company_id = ?")
                    params.append(company_id)
                else:
                    return jsonify({"success": False, "error": "companyId is required for tickets"})
                
                if status_filter:
                    statuses = status_filter.split(',')
                    placeholders = ','.join(['?'] * len(statuses))
                    where_clauses.append(f"status IN ({placeholders})")
                    params.extend(statuses)
                
                if where_clauses:
                    query += " WHERE " + " AND ".join(where_clauses)
                
                query += " ORDER BY created_at DESC"
                
                c.execute(query, tuple(params))
                rows = c.fetchall()
                tickets = []
                for r in rows:
                    tickets.append({
                        "id": r[0], "phone": r[1], "channel": r[2], "status": r[3],
                        "summary": r[4], "a3": r[5], "assigned_to": r[6], "priority": r[7], "time": r[8], "summary_ia": r[9]
                    })
                return jsonify({"success": True, "tickets": tickets})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'get_team':
            try:
                comp_id = request.args.get('companyId')
                if comp_id:
                    c.execute("SELECT name, phone FROM contacts_agenda WHERE group_name='TEAM' AND company_id=?", (comp_id,))
                else:
                    c.execute("SELECT name, phone FROM contacts_agenda WHERE group_name='TEAM'")
                team = [{"name": r[0], "phone": r[1]} for r in c.fetchall()]
                return jsonify({"success": True, "team": team})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

    if request.method == 'POST':
        if not request.is_json and not request.form:
             # Formdata for uploads
             pass
        else:
            if request.is_json:
                data = request.get_json(silent=True) or {}
                if action == 'run_stress_test':
                    target = int(data.get('conversations', 10))
                    inst_name = data.get('instance', 'chatbot_punto_a')
                    logger.info(f" [STRESS] Iniciando prueba de stress: {target} conversaciones para {inst_name}...")
                    SYSTEM_STATUS["stress_mode"] = True
                    
                    def stress_runner():
                        global SYSTEM_STATUS
                        for i in range(target):
                            # Simular ráfaga: Encolar de a 5 para mayor impacto pero controlado
                            for _ in range(5):
                                if i >= target: break
                                mock_jid = f"stress_{i}_{uuid.uuid4().hex[:4]}@s.whatsapp.net"
                                mock_body = "Hola, necesito información sobre el mercado fintech y los requisitos de KYC."
                                webhook_data = {
                                    "instance": inst_name,
                                    "data": {
                                        "key": {"remoteJid": mock_jid, "fromMe": False, "id": f"STRESS_{i}"},
                                        "message": {"conversation": mock_body},
                                        "pushName": f"User Stress {i}"
                                    }
                                }
                                # Encolar con prioridad 10 (Stress)
                                ia_queue.put((10, {
                                    "jid": mock_jid,
                                    "body": mock_body,
                                    "phone": mock_jid.split('@')[0],
                                    "inst_name": inst_name,
                                    "msg_data": webhook_data["data"]
                                }))
                                i += 1
                            time.sleep(0.1) # Ráfaga de 5 msgs cada 100ms = 50 msgs/sec
                        
                        logger.info(f" [STRESS] Encoladas {target} tareas de simulación.")
                        time.sleep(30) # Mantener modo stress un poco más
                        SYSTEM_STATUS["stress_mode"] = False
                    
                    threading.Thread(target=stress_runner, daemon=True).start()
                    return jsonify({"success": True, "message": f"Prueba de {target} iniciada con éxito."})

                if action == 'get_system_status':
                    return jsonify({"success": True, "systemStatus": SYSTEM_STATUS})
            else:
                data = request.form.to_dict()
            
            action = data.get('action') or request.args.get('action')
        content = data.get('data')

        if action == 'sync':
            try:
                # Obtener todas las instancias de WhatsApp Service (Baileys)
                res = requests.get(f"{EVO_URL}/instance/fetchInstances", headers={"apikey": EVO_API_KEY}, timeout=10)
                if res.status_code == 200:
                    instances_data = res.json()
                    for item in instances_data:
                        inst_name = item.get('instance', {}).get('instanceName')
                        status = item.get('instance', {}).get('status')
                        if inst_name and status == 'connected':
                            logger.info(f" [SYNC] Configurando Webhook (Baileys) para {inst_name}...")
                            webhook_url = "http://localhost:5000/webhook"
                            # Usar PUT para el servicio Node custom
                            res_w = requests.put(f"{EVO_URL}/webhook/set/{inst_name}", 
                                         json={"url": webhook_url}, 
                                         headers={"apikey": EVO_API_KEY}, timeout=5)
                            logger.info(f" [SYNC] Resultado Webhook {inst_name}: {res_w.status_code}")
                            rebuild_knowledge(inst_name)
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'rebuild_knowledge':
            inst = data.get('instance')
            if inst: rebuild_knowledge(inst); return jsonify({"success": True})
            return jsonify({"success": False, "error": "No instance"})

        if action == 'save_companies':
            try:
                companies_list = data.get('companies', [])
                c.execute("DELETE FROM connections"); c.execute("DELETE FROM companies")
                for comp in companies_list:
                    c.execute("INSERT INTO companies (id, name) VALUES (?, ?)", (comp.get('id'), comp.get('name', '').upper()))
                    for conn_data in comp.get('connections', []):
                        c.execute("INSERT INTO connections (company_id, instance, channel, phone) VALUES (?, ?, ?, ?)", (comp.get('id'), conn_data.get('instance'), conn_data.get('channel'), conn_data.get('phone')))
                conn.commit()
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'save_config':
            try:
                conf_type, conf_data, inst = data.get('type'), data.get('config'), data.get('instance', EVO_INSTANCE)
                os.makedirs(os.path.join(CONFIG_DIR, inst, "configs"), exist_ok=True)
                os.makedirs(os.path.join(CONFIG_DIR, inst, "knowledge"), exist_ok=True)
                
                if conf_type == 'a1':
                    with open(os.path.join(CONFIG_DIR, inst, "configs", "config_a1.json"), "w", encoding="utf-8") as f: json.dump(conf_data, f, indent=4, ensure_ascii=False)
                elif conf_type == 'a2':
                    with open(os.path.join(CONFIG_DIR, inst, "knowledge", "knowledge.txt"), "w", encoding="utf-8") as f: f.write(conf_data.get('knowledge', ''))
                    ia_params = {
                        "num_ctx": int(conf_data.get('num_ctx', 4096)),
                        "temperature": float(conf_data.get('temperature', 0.2)),
                        "num_predict": int(conf_data.get('num_predict', 800))
                    }
                    with open(os.path.join(CONFIG_DIR, inst, "configs", "config_a2.json"), "w", encoding="utf-8") as f: json.dump(ia_params, f, indent=4)
                    rebuild_knowledge(inst)
                elif conf_type == 'a3':
                    with open(os.path.join(CONFIG_DIR, inst, "configs", "config_a3.json"), "w", encoding="utf-8") as f: json.dump(conf_data, f, indent=4, ensure_ascii=False)
                elif conf_type == 'flow':
                    with open(os.path.join(CONFIG_DIR, inst, "configs", "flow.json"), "w", encoding="utf-8") as f: json.dump(conf_data, f, indent=4, ensure_ascii=False)
                    with open(os.path.join(CONFIG_DIR, inst, "configs", "active_flow.json"), "w", encoding="utf-8") as f: json.dump({"name": data.get('flowName', 'custom')}, f, indent=4)
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'save_dash_state':
            try:
                state = data.get('state', {})
                c.execute("INSERT OR REPLACE INTO telemetry (phone, metadata) VALUES (?, ?)", ('DASHBOARD_STATE', json.dumps(state)))
                conn.commit()
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'register_instance':
            try:
                inst = data.get('instance')
                comp_id = data.get('companyId', 1)
                plat = data.get('platform', 'whatsapp')
                # Persistir en conexiones de brain_sessions.db
                c.execute("INSERT OR REPLACE INTO connections (company_id, instance, channel) VALUES (?, ?, ?)", (comp_id, inst, plat))
                conn.commit()
                # Crear carpeta de config si no existe
                os.makedirs(os.path.join(CONFIG_DIR, inst), exist_ok=True)
                return jsonify({"success": True, "message": f"Instancia {inst} sincronizada"})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'apply_all_config':
            try:
                conf_type, conf_data, comp_id = data.get('type'), data.get('config'), data.get('companyId')
                c.execute("SELECT instance FROM connections WHERE company_id=?", (comp_id,))
                instances = [r[0] for r in c.fetchall()]
                for inst in instances:
                    os.makedirs(os.path.join(CONFIG_DIR, inst), exist_ok=True)
                    if conf_type == 'a1':
                        with open(os.path.join(CONFIG_DIR, inst, "config_a1.json"), "w", encoding="utf-8") as f: json.dump(conf_data, f, indent=4, ensure_ascii=False)
                    elif conf_type == 'a2':
                        with open(os.path.join(CONFIG_DIR, inst, "knowledge.txt"), "w", encoding="utf-8") as f: f.write(conf_data.get('knowledge', ''))
                        # Guardar parámetros técnicos también en Sincro Total
                        ia_params = {
                            "num_ctx": int(conf_data.get('num_ctx', 4096)),
                            "temperature": float(conf_data.get('temperature', 0.2)),
                            "num_predict": int(conf_data.get('num_predict', 800))
                        }
                        with open(os.path.join(CONFIG_DIR, inst, "config_a2.json"), "w", encoding="utf-8") as f: json.dump(ia_params, f, indent=4)
                        rebuild_knowledge(inst)
                    elif conf_type == 'a3':
                        with open(os.path.join(CONFIG_DIR, inst, "config_a3.json"), "w", encoding="utf-8") as f: json.dump(conf_data, f, indent=4, ensure_ascii=False)
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'save_debug':
            try:
                inst, phones, enabled = data.get('instance', EVO_INSTANCE), data.get('phones', []), data.get('enabled', False)
                os.makedirs(os.path.join(CONFIG_DIR, inst), exist_ok=True)
                with open(os.path.join(CONFIG_DIR, inst, "debug_mode.json"), "w", encoding="utf-8") as f: json.dump({"enabled": enabled, "phones": phones}, f, indent=4)
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        # --- GESTION DE TICKETS ---
        if action == 'update_ticket':
            try:
                tid, status, assigned, priority = data.get('id'), data.get('status'), data.get('assigned_to'), data.get('priority')
                c.execute("UPDATE tickets SET status=?, assigned_to=?, priority=? WHERE id=?", (status, assigned, priority, tid))
                conn.commit()
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'delete_ticket':
            try:
                tid = data.get('id')
                c.execute("DELETE FROM tickets WHERE id=?", (tid,))
                conn.commit()
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'create_ticket':
            try:
                t = data.get('ticket', {})
                phone, inst = t.get('phone'), t.get('channel', 'manual')
                sum_ia = get_chat_summary(phone, inst) if phone else None
                
                c.execute("INSERT INTO tickets (phone, channel, status, summary, assigned_to, priority, summary_ia, company_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
                          (phone, inst, t.get('status', 'open'), t.get('summary'), t.get('assigned_to'), t.get('priority', 'normal'), sum_ia, data.get('companyId')))
                conn.commit()
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'forward_ticket':
            try:
                tid, target_phone, method = data.get('id'), data.get('target_phone'), data.get('method', 'whatsapp')
                logger.info(f" [FORWARD] Delegando ticket {tid} a {target_phone} via {method}")
                
                c.execute("SELECT phone, summary, status, channel, summary_ia FROM tickets WHERE id=?", (tid,))
                row = c.fetchone()
                if not row: 
                    logger.error(f" [FORWARD] Ticket {tid} no encontrado")
                    return jsonify({"success": False, "error": "Ticket no encontrado"})
                
                phone, ticket_summary, status, inst, stored_sum_ia = row
                conv_summary = stored_sum_ia or get_chat_summary(phone, inst)
                wa_link = f"https://wa.me/{phone}"
                
                msg = (
                    f"🎫 *TICKET DELEGADO #{tid}*\n\n"
                    f"*Cliente:* {phone}\n"
                    f"*Estado:* {status.upper()}\n"
                    f"*Detalle:* {ticket_summary}\n\n"
                    f"📝 *Resumen de charla:*\n{conv_summary}\n\n"
                    f"🔗 *Seguir conversación:* {wa_link}"
                )
                
                if method == 'whatsapp':
                    res = _send(f"{target_phone}@s.whatsapp.net", inst, msg)
                    logger.info(f" [FORWARD] Resultado de envío: {res}")
                
                return jsonify({"success": True, "message": "Ticket reenviado con éxito"})
            except Exception as e: 
                logger.error(f" [FORWARD-ERR] {e}")
                return jsonify({"success": False, "error": str(e)})

        if action == 'save_custom_commands':
            try:
                cmds = data.get('commands', [])
                inst = data.get('instance', 'general')
                target = os.path.join(CONFIG_DIR, inst, "configs", "custom_commands.json")
                os.makedirs(os.path.dirname(target), exist_ok=True)
                with open(target, "w", encoding="utf-8") as f: json.dump(cmds, f, indent=4, ensure_ascii=False)
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'save_media_manifest':
            try:
                manifest = data.get('manifest', [])
                comp_id = data.get('companyId')
                target_dir = get_company_media_path(comp_id) if comp_id else MEDIA_LIB_DIR
                target_manifest = os.path.join(target_dir, "manifest.json")
                with open(target_manifest, "w", encoding="utf-8") as f: json.dump(manifest, f, indent=4, ensure_ascii=False)
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'summarize_conversation':
            try:
                phone, inst = data.get('phone'), data.get('instance')
                if not inst:
                    # Intentar buscar la instancia en la base de datos
                    c.execute("SELECT instance FROM sessions WHERE phone=? LIMIT 1", (phone,))
                    row = c.fetchone()
                    if row: inst = row[0]
                
                if not inst:
                    return jsonify({"success": False, "error": "No se pudo determinar la instancia para este chat"})

                summary = get_chat_summary(phone, inst)
                return jsonify({"success": True, "summary": summary})
            except Exception as e: 
                logger.error(f" [SUMMARIZE-ERR] {e}")
                return jsonify({"success": False, "error": str(e)})

        if action == 'analyze_media':
            try:
                name, context = data.get('name'), data.get('context', '')
                logger.info(f" [ANALYSIS] Analyzing media: {name}")
                
                # Cargar manifiesto para ver si ya esta analizado (Persistencia)
                comp_id = data.get('companyId') or request.args.get('companyId')
                manifest = sync_media_manifest(comp_id)
                existing = next((m for m in manifest if m.get('name') == name), None)
                
                if existing and existing.get('summary'):
                    logger.info(f" [ANALYSIS] Using cached summary for {name}")
                    return jsonify({"success": True, "summary": existing['summary']})

                file_path = get_company_media_path(comp_id, name)
                content_preview = ""
                
                if os.path.exists(file_path):
                    ext = name.split('.')[-1].lower()
                    with open(file_path, "rb") as f:
                        file_bytes = f.read()
                    
                    if ext == 'pdf':
                        logger.info(f" [ANALYSIS] Extracting PDF: {name}")
                        content_preview = multimedia_decoder.extraer_pdf(file_bytes)
                    elif ext in ['jpg', 'jpeg', 'png']:
                        logger.info(f" [ANALYSIS] Extracting OCR: {name}")
                        content_preview = multimedia_decoder.extraer_ocr(file_bytes)
                    elif ext in ['txt', 'csv', 'json']:
                        content_preview = file_bytes.decode('utf-8', errors='ignore')[:2000]
                else:
                    logger.warning(f" [ANALYSIS] File not found: {file_path}")
                
                ai_prompt = f"Analiza este archivo: {name}. Contexto de uso: {context}. Contenido extraído:\n{content_preview[:3000]}\n\nGenera un resumen técnico y breve de 3 líneas sobre qué información contiene y cómo debe usarla la IA."
                summary = query_ollama(ai_prompt, "Media Analyzer", "default")
                
                # Guardar el resumen en el manifiesto
                if existing:
                    existing['summary'] = summary
                    with open(MEDIA_MANIFEST_PATH, "w", encoding="utf-8") as f: 
                        json.dump(manifest, f, indent=4, ensure_ascii=False)
                
                return jsonify({"success": True, "summary": summary})
            except Exception as e: 
                logger.error(f" [ANALYSIS ERROR] {e}")
                import traceback
                logger.error(traceback.format_exc())
                return jsonify({"success": False, "error": str(e)})

        if action == 'upload_media':
            try:
                comp_id = data.get('companyId') or request.args.get('companyId')
                target_dir = get_company_media_path(comp_id)
                
                file = request.files['file']
                file.save(os.path.join(target_dir, file.filename))
                sync_media_manifest(comp_id)
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'get_file_headers':
            try:
                comp_id = data.get('companyId') or request.args.get('companyId')
                file_name = data.get('fileName')
                file_path = get_company_media_path(comp_id, file_name)
                ext = file_name.split('.')[-1].lower()
                headers = []
                if ext == 'csv':
                    import csv
                    with open(file_path, "r", encoding="utf-8") as f:
                        reader = csv.reader(f)
                        headers = next(reader, [])
                elif ext in ['xlsx', 'xls']:
                    import pandas as pd
                    df = pd.read_excel(file_path, nrows=0)
                    headers = df.columns.tolist()
                elif ext in ['db', 'sqlite']:
                    import sqlite3 as s3
                    tmp_conn = s3.connect(file_path); tmp_c = tmp_conn.cursor()
                    tmp_c.execute("SELECT name FROM sqlite_master WHERE type='table'")
                    tables = tmp_c.fetchall()
                    if tables:
                        tmp_c.execute(f"PRAGMA table_info({tables[0][0]})")
                        headers = [r[1] for r in tmp_c.fetchall()]
                    tmp_conn.close()
                return jsonify({"success": True, "headers": headers})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'get_file_preview':
            try:
                comp_id = data.get('companyId') or request.args.get('companyId')
                file_name = data.get('fileName')
                file_path = get_company_media_path(comp_id, file_name)
                logger.info(f" [PREVIEW] Loading: {file_path}")
                if not os.path.exists(file_path):
                    return jsonify({"success": False, "error": "Archivo no encontrado"})
                
                ext = file_name.split('.')[-1].lower()
                rows = []
                if ext == 'csv':
                    import pandas as pd
                    try:
                        # Primero intentar UTF-8 con deteccion de separador
                        df = pd.read_csv(file_path, nrows=10, encoding='utf-8', sep=None, engine='python')
                        logger.info(f" [PREVIEW] Read CSV (UTF-8). Columns: {df.columns.tolist()}")
                    except:
                        try:
                            # Luego Latin-1 (comun en Excel)
                            df = pd.read_csv(file_path, nrows=10, encoding='latin-1', sep=None, engine='python')
                            logger.info(f" [PREVIEW] Read CSV (Latin-1). Columns: {df.columns.tolist()}")
                        except Exception as e:
                            logger.error(f" [PREVIEW ERROR] CSV fail: {str(e)}")
                            return jsonify({"success": False, "error": f"Error leyendo CSV: {str(e)}"})
                    
                    headers = df.columns.tolist()
                    rows = df.values.tolist()
                    rows = [[str(cell) if not pd.isna(cell) else "" for cell in row] for row in rows]
                    return jsonify({"success": True, "headers": headers, "rows": rows})
                elif ext in ['xlsx', 'xls']:
                    import pandas as pd
                    df = pd.read_excel(file_path, nrows=10)
                    headers = df.columns.tolist()
                    rows = df.values.tolist()
                    rows = [[str(cell) if not pd.isna(cell) else "" for cell in row] for row in rows]
                    logger.info(f" [PREVIEW] Read Excel. Columns: {headers}")
                    return jsonify({"success": True, "headers": headers, "rows": rows})
                return jsonify({"success": False, "error": "Formato no soportado para previsualización"})
            except Exception as e: 
                logger.error(f" [PREVIEW CRITICAL] {str(e)}")
                return jsonify({"success": False, "error": str(e)})

        if action == 'import_agenda_file':
            try:
                comp_id = data.get('companyId') or request.args.get('companyId')
                file_name, mapping, group = data.get('fileName'), data.get('mapping', {}), data.get('group')
                logger.info(f" [IMPORT] Starting import: {file_name} for group {group}")
                logger.info(f" [IMPORT] Mapping: {mapping}")
                file_path = get_company_media_path(comp_id, file_name)
                ext = file_name.split('.')[-1].lower()
                contacts = []
                if ext == 'csv':
                    import pandas as pd
                    try:
                        df = pd.read_csv(file_path, encoding='utf-8', sep=None, engine='python')
                    except:
                        df = pd.read_csv(file_path, encoding='latin-1', sep=None, engine='python')
                elif ext in ['xlsx', 'xls']:
                    import pandas as pd
                    df = pd.read_excel(file_path)
                
                if ext in ['csv', 'xlsx', 'xls']:
                    logger.info(f" [IMPORT] DataFrame loaded. Rows: {len(df)}")
                    # Convertir mapping de string keys a int keys si vienen de JSON
                    real_mapping = {}
                    for k, v in mapping.items():
                        try: real_mapping[int(k)] = v
                        except: pass
                    
                    if not real_mapping:
                        logger.warning(" [IMPORT] Warning: Empty mapping received!")

                    for _, row in df.iterrows():
                        contact_data = {
                            "name": "", "phone": "", "email": "", 
                            "instagram": "", "facebook": "", "linkedin": "",
                            "dni": "", "address": "", "cbu": "", "alias": "", "bank": "", "branch": "",
                            "metadata": {}
                        }
                        for col_idx, val in enumerate(row):
                            field = real_mapping.get(col_idx)
                            val_str = str(val) if not pd.isna(val) else ""
                            if field in contact_data and field != 'metadata':
                                contact_data[field] = val_str
                            else:
                                col_name = df.columns[col_idx] if col_idx < len(df.columns) else f"col_{col_idx}"
                                if field and field != 'ignore':
                                    contact_data['metadata'][field] = val_str
                                else:
                                    contact_data['metadata'][col_name] = val_str
                        
                        contacts.append(contact_data)
                elif ext in ['db', 'sqlite']:
                    import sqlite3 as s3
                    tmp_conn = s3.connect(file_path); tmp_c = tmp_conn.cursor()
                    tmp_c.execute("SELECT name FROM sqlite_master WHERE type='table'")
                    tables = tmp_c.fetchall()
                    if tables:
                        tmp_c.execute(f"SELECT * FROM {tables[0][0]} LIMIT 2000")
                        rows = tmp_c.fetchall()
                        # Headers de la tabla original para el metadata
                        tmp_c.execute(f"PRAGMA table_info({tables[0][0]})")
                        db_headers = [r[1] for r in tmp_c.fetchall()]
                        
                        real_mapping = {}
                        for k, v in mapping.items():
                            try: real_mapping[int(k)] = v
                            except: pass

                        for row in rows:
                            contact_data = {
                                "name": "", "phone": "", "email": "", 
                                "instagram": "", "facebook": "", "linkedin": "",
                                "dni": "", "address": "", "cbu": "", "alias": "", "bank": "", "branch": "",
                                "metadata": {}
                            }
                            for col_idx, val in enumerate(row):
                                field = real_mapping.get(col_idx)
                                val_str = str(val) if val is not None else ""
                                if field in contact_data and field != 'metadata':
                                    contact_data[field] = val_str
                                else:
                                    col_name = db_headers[col_idx] if col_idx < len(db_headers) else f"col_{col_idx}"
                                    if field and field != 'ignore':
                                        contact_data['metadata'][field] = val_str
                                    else:
                                        contact_data['metadata'][col_name] = val_str
                            contacts.append(contact_data)
                    tmp_conn.close()

                for contact in contacts:
                    c.execute("""INSERT INTO contacts_agenda 
                               (name, phone, email, instagram, facebook, linkedin, 
                                dni, address, cbu, alias, bank, branch,
                                last_channel, origin, group_name, metadata) 
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                               ON CONFLICT(phone) DO UPDATE SET 
                               name=excluded.name, email=excluded.email, 
                               instagram=excluded.instagram, facebook=excluded.facebook, linkedin=excluded.linkedin,
                               dni=excluded.dni, address=excluded.address, cbu=excluded.cbu, alias=excluded.alias,
                               bank=excluded.bank, branch=excluded.branch,
                               group_name=excluded.group_name, metadata=excluded.metadata""", 
                               (contact.get('name'), contact.get('phone'), contact.get('email'),
                                contact.get('instagram'), contact.get('facebook'), contact.get('linkedin'),
                                contact.get('dni'), contact.get('address'), contact.get('cbu'),
                                contact.get('alias'), contact.get('bank'), contact.get('branch'),
                                'IMPORT', 'FILE_UPLOAD', group, str(contact.get('metadata'))))
                conn.commit()
                return jsonify({"success": True, "count": len(contacts)})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'import_mkt_contacts_list':
            try:
                camp_id = data.get('campaignId')
                contacts = data.get('contacts', [])
                for contact in contacts:
                    # El canal puede venir como una lista o un solo string
                    channels = contact.get('selectedChannels', ['WA'])
                    if isinstance(channels, str): channels = [channels]
                    
                    for channel in channels:
                        trace_id = f"TRC-{uuid.uuid4().hex[:8].upper()}"
                        c.execute("INSERT INTO mkt_contacts (campaign_id, trace_id, phone, email, name, channel) VALUES (?, ?, ?, ?, ?, ?)",
                                   (camp_id, trace_id, contact.get('phone'), contact.get('email'), contact.get('name'), channel))
                conn.commit()
                return jsonify({"success": True, "count": len(contacts)})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'save_mkt_template':
            try:
                name, content, subject, media = data.get('name'), data.get('content'), data.get('subject'), data.get('media')
                c.execute("INSERT INTO mkt_templates (name, content, subject, media_path, company_id) VALUES (?, ?, ?, ?, ?)", (name, content, subject, media, data.get('companyId')))
                conn.commit()
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})
            
        if action == 'delete_mkt_template':
            try:
                tid = data.get('id')
                c.execute("DELETE FROM mkt_templates WHERE id=?", (tid,))
                conn.commit()
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'delete_agenda_contact':
            try:
                c.execute("DELETE FROM contacts_agenda WHERE phone=?", (data.get('phone'),))
                conn.commit()
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'bulk_delete_agenda_contacts':
            try:
                ids = data.get('ids', [])
                if ids:
                    c.execute(f"DELETE FROM contacts_agenda WHERE id IN ({','.join(['?' for _ in ids])})", ids)
                    conn.commit()
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'get_rubros':
            try:
                comp_id = data.get('companyId') or request.args.get('companyId')
                c.execute("CREATE TABLE IF NOT EXISTS rubros (name TEXT, company_id INTEGER, PRIMARY KEY(name, company_id))")
                if comp_id:
                    c.execute("SELECT name FROM rubros WHERE company_id=? ORDER BY name ASC", (comp_id,))
                else:
                    c.execute("SELECT name FROM rubros ORDER BY name ASC")
                return jsonify({"success": True, "rubros": [r[0] for r in c.fetchall()]})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'add_rubro':
            try:
                name = data.get('name', '').upper().strip()
                if name:
                    c.execute("CREATE TABLE IF NOT EXISTS rubros (name TEXT PRIMARY KEY)")
                    c.execute("INSERT OR IGNORE INTO rubros (name) VALUES (?)", (name,))
                    conn.commit()
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'delete_rubro':
            try:
                name = data.get('name')
                if name:
                    c.execute("DELETE FROM rubros WHERE name=?", (name,))
                    conn.commit()
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'bulk_move_agenda_contacts':
            try:
                ids = data.get('ids', [])
                new_group = data.get('group')
                if ids and new_group:
                    c.execute(f"UPDATE contacts_agenda SET group_name=? WHERE id IN ({','.join(['?' for _ in ids])})", [new_group] + ids)
                    conn.commit()
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'add_manual_contact':
            try:
                c.execute("""INSERT INTO contacts_agenda 
                           (name, phone, email, instagram, facebook, linkedin, telegram,
                            dni, address, cbu, alias, bank, branch,
                            last_channel, origin, group_name, metadata, company_id) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                           ON CONFLICT(phone) DO UPDATE SET 
                           name=excluded.name, email=excluded.email, 
                           instagram=excluded.instagram, facebook=excluded.facebook, 
                           linkedin=excluded.linkedin, telegram=excluded.telegram,
                           dni=excluded.dni, address=excluded.address, cbu=excluded.cbu, alias=excluded.alias,
                           bank=excluded.bank, branch=excluded.branch,
                           group_name=excluded.group_name, metadata=excluded.metadata""", 
                           (data.get('name'), data.get('phone'), data.get('email'),
                            data.get('instagram'), data.get('facebook'), data.get('linkedin'), data.get('telegram'),
                            data.get('dni'), data.get('address'), data.get('cbu'),
                            data.get('alias'), data.get('bank'), data.get('branch'),
                            'MANUAL', 'USER_ENTRY', data.get('group'), data.get('meta')))
                conn.commit()
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'import_mkt_file':
            try:
                camp_id = data.get('campaignId')
                file_name = data.get('fileName')
                mapping = data.get('mapping', {}) # {name: 0, phone: 1, email: 2, detail: 3}
                
                file_path = os.path.join(MEDIA_LIB_DIR, file_name)
                if not os.path.exists(file_path):
                    return jsonify({"success": False, "error": "Archivo no encontrado"})
                
                contacts = []
                ext = file_name.split('.')[-1].lower()
                
                if ext == 'csv':
                    import pandas as pd
                    try:
                        df = pd.read_csv(file_path, encoding='utf-8')
                    except:
                        df = pd.read_csv(file_path, encoding='latin-1', sep=None, engine='python')
                elif ext in ['xlsx', 'xls']:
                    import pandas as pd
                    df = pd.read_excel(file_path)
                
                if ext in ['csv', 'xlsx', 'xls']:
                    real_mapping = {}
                    for k, v in mapping.items():
                        try: real_mapping[int(k)] = v
                        except: pass
                        
                    for _, row in df.iterrows():
                        contact_data = {
                            "name": "", "phone": "", "email": "", 
                            "instagram": "", "facebook": "", "linkedin": "",
                            "dni": "", "address": "", "cbu": "", "alias": "", "bank": "", "branch": "",
                            "metadata": {}
                        }
                        for col_idx, val in enumerate(row):
                            field = real_mapping.get(col_idx)
                            val_str = str(val) if not pd.isna(val) else ""
                            if field in contact_data and field != 'metadata':
                                contact_data[field] = val_str
                            else:
                                col_name = df.columns[col_idx] if col_idx < len(df.columns) else f"col_{col_idx}"
                                if field and field != 'ignore':
                                    contact_data['metadata'][field] = val_str
                                else:
                                    contact_data['metadata'][col_name] = val_str
                                    
                        contacts.append(contact_data)
                elif ext in ['db', 'sqlite']:
                    import sqlite3 as s3
                    tmp_conn = s3.connect(file_path); tmp_c = tmp_conn.cursor()
                    tmp_c.execute("SELECT name FROM sqlite_master WHERE type='table'")
                    tables = tmp_c.fetchall()
                    if tables:
                        tmp_c.execute(f"SELECT * FROM {tables[0][0]} LIMIT 1000")
                        rows = tmp_c.fetchall()
                        for row in rows:
                            contacts.append({
                                "name": row[mapping.get('name')] if mapping.get('name') is not None and len(row) > mapping.get('name') else "",
                                "phone": row[mapping.get('phone')] if mapping.get('phone') is not None and len(row) > mapping.get('phone') else "",
                                "email": row[mapping.get('email')] if mapping.get('email') is not None and len(row) > mapping.get('email') else "",
                                "detail": row[mapping.get('detail')] if mapping.get('detail') is not None and len(row) > mapping.get('detail') else ""
                            })
                    tmp_conn.close()
                
                # Guardar contactos
                for contact in contacts:
                    trace_id = f"TRC-{uuid.uuid4().hex[:8].upper()}"
                    c.execute("INSERT INTO mkt_contacts (campaign_id, trace_id, phone, email, name, metadata) VALUES (?, ?, ?, ?, ?, ?)",
                              (camp_id, trace_id, contact.get('phone'), contact.get('email'), contact.get('name'), str(contact.get('metadata'))))
                    
                    # Actualizar Agenda Global (UPSERT)
                    c.execute("""INSERT INTO contacts_agenda 
                               (name, phone, email, instagram, facebook, linkedin, 
                                dni, address, cbu, alias, bank, branch,
                                last_channel, origin, group_name, metadata) 
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                               ON CONFLICT(phone) DO UPDATE SET 
                               name=excluded.name, email=excluded.email, 
                               instagram=excluded.instagram, facebook=excluded.facebook, linkedin=excluded.linkedin,
                               dni=excluded.dni, address=excluded.address, cbu=excluded.cbu, alias=excluded.alias,
                               bank=excluded.bank, branch=excluded.branch,
                               group_name=excluded.group_name, metadata=excluded.metadata""", 
                               (contact.get('name'), contact.get('phone'), contact.get('email'),
                                contact.get('instagram'), contact.get('facebook'), contact.get('linkedin'),
                                contact.get('dni'), contact.get('address'), contact.get('cbu'),
                                contact.get('alias'), contact.get('bank'), contact.get('branch'),
                                'CAMPAIGN', 'MKT_IMPORT', 'CLIENTES', str(contact.get('metadata'))))
                conn.commit()
                return jsonify({"success": True, "count": len(contacts)})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'save_mkt_campaign':
            try:
                name, template, media = data.get('name'), data.get('template'), data.get('media')
                channels = json.dumps(data.get('channels', {})) # Guardar preferencias de canales
                c.execute("INSERT INTO mkt_campaigns (name, template, media_path, metadata, company_id) VALUES (?, ?, ?, ?, ?)", (name, template, media, channels, data.get('companyId')))
                conn.commit()
                return jsonify({"success": True, "id": c.lastrowid})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'import_mkt_contacts':
            try:
                camp_id, contacts = data.get('campaignId'), data.get('contacts', [])
                # Obtener canales seleccionados para esta campaña
                c.execute("SELECT metadata FROM mkt_campaigns WHERE id=?", (camp_id,))
                camp_row = c.fetchone()
                sel_channels = json.loads(camp_row[0]) if camp_row and camp_row[0] else {"WA": True, "EMAIL": True}

                import_count = 0
                for contact in contacts:
                    name = contact.get('name')
                    phone = contact.get('phone')
                    email = contact.get('email')
                    # Implementación de Smart Routing: Crear un registro por cada canal disponible y SELECCIONADO
                    # WhatsApp
                    if sel_channels.get('WA') and phone:
                        trace_id = f"TRC-{uuid.uuid4().hex[:8].upper()}"
                        c.execute("INSERT INTO mkt_contacts (campaign_id, trace_id, phone, email, name, channel) VALUES (?, ?, ?, ?, ?, ?)",
                                  (camp_id, trace_id, phone, email, name, 'WA'))
                        import_count += 1
                    
                    # Email
                    if sel_channels.get('EMAIL') and email:
                        trace_id = f"TRC-{uuid.uuid4().hex[:8].upper()}"
                        c.execute("INSERT INTO mkt_contacts (campaign_id, trace_id, phone, email, name, channel) VALUES (?, ?, ?, ?, ?, ?)",
                                  (camp_id, trace_id, phone, email, name, 'EMAIL'))
                        import_count += 1

                    # Telegram (Asumimos que el teléfono se usa como ID o el contacto tiene un campo tg)
                    if sel_channels.get('TG') and phone:
                        trace_id = f"TRC-{uuid.uuid4().hex[:8].upper()}"
                        c.execute("INSERT INTO mkt_contacts (campaign_id, trace_id, phone, email, name, channel) VALUES (?, ?, ?, ?, ?, ?)",
                                  (camp_id, trace_id, phone, email, name, 'TELEGRAM'))
                        import_count += 1

                conn.commit()
                return jsonify({"success": True, "count": import_count})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'retry_mkt_contacts':
            try:
                c.execute("UPDATE mkt_contacts SET status='pending' WHERE status='failed'")
                conn.commit()
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        elif action == 'clear_mkt_contacts':
            try:
                c.execute("DELETE FROM mkt_contacts WHERE status='pending' OR status='failed'")
                c.execute("DELETE FROM mkt_execution_logs")
                conn.commit()
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'delete_all_chats':
            try:
                comp_id = data.get('companyId')
                channel_f = data.get('channelFilter')
                time_f = data.get('timeFilter')
                
                # Base query para identificar instancias
                inst_subquery = "SELECT instance FROM connections WHERE company_id=?" if comp_id else "SELECT instance FROM sessions"
                params = [comp_id] if comp_id else []
                
                # Construir filtros adicionales
                where_sessions = "WHERE instance IN (" + inst_subquery + ")"
                if channel_f and channel_f != 'ALL':
                    if channel_f == 'ATENCIÓN':
                        where_sessions += " AND pending_handoff = 1"
                    else:
                        where_sessions += f" AND channel = ?"
                        params.append(channel_f)
                
                if time_f and time_f != 'ALL':
                    hours = 24 if time_f == '24H' else 48 if time_f == '48H' else 168 if time_f == 'WEEK' else 360
                    where_sessions += f" AND last_incoming_at >= datetime('now', '-{hours} hours')"

                # Ejecutar borrado segmentado
                # 1. Borrar logs de los teléfonos que cumplen el filtro
                c.execute(f"DELETE FROM logs WHERE phone IN (SELECT phone FROM sessions {where_sessions})", params)
                # 2. Borrar mensajes procesados
                c.execute(f"DELETE FROM processed_msgs WHERE phone IN (SELECT phone FROM sessions {where_sessions})", params)
                # 3. Borrar las sesiones
                c.execute(f"DELETE FROM sessions {where_sessions}", params)
                
                conn.commit()
                return jsonify({"success": True, "message": "Chats eliminados según filtro"})
            except Exception as e: 
                logger.error(f" [DELETE-ERR] {e}")
                return jsonify({"success": False, "error": str(e)})

        if action == 'get_mkt_logs':
            try:
                c.execute("""
                    SELECT l.id, l.campaign_id, l.contact_name, l.channel, l.status, l.message, l.created_at, camp.name
                    FROM mkt_execution_logs l
                    LEFT JOIN mkt_campaigns camp ON l.campaign_id = camp.id
                    ORDER BY l.created_at DESC LIMIT 100
                """)
                logs = [{"id": r[0], "campId": r[1], "name": r[2], "channel": r[3], "status": r[4], "msg": r[5], "time": r[6], "campaign": r[7]} for r in c.fetchall()]
                return jsonify({"success": True, "logs": logs})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'get_tickets':
            try:
                c.execute("SELECT id, phone, channel, status, summary, a3, metadata, created_at FROM tickets ORDER BY created_at DESC LIMIT 100")
                tickets = [{"id": r[0], "phone": r[1], "channel": r[2], "status": r[3], "summary": r[4], "a3": r[5], "meta": r[6], "time": r[7]} for r in c.fetchall()]
                return jsonify({"success": True, "tickets": tickets})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'get_mkt_stats':
            try:
                c.execute("SELECT status, COUNT(*) FROM mkt_contacts GROUP BY status")
                stats = dict(c.fetchall())
                return jsonify({"success": True, "stats": stats})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'delete_chat':
            try:
                phone, inst = data.get('phone'), data.get('instance')
                c.execute("DELETE FROM sessions WHERE phone=? AND instance=?", (phone, inst))
                c.execute("DELETE FROM logs WHERE phone=? AND instance=?", (phone, inst))
                conn.commit()
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if (action == 'resume_ia'):
            try:
                phone, instance_name = data.get('phone'), data.get('instance', EVO_INSTANCE)
                update_session(phone, instance_name, manual=0, pending_handoff=0)
                conn.commit()
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if (action == 'pause_ia'):
            try:
                phone, instance_name = data.get('phone'), data.get('instance', EVO_INSTANCE)
                update_session(phone, instance_name, manual=1, pending_handoff=1)
                conn.commit()
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'delete_company':
            try:
                c.execute("DELETE FROM companies WHERE id=?", (data.get('id'),))
                c.execute("DELETE FROM connections WHERE company_id=?", (data.get('id'),))
                conn.commit()
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'delete_connection':
            try:
                c.execute("DELETE FROM connections WHERE id=?", (data.get('connectionId'),))
                conn.commit()
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'get_library_index':
            try:
                files_list = []
                for root, _, files in os.walk(MEDIA_LIB_DIR):
                    for f in files:
                        if f.endswith(('.md', '.txt', '.pdf', '.xlsx', '.csv', '.jpg', '.png', '.mp4')):
                            rel_path = os.path.relpath(os.path.join(root, f), MEDIA_LIB_DIR)
                            files_list.append({"name": f, "path": rel_path, "size": os.path.getsize(os.path.join(root, f))})
                
                # Generar contenido .md de índice
                index_md = "# 📚 Índice de Biblioteca de Conocimiento\n\n"
                for i, f in enumerate(files_list):
                    index_md += f"{i+1}. **{f['name']}** (Ruta: `{f['path']}`)\n"
                
                return jsonify({"success": True, "files": files_list, "index_md": index_md})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'add_to_brain':
            try:
                file_name = data.get('path')
                inst_name = data.get('instance', EVO_INSTANCE)
                src = None
                for root, _, files in os.walk(MEDIA_LIB_DIR):
                    if file_name in files:
                        src = os.path.join(root, file_name)
                        break
                        
                if not src:
                    return jsonify({"success": False, "error": f"Archivo no encontrado: {file_name}"})
                    
                dest_dir = os.path.join(CONFIG_DIR, inst_name)
                if not os.path.exists(dest_dir): os.makedirs(dest_dir, exist_ok=True)
                
                import shutil
                shutil.copy(src, os.path.join(dest_dir, file_name))
                rebuild_knowledge(inst_name)
                return jsonify({"success": True, "message": f"Archivo {file_name} agregado al cerebro."})
            except Exception as e: return jsonify({"success": False, "error": str(e)})
            
        if action == 'sync_all_to_brain':
            try:
                inst_name = data.get('instance', EVO_INSTANCE)
                comp_id = data.get('companyId')
                target_dir = get_company_media_path(comp_id) if comp_id else MEDIA_LIB_DIR
                dest_dir = os.path.join(CONFIG_DIR, inst_name)
                if not os.path.exists(dest_dir): os.makedirs(dest_dir, exist_ok=True)
                
                import shutil
                count = 0
                for root, _, files in os.walk(target_dir):
                    for f in files:
                        if f != 'manifest.json':
                            shutil.copy(os.path.join(root, f), os.path.join(dest_dir, f))
                            count += 1
                rebuild_knowledge(inst_name)
                return jsonify({"success": True, "message": f"{count} archivos sincronizados al cerebro."})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'send_message':
            try:
                phone, message, instance_name = data.get('phone'), data.get('message'), data.get('instance', EVO_INSTANCE)
                _send(f"{phone}@s.whatsapp.net", instance_name, message)
                update_session(phone, instance_name, pending_handoff=0, update_outgoing=True, last_origin='HUMAN')
                conn.commit()
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'authorize_ticket':
            try:
                phone, inst, message = data.get('phone'), data.get('instance'), data.get('message', '')
                res_text = f"✅ *RESERVA CONFIRMADA*\n\n{message}" if message else "✅ *RESERVA CONFIRMADA*"
                _send(f"{phone}@s.whatsapp.net", inst, res_text)
                c.execute("UPDATE tickets SET status='closed' WHERE phone=? AND status='pending_auth'", (phone,))
                update_session(phone, inst, state="AWAITING_MENU", pending_handoff=0, manual=0)
                conn.commit()
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'get_ticket_details':
            try:
                tid = data.get('id')
                c.execute("SELECT id, phone, channel, status, summary, a3, metadata, created_at FROM tickets WHERE id=?", (tid,))
                r = c.fetchone()
                if not r: return jsonify({"success": False, "error": "Ticket no encontrado"})
                ticket = {"id": r[0], "phone": r[1], "channel": r[2], "status": r[3], "summary": r[4], "a3": r[5], "meta": r[6], "time": r[7]}
                return jsonify({"success": True, "ticket": ticket})
            except Exception as e: return jsonify({"success": False, "error": str(e)})


    # GET: Datos Filtrados por Instancia
    inst_check = request.args.get('instance', EVO_INSTANCE)
    comp_id = request.args.get('companyId')
    try:
        if comp_id: comp_id = int(comp_id)
    except: comp_id = None
    logger.info(f" [API-GET] inst={inst_check}, comp={comp_id}")
    # 1. Telemetria
    bot_status = False
    try:
        sr = requests.get(f"{EVO_URL}/instance/connectionState/{inst_check}", headers={"apikey": EVO_API_KEY}, timeout=3)
        if sr.status_code == 200: 
            state = sr.json().get('instance', {}).get('state')
            bot_status = (state == 'open' or state == 'connected')
    except: pass

    # 2. Empresas y Conexiones
    c.execute("SELECT id, name FROM companies"); cr = c.fetchall()
    companies = []
    for r in cr:
        c.execute("SELECT id, instance, phone, channel FROM connections WHERE company_id=?", (r[0],))
        conns = [{"id": dr[0], "instance": dr[1], "phone": dr[2], "channel": dr[3]} for dr in c.fetchall()]
        companies.append({"id": r[0], "name": r[1], "connections": conns})

    # 3. Conversaciones
    if inst_check == 'ALL':
        if comp_id:
            c.execute("""
                SELECT phone, state, manual, name, channel, instance, pending_handoff, last_summary, last_incoming_at, last_outgoing_at, last_origin
                FROM sessions 
                WHERE instance IN (SELECT instance FROM connections WHERE company_id = ?)
                ORDER BY pending_handoff DESC, last_incoming_at DESC LIMIT 500
            """, (comp_id,))
        else:
            c.execute("SELECT phone, state, manual, name, channel, instance, pending_handoff, last_summary, last_incoming_at, last_outgoing_at, last_origin FROM sessions ORDER BY pending_handoff DESC, last_incoming_at DESC LIMIT 500")
    else:
        c.execute("SELECT phone, state, manual, name, channel, instance, pending_handoff, last_summary, last_incoming_at, last_outgoing_at, last_origin FROM sessions WHERE instance=? ORDER BY pending_handoff DESC, last_incoming_at DESC LIMIT 500", (inst_check,))
    
    sessions = []
    now = time.time()
    for r in c.fetchall():
        sessions.append({
            "numero": r[0], 
            "state": r[1], 
            "silent": bool(r[2]), 
            "nombre": r[3], 
            "channel": r[4], 
            "instance": r[5], 
            "pending_handoff": bool(r[6]), 
            "summary": r[7], 
            "last_msg_date": r[8] or r[9] or "N/A",
            "last_origin": r[10] or "BOT"
        })

    # 4. Mensajes
    if inst_check == 'ALL':
        if comp_id:
            c.execute("""
                SELECT phone, message, direction, created_at 
                FROM logs 
                WHERE instance IN (SELECT instance FROM connections WHERE company_id = ?)
                ORDER BY created_at DESC LIMIT 1000
            """, (comp_id,))
        else:
            c.execute("SELECT phone, message, direction, created_at FROM logs ORDER BY created_at DESC LIMIT 1000")
    else:
        c.execute("SELECT phone, message, direction, created_at FROM logs WHERE instance=? ORDER BY created_at DESC LIMIT 1000", (inst_check,))
    logs = [{"phone": r[0], "message": r[1], "direction": r[2], "time": r[3]} for r in c.fetchall()]

    # 5. Configs de la instancia
    config_a1 = {}; config_a3 = {}; debug_mode = {"enabled": False, "phones": []}; knowledge = ""
    pricing = {}; logistics = {}; flow = {}; activeFlowName = "Default"; custom_commands = []; command_logs = []
    ia_config = {"num_ctx": 4096, "temperature": 0.2, "num_predict": 800}
    try:
        # Si se pide ALL (vista de empresa completa), buscamos la primera instancia de esa empresa para cargar su config base
        if inst_check == 'ALL' and comp_id:
            c.execute("SELECT instance FROM connections WHERE company_id=? LIMIT 1", (comp_id,))
            row = c.fetchone()
            conf_path = row[0] if row else 'general'
        else:
            conf_path = inst_check
        
        # Helper interno para buscar archivos en raíz o subdirectorios
        def _load_c(fname, is_json=True, default=None):
            paths = [os.path.join(CONFIG_DIR, conf_path, fname), 
                     os.path.join(CONFIG_DIR, conf_path, "configs", fname),
                     os.path.join(CONFIG_DIR, conf_path, "knowledge", fname)]
            for p in paths:
                if os.path.exists(p):
                    try:
                        return json.load(open(p, "r", encoding="utf-8")) if is_json else open(p, "r", encoding="utf-8").read()
                    except: pass
            return default

        config_a1 = _load_c("config_a1.json", default={})
        config_a3 = _load_c("config_a3.json", default={})
        debug_mode = _load_c("debug_mode.json", default={"enabled": False, "phones": []})
        knowledge = _load_c("knowledge.txt", is_json=False, default="")
        if not knowledge: knowledge = _load_c("knowledge.txt", is_json=False, default="") # redundancia por si acaso
        
        pa2_data = _load_c("config_a2.json", default={})
        if pa2_data: ia_config.update(pa2_data)
        
        flow = _load_c("flow.json", default={"steps": ["A1_MENU", "HUMAN_HUB", "NAME_REG", "IA_A2_A3"]})
        activeFlowName = _load_c("active_flow.json", default={"name": "Default (Legacy)"}).get("name", "Custom")
        
        # Cargar datos estructurados para entrenamiento
        pricing = _load_c("pricing.json", default={})
        logistics = _load_c("logistics.json", default={})
        custom_commands = _load_c("custom_commands.json", default=[])
        command_logs = _load_c("command_logs.json", default=[])
    except: pass

    # 6. Conteo de pendientes
    if comp_id:
        c.execute("SELECT COUNT(*) FROM sessions WHERE pending_handoff=1 AND instance IN (SELECT instance FROM connections WHERE company_id=?)", (comp_id,))
    else:
        c.execute("SELECT COUNT(*) FROM sessions WHERE pending_handoff=1")
    pending_count = c.fetchone()[0]

    # 7. MKT y Trace
    if comp_id:
        c.execute("SELECT id, name, status, template, created_at FROM mkt_campaigns WHERE company_id=? ORDER BY created_at DESC", (comp_id,))
    else:
        c.execute("SELECT id, name, status, template, created_at FROM mkt_campaigns ORDER BY created_at DESC")
    mkt_campaigns = [{"id": r[0], "name": r[1], "status": r[2], "template": r[3], "date": r[4]} for r in c.fetchall()]

    trace_data = []
    trace_id_query = request.args.get('traceId')
    if trace_id_query:
        c.execute("SELECT phone, instance, message, direction, origin, created_at FROM logs WHERE trace_id=? ORDER BY created_at ASC", (trace_id_query,))
        trace_data = [{"phone": r[0], "inst": r[1], "msg": r[2], "dir": r[3], "origin": r[4], "time": r[5]} for r in c.fetchall()]

    # 8. Agenda Global
    if comp_id:
        c.execute("""SELECT id, name, phone, email, instagram, facebook, linkedin, telegram,
                            dni, address, cbu, alias, bank, branch,
                            last_channel, origin, group_name, metadata, created_at 
                     FROM contacts_agenda WHERE company_id=? ORDER BY created_at DESC LIMIT 1000""", (comp_id,))
    else:
        # En una arquitectura multi-tenant estricta, no deberíamos mostrar nada sin company_id
        agenda = []
        return jsonify({"success": False, "error": "companyId is required"})
    agenda = [{
        "id": r[0], "name": r[1], "phone": r[2], "email": r[3], 
        "instagram": r[4], "facebook": r[5], "linkedin": r[6], "telegram": r[7],
        "dni": r[8], "address": r[9], "cbu": r[10], "alias": r[11], "bank": r[12], "branch": r[13],
        "channel": r[14], "origin": r[15], "group": r[16], "meta": r[17], "date": r[18]
    } for r in c.fetchall()]

    # 9. Tickets A3
    if comp_id:
        c.execute("SELECT id, phone, channel, status, summary, a3, metadata, created_at FROM tickets WHERE company_id=? ORDER BY created_at DESC LIMIT 100", (comp_id,))
    else:
        tickets_list = []
    tickets_list = [{"id": r[0], "phone": r[1], "channel": r[2], "status": r[3], "summary": r[4], "a3": r[5], "meta": r[6], "time": r[7]} for r in c.fetchall()]

    # 10. Plantillas MKT
    if comp_id:
        c.execute("SELECT id, name, content, subject, media_path FROM mkt_templates WHERE company_id=? ORDER BY created_at DESC", (comp_id,))
    else:
        mkt_templates = []
    mkt_templates = [{"id": r[0], "name": r[1], "content": r[2], "subject": r[3], "media": r[4]} for r in c.fetchall()]

    conn.close()
    return jsonify({
        "success": True, 
        "botActive": bot_status, 
        "systemStatus": SYSTEM_STATUS, # NUEVO: Monitoreo en tiempo real
        "conversations": sessions, 
        "pendingCount": pending_count,
        "companies": companies, 
        "messages": logs,
        "tickets": tickets_list,
        "totalTickets": len(tickets_list),
        "commandLogs": command_logs,
        "customCommands": custom_commands,
        "mediaManifest": sync_media_manifest(comp_id),
        "mktCampaigns": mkt_campaigns,
        "mktTemplates": mkt_templates,
        "trace": trace_data,
        "agenda": agenda,
        "configs": {
            "a1": config_a1,
            "a2": {"knowledge": knowledge, **ia_config},
            "a3": config_a3,
            "flow": flow,
            "activeFlowName": activeFlowName,
            "debugMode": debug_mode.get("enabled", False),
            "debugPhones": debug_mode.get("phones", []),
            "libFiles": sync_media_manifest(comp_id),
            "training": {
                "pricing": pricing,
                "logistics": logistics
            }
        }
    })

# --- NUCLEO DE IA ---
def rebuild_knowledge(inst_name):
    logger.info(f" [RAG] Reconstruyendo conocimiento consolidado para {inst_name}...")
    knowledge = ""
    
    comp_id = None
    try:
        conn = sqlite3.connect(DB_PATH, timeout=30)
        conn.execute("PRAGMA busy_timeout = 30000")
        c = conn.cursor()
        c.execute("SELECT company_id FROM connections WHERE instance=? LIMIT 1", (inst_name,))
        row = c.fetchone()
        if row: comp_id = row[0]
        conn.close()
    except Exception as e: logger.error(f" [RAG] Error DB: {e}")
    
    manifest_data = {}
    if comp_id:
        manifest_path = os.path.join(get_company_media_path(comp_id), "manifest.json")
        if os.path.exists(manifest_path):
            try:
                manifest_list = json.load(open(manifest_path, "r", encoding="utf-8"))
                for item in manifest_list:
                    if isinstance(item, dict) and item.get("name"):
                        manifest_data[item["name"]] = item
            except: pass

    inst_dir = os.path.join(CONFIG_DIR, inst_name)
    # Directorios a escanear (Configuración local + Librería de medios)
    dirs_to_scan = [inst_dir]
    if comp_id:
        dirs_to_scan.append(get_company_media_path(comp_id))

    all_processed_files = []

    for target_dir in dirs_to_scan:
        if not os.path.exists(target_dir): continue
        for root, dirs, files in os.walk(target_dir):
            for f_name in files:
                f_path = os.path.join(root, f_name)
                if f_name in ["knowledge.txt", "consolidated_knowledge.md"] or f_name.endswith(".json"): continue
                
                meta_info = ""
                item_data = manifest_data.get(f_name, {})
                context = item_data.get("context", "").strip()
                summary = item_data.get("summary", "").strip()
                if context: meta_info += f"CONTEXTO MANUAL (IMPORTANTE): {context}\n"
                if summary: meta_info += f"RESUMEN GENERADO: {summary}\n"

                try:
                    if f_name.endswith(".pdf"):
                        import fitz
                        doc = fitz.open(f_path)
                        text = ""
                        for page in doc: text += page.get_text()
                        knowledge += f"--- CONTENIDO DE {f_name} ---\n{meta_info}\n{text}\n\n"
                        doc.close()
                    elif f_name.endswith(".txt") or f_name.endswith(".md"):
                        knowledge += f"--- CONTENIDO DE {f_name} ---\n{meta_info}\n{open(f_path, 'r', encoding='utf-8').read()}\n\n"
                    elif f_name.endswith(".xlsx") or f_name.endswith(".csv"):
                        try:
                            import pandas as pd
                            df = pd.read_excel(f_path) if f_name.endswith(".xlsx") else pd.read_csv(f_path)
                            knowledge += f"--- CONTENIDO DE {f_name} (TABULAR) ---\n{meta_info}\n{df.to_string()}\n\n"
                        except: pass
                except Exception as e: logger.error(f" [RAG-ERR] {e}")
                else: all_processed_files.append(f_name)
    
    logger.info(f" [RAG] Archivos indexados: {all_processed_files}")
    with open(os.path.join(inst_dir, "consolidated_knowledge.md"), "w", encoding="utf-8") as f:
        f.write(knowledge)
    logger.info(f" [RAG] Conocimiento consolidado guardado para {inst_name} ({len(knowledge)} bytes)")
    cache_invalidate(inst_name)

def process_ia_async(jid, body, phone, inst_name, msg_data):
    global processing_count
    processing_count += 1
    try:
        logger.info(f" [PROC-START] Hilo iniciado para {phone} en {inst_name}. Body: {body[:30]}")
        # 1. Normalización y Configuración
        inst_name = inst_name.replace("@", "")
        conf_a1, _, _ = cache_get_config(inst_name)
        step = conf_a1.get("step", "IA_A2_A3")
        state, manual, cur_name, chan, _, handoff, named, cur_summary = get_session(phone, inst_name)
        logger.info(f" [DEBUG-TRACE] get_session OK. State: {state}")
        inner = msg_data.get('message', {})
        # --- INTERCEPTOR DE MULTIMEDIA (Pre-procesamiento) ---
        is_multimedia = (body == "__MULTIMEDIA__")
        logger.info(f" [DEBUG-TRACE] is_multimedia check: {is_multimedia}")
        if is_multimedia or (inner and (inner.get('audioMessage') or inner.get('imageMessage') or inner.get('documentMessage') or inner.get('videoMessage'))):
            is_multimedia = True
            try:
                logger.info(f" [PROC] Llamando a multimedia_decoder para {phone}...")
                body = multimedia_decoder.procesar_multimedia(EVO_URL, EVO_API_KEY, inst_name, msg_data)
                logger.info(f" [PROC] Resultado multimedia: {body[:100]}")
                log_message(phone, inst_name, body, "in")
            except Exception as e:
                logger.error(f" [!] Error en interceptor multimedia: {e}")
                body = "[Error en procesamiento de archivo]"
        
        logger.info(f" [DEBUG-TRACE] Step check: {step}")
        # --- NUCLEO DE VENTAS DETERMINÍSTICO (14 PASOS) ---
        if step == "STEP_NICO_VENTAS":
            logger.info(f" [DEBUG-TRACE] Entering STEP_NICO_VENTAS")
            conf_p = os.path.join(CONFIG_DIR, inst_name, "configs")
            pricing_p = os.path.join(conf_p, "pricing.json")
            logistics_p = os.path.join(conf_p, "logistics.json")
            catalog_p = os.path.join(conf_p, "media_catalog.json")
            ia_prompt = conf_a1.get("ia_prompt", "Eres un experto en Nico Ventas.")
            logger.info(f" [DEBUG-TRACE] Paths and prompt OK")
            
            # Helpers
            def _get_price(q):
                if not os.path.exists(pricing_p): return None, None
                pr = json.load(open(pricing_p, "r", encoding="utf-8"))
                q_l = q.lower()
                for b, d in pr.items():
                    b_l = b.lower()
                    # Coincidencia más flexible
                    if b_l in q_l or q_l in b_l or any(w in q_l for w in b_l.split() if len(w) > 3):
                        sex = "hembra" if "hembra" in q_l else "macho"
                        # Extraer precio numérico limpio
                        price_str = str(d.get(sex, d.get("precio_efectivo", "750000")))
                        p_v = int(re.sub(r'[^\d]', '', price_str))
                        return b, p_v
                return None, None

            def _get_shipping(q):
                if not os.path.exists(logistics_p): return 35000
                lg = json.load(open(logistics_p, "r", encoding="utf-8"))
                q_u = q.upper()
                for z, c in lg.items():
                    if z in q_u or q_u in z: return c
                return lg.get("INTERIOR", 35000)

            # --- INTERCEPTOR GLOBAL DE RAZAS (Permite cambiar de raza en cualquier momento) ---
            if state not in ["MENU", "NICO_AWAITING_NAME", "NICO_CONFIRMING_NAME"]:
                bn, p = _get_price(body)
                # Si detectamos una raza nueva o el usuario está preguntando por una específica
                if bn and (not cur_summary or bn.lower() not in cur_summary.lower()):
                    logger.info(f" [DEBUG-FLOW] Cambio de raza detectado: {bn}")
                    res = f"¡Perfecto! El *{bn}* está ${p:,}. ¿Querés que te envíe fotos y videos reales?"
                    update_session(phone, inst_name, state="NICO_ASK_PHOTOS", summary=f"RAZA: {bn} | PRECIO: {p}")
                    _send(jid, inst_name, res); processing_count -= 1; return

            # INTERCEPTOR DE FOTOS/VIDEOS DEL CATÁLOGO (Global)
            trigger_words = ["foto", "video", "imagen", "veamos", "pasame", "verlo", "mirar", "muestrame", "mostrame"]
            if any(w in body.lower() for w in trigger_words) and state not in ["MENU", "NICO_AWAITING_NAME"]:
                bq = body.lower()
                # Si el body no tiene la raza, la sacamos del summary
                if not any(breed.lower() in bq for breed in ["salchicha", "boxer", "caniche", "yorkshire", "beagle", "shitzu", "schnauzer", "bulldog"]):
                    if cur_summary: bq = cur_summary.split("|")[0].replace("RAZA:","").strip().lower()
                
                logger.info(f" [DEBUG-MEDIA] Intento de media para: {bq}")
                if os.path.exists(catalog_p):
                    cat = json.load(open(catalog_p, "r", encoding="utf-8"))
                    match = None
                    for k, v in cat.items():
                        if k.lower() in bq or bq in k.lower(): match = v; break
                    
                    if match:
                        photos = match.get("photos", [])
                        videos = match.get("videos", [])
                        general_img_path = os.path.join(CONFIG_DIR, inst_name, "media", "IMG-20260423-WA0021.jpg")
                        
                        if photos:
                            _send(jid, inst_name, "¡Claro! Aquí tienes las fotos reales: 📸✨")
                            for img in photos[:4]: _send_media(jid, inst_name, os.path.join(CONFIG_DIR, inst_name, "media", img))
                            # Siempre enviar la imagen general al final
                            if os.path.exists(general_img_path): _send_media(jid, inst_name, general_img_path)
                        elif videos:
                            _send(jid, inst_name, "No tengo fotos nuevas a mano, ¡pero te paso videos reales para que los veas mejor! 🎥🐾")
                            for vid in videos[:2]: _send_media(jid, inst_name, os.path.join(CONFIG_DIR, inst_name, "media", vid))
                            if os.path.exists(general_img_path): _send_media(jid, inst_name, general_img_path)
                        else:
                            _send(jid, inst_name, "Justo de esa raza no tengo fotos en este momento, pero si querés podés venir a verlos personalmente. 🐾")
                        
                        if state == "NICO_AWAITING_BREED" or state == "NICO_ASK_PHOTOS":
                            # Si estábamos buscando raza, avanzamos a preguntar si quiere reservar
                            como_trabajamos = "Te cuento cómo trabajamos mientras los mirás."
                            try: como_trabajamos = open(os.path.join(MEDIA_LIB_DIR, "nico_ventas", "Como trabajamos.txt"), "r", encoding="utf-8").read()
                            except: pass
                            _send(jid, inst_name, como_trabajamos)
                            update_session(phone, inst_name, state="NICO_CONFIRM_PROCESS")
                        
                        processing_count -= 1; return
                    else:
                        _send(jid, inst_name, "¿De qué raza te gustaría ver fotos? Actualmente tenemos Salchichas, Caniches, Boxer, etc.")
                        processing_count -= 1; return

            # MAQUINA DE ESTADOS
            logger.info(f" [DEBUG-FLOW] State: {state}, Body: {body}")
            if state == "MENU" or state == "AWAITING_MENU":
                res = "¡Hola! Soy Nico de Mascotas 🐾. Para atenderte mejor, ¿me podrías decir tu nombre y apellido?"
                logger.info(f" [DEBUG-FLOW] Entrando a MENU -> NICO_AWAITING_NAME")
                update_session(phone, inst_name, state="NICO_AWAITING_NAME")
                _send(jid, inst_name, res); processing_count -= 1; return
            elif state == "NICO_AWAITING_NAME":
                name_clean = body.replace("[NOTA DE VOZ]:", "").replace("me llamo", "").replace("soy", "").strip().title()
                res = f"Gracias {name_clean}, ¿es correcto? (SI/NO)"
                update_session(phone, inst_name, state="NICO_CONFIRMING_NAME", name=name_clean)
                _send(jid, inst_name, res); processing_count -= 1; return
            elif state == "NICO_CONFIRMING_NAME":
                if "SI" in body.upper():
                    res = f"¡Mucho gusto {cur_name}! ¿Qué raza buscás? Actualmente tenemos:\n"
                    if os.path.exists(pricing_p):
                        for b, v in json.load(open(pricing_p, "r", encoding="utf-8")).items():
                            if isinstance(v, dict): res += f"- {b}\n"
                    update_session(phone, inst_name, state="NICO_AWAITING_BREED", name_confirmed=1)
                else:
                    res = "Perdón, ¿me decís tu nombre nuevamente?"
                    update_session(phone, inst_name, state="NICO_AWAITING_NAME")
                _send(jid, inst_name, res); processing_count -= 1; return
            elif state == "NICO_AWAITING_BREED":
                bn, p = _get_price(body)
                if bn:
                    res = f"¡Excelente! El *{bn}* está ${p:,}. ¿Querés que te envíe fotos y videos reales?"
                    update_session(phone, inst_name, state="NICO_ASK_PHOTOS", summary=f"RAZA: {bn} | PRECIO: {p}")
                else: res = query_ollama(body, ia_prompt, inst_name)
                _send(jid, inst_name, res); processing_count -= 1; return
            elif state == "NICO_ASK_PHOTOS":
                if any(x in body.upper() for x in ["SI", "DALE", "FOTO", "OK", "ESTA BIEN", "PASAME"]):
                    # Esto ahora se maneja mayormente por el interceptor global para evitar duplicidad,
                    # pero si llega aquí sin disparar el interceptor, lo forzamos.
                    bq = cur_summary.split("|")[0].replace("RAZA:","").strip().lower()
                    _send(jid, inst_name, f"¡Perfecto! Buscando fotos de {bq}... ⏳")
                    # Disparamos el interceptor manualmente reenviando la lógica
                    body = f"fotos de {bq}" 
                    # No retornamos, dejamos que el flujo suba o se maneje en el siguiente mensaje
                    # Pero para evitar bucle, simplemente forzamos el envío aquí una vez más:
                    if os.path.exists(catalog_p):
                        cat = json.load(open(catalog_p, "r", encoding="utf-8"))
                        match = next((v for k, v in cat.items() if k.lower() in bq or bq in k.lower()), None)
                        general_img_path = os.path.join(CONFIG_DIR, inst_name, "media", "IMG-20260423-WA0021.jpg")
                        if match:
                            photos = match.get("photos", [])
                            videos = match.get("videos", [])
                            if photos:
                                for img in photos[:3]: _send_media(jid, inst_name, os.path.join(CONFIG_DIR, inst_name, "media", img))
                            elif videos:
                                for vid in videos[:2]: _send_media(jid, inst_name, os.path.join(CONFIG_DIR, inst_name, "media", vid))
                            
                            if os.path.exists(general_img_path): _send_media(jid, inst_name, general_img_path)
                    
                    time.sleep(1)
                    como_trabajamos = "Te cuento cómo trabajamos mientras los mirás."
                    try: como_trabajamos = open(os.path.join(MEDIA_LIB_DIR, "nico_ventas", "Como trabajamos.txt"), "r", encoding="utf-8").read()
                    except: pass
                    _send(jid, inst_name, como_trabajamos)
                    update_session(phone, inst_name, state="NICO_CONFIRM_PROCESS")
                    
                    # 6. enviar texto "Como trabajamos.txt"
                    como_trabajamos = "Mientras los mirás, te cuento cómo trabajamos."
                    try: como_trabajamos = open(os.path.join(MEDIA_LIB_DIR, "nico_ventas", "Como trabajamos.txt"), "r", encoding="utf-8").read()
                    except: pass
                    _send(jid, inst_name, como_trabajamos)
                    
                    res = "¿Estás de acuerdo con nuestra forma de trabajo?"
                    update_session(phone, inst_name, state="NICO_CONFIRM_PROCESS")
                else:
                    # Fallback a IA si no es una respuesta directa a las fotos
                    res = query_ollama(body, ia_prompt, inst_name)
                    # Añadimos un recordatorio suave si la IA no lo hizo
                    if "¿" not in res:
                        res += "\n\n¿Querés que te envíe fotos y videos reales para avanzar?"
                _send(jid, inst_name, res); processing_count -= 1; return
            elif state == "NICO_CONFIRM_PROCESS":
                if any(x in body.upper() for x in ["SI", "OK", "DALE"]):
                    # 7. enviar texto "reserva.txt" y preguntar zona
                    reserva = "¡Perfecto! La reserva es de $50.000."
                    try: reserva = open(os.path.join(MEDIA_LIB_DIR, "nico_ventas", "reserva.txt"), "r", encoding="utf-8").read()
                    except: pass
                    _send(jid, inst_name, reserva)
                    res = "¿En qué zona sería la entrega para pasarte el precio del envío?"
                    update_session(phone, inst_name, state="NICO_AWAITING_ZONE")
                else: res = "¿Aceptás nuestra forma de trabajo?"
                _send(jid, inst_name, res); processing_count -= 1; return
            elif state == "NICO_AWAITING_ZONE":
                shp = _get_shipping(body)
                p = int(cur_summary.split("|")[1].replace("PRECIO:","").strip())
                res = f"📍 El envío a {body.upper()} es de ${shp:,}.\n\n*TOTAL A PAGAR: ${p+shp:,}*.\n\n¿Confirmamos?"
                update_session(phone, inst_name, state="NICO_CONFIRM_TOTAL", summary=f"{cur_summary} | ZONA: {body} | TOTAL: {p+shp}")
                _send(jid, inst_name, res); processing_count -= 1; return
            elif state == "NICO_CONFIRM_TOTAL":
                if any(x in body.upper() for x in ["SI", "OK", "CONFIRMO", "DALE"]):
                    res = "¡Perfecto! Quedo a la espera del comprobante de transferencia."
                    update_session(phone, inst_name, state="NICO_AWAITING_PROOF")
                else: res = "¿Confirmamos el pedido?"
                _send(jid, inst_name, res); processing_count -= 1; return
            elif state == "NICO_AWAITING_PROOF":
                if is_multimedia or any(x in body.upper() for x in ["COMPROBANTE", "LISTO", "ENVIADO", "PAGO", "TRANSFE", "ACÁ"]):
                    # 10. esperar comprobante... enviar datos.txt
                    datos = "¡Comprobante recibido! ✅ Ticket de venta abierto.\n\nPor favor, completame estos datos finales:"
                    try: datos = open(os.path.join(MEDIA_LIB_DIR, "nico_ventas", "datos.txt"), "r", encoding="utf-8").read()
                    except: pass
                    res = "¡Comprobante recibido con éxito! ✅\n\n" + datos
                    
                    # 11. Pedir autorizacion humana (Ticket A3)
                    try:
                        conn_tk = sqlite3.connect(DB_PATH)
                        c_tk = conn_tk.cursor()
                        sum_ia = get_chat_summary(phone, inst_name)
                        c_tk.execute("INSERT INTO tickets (phone, channel, status, summary, a3, summary_ia) VALUES (?, ?, ?, ?, 1, ?)", 
                                     (phone, inst_name, 'pending_auth', cur_summary, sum_ia))
                        conn_tk.commit()
                        conn_tk.close()
                    except Exception as e: logger.error(f" [DB-ERR] Insert ticket: {e}")

                    # Calcular resta de la señal
                    try:
                        total_match = re.search(r"TOTAL:\s*(\d+)", cur_summary)
                        if total_match:
                            total_val = int(total_match.group(1))
                            senal = 50000
                            resta = total_val - senal
                            detail_msg = f"{cur_summary}\n💰 *PAGO:* Total ${total_val:,} - Seña ${senal:,} = *RESTA ${resta:,}*"
                        else:
                            detail_msg = cur_summary
                    except: detail_msg = cur_summary

                    for adm in ADMIN_PHONES: _send(f"{adm}@s.whatsapp.net", inst_name, f"⚠️ *VENTA NICO*: {cur_name} envió comprobante.\nDetalle: {detail_msg}")
                    update_session(phone, inst_name, state="NICO_AWAITING_FINAL_DATA", manual=0)
                elif any(x in body.upper() for x in ["FOTO", "VIDEO", "MIRAR", "PASAME", "PRECIO", "VALOR", "CUANTO", "MAS", "EXTRA", "CIUCHA", "CUCHA"]):
                    _send(jid, inst_name, "¡Claro! Aquí tienes más información y fotos: 📸✨")
                    bq = cur_summary.split("|")[0].replace("RAZA:","").strip().lower()
                    if os.path.exists(catalog_p):
                        cat = json.load(open(catalog_p, "r", encoding="utf-8"))
                        match = next((v for k, v in cat.items() if k in bq or bq in k), None)
                        if match:
                            for img in match.get("photos", [])[:4]: 
                                _send_media(jid, inst_name, os.path.join(CONFIG_DIR, inst_name, "media", img))
                                time.sleep(1)
                            for vid in match.get("videos", [])[:1]: 
                                _send_media(jid, inst_name, os.path.join(CONFIG_DIR, inst_name, "media", vid))
                                time.sleep(1)
                    res = "Cuando estés listo, enviame el comprobante por acá. ¡Gracias!"
                else:
                    res = "Quedo a la espera del comprobante de transferencia para agendar tu cachorro. ¡Gracias!"
                _send(jid, inst_name, res); processing_count -= 1; return
            elif state == "NICO_AWAITING_FINAL_DATA":
                # Si pregunta cosas en lugar de dar los datos de envío, respondemos y nos quedamos aquí
                if any(x in body.upper() for x in ["PRECIO", "CUANTO", "FOTO", "VALOR", "CIUCHA", "CUCHA", "MAS", "EXTRA"]):
                    _send(jid, inst_name, "¡Te paso la info! Pero antes, no olvides pasarme tus datos de envío para terminar la reserva. 😉")
                    bq = body.lower()
                    if os.path.exists(catalog_p):
                        cat = json.load(open(catalog_p, "r", encoding="utf-8"))
                        match = None
                        for k, v in cat.items():
                            if k.lower() in bq or bq in k.lower(): match = v; break
                        if match:
                            for img in match.get("photos", [])[:2]: _send_media(jid, inst_name, os.path.join(CONFIG_DIR, inst_name, "media", img))
                    processing_count -= 1; return

                # 11. Mensaje de Ticket Final al Cliente
                summary_fmt = cur_summary.replace("|", "\n-")
                res = f"✅ *Se generó un ticket con los siguientes datos:*\n\n"
                res += f"📋 *RESUMEN:* \n-{summary_fmt}\n"
                res += f"👤 *DATOS CLIENTE:* {body}\n"
                res += f"\n¡Muchas gracias! Ya procesé tus datos finales. 🐾"
                _send(jid, inst_name, res)
                
                # 12. Enviar audio cierre de venta
                audio_path = os.path.join(MEDIA_LIB_DIR, "nico_ventas", "cierre de venta.mp4")
                if os.path.exists(audio_path):
                    _send_media(jid, inst_name, audio_path)
                
                # 13. Enviar entrega.txt
                entrega = ""
                try: entrega = open(os.path.join(MEDIA_LIB_DIR, "nico_ventas", "Entrega.txt"), "r", encoding="utf-8").read()
                except: pass
                if entrega: _send(jid, inst_name, entrega)
                
                # 14. Enviar a Valeria Bazo
                valeria = "5491159439080"
                _send(f"{valeria}@s.whatsapp.net", inst_name, f"🚚 *NUEVA LOGÍSTICA*: {cur_name}\nPedido: {cur_summary}\nDatos Cliente: {body}")
                
                # FINALIZAR FLUJO Y QUEDAR EN ESPERA DE AUTORIZACION HUMANA (Ticket A3)
                # No ponemos manual=1 para que pueda seguir preguntando por productos extra
                update_session(phone, inst_name, state="NICO_A3_PENDING_AUTH", pending_handoff=1, manual=0)
                processing_count -= 1; return

            elif state == "NICO_A3_PENDING_AUTH":
                # En este estado, el ticket ya está creado pero el bot sigue atento por si piden productos extra
                if any(x in body.upper() for x in ["FOTO", "VIDEO", "MIRAR", "PASAME", "PRECIO", "VALOR", "CUANTO", "MAS", "EXTRA"]):
                    _send(jid, inst_name, "¡Claro! Decime qué más te gustaría ver o agregar a tu pedido y te paso info. 🐾")
                    # Podríamos re-usar la lógica de búsqueda en catálogo aquí
                    bq = body.lower()
                    if os.path.exists(catalog_p):
                        cat = json.load(open(catalog_p, "r", encoding="utf-8"))
                        match = None
                        for k, v in cat.items():
                            if k.lower() in bq or bq in k.lower(): match = v; break
                        if match:
                            for img in match.get("photos", [])[:2]: _send_media(jid, inst_name, os.path.join(CONFIG_DIR, inst_name, "media", img))
                    processing_count -= 1; return
                else:
                    # Si dice algo que no es una duda de productos, solo recordar que estamos procesando
                    _send(jid, inst_name, "¡Excelente! Ya agendé tu pedido. En breve un administrador confirmará la reserva. ¿Necesitás ver algo más mientras tanto?")
                    processing_count -= 1; return

        # --- CANAL ADMIN ---
        if phone in ADMIN_PHONES:
            if body.startswith("#"):
                _send(jid, inst_name, "Comando admin ejecutado."); processing_count -= 1; return
            # Se elimina bloqueo de audio para admin para permitir flujo de ventas normal

        # --- IA KERNEL (STANDALONE) ---
        if manual == 1: processing_count -= 1; return
        knowledge = cache_get_knowledge(inst_name)
        history = cache_get_history(phone, inst_name, limit=10)
        prompt = f"ERES UN EXPERTO EN {inst_name}. CONTEXTO:\n{knowledge[:8000]}\nHISTORIAL:\n{history}\n"
        
        # OPTIMIZACIÓN: No llamar a Ollama para mensajes de STRESS
        if str(phone).startswith("STRESS_"):
            res_ia = f"[SIMULACIÓN] Respuesta automática para: {body[:30]}..."
        else:
            res_ia = query_ollama(body, prompt, inst_name)
            
        _send(jid, inst_name, res_ia)
        processing_count -= 1; return
    except Exception as e:
        logger.error(f" [!] Error critico en process_ia_async: {e}")
        processing_count -= 1


def _send(jid, inst, text):
    logger.info(f" [EVO-SEND] Enviando a {jid} via {inst}: {text[:50]}...")
    target_url = EVO_URL # Default 8080 (WhatsApp)
    
    # Registrar SIEMPRE el log en DB local inmediatamente para visibilidad en Dashboard
    # Incluso si el servicio externo falla, queremos ver qué respondió la IA
    try:
        p = jid.split('@')[0] if '@' in jid else jid
        log_message(p, inst, text, "out")
        # Marcar como respondido en el historial de RAM
        cache_add_message(p, inst, "assistant", text)
        update_session(p, inst, channel='WA', last_origin='IA', update_outgoing=True)
    except Exception as le:
        logger.error(f" [LOG-ERR] Error al loguear respuesta: {le}")

    # Detectar plataforma para envío real
    platform = "whatsapp"
    if "@instagram" in str(jid) or inst.startswith("ig_") or "instagram" in inst.lower():
        platform = "instagram"
        target_url = "http://127.0.0.1:8081"
    elif "@telegram" in str(jid) or inst.startswith("tg_") or "telegram" in inst.lower():
        platform = "telegram"
        target_url = "http://127.0.0.1:8082"
    
    # Si es un número de stress, NO intentamos enviar a la API real para no saturar el socket
    if jid.startswith("stress_"):
        logger.info(f" [STRESS-MOCK] Saltando envío real para usuario de prueba {jid}")
        return 200

    try:
        if platform == "whatsapp":
            r = requests.post(f"{target_url}/message/sendText/{inst}", 
                             headers={"apikey": EVO_API_KEY, "Content-Type": "application/json"}, 
                             json={"number": jid, "text": text}, timeout=15)
        else:
            r = requests.post(f"{target_url}/message/sendText/{inst}", 
                             json={"number": jid, "text": text}, timeout=15)
                             
        if r.status_code not in [200, 201]:
            logger.error(f" [!] Error al enviar a {platform} (HTTP {r.status_code}): {r.text}")
        
        return r.status_code
    except Exception as e:
        logger.error(f" [!] Error en _send real: {e}")
        return 500

@app.route('/static_media/<inst_name>/<filename>')
def serve_static_media(inst_name, filename):
    return send_from_directory(os.path.join(CONFIG_DIR, inst_name, "media"), filename)

@app.route('/static_assets/<path:filename>')
def serve_static_assets(filename):
    # filename can be "nico_ventas/cierre de venta.mp4"
    return send_from_directory(MEDIA_LIB_DIR, filename)

def _send_media(jid, inst, file_path, caption=""):
    logger.info(f" [EVO-MEDIA] Enviando {file_path} a {jid} via {inst}...")
    if not os.path.exists(file_path):
        logger.error(f" [!] Archivo no existe: {file_path}")
        return
        
    try:
        filename = os.path.basename(file_path)
        mimetype = "application/octet-stream"
        
        if filename.endswith(".mp4"): mimetype = "video/mp4"
        elif filename.endswith(".pdf"): mimetype = "application/pdf"
        elif filename.lower().endswith((".jpg", ".jpeg")): mimetype = "image/jpeg"
        elif filename.lower().endswith(".png"): mimetype = "image/png"
        
        import base64
        with open(file_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            
        logger.info(f" [EVO-MEDIA-B64] Sending as Base64 ({filename})...")
        
        payload = {
            "number": jid,
            "media": encoded_string,
            "fileName": filename,
            "caption": caption,
            "mediatype": "document" if not any(x in mimetype for x in ["image", "video", "audio"]) else mimetype.split("/")[0],
            "mimetype": mimetype
        }
        
        r = requests.post(f"{EVO_URL}/message/sendMedia/{inst}", 
                         headers={"apikey": EVO_API_KEY, "Content-Type": "application/json"}, 
                         json=payload, timeout=60)
        
        if r.status_code not in [200, 201]:
            logger.error(f" [!] Error al enviar media {filename} (HTTP {r.status_code}): {r.text}")
        else:
            logger.info(f" [EVO-MEDIA] {filename} enviado con exito.")
            try:
                p = jid.split('@')[0] if '@' in jid else jid
                log_message(p, inst, f"[{mimetype}]: {filename}", "out")
            except: pass
    except Exception as e:
        logger.error(f" [!] Excepcion al enviar media: {e}")

# --- WEBHOOK ENTIZADO ---
@app.route('/webhook', methods=['POST'])
@app.route('/webhook/whatsapp', methods=['POST'])
def webhook():
    try:
        data = request.json
        if not data: return "no data", 200
        logger.info(f" [WEBHOOK-RAW] Data: {json.dumps(data)[:200]}...")
        inst = data.get('instance')
        msg_obj = data.get('data', {})
        if msg_obj.get('key', {}).get('fromMe'): return "ignore self", 200
        jid = msg_obj.get('key', {}).get('remoteJid', '')
        phone = jid.split('@')[0] if jid and '@' in jid else jid
        
        # Dedup Persistente
        mid = msg_obj.get('key', {}).get('id')
        conn = sqlite3.connect(DB_PATH); c = conn.cursor()
        c.execute("SELECT 1 FROM processed_msgs WHERE msg_id=?", (mid,))
        if c.fetchone(): conn.close(); return "dup", 200
        c.execute("INSERT INTO processed_msgs (msg_id, instance) VALUES (?, ?)", (mid, inst))

        # Guardar en Agenda Global
        name = msg_obj.get('pushName', 'Cliente Nuevo')
        c.execute("""INSERT INTO contacts_agenda (name, phone, last_channel, origin) 
                   VALUES (?, ?, ?, ?)
                   ON CONFLICT(phone) DO UPDATE SET 
                   last_channel=excluded.last_channel,
                   name=CASE WHEN name='Cliente Nuevo' THEN excluded.name ELSE name END""", 
                   (name, phone, 'WHATSAPP', 'INBOUND_CHAT'))
        
        conn.commit(); conn.close()

        # Extraer Boton/Texto
        body = ""
        m = msg_obj.get('message', {})
        if m.get('conversation'): 
            body = m.get('conversation')
        elif m.get('extendedTextMessage'): 
            body = m.get('extendedTextMessage', {}).get('text', '')
        elif m.get('buttonsResponseMessage'): 
            body = m.get('buttonsResponseMessage', {}).get('selectedButtonId', '')
        elif m.get('listResponseMessage'): 
            body = m.get('listResponseMessage', {}).get('singleSelectReply', {}).get('selectedRowId', '')
        elif m.get('audioMessage') or m.get('imageMessage') or m.get('documentMessage') or m.get('videoMessage'): 
            body = "__MULTIMEDIA__"

        if not body: 
            # Si sigue sin body pero hay algo en m, marcamos como multimedia genérico
            if m: body = "__MULTIMEDIA__"
            else: return "ignore", 200
        logger.info(f" [WEBHOOK] Recibido de {phone} en instancia {inst}: {body[:30]}...")
        
        log_message(phone, inst, body, "in")
        cache_add_message(phone, inst, "user", body)
        update_session(phone, inst, update_incoming=True)
        
        # Prioridad: 1 para humanos, 10 para stress
        prio = 1 if not str(phone).startswith("STRESS_") else 10
        ia_queue.put((prio, {
            "jid": jid,
            "body": body,
            "phone": phone,
            "inst_name": inst,
            "msg_data": msg_obj
        }))
        return jsonify({"status": "queued", "queue_pos": ia_queue.qsize()}), 200
    except Exception as e: logger.error(f" [!] Webhook Error: {e}"); return "err", 500

@app.route('/api/whatsapp/qr', methods=['GET'])
def get_qr():
    inst = request.args.get('instance')
    if not inst: return jsonify({"status": "error", "message": "Falta instancia"}), 400
    
    headers = {"apikey": EVO_API_KEY}
    
    try:
        # Forzar un logout y delete primero para limpiar cualquier sesión fantasma
        logger.info(f" [QR-RESET] Solicitud manual de QR. Limpiando instancia {inst}...")
        requests.delete(f"{EVO_URL}/instance/logout/{inst}", headers=headers, timeout=5)
        requests.delete(f"{EVO_URL}/instance/delete/{inst}", headers=headers, timeout=5)
        time.sleep(2)

        # Re-crear con parámetros originales de la V2.0 que funcionaban
        payload = {
            "instanceName": inst,
            "integration": "WHATSAPP-BAILEYS",
            "token": "",
            "qrcode": True
        }
        requests.post(f"{EVO_URL}/instance/create", headers=headers, json=payload, timeout=10)
        time.sleep(5) # Espera mayor para asegurar que Baileys levante

        # Intentar obtener el QR con reintentos
        qr_data = {"count": 0, "code": "null"}
        for i in range(5):
            logger.info(f" [QR-REQ] Intento {i+1} para {inst}...")
            res = requests.get(f"{EVO_URL}/instance/connect/{inst}", headers=headers, timeout=10)
            if res.status_code == 200:
                qr_data = res.json()
                if qr_data.get('base64') or qr_data.get('code'):
                    logger.info(f" [+] QR obtenido con éxito para {inst}")
                    break
            time.sleep(2)
        
        return jsonify(qr_data)
    except Exception as e:
        logger.error(f" [QR-ERROR] {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

def send_mkt_email(to_email, subject, body, config, attachment_path=None):
    try:
        msg = MIMEMultipart()
        msg['From'] = config.get('user')
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))
        
        if attachment_path and os.path.exists(attachment_path):
            from email.mime.base import MIMEBase
            from email import encoders
            filename = os.path.basename(attachment_path)
            with open(attachment_path, "rb") as attachment:
                part = MIMEBase("application", "octet-stream")
                part.set_payload(attachment.read())
            encoders.encode_base64(part)
            part.add_header("Content-Disposition", f"attachment; filename= {filename}")
            msg.attach(part)

        host = config.get('host', 'smtp.gmail.com')
        port = int(config.get('port', 587))
        
        if port == 465:
            server = smtplib.SMTP_SSL(host, port)
        else:
            server = smtplib.SMTP(host, port)
            server.starttls()
            
        server.login(config.get('user'), config.get('password'))
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        logger.error(f" [MKT-EMAIL-ERR] To: {to_email}, Error: {e}")
        return False

def get_active_evo_instance():
    try:
        res = requests.get(f"{EVO_URL}/instance/fetchInstances", headers={"apikey": EVO_API_KEY}, timeout=5)
        if res.status_code == 200:
            instances = res.json()
            # Buscar la primera que este 'open' o 'connected'
            for inst in instances:
                name = inst.get('instance', {}).get('instanceName')
                status = inst.get('instance', {}).get('status')
                if status in ['open', 'connected']:
                    return name
    except: pass
    return EVO_INSTANCE

def mkt_loop():
    logger.info(" [MKT] Iniciando bucle de marketing (MKT-LOOP-V3)...")
    while True:
        try:
            conn = sqlite3.connect(DB_PATH, timeout=30)
            conn.execute("PRAGMA busy_timeout = 30000")
            # Bloqueo a nivel de DB para evitar que otros procesos tomen los mismos registros
            conn.execute("BEGIN IMMEDIATE")
            c = conn.cursor()
            c.execute("""
                SELECT c.id, c.name, c.phone, c.email, c.channel, camp.template, c.campaign_id, camp.media_path, camp.metadata, camp.name
                FROM mkt_contacts c
                JOIN mkt_campaigns camp ON c.campaign_id = camp.id
                WHERE c.status='pending' LIMIT 5
            """)
            contacts = c.fetchall()
            
            # Marcar como procesando ANTES de liberar la transacción
            for c_info in contacts:
                c.execute("UPDATE mkt_contacts SET status='processing' WHERE id=?", (c_info[0],))
            
            conn.commit()
            conn.close()

            if contacts:
                logger.info(f" [MKT] Procesando {len(contacts)} contactos pendientes...")
                # Buscar instancia activa para WA
                active_inst = None
                try:
                    res_inst = requests.get(f"{EVO_URL}/instance/fetchInstances", headers={"apikey": EVO_API_KEY}, timeout=5)
                    if res_inst.status_code == 200:
                        instances = res_inst.json()
                        for item in instances:
                            inst = item.get('instance', {})
                            if inst.get('status') == 'connected':
                                active_inst = inst.get('instanceName')
                                break
                        if not active_inst:
                            logger.warning(" [MKT] No hay instancias conectadas para WhatsApp.")
                except Exception as e:
                    logger.error(f" [MKT] Error consultando instancias: {e}")

                for c_id, name, phone, email, target_channel, msg_body, camp_id, media, meta_json, camp_name in contacts:
                    success = False
                    trace_id = f"TRC-{secrets.token_hex(4).upper()}"
                    msg_body = msg_body.replace('{{nombre}}', name or "Cliente")
                    
                    try: meta_data = json.loads(meta_json) if meta_json else {}
                    except: meta_data = {}
                    camp_inst = meta_data.get('instance')
                    current_inst = camp_inst if camp_inst else active_inst
                    
                    if target_channel == 'WA' and phone:
                        phone_clean = re.sub(r'\D', '', str(phone))
                        if phone_clean.startswith('54'):
                            if not phone_clean.startswith('549'):
                                phone_clean = '549' + phone_clean[2:]
                                logger.info(f" [MKT] Corrigiendo número AR (añadiendo 9): {phone} -> {phone_clean}")
                        elif len(phone_clean) == 10 and not any(phone_clean.startswith(pref) for pref in ['57', '58', '56', '51', '52']):
                            # Asumimos número local AR sin prefijo (ej: 1136822400) si no coincide con otros prefijos comunes Latam
                            phone_clean = '549' + phone_clean
                            logger.info(f" [MKT] Corrigiendo número AR (añadiendo 549): {phone} -> {phone_clean}")

                        if not current_inst:
                            logger.error(f" [MKT] Saltando WA para {phone} (No hay instancia activa)")
                            continue
                            
                        logger.info(f" [MKT] Enviando WA a {phone_clean} (Trace: {trace_id}) via {current_inst}")
                        try:
                            payload = {"number": f"{phone_clean}@s.whatsapp.net", "text": msg_body, "delay": 1200}
                            res = requests.post(f"{EVO_URL}/message/sendText/{current_inst}", 
                                             headers={"apikey": EVO_API_KEY}, json=payload, timeout=15)
                            
                            if res.status_code in [200, 201]:
                                success = True
                                log_message(phone_clean, current_inst, msg_body, "out", trace_id=trace_id, origin='SISTEMA')
                                if media:
                                    try:
                                        media_list = media.split(',')
                                        for m_name in media_list:
                                            m_name = m_name.strip()
                                            if not m_name: continue
                                            if m_name.startswith('http'):
                                                requests.post(f"{EVO_URL}/message/sendText/{current_inst}", 
                                                              headers={"apikey": EVO_API_KEY}, 
                                                              json={"number": f"{phone_clean}@s.whatsapp.net", "text": m_name, "delay": 500}, timeout=15)
                                                continue

                                            media_path = None
                                            for root, _, files in os.walk(MEDIA_LIB_DIR):
                                                if m_name in files:
                                                    media_path = os.path.join(root, m_name)
                                                    break
                                            
                                            if media_path and os.path.exists(media_path):
                                                import base64
                                                with open(media_path, "rb") as f: b64 = base64.b64encode(f.read()).decode()
                                                ext = m_name.lower().split('.')[-1]
                                                m_type = "image" if ext in ['jpg', 'jpeg', 'png', 'webp'] else "video" if ext in ['mp4', 'mov', 'avi'] else "document"
                                                m_payload = {"number": f"{phone_clean}@s.whatsapp.net", "mediatype": m_type, "caption": m_name if m_type != "document" else "", "media": b64}
                                                if m_type == "document": m_payload["fileName"] = m_name
                                                requests.post(f"{EVO_URL}/message/sendMedia/{current_inst}", headers={"apikey": EVO_API_KEY}, json=m_payload, timeout=30)
                                                time.sleep(5)
                                    except Exception as me: logger.error(f" [MKT-MEDIA-WA-ERR] {me}")
                            else:
                                logger.error(f" [MKT-WA-ERR] Instance: {current_inst}, Code: {res.status_code}, Response: {res.text}")
                        except Exception as we: logger.error(f" [MKT-WA-REQ-ERR] {we}")
                    
                    elif target_channel == 'EMAIL' and email:
                        logger.info(f" [MKT] Enviando Email a {email} (Trace: {trace_id})")
                        email_conf = {"host": "smtp.gmail.com", "port": 587, "user": "colaboratium@gmail.com", "password": "EMAIL_ACCOUNT_PASSWORD"} 
                        if current_inst:
                            smtp_p = os.path.join(CONFIG_DIR, current_inst, "smtp_config.json")
                            if os.path.exists(smtp_p):
                                try:
                                    with open(smtp_p, "r") as f:
                                        email_conf = json.load(f)
                                except Exception as e:
                                    logger.error(f" [MKT-SMTP-LOAD-ERR] {e}")
                        last_attachment = None
                        if media:
                            for m_name in media.split(','):
                                m_name = m_name.strip()
                                if not m_name: continue
                                for root, _, files in os.walk(MEDIA_LIB_DIR):
                                    if m_name in files:
                                        last_attachment = os.path.join(root, m_name); break
                                if last_attachment: break
                        
                        try:
                            if send_mkt_email(email, camp_name or "Campaña de Marketing", msg_body, email_conf, attachment_path=last_attachment):
                                success = True
                                log_message(email, "EMAIL-SVC", msg_body, "out", trace_id=trace_id, origin='SISTEMA')
                        except Exception as ee: logger.error(f" [MKT-EMAIL-ERR] {ee}")

                    elif target_channel == 'TELEGRAM' and phone:
                        # Buscar instancia TG de la empresa
                        tg_inst_active = TG_INSTANCE
                        try:
                            c.execute("SELECT instance FROM connections WHERE channel='telegram' LIMIT 1")
                            row_tg = c.fetchone()
                            if row_tg: tg_inst_active = row_tg[0]
                        except: pass

                        logger.info(f" [MKT] Enviando Telegram a {phone} via {tg_inst_active}")
                        try:
                            if media:
                                for m_name in media.split(','):
                                    m_name = m_name.strip()
                                    if not m_name: continue
                                    media_path = None
                                    for root, _, files in os.walk(MEDIA_LIB_DIR):
                                        if m_name in files: media_path = os.path.join(root, m_name); break
                                    
                                    if media_path:
                                        import base64
                                        with open(media_path, "rb") as f: b64 = base64.b64encode(f.read()).decode()
                                        ext = m_name.lower().split('.')[-1]
                                        m_type = "image" if ext in ['jpg', 'jpeg', 'png', 'webp'] else "video" if ext in ['mp4', 'mov', 'avi'] else "document"
                                        res_tg = requests.post(f"{TG_URL}/message/sendMedia/{tg_inst_active}", 
                                                            headers={"apikey": EVO_API_KEY}, 
                                                            json={"number": phone, "mediatype": m_type, "media": b64, "caption": msg_body if m_name == media.split(',')[0] else "", "fileName": m_name}, timeout=30)
                                        if res_tg.status_code in [200, 201]: success = True
                            else:
                                res_tg = requests.post(f"{TG_URL}/message/sendText/{tg_inst_active}", 
                                                    headers={"apikey": EVO_API_KEY}, 
                                                    json={"number": phone, "text": msg_body}, timeout=15)
                                if res_tg.status_code in [200, 201]: 
                                    success = True
                                else:
                                    logger.error(f" [MKT-TG-ERR] Code: {res_tg.status_code}, Response: {res_tg.text}")
                        except Exception as te: logger.error(f" [MKT-TG-EXC] {te}")
                    
                    # Actualizar estado en DB
                    status_db = 'sent' if success else 'failed'
                    log_msg = "Mensaje enviado con éxito" if success else "Error en el envío"
                    
                    if success:
                        log_message(phone_clean if target_channel == 'WA' else phone, 
                                   current_inst if target_channel == 'WA' else TG_INSTANCE, 
                                   msg_body, "out", trace_id=trace_id, origin='MKT')
                        update_session(phone_clean if target_channel == 'WA' else phone, 
                                      current_inst if target_channel == 'WA' else TG_INSTANCE, 
                                      channel=target_channel, last_origin='MKT', update_outgoing=True)

                    conn_upd = sqlite3.connect(DB_PATH)
                    c_upd = conn_upd.cursor()
                    c_upd.execute("INSERT INTO mkt_execution_logs (campaign_id, contact_name, channel, status, message) VALUES (?, ?, ?, ?, ?)", 
                             (camp_id, name, target_channel, status_db, log_msg))
                    c_upd.execute("UPDATE mkt_contacts SET status=?, last_channel=? WHERE id=?", (status_db, target_channel, c_id))
                    conn_upd.commit()
                    conn_upd.close()
                    
                    time.sleep(2) # Evitar baneo/spam
            
        except Exception as e:
            logger.error(f" [MKT-LOOP-ERR] {e}")
        time.sleep(5)

if __name__ == '__main__':
    # Singleton process lock check
    lock_path = os.path.join(CONFIG_DIR, "nucleo_ia.pid")
    if os.path.exists(lock_path):
        try:
            with open(lock_path, "r") as f:
                old_pid = int(f.read().strip())
            if psutil.pid_exists(old_pid):
                logger.error(f" [!] Error: Ya existe una instancia de Nucleo IA corriendo (PID {old_pid}). Saliendo...")
                sys.exit(0)
        except: pass
    
    with open(lock_path, "w") as f: f.write(str(os.getpid()))

    init_db()
    
    # Auto-sync de webhooks después de 10 segundos
    def auto_sync():
        time.sleep(10)
        logger.info(" [AUTO-SYNC] Iniciando sincronización automática de webhooks (Baileys)...")
        try:
            res = requests.get(f"{EVO_URL}/instance/fetchInstances", headers={"apikey": EVO_API_KEY}, timeout=10)
            if res.status_code == 200:
                for item in res.json():
                    inst = item.get('instance', {}).get('instanceName')
                    if item.get('instance', {}).get('status') == 'connected':
                        # Usar PUT para el servicio Node custom
                        requests.put(f"{EVO_URL}/webhook/set/{inst}", 
                                     json={"url": "http://localhost:5000/webhook"}, 
                                     headers={"apikey": EVO_API_KEY}, timeout=5)
        except: pass

    threading.Thread(target=auto_sync, daemon=True).start()
    threading.Thread(target=mkt_loop, daemon=True).start()
    
    # Iniciar servidor Flask
    try:
        app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
    except Exception as e:
        logger.error(f" [!] Error al iniciar Flask: {e}")
    finally:
        if os.path.exists(lock_path):
            try: os.remove(lock_path)
            except: pass
