@echo off
:: ============================================================
:: SaaSIA — Iniciar Meta Relay Server
:: Puerto: 7010
:: Ejecutar como ADMINISTRADOR
:: ============================================================

setlocal
set "RELAY_DIR=%~dp0"

echo.
echo  ============================================================
echo   SaaSIA - Meta Relay Server
echo   Puerto: 7010
echo  ============================================================
echo.

:: Verificar Node.js
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Node.js no esta instalado.
    echo Descargar: https://nodejs.org
    pause & exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo [OK] Node.js: %%v

:: Verificar que las dependencias esten instaladas
if not exist "%RELAY_DIR%node_modules" (
    echo [INFO] Instalando dependencias...
    cd /d "%RELAY_DIR%"
    npm install
)

:: Verificar que el .env existe
if not exist "%RELAY_DIR%.env" (
    echo [WARN] .env no encontrado. Usando valores por defecto.
)

:: Matar proceso previo en puerto 7010 si existe
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":7010" ^| findstr "LISTENING" 2^>nul') do (
    echo [INFO] Liberando puerto 7010 ^(PID %%p^)...
    taskkill /PID %%p /F >nul 2>&1
)

echo.
echo [OK] Iniciando Meta Relay en http://localhost:7010 ...
echo      Presionar Ctrl+C para detener
echo.

cd /d "%RELAY_DIR%"
node server.js
