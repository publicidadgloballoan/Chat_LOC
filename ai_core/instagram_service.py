# ============================================================
# ⚠️  DEPRECATED — NO USAR
# ============================================================
# Este servicio fue reemplazado por:
#   ai_core/meta_service/server.js
#
# Razón: instagrapi usa scraping/reverse engineering de la API privada
# de Instagram. Meta detecta y banea cuentas. Es ToS violation.
#
# La nueva implementación usa Instagram Messaging API (oficial)
# via Meta Cloud API, integrada en meta_service.
#
# Fecha de deprecación: Julio 2026
# Reemplazado por: Meta Instagram Graph API via meta_service
# ============================================================

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

WEBHOOK_TARGET = "http://127.0.0.1:5000/webhook"
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

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "active_instances": list(clients.keys())})

@app.route('/instance/create', methods=['POST'])
def create_instance():
    data = request.json or {}
    inst = data.get('instanceName')
    creds = data.get('credentials', {})
    user = creds.get('user') or creds.get('username')
    password = creds.get('password')
    two_factor = creds.get('twoFactorCode') or creds.get('two_factor_code') or creds.get('verification_code') or creds.get('otp')
    sessionid = creds.get('sessionid') or creds.get('session_id')
    
    if not sessionid and (not user or not password):
        return jsonify({"status": "error", "message": "Faltan credenciales de IG (user y password, o sessionid)"}), 400
    
    try:
        cl = Client()
        cl.delay_range = [1, 3]
        cl.set_device({
            "app_version": "385.0.0.47.74",
            "android_version": 33,
            "android_release": "13.0",
            "dpi": "480dpi",
            "resolution": "1080x2400",
            "manufacturer": "Samsung",
            "device": "SM-S911B",
            "model": "Galaxy S23",
            "cpu": "qcom",
            "version_code": "378906843"
        })
        cl.set_user_agent("Instagram 385.0.0.47.74 Android (33/13.0; 480dpi; 1080x2400; Samsung; SM-S911B; Galaxy S23; qcom; es_LA; 378906843)")
        session_file = os.path.join(SESSIONS_DIR, f"{inst}.json")
        
        logged_in = False
        if sessionid:
            logger.info(f" [IG] Intentando login con sessionid para {inst}...")
            cl.login_by_sessionid(sessionid.strip())
            cl.dump_settings(session_file)
            logged_in = True
        elif os.path.exists(session_file):
            try:
                cl.load_settings(session_file)
                if user and password and cl.login(user, password):
                    logged_in = True
                    logger.info(f" [IG] Sesión reanudada desde archivo para {inst}")
            except Exception as e_load:
                logger.warn(f" [IG] No se pudo reanudar sesión: {e_load}, intentando login nuevo...")

        if not logged_in and user and password:
            clean_user = user.split('@')[0].strip() if '@' in user else user.strip()
            if two_factor:
                logger.info(f" [IG] Intentando login con 2FA ({two_factor}) para {clean_user}...")
                cl.login(clean_user, password, verification_code=str(two_factor).strip())
            else:
                logger.info(f" [IG] Intentando login directo para {clean_user}...")
                cl.login(clean_user, password)
            cl.dump_settings(session_file)
            
        clients[inst] = cl
        
        # Iniciar hilo de monitoreo si no existe
        if inst not in poll_threads or not poll_threads[inst].is_alive():
            t = threading.Thread(target=instagram_poll, args=(inst, cl), daemon=True)
            t.start()
            poll_threads[inst] = t
            
        logger.info(f" [OK] Instagram conectado con éxito para {inst}")
        return jsonify({"status": "SUCCESS", "message": f"IG conectado para {inst}"})
    except Exception as e:
        logger.error(f" [!] Error login IG ({inst}): {e}")
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
