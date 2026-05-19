import subprocess, json, sys
try:
    import requests
except ImportError:
    subprocess.run([sys.executable, "-m", "pip", "install", "requests", "-q"])
    import requests

N8N_URL = "http://localhost:5678"
WA_URL  = "http://localhost:8080"
INSTANCE = "chatbot_punto_a"

# 1. Leer evolution apikey
r = subprocess.run(
    ["docker", "inspect", "chatbot_punto_a_whatsapp",
     "--format", "{{range .Config.Env}}{{println .}}{{end}}"],
    capture_output=True, text=True
)
evo_key = ""
for line in r.stdout.splitlines():
    if line.startswith("AUTHENTICATION_API_KEY="):
        evo_key = line.split("=", 1)[1].strip()
        break
print(f"[OK] Evolution key: {evo_key[:12]}...")

# 2. Actualizar webhook via PUT
webhook_url = "http://n8n:5678/webhook/whatsapp"
resp = requests.put(
    f"{WA_URL}/webhook/set/{INSTANCE}",
    headers={"apikey": evo_key, "Content-Type": "application/json"},
    json={"url": webhook_url},
    timeout=10
)
print(f"[Webhook SET] HTTP {resp.status_code}: {resp.text[:200]}")

# 3. Verificar el webhooks.json resultante
import pathlib
wh_file = pathlib.Path(r"C:\ChatBot_Punto_A\data\whatsapp_auth\webhooks.json")
if wh_file.exists():
    print(f"[Webhooks.json] {wh_file.read_text()}")
else:
    print("[WARN] webhooks.json no encontrado")

print("\n[LISTO] Envía 'hola' desde WhatsApp para probar.")
