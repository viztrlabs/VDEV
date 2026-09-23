import { promises as fs } from 'node:fs';
import path from 'node:path';
import { sanitizeKeyForFile } from './tourIdentity';

// Admin-controlled settings for a PUBLIC virtual tour. Separate from a visitor's
// own localStorage preferences: this is what the tour operator toggles in the
// admin dashboard to publish/unpublish and to show/hide public features.
// Settings are namespaced per tour identity so publishing one tour never flips
// another tour's live state (P0-3). When Supabase is unavailable this file
// store is the persistence layer; when Supabase is configured it acts as the
// merge base for feature/theme defaults.

export interface TourFeatureToggles {
  hotspots: boolean;
  autoRotate: boolean;
  floorPlan: boolean;
  minimap: boolean;
  music: boolean;
  zoomControls: boolean;
  sceneCounter: boolean;
  branding: boolean;
  share: boolean;
  search: boolean;
}

export interface TourTheme {
  accentColor: string; // hex accent applied to public viewer UI
  logoUrl: string; // client logo shown in the public viewer
  title: string; // tour title shown in public viewer header
}

export interface TourSettings {
  live: boolean; // when false, the public tour shows an "unpublished" state
  publicUrl: string; // canonical public link for the client
  features: TourFeatureToggles;
  theme: TourTheme;
  accessLevel: 'public' | 'private'; // private = link only, no public index
  version: number; // bumped on "clear cache" to force viewers to refetch fresh data
  // VTED additions (all optional, additive non-breaking)
  vted?: import('./vted-types').VtedSettings;
}

export const DEFAULT_SETTINGS: TourSettings = {
  live: true,
  publicUrl: '/xr-world/virtual-tour',
  features: {
    hotspots: true,
    autoRotate: false,
    floorPlan: true,
    minimap: true,
    music: false,
    zoomControls: true,
    sceneCounter: true,
    branding: true,
    share: true,
    search: true,
  },
  theme: {
    accentColor: '#3ECF8E',
    logoUrl: '',
    title: 'VizTR Virtual Tour',
  },
  accessLevel: 'public',
  version: 1,
};

export function mergeSettings(input: Partial<TourSettings>): TourSettings {
  const base = DEFAULT_SETTINGS;
  return {
    ...base,
    ...input,
    features: { ...base.features, ...(input.features || {}) },
    theme: { ...base.theme, ...(input.theme || {}) },
    live: input.live ?? base.live,
    accessLevel: input.accessLevel === 'private' ? 'private' : 'public',
    version: typeof input.version === 'number' ? input.version : base.version,
    publicUrl: input.publicUrl ?? base.publicUrl,
    vted: { ...(base.vted || {}), ...(input.vted || {}) },
  };
}

function dataDir(): string {
  return process.env.TOUR_STORE_DIR || path.join(process.cwd(), '.data', 'tour');
}

function filePath(key?: string): string {
  const name = key ? `settings-${sanitizeKeyForFile(key)}.json` : 'settings.json';
  return path.join(dataDir(), name);
}

export async function getTourSettings(key?: string): Promise<TourSettings> {
  const parsed = await readTourSettings(key);
  return parsed ? mergeSettings(parsed) : DEFAULT_SETTINGS;
}

// Non-seeding read: returns null when no settings file exists yet.
export async function readTourSettings(key?: string): Promise<Partial<TourSettings> | null> {
  try {
    const raw = await fs.readFile(filePath(key), 'utf8');
    return JSON.parse(raw) as Partial<TourSettings>;
  } catch {
    return null;
  }
}

export async function saveTourSettings(
  settings: TourSettings,
  key?: string,
): Promise<TourSettings> {
  const merged = mergeSettings(settings);
  await fs.mkdir(dataDir(), { recursive: true });
  await fs.writeFile(filePath(key), JSON.stringify(merged, null, 2), 'utf8');
  return merged;
}