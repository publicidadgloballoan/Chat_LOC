import os
import shutil
import sqlite3

BASE_PATH = r"c:\RouthLocal\punto_a"
CONFIG_DIR = os.path.join(BASE_PATH, "config")
DB_PATH = os.path.join(CONFIG_DIR, "brain_sessions.db")

# Archivos base a clonar
BASE_FILES = ["config_a1.json", "config_a2.json", "config_a3.json", "debug_mode.json"]

def setup_multitenant():
    if not os.path.exists(DB_PATH):
        print(" [!] DB no encontrada, abortando...")
        return

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    try:
        c.execute("SELECT instance FROM companies")
        companies = c.fetchall()
        
        for (instance,) in companies:
            if not instance: continue
            
            instance_path = os.path.join(CONFIG_DIR, instance)
            if not os.path.exists(instance_path):
                print(f" [+] Creando estructura para instancia: {instance}")
                os.makedirs(instance_path, exist_ok=True)
                
                # Clonar archivos base desde la raíz de config/
                for f in BASE_FILES:
                    src = os.path.join(CONFIG_DIR, f)
                    dst = os.path.join(instance_path, f)
                    if os.path.exists(src) and not os.path.exists(dst):
                        shutil.copy2(src, dst)
                        print(f"    - Copiado: {f}")
            else:
                print(f" [.] Instancia {instance} ya cuenta con su estructura.")
                
        print("\n [OK] Sistema de archivos sincronizado con el Gestor de Empresas.")
        
    except Exception as e:
        print(f" [!] Error al organizar carpetas: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    setup_multitenant()
