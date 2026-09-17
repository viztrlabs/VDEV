import { createBrowserClient } from '@supabase/ssr';

function isValidHttpUrl(s?: string): boolean {
  if (!s) return false;
  try {
    const url = new URL(s);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Browser-side Supabase client (used in client components / auth pages).
// Returns null when env vars are absent so the app degrades gracefully before
// real credentials are configured.
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey || anonKey === '[SENSITIVE]' || !isValidHttpUrl(url)) return null;
  try {
    return createBrowserClient(url, anonKey);
  } catch {
    return null;
  }
}

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== '[SENSITIVE]' &&
    isValidHttpUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
);
