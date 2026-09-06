# VizTR Editor Local Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local Node.js backend server that makes the VizTR Editor fully functional as a single-user offline 3D editor with project persistence.

**Architecture:** Express server on port 3487 serves the editor HTML shell with injected config, handles REST API calls for project/scene/asset CRUD, and provides WebSocket stubs for ShareDB/Messenger/Relay. Projects stored as JSON files on disk.

**Tech Stack:** Node.js, Express, ws (WebSocket), multer (file upload), uuid, archiver (zip export)

## Global Constraints

- Node.js >= 18.0.0
- Editor runs on port 3487
- No external services (no database, no cloud, no auth)
- Single-user mode (mock user id: 1, username: "viztr-user")
- All data stored in `server/data/` directory
- Editor frontend code is NOT modified — only server-side code added

---

## File Structure

```
forks/editor/server/
├── index.js              # Express server + static files + HTML shell
├── config.js             # window.config generator
├── routes/
│   ├── projects.js       # Project CRUD + listing
│   ├── scenes.js         # Scene CRUD
│   ├── assets.js         # Asset CRUD + file serving
│   ├── branches.js       # Branch management
│   ├── checkpoints.js    # Version snapshots
│   └── stubs.js          # Users, jobs, upload, store stubs
├── ws/
│   ├── realtime.js       # ShareDB WebSocket stub
│   ├── messenger.js      # Messenger WebSocket stub
│   └── relay.js          # Relay WebSocket stub
├── templates/
│   └── editor.html       # HTML shell with config placeholder
└── data/                 # Runtime data (gitignored)
```

---

### Task 1: Project Setup & Express Server Shell

**Files:**
- Create: `forks/editor/server/index.js`
- Create: `forks/editor/server/templates/editor.html`
- Modify: `forks/editor/package.json` (add dependencies)

**Dependencies to install:**
```bash
cd forks/editor
npm install express multer ws uuid archiver
```

**Interfaces:**
- Produces: Express app listening on port 3487
- Produces: Static file serving from `dist/`
- Produces: HTML shell route at `/editor/project/:id`

- [ ] **Step 1: Add dependencies to package.json**

Add to `forks/editor/package.json` dependencies section:
```json
"express": "^4.18.0",
"multer": "^1.4.5-lts.1",
"ws": "^8.16.0",
"uuid": "^9.0.0",
"archiver": "^6.0.0"
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: Dependencies installed successfully

- [ ] **Step 3: Create HTML template**

Create `forks/editor/server/templates/editor.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VizTR Editor</title>
    <link rel="stylesheet" href="/css/editor.css">
    <link rel="stylesheet" href="/css/code-editor.css">
</head>
<body>
    <script>
        var config = __CONFIG__;
    </script>
    <script src="/js/editor.js"></script>
</body>
</html>
```

- [ ] **Step 4: Create blank editor HTML (project list)**

Create `forks/editor/server/templates/blank.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VizTR Editor</title>
    <link rel="stylesheet" href="/css/editor.css">
    <style>
        body { margin: 0; background: #1a1a2e; color: #fff; font-family: Inter, sans-serif; }
        .container { max-width: 800px; margin: 100px auto; padding: 0 20px; }
        h1 { color: #D4A843; }
        .project-list { list-style: none; padding: 0; }
        .project-item { padding: 16px; margin: 8px 0; background: #16213e; border-radius: 8px; cursor: pointer; border: 1px solid #333; }
        .project-item:hover { border-color: #D4A843; }
        .btn { background: #D4A843; color: #000; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: 600; margin-top: 20px; }
        .btn:hover { background: #e0b855; }
    </style>
</head>
<body>
    <div class="container">
        <h1>VizTR Editor</h1>
        <p>Your Projects</p>
        <ul class="project-list" id="projects"></ul>
        <button class="btn" onclick="createProject()">New Project</button>
    </div>
    <script>
        async function loadProjects() {
            const res = await fetch('/api/projects');
            const projects = await res.json();
            const list = document.getElementById('projects');
            list.innerHTML = projects.map(p =>
                `<li class="project-item" onclick="window.location='/editor/project/${p.id}'">
                    <strong>${p.name}</strong><br><small>${p.description || 'No description'}</small>
                </li>`
            ).join('');
        }
        async function createProject() {
            const name = prompt('Project name:', 'Untitled Project');
            if (!name) return;
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description: '' })
            });
            const project = await res.json();
            window.location = `/editor/project/${project.id}`;
        }
        loadProjects();
    </script>
</body>
</html>
```

- [ ] **Step 5: Create Express server shell**

Create `forks/editor/server/index.js`:
```javascript
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3487;

// Parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist/
app.use(express.static(join(__dirname, '..', 'dist')));

// Ensure data directory exists
const dataDir = join(__dirname, 'data', 'projects');
if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
}

// Blank editor (project list)
app.get('/', (req, res) => {
    const template = readFileSync(join(__dirname, 'templates', 'blank.html'), 'utf-8');
    res.send(template);
});

// Editor with config injection
app.get('/editor/project/:id', (req, res) => {
    // TODO: Task 2 - config injection
    res.status(501).send('Not yet implemented');
});

// API routes - TODO: Tasks 3-7
// app.use('/api', apiRouter);

// WebSocket - TODO: Tasks 8-10

app.listen(PORT, () => {
    console.log(`VizTR Editor running at http://localhost:${PORT}`);
});
```

- [ ] **Step 6: Verify server starts**

Run: `node server/index.js`
Expected: "VizTR Editor running at http://localhost:3487"
Open http://localhost:3487 — should show blank project list page

- [ ] **Step 7: Commit**

```bash
git add server/ package.json package-lock.json
git commit -m "feat: add Express server shell with HTML templates"
```

---

### Task 2: Config Generator & HTML Shell

**Files:**
- Create: `forks/editor/server/config.js`
- Modify: `forks/editor/server/index.js` (wire up config route)

**Interfaces:**
- Produces: `generateConfig(projectId)` → config object for window.config
- Consumes: Project data from `server/data/projects/{id}/project.json`

- [ ] **Step 1: Create config generator**

Create `forks/editor/server/config.js`:
```javascript
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const dataDir = join(import.meta.dirname, 'data', 'projects');

export function generateConfig(projectId = null) {
    const baseConfig = {
        version: '2.31.4',
        self: {
            id: 1,
            username: 'viztr-user',
            flags: {},
            branch: projectId ? {
                id: 'main',
                name: 'main',
                createdAt: new Date().toISOString(),
                latestCheckpointId: null
            } : null,
            plan: { id: 1, type: 'individual' },
            locale: 'en'
        },
        owner: {
            id: 1,
            username: 'viztr-user',
            plan: { id: 1, type: 'individual' },
            size: 0,
            diskAllowance: 10737418240
        },
        accessToken: 'local-dev-token',
        project: projectId ? loadProject(projectId) : { id: null },
        aws: { s3Prefix: '' },
        store: { sketchfab: { clientId: '', cookieName: '', redirectUrl: '' } },
        scene: null,
        url: {
            api: 'http://localhost:3487/api',
            launch: 'http://localhost:3487/launch',
            home: 'http://localhost:3487',
            realtime: { http: 'ws://localhost:3487/ws/realtime' },
            messenger: { http: 'http://localhost:3487/ws/messenger', ws: 'ws://localhost:3487/ws/messenger' },
            relay: { http: 'http://localhost:3487/ws/relay', ws: 'ws://localhost:3487/ws/relay' },
            frontend: 'http://localhost:3487',
            engine: 'http://localhost:3487/engine',
            useCustomEngine: false,
            store: 'http://localhost:3487',
            howdoi: 'http://localhost:3487',
            static: 'http://localhost:3487',
            images: 'http://localhost:3487'
        },
        engineVersions: {
            current: { version: '2.21.4', description: 'Current' },
            force: { version: '2.21.4', description: 'Force' }
        },
        sentry: { enabled: false, env: 'local', version: '1.0.0', send: false, service: 'editor', page: '', disable_breadcrumbs: true },
        metrics: { env: 'local', send: false },
        oneTrustDomainKey: '',
        schema: { version: 1, documents: {} },
        wasmModules: []
    };

    return baseConfig;
}

function loadProject(projectId) {
    const projectFile = join(dataDir, String(projectId), 'project.json');
    if (!existsSync(projectFile)) {
        return { id: null };
    }
    return JSON.parse(readFileSync(projectFile, 'utf-8'));
}
```

- [ ] **Step 2: Update server/index.js to use config**

Replace the `/editor/project/:id` route in `server/index.js`:
```javascript
import { generateConfig } from './config.js';

// ... (keep existing code)

// Editor with config injection
app.get('/editor/project/:id', (req, res) => {
    const config = generateConfig(req.params.id);
    if (!config.project.id) {
        return res.status(404).send('Project not found');
    }
    const template = readFileSync(join(__dirname, 'templates', 'editor.html'), 'utf-8');
    const html = template.replace('__CONFIG__', JSON.stringify(config));
    res.send(html);
});
```

- [ ] **Step 3: Verify config injection works**

Create a test project manually:
```bash
mkdir -p forks/editor/server/data/projects/1
echo '{"id":1,"name":"Test Project","description":"Test","settings":{}}' > forks/editor/server/data/projects/1/project.json
```

Run: `node server/index.js`
Open http://localhost:3487/editor/project/1
Expected: Editor loads with config injected (check console for config object)

- [ ] **Step 4: Commit**

```bash
git add server/config.js server/index.js
git commit -m "feat: add config generator and HTML shell injection"
```

---

### Task 3: Project CRUD API

**Files:**
- Create: `forks/editor/server/routes/projects.js`
- Modify: `forks/editor/server/index.js` (mount routes)

**Interfaces:**
- Consumes: Express app
- Produces: REST endpoints for project CRUD

- [ ] **Step 1: Create projects router**

Create `forks/editor/server/routes/projects.js`:
```javascript
import { Router } from 'express';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const dataDir = join(import.meta.dirname, '..', 'data', 'projects');

// List all projects
router.get('/projects', (req, res) => {
    if (!existsSync(dataDir)) {
        return res.json([]);
    }
    const dirs = readdirSync(dataDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => {
            const projectFile = join(dataDir, d.name, 'project.json');
            if (!existsSync(projectFile)) return null;
            return JSON.parse(readFileSync(projectFile, 'utf-8'));
        })
        .filter(Boolean);
    res.json(dirs);
});

// Get project by ID
router.get('/projects/:id', (req, res) => {
    const projectFile = join(dataDir, req.params.id, 'project.json');
    if (!existsSync(projectFile)) {
        return res.status(404).json({ error: 'Project not found' });
    }
    res.json(JSON.parse(readFileSync(projectFile, 'utf-8')));
});

// Create project
router.post('/projects', (req, res) => {
    const { name, description, settings } = req.body;
    const id = Date.now(); // Simple numeric ID
    const projectDir = join(dataDir, String(id));

    mkdirSync(projectDir, { recursive: true });
    mkdirSync(join(projectDir, 'scenes'), { recursive: true });
    mkdirSync(join(projectDir, 'assets'), { recursive: true });
    mkdirSync(join(projectDir, 'branches'), { recursive: true });
    mkdirSync(join(projectDir, 'checkpoints'), { recursive: true });

    const project = {
        id,
        name: name || 'Untitled',
        description: description || '',
        settings: settings || {},
        permissions: { admin: [1], read: [1], write: [1] },
        private: true,
        primaryApp: null,
        playUrl: '',
        privateAssets: false,
        hasPrivateSettings: false,
        thumbnails: {},
        masterBranch: 'main',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    writeFileSync(join(projectDir, 'project.json'), JSON.stringify(project, null, 2));

    // Create default branch
    const branch = {
        id: 'main',
        name: 'main',
        projectId: id,
        createdAt: new Date().toISOString(),
        latestCheckpointId: null
    };
    writeFileSync(join(projectDir, 'branches', 'main.json'), JSON.stringify(branch, null, 2));

    // Create default scene
    const sceneId = uuidv4();
    const scene = {
        id: sceneId,
        uniqueId: sceneId,
        name: 'Root',
        projectId: id,
        branchId: 'main',
        entities: {},
        settings: {}
    };
    writeFileSync(join(projectDir, 'scenes', `${sceneId}.json`), JSON.stringify(scene, null, 2));

    res.status(201).json(project);
});

// Update project
router.put('/projects/:id', (req, res) => {
    const projectFile = join(dataDir, req.params.id, 'project.json');
    if (!existsSync(projectFile)) {
        return res.status(404).json({ error: 'Project not found' });
    }
    const project = JSON.parse(readFileSync(projectFile, 'utf-8'));
    Object.assign(project, req.body, { updatedAt: new Date().toISOString() });
    writeFileSync(projectFile, JSON.stringify(project, null, 2));
    res.json(project);
});

// Delete project
router.delete('/projects/:id', (req, res) => {
    const projectDir = join(dataDir, req.params.id);
    if (!existsSync(projectDir)) {
        return res.status(404).json({ error: 'Project not found' });
    }
    rmSync(projectDir, { recursive: true, force: true });
    res.json({ ok: true });
});

// List project assets
router.get('/projects/:id/assets', (req, res) => {
    const assetsDir = join(dataDir, req.params.id, 'assets');
    if (!existsSync(assetsDir)) {
        return res.json([]);
    }
    const files = readdirSync(assetsDir)
        .filter(f => f.endsWith('.json'))
        .map(f => {
            const asset = JSON.parse(readFileSync(join(assetsDir, f), 'utf-8'));
            return asset;
        });
    res.json(files);
});

// List project scenes
router.get('/projects/:id/scenes', (req, res) => {
    const scenesDir = join(dataDir, req.params.id, 'scenes');
    if (!existsSync(scenesDir)) {
        return res.json([]);
    }
    const files = readdirSync(scenesDir)
        .filter(f => f.endsWith('.json'))
        .map(f => JSON.parse(readFileSync(join(scenesDir, f), 'utf-8')));
    res.json(files);
});

// List project branches
router.get('/projects/:id/branches', (req, res) => {
    const branchesDir = join(dataDir, req.params.id, 'branches');
    if (!existsSync(branchesDir)) {
        return res.json([]);
    }
    const files = readdirSync(branchesDir)
        .filter(f => f.endsWith('.json'))
        .map(f => JSON.parse(readFileSync(join(branchesDir, f), 'utf-8')));
    res.json(files);
});

// Project activity (stub)
router.get('/projects/:id/activity', (req, res) => res.json([]));

// Project collaborators (stub)
router.get('/projects/:id/collaborators', (req, res) => {
    res.json([{ id: 1, username: 'viztr-user', access_level: 'admin' }]);
});

export default router;
```

- [ ] **Step 2: Mount router in server/index.js**

Add to `server/index.js` (before the `app.listen` line):
```javascript
import projectsRouter from './routes/projects.js';

// ... existing code ...

app.use('/api', projectsRouter);
```

- [ ] **Step 3: Test project CRUD**

Run: `node server/index.js`
1. Open http://localhost:3487 — should show "New Project" button
2. Click "New Project", enter name — should create and navigate
3. Project should appear in list on reload

- [ ] **Step 4: Commit**

```bash
git add server/routes/projects.js server/index.js
git commit -m "feat: add project CRUD API with local JSON storage"
```

---

### Task 4: Scene CRUD API

**Files:**
- Create: `forks/editor/server/routes/scenes.js`
- Modify: `forks/editor/server/index.js` (mount routes)

**Interfaces:**
- Consumes: Project data from `server/data/projects/{id}/scenes/`
- Produces: REST endpoints for scene CRUD

- [ ] **Step 1: Create scenes router**

Create `forks/editor/server/routes/scenes.js`:
```javascript
import { Router } from 'express';
import { existsSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const dataDir = join(import.meta.dirname, '..', 'data', 'projects');

// Get scene by ID (query param branchId)
router.get('/scenes/:id', (req, res) => {
    const projectId = req.query.branchId ? findProjectForBranch(req.query.branchId) : null;
    if (!projectId) {
        return res.status(404).json({ error: 'Scene not found' });
    }
    const sceneFile = join(dataDir, String(projectId), 'scenes', `${req.params.id}.json`);
    if (!existsSync(sceneFile)) {
        return res.status(404).json({ error: 'Scene not found' });
    }
    res.json(JSON.parse(readFileSync(sceneFile, 'utf-8')));
});

// Create scene
router.post('/scenes', (req, res) => {
    const { projectId, branchId, name, duplicateFrom } = req.body;
    const sceneId = uuidv4();

    let sceneData = {
        id: sceneId,
        uniqueId: sceneId,
        name: name || 'Untitled',
        projectId,
        branchId: branchId || 'main',
        entities: {},
        settings: {}
    };

    // Duplicate from existing scene
    if (duplicateFrom) {
        const sourceFile = join(dataDir, String(projectId), 'scenes', `${duplicateFrom}.json`);
        if (existsSync(sourceFile)) {
            const source = JSON.parse(readFileSync(sourceFile, 'utf-8'));
            sceneData = { ...source, ...sceneData, entities: { ...source.entities } };
        }
    }

    const sceneFile = join(dataDir, String(projectId), 'scenes', `${sceneId}.json`);
    writeFileSync(sceneFile, JSON.stringify(sceneData, null, 2));

    res.status(201).json(sceneData);
});

// Delete scene
router.delete('/scenes/:id', (req, res) => {
    const projectId = req.query.projectId;
    if (!projectId) {
        return res.status(400).json({ error: 'projectId required' });
    }
    const sceneFile = join(dataDir, String(projectId), 'scenes', `${req.params.id}.json`);
    if (!existsSync(sceneFile)) {
        return res.status(404).json({ error: 'Scene not found' });
    }
    rmSync(sceneFile);
    res.json({ ok: true });
});

// Helper: find project that contains a branch
function findProjectForBranch(branchId) {
    if (!existsSync(dataDir)) return null;
    const dirs = readdirSync(dataDir, { withFileTypes: true }).filter(d => d.isDirectory());
    for (const dir of dirs) {
        const branchFile = join(dataDir, dir.name, 'branches', `${branchId}.json`);
        if (existsSync(branchFile)) return dir.name;
    }
    return null;
}

export default router;
```

- [ ] **Step 2: Mount router**

Add to `server/index.js`:
```javascript
import scenesRouter from './routes/scenes.js';

app.use('/api', scenesRouter);
```

- [ ] **Step 3: Test scene operations**

Create a project, then verify:
- Scene list returns default scene
- Can create new scene
- Can delete scene

- [ ] **Step 4: Commit**

```bash
git add server/routes/scenes.js server/index.js
git commit -m "feat: add scene CRUD API"
```

---

### Task 5: Asset CRUD & File Serving

**Files:**
- Create: `forks/editor/server/routes/assets.js`
- Modify: `forks/editor/server/index.js` (mount routes)

**Interfaces:**
- Consumes: Project data from `server/data/projects/{id}/assets/`
- Produces: REST endpoints for asset CRUD + file serving

- [ ] **Step 1: Create assets router**

Create `forks/editor/server/routes/assets.js`:
```javascript
import { Router } from 'express';
import multer from 'multer';
import { existsSync, readFileSync, writeFileSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const dataDir = join(import.meta.dirname, '..', 'data', 'projects');
const upload = multer({ dest: join(import.meta.dirname, '..', 'tmp') });

// Get asset metadata
router.get('/assets/:id', (req, res) => {
    const projectId = req.query.projectId;
    if (!projectId) {
        return res.status(400).json({ error: 'projectId required' });
    }
    const assetFile = join(dataDir, String(projectId), 'assets', `${req.params.id}.json`);
    if (!existsSync(assetFile)) {
        return res.status(404).json({ error: 'Asset not found' });
    }
    res.json(JSON.parse(readFileSync(assetFile, 'utf-8')));
});

// Serve asset file
router.get('/assets/:id/file/:name', (req, res) => {
    const projectId = req.query.projectId || req.query.branchId;
    if (!projectId) {
        return res.status(400).send('projectId required');
    }
    const assetDir = join(dataDir, String(projectId), 'assets');
    // Find file matching the name pattern
    const files = readdirSync(assetDir).filter(f => f.startsWith(req.params.id));
    const file = files.find(f => f === req.params.name || f.endsWith(`-${req.params.name}`));
    if (!file) {
        return res.status(404).send('File not found');
    }
    res.sendFile(join(assetDir, file));
});

// Create asset (multipart upload)
router.post('/assets', upload.single('file'), (req, res) => {
    const { projectId, type, name, branchId, data: assetData, meta, tags } = req.body;
    const assetId = uuidv4();

    const assetDir = join(dataDir, String(projectId), 'assets');
    if (!existsSync(assetDir)) {
        return res.status(404).json({ error: 'Project not found' });
    }

    // Save metadata
    const metadata = {
        id: assetId,
        name: name || req.file?.originalname || 'Untitled',
        type: parseInt(type) || 0,
        projectId: parseInt(projectId),
        branchId: branchId || 'main',
        tags: tags ? JSON.parse(tags) : [],
        data: assetData ? JSON.parse(assetData) : {},
        meta: meta ? JSON.parse(meta) : {},
        file: req.file ? req.file.originalname : null,
        createdAt: new Date().toISOString()
    };

    writeFileSync(join(assetDir, `${assetId}.json`), JSON.stringify(metadata, null, 2));

    // Move uploaded file
    if (req.file) {
        const ext = req.file.originalname.split('.').pop();
        const destPath = join(assetDir, `${assetId}.${ext}`);
        const { renameSync } = await import('fs');
        renameSync(req.file.path, destPath);
        metadata.file = `${assetId}.${ext}`;
        writeFileSync(join(assetDir, `${assetId}.json`), JSON.stringify(metadata, null, 2));
    }

    res.status(201).json(metadata);
});

// Update asset
router.put('/assets/:id', upload.single('file'), (req, res) => {
    const projectId = req.body.projectId;
    const assetFile = join(dataDir, String(projectId), 'assets', `${req.params.id}.json`);
    if (!existsSync(assetFile)) {
        return res.status(404).json({ error: 'Asset not found' });
    }

    const metadata = JSON.parse(readFileSync(assetFile, 'utf-8'));
    Object.assign(metadata, {
        name: req.body.name || metadata.name,
        tags: req.body.tags ? JSON.parse(req.body.tags) : metadata.tags,
        data: req.body.data ? JSON.parse(req.body.data) : metadata.data,
        meta: req.body.meta ? JSON.parse(req.body.meta) : metadata.meta,
        updatedAt: new Date().toISOString()
    });

    writeFileSync(assetFile, JSON.stringify(metadata, null, 2));
    res.json(metadata);
});

// Bulk delete assets
router.delete('/assets', (req, res) => {
    const { assets: assetIds, projectId } = req.body;
    const assetDir = join(dataDir, String(projectId), 'assets');

    for (const id of assetIds) {
        const jsonFile = join(assetDir, `${id}.json`);
        if (existsSync(jsonFile)) unlinkSync(jsonFile);
        // Delete associated files
        const files = readdirSync(assetDir).filter(f => f.startsWith(id));
        files.forEach(f => unlinkSync(join(assetDir, f)));
    }

    res.json({ ok: true });
});

export default router;
```

- [ ] **Step 2: Mount router**

Add to `server/index.js`:
```javascript
import assetsRouter from './routes/assets.js';

app.use('/api', assetsRouter);
```

- [ ] **Step 3: Test asset operations**

Upload an image to a project, verify:
- Asset metadata saved to JSON
- File stored on disk
- Can retrieve asset metadata
- Can serve asset file
- Can delete asset

- [ ] **Step 4: Commit**

```bash
git add server/routes/assets.js server/index.js
git commit -m "feat: add asset CRUD API with file upload and serving"
```

---

### Task 6: Branch & Checkpoint APIs

**Files:**
- Create: `forks/editor/server/routes/branches.js`
- Create: `forks/editor/server/routes/checkpoints.js`
- Modify: `forks/editor/server/index.js` (mount routes)

**Interfaces:**
- Consumes: Project data from `server/data/projects/{id}/`
- Produces: REST endpoints for branches and checkpoints

- [ ] **Step 1: Create branches router**

Create `forks/editor/server/routes/branches.js`:
```javascript
import { Router } from 'express';
import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const dataDir = join(import.meta.dirname, '..', 'data', 'projects');

// Create branch
router.post('/branches', (req, res) => {
    const { name, projectId, sourceBranchId, sourceCheckpointId } = req.body;
    const branchId = name || uuidv4().slice(0, 8);

    const branch = {
        id: branchId,
        name: branchId,
        projectId,
        sourceBranchId,
        sourceCheckpointId,
        createdAt: new Date().toISOString(),
        latestCheckpointId: null
    };

    const branchFile = join(dataDir, String(projectId), 'branches', `${branchId}.json`);
    writeFileSync(branchFile, JSON.stringify(branch, null, 2));

    res.status(201).json(branch);
});

// Checkout branch (stub - just return branch)
router.post('/branches/:id/checkout', (req, res) => {
    res.json({ ok: true, branchId: req.params.id });
});

// Get branch checkpoints
router.get('/branches/:id/checkpoints', (req, res) => {
    const projectId = req.query.projectId;
    if (!projectId) return res.json([]);

    const checkpointsDir = join(dataDir, String(projectId), 'checkpoints');
    if (!existsSync(checkpointsDir)) return res.json([]);

    const files = readdirSync(checkpointsDir)
        .filter(f => f.endsWith('.json'))
        .map(f => JSON.parse(readFileSync(join(checkpointsDir, f), 'utf-8')))
        .filter(c => c.branchId === req.params.id);

    res.json(files);
});

export default router;
```

- [ ] **Step 2: Create checkpoints router**

Create `forks/editor/server/routes/checkpoints.js`:
```javascript
import { Router } from 'express';
import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const dataDir = join(import.meta.dirname, '..', 'data', 'projects');

// Create checkpoint (snapshot)
router.post('/checkpoints', (req, res) => {
    const { projectId, branchId, description } = req.body;
    const checkpointId = uuidv4();

    // Snapshot all scenes
    const scenesDir = join(dataDir, String(projectId), 'scenes');
    const scenes = existsSync(scenesDir)
        ? readdirSync(scenesDir).filter(f => f.endsWith('.json'))
            .map(f => JSON.parse(readFileSync(join(scenesDir, f), 'utf-8')))
        : [];

    const checkpoint = {
        id: checkpointId,
        projectId,
        branchId,
        description: description || 'Auto-save',
        scenes: scenes,
        createdAt: new Date().toISOString()
    };

    const checkpointsDir = join(dataDir, String(projectId), 'checkpoints');
    if (!existsSync(checkpointsDir)) {
        const { mkdirSync } = await import('fs');
        mkdirSync(checkpointsDir, { recursive: true });
    }

    writeFileSync(join(checkpointsDir, `${checkpointId}.json`), JSON.stringify(checkpoint, null, 2));

    res.status(201).json(checkpoint);
});

// Get checkpoint
router.get('/checkpoints/:id', (req, res) => {
    const projectId = req.query.projectId;
    const checkpointFile = join(dataDir, String(projectId), 'checkpoints', `${req.params.id}.json`);
    if (!existsSync(checkpointFile)) {
        return res.status(404).json({ error: 'Checkpoint not found' });
    }
    res.json(JSON.parse(readFileSync(checkpointFile, 'utf-8')));
});

export default router;
```

- [ ] **Step 3: Mount routers**

Add to `server/index.js`:
```javascript
import branchesRouter from './routes/branches.js';
import checkpointsRouter from './routes/checkpoints.js';

app.use('/api', branchesRouter);
app.use('/api', checkpointsRouter);
```

- [ ] **Step 4: Test branch/checkpoint operations**

Create a project, create a branch, create a checkpoint, verify data persisted.

- [ ] **Step 5: Commit**

```bash
git add server/routes/branches.js server/routes/checkpoints.js server/index.js
git commit -m "feat: add branch and checkpoint APIs"
```

---

### Task 7: API Stubs (Users, Jobs, Upload, Store)

**Files:**
- Create: `forks/editor/server/routes/stubs.js`
- Modify: `forks/editor/server/index.js` (mount routes)

**Interfaces:**
- Produces: Stub endpoints for endpoints editor calls but don't need real implementation

- [ ] **Step 1: Create stubs router**

Create `forks/editor/server/routes/stubs.js`:
```javascript
import { Router } from 'express';

const router = Router();

// User stubs
router.get('/users/:id', (req, res) => {
    res.json({
        id: 1,
        username: 'viztr-user',
        email: 'viztr@localhost',
        plan: { id: 1, type: 'individual' },
        flags: {},
        createdAt: new Date().toISOString()
    });
});

router.get('/users/:id/projects', (req, res) => res.json([]));

router.get('/users/:id/usage', (req, res) => {
    res.json({ size: 0, diskAllowance: 10737418240 });
});

router.get('/users/:id/collaborators', (req, res) => res.json([]));

// Job stubs
router.get('/jobs/:id', (req, res) => {
    res.json({ id: req.params.id, status: 'complete', progress: 100 });
});

// Upload stubs (local mode doesn't need S3)
router.post('/upload/start-upload', (req, res) => {
    res.json({ uploadId: 'local', key: `local/${Date.now()}` });
});

router.post('/upload/signed-urls', (req, res) => {
    res.json({ signedUrls: [] });
});

router.post('/upload/complete-upload', (req, res) => {
    res.json({ status: 'ok' });
});

// Store stubs
router.get('/store', (req, res) => res.json([]));
router.get('/store/:id', (req, res) => res.json({ id: req.params.id, name: 'N/A' }));

// Invitation stubs
router.get('/invitations', (req, res) => res.json([]));

// Star/Watch stubs
router.post('/star', (req, res) => res.json({ id: 'star-1' }));
router.delete('/star/:id', (req, res) => res.json({ ok: true }));
router.post('/watch', (req, res) => res.json({ id: 'watch-1' }));
router.delete('/watch/:id', (req, res) => res.json({ ok: true }));

// App stubs
router.get('/apps', (req, res) => res.json([]));
router.post('/apps', (req, res) => res.json({ id: Date.now(), ...req.body }));

// Payment stubs
router.put('/payment/subscription/users/:id', (req, res) => res.json({ ok: true }));

export default router;
```

- [ ] **Step 2: Mount stubs router**

Add to `server/index.js`:
```javascript
import stubsRouter from './routes/stubs.js';

app.use('/api', stubsRouter);
```

- [ ] **Step 3: Verify stubs work**

Test `GET /api/users/1` returns mock user.
Test `GET /api/jobs/123` returns complete status.

- [ ] **Step 4: Commit**

```bash
git add server/routes/stubs.js server/index.js
git commit -m "feat: add API stubs for users, jobs, upload, store"
```

---

### Task 8: ShareDB WebSocket Stub

**Files:**
- Create: `forks/editor/server/ws/realtime.js`
- Modify: `forks/editor/server/index.js` (wire up WebSocket)

**Interfaces:**
- Consumes: WebSocket connection from editor
- Produces: Single-user loopback ShareDB stub

- [ ] **Step 1: Create ShareDB stub**

Create `forks/editor/server/ws/realtime.js`:
```javascript
import { WebSocketServer } from 'ws';

export function setupRealtime(server) {
    const wss = new WebSocketServer({ server, path: '/ws/realtime' });

    wss.on('connection', (ws) => {
        console.log('[Realtime] Client connected');

        let authenticated = false;

        ws.on('message', (data) => {
            try {
                const msg = JSON.parse(data);

                // Handle auth
                if (msg.name === 'auth' || msg.accessToken) {
                    authenticated = true;
                    ws.send(JSON.stringify({ name: 'auth', ok: true }));
                    return;
                }

                if (!authenticated) {
                    ws.send(JSON.stringify({ error: 'Not authenticated' }));
                    return;
                }

                // Handle ShareDB protocol messages
                // For single-user mode, we acknowledge but don't persist
                if (msg.a === 'hs') { // handshake
                    ws.send(JSON.stringify({ a: 'hs', protocol: 1 }));
                }

                if (msg.a === 's') { // subscribe
                    ws.send(JSON.stringify({ a: 's', c: msg.c, d: msg.d, data: null }));
                }

                if (msg.a === 'op') { // operation
                    // Acknowledge the op
                    ws.send(JSON.stringify({ a: 'ack', src: msg.src }));
                }

                // Ping/pong
                if (msg.type === 'ping') {
                    ws.send(JSON.stringify({ type: 'pong' }));
                }

            } catch (e) {
                // Ignore parse errors
            }
        });

        ws.on('close', () => {
            console.log('[Realtime] Client disconnected');
        });
    });

    return wss;
}
```

- [ ] **Step 2: Wire up WebSocket in server**

Add to `server/index.js`:
```javascript
import { createServer } from 'http';
import { setupRealtime } from './ws/realtime.js';

// ... after app creation ...

const server = createServer(app);

// Setup WebSocket
setupRealtime(server);

server.listen(PORT, () => {
    console.log(`VizTR Editor running at http://localhost:${PORT}`);
});
```

Replace the `app.listen(PORT, ...)` with the `server.listen(PORT, ...)` pattern.

- [ ] **Step 3: Test WebSocket connection**

Run server, open editor, check browser console for:
- WebSocket connection to `ws://localhost:3487/ws/realtime`
- Auth message sent and acknowledged

- [ ] **Step 4: Commit**

```bash
git add server/ws/realtime.js server/index.js
git commit -m "feat: add ShareDB WebSocket stub for single-user mode"
```

---

### Task 9: Messenger & Relay WebSocket Stubs

**Files:**
- Create: `forks/editor/server/ws/messenger.js`
- Create: `forks/editor/server/ws/relay.js`
- Modify: `forks/editor/server/index.js` (wire up WebSockets)

**Interfaces:**
- Produces: Messenger and Relay WebSocket stubs

- [ ] **Step 1: Create Messenger stub**

Create `forks/editor/server/ws/messenger.js`:
```javascript
import { WebSocketServer } from 'ws';

export function setupMessenger(server) {
    const wss = new WebSocketServer({ server, path: '/ws/messenger' });

    wss.on('connection', (ws) => {
        console.log('[Messenger] Client connected');

        ws.on('message', (data) => {
            try {
                const msg = JSON.parse(data);

                if (msg.name === 'authenticate') {
                    ws.send(JSON.stringify({ name: 'welcome' }));
                    return;
                }

                if (msg.type === 'ping') {
                    ws.send(JSON.stringify({ type: 'pong' }));
                }
            } catch (e) {}
        });

        ws.on('close', () => {
            console.log('[Messenger] Client disconnected');
        });
    });

    return wss;
}
```

- [ ] **Step 2: Create Relay stub**

Create `forks/editor/server/ws/relay.js`:
```javascript
import { WebSocketServer } from 'ws';

export function setupRelay(server) {
    const wss = new WebSocketServer({ server, path: '/ws/relay' });

    wss.on('connection', (ws) => {
        console.log('[Relay] Client connected');

        ws.send(JSON.stringify({ t: 'welcome', userId: 1 }));

        ws.on('message', (data) => {
            try {
                const msg = JSON.parse(data);

                if (msg.type === 'ping') {
                    ws.send(JSON.stringify({ type: 'pong' }));
                }

                // No-op room messages
                if (msg.t === 'room:join') {
                    ws.send(JSON.stringify({ t: 'room:joined', name: msg.name }));
                }
            } catch (e) {}
        });

        ws.on('close', () => {
            console.log('[Relay] Client disconnected');
        });
    });

    return wss;
}
```

- [ ] **Step 3: Wire up in server/index.js**

Add imports and setup:
```javascript
import { setupMessenger } from './ws/messenger.js';
import { setupRelay } from './ws/relay.js';

// ... in server setup ...

setupMessenger(server);
setupRelay(server);
```

- [ ] **Step 4: Test all WebSockets**

Open editor, verify in browser console:
- `/ws/realtime` connects and authenticates
- `/ws/messenger` connects and receives welcome
- `/ws/relay` connects and receives welcome

- [ ] **Step 5: Commit**

```bash
git add server/ws/messenger.js server/ws/relay.js server/index.js
git commit -m "feat: add Messenger and Relay WebSocket stubs"
```

---

### Task 10: Integration Test & Polish

**Files:**
- Modify: `forks/editor/server/index.js` (error handling, logging)
- Modify: `forks/editor/package.json` (add start script)

**Interfaces:**
- Produces: Working end-to-end editor experience

- [ ] **Step 1: Add start script to package.json**

Add to `forks/editor/package.json` scripts:
```json
"start:local": "node server/index.js"
```

- [ ] **Step 2: Add error handling middleware**

Add to `server/index.js` before `app.listen`:
```javascript
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[Error]', err.message);
    res.status(500).json({ error: err.message });
});
```

- [ ] **Step 3: Add CORS headers (for development)**

Add to `server/index.js`:
```javascript
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});
```

- [ ] **Step 4: Full integration test**

1. Start server: `node server/index.js`
2. Open http://localhost:3487
3. Create new project "VizTR Test"
4. Verify editor loads with viewport
5. Add entity in hierarchy
6. Add components in inspector
7. Save project (checkpoint)
8. Close and reopen — verify data persisted
9. Import a GLB model
10. Verify all WebSocket connections in console

- [ ] **Step 5: Final commit**

```bash
git add server/ package.json
git commit -m "feat: complete VizTR Editor local backend

- Express server with REST API for projects, scenes, assets
- Branch and checkpoint management
- ShareDB/Messenger/Relay WebSocket stubs
- HTML shell with config injection
- Local JSON file persistence"
```

---

### Task 11: Create Startup Documentation

**Files:**
- Create: `forks/editor/LOCAL-DEV.md`

**Interfaces:**
- Produces: Documentation for running the editor locally

- [ ] **Step 1: Create LOCAL-DEV.md**

Create `forks/editor/LOCAL-DEV.md`:
```markdown
# VizTR Editor - Local Development

## Quick Start

```bash
cd forks/editor
npm install
node server/index.js
```

Open http://localhost:3487

## Features

- Create and manage 3D projects
- Full scene editing with PlayCanvas engine
- Import 3D models (GLB, GLTF, FBX, OBJ)
- Import textures and materials
- Script editing with Monaco editor
- Project save/load via checkpoints
- All data stored locally in server/data/

## Limitations (vs PlayCanvas Cloud)

- Single-user only (no real-time collaboration)
- No cloud storage (local disk only)
- No authentication (auto-login as mock user)
- No store/marketplace
- No merge/diff (basic branches only)

## Data Storage

All project data stored in `server/data/projects/`:
```
server/data/projects/
├── {projectId}/
│   ├── project.json        # Project metadata
│   ├── settings.json       # Project settings
│   ├── branches/           # Branch data
│   ├── scenes/             # Scene entity data
│   ├── assets/             # Asset files + metadata
│   └── checkpoints/        # Version snapshots
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects` | GET/POST | List/create projects |
| `/api/projects/:id` | GET/PUT/DELETE | Read/update/delete project |
| `/api/scenes` | POST | Create scene |
| `/api/assets` | POST | Upload asset |
| `/api/branches` | POST | Create branch |
| `/api/checkpoints` | POST | Save checkpoint |

## WebSocket Endpoints

| Path | Purpose |
|------|---------|
| `/ws/realtime` | ShareDB stub (single-user) |
| `/ws/messenger` | Event pub/sub stub |
| `/ws/relay` | Room messaging stub |
```

- [ ] **Step 2: Final commit**

```bash
git add LOCAL-DEV.md
git commit -m "docs: add local development guide"
```
