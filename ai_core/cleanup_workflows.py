import requests
import subprocess
import json

def run_sql(q):
    cmd = ["docker", "exec", "chatbot_punto_a_postgres", "psql", "-U", "chatbot_punto_a", "-d", "chatbot_punto_a", "-A", "-t", "-c", q]
    res = subprocess.run(cmd, capture_output=True, text=True)
    return res.stdout.strip()

try:
    n8n_key = run_sql('SELECT "apiKey" FROM user_api_keys LIMIT 1')
    print(f"API Key: {n8n_key[:5]}...")
    headers = {"X-N8N-API-KEY": n8n_key}
    
    r = requests.get('http://localhost:5678/api/v1/workflows', headers=headers)
    wfs = r.json().get('data', [])
    print(f"Borrando {len(wfs)} workflows...")
    
    for w in wfs:
        wid = w['id']
        rd = requests.delete(f'http://localhost:5678/api/v1/workflows/{wid}', headers=headers)
        print(f"Borrando {wid}: {rd.status_code}")
        
    print("Limpieza finalizada.")
except Exception as e:
    print(f"Error: {e}")
