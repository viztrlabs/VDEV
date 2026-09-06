# VizTR Editor Local Backend Design

## Goal

Make the VizTR Editor (PlayCanvas Editor fork) fully functional as a local-first single-user application. No cloud services, no real-time collaboration, no authentication — just a working 3D editor that can create, edit, and save projects to local disk.

## Scope

- **In scope**: Project CRUD, scene editing, asset management, local persistence, basic version snapshots
- **Out of scope**: Real-time collaboration (ShareDB), multi-user (Messenger/Relay), cloud storage (S3), authentication, store/marketplace, merge/diff

## Architecture

```
forks/editor/
├── server/
│   ├── index.js              # Express server entry point (port 3487)
│   ├── config.js             # Generates window.config for HTML shell
│   ├── routes/
│   │   ├── projects.js       # Project CRUD
│   │   ├── scenes.js         # Scene CRUD
│   │   ├── assets.js         # Asset CRUD + file serving
│   │   ├── branches.js       # Branch management
│   │   ├── checkpoints.js    # Version snapshots
│   │   └── stubs.js          # Users, jobs, store, invitations stubs
│   ├── ws/
│   │   ├── realtime.js       # ShareDB stub (single-user pass-through)
│   │   ├── messenger.js      # Messenger stub (no-op)
│   │   └── relay.js          # Relay stub (no-op)
│   ├── data/                 # Project storage (JSON files + assets)
│   │   └── projects/{id}/
│   │       ├── project.json
│   │       ├── settings.json
│   │       ├── branches/main.json
│   │       ├── scenes/{sceneId}.json
│   │       └── assets/{assetId}.*
│   └── templates/
│       └── editor.html       # HTML shell with config injection
├── dist/                     # Built editor assets (existing)
└── package.json              # Add express, ws dependencies
```

## Server Design

### Entry Point (server/index.js)

```javascript
// Express server on port 3487
// - Serves static files from dist/
// - Serves HTML shell with config injection at /editor/project/:id
// - Mounts REST API at /api/*
// - Mounts WebSocket endpoints at /ws/*
// - Serves project list at / (blank editor)
```

### Config Injection (server/config.js)

Generates `window.config` object for each page load:

```javascript
{
  version: "2.31.4",
  self: {
    id: 1,
    username: "viztr-user",
    flags: {},
    branch: { id: "main", name: "main", createdAt: "...", latestCheckpointId: null },
    plan: { id: 1, type: "individual" },
    locale: "en"
  },
  owner: { id: 1, username: "viztr-user", plan: { id: 1, type: "individual" }, size: 0, diskAllowance: 10737418240 },
  accessToken: "local-dev-token",
  project: { /* from project.json */ },
  url: {
    api: "http://localhost:3487/api",
    launch: "http://localhost:3487/launch",
    home: "http://localhost:3487",
    realtime: { http: "ws://localhost:3487/ws/realtime" },
    messenger: { http: "http://localhost:3487/ws/messenger", ws: "ws://localhost:3487/ws/messenger" },
    relay: { http: "http://localhost:3487/ws/relay", ws: "ws://localhost:3487/ws/relay" },
    frontend: "http://localhost:3487",
    engine: "http://localhost:3487/engine",
    store: "http://localhost:3487",
    howdoi: "http://localhost:3487",
    static: "http://localhost:3487",
    images: "http://localhost:3487"
  },
  engineVersions: {
    current: { version: "2.21.4", description: "Current" },
    force: { version: "2.21.4", description: "Force" }
  },
  sentry: { enabled: false },
  metrics: { env: "local", send: false },
  schema: { /* editor schema catalog */ }
}
```

### REST API Endpoints

#### Projects (`server/routes/projects.js`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/projects` | Create project (name, description, settings) → project.json |
| GET | `/api/projects/:id` | Read project.json |
| PUT | `/api/projects/:id` | Update project.json |
| DELETE | `/api/projects/:id` | Delete project directory |
| GET | `/api/projects/:id/assets` | List assets from assets/ dir |
| GET | `/api/projects/:id/scenes` | List scenes from scenes/ dir |
| GET | `/api/projects/:id/branches` | List branches |
| GET | `/api/projects/:id/activity` | Return empty array |
| GET | `/api/projects/:id/collaborators` | Return single owner |
| POST | `/api/projects/:id/export` | Zip project dir, return job |

#### Scenes (`server/routes/scenes.js`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/scenes` | Create scene JSON (projectId, branchId, name) |
| GET | `/api/scenes/:id` | Read scene JSON |
| DELETE | `/api/scenes/:id` | Delete scene JSON |

Scene data structure:
```json
{
  "id": "scene-uuid",
  "uniqueId": "scene-uuid",
  "name": "Untitled",
  "projectId": 1,
  "branchId": "main",
  "entities": {},
  "settings": {}
}
```

#### Assets (`server/routes/assets.js`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/assets` | Create asset (multipart: file + metadata) |
| GET | `/api/assets/:id` | Read asset metadata |
| PUT | `/api/assets/:id` | Update asset metadata |
| DELETE | `/api/assets` | Bulk delete (body: { assets: [ids] }) |
| GET | `/api/assets/:id/file/:name` | Serve asset file from disk |

Asset storage:
```
server/data/projects/{projectId}/assets/
├── {assetId}.json          # Metadata (name, type, tags, data, meta)
├── {assetId}.glb           # Model file
├── {assetId}.png           # Texture file
└── ...
```

#### Branches (`server/routes/branches.js`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/branches` | Create branch (name, projectId, sourceBranchId) |
| POST | `/api/branches/:id/checkout` | Switch active branch |
| GET | `/api/branches/:id/checkpoints` | List checkpoints for branch |

#### Checkpoints (`server/routes/checkpoints.js`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/checkpoints` | Snapshot current scene state → checkpoint JSON |
| GET | `/api/checkpoints/:id` | Read checkpoint data |

Checkpoint storage:
```
server/data/projects/{projectId}/checkpoints/
├── {checkpointId}.json     # Full scene snapshot + metadata
└── ...
```

#### Stubs (`server/routes/stubs.js`)

Minimal stubs for endpoints the editor calls but don't need real implementation:

| Method | Path | Returns |
|--------|------|---------|
| GET | `/api/users/:id` | Mock user object |
| GET | `/api/users/:id/projects` | User's projects list |
| GET | `/api/users/:id/usage` | `{ size: 0, diskAllowance: 10GB }` |
| GET | `/api/jobs/:id` | `{ status: "complete" }` |
| POST | `/api/upload/start-upload` | `{ uploadId: "local", key: "local" }` |
| POST | `/api/upload/signed-urls` | `{ signedUrls: [] }` |
| POST | `/api/upload/complete-upload` | `{ status: "ok" }` |
| GET | `/api/store` | Empty array |
| GET | `/api/invitations` | Empty array |

### WebSocket Stubs

#### ShareDB Realtime (`server/ws/realtime.js`)

- Accepts WebSocket connection
- Responds to `auth` message with ack
- Forwards ops to same connection (single-user loopback)
- Supports document subscription (returns empty data)
- Keeps connection alive with ping/pong

#### Messenger (`server/ws/messenger.js`)

- Accepts WebSocket connection
- Sends `{ name: "welcome" }` on auth
- Responds to ping with pong
- No-ops all other messages

#### Relay (`server/ws/relay.js`)

- Accepts WebSocket connection
- Sends `{ t: "welcome", userId: 1 }` on open
- Responds to ping with pong
- No-ops room join/leave/messages

## What Works

| Feature | Status | Notes |
|---------|--------|-------|
| Create new project | ✅ | From blank editor or template |
| Open existing project | ✅ | Lists projects from data/ dir |
| Edit scene entities | ✅ | Add/delete/modify entities in hierarchy |
| Inspector panel | ✅ | Edit entity properties (transform, components) |
| Viewport rendering | ✅ | Full 3D viewport with PlayCanvas engine |
| Import 3D models | ✅ | GLB/GLTF/FBX/OBJ processed client-side |
| Import images | ✅ | Textures processed client-side |
| Add/create scripts | ✅ | Monaco code editor for scripts |
| Asset browser | ✅ | Browse/manage project assets |
| Save project | ✅ | Checkpoints saved as JSON snapshots |
| Load project | ✅ | Full scene restoration from JSON |
| Undo/redo | ✅ | Local undo stack (no ShareDB history) |
| Multiple scenes | ✅ | Create/switch between scenes |
| Branch management | ⚠️ | Basic branch creation, no merge |
| Export project | ⚠️ | Zip project dir for download |
| Real-time collab | ❌ | Single-user only |
| Cloud sync | ❌ | Local disk only |
| Authentication | ❌ | Auto-login as mock user |
| Store/Marketplace | ❌ | Empty stubs |

## Startup

```bash
cd forks/editor
npm install
node server/index.js
# → http://localhost:3487 (project list)
# → http://localhost:3487/editor/project/1 (edit project)
```

## Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "multer": "^1.4.5-lts.1",
    "ws": "^8.16.0",
    "uuid": "^9.0.0",
    "archiver": "^6.0.0"
  }
}
```

## File Structure Summary

New files to create:
```
server/index.js              (~150 lines)
server/config.js             (~100 lines)
server/routes/projects.js    (~120 lines)
server/routes/scenes.js      (~80 lines)
server/routes/assets.js      (~150 lines)
server/routes/branches.js    (~60 lines)
server/routes/checkpoints.js (~60 lines)
server/routes/stubs.js       (~80 lines)
server/ws/realtime.js        (~80 lines)
server/ws/messenger.js       (~30 lines)
server/ws/relay.js           (~30 lines)
server/templates/editor.html (~80 lines)
```

Total: ~1,020 lines of new server code.
