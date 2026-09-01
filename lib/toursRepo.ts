import { createServiceClient } from '@/lib/supabase/admin';
import { LOCAL_TOUR_ROOMS } from './localTour';
import {
  getTour as localGetTour,
  saveTour as localSaveTour,
  SavedTour,
} from './tourStore';
import {
  getTourSettings as localGetSettings,
  saveTourSettings as localSaveSettings,
  TourSettings,
} from './tourSettings';

// Single source of truth for tour persistence.
// - If Supabase is configured: read/write the owner's `tours` row (RLS scoped).
// - Otherwise: fall back to the local JSON store so the app keeps working
//   before credentials / schema are applied.

const TABLE = 'tours';

export interface TourWithSettings extends SavedTour {
  settings: TourSettings;
  live: boolean;
  accessLevel: 'public' | 'private';
}

function isSupabaseReady() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

// Resolve the owner's active tour row id (uses service client so it works in
// API routes without a session cookie). Returns null when none exists yet.
async function resolveTourId(serviceClient: any): Promise<string | null> {
  const { data } = await serviceClient
    .from(TABLE)
    .select('id')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

export async function getTour(tourId?: string | null): Promise<SavedTour> {
  if (isSupabaseReady()) {
    const svc = createServiceClient();
    if (svc) {
      let query = svc.from(TABLE).select('data').order('updated_at', { ascending: false }).limit(1);
      if (tourId) query = svc.from(TABLE).select('data').eq('id', tourId).limit(1);
      const { data } = await query.maybeSingle();
      if (data?.data?.rooms) {
        const d = data.data as any;
        return { version: d.version ?? 1, rooms: d.rooms };
      }
      // No row yet — seed one from the local store.
      const seeded = await localGetTour();
      await saveTour(seeded.rooms, seeded.version, tourId);
      return seeded;
    }
  }
  return localGetTour();
}

export async function saveTour(
  rooms: SavedTour['rooms'],
  version: number,
  tourId?: string | null,
): Promise<SavedTour> {
  const result = { version, rooms };
  if (isSupabaseReady()) {
    const svc = createServiceClient();
    if (svc) {
      if (tourId) {
        await svc.from(TABLE).update({ data: { version, rooms } }).eq('id', tourId);
        return result;
      }
      const existingId = await resolveTourId(svc);
      const payload = { data: { version, rooms } };
      if (existingId) {
        await svc.from(TABLE).update(payload).eq('id', existingId);
      } else {
        await svc.from(TABLE).insert({ ...payload, title: 'VizTR Virtual Tour' });
      }
      return result;
    }
  }
  return localSaveTour(result);
}

export async function getTourSettings(): Promise<TourSettings> {
  if (isSupabaseReady()) {
    const svc = createServiceClient();
    if (svc) {
      const { data } = await svc
        .from(TABLE)
        .select('data, is_live, access_level')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data?.data) {
        const d = data.data as any;
        const base = await localGetSettings();
        return {
          ...base,
          ...(d.settings || {}),
          live: data.is_live ?? base.live,
          accessLevel: (data.access_level as 'public' | 'private') ?? base.accessLevel,
          version: d.version ?? base.version,
        };
      }
    }
  }
  return localGetSettings();
}

export async function saveTourSettings(input: Partial<TourSettings> & {
  live?: boolean;
  accessLevel?: 'public' | 'private';
  version?: number;
  vted?: TourSettings['vted'];
}): Promise<TourSettings> {
  const base = await localGetSettings();
  const full: TourSettings = {
    ...base,
    ...input,
    features: { ...base.features, ...(input.features || {}) },
    theme: { ...base.theme, ...(input.theme || {}) },
    live: input.live ?? base.live,
    accessLevel: input.accessLevel ?? base.accessLevel,
    version: input.version ?? base.version,
    publicUrl: input.publicUrl ?? base.publicUrl,
    vted: { ...(base.vted || {}), ...(input.vted || {}) },
  };
  const merged = await localSaveSettings(full);

  if (isSupabaseReady()) {
    const svc = createServiceClient();
    if (svc) {
      const existingId = await resolveTourId(svc);
      const { data } = await svc
        .from(TABLE)
        .select('data')
        .eq('id', existingId ?? '')
        .maybeSingle();
      const currentData = (data?.data as any) || { version: 1, rooms: LOCAL_TOUR_ROOMS, settings: {} };
      const newData = {
        version: merged.version,
        rooms: currentData.rooms || LOCAL_TOUR_ROOMS,
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
      const patch = {
        data: newData,
        is_live: merged.live,
        access_level: merged.accessLevel,
      };
      if (existingId) {
        await svc.from(TABLE).update(patch).eq('id', existingId);
      } else {
        await svc.from(TABLE).insert({ ...patch, title: 'VizTR Virtual Tour' });
      }
    }
  }
  return merged;
}
