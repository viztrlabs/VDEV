import { Router } from 'express';
import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

const router = Router();
const dataDir = join(import.meta.dirname, '..', 'data', 'projects');

// Create checkpoint (snapshot)
router.post('/checkpoints', (req, res) => {
    const { projectId, branchId, description } = req.body;
    const checkpointId = randomUUID();

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
