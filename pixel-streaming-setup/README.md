# VizTR Pixel Streaming — Local GPU Workstation Setup (Phase 2)

Complete setup for running the Cirrus signalling server locally and exposing it via Cloudflare Tunnel for the VizTR Next.js frontend.

---

## Prerequisites

- **Windows 10/11** (or Linux/macOS with adaptations)
- **Node.js 18+** and **npm**
- **Unreal Engine 5.4+** installed at `C:\Program Files\Epic Games\UE_5.4`
- **Cloudflare account** with `viztr.io` domain added
- **VPS** (DigitalOcean $6/mo) for TURN server (optional but recommended)

---

## Folder Structure

```
pixel-streaming-setup/
├── start-cirrus.bat          # Windows Cirrus startup
├── start-cirrus.sh           # Linux/macOS Cirrus startup
├── auto-start.bat           # ONE-CLICK: Cirrus + Tunnel (Windows)
├── auto-start.sh             # ONE-CLICK: Cirrus + Tunnel (Linux/macOS)
├── start-cirrus.bat          # Windows Cirrus startup (standalone)
├── start-cirrus.sh           # Linux/macOS Cirrus startup (standalone)
├── setup-pm2.bat             # PM2 production setup (Windows)
├── ecosystem.config.js       # PM2 process config
├── setup-tunnel.bat          # Cloudflare Tunnel setup
├── run-tunnel.bat            # Run Cloudflare Tunnel (standalone)
├── cloudflare-config.yml     # Tunnel ingress config
├── stream-controller/         # GPU-PC sidecar: launches/stops UE5 + reports state
│   ├── server.js              #   Node HTTP control service (port 3001)
│   ├── package.json           #   standalone, zero deps
│   ├── start-controller.bat   #   Windows launcher
│   └── start-controller.sh    #   Linux/macOS launcher
├── docker-compose.yml        # TURN server (coturn)
├── .env.example              # TURN credentials template (copy to .env)
└── README.md                 # This file
```

---

## Phase 2 — One-Click Auto-Start (recommended)

Instead of running each service by hand, use the consolidated launcher:

**Windows:**
```bat
auto-start.bat
```
This opens two windows — Cirrus signalling (port 80/8888/8889) and the Cloudflare Tunnel — and stops both when you close the launcher.

**Linux / macOS:**
```bash
chmod +x auto-start.sh
CIRRUS_DIR=/path/to/SignallingWebServer ./auto-start.sh
```

> The TURN server (coturn) runs separately on your VPS:
> ```bash
> cd pixel-streaming-setup
> cp .env.example .env   # edit EXTERNAL_IP + TURN_PASSWORD
> EXTERNAL_IP=$(curl -s ifconfig.me) docker compose up -d
> ```

---

## Phase 2A — Cirrus Signalling Server (Local GPU PC)

### 1. Locate Cirrus Source

The official Cirrus server comes with UE5:

```
C:\Program Files\Epic Games\UE_5.4\Engine\Plugins\Media\PixelStreaming\Resources\WebServers\SignallingWebServer
```

### 2. Install & Test

```cmd
cd "C:\Program Files\Epic Games\UE_5.4\Engine\Plugins\Media\PixelStreaming\Resources\WebServers\SignallingWebServer"

# Copy our startup script
copy C:\Users\Arch_Viz\Desktop\VizTR\Dev\vdev\pixel-streaming-setup\start-cirrus.bat .

# Run (installs deps on first run)
start-cirrus.bat
```

**Verify:** Open `http://localhost/stats.json` — should return JSON with connected streamers.

### 3. Production: PM2

```cmd
# Copy PM2 config
copy C:\Users\Arch_Viz\Desktop\VizTR\Dev\vdev\pixel-streaming-setup\ecosystem.config.js .
copy C:\Users\Arch_Viz\Desktop\VizTR\Dev\vdev\pixel-streaming-setup\setup-pm2.bat .

# Run setup (as Administrator for startup registration)
setup-pm2.bat
```

**Commands:**
```cmd
pm2 status
pm2 logs viztr-cirrus
pm2 restart viztr-cirrus
pm2 stop viztr-cirrus
```

---

## Phase 2B — Cloudflare Tunnel (Exposes `wss://stream.viztr.io`)

### 1. Install cloudflared

```cmd
winget install --id Cloudflare.cloudflared
```

### 2. One-Time Setup

```cmd
copy C:\Users\Arch_Viz\Desktop\VizTR\Dev\vdev\pixel-streaming-setup\setup-tunnel.bat .
setup-tunnel.bat
```

This will:
- Open browser for Cloudflare login
- Create tunnel `viztr-pixel`
- Route DNS `stream.viztr.io` → tunnel

### 3. Run Tunnel

```cmd
copy C:\Users\Arch_Viz\Desktop\VizTR\Dev\vdev\pixel-streaming-setup\run-tunnel.bat .
run-tunnel.bat
```

**Verify:** `wss://stream.viztr.io` WebSocket connects from any browser.

---

## Phase 2C — TURN Server (NAT Traversal)

Required for WebRTC connections through strict NATs/firewalls.

### On VPS (DigitalOcean/Linode/Vultr)

```bash
# Copy docker-compose.yml to VPS
scp docker-compose.yml root@your-vps-ip:/opt/viztr-turn/

# Set external IP and deploy
EXTERNAL_IP=$(curl -s ifconfig.me) docker compose -f /opt/viztr-turn/docker-compose.yml up -d
```

### Configure Cirrus for TURN

Edit Cirrus `config.json` (or pass via env):
```json
{
  "iceServers": [
    { "urls": "stun:stun.l.google.com:19302" },
    {
      "urls": "turn:your-vps-ip:3478?transport=udp",
      "username": "viztr",
      "credential": "your_secure_password_here"
    },
    {
      "urls": "turn:your-vps-ip:3478?transport=tcp",
      "username": "viztr",
      "credential": "your_secure_password_here"
    }
  ]
}
```

---

## Phase 2D — UE5 Project Configuration

### 1. Enable Plugin

UE5 Editor → **Edit → Plugins** → Search "Pixel Streaming" → **Enable** → Restart.

### 2. Launch Flags

Create `LaunchPixelStreaming.bat` in your packaged game folder:

```cmd
@echo off
MyProject.exe ^
  -PixelStreamingIP=localhost ^
  -PixelStreamingPort=8888 ^
  -RenderOffScreen ^
  -ResX=1920 -ResY=1080 ^
  -GraphicsAdapter=0 ^
  -AudioMixer ^
  -AllowPixelStreamingCommands
```

### 3. Blueprint (Optional)

Level Blueprint → **BeginPlay** → **Start Pixel Streaming** node.

---

## Phase 2E — Next.js Frontend Config

In `/c/Users/Arch_Viz/Desktop/VizTR/Dev/vdev/.env.local`:

```env
NEXT_PUBLIC_PS_SIGNALING_URL=wss://stream.viztr.io
NEXT_PUBLIC_TURN_USERNAME=viztr
NEXT_PUBLIC_TURN_CREDENTIAL=your_secure_password_here
NEXT_PUBLIC_TURN_URLS=turn:your-vps-ip:3478?transport=udp,turn:your-vps-ip:3478?transport=tcp
```

---

## Verification Checklist

| Step | Command / Check | Expected |
|------|-----------------|----------|
| Cirrus running | `curl http://localhost/stats.json` | Valid JSON |
| PM2 managing | `pm2 status` | `viztr-cirrus` online |
| Tunnel active | `cloudflared tunnel run --url http://localhost:80 viztr-pixel` | No errors |
| DNS resolves | `nslookup stream.viztr.io` | Cloudflare IPs |
| WSS connects | Browser devtools → Network → WS | `101 Switching Protocols` |
| UE5 connects | Cirrus stats shows streamer | `streamers: 1` |
| Frontend loads | `http://localhost:3002/xr-world` | "Live" badge green |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Port 80 in use | Run as Admin, or change HttpPort to 8080 |
| UE5 won't connect | Check `-PixelStreamingIP=localhost` matches Cirrus |
| WebRTC fails | Verify TURN server reachable, check firewall UDP 49152-65535 |
| Tunnel 502 | Ensure Cirrus HTTP on port 80, check `cloudflared` logs |
| No video in browser | Check `Flags.BrowserSendOffer: false` in frontend config |

---

## Stream Controller — Real Start/Stop from the Dashboard (Phase 2F)

The Super-Admin dashboard "Allocate GPU Node" / "Release Node" buttons hit
`/api/pixel-streaming/start|stop`. Those Next.js routes **proxy to a sidecar
service that runs ON the GPU-PC** (`stream-controller/server.js`). That sidecar
is what actually spawns/kills the packaged UE5 build and reports live state.

### On the GPU-PC, start the controller (keep it running alongside Cirrus):
```bat
cd pixel-streaming-setup/stream-controller
set UE5_EXE=C:\VizTR\Builds\ApexTower\Windows\ApexTower.exe
start-controller.bat
```
```bash
UE5_EXE=/opt/viztr/builds/ApexTower/ApexTower.sh ./stream-controller/start-controller.sh
```

### Point the Next.js backend at it:
In `.env.local` (wherever Next.js runs):
```env
STREAM_CONTROLLER_URL=http://<gpu-pc-ip>:3001
```
If the controller is unreachable, the API routes fall back to **simulated**
allocations so the UI still works for demos.

### What the controller does
| Endpoint | Action |
|----------|--------|
| `POST /start` | Spawns UE5 with `-PixelStreamingURL -PixelStreamingPort -RenderOffScreen -ResX -ResY -fps` (real launch when `UE5_EXE` exists) |
| `POST /stop` | Sends `SIGTERM` to the UE5 process (graceful spin-down) |
| `GET /status` | Live process health + Cirrus `stats.json` streamer count |
| `GET /health` | `{ ok, ue5Available }` |

> Env overrides: `CONTROLLER_PORT` (default 3001), `UE5_EXE`, `CIRRUS_URL`,
> `CIRRUS_HTTP_PORT` (80), `PS_STREAMER_PORT` (8888), `PS_SIGNALING_URL`.

---

## Next: Phase 3 — UE5.5+/PS2 Migration (Prompt 14)

When upgrading to UE5.5+:
- Package changes to `@epicgames-ps/lib-pixelstreamingfrontend-ue5.6`
- Signalling protocol changes (PS2)
- Run migration prompt from the 20-prompt plan

---

## Files Reference

| File | Purpose |
|------|---------|
| `start-cirrus.bat/.sh` | Direct Cirrus launch |
| `ecosystem.config.js` | PM2 production config |
| `setup-pm2.bat` | Installs PM2, registers startup |
| `cloudflare-config.yml` | Tunnel ingress rules |
| `setup-tunnel.bat` | One-time tunnel + DNS setup |
| `run-tunnel.bat` | Daily tunnel runner |
| `docker-compose.yml` | TURN server for NAT traversal |

---

**Ready for production demo?** Run the smoke test (Prompt 20 from the 20-prompt plan) before every client session.