import os
import sys
import json
import sqlite3
import random
import time
import re

sys.stdout.reconfigure(encoding='utf-8')

DB_PATH = r"c:\SaaSIA\ai_core\config\brain_sessions.db"

def setup_campaign():
    conn = sqlite3.connect(DB_PATH, timeout=30)
    c = conn.cursor()

    company_id = 4
    instance_name = "mkt_colab"

    # 1. Crear o reutilizar Plantilla
    template_text = (
        "Hola {Nombre}, ¿cómo estás? Te escribo porque estoy armando la red de Asesores Comerciales de "
        "Colaboratium, la primera plataforma P2P registrada ante el BCRA (Nº 40.015).\n\n"
        "Estamos sumando profesionales del sector financiero para comercializar inversiones atomizadas "
        "por IA con retornos muy superiores a la banca tradicional.\n\n"
        "Ofrecemos hasta un 6% de comisión por colocación con acreditación directa en tu CVU.\n\n"
        "¿Tenés 10 minutos esta semana para mostrarte la propuesta y el esquema de comisiones?"
    )

    c.execute("SELECT id FROM mkt_templates WHERE name='Reclutamiento Asesores Colaboratium' AND company_id=?", (company_id,))
    t_row = c.fetchone()
    if t_row:
        template_id = t_row[0]
    else:
        c.execute("""INSERT INTO mkt_templates (name, content, company_id)
                     VALUES ('Reclutamiento Asesores Colaboratium', ?, ?)""", (template_text, company_id))
        template_id = c.lastrowid
    print(f"✓ Plantilla cargada (ID: {template_id})")

    # 2. Crear nueva Campaña de 20 Contactos hoy
    campaign_name = f"Campaña Tanda 1 (20 Contactos) - {time.strftime('%Y-%m-%d %H:%M')}"
    c.execute("""INSERT INTO mkt_campaigns (name, status, template, delay_seconds, company_id)
                 VALUES (?, 'active', ?, 360, ?)""", (campaign_name, template_text, company_id))
    campaign_id = c.lastrowid
    print(f"✓ Campaña creada (ID: {campaign_id}, Nombre: '{campaign_name}')")

    # 3. Seleccionar 20 contactos aleatorios con Nombre y Apellido de la Agenda de ComunicacionMKT
    c.execute("""SELECT name, phone, email, dni FROM contacts_agenda 
                 WHERE company_id=? AND name IS NOT NULL AND name != '' AND name != 'Candidato Comercial'
                 ORDER BY RANDOM() LIMIT 20""", (company_id,))
    contacts = c.fetchall()

    if not contacts:
        # Fallback a cualquier contacto si no hay filtro estricto
        c.execute("""SELECT name, phone, email, dni FROM contacts_agenda 
                     WHERE company_id=? ORDER BY RANDOM() LIMIT 20""", (company_id,))
        contacts = c.fetchall()

    added_contacts = 0
    for name, phone, email, dni in contacts:
        c.execute("""INSERT INTO mkt_contacts (campaign_id, trace_id, phone, email, name, status, channel)
                     VALUES (?, ?, ?, ?, ?, 'pending', 'WA')""",
                  (campaign_id, f"MKT_{campaign_id}_{phone}", phone, email, name))
        added_contacts += 1

    conn.commit()
    conn.close()
    print(f"✓ Se agregaron {added_contacts} contactos a la cola de envío de la Campaña #{campaign_id}")
    return campaign_id, contacts

def check_and_wait_time_window(start_hour=8, end_hour=20):
    """Garantiza que los envíos solo se realicen en la franja permitida (8:00 a 20:00 hs)"""
    while True:
        now = time.localtime()
        current_hour = now.tm_hour
        if start_hour <= current_hour < end_hour:
            break
        else:
            if current_hour >= end_hour:
                seconds_to_wait = ((24 - current_hour + start_hour) * 3600) - (now.tm_min * 60) - now.tm_sec
            else:
                seconds_to_wait = ((start_hour - current_hour) * 3600) - (now.tm_min * 60) - now.tm_sec
            
            hours_wait = round(seconds_to_wait / 3600, 2)
            timestamp_str = time.strftime("%H:%M:%S")
            print(f"[{timestamp_str}] 🌙 Fuera de horario permitido (8:00 hs a 20:00 hs). Pausado por {hours_wait} hs (hasta las 08:00 AM)...")
            time.sleep(min(seconds_to_wait, 900)) # Re-chequear cada 15 min máximo

def run_campaign_execution(campaign_id, rate_per_hour=20):
    sys.path.append(r"c:\SaaSIA\ai_core")
    from nucleo_ia import _send, log_message, update_session

    conn = sqlite3.connect(DB_PATH, timeout=60)
    conn.execute("PRAGMA busy_timeout = 60000")
    c = conn.cursor()

    c.execute("SELECT id, name, template FROM mkt_campaigns WHERE id=?", (campaign_id,))
    camp = c.fetchone()
    if not camp:
        print(f"Error: Campaña #{campaign_id} no encontrada.")
        return

    camp_id, camp_name, raw_template = camp

    c.execute("SELECT id, name, phone FROM mkt_contacts WHERE campaign_id=? AND status='pending' ORDER BY id ASC", (campaign_id,))
    pending_list = c.fetchall()

    print(f"\n==================================================")
    print(f"🚀 INICIANDO EJECUCIÓN PROGRAMADA TANDA DE 50 CONTACTOS")
    print(f"Campaña: #{camp_id} - {camp_name}")
    print(f"Total en cola: {len(pending_list)} contactos")
    print(f"Ritmo configurado: {rate_per_hour} contactos por hora (~3 min entre envíos)")
    print(f"Franja Horaria Permitida: 08:00 AM a 20:00 PM (Lunes a Domingo)")
    print(f"==================================================\n")

    sent_count = 0
    total = len(pending_list)

    for idx, (mkt_c_id, full_name, phone) in enumerate(pending_list, 1):
        # 1. Verificar franja horaria (8 a 20 hs)
        check_and_wait_time_window(8, 20)

        # Extraer primer nombre propio para personalización cercana
        first_name = full_name.strip().split()[0].capitalize() if full_name else "ahí"

        # Variaciones Spintax multidimensionales para variaciones únicas en cada envío
        greetings = [
            f"Hola {first_name}, ¿cómo estás?",
            f"Buenas {first_name}, ¿cómo te va?",
            f"Hola {first_name}, ¿qué tal?",
            f"Buenas tardes {first_name}, ¿cómo estás?",
            f"Hola {first_name}, espero que andes muy bien."
        ]
        
        intros = [
            "Te escribo porque estamos armando la red de Asesores Comerciales de Colaboratium, la primera plataforma P2P registrada ante el BCRA (Nº 40.015).",
            "Te contacto porque estamos sumando profesionales a la red de Asesores Comerciales de Colaboratium, la fintech P2P registrada en el BCRA (Nº 40.015).",
            "Te escribo brevemente ya que estamos expandiendo el equipo de Asesores Comerciales de Colaboratium, primera plataforma P2P regulada por el BCRA (Nº 40.015).",
            "Te escribo porque estamos consolidando la red oficial de Asesores Comerciales para Colaboratium, plataforma de créditos P2P (BCRA Nº 40.015)."
        ]
        
        value_props = [
            "Estamos sumando profesionales del sector financiero para comercializar inversiones atomizadas por IA con retornos muy superiores a la banca tradicional. Ofrecemos hasta un 6% de comisión por colocación con acreditación directa en tu CVU.",
            "Buscamos perfiles del ámbito financiero para comercializar opciones de inversión atomizadas por IA con retornos de alto rendimiento. Pagamos hasta un 6% de comisión por colocación con acreditación directa en tu CVU.",
            "Sumamos especialistas del sector interesados en comercializar créditos atomizados mediante IA con rendimientos muy superiores a la banca tradicional. Reconocemos hasta un 6% de comisión con acreditación directa a tu CVU."
        ]
        
        closings = [
            "¿Tenés 10 minutos esta semana para mostrarte la propuesta y el esquema de comisiones?",
            "¿Tendrás 10 minutos disponibles estos días para repasar la propuesta y el esquema de comisiones?",
            "¿Cómo venís de tiempos esta semana para tener una breve charla de 10 minutos y contarte los detalles?",
            "¿Disponés de 10 minutos esta semana para mostrarte cómo funciona y la tabla de comisiones?"
        ]

        if raw_template and any(k in raw_template for k in ['Nombre', 'nombre', '{{nombre}}', '[Nombre]', '(nombre)']):
            message_text = re.sub(r'\{\{\s*nombre\s*\}\}', first_name, raw_template, flags=re.IGNORECASE)
            message_text = re.sub(r'[\{\[\(]\s*nombre\s*[\}\]\)]', first_name, message_text, flags=re.IGNORECASE)
            message_text = message_text.replace('Nombre de Ejemplo', first_name)
        else:
            message_text = f"{random.choice(greetings)}\n\n{random.choice(intros)}\n\n{random.choice(value_props)}\n\n{random.choice(closings)}"

        jid = f"{phone}@s.whatsapp.net"
        instance_name = "mkt_colab"

        timestamp_str = time.strftime("%H:%M:%S")
        print(f"[{timestamp_str}] Enviando ({idx}/{total}) a {full_name} ({phone})...")

        try:
            # Enviar por WhatsApp
            _send(jid, instance_name, message_text)

            # Actualizar base de datos
            c.execute("UPDATE mkt_contacts SET status='sent' WHERE id=?", (mkt_c_id,))
            c.execute("""INSERT INTO mkt_execution_logs (campaign_id, contact_name, channel, status, message)
                         VALUES (?, ?, 'WA', 'sent', ?)""", (camp_id, full_name, message_text))
            
            # Registrar en sesiones e historial
            update_session(phone, instance_name, channel='WA', last_origin='MKT_CAMPAIGN', update_outgoing=True)
            conn.commit()

            sent_count += 1
            print(f"  └─ ✅ Enviado exitosamente a {full_name}.")

        except Exception as err:
            print(f"  └─ ❌ Error al enviar a {phone}: {err}")
            c.execute("UPDATE mkt_contacts SET status='failed' WHERE id=?", (mkt_c_id,))
            conn.commit()

        # Si aún quedan mensajes por enviar, esperar ritmo de 20 por hora (aprox 3 min / 180s con Jitter)
        if idx < total:
            delay_seconds = random.randint(165, 195) # ~3 minutos (20 contactos por hora)
            delay_mins = round(delay_seconds / 60, 2)
            print(f"  ⏳ Ritmo 20/hs: esperando {delay_mins} min ({delay_seconds}s) antes del próximo envío...\n")
            time.sleep(delay_seconds)

    # Marcar campaña como completada
    c.execute("UPDATE mkt_campaigns SET status='completed' WHERE id=?", (camp_id,))
    conn.commit()
    conn.close()

    print(f"\n🎉 CAMPAÑA #{camp_id} COMPLETADA FINALMENTE ({sent_count}/{total} ENVIADOS EXITOSAMENTE)")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--execute":
        camp_id = int(sys.argv[2]) if len(sys.argv) > 2 else 1
        run_campaign_execution(camp_id)
    else:
        camp_id, contacts = setup_campaign()
        print("\nPara iniciar el envío automático de los 20 contactos con retrasos de 4 a 8 min en segundo plano, ejecuta:")
        print(f"python run_mkt_campaign_colab.py --execute {camp_id}")
