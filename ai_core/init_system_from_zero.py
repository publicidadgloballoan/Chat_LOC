import sqlite3
import os

DB_PATH = r'c:\RouthLocal\punto_a\config\brain_sessions.db'

def init_clean_db():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Crear tablas
    c.execute('''CREATE TABLE IF NOT EXISTS sessions (
        phone TEXT PRIMARY KEY, 
        state TEXT, 
        manual INTEGER DEFAULT 0, 
        name TEXT, 
        channel TEXT DEFAULT 'whatsapp',
        instance TEXT DEFAULT 'unknown',
        pending_handoff INTEGER DEFAULT 0,
        last_summary TEXT
    )''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        phone TEXT, 
        message TEXT, 
        direction TEXT, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT UNIQUE
    )''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS connections (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        company_id INTEGER, 
        instance TEXT UNIQUE, 
        phone TEXT, 
        channel TEXT DEFAULT 'whatsapp',
        FOREIGN KEY(company_id) REFERENCES companies(id)
    )''')

    # Inyectar Empresas
    c.execute("INSERT INTO companies (name) VALUES ('Colaboratium')")
    colab_id = c.lastrowid
    
    c.execute("INSERT INTO companies (name) VALUES ('Nico_Ventas')")
    nico_id = c.lastrowid

    # Inyectar Conexiones Colaboratium
    c.execute("INSERT INTO connections (company_id, instance, phone, channel) VALUES (?, ?, ?, ?)",
              (colab_id, "chatbot_punto_a", "549112737437", "whatsapp"))
    c.execute("INSERT INTO connections (company_id, instance, phone, channel) VALUES (?, ?, ?, ?)",
              (colab_id, "colaboratium_pro", "5491124013981", "whatsapp"))

    # Inyectar Conexiones Nico_Ventas
    c.execute("INSERT INTO connections (company_id, instance, phone, channel) VALUES (?, ?, ?, ?)",
              (nico_id, "nico_ventas", "5491173722708", "whatsapp"))

    conn.commit()
    conn.close()
    print("[+] Base de datos inicializada desde cero con éxito.")

if __name__ == "__main__":
    init_clean_db()
