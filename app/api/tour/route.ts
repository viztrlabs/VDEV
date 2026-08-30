import { NextRequest, NextResponse } from 'next/server';
import { getTour, saveTour } from '@/lib/tourStore';

// GET /api/tour — return the editable tour graph (nodes + hotspots).
export async function GET() {
  try {
    const tour = await getTour();
    return NextResponse.json(tour);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed to load tour' }, { status: 500 });
  }
}

// PUT /api/tour — persist the full tour graph (rooms + their hotspots).
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !Array.isArray(body.rooms)) {
      return NextResponse.json({ error: 'invalid tour payload' }, { status: 400 });
    }
    const saved = await saveTour({ version: body.version ?? 1, rooms: body.rooms });
    return NextResponse.json(saved);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed to save tour' }, { status: 500 });
  }
}
