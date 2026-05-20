import time
import threading
import os
import json
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from instagrapi import Client

# --- CONFIGURACION ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

WEBHOOK_TARGET = "http://localhost:5000/webhook"
SESSIONS_DIR = "ig_sessions"
os.makedirs(SESSIONS_DIR, exist_ok=True)

clients = {} # { instance_name: Client }
poll_threads = {} # { instance_name: Thread }

def instagram_poll(instance_name, client):
    """Monitorea DMs de Instagram y los envia al webhook."""
    logger.info(f" [+] Iniciando monitoreo de IG para {instance_name}")
    last_processed_id = None
    
    while instance_name in clients:
        try:
            # Obtener hilos de conversacion pendientes
            threads = client.direct_threads(amount=10)
            for thread in threads:
                messages = client.direct_messages(thread.id, amount=5)
                for msg in messages:
                    # No procesar mensajes propios
                    if str(msg.user_id) == str(client.user_id):
                        continue
                    
                    # Evitar duplicados (id de mensaje)
                    mid = f"ig_{msg.id}"
                    
                    # Enviar al webhook en el formato esperado por Nucleo IA
                    payload = {
                        "instance": instance_name,
                        "data": {
                            "key": {
                                "remoteJid": f"{msg.user_id}@instagram",
                                "fromMe": False,
                                "id": mid
                            },
                            "message": {
                                "conversation": msg.text
                            },
                            "pushName": thread.users[0].username if thread.users else "IG User",
                            "messageTimestamp": int(msg.timestamp.timestamp())
                        }
                    }
                    
                    # Nucleo IA hara el dedup final
                    try:
                        requests.post(WEBHOOK_TARGET, json=payload, timeout=5)
                    except Exception as e:
                        logger.error(f" [!] Error enviando a webhook: {e}")
            
            time.sleep(10) # Poll cada 10 segundos
        except Exception as e:
            logger.error(f" [!] Error en poll de IG ({instance_name}): {e}")
            time.sleep(30)

@app.route('/instance/create', methods=['POST'])
def create_instance():
    data = request.json
    inst = data.get('instanceName')
    creds = data.get('credentials', {})
    user = creds.get('user')
    password = creds.get('password')
    
    if not user or not password:
        return jsonify({"status": "error", "message": "Faltan credenciales de IG"}), 400
    
    try:
        cl = Client()
        session_file = os.path.join(SESSIONS_DIR, f"{inst}.json")
        
        if os.path.exists(session_file):
            cl.load_settings(session_file)
            cl.login(user, password)
        else:
            cl.login(user, password)
            cl.dump_settings(session_file)
            
        clients[inst] = cl
        
        # Iniciar hilo de monitoreo
        if inst not in poll_threads:
            t = threading.Thread(target=instagram_poll, args=(inst, cl), daemon=True)
            t.start()
            poll_threads[inst] = t
            
        return jsonify({"status": "SUCCESS", "message": "IG conectado localmente"})
    except Exception as e:
        logger.error(f" [!] Error login IG: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/message/sendText/<instance_name>', methods=['POST'])
def send_message(instance_name):
    data = request.json
    jid = data.get('number') # ej: 12345@instagram
    text = data.get('text')
    
    cl = clients.get(instance_name)
    if not cl:
        return jsonify({"status": "error", "message": "Instancia no encontrada"}), 404
        
    try:
        user_id = jid.split('@')[0]
        logger.info(f" [IG-SEND] Enviando mensaje a {user_id}: {text}")
        cl.direct_send(text, user_ids=[user_id])
        return jsonify({"status": "SUCCESS"})
    except Exception as e:
        logger.error(f" [!] Error enviando IG: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/instances', methods=['GET'])
def list_instances():
    return jsonify(list(clients.keys()))

def load_existing_sessions():
    """Carga sesiones guardadas al iniciar el servidor."""
    if not os.path.exists(SESSIONS_DIR):
        return
    for file in os.listdir(SESSIONS_DIR):
        if file.endswith(".json"):
            inst = file.replace(".json", "")
            logger.info(f" [*] Recuperando sesion IG para {inst}...")
            try:
                cl = Client()
                cl.load_settings(os.path.join(SESSIONS_DIR, file))
                clients[inst] = cl
                t = threading.Thread(target=instagram_poll, args=(inst, cl), daemon=True)
                t.start()
                poll_threads[inst] = t
                logger.info(f" [OK] Sesion IG {inst} recuperada.")
            except Exception as e:
                logger.error(f" [!] Error recuperando {inst}: {e}")

if __name__ == '__main__':
    load_existing_sessions()
    app.run(host='0.0.0.0', port=8081, debug=False)
