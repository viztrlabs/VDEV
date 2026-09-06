import { WebSocketServer } from 'ws';

export function setupRealtime(server) {
    const wss = new WebSocketServer({ noServer: true, perMessageDeflate: false });

    server.on('upgrade', (request, socket, head) => {
        const url = new URL(request.url, 'http://localhost');
        if (url.pathname === '/ws/realtime') {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        } else {
            socket.destroy();
        }
    });

    wss.on('connection', (ws, req) => {
        console.log('[Realtime] Client connected from', req.socket.remoteAddress);
        let authenticated = false;

        ws.on('message', (rawData) => {
            const text = rawData.toString();
            try {
                const msg = JSON.parse(text);
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

        ws.on('error', (err) => {
            console.error('[Realtime] Error:', err.message);
        });

        ws.on('close', (code) => {
            console.log('[Realtime] Disconnected, code:', code);
        });
    });

    return wss;
}
