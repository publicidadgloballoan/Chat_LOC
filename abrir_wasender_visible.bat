@echo off
title Motor WASender Chromium - ComunicacionMKT
cd /d c:\SaaSIA

echo Liberando instancias previas de Chromium...
powershell -Command "Get-Process chrome -ErrorAction SilentlyContinue | Where-Object { $_.Path -like '*ms-playwright*' } | Stop-Process -Force" >nul 2>&1

echo Abriendo Motor WASender Chromium en tu pantalla...
python ai_core\wasender_engine.py --visible
pause
