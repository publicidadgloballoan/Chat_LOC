#!/usr/bin/env python3
"""Script para importar el workflow a n8n (versión simplificada)"""
import json
import requests
import subprocess
from pathlib import Path

def get_or_create_api_key():
    """Obtener o crear API key de n8n"""
    # Primero intentar obtener API key existente
    result = subprocess.run(
        ["docker", "exec", "chatbot_punto_a_postgres", "psql",
         "-U", "chatbot_punto_a", "-d", "chatbot_punto_a", "-t", "-c",
         "SELECT \"apiKey\" FROM user_api_keys WHERE label = 'installer-auto' LIMIT 1;"],
        capture_output=True,
        text=True
    )

    api_key = result.stdout.strip() if result.returncode == 0 and result.stdout.strip() else None

    if api_key and 'n8n_api_' in api_key:
        # Limpiar la API key (quitar espacios y saltos de línea)
        api_key = [line.strip() for line in api_key.split('\n') if line.strip() and 'n8n_api_' in line][0]
        print(f"API key encontrada: {api_key[:20]}...")
        return api_key

    # Crear nueva API key
    print("Creando nueva API key...")
    result = subprocess.run(
        ["docker", "exec", "chatbot_punto_a_postgres", "psql",
         "-U", "chatbot_punto_a", "-d", "chatbot_punto_a", "-t", "-c",
         """
         INSERT INTO user_api_keys (id, "userId", label, "apiKey", "createdAt", "updatedAt")
         SELECT gen_random_uuid()::text, id, 'installer-auto',
         'n8n_api_' || substr(md5(random()::text), 1, 32), NOW(), NOW()
         FROM "user" WHERE role = 'global:owner' LIMIT 1
         RETURNING "apiKey";
         """],
        capture_output=True,
        text=True
    )

    if result.returncode == 0:
        # Extraer solo la línea con la API key
        lines = [line.strip() for line in result.stdout.split('\n') if line.strip() and 'n8n_api_' in line]
        if lines:
            api_key = lines[0]
            print(f"API key creada: {api_key[:20]}...")
            return api_key

    raise Exception("No se pudo crear API key")

def import_workflow():
    """Importar workflow a n8n"""
    # Leer workflow
    workflow_path = Path("config/workflow_chatbot.json")
    with open(workflow_path, 'r', encoding='utf-8') as f:
        workflow = json.load(f)

    # Leer apikey real del contenedor de whatsapp
    try:
        result_key = subprocess.run(
            ["docker", "inspect", "chatbot_punto_a_whatsapp",
             "--format", "{{range .Config.Env}}{{println .}}{{end}}"],
            capture_output=True, text=True
        )
        evolution_api_key = "evolution_api_key_2024_punto_a"  # fallback
        for line in result_key.stdout.splitlines():
            if line.startswith("AUTHENTICATION_API_KEY="):
                evolution_api_key = line.split("=", 1)[1].strip()
                break
        print(f"API Key Evolution detectada: {evolution_api_key[:12]}...")
    except Exception:
        evolution_api_key = "evolution_api_key_2024_punto_a"

    # Sustituir variables
    workflow_str = json.dumps(workflow)
    workflow_str = workflow_str.replace("{{EMPRESA}}", "Punto A")
    workflow_str = workflow_str.replace("{{DB_USER}}", "chatbot_punto_a")
    workflow_str = workflow_str.replace("{{DB_PASSWORD}}", "chatbot_punto_a_2024_secure")
    workflow_str = workflow_str.replace("{{EVOLUTION_API_KEY}}", evolution_api_key)
    workflow_str = workflow_str.replace("{{OLLAMA_MODEL}}", "llama3.2:3b-instruct-q4_K_M")
    workflow = json.loads(workflow_str)

    # Obtener API key
    api_key = get_or_create_api_key()

    # Preparar datos para importar
    workflow_data = {
        "name": workflow.get("name"),
        "nodes": workflow.get("nodes", []),
        "connections": workflow.get("connections", {}),
        "settings": {
            "executionOrder": "v1"
        },
        "staticData": workflow.get("staticData", {})
    }

    # Buscar si ya existe
    print("Buscando workflow existente...")
    existing_res = requests.get(f"http://localhost:5678/api/v1/workflows", headers=headers)
    existing_id = None
    if existing_res.status_code == 200:
        for w in existing_res.json().get('data', []):
            if w['name'] == workflow_data['name']:
                existing_id = w['id']
                break

    if existing_id:
        print(f"Actualizando workflow existente (ID: {existing_id})...")
        response = requests.put(
            f"http://localhost:5678/api/v1/workflows/{existing_id}",
            headers=headers,
            json=workflow_data,
            timeout=30
        )
        workflow_id = existing_id
    else:
        print("Importando nuevo workflow...")
        response = requests.post(
            "http://localhost:5678/api/v1/workflows",
            headers=headers,
            json=workflow_data,
            timeout=30
        )
        if response.status_code in [200, 201]:
            workflow_id = response.json().get('id')
        else:
            workflow_id = None

    if workflow_id and response.status_code in [200, 201]:
        print(f"[OK] Workflow configurado (ID: {workflow_id})")
        # Activar
        requests.post(f"http://localhost:5678/api/v1/workflows/{workflow_id}/activate", headers=headers, timeout=10)
        return workflow_id
    else:
        print(f"[ERROR] Fail: {response.text}")
        return None

if __name__ == "__main__":
    workflow_id = import_workflow()
    if workflow_id:
        print(f"\n[OK] Workflow configurado correctamente!")
        print(f"   ID: {workflow_id}")
        print(f"   URL: http://localhost:5678/workflow/{workflow_id}")
