import requests
import subprocess
import json

def run_sql(q):
    cmd = ["docker", "exec", "chatbot_punto_a_postgres", "psql", "-U", "chatbot_punto_a", "-d", "chatbot_punto_a", "-A", "-t", "-c", q]
    res = subprocess.run(cmd, capture_output=True, text=True)
    return res.stdout.strip()

try:
    n8n_key = run_sql('SELECT "apiKey" FROM user_api_keys LIMIT 1')
    headers = {"X-N8N-API-KEY": n8n_key, "Content-Type": "application/json"}
    
    # Crear flujo de prueba
    wf = {
        "name": "Test Webhook Diagnostic",
        "nodes": [
            {
                "parameters": {
                    "httpMethod": "POST",
                    "path": "test_debug",
                    "responseMode": "onReceived"
                },
                "name": "Webhook",
                "type": "n8n-nodes-base.webhook",
                "typeVersion": 1,
                "position": [0, 0]
            }
        ],
        "connections": {},
        "active": True
    }
    
    # POST
    r = requests.post('http://localhost:5678/api/v1/workflows', headers=headers, json=wf)
    print(f"Workflow creado: {r.status_code}")
    if r.status_code in [200, 201]:
        wid = r.json()['id']
        requests.post(f"http://localhost:5678/api/v1/workflows/{wid}/activate", headers=headers)
        
        # Probar webhook
        rt = requests.post('http://localhost:5678/webhook/test_debug', json={"test": "ok"})
        print(f"Status del Webhook Provisorio: {rt.status_code}")
        
except Exception as e:
    print(f"Error: {e}")
