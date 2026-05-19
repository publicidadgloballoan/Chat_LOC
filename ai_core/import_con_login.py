import requests
import json

BASE_URL = "http://localhost:5678"
USER = "publicidadgloballoan@gmail.com"
PASS = "Grupo4656$"

session = requests.Session()

print("--- LOGIN EN N8N ---")
try:
    # 1. Login
    login_res = session.post(f"{BASE_URL}/api/v1/login", json={
        "email": USER,
        "password": PASS
    })
    print(f"Login Status: {login_res.status_code}")
    
    # 2. Leer el bot de IA
    with open('micro_ia.json', 'r', encoding='utf-8') as f:
        wf_data = json.load(f)
    
    # 3. Importar
    headers = {"Content-Type": "application/json"}
    import_res = session.post(f"{BASE_URL}/api/v1/workflows", json={
        "name": "Bot Maestro Punto A",
        "nodes": wf_data['nodes'],
        "connections": wf_data['connections'],
        "active": True,
        "settings": {"executionOrder": "v1"}
    }, headers=headers)
    
    if import_res.status_code in [200, 201]:
        print(f"¡EXITO! Workflow creado con ID: {import_res.json().get('id')}")
        # Activar
        wid = import_res.json().get('id')
        session.post(f"{BASE_URL}/api/v1/workflows/{wid}/activate")
        print("Workflow ACTIVADO.")
    else:
        print(f"Error al importar: {import_res.text}")

except Exception as e:
    print(f"Error fatal: {e}")
