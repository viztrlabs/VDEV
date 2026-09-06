import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local from project root
dotenv.config({ path: join(__dirname, '..', '..', '..', '.env.local') });

import express from 'express';
import { createServer } from 'http';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { WebSocketServer } from 'ws';
import { generateConfig } from './config.js';
import { setupShareDB } from './websocket/sharedb.js';
import { handleMessengerConnection } from './websocket/messenger.js';
import { handleRelayConnection } from './websocket/relay.js';
import { getSupabase } from './supabase-client.js';
import projectsRouter from './routes/real-api/projects.js';
import scenesRouter from './routes/real-api/scenes.js';
import assetsRouter from './routes/real-api/assets.js';
import branchesRouter from './routes/real-api/branches.js';
import mockRouter from './routes/mock/index.js';

const app = express();
const PORT = 3487;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.use((req, res, next) => {
    if (!req.url.startsWith('/editor/scene/img') && !req.url.startsWith('/css') && !req.url.startsWith('/static')) {
        console.log('[HTTP]', req.method, req.url);
    }
    next();
});

app.use(express.static(join(__dirname, '..', 'dist')));
app.use('/editor/scene/js', express.static(join(__dirname, '..', 'dist', 'js')));
app.use('/launch/js', express.static(join(__dirname, '..', 'dist', 'js')));

app.get(['/url-map.sw.js', '/js/url-map.sw.js', '/editor/scene/js/url-map.sw.js', '/launch/js/url-map.sw.js'], (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Service-Worker-Allowed', '/');
    res.sendFile(join(__dirname, '..', 'dist', 'js', 'url-map.sw.js'));
});

// Entity icons route
const entityIconsDir = join(__dirname, '..', '..', 'developer-site', 'build', 'img', 'user-manual', 'editor', 'viewport', 'entity-icons');
app.use('/editor/scene/img/entity-icons', express.static(entityIconsDir));
const transparentPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
app.get('/editor/scene/img/entity-icons/:name', (req, res) => {
    res.setHeader('Content-Type', 'image/png');
    res.send(transparentPixel);
});

// Serve PlayCanvas engine from forks/engine/build
const engineDir = join(__dirname, '..', '..', 'engine', 'build');
app.get('/engine', (req, res) => {
    const enginePath = join(engineDir, 'playcanvas.js');
    if (existsSync(enginePath)) {
        res.setHeader('Content-Type', 'application/javascript');
        res.sendFile(enginePath);
    } else {
        res.status(404).send('Engine not built. Run: cd forks/engine && npm run build');
    }
});

app.get('/engine.d.ts', (req, res) => {
    const dtsPath = join(engineDir, 'playcanvas.d.ts');
    if (existsSync(dtsPath)) {
        res.setHeader('Content-Type', 'text/plain');
        res.sendFile(dtsPath);
    } else {
        res.status(404).send('Not found');
    }
});

// Serve engine for legacy paths
app.get('/engine/playcanvas.js', (req, res) => {
    const enginePath = join(engineDir, 'playcanvas.js');
    if (existsSync(enginePath)) {
        res.setHeader('Content-Type', 'application/javascript');
        res.sendFile(enginePath);
    } else {
        res.status(404).send('Engine not built');
    }
});

// Viewer route for Gaussian Splat and project preview
app.get('/viewer/project/:id', async (req, res) => {
    const config = await generateConfig(req.params.id);
    if (!config.project?.id) return res.status(404).send('Project not found');
    const template = readFileSync(join(__dirname, 'templates', 'editor.html'), 'utf-8');
    const html = template.replace('__CONFIG__', JSON.stringify({ ...config, mode: 'viewer' }));
    res.send(html);
});

const dataDir = join(__dirname, 'data', 'projects');
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

app.get('/', (req, res) => {
    const template = readFileSync(join(__dirname, 'templates', 'blank.html'), 'utf-8');
    res.send(template);
});

// Editor HTML served directly from editor server with config injection
app.get('/editor/project/:id', async (req, res) => {
    try {
        const config = await generateConfig(req.params.id);
        if (!config.project?.id) return res.status(404).send('Project not found');
        const template = readFileSync(join(__dirname, 'templates', 'editor.html'), 'utf-8');
        const html = template.replace('__CONFIG__', JSON.stringify(config));
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (err) {
        console.error('[Editor] Error:', err.message);
        res.status(500).send('Internal error');
    }
});

app.get('/editor/scene/:id', async (req, res) => {
    try {
        const supabase = getSupabase();
        let projectId = 1;
        if (supabase) {
            const { data: scenes } = await supabase
                .from('editor_scenes')
                .select('project_id')
                .or(`id.eq.${req.params.id},unique_id.eq.${req.params.id}`);
            if (scenes && scenes[0]) {
                projectId = scenes[0].project_id;
            }
        }
        const config = await generateConfig(projectId);
        if (!config.project?.id) return res.status(404).send('Project not found');
        const template = readFileSync(join(__dirname, 'templates', 'editor.html'), 'utf-8');
        const html = template.replace('__CONFIG__', JSON.stringify(config));
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (err) {
        console.error('[Editor] Error:', err.message);
        res.status(500).send('Internal error');
    }
});

// Launch runtime page — executes scene in installed PlayCanvas engine
const handleLaunchRoute = async (req, res) => {
    try {
        const supabase = getSupabase();
        let projectId = 1;
        let sceneId = req.params.id;
        if (supabase && sceneId) {
            const { data: scenes } = await supabase
                .from('editor_scenes')
                .select('*')
                .or(`id.eq.${sceneId},unique_id.eq.${sceneId}`);
            if (scenes && scenes[0]) {
                projectId = scenes[0].project_id;
                sceneId = scenes[0].unique_id || scenes[0].id;
            }
        }
        const config = await generateConfig(projectId);
        if (config && config.scene && sceneId) {
            config.scene.id = sceneId;
            config.scene.uniqueId = sceneId;
        }
        const template = readFileSync(join(__dirname, 'templates', 'launch.html'), 'utf-8');
        const html = template.replace('__CONFIG__', JSON.stringify(config));
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (err) {
        console.error('[Launch] Error:', err.message);
        res.status(500).send('Internal error');
    }
};

app.get('/launch/:id', handleLaunchRoute);
app.get('/launch', handleLaunchRoute);

// Mock catch-all FIRST — real API routes below override specific endpoints
app.use('/api', mockRouter);

// Real API routes (Supabase-backed) — override mock for CRUD endpoints
app.use('/api/projects', projectsRouter);
app.use('/api/scenes', scenesRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/branches', branchesRouter);

app.use((err, req, res, next) => {
    console.error('[Error]', err.message);
    res.status(500).json({ error: err.message });
});

const server = createServer(app);

// WebSocket servers with noServer
const realtimeWss = new WebSocketServer({ noServer: true, perMessageDeflate: false });
const messengerWss = new WebSocketServer({ noServer: true, perMessageDeflate: false });
const relayWss = new WebSocketServer({ noServer: true, perMessageDeflate: false });

const wsRoutes = {
    '/ws/realtime': realtimeWss,
    '/ws/messenger': messengerWss,
    '/ws/relay': relayWss
};

// Single upgrade handler — routes to correct WS server
server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url, 'http://localhost');
    const wss = wsRoutes[url.pathname];
    if (wss) {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
});

// Setup ShareDB realtime handler
const defaultConfig = {
    accessToken: 'local-dev-token',
    project: { id: 1 },
};
const shareDB = setupShareDB(defaultConfig);

realtimeWss.on('connection', (ws, req) => {
    console.log('[Realtime] Client connected, port:', req?.socket?.remotePort);

    // Handle auth before ShareDB takes over the socket
    const onFirstMessage = (rawData) => {
        const msg = rawData.toString();
        console.log('[Realtime] First message:', msg);
        if (msg.startsWith('auth')) {
            ws.removeListener('message', onFirstMessage);
            ws.send('auth');

            // Now hand the socket to ShareDB
            shareDB.handleConnection(ws);
        }
    };
    ws.on('message', onFirstMessage);
    ws.on('close', (code, reason) => console.log('[Realtime] Disconnected, code:', code, 'reason:', reason?.toString()));
});

messengerWss.on('connection', handleMessengerConnection);
relayWss.on('connection', handleRelayConnection);

server.listen(PORT, () => {
    console.log(`VizTR Editor running at http://localhost:${PORT}`);
});
