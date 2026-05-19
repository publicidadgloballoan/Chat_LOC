import sqlite3
DB_PATH = r"C:\RouthLocal\punto_a\chatbot.db"
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()
c.execute("SELECT name FROM sqlite_master WHERE type='table'")
print(c.fetchall())
conn.close()
