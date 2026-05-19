import requests
import subprocess

def run_sql(q):
    res = subprocess.run(["docker", "exec", "chatbot_punto_a_postgres", "psql", "-U", "chatbot_punto_a", "-d", "chatbot_punto_a", "-A", "-t", "-c", q], capture_output=True, text=True)
    return res.stdout.strip()

api_key = run_sql("SELECT \"apiKey\" FROM user_api_keys LIMIT 1")
headers = {"X-N8N-API-KEY": api_key}

r = requests.get("http://localhost:5678/api/v1/workflows", headers=headers)
wfs = r.json().get('data', [])

print("--- RUTAS DE WEBHOOK DETECTADAS ---")
for w in wfs:
    wf_detail = requests.get(f"http://localhost:5678/api/v1/workflows/{w['id']}", headers=headers).json()
    for node in wf_detail.get('nodes', []):
        if node['type'] == 'n8n-nodes-base.webhook':
            path = node['parameters'].get('path', 'whatsapp')
            # En n8n produccion la ruta es /webhook/<id>/<method>/<path> o similar
            # pero suele ser /webhook/<path> si no hay colisiones.
            print(f"Workflow: {w['name']}")
            print(f"Node: {node['name']} | Path: {path} | WebhookId: {node.get('webhookId')}")
