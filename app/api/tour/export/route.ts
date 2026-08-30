import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createZip, ZipEntry } from '@/lib/zipStore';

// GET /api/tour/export — produce a self-hostable ZIP of the tour:
//   tour.json (rooms + hotspots), settings.json (admin config), and the panorama images.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), '.data', 'tour');
    const publicTourDir = path.join(process.cwd(), 'public', 'tour');

    const entries: ZipEntry[] = [];

    // tour data
    try {
      const tourRaw = await fs.readFile(path.join(dataDir, 'local-tour.json'));
      entries.push({ name: 'tour.json', data: tourRaw });
    } catch {
      entries.push({ name: 'tour.json', data: Buffer.from('[]') });
    }
    try {
      const settingsRaw = await fs.readFile(path.join(dataDir, 'settings.json'));
      entries.push({ name: 'settings.json', data: settingsRaw });
    } catch {
      entries.push({ name: 'settings.json', data: Buffer.from('{}') });
    }

    // panorama images
    try {
      const files = await fs.readdir(publicTourDir);
      for (const f of files) {
        if (/\.(jpg|jpeg|png|webp|avif)$/i.test(f)) {
          const buf = await fs.readFile(path.join(publicTourDir, f));
          entries.push({ name: `panoramas/${f}`, data: buf });
        }
      }
    } catch {
      /* no images */
    }

    // minimal self-host readme
    entries.push({
      name: 'README.txt',
      data: Buffer.from(
        'VizTR Virtual Tour export\n\n- tour.json: rooms + hotspots\n- settings.json: admin/publish config\n- panoramas/: 360 images\n\nDrop these into any static host and point your viewer at tour.json.\n',
        'utf8'
      ),
    });

    const zip = createZip(entries);

    return new NextResponse(zip as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="viztr-virtual-tour.zip"',
        'Content-Length': String(zip.length),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'export failed' }, { status: 500 });
  }
}
