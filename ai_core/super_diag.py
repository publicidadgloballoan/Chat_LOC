import requests
import subprocess
import json

def run_sql(q):
    res = subprocess.run(["docker", "exec", "chatbot_punto_a_postgres", "psql", "-U", "chatbot_punto_a", "-d", "chatbot_punto_a", "-A", "-t", "-c", q], capture_output=True, text=True)
    return res.stdout.strip()

print("--- SUPER DIAGNOSTICO ---")

try:
    # 1. API KEY
    api_key = run_sql("SELECT \"apiKey\" FROM user_api_keys LIMIT 1")
    print(f"API KEY: {api_key}")
    
    # 2. Get Workflows
    headers = {"X-N8N-API-KEY": api_key}
    r = requests.get("http://localhost:5678/api/v1/workflows", headers=headers)
    print(f"Status Workflows: {r.status_code}")
    
    wfs = r.json().get('data', [])
    print(f"Conteo: {len(wfs)}")
    
    for w in wfs:
        print(f"Bot: {w['name']} | ID: {w['id']} | Active: {w['active']}")
        # Ver nodos del bot
        rd = requests.get(f"http://localhost:5678/api/v1/workflows/{w['id']}", headers=headers).json()
        for n in rd.get('nodes', []):
            if n['type'] == 'n8n-nodes-base.webhook':
                print(f" -> Webhook en path: {n['parameters'].get('path')}")

except Exception as e:
    print(f"ERROR FATAL: {e}")
