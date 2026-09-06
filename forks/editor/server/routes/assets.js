import { Router } from 'express';
import multer from 'multer';
import { existsSync, readFileSync, writeFileSync, readdirSync, unlinkSync, renameSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

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
    const files = readdirSync(assetDir).filter(f => f.startsWith(req.params.id));
    const file = files.find(f => f === req.params.name || f.endsWith(`-${req.params.name}`));
    if (!file) {
        return res.status(404).send('File not found');
    }
    res.sendFile(join(assetDir, file));
});

// Create asset (multipart upload)
router.post('/assets', upload.single('file'), (req, res) => {
    try {
        const { projectId, type, name, branchId, data: assetData, meta, tags } = req.body;
        const assetId = randomUUID();

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
            renameSync(req.file.path, destPath);
            metadata.file = `${assetId}.${ext}`;
            writeFileSync(join(assetDir, `${assetId}.json`), JSON.stringify(metadata, null, 2));
        }

        res.status(201).json(metadata);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
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
        files.forEach(f => {
            try { unlinkSync(join(assetDir, f)); } catch (e) {}
        });
    }

    res.json({ ok: true });
});

export default router;
