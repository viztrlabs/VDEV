import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import { generateTilePyramid } from '@/lib/marzipano/tiling';
import { requireAuth } from '@/lib/api-guard';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAssetTypeByExtension, validateMagicBytes, getAllAllowedExtensions } from '@/lib/asset-types';

const BUCKET = 'viztr-assets';
const STORAGE_FOLDER = 'tour';

export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;
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

    // --- Upload validation ---
    const assetType = getAssetTypeByExtension(ext);
    if (!assetType) {
      return NextResponse.json(
        { error: `File type "${ext}" is not allowed. Allowed: ${getAllAllowedExtensions().join(', ')}` },
        { status: 400 },
      );
    }

    if (!validateMagicBytes(buf, assetType)) {
      return NextResponse.json(
        { error: `File content does not match expected signature for "${ext}"` },
        { status: 400 },
      );
    }

    if (buf.length > assetType.maxSize) {
      return NextResponse.json(
        { error: `File exceeds ${Math.round(assetType.maxSize / (1024 * 1024))}MB limit` },
        { status: 413 },
      );
    }
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin client not configured' }, { status: 500 });
    }

    const base = path
      .basename(original, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'panorama';

    // Check for existing file to avoid collisions
    const { data: existingFiles } = await supabaseAdmin.storage
      .from(BUCKET)
      .list(STORAGE_FOLDER, { search: `${base}${ext}` });

    let filename = `${base}${ext}`;
    if (existingFiles && existingFiles.length > 0) {
      let n = 1;
      while (existingFiles.some((f: { name: string }) => f.name === `${base}-${n}${ext}`)) n++;
      filename = `${base}-${n}${ext}`;
    }

    const storagePath = `${STORAGE_FOLDER}/${filename}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(storagePath, buf, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    // Generate tile pyramid for panorama images
    let tileUrl: string | null = null;
    let tileInfo = null;
    const tileBaseName = filename.replace(/\.[^.]+$/, '');

    if (/\.(jpg|jpeg|png)$/i.test(ext)) {
      try {
        // Write buffer to a temp file for Sharp tile generation
        const { writeFile: tmpWrite, unlink: tmpUnlink, mkdir: tmpMkdir } = await import('node:fs/promises');
        const tmpDir = path.join(process.cwd(), '.tmp', 'tour-tiles');
        await tmpMkdir(tmpDir, { recursive: true });
        const tmpPath = path.join(tmpDir, `${tileBaseName}${ext}`);
        await tmpWrite(tmpPath, buf);

        const result = await generateTilePyramid({
          sourcePath: tmpPath,
          outputDir: path.join(tmpDir, tileBaseName),
          quality: 80,
        });

        // Upload generated tiles to Supabase Storage
        const { readdir: tmpReaddir } = await import('node:fs/promises');
        const tileDir = path.join(tmpDir, tileBaseName);
        const tileFiles = await tmpReaddir(tileDir, { recursive: true }) as string[];
        for (const relPath of tileFiles) {
          const absPath = path.join(tileDir, relPath);
          const tileBuf = await (await import('node:fs/promises')).readFile(absPath);
          const tileStoragePath = `${STORAGE_FOLDER}/${tileBaseName}/${relPath}`;
          await supabaseAdmin.storage.from(BUCKET).upload(tileStoragePath, tileBuf, {
            contentType: 'image/jpeg',
            upsert: true,
          });
        }

        // Clean up temp files
        await tmpUnlink(tmpPath).catch(() => {});
        const { rm: tmpRm } = await import('node:fs/promises');
        await tmpRm(tmpDir, { recursive: true, force: true }).catch(() => {});

        tileUrl = `${publicUrl.replace(/\/[^/]+$/, '')}/${tileBaseName}`;
        tileInfo = { maxZoom: result.maxZoom, levels: result.levels, tiles: result.tiles };
      } catch (tileErr) {
        console.warn('[tour/upload] tile generation failed, serving full-res only:', tileErr);
      }
    }

    return NextResponse.json({
      url: publicUrl,
      filename,
      tileUrl,
      tiles: tileInfo,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'upload failed' }, { status: 500 });
  }
}
