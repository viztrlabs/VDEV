export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import { listMediaLibrary, removeMediaLibrary } from '@/lib/mediaLibrary';
import { requireAuth } from '@/lib/api-guard';

const isDev = process.env.NODE_ENV !== 'production';

// GET /api/tour/media — list uploaded 360° panoramas available for reuse
export async function GET() {
  try {
    const assets = await listMediaLibrary();
    return NextResponse.json({ assets });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 });
  }
}

// DELETE /api/tour/media?name=<filename> — remove a media library asset (and its tiles)
export async function DELETE(req: NextRequest) {
  if (!isDev) {
    const guard = await requireAuth(req);
    if (guard.error) return guard.error;
  }
  try {
    const name = req.nextUrl.searchParams.get('name') || '';
    const safeName = path.basename(name);
    if (!safeName || !/\.(jpg|jpeg|png|webp|avif)$/i.test(safeName)) {
      return NextResponse.json({ error: 'invalid media name' }, { status: 400 });
    }
    const result = await removeMediaLibrary(safeName);
    if (!result.ok) {
      return NextResponse.json({ error: result.error || 'delete failed' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, removed: result.removed });
  } catch (err: any) {
    console.error('[tour/media] delete error:', err);
    return NextResponse.json({ error: err?.message || 'delete failed' }, { status: 500 });
  }
}