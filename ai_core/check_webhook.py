import requests
import subprocess
import json

def run_sql(q):
    cmd = ["docker", "exec", "chatbot_punto_a_postgres", "psql", "-U", "chatbot_punto_a", "-d", "chatbot_punto_a", "-A", "-t", "-c", q]
    res = subprocess.run(cmd, capture_output=True, text=True)
    return res.stdout.strip()

try:
    n8n_key = run_sql('SELECT "apiKey" FROM user_api_keys LIMIT 1')
    headers = {"X-N8N-API-KEY": n8n_key}
    
    r = requests.get('http://localhost:5678/api/v1/workflows', headers=headers)
    wfs = r.json().get('data', [])
    for w in wfs:
        print(f"Workflow: {w['name']} (ID: {w['id']}) - Active: {w['active']}")
        # Ver nodos
        nodes = w.get('nodes', [])
        for n in nodes:
            if n['type'] == 'n8n-nodes-base.webhook':
                print(f"  Webhook Node: {n['name']}")
                print(f"  Path: {n.get('parameters', {}).get('path')}")
                print(f"  ID param: {n.get('parameters', {}).get('webhookId')}")
except Exception as e:
    print(f"Error: {e}")
