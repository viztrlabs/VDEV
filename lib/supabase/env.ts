// Shared, dependency-free helpers for reading Supabase credentials from the
// environment. Centralizes quote/BOM trimming (`.env.local` entries are
// frequently shell-quoted) and sanity checks so "ready" means "actually usable".

export function trimEnvValue(value?: string): string {
  if (!value) return '';
  return value
    .replace(/^\uFEFF/, '')
    .trim()
    .replace(/^"(.*)"$/, '$1')
    .replace(/^'(.*)'$/, '$1')
    .trim();
}

// A real anon/service JWT has at least two `.`-separated segments.
export function isLikelyJwt(key?: string): boolean {
  const k = trimEnvValue(key);
  return k.split('.').length >= 2 && k.length >= 3;
}

export function isUsableSupabaseEnv(opts: {
  url?: string;
  serviceKey?: string;
}): boolean {
  const url = trimEnvValue(opts.url);
  const serviceKey = trimEnvValue(opts.serviceKey);
  if (!url || !serviceKey) return false;
  try {
    new URL(url);
  } catch {
    return false;
  }
  return isLikelyJwt(serviceKey);
}