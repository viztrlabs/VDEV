import { NextRequest, NextResponse } from 'next/server';
import {
  listTours,
  createTour,
  deleteTour,
  duplicateTour,
  updateTourMeta,
} from '@/lib/tourCollaboration';

// GET /api/tours — list tours for the authenticated tenant.
export async function GET() {
  try {
    const tours = await listTours();
    return NextResponse.json({ tours });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 });
  }
}

// POST /api/tours — create a new tour.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const created = await createTour(body.title || 'New Tour');
    if (!created) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }
    return NextResponse.json({ tour: created });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 });
  }
}

// DELETE /api/tours?id=...  | POST /api/tours/duplicate?id=...
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });
    await deleteTour(id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    const body = await req.json().catch(() => ({}));
    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });
    if (body.action === 'duplicate') {
      const dup = await duplicateTour(id);
      return NextResponse.json({ tour: dup });
    }
    await updateTourMeta(id, body);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 });
  }
}
