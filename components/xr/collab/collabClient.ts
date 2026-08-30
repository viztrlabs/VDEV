// Collaboration Systems — real-time presence + multi-user editing
// Transport-agnostic realtime client. Uses a WebSocket endpoint (configurable)
// with a graceful in-memory fallback when no server is reachable so the UI
// always functions offline.

export type PresenceStatus = 'online' | 'idle' | 'editing' | 'offline';

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  status: PresenceStatus;
  cursor?: { x: number; y: number; sceneId?: string };
  lastSeen: number;
}

export interface EditOp {
  id: string;
  authorId: string;
  type: 'create' | 'update' | 'delete' | 'move';
  entityId: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

export type CollabEvent =
  | { kind: 'presence'; collaborator: Collaborator }
  | { kind: 'presence-leave'; id: string }
  | { kind: 'edit'; op: EditOp }
  | { kind: 'cursor'; id: string; x: number; y: number; sceneId?: string }
  | { kind: 'sync-request'; id: string }
  | { kind: 'sync-state'; state: unknown };

export type CollabListener = (event: CollabEvent) => void;

export interface CollabClientOptions {
  url?: string;
  userId: string;
  userName: string;
  userColor?: string;
  reconnect?: boolean;
}

const PALETTE = ['#3ECF8E', '#6366F1', '#F59E0B', '#EC4899', '#06B6D4', '#A855F7'];

function pickColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

/**
 * Minimal collaboration client. Connects over WebSocket if `url` is provided,
 * otherwise operates locally (single-user with echo) so components can be built
 * and tested without a backend.
 */
export class CollabClient {
  private ws: WebSocket | null = null;
  private listeners = new Set<CollabListener>();
  private collaborators = new Map<string, Collaborator>();
  private opts: CollabClientOptions;
  private self: Collaborator;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connected = false;

  constructor(opts: CollabClientOptions) {
    this.opts = opts;
    this.self = {
      id: opts.userId,
      name: opts.userName,
      color: opts.userColor ?? pickColor(opts.userId),
      status: 'online',
      lastSeen: Date.now(),
    };
    this.collaborators.set(this.self.id, { ...this.self });
    if (opts.url) this.connect();
  }

  private connect() {
    if (!this.opts.url) return;
    try {
      this.ws = new WebSocket(this.opts.url);
      this.ws.onopen = () => {
        this.connected = true;
        // Register with the server using the client protocol.
        this.send({ kind: 'presence', collaborator: this.self });
      };
      this.ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data) as CollabEvent;
          this.dispatch(data);
        } catch {
          /* ignore malformed */
        }
      };
      this.ws.onclose = () => {
        this.connected = false;
        if (this.opts.reconnect && !this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => this.connect(), 3000);
        }
      };
      this.ws.onerror = () => this.ws?.close();
    } catch {
      this.connected = false;
    }
  }

  private send(event: CollabEvent) {
    if (this.ws && this.connected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    }
  }

  private dispatch(event: CollabEvent) {
    // maintain local roster
    if (event.kind === 'presence') {
      this.collaborators.set(event.collaborator.id, {
        ...event.collaborator,
        lastSeen: Date.now(),
      });
    } else if (event.kind === 'presence-leave') {
      this.collaborators.delete(event.id);
    } else if (event.kind === 'cursor') {
      const c = this.collaborators.get(event.id);
      if (c) {
        c.cursor = { x: event.x, y: event.y, sceneId: event.sceneId };
        c.lastSeen = Date.now();
      }
    }
    this.listeners.forEach((l) => l(event));
  }

  /** Subscribe to collaboration events. Returns an unsubscribe fn. */
  subscribe(listener: CollabListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getCollaborators(): Collaborator[] {
    return Array.from(this.collaborators.values());
  }

  /** Public accessor for the local user's own collaborator record. */
  getSelf(): Collaborator {
    return { ...this.self };
  }

  updateStatus(status: PresenceStatus) {
    this.self = { ...this.self, status, lastSeen: Date.now() };
    this.collaborators.set(this.self.id, { ...this.self });
    this.send({ kind: 'presence', collaborator: this.self });
    this.listeners.forEach((l) =>
      l({ kind: 'presence', collaborator: { ...this.self } })
    );
  }

  updateCursor(x: number, y: number, sceneId?: string) {
    this.self.cursor = { x, y, sceneId };
    this.send({ kind: 'cursor', id: this.self.id, x, y, sceneId });
  }

  /** Broadcast an edit with last-writer-wins merge semantics. */
  applyEdit(op: Omit<EditOp, 'id' | 'authorId' | 'timestamp'>) {
    const full: EditOp = {
      ...op,
      id: `${this.self.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      authorId: this.self.id,
      timestamp: Date.now(),
    };
    this.send({ kind: 'edit', op: full });
    this.listeners.forEach((l) => l({ kind: 'edit', op: full }));
    return full;
  }

  requestSync() {
    this.send({ kind: 'sync-request', id: this.self.id });
  }

  isConnected() {
    return this.connected;
  }

  dispose() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.listeners.clear();
    this.collaborators.clear();
  }
}

export function createCollabClient(opts: CollabClientOptions) {
  return new CollabClient(opts);
}
