import { createServiceClient } from '@/lib/supabase/admin';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseJwtConfigured } from '@/lib/supabase/jwt';
import { trimEnvValue } from '@/lib/supabase/env';

/**
 * User-scoped Supabase client.
 * Uses the anon key with the user's Supabase JWT — enforces RLS.
 *
 * When supabaseAccessToken is provided (from NextAuth session),
 * the client operates under the user's RLS policies.
 *
 * When not provided, falls back to anon-level access (limited RLS).
 */
export function getUserClient(supabaseAccessToken?: string | null) {
  const url = trimEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
  const anonKey = trimEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
  if (!url || !anonKey) return null;

  const options: any = {
    auth: { persistSession: false, autoRefreshToken: false },
  };
  if (supabaseAccessToken) {
    options.global = { headers: { Authorization: `Bearer ${supabaseAccessToken}` } };
  }
  return createClient(url, anonKey, options);
}

/**
 * Service-role client — SERVER ONLY. Bypasses RLS.
 *
 * LEGITIMATE USES:
 * - Trusted server operations (e.g., admin queries, webhooks)
 * - Operations that have already verified authorization explicitly
 * - Cross-user operations (e.g., project-members management)
 *
 * NEVER use as the default for user-facing API routes.
 * The service-role client must never become the authorization mechanism.
 */
export function getServiceClient() {
  if (!trimEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL || '') || !trimEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY || '')) return null;
  return createServiceClient();
}

/**
 * Get the appropriate Supabase client for a route handler.
 *
 * Priority:
 * 1. User-scoped client (if supabaseAccessToken is available) — enforces RLS
 * 2. Service-role client (fallback for demo users or when JWT not configured)
 *
 * When using the service-role fallback, the caller MUST verify authorization
 * explicitly (e.g., via verifyProjectAccess).
 */
export function getRouteClient(supabaseAccessToken?: string | null) {
  if (supabaseAccessToken && isSupabaseJwtConfigured()) {
    return getUserClient(supabaseAccessToken);
  }
  return getServiceClient();
}
