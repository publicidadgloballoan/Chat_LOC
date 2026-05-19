import requests
import subprocess
import json

def run_sql(q):
    res = subprocess.run(["docker", "exec", "chatbot_punto_a_postgres", "psql", "-U", "chatbot_punto_a", "-d", "chatbot_punto_a", "-A", "-t", "-c", q], capture_output=True, text=True)
    return res.stdout.strip()

print("--- REPARACION FINAL ---")

# 1. Obtener llaves
n8n_key = run_sql("SELECT \"apiKey\" FROM user_api_keys LIMIT 1")
print(f"n8n Key: {n8n_key[:10]}...")

# 2. Ver estado de workflows
r = requests.get("http://localhost:5678/api/v1/workflows", headers={"X-N8N-API-KEY": n8n_key})
print("\n[N8N] Workflows:")
for w in r.json().get('data', []):
    print(f" - ID: {w['id']} Name: {w['name']} Active: {w['active']}")

# 3. Ver ultimas ejecuciones locales
execs = run_sql("SELECT id, status, \"startedAt\" FROM execution_entity ORDER BY id DESC LIMIT 3")
print("\n[N8N] Ultimas 3 ejecuciones:")
print(execs)

# 4. Probar Ollama
try:
    ro = requests.get("http://localhost:11434/api/tags", timeout=2)
    print("\n[OLLAMA] OK")
except:
    print("\n[OLLAMA] ERROR")

# 5. Probar WhatsApp Service
try:
    rw = requests.get("http://localhost:8080/instance/connectionState/chatbot_punto_a", headers={"apikey": "03d27a0c34fa708178148142d6f5eedc86cd5e3a"})
    print(f"\n[WHATSAPP] {rw.json()}")
except Exception as e:
    print(f"\n[WHATSAPP] ERROR: {e}")

# 6. Ver logs de WhatsApp
print("\n[LOGS WA] Ultimas lineas:")
res_log = subprocess.run(["docker", "logs", "--tail", "5", "chatbot_punto_a_whatsapp"], capture_output=True, text=True)
print(res_log.stdout)
