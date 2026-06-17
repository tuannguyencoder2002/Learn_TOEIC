@echo off
chcp 65001 >nul
title Learn TOEIC

cd /d "%~dp0"

echo.
echo  ========================================
echo   Learn TOEIC
echo  ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo  [LOI] Chua cai Node.js. Chay setup.bat truoc.
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo  Chua cai dependencies — chay setup.bat truoc.
    pause
    exit /b 1
)

if not exist ".env.local" (
    echo  Chua co .env.local — chay setup.bat truoc.
    pause
    exit /b 1
)

set APP_PORT=4001

for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "$ip = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -match '^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)' } | Select-Object -First 1 -ExpandProperty IPAddress; if ($ip) { $ip } else { '127.0.0.1' }"`) do set LAN_IP=%%i

echo  PC:         http://localhost:%APP_PORT%
echo  Dien thoai: http://%LAN_IP%:%APP_PORT%  ^(cung WiFi^)
echo.

netsh advfirewall firewall show rule name="Learn TOEIC Port %APP_PORT%" >nul 2>&1
if errorlevel 1 (
    netsh advfirewall firewall add rule name="Learn TOEIC Port %APP_PORT%" dir=in action=allow protocol=TCP localport=%APP_PORT% profile=private >nul 2>&1
)

if exist ".next\cache\" rmdir /s /q ".next\cache" 2>nul

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%APP_PORT%" ^| findstr "LISTENING"') do (
  taskkill /PID %%a /F >nul 2>nul
)

start "" cmd /c "ping 127.0.0.1 -n 8 >nul && start http://localhost:%APP_PORT%/"
call npm run dev

pause
