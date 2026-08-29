@echo off
REM VizTR Cloudflare Tunnel Runner
REM Run this daily to start the tunnel for stream.viztr.io

echo ==========================================
echo VizTR Cloudflare Tunnel
echo ==========================================
echo Exposing stream.viztr.io -> localhost:80 (HTTP) & localhost:8889 (WS/SFU)
echo ==========================================

REM Check if cloudflared is installed
where cloudflared >nul 2>&1
if %errorlevel% neq 0 (
    echo cloudflared not found. Run setup-tunnel.bat first.
    pause
    exit /b 1
)

REM Check if credentials exist
if not exist "%USERPROFILE%\.cloudflared\viztr-pixel.json" (
    echo Tunnel credentials not found. Run setup-tunnel.bat first.
    pause
    exit /b 1
)

echo Starting tunnel...
echo Press Ctrl+C to stop
echo.

cloudflared tunnel run --config cloudflare-config.yml viztr-pixel

echo.
echo Tunnel stopped.
pause