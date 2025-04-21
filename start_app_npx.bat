@echo off
echo ===================================================
echo    Iniciando a aplicacao de Planejamento de Casamento
echo ===================================================
echo.

echo Iniciando o servidor backend...
start cmd /k "cd backend && python app.py"

echo Aguardando o backend iniciar...
timeout /t 3 /nobreak >nul

echo Iniciando o servidor frontend com npx...
start cmd /k "cd frontend && npx vite"

echo.
echo ===================================================
echo    Aplicacao iniciada com sucesso!
echo.
echo    Backend: http://localhost:5000
echo    Frontend: http://localhost:5173
echo.
echo    Para parar a aplicacao, feche as janelas de terminal.
echo ===================================================
echo.

pause
