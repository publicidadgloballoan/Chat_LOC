import sqlite3
import os

DB_PATH = r"C:\RouthLocal\Plataforma_SaaS_IA\ai_core\config\brain_sessions.db"

def fix_data():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # 1. Renombrar la conexion para que coincida con los datos existentes
    c.execute("UPDATE connections SET instance='colab_pro' WHERE instance='chatbot_punto_a'")
    print(f"Actualizadas {c.rowcount} conexiones de chatbot_punto_a a colab_pro.")
    
    # 2. Otros mapeos si es necesario
    # globalloansa, ig_global, nico_ventas_wa ya parecen coincidir.
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    fix_data()
