import sqlite3
import json

DB_PATH = r"C:\RouthLocal\punto_a\chatbot.db"

def get_connections():
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT * FROM connections")
        rows = c.fetchall()
        print(json.dumps(rows))
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

get_connections()
