#!/bin/bash
# =========================================================
# VizTR Pixel Streaming - ONE-CLICK AUTO-START (Linux/macOS)
# Boots: Cirrus Signalling + Cloudflare Tunnel (background)
# =========================================================
set -e

CIRRUS_DIR="${CIRRUS_DIR:-$PWD}"
SETUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================="
echo "VizTR Pixel Streaming - Auto Start"
echo "=========================================="

# 1. Start Cirrus signalling server (background)
if [ -f "$CIRRUS_DIR/cirrus.js" ]; then
  echo "Starting Cirrus from $CIRRUS_DIR ..."
  ( cd "$CIRRUS_DIR" && node cirrus.js --StreamerPort 8888 --HttpPort 80 --SFUPort 8889 ) &
  CIRRUS_PID=$!
else
  echo "[WARN] cirrus.js not found in $CIRRUS_DIR. Set CIRRUS_DIR env var."
fi

# 2. Wait, then start Cloudflare Tunnel (background)
sleep 4
if command -v cloudflared >/dev/null 2>&1; then
  echo "Starting Cloudflare Tunnel..."
  ( cd "$SETUP_DIR" && cloudflared tunnel run --config cloudflare-config.yml viztr-pixel ) &
  TUNNEL_PID=$!
else
  echo "[WARN] cloudflared not installed. Run setup-tunnel.bat / install cloudflared."
fi

echo
echo "=========================================="
echo "Auto-Start complete (PIDs: cirrus=$CIRRUS_PID tunnel=$TUNNEL_PID)"
echo "  - Cirrus signalling:  http://localhost/stats.json"
echo "  - Public stream:      wss://stream.viztr.io"
echo "=========================================="
echo "Press Ctrl+C to stop all services."

trap 'echo "Stopping..."; kill $CIRRUS_PID $TUNNEL_PID 2>/dev/null; exit 0' INT TERM
wait
