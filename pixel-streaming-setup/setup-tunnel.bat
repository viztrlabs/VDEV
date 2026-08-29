@echo off
REM VizTR Cloudflare Tunnel Setup for Pixel Streaming
REM Run once to configure tunnel, then run-tunnel.bat to start

echo ==========================================
echo VizTR Cloudflare Tunnel Setup
echo ==========================================
echo This will create a tunnel for stream.viztr.io
echo pointing to your local Cirrus server.
echo ==========================================

REM Check if cloudflared is installed
where cloudflared >nul 2>&1
if %errorlevel% neq 0 (
    echo cloudflared not found. Installing via winget...
    winget install --id Cloudflare.cloudflared
    if errorlevel 1 (
        echo Failed to install cloudflared. Please install manually:
        echo   https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation
        pause
        exit /b 1
    )
)

REM Login to Cloudflare (opens browser)
echo.
echo Logging into Cloudflare (browser will open)...
cloudflared tunnel login

REM Create named tunnel
echo.
echo Creating tunnel 'viztr-pixel'...
cloudflared tunnel create viztr-pixel

REM Determine credentials path (created by the command above)
set "CRED_FILE=%USERPROFILE%\.cloudflared\viztr-pixel.json"

REM Rewrite cloudflare-config.yml with the correct Windows credentials path
echo.
echo Patching cloudflare-config.yml credentials path...
powershell -Command "(Get-Content cloudflare-config.yml) -replace '__CREDENTIALS_PATH__', '%CRED_FILE:\=\\%' | Set-Content cloudflare-config.yml"

echo.
echo ==========================================
echo Tunnel created! Credentials saved to:
echo   %CRED_FILE%
echo ==========================================
echo Next: Run 'run-tunnel.bat' to start the tunnel
echo ==========================================

pause