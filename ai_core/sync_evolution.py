import requests
import subprocess
import json

def run_sql(q):
    cmd = ["docker", "exec", "chatbot_punto_a_postgres", "psql", "-U", "chatbot_punto_a", "-d", "chatbot_punto_a", "-A", "-t", "-c", q]
    res = subprocess.run(cmd, capture_output=True, text=True)
    return res.stdout.strip()

def get_evo_key():
    r = subprocess.run(["docker","inspect","chatbot_punto_a_whatsapp","--format","{{range .Config.Env}}{{println .}}{{end}}"], capture_output=True, text=True)
    for line in r.stdout.splitlines():
        if line.startswith("AUTHENTICATION_API_KEY="):
            return line.split("=",1)[1].strip()
    return None

try:
    evo_key = get_evo_key()
    if not evo_key:
        print(" [!] Error: No se encontro la API Key de Evolution.")
        exit(1)
        
    webhook_url = "http://host.docker.internal:5000/webhook/whatsapp"
    
    print(" [+] Esperando a que el puente de WhatsApp este listo...")
    for i in range(10): # 10 intentos
        try:
            r_evo = requests.put(
                f"http://localhost:8080/webhook/set/chatbot_punto_a",
                headers={"apikey": evo_key, "Content-Type": "application/json"},
                json={"url": webhook_url},
                timeout=5
            )
            if r_evo.status_code == 200:
                print(f" [+] EXITO: El puente de WhatsApp ya esta enviando datos al NUCLEO IA V2.01")
                break
        except:
            pass
        print(f"  ... reintentando conexion ({i+1}/10)")
        import time
        time.sleep(5)

except Exception as e:
    print(f"Error: {e}")
