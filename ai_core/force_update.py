import requests
import subprocess
import json
import time

def run_sql(q):
    res = subprocess.run(["docker", "exec", "chatbot_punto_a_postgres", "psql", "-U", "chatbot_punto_a", "-d", "chatbot_punto_a", "-A", "-t", "-c", q], capture_output=True, text=True)
    return res.stdout.strip()

def get_evo_key():
    r = subprocess.run(["docker", "inspect", "chatbot_punto_a_whatsapp", "--format", "{{range .Config.Env}}{{println .}}{{end}}"], capture_output=True, text=True)
    for line in r.stdout.splitlines():
        if line.startswith("AUTHENTICATION_API_KEY="): return line.split("=", 1)[1].strip()
    return "error"

print("--- FORCE UPDATE N8N ---")

n8n_key = run_sql("SELECT \"apiKey\" FROM user_api_keys LIMIT 1")
evo_key = get_evo_key()
headers = {"X-N8N-API-KEY": n8n_key, "Content-Type": "application/json"}

# 1. Borrar todos los workflows actuales para limpiar
r = requests.get("http://localhost:5678/api/v1/workflows", headers=headers)
for w in r.json().get('data', []):
    print(f"Borrando {w['id']}...")
    requests.delete(f"http://localhost:5678/api/v1/workflows/{w['id']}", headers=headers)

# 2. Preparar el nuevo JSON
with open('config/workflow_chatbot.json', 'r', encoding='utf-8') as f:
    wf = json.load(f)

wf_str = json.dumps(wf)
wf_str = wf_str.replace("{{EVOLUTION_API_KEY}}", evo_key)
wf_str = wf_str.replace("{{EMPRESA}}", "Punto A")
wf_str = wf_str.replace("{{OLLAMA_MODEL}}", "llama3.2:3b-instruct-q4_K_M")
wf_ready = json.loads(wf_str)

# 3. Importar como nuevo (active es read-only, se activa después)
wf_payload = {
    "name": "Bot Maestro Punto A",
    "nodes": wf_ready['nodes'],
    "connections": wf_ready['connections'],
    "settings": {"executionOrder": "v1"}
}

ri = requests.post("http://localhost:5678/api/v1/workflows", headers=headers, json=wf_payload)
print(f"Status Import: {ri.status_code}")
if ri.status_code not in [200, 201]:
    print(f"ERROR: {ri.text}")
    exit(1)
new_id = ri.json().get('id')
print(f"Nuevo ID: {new_id}")

# 4. Activar
ra = requests.post(f"http://localhost:5678/api/v1/workflows/{new_id}/activate", headers=headers)
print(f"Activacion: {ra.status_code}")

print("\n--- ACTUALIZACION FORZADA COMPLETADA ---")
