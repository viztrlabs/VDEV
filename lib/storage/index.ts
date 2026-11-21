/**
 * Storage provider factory.
 *
 * Selects the active provider from STORAGE_PROVIDER env (default: supabase).
 * Adding Cloudflare R2 later means implementing StorageProvider in a new file
 * and registering it here — no call-site changes.
 */

import { StorageProvider } from './types';
import { SupabaseStorageProvider } from './supabase-provider';

let _provider: StorageProvider | null | undefined;

export function getStorageProvider(): StorageProvider | null {
  if (_provider !== undefined) return _provider;
  const kind = (process.env.STORAGE_PROVIDER || 'supabase').toLowerCase();
  switch (kind) {
    case 'supabase':
      _provider = new SupabaseStorageProvider();
      break;
    case 'r2':
      // Registered when the R2 benchmark (Phase 07) justifies the migration.
      _provider = null;
      break;
    default:
      _provider = null;
  }
  return _provider;
}
