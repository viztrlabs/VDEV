import { createServiceClient } from '@/lib/supabase/admin';
import { isUsableSupabaseEnv } from '@/lib/supabase/env';
import { identityKey, buildSlug, TourScope } from './tourIdentity';
import {
  getTour as localGetTour,
  readTour as localReadTour,
  saveTour as localSaveTour,
  SavedTour,
} from './tourStore';
import {
  getTourSettings as localGetSettings,
  readTourSettings as localReadSettings,
  saveTourSettings as localSaveSettings,
  TourSettings,
} from './tourSettings';

// Single source of truth for tour persistence.
// - If Supabase is configured and usable: read/write the owner's `tours` row
//   (RLS scoped), keyed deterministically by the tour's identity.
// - Otherwise: fall back to a per-tour local JSON store so the app keeps
//   working before credentials / schema are applied.
//
// P0-3: every operation resolves a row through `resolveTourRow(scope)` using
// the strongest identity signal in the scope (slug > tourId > experienceId >
// projectId/ownerId default). The code NEVER picks "the globally most recently
// updated row", so editing one tour cannot clobber another tour.

const TABLE = 'tours';

// The real `tours` table has `owner_id uuid NOT NULL` with an FK to the
// platform user table (`"User"` in this stack). Production writes always carry
// the caller's user id (route binds `scope.ownerId` behind auth); unauthenticated
// dev writes fall back to the platform's first user so inserts succeed without
// a schema change. Updates never re-assign an existing row's owner.
async function resolveFallbackOwner(svc: any): Promise<string> {
  const { data, error } = await svc.from('User').select('id').limit(1);
  if (error || !data?.[0]?.id) {
    throw new Error(
      `[toursRepo] no fallback owner available (unauthenticated dev write): ${error?.message ?? 'User table empty'}`,
    );
  }
  return data[0].id;
}

export class TourOwnershipError extends Error {
  constructor(message = 'Tour ownership mismatch') {
    super(message);
    this.name = 'TourOwnershipError';
  }
}

export interface TourData extends SavedTour {
  id: string | null;
  slug: string;
}

export interface TourSettingsBundle {
  settings: TourSettings;
  id: string | null;
  slug: string;
}

export interface TourViewsBundle {
  views: number;
  id: string | null;
  slug: string;
}

export interface PublicTour extends TourData {
  settings: TourSettings;
}

export type { TourScope };

function isSupabaseReady() {
  return isUsableSupabaseEnv({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}

function pickClient(client?: any) {
  return client ?? (isSupabaseReady() ? createServiceClient() : null);
}

function computeSlug(scope: TourScope, existingRow?: any): string {
  return (
    scope.slug ??
    existingRow?.slug ??
    buildSlug(scope.title ?? 'VizTR Virtual Tour')
  );
}

function rowMatches(row: any, scope: TourScope): boolean {
  const identity = row?.data?.identity ?? {};
  if (scope.slug != null && scope.slug !== '') return row.slug === scope.slug;
  if (scope.tourId != null && scope.tourId !== '') return row.id === scope.tourId;
  if (scope.experienceId != null && scope.experienceId !== '') {
    if (identity.experienceId === scope.experienceId) return true;
    // Adopt an unclaimed row (identity not yet set) within the scoped set,
    // but never a row already claimed by a different project/owner.
    if (identity.experienceId != null) return false;
    if (scope.projectId != null && identity.projectId != null && identity.projectId !== scope.projectId)
      return false;
    if (scope.ownerId != null && row.owner_id != null && row.owner_id !== scope.ownerId)
      return false;
    return true;
  }
  return true;
}

// Resolve the single row addressed by `scope` — always deterministic, never
// "global newest". Returns null when no row exists for this identity.
export async function resolveTourRow(scope: TourScope, svc: any): Promise<any | null> {
  const hasScopeAxis = Boolean(
    scope.slug ?? scope.tourId ?? scope.experienceId ?? scope.projectId ?? scope.ownerId,
  );
  if (!hasScopeAxis) return null;
  let query = svc.from(TABLE).select('*');
  // When resolving by a globally-unique identity (id or slug) we must NOT
  // pre-filter by owner/project — the unique key itself is the address and the
  // ownership guard below still protects foreign rows.
  const byUniqueId = Boolean(scope.slug ?? scope.tourId ?? scope.experienceId);
  if (!byUniqueId) {
    // Project/owner scoping lives in data.identity + owner_id; the `tours`
    // table has no `parent_project` column (schema drifted), so scope by the
    // JSONB identity path instead of an ALTER on the shared table.
    if (scope.projectId) query = query.eq('data->identity->>projectId', scope.projectId);
    else if (scope.ownerId) query = query.eq('owner_id', scope.ownerId);
  }
  const { data: rows, error } = await query.order('created_at', { ascending: true });
  if (error) throw new Error(`[toursRepo] resolveTourRow: ${error.message}`);
  return (rows ?? []).find((r: any) => rowMatches(r, scope)) ?? null;
}

function assertOwnership(action: string, row: any | null, scope: TourScope) {
  if (row && scope.ownerId && row.owner_id && scope.ownerId !== row.owner_id) {
    throw new TourOwnershipError(
      `[toursRepo] ${action}: cannot modify a tour owned by another account`,
    );
  }
}

function buildIdentity(scope: TourScope, row: any | null, slug: string): any {
  const current = row?.data?.identity ?? {};
  return {
    ...current,
    tourId: scope.tourId ?? row?.id ?? null,
    slug,
    experienceId: scope.experienceId ?? current.experienceId ?? null,
    projectId: scope.projectId ?? current.projectId ?? null,
    title: scope.title ?? current.title ?? null,
  };
}

export async function getTour(
  scope: TourScope = {},
  client?: any,
): Promise<TourData> {
  const svc = pickClient(client);
  if (svc) {
    const row = await resolveTourRow(scope, svc);
    if (row?.data?.rooms) {
      const d = row.data as any;
      return {
        version: d.version ?? 1,
        rooms: d.rooms,
        id: row.id,
        slug: row.slug ?? computeSlug(scope, row),
      };
    }
    // No row yet — seed one from the local store under this tour's identity.
    const slug = computeSlug(scope);
    const seeded = await localGetTour(identityKey(scope));
    await saveTourDb(svc, seeded.rooms, seeded.version, {
      ...scope,
      slug,
      title: scope.title ?? 'VizTR Virtual Tour',
    });
    return { ...seeded, id: null, slug };
  }
  const t = await localGetTour(identityKey(scope));
  return { version: t.version, rooms: t.rooms, id: null, slug: computeSlug(scope) };
}

export async function saveTour(
  rooms: SavedTour['rooms'],
  version: number,
  scope: TourScope = {},
  client?: any,
): Promise<TourData> {
  const svc = pickClient(client);
  if (svc) return saveTourDb(svc, rooms, version, scope);
  return saveTourLocal(rooms, version, scope);
}

async function saveTourDb(
  svc: any,
  rooms: SavedTour['rooms'],
  version: number,
  scope: TourScope,
): Promise<TourData> {
  const row = await resolveTourRow(scope, svc);
  assertOwnership('saveTour', row, scope);
  const slug = computeSlug(scope, row);
  const data = { version, rooms, identity: buildIdentity(scope, row, slug) };
  const payload: any = {
    data,
    version,
    title: scope.title ?? row?.title ?? 'VizTR Virtual Tour',
    slug,
  };
  if (scope.ownerId) payload.owner_id = scope.ownerId;

  if (row) {
    const { error } = await svc.from(TABLE).update(payload).eq('id', row.id);
    if (error) throw new Error(`[toursRepo] saveTour update: ${error.message}`);
    return { version, rooms, id: row.id, slug };
  }
  const { error } = await svc
    .from(TABLE)
    .insert({ ...payload, owner_id: scope.ownerId ?? (await resolveFallbackOwner(svc)) });
  if (error) throw new Error(`[toursRepo] saveTour insert: ${error.message}`);
  const created = await resolveTourRow({ ...scope, slug }, svc);
  return { version, rooms, id: created?.id ?? null, slug };
}

async function saveTourLocal(
  rooms: SavedTour['rooms'],
  version: number,
  scope: TourScope,
): Promise<TourData> {
  const key = identityKey(scope);
  const slug = computeSlug(scope);
  const result: SavedTour = { version, rooms };
  await localSaveTour(result, key);
  return { ...result, id: null, slug };
}

function mergeSettingsInput(
  input: Partial<TourSettings> & { live?: boolean; accessLevel?: 'public' | 'private'; version?: number; vted?: TourSettings['vted'] },
  base: TourSettings,
): TourSettings {
  return {
    ...base,
    ...input,
    features: { ...base.features, ...(input.features || {}) },
    theme: { ...base.theme, ...(input.theme || {}) },
    live: input.live ?? base.live,
    accessLevel: input.accessLevel === 'private' ? 'private' : 'public',
    version: input.version ?? base.version,
    publicUrl: input.publicUrl ?? base.publicUrl,
    vted: { ...(base.vted || {}), ...(input.vted || {}) },
  };
}

export async function getTourSettings(
  scope: TourScope = {},
  client?: any,
): Promise<TourSettingsBundle> {
  const svc = pickClient(client);
  if (svc) {
    const row = await resolveTourRow(scope, svc);
    if (row) {
      const d = row.data as any;
      const base = await localGetSettings(identityKey(scope));
      const merged: TourSettings = {
        ...base,
        ...(d.settings || {}),
        live: row.is_live ?? d.settings?.live ?? base.live,
        accessLevel:
          (row.access_level ?? d.settings?.accessLevel) === 'private' ? 'private' : 'public',
        version: d.settings?.version ?? d.version ?? base.version,
      };
      return { settings: merged, id: row.id, slug: row.slug ?? computeSlug(scope, row) };
    }
    const s = await localGetSettings(identityKey(scope));
    return { settings: s, id: null, slug: computeSlug(scope) };
  }
  const s = await localGetSettings(identityKey(scope));
  return { settings: s, id: null, slug: computeSlug(scope) };
}

export async function saveTourSettings(
  input: Partial<TourSettings> & {
    live?: boolean;
    accessLevel?: 'public' | 'private';
    version?: number;
    vted?: TourSettings['vted'];
  },
  scope: TourScope = {},
  client?: any,
): Promise<TourSettingsBundle> {
  const svc = pickClient(client);
  if (svc) return saveTourSettingsDb(svc, input, scope);
  return saveTourSettingsLocal(input, scope);
}

export function resolveRoomsForSave(currentData: Record<string, unknown> | null | undefined): unknown {
  const rooms = currentData?.rooms;
  if (Array.isArray(rooms) && rooms.length > 0) return rooms;
  return currentData?.rooms ?? [];
}

async function saveTourSettingsDb(
  svc: any,
  input: Parameters<typeof saveTourSettings>[0],
  scope: TourScope,
): Promise<TourSettingsBundle> {
  const row = await resolveTourRow(scope, svc);
  assertOwnership('saveTourSettings', row, scope);
  const base = await localGetSettings(identityKey(scope));
  const merged = mergeSettingsInput(input, base);
  const slug = computeSlug(scope, row);
  const current = row?.data ?? ({} as Record<string, unknown>);
  const data = {
    ...(current ?? {}),
    version: merged.version,
    rooms: resolveRoomsForSave(current),
    identity: buildIdentity(scope, row, slug),
    settings: {
      live: merged.live,
      publicUrl: merged.publicUrl,
      features: merged.features,
      theme: merged.theme,
      accessLevel: merged.accessLevel,
      version: merged.version,
      vted: merged.vted,
    },
  };
  const patch: any = {
    data,
    is_live: merged.live,
    access_level: merged.accessLevel,
    version: merged.version,
    slug,
  };
  if (scope.ownerId) patch.owner_id = scope.ownerId;

  if (row) {
    const { error } = await svc.from(TABLE).update(patch).eq('id', row.id);
    if (error) throw new Error(`[toursRepo] saveTourSettings update: ${error.message}`);
    return { settings: merged, id: row.id, slug };
  }
  const { error } = await svc
    .from(TABLE)
    .insert({ ...patch, owner_id: scope.ownerId ?? (await resolveFallbackOwner(svc)) });
  if (error) throw new Error(`[toursRepo] saveTourSettings insert: ${error.message}`);
  const created = await resolveTourRow({ ...scope, slug }, svc);
  return { settings: merged, id: created?.id ?? null, slug };
}

async function saveTourSettingsLocal(
  input: Parameters<typeof saveTourSettings>[0],
  scope: TourScope,
): Promise<TourSettingsBundle> {
  const key = identityKey(scope);
  const base = await localGetSettings(key);
  const merged = mergeSettingsInput(input, base);
  const saved = await localSaveSettings(merged, key);
  return { settings: saved, id: null, slug: computeSlug(scope) };
}

export async function getTourViews(
  scope: TourScope = {},
  client?: any,
): Promise<TourViewsBundle> {
  const svc = pickClient(client);
  if (svc) {
    const row = await resolveTourRow(scope, svc);
    if (!row) return { views: 0, id: null, slug: computeSlug(scope) };
    return {
      views: (row.data?.views ?? 0),
      id: row.id,
      slug: row.slug ?? computeSlug(scope, row),
    };
  }
  const t = await localGetTour(identityKey(scope));
  return { views: (t as SavedTour & { views?: number }).views ?? 0, id: null, slug: computeSlug(scope) };
}

export async function onTourView(
  scope: TourScope = {},
  client?: any,
): Promise<TourViewsBundle> {
  const svc = pickClient(client);
  if (svc) {
    const row = await resolveTourRow(scope, svc);
    if (!row) return { views: 0, id: null, slug: computeSlug(scope) };
    const views = (row.data?.views ?? 0) + 1;
    const { error } = await svc
      .from(TABLE)
      .update({ data: { ...(row.data ?? {}), views } })
      .eq('id', row.id);
    if (error) throw new Error(`[toursRepo] onTourView update: ${error.message}`);
    return { views, id: row.id, slug: row.slug ?? computeSlug(scope, row) };
  }
  const key = identityKey(scope);
  const t = (await localGetTour(key)) as SavedTour & { views?: number };
  const views = (t.views ?? 0) + 1;
  await localSaveTour({ ...t, views }, key);
  return { views, id: null, slug: computeSlug(scope) };
}

// Strict public read: only returns data for tours that are explicitly live +
// publicly accessible. Returns null otherwise — never seeds, so a random slug
// or an unpublished tour cannot materialize a default tour (404 at the route).
export async function resolvePublicTour(
  scope: TourScope = {},
  client?: any,
): Promise<PublicTour | null> {
  const svc = pickClient(client);
  if (svc) {
    const row = await resolveTourRow(scope, svc);
    if (!row?.data?.rooms) return null;
    const isLive = row.is_live === true || row.data?.settings?.live === true;
    if (!isLive) return null;
    const access = row.access_level ?? row.data?.settings?.accessLevel;
    if (access !== 'public') return null;
    const d = row.data as any;
    const bundle = await getTourSettings(scope, svc);
    return {
      version: d.version ?? 1,
      rooms: d.rooms,
      id: row.id,
      slug: row.slug ?? computeSlug(scope, row),
      settings: bundle.settings,
    };
  }
  // Local fallback — both a saved tour AND explicit published settings must
  // exist (otherwise the tour is "unpublished" and must be unreachable).
  const key = identityKey(scope);
  const t = await localReadTour(key);
  const rawSettings = await localReadSettings(key);
  if (!t) return null;
  if (!rawSettings || rawSettings.live !== true) return null;
  if ((rawSettings.accessLevel ?? 'public') !== 'public') return null;
  const s = await getTourSettings(scope);
  return {
    version: t.version,
    rooms: t.rooms,
    id: null,
    slug: scope.slug ?? computeSlug(scope),
    settings: s.settings,
  };
}