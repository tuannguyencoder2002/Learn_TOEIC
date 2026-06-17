@echo off
chcp 65001 >nul
title Learn TOEIC - Setup

cd /d "%~dp0"

echo.
echo  ========================================
echo   Learn TOEIC - Cai dat lan dau
echo  ========================================
echo.
echo  Buoc: npm install + .env.local + PostgreSQL
echo  Mac dinh: postgres / tttt2002 @ localhost:5432
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo  [LOI] Chua cai Node.js 20+
    echo  Tai: https://nodejs.org
    pause
    exit /b 1
)

where psql >nul 2>nul
if errorlevel 1 (
    if not exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" (
        if not exist "C:\Program Files\PostgreSQL\16\bin\psql.exe" (
            echo  [LOI] Chua cai PostgreSQL hoac psql khong co trong PATH.
            echo  Tai: https://www.postgresql.org/download/windows/
            pause
            exit /b 1
        )
    )
)

echo  [1/3] Cai npm packages...
call npm install
if errorlevel 1 (
    echo  [LOI] npm install that bai.
    pause
    exit /b 1
)

if not exist ".env.local" (
    echo  [2/3] Tao .env.local tu .env.example...
    copy /Y ".env.example" ".env.local" >nul
    echo        Sua DATABASE_URL / CURSOR_API_KEY trong .env.local neu can.
) else (
    echo  [2/3] .env.local da ton tai — giu nguyen.
)

echo  [3/3] Tao database + schema...
node scripts\setup-db.js
if errorlevel 1 (
    echo.
    echo  [LOI] Kiem tra PostgreSQL dang chay va mat khau trong .env.local
    pause
    exit /b 1
)

echo.
echo  ========================================
echo   XONG! Chay start.bat de mo app.
echo   http://localhost:4001
echo  ========================================
echo.
pause
