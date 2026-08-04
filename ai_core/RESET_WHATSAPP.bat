@echo off
echo ====================================================
echo RESETEANDO CONEXION DE WHATSAPP (EVOLUTION API)
echo ====================================================
echo.
cd /d "C:\SaaSIA\ai_core"
python reset_whatsapp.py
echo.
echo ====================================================
echo ABRIENDO PANTALLA PARA ESCANEAR EL NUEVO QR...
echo ====================================================
timeout /t 3 >nul
start "" "C:\SaaSIA\ai_core\qr_whatsapp.html"
exit
