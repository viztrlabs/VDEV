@echo off
title Kill All VizTR Dev Servers
echo ==========================================
echo   VizTR Dev Stack - Killing All Servers
echo ==========================================
echo.

for %%p in (3000 3002 3487) do (
    echo Checking port %%p...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%p "') do (
        if not "%%a"=="" (
            if not "%%a"=="0" (
                echo   Killing PID %%a on port %%p
                taskkill /PID %%a /F >nul 2>&1
            )
        )
    )
)

echo.
echo All VizTR servers stopped.
echo.
pause