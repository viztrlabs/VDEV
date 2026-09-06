# VizTR Editor — PlayCanvas Open-Source Integration

**Date:** 2026-09-06  
**Approach:** Progressive Mock (Approach B)  
**Goal:** Get the full PlayCanvas editor UI working locally with Supabase backend, then customize

---

## 1. Problem

The current VizTR editor has a pre-built PlayCanvas frontend (`forks/editor/dist/`) but a thin backend (6 REST endpoints, echo WebSocket stubs). The real PlayCanvas editor expects 50+ REST endpoints and ShareDB-based real-time collaboration. Without these, the editor renders but critical features (scene editing, asset management, real-time sync) don't work.

## 2. Solution

Fork the open-source `playcanvas/editor` repo, build it, and implement the backend APIs it expects — starting with mocks for unimplemented endpoints and real Supabase-backed implementations for the critical path.

## 3. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  PlayCanvas Editor UI                    │
│         (forked from playcanvas/editor, built)           │
│    Reads window.config → connects to APIs below          │
└──────────┬────────────────────────┬─────────────────────┘
           │ REST                   │ WebSocket
           ▼                        ▼
┌──────────────────┐    ┌─────────────────────────────┐
│  Editor Server   │    │     WebSocket Layer          │
│  (Express :3487) │    │                              │
│                  │    │  /ws/realtime (ShareDB)      │
│  Static assets   │    │  /ws/messenger (JSON)        │
│  Engine endpoint │    │  /ws/relay (stub)            │
│  REST API proxy  │    │                              │
│  Mock routes     │    │  In-memory ShareDB with      │
└────────┬─────────┘    │  Supabase persistence        │
         │               └──────────┬──────────────────┘
         ▼                          ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js (port 3000)                         │
│  /editor/[projectId] → HTML shell + config injection    │
│  /api/editor-projects/* → Supabase CRUD                 │
└──────────────────────┬──────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Supabase (PostgreSQL)                        │
│  editor_projects | editor_scenes | editor_assets |      │
│  editor_branches | editor_checkpoints                   │
└─────────────────────────────────────────────────────────┘
```

### Entry Points

| URL | Server | Purpose |
|-----|--------|---------|
| `http://localhost:3487/editor/project/:id` | Editor server | HTML + config injection |
| `http://localhost:3000/editor/:id` | Next.js | HTML + config injection |

Both inject `window.config` with:
- `url.api` → `http://localhost:3487/api`
- `url.realtime.http` → `ws://localhost:3487/ws/realtime`
- `url.messenger.http` → `http://localhost:3487/ws/messenger`
- `url.messenger.ws` → `ws://localhost:3487/ws/messenger`

## 4. Editor Startup Sequence

The PlayCanvas editor loads in this order:

1. **Server renders HTML** with `var config = {...}` (window.config)
2. **JS bootstrap** — sets API globals from config (no network calls)
3. **WebSocket connect** — connects to `/ws/realtime`, sends auth
4. **ShareDB scene subscribe** — subscribes to `scenes/{uniqueId}` → hierarchy + viewport populate
5. **REST assets list** — `GET /api/projects/:id/assets` → assets panel populates
6. **ShareDB asset subscriptions** — bulk subscribe to each asset for real-time sync
7. **ShareDB settings subscribe** — project + user settings

**Minimum for UI to render:** Steps 1-4 (config + WebSocket + ShareDB scene)
**Minimum for assets panel:** Step 5 (REST assets endpoint)

## 5. WebSocket Implementation

### 5.1 ShareDB Realtime (`/ws/realtime`)

Use `sharedb` npm package with `ot-text` for operational transform.

**Connection protocol:**
```
Client → Server: "auth" + JSON.stringify({ accessToken })
Server → Client: "auth" + JSON.stringify({ ok: true })
```

**ShareDB document collections:**

| Collection | Doc ID | Data Shape | Source |
|-----------|--------|------------|--------|
| `scenes` | `scene.uniqueId` | `{ entities: { [resourceId]: {...} }, settings: {...} }` | Supabase `editor_scenes` |
| `assets` | `asset.id` | `{ id, name, type, data, file, ... }` | Supabase `editor_assets` |
| `settings` | `settings_{projectId}` | Project settings object | Supabase `editor_projects.settings` |
| `settings` | `user_{userId}` | User preferences | Local defaults |

**Persistence:** In-memory ShareDB with Supabase as initial data source. On subscribe, load from Supabase. On submit (client changes), persist back to Supabase via REST.

### 5.2 Messenger (`/ws/messenger`)

JSON message protocol.

```
Client → Server: { name: 'authenticate', token, type: 'designer' }
Server → Client: { name: 'welcome' }
Client → Server: { name: 'project.watch', target: { type: 'general' }, env: ['*'], data: { id } }
```

**Mock:** Return `welcome`, no further events. Real implementation in Phase 3.

### 5.3 Relay (`/ws/relay`)

```
Client connects → Server: { t: 'welcome', userId: 1 }
```

**Mock:** Welcome message only. Real implementation in Phase 3.

## 6. REST API Implementation

### 6.1 Real Endpoints (Supabase-backed)

| Endpoint | Method | Implementation |
|----------|--------|---------------|
| `GET /api/projects/:id` | GET | Query `editor_projects` by id |
| `GET /api/projects/:id/assets` | GET | Query `editor_assets` by project_id, return as array |
| `GET /api/projects/:id/scenes` | GET | Query `editor_scenes` by project_id, ordered by created_at |
| `GET /api/projects/:id/branches` | GET | Query `editor_branches` by project_id |
| `GET /api/scenes/:id` | GET | Query `editor_scenes` by id |
| `GET /api/assets` | GET | Query `editor_assets` by project_id (from query param) |
| `GET /api/assets/:id/file/:name` | GET | Return asset URL from record |
| `POST /api/scenes` | POST | Insert into `editor_scenes` |
| `PUT /api/scenes/:id` | PUT | Update `editor_scenes` |
| `DELETE /api/scenes/:id` | DELETE | Delete from `editor_scenes` |
| `POST /api/assets` | POST | Insert into `editor_assets` |
| `PUT /api/assets/:id` | PUT | Update `editor_assets` |
| `DELETE /api/assets/:id` | DELETE | Delete from `editor_assets` |

### 6.2 Mocked Endpoints (stubs)

| Endpoint | Method | Mock Response |
|----------|--------|---------------|
| `POST /api/projects/:id/export` | POST | `{ url: '#', status: 'ok' }` |
| `POST /api/projects/import` | POST | `{ id: <newId> }` |
| `POST /api/projects/:id/unlock` | POST | `{ ok: true }` |
| `POST /api/projects/:id/transfer` | POST | `{ ok: true }` |
| `GET /api/projects/:id/activity` | GET | `[]` |
| `GET/POST/PUT/DELETE /api/projects/:id/collaborators` | * | `[{ id: 1, username: 'viztr-user', role: 'admin' }]` |
| `POST /api/projects/:id/image` | POST | `{ url: '#' }` |
| `GET /api/projects/:id/apps` | GET | `[]` |
| `GET /api/projects/:id/builds` | GET | `[]` |
| `GET /api/projects/:id/repositories` | GET | `[]` |
| `POST /api/branches` | POST | `{ id: 'main', name: 'main' }` |
| `POST /api/branches/:id/checkout` | POST | `{ ok: true }` |
| `POST /api/branches/:id/open` | POST | `{ ok: true }` |
| `POST /api/branches/:id/close` | POST | `{ ok: true }` |
| `DELETE /api/branches/:id` | DELETE | `{ ok: true }` |
| `GET /api/branches/:id/checkpoints` | GET | `[]` |
| `POST /api/checkpoints` | POST | `{ id: <uuid> }` |
| `GET /api/checkpoints/:id` | GET | `{ id, description: '' }` |
| `POST /api/checkpoints/:id/restore` | POST | `{ ok: true }` |
| `POST /api/checkpoints/:id/hardreset` | POST | `{ ok: true }` |
| `POST /api/upload/start-upload` | POST | `{ uploadId: 'mock', urls: [] }` |
| `POST /api/upload/signed-urls` | POST | `{ urls: [] }` |
| `POST /api/upload/complete-upload` | POST | `{ ok: true }` |
| `GET /api/store` | GET | `[]` |
| `GET /api/store/:id` | GET | `null` |
| `POST /api/store/upload` | POST | `{ id: <uuid> }` |
| `POST /api/store/:id/clone` | POST | `{ id: <uuid> }` |
| `GET /api/store/:id/assets` | GET | `[]` |
| `GET /api/store/assets/:id/file/:name` | GET | 404 |
| `GET /api/store/licenses` | GET | `[]` |
| `PUT /api/store/move/:id` | PUT | `{ ok: true }` |
| `POST /api/users` | POST | `{ id: 1, username: 'viztr-user' }` |
| `GET /api/users/:id` | GET | `{ id: 1, username: 'viztr-user' }` |
| `DELETE /api/users/:id` | DELETE | `{ ok: true }` |
| `GET /api/users/:id/collaborators` | GET | `[]` |
| `GET /api/users/:id/projects` | GET | `[]` |
| `GET /api/users/:id/usage` | GET | `{ storage: 0, bandwidth: 0 }` |
| `GET /api/invitations` | GET | `[]` |
| `POST /api/invitations` | POST | `{ id: <uuid> }` |
| `DELETE /api/invitations/:id` | DELETE | `{ ok: true }` |
| `GET /api/jobs/:id` | GET | `{ status: 'complete' }` |
| `POST /api/watch` | POST | `{ id: <uuid> }` |
| `DELETE /api/watch/:id` | DELETE | `{ ok: true }` |

## 7. Fork & Build Process

### 7.1 Fork the editor source

```bash
cd forks/
git clone https://github.com/playcanvas/editor editor-src
cd editor-src
npm install
```

### 7.2 Build

```bash
npm run build   # Produces dist/ with editor.js, code-editor.js, launch.js, CSS, WASM
```

### 7.3 Replace pre-built dist

```bash
# Backup current dist
cp -r ../editor/dist ../editor/dist.built-$(date +%Y%m%d)

# Copy new build
cp -r dist/* ../editor/dist/
```

### 7.4 Customize branding

Modify source files for VizTR branding before building:
- Title: "VizTR Editor" (in `src/editor/index.ts` or HTML template)
- Logo: VizTR logo references
- Color theme: Cyber Emerald (#3ECF8E) accent colors
- Default scene: VizTR architectural template

## 8. Configuration Object

Both entry points inject this config (from `config.js` or `page.tsx`):

```json
{
  "version": "2.31.4",
  "self": {
    "id": 1,
    "username": "viztr-user",
    "branch": { "id": "main", "name": "main" },
    "plan": { "id": 1, "type": "individual" }
  },
  "owner": { "id": 1, "username": "viztr-user" },
  "accessToken": "local-dev-token",
  "project": {
    "id": "<supabase-project-id>",
    "name": "<project-name>",
    "settings": { "id": "settings_<project-id>" },
    "permissions": { "admin": [1], "read": [1], "write": [1] }
  },
  "scene": { "id": "<scene-uuid>", "uniqueId": "<scene-uuid>" },
  "url": {
    "api": "http://localhost:3487/api",
    "realtime": { "http": "ws://localhost:3487/ws/realtime" },
    "messenger": { "http": "http://localhost:3487/ws/messenger", "ws": "ws://localhost:3487/ws/messenger" },
    "relay": { "http": "http://localhost:3487/ws/relay", "ws": "ws://localhost:3487/ws/relay" },
    "engine": "http://localhost:3487/engine",
    "frontend": "http://localhost:3487"
  },
  "schema": { "version": 1, "documents": {} }
}
```

## 9. Implementation Phases

| Phase | Scope | Deliverable |
|-------|-------|-------------|
| **1A** | Fork editor, build, integrate with server | Editor loads, hierarchy + viewport render with scene data |
| **1B** | ShareDB server with Supabase persistence | Scene changes save/load in real-time |
| **1C** | Real REST endpoints (assets, scenes CRUD) | Full asset management, scene creation/deletion |
| **2** | Custom extensions with PCUI | VizTR-specific inspector panels, templates |
| **3** | Real-time collaboration (multi-user) | Multiple users edit simultaneously |

## 10. Success Criteria

- [ ] Editor loads at `http://localhost:3487/editor/project/:id` with full UI
- [ ] Hierarchy panel shows entity tree from Supabase scene data
- [ ] 3D viewport renders the scene with PlayCanvas engine
- [ ] Inspector panel shows entity properties
- [ ] Assets panel lists project assets from Supabase
- [ ] Scene changes persist to Supabase via ShareDB
- [ ] Asset upload works (at least for images/models)
- [ ] Branch management works (create, list, switch)
- [ ] Editor can be customized with VizTR branding
