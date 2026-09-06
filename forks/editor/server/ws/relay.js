import { WebSocketServer } from 'ws';

export function setupRelay(server) {
    const wss = new WebSocketServer({ noServer: true, perMessageDeflate: false });

    server.on('upgrade', (request, socket, head) => {
        const url = new URL(request.url, 'http://localhost');
        if (url.pathname === '/ws/relay') {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        }
    });

    wss.on('connection', (ws) => {
        console.log('[Relay] Client connected');
        ws.send(JSON.stringify({ t: 'welcome', userId: 1 }));
        ws.on('message', (rawData) => {
            try {
                const msg = JSON.parse(rawData.toString());
                if (msg.t === 'room:join') {
                    ws.send(JSON.stringify({ t: 'room:joined', name: msg.name }));
                }
            } catch (e) {}
        });
        ws.on('close', () => {
            console.log('[Relay] Client disconnected');
        });
    });

    return wss;
}
