// Real-time Collaboration WebSocket server for VizTR XR World.
// Run with:  node scripts/collab-server.mjs   (or via `pnpm collab`)
//
// Protocol (JSON frames):
//   client -> server: { type: 'join', user: { id, name, color } }
//                     { type: 'cursor', x, y, z? }
//                     { type: 'edit', target, payload }
//   server -> client: { type: 'presence', users: Collaborator[] }
//                     { type: 'cursor', user, x, y, z? }
//                     { type: 'edit', user, target, payload }
//
// Presence is broadcast to every connected client on join/leave/cursor/edit.

import { WebSocketServer } from 'ws';

const PORT = Number(process.env.COLLAB_PORT || 4000);
const wss = new WebSocketServer({ port: PORT });

/** @type {Map<import('ws').WebSocket, object>} */
const clients = new Map();

const PALETTE = ['#3ECF8E', '#6366F1', '#F59E0B', '#EC4899', '#06B6D4', '#A855F7'];

function broadcastPresence() {
  const users = [...clients.values()].map((u) => ({
    id: u.id,
    name: u.name,
    color: u.color,
    status: u.status,
    cursor: u.cursor || null,
  }));
  const msg = JSON.stringify({ type: 'presence', users });
  for (const ws of clients.keys()) {
    if (ws.readyState === ws.OPEN) ws.send(msg);
  }
}

function send(ws, obj) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj));
}

wss.on('connection', (ws) => {
  const color = PALETTE[clients.size % PALETTE.length];
  const user = { id: `u_${Math.random().toString(36).slice(2, 8)}`, name: 'Guest', color, status: 'active', cursor: null };
  clients.set(ws, user);

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }
    const me = clients.get(ws);
    if (!me) return;

    // The client speaks a { kind, ... } protocol:
    //   'presence'  -> register/update this user (sent on join + status change)
    //   'cursor'    -> update this user's cursor position
    //   'edit'      -> broadcast an edit op to peers
    switch (msg.kind) {
      case 'presence': {
        const c = msg.collaborator;
        if (c?.name) me.name = String(c.name).slice(0, 40);
        if (c?.color) me.color = c.color;
        if (c?.status) me.status = c.status;
        me.cursor = c?.cursor ?? me.cursor;
        broadcastPresence();
        break;
      }
      case 'cursor': {
        me.cursor = { x: msg.x ?? 0, y: msg.y ?? 0, sceneId: msg.sceneId };
        const out = JSON.stringify({
          kind: 'cursor',
          id: me.id,
          x: me.cursor.x,
          y: me.cursor.y,
          sceneId: me.cursor.sceneId,
        });
        for (const c of clients.keys()) if (c !== ws && c.readyState === c.OPEN) c.send(out);
        break;
      }
      case 'edit': {
        const op = msg.op ?? msg;
        const out = JSON.stringify({
          kind: 'edit',
          op: { ...op, authorId: op.authorId ?? me.id },
        });
        for (const c of clients.keys()) if (c !== ws && c.readyState === c.OPEN) c.send(out);
        break;
      }
      default:
        break;
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    broadcastPresence();
  });

  ws.on('error', () => { clients.delete(ws); });
});

console.log(`[collab] WebSocket server listening on ws://localhost:${PORT}`);
