#!/bin/bash
# VizTR Pixel Streaming - Cirrus Signalling Server Startup Script
# Run from: Engine/Plugins/Media/PixelStreaming/Resources/WebServers/SignallingWebServer/

set -e

echo "=========================================="
echo "VizTR Cirrus Signalling Server"
echo "=========================================="
echo "StreamerPort: 8888 (UE5 connection)"
echo "HttpPort:     80   (Browser HTTP)"
echo "SFUPort:      8889 (WebRTC SFU)"
echo "=========================================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo "Starting Cirrus server..."
exec node cirrus.js --StreamerPort 8888 --HttpPort 80 --SFUPort 8889