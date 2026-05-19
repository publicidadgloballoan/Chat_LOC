:loop
echo [%date% %time%] Iniciando Nucleo IA...
cd /d C:\RouthLocal\Plataforma_SaaS_IA\ai_core
python nucleo_ia.py
timeout /t 5
goto loop
