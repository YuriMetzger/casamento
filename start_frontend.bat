@echo off
echo Iniciando o servidor frontend...
cd frontend

:: Tentar usar o npm do PATH
where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Usando npm do PATH do sistema
    npm run dev
    exit /b
)

:: Tentar caminhos comuns de instalação do Node.js
set NODE_PATHS=^
 C:\Program Files\nodejs\npm.cmd^
 C:\Program Files (x86)\nodejs\npm.cmd^
 %APPDATA%\npm\npm.cmd^
 %USERPROFILE%\AppData\Roaming\npm\npm.cmd

for %%p in (%NODE_PATHS%) do (
    if exist "%%p" (
        echo Encontrado npm em: %%p
        "%%p" run dev
        exit /b
    )
)

:: Se chegou aqui, não encontrou o npm
echo ERRO: Não foi possível encontrar o npm em nenhum local comum.
echo Por favor, verifique se o Node.js está instalado corretamente.
echo.
pause
