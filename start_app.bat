@echo off
echo ===================================================
echo    Iniciando a aplicacao de Planejamento de Casamento
echo ===================================================
echo.

echo Verificando se o Node.js esta instalado...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo AVISO: Node.js nao encontrado!
    echo O frontend nao sera iniciado.
    echo Para instalar o Node.js, acesse: https://nodejs.org/
    echo.
    echo Continuando apenas com o backend...
    set SKIP_FRONTEND=1
) else (
    set SKIP_FRONTEND=0
)

echo Verificando se o Python esta instalado...
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Python nao encontrado!
    echo Por favor, instale o Python antes de continuar.
    echo Voce pode baixa-lo em: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo Iniciando o servidor backend...
start cmd /k "start_backend.bat"

echo Aguardando o backend iniciar...
timeout /t 3 /nobreak >nul

if %SKIP_FRONTEND%==0 (
    echo Iniciando o servidor frontend...
    start cmd /k "start_frontend.bat"
) else (
    echo Frontend ignorado devido a falta do Node.js.
)

echo.
echo ===================================================
echo    Aplicacao iniciada com sucesso!
echo.
echo    Backend: http://localhost:5000
if %SKIP_FRONTEND%==0 (
    echo    Frontend: http://localhost:5173
)
echo.
echo    Para parar a aplicacao, feche as janelas de terminal.
echo ===================================================
echo.

pause
