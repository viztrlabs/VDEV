import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local from editor-specific directory (NOT root)
// Root secrets must not be loaded by the editor server
const editorEnvPath = join(__dirname, '..', '.env.local');
dotenv.config({ path: editorEnvPath });

// Also load root env for NEXTAUTH_SECRET (needed for JWT validation)
// but do NOT load the full root .env.local which contains all secrets
if (process.env.NEXTAUTH_SECRET) {
    // Already loaded from editor env
} else {
    // Fallback: only load specific needed vars from root
    const rootEnvPath = join(__dirname, '..', '..', '..', '.env.local');
    const rootConfig = dotenv.parse(rootEnvPath);
    if (rootConfig.NEXTAUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
        process.env.NEXTAUTH_SECRET = rootConfig.NEXTAUTH_SECRET;
    }
}

import express from 'express';
import { createServer } from 'http';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { WebSocketServer } from 'ws';
import { generateConfig } from './config.js';
import { setupShareDB } from './websocket/sharedb.js';
import { handleMessengerConnection } from './websocket/messenger.js';
import { handleRelayConnection } from './websocket/relay.js';
import { getSupabase } from './supabase-client.js';
import { requireEditorAuth, validateWsOrigin, extractToken, validateToken, validateLaunchToken } from './auth-middleware.js';
import projectsRouter from './routes/real-api/projects.js';
import scenesRouter from './routes/real-api/scenes.js';
import assetsRouter from './routes/real-api/assets.js';
import branchesRouter from './routes/real-api/branches.js';
import mockRouter from './routes/mock/index.js';
import configSaveRoutes from './routes/config-save.js';

const app = express();
const PORT = 3487;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'http://localhost:3487',
    ];
    const allowed = origin && allowedOrigins.some(o => origin.startsWith(o)) ? origin : allowedOrigins[0];
    res.header('Access-Control-Allow-Origin', allowed);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

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
// SECURITY: Requires authentication to access editor
app.get('/editor/project/:id', requireEditorAuth, async (req, res) => {
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
        const config = await generateConfig(projectId, req.params.id);
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
// SECURITY: All API routes require authentication
app.use('/api', requireEditorAuth, mockRouter);

// Real API routes (Supabase-backed) — override mock for CRUD endpoints
// SECURITY: All API routes require authentication
app.use('/api/projects', requireEditorAuth, projectsRouter);
app.use('/api/scenes', requireEditorAuth, scenesRouter);
app.use('/api/assets', requireEditorAuth, assetsRouter);
app.use('/api/branches', requireEditorAuth, branchesRouter);
app.use('/api/config', configSaveRoutes);

app.use((err, req, res, next) => {
    console.error('[Error]', err.message);
    res.status(500).json({ error: err.message });
});

const server = createServer(app);
server.on('error', (err) => {
    console.error('[HTTP Server Error]', err);
});

// WebSocket servers with noServer
const realtimeWss = new WebSocketServer({ noServer: true, perMessageDeflate: false });
const messengerWss = new WebSocketServer({ noServer: true, perMessageDeflate: false });
const relayWss = new WebSocketServer({ noServer: true, perMessageDeflate: false });

realtimeWss.on('error', (err) => console.warn('[Realtime WSS Error]', err?.message));
messengerWss.on('error', (err) => console.warn('[Messenger WSS Error]', err?.message));
relayWss.on('error', (err) => console.warn('[Relay WSS Error]', err?.message));

const wsRoutes = {
    '/ws/realtime': realtimeWss,
    '/ws/messenger': messengerWss,
    '/ws/relay': relayWss
};

// Single upgrade handler — routes to correct WS server
// SECURITY: Validate origin before allowing WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
    socket.on('error', (err) => {
        console.warn('[Upgrade Socket Error]', err?.message);
    });

    try {
        if (!validateWsOrigin(request)) {
            console.warn('[WS Upgrade] Rejected untrusted origin:', request.headers.origin);
            socket.destroy();
            return;
        }

        const url = new URL(request.url, 'http://localhost');
        const wss = wsRoutes[url.pathname];
        if (wss) {
            const launchToken = url.searchParams.get('token');
            let tokenPayload = null;
            if (launchToken) {
                tokenPayload = validateToken(launchToken) || validateLaunchToken(launchToken);
            }
            wss.handleUpgrade(request, socket, head, (ws) => {
                if (tokenPayload) {
                    ws.viztrUser = {
                        id: tokenPayload.sub || tokenPayload.id || tokenPayload.email,
                        email: tokenPayload.user?.email || tokenPayload.email,
                        role: tokenPayload.user?.role || tokenPayload.role || 'user',
                    };
                }
                wss.emit('connection', ws, request);
            });
        } else {
            socket.destroy();
        }
    } catch (e) {
        try { socket.destroy(); } catch (err) {}
    }
});

// Setup ShareDB realtime handler — loads all projects from Supabase
const shareDB = setupShareDB({});

realtimeWss.on('connection', (ws, req) => {
    console.log('[Realtime] Client connected, port:', req?.socket?.remotePort);

    ws.on('error', (err) => {
        console.warn('[Realtime WS error]', err?.message);
    });

    // Handle auth before ShareDB takes over the socket
    // SECURITY: Validate JWT on first message before allowing ShareDB access
    const onFirstMessage = (rawData) => {
        const msg = rawData.toString();
        console.log('[Realtime] First message:', msg);
        if (msg.startsWith('auth')) {
            ws.removeListener('message', onFirstMessage);

            // SECURITY: Validate JWT from the upgrade request
            const token = extractToken(req);
            const decoded = token ? validateToken(token) : null;

            if (!decoded && process.env.NODE_ENV === 'production') {
                console.warn('[Realtime] Rejected: invalid or missing JWT');
                ws.close(4001, 'Authentication required');
                return;
            }

            if (decoded) {
                console.log('[Realtime] Authenticated user:', decoded.email || decoded.id);
                ws.viztrUser = {
                    id: decoded.id || decoded.sub || decoded.email,
                    email: decoded.email,
                    role: decoded.role || 'user',
                };
            } else {
                console.warn('[Realtime] No JWT — allowing in development mode');
                ws.viztrUser = { id: 'dev-user', role: 'admin' };
            }

            if (ws.readyState === 1) {
                try { ws.send('auth'); } catch (e) {}
            }

            // Now hand the socket to ShareDB
            shareDB.handleConnection(ws);
        }
    };
    ws.on('message', onFirstMessage);
    ws.on('close', (code, reason) => console.log('[Realtime] Disconnected, code:', code, 'reason:', reason?.toString()));
});

messengerWss.on('connection', handleMessengerConnection);
relayWss.on('connection', handleRelayConnection);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`VizTR Editor running at http://localhost:${PORT}`);
    console.log(`Server address:`, server.address());
    console.log(`Server listening:`, server.listening);
    
    // Test connection from within the same process using dynamic import
    import('net').then((net) => {
        const testSocket = net.createConnection(PORT, '127.0.0.1', () => {
            console.log('[Self-Test] Connection successful!');
            testSocket.end();
        });
        testSocket.on('error', (e) => {
            console.error('[Self-Test] Connection failed:', e.message);
        });
    }).catch((e) => {
        console.error('[Self-Test] Import failed:', e.message);
    });
    
    // Additional test: try to connect from a separate process after a delay
    setTimeout(() => {
        import('net').then((net) => {
            const delayedSocket = net.createConnection(PORT, '127.0.0.1', () => {
                console.log('[Delayed Self-Test] Connection successful!');
                delayedSocket.end();
            });
            delayedSocket.on('error', (e) => {
                console.error('[Delayed Self-Test] Connection failed:', e.message);
            });
        });
    }, 1000);
    
    // Keep-alive to prevent process exit
    setInterval(() => {
        console.log(`[Heartbeat] Server listening:`, server.listening, 'connections:', server.connections);
    }, 30000);
});
server.on('error', (err) => {
    console.error('[Server Error]', err);
});
server.on('close', () => {
    console.log('[Server Closed]');
});
// Additional debugging: check server state periodically
setInterval(() => {
    console.log(`[Debug] Server listening:`, server?.listening, 'address:', server?.address());
}, 10000);

process.on('uncaughtException', (err) => {
    console.error('[Editor Server UncaughtException]', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('[Editor Server UnhandledRejection]', reason);
});
