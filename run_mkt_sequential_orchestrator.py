import os
import sys
import json
import sqlite3
import random
import time
import re
import pandas as pd

sys.stdout.reconfigure(encoding='utf-8')

DB_PATH = r"c:\SaaSIA\ai_core\config\brain_sessions.db"
EXCEL_PATH = r"c:\SaaSIA\comunicacionMKT\candidatos_eze.xlsx"
COMPANY_ID = 4
INSTANCE_NAME = "mkt_colab"
ORDERED_SHEETS = ['Recibidos', 'Seleccionados', 'Finalistas', 'Descartados', 'ezequiel2']

def clean_phone(p):
    if pd.isna(p): return ''
    digits = re.sub(r'\D', '', str(p))
    if len(digits) == 10 and digits.startswith('11'): return '549' + digits
    if len(digits) == 10: return '549' + digits
    if len(digits) == 12 and digits.startswith('5411'): return '54911' + digits[4:]
    if len(digits) == 13 and digits.startswith('54911'): return digits
    if len(digits) >= 10: return '549' + digits if not digits.startswith('54') else digits
    return digits

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
            print(f"[{timestamp_str}] 🌙 Fuera de horario permitido (08:00 a 20:00 hs). Pausado por {hours_wait} hs (hasta las 08:00 AM)...")
            time.sleep(min(seconds_to_wait, 900)) # Re-chequear cada 15 min máximo

def load_all_ordered_candidates():
    """Lee y ordena los candidatos según la secuencia solicitada: Recibidos -> Seleccionados -> Finalistas -> Descartados -> ezequiel2"""
    all_ordered = []
    seen_phones = set()

    if not os.path.exists(EXCEL_PATH):
        print(f"Error: No se encontró el archivo Excel {EXCEL_PATH}")
        return all_ordered

    xl = pd.ExcelFile(EXCEL_PATH)
    for sheet in ORDERED_SHEETS:
        if sheet not in xl.sheet_names: continue
        df = pd.read_excel(EXCEL_PATH, sheet_name=sheet)
        for idx, row in df.iterrows():
            if sheet == 'ezequiel2':
                raw_p = row.iloc[1] if len(row) > 1 else row.iloc[0]
                name = 'Candidato Comercial'
                email, dni, edad, zona, rol, url = '', '', '', '', '', ''
            else:
                raw_p = row.get('Telefono')
                name = str(row.get('Nombre', '')).strip()
                email = str(row.get('Email', '')).strip() if not pd.isna(row.get('Email')) else ''
                dni = str(row.get('DNI', '')).strip() if not pd.isna(row.get('DNI')) else ''
                edad = str(row.get('Edad', '')).strip() if not pd.isna(row.get('Edad')) else ''
                zona = str(row.get('Zona', '')).strip() if not pd.isna(row.get('Zona')) else ''
                rol = str(row.get('Rol', '')).strip() if not pd.isna(row.get('Rol')) else ''
                url = str(row.get('URL', '')).strip() if not pd.isna(row.get('URL')) else ''

            p_clean = clean_phone(raw_p)
            if p_clean and len(p_clean) >= 10 and p_clean not in seen_phones:
                seen_phones.add(p_clean)
                all_ordered.append({
                    'name': name or 'Candidato Comercial',
                    'phone': p_clean,
                    'email': email,
                    'dni': dni,
                    'sheet': sheet,
                    'group': f'Candidatos_{sheet}',
                    'meta': json.dumps({'edad': edad, 'zona': zona, 'rol': rol, 'url': url, 'hoja': sheet})
                })
    return all_ordered

def setup_all_sequential_campaigns(batch_size=50):
    """Agenda todos los contactos en CRM y genera las campañas en tandas de 50 en la BD"""
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.execute("PRAGMA busy_timeout = 30000")
    c = conn.cursor()

    candidates = load_all_ordered_candidates()
    print(f"✓ Cargados {len(candidates)} candidatos de {len(ORDERED_SHEETS)} hojas en el orden exacto.")

    # 1. Agendar absolutamente todos los contactos en contacts_agenda
    for cand in candidates:
        c.execute("""
            INSERT INTO contacts_agenda (name, phone, email, dni, group_name, company_id, origin, last_channel, metadata)
            VALUES (?, ?, ?, ?, ?, ?, 'EXCEL_CANDIDATOS_EZE', 'whatsapp', ?)
            ON CONFLICT(phone) DO UPDATE SET
                name=COALESCE(NULLIF(excluded.name, ''), contacts_agenda.name),
                email=COALESCE(NULLIF(excluded.email, ''), contacts_agenda.email),
                dni=COALESCE(NULLIF(excluded.dni, ''), contacts_agenda.dni),
                group_name=excluded.group_name,
                company_id=?,
                metadata=excluded.metadata
        """, (cand['name'], cand['phone'], cand['email'], cand['dni'], cand['group'], COMPANY_ID, cand['meta'], COMPANY_ID))

    conn.commit()

    # 2. Dividir los candidatos en tandas de 50 y crear las campañas si no existen
    template_text_computrabajo = (
        "Hola {Nombre}, te escribimos por tu postulación en CompuTrabajo para la red de Asesores Comerciales de "
        "Colaboratium, la primera plataforma P2P registrada ante el BCRA (Nº 40.015).\n\n"
        "Estamos sumando profesionales del sector financiero para comercializar inversiones atomizadas "
        "por IA con retornos muy superiores a la banca tradicional.\n\n"
        "Ofrecemos hasta un 6% de comisión por colocación con acreditación directa en tu CVU.\n\n"
        "¿Tenés 10 minutos esta semana para mostrarte la propuesta y el esquema de comisiones?"
    )

    total_candidates = len(candidates)
    campaign_ids = []

    for i in range(0, total_candidates, batch_size):
        batch = candidates[i:i + batch_size]
        tanda_num = (i // batch_size) + 1
        main_sheet = batch[0]['sheet']
        camp_name = f"CAMPAÑA TANDA {tanda_num} ({len(batch)} CONTACTOS - {main_sheet}) - {time.strftime('%Y-%m-%d')}"

        # Verificar si la tanda ya existe
        c.execute("SELECT id, status FROM mkt_campaigns WHERE name LIKE ? AND company_id=?", (f"CAMPAÑA TANDA {tanda_num}%", COMPANY_ID))
        existing_camp = c.fetchone()

        if existing_camp:
            camp_id = existing_camp[0]
            c.execute("UPDATE mkt_campaigns SET template=? WHERE id=?", (template_text_computrabajo, camp_id))
        else:
            # Las campañas futuras se crean como 'scheduled' (programadas)
            c.execute("""INSERT INTO mkt_campaigns (name, status, template, delay_seconds, company_id, created_at)
                         VALUES (?, 'scheduled', ?, 180, ?, datetime('now', 'localtime'))""", (camp_name, template_text_computrabajo, COMPANY_ID))
            camp_id = c.lastrowid

        # Insertar los contactos del batch en mkt_contacts si no están presentes
        for cand in batch:
            c.execute("""INSERT OR IGNORE INTO mkt_contacts (campaign_id, trace_id, phone, email, name, status, metadata)
                         VALUES (?, ?, ?, ?, ?, 'pending', ?)""",
                      (camp_id, f"MKT_{camp_id}_{cand['phone']}", cand['phone'], cand['email'], cand['name'], cand['meta']))

        campaign_ids.append(camp_id)

    conn.commit()
    conn.close()
    print(f"✓ Se estructuraron {len(campaign_ids)} campañas secuenciales (Tanda 1 a Tanda {len(campaign_ids)}).")
    return campaign_ids

def run_orchestrated_campaigns(rate_per_hour=20):
    sys.path.append(r"c:\SaaSIA\ai_core")
    from nucleo_ia import _send, update_session

    print("\n==================================================")
    print("🚀 ORQUESTADOR SECUENCIAL DE CAMPAÑAS MKT (COMPUTRABAJO)")
    print("Secuencia de Hojas: Recibidos -> Seleccionados -> Finalistas -> Descartados -> ezequiel2")
    print(f"Ritmo: {rate_per_hour} contactos por hora (~3 min / envío)")
    print("Franja Horaria Permitida: 08:00 AM a 20:00 PM (Lunes a Domingo)")
    print("==================================================\n")

    setup_all_sequential_campaigns(batch_size=50)

    while True:
        conn = sqlite3.connect(DB_PATH, timeout=60)
        conn.execute("PRAGMA busy_timeout = 60000")
        c = conn.cursor()

        # Buscar la siguiente campaña activa o programada que tenga contactos pendientes
        c.execute("""
            SELECT c.id, c.name, c.status FROM mkt_campaigns c
            WHERE c.company_id=? AND c.status IN ('active', 'scheduled')
            AND EXISTS (SELECT 1 FROM mkt_contacts WHERE campaign_id=c.id AND status='pending')
            ORDER BY c.id ASC LIMIT 1
        """, (COMPANY_ID,))
        current_camp = c.fetchone()

        if not current_camp:
            print("🎉 ¡TODAS LAS CAMPAÑAS Y TANDAS SECUENCIALES FUERON COMPLETADAS EXITOSAMENTE!")
            conn.close()
            break

        camp_id, camp_name, camp_status = current_camp
        # Si la campaña estaba en 'scheduled', activarla oficialmente ahora
        if camp_status != 'active':
            c.execute("UPDATE mkt_campaigns SET status='active' WHERE id=?", (camp_id,))
            conn.commit()

        c.execute("SELECT id, name, phone, metadata FROM mkt_contacts WHERE campaign_id=? AND status='pending' ORDER BY id ASC", (camp_id,))
        pending_list = c.fetchall()

        print(f"\n▶ INICIANDO PROCESAMIENTO DE CAMPAÑA #{camp_id}: '{camp_name}'")
        print(f"Contactos pendientes en esta tanda: {len(pending_list)}")

        total = len(pending_list)
        for idx, (mkt_c_id, full_name, phone, meta_str) in enumerate(pending_list, 1):
            # 1. Garantizar Franja Horaria (08:00 a 20:00 hs)
            check_and_wait_time_window(8, 20)

            # Extraer primer nombre propio para personalización cercana
            first_name = full_name.strip().split()[0].capitalize() if full_name and full_name != 'Candidato Comercial' else "ahí"

            # Verificar si el contacto proviene de CompuTrabajo
            is_computrabajo = True
            if meta_str:
                try:
                    m_data = json.loads(meta_str)
                    if m_data.get('hoja') == 'ezequiel2': is_computrabajo = False
                except: pass

            # Spintax Multidimensional adaptado con referencia a CompuTrabajo
            greetings = [
                f"Hola {first_name}, ¿cómo estás?",
                f"Buenas {first_name}, ¿cómo te va?",
                f"Hola {first_name}, ¿qué tal?",
                f"Buenas tardes {first_name}, ¿cómo estás?",
                f"Hola {first_name}, espero que andes muy bien."
            ]
            
            if is_computrabajo:
                intros = [
                    "Te escribimos por tu postulación en CompuTrabajo para la red de Asesores Comerciales de Colaboratium, la primera plataforma P2P registrada ante el BCRA (Nº 40.015).",
                    "Te contacto en relación a tu postulación en CompuTrabajo para sumarte a la red de Asesores Comerciales de Colaboratium, fintech P2P registrada en el BCRA (Nº 40.015).",
                    "Te escribo brevemente por tu postulación en CompuTrabajo, ya que estamos expandiendo el equipo de Asesores Comerciales de Colaboratium, primera plataforma P2P regulada por el BCRA (Nº 40.015).",
                    "Te escribo debido a tu postulación en CompuTrabajo para la red oficial de Asesores Comerciales de Colaboratium, plataforma de créditos P2P (BCRA Nº 40.015)."
                ]
            else:
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

            message_text = f"{random.choice(greetings)}\n\n{random.choice(intros)}\n\n{random.choice(value_props)}\n\n{random.choice(closings)}"
            jid = f"{phone}@s.whatsapp.net"

            timestamp_str = time.strftime("%H:%M:%S")
            print(f"[{timestamp_str}] [Campaña #{camp_id}] Envío ({idx}/{total}) a {full_name} ({phone})...")

            try:
                _send(jid, INSTANCE_NAME, message_text)

                c.execute("UPDATE mkt_contacts SET status='sent' WHERE id=?", (mkt_c_id,))
                c.execute("""INSERT INTO mkt_execution_logs (campaign_id, contact_name, channel, status, message)
                             VALUES (?, ?, 'WA', 'sent', ?)""", (camp_id, full_name, message_text))
                
                update_session(phone, INSTANCE_NAME, channel='WA', last_origin='MKT_CAMPAIGN', update_outgoing=True)
                conn.commit()
                print(f"  └─ ✅ Enviado exitosamente a {full_name}.")

            except Exception as err:
                print(f"  └─ ❌ Error al enviar a {phone}: {err}")
                c.execute("UPDATE mkt_contacts SET status='failed' WHERE id=?", (mkt_c_id,))
                conn.commit()

            # Pausa de ritmo (20 por hora = ~180s = 3 min)
            if idx < total:
                delay_seconds = random.randint(165, 195)
                delay_mins = round(delay_seconds / 60, 2)
                print(f"  ⏳ Ritmo 20/hs: esperando {delay_mins} min ({delay_seconds}s) antes del próximo envío...\n")
                time.sleep(delay_seconds)

        # Marcar la campaña actual como COMPLETADA al terminar sus 50 contactos
        c.execute("UPDATE mkt_campaigns SET status='completed' WHERE id=?", (camp_id,))
        conn.commit()
        conn.close()
        print(f"\n🎉 ¡CAMPAÑA #{camp_id} ('{camp_name}') COMPLETADA EXITOSAMENTE! Marcada como 'completed'. Avanzando automáticamente a la siguiente tanda...\n")
        time.sleep(5)

if __name__ == "__main__":
    run_orchestrated_campaigns(rate_per_hour=20)
