@echo off
setlocal
REM Wrapper to run PowerShell script without requiring global ExecutionPolicy changes
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%start-backend.ps1" -ProjectRoot "%PROJECT_ROOT%"
endlocal
