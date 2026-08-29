@echo off
REM VizTR Cirrus - PM2 Production Setup (Windows)
REM Run as Administrator for PM2 startup registration

echo ==========================================
echo VizTR Cirrus PM2 Setup
echo ==========================================

REM Install PM2 globally if not present
where pm2 >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing PM2 globally...
    npm install -g pm2
)

REM Create logs directory
if not exist "C:\viztr-logs" mkdir C:\viztr-logs

REM Copy ecosystem config to Cirrus directory
copy /Y ecosystem.config.js "C:\Program Files\Epic Games\UE_5.4\Engine\Plugins\Media\PixelStreaming\Resources\WebServers\SignallingWebServer\ecosystem.config.js"

REM Start Cirrus via PM2
cd /d "C:\Program Files\Epic Games\UE_5.4\Engine\Plugins\Media\PixelStreaming\Resources\WebServers\SignallingWebServer"
pm2 start ecosystem.config.js --env production

REM Save PM2 process list
pm2 save

REM Setup PM2 to start on Windows boot
echo.
echo Setting up PM2 startup (run as Administrator if needed)...
pm2 startup

echo.
echo ==========================================
echo VizTR Cirrus is now managed by PM2!
echo ==========================================
echo Commands:
echo   pm2 status          - Show status
echo   pm2 logs viztr-cirrus - View logs
echo   pm2 restart viztr-cirrus - Restart
echo   pm2 stop viztr-cirrus    - Stop
echo ==========================================

pause