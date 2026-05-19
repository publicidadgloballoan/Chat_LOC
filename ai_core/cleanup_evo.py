import requests
import time

APIKEY = '03d27a0c34fa708178148142d6f5eedc86cd5e3a'
URL = 'http://127.0.0.1:8080'
headers = {'apikey': APIKEY}

print("Obteniendo instancias...")
try:
    instances = requests.get(f'{URL}/instance/fetchInstances', headers=headers).json()
    print(f"Encontradas {len(instances)} instancias.")
    
    for i in instances:
        name = i['instance']['instanceName']
        print(f"Borrando {name}...")
        requests.delete(f'{URL}/instance/delete/{name}', headers=headers)
        time.sleep(1)
    
    print("Limpieza completada.")
except Exception as e:
    print(f"Error: {e}")
