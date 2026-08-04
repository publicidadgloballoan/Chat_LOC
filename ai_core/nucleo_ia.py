from flask import Flask, request, jsonify, send_from_directory, g
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
from dotenv import load_dotenv
import traceback

# Cargar variables de entorno
load_dotenv()

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

def report_error_to_license_server(error_msg, stack_trace, component="ai_core"):
    try:
        lic_server = os.getenv("LICENSE_SERVER")
        lic_token = os.getenv("LICENSE_TOKEN")
        if not lic_server or not lic_token:
            logger.info(" [REPORT-ERROR] No LICENSE_SERVER or LICENSE_TOKEN configured. Skipping error report.")
            return
        
        # Leer las últimas 500 líneas del log de consola (nucleo_debug.log)
        console_log = ""
        log_file_path = os.path.join(os.path.dirname(__file__), "nucleo_debug.log")
        if os.path.exists(log_file_path):
            try:
                with open(log_file_path, "r", encoding="utf-8", errors="ignore") as lf:
                    lines = lf.readlines()
                    console_log = "".join(lines[-500:])
            except Exception as le:
                console_log = f"Error reading log file: {le}"
        
        payload = {
            "token": lic_token,
            "component": component,
            "error_message": error_msg,
            "stack_trace": stack_trace,
            "console_log": console_log
        }
        
        def do_post():
            try:
                r = requests.post(f"{lic_server}/api/report_issue", json=payload, timeout=10)
                if r.status_code == 200:
                    logger.info(" [REPORT-ERROR] Error reportado exitosamente al servidor de licencias.")
                else:
                    logger.warning(f" [REPORT-ERROR] Falló reporte de error al servidor de licencias (Status: {r.status_code})")
            except Exception as re:
                logger.warning(f" [REPORT-ERROR] No se pudo conectar al servidor de licencias para reportar error: {re}")
                
        threading.Thread(target=do_post, daemon=True).start()
    except Exception as e:
        logger.error(f" [REPORT-ERROR] Excepción interna en reportador: {e}")

def run_diagnostic_agent():
    """Agente de auditoría y diagnóstico remoto. Reporta el estado al servidor de licencias."""
    logger.info(" [DIAG-AGENT] Iniciando agente de diagnóstico y heartbeat remoto...")
    
    while True:
        try:
            # Intentar leer desde config persistente si no están en variables de entorno
            lic_server = os.getenv("LICENSE_SERVER")
            lic_token = os.getenv("LICENSE_TOKEN")
            
            if not lic_server or not lic_token:
                cfg_path = os.path.join(os.path.dirname(__file__), "config", "license_config.json")
                if os.path.exists(cfg_path):
                    try:
                        with open(cfg_path, "r", encoding="utf-8") as f:
                            cfg = json.load(f)
                            lic_server = cfg.get("license_server")
                            lic_token = cfg.get("license_token")
                            if lic_server and lic_token:
                                os.environ["LICENSE_SERVER"] = lic_server
                                os.environ["LICENSE_TOKEN"] = lic_token
                    except Exception as ce:
                        logger.debug(f" [DIAG-AGENT] Error leyendo config/license_config.json: {ce}")
            
            if not lic_server or not lic_token:
                # No hay licencia configurada aún, esperar al siguiente ciclo
                time.sleep(15)
                continue

            # 1. Estadísticas de recursos de la PC
            cpu_percent = 0
            ram_percent = 0
            try:
                cpu_percent = psutil.cpu_percent(interval=None)
                ram_percent = psutil.virtual_memory().percent
            except Exception as pe:
                logger.debug(f" [DIAG-AGENT] Error al leer psutil: {pe}")

            # 2. Estado de conexión con Ollama
            ollama_status = "error"
            try:
                r_ollama = requests.get("http://localhost:11434/api/tags", timeout=2)
                if r_ollama.status_code == 200:
                    ollama_status = "ok"
            except Exception:
                pass

            # 3. Obtener instancias activas (WhatsApp de Evolution API e Instagram local)
            instances_list = []

            # 3.1. WhatsApp (Evolution API)
            try:
                current_api_key = os.getenv("AUTHENTICATION_API_KEY", EVO_API_KEY)
                r_evo = requests.get(f"{EVO_URL}/instance/fetchInstances", headers={"apikey": current_api_key}, timeout=4)
                if r_evo.status_code == 200:
                    for item in r_evo.json():
                        instance_data = item.get('instance', {})
                        inst_name = instance_data.get('instanceName')
                        inst_status = instance_data.get('status', 'unknown')
                        instances_list.append({
                            "name": inst_name,
                            "type": "whatsapp",
                            "status": inst_status
                        })
            except Exception as ee:
                logger.debug(f" [DIAG-AGENT] No se pudo conectar a Evolution API: {ee}")

            # 3.2. Instagram (ig_sessions)
            try:
                r_ig = requests.get("http://localhost:8081/instances", timeout=2)
                if r_ig.status_code == 200:
                    for inst_name in r_ig.json():
                        instances_list.append({
                            "name": inst_name,
                            "type": "instagram",
                            "status": "connected"
                        })
            except Exception as ie:
                logger.debug(f" [DIAG-AGENT] No se pudo conectar a Instagram Service: {ie}")

            # 4. Enviar Heartbeat al servidor central de licencias
            payload = {
                "token": lic_token,
                "instances": instances_list,
                "diagnostics": {
                    "cpu": f"{cpu_percent}%",
                    "ram": f"{ram_percent}%",
                    "ollama": ollama_status
                }
            }
            
            hb_resp = requests.post(f"{lic_server}/api/heartbeat", json=payload, timeout=10)
            if hb_resp.status_code == 200:
                data = hb_resp.json()
                pending_task = data.get('pending_task')
                
                # 5. Ejecutar diagnóstico remoto si se solicita
                if pending_task:
                    task_id = pending_task.get('id')
                    script_code = pending_task.get('script_code')
                    logger.info(f" [DIAG-AGENT] 🔍 Recibida tarea de diagnóstico remoto #{task_id}. Ejecutando...")
                    
                    scratch_dir = os.path.join(os.path.dirname(__file__), "scratch")
                    os.makedirs(scratch_dir, exist_ok=True)
                    temp_script = os.path.join(scratch_dir, "temp_diag.py")
                    
                    try:
                        with open(temp_script, "w", encoding="utf-8") as sf:
                            sf.write(script_code)
                        
                        # Ejecutar en subproceso con timeout de 60s
                        res = subprocess.run([sys.executable, temp_script], capture_output=True, text=True, timeout=60)
                        output = res.stdout
                        if res.stderr:
                            output += "\n--- STDERR ---\n" + res.stderr
                        
                        status = "completed" if res.returncode == 0 else "failed"
                    except Exception as exe_err:
                        status = "failed"
                        output = f"Excepción al ejecutar script: {exe_err}\n" + traceback.format_exc()
                    
                    # Limpieza del archivo temporal
                    if os.path.exists(temp_script):
                        try: os.remove(temp_script)
                        except: pass

                    # Reportar resultado al servidor de licencias
                    report_payload = {
                        "token": lic_token,
                        "task_id": task_id,
                        "status": status,
                        "result": output
                    }
                    requests.post(f"{lic_server}/api/diagnostics/report", json=report_payload, timeout=10)
                    logger.info(f" [DIAG-AGENT] ✅ Resultado de diagnóstico #{task_id} reportado.")
                    
            else:
                logger.debug(f" [DIAG-AGENT] Heartbeat rechazado por el servidor de licencias (Status: {hb_resp.status_code})")

        except Exception as e:
            logger.debug(f" [DIAG-AGENT] Excepción en loop de diagnóstico: {e}")

        time.sleep(30)

app = Flask(__name__)

@app.route('/api/config_license', methods=['POST'])
def config_license():
    try:
        data = request.json or {}
        server = data.get('license_server')
        token = data.get('license_token')
        
        if not server or not token:
            return jsonify({"success": False, "reason": "license_server and license_token are required"}), 400
            
        os.environ["LICENSE_SERVER"] = server
        os.environ["LICENSE_TOKEN"] = token
        
        # Guardar en archivo local persistente
        cfg_path = os.path.join(os.path.dirname(__file__), "config", "license_config.json")
        os.makedirs(os.path.dirname(cfg_path), exist_ok=True)
        with open(cfg_path, "w", encoding="utf-8") as f:
            json.dump({"license_server": server, "license_token": token}, f)
            
        logger.info(f" [DIAG-AGENT] Configuración de licencia actualizada. Server: {server}, Token: {token[:12]}...")
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "reason": str(e)}), 500


@app.teardown_request
def teardown_db(exception):
    db_conn = getattr(g, 'db_conn', None)
    if db_conn is not None:
        try:
            db_conn.close()
            logger.info(" [DB] Conexión SQLite cerrada automáticamente en teardown_request.")
        except Exception as e:
            logger.error(f" [DB] Error al cerrar conexión SQLite en teardown_request: {e}")
EVO_URL = "http://127.0.0.1:8080"
EVO_API_KEY = os.getenv("AUTHENTICATION_API_KEY", "03d27a0c34fa708178148142d6f5eedc86cd5e3a")
EVO_INSTANCE = "chatbot_punto_a"
TG_URL = "http://127.0.0.1:8082"
TG_INSTANCE = "colaboratium_ia_bot"

CONFIG_DIR = os.path.join(os.path.dirname(__file__), "config")
DB_PATH = os.path.join(CONFIG_DIR, "brain_sessions.db")

# Control de Concurrencia y Saturacion
processing_count = 0
MAX_CONCURRENT = 30
ADMIN_PHONES = ["5491136822400", "5491100000000"] 

def normalize_argentina_wa_phone(phone_str):
    clean = re.sub(r'[^\d]', '', str(phone_str))
    if not clean:
        return clean
    clean = clean.lstrip('0')
    if len(clean) == 10:
        return "549" + clean
    if len(clean) == 11 and clean.startswith("9"):
        return "54" + clean
    if len(clean) == 12 and clean.startswith("54"):
        return "549" + clean[2:]
    return clean

COMMAND_LOG_PATH = os.path.join(os.path.dirname(__file__), "command_logs.json")
CUSTOM_COMMANDS_PATH = os.path.join(os.path.dirname(__file__), "custom_commands.json")
MEDIA_LIB_DIR = os.path.join(os.path.dirname(__file__), "assets")
os.makedirs(MEDIA_LIB_DIR, exist_ok=True)
processing_contacts = set() # Global dedup for MKT loop
ia_queue = queue.PriorityQueue()
import itertools
queue_counter = itertools.count()
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
        
    # NUEVO: Obtener company_id para cargar conocimiento a nivel de empresa
    company_id = None
    try:
        conn = sqlite3.connect(DB_PATH, timeout=5)
        c = conn.cursor()
        c.execute("SELECT company_id FROM connections WHERE instance=?", (inst_name,))
        row = c.fetchone()
        if row: company_id = row[0]
        conn.close()
    except Exception as e:
        logger.error(f"Error fetching company_id for {inst_name}: {e}")

    # Si hay una empresa asociada, cargar su conocimiento global
    if company_id:
        company_kn_paths = [
            os.path.join(CONFIG_DIR, f"company_{company_id}", "knowledge.txt"),
            os.path.join(CONFIG_DIR, f"company_{company_id}", "consolidated_knowledge.md"),
            os.path.join(CONFIG_DIR, f"company_{company_id}", "knowledge", "knowledge.txt"),
            os.path.join(CONFIG_DIR, f"company_{company_id}", "knowledge", "consolidated_knowledge.md")
        ]
        for ckp in company_kn_paths:
            if os.path.exists(ckp) and os.path.getsize(ckp) > 0:
                try:
                    with open(ckp, "r", encoding="utf-8") as f:
                        knowledge += f"\n--- CONOCIMIENTO DE LA EMPRESA (GLOBAL) ({os.path.basename(ckp)}) ---\n"
                        knowledge += f.read() + "\n\n"
                except Exception as e:
                    logger.error(f"Error leyendo {ckp}: {e}")
                    
        # Tambien se pueden leer archivos sueltos en el directorio knowledge de la empresa
        company_kn_dir = os.path.join(CONFIG_DIR, f"company_{company_id}", "knowledge")
        if os.path.exists(company_kn_dir):
            for root, dirs, files in os.walk(company_kn_dir):
                for filename in files:
                    if filename not in ["knowledge.txt", "consolidated_knowledge.md"]:
                        filepath = os.path.join(root, filename)
                        if filepath.endswith(".md") or filepath.endswith(".txt"):
                            try:
                                with open(filepath, "r", encoding="utf-8") as f:
                                    knowledge += f"\n--- DOCUMENTO GLOBAL: {filename} ---\n"
                                    knowledge += f.read() + "\n\n"
                            except Exception as e:
                                logger.error(f"Error leyendo {filepath}: {e}")

    # Continuar con el conocimiento especifico de la instancia
    consolidated_path = os.path.join(CONFIG_DIR, inst_name, "consolidated_knowledge.md")
    # 1. Cargar JSONs estructurados (PRIORIDAD ALTA)
    # Buscar en raz y en subdirectorio 'configs'
    json_dirs = [os.path.join(CONFIG_DIR, inst_name), os.path.join(CONFIG_DIR, inst_name, "configs")]
    if company_id:
        json_dirs.append(os.path.join(CONFIG_DIR, f"company_{company_id}", "configs"))
        json_dirs.append(os.path.join(CONFIG_DIR, f"company_{company_id}"))

    for jdir in json_dirs:
        for json_file in ["pricing.json", "identity.json"]:
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

    # Tambien leer otros archivos en la carpeta de knowledge de la instancia especifica
    inst_kn_dir = os.path.join(CONFIG_DIR, inst_name, "knowledge")
    if os.path.exists(inst_kn_dir):
        for root, dirs, files in os.walk(inst_kn_dir):
            for filename in files:
                if filename not in ["knowledge.txt", "consolidated_knowledge.md"]:
                    filepath = os.path.join(root, filename)
                    if filepath.endswith(".md") or filepath.endswith(".txt"):
                        try:
                            with open(filepath, "r", encoding="utf-8") as f:
                                knowledge += f"\n--- DOCUMENTO DEL CANAL: {filename} ---\n"
                                knowledge += f.read() + "\n\n"
                        except Exception as e:
                            pass
    
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
                # El PriorityQueue devuelve (prioridad, counter, tarea)
                priority, cnt, task = ia_queue.get(timeout=5)
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
                  subject TEXT, media_path TEXT, company_id INTEGER,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    # Migraci\u00f3n de columnas faltantes para mkt_templates (compatibilidad con bases de datos previas)
    for _col_name, _col_def in [('subject', 'TEXT'), ('media_path', 'TEXT'), ('company_id', 'INTEGER')]:
        try:
            c.execute(f"SELECT {_col_name} FROM mkt_templates LIMIT 1")
        except sqlite3.OperationalError:
            try:
                c.execute(f"ALTER TABLE mkt_templates ADD COLUMN {_col_name} {_col_def}")
                logger.info(f" [DB-MIGRATE] Columna {_col_name} agregada a mkt_templates.")
            except Exception as _e:
                logger.error(f" [DB-MIGRATE] Error agregando {_col_name} a mkt_templates: {_e}")

    c.execute('''CREATE TABLE IF NOT EXISTS mkt_execution_logs
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, campaign_id INTEGER, 
                  contact_name TEXT, channel TEXT, status TEXT, message TEXT, 
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS rubros 
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS tickets
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT, instance TEXT, channel TEXT, 
                  status TEXT DEFAULT 'open', summary TEXT, a3 INTEGER DEFAULT 0,
                  assigned_to TEXT, priority TEXT DEFAULT 'normal',
                  metadata TEXT, company_id INTEGER, summary_ia TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    
    try:
        c.execute("SELECT company_id FROM tickets LIMIT 1")
    except sqlite3.OperationalError:
        try:
            c.execute("ALTER TABLE tickets ADD COLUMN company_id INTEGER")
        except Exception as e:
            logger.error(f" [DB-MIGRATE] Error agregando company_id a tickets: {e}")
            
    try:
        c.execute("SELECT instance FROM tickets LIMIT 1")
    except sqlite3.OperationalError:
        try:
            c.execute("ALTER TABLE tickets ADD COLUMN instance TEXT")
            logger.info(" [DB-MIGRATE] Columna instance agregada a tickets.")
        except Exception as e:
            logger.error(f" [DB-MIGRATE] Error agregando instance a tickets: {e}")
            
    try:
        c.execute("SELECT summary_ia FROM tickets LIMIT 1")
    except sqlite3.OperationalError:
        try:
            c.execute("ALTER TABLE tickets ADD COLUMN summary_ia TEXT")
        except Exception as e:
            logger.error(f" [DB-MIGRATE] Error agregando summary_ia a tickets: {e}")

    
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
                  company_id INTEGER,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  UNIQUE(phone))''')

    # Migración de columnas faltantes para contacts_agenda
    try:
        c.execute("SELECT company_id FROM contacts_agenda LIMIT 1")
    except sqlite3.OperationalError:
        try:
            c.execute("ALTER TABLE contacts_agenda ADD COLUMN company_id INTEGER")
        except Exception as e:
            logger.error(f" [DB-MIGRATE] Error agregando company_id a contacts_agenda: {e}")

    # mkt_templates ya fue creada y migrada arriba (con company_id, subject, media_path)

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

def _extract_price_generic(v, query=None):
    if isinstance(v, (int, float)):
        return int(v)
    if isinstance(v, str):
        # Intentar extraer digitos
        digits = re.sub(r'[^\d]', '', v)
        return int(digits) if digits else 0
    if isinstance(v, dict):
        # 1. Si hay query, buscar coincidencias especificas en las llaves (ej: "macho" o "hembra")
        if query:
            q_l = query.lower()
            for key in v.keys():
                if key.lower() in q_l:
                    return _extract_price_generic(v[key], query)
        # 2. Buscar claves comunes de precio
        for key in ["price", "precio", "price_effective", "precio_efectivo", "monto", "cost", "costo", "value", "valor"]:
            if key in v:
                return _extract_price_generic(v[key], query)
        # 3. Buscar cualquier clave con valor numerico valido
        for k_val, val_val in v.items():
            parsed = _extract_price_generic(val_val, query)
            if parsed > 0:
                return parsed
        return 0
    return 0

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
    if company_id:
        base = os.path.join(CONFIG_DIR, f"company_{company_id}", "media")
    else:
        base = MEDIA_LIB_DIR
    
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

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "services"))
from ia_kernel import ia_kernel

from cachetools import TTLCache
import hashlib
import json

# Cache for LLM responses: max 2000 items, TTL 3600 seconds (1 hour)
_ia_cache = TTLCache(maxsize=2000, ttl=3600)

def query_ollama(user_msg, system_prompt="Eres un asistente útil.", inst_name="default", history=None):
    try:
        # Añadimos la regla de no enlaces que ya existía
        system_prompt += "\n\nCRITICAL: DO NOT SEND ANY LINKS OR URLs. If you mention photos, just say they are being sent. NEVER invent Imgur or similar links."
        
        # Cache Key calculation
        hist_str = json.dumps(history, sort_keys=True) if history else ""
        raw_key = f"{user_msg}|{system_prompt}|{hist_str}"
        cache_key = hashlib.md5(raw_key.encode('utf-8')).hexdigest()
        
        if cache_key in _ia_cache:
            logger.info(" [IA CACHE] Cache hit for LLM query. Skipping inference.")
            return _ia_cache[cache_key]

        # Usamos el nuevo IAKernel para procesar el mensaje con failover (Ollama -> Grok)
        response = ia_kernel.get_response(user_msg, system_prompt, history)
        logger.info(f" [IA KERNEL] Respuesta obtenida de: {response.get('source')}")
        
        resp_text = response.get('text', "Error: IA no generó respuesta.")
        if not resp_text.startswith("Error"):
            _ia_cache[cache_key] = resp_text
            
        return resp_text
    except Exception as e:
        logger.error(f" [IA KERNEL ERROR]: {e}")
        return f"Error crítico de motor IA: {str(e)[:50]}"

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

def summarize_json_block(match_obj):
    full_block = match_obj.group(0)
    json_content_match = re.search(r"```[jJ]son\s*(.*?)\s*```", full_block, re.DOTALL)
    if not json_content_match:
        json_content_match = re.search(r"```\s*(.*?)\s*```", full_block, re.DOTALL)
    
    if not json_content_match:
        return "[JSON Configuración]"
        
    json_str = json_content_match.group(1).strip()
    try:
        data = json.loads(json_str)
        if not isinstance(data, dict):
            return "[JSON Configuración]"
            
        action_type = data.get("type")
        config = data.get("config", {}) or data.get("data", {}) or {}
        
        if action_type == "flow":
            flow_name = config.get("name", "sin_nombre")
            nodes = config.get("nodes", [])
            edges = config.get("edges", [])
            
            nodes_desc = []
            for n in nodes:
                nid = n.get("id", "")
                ntype = n.get("type", "")
                nname = n.get("name", "")
                pos = n.get("position", {}) or {}
                nx = pos.get("x", 0)
                ny = pos.get("y", 0)
                nodes_desc.append(f"{nid}({nname}:{ntype},x:{nx},y:{ny})")
                
            edges_desc = []
            for e in edges:
                src = e.get("source", "")
                tgt = e.get("target", "")
                lbl = e.get("label", "")
                lbl_desc = f" '{lbl}'" if lbl else ""
                edges_desc.append(f"{src}->{tgt}{lbl_desc}")
                
            return f"[Flujo: {flow_name} | Nodos: {', '.join(nodes_desc)} | Conexiones: {', '.join(edges_desc)}]"
            
        elif action_type == "a1":
            saludo = config.get("saludo_inicial", "")[:30] + "..."
            opciones = config.get("opciones_menu", [])
            opt_desc = [f"{o.get('numero')}({o.get('nombre')})" for o in opciones]
            return f"[Botonera A1 | Saludo: '{saludo}' | Opciones: {', '.join(opt_desc)}]"
            
        elif action_type == "a3":
            inst = config.get("instrucciones_ia", "")[:30] + "..."
            temps = config.get("templates", [])
            temps_desc = [f"{t.get('nombre')}({t.get('tipo')})" for t in temps]
            return f"[Templates A3 | Instrucciones: '{inst}' | Campos: {', '.join(temps_desc)}]"
            
        elif action_type == "identity":
            mission = config.get("mission", "")[:30] + "..."
            tone = config.get("voiceTone", "")
            return f"[Identidad | Misión: '{mission}' | Tono: {tone}]"
            
        return f"[JSON Configuración: {action_type}]"
    except Exception as e:
        return "[JSON Configuración]"

# --- API COPILOT ---
@app.route('/api/copilot', methods=['POST'])
def handle_copilot():
    data = request.get_json(silent=True) or {}
    msg = data.get('message', '')
    history = data.get('history', [])
    context = data.get('context', '')
    instance = data.get('instance', 'default')
    
    # Construir el System Prompt según el contexto
    sys_prompt = (
        "Eres el asistente experto de configuración de PICE SaaS. "
        "Ayudas al usuario a configurar el módulo de " + context + ". "
        "SIEMPRE responde en español, de forma amigable y clara. "
        "Al final de tu respuesta incluye SIEMPRE un bloque JSON con la acción a ejecutar, "
        "dentro de triple backticks (```json ... ```)."
    )
    
    if context == 'Botones A1':
        sys_prompt += """
Aquí el usuario configura su menú determinístico (Botonera A1).
El JSON que debes generar tiene EXACTAMENTE este formato:
```json
{
  "action": "save_config",
  "type": "a1",
  "config": {
    "saludo_inicial": "Hola! Soy el asistente de [Empresa]. ¿En qué te ayudo hoy?\\n1️⃣ Opción 1\\n2️⃣ Opción 2",
    "opciones_menu": [
      {"numero": "1", "nombre": "Nombre visible", "respuesta": "Texto de respuesta fija aquí"},
      {"numero": "2", "nombre": "Otra Opción", "respuesta": "Otra respuesta"}
    ]
  }
}
```
IMPORTANTE: cada opción DEBE tener exactamente las claves: "numero" (string), "nombre" (string) y "respuesta" (string).
"""
    elif context == 'Tickets A3':
        sys_prompt += """
Aquí el usuario configura los campos de extracción de datos (Templates A3).
El JSON que debes generar tiene EXACTAMENTE este formato:
```json
{
  "action": "save_config",
  "type": "a3",
  "config": {
    "templates": [
      {"nombre": "Nombre del campo", "tipo": "Texto"},
      {"nombre": "Email", "tipo": "Email"},
      {"nombre": "Teléfono", "tipo": "Teléfono"}
    ],
    "instrucciones_ia": "Solicita los datos de forma amable. Valida que el email contenga @."
  }
}
```
Los tipos válidos para cada campo son: "Texto", "Número", "Email", "Teléfono".
"""
    elif context == 'Flujos IA':
        sys_prompt += """
Aquí el usuario diseña flujos de conversación con nodos y conexiones paso a paso.
Tu objetivo es guiar al Administrador NODO A NODO.
- Si el usuario inicia un nuevo flujo, salúdalo y pregúntale: "Vamos a crear nodo a nodo los flujos de conversación: ¿cómo quieres iniciar? (ej: el cliente dijo 'Hola', ¿qué respondemos?)".
- En cada turno, si el usuario te describe un flujo completo o largo, NO intentes crearlo todo. Divide el requerimiento, crea UN SOLO nodo (máximo 2 si están muy acoplados), aplica el cambio en el JSON y pregúntale al administrador cómo seguir de forma puntual (ej: "He creado el nodo de Captura de Datos. Una vez que capturemos esto, ¿cuál es el siguiente paso?").
- Si el usuario te da demasiada información de golpe o instrucciones largas, dile amigablemente que vas a ir paso a paso, crea el primer nodo de esa cadena y pídele que te indique el siguiente paso de forma más corta.
- En cada respuesta posterior que agregues nodos, debes incluir en el JSON de "config" TODOS los nodos y edges acumulados anteriormente más el nuevo que estás añadiendo (para que no se pierdan).

El JSON que debes generar tiene este formato:
```json
{
  "action": "save_config",
  "type": "flow",
  "config": {
    "name": "nombre_del_flujo",
    "nodes": [
      {"id": "1", "type": "webhook", "name": "Inicio", "description": "Saludo inicial", "data": {"label": "Inicio"}, "position": {"x": 50, "y": 200}},
      {"id": "2", "type": "identity", "name": "Pedir Datos", "description": "Solicita DNI y celular", "data": {"label": "Pedir Datos"}, "position": {"x": 370, "y": 200}}
    ],
    "edges": [
      {"id": "e1-2", "source": "1", "target": "2"}
    ]
  }
}
```

REGLAS IMPORTANTES:
1. NODO A NODO: Diseña de manera incremental. No generes más de 1-2 nodos por interacción.
2. PREGUNTA Y RESPUESTA CORTA: Al final de tu mensaje, haz una pregunta clara y corta para que el administrador te diga el siguiente paso.
3. DESCRIPCIONES BREVES: La descripción de cada nodo debe ser de máximo 5-7 palabras.
4. Cada nodo debe tener: id (string), type, name, description, data: {label}, y position: {x, y}.
5. Si el paso requiere ramificaciones (branching), crea edges saliendo del nodo buttons/decision a los respectivos targets con su "label" descriptivo.
6. Tipos de nodo válidos: webhook, identity, buttons, rag, ticket, vision, approval, media, decision, ai_branch.
"""



    elif context == 'Identidad & Misión':

        sys_prompt += """
El JSON que debes generar:
```json
{"action": "save_knowledge", "type": "identity", "data": {"mission": "...", "vision": "...", "voiceTone": "Amable", "faqs": "..."}}
```
"""

    current_config = data.get('currentConfig')
    if current_config:
        sys_prompt += f"\n\nESTADO ACTUAL DEL CONFIGURADOR ({context}):\n"
        sys_prompt += json.dumps(current_config, ensure_ascii=False, indent=2)
        sys_prompt += "\n\nCRÍTICO: Cuando generes el JSON con la acción 'save_config' o 'save_knowledge', debes mantener/incluir todos los elementos (nodos, edges, templates, etc.) que ya existen en el estado actual e incorporar las modificaciones o adiciones nuevas. NO borres ni omitas elementos existentes a menos que el usuario lo pida explícitamente."

    # Filtrar el history si es demasiado largo, dejar los ultimos 6 y limpiar bloques JSON masivos
    filtered_history = []
    if history:
        for msg_item in history[-6:]:
            content = msg_item.get("content", "")
            # Comprimir los bloques JSON del historial en resúmenes legibles por la IA para no sobrecargar la CPU
            clean_content = re.sub(r"```[jJ]son\s*.*?\s*```", summarize_json_block, content, flags=re.DOTALL)
            clean_content = re.sub(r"```\s*.*?\s*```", summarize_json_block, clean_content, flags=re.DOTALL)
            filtered_history.append({
                "role": msg_item.get("role", "user"),
                "content": clean_content
            })


    response_text = query_ollama(msg, sys_prompt, instance, history=filtered_history)

    
    action = None
    # 1. Intentar buscar con formato markdown
    match = re.search(r"```[jJ]son\s*(.*?)\s*```", response_text, re.DOTALL)
    if not match:
        match = re.search(r"```(.*?)```", response_text, re.DOTALL)
        
    if match:
        json_str = match.group(1).strip()
    else:
        # 2. Si no hay markdown, buscar el primer { y el ultimo }
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}')
        if start_idx != -1 and end_idx != -1 and start_idx < end_idx:
            json_str = response_text[start_idx:end_idx+1]
        else:
            json_str = ""

    if json_str:
        try:
            if json_str.startswith("{"):
                action = json.loads(json_str)
                # Remover el bloque JSON de la respuesta visible
                if match:
                    response_text = re.sub(r"```[jJ]son\s*.*?\s*```", "", response_text, flags=re.DOTALL).strip()
                    response_text = re.sub(r"```\s*{.*?\s*```", "", response_text, flags=re.DOTALL).strip()
                else:
                    response_text = response_text[:start_idx] + response_text[end_idx+1:]
                    response_text = response_text.strip()
        except Exception as e:
            logger.error(f"[COPILOT] JSON parse error: {e}")
            pass
            
    return jsonify({"success": True, "message": response_text, "action": action})

# --- API DASHBOARD ---
@app.route('/api/data', methods=['GET', 'POST'])
def handle_api_data():
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.execute("PRAGMA busy_timeout = 30000")
    g.db_conn = conn
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
                # Obtener info previa del ticket antes de actualizar
                c.execute("SELECT phone, instance, status FROM tickets WHERE id=?", (tid,))
                t_info = c.fetchone()
                
                c.execute("UPDATE tickets SET status=?, assigned_to=?, priority=? WHERE id=?", (status, assigned, priority, tid))
                conn.commit()
                
                # Si el ticket pasa a estar aprobado/cerrado, avanzar la sesión del bot automáticamente
                if t_info and status and status.lower() in ['approved', 'aprobado', 'closed', 'cerrado'] and t_info[2].lower() == 'pending':
                    phone_tk, inst_tk = t_info[0], t_info[1]
                    def auto_advance_approved_session():
                        try:
                            # Conectar a db local para ver el estado de la sesión
                            conn_s = sqlite3.connect(DB_PATH, timeout=30)
                            c_s = conn_s.cursor()
                            c_s.execute("SELECT state FROM sessions WHERE phone=? AND instance=?", (phone_tk, inst_tk))
                            s_row = c_s.fetchone()
                            conn_s.close()
                            if s_row and s_row[0] == 'node_11':
                                logger.info(f" [AUTO-APPROVED] Aprobación detectada para ticket #{tid}. Avanzando sesión de {phone_tk} a node_12.")
                                update_session(phone_tk, inst_tk, state='node_12')
                                t_adv = threading.Thread(target=process_ia_async, args=(f"{phone_tk}@s.whatsapp.net", inst_tk, "", False, 1))
                                t_adv.daemon = True
                                t_adv.start()
                        except Exception as adv_err:
                            logger.error(f"[AUTO-APPROVED ERROR] {adv_err}")
                    threading.Thread(target=auto_advance_approved_session, daemon=True).start()
                
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
                                last_channel, origin, group_name, metadata, company_id) 
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                               ON CONFLICT(phone) DO UPDATE SET 
                               name=excluded.name, email=excluded.email, 
                               instagram=excluded.instagram, facebook=excluded.facebook, linkedin=excluded.linkedin,
                               dni=excluded.dni, address=excluded.address, cbu=excluded.cbu, alias=excluded.alias,
                               bank=excluded.bank, branch=excluded.branch,
                               group_name=excluded.group_name, metadata=excluded.metadata,
                               company_id=excluded.company_id""", 
                               (contact.get('name'), contact.get('phone'), contact.get('email'),
                                contact.get('instagram'), contact.get('facebook'), contact.get('linkedin'),
                                contact.get('dni'), contact.get('address'), contact.get('cbu'),
                                contact.get('alias'), contact.get('bank'), contact.get('branch'),
                                'IMPORT', 'FILE_UPLOAD', group, str(contact.get('metadata')), comp_id))
                conn.commit()
                return jsonify({"success": True, "count": len(contacts)})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'ocr_extract_contacts':
            try:
                import base64
                b64_img = data.get('image', '')
                if not b64_img:
                    return jsonify({"success": False, "error": "No image provided"})
                if ',' in b64_img:
                    b64_img = b64_img.split(',', 1)[1]
                file_bytes = base64.b64decode(b64_img)
                import multimedia_decoder
                numbers = multimedia_decoder.extraer_numeros_ocr(file_bytes)
                return jsonify({"success": True, "numbers": numbers, "count": len(numbers)})
            except Exception as e:
                logger.error(f"[API-OCR-EXTRACT-ERR] {e}")
                return jsonify({"success": False, "error": str(e)})

        if action == 'save_ocr_contacts':
            try:
                contacts = data.get('contacts', [])
                comp_id = data.get('companyId', 1)
                saved_count = 0
                for contact in contacts:
                    phone = contact.get('phone')
                    if not phone:
                        continue
                    name = contact.get('name', f"Pendiente ({phone})")
                    group = contact.get('group', 'CLIENTES')
                    origin = contact.get('origin', 'OCR_IMAGEN')
                    meta = json.dumps(contact.get('metadata', {})) if isinstance(contact.get('metadata'), dict) else str(contact.get('metadata', ''))

                    c.execute("""INSERT INTO contacts_agenda 
                               (name, phone, last_channel, origin, group_name, metadata, company_id) 
                               VALUES (?, ?, ?, ?, ?, ?, ?)
                               ON CONFLICT(phone) DO UPDATE SET 
                               name=COALESCE(NULLIF(excluded.name, ''), contacts_agenda.name),
                               origin=excluded.origin,
                               group_name=excluded.group_name,
                               company_id=COALESCE(excluded.company_id, contacts_agenda.company_id)""", 
                               (name, phone, 'WA', origin, group, meta, comp_id))
                    saved_count += 1
                conn.commit()
                return jsonify({"success": True, "count": saved_count})
            except Exception as e:
                logger.error(f"[API-SAVE-OCR-ERR] {e}")
                return jsonify({"success": False, "error": str(e)})

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

        if action == 'delete_chat':
            try:
                phone = data.get('phone')
                if phone:
                    c.execute("DELETE FROM sessions WHERE phone=?", (phone,))
                    c.execute("DELETE FROM logs WHERE phone=?", (phone,))
                    c.execute("DELETE FROM tickets WHERE phone=?", (phone,))
                    conn.commit()
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'delete_all_chats':
            try:
                phones = data.get('phones', [])
                if phones:
                    placeholders = ','.join(['?' for _ in phones])
                    c.execute(f"DELETE FROM sessions WHERE phone IN ({placeholders})", phones)
                    c.execute(f"DELETE FROM logs WHERE phone IN ({placeholders})", phones)
                    c.execute(f"DELETE FROM tickets WHERE phone IN ({placeholders})", phones)
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
                comp_id = data.get('companyId')
                if name:
                    c.execute("CREATE TABLE IF NOT EXISTS rubros (name TEXT, company_id INTEGER, PRIMARY KEY(name, company_id))")
                    if comp_id:
                        c.execute("INSERT OR IGNORE INTO rubros (name, company_id) VALUES (?, ?)", (name, comp_id))
                    else:
                        c.execute("INSERT OR IGNORE INTO rubros (name, company_id) VALUES (?, NULL)", (name,))
                    conn.commit()
                return jsonify({"success": True})
            except Exception as e: return jsonify({"success": False, "error": str(e)})

        if action == 'delete_rubro':
            try:
                name = data.get('name')
                comp_id = data.get('companyId')
                if name:
                    if comp_id:
                        c.execute("DELETE FROM rubros WHERE name=? AND company_id=?", (name, comp_id))
                    else:
                        c.execute("DELETE FROM rubros WHERE name=? AND company_id IS NULL", (name,))
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
                comp_id = data.get('companyId') or request.args.get('companyId')
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
                           group_name=excluded.group_name, metadata=excluded.metadata,
                           company_id=excluded.company_id""", 
                           (data.get('name'), data.get('phone'), data.get('email'),
                            data.get('instagram'), data.get('facebook'), data.get('linkedin'), data.get('telegram'),
                            data.get('dni'), data.get('address'), data.get('cbu'),
                            data.get('alias'), data.get('bank'), data.get('branch'),
                            'MANUAL', 'USER_ENTRY', data.get('group'), data.get('meta'), comp_id))
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
                
                # Obtener company_id de la campaña
                c.execute("SELECT company_id FROM mkt_campaigns WHERE id=?", (camp_id,))
                camp_row = c.fetchone()
                comp_id = camp_row[0] if camp_row else None

                # Guardar contactos
                for contact in contacts:
                    trace_id = f"TRC-{uuid.uuid4().hex[:8].upper()}"
                    c.execute("INSERT INTO mkt_contacts (campaign_id, trace_id, phone, email, name, metadata) VALUES (?, ?, ?, ?, ?, ?)",
                              (camp_id, trace_id, contact.get('phone'), contact.get('email'), contact.get('name'), str(contact.get('metadata'))))
                    
                    # Actualizar Agenda Global (UPSERT)
                    c.execute("""INSERT INTO contacts_agenda 
                               (name, phone, email, instagram, facebook, linkedin, 
                                dni, address, cbu, alias, bank, branch,
                                last_channel, origin, group_name, metadata, company_id) 
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                               ON CONFLICT(phone) DO UPDATE SET 
                               name=excluded.name, email=excluded.email, 
                               instagram=excluded.instagram, facebook=excluded.facebook, linkedin=excluded.linkedin,
                               dni=excluded.dni, address=excluded.address, cbu=excluded.cbu, alias=excluded.alias,
                               bank=excluded.bank, branch=excluded.branch,
                               group_name=excluded.group_name, metadata=excluded.metadata,
                               company_id=excluded.company_id""", 
                               (contact.get('name'), contact.get('phone'), contact.get('email'),
                                contact.get('instagram'), contact.get('facebook'), contact.get('linkedin'),
                                contact.get('dni'), contact.get('address'), contact.get('cbu'),
                                contact.get('alias'), contact.get('bank'), contact.get('branch'),
                                'CAMPAIGN', 'MKT_IMPORT', 'CLIENTES', str(contact.get('metadata')), comp_id))
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

        if action == 'delete_instance':
            try:
                inst_name = data.get('instance')
                c.execute("DELETE FROM connections WHERE instance=?", (inst_name,))
                conn.commit()
                current_api_key = os.getenv("AUTHENTICATION_API_KEY", EVO_API_KEY)
                requests.delete(f"{EVO_URL}/instance/delete/{inst_name}", headers={"apikey": current_api_key}, timeout=5)
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
            if comp_id:
                paths.extend([os.path.join(CONFIG_DIR, f"company_{comp_id}", "configs", fname), os.path.join(CONFIG_DIR, f"company_{comp_id}", "knowledge", fname), os.path.join(CONFIG_DIR, f"company_{comp_id}", fname)])
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
        count_s = c.fetchone()[0]
        c.execute("SELECT COUNT(*) FROM tickets WHERE status NOT IN ('closed', 'delivered', 'cancelled') AND company_id=?", (comp_id,))
        count_t = c.fetchone()[0]
        pending_count = count_s + count_t
    else:
        c.execute("SELECT COUNT(*) FROM sessions WHERE pending_handoff=1")
        count_s = c.fetchone()[0]
        c.execute("SELECT COUNT(*) FROM tickets WHERE status NOT IN ('closed', 'delivered', 'cancelled')")
        count_t = c.fetchone()[0]
        pending_count = count_s + count_t

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
    
    if processing_count > 15:
        _send(jid, inst_name, "Tenemos mucho tráfico de mensajes en este momento, por favor espere que en breve se le responderá")

    try:
        logger.info(f" [PROC-START] Hilo iniciado para {phone} en {inst_name}. Body: {body[:30]}")
        # 1. Normalización y Configuración
        inst_name = inst_name.replace("@", "")
        conf_a1, _, _ = cache_get_config(inst_name)
        step = conf_a1.get("step", "STEP_NICO_VENTAS")
        state, manual, cur_name, chan, _, handoff, named, cur_summary = get_session(phone, inst_name)
        logger.info(f" [DEBUG-TRACE] get_session OK. State: {state}")
        
        # --- PAUSA POR TICKET ACTIVO / HANDOFF ---
        try:
            conn_tk = sqlite3.connect(DB_PATH, timeout=5)
            c_tk = conn_tk.cursor()
            c_tk.execute("SELECT id FROM tickets WHERE phone=? AND instance=? AND status NOT IN ('closed', 'delivered', 'cancelled')", (phone, inst_name))
            active_tk = c_tk.fetchone()
            conn_tk.close()
        except Exception as e:
            logger.error(f"[TK-CHK] {e}")
            active_tk = None

        if active_tk or handoff == 1 or manual == 1:
            logger.info(f" [PROC] IA Pausada para {phone} (Ticket activo: {bool(active_tk)} / Handoff: {handoff} / Manual: {manual})")
            processing_count -= 1
            return

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

            # Fallback a global
            company_id = None
            try:
                conn_tmp = sqlite3.connect(DB_PATH, timeout=5)
                c_tmp = conn_tmp.cursor()
                c_tmp.execute("SELECT company_id FROM connections WHERE instance=?", (inst_name,))
                row_tmp = c_tmp.fetchone()
                if row_tmp: company_id = row_tmp[0]
                conn_tmp.close()
            except: pass

            if company_id:
                conf_c = os.path.join(CONFIG_DIR, f"company_{company_id}", "configs")
                if not os.path.exists(pricing_p) and os.path.exists(os.path.join(conf_c, "pricing.json")): pricing_p = os.path.join(conf_c, "pricing.json")
                if not os.path.exists(logistics_p) and os.path.exists(os.path.join(conf_c, "logistics.json")): logistics_p = os.path.join(conf_c, "logistics.json")
                if not os.path.exists(catalog_p) and os.path.exists(os.path.join(conf_c, "media_catalog.json")): catalog_p = os.path.join(conf_c, "media_catalog.json")

            ia_prompt = conf_a1.get("ia_prompt", "Eres un experto en Nico Ventas.")
            kn = cache_get_knowledge(inst_name)
            if kn:
                ia_prompt += f"\n\n--- BASE DE CONOCIMIENTO (LEER ESTRICTAMENTE) ---\n{kn}\n-----------------------------------\n"
            try:
                if os.path.exists(pricing_p):
                    pr_data = json.load(open(pricing_p, "r", encoding="utf-8"))
                    items_list = []
                    if isinstance(pr_data, dict) and "data" in pr_data:
                        data_content = pr_data["data"]
                        if isinstance(data_content, dict):
                            # Buscar cualquier clave que contenga una lista (ej: "breeds", "products", "items")
                            for key_val, val_val in data_content.items():
                                if isinstance(val_val, list):
                                    items_list = val_val
                                    break
                    elif isinstance(pr_data, dict):
                        # Formato legacy plano (key: value_dict)
                        for k, v in pr_data.items():
                            p_val = _extract_price_generic(v)
                            items_list.append({"name": k, "price": p_val})

                    if items_list:
                        pricing_txt = "\n".join([f"- {b.get('name')}: ${b.get('price'):,}" for b in items_list if isinstance(b, dict) and b.get('name') and b.get('price')])
                        ia_prompt += f"\n\n--- CATÁLOGO OFICIAL DE PRECIOS (LEER ESTRICTAMENTE) ---\n{pricing_txt}\n-----------------------------------\n"
            except Exception as pr_err:
                logger.error(f"[INJECT-PRICING ERROR] {pr_err}")

            try:
                if os.path.exists(logistics_p):
                    lg_data = json.load(open(logistics_p, "r", encoding="utf-8"))
                    ia_prompt += f"\n\n--- LOGÍSTICA Y VENTAS (LEER ESTRICTAMENTE) ---\n{json.dumps(lg_data, ensure_ascii=False, indent=2)}\n-----------------------------------\n"
            except Exception as lg_err:
                logger.error(f"[INJECT-LOGISTICS ERROR] {lg_err}")

            try:
                media_cat_p = os.path.join(CONFIG_DIR, inst_name, "configs", "media_catalog.json")
                if not os.path.exists(media_cat_p) and company_id:
                    media_cat_p = os.path.join(CONFIG_DIR, f"company_{company_id}", "configs", "media_catalog.json")
                
                if os.path.exists(media_cat_p):
                    cat_data = json.load(open(media_cat_p, "r", encoding="utf-8"))
                    if "data" in cat_data:
                        cat_txt = ""
                        for rz, rz_data in cat_data["data"].items():
                            m_list = rz_data.get("media", [])[:3] # max 3 files per breed
                            if m_list:
                                cat_txt += f"RAZA: {rz} -> ARCHIVOS: {', '.join(m_list)}\n"
                        ia_prompt += f"\n\n--- CATLOGO MULTIMEDIA DISPONIBLE (FOTOS Y PDFS) ---\nSI EL CLIENTE PIDE UNA FOTO O PDF, Y EXISTE EN ESTE CATLOGO, DEBES DEVOLVER AL FINAL DE TU RESPUESTA EL COMANDO EXACTO: __MULTIMEDIA__: <nombre_del_archivo>\n\nArchivos disponibles:\n{cat_txt}\n-----------------------------------\n"
            except Exception as cat_err:
                logger.error(f"[INJECT-CATALOG ERROR] {cat_err}")

            logger.info(f" [DEBUG-TRACE] Paths and prompt OK")

            # Cargar flujo activo
            active_flow_p = os.path.join(CONFIG_DIR, inst_name, "configs", "active_flow.json")
            if not os.path.exists(active_flow_p) and company_id:
                active_flow_p = os.path.join(CONFIG_DIR, f"company_{company_id}", "configs", "active_flow.json")
            
            flow_name = "default"
            if os.path.exists(active_flow_p):
                try: flow_name = json.load(open(active_flow_p, "r", encoding="utf-8")).get("name", "default")
                except: pass
            
            flow_p = os.path.join(os.path.dirname(__file__), "flows", str(company_id), f"{flow_name}.flu")
            
            flow_data = None
            try: flow_data = json.load(open(flow_p, "r", encoding="utf-8"))
            except Exception as fe: logger.error(f"[FLOW] Error loading flow: {fe}")

            if not flow_data or "nodes" not in flow_data:
                # No flow: generic Ollama fallback
                res = query_ollama(body, ia_prompt, inst_name)
                _send(jid, inst_name, res)
                processing_count -= 1; return

            nodes = {n['id']: n for n in flow_data.get('nodes', [])}
            edges = flow_data.get('edges', [])
            next_node_map = {e['source']: e['target'] for e in edges}
            targets = {e['target'] for e in edges}
            first_node_id = next((n['id'] for n in flow_data.get('nodes', []) if n['id'] not in targets), None)
            if not first_node_id and flow_data.get('nodes'): first_node_id = flow_data['nodes'][0]['id']
            if not state or state not in nodes:
                new_state = first_node_id
                state = None
            else:
                new_state = state

            # Eliminado overwrite incondicional de rutas
            session_ctx = cur_summary if cur_summary else ""

            def _fuzzy_find_media(articulo):
                name_clean = articulo.lower().replace(" ", "-").replace("_", "-")
                search_dirs = [
                    os.path.join(CONFIG_DIR, inst_name, "media"),
                    os.path.join(CONFIG_DIR, f"company_{company_id}", "knowledge", "extracted"),
                    os.path.join(CONFIG_DIR, f"company_{company_id}", "media"),
                ]
                logger.info(f" [FUZZY-FIND] Buscando media para: '{articulo}' (normalizado: '{name_clean}')")
                scored_files = []
                seen_paths = set()

                # ---- PASS 1: search via manifest.json context field ----
                for d in search_dirs:
                    manifest_path = os.path.join(d, "manifest.json")
                    if not os.path.exists(manifest_path):
                        continue
                    try:
                        manifest_data = json.load(open(manifest_path, "r", encoding="utf-8"))
                    except Exception:
                        continue
                    articulo_lower = articulo.lower()
                    name_clean_lower = name_clean.replace("-", " ")
                    for entry in manifest_data:
                        ctx = (entry.get("context") or "").lower()
                        summ = (entry.get("summary") or "").lower()
                        combined = ctx + " " + summ
                        if not combined.strip():
                            continue
                        # Exact breed match
                        score = 0
                        if articulo_lower in combined:
                            score = 20
                        elif name_clean_lower in combined:
                            score = 15
                        else:
                            # Partial word match
                            words = [w for w in articulo_lower.split() if len(w) > 3]
                            score = sum(2 for w in words if w in combined)
                        if score > 0:
                            fname = entry.get("name", "")
                            fp = os.path.join(d, fname)
                            if os.path.exists(fp) and fp not in seen_paths:
                                # Prefer images and videos over PDFs in this pass
                                if fname.lower().endswith(('.jpg', '.jpeg', '.png', '.mp4')):
                                    scored_files.append((score + 5, fp))
                                else:
                                    scored_files.append((score, fp))
                                seen_paths.add(fp)
                                logger.info(f" [FUZZY-FIND] Manifest match: {fname} (score={score}, ctx='{ctx[:40]}')")

                # ---- PASS 2: fallback - search by filename keywords ----
                for d in search_dirs:
                    if not os.path.exists(d):
                        continue
                    for f in os.listdir(d):
                        if f == "manifest.json":
                            continue
                        fname = f.lower().replace(" ", "-").replace("_", "-")
                        words = [w for w in name_clean.split("-") if len(w) > 3]
                        match_count = sum(1 for w in words if w in fname)
                        if name_clean in fname:
                            match_count += 10
                        if match_count > 0:
                            fp = os.path.join(d, f)
                            if fp not in seen_paths:
                                scored_files.append((match_count, fp))
                                seen_paths.add(fp)
                                logger.info(f" [FUZZY-FIND] Filename match: {f} (score={match_count})")

                scored_files.sort(key=lambda x: x[0], reverse=True)
                logger.info(f" [FUZZY-FIND] Total encontrados: {len(scored_files)} archivos")
                return [x[1] for x in scored_files]


            def _get_shipping_generic(q):
                if not os.path.exists(logistics_p): return None, None
                try:
                    lg_raw = json.load(open(logistics_p, "r", encoding="utf-8"))
                    
                    # 1. Limpieza inicial de la consulta para aislar la localidad
                    q_clean = re.sub(r'[¿?¡!\(\)]', '', q).lower().strip()
                    for phrase in ["cuanto cuesta el envio", "cuánto cuesta el envío", "cuanto sale", "cuánto sale", "el envio", "el envío", "costo", "precio"]:
                        q_clean = q_clean.replace(phrase, "")
                    q_clean = q_clean.strip()

                    zones_list = lg_raw.get("data", {}).get("shipping_zones", [])
                    
                    # 2. Búsqueda exacta / substring rápida (evita alucinar con Ollama en casos obvios)
                    for z in zones_list:
                        zn = z.get("zone", "").lower()
                        if q_clean == zn or q_clean in zn or zn in q_clean:
                            return int(z.get("cost", 0)), z.get("zone", "").upper()
                    
                    # Búsqueda substring rápida secundaria
                    for z in zones_list:
                        zn = z.get("zone", "").lower()
                        if len(q_clean) > 2 and q_clean in zn:
                            return int(z.get("cost", 0)), z.get("zone", "").upper()

                    # 3. Fallback semántico con Ollama usando TODAS las zonas
                    zone_names = [z.get("zone") for z in zones_list if z.get("zone")]
                    zones_info = json.dumps(zone_names)
                    prompt = (
                        f"Nuestras zonas de entrega disponibles son: {zones_info}. "
                        f"El cliente indicó como ubicación: '{q}'. "
                        "¿A qué zona de la lista pertenece esta localidad? "
                        "Ejemplos: 'Libertad' o 'Merlo' o 'Castelar' pertenecen a 'GBA'. 'Monserrat' pertenece a 'CABA'. "
                        "Si la ciudad se menciona exactamente en la lista, elige esa. "
                        "Responde SOLO con el nombre exacto de la zona tal como aparece en la lista. No agregues nada más. "
                        "Si no pertenece a ninguna, responde 'Ninguno'."
                    )
                    res = query_ollama(prompt, "Buscador de Zonas", inst_name)
                    res_clean = res.strip().strip("'\"").strip()
                    
                    for z in zones_list:
                        if z.get("zone", "").lower() == res_clean.lower():
                            logger.info(f" [SHIPPING-EXTRACT] Zona detectada por Ollama fallback: '{z.get('zone')}'")
                            return int(z.get("cost", 0)), z.get("zone", "").upper()

                    # Fallback secundario analizando texto de forma genérica
                    res_upper = res.upper()
                    q_upper = q.upper()
                    
                    for mz in sorted(main_zones, key=lambda x: x.get("cost", 0), reverse=True):
                        cost_val = mz.get("cost")
                        cost_str = str(cost_val) if cost_val is not None else ""
                        zone_name = mz.get("zone", "")
                        zone_upper = zone_name.upper()
                        # Buscar si el costo o el nombre de la zona (o sus palabras clave) aparecen en la respuesta de Ollama
                        words = [w for w in re.split(r'[^A-Z0-9]', zone_upper) if len(w) > 3 and w not in ["PROVINCIA", "OTRAS"]]
                        if cost_str and cost_str in res_upper:
                            if not words or any(w in res_upper or w in q_upper for w in words):
                                return int(cost_val), zone_upper
                        if any(w in res_upper for w in words) if words else False:
                            return int(cost_val), zone_upper

                except Exception as e:
                    logger.error(f"[SHIPPING LOGISTICS ERROR] {e}")
                return None, None

            def _ia_should_advance(cur_n, nxt_n, body_):
                nodo_a = cur_n.get('name', 'actual')
                nodo_s = nxt_n.get('name', 'siguiente') if nxt_n else 'fin'
                msgs = cache_get_history(phone, inst_name, limit=4)
                hist = " | ".join([str(m.get('role','')) + ": " + str(m.get('content',''))[:50] for m in msgs])
                prompt = (
                    f"[FLUJO] Nodo actual: {nodo_a}. Nodo siguiente: {nodo_s}. "
                    f"Historial reciente: {hist}. Último mensaje del cliente: {body_}. "
                    "[TAREA] Analiza si el último mensaje del cliente RESPONDE adecuadamente a lo que el bot le pidió en el nodo actual. "
                    "Si el bot le pidió una raza y el cliente solo dice 'Sí', es incompleto (debe decir ESPERAR). "
                    "Si el cliente proporcionó la información requerida de forma clara (por ejemplo la raza que busca) y se puede avanzar, responde AVANZAR. MUY IMPORTANTE: Si ya indicó la raza que quiere, debes responder AVANZAR INCLUSO SI hace otras preguntas al mismo tiempo (ej: 'Quiero el caniche rojo, pasame fotos y como trabajan' -> AVANZAR). "
                    "Responde SOLO con una palabra: AVANZAR o ESPERAR."
                )
                try:
                    d = query_ollama(prompt, "Coordinador de flujo estricto. Solo respondes AVANZAR o ESPERAR.", inst_name)
                    return "AVANZAR" in d.upper()
                except:
                    return False

            def _resolve_file(filename):
                for dp in [
                    os.path.join(CONFIG_DIR, inst_name, "media", filename),
                    os.path.join(CONFIG_DIR, f"company_{company_id}", "knowledge", "general", filename),
                    os.path.join(CONFIG_DIR, f"company_{company_id}", "media", filename),
                    os.path.join(MEDIA_LIB_DIR, inst_name, filename),
                ]:
                    if os.path.exists(dp): return dp
                return None

            current_node = nodes.get(state) if state else None
            # new_state is already set above

            if current_node:
                ntype = current_node['type']
                ndata = current_node.get('data', {})

                if ntype == 'identity':
                    if "CONFIRMING:" not in session_ctx:
                        name_clean = body.replace("[NOTA DE VOZ]:", "").replace("me llamo", "").replace("soy", "").strip().title()
                        update_session(phone, inst_name, summary="CONFIRMING:" + name_clean, name=name_clean)
                        _send(jid, inst_name, "Gracias " + name_clean + ", es correcto? (SI/NO)")
                        processing_count -= 1; return
                    else:
                        name_stored = session_ctx.replace("CONFIRMING:", "").strip()
                        if any(x in body.upper() for x in ["SI", "OK", "CORRECTO", "DALE", "CLARO"]):
                            new_state = next_node_map.get(state)
                            update_session(phone, inst_name, summary="", name=name_stored)
                        else:
                            update_session(phone, inst_name, summary="")
                            _send(jid, inst_name, "Por favor, decime tu nombre nuevamente.")
                            processing_count -= 1; return

                elif ntype == 'rag':
                    history_data = cache_get_history(phone, inst_name, limit=8)

                    # --- INTERCEPCIÓN TEMPRANA KERNEL IA ---
                    try:
                        from ia_kernel import ia_kernel
                        kernel_resp = ia_kernel.get_response(body, ia_prompt, history=history_data)
                        if kernel_resp and kernel_resp.get("source") == "LOCAL_RULE_CATALOG":
                            _send(jid, inst_name, kernel_resp["text"])
                            try: cache_add_message(phone, inst_name, 'assistant', kernel_resp["text"])
                            except: pass
                            processing_count -= 1; return
                    except Exception as e:
                        logger.error(f"[KERNEL EARLY ERROR] {e}")
                    # --- FIN INTERCEPCIÓN ---

                    # --- EXTRACCIÓN DE ARTÍCULO DIRECTO DESDE PRICING.JSON ---
                    articulo_detectado = None
                    precio_v = None
                    list_key = "items"
                    try:
                        if os.path.exists(pricing_p):
                            pr_data = json.load(open(pricing_p, "r", encoding="utf-8"))
                            catalog_items = []
                            if isinstance(pr_data, dict) and "data" in pr_data:
                                data_content = pr_data["data"]
                                if isinstance(data_content, dict):
                                    for key_val, val_val in data_content.items():
                                        if isinstance(val_val, list):
                                            catalog_items = [b.get("name", "") for b in val_val if isinstance(b, dict) and "name" in b]
                                            list_key = key_val
                                            break
                            elif isinstance(pr_data, dict):
                                catalog_items = list(pr_data.keys())
                            
                            # Reemplazado por detección optimizada en ia_kernel
                            from ia_kernel import ia_kernel
                            # Buscar en el mensaje del usuario
                            b_match = ia_kernel.find_breed_by_query(body)
                            if b_match:
                                articulo_detectado = b_match.get("name")
                                logger.info(f" [ITEM-EXTRACT] Match ia_kernel: '{articulo_detectado}'")
                            else:
                                # Si no lo nombró ahora, quizás ya lo eligió antes
                                m_raza = re.search(r'RAZA:([^|]+)', session_ctx)
                                if m_raza:
                                    articulo_detectado = m_raza.group(1)
                                    logger.info(f" [ITEM-EXTRACT] Raza recuperada de sesión: '{articulo_detectado}'")
                                else:
                                    # Fallback a Ollama si no hay match directo ni en sesión
                                    best_match = None
                                    best_score = 0
                                    body_lower = body.lower()
                                    for item in catalog_items:
                                        item_words = [w for w in item.lower().split() if len(w) > 2]
                                        if not item_words: continue
                                        score = sum(1 for w in item_words if w in body_lower)
                                        req_score = 1 if len(item_words) == 1 else 2
                                        if score >= req_score and score > best_score:
                                            best_score = score
                                            best_match = item
                                    if best_match:
                                        articulo_detectado = best_match
                                        logger.info(f" [ITEM-EXTRACT] Artículo detectado por puntuación: '{articulo_detectado}' (score={best_score})")
                            
                            # 3. Fallback semántico con Ollama usando el historial reciente
                            if not articulo_detectado:
                                hist_text = ""
                                if history_data:
                                    for h in history_data[-3:]:
                                        role_name = "Cliente" if h.get("role") == "user" else "IA"
                                        hist_text += f"{role_name}: {h.get('content')}\n"
                                hist_text += f"Cliente: {body}"
                                
                                prompt_fallback = (
                                    f"Nuestro catálogo tiene estos artículos: {json.dumps(catalog_items)}. "
                                    f"Aquí está el final de la conversación:\n{hist_text}\n"
                                    "¿A cuál de los artículos del catálogo se refiere el cliente exactamente? "
                                    "Responde SOLO con el nombre exacto del artículo tal como aparece en la lista, sin nada más. "
                                    "Si no está claro o no se refiere a ninguno de los listados, responde 'Ninguno'."
                                )
                                res = query_ollama(prompt_fallback, "Extractor de Catálogo", inst_name)
                                res_clean = res.strip().strip("'\"").strip()
                                if res_clean in catalog_items:
                                    articulo_detectado = res_clean
                                    logger.info(f" [ITEM-EXTRACT] Artículo detectado por Ollama fallback: '{articulo_detectado}'")
                            # Extraer el precio oficial del artículo
                            if articulo_detectado:
                                if isinstance(pr_data, dict) and "data" in pr_data:
                                    # Buscar en la lista dinámica
                                    items_list = []
                                    if isinstance(pr_data["data"], dict):
                                        for key_val, val_val in pr_data["data"].items():
                                            if isinstance(val_val, list):
                                                items_list = val_val
                                                break
                                    for b in items_list:
                                        if isinstance(b, dict) and b.get("name", "").lower() == articulo_detectado.lower():
                                            precio_v = _extract_price_generic(b, body)
                                            break
                                elif isinstance(pr_data, dict):
                                    b_info = pr_data.get(articulo_detectado, {})
                                    precio_v = _extract_price_generic(b_info, body)
                    except Exception as re_err:
                        logger.error(f"[ITEM-EXTRACT ERROR] {re_err}")

                    # --- PROCESAMIENTO Y GENERACIÓN DE RESPUESTA ---
                    if articulo_detectado:
                        precio_str = f"${precio_v:,}" if precio_v else "el oficial de catálogo"
                        term_item = "artículo"
                        term_plural = "unidades"
                        if list_key == "breeds":
                            term_item = "variedad/raza"
                            term_plural = "ejemplares"
                        elif list_key == "products":
                            term_item = "producto"
                            term_plural = "unidades"
                        
                        if "FOTOS_OFRECIDAS:" not in session_ctx:
                            prompt_especifico = (
                                f"{ia_prompt}\n\n"
                                f"REGLA ESTRICTA DE VENTAS (PASO 1):\n"
                                f"El cliente ha elegido {term_item} '{articulo_detectado}'. El precio oficial es {precio_str}.\n"
                                f"1. Confirma el precio de manera amigable.\n"
                                f"2. Da información atractiva sobre la raza (contextura, peso aproximado, humor, etc.).\n"
                                f"3. FINALIZA OBLIGATORIAMENTE preguntando exactamente: '¿Te gustaría ver fotos y videos de los cachorritos disponibles?'\n"
                                f"IMPORTANTE: NO expliques formas de pago ni envíos en este paso."
                            )
                            # Marcar fotos ofrecidas
                            session_ctx_new = session_ctx
                            if "RAZA:" not in session_ctx: session_ctx_new += f"|RAZA:{articulo_detectado}"
                            session_ctx_new += "|FOTOS_OFRECIDAS:SI"
                            session_ctx = session_ctx_new
                            update_session(phone, inst_name, summary=session_ctx)
                        elif "PAGO_OFRECIDO:SI" not in session_ctx:
                            # Detectar si el cliente aceptó (heurística simple)
                            if any(w in body.lower() for w in ["si", "sí", "claro", "dale", "ok", "obvio", "bueno", "mandame", "quiero", "por favor", "sisi"]):
                                medios = _fuzzy_find_media(articulo_detectado)
                                if medios:
                                    logger.info(f" [VENTAS] Enviando {len(medios)} archivos multimedia para {articulo_detectado}")
                                    for m_path in medios[:4]: 
                                        _send_media(jid, inst_name, m_path)
                                        time.sleep(1) # Pequeña pausa entre envíos
                            
                            prompt_especifico = (
                                f"{ia_prompt}\n\n"
                                f"REGLA ESTRICTA DE VENTAS (PASO 2):\n"
                                f"El cliente acaba de responder a tu pregunta sobre enviar fotos de {term_item} '{articulo_detectado}'.\n"
                                f"Si el cliente ACEPTA o muestra interés:\n"
                                f"  1. Indícale amigablemente que le acabas de adjuntar arriba las fotos y videos al chat.\n"
                                f"  2. Aprovecha y explícale nuestras Formas de Pago y cómo trabajamos (Logística/Envíos) para que lo vaya teniendo en cuenta.\n"
                                f"  3. FINALIZA preguntando: '¿Te interesaría avanzar con la adopción?'\n"
                                f"Si el cliente RECHAZA:\n"
                                f"  1. Agradécele amablemente y pregúntale si hay otra raza que le interese del catálogo."
                            )
                            # Marcar pago ofrecido
                            session_ctx_new = session_ctx + "|PAGO_OFRECIDO:SI"
                            session_ctx = session_ctx_new
                            update_session(phone, inst_name, summary=session_ctx)
                            
                        else:
                            if any(w in body.lower() for w in ["si", "s", "claro", "dale", "ok", "obvio", "bueno", "mandame", "quiero", "por favor", "sisi", "avanzar"]):
                                # El usuario aceptó la adopción, avanzar al siguiente nodo
                                new_state = next_node_map.get(state)
                                # Guardar la raza y precio en el contexto antes de avanzar
                                session_ctx_new = session_ctx
                                if "RAZA:" not in session_ctx:
                                    session_ctx_new = session_ctx + f"|RAZA:{articulo_detectado}"
                                if precio_v and "PRECIO:" not in session_ctx_new:
                                    session_ctx_new += f"|PRECIO:{precio_v}"
                                session_ctx = session_ctx_new
                                update_session(phone, inst_name, summary=session_ctx)
                                pass
                            else:
                                prompt_especifico = f"{ia_prompt}\n\nEl cliente tiene dudas sobre avanzar con la adopción. Responde a sus preguntas y se persuasivo pero amable."
                                res = query_ollama(body, prompt_especifico, inst_name, history=history_data)
                                _send(jid, inst_name, res)
                                try: cache_add_message(phone, inst_name, 'assistant', res)
                                except: pass

                                # Guardar la raza y precio en el contexto
                                session_ctx_new = session_ctx
                                if "RAZA:" not in session_ctx:
                                    session_ctx_new = session_ctx + f"|RAZA:{articulo_detectado}"
                                if precio_v and "PRECIO:" not in session_ctx_new:
                                    session_ctx_new += f"|PRECIO:{precio_v}"
                                session_ctx = session_ctx_new
                                update_session(phone, inst_name, summary=session_ctx)
                                processing_count -= 1; return
                        
                        if new_state == state:
                            res = query_ollama(body, prompt_especifico, inst_name, history=history_data)
                            _send(jid, inst_name, res)
                            try: cache_add_message(phone, inst_name, 'assistant', res)
                            except: pass
                            processing_count -= 1; return

                    else:
                        # Si no hay artículo detectado, dejamos que el LLM responda naturalmente
                        if kernel_resp and kernel_resp.get("text"):
                            _send(jid, inst_name, kernel_resp["text"])
                            try: cache_add_message(phone, inst_name, 'assistant', kernel_resp["text"])
                            except: pass
                        else:
                            # Fallback extremo si kernel_resp falló
                            res = query_ollama(body, ia_prompt, inst_name, history=history_data)
                            _send(jid, inst_name, res)
                            try: cache_add_message(phone, inst_name, 'assistant', res)
                            except: pass
                        
                        # No avanzamos de estado, esperamos que elija un número
                        processing_count -= 1; return

                elif ntype == 'calculator':
                    ask_text = ndata.get('ask_text', 'En que zona seria la entrega?')
                    confirm_tpl = ndata.get('confirm_text', 'Envio a {zona}: ${costo}. Total: ${total}. Confirmamos?')
                    if "CALC_WAITING" not in session_ctx and "CALC_ZONA:" not in session_ctx:
                        update_session(phone, inst_name, summary=session_ctx + "|CALC_WAITING")
                        _send(jid, inst_name, ask_text)
                        processing_count -= 1; return
                    elif "CALC_WAITING" in session_ctx:
                        costo, zona_encontrada = _get_shipping_generic(body)
                        precio_art = 0
                        pm = re.search(r'PRECIO:(\d+)', session_ctx)
                        if pm: precio_art = int(pm.group(1))
                        if costo is None:
                            if "CANCELAR" in body.upper() or "OTRA" in body.upper():
                                update_session(phone, inst_name, summary=session_ctx.replace("|CALC_WAITING", ""))
                                _send(jid, inst_name, "Cálculo cancelado. ¿En qué más te puedo ayudar?")
                                new_state = first_node_id
                            else:
                                _send(jid, inst_name, "No logré identificar tu zona exacta. Por favor, indícame tu ciudad o provincia para poder calcular el costo de envío. (O escribe 'cancelar')")
                                processing_count -= 1; return
                        # Zona con costo por KM: enviar PDF de traslados + pedir ciudad exacta
                        elif costo > 0 and costo < 5000:  # Costo por km (no monto fijo)
                            # Buscar PDF de traslados para la zona
                            traslado_pdf = None
                            zona_encontrada_str = body.upper()
                            for pdf_name in ["Traslados Buenos Aires.pdf", "Traslados Provincia de Santa Fe.pdf", "Traslados Provincia Entre Rios.pdf"]:
                                tp = _resolve_file(pdf_name)
                                if tp:
                                    # Enviar el PDF de la provincia correspondiente
                                    _send_media(jid, inst_name, tp)
                                    traslado_pdf = tp
                                    break
                            _send(jid, inst_name, f"El envío a tu zona tiene un costo de ${costo} por km recorrido desde origen. Para darte el precio exacto, ¿podés indicarme la ciudad o localidad exacta?")
                            update_session(phone, inst_name, summary=session_ctx.replace("|CALC_WAITING", f"|CALC_WAITING_CITY:{body}"))
                            processing_count -= 1; return
                        else:
                            total = precio_art + costo
                            costo_str = "Sin cargo" if costo == 0 else "$" + f"{costo:,}"
                            msg = confirm_tpl.replace("{zona}", body.upper()).replace("{costo}", costo_str).replace("{total}", "$" + f"{total:,}")
                            update_session(phone, inst_name, summary=session_ctx.replace("|CALC_WAITING", "|CALC_ZONA:" + body + "|TOTAL:" + str(total)))
                            _send(jid, inst_name, msg)
                            new_state = next_node_map.get(state)
                    else:
                        new_state = next_node_map.get(state)

                elif ntype == 'ticket':
                    if "WAITING_DATA" not in session_ctx:
                        if is_multimedia or any(x in body.upper() for x in ["COMPROBANTE", "LISTO", "ENVIADO", "PAGO", "TRANSFE"]):
                            # --- VERIFICACIÓN OCR DE COMPROBANTE DE PAGO ($50.000 ARS) ---
                            def validar_monto_comprobante(body_text):
                                if not body_text: return False, "Imagen o texto sin contenido"
                                text_upper = str(body_text).upper()
                                import re
                                has_50k = bool(re.search(r'50[\.\s,]?000|50000', text_upper))
                                clean_digits = re.sub(r'[^0-9]', ' ', text_upper)
                                has_large_num = False
                                for tok in clean_digits.split():
                                    if tok.isdigit() and int(tok) >= 50000:
                                        has_large_num = True
                                        break
                                is_valid_amount = has_50k or has_large_num
                                payment_keywords = ["COMPROBANTE", "TRANSFERENCIA", "EXITOSA", "EXITO", "PAGO", "MONTO", "OPERACION", "DETALLE", "MERCADOPAGO", "MERCADO PAGO", "BANCO", "CVU", "CBU", "ALIAS", "ENVIADO", "SEÑA", "RESERVA", "MULTIMEDIA"]
                                has_keyword = any(kw in text_upper for kw in payment_keywords)
                                if is_valid_amount and has_keyword:
                                    return True, "Comprobante verificado con éxito"
                                return False, "El comprobante enviado no muestra el monto requerido de la seña ($50.000 ARS) o la imagen no es un comprobante de transferencia válido."

                            is_valid, reason = validar_monto_comprobante(body)
                            logger.info(f" [VALIDAR-COMPROBANTE] body='{body}' -> is_valid={is_valid}, reason='{reason}'")
                            if is_valid:
                                datos = "¡Comprobante de $50.000 verificado con éxito! 📄✅\n\nPor favor, completame estos datos para coordinar el envío:"
                                try:
                                    datos_file = ndata.get('file', 'datos.txt')
                                    dp = _resolve_file(datos_file)
                                    if dp: datos = "¡Comprobante de $50.000 verificado con éxito! OK\n\n" + open(dp, encoding="utf-8").read()
                                except: pass
                                _send(jid, inst_name, datos)
                                cuidados = _resolve_file("envios_y_cuidados.pdf") or _resolve_file("cuidados.pdf")
                                if not cuidados:
                                    try:
                                        gen_dir = os.path.join(CONFIG_DIR, f"company_{company_id}", "knowledge", "general")
                                        if os.path.exists(gen_dir):
                                            for gf in os.listdir(gen_dir):
                                                if "cuidados" in gf.lower() or "envio" in gf.lower():
                                                    cuidados = os.path.join(gen_dir, gf); break
                                    except Exception as list_err:
                                        logger.error(f"[CUIDADOS PATH ERROR] {list_err}")
                                if cuidados and os.path.exists(cuidados): _send_media(jid, inst_name, cuidados)
                                update_session(phone, inst_name, summary=session_ctx + "|WAITING_DATA")
                                processing_count -= 1; return
                            else:
                                _send(jid, inst_name, f"❌ No pudimos verificar la seña en la imagen enviada.\n\n{reason}\n\nPor favor, enviá una captura clara de la transferencia realizada por $50.000 donde se vean el monto, la fecha y los datos de la cuenta.")
                                processing_count -= 1; return
                        else:
                            _send(jid, inst_name, "Aguardando la captura del comprobante de transferencia por $50.000...")
                            processing_count -= 1; return
                    else:
                        # Estábamos esperando los datos del cliente, los guardamos en el contexto
                        # y avanzamos al nodo de aprobación/creación de ticket
                        session_ctx_new = session_ctx.replace("|WAITING_DATA", "") + f"|CLIENT_DATA:{body}"
                        update_session(phone, inst_name, summary=session_ctx_new)
                        session_ctx = session_ctx_new
                        new_state = next_node_map.get(state)

                elif ntype == 'approval':
                    _send(jid, inst_name, "Tu pedido está registrado y está siendo procesado por un asesor humano. Te avisamos en breve!")
                    processing_count -= 1; return

            # ENTRY ACTIONS: ejecutar nodos encadenados automaticos
            while new_state and new_state != state:
                state = new_state
                current_node = nodes.get(state)
                if not current_node: break
                ntype = current_node['type']
                ndata = current_node.get('data', {})

                if ntype == 'message':
                    text = ndata.get('text', '')
                    if text: _send(jid, inst_name, text)
                    new_state = next_node_map.get(state)

                elif ntype == 'file_send':
                    if ndata.get('dynamic'):
                        articulo = ""
                        for pat in ['RAZA:([^|]+)', 'ARTICULO:([^|]+)']:
                            pm = re.search(pat, session_ctx)
                            if pm: articulo = pm.group(1).strip(); break
                        if articulo:
                            general_img = os.path.join(CONFIG_DIR, f"company_{company_id}", "knowledge", "extracted", "IMG-20260423-WA0021.jpg")
                            if os.path.exists(general_img): _send_media(jid, inst_name, general_img)
                            medios = _fuzzy_find_media(articulo)
                            if medios:
                                for m_path in medios[:4]: _send_media(jid, inst_name, m_path)
                            else:
                                fb = ndata.get('fallback_text', 'No tenemos fotos de ' + articulo + ' aun. Podes subir imagenes desde la Biblioteca de Medios en el Dashboard.')
                                _send(jid, inst_name, fb)
                        else:
                            _send(jid, inst_name, "No pude identificar el articulo para buscar medios.")
                    else:
                        filename = ndata.get('file', '')
                        if filename:
                            fp = _resolve_file(filename)
                            if fp:
                                # Si es .txt, enviar como texto plano en lugar de archivo adjunto
                                if filename.lower().endswith('.txt'):
                                    try:
                                        txt_content = open(fp, encoding='utf-8').read().strip()
                                        if txt_content: _send(jid, inst_name, txt_content)
                                    except Exception as te:
                                        logger.error(f"[FILE-TXT] Error leyendo {fp}: {te}")
                                else:
                                    _send_media(jid, inst_name, fp)
                    text_after = ndata.get('text_after', '')
                    if text_after: _send(jid, inst_name, text_after)
                    new_state = next_node_map.get(state)

                elif ntype == 'approval':
                    # --- ENVÍO DE TICKET A3 AL NÚMERO DE NOTIFICACIÓN ---
                    try:
                        notif_phone = ndata.get('notify_phone', '1136822400')
                        notif_phone_normalized = normalize_argentina_wa_phone(notif_phone)
                        # Extraer datos del contexto
                        nombre_c = cur_name or phone
                        raza_m = re.search(r'RAZA:([^|]+)', session_ctx)
                        articulo_m = re.search(r'ARTICULO:([^|]+)', session_ctx)
                        precio_m = re.search(r'PRECIO:(\d+)', session_ctx)
                        total_m = re.search(r'TOTAL:(\d+)', session_ctx)
                        zona_m = re.search(r'CALC_ZONA:([^|]+)', session_ctx)
                        client_data_m = re.search(r'CLIENT_DATA:([^|]+)', session_ctx)
                        raza_str = raza_m.group(1).strip() if raza_m else (articulo_m.group(1).strip() if articulo_m else 'No especificada')
                        precio_str = f"${int(precio_m.group(1)):,}" if precio_m else 'No especificado'
                        total_str = f"${int(total_m.group(1)):,}" if total_m else precio_str
                        zona_str = zona_m.group(1).strip() if zona_m else 'No especificada'
                        client_data_str = client_data_m.group(1).strip() if client_data_m else 'No proporcionados'
                        
                        # Calcular el costo de logística (Total a pagar - Precio producto)
                        precio_val = int(precio_m.group(1)) if precio_m else 0
                        total_val = int(total_m.group(1)) if total_m else precio_val
                        logistica_val = total_val - precio_val
                        logistica_str = f"${logistica_val:,}" if logistica_val > 0 else ("Sin cargo" if logistica_val == 0 else "No especificado")

                        # Cargar el monto de seña dinámicamente desde pricing.json
                        reservation_fee = 50000  # Valor fallback por defecto
                        try:
                            if os.path.exists(pricing_p):
                                pr_d = json.load(open(pricing_p, "r", encoding="utf-8"))
                                for fee_key in ["reservation_fee", "sena", "seña", "booking_fee", "deposit"]:
                                    if isinstance(pr_d, dict):
                                        if fee_key in pr_d:
                                            reservation_fee = pr_d[fee_key]
                                            break
                                        if "data" in pr_d and isinstance(pr_d["data"], dict) and fee_key in pr_d["data"]:
                                            reservation_fee = pr_d["data"][fee_key]
                                            break
                        except Exception as fee_err:
                            logger.error(f"[TICKET-FEE ERROR] {fee_err}")
                        sena_str = f"${reservation_fee:,}" if isinstance(reservation_fee, (int, float)) else str(reservation_fee)

                        # Resumen IA del chat
                        resumen_ia = ""
                        try:
                            hist_resumen = cache_get_history(phone, inst_name, limit=10)
                            hist_txt = "\n".join([f"{m['role'].upper()}: {m['content'][:100]}" for m in hist_resumen])
                            resumen_ia = query_ollama(hist_txt, "Resume en 3 lineas la conversacion de venta. Solo los datos clave: producto, precio, zona y estado.", inst_name)
                        except: resumen_ia = session_ctx[:200]

                        # --- CREACIÓN DE TICKET EN BASE DE DATOS ---
                        ticket_id = None
                        try:
                            import sqlite3 as _sq3
                            conn_tk = _sq3.connect(DB_PATH, timeout=30)
                            c_tk = conn_tk.cursor()
                            c_tk.execute("INSERT INTO tickets (phone, instance, summary, status, company_id, summary_ia, a3) VALUES (?, ?, ?, 'pending_auth', ?, ?, 1)", 
                                         (phone, inst_name, session_ctx[:500], company_id, resumen_ia))
                            c_tk.execute("UPDATE sessions SET pending_handoff=1 WHERE phone=? AND instance=?", (phone, inst_name))
                            conn_tk.commit()
                            ticket_id = c_tk.lastrowid
                            conn_tk.close()
                            logger.info(f"[TICKET] Creado #{ticket_id} para {phone} y marcado pending_handoff=1")
                        except Exception as e_tk: logger.error(f"[TICKET ERROR] {e_tk}")

                        ticket_num = ticket_id or "N/A"

                        # Generamos los detalles del ticket en el formato exacto de 5 puntos requerido:
                        ticket_details = (
                            f"1- Nro de ticket: #{ticket_num}\n"
                            f"2- Cliente: {nombre_c} (Tel: {phone})\n"
                            f"   Datos: {client_data_str}\n"
                            f"   Producto elegido: {raza_str}\n"
                            f"3- Resumen del chat (por IA):\n{resumen_ia}\n"
                            f"4- Total pagado: {sena_str}\n"
                            f"   Total a pagar: {total_str}\n"
                            f"   Costo de logística: {logistica_str}"
                        )

                        # 5- link al chat con el cliente por whatsapp
                        client_phone_clean = normalize_argentina_wa_phone(phone)
                        import urllib.parse
                        encoded_text = urllib.parse.quote(ticket_details)
                        wa_link = f"https://wa.me/{client_phone_clean}?text={encoded_text}"

                        ticket_msg = (
                            f"{ticket_details}\n"
                            f"5- Link al chat con el cliente por WhatsApp:\n{wa_link}"
                        )

                        # Enviar la notificación al número del administrador
                        _send(f"{notif_phone_normalized}@s.whatsapp.net", inst_name, ticket_msg)
                        logger.info(f"[TICKET-A3] Ticket #{ticket_num} enviado a {notif_phone_normalized}")
                    except Exception as et:
                        logger.error(f"[TICKET-A3 ERROR] {et}")
                    
                    _send(jid, inst_name, "✅ Tu pedido quedó registrado y está pendiente de aprobación. ¡Te avisamos en breve!")
                    break


                elif ntype == 'external_msg':
                    new_state = next_node_map.get(state)

                elif ntype == 'calculator':
                    ask_text = ndata.get('ask_text', 'En que zona seria la entrega?')
                    _send(jid, inst_name, ask_text)
                    update_session(phone, inst_name, summary=session_ctx + "|CALC_WAITING")
                    break

                else:
                    break

            update_session(phone, inst_name, state=state)
            processing_count -= 1; return
    except Exception as e:
        logger.error(f" [!] Error critico en process_ia_async: {e}")
        try:
            import traceback
            open(r"C:\SaaSIA\ai_core\logs\crash.log", "w", encoding="utf-8").write(str(e) + "\n" + traceback.format_exc())
        except: pass
    finally:    processing_count -= 1


def _send(jid, inst, text):
    import re
    media_files = []
    # Interceptar comandos __MULTIMEDIA__: <filename>
    pattern = r"__MULTIMEDIA__:\s*<?([^\n<>]+)>?"
    for match in re.finditer(pattern, text):
        media_files.append(match.group(1).strip())
    
    # Remover los comandos del texto que se enviar al usuario
    clean_text = re.sub(pattern, "", text).strip()
    
    if not clean_text and not media_files:
        return 200
        
    if clean_text:
        text = clean_text
        safe_log = str(text[:50]).encode('ascii', 'replace').decode('ascii')
        logger.info(f" [EVO-SEND] Enviando a {jid} via {inst}: {safe_log}...")
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
    
    # Sandbox Mode (Anti-Ban): Si es un número de stress, NO intentamos enviar a la API real
    if jid.startswith("stress_") or jid.startswith("5491100000") or jid.startswith("1100000"):
        logger.info(f" [STRESS-MOCK / SANDBOX] Saltando envío real a WhatsApp para usuario de prueba {jid} (Prevención de Ban)")
        return 200

    try:
        if platform == "whatsapp":
            r = requests.post(f"{target_url}/message/sendText/{inst}", 
                             headers={"apikey": EVO_API_KEY, "Content-Type": "application/json"}, 
                             json={"number": jid, "text": text}, timeout=15)
            # Fallback para números de Argentina (Bug Baileys 549 vs 54)
            if False:
                jid_alt = "54" + jid[3:]
                requests.post(f"{target_url}/message/sendText/{inst}", 
                             headers={"apikey": EVO_API_KEY, "Content-Type": "application/json"}, 
                             json={"number": jid_alt, "text": text}, timeout=15)
            elif False:
                jid_alt = "549" + jid[2:]
                requests.post(f"{target_url}/message/sendText/{inst}", 
                             headers={"apikey": EVO_API_KEY, "Content-Type": "application/json"}, 
                             json={"number": jid_alt, "text": text}, timeout=15)
        else:
            r = requests.post(f"{target_url}/message/sendText/{inst}", 
                             json={"number": jid, "text": text}, timeout=15)
                             
        if r.status_code not in [200, 201]:
            logger.error(f" [!] Error al enviar a {platform} (HTTP {r.status_code}): {r.text}")
        
    except Exception as e:
        logger.error(f" [!] Error en _send real: {e}")

    # Enviar los archivos multimedia interceptados
    for mfile in media_files:
        mpath = _resolve_file(mfile)
        if mpath:
            _send_media(jid, inst, mpath)
        else:
            logger.warning(f" [EVO-MEDIA] No se encontro el archivo multimedia solicitado: {mfile}")
            
    return 200
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
        logger.info(f" [WEBHOOK-RAW-ANY] Request URL: {request.url}, Data: {request.data}")
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
        conn = sqlite3.connect(DB_PATH, timeout=30)
        conn.execute("PRAGMA busy_timeout = 30000")
        g.db_conn = conn
        c = conn.cursor()
        c.execute("SELECT 1 FROM processed_msgs WHERE msg_id=?", (mid,))
        if c.fetchone(): conn.close(); return "dup", 200
        c.execute("INSERT INTO processed_msgs (msg_id, instance) VALUES (?, ?)", (mid, inst))

        # Guardar en Agenda Global
        name = msg_obj.get('pushName', 'Cliente Nuevo')
        
        # Obtener company_id de la conexión para esta instancia
        c.execute("SELECT company_id FROM connections WHERE instance=?", (inst,))
        row_conn = c.fetchone()
        comp_id = row_conn[0] if row_conn else None

        c.execute("""INSERT INTO contacts_agenda (name, phone, last_channel, origin, group_name, company_id) 
                   VALUES (?, ?, ?, ?, 'CLIENTES', ?)
                   ON CONFLICT(phone) DO UPDATE SET 
                   last_channel=excluded.last_channel,
                   name=CASE WHEN name='Cliente Nuevo' THEN excluded.name ELSE name END,
                   company_id=COALESCE(excluded.company_id, contacts_agenda.company_id)""", 
                   (name, phone, 'WHATSAPP', 'INBOUND_CHAT', comp_id))
        
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
        ia_queue.put((prio, next(queue_counter), {
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
        # Forzar un delete primero para limpiar cualquier sesión fantasma
        logger.info(f" [QR-RESET] Solicitud manual de QR. Limpiando instancia {inst}...")
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

                    conn_upd = sqlite3.connect(DB_PATH, timeout=30)
                    c_upd = conn_upd.cursor()
                    c_upd.execute("INSERT INTO mkt_execution_logs (campaign_id, contact_name, channel, status, message) VALUES (?, ?, ?, ?, ?)", 
                             (camp_id, name, target_channel, status_db, log_msg))
                    c_upd.execute("UPDATE mkt_contacts SET status=?, last_channel=? WHERE id=?", (status_db, target_channel, c_id))
                    conn_upd.commit()
                    conn_upd.close()
                    
                    time.sleep(2) # Evitar baneo/spam
            
        except Exception as e:
            logger.error(f" [MKT-LOOP-ERR] {e}")
            try:
                report_error_to_license_server(f"MKT-LOOP Error: {str(e)}", traceback.format_exc())
            except: pass
        time.sleep(5)

@app.errorhandler(Exception)
def handle_exception(e):
    logger.exception("Unhandled Exception occurred in Flask endpoint")
    try:
        report_error_to_license_server(str(e), traceback.format_exc())
    except: pass
    return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    # Singleton process lock check
    CONFIG_DIR = os.getenv("CONFIG_DIR", r"C:\SaaSIA\ai_core\config")
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
    
    # Auto-sync de webhooks en bucle periódico (cada 30s)
    def auto_sync():
        pass

    threading.Thread(target=auto_sync, daemon=True).start()
    threading.Thread(target=mkt_loop, daemon=True).start()
    threading.Thread(target=run_diagnostic_agent, daemon=True).start()
    
    # Iniciar servidor Flask
    try:
        app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
    except Exception as e:
        logger.error(f" [!] Error al iniciar Flask: {e}")
    finally:
        if os.path.exists(lock_path):
            try: os.remove(lock_path)
            except: pass