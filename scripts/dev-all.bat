@echo off
title VizTR Dev Stack - All Services

echo ==========================================
echo   VizTR Dev Stack - Starting All Services
echo ==========================================
echo.

REM Kill existing processes on our ports
for %%p in (3000 3002 3487) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%p "') do (
        if not "%%a"=="" (
            taskkill /PID %%a /F >nul 2>&1
        )
    )
)
echo [CLEANUP] Stopped existing processes on ports 3000, 3002, 3487

cd /d "C:\Users\Arch_Viz\Desktop\VizTR\Dev\vdev"

echo.
echo [INSTALL] Checking dependencies...
if not exist node_modules (
    echo Installing root dependencies...
    npm install
)
if not exist forks\editor\server\node_modules (
    echo Installing editor server dependencies...
    npm install --prefix forks\editor\server
)

echo.
echo [START] Launching all services...
echo.
echo Services will be available at:
echo   Next.js App:          http://localhost:3000
echo   Editor Engine:        http://localhost:3487
echo   SuperSplat Editor:    http://localhost:3002
echo.
echo Key Pages:
echo   XR World Hub:         http://localhost:3000/xr-world
echo   VizSplat Showcase:    http://localhost:3000/xr-world/vizsplat
echo   VizSplat Editor:      http://localhost:3000/xr-world/vizsplat/editor
echo   XR Editor (PlayCanvas): http://localhost:3487/editor/scene/1
echo.
echo Press Ctrl+C to stop all services
echo.

npx concurrently --kill-others-on-fail --prefix-colors cyan,green,magenta --prefix "[{name}]" --names "NEXT,ENGINE,SUPERSPLAT" "npm run dev:splat-editor" "npm run dev:engine" "npm run dev:supersplat"

pause