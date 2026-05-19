import requests
import subprocess
import json

def get_n8n_key():
    res = subprocess.run(["docker", "exec", "chatbot_punto_a_postgres", "psql", "-U", "chatbot_punto_a", "-d", "chatbot_punto_a", "-A", "-t", "-c", "SELECT \"apiKey\" FROM user_api_keys LIMIT 1"], capture_output=True, text=True)
    return res.stdout.strip()

def toggle():
    key = get_n8n_key()
    headers = {"X-N8N-API-KEY": key}
    
    # Obtener estado actual
    r = requests.get("http://localhost:5678/api/v1/workflows", headers=headers)
    wf = r.json().get('data', [])[0]
    id_wf = wf['id']
    active = wf['active']
    
    # Invertir estado
    if active:
        requests.post(f"http://localhost:5678/api/v1/workflows/{id_wf}/deactivate", headers=headers)
        print("Bot Desactivado")
    else:
        requests.post(f"http://localhost:5678/api/v1/workflows/{id_wf}/activate", headers=headers)
        print("Bot Activado")

if __name__ == "__main__":
    toggle()
