import { WebSocketServer } from 'ws';

export function setupMessenger(server) {
    const wss = new WebSocketServer({ noServer: true, perMessageDeflate: false });

    server.on('upgrade', (request, socket, head) => {
        const url = new URL(request.url, 'http://localhost');
        if (url.pathname === '/ws/messenger') {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        }
    });

    wss.on('connection', (ws) => {
        console.log('[Messenger] Client connected');
        ws.on('message', (rawData) => {
            try {
                const msg = JSON.parse(rawData.toString());
                if (msg.name === 'authenticate') {
                    ws.send(JSON.stringify({ name: 'welcome' }));
                    return;
                }
            } catch (e) {}
        });
        ws.on('close', () => {
            console.log('[Messenger] Client disconnected');
        });
    });

    return wss;
}
