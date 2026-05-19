:loop
echo [%date% %time%] Iniciando WA Service...
cd /d C:\RouthLocal\Plataforma_SaaS_IA\ai_core\whatsapp_service
node server.js
timeout /t 5
goto loop
