@echo off
title SISTEMA PUNTO A - CONTROL DE INICIO
color 0A
echo ======================================================
echo           SISTEMA DE CHATBOT PUNTO A
echo ======================================================
echo   [MODO REINICIO] Limpiando procesos previos...
taskkill /F /IM python.exe /T >nul 2>&1
taskkill /F /IM node.exe /T >nul 2>&1
echo   [ESTADO] Iniciando procesos limpios...

:check_docker
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo   [!] Docker no esta corriendo. Intentando iniciar Docker Desktop...
    if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
        start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
        echo   [+] Lanzando Docker Desktop... espera un momento.
    ) else (
        echo   [ERROR] No se encontro Docker Desktop en la ruta habitual.
        echo           Por favor, inicia Docker manualmente.
        pause
        exit
    )
    timeout /t 10 >nul
    goto check_docker
)

echo   [+] Docker detectado y activo.
cd /d "c:\RouthLocal\punto_a"

echo   [+] Asegurando que los servicios (Postgres/WhatsApp) esten arriba...
docker-compose -f "C:\ChatBot_Punto_A\config\docker-compose.yml" up -d

echo   [+] Sincronizando cerebro V2.01 (Nucleo IA)...
start /min cmd /c "python nucleo_ia.py"
timeout /t 2 >nul
python sync_evolution.py

echo   [+] Levantando Dashboard Web...
start /min cmd /c "cd web_dashboard && npm run dev"

echo   [+] Abriendo panel de control en el navegador...
timeout /t 5 >nul
start http://localhost:3000

cls
echo ======================================================
echo           SISTEMA DE CHATBOT PUNTO A
echo ======================================================
echo.
echo      [ OK ] EL CHATBOT ESTA ACTIVADO Y FUNCIONANDO
echo.
echo      - Nucleo IA V2.01: Activo (Puerto 5000)
echo      - WhatsApp: Sincronizado
echo      - Dashboard: Abierto en el navegador
echo.
echo ======================================================
echo   Esta ventana puede quedar abierta o minimizada.
echo   Presiona cualquier tecla para CERRAR este mensaje.
pause >nul
