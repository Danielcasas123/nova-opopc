@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo          NOVA PC - INSTALADOR
echo ============================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo No se encontro Node.js.
  echo Instala Node.js LTS desde https://nodejs.org/ y vuelve a ejecutar este archivo.
  echo.
  pause
  exit /b 1
)
echo [1/2] Descargando dependencias necesarias...
call npm install
if errorlevel 1 (
  echo.
  echo No se pudieron instalar las dependencias. Revisa la conexion o los permisos del equipo.
  pause
  exit /b 1
)
echo.
echo [2/2] Creando instalador de Windows...
call npm run dist
if errorlevel 1 (
  echo.
  echo La compilacion fallo. Revisa el mensaje anterior.
  pause
  exit /b 1
)
echo.
echo Listo. Busca el instalador dentro de la carpeta dist.
pause
