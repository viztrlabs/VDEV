'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  CollabClient,
  Collaborator,
  CollabEvent,
  createCollabClient,
  EditOp,
  PresenceStatus,
} from './collabClient';

interface CollabContextValue {
  client: CollabClient;
  collaborators: Collaborator[];
  self: Collaborator;
  connected: boolean;
  setStatus: (s: PresenceStatus) => void;
  updateCursor: (x: number, y: number, sceneId?: string) => void;
  applyEdit: (op: Omit<EditOp, 'id' | 'authorId' | 'timestamp'>) => EditOp;
  requestSync: () => void;
}

const CollabContext = createContext<CollabContextValue | null>(null);

export function CollabProvider({
  children,
  url,
  userId,
  userName,
  userColor,
}: {
  children: React.ReactNode;
  url?: string;
  userId: string;
  userName: string;
  userColor?: string;
}) {
  const clientRef = useRef<CollabClient | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [connected, setConnected] = useState(false);
  const [self, setSelf] = useState<Collaborator | null>(null);

  // Resolve the collaboration WebSocket URL (explicit prop wins; otherwise ask
  // the API which exposes the running collab server). The client only connects
  // once we have a URL so SSR/first paint stays safe.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let resolved = url;
      if (!resolved) {
        try {
          const res = await fetch('/api/collab');
          const data = await res.json();
          resolved = data.url;
        } catch {
          resolved = undefined;
        }
      }
      if (cancelled) return;
      clientRef.current = createCollabClient({ url: resolved, userId, userName, userColor });
      setSelf(clientRef.current.getSelf());
    })();
    return () => {
      cancelled = true;
      clientRef.current?.dispose();
      clientRef.current = null;
    };
  }, [url, userId, userName, userColor]);

  useEffect(() => {
    const client = clientRef.current;
    if (!client) return;
    const unsub = client.subscribe((event: CollabEvent) => {
      if (event.kind === 'presence' || event.kind === 'presence-leave' || event.kind === 'cursor') {
        setCollaborators(client.getCollaborators());
      }
      if (event.kind === 'presence' && event.collaborator.id === client.getSelf().id) {
        setSelf({ ...event.collaborator });
      }
    });
    const interval = setInterval(() => {
      setConnected(client.isConnected());
      setCollaborators(client.getCollaborators());
    }, 1500);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const value = useMemo<CollabContextValue>(
    () => ({
      client: clientRef.current!,
      collaborators,
      self: self!,
      connected,
      setStatus: (s) => clientRef.current!.updateStatus(s),
      updateCursor: (x, y, sceneId) => clientRef.current!.updateCursor(x, y, sceneId),
      applyEdit: (op) => clientRef.current!.applyEdit(op),
      requestSync: () => clientRef.current!.requestSync(),
    }),
    [collaborators, self, connected]
  );

  return <CollabContext.Provider value={value}>{children}</CollabContext.Provider>;
}

export function useCollab(): CollabContextValue {
  const ctx = useContext(CollabContext);
  if (!ctx) throw new Error('useCollab must be used within <CollabProvider>');
  return ctx;
}

export default CollabProvider;
