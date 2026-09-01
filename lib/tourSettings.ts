import { promises as fs } from 'node:fs';
import path from 'node:path';

// Admin-controlled settings for the PUBLIC virtual tour. Separate from a visitor's
// own localStorage preferences: this is what the tour operator toggles in the
// admin dashboard to publish/unpublish and to show/hide public features.

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

const DEFAULT_SETTINGS: TourSettings = {
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

const DATA_DIR = path.join(process.cwd(), '.data', 'tour');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

export async function getTourSettings(): Promise<TourSettings> {
  try {
    const raw = await fs.readFile(SETTINGS_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<TourSettings>;
    // Merge so new fields get defaults.
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      features: { ...DEFAULT_SETTINGS.features, ...(parsed.features || {}) },
      theme: { ...DEFAULT_SETTINGS.theme, ...(parsed.theme || {}) },
      accessLevel: parsed.accessLevel === 'private' ? 'private' : 'public',
      version: typeof parsed.version === 'number' ? parsed.version : 1,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveTourSettings(settings: TourSettings): Promise<TourSettings> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const merged: TourSettings = {
    ...DEFAULT_SETTINGS,
    ...settings,
    features: { ...DEFAULT_SETTINGS.features, ...(settings.features || {}) },
    theme: { ...DEFAULT_SETTINGS.theme, ...(settings.theme || {}) },
    accessLevel: settings.accessLevel === 'private' ? 'private' : 'public',
    version: typeof settings.version === 'number' ? settings.version : 1,
  };
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(merged, null, 2), 'utf8');
  return merged;
}
