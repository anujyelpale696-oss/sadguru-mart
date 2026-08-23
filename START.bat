@echo off
setlocal enabledelayedexpansion

:: ========================================================================
:: Sadguru Mart - Inventory Management System One-Click Startup Script
:: Portable script: Automatically detects project directory (no hardcoded paths)
:: ========================================================================

title Inventory Management System - Launcher

echo ========================================================================
echo        SADGURU MART - INVENTORY MANAGEMENT SYSTEM STARTUP
echo ========================================================================
echo.

:: 1. Detect project root directory dynamically
set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

:: 2. Check Node.js installation
echo [1/5] Checking Node.js environment...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ====================================================================
    echo [ERROR] Node.js is not installed!
    echo ====================================================================
    echo Please install Node.js LTS and run START.bat again.
    echo Download link: https://nodejs.org/en/download
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set "NODE_VERSION=%%v"
echo       - Node.js found: %NODE_VERSION%

:: 3. Check npm availability
echo [2/5] Checking npm package manager...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ====================================================================
    echo [ERROR] npm is unavailable or not found in system PATH!
    echo ====================================================================
    echo Please verify your Node.js installation and try again.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('npm -v') do set "NPM_VERSION=%%v"
echo       - npm found: v%NPM_VERSION%

:: 4. Verify project folders exist
echo [3/5] Verifying project structure...
if not exist "%PROJECT_ROOT%backend" (
    echo.
    echo ====================================================================
    echo [ERROR] 'backend' folder missing in %PROJECT_ROOT%
    echo ====================================================================
    pause
    exit /b 1
)

if not exist "%PROJECT_ROOT%frontend" (
    echo.
    echo ====================================================================
    echo [ERROR] 'frontend' folder missing in %PROJECT_ROOT%
    echo ====================================================================
    pause
    exit /b 1
)
echo       - Backend and Frontend folders verified.

:: 5. Setup Backend Environment if needed
if not exist "%PROJECT_ROOT%backend\.env" (
    if exist "%PROJECT_ROOT%backend\.env.example" (
        copy "%PROJECT_ROOT%backend\.env.example" "%PROJECT_ROOT%backend\.env" >nul
        echo       - Created backend/.env from backend/.env.example
    ) else if exist "%PROJECT_ROOT%.env.example" (
        copy "%PROJECT_ROOT%.env.example" "%PROJECT_ROOT%backend\.env" >nul
        echo       - Created backend/.env from .env.example
    )
)

:: 6. Check & Install Dependencies Automatically
echo [4/5] Checking dependencies...
if not exist "%PROJECT_ROOT%backend\node_modules" (
    echo       - Backend node_modules not found. Installing backend dependencies...
    cd /d "%PROJECT_ROOT%backend"
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install backend dependencies.
        pause
        exit /b 1
    )
    cd /d "%PROJECT_ROOT%"
    echo       - Backend dependencies installed successfully.
) else (
    echo       - Backend dependencies already installed.
)

if not exist "%PROJECT_ROOT%frontend\node_modules" (
    echo       - Frontend node_modules not found. Installing frontend dependencies...
    cd /d "%PROJECT_ROOT%frontend"
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install frontend dependencies.
        pause
        exit /b 1
    )
    cd /d "%PROJECT_ROOT%"
    echo       - Frontend dependencies installed successfully.
) else (
    echo       - Frontend dependencies already installed.
)

:: 7. Start Servers in Separate Labeled Windows
echo [5/5] Launching application servers...

:: Launch Window 1: Backend Server
start "Inventory Management System - Backend" cmd /k "title Inventory Management System - Backend && echo ================================================================ && echo            INVENTORY MANAGEMENT SYSTEM - BACKEND && echo ================================================================ && echo Backend starting... && echo Server running on http://localhost:5000 && echo. && cd /d "%PROJECT_ROOT%backend" && npm start"

:: Launch Window 2: Frontend Server
start "Inventory Management System - Frontend" cmd /k "title Inventory Management System - Frontend && echo ================================================================ && echo            INVENTORY MANAGEMENT SYSTEM - FRONTEND && echo ================================================================ && echo Frontend starting... && echo. && cd /d "%PROJECT_ROOT%frontend" && npm run dev"

:: 8. Wait for Frontend to initialize and open browser
echo.
echo ========================================================================
echo   Both Frontend and Backend servers are starting!
echo   Waiting a few moments before opening the browser...
echo ========================================================================
echo.

timeout /t 4 /nobreak >nul 2>&1 || powershell -Command "Start-Sleep -Seconds 4"

echo Opening browser at http://localhost:3000 ...
start http://localhost:3000

echo.
echo ========================================================================
echo   SADGURU MART IS NOW RUNNING!
echo ========================================================================
echo   - Frontend: http://localhost:3000
echo   - Backend:  http://localhost:5000
echo.
echo   Demo Logins:
echo   - Shopkeeper: shopkeeper@sadgurumart.com  (Password: Shop@123)
echo   - Super Admin: admin@sadgurumart.com     (Password: Admin@123)
echo.
echo   To stop all servers:
echo   Double-click STOP.bat in this folder or close the server windows.
echo ========================================================================
echo.
pause
