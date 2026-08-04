import time
import requests
import uuid
import sqlite3
import os
import json
from concurrent.futures import ThreadPoolExecutor

URL = "http://127.0.0.1:5000/webhook"
INSTANCE = "venrtas_Xiami"
DB_PATH = "c:/SaaSIA/ai_core/config/brain_sessions.db"
PRICING_PATH = "c:/SaaSIA/ai_core/config/company_1/configs/pricing.json"

print("--- PREPARANDO PRUEBA DE ESTRÉS ACELERADA (5 MINUTOS) ---")

# 1. Cargar razas
with open(PRICING_PATH, "r", encoding="utf-8") as f:
    pricing = json.load(f)
breeds = [b["name"] for b in pricing.get("data", {}).get("breeds", []) if b.get("name")]

if not breeds:
    print("[ERROR] No se encontraron razas en el archivo pricing.json.")
    exit(1)

print(f"[INFO] Se probarán {len(breeds)} razas diferentes.")

# 2. Limpiar DB para TODOS los teléfonos (borrar historial completo según lo pedido)
if os.path.exists(DB_PATH):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("DELETE FROM sessions")
    c.execute("DELETE FROM processed_msgs")
    conn.commit()
    conn.close()
    print("[INFO] TODAS las conversaciones y sesiones previas han sido borradas.")

def run_client(client_id):
    phone = f"5491100000{client_id:03d}"
    breed = breeds[client_id % len(breeds)]
    
    def send_msg(text):
        payload = {
            "instance": INSTANCE,
            "data": {
                "key": {"remoteJid": f"{phone}@s.whatsapp.net", "fromMe": False, "id": str(uuid.uuid4())},
                "message": {"conversation": text},
                "pushName": f"TestClient_{client_id}"
            }
        }
        try:
            requests.post(URL, json=payload, timeout=5)
        except Exception as e:
            pass
        # Esperar 15 segundos para dar tiempo de procesar (Ollama puede tardar)
        time.sleep(15)

    print(f" -> [Cliente {client_id:03d}] Iniciando flujo para raza: {breed}")
    send_msg("Hola buenas")
    send_msg(f"Mi nombre es Cliente{client_id}")
    send_msg("Si")
    send_msg(f"Quiero el {breed}")
    send_msg("Si quiero ver fotos")
    send_msg("Avanzamos con la compra, dale")
    send_msg("CABA")
    print(f" <- [Cliente {client_id:03d}] Finalizado.")

# 3. Lanzar 100 clientes espaciados
# 100 clientes distribuidos en ~5 minutos => 1 cliente cada 3 segundos.
TOTAL_CLIENTS = 100
DELAY_BETWEEN_CLIENTS = 3

print(f"\n[INFO] Lanzando {TOTAL_CLIENTS} clientes concurrentes (1 cada {DELAY_BETWEEN_CLIENTS}s).")
executor = ThreadPoolExecutor(max_workers=50)

for i in range(TOTAL_CLIENTS):
    executor.submit(run_client, i)
    time.sleep(DELAY_BETWEEN_CLIENTS)

print("\n[INFO] Todos los clientes han sido lanzados. Esperando que los últimos terminen su flujo...")
executor.shutdown(wait=True)

# 4. Recopilar Estadísticas
print("\n--- RESULTADOS DE LA PRUEBA ---")
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()
c.execute("SELECT state, count(*) FROM sessions WHERE phone LIKE '5491100000%' GROUP BY state")
states = c.fetchall()
conn.close()

results = {"total_clients": TOTAL_CLIENTS, "states": dict(states)}

with open("c:/SaaSIA/stress_report.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=4)

print("[INFO] Estadísticas guardadas en c:/SaaSIA/stress_report.json")
for st, count in states:
    print(f" - Estado '{st}': {count} clientes")

success = results["states"].get("node_5", 0) + results["states"].get("calculator", 0)
print(f"\n[RESUMEN] {success} de {TOTAL_CLIENTS} clientes completaron el flujo exitosamente.")
