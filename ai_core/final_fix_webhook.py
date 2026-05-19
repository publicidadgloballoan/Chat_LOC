import requests

APIKEY = '03d27a0c34fa708178148142d6f5eedc86cd5e3a'
URL = 'http://127.0.0.1:8080'
REAL_IP = '192.168.1.163'
WEBHOOK = f'http://{REAL_IP}:5000/webhook/whatsapp'

headers = {'apikey': APIKEY}
instances = ['nico_ventas_canal', 'colab_pro', 'colab_global_sa']

print(f"Configurando webhooks vía PUT hacia {WEBHOOK}...")

for inst in instances:
    # Según server.js línea 88: app.put('/webhook/set/:instanceName')
    url_set = f"{URL}/webhook/set/{inst}"
    try:
        # El body solo requiere { url: ... } según el código fuente
        r = requests.put(url_set, headers=headers, json={"url": WEBHOOK})
        print(f"Instancia {inst}: Status {r.status_code} - {r.text}")
    except Exception as e:
        print(f"Error en {inst}: {e}")

print("\nHecho. Por favor envía un mensaje a cualquiera de las líneas.")
