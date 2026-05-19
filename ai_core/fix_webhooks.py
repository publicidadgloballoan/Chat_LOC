import requests

APIKEY = '03d27a0c34fa708178148142d6f5eedc86cd5e3a'
URL = 'http://127.0.0.1:8080'
# Usamos host.docker.internal para que el contenedor llegue al host de Windows
WEBHOOK = 'http://host.docker.internal:5000/webhook/whatsapp'

headers = {'apikey': APIKEY}

print("Obteniendo instancias para configurar webhooks...")
try:
    instances = requests.get(f'{URL}/instance/fetchInstances', headers=headers).json()
    
    for i in instances:
        name = i['instance']['instanceName']
        print(f"Configurando webhook para {name} -> {WEBHOOK}")
        res = requests.post(
            f'{URL}/webhook/set/{name}', 
            headers=headers, 
            json={
                'enabled': True, 
                'url': WEBHOOK, 
                'webhook_by_events': False, 
                'events': ['MESSAGES_UPSERT', 'MESSAGES_UPDATE']
            }
        )
        print(f"Respuesta: {res.status_code}")
    
    print("Configuración de webhooks terminada.")
except Exception as e:
    print(f"Error: {e}")
