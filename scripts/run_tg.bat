:loop
echo [%date% %time%] Iniciando TG Service...
cd /d C:\RouthLocal\Plataforma_SaaS_IA\ai_core
python telegram_service.py > tg_server.log 2>&1
timeout /t 5
goto loop
