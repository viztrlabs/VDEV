'use server';

/**
 * Server-side credentials service
 * Fetches API credentials from Supabase settings table instead of env vars
 * to work around hosting platform env var limits.
 */

import { getSupabaseAdmin } from '@/lib/supabase-admin';

interface SettingRow {
  key: string;
  value: string;
  is_encrypted: boolean;
  updated_at: string;
}

let settingsCache: Map<string, string> | null = null;
let cacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get a credential value from Supabase settings table.
 * Falls back to process.env if not found in DB.
 */
export async function getServerCredential(key: string): Promise<string | null> {
  // 1. Check env var first (for backward compat / deploy-time injection)
  const envVal = process.env[key];
  if (envVal) return envVal;

  // 2. Check cache
  const now = Date.now();
  if (settingsCache && now - cacheTime < CACHE_TTL_MS) {
    return settingsCache.get(key) || null;
  }

  // 3. Fetch from Supabase
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  try {
    const { data, error } = await admin
      .from('settings')
      .select('key, value')
      .eq('key', key)
      .single();

    if (error || !data) return null;

    // Populate cache
    if (!settingsCache) settingsCache = new Map();
    settingsCache.set(data.key, data.value);
    cacheTime = now;

    return data.value;
  } catch {
    return null;
  }
}

/**
 * Get multiple credentials at once (more efficient than individual calls).
 */
export async function getServerCredentials(keys: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {};

  // Check env vars first
  for (const key of keys) {
    const envVal = process.env[key];
    if (envVal) result[key] = envVal;
  }

  const missingKeys = keys.filter((k) => !result[k]);
  if (missingKeys.length === 0) return result;

  // Fetch missing from Supabase
  const admin = getSupabaseAdmin();
  if (!admin) return result;

  try {
    const { data, error } = await admin
      .from('settings')
      .select('key, value')
      .in('key', missingKeys);

    if (!error && data) {
      for (const row of data) {
        result[row.key] = row.value;
      }
    }
  } catch {
    // Silent fail
  }

  return result;
}

/**
 * Set a credential value in Supabase settings table.
 * Admin-only operation.
 */
export async function setServerCredential(
  key: string,
  value: string,
  userId: string | null,
  description?: string
): Promise<{ success: boolean; error?: string }> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const now = new Date().toISOString();
    const { error } = await admin
      .from('settings')
      .upsert(
        {
          key,
          value,
          is_encrypted: true,
          description,
          updated_by: userId || undefined,
          updated_at: now,
        },
        { onConflict: 'key' }
      );

    if (error) {
      return { success: false, error: error.message };
    }

    // Invalidate cache
    settingsCache = null;

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save credential' };
  }
}

/**
 * List all credential keys (without values) for admin UI.
 */
export async function listServerCredentialKeys(): Promise<Array<{ key: string; description?: string; updated_at?: string }>> {
  const admin = getSupabaseAdmin();
  if (!admin) return [];

  try {
    const { data, error } = await admin
      .from('settings')
      .select('key, description, updated_at')
      .order('key');

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

/**
 * Clear the settings cache (call after updating credentials).
 */
export async function clearSettingsCache() {
  settingsCache = null;
  cacheTime = 0;
}
