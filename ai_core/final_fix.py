import requests
import json
import time

URL = "http://localhost:5678/api/v1/workflows"
HEADERS = {
    "X-N8N-API-KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZTFiZjVhZC1iMDQzLTQ3ZTItYjAyZC1iMGYyMThjODZjYzciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2MDA5ODAyfQ.D0IV2tDJqOrKGwj2gnplzvgWXm911c3RETMltfmRzKA",
    "Content-Type": "application/json"
}

def fix():
    print("--- IMPORTACION FINAL ---")
    try:
        with open('final_bot.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 1. Importar
        r = requests.post(URL, headers=HEADERS, json=data)
        print(f"Import status: {r.status_code}")
        if r.status_code not in [200, 201]:
            print(f"Error: {r.text}")
            return
            
        wid = r.json().get('id')
        print(f"Workflow ID: {wid}")
        
        # 2. Activar
        ra = requests.post(f"{URL}/{wid}/activate", headers=HEADERS)
        print(f"Activation status: {ra.status_code}")
        
    except Exception as e:
        print(f"Falla: {e}")

if __name__ == "__main__":
    fix()
