import { createClient } from '@supabase/supabase-js';

function stripBom(s: string): string {
  return s.replace(/^\uFEFF/, '');
}

// Service-role client — SERVER ONLY. Bypasses RLS.
// Never import this into a client component. The key must stay in a
// server-only env var (SUPABASE_SERVICE_ROLE_KEY).
export function createServiceClient() {
  const url = stripBom(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
  const serviceKey = stripBom(process.env.SUPABASE_SERVICE_ROLE_KEY || '');
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
