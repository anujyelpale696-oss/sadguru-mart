@echo off
setlocal enabledelayedexpansion

:: ========================================================================
:: Sadguru Mart - Create Windows Desktop Shortcut
:: ========================================================================

title Inventory Management System - Create Desktop Shortcut

echo ========================================================================
echo        SADGURU MART - CREATE DESKTOP SHORTCUT
echo ========================================================================
echo.

set "PROJECT_ROOT=%~dp0"
set "TARGET_BAT=%PROJECT_ROOT%START.bat"

echo Creating desktop shortcut pointing to START.bat...

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $desktop = [System.Environment]::GetFolderPath('Desktop'); $s = $ws.CreateShortcut(\"$desktop\Inventory Management System.lnk\"); $s.TargetPath = '%TARGET_BAT%'; $s.WorkingDirectory = '%PROJECT_ROOT%'; $s.Description = 'Launch Sadguru Mart Inventory Management System'; $s.Save()"

if %errorlevel% equ 0 (
    echo.
    echo ========================================================================
    echo [SUCCESS] Desktop Shortcut 'Inventory Management System' created!
    echo You can now start the application directly from your Windows Desktop.
    echo ========================================================================
) else (
    echo.
    echo [ERROR] Failed to automatically create desktop shortcut.
)

echo.
pause
