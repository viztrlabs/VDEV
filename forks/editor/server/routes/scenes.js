import { Router } from 'express';
import { existsSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

const router = Router();
const dataDir = join(import.meta.dirname, '..', 'data', 'projects');

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

// Get scene by ID
router.get('/scenes/:id', (req, res) => {
    const projectId = req.query.projectId;
    if (!projectId) {
        return res.status(400).json({ error: 'projectId required' });
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
    const sceneId = randomUUID();

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

export default router;
