import requests
import time

EVO_URL = "http://127.0.0.1:8080"
EVO_API_KEY = "03d27a0c34fa708178148142d6f5eedc86cd5e3a"
BACKEND_WEBHOOK = "http://127.0.0.1:5000/webhook/whatsapp"

instances = ["chatbot_punto_a", "colab_global_sa", "colab_pro_asesores", "nico_ventas_canal"]

def activate_instance(name):
    print(f"[*] Activando/Sincronizando: {name}")
    headers = {"apikey": EVO_API_KEY, "Content-Type": "application/json"}
    
    # 1. Crear si no existe
    create_url = f"{EVO_URL}/instance/create"
    payload = {
        "instanceName": name,
        "integration": "WHATSAPP-BAILEYS",
        "qrcode": True
    }
    requests.post(create_url, headers=headers, json=payload)
    
    # 2. Actualizar Webhook
    print(f"[*] Configurando Webhook para {name} -> {BACKEND_WEBHOOK}")
    webhook_url = f"{EVO_URL}/webhook/update/{name}"
    webhook_payload = {
        "enabled": True,
        "url": BACKEND_WEBHOOK,
        "webhook_by_events": False,
        "events": ["MESSAGES_UPSERT"]
    }
    res = requests.post(webhook_url, headers=headers, json=webhook_payload)
    if res.status_code == 200:
        print(f"[OK] Webhook sincronizado para {name}")
    else:
        print(f"[!] Error sincronizando webhook para {name}: {res.text}")

if __name__ == "__main__":
    for inst in instances:
        activate_instance(inst)
        time.sleep(1)
