import { Router } from 'express';

const router = Router();
const NEXTJS_API = process.env.NEXTJS_API_URL || 'http://localhost:3000';

// Proxy API calls to Next.js (which has Supabase access)
async function proxyToNextjs(req, res, path) {
    try {
        const url = `${NEXTJS_API}/api${path}`;
        const options = {
            method: req.method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (req.method !== 'GET' && req.method !== 'DELETE') {
            options.body = JSON.stringify(req.body);
        }
        const response = await fetch(url, options);
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (err) {
        res.status(502).json({ error: 'Next.js API not available', detail: err.message });
    }
}

// Project routes
router.get('/projects', (req, res) => proxyToNextjs(req, res, '/editor-projects'));
router.get('/projects/:id', (req, res) => proxyToNextjs(req, res, `/editor-projects/${req.params.id}`));
router.post('/projects', (req, res) => proxyToNextjs(req, res, '/editor-projects'));
router.put('/projects/:id', (req, res) => proxyToNextjs(req, res, `/editor-projects/${req.params.id}`));
router.delete('/projects/:id', (req, res) => proxyToNextjs(req, res, `/editor-projects/${req.params.id}`));

// Scene routes
router.get('/projects/:id/scenes', (req, res) => proxyToNextjs(req, res, `/editor-projects/${req.params.id}/scenes`));

// Branch routes (stub)
router.get('/projects/:id/branches', (req, res) => {
    res.json([{ id: 'main', name: 'main', projectId: Number(req.params.id), latestCheckpointId: null, createdAt: new Date().toISOString() }]);
});

// Asset routes (stub)
router.get('/projects/:id/assets', (req, res) => res.json([]));

// Checkpoint routes (stub)
router.get('/projects/:id/checkpoints', (req, res) => res.json([]));

// User route (editor needs this)
router.get('/user', (req, res) => {
    res.json({
        id: 1,
        username: 'viztr-user',
        displayName: 'VizTR User',
        email: 'viztr@local.dev',
        flags: {},
        plan: { id: 1, type: 'individual', billing: 'free' },
        locale: 'en'
    });
});

// Storage routes (stubs)
router.get('/store', (req, res) => res.json([]));
router.get('/store/:id', (req, res) => res.json({ id: req.params.id, name: 'N/A' }));

// Activity, collaborators (stubs)
router.get('/projects/:id/activity', (req, res) => res.json([]));
router.get('/projects/:id/collaborators', (req, res) => {
    res.json([{ id: 1, username: 'viztr-user', access_level: 'admin' }]);
});

// Scene CRUD
router.post('/scenes', (req, res) => {
    res.status(201).json({ id: crypto.randomUUID(), ...req.body });
});

router.put('/scenes/:id', (req, res) => {
    res.json({ id: req.params.id, ...req.body });
});

// Branch CRUD
router.post('/branches', (req, res) => {
    res.status(201).json({ id: 'main', ...req.body });
});

// Checkpoint CRUD
router.post('/checkpoints', (req, res) => {
    res.status(201).json({ id: crypto.randomUUID(), ...req.body, createdAt: new Date().toISOString() });
});

// Upload stubs
router.post('/upload', (req, res) => res.json({ uploadId: 'local', key: `local/${Date.now()}` }));
router.post('/upload/signed', (req, res) => res.json({ signedUrls: [] }));

// Jobs
router.get('/jobs/:id', (req, res) => res.json({ id: req.params.id, status: 'complete', progress: 100 }));

// Star/watch
router.post('/star', (req, res) => res.json({ id: 'star-1' }));
router.delete('/star/:id', (req, res) => res.json({ ok: true }));
router.post('/watch', (req, res) => res.json({ id: 'watch-1' }));

export default router;
