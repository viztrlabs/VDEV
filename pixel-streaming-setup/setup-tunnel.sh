#!/bin/bash
# VizTR Cloudflare Tunnel Setup (Linux/macOS) for Pixel Streaming
# Run ONCE to configure the tunnel, then run-tunnel.sh to start.
set -e

echo "=========================================="
echo "VizTR Cloudflare Tunnel Setup (Linux)"
echo "=========================================="

# Ensure cloudflared is available
if ! command -v cloudflared >/dev/null 2>&1; then
  echo "cloudflared not found. Install: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
  exit 1
fi

# Login to Cloudflare (opens browser)
echo "Logging into Cloudflare (browser will open)..."
cloudflared tunnel login

# Create named tunnel
echo "Creating tunnel 'viztr-pixel'..."
cloudflared tunnel create viztr-pixel

# Credentials land at ~/.cloudflared/<id>.json — resolve the real path
CRED_FILE="$HOME/.cloudflared/viztr-pixel.json"
if [ ! -f "$CRED_FILE" ]; then
  # Fallback: pick the json that was just created
  CRED_FILE=$(ls -t "$HOME/.cloudflared"/*.json 2>/dev/null | head -1)
fi

# Rewrite config with correct absolute path
echo "Patching cloudflare-config.yml credentials path -> $CRED_FILE"
sed -i "s|__CREDENTIALS_PATH__|$CRED_FILE|g" cloudflare-config.yml

# Route DNS
echo "Routing DNS for stream.viztr.io..."
cloudflared tunnel route dns viztr-pixel stream.viztr.io || echo "[WARN] DNS route failed — ensure viztr.io is in Cloudflare."

echo "=========================================="
echo "Tunnel created! Credentials: $CRED_FILE"
echo "Next: ./run-tunnel.sh"
echo "=========================================="
