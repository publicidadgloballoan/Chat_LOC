#!/usr/bin/env python3
"""Import workflow via n8n REST API"""
import json
import requests
from pathlib import Path

# Variables
workflow_path = Path("c:/RouthLocal/punto_a/config/workflow_chatbot.json")
empresa = "Punto A"
db_user = "chatbot_punto_a"
db_password = "23ca07ba6ae8b819cf25a851d971c5e8"
evolution_key = "740a94b3bd9238b75431bc70ea9760613e2be526"
ollama_model = "llama3.2:3b-instruct-q4_K_M"
n8n_url = "http://localhost:5678"
api_key = "n8n_api_7de807f95fe209721be2f9a265f18fa0"

# Read and process workflow
print("Reading workflow template...")
contenido = workflow_path.read_text(encoding="utf-8-sig")

# Substitute variables
sustituciones = {
    "{{EMPRESA}}": empresa,
    "{{DB_USER}}": db_user,
    "{{DB_PASSWORD}}": db_password,
    "{{EVOLUTION_API_KEY}}": evolution_key,
    "{{OLLAMA_MODEL}}": ollama_model,
}
for clave, valor in sustituciones.items():
    contenido = contenido.replace(clave, valor)

workflow = json.loads(contenido)

# Remove read-only fields and problematic fields for import
workflow_import = {
    "name": workflow.get("name"),
    "nodes": workflow.get("nodes", []),
    "connections": workflow.get("connections", {}),
    "settings": {
        "executionOrder": "v1"
    },
    "staticData": workflow.get("staticData", {})
}

# Import via API
print(f"Importing workflow via API: {n8n_url}/api/v1/workflows")
headers = {
    "X-N8N-API-KEY": api_key,
    "Content-Type": "application/json"
}

response = requests.post(
    f"{n8n_url}/api/v1/workflows",
    headers=headers,
    json=workflow_import,
    timeout=30
)

if response.status_code in [200, 201]:
    result = response.json()
    print(f"SUCCESS! Workflow imported:")
    print(f"  ID: {result.get('id')}")
    print(f"  Name: {result.get('name')}")
    print(f"  Active: {result.get('active')}")

    # Activate workflow if not active
    workflow_id = result.get('id')
    if not result.get('active'):
        print(f"\nActivating workflow {workflow_id}...")

        # Use the /activate endpoint
        activate_response = requests.post(
            f"{n8n_url}/api/v1/workflows/{workflow_id}/activate",
            headers=headers,
            timeout=10
        )

        if activate_response.status_code == 200:
            print("  Workflow activated successfully!")
        else:
            print(f"  Failed to activate: {activate_response.status_code} - {activate_response.text}")
else:
    print(f"ERROR: {response.status_code}")
    print(response.text)
