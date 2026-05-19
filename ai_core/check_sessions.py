import sqlite3
import os

db_path = r"c:\RouthLocal\punto_a\config\brain_sessions.db"

def check():
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("SELECT phone, instance, state, manual, pending_handoff FROM sessions WHERE instance='colab_pro'")
    rows = c.fetchall()
    print("Sessions for colab_pro:")
    for r in rows:
        print(r)
    conn.close()

check()
