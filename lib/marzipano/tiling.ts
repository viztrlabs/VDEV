/**
 * Tile pyramid generator for 360° panoramas.
 * Generates Marzipano-compatible tile pyramid from equirectangular images.
 *
 * Output structure:
 *   {base}/tiles/{z}/{y}/{x}.jpg
 *
 * z = zoom level (0 = smallest, maxZoom = full resolution)
 * Tiles are 512×512 JPEG. Pyramid: 256 → 512 → 1024 → 2048 → 4096
 * Source image width determines maxZoom (4096 = z=4, 2048 = z=3).
 */
import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const TILE_SIZE = 512;

export interface TilePyramidOptions {
  sourcePath: string;
  outputDir: string;
  quality?: number; // JPEG quality 1-100, default 80
}

export interface TilePyramidResult {
  tileBase: string;   // e.g. "/tour/my-pano"
  maxZoom: number;
  levels: number;
  tiles: number;
}

export async function generateTilePyramid(
  opts: TilePyramidOptions
): Promise<TilePyramidResult> {
  const { sourcePath, outputDir, quality = 80 } = opts;

  const meta = await sharp(sourcePath).metadata();
  const srcW = meta.width!;
  const srcH = meta.height!;

  // Compute zoom levels: each level = source / 2^(maxZoom - z)
  // maxZoom is chosen so that the smallest level is ~256px wide
  const maxZoom = Math.max(0, Math.floor(Math.log2(srcW / 256)));

  // Generate levels from z=0 (smallest) to z=maxZoom (full res)
  const tilesDir = path.join(outputDir, 'tiles');
  let totalTiles = 0;

  for (let z = 0; z <= maxZoom; z++) {
    const scale = Math.pow(2, z - maxZoom);
    const levelW = Math.round(srcW * scale);
    const levelH = Math.round(srcH * scale);
    const cols = Math.ceil(levelW / TILE_SIZE);
    const rows = Math.ceil(levelH / TILE_SIZE);

    const zDir = path.join(tilesDir, String(z));
    await fs.mkdir(zDir, { recursive: true });

    for (let y = 0; y < rows; y++) {
      const yDir = path.join(zDir, String(y));
      await fs.mkdir(yDir, { recursive: true });

      for (let x = 0; x < cols; x++) {
        const left = x * TILE_SIZE;
        const top = y * TILE_SIZE;
        const tileW = Math.min(TILE_SIZE, levelW - left);
        const tileH = Math.min(TILE_SIZE, levelH - top);

        const tilePath = path.join(yDir, `${x}.jpg`);

        await sharp(sourcePath)
          .resize(levelW, levelH, { fit: 'fill' })
          .extract({
            left: Math.round(left * (srcW / levelW)),
            top: Math.round(top * (srcH / levelH)),
            width: Math.round(tileW * (srcW / levelW)),
            height: Math.round(tileH * (srcH / levelH)),
          })
          .jpeg({ quality })
          .toFile(tilePath);

        totalTiles++;
      }
    }
  }

  return {
    tileBase: outputDir,
    maxZoom,
    levels: maxZoom + 1,
    tiles: totalTiles,
  };
}

/**
 * Get the public tile URL path relative to /public.
 * e.g. input="/public/tour/pano-1" → output="/tour/pano-1"
 */
export function getTileUrl(publicDir: string): string {
  // Strip /public prefix if present
  return publicDir.replace(/.*public/, '') || publicDir;
}
