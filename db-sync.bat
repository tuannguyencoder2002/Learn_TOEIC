@echo off
chcp 65001 >nul
title Learn TOEIC - Dong bo Database
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo  [LOI] Chua cai Node.js 20+  -  https://nodejs.org
    pause
    exit /b 1
)

:menu
echo.
echo  ========================================
echo   Learn TOEIC - Dong bo toan bo Database
echo  ========================================
echo.
echo   Thu muc chung dat o bien SYNC_DIR trong .env.local
echo   (vd: o Google Drive / o mang LAN da map san)
echo.
echo   [1] EXPORT  - May NGUON: day toan bo DB ra thu muc chung
echo   [2] IMPORT  - May DICH : nap DB tu thu muc chung (ghi de, y het)
echo   [3] Thoat
echo.
set "choice="
set /p choice=  Chon (1/2/3):

if "%choice%"=="1" goto export
if "%choice%"=="2" goto import
if "%choice%"=="3" exit /b 0
echo  Lua chon khong hop le.
goto menu

:export
echo.
node scripts\db-sync.js export
if errorlevel 1 (
    echo.
    echo  [LOI] Export that bai. Kiem tra PostgreSQL dang chay va .env.local.
)
echo.
pause
goto menu

:import
echo.
echo  CANH BAO: Import se XOA database hien tai tren may nay
echo            va thay bang ban tu thu muc chung.
set "ok="
set /p ok=  Go YES de tiep tuc:
if /I not "%ok%"=="YES" (
    echo  Da huy.
    goto menu
)
echo.
node scripts\db-sync.js import
if errorlevel 1 (
    echo.
    echo  [LOI] Import that bai. Kiem tra file dump trong SYNC_DIR va .env.local.
)
echo.
pause
goto menu
