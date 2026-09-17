'use client';

import { useEffect, useRef } from 'react';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { useAppStore } from '@/lib/store';

// Real-time subscription manager for all dashboards (browser-safe: anon key only).
type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface SubscriptionConfig {
  table: string;
  event: RealtimeEvent;
  filter?: string;
  callback: (payload: any) => void;
}

// Lazy browser client — never touches the service-role key.
let browserClient: SupabaseClient | null | undefined;
function getBrowserClient(): SupabaseClient | null {
  if (browserClient !== undefined) return browserClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey || anonKey === '[SENSITIVE]') {
    browserClient = null;
    return null;
  }
  try {
    browserClient = createClient(url, anonKey);
  } catch {
    browserClient = null;
  }
  return browserClient;
}

// Push a postgres_changes payload into the canonical app store slices.
function applyRealtimePayload(table: string, payload: any): void {
  const store = useAppStore.getState();
  const eventType = payload?.eventType as string | undefined;
  const row = payload?.new ?? payload?.old;
  if (!row) return;

  const isDelete = eventType === 'DELETE';
  switch (table) {
    case 'projects':
      if (isDelete) {
        store.setProjects(store.projects.filter((p) => p.id !== row.id));
      } else {
        store.upsertProject(row);
      }
      break;
    case 'experiences':
      if (isDelete) {
        store.setExperiences(store.experiences.filter((e) => e.id !== row.id));
      } else {
        store.upsertExperience(row);
      }
      break;
    case 'assets':
      if (isDelete) {
        store.setAssets(store.assets.filter((a) => a.id !== row.id));
      } else {
        store.setAssets([row, ...store.assets.filter((a) => a.id !== row.id)]);
      }
      break;
    case 'deliverables':
      if (isDelete) {
        store.setDeliverables(store.deliverables.filter((d) => d.id !== row.id));
      } else {
        store.setDeliverables([row, ...store.deliverables.filter((d) => d.id !== row.id)]);
      }
      break;
    case 'activity_logs':
      if (!isDelete && payload?.new) store.addActivity(payload.new);
      break;
    case 'feedback':
      if (!isDelete && payload?.new) store.addFeedback(payload.new);
      break;
    default:
      break;
  }
}

// React hook for real-time subscriptions with polling fallback.
export function useRealtime(
  table: string,
  callback: (payload: any) => void,
  event: RealtimeEvent = '*',
  filter?: string
): { isConnected: boolean; error: string | null } {
  const channelRef = useRef<{ unsubscribe: () => void } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const client = getBrowserClient();
    if (!client) return;

    const handler = (payload: any) => {
      applyRealtimePayload(table, payload);
      callbackRef.current(payload);
    };

    const channel = client
      .channel(`realtime:${table}:${filter ?? 'all'}`)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          ...(filter ? { filter } : {}),
        },
        handler
      )
      .subscribe();
    channelRef.current = { unsubscribe: () => void client.removeChannel(channel) };

    // Polling fallback (30s) for when the WebSocket is unavailable.
    const poll = async () => {
      try {
        const { data, error } = await client
          .from(table)
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(50);
        if (!error && data) {
          callbackRef.current({ type: 'POLL', data });
        }
      } catch (err) {
        console.warn(`[Realtime] Polling failed for ${table}:`, err);
      }
    };
    pollRef.current = setInterval(poll, 30000);

    return () => {
      channelRef.current?.unsubscribe();
      channelRef.current = null;
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [table, event, filter]);

  return { isConnected: getBrowserClient() !== null, error: null };
}

// Specific hooks for dashboard data (filter format: `project_id=eq.<id>`).
export function useProjectRealtime(projectId: string, onUpdate: (data: any) => void) {
  return useRealtime('projects', onUpdate, '*', `id=eq.${projectId}`);
}

export function useExperienceRealtime(projectId: string, onUpdate: (data: any) => void) {
  return useRealtime('experiences', onUpdate, '*', `project_id=eq.${projectId}`);
}

export function useAssetRealtime(projectId: string, onUpdate: (data: any) => void) {
  return useRealtime('assets', onUpdate, '*', `project_id=eq.${projectId}`);
}

export function useActivityRealtime(projectId: string, onUpdate: (data: any) => void) {
  return useRealtime('activity_logs', onUpdate, '*', `project_id=eq.${projectId}`);
}

export function useDeliverableRealtime(projectId: string, onUpdate: (data: any) => void) {
  return useRealtime('deliverables', onUpdate, '*', `project_id=eq.${projectId}`);
}

export function useFeedbackRealtime(projectId: string, onUpdate: (data: any) => void) {
  return useRealtime('feedback', onUpdate, '*', `project_id=eq.${projectId}`);
}

// Dashboard-level hook: subscribes to every operational table.
export function useAdminRealtime(onUpdate: (table: string, data: any) => void) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    const client = getBrowserClient();
    if (!client) return;

    const tables = ['projects', 'experiences', 'assets', 'deliverables', 'activity_logs', 'feedback'];
    const channels = tables.map((table) =>
      client
        .channel(`realtime:admin:${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
          applyRealtimePayload(table, payload);
          onUpdateRef.current(table, payload);
        })
        .subscribe()
    );

    return () => {
      channels.forEach((channel) => void client.removeChannel(channel));
    };
  }, []);

  return { isConnected: getBrowserClient() !== null };
}
