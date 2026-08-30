import { NextRequest, NextResponse } from 'next/server';
import { getTour, saveTour } from '@/lib/toursRepo';

// GET /api/tour?tour=<id> — return the editable tour graph (nodes + hotspots).
// Reads from the Supabase `tours` table when configured, else the local JSON store.
export async function GET(req: NextRequest) {
  try {
    const tourId = req.nextUrl.searchParams.get('tour');
    const tour = await getTour(tourId);
    return NextResponse.json(tour);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed to load tour' }, { status: 500 });
  }
}

// PUT /api/tour?tour=<id> — persist the full tour graph (rooms + their hotspots).
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !Array.isArray(body.rooms)) {
      return NextResponse.json({ error: 'invalid tour payload' }, { status: 400 });
    }
    const tourId = req.nextUrl.searchParams.get('tour');
    const saved = await saveTour(body.rooms, body.version ?? 1, tourId);
    return NextResponse.json(saved);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed to save tour' }, { status: 500 });
  }
}
