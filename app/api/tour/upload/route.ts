import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { generateTilePyramid } from '@/lib/marzipano/tiling';

// POST /api/tour/upload — accept a 360° equirectangular image (multipart), save it
// into /public/tour, generate multi-res tile pyramid, and return public URLs.
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'no file provided' }, { status: 400 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    // Sanitize filename: keep extension, slugify the base.
    const original = file.name || 'panorama.jpg';
    const ext = path.extname(original).toLowerCase() || '.jpg';
    const base = path
      .basename(original, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'panorama';
    // Avoid collisions.
    const tourDir = path.join(process.cwd(), 'public', 'tour');
    await fs.mkdir(tourDir, { recursive: true });
    let filename = `${base}${ext}`;
    let n = 1;
    while (true) {
      try {
        await fs.access(path.join(tourDir, filename));
        filename = `${base}-${n}${ext}`;
        n++;
      } catch {
        break;
      }
    }
    const filePath = path.join(tourDir, filename);
    await fs.writeFile(filePath, buf);

    // Generate tile pyramid (async, don't block response for small images)
    let tileUrl: string | null = null;
    let tileInfo = null;
    try {
      const tileBaseName = filename.replace(/\.[^.]+$/, '');
      const tileOutputDir = path.join(tourDir, tileBaseName);
      const result = await generateTilePyramid({
        sourcePath: filePath,
        outputDir: tileOutputDir,
        quality: 80,
      });
      tileUrl = `/tour/${tileBaseName}`;
      tileInfo = { maxZoom: result.maxZoom, levels: result.levels, tiles: result.tiles };
    } catch (tileErr) {
      console.warn('[tour/upload] tile generation failed, serving full-res only:', tileErr);
    }

    return NextResponse.json({
      url: `/tour/${filename}`,
      filename,
      tileUrl,  // e.g. "/tour/my-pano" — TourViewer appends /tiles/{z}/{y}/{x}.jpg
      tiles: tileInfo,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'upload failed' }, { status: 500 });
  }
}
