import sqlite3
conn = sqlite3.connect('C:/RouthLocal/Plataforma_SaaS_IA/ai_core/config/brain_sessions.db')
c = conn.cursor()
c.execute("SELECT * FROM connections")
for row in c.fetchall():
    print(row)
conn.close()
