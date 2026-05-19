import requests
import subprocess
import json
import os

def run_sql(q):
    cmd = ["docker", "exec", "chatbot_punto_a_postgres", "psql", "-U", "chatbot_punto_a", "-d", "chatbot_punto_a", "-A", "-t", "-c", q]
    res = subprocess.run(cmd, capture_output=True, text=True)
    return res.stdout.strip()

def get_evo_key():
    r = subprocess.run(["docker","inspect","chatbot_punto_a_whatsapp","--format","{{range .Config.Env}}{{println .}}{{end}}"], capture_output=True, text=True)
    for line in r.stdout.splitlines():
        if line.startswith("AUTHENTICATION_API_KEY="):
            return line.split("=",1)[1].strip()
    return "error"

try:
    print("--- RESTAURANDO VERSION ESTABLE ---")
    n8n_key = run_sql('SELECT "apiKey" FROM user_api_keys LIMIT 1')
    evo_key = get_evo_key()
    headers = {"X-N8N-API-KEY": n8n_key, "Content-Type": "application/json"}
    
    # Leer JSON estable
    with open(r"c:\RouthLocal\punto_a\config\workflow_v1.0_ESTABLE.json", "r", encoding="utf-8") as f:
        wf = json.load(f)
        
    # Cambiar path a uno nuevo para forzar refresco
    for node in wf['nodes']:
        if node['type'] == 'n8n-nodes-base.webhook':
            node['parameters']['path'] = 'whatsapp_punto_a'
            
    # Reemplazar API Keys en los nodos
    wf_str = json.dumps(wf).replace("{{EVOLUTION_API_KEY}}", evo_key)
    wf = json.loads(wf_str)
    
    # Limpiar previos
    r = requests.get('http://localhost:5678/api/v1/workflows', headers=headers)
    for w in r.json().get('data', []):
        requests.delete(f"http://localhost:5678/api/v1/workflows/{w['id']}", headers=headers)
        
    # Importar
    ri = requests.post("http://localhost:5678/api/v1/workflows", headers=headers, json=wf)
    if ri.status_code in [200, 201]:
        new_id = ri.json()["id"]
        requests.post(f"http://localhost:5678/api/v1/workflows/{new_id}/activate", headers=headers)
        print(f"ESTABLE RESTAURADO: ID {new_id}")
    else:
        print(f"Error: {ri.text}")
        
except Exception as e:
    print(f"Error critico: {e}")
