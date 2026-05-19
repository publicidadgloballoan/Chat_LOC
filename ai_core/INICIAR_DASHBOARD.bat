@echo off
title INICIANDO DASHBOARD PUNTO A
echo ========================================
echo   INICIANDO GESTOR WEB (DASHBOARD)
echo ========================================
cd /d "c:\RouthLocal\punto_a\web_dashboard"
echo Cargando entorno local...
start http://localhost:3000
npm run dev
pause
