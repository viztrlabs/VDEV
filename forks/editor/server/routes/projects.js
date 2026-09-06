import { Router } from 'express';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'fs';
import { join } from 'path';

const router = Router();
const dataDir = join(import.meta.dirname, '..', 'data', 'projects');

// Template scene definitions keyed by fork_from id
const TEMPLATES = {
    // Architecture Studio
    1001: { // Exterior / Interior
        name: 'Arch Scene',
        entities: {
            'camera-main': { name: 'Main Camera', components: { camera: { clearColor: [0.3, 0.6, 0.9, 1], fov: 45, near: 0.1, far: 1000 } } },
            'light-sun': { name: 'Sun Light', components: { light: { type: 'directional', color: [1, 0.95, 0.8], intensity: 1.2, castShadows: true } } },
            'light-ambient': { name: 'Ambient', components: { light: { type: 'ambient', color: [0.4, 0.45, 0.5], intensity: 0.4 } } },
            'ground': { name: 'Ground Plane', components: { model: { type: 'plane', width: 100, length: 100 }, material: { color: [0.3, 0.35, 0.3] } } },
        },
        settings: { sky: { type: 'skybox', intensity: 0.8 }, render: { toneMapping: 'ACES', exposure: 1.0 } },
    },
    1002: { // Animation / Walkthrough
        name: 'Walkthrough Scene',
        entities: {
            'camera-main': { name: 'Walkthrough Camera', components: { camera: { clearColor: [0.2, 0.4, 0.7, 1], fov: 60, near: 0.1, far: 500 } } },
            'camera-path': { name: 'Camera Path', components: { spline: { type: 'catmullrom', points: [[0,1.7,0],[5,1.7,0],[5,1.7,5],[0,1.7,5]] } } },
            'light-sun': { name: 'Sun Light', components: { light: { type: 'directional', color: [1, 0.95, 0.85], intensity: 1.0, castShadows: true } } },
            'ground': { name: 'Ground', components: { model: { type: 'plane', width: 50, length: 50 }, material: { color: [0.25, 0.3, 0.25] } } },
        },
        settings: { animation: { autoPlay: true, loop: true, duration: 10 } },
    },
    // XR World
    2001: { // XR / AR
        name: 'XR Scene',
        entities: {
            'camera-xr': { name: 'XR Camera', components: { camera: { clearColor: [0, 0, 0, 0], fov: 90, near: 0.01, far: 100 } } },
            'light-sun': { name: 'Sun Light', components: { light: { type: 'directional', color: [1, 1, 1], intensity: 1.0 } } },
            'light-ambient': { name: 'Ambient', components: { light: { type: 'ambient', color: [0.5, 0.5, 0.5], intensity: 0.5 } } },
            'floor': { name: 'Floor Plane', components: { model: { type: 'plane', width: 10, length: 10 }, material: { color: [0.2, 0.2, 0.2], opacity: 0.8 } } },
        },
        settings: { xr: { enabled: true, type: 'auto', imageTracking: true, hitTest: true, anchors: true } },
    },
    2002: { // VR
        name: 'VR Scene',
        entities: {
            'camera-vr': { name: 'VR Camera', components: { camera: { clearColor: [0.1, 0.1, 0.15, 1], fov: 110, near: 0.01, far: 500 } } },
            'light-sun': { name: 'Sun Light', components: { light: { type: 'directional', color: [1, 0.98, 0.95], intensity: 1.0, castShadows: true } } },
            'light-ambient': { name: 'Ambient', components: { light: { type: 'ambient', color: [0.3, 0.3, 0.4], intensity: 0.3 } } },
            'floor': { name: 'VR Floor', components: { model: { type: 'plane', width: 20, length: 20 }, material: { color: [0.15, 0.15, 0.2] } } },
            'controller-left': { name: 'Left Controller', components: { input: { type: 'hand', hand: 'left' } } },
            'controller-right': { name: 'Right Controller', components: { input: { type: 'hand', hand: 'right' } } },
        },
        settings: { xr: { enabled: true, type: 'vr', teleportation: true, handTracking: true, controllerModel: true } },
    },
    2003: { // Virtual Tour
        name: 'Tour Scene',
        entities: {
            'camera-tour': { name: 'Tour Camera', components: { camera: { clearColor: [0.15, 0.15, 0.2, 1], fov: 75, near: 0.1, far: 200 } } },
            'hotspot-entry': { name: 'Entry Hotspot', components: { hotspot: { type: 'teleport', position: [0, 1.6, 0] } } },
            'light-ambient': { name: 'Ambient', components: { light: { type: 'ambient', color: [0.6, 0.6, 0.6], intensity: 0.6 } } },
        },
        settings: { tour: { hotspots: true, infoPanels: true, floorPlan: true, transitions: 'fade' } },
    },
    2004: { // Gaussian Splat
        name: 'Splat Scene',
        entities: {
            'camera-splat': { name: 'Splat Camera', components: { camera: { clearColor: [0.05, 0.05, 0.08, 1], fov: 60, near: 0.1, far: 500 } } },
            'light-sun': { name: 'Sun Light', components: { light: { type: 'directional', color: [1, 0.98, 0.95], intensity: 0.8 } } },
        },
        settings: { splatting: { enabled: true, renderMode: 'splat', screenSpace: true, ViewState: 'adaptive' } },
    },
    2005: { // Pixel Streaming
        name: 'Stream Scene',
        entities: {
            'camera-stream': { name: 'Stream Camera', components: { camera: { clearColor: [0.1, 0.1, 0.12, 1], fov: 60, near: 0.1, far: 1000 } } },
            'light-sun': { name: 'Sun Light', components: { light: { type: 'directional', color: [1, 1, 1], intensity: 1.0, castShadows: true } } },
            'light-ambient': { name: 'Ambient', components: { light: { type: 'ambient', color: [0.4, 0.4, 0.5], intensity: 0.4 } } },
        },
        settings: { streaming: { enabled: true, encoder: 'h264', bitrate: 10000, framerate: 60, resolution: [1920, 1080] } },
    },
};

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
    const { name, description, settings, fork_from } = req.body;
    const id = Date.now();
    const projectDir = join(dataDir, String(id));

    mkdirSync(projectDir, { recursive: true });
    mkdirSync(join(projectDir, 'scenes'), { recursive: true });
    mkdirSync(join(projectDir, 'assets'), { recursive: true });
    mkdirSync(join(projectDir, 'branches'), { recursive: true });
    mkdirSync(join(projectDir, 'checkpoints'), { recursive: true });

    // Resolve template from fork_from
    const template = fork_from ? TEMPLATES[fork_from] : null;

    const project = {
        id,
        name: name || 'Untitled',
        description: description || '',
        settings: settings || {},
        fork_from: fork_from || null,
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

    // Create scene from template or blank
    const sceneId = crypto.randomUUID();
    const scene = {
        id: sceneId,
        uniqueId: sceneId,
        name: template ? template.name : 'Root',
        projectId: id,
        branchId: 'main',
        entities: template ? template.entities : {},
        settings: template ? template.settings : {}
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
        .map(f => JSON.parse(readFileSync(join(assetsDir, f), 'utf-8')));
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
