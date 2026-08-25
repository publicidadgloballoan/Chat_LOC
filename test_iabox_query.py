import urllib.request
import json
import sqlite3
import time
import uuid

# Registrar conexion temporal para pruebas de instancia iabox_test -> company 3
db = sqlite3.connect(r'c:\SaaSIA\ai_core\config\brain_sessions.db')
c = db.cursor()
c.execute("INSERT OR REPLACE INTO connections (id, instance, phone, channel, company_id) VALUES (30, 'iabox_test', '5491124013981', 'whatsapp', 3)")
db.commit()
db.close()

msg_id = f"TEST_IABOX_{uuid.uuid4().hex[:8]}"

payload = {
    'instance': 'iabox_test',
    'data': {
        'key': {
            'remoteJid': '5491136822400@s.whatsapp.net',
            'fromMe': False,
            'id': msg_id
        },
        'message': {
            'conversation': 'Hola, que servicios tienen y que sale la oficina virtual y el box estandar?'
        },
        'pushName': 'Damian'
    }
}

req = urllib.request.Request('http://127.0.0.1:5000/webhook', data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as resp:
    print('Webhook status:', resp.status)

time.sleep(3)
