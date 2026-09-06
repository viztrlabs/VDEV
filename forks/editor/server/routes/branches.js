import { Router } from 'express';
import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

const router = Router();
const dataDir = join(import.meta.dirname, '..', 'data', 'projects');

// Create branch
router.post('/branches', (req, res) => {
    const { name, projectId, sourceBranchId, sourceCheckpointId } = req.body;
    const branchId = name || randomUUID().slice(0, 8);

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

// Checkout branch (stub)
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
