@echo off
title Generador de Banners ESTRAL - La Sexta
echo ========================================================
echo INICIANDO EL SERVIDOR LOCAL PARA EL GENERADOR DE BANNERS
echo ========================================================
echo.
echo Abriendo tu navegador... Por favor no cierres esta ventana de color negro mientras usas el generador.
echo.
start http://localhost:8080
npx -y http-server -p 8080 -c-1 -o false
pause
