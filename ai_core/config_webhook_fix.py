#!/usr/bin/env python3
import requests
import subprocess
import json
import sys

# Get the workflow ID from database
try:
    result = subprocess.run(
        ["docker", "exec", "chatbot_punto_a_postgres", "psql",
         "-U", "chatbot_punto_a", "-d", "chatbot_punto_a", "-t", "-c",
         "SELECT id FROM workflow_entity WHERE name LIKE '%Chatbot%' AND active = true LIMIT 1;"],
        capture_output=True,
        text=True,
        timeout=10
    )
    workflow_id = result.stdout.strip()
    print(f"[*] Workflow ID: {workflow_id}")
except Exception as e:
    print(f"[!] Error: {e}")
    sys.exit(1)

# Get Evolution API key from state file
try:
    with open("C:\ChatBot_Punto_A\state.json") as f:
        state = json.load(f)
        api_key = state.get("evolution_key", "")
        print(f"[*] API Key: {api_key[:20]}...")
except Exception as e:
    print(f"[!] State file not found: {e}")
    sys.exit(1)

# Build webhook URL
webhook_url = "http://n8n:5678/webhook/whatsapp"
print(f"[*] Webhook URL: {webhook_url}")

# Configure webhook in Baileys
try:
    response = requests.put(
        "http://localhost:8080/webhook/set/chatbot_punto_a",
        headers={"apikey": api_key, "Content-Type": "application/json"},
        json={"url": webhook_url},
        timeout=10
    )
    print(f"[*] Respuesta: {response.status_code}")
    if response.status_code in (200, 201):
        print("[+] ✓ Webhook configurado!")
        print(f"[+] Próximos mensajes de WhatsApp irán a: {webhook_url}")
    else:
        print(f"[!] {response.text}")
except Exception as e:
    print(f"[!] {e}")
    sys.exit(1)
