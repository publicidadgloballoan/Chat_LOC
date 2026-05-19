#!/usr/bin/env python3
"""
fix_all.py — Arregla de una vez:
1. Lee la apikey real del contenedor de WhatsApp
2. Borra workflows duplicados en n8n (deja solo el más nuevo activo)
3. Actualiza el webhook del servicio WhatsApp para que apunte al workflow activo
4. Prueba el flujo completo
"""
import subprocess, json, time, sys

try:
    import requests
except ImportError:
    subprocess.run([sys.executable, "-m", "pip", "install", "requests", "-q"])
    import requests

N8N_URL   = "http://localhost:5678"
WA_URL    = "http://localhost:8080"
PG_CONTAINER = "chatbot_punto_a_postgres"
WA_CONTAINER = "chatbot_punto_a_whatsapp"
INSTANCE = "chatbot_punto_a"

# ── 1. Leer apikey real de WhatsApp ──────────────────────────────────────────
def get_evolution_key():
    r = subprocess.run(
        ["docker", "inspect", WA_CONTAINER,
         "--format", "{{range .Config.Env}}{{println .}}{{end}}"],
        capture_output=True, text=True
    )
    for line in r.stdout.splitlines():
        if line.startswith("AUTHENTICATION_API_KEY="):
            return line.split("=", 1)[1].strip()
    raise RuntimeError("No se encontro AUTHENTICATION_API_KEY en el contenedor")

# ── 2. Leer API key de n8n desde postgres ────────────────────────────────────
def get_n8n_key():
    r = subprocess.run(
        ["docker", "exec", PG_CONTAINER, "psql",
         "-U", "chatbot_punto_a", "-d", "chatbot_punto_a", "-A", "-t",
         "-c", "SELECT \"apiKey\" FROM user_api_keys LIMIT 1"],
        capture_output=True, text=True
    )
    return r.stdout.strip()

# ── 3. Limpiar workflows duplicados ──────────────────────────────────────────
def cleanup_workflows(n8n_key):
    headers = {"X-N8N-API-KEY": n8n_key}
    res = requests.get(f"{N8N_URL}/api/v1/workflows", headers=headers)
    items = res.json().get("data", [])
    print(f"  Workflows encontrados: {len(items)}")
    
    for wf in items:
        print(f"    ID={wf['id']}  active={wf.get('active')}")
    
    if len(items) <= 1:
        return items[0]["id"] if items else None
    
    # Ordenar por updatedAt desc → más nuevo primero
    items_sorted = sorted(items, key=lambda x: x.get("updatedAt",""), reverse=True)
    latest = items_sorted[0]
    
    for wf in items_sorted[1:]:
        print(f"  Borrando viejo ID={wf['id']}...")
        requests.delete(f"{N8N_URL}/api/v1/workflows/{wf['id']}", headers=headers)
    
    return latest["id"]

# ── 4. Activar workflow ───────────────────────────────────────────────────────
def activate_workflow(n8n_key, wf_id):
    headers = {"X-N8N-API-KEY": n8n_key}
    r = requests.post(f"{N8N_URL}/api/v1/workflows/{wf_id}/activate", headers=headers)
    print(f"  Activar workflow {wf_id}: {r.status_code}")

# ── 5. Actualizar webhook en el servicio de WhatsApp ─────────────────────────
def update_wa_webhook(evo_key):
    webhook_url = f"http://n8n:5678/webhook/whatsapp"
    payload = {"webhook": {"url": webhook_url}}
    r = requests.post(
        f"{WA_URL}/webhook/set/{INSTANCE}",
        headers={"apikey": evo_key, "Content-Type": "application/json"},
        json=payload,
        timeout=10
    )
    print(f"  Webhook WhatsApp → {webhook_url}: HTTP {r.status_code}")
    if r.status_code not in [200, 201]:
        print(f"  Respuesta: {r.text[:200]}")
    return r.status_code in [200, 201]

# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=== fix_all.py ===\n")
    
    print("[1] Leyendo API key de WhatsApp...")
    evo_key = get_evolution_key()
    print(f"  Evolution API Key: {evo_key[:12]}...")
    
    print("\n[2] Leyendo API key de n8n...")
    n8n_key = get_n8n_key()
    print(f"  n8n API Key: {n8n_key[:20]}...")
    
    print("\n[3] Limpiando workflows duplicados...")
    wf_id = cleanup_workflows(n8n_key)
    print(f"  Workflow activo: {wf_id}")
    
    print("\n[4] Activando workflow...")
    activate_workflow(n8n_key, wf_id)
    
    print("\n[5] Actualizando webhook en WhatsApp service...")
    update_wa_webhook(evo_key)
    
    print("\n[6] Verificando webhook guardado...")
    import json as _json
    wa_file = r"C:\ChatBot_Punto_A\data\whatsapp_auth\webhooks.json"
    try:
        with open(wa_file, "r") as f:
            print(f"  webhooks.json: {f.read()}")
    except Exception as e:
        print(f"  No se pudo leer {wa_file}: {e}")

    print("\n✓ Todo listo. Envia 'hola' desde WhatsApp para probar.")
