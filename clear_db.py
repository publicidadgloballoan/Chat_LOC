import sqlite3
import os

db_path = r'c:\SaaSIA\ai_core\config\brain_sessions.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("DELETE FROM logs WHERE phone='5491136822400'")
    conn.commit()
    print('History deleted from brain_sessions.db')
    conn.close()
else:
    print('brain_sessions.db not found')
