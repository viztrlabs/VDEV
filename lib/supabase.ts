import { createClient } from '@supabase/supabase-js';

function stripBom(s: string): string {
  return s.replace(/^\uFEFF/, '');
}

function isValidHttpUrl(s: string): boolean {
  try {
    const url = new URL(s);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// If Supabase environment variables are provided AND valid, initialize client; otherwise null
const supabaseUrl = stripBom(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
const supabaseAnonKey = stripBom(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

export const isSupabaseConfigured =
  Boolean(supabaseUrl && supabaseAnonKey) && isValidHttpUrl(supabaseUrl);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local storage real-time event bus simulation for preview when Supabase is not connected
type Listener = (payload: any) => void;
class RealtimeEmitter {
  private listeners: Map<string, Set<Listener>> = new Map();

  on(event: string, fn: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(fn);
    return () => this.off(event, fn);
  }

  off(event: string, fn: Listener) {
    this.listeners.get(event)?.delete(fn);
  }

  emit(event: string, payload: any) {
    this.listeners.get(event)?.forEach((fn) => fn(payload));
  }
}

export const realtimeBus = new RealtimeEmitter();
