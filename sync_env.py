import os

def sync():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    backend_env_path = os.path.join(base_dir, "backend", ".env")
    aicore_env_path = os.path.join(base_dir, "ai_core", ".env")
    wa_env_path = os.path.join(base_dir, "ai_core", "whatsapp_service", ".env")

    # 1. Leer api key del backend/.env
    api_key = "03d27a0c34fa708178148142d6f5eedc86cd5e3a"
    if os.path.exists(backend_env_path):
        with open(backend_env_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip().startswith("AUTHENTICATION_API_KEY="):
                    api_key = line.split("=")[1].strip().replace('"', '').replace("'", "")
                    break
    print(f"API Key detectada: {api_key}")

    # 2. Actualizar o crear ai_core/.env
    aicore_lines = []
    if os.path.exists(aicore_env_path):
        with open(aicore_env_path, "r", encoding="utf-8") as f:
            aicore_lines = f.readlines()
    
    # Filtrar AUTHENTICATION_API_KEY anterior
    aicore_lines = [l for l in aicore_lines if not l.strip().startswith("AUTHENTICATION_API_KEY=")]
    aicore_lines.append(f"\nAUTHENTICATION_API_KEY={api_key}\n")
    
    with open(aicore_env_path, "w", encoding="utf-8") as f:
        f.writelines(aicore_lines)
    print("ai_core/.env actualizado.")

    # 3. Actualizar o crear whatsapp_service/.env
    wa_lines = []
    if os.path.exists(wa_env_path):
        with open(wa_env_path, "r", encoding="utf-8") as f:
            wa_lines = f.readlines()
    
    wa_lines = [l for l in wa_lines if not l.strip().startswith("AUTHENTICATION_API_KEY=")]
    wa_lines.insert(0, f'AUTHENTICATION_API_KEY="{api_key}"\n')
    
    # Asegurar otras variables por defecto si no existen
    keys = [l.split("=")[0].strip() for l in wa_lines if "=" in l]
    if "DB_HOST" not in keys: wa_lines.append('\nDB_HOST="localhost"\n')
    if "DB_PORT" not in keys: wa_lines.append('DB_PORT=5432\n')
    if "DB_NAME" not in keys: wa_lines.append('DB_NAME="saas_antigravity"\n')
    if "DB_USER" not in keys: wa_lines.append('DB_USER="postgres"\n')
    if "DB_PASSWORD" not in keys: wa_lines.append('DB_PASSWORD="cebdef04370d542a7e7d70827ce798cb"\n')

    with open(wa_env_path, "w", encoding="utf-8") as f:
        f.writelines(wa_lines)
    print("whatsapp_service/.env actualizado.")

    # 4. Crear o actualizar INICIAR_SAAS_IA.bat en el directorio base
    launcher_path = os.path.join(base_dir, "INICIAR_SAAS_IA.bat")
    launcher_content = f"""@echo off
title SaaS IA Platform
echo ================================================
echo   Limpiando procesos anteriores (saltado para no matar el Servidor de Licencias)...
echo ================================================
timeout /t 2 /nobreak >nul

echo ================================================
echo   Iniciando Plataforma SaaS IA...
echo ================================================
cd /d {base_dir}

echo Verificando si hay actualizaciones en GitHub...
git pull

echo Sincronizando claves de API entre servicios...
python sync_env.py

echo Verificando y aplicando estructura de tablas (Prisma db push)...
cd backend
call npx prisma db push --accept-data-loss
cd ..

echo Iniciando servicios en segundo plano...
start /b cmd /c "cd ai_core && python nucleo_ia.py"
ping 127.0.0.1 -n 4 > nul
start /b cmd /c "cd ai_core\\whatsapp_service && node server.js"
ping 127.0.0.1 -n 4 > nul
start /b cmd /c "cd backend && node index.js"
ping 127.0.0.1 -n 4 > nul
start /b cmd /c "cd frontend && npm run dev"
ping 127.0.0.1 -n 6 > nul

echo Abriendo Dashboard...
start http://localhost:3000
"""
    with open(launcher_path, "w", encoding="utf-8") as f:
        f.write(launcher_content)
    print("INICIAR_SAAS_IA.bat creado/actualizado.")

    # 5. Configurar acceso directo en Carpeta de Inicio (Startup) de Windows para arranque automático
    try:
        startup_dir = os.path.join(os.environ.get("APPDATA", ""), "Microsoft", "Windows", "Start Menu", "Programs", "Startup")
        if os.path.exists(startup_dir):
            startup_file = os.path.join(startup_dir, "SaaS_IA_Startup.bat")
            with open(startup_file, 'w', encoding='utf-8') as sf:
                sf.write(f'@echo off\ncd /d "{base_dir}"\nstart "" cmd /c "call INICIAR_SAAS_IA.bat"\n')
            print(f"Configurado inicio automático en Windows Startup: {startup_file}")
    except Exception as e:
        print(f"No se pudo configurar el inicio automático: {e}")

if __name__ == "__main__":
    sync()
