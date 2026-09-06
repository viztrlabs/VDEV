import { Router } from 'express';

const router = Router();

// User stubs
router.get('/users/:id', (req, res) => {
    res.json({
        id: 1,
        username: 'viztr-user',
        email: 'viztr@localhost',
        flags: {
            openedEditor: true,
            superUser: true,
            tips: {
                hierarchy: true,
                assets: true,
                store: true,
                dashboard: true,
                entityInspector: true,
                soundComponent: true,
                mainMenu: true,
                controls: true,
                launch: true,
                howdoi: true
            }
        },
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

// Upload stubs
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

// Diff/Merge/Conflicts stubs
router.post('/diff', (req, res) => res.json({ id: 'diff-1', status: 'complete' }));
router.get('/diff/:id', (req, res) => res.json({ id: req.params.id, status: 'complete', data: [] }));
router.post('/merge', (req, res) => res.json({ id: 'merge-1', status: 'complete' }));
router.get('/merge/:id', (req, res) => res.json({ id: req.params.id, status: 'complete' }));
router.delete('/merge/:id', (req, res) => res.json({ ok: true }));
router.post('/merge/:id/apply', (req, res) => res.json({ ok: true }));
router.post('/conflicts/resolve', (req, res) => res.json({ ok: true }));

export default router;
