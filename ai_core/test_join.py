import sqlite3
import os

DB_PATH = r"C:\RouthLocal\Plataforma_SaaS_IA\ai_core\config\brain_sessions.db"

def test_join():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    comp_id = 2 # Colaboratium
    c.execute("""
        SELECT s.phone, s.instance, conn.company_id
        FROM sessions s
        JOIN connections conn ON s.instance = conn.instance
        WHERE conn.company_id = ?
    """, (comp_id,))
    rows = c.fetchall()
    print(f"Sessions for Company {comp_id}:")
    for r in rows:
        print(r)
    conn.close()

if __name__ == "__main__":
    test_join()
