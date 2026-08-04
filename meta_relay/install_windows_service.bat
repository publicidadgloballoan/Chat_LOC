@echo off
:: ============================================================
:: SaaSIA — Instalador de servicios Windows
:: Instala meta_relay y meta_service como servicios de Windows
:: usando NSSM (Non-Sucking Service Manager)
::
:: Ejecutar como ADMINISTRADOR
:: ============================================================

setlocal EnableDelayedExpansion

echo.
echo  ============================================================
echo   SaaSIA — Instalador de Servicios Windows
echo   (meta_relay + meta_service)
echo  ============================================================
echo.

:: Verificar permisos de administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo  [ERROR] Este script debe ejecutarse como ADMINISTRADOR.
    echo  Click derecho -^> Ejecutar como administrador
    pause
    exit /b 1
)

:: Detectar directorio del proyecto
set "SCRIPT_DIR=%~dp0"
set "PROJECT_DIR=%SCRIPT_DIR%.."
for %%i in ("%PROJECT_DIR%") do set "PROJECT_DIR=%%~fi"

echo  [INFO] Directorio del proyecto: %PROJECT_DIR%
echo.

:: Verificar Node.js
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo  [ERROR] Node.js no esta instalado.
    echo  Descargar desde: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
echo  [OK] Node.js: %NODE_VER%

:: Verificar/Descargar NSSM
set "NSSM_DIR=%SCRIPT_DIR%nssm"
set "NSSM_EXE=%NSSM_DIR%\nssm.exe"

if not exist "%NSSM_EXE%" (
    echo.
    echo  [INFO] NSSM no encontrado. Descargando...
    echo  Descarga manual: https://nssm.cc/download
    echo  Guardar nssm.exe en: %NSSM_DIR%\
    echo.
    
    :: Intentar descarga con PowerShell
    powershell -Command "try { Invoke-WebRequest -Uri 'https://nssm.cc/release/nssm-2.24.zip' -OutFile '%TEMP%\nssm.zip' -UseBasicParsing; Expand-Archive -Path '%TEMP%\nssm.zip' -DestinationPath '%TEMP%\nssm_extracted' -Force; $exe = Get-ChildItem -Path '%TEMP%\nssm_extracted' -Filter 'nssm.exe' -Recurse | Where-Object {$_.Directory.Name -eq 'win64'} | Select-Object -First 1; if($exe){New-Item -ItemType Directory -Force -Path '%NSSM_DIR%' | Out-Null; Copy-Item $exe.FullName '%NSSM_EXE%'; Write-Host 'NSSM descargado OK'} else {Write-Host 'ERROR: nssm.exe no encontrado en zip'} } catch { Write-Host ('ERROR: ' + $_.Exception.Message) }" 2>&1
    
    if not exist "%NSSM_EXE%" (
        echo  [ERROR] No se pudo descargar NSSM automaticamente.
        echo  Por favor descargue manualmente desde https://nssm.cc/download
        echo  y coloque nssm.exe en: %NSSM_DIR%\
        pause
        exit /b 1
    )
)
echo  [OK] NSSM: %NSSM_EXE%

echo.
echo  ── Instalando SaaSIA-MetaRelay ────────────────────────────
echo.

set "RELAY_DIR=%PROJECT_DIR%\meta_relay"
set "RELAY_SVC=SaaSIA-MetaRelay"

:: Detener y desinstalar si ya existe
"%NSSM_EXE%" status %RELAY_SVC% >nul 2>&1
if %errorLevel% equ 0 (
    echo  [INFO] Servicio %RELAY_SVC% ya existe. Reinstalando...
    "%NSSM_EXE%" stop %RELAY_SVC% >nul 2>&1
    "%NSSM_EXE%" remove %RELAY_SVC% confirm >nul 2>&1
)

:: Instalar servicio relay
"%NSSM_EXE%" install %RELAY_SVC% node "%RELAY_DIR%\server.js"
"%NSSM_EXE%" set %RELAY_SVC% AppDirectory "%RELAY_DIR%"
"%NSSM_EXE%" set %RELAY_SVC% DisplayName "SaaSIA Meta Relay Server"
"%NSSM_EXE%" set %RELAY_SVC% Description "Relay de webhooks Meta (WhatsApp/Messenger/Instagram) para SaaSIA - relay.smart-box.com.ar"
"%NSSM_EXE%" set %RELAY_SVC% Start SERVICE_AUTO_START
"%NSSM_EXE%" set %RELAY_SVC% AppStdout "%RELAY_DIR%\logs\relay-stdout.log"
"%NSSM_EXE%" set %RELAY_SVC% AppStderr "%RELAY_DIR%\logs\relay-stderr.log"
"%NSSM_EXE%" set %RELAY_SVC% AppRotateFiles 1
"%NSSM_EXE%" set %RELAY_SVC% AppRotateBytes 5242880

:: Crear carpeta de logs
if not exist "%RELAY_DIR%\logs" mkdir "%RELAY_DIR%\logs"

"%NSSM_EXE%" start %RELAY_SVC%
if %errorLevel% equ 0 (
    echo  [OK] Servicio %RELAY_SVC% instalado e iniciado
) else (
    echo  [WARN] Servicio instalado pero no arrancó. Verificar con: nssm status %RELAY_SVC%
)

echo.
echo  ── Instalando SaaSIA-MetaService ──────────────────────────
echo.

set "META_SVC_DIR=%PROJECT_DIR%\ai_core\meta_service"
set "META_SVC=SaaSIA-MetaService"

:: Detener y desinstalar si ya existe
"%NSSM_EXE%" status %META_SVC% >nul 2>&1
if %errorLevel% equ 0 (
    echo  [INFO] Servicio %META_SVC% ya existe. Reinstalando...
    "%NSSM_EXE%" stop %META_SVC% >nul 2>&1
    "%NSSM_EXE%" remove %META_SVC% confirm >nul 2>&1
)

:: Instalar servicio meta_service
"%NSSM_EXE%" install %META_SVC% node "%META_SVC_DIR%\server.js"
"%NSSM_EXE%" set %META_SVC% AppDirectory "%META_SVC_DIR%"
"%NSSM_EXE%" set %META_SVC% DisplayName "SaaSIA Meta Service Local"
"%NSSM_EXE%" set %META_SVC% Description "Servicio local Meta API (WA+IG+FB) para SaaSIA - puerto 8080"
"%NSSM_EXE%" set %META_SVC% Start SERVICE_AUTO_START
"%NSSM_EXE%" set %META_SVC% AppStdout "%META_SVC_DIR%\logs\meta-stdout.log"
"%NSSM_EXE%" set %META_SVC% AppStderr "%META_SVC_DIR%\logs\meta-stderr.log"
"%NSSM_EXE%" set %META_SVC% AppRotateFiles 1
"%NSSM_EXE%" set %META_SVC% AppRotateBytes 5242880

:: Crear carpeta de logs
if not exist "%META_SVC_DIR%\logs" mkdir "%META_SVC_DIR%\logs"

"%NSSM_EXE%" start %META_SVC%
if %errorLevel% equ 0 (
    echo  [OK] Servicio %META_SVC% instalado e iniciado
) else (
    echo  [WARN] Servicio instalado pero no arrancó. Verificar con: nssm status %META_SVC%
)

echo.
echo  ============================================================
echo   RESUMEN
echo  ============================================================
echo.
echo   Servicios instalados:
echo     - %RELAY_SVC% (puerto 7010) — relay publico
echo     - %META_SVC%  (puerto 8080) — servicio local Meta
echo.
echo   Comandos utiles:
echo     Ver estado:    nssm status SaaSIA-MetaRelay
echo     Ver logs:      type "%RELAY_DIR%\logs\relay-stdout.log"
echo     Reiniciar:     net stop SaaSIA-MetaRelay ^& net start SaaSIA-MetaRelay
echo.
echo   Proximo paso: configurar Cloudflare Tunnel
echo     Ver: %RELAY_DIR%\README.md
echo.
pause
