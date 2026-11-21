/**
 * Supabase Storage implementation of the StorageProvider interface.
 *
 * Wraps the existing `viztr-assets` bucket conventions (folder-scoped RLS,
 * public prefixes for tour/ and published/) behind the vendor-neutral
 * StorageProvider contract. Server-side usage uses the admin (service-role)
 * client; browser uploads use supabase-js directly against RLS-guarded paths.
 */

import { StorageProvider, StorageUploadOptions, StorageObject, StorageError } from './types';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const VIZTR_ASSETS_BUCKET = 'viztr-assets';

export class SupabaseStorageProvider implements StorageProvider {
  readonly name = 'supabase';

  async upload(path: string, body: ArrayBuffer | Blob | Buffer, options: StorageUploadOptions): Promise<{ path: string }> {
    const admin = getSupabaseAdmin();
    if (!admin) throw new StorageError('Supabase admin not configured');

    const payload = body instanceof Blob ? body : body instanceof ArrayBuffer ? new Uint8Array(body) : new Uint8Array(body);
    const { error } = await admin.storage.from(VIZTR_ASSETS_BUCKET).upload(path, payload as any, {
      contentType: options.contentType,
      cacheControl: options.cacheControl ? Math.max(0, parseCacheControlSeconds(options.cacheControl)).toString() : undefined,
      upsert: options.upsert ?? true,
    });
    if (error) throw new StorageError(`upload failed for ${path}: ${error.message}`, error);
    return { path };
  }

  async signedUrl(path: string, expiresInSeconds: number): Promise<string> {
    const admin = getSupabaseAdmin();
    if (!admin) throw new StorageError('Supabase admin not configured');

    const clamped = Math.min(Math.max(expiresInSeconds, 60), 86400);
    const { data, error } = await admin.storage.from(VIZTR_ASSETS_BUCKET).createSignedUrl(path, clamped);
    if (error || !data?.signedUrl) throw new StorageError(`signedUrl failed for ${path}: ${error?.message}`, error);
    // createSignedUrl returns a relative path when SUPABASE_URL is relative — normalize.
    return data.signedUrl.startsWith('http') ? data.signedUrl : new URL(data.signedUrl, getSupabaseBaseUrl()).toString();
  }

  publicUrl(path: string): string {
    const admin = getSupabaseAdmin();
    if (!admin) throw new StorageError('Supabase admin not configured');
    return admin.storage.from(VIZTR_ASSETS_BUCKET).getPublicUrl(path).data.publicUrl;
  }

  async head(path: string): Promise<StorageObject | null> {
    const admin = getSupabaseAdmin();
    if (!admin) throw new StorageError('Supabase admin not configured');

    const folder = dirname(path);
    const file = basename(path);
    const { data, error } = await admin.storage.from(VIZTR_ASSETS_BUCKET).list(folder, { search: file, limit: 1 });
    if (error) throw new StorageError(`head failed for ${path}: ${error.message}`, error);
    const hit = data?.[0];
    if (!hit) return null;
    return {
      path: folder ? `${folder}/${hit.name}` : hit.name,
      size: hit.metadata?.size ?? 0,
      contentType: hit.metadata?.mimetype ?? undefined,
      updatedAt: hit.updated_at ?? undefined,
    };
  }

  async delete(path: string): Promise<void> {
    const admin = getSupabaseAdmin();
    if (!admin) throw new StorageError('Supabase admin not configured');
    const { error } = await admin.storage.from(VIZTR_ASSETS_BUCKET).remove([path]);
    if (error) throw new StorageError(`delete failed for ${path}: ${error.message}`, error);
  }

  async list(prefix: string): Promise<StorageObject[]> {
    const admin = getSupabaseAdmin();
    if (!admin) throw new StorageError('Supabase admin not configured');

    const folder = dirname(prefix.endsWith('/') ? prefix.slice(0, -1) : prefix);
    const searchPrefix = basename(prefix.endsWith('/') ? prefix.slice(0, -1) : prefix);
    const { data, error } = await admin.storage.from(VIZTR_ASSETS_BUCKET).list(folder, { search: searchPrefix, limit: 1000 });
    if (error) throw new StorageError(`list failed for ${prefix}: ${error.message}`, error);
    return (data || []).map((f: any) => ({
      path: folder ? `${folder}/${f.name}` : f.name,
      size: f.metadata?.size ?? 0,
      contentType: f.metadata?.mimetype ?? undefined,
      updatedAt: f.updated_at ?? undefined,
    }));
  }
}

function parseCacheControlSeconds(cacheControl: string): number {
  const m = /max-age=(\d+)/i.exec(cacheControl);
  return m ? parseInt(m[1], 10) : 3600;
}

function dirname(path: string): string {
  const idx = path.lastIndexOf('/');
  return idx === -1 ? '' : path.slice(0, idx);
}

function basename(path: string): string {
  const idx = path.lastIndexOf('/');
  return idx === -1 ? path : path.slice(idx + 1);
}

function getSupabaseBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/^\uFEFF/, '');
}
