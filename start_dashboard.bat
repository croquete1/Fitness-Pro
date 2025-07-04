@echo off
echo Abrindo projeto React/Vite...

:: Navegar para a pasta do projeto (ajuste conforme necessário)
cd /d "%~dp0"

:: Instalar dependências (apenas na 1ª vez)
if not exist node_modules (
  echo Instalando dependências...
  npm install
)

:: Iniciar servidor de desenvolvimento
echo Iniciando o servidor...
npm run dev

pause