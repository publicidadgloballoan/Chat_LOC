import requests
import json

HEADERS = {
    "X-N8N-API-KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZTFiZjVhZC1iMDQzLTQ3ZTItYjAyZC1iMGYyMThjODZjYzciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2MDA5ODAyfQ.D0IV2tDJqOrKGwj2gnplzvgWXm911c3RETMltfmRzKA",
    "Content-Type": "application/json"
}
URL = "http://localhost:5678/api/v1/workflows"

def solve():
    print("--- SOLUCIONANDO ---")
    
    # 1. Borrar anteriores
    res_list = requests.get(URL, headers=HEADERS)
    for w in res_list.json().get('data', []):
        if w['name'] == "Bot Maestro Punto A":
            requests.delete(f"{URL}/{w['id']}", headers=HEADERS)
            print(f"Borrando workflow viejo: {w['id']}")

    # 2. Cargar nuevo (limpio de IDs)
    with open('final_bot.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    payload = {
        "name": "Bot Maestro Punto A",
        "nodes": data['nodes'],
        "connections": data['connections'],
        "settings": {"executionOrder": "v1"}
    }
    
    # Eliminar IDs de nodos para que n8n los genere
    for n in payload['nodes']:
        if 'id' in n: del n['id']

    r = requests.post(URL, headers=HEADERS, json=payload)
    print(f"Import Status: {r.status_code}")
    if r.status_code in [200, 201]:
        wid = r.json()['id']
        print(f"ID Creado: {wid}")
        
        # 3. Activar
        ra = requests.post(f"{URL}/{wid}/activate", headers=HEADERS)
        print(f"Activacion Status: {ra.status_code}")
        
        # 4. Sincronizar Webhook
        key = "03d27a0c34fa708178148142d6f5eedc86cd5e3a"
        hook_url = "http://n8n:5678/webhook/bot/whatsapp"
        requests.put('http://localhost:8080/webhook/set/chatbot_punto_a', 
                     headers={'apikey': key, 'Content-Type': 'application/json'}, 
                     json={'url': hook_url})
        print("Webhook conectado.")
    else:
        print(f"Error: {r.text}")

if __name__ == "__main__":
    solve()
