import { createServiceClient } from '@/lib/supabase/admin';
import { buildSlug } from './tourIdentity';

// Multi-tour + collaboration + guided-tour persistence layer.
// Graceful local fallback: when Supabase is NOT configured, all functions
// operate against an in-memory store seeded from a JSON file under
// data/tour/, so the entire feature set is demoable before credentials exist
// (same pattern as lib/toursRepo.ts). With creds + schema, they hit Supabase.

function stripBom(s: string): string {
  return s.replace(/^\uFEFF/, '');
}

const READY =
  Boolean(stripBom(process.env.NEXT_PUBLIC_SUPABASE_URL || '') && stripBom(process.env.SUPABASE_SERVICE_ROLE_KEY || ''));

function svc() {
  return READY ? createServiceClient() : null;
}

// ---------- local fallback store (deprecated — Supabase is primary) ----------
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
function writeLocal(_tours: LocalTour[]) {
  console.warn('[tourCollaboration] Local filesystem write is deprecated — use Supabase');
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
  // Dashboard enrichment (additive, optional so existing consumers are unaffected)
  slug?: string | null;
  views?: number;
  sceneCount?: number;
  thumbnailUrl?: string | null;
}

// Pure tours-row → dashboard summary mapper (exported for unit tests).
// Enriches the summary with the tour graph data the dashboard surfaces:
// slug, total views, room count, and a thumbnail from the first room.
export function toTourSummary(row: any): TourSummary {
  const data = row?.data ?? {};
  const rooms = Array.isArray(data?.rooms) ? data.rooms : [];
  const first = rooms[0] ?? null;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug ?? null,
    is_live: row.is_live === true,
    access_level: row.access_level === 'private' ? 'private' : 'public',
    custom_domain: row.custom_domain,
    streetview_status: row.streetview_status,
    max_resolution: row.max_resolution,
    guide_enabled: row.guide_enabled,
    auto_rotate: row.auto_rotate,
    updated_at: row.updated_at,
    views: typeof data?.views === 'number' ? data.views : (typeof row?.views_count === 'number' ? row.views_count : 0),
    sceneCount: rooms.length,
    thumbnailUrl: first?.thumbnailUrl || first?.panoramaUrl || null,
  };
}

export async function listTours(): Promise<TourSummary[]> {
  const c = svc();
  if (!c) return readLocal().map(stripLocal);
  // Select only columns that exist on the real `tours` table.
  const { data } = await c
    .from('tours')
    .select('id,title,slug,is_live,access_level,views_count,updated_at,data')
    .order('updated_at', { ascending: false });
  return (data ?? []).map(toTourSummary);
}

// owner_id is NOT NULL on the real tours table, and unauthenticated dev
// writes have no session user. Bind to the platform's first user (same
// fallback policy as lib/toursRepo.ts).
async function resolveOwnerId(c: any): Promise<string> {
  const { data, error } = await c.from('User').select('id').limit(1);
  if (error || !data?.[0]?.id) {
    throw new Error(`[tourCollaboration] no fallback owner available: ${error?.message ?? 'User table empty'}`);
  }
  return data[0].id;
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
  const owner_id = await resolveOwnerId(c);
  const { data, error } = await c
    .from('tours')
    .insert({
      title,
      slug: buildSlug(title),
      owner_id,
      is_live: false,
      access_level: 'public',
      version: 1,
      data: { version: 1, rooms: [], settings: {} },
    })
    .select()
    .single();
  if (error) throw new Error(`[tourCollaboration] createTour: ${error.message}`);
  return data ? toTourSummary(data) : null;
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
  // Only columns that exist on the real `tours` table can be patched.
  const SAFE_KEYS = ['title', 'is_live', 'access_level'] as const;
  const safe: Record<string, unknown> = {};
  for (const k of SAFE_KEYS) {
    if ((patch as any)?.[k] !== undefined) safe[k] = (patch as any)[k];
  }
  if (Object.keys(safe).length === 0) return;
  safe.updated_at = new Date().toISOString();
  await c.from('tours').update(safe).eq('id', id);
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
  const { data: src, error: srcErr } = await c.from('tours').select('*').eq('id', id).single();
  if (srcErr || !src) return null;
  let slug = src.slug ? `${src.slug}-copy` : buildSlug(`${src.title} (copy)`);
  const { data: clash } = await c.from('tours').select('id').eq('slug', slug).limit(1);
  if (clash && clash.length > 0) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  const { data, error } = await c
    .from('tours')
    .insert({
      title: `${src.title} (copy)`,
      slug,
      owner_id: src.owner_id,
      is_live: false,
      access_level: 'public',
      version: typeof src.version === 'number' ? src.version : 1,
      data: src.data,
    })
    .select()
    .single();
  if (error) throw new Error(`[tourCollaboration] duplicateTour: ${error.message}`);
  return data ? toTourSummary(data) : null;
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
