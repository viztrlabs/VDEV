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
import apiProxyRouter from './routes/api-proxy.js';

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

app.use(express.static(join(__dirname, '..', 'dist')));

// Serve PlayCanvas engine from forks/engine/build
const engineDir = join(__dirname, '..', '..', 'engine', 'build');
app.get('/engine', (req, res) => {
    const enginePath = join(engineDir, 'playcanvas.mjs');
    if (existsSync(enginePath)) {
        res.setHeader('Content-Type', 'application/javascript');
        res.sendFile(enginePath);
    } else {
        res.status(404).send('Engine not built. Run: cd forks/engine && npm run build');
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

app.get('/editor/project/:id', async (req, res) => {
    const config = await generateConfig(req.params.id);
    if (!config.project?.id) return res.status(404).send('Project not found');
    const template = readFileSync(join(__dirname, 'templates', 'editor.html'), 'utf-8');
    const html = template.replace('__CONFIG__', JSON.stringify(config));
    res.send(html);
});

app.use('/api', apiProxyRouter);

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

// Setup realtime handlers inline
realtimeWss.on('connection', (ws, req) => {
    console.log('[Realtime] Client connected');
    let authenticated = false;
    ws.on('message', (rawData) => {
        try {
            const msg = JSON.parse(rawData.toString());
            if (msg.name === 'auth' || msg.accessToken) {
                authenticated = true;
                ws.send(JSON.stringify({ name: 'auth', ok: true }));
                return;
            }
            if (!authenticated) {
                ws.send(JSON.stringify({ error: 'Not authenticated' }));
                return;
            }
            if (msg.a === 'hs') {
                ws.send(JSON.stringify({ a: 'hs', protocol: 1 }));
            } else if (msg.a === 's') {
                ws.send(JSON.stringify({ a: 's', c: msg.c, d: msg.d, data: null }));
            } else if (msg.a === 'op') {
                ws.send(JSON.stringify({ a: 'ack', src: msg.src }));
            }
        } catch (e) {
            console.error('[Realtime] Parse error:', e.message);
        }
    });
    ws.on('error', (err) => console.error('[Realtime] Error:', err.message));
    ws.on('close', () => console.log('[Realtime] Disconnected'));
});

messengerWss.on('connection', (ws) => {
    console.log('[Messenger] Client connected');
    ws.on('message', (rawData) => {
        try {
            const msg = JSON.parse(rawData.toString());
            if (msg.name === 'authenticate') ws.send(JSON.stringify({ name: 'welcome' }));
        } catch (e) {}
    });
    ws.on('close', () => console.log('[Messenger] Disconnected'));
});

relayWss.on('connection', (ws) => {
    console.log('[Relay] Client connected');
    ws.send(JSON.stringify({ t: 'welcome', userId: 1 }));
    ws.on('message', (rawData) => {
        try {
            const msg = JSON.parse(rawData.toString());
            if (msg.t === 'room:join') ws.send(JSON.stringify({ t: 'room:joined', name: msg.name }));
        } catch (e) {}
    });
    ws.on('close', () => console.log('[Relay] Disconnected'));
});

server.listen(PORT, () => {
    console.log(`VizTR Editor running at http://localhost:${PORT}`);
});
