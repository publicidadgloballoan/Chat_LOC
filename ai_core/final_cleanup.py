import sqlite3
import os

DB_PATH = r"C:\RouthLocal\Plataforma_SaaS_IA\ai_core\config\brain_sessions.db"

def final_cleanup():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Lista de instancias a ELIMINAR (por ser duplicadas o tener nombres con @ o mayusculas inconsistentes)
    to_delete = [
        "@Colaboratium_ia_bot",
        "Colaboratium_ia_bot", # Quedarnos con la minuscula 'colaboratium_ia_bot' si existe, o al reves.
        "colboratium@gmail.com" # Si hay duplicados
    ]
    
    # Ver que tenemos para Telegram
    c.execute("SELECT id, instance, channel FROM connections WHERE channel='telegram'")
    tg_conns = c.fetchall()
    print("Conexiones TG actuales:", tg_conns)
    
    # Vamos a dejar solo la que tiene el ID 13 o la que sea mas reciente/correcta
    # Basado en el listado anterior:
    # 8 | 2 | Colaboratium_ia_bot | telegram
    # 9 | 1 | Colaboratium_ia_bot | telegram
    # 13 | 2 | colaboratium_ia_bot | telegram  <-- Esta parece la mas "limpia"
    # 14 | 2 | @Colaboratium_ia_bot | telegram
    
    # Borramos todas las de TG excepto la ID 13 (o la que coincida con colaboratium_ia_bot minuscula)
    c.execute("DELETE FROM connections WHERE channel='telegram' AND instance != 'colaboratium_ia_bot'")
    print(f"Borradas {c.rowcount} conexiones TG duplicadas.")
    
    # Tambien Instagram duplicados
    # 2 | 1 | globalloansa | instagram
    # 16 | 2 | globalloansa | instagram <-- Quedarnos con la de la empresa 2
    c.execute("DELETE FROM connections WHERE channel='instagram' AND company_id=1 AND instance='globalloansa'")
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    final_cleanup()
