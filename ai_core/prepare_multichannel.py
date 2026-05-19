import sqlite3
import os

db_path = r"c:\RouthLocal\punto_a\config\brain_sessions.db"

try:
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    try:
        c.execute('ALTER TABLE sessions ADD COLUMN channel TEXT DEFAULT "whatsapp"')
        c.execute('ALTER TABLE sessions ADD COLUMN instance TEXT')
        print("Columnas channel e instance preparadas.")
    except Exception:
        print("Las columnas ya existian.")
    
    conn.commit()
    conn.close()
    print("Base de datos lista para Multicanal.")
except Exception as e:
    print(f"Error: {e}")
