import { createClient } from '@supabase/supabase-js';
import { isLikelyJwt, trimEnvValue } from '@/lib/supabase/env';

function isValidHttpUrl(s?: string): boolean {
  if (!s) return false;
  try {
    const url = new URL(s);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Service-role client — SERVER ONLY. Bypasses RLS.
// Never import this into a client component. The key must stay in a
// server-only env var (SUPABASE_SERVICE_ROLE_KEY).
export function createServiceClient() {
  const url = trimEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
  const serviceKey = trimEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY || '');
  if (!url || !serviceKey || serviceKey === '[SENSITIVE]' || !isValidHttpUrl(url) || !isLikelyJwt(serviceKey)) return null;
  try {
    return createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch {
    return null;
  }
}
