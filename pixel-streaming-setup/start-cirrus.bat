@echo off
REM VizTR Pixel Streaming - Cirrus Signalling Server Startup Script
REM Run from: Engine/Plugins/Media/PixelStreaming/Resources/WebServers/SignallingWebServer/

echo ==========================================
echo VizTR Cirrus Signalling Server
echo ==========================================
echo StreamerPort: 8888 (UE5 connection)
echo HttpPort:     80   (Browser HTTP)
echo SFUPort:      8889 (WebRTC SFU)
echo ==========================================

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Failed to install dependencies
        pause
        exit /b 1
    )
)

echo Starting Cirrus server...
node cirrus.js --StreamerPort 8888 --HttpPort 80 --SFUPort 8889

echo.
echo Server stopped.
pause