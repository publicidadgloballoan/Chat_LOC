:loop
echo [%date% %time%] Iniciando Backend...
cd /d C:\RouthLocal\Plataforma_SaaS_IA\backend
node index.js
timeout /t 5
goto loop
