# -*- coding: utf-8 -*-
"""
Script de despacho seguro WASender para mañana.
Itera candidatos de la agenda previa agendada (VCF) utilizando simulación humana (DOM typing)
con demoras aleatorias entre 120s y 240s (2 a 4 minutos) para evitar bloqueos.
"""

import sys, os, time, random, sqlite3

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

DB_PATH = r"c:\SaaSIA\ai_core\config\brain_sessions.db"

def run_batch():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute("""
        SELECT id, name, phone 
        FROM contacts_agenda 
        WHERE name IS NOT NULL AND name != '' AND name NOT LIKE 'Candidato%' AND name NOT LIKE 'Pendiente%'
        ORDER BY id ASC
    """)
    candidates = c.fetchall()
    print(f"[CAMPAÑA MAÑANA] Agenda cargada: {len(candidates)} candidatos agendados con nombre real.")
    
    # Import engine
    sys.path.append(r"c:\SaaSIA\ai_core")
    from wasender_engine import get_wasender_engine
    import asyncio
    
    async def main():
        engine = await get_wasender_engine()
        print("[CAMPAÑA MAÑANA] Conectado a WhatsApp Web. Verificando estado...")
        logged = await engine.is_logged_in()
        if not logged:
            print("[CAMPAÑA MAÑANA] La sesión de WhatsApp Web no está conectada. Escaneá el QR.")
            return
        
        print("[CAMPAÑA MAÑANA] Sesión activa confirmada. Iniciando envíos con delay anti-ban (2-4 min)...")
        for idx, cand in enumerate(candidates, 1):
            c_id, c_name, c_phone = cand
            print(f"[{idx}/{len(candidates)}] Enviando a #{c_id} {c_name} ({c_phone})...")
            msg = f"Hola {c_name}, te escribimos por tu postulación en CompuTrabajo para la posición de Ejecutivo Comercial. ¿Seguís en búsqueda activa?"
            
            sent_ok = await engine.send_text_to_phone(c_phone, msg)
            if sent_ok:
                print(f"[OK] Mensaje entregado a {c_name} ({c_phone})")
                # Registrar log
                c.execute("""
                    INSERT INTO mkt_execution_logs (campaign_id, contact_name, channel, status, message, created_at)
                    VALUES (6, ?, 'WA', 'sent', ?, datetime('now', 'localtime'))
                """, (c_name, f"Enviado plantilla inicial a {c_phone}"))
                conn.commit()
            else:
                print(f"[WARN] No se pudo entregar mensaje a {c_name} ({c_phone})")
            
            # Delay aleatorio entre 120s y 240s
            delay = random.randint(120, 240)
            print(f"[ANTI-BAN] Esperando {delay}s ({delay//60}m {delay%60}s) antes del siguiente candidato...\n")
            await asyncio.sleep(delay)
            
    asyncio.run(main())

if __name__ == "__main__":
    run_batch()
