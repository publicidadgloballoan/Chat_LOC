import requests
import subprocess

def run_sql(q):
    cmd = ["docker", "exec", "chatbot_punto_a_postgres", "psql", "-U", "chatbot_punto_a", "-d", "chatbot_punto_a", "-A", "-t", "-c", q]
    res = subprocess.run(cmd, capture_output=True, text=True)
    return res.stdout.strip()

try:
    n8n_key = run_sql('SELECT "apiKey" FROM user_api_keys LIMIT 1')
    headers = {"X-N8N-API-KEY": n8n_key, "Content-Type": "application/json"}
    
    # Datos de la credencial
    cred_data = {
        "name": "Postgres Estable",
        "type": "postgres",
        "data": {
            "host": "postgres",
            "database": "chatbot_punto_a",
            "user": "chatbot_punto_a",
            "password": "cebdef04370d542a7e7d70827ce798cb",
            "port": 5432,
            "ssl": "disable"
        }
    }
    
    r = requests.post("http://localhost:5678/api/v1/credentials", headers=headers, json=cred_data)
    if r.status_code in [200, 201]:
        new_id = r.json().get('id')
        print(f"Credencial Creada: {new_id}")
    else:
        # Si ya existe, buscar su ID
        r2 = requests.get("http://localhost:5678/api/v1/credentials", headers=headers)
        exist = next((c for c in r2.json().get('data', []) if c['name'] == "Postgres Estable"), None)
        if exist:
            print(f"Credencial Existente: {exist['id']}")
        else:
            print(f"Error: {r.text}")
except Exception as e:
    print(f"Error: {e}")
