import sqlite3

DB_PATH = r"C:\SaaSIA\ai_core\brain_sessions.db"

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

# Ver tablas disponibles
tables = c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
print("Tablas:", tables)

# Ver estructura de connections si existe
for t in tables:
    print(f"\n-- {t[0]} --")
    cols = c.execute(f"PRAGMA table_info({t[0]})").fetchall()
    for col in cols:
        print(col)
    rows = c.execute(f"SELECT * FROM {t[0]} LIMIT 3").fetchall()
    for r in rows:
        print(" >", r)

conn.close()
