import requests, subprocess, json, os, time

WEBHOOK_STABLE_ID = "RaJRAtczgofWwcrz"
DEBUG_NUMBER = "1136822400" # Numero autorizado solitado por el usuario

def run_sql(q):
    cmd = ["docker", "exec", "chatbot_punto_a_postgres", "psql", "-U", "chatbot_punto_a", "-d", "chatbot_punto_a", "-A", "-t", "-c", q]
    res = subprocess.run(cmd, capture_output=True, text=True)
    return res.stdout.strip()

def wait_for_services():
    """Espera a que Postgres y n8n esten realmente listos."""
    print(" esperando a que los servicios esten activos...")
    for i in range(12): # 60 segundos maximo
        try:
            res = run_sql("SELECT 1")
            status = requests.get('http://localhost:5678/healthz')
            if res == "1" and status.status_code == 200:
                print(" [+] Servicios detectados. Procediendo a sincronizar...")
                return True
        except:
            pass
        time.sleep(5)
    print(" [!] Tiempo de espera agotado. Los servicios podrian estar tardando demasiado.")
    return False

def get_evo_key():
    r = subprocess.run(["docker","inspect","chatbot_punto_a_whatsapp","--format","{{range .Config.Env}}{{println .}}{{end}}"], capture_output=True, text=True)
    for line in r.stdout.splitlines():
        if line.startswith("AUTHENTICATION_API_KEY="):
            return line.split("=",1)[1].strip()
    return "error"

def get_postgres_cred_id():
    try:
        res = run_sql("SELECT id FROM credentials_entity WHERE name = 'Postgres Chatbot' LIMIT 1")
        return res if res else None
    except:
        return None

def build_workflow(cred_id):
    evo_key = get_evo_key()
    config_dir = r"c:\RouthLocal\punto_a\config"
    app_config = json.load(open(os.path.join(config_dir, "config_a1.json"), "r", encoding="utf-8")) if os.path.exists(os.path.join(config_dir, "config_a1.json")) else {}
    debug_mode = json.load(open(os.path.join(config_dir, "debug_mode.json"), "r", encoding="utf-8")).get('enabled', False)
    
    knowledge_text = open(os.path.join(config_dir, "knowledge.txt"), "r", encoding="utf-8").read().strip() if os.path.exists(os.path.join(config_dir, "knowledge.txt")) else ""
    history_text = open(os.path.join(config_dir, "chat_history.txt"), "r", encoding="utf-8").read().strip() if os.path.exists(os.path.join(config_dir, "chat_history.txt")) else ""
    
    full_prompt = f"Eres un Asistente Experto en Ventas. Empresa: {app_config.get('empresa', 'Punto A')}. \\nCONOCIMIENTO BASE:\\n{knowledge_text[:2000]}\\n\\nESTILO DE RESPUESTA Y EJEMPLOS:\\n{history_text[:2000]}"

    js_code = f"""
const config = {json.dumps(app_config)};
const base_prompt = {json.dumps(full_prompt)};
const payload = $input.first().json.body || $input.first().json;
if (payload.data?.key?.fromMe === true) return [];
const remoteJid = payload.data?.key?.remoteJid || '';
const phone = remoteJid.split('@')[0];

// FILTRO DE SEGURIDAD DEBUG (SOLO NUMERO AUTORIZADO)
const isDebug = {str(debug_mode).lower()};
const authorized = "{DEBUG_NUMBER}";
if (isDebug && phone !== authorized) {{
    console.log("Ignorando mensaje: Modo Debug Activo para " + authorized);
    return [];
}}

const msg = payload.data?.message || {{}};
const body = (msg.conversation || msg.extendedTextMessage?.text || '').trim();
if (!body) return [];

const sessionRaw = $node['Consultar Sesion'].json;
let state = sessionRaw?.state || 'MENU';
let manual = sessionRaw?.manual || false;
if (manual) return [];

const inputLower = body.toLowerCase();
let routeTo = "menu";
let text = null;
let prompt = base_prompt;

if (state === 'IA') {{
    routeTo = "llm";
}} else {{
    let found = false;
    for (let opt of config.opciones_menu || []) {{
        if (inputLower === String(opt.numero)) {{
            text = opt.respuesta;
            found = true;
            if (opt.numero === "3") {{ state = "IA"; routeTo = "llm"; }}
            break;
        }}
    }}
    if (!found) {{
        text = config.saludo_inicial || "Hola! Elija una opcion:";
        routeTo = "menu";
    }}
}}
return [{{ json: {{ routeTo, remoteJid, text, body, prompt, newState: state }} }}];
"""

    return {
        "name": "Bot Maestro Punto A",
        "nodes": [
            { "parameters": { "httpMethod": "POST", "path": "whatsapp", "responseMode": "onReceived", "options": { "webhookId": WEBHOOK_STABLE_ID } }, "id": "wh", "name": "Webhook", "type": "n8n-nodes-base.webhook", "typeVersion": 1, "position": [0, 300] },
            { "parameters": { "operation": "executeQuery", "query": "SELECT * FROM sessions WHERE phone = '={{ ($json.body.data?.key?.remoteJid || \"\").split(\"@\")[0] }}' LIMIT 1" }, "id": "db-get", "name": "Consultar Sesion", "type": "n8n-nodes-base.postgres", "typeVersion": 1, "position": [200, 300], "credentials": { "postgresDb": { "id": cred_id } } },
            { "parameters": { "jsCode": js_code }, "id": "router", "name": "Parse & Route", "type": "n8n-nodes-base.code", "typeVersion": 2, "position": [400, 300] },
            { "parameters": { "operation": "executeQuery", "query": "INSERT INTO sessions (phone, state) VALUES ('={{ $json.remoteJid.split(\"@\")[0] }}', '={{ $json.newState }}') ON CONFLICT (phone) DO UPDATE SET state = EXCLUDED.state; INSERT INTO logs (phone, message, direction) VALUES ('={{ $json.remoteJid.split(\"@\")[0] }}', '={{ $json.body.replace(\"'\", \"''\") }}', 'in');" }, "id": "db-set", "name": "Actualizar Sesion", "type": "n8n-nodes-base.postgres", "typeVersion": 1, "position": [600, 100], "credentials": { "postgresDb": { "id": cred_id } } },
            { "parameters": { "conditions": { "string": [{ "value1": "={{ $json.routeTo }}", "matchType": "equal", "value2": "menu" }] } }, "id": "if", "name": "Es Menu?", "type": "n8n-nodes-base.if", "typeVersion": 1, "position": [650, 300] },
            { "parameters": { "method": "POST", "url": "http://whatsapp-service:8080/message/sendText/chatbot_punto_a", "sendHeaders": True, "headerParameters": { "parameters": [{ "name": "apikey", "value": evo_key }] }, "sendBody": True, "specifyBody": "json", "jsonBody": "={{ JSON.stringify({ number: $json.remoteJid, text: $json.text }) }}" }, "id": "send-menu", "name": "Enviar Menu", "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.1, "position": [900, 150] },
            { "parameters": { "method": "POST", "url": "http://host.docker.internal:11434/api/chat", "sendBody": True, "specifyBody": "json", "jsonBody": "={{ JSON.stringify({ model: 'llama3.2:3b-instruct-q4_K_M', messages: [ { role: 'system', content: $json.prompt }, { role: 'user', content: $json.body } ], stream: false }) }}", "options": { "timeout": 120000 } }, "id": "llm", "name": "Llamar LLM", "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.1, "position": [900, 450] },
            { "parameters": { "jsCode": "const j = $input.first().json; return [{ json: { remoteJid: $node['Parse & Route'].json.remoteJid, text: j?.message?.content || j?.response || '...' } }];" }, "id": "extract", "name": "Extraer", "type": "n8n-nodes-base.code", "typeVersion": 2, "position": [1100, 450] },
            { "parameters": { "method": "POST", "url": "http://whatsapp-service:8080/message/sendText/chatbot_punto_a", "sendHeaders": True, "headerParameters": { "parameters": [{ "name": "apikey", "value": evo_key }] }, "sendBody": True, "specifyBody": "json", "jsonBody": "={{ JSON.stringify({ number: $json.remoteJid, text: $json.text }) }}" }, "id": "send-llm", "name": "Enviar LLM", "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.1, "position": [1300, 450] }
        ],
        "connections": {
            "Webhook": { "main": [[{ "node": "Consultar Sesion", "type": "main", "index": 0 }]] },
            "Consultar Sesion": { "main": [[{ "node": "Parse & Route", "type": "main", "index": 0 }]] },
            "Parse & Route": { "main": [[{ "node": "Actualizar Sesion", "type": "main", "index": 0 }, { "node": "Es Menu?", "type": "main", "index": 0 }]] },
            "Es Menu?": { "main": [[{ "node": "Enviar Menu", "type": "main", "index": 0 }], [{ "node": "Llamar LLM", "type": "main", "index": 0 }]] },
            "Llamar LLM": { "main": [[{ "node": "Extraer", "type": "main", "index": 0 }]] },
            "Extraer": { "main": [[{ "node": "Enviar LLM", "type": "main", "index": 0 }]] }
        },
        "settings": {"executionOrder": "v1"}
    }

if __name__ == "__main__":
    if wait_for_services():
        try:
            n8n_key = run_sql('SELECT "apiKey" FROM user_api_keys LIMIT 1')
            headers = {"X-N8N-API-KEY": n8n_key, "Content-Type": "application/json"}
            cid = get_postgres_cred_id()
            if not cid:
                print("ERROR: No se encontro la credencial 'Postgres Chatbot' en n8n.")
                exit(1)
            workflow = build_workflow(cid)
            r_list = requests.get('http://localhost:5678/api/v1/workflows', headers=headers)
            existing_wf = next((w for w in r_list.json().get('data', []) if w['name'] == "Bot Maestro Punto A"), None)
            if existing_wf:
                requests.put(f"http://localhost:5678/api/v1/workflows/{existing_wf['id']}", headers=headers, json=workflow)
                wid = existing_wf['id']
            else:
                r_create = requests.post("http://localhost:5678/api/v1/workflows", headers=headers, json=workflow)
                wid = r_create.json()['id']
            requests.post(f"http://localhost:5678/api/v1/workflows/{wid}/activate", headers=headers)
            print("CEREBRO SINCRONIZADO Y ESTABILIZADO (MODO DEBUG: OK)")
        except Exception as e:
            print(f"ERROR: {e}")
    else:
        print("SISTEMA ABORTADO: Los servicios base no arrancaron a tiempo.")
