import requests
import subprocess
import time

def run_sql(q):
    res = subprocess.run(["docker", "exec", "chatbot_punto_a_postgres", "psql", "-U", "chatbot_punto_a", "-d", "chatbot_punto_a", "-A", "-t", "-c", q], capture_output=True, text=True)
    return res.stdout.strip()

print("--- ACTIVADOR DE EMERGENCIA ---")

# 1. Obtener API KEY
api_key = run_sql("SELECT \"apiKey\" FROM user_api_keys LIMIT 1")
headers = {"X-N8N-API-KEY": api_key}

# 2. Listar y Activar
try:
    r = requests.get("http://localhost:5678/api/v1/workflows", headers=headers)
    wfs = r.json().get('data', [])
    print(f"Workflows encontrados: {len(wfs)}")
    
    for w in wfs:
        wid = w['id']
        name = w['name']
        print(f"Activando {name} (ID: {wid})...")
        ra = requests.post(f"http://localhost:5678/api/v1/workflows/{wid}/activate", headers=headers)
        print(f"Status: {ra.status_code}")

    # 3. Validar Webhook final
    print("\nURL de Webhook que deberia estar activa:")
    print("http://localhost:5678/webhook/whatsapp")
except Exception as e:
    print(f"Error: {e}")
