@echo off
setlocal

:: ========================================================================
:: Sadguru Mart - Inventory Management System Stop Script
:: Safely stops Backend (Port 5000) and Frontend (Port 3000) servers
:: ========================================================================

title Inventory Management System - Stop Servers

echo ========================================================================
echo        SADGURU MART - STOPPING APPLICATION SERVERS
echo ========================================================================
echo.

echo Checking and stopping Backend (Port 5000)...
for /f "tokens=5" %%a in ('netstat -ano -p tcp ^| findstr ":5000" ^| findstr "LISTENING"') do (
    if not "%%a"=="" if not "%%a"=="0" if not "%%a"=="4" (
        echo   - Stopping Backend server process (PID %%a)
        taskkill /F /T /PID %%a >nul 2>&1
    )
)

echo Checking and stopping Frontend (Port 3000)...
for /f "tokens=5" %%a in ('netstat -ano -p tcp ^| findstr ":3000" ^| findstr "LISTENING"') do (
    if not "%%a"=="" if not "%%a"=="0" if not "%%a"=="4" (
        echo   - Stopping Frontend server process (PID %%a)
        taskkill /F /T /PID %%a >nul 2>&1
    )
)

echo.
echo ========================================================================
echo Inventory Management System servers stopped.
echo ========================================================================
echo.
timeout /t 3 /nobreak >nul 2>&1
