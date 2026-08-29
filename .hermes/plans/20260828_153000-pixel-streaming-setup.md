# VizTR Pixel Streaming Setup Guide
# Based on the 3-phase implementation: UE5 Config → Cirrus Server → Next.js Integration

## Phase 1: Unreal Engine 5 Configuration

### Step 1: Enable Pixel Streaming Plugin
- Open UE5 project → Edit → Plugins → search "Pixel Streaming" → enable
- Restart editor

### Step 2: Launch with streaming flags
```bash
MyProject.exe \
  -PixelStreamingIP=localhost \
  -PixelStreamingPort=8888 \
  -RenderOffScreen \
  -ResX=1920 -ResY=1080 \
  -GraphicsAdapter=0 \
  -AudioMixer \
  -AllowPixelStreamingCommands
```

### Step 3: (Optional) Blueprint auto-start
Add `Start Pixel Streaming` node to Level Blueprint → BeginPlay

## Phase 2: Cirrus Signalling Server (Local GPU PC)

### Location
`C:\Program Files\Epic Games\UE_5.x\Engine\Plugins\Media\PixelStreaming\Resources\WebServers\SignallingWebServer`

### Install & Run
```bash
npm install
node cirrus.js --StreamerPort 8888 --HttpPort 80 --SFUPort 8889
```

### PM2 Process Management
```bash
npm install -g pm2
pm2 start cirrus.js --name viztr-ps -- --StreamerPort 8888 --HttpPort 80
pm2 save
pm2 startup
```

### Cloudflare Tunnel (for remote access)
```bash
winget install --id Cloudflare.cloudflared
cloudflared login
cloudflared tunnel create viztr-pixel
cloudflared tunnel route dns viztr-pixel stream.viztr.io
cloudflared tunnel run --url http://localhost:80 viztr-pixel
```

## Phase 3: Next.js Integration

### Install Frontend Library
```bash
pnpm add @epicgames-ps/lib-pixelstreamingfrontend-ue5.6 @epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.6
```

### Environment Variable
```
NEXT_PUBLIC_PS_SIGNALING_URL=wss://stream.viztr.io
```

## Startup Order (Client Demo)
1. `pm2 start viztr-ps` — Cirrus signalling server
2. `cloudflared tunnel run viztr-pixel` — tunnel to web
3. Launch UE5 packaged build with streaming flags
4. Client accesses `viztr.io/xr-world/pixel-streaming`

## UE5.5+ Upgrade Path
When upgrading to UE5.5+, install Pixel Streaming 2 plugin which uses a different signalling protocol.
See `components/xr/PixelStreamingPS2.tsx` for the PS2 frontend variant.