#!/bin/bash
# VizTR Cloudflare Tunnel Runner (Linux/macOS)
# Exposes stream.viztr.io -> localhost:80 (HTTP) & localhost:8889 (WS/SFU)
set -e

SETUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SETUP_DIR"

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "cloudflared not found. Run setup-tunnel.sh first."
  exit 1
fi

if grep -q "__CREDENTIALS_PATH__" cloudflare-config.yml; then
  echo "[WARN] cloudflare-config.yml still has placeholder. Run setup-tunnel.sh first."
  exit 1
fi

echo "Starting tunnel (Ctrl+C to stop)..."
cloudflared tunnel run --config cloudflare-config.yml viztr-pixel
