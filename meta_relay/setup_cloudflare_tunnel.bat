@echo off
:: ============================================================
:: SaaSIA — Instalar Cloudflare Tunnel como Servicio Windows
::
:: Tunnel: saasia-relay
:: URL:    https://relay.smart-box.com.ar -> localhost:7010
::
:: Ejecutar como ADMINISTRADOR en el servidor 192.168.1.163
:: ============================================================

setlocal

:: Token del tunnel (pre-configurado, no cambiar)
set "TUNNEL_TOKEN=eyJhIjoiOTU1ZTNkZDgzOGQwYzk4NWY2OGVjYzFhMWU0NmIwMWMiLCJ0IjoiNjQ3MDRmOWEtMTQ3NS00ZTU5LTg0NjQtODAxMDRiYzFhMzM4IiwicyI6InRILzZKZXN0aG9IekkyWVEwODRXZFdRYThPc0sxRnVlOFQ5SVZxeEJ6WEVqaEVSM0h5c3dtaTkvOG9mbEVnYmtMNmVSazZxeE01bVJNVFZqQWlvWEdBPT0ifQ=="

echo.
echo  ============================================================
echo   SaaSIA - Cloudflare Tunnel Installer
echo   relay.smart-box.com.ar -^> localhost:7010
echo  ============================================================
echo.

:: Verificar admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Ejecutar como ADMINISTRADOR ^(click derecho -^> Ejecutar como admin^)
    pause & exit /b 1
)

:: ── Paso 1: Instalar cloudflared ─────────────────────────────
echo [1/3] Instalando cloudflared...
where cloudflared >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=*" %%v in ('cloudflared --version 2^>^&1') do echo [OK] Ya instalado: %%v
    goto :install_service
)

:: Intentar via winget primero
winget install --id Cloudflare.cloudflared --silent --accept-source-agreements --accept-package-agreements 2>nul
where cloudflared >nul 2>&1
if %errorLevel% equ 0 goto :install_service

:: Si winget falla, descarga directa
echo [INFO] Descargando cloudflared directamente...
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile 'C:\Windows\System32\cloudflared.exe' -UseBasicParsing"

where cloudflared >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] No se pudo instalar cloudflared.
    echo Descargar manualmente: https://github.com/cloudflare/cloudflared/releases/latest
    pause & exit /b 1
)

:install_service
for /f "tokens=*" %%v in ('cloudflared --version 2^>^&1') do echo [OK] cloudflared: %%v

:: ── Paso 2: Desinstalar servicio anterior si existe ──────────
echo.
echo [2/3] Configurando servicio...
sc query cloudflared >nul 2>&1
if %errorLevel% equ 0 (
    echo [INFO] Deteniendo servicio anterior...
    net stop cloudflared >nul 2>&1
    cloudflared service uninstall >nul 2>&1
    timeout /t 2 /nobreak >nul
)

:: ── Paso 3: Instalar como servicio con el tunnel token ───────
echo.
echo [3/3] Instalando como servicio de Windows...
cloudflared service install %TUNNEL_TOKEN%

if %errorLevel% equ 0 (
    net start cloudflared
    echo.
    echo [OK] Servicio cloudflared instalado e iniciado!
) else (
    echo [ERROR] Fallo la instalacion del servicio.
    echo Intentando en modo manual...
    start "Cloudflare Tunnel" /B cloudflared tunnel run --token %TUNNEL_TOKEN%
)

:: ── Verificacion ─────────────────────────────────────────────
echo.
echo Esperando que el tunnel se establezca ^(10 segundos^)...
timeout /t 10 /nobreak >nul

echo.
echo Estado del servicio:
sc query cloudflared | findstr "STATE"

echo.
echo ============================================================
echo  LISTO - Tunnel activo
echo  URL publica: https://relay.smart-box.com.ar
echo.
echo  Para verificar (abrir en navegador o cmd):
echo    curl https://relay.smart-box.com.ar/health
echo.
echo  Para ver logs:
echo    cloudflared tail
echo ============================================================
echo.
pause
