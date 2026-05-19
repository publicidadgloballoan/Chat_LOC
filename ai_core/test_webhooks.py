import requests

APIKEY = '03d27a0c34fa708178148142d6f5eedc86cd5e3a'
URL = 'http://127.0.0.1:8080'
WEBHOOK = 'http://host.docker.internal:5000/webhook/whatsapp'
headers = {'apikey': APIKEY}

# Lista de instancias actuales
instances = ['nico_ventas_canal', 'colab_pro', 'colab_global_sa']

# Posibles rutas de Webhook en diferentes versiones de Evolution
endpoints = [
    '/webhook/set/{}',
    '/instance/setWebhook/{}',
    '/webhook/instance/{}'
]

for inst in instances:
    print(f"\n--- Configurando {inst} ---")
    for ep in endpoints:
        test_url = f"{URL}{ep.format(inst)}"
        print(f"Probando {test_url}...")
        try:
            res = requests.post(test_url, headers=headers, json={
                "enabled": True,
                "url": WEBHOOK,
                "webhookByEvents": False,
                "events": ["MESSAGES_UPSERT", "MESSAGES_UPDATE"]
            })
            print(f"Resultado: {res.status_code} - {res.text[:100]}")
            if res.status_code == 200 or res.status_code == 201:
                print(f"¡ÉXITO en {inst}!")
                break
        except Exception as e:
            print(f"Error: {e}")
