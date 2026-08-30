import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';

// POST /api/tour/upload — accept a 360° equirectangular image (multipart), save it
// into /public/tour, and return the public URL. Used by the no-code editor so a
// non-developer can add their own panoramas.
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
    await fs.writeFile(path.join(tourDir, filename), buf);
    return NextResponse.json({ url: `/tour/${filename}`, filename });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'upload failed' }, { status: 500 });
  }
}
