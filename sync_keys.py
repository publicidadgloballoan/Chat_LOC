"""
sync_keys.py — Sincroniza AUTHENTICATION_API_KEY entre todos los .env del sistema.
Usa el backend/.env como fuente de verdad.
Ejecutar desde el directorio raiz de la instalacion.
"""
import os
import re
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def read_env_value(env_path, key):
    """Lee el valor de una clave de un archivo .env."""
    if not os.path.exists(env_path):
        return None
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line.startswith(f'{key}='):
                val = line.split('=', 1)[1].strip().strip('"').strip("'")
                return val
    return None

def update_env_value(env_path, key, value):
    """Actualiza o agrega una clave en un archivo .env."""
    if not os.path.exists(env_path):
        print(f"  [SKIP] No existe: {env_path}")
        return False
    
    with open(env_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    found = False
    new_lines = []
    for line in lines:
        if line.strip().startswith(f'{key}='):
            new_lines.append(f'{key}="{value}"\n')
            found = True
        else:
            new_lines.append(line)
    
    if not found:
        new_lines.append(f'{key}="{value}"\n')
    
    with open(env_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    return True

# 1. Leer la API key del backend (fuente de verdad)
backend_env = os.path.join(BASE_DIR, 'backend', '.env')
api_key = read_env_value(backend_env, 'AUTHENTICATION_API_KEY')

if not api_key:
    print("[ERROR] No se encontro AUTHENTICATION_API_KEY en backend/.env")
    print(f"        Ruta buscada: {backend_env}")
    sys.exit(1)

print(f"[OK] API Key del backend: {api_key[:8]}...")

# 2. Sincronizar en WA service
wa_env = os.path.join(BASE_DIR, 'ai_core', 'whatsapp_service', '.env')
if update_env_value(wa_env, 'AUTHENTICATION_API_KEY', api_key):
    print(f"[OK] whatsapp_service/.env actualizado")
else:
    # Si no existe, crearlo
    os.makedirs(os.path.dirname(wa_env), exist_ok=True)
    with open(wa_env, 'w', encoding='utf-8') as f:
        f.write(f'AUTHENTICATION_API_KEY="{api_key}"\n')
    print(f"[OK] whatsapp_service/.env creado")

# 3. Sincronizar en ai_core
ai_core_env = os.path.join(BASE_DIR, 'ai_core', '.env')
if update_env_value(ai_core_env, 'AUTHENTICATION_API_KEY', api_key):
    print(f"[OK] ai_core/.env actualizado")

print("\n[INFO] Claves sincronizadas. Reinicia los servicios para que tomen efecto.")
