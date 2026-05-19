import requests

EVO_URL = "http://localhost:8080"
EVO_API_KEY = "03d27a0c34fa708178148142d6f5eedc86cd5e3a"
instances = ["colab_pro", "nico_ventas_wa", "nico_ventas_canal", "colab_global_sa", "colab_pro_phone"]

def set_webhook(inst):
    url = f"{EVO_URL}/webhook/instance/set/{inst}"
    headers = {"apikey": EVO_API_KEY, "Content-Type": "application/json"}
    data = {
        "enabled": True,
        "url": "http://localhost:5000/webhook",
        "webhook_by_events": False,
        "events": ["MESSAGES_UPSERT", "MESSAGES_UPDATE"]
    }
    try:
        res = requests.post(url, headers=headers, json=data, timeout=10)
        print(f"Set webhook for {inst}: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"Error for {inst}: {e}")

for i in instances:
    set_webhook(i)
