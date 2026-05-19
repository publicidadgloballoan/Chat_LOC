import time
import threading
import os
import json
import logging
import asyncio
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from telegram import Bot, Update
from telegram.ext import ApplicationBuilder, ContextTypes, MessageHandler, filters

# --- CONFIGURACION ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

WEBHOOK_TARGET = "http://localhost:5000/webhook"
SESSIONS_FILE = "tg_sessions.json"

apps = {} # { instance_name: Application }

def save_sessions():
    try:
        data = {inst: apps[inst].bot.token for inst in apps}
        with open(SESSIONS_FILE, "w") as f:
            json.dump(data, f)
    except Exception as e:
        logger.error(f" [!] Error guardando sesiones TG: {e}")

def load_sessions():
    if os.path.exists(SESSIONS_FILE):
        try:
            with open(SESSIONS_FILE, "r") as f:
                return json.load(f)
        except:
            return {}
    return {}

async def handle_tg_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Callback para mensajes de Telegram."""
    logger.info(f" [TG-DEBUG] Update recibido: {update.to_dict()}")
    if not update.message or not update.message.text:
        logger.info(" [TG-DEBUG] Mensaje omitido (no es texto o no hay mensaje)")
        return

    instance_name = context.application.bot_data.get("instance_name")
    msg = update.message
    user = msg.from_user
    
    logger.info(f" [TG-RECV] Mensaje de {user.username or user.id} en {instance_name}: {msg.text}")
    
    payload = {
        "instance": instance_name,
        "data": {
            "key": {
                "remoteJid": f"{user.id}@telegram",
                "fromMe": False,
                "id": f"tg_{msg.message_id}"
            },
            "message": {
                "conversation": msg.text
            },
            "pushName": user.full_name or user.username or "TG User",
            "messageTimestamp": int(msg.date.timestamp())
        }
    }
    
    try:
        logger.info(f" [TG-WEBHOOK] Enviando a {WEBHOOK_TARGET} para instancia {instance_name}")
        r = requests.post(WEBHOOK_TARGET, json=payload, timeout=5)
        logger.info(f" [TG-WEBHOOK-RES] Status: {r.status_code}")
    except Exception as e:
        logger.error(f" [!] Error enviando a webhook TG: {e}")

async def start_tg_bot(instance_name, token):
    """Inicia un bot de Telegram."""
    try:
        logger.info(f" [+] Preparando bot TG para {instance_name} con token {token[:10]}...")
        
        # Manejar TODO, incluyendo comandos y texto normal
        application = ApplicationBuilder().token(token).build()
        application.bot_data["instance_name"] = instance_name
        application.add_handler(MessageHandler(filters.ALL, handle_tg_message))
        
        apps[instance_name] = application
        
        await application.initialize()
        await application.start()
        await application.updater.start_polling()
        logger.info(f" [OK] Bot TG {instance_name} iniciado y escuchando.")
        save_sessions()
    except Exception as e:
        logger.error(f" [!] Error iniciando bot TG ({instance_name}): {e}")

@app.route('/instance/create', methods=['POST'])
def create_instance():
    data = request.json
    inst = data.get('instanceName')
    creds = data.get('credentials', {})
    token = creds.get('token') or creds.get('password')
    
    if not token:
        return jsonify({"status": "error", "message": "Falta el Token de Telegram"}), 400
    
    def run_async_bot():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(start_tg_bot(inst, token))
        loop.run_forever()
        
    threading.Thread(target=run_async_bot, daemon=True).start()
    return jsonify({"status": "SUCCESS", "message": "Telegram conectado localmente"})

@app.route('/message/sendText/<instance_name>', methods=['POST'])
def send_message(instance_name):
    data = request.json
    jid = data.get('number')
    text = data.get('text')
    app_tg = apps.get(instance_name)
    if not app_tg:
        return jsonify({"status": "error", "message": "Instancia no encontrada"}), 404
    try:
        user_id = jid.split('@')[0]
        async def do_send():
            await app_tg.bot.send_message(chat_id=user_id, text=text)
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(do_send())
        logger.info(f" [TG-SENT] Enviado a {jid} via {instance_name}")
        return jsonify({"status": "SUCCESS"})
    except Exception as e:
        logger.error(f" [!] Error enviando TG: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/message/sendMedia/<instance_name>', methods=['POST'])
def send_media(instance_name):
    data = request.json
    jid = data.get('number')
    mediatype = data.get('mediatype') # image, video, document
    media_base64 = data.get('media')
    caption = data.get('caption', '')
    fileName = data.get('fileName', 'file')
    
    app_tg = apps.get(instance_name)
    if not app_tg:
        return jsonify({"status": "error", "message": "Instancia no encontrada"}), 404
        
    try:
        import io
        user_id = jid.split('@')[0]
        media_bytes = io.BytesIO(import_base64.b64decode(media_base64))
        
        async def do_send():
            if mediatype == 'image':
                await app_tg.bot.send_photo(chat_id=user_id, photo=media_bytes, caption=caption)
            elif mediatype == 'video':
                await app_tg.bot.send_video(chat_id=user_id, video=media_bytes, caption=caption)
            else:
                await app_tg.bot.send_document(chat_id=user_id, document=media_bytes, filename=fileName, caption=caption)
            
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(do_send())
        logger.info(f" [TG-MEDIA-SENT] {mediatype} enviado a {jid} via {instance_name}")
        return jsonify({"status": "SUCCESS"})
    except Exception as e:
        logger.error(f" [!] Error enviando media TG: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

import base64 as import_base64

def auto_start():
    sessions = load_sessions()
    for inst, token in sessions.items():
        logger.info(f" [+] Auto-iniciando TG: {inst}")
        def run_async_bot(i, t):
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(start_tg_bot(i, t))
            loop.run_forever()
        threading.Thread(target=run_async_bot, args=(inst, token), daemon=True).start()

if __name__ == '__main__':
    auto_start()
    app.run(host='0.0.0.0', port=8082, debug=False)
