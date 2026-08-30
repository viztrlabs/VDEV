import { createServiceClient } from '@/lib/supabase/admin';

// Multi-tour + collaboration + guided-tour persistence layer.
// Graceful local fallback: when Supabase is NOT configured, all functions
// operate against an in-memory store seeded from a JSON file under
// data/tour/, so the entire feature set is demoable before credentials exist
// (same pattern as lib/toursRepo.ts). With creds + schema, they hit Supabase.

const READY =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

function svc() {
  return READY ? createServiceClient() : null;
}

// ---------- local fallback store ----------
const DATA_DIR = process.cwd() + '/data/tour';
const LOCAL_FILE = DATA_DIR + '/multi-tour.json';

type LocalTour = {
  id: string;
  title: string;
  is_live: boolean;
  access_level: 'public' | 'private';
  custom_domain?: string | null;
  streetview_status?: string;
  streetview_target?: string;
  max_resolution?: number;
  guide_enabled?: boolean;
  auto_rotate?: boolean;
  updated_at?: string;
  members: { id: string; email: string; role: string; status: string }[];
  comments: { id: string; body: string; author_name?: string; created_at?: string }[];
  tasks: { id: string; title: string; done: boolean }[];
  waypoints: { id: string; room_id: string; position: number; dwell_seconds: number }[];
};

function readLocal(): LocalTour[] {
  try {
    const fs = require('fs');
    if (!fs.existsSync(LOCAL_FILE)) return [];
    return JSON.parse(fs.readFileSync(LOCAL_FILE, 'utf8'));
  } catch {
    return [];
  }
}
function writeLocal(tours: LocalTour[]) {
  try {
    const fs = require('fs');
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(LOCAL_FILE, JSON.stringify(tours, null, 2));
  } catch {
    /* best-effort */
  }
}

export interface TourSummary {
  id: string;
  title: string;
  is_live: boolean;
  access_level: 'public' | 'private';
  custom_domain?: string | null;
  streetview_status?: string;
  max_resolution?: number;
  guide_enabled?: boolean;
  auto_rotate?: boolean;
  updated_at?: string;
}

export async function listTours(): Promise<TourSummary[]> {
  const c = svc();
  if (!c) return readLocal().map(stripLocal);
  const { data } = await c
    .from('tours')
    .select('id,title,is_live,access_level,custom_domain,streetview_status,max_resolution,guide_enabled,auto_rotate,updated_at')
    .order('updated_at', { ascending: false });
  return (data as TourSummary[]) || [];
}

export async function createTour(title: string): Promise<TourSummary | null> {
  const c = svc();
  if (!c) {
    const tours = readLocal();
    const t: LocalTour = {
      id: 'local-' + Math.random().toString(36).slice(2, 8),
      title,
      is_live: false,
      access_level: 'private',
      updated_at: new Date().toISOString(),
      members: [],
      comments: [],
      tasks: [],
      waypoints: [],
    };
    tours.push(t);
    writeLocal(tours);
    return stripLocal(t);
  }
  const { data } = await c
    .from('tours')
    .insert({ title, data: { version: 1, rooms: [], settings: {} } })
    .select()
    .single();
  return (data as TourSummary) || null;
}

export async function updateTourMeta(
  id: string,
  patch: Partial<{
    title: string;
    custom_domain: string;
    streetview_status: string;
    streetview_target: string;
    max_resolution: number;
    guide_enabled: boolean;
    auto_rotate: boolean;
    is_live: boolean;
    access_level: 'public' | 'private';
  }>,
): Promise<void> {
  const c = svc();
  if (!c) {
    const tours = readLocal();
    const t = tours.find((x) => x.id === id);
    if (t) {
      Object.assign(t, patch);
      t.updated_at = new Date().toISOString();
      writeLocal(tours);
    }
    return;
  }
  await c.from('tours').update(patch).eq('id', id);
}

export async function deleteTour(id: string): Promise<void> {
  const c = svc();
  if (!c) {
    writeLocal(readLocal().filter((x) => x.id !== id));
    return;
  }
  await c.from('tours').delete().eq('id', id);
}

export async function duplicateTour(id: string): Promise<TourSummary | null> {
  const c = svc();
  if (!c) {
    const tours = readLocal();
    const src = tours.find((x) => x.id === id);
    if (!src) return null;
    const copy: LocalTour = { ...structuredClone(src), id: 'local-' + Math.random().toString(36).slice(2, 8), title: src.title + ' (copy)', is_live: false, access_level: 'private', updated_at: new Date().toISOString() };
    tours.push(copy);
    writeLocal(tours);
    return stripLocal(copy);
  }
  const { data: src } = await c.from('tours').select('*').eq('id', id).single();
  if (!src) return null;
  const { data } = await c
    .from('tours')
    .insert({
      title: `${src.title} (copy)`,
      data: src.data,
      is_live: false,
      access_level: 'private',
    })
    .select()
    .single();
  return (data as TourSummary) || null;
}

function stripLocal(t: LocalTour): TourSummary {
  return {
    id: t.id,
    title: t.title,
    is_live: t.is_live,
    access_level: t.access_level,
    custom_domain: t.custom_domain,
    streetview_status: t.streetview_status,
    max_resolution: t.max_resolution,
    guide_enabled: t.guide_enabled,
    auto_rotate: t.auto_rotate,
    updated_at: t.updated_at,
  };
}

// ---- Team & roles ----
export async function inviteMember(tourId: string, email: string, role: string) {
  const c = svc();
  if (!c) {
    const tours = readLocal();
    const t = tours.find((x) => x.id === tourId);
    if (t) {
      t.members.push({ id: 'm-' + Math.random().toString(36).slice(2, 7), email, role, status: 'pending' });
      writeLocal(tours);
    }
    return;
  }
  await c.from('tour_members').insert({ tour_id: tourId, email, role, status: 'pending' });
}

export async function listMembers(tourId: string) {
  const c = svc();
  if (!c) return readLocal().find((x) => x.id === tourId)?.members || [];
  const { data } = await c.from('tour_members').select('*').eq('tour_id', tourId);
  return data || [];
}

export async function setMemberRole(memberId: string, role: string) {
  const c = svc();
  if (!c) {
    const tours = readLocal();
    for (const t of tours) {
      const m = t.members.find((x) => x.id === memberId);
      if (m) { m.role = role; break; }
    }
    writeLocal(tours);
    return;
  }
  await c.from('tour_members').update({ role }).eq('id', memberId);
}

// ---- Client collaboration: comments + tasks ----
export async function listComments(tourId: string) {
  const c = svc();
  if (!c) return readLocal().find((x) => x.id === tourId)?.comments || [];
  const { data } = await c
    .from('tour_comments')
    .select('*')
    .eq('tour_id', tourId)
    .order('created_at', { ascending: true });
  return data || [];
}

export async function addComment(tourId: string, body: string, authorName?: string) {
  const c = svc();
  if (!c) {
    const tours = readLocal();
    const t = tours.find((x) => x.id === tourId);
    if (t) {
      t.comments.push({ id: 'c-' + Math.random().toString(36).slice(2, 7), body, author_name: authorName || 'Guest', created_at: new Date().toISOString() });
      writeLocal(tours);
    }
    return;
  }
  await c.from('tour_comments').insert({ tour_id: tourId, body, author_name: authorName || 'Guest' });
}

export async function listTasks(tourId: string) {
  const c = svc();
  if (!c) return readLocal().find((x) => x.id === tourId)?.tasks || [];
  const { data } = await c.from('tour_tasks').select('*').eq('tour_id', tourId);
  return data || [];
}

export async function addTask(tourId: string, title: string) {
  const c = svc();
  if (!c) {
    const tours = readLocal();
    const t = tours.find((x) => x.id === tourId);
    if (t) {
      t.tasks.push({ id: 't-' + Math.random().toString(36).slice(2, 7), title, done: false });
      writeLocal(tours);
    }
    return;
  }
  await c.from('tour_tasks').insert({ tour_id: tourId, title });
}

export async function toggleTask(taskId: string, done: boolean) {
  const c = svc();
  if (!c) {
    const tours = readLocal();
    for (const t of tours) {
      const tk = t.tasks.find((x) => x.id === taskId);
      if (tk) { tk.done = done; break; }
    }
    writeLocal(tours);
    return;
  }
  await c.from('tour_tasks').update({ done }).eq('id', taskId);
}

// ---- Guided-tour waypoints ----
export async function listWaypoints(tourId: string) {
  const c = svc();
  if (!c) return readLocal().find((x) => x.id === tourId)?.waypoints || [];
  const { data } = await c
    .from('tour_waypoints')
    .select('*')
    .eq('tour_id', tourId)
    .order('position', { ascending: true });
  return data || [];
}

export async function setWaypoints(tourId: string, waypoints: { room_id: string; position: number; dwell_seconds: number }[]) {
  const c = svc();
  if (!c) {
    const tours = readLocal();
    const t = tours.find((x) => x.id === tourId);
    if (t) {
      t.waypoints = waypoints.map((w, i) => ({ id: 'w-' + i + '-' + Math.random().toString(36).slice(2, 6), ...w }));
      writeLocal(tours);
    }
    return;
  }
  await c.from('tour_waypoints').delete().eq('tour_id', tourId);
  if (waypoints.length) {
    await c.from('tour_waypoints').insert(
      waypoints.map((w) => ({ tour_id: tourId, room_id: w.room_id, position: w.position, dwell_seconds: w.dwell_seconds })),
    );
  }
}
