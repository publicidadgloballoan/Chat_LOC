import sqlite3
import os

DB_PATH = r"C:\RouthLocal\Plataforma_SaaS_IA\ai_core\config\brain_sessions.db"

def cleanup():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # 1. Borrar duplicados exactos en connections
    # Quedarnos con el ID mas alto para cada par (company_id, instance)
    c.execute("""
        DELETE FROM connections 
        WHERE id NOT IN (
            SELECT MAX(id) 
            FROM connections 
            GROUP BY company_id, instance
        )
    """)
    
    # 2. Borrar instancias con nombres raros o duplicados manuales de Telegram
    # Solo dejaremos 'colaboratium_ia_bot'
    # Pero primero vemos que tenemos
    
    conn.commit()
    print(f"Limpieza de duplicados realizada. {c.rowcount} filas eliminadas.")
    conn.close()

if __name__ == "__main__":
    cleanup()
