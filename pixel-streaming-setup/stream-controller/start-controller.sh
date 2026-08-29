#!/bin/bash
# VizTR Stream Controller — GPU-PC sidecar launcher (Linux/macOS)
# Set UE5_EXE to your packaged build to go LIVE, e.g.:
#   UE5_EXE=/opt/viztr/builds/ApexTower/ApexTower.sh CIRRUS_HTTP_PORT=80 node server.js
set -e
export PORT="${PORT:-3001}"
if [ -z "$UE5_EXE" ]; then
  echo "[WARN] UE5_EXE not set — controller will report simulated allocations."
  echo "       Set it to your packaged UE5 build path to launch real streams."
fi
cd "$(dirname "${BASH_SOURCE[0]}")"
node server.js
