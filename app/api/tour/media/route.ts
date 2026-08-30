import { NextResponse } from 'next/server';
import { listMediaLibrary } from '@/lib/mediaLibrary';

// GET /api/tour/media — list uploaded 360° panoramas available for reuse
export async function GET() {
  try {
    const assets = await listMediaLibrary();
    return NextResponse.json({ assets });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 });
  }
}
