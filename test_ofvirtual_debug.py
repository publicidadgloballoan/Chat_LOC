import sqlite3
import urllib.request
import json
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

def test_ofvirtual():
    print("=== TEST OFVIRTUAL (IABOX) ===")
    test_phone = "5491136822400"
    db = sqlite3.connect(r'c:\SaaSIA\ai_core\config\brain_sessions.db')
    db.execute("DELETE FROM sessions WHERE phone=? AND instance='ofVirtual'", (test_phone,))
    db.execute("DELETE FROM contacts_agenda WHERE phone=?", (test_phone,))
    db.execute("DELETE FROM tickets WHERE phone=?", (test_phone,))
    db.commit()
    db.close()

    def send(txt):
        payload = {
            'instance': 'ofVirtual',
            'data': {
                'key': {
                    'remoteJid': f"{test_phone}@s.whatsapp.net",
                    'fromMe': False,
                    'id': f"TEST_{int(time.time()*1000)}"
                },
                'message': {'conversation': txt},
                'pushName': 'Juan Perez'
            }
        }
        req = urllib.request.Request('http://127.0.0.1:5000/webhook', data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req) as resp:
            pass
        time.sleep(4)
        db_r = sqlite3.connect(r'c:\SaaSIA\ai_core\config\brain_sessions.db')
        c = db_r.cursor()
        c.execute("SELECT message FROM logs WHERE phone=? AND instance='ofVirtual' AND direction='out' ORDER BY rowid DESC LIMIT 1", (test_phone,))
        row = c.fetchone()
        db_r.close()
        return row[0] if row else "Sin respuesta"

    print("\n--- PASO 1: Saludo inicial ---")
    r1 = send("Hola buenas tardes")
    print("Bot:\n", r1)

    print("\n--- PASO 2: Envío de datos cliente ---")
    r2 = send("Me llamo Juan Perez, DNI 35123456, email juanperez@gmail.com, tel 1136822400")
    print("Bot:\n", r2)

    print("\n--- PASO 3: Consulta por Oficina Virtual ---")
    r3 = send("Quiero saber el precio de la oficina virtual y que incluye")
    print("Bot:\n", r3)

    print("\n--- PASO 4: Derivación a asesor humano ---")
    r4 = send("Sí, me interesa contratar con un asesor humano")
    print("Bot:\n", r4)

    # Verificar ticket y notificación
    db_c = sqlite3.connect(r'c:\SaaSIA\ai_core\config\brain_sessions.db')
    c = db_c.cursor()
    c.execute("SELECT id, phone, status, company_id, summary_ia FROM tickets WHERE phone=? ORDER BY id DESC LIMIT 1", (test_phone,))
    print("\n[OK] TICKET CREADO:", c.fetchone())

    c.execute("SELECT message FROM logs WHERE phone LIKE '%1124013981%' AND direction='out' ORDER BY rowid DESC LIMIT 1")
    notif = c.fetchone()
    print("\n[OK] NOTIFICACION A 1124013981:\n", notif[0] if notif else "No encontrada")
    db_c.close()

if __name__ == '__main__':
    test_ofvirtual()
