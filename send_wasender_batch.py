"""
WASender Batch Campaign Dispatcher (Candidates #107 to #130)
Uses native Chromium Playwright engine with persistent profile, human keystrokes & anti-ban delays.
"""

import os
import sys
import time
import random
import sqlite3
import asyncio
from ai_core.wasender_engine import WASenderEngine

sys.stdout.reconfigure(encoding='utf-8')

DB_PATH = r"c:\SaaSIA\ai_core\config\brain_sessions.db"

GREETINGS = ["Hola", "Buenas tardes", "Qué tal", "Hola, cómo estás", "Estimado/a"]

def generate_spintax_msg(name):
    greeting = random.choice(GREETINGS)
    first_name = name.split()[0] if name else "Candidato"
    return f"{greeting} {first_name}, te escribimos por tu postulación en CompuTrabajo para la posición de Asesor Comercial en Colaboratium. ¿Te gustaría coordinar una entrevista breve?"

async def run_batch():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Get contacts 108 to 130 (since Tamara #107 #7387 was already sent successfully!)
    c.execute('''
        SELECT id, name, phone FROM contacts_agenda 
        ORDER BY id ASC LIMIT 23 OFFSET 107
    ''')
    contacts = c.fetchall()
    print(f"[BATCH] Loaded {len(contacts)} candidates for WASender batch dispatch (index 108 to 130)...")
    
    engine = WASenderEngine(headless=False)
    await engine.initialize()
    
    if not await engine.is_logged_in():
        print("[BATCH] WASender Engine is not logged in on WhatsApp Web! Waiting for QR scan...")
        while not await engine.is_logged_in():
            await asyncio.sleep(3)
    
    print("[BATCH] WhatsApp Web session is logged in and ready!")

    for i, (cid, name, phone) in enumerate(contacts, 1):
        msg = generate_spintax_msg(name)
        print(f"\n[{i}/{len(contacts)}] Dispatching to #{cid} {name} ({phone})...")
        res = await engine.send_message(phone, msg)
        
        if res.get("success"):
            print(f"[OK] Message delivered to {name} ({phone})!")
            c.execute('''
                INSERT INTO mkt_execution_logs (campaign_id, contact_name, channel, status, message, created_at)
                VALUES (6, ?, 'WA', 'sent', ?, datetime('now', 'localtime'))
            ''', (name, f"Enviado plantilla inicial a {phone}"))
            conn.commit()
        else:
            print(f"[FAIL] Failed to send to {name}: {res.get('error')}")
            
        if i < len(contacts):
            delay = random.randint(120, 240)
            print(f"[ANTI-BAN] Waiting delay of {delay}s ({delay//60}m {delay%60}s) before candidate {i+1}...")
            await asyncio.sleep(delay)
            
    await engine.close()
    conn.close()

if __name__ == "__main__":
    asyncio.run(run_batch())
