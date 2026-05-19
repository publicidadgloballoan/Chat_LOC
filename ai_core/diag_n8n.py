import subprocess
import json
import re

def get_last_execution():
    # Obtener el ID y el DATA de la tabla execution_data
    cmd = ["docker", "exec", "chatbot_punto_a_postgres", "psql", "-U", "chatbot_punto_a", "-d", "chatbot_punto_a", "-t", "-c", "SELECT data FROM execution_data ORDER BY \"executionId\" DESC LIMIT 1"]
    res = subprocess.run(cmd, capture_output=True, text=True, errors='ignore')
    return res.stdout.strip()

data = get_last_execution()
if not data:
    print("No se encontraron ejecuciones.")
else:
    # Buscar el nodo final
    last_node = re.search(r'"lastNodeExecuted":"([^"]+)"', data)
    error = re.search(r'"message":"([^"]+)"', data)
    
    print(f"--- DIAGNOSTICO N8N ---")
    if last_node:
        print(f"Ultimo nodo: {last_node.group(1)}")
    if error:
        print(f"Error: {error.group(1)}")
    
    # Ver si llegamos al nodo de envío
    if "Enviar Respuesta LLM" in data:
        print("El flujo LLEGO al nodo de envío de respuesta.")
    elif "Llamar LLM" in data:
        print("El flujo se detuvo en el LLM (Ollama).")
    else:
        print("El flujo no llegó a la IA.")
