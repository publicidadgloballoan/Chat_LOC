#!/usr/bin/env python3
"""Script para importar el workflow a n8n"""
import sys
from pathlib import Path

# Agregar el directorio core al path
sys.path.insert(0, str(Path(__file__).parent / "core"))

from docker_setup import import_workflow

if __name__ == "__main__":
    n8n_url = "http://localhost:5678"
    workflow_path = Path("config/workflow_chatbot.json")

    # Valores del .env
    empresa = "Punto A"
    db_user = "chatbot_punto_a"
    db_password = "chatbot_punto_a_2024_secure"
    evolution_key = "evolution_api_key_2024_punto_a"
    ollama_model = "llama3.2:3b-instruct-q4_K_M"

    print("Importando workflow a n8n...")
    import_workflow(
        n8n_url=n8n_url,
        workflow_json_path=workflow_path,
        empresa=empresa,
        db_user=db_user,
        db_password=db_password,
        evolution_key=evolution_key,
        ollama_model=ollama_model
    )
    print("¡Workflow importado exitosamente!")
