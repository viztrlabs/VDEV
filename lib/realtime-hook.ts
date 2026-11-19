/**
 * useRealtime - Supabase Realtime subscription hook for dashboard sync
 * 
 * Subscribes to postgres_changes events on configured tables and
 * calls a callback when data changes, enabling cross-client sync.
 */

import { useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

type RealtimeCallback = (payload: { table: string; eventType: 'INSERT' | 'UPDATE' | 'DELETE'; record: any; old_record?: any }) => void;

interface UseRealtimeOptions {
  tables: string[];
  callback: RealtimeCallback;
  enabled?: boolean;
}

export function useRealtime({ tables, callback, enabled = true }: UseRealtimeOptions) {
  const channelRef = useRef<any>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || tables.length === 0) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey === '[SENSITIVE]') {
      console.warn('[useRealtime] Supabase not configured — real-time sync disabled');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const channel = supabase.channel('dashboard-realtime');

    tables.forEach((table) => {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload: any) => {
          callbackRef.current({
            table,
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            record: payload.new,
            old_record: payload.old,
          });
        }
      );
    });

    channel
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[useRealtime] Subscribed to real-time updates for tables:', tables);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[useRealtime] Realtime subscription error');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, tables.length]);
}

export default useRealtime;
