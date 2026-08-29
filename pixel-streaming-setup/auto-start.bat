@echo off
REM ==========================================================
REM VizTR Pixel Streaming - ONE-CLICK AUTO-START (Windows)
REM Boots: Cirrus Signalling + Cloudflare Tunnel
REM (Run TURN via docker-compose separately: docker compose up -d)
REM ==========================================================
title VizTR Pixel Streaming Auto-Start
setlocal

echo ==========================================
echo VizTR Pixel Streaming - Auto Start
echo ==========================================

REM 1. Start Cirrus in a new window (SignallingWebServer dir)
if exist "C:\Program Files\Epic Games\UE_5.4\Engine\Plugins\Media\PixelStreaming\Resources\WebServers\SignallingWebServer\cirrus.js" (
    start "Cirrus" cmd /k "cd /d ""C:\Program Files\Epic Games\UE_5.4\Engine\Plugins\Media\PixelStreaming\Resources\WebServers\SignallingWebServer"" && node cirrus.js --StreamerPort 8888 --HttpPort 80 --SFUPort 8889"
) else (
    echo [WARN] Cirrus not found at default UE path. Starting from CWD...
    start "Cirrus" cmd /k "cd /d ""%~dp0"" && node cirrus.js --StreamerPort 8888 --HttpPort 80 --SFUPort 8889"
)

REM 2. Wait for Cirrus to come up, then start the tunnel
timeout /t 4 /nobreak >nul

where cloudflared >nul 2>&1
if %errorlevel% equ 0 (
    echo Starting Cloudflare Tunnel...
    start "Tunnel" cmd /k "cd /d ""%~dp0"" && cloudflared tunnel run --config cloudflare-config.yml viztr-pixel"
) else (
    echo [WARN] cloudflared not installed. Run setup-tunnel.bat first.
)

echo.
echo ==========================================
echo Auto-Start complete.
echo  - Cirrus signalling:  http://localhost/stats.json
echo  - Public stream:      wss://stream.viztr.io
echo  - UE5 streamer port:  8888
echo ==========================================
echo Press any key to STOP all services...
pause >nul

REM Stop everything
taskkill /fi "WINDOWTITLE eq Cirrus*" /f >nul 2>&1
taskkill /fi "WINDOWTITLE eq Tunnel*" /f >nul 2>&1
echo Stopped.
