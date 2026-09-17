import { getSupabaseAdmin } from '@/lib/supabase-admin';

// Real-time subscription manager for all dashboards
interface SubscriptionConfig {
  table: string;
  event: 'UPDATE' | 'INSERT' | 'DELETE' | '*';
  filter?: string;
  callback: (payload: any) => void;
}

class RealtimeManager {
  private static instance: RealtimeManager;
  private channels: Map<string, any> = new Map();
  private supabase: any;
  private isConnected: boolean = false;
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager();
    }
    return RealtimeManager.instance;
  }

  initialize(): void {
    if (this.initialized) return;
    const supabase = getSupabaseAdmin();
    if (!supabase) return;

    this.supabase = supabase;
    this.isConnected = true;
    this.initialized = true;
  }

  subscribe(config: SubscriptionConfig): string {
    if (!this.isConnected || !this.supabase) return '';

    const channelId = `${config.table}_${config.event}_${Date.now()}`;
    const channel = this.supabase
      .channel(`realtime:${config.table}`)
      .on(
        'postgres_changes',
        {
          event: config.event,
          schema: 'public',
          table: config.table,
          filter: config.filter,
        },
        (payload: any) => {
          config.callback(payload);
        }
      )
      .subscribe();

    this.channels.set(channelId, channel);
    return channelId;
  }

  unsubscribe(channelId: string): void {
    const channel = this.channels.get(channelId);
    if (channel) {
      this.supabase.removeChannel(channel);
      this.channels.delete(channelId);
    }
  }

  unsubscribeAll(): void {
    this.channels.forEach((channel) => {
      this.supabase.removeChannel(channel);
    });
    this.channels.clear();
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Fallback polling for when WebSocket is unavailable
  startPolling(table: string, callback: (data: any[]) => void, intervalMs: number = 30000): ReturnType<typeof setInterval> {
    const poll = async () => {
      try {
        if (!this.supabase) return;
        const { data, error } = await this.supabase
          .from(table)
          .select('*')
          .order('updated_at', { ascending: false });
        if (!error && data) {
          callback(data);
        }
      } catch (err) {
        console.warn(`[Realtime] Polling failed for ${table}:`, err);
      }
    };

    poll();
    return setInterval(poll, intervalMs);
  }
}

// React hook for real-time subscriptions
export function useRealtime(
  table: string,
  callback: (payload: any) => void,
  event: 'UPDATE' | 'INSERT' | 'DELETE' | '*' = '*',
  filter?: string
): { isConnected: boolean; error: string | null } {
  // Initialize the real-time manager
  const manager = RealtimeManager.getInstance();
  if (!manager.getConnectionStatus()) {
    manager.initialize();
  }

  // Subscribe to Supabase Realtime
  const channelId = manager.subscribe({
    table,
    event,
    filter,
    callback,
  });

  // Start polling as fallback
  const pollTimer = manager.startPolling(table, (data) => {
    callback({ type: 'POLL', data: data });
  }, 30000);

  // Cleanup on unmount
  const cleanup = () => {
    if (channelId) manager.unsubscribe(channelId);
    clearInterval(pollTimer);
  };

  return {
    isConnected: manager.getConnectionStatus(),
    error: null,
  };
}

// Specific hooks for dashboard data
export function useProjectRealtime(projectId: string, onUpdate: (data: any) => void) {
  return useRealtime('projects', onUpdate, '*', `project_id=eq.${projectId}`);
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

// Dashboard-level hooks
export function useAdminRealtime(onUpdate: (table: string, data: any) => void) {
  const manager = RealtimeManager.getInstance();
  if (!manager.getConnectionStatus()) {
    manager.initialize();
  }

  const tables = ['projects', 'experiences', 'assets', 'deliverables', 'activity_logs', 'feedback'];
  const channelIds: string[] = [];

  tables.forEach((table) => {
    const id = manager.subscribe({
      table,
      event: '*',
      callback: (payload) => {
        onUpdate(table, payload);
      },
    });
    if (id) channelIds.push(id);
  });

  return {
    isConnected: true,
    cleanup: () => {
      channelIds.forEach((id) => manager.unsubscribe(id));
    },
  };
}

// Singleton getter for server-side usage
export function getRealtimeManager(): RealtimeManager {
  return RealtimeManager.getInstance();
}
