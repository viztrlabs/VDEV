import { supabaseAdmin } from '@/lib/supabase-admin';

// Lists 360° panorama images available in the media library (Supabase Storage viztr-assets/tour),
// so the editor can reuse existing uploads instead of re-uploading.
export interface MediaAsset {
  name: string;
  url: string;
  size?: number;
}

export async function listMediaLibrary(): Promise<MediaAsset[]> {
  try {
    if (!supabaseAdmin) return [];

    const { data: files, error } = await supabaseAdmin.storage
      .from('viztr-assets')
      .list('tour', { limit: 500 });

    if (error || !files) {
      console.warn('[mediaLibrary] Supabase list error:', error?.message);
      return [];
    }

    const assets: MediaAsset[] = [];
    for (const f of files) {
      if (/\.(jpg|jpeg|png|webp|avif)$/i.test(f.name)) {
        const { data: urlData } = supabaseAdmin.storage
          .from('viztr-assets')
          .getPublicUrl(`tour/${f.name}`);
        assets.push({
          name: f.name,
          url: urlData.publicUrl,
          size: f.metadata?.size ?? undefined,
        });
      }
    }
    return assets;
  } catch {
    return [];
  }
}
