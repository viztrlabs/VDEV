import { NextRequest, NextResponse } from 'next/server';
import {
  listMembers,
  inviteMember,
  setMemberRole,
  listComments,
  addComment,
  listTasks,
  addTask,
  toggleTask,
  listWaypoints,
  setWaypoints,
} from '@/lib/tourCollaboration';

// Generic collaboration endpoint.
// GET  /api/tour/collab?tourId=..&type=members|comments|tasks|waypoints
// POST /api/tour/collab  { tourId, type, ... }  (invite/comment/task/waypoints)
// PATCH /api/tour/collab { tourId, type, op, ... }

export async function GET(req: NextRequest) {
  try {
    const tourId = req.nextUrl.searchParams.get('tourId');
    const type = req.nextUrl.searchParams.get('type');
    if (!tourId || !type) return NextResponse.json({ error: 'missing params' }, { status: 400 });
    let data: any;
    if (type === 'members') data = await listMembers(tourId);
    else if (type === 'comments') data = await listComments(tourId);
    else if (type === 'tasks') data = await listTasks(tourId);
    else if (type === 'waypoints') data = await listWaypoints(tourId);
    else return NextResponse.json({ error: 'unknown type' }, { status: 400 });
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tourId, type } = body;
    if (!tourId || !type) return NextResponse.json({ error: 'missing params' }, { status: 400 });
    let res: any;
    if (type === 'members') res = await inviteMember(tourId, body.email, body.role || 'viewer');
    else if (type === 'comments') res = await addComment(tourId, body.body, body.authorName);
    else if (type === 'tasks') res = await addTask(tourId, body.title);
    else if (type === 'waypoints') res = await setWaypoints(tourId, body.waypoints || []);
    else return NextResponse.json({ error: 'unknown type' }, { status: 400 });
    return NextResponse.json({ ok: true, res });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { tourId, type, op } = body;
    if (type === 'members' && op === 'setRole') {
      await setMemberRole(body.memberId, body.role);
    } else if (type === 'tasks' && op === 'toggle') {
      await toggleTask(body.taskId, !!body.done);
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 });
  }
}
