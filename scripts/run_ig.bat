:loop
echo [%date% %time%] Iniciando IG Service...
cd /d C:\RouthLocal\Plataforma_SaaS_IA\ai_core
python instagram_service.py > ig_server.log 2>&1
timeout /t 5
goto loop
