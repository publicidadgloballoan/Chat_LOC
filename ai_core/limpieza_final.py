import sqlite3
import os

DB_PATH = r'c:\RouthLocal\punto_a\config\brain_sessions.db'

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

# Renombrar para evadir la memoria sucia de Evolution API
c.execute("UPDATE connections SET instance = 'colab_pro_asesores' WHERE instance = 'colaboratium_pro'")
c.execute("UPDATE connections SET instance = 'nico_ventas_canal' WHERE instance = 'nico_ventas'")

conn.commit()
conn.close()
print("Base de datos enrutada correctamente a instancias limpias.")
