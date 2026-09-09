import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Server-only admin client. The service role key bypasses RLS and must never
// be shipped to the browser (no NEXT_PUBLIC_ prefix). Reads .env.local values
// at module load; tests run without the key, so adminClient is null there and
// the store falls back to the in-memory DB.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseAdminConfigured =
  Boolean(supabaseUrl && serviceRoleKey) && typeof window === 'undefined';

export const adminClient: SupabaseClient | null = isSupabaseAdminConfigured
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;