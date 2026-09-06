# VizTR Editor — PlayCanvas Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fork the open-source PlayCanvas editor, build it, and implement the backend APIs it expects so the full editor UI works locally with Supabase.

**Architecture:** Fork `playcanvas/editor` → build → replace pre-built dist. Implement ShareDB server (in-memory + Supabase persistence) for real-time scene/asset sync. Implement 13 real REST endpoints backed by Supabase + mock ~35 stub endpoints.

**Tech Stack:** Node.js, Express, PlayCanvas Editor (TypeScript/Vite), ShareDB, ot-text, Supabase JS client, WebSocket (ws)

## Global Constraints

- Node.js >= 22.22.0 (required by playcanvas/editor)
- pnpm for workspace, npm for forks
- Supabase tables: `editor_projects`, `editor_scenes`, `editor_assets`, `editor_branches`, `editor_checkpoints`
- Editor server runs on port 3487
- Next.js dev server runs on port 3000
- All REST responses must match PlayCanvas editor expected formats (see spec section 6)
- ShareDB auth protocol: client sends `"auth" + JSON.stringify({ accessToken })`, server responds `"auth" + JSON.stringify({ ok: true })`

---

## File Structure

### New files to create

| File | Purpose |
|------|---------|
| `forks/editor-src/` | Cloned playcanvas/editor repo (git clone) |
| `forks/editor/server/routes/real-api/projects.js` | Real project endpoints (Supabase) |
| `forks/editor/server/routes/real-api/assets.js` | Real asset endpoints (Supabase) |
| `forks/editor/server/routes/real-api/scenes.js` | Real scene endpoints (Supabase) |
| `forks/editor/server/routes/real-api/branches.js` | Real branch endpoints (Supabase) |
| `forks/editor/server/routes/mock/index.js` | Mock catch-all router for stubbed endpoints |
| `forks/editor/server/websocket/sharedb.js` | ShareDB server setup + Supabase persistence |
| `forks/editor/server/websocket/messenger.js` | Messenger WebSocket handler |
| `forks/editor/server/websocket/relay.js` | Relay WebSocket handler |
| `forks/editor/server/websocket/auth.js` | Shared auth validation for WebSocket connections |
| `forks/editor/server/package.json` | Dependencies (express, ws, sharedb, ot-text, @supabase/supabase-js, dotenv) |

### Files to modify

| File | Changes |
|------|---------|
| `forks/editor/server/index.js` | Replace inline WS handlers with imported modules, mount new route files, add real API routes before mock catch-all |
| `forks/editor/server/config.js` | Add `settings.id` to project config (editor expects it) |

---

## Tasks

### Task 1: Fork and Build PlayCanvas Editor

**Files:**
- Create: `forks/editor-src/` (git clone)
- Modify: `forks/editor/dist/` (replace with new build)

**Interfaces:**
- Consumes: Nothing (standalone setup)
- Produces: Built editor frontend at `forks/editor/dist/` with editor.js, code-editor.js, launch.js, CSS, WASM

- [ ] **Step 1: Clone the PlayCanvas editor repo**

```bash
cd forks/
git clone https://github.com/playcanvas/editor editor-src
```

- [ ] **Step 2: Install dependencies**

```bash
cd editor-src
npm install
```

- [ ] **Step 3: Verify build works**

```bash
npm run build
```

Expected: `dist/` directory created with `js/editor.js`, `css/editor.css`, etc.

- [ ] **Step 4: Backup current dist and replace**

```bash
cd forks/
# Backup
mv editor/dist editor/dist.backup-$(Get-Date -Format yyyyMMdd)
# Copy new build
cp -r editor-src/dist editor/dist
```

- [ ] **Step 5: Test editor loads**

Start editor server and verify `http://localhost:3487/` loads the editor HTML (even if APIs fail).

- [ ] **Step 6: Commit**

```bash
git add forks/editor/dist
git commit -m "feat: replace editor dist with fresh playcanvas/editor build"
```

---

### Task 2: Create Editor Server Package.json and Install Dependencies

**Files:**
- Create: `forks/editor/server/package.json`

**Interfaces:**
- Consumes: Nothing
- Produces: `node_modules/` with express, ws, sharedb, ot-text, @supabase/supabase-js, dotenv

- [ ] **Step 1: Create package.json**

```json
{
  "name": "viztr-editor-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  },
  "dependencies": {
    "express": "^4.21.0",
    "ws": "^8.18.0",
    "sharedb": "^3.3.2",
    "ot-text": "^1.0.2",
    "@supabase/supabase-js": "^2.45.0",
    "dotenv": "^16.4.0",
    "uuid": "^10.0.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
cd forks/editor/server
npm install
```

- [ ] **Step 3: Verify sharedb is installed**

```bash
node -e "import('sharedb').then(m => console.log('sharedb OK:', Object.keys(m)))"
```

Expected: `sharedb OK: [...]`

- [ ] **Step 4: Commit**

```bash
git add forks/editor/server/package.json forks/editor/server/package-lock.json
git commit -m "feat: add editor server dependencies (sharedb, express, ws)"
```

---

### Task 3: Implement ShareDB Server with Supabase Persistence

**Files:**
- Create: `forks/editor/server/websocket/sharedb.js`
- Create: `forks/editor/server/websocket/auth.js`
- Modify: `forks/editor/server/index.js` (replace inline realtime handler)

**Interfaces:**
- Consumes: `generateConfig()` from `config.js` (project/scene data from Supabase)
- Produces: `setupShareDB(server, config)` function that creates ShareDB connection + handles auth + loads initial data from Supabase

- [ ] **Step 1: Create auth.js — shared WebSocket authentication**

```javascript
// forks/editor/server/websocket/auth.js
// Validates the PlayCanvas auth protocol: "auth" + JSON.stringify({ accessToken })

export function handleAuth(ws, rawData, config) {
    const str = rawData.toString();
    if (str.startsWith('auth')) {
        try {
            const payload = JSON.parse(str.substring(4));
            if (payload.accessToken === config.accessToken) {
                ws.send('auth' + JSON.stringify({ ok: true }));
                return true;
            }
        } catch (e) {
            // Try plain auth message
            if (str === 'auth') {
                ws.send('auth' + JSON.stringify({ ok: true }));
                return true;
            }
        }
    }
    return false;
}
```

- [ ] **Step 2: Create sharedb.js — ShareDB server setup**

```javascript
// forks/editor/server/websocket/sharedb.js
import ShareDB from 'sharedb';
import { getSupabaseClient } from '../config.js';

const collections = {
    scenes: new Map(),    // in-memory docs keyed by uniqueId
    assets: new Map(),    // in-memory docs keyed by asset id
    settings: new Map(),  // in-memory docs keyed by settings id
};

// Load initial data from Supabase
async function loadFromSupabase(collection, docId, projectId) {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    if (collection === 'scenes') {
        const { data } = await supabase
            .from('editor_scenes')
            .select('*')
            .eq('id', docId)
            .single();
        if (data) {
            return {
                id: data.id,
                entities: data.entities || {},
                settings: data.settings || {},
                name: data.name,
            };
        }
    }

    if (collection === 'assets') {
        const { data } = await supabase
            .from('editor_assets')
            .select('*')
            .eq('id', docId)
            .single();
        return data || null;
    }

    if (collection === 'settings') {
        const { data } = await supabase
            .from('editor_projects')
            .select('settings')
            .eq('id', docId.replace('settings_', ''))
            .single();
        return data?.settings || {};
    }

    return null;
}

// Persist changes back to Supabase
async function persistToSupabase(collection, docId, data) {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    if (collection === 'scenes') {
        await supabase
            .from('editor_scenes')
            .update({ entities: data.entities, settings: data.settings })
            .eq('id', docId);
    }

    if (collection === 'assets') {
        await supabase
            .from('editor_assets')
            .update(data)
            .eq('id', docId);
    }

    if (collection === 'settings') {
        const projectId = docId.replace('settings_', '');
        await supabase
            .from('editor_projects')
            .update({ settings: data })
            .eq('id', projectId);
    }
}

export function setupShareDB(server, config) {
    const backend = new ShareDB();

    // Create in-memory connections for each WS client
    const connections = new Map();

    return {
        backend,
        collections,

        async handleConnection(ws, req) {
            let authenticated = false;

            ws.on('message', async (rawData) => {
                const str = rawData.toString();

                // Handle auth
                if (!authenticated) {
                    if (str.startsWith('auth')) {
                        try {
                            const payload = JSON.parse(str.substring(4));
                            if (payload.accessToken === config.accessToken) {
                                authenticated = true;
                                ws.send('auth' + JSON.stringify({ ok: true }));
                                return;
                            }
                        } catch (e) {
                            if (str === 'auth') {
                                authenticated = true;
                                ws.send('auth' + JSON.stringify({ ok: true }));
                                return;
                            }
                        }
                    }
                    ws.send(JSON.stringify({ error: 'Not authenticated' }));
                    return;
                }

                // Handle ShareDB messages
                try {
                    const msg = JSON.parse(str);

                    // Handle auth message (already authenticated)
                    if (msg.name === 'auth' || msg.accessToken) {
                        if (!authenticated) {
                            authenticated = true;
                            ws.send('auth' + JSON.stringify({ ok: true }));
                        }
                        return;
                    }

                    // Handle ShareDB protocol messages
                    if (msg.a === 'hs') {
                        // Handshake
                        ws.send(JSON.stringify({ a: 'hs', protocol: 1 }));
                    } else if (msg.a === 's') {
                        // Subscribe
                        const { c: collection, d: docId } = msg;
                        const cacheKey = `${collection}:${docId}`;

                        if (!collections[collection]) {
                            collections[collection] = new Map();
                        }

                        // Load from Supabase if not in memory
                        if (!collections[collection].has(docId)) {
                            const data = await loadFromSupabase(collection, docId, config.project.id);
                            if (data) {
                                collections[collection].set(docId, JSON.parse(JSON.stringify(data)));
                            } else {
                                collections[collection].set(docId, { entities: {}, settings: {} });
                            }
                        }

                        // Send the document data
                        const docData = collections[collection].get(docId);
                        ws.send(JSON.stringify({
                            a: 's',
                            c: collection,
                            d: docId,
                            data: docData
                        }));
                    } else if (msg.a === 'op') {
                        // Operation (client edit)
                        const { c: collection, d: docId, op } = msg;

                        if (collections[collection] && collections[collection].has(docId)) {
                            const doc = collections[collection].get(docId);

                            // Apply operation (simplified — merge entities)
                            if (op && op.entities) {
                                doc.entities = { ...doc.entities, ...op.entities };
                            }
                            if (op && op.settings) {
                                doc.settings = { ...doc.settings, ...op.settings };
                            }

                            // Persist to Supabase (debounced)
                            persistToSupabase(collection, docId, doc);
                        }

                        ws.send(JSON.stringify({ a: 'ack', src: msg.src }));
                    }
                } catch (e) {
                    console.error('[ShareDB] Parse error:', e.message);
                }
            });

            ws.on('close', () => {
                console.log('[ShareDB] Client disconnected');
            });
        },

        getCollections() {
            return collections;
        }
    };
}
```

- [ ] **Step 3: Update config.js to export getSupabaseClient**

Add to `forks/editor/server/config.js`:

```javascript
// Add after the getEnv() function
let _supabaseClient = null;

export function getSupabaseClient() {
    if (_supabaseClient) return _supabaseClient;
    const { supabaseUrl, supabaseKey } = getEnv();
    if (!supabaseUrl || !supabaseKey) return null;
    // Dynamic import to avoid issues at module load time
    return null; // Will be initialized lazily
}
```

Actually, simpler approach — create a separate supabase client module:

- [ ] **Step 3 (revised): Create supabase-client.js**

```javascript
// forks/editor/server/supabase-client.js
import { createClient } from '@supabase/supabase-js';

let client = null;

export function getSupabase() {
    if (client) return client;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    client = createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
    return client;
}
```

- [ ] **Step 4: Update sharedb.js to use supabase-client.js**

Change the import in `sharedb.js` from `'../config.js'` to `'../supabase-client.js'` and use `getSupabase()`.

- [ ] **Step 5: Update index.js to use ShareDB module**

Replace the inline `realtimeWss.on('connection', ...)` handler with:

```javascript
import { setupShareDB } from './websocket/sharedb.js';

// After config generation setup...
const shareDB = setupShareDB(server, config);

realtimeWss.on('connection', (ws, req) => {
    console.log('[Realtime] Client connected');
    shareDB.handleConnection(ws, req);
});
```

Note: The `config` variable needs to be available at server startup. Since `generateConfig()` is async and needs a projectId, we'll use a default config for the WebSocket layer (the client sends auth with the token, and the config is used for Supabase queries).

- [ ] **Step 6: Test ShareDB connection**

Start server, open editor, check browser console for:
- WebSocket connection to `ws://localhost:3487/ws/realtime`
- Auth success message
- Scene data received after subscribe

- [ ] **Step 7: Commit**

```bash
git add forks/editor/server/websocket/ forks/editor/server/supabase-client.js
git commit -m "feat: implement ShareDB server with Supabase persistence"
```

---

### Task 4: Implement Real REST API Endpoints (Projects, Scenes, Assets, Branches)

**Files:**
- Create: `forks/editor/server/routes/real-api/projects.js`
- Create: `forks/editor/server/routes/real-api/scenes.js`
- Create: `forks/editor/server/routes/real-api/assets.js`
- Create: `forks/editor/server/routes/real-api/branches.js`
- Modify: `forks/editor/server/index.js` (mount real API routes)

**Interfaces:**
- Consumes: `getSupabase()` from `supabase-client.js`
- Produces: Express routers for `/api/projects`, `/api/scenes`, `/api/assets`, `/api/branches`

- [ ] **Step 1: Create projects.js — real project endpoints**

```javascript
// forks/editor/server/routes/real-api/projects.js
import { Router } from 'express';
import { getSupabase } from '../../supabase-client.js';

const router = Router();

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
    const supabase = getSupabase();
    if (!supabase) return res.status(503).json({ error: 'No Supabase connection' });

    const { data, error } = await supabase
        .from('editor_projects')
        .select('*')
        .eq('id', req.params.id)
        .single();

    if (error || !data) return res.status(404).json({ error: 'Project not found' });

    res.json({
        id: data.id,
        name: data.name,
        description: data.description || '',
        settings: data.settings || {},
        permissions: data.permissions || { admin: [1], read: [1], write: [1] },
        private: data.private ?? true,
        masterBranch: data.master_branch || 'main',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    });
});

// GET /api/projects/:id/assets
router.get('/:id/assets', async (req, res) => {
    const supabase = getSupabase();
    if (!supabase) return res.json([]);

    const { data } = await supabase
        .from('editor_assets')
        .select('*')
        .eq('project_id', req.params.id);

    const assets = (data || []).map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        path: a.data?.path || [],
        preload: a.data?.preload ?? false,
        tags: a.tags || [],
        scope: { type: 'project', id: req.params.id },
        data: a.data || {},
        meta: a.meta || {},
        file: a.url ? { filename: a.filename, url: a.url, size: a.size, hash: '' } : null,
    }));

    res.json(assets);
});

// GET /api/projects/:id/scenes
router.get('/:id/scenes', async (req, res) => {
    const supabase = getSupabase();
    if (!supabase) return res.json({ result: [] });

    const { data } = await supabase
        .from('editor_scenes')
        .select('id, unique_id, name')
        .eq('project_id', req.params.id)
        .eq('branch_id', req.query.branchId || 'main')
        .order('created_at', { ascending: true });

    const scenes = (data || []).map(s => ({
        uniqueId: s.unique_id,
        name: s.name,
        id: s.id,
    }));

    res.json({ result: scenes });
});

// GET /api/projects/:id/branches
router.get('/:id/branches', async (req, res) => {
    const supabase = getSupabase();
    if (!supabase) return res.json([]);

    const { data } = await supabase
        .from('editor_branches')
        .select('*')
        .eq('project_id', req.params.id);

    const branches = (data || []).map(b => ({
        id: b.id,
        name: b.name || b.id,
        createdAt: b.created_at || new Date().toISOString(),
        latestCheckpointId: b.latest_checkpoint_id,
    }));

    res.json(branches);
});

export default router;
```

- [ ] **Step 2: Create scenes.js — real scene endpoints**

```javascript
// forks/editor/server/routes/real-api/scenes.js
import { Router } from 'express';
import { getSupabase } from '../../supabase-client.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/scenes/:id
router.get('/:id', async (req, res) => {
    const supabase = getSupabase();
    if (!supabase) return res.status(404).json({ error: 'Not found' });

    const { data, error } = await supabase
        .from('editor_scenes')
        .select('*')
        .eq('id', req.params.id)
        .single();

    if (error || !data) return res.status(404).json({ error: 'Scene not found' });

    res.json({
        id: data.id,
        uniqueId: data.unique_id,
        name: data.name,
        entities: data.entities || {},
        settings: data.settings || {},
    });
});

// POST /api/scenes
router.post('/', async (req, res) => {
    const supabase = getSupabase();
    if (!supabase) return res.status(503).json({ error: 'No Supabase connection' });

    const { name, projectId, branchId, entities, settings } = req.body;
    const uniqueId = uuidv4();

    const { data, error } = await supabase
        .from('editor_scenes')
        .insert({
            name: name || 'New Scene',
            project_id: projectId,
            branch_id: branchId || 'main',
            unique_id: uniqueId,
            entities: entities || {},
            settings: settings || {},
        })
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ id: data.id, uniqueId: data.unique_id, name: data.name });
});

// PUT /api/scenes/:id
router.put('/:id', async (req, res) => {
    const supabase = getSupabase();
    if (!supabase) return res.status(503).json({ error: 'No Supabase connection' });

    const { name, entities, settings } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (entities !== undefined) update.entities = entities;
    if (settings !== undefined) update.settings = settings;

    const { error } = await supabase
        .from('editor_scenes')
        .update(update)
        .eq('id', req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ ok: true });
});

// DELETE /api/scenes/:id
router.delete('/:id', async (req, res) => {
    const supabase = getSupabase();
    if (!supabase) return res.status(503).json({ error: 'No Supabase connection' });

    const { error } = await supabase
        .from('editor_scenes')
        .delete()
        .eq('id', req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ ok: true });
});

export default router;
```

- [ ] **Step 3: Create assets.js — real asset endpoints**

```javascript
// forks/editor/server/routes/real-api/assets.js
import { Router } from 'express';
import { getSupabase } from '../../supabase-client.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/assets — list assets for a project
router.get('/', async (req, res) => {
    const supabase = getSupabase();
    const projectId = req.query.projectId || req.query.project;
    if (!supabase || !projectId) return res.json([]);

    const { data } = await supabase
        .from('editor_assets')
        .select('*')
        .eq('project_id', projectId);

    const assets = (data || []).map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        path: a.data?.path || [],
        preload: a.data?.preload ?? false,
        tags: a.tags || [],
        scope: { type: 'project', id: projectId },
        data: a.data || {},
        meta: a.meta || {},
        file: a.url ? { filename: a.filename, url: a.url, size: a.size, hash: '' } : null,
    }));

    res.json(assets);
});

// GET /api/assets/:id
router.get('/:id', async (req, res) => {
    const supabase = getSupabase();
    if (!supabase) return res.status(404).json({ error: 'Not found' });

    const { data, error } = await supabase
        .from('editor_assets')
        .select('*')
        .eq('id', req.params.id)
        .single();

    if (error || !data) return res.status(404).json({ error: 'Asset not found' });

    res.json({
        id: data.id,
        name: data.name,
        type: data.type,
        path: data.data?.path || [],
        preload: data.data?.preload ?? false,
        tags: data.tags || [],
        scope: { type: 'project', id: data.project_id },
        data: data.data || {},
        meta: data.meta || {},
        file: data.url ? { filename: data.filename, url: data.url, size: data.size, hash: '' } : null,
    });
});

// GET /api/assets/:id/file/:name — serve asset file
router.get('/:id/file/:name', async (req, res) => {
    const supabase = getSupabase();
    if (!supabase) return res.status(404).send('Not found');

    const { data } = await supabase
        .from('editor_assets')
        .select('url, filename')
        .eq('id', req.params.id)
        .single();

    if (!data?.url) return res.status(404).send('File not found');

    // Redirect to the stored URL
    res.redirect(data.url);
});

// POST /api/assets — create asset
router.post('/', async (req, res) => {
    const supabase = getSupabase();
    if (!supabase) return res.status(503).json({ error: 'No Supabase connection' });

    const { name, type, projectId, data: assetData, meta, tags, url, filename, size } = req.body;

    const { data, error } = await supabase
        .from('editor_assets')
        .insert({
            name: name || 'Untitled',
            type: type || 'unknown',
            project_id: projectId,
            data: assetData || {},
            meta: meta || {},
            tags: tags || [],
            url: url || null,
            filename: filename || null,
            size: size || 0,
        })
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });

    res.json({
        id: data.id,
        name: data.name,
        type: data.type,
        path: data.data?.path || [],
        preload: data.data?.preload ?? false,
        tags: data.tags || [],
        scope: { type: 'project', id: projectId },
        data: data.data || {},
        meta: data.meta || {},
        file: data.url ? { filename: data.filename, url: data.url, size: data.size, hash: '' } : null,
    });
});

// PUT /api/assets/:id — update asset
router.put('/:id', async (req, res) => {
    const supabase = getSupabase();
    if (!supabase) return res.status(503).json({ error: 'No Supabase connection' });

    const { name, data: assetData, meta, tags } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (assetData !== undefined) update.data = assetData;
    if (meta !== undefined) update.meta = meta;
    if (tags !== undefined) update.tags = tags;

    const { error } = await supabase
        .from('editor_assets')
        .update(update)
        .eq('id', req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ ok: true });
});

// DELETE /api/assets/:id — delete asset
router.delete('/:id', async (req, res) => {
    const supabase = getSupabase();
    if (!supabase) return res.status(503).json({ error: 'No Supabase connection' });

    const { error } = await supabase
        .from('editor_assets')
        .delete()
        .eq('id', req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ ok: true });
});

export default router;
```

- [ ] **Step 4: Create branches.js — real branch endpoints**

```javascript
// forks/editor/server/routes/real-api/branches.js
import { Router } from 'express';
import { getSupabase } from '../../supabase-client.js';

const router = Router();

// GET /api/branches/:id/checkpoints
router.get('/:id/checkpoints', async (req, res) => {
    const supabase = getSupabase();
    if (!supabase) return res.json([]);

    const { data } = await supabase
        .from('editor_checkpoints')
        .select('*')
        .eq('branch_id', req.params.id);

    res.json(data || []);
});

export default router;
```

- [ ] **Step 5: Mount real API routes in index.js**

In `forks/editor/server/index.js`, add before the mock catch-all:

```javascript
import projectsRouter from './routes/real-api/projects.js';
import scenesRouter from './routes/real-api/scenes.js';
import assetsRouter from './routes/real-api/assets.js';
import branchesRouter from './routes/real-api/branches.js';

// Mount real API routes BEFORE mock catch-all
app.use('/api/projects', projectsRouter);
app.use('/api/scenes', scenesRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/branches', branchesRouter);
```

Remove the old `import apiProxyRouter` and `app.use('/api', apiProxyRouter)` line.

- [ ] **Step 6: Test each endpoint**

```bash
# Test project endpoint
curl http://localhost:3487/api/projects/1

# Test assets endpoint
curl http://localhost:3487/api/projects/1/assets

# Test scenes endpoint
curl http://localhost:3487/api/projects/1/scenes

# Test branches endpoint
curl http://localhost:3487/api/projects/1/branches
```

Expected: JSON responses with Supabase data (or empty arrays if no data).

- [ ] **Step 7: Commit**

```bash
git add forks/editor/server/routes/real-api/
git commit -m "feat: implement real REST API endpoints for projects, scenes, assets, branches"
```

---

### Task 5: Implement Mock Catch-All Router

**Files:**
- Create: `forks/editor/server/routes/mock/index.js`
- Modify: `forks/editor/server/index.js` (mount mock router after real routes)

**Interfaces:**
- Consumes: Nothing
- Produces: Express router that returns stubs for all unimplemented endpoints

- [ ] **Step 1: Create mock/index.js**

```javascript
// forks/editor/server/routes/mock/index.js
import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Helper: always return JSON
const json = (res, data, status = 200) => {
    res.status(status).json(data);
};

// Projects — non-CRUD endpoints
router.post('/projects/:id/export', (req, res) => json(res, { url: '#', status: 'ok' }));
router.post('/projects/import', (req, res) => json(res, { id: Date.now() }));
router.post('/projects/:id/unlock', (req, res) => json(res, { ok: true }));
router.post('/projects/:id/transfer', (req, res) => json(res, { ok: true }));
router.get('/projects/:id/activity', (req, res) => json(res, []));
router.get('/projects/:id/collaborators', (req, res) => json(res, [{ id: 1, username: 'viztr-user', role: 'admin' }]));
router.post('/projects/:id/collaborators', (req, res) => json(res, { id: 1, username: 'viztr-user', role: 'admin' }));
router.put('/projects/:id/collaborators/:cid', (req, res) => json(res, { ok: true }));
router.delete('/projects/:id/collaborators/:cid', (req, res) => json(res, { ok: true }));
router.post('/projects/:id/image', (req, res) => json(res, { url: '#' }));
router.get('/projects/:id/apps', (req, res) => json(res, []));
router.get('/projects/:id/builds', (req, res) => json(res, []));
router.delete('/projects/:id/builds/:bid', (req, res) => json(res, { ok: true }));
router.get('/projects/:id/repositories', (req, res) => json(res, []));

// Branches
router.post('/branches', (req, res) => json(res, { id: 'main', name: 'main' }));
router.post('/branches/:id/checkout', (req, res) => json(res, { ok: true }));
router.post('/branches/:id/open', (req, res) => json(res, { ok: true }));
router.post('/branches/:id/close', (req, res) => json(res, { ok: true }));
router.delete('/branches/:id', (req, res) => json(res, { ok: true }));

// Checkpoints
router.post('/checkpoints', (req, res) => json(res, { id: uuidv4() }));
router.get('/checkpoints/:id', (req, res) => json(res, { id: req.params.id, description: '' }));
router.post('/checkpoints/:id/restore', (req, res) => json(res, { ok: true }));
router.post('/checkpoints/:id/hardreset', (req, res) => json(res, { ok: true }));

// Upload
router.post('/upload/start-upload', (req, res) => json(res, { uploadId: 'mock', urls: [] }));
router.post('/upload/signed-urls', (req, res) => json(res, { urls: [] }));
router.post('/upload/complete-upload', (req, res) => json(res, { ok: true }));

// Store
router.get('/store', (req, res) => json(res, []));
router.get('/store/:id', (req, res) => json(res, null));
router.post('/store/upload', (req, res) => json(res, { id: uuidv4() }));
router.post('/store/:id/clone', (req, res) => json(res, { id: uuidv4() }));
router.get('/store/:id/assets', (req, res) => json(res, []));
router.get('/store/assets/:id/file/:name', (req, res) => res.status(404).json({ error: 'Not found' }));
router.get('/store/licenses', (req, res) => json(res, []));
router.put('/store/move/:id', (req, res) => json(res, { ok: true }));

// Users
router.post('/users', (req, res) => json(res, { id: 1, username: 'viztr-user' }));
router.get('/users/:id', (req, res) => json(res, { id: 1, username: 'viztr-user' }));
router.delete('/users/:id', (req, res) => json(res, { ok: true }));
router.get('/users/:id/collaborators', (req, res) => json(res, []));
router.get('/users/:id/projects', (req, res) => json(res, []));
router.get('/users/:id/usage', (req, res) => json(res, { storage: 0, bandwidth: 0 }));

// Invitations
router.get('/invitations', (req, res) => json(res, []));
router.post('/invitations', (req, res) => json(res, { id: uuidv4() }));
router.delete('/invitations/:id', (req, res) => json(res, { ok: true }));

// Jobs
router.get('/jobs/:id', (req, res) => json(res, { status: 'complete' }));

// Watch
router.post('/watch', (req, res) => json(res, { id: uuidv4() }));
router.delete('/watch/:id', (req, res) => json(res, { ok: true }));

export default router;
```

- [ ] **Step 2: Mount mock router in index.js**

After the real API routes, add:

```javascript
import mockRouter from './routes/mock/index.js';

// Mock catch-all for unimplemented endpoints
app.use('/api', mockRouter);
```

- [ ] **Step 3: Test a mock endpoint**

```bash
curl http://localhost:3487/api/projects/1/export
# Expected: {"url":"#","status":"ok"}

curl http://localhost:3487/api/store
# Expected: []

curl http://localhost:3487/api/users/1
# Expected: {"id":1,"username":"viztr-user"}
```

- [ ] **Step 4: Commit**

```bash
git add forks/editor/server/routes/mock/
git commit -m "feat: add mock catch-all router for unimplemented endpoints"
```

---

### Task 6: Implement Messenger and Relay WebSocket Handlers

**Files:**
- Create: `forks/editor/server/websocket/messenger.js`
- Create: `forks/editor/server/websocket/relay.js`
- Modify: `forks/editor/server/index.js` (replace inline handlers)

**Interfaces:**
- Consumes: Nothing
- Produces: `handleMessengerConnection(ws)` and `handleRelayConnection(ws)` functions

- [ ] **Step 1: Create messenger.js**

```javascript
// forks/editor/server/websocket/messenger.js

export function handleMessengerConnection(ws) {
    console.log('[Messenger] Client connected');

    ws.on('message', (rawData) => {
        try {
            const msg = JSON.parse(rawData.toString());
            if (msg.name === 'authenticate') {
                ws.send(JSON.stringify({ name: 'welcome' }));
            }
            // All other messages are ignored in mock mode
        } catch (e) {
            // Ignore parse errors
        }
    });

    ws.on('close', () => console.log('[Messenger] Disconnected'));
}
```

- [ ] **Step 2: Create relay.js**

```javascript
// forks/editor/server/websocket/relay.js

export function handleRelayConnection(ws) {
    console.log('[Relay] Client connected');
    ws.send(JSON.stringify({ t: 'welcome', userId: 1 }));

    ws.on('message', (rawData) => {
        try {
            const msg = JSON.parse(rawData.toString());
            if (msg.t === 'room:join') {
                ws.send(JSON.stringify({ t: 'room:joined', name: msg.name }));
            }
        } catch (e) {
            // Ignore parse errors
        }
    });

    ws.on('close', () => console.log('[Relay] Disconnected'));
}
```

- [ ] **Step 3: Update index.js to use imported handlers**

Replace the inline `messengerWss.on('connection', ...)` and `relayWss.on('connection', ...)` with:

```javascript
import { handleMessengerConnection } from './websocket/messenger.js';
import { handleRelayConnection } from './websocket/relay.js';

messengerWss.on('connection', handleRelayConnection);
relayWss.on('connection', handleRelayConnection);
```

Wait — fix the messenger line:

```javascript
messengerWss.on('connection', handleMessengerConnection);
relayWss.on('connection', handleRelayConnection);
```

- [ ] **Step 4: Test WebSocket connections**

```bash
# Test messenger
node -e "
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3487/ws/messenger');
ws.on('open', () => ws.send(JSON.stringify({ name: 'authenticate', token: 'test' })));
ws.on('message', (data) => { console.log('Received:', data.toString()); ws.close(); });
"

# Test relay
node -e "
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3487/ws/relay');
ws.on('message', (data) => { console.log('Received:', data.toString()); ws.close(); });
"
```

Expected: Messenger returns `{"name":"welcome"}`, Relay returns `{"t":"welcome","userId":1}`.

- [ ] **Step 5: Commit**

```bash
git add forks/editor/server/websocket/messenger.js forks/editor/server/websocket/relay.js
git commit -m "feat: extract messenger and relay WebSocket handlers to modules"
```

---

### Task 7: Update Config Generation for PlayCanvas Editor Compatibility

**Files:**
- Modify: `forks/editor/server/config.js`
- Modify: `app/editor/[projectId]/page.tsx` (Next.js config)

**Interfaces:**
- Consumes: Supabase data (projects, scenes)
- Produces: Config object matching PlayCanvas Editor's `EditorConfig` type

- [ ] **Step 1: Update config.js — add settings.id and required fields**

The PlayCanvas editor expects `config.project.settings.id` to exist. Update the config generator:

In `forks/editor/server/config.js`, in the `loadProject()` function, add `settings.id`:

```javascript
async function loadProject(projectId) {
    const project = await supabaseSingle('editor_projects', `id=eq.${projectId}`);
    if (!project) return null;
    return {
        id: project.id,
        name: project.name,
        description: project.description,
        settings: {
            id: `settings_${project.id}`,
            ...(project.settings || {}),
        },
        permissions: project.permissions || { admin: [1], read: [1], write: [1] },
        private: project.private ?? true,
        masterBranch: project.master_branch || 'main',
        createdAt: project.created_at,
        updatedAt: project.updated_at,
    };
}
```

- [ ] **Step 2: Update page.tsx — add settings.id to config**

In `app/editor/[projectId]/page.tsx`, update the `project` object in the config:

```typescript
project: {
    id: project.id,
    name: project.name,
    description: project.description || '',
    settings: {
        id: `settings_${project.id}`,
        ...(project.settings || {}),
    },
    // ... rest stays the same
},
```

- [ ] **Step 3: Test config injection**

```bash
# Test editor server config
curl -s http://localhost:3487/editor/project/1 | grep -o '"settings":{[^}]*}'
# Expected: "settings":{"id":"settings_1",...}

# Test Next.js config
curl -s http://localhost:3000/editor/2 | grep -o '"settings":{[^}]*}'
# Expected: "settings":{"id":"settings_2",...}
```

- [ ] **Step 4: Commit**

```bash
git add forks/editor/server/config.js app/editor/\[projectId\]/page.tsx
git commit -m "feat: add settings.id to config for PlayCanvas editor compatibility"
```

---

### Task 8: Integration Test — Full Editor Load

**Files:**
- None (testing only)

**Interfaces:**
- Consumes: All previous tasks
- Produces: Confirmed working editor at http://localhost:3487/editor/project/:id

- [ ] **Step 1: Kill all existing servers**

```bash
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

- [ ] **Step 2: Start editor server**

```bash
cd forks/editor/server
node index.js
```

Expected: `VizTR Editor running at http://localhost:3487`

- [ ] **Step 3: Start Next.js**

```bash
cd <project-root>
pnpm dev
```

Expected: Next.js running on port 3000

- [ ] **Step 4: Test editor loads via editor server**

Open `http://localhost:3487/editor/project/1` in browser.

Expected:
- Page loads without errors
- `window.config` is present in console
- WebSocket connects to `ws://localhost:3487/ws/realtime`
- Auth succeeds
- Hierarchy panel shows entities (if scene exists in Supabase)
- Assets panel shows assets (if any exist)
- 3D viewport renders (may be empty if no scene)

- [ ] **Step 5: Test editor loads via Next.js**

Open `http://localhost:3000/editor/2` in browser.

Expected: Same as Step 4, but served from Next.js.

- [ ] **Step 6: Check browser console for errors**

Open DevTools → Console tab. Look for:
- ❌ Failed to fetch /api/... (means a real endpoint is missing)
- ❌ WebSocket connection failed (means WS server isn't running)
- ❌ Cannot read property 'entities' of undefined (means config is missing data)
- ✅ No errors = success

- [ ] **Step 7: Commit test results**

```bash
git add -A
git commit -m "test: verify editor loads with ShareDB + REST API + mocks"
```

---

## Implementation Order

| Task | Depends on | Estimated effort |
|------|-----------|-----------------|
| Task 1: Fork & Build | None | 15 min |
| Task 2: Package.json | None | 5 min |
| Task 3: ShareDB Server | Task 2 | 30 min |
| Task 4: Real REST APIs | Task 2 | 25 min |
| Task 5: Mock Router | Task 4 | 10 min |
| Task 6: Messenger/Relay | Task 2 | 10 min |
| Task 7: Config Update | None | 5 min |
| Task 8: Integration Test | Tasks 1-7 | 10 min |

**Total estimated time:** ~110 minutes

**Critical path:** Task 1 → Task 2 → Task 3 → Task 8
