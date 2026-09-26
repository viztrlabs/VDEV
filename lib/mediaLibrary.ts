import path from 'node:path';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// Lists 360° panorama images available in the media library (Supabase Storage viztr-assets/tour),
// so the editor can reuse existing uploads instead of re-uploading.
export interface MediaAsset {
  name: string;
  url: string;
  size?: number;
}

// Deduplicates assets by public URL, keeping the first occurrence.
export function dedupeMediaAssets(assets: MediaAsset[]): MediaAsset[] {
  const seen = new Set<string>();
  const out: MediaAsset[] = [];
  for (const a of assets) {
    if (!a?.url) continue;
    if (seen.has(a.url)) continue;
    seen.add(a.url);
    out.push(a);
  }
  return out;
}

export async function listMediaLibrary(): Promise<MediaAsset[]> {
  try {
    if (!getSupabaseAdmin()) return [];

    const { data: files, error } = await getSupabaseAdmin()!.storage
      .from('viztr-assets')
      .list('tour', { limit: 500 });

    if (error || !files) {
      console.warn('[mediaLibrary] Supabase list error:', error?.message);
      return [];
    }

    const assets: MediaAsset[] = [];
    for (const f of files) {
      if (/\.(jpg|jpeg|png|webp|avif)$/i.test(f.name)) {
        const { data: urlData } = getSupabaseAdmin()!.storage
          .from('viztr-assets')
          .getPublicUrl(`tour/${f.name}`);
        assets.push({
          name: f.name,
          url: urlData.publicUrl,
          size: f.metadata?.size ?? undefined,
        });
      }
    }
    return dedupeMediaAssets(assets);
  } catch {
    return [];
  }
}

// Removes a single library asset (its base file plus any generated tile subtrees).
export async function removeMediaLibrary(name: string): Promise<{
  ok: boolean;
  removed?: string[];
  error?: string;
}> {
  try {
    if (!getSupabaseAdmin()) {
      return { ok: false, error: 'Supabase admin client not configured' };
    }
    const bucket = getSupabaseAdmin()!.storage.from('viztr-assets');
    const safe = path.basename(name);
    const base = safe.replace(/\.[^.]+$/, '');

    const toRemove: string[] = [`tour/${safe}`];
    const { data: tileFiles } = await bucket.list(`tour/${base}`, { limit: 1000 });
    if (tileFiles && tileFiles.length > 0) {
      for (const t of tileFiles) toRemove.push(`tour/${base}/${t.name}`);
    }

    const { error } = await bucket.remove(toRemove);
    if (error) {
      console.warn('[mediaLibrary] storage remove error:', error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true, removed: toRemove };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'remove failed' };
  }
}