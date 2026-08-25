import urllib.request
import json
import sqlite3
import time
import uuid
import sys

sys.stdout.reconfigure(encoding='utf-8')

def run_test():
    print("=== INICIANDO PRUEBA COMPLETA DE FLUJO IABOX ===")
    
    # 1. Configurar conexión simulada para instancia iabox_flow_test -> company_id 3
    db = sqlite3.connect(r'c:\SaaSIA\ai_core\config\brain_sessions.db')
    c = db.cursor()
    c.execute("INSERT OR REPLACE INTO connections (id, instance, phone, channel, company_id) VALUES (33, 'iabox_flow_test', '5491124013981', 'whatsapp', 3)")
    test_phone = "5491136822400"
    c.execute("DELETE FROM sessions WHERE phone=? AND instance='iabox_flow_test'", (test_phone,))
    c.execute("DELETE FROM contacts_agenda WHERE phone=?", (test_phone,))
    db.commit()
    db.close()

    def send_msg(text):
        msg_id = f"FLOW_{uuid.uuid4().hex[:8]}"
        payload = {
            'instance': 'iabox_flow_test',
            'data': {
                'key': {
                    'remoteJid': f"{test_phone}@s.whatsapp.net",
                    'fromMe': False,
                    'id': msg_id
                },
                'message': {'conversation': text},
                'pushName': 'Cliente Nuevo'
            }
        }
        req = urllib.request.Request('http://127.0.0.1:5000/webhook', data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req) as resp:
            pass
        time.sleep(3.5)
        
        # Leer último log de salida
        db_read = sqlite3.connect(r'c:\SaaSIA\ai_core\config\brain_sessions.db')
        c_r = db_read.cursor()
        c_r.execute("SELECT message FROM logs WHERE phone=? AND instance='iabox_flow_test' AND direction='out' ORDER BY rowid DESC LIMIT 1", (test_phone,))
        last_resp = c_r.fetchone()
        db_read.close()
        return last_resp[0] if last_resp else "Sin respuesta"

    # PASO 1: Saludo inicial de cliente sin datos
    print("\n--- TEST 1: Cliente saluda sin datos cargados ---")
    r1 = send_msg("Hola buenas tardes")
    print("Respuesta Bot:\n", r1)

    # PASO 2: Cliente envía sus datos
    print("\n--- TEST 2: Cliente envía Nombre, DNI, Email y Teléfono ---")
    r2 = send_msg("Mi nombre es Juan Perez, DNI 35123456, email juanperez@gmail.com, tel 1136822400")
    print("Respuesta Bot:\n", r2)

    # PASO 3: Consulta por Oficina Virtual
    print("\n--- TEST 3: Consulta por Oficina Virtual ---")
    r3 = send_msg("Quiero saber el precio de la oficina virtual y que incluye")
    print("Respuesta Bot:\n", r3)

    # PASO 4: Cliente confirma que quiere hablar con un asesor
    print("\n--- TEST 4: Cliente dice 'Sí, quiero contratar con un asesor' ---")
    r4 = send_msg("Sí, me interesa contratar con un asesor humano")
    print("Respuesta Bot:\n", r4)

    # PASO 5: Verificar ticket generado y notificación a 1124013981
    db_chk = sqlite3.connect(r'c:\SaaSIA\ai_core\config\brain_sessions.db')
    c_chk = db_chk.cursor()
    c_chk.execute("SELECT id, phone, status, company_id, summary_ia FROM tickets WHERE phone=? ORDER BY id DESC LIMIT 1", (test_phone,))
    tk = c_chk.fetchone()
    print("\n[OK] TICKET EN BD:", tk)

    c_chk.execute("SELECT message, phone, created_at FROM logs WHERE phone LIKE '%1124013981%' ORDER BY rowid DESC LIMIT 1")
    notif = c_chk.fetchone()
    print("\n[OK] NOTIFICACION ENVIADA A LINEA IABOX (1124013981):\n", notif[0] if notif else "No encontrada")
    
    # Verificar datos guardados en contacts_agenda
    c_chk.execute("SELECT name, phone, email, dni FROM contacts_agenda WHERE phone=?", (test_phone,))
    ag = c_chk.fetchone()
    print("\n[OK] DATOS EN AGENDA (contacts_agenda):", ag)
    db_chk.close()

if __name__ == '__main__':
    run_test()
