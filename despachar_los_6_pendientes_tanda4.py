# -*- coding: utf-8 -*-
"""
Script para despachar los 6 contactos restantes de Tanda 4 (CompuTrabajo)
utilizando WASender Chromium con retraso anti-ban.
"""

import sys, os, time, random, sqlite3, asyncio

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

DB_PATH = r"c:\SaaSIA\ai_core\config\brain_sessions.db"
sys.path.append(r"c:\SaaSIA\ai_core")
from wasender_engine import WASenderEngine

PENDING_CANDIDATES = [
    {"name": "Marcelo Javier Balmaceda", "phone": "5493795111681"},
    {"name": "Gisela Arias", "phone": "5491136257374"},
    {"name": "Ariel Gularte", "phone": "5492901529000"},
    {"name": "lucas torres", "phone": "5491125291655"},
    {"name": "Rocio ayelen Cortez", "phone": "5491151625762"},
    {"name": "Dario Goy", "phone": "5491160347086"}
]

async def main():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    print("=== INICIANDO DESPACHO DE LOS 6 RESTANTES DE TANDA 4 ===")
    engine = WASenderEngine(headless=False)
    await engine.initialize()
    print("[WASENDER] Verificando sesión de WhatsApp Web...")
    logged = await engine.is_logged_in()
    if not logged:
        print("[ERROR] WhatsApp Web no está conectado. Por favor verifica la ventana Chromium.")
        return
    
    print(f"[OK] Sesión WhatsApp Web activa. Despachando {len(PENDING_CANDIDATES)} contactos pendientes...\n")
    
    for idx, cand in enumerate(PENDING_CANDIDATES, 1):
        name = cand['name']
        phone = cand['phone']
        first_name = name.strip().split()[0].capitalize()
        
        msg = (
            f"Hola {first_name}, te escribimos por tu postulación en CompuTrabajo para la red de Asesores Comerciales de "
            "Colaboratium, la primera plataforma P2P registrada ante el BCRA (Nº 40.015).\n\n"
            "Estamos sumando profesionales del sector financiero para comercializar inversiones atomizadas "
            "por IA con retornos muy superiores a la banca tradicional.\n\n"
            "Ofrecemos hasta un 6% de comisión por colocación con acreditación directa en tu CVU.\n\n"
            "¿Tenés 10 minutos esta semana para mostrarte la propuesta y el esquema de comisiones?"
        )
        
        print(f"[{idx}/{len(PENDING_CANDIDATES)}] Enviando a {name} ({phone})...")
        res = await engine.send_message(phone, msg)
        
        if res.get('success'):
            print(f"  └─ ✅ Enviado exitosamente a {name} ({phone})")
            c.execute("""
                INSERT INTO mkt_execution_logs (campaign_id, contact_name, channel, status, message, created_at)
                VALUES (6, ?, 'WA', 'sent', ?, datetime('now', 'localtime'))
            """, (name, f"Enviado plantilla inicial a {phone}"))
            conn.commit()
        else:
            print(f"  └─ ❌ Error al enviar a {name}: {res.get('error')}")
        
        if idx < len(PENDING_CANDIDATES):
            delay = random.randint(120, 180) # 2 a 3 minutos anti-ban
            print(f"  ⏳ Esperando {delay}s ({delay//60}m {delay%60}s) antes del siguiente candidato...\n")
            await asyncio.sleep(delay)

    # Verificar si Tanda 4 llegó a los 50 contactos requeridos
    c.execute("SELECT COUNT(DISTINCT contact_name) FROM mkt_execution_logs WHERE campaign_id = 6 AND status = 'sent'")
    sent_total = c.fetchone()[0]
    print(f"\n🎉 ¡Tanda 4 finalizada! Total de envíos registrados en Tanda 4: {sent_total}/50")
    if sent_total >= 50:
        c.execute("UPDATE mkt_campaigns SET status = 'completed' WHERE id = 6")
        conn.commit()
        print("✓ Tanda 4 marcada oficialmente como 'completed' en la Base de Datos.")
    
    conn.close()

if __name__ == '__main__':
    asyncio.run(main())
