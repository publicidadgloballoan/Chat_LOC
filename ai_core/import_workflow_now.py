#!/usr/bin/env python3
"""Quick script to import workflow with proper variable substitution"""
import sys
from pathlib import Path

# Add project paths
sys.path.insert(0, str(Path(__file__).parent))

from core.docker_setup import import_workflow

# Variables from Docker environment
workflow_path = Path("c:/RouthLocal/punto_a/config/workflow_chatbot.json")
empresa = "Punto A"  # Default company name
db_user = "chatbot_punto_a"
db_password = "23ca07ba6ae8b819cf25a851d971c5e8"
evolution_key = "740a94b3bd9238b75431bc70ea9760613e2be526"
ollama_model = "llama3.2:3b-instruct-q4_K_M"
n8n_url = "http://localhost:5678"

print("Importing workflow with variable substitution...")
print(f"  EMPRESA: {empresa}")
print(f"  DB_USER: {db_user}")
print(f"  EVOLUTION_API_KEY: {evolution_key[:20]}...")
print(f"  OLLAMA_MODEL: {ollama_model}")

result = import_workflow(
    n8n_url=n8n_url,
    workflow_json_path=workflow_path,
    empresa=empresa,
    db_user=db_user,
    db_password=db_password,
    evolution_key=evolution_key,
    ollama_model=ollama_model,
    log=print
)

if result:
    print("\n✅ Workflow imported successfully!")
else:
    print("\n❌ Workflow import failed")
    sys.exit(1)
