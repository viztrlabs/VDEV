export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getTourViews, onTourView } from '@/lib/toursRepo';
import { parseTourParams } from '@/lib/tourScope';

// GET /api/tour/views?tour=<id-or-slug> — total public opens of THIS tour.
// POST /api/tour/views?tour=<id-or-slug> — increment the counter for THIS tour.
// Per-tour scoping means counting views on one tour can never touch another.

export async function GET(req: NextRequest) {
  const { scope } = parseTourParams(req.nextUrl.searchParams);
  try {
    const { views, id, slug } = await getTourViews(scope);
    return NextResponse.json({ count: views, views, id, slug });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { scope } = parseTourParams(req.nextUrl.searchParams);
  try {
    const { views, id, slug } = await onTourView(scope);
    return NextResponse.json({ count: views, views, id, slug });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 });
  }
}