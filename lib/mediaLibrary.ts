import { promises as fs } from 'node:fs';
import path from 'node:path';

// Lists 360° panorama images available in the media library (public/tour),
// so the editor can reuse existing uploads instead of re-uploading.
export interface MediaAsset {
  name: string;
  url: string;
  size?: number;
}

export async function listMediaLibrary(): Promise<MediaAsset[]> {
  try {
    const dir = path.join(process.cwd(), 'public', 'tour');
    const files = await fs.readdir(dir);
    const assets: MediaAsset[] = [];
    for (const f of files) {
      if (/\.(jpg|jpeg|png|webp|avif)$/i.test(f)) {
        let size: number | undefined;
        try {
          const st = await fs.stat(path.join(dir, f));
          size = st.size;
        } catch {
          /* ignore */
        }
        assets.push({ name: f, url: `/tour/${f}`, size });
      }
    }
    return assets;
  } catch {
    return [];
  }
}
