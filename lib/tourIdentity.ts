// Deterministic tour identity primitives.
//
// A tour is addressed by a "scope" — the strongest available signal among:
//   tourId (stable editor/builder identity) > slug (stable public address)
//   > experienceId > projectId > ownerId.
// Resolution NEVER falls back to "the globally most recently updated row",
// which was the P0-3 collision bug.

export interface TourScope {
  tourId?: string | null;
  slug?: string | null;
  experienceId?: string | null;
  projectId?: string | null;
  ownerId?: string | null;
  title?: string | null;
}

export function slugify(text: string): string {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildSlug(text: string, suffix?: string): string {
  const base = slugify(text) || 'viztr-tour';
  const s = suffix ?? Math.random().toString(36).slice(2, 8);
  return `${base}-${s}`;
}

// File-safe key used to namespace the local fallback store per tour.
export function sanitizeKeyForFile(key: string): string {
  return slugify(key) || 'default';
}

// Address key used by the local store. Prefer the strongest identity present.
export function identityKey(scope: TourScope): string {
  if (scope.tourId) return scope.tourId;
  if (scope.slug) return scope.slug;
  if (scope.experienceId) return `exp-${scope.experienceId}`;
  if (scope.projectId) return `proj-${scope.projectId}`;
  if (scope.ownerId) return `owner-${scope.ownerId}`;
  return '';
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Distinguish a raw tours.id (uuid) from a human authorable slug in URL params.
export function looksLikeId(value: string): boolean {
  return UUID_RE.test(value);
}