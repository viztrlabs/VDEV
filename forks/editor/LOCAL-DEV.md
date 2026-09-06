# VizTR Editor — Local Development

## Quick Start

```bash
cd forks/editor

# Build the frontend
npm run build

# Start the local backend server
npm run start:local
```

**Editor:** http://localhost:3487
**Dashboard:** http://localhost:3000/editor-projects (requires Next.js running)

## How It Works

The local backend replaces the PlayCanvas cloud backend with a self-contained Express server.

1. **Blank page** (`/`) — Project list, create new projects
2. **Editor page** (`/editor/project/:id`) — Full editor with `window.config` injected
3. **Viewer page** (`/viewer/project/:id`) — Read-only viewer mode
4. **REST API** (`/api/*`) — Project, scene, asset, branch CRUD
5. **WebSockets** — ShareDB (`/ws/realtime`), Messenger (`/ws/messenger`), Relay (`/ws/relay`)
6. **Engine** (`/engine`) — Serves PlayCanvas engine from `forks/engine/build`

## Engine Integration

The editor uses a custom PlayCanvas engine build from `forks/engine/build/`.

- Engine URL: `http://localhost:3487/engine`
- Engine version: `2.23.0-beta.0` (VizTR custom fork)
- `useCustomEngine: true` in config

If engine files are missing, build them first:
```bash
cd forks/engine
npm run build
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create project (with optional `fork_from`) |
| GET | `/api/projects/:id` | Get project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| GET | `/api/projects/:id/scenes` | List scenes |
| GET | `/api/projects/:id/branches` | List branches |
| GET | `/api/projects/:id/assets` | List assets |
| POST | `/api/scenes` | Create scene |
| POST | `/api/branches` | Create branch |
| POST | `/api/checkpoints` | Create checkpoint (snapshot) |

## Starter Kit Templates

When creating a project, pass `fork_from` to auto-populate the scene with template entities:

| ID | Group | Template | Entities |
|----|-------|----------|----------|
| — | General | Blank Project | Empty scene |
| 1001 | Architecture Studio | Exterior / Interior | Camera, sun, ambient, ground |
| 1002 | Architecture Studio | Animation / Walkthrough | Camera + spline path, sun, ground |
| 2001 | XR World | XR / AR | XR camera (hit-test, anchors), sun, ambient, floor |
| 2002 | XR World | VR Experience | VR camera + controllers, sun, ambient, floor |
| 2003 | XR World | Virtual Tour | Tour camera, hotspot, ambient |
| 2004 | XR World | Gaussian Splat | Splat camera, sun |
| 2005 | XR World | Pixel Streaming | Stream camera, sun, ambient |

Example request:
```json
POST /api/projects
{
  "name": "My Architecture Scene",
  "description": "Exterior visualization",
  "fork_from": 1001
}
```

## Data Storage

All data is stored locally in `server/data/projects/`:

```
server/data/projects/
├── <projectId>/
│   ├── project.json
│   ├── scenes/
│   │   └── <sceneId>.json
│   ├── assets/
│   │   ├── <assetId>.json
│   │   └── <assetId>.<ext>    (uploaded files)
│   ├── branches/
│   │   └── main.json
│   └── checkpoints/
│       └── <checkpointId>.json
```

## What's Stubbed

These endpoints return hardcoded/empty responses (no real functionality):

- User authentication & profiles
- Jobs (import/export progress)
- File upload to cloud storage
- Real-time collaboration (ShareDB, Messenger, Relay)
- Sketchfab store integration
- Activity feed, notifications, invitations

## File Structure

```
server/
├── index.js          # Express server + WS setup + engine serving
├── config.js         # window.config generator (loads scene data)
├── routes/
│   ├── projects.js   # Project CRUD + template scenes
│   ├── scenes.js     # Scene CRUD
│   ├── assets.js     # Asset CRUD + file serving
│   ├── branches.js   # Branch management
│   ├── checkpoints.js # Snapshot/checkpoint API
│   └── stubs.js      # Stubbed endpoints
└── templates/
    ├── blank.html    # Project list page
    └── editor.html   # Editor with config injection

Engine served from:
forks/engine/build/
├── playcanvas.mjs    # ES module build (served at /engine)
├── playcanvas.js     # UMD build
└── playcanvas.min.js # Minified build
```

## Stopping

```bash
# Find and kill the server process
netstat -ano | findstr :3487
taskkill /PID <pid> /F
```
