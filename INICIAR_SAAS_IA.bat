@echo off
title SaaS IA Platform
echo ================================================
echo   Limpiando procesos anteriores (saltado para no matar el Servidor de Licencias)...
echo ================================================
timeout /t 2 /nobreak >nul

echo ================================================
echo   Iniciando Plataforma SaaS IA...
echo ================================================
cd /d C:\SaaSIA

echo Verificando si hay actualizaciones en GitHub...
git pull

echo Sincronizando claves de API entre servicios...
python sync_env.py

echo Verificando y aplicando estructura de tablas (Prisma db push)...
cd backend
call npx prisma db push --accept-data-loss
cd ..

echo Iniciando servicios en segundo plano...
start /b cmd /c "cd ai_core && python nucleo_ia.py"
ping 127.0.0.1 -n 4 > nul
start /b cmd /c "cd ai_core\whatsapp_service && node server.js"
ping 127.0.0.1 -n 4 > nul
start /b cmd /c "cd backend && node index.js"
ping 127.0.0.1 -n 4 > nul
start /b cmd /c "cd frontend && npm run dev"
ping 127.0.0.1 -n 6 > nul

echo Abriendo Dashboard...
start http://localhost:3000
