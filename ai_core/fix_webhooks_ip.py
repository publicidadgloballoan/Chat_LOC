import requests

APIKEY = '03d27a0c34fa708178148142d6f5eedc86cd5e3a'
URL = 'http://127.0.0.1:8080'
# Usamos tu IP local directa para máxima fiabilidad
REAL_IP = '192.168.1.163'
WEBHOOK = f'http://{REAL_IP}:5000/webhook/whatsapp'

headers = {'apikey': APIKEY}

instances = ['nico_ventas_canal', 'colab_pro', 'colab_global_sa']

print(f"Configurando webhooks hacia {WEBHOOK}...")

for inst in instances:
    # Probamos la ruta de la v1/v2 que suele funcionar
    url_set = f"{URL}/webhook/set/{inst}"
    payload = {
        "enabled": True,
        "url": WEBHOOK,
        "webhookByEvents": False,
        "events": ["MESSAGES_UPSERT", "MESSAGES_UPDATE"]
    }
    try:
        r = requests.post(url_set, headers=headers, json=payload)
        print(f"Instancia {inst}: Status {r.status_code}")
    except Exception as e:
        print(f"Error en {inst}: {e}")

print("Proceso terminado. Por favor envía un mensaje de prueba.")
