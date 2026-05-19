import sqlite3
import os

DB_PATH = r"C:\RouthLocal\Plataforma_SaaS_IA\ai_core\config\brain_sessions.db"

def list_connections():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, company_id, instance, channel FROM connections")
    rows = c.fetchall()
    print("ID | CO_ID | INSTANCE | CHANNEL")
    for r in rows:
        print(f"{r[0]} | {r[1]} | {r[2]} | {r[3]}")
    conn.close()

if __name__ == "__main__":
    list_connections()
