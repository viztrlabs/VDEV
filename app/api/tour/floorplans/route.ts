import { NextRequest, NextResponse } from 'next/server';
import {
  getFloorplans,
  getFloorplan,
  createFloorplan,
  updateFloorplan,
  deleteFloorplan,
} from '@/lib/floorplanStore';
import type { VtedFloorplan } from '@/lib/vted-types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  try {
    if (id) {
      const fp = await getFloorplan(id);
      if (!fp) return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
      return NextResponse.json({ success: true, floorplan: fp });
    }
    const list = await getFloorplans();
    return NextResponse.json({ success: true, count: list.length, floorplans: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
     const fp = await createFloorplan({
      name: body.name || 'Untitled Floorplan',
      imageUrl: body.imageUrl || '',
      status: body.status === 'published' ? 'published' : 'draft',
      draft: body.draft !== false,
      roomsLinked: Array.isArray(body.roomsLinked) ? body.roomsLinked : [],
      aiData: body.aiData || undefined,
    });
    return NextResponse.json({ success: true, floorplan: fp }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
    }
    const patch: Partial<VtedFloorplan> = {};
    if (typeof body.name === 'string') patch.name = body.name;
    if (typeof body.imageUrl === 'string') patch.imageUrl = body.imageUrl;
    if (body.status === 'published' || body.status === 'draft') patch.status = body.status;
    if (typeof body.draft === 'boolean') patch.draft = body.draft;
    if (Array.isArray(body.roomsLinked)) patch.roomsLinked = body.roomsLinked;
    if (body.aiData) patch.aiData = body.aiData;
    if (body.aiData === null) patch.aiData = undefined;
    const fp = await updateFloorplan(body.id, patch);
    if (!fp) return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
    return NextResponse.json({ success: true, floorplan: fp });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
  }
  const ok = await deleteFloorplan(id);
  if (!ok) return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
