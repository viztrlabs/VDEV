/**
 * CDN Integration — Phase 2C
 * Asset URL rewriting, edge cache hints, and image optimization helpers.
 */

const CDN_DOMAINS: Record<string, string> = {
  // Map origin hosts to CDN edge hosts
  images: process.env.NEXT_PUBLIC_CDN_IMAGES ?? 'cdn.viztr.dev',
  assets: process.env.NEXT_PUBLIC_CDN_ASSETS ?? 'assets.viztr.dev',
  static: process.env.NEXT_PUBLIC_CDN_STATIC ?? 'static.viztr.dev',
};

const ALLOWED_ORIGINS = new Set([
  'picsum.photos',
  'images.unsplash.com',
  'plus.unsplash.com',
  'assets.mixkit.co',
  'lh3.googleusercontent.com',
  'drive.google.com',
]);

/**
 * Rewrite a public asset path through the asset CDN.
 */
export function cdnAsset(path: string, opts: { cacheTtl?: number; immutable?: boolean } = {}): string {
  if (!path || path.startsWith('http')) return path;
  const clean = path.startsWith('/') ? path.slice(1) : path;
  const url = `https://${CDN_DOMAINS.assets}/${clean}`;
  return appendCacheHints(url, opts);
}

/**
 * Rewrite an image URL through the image CDN with format/size hints.
 */
export function cdnImage(
  src: string,
  opts: { w?: number; h?: number; quality?: number; format?: 'webp' | 'avif' | 'auto' } = {},
): string {
  if (!src) return src;
  // Leave absolute URLs from whitelisted origins untouched
  try {
    const u = new URL(src);
    if (ALLOWED_ORIGINS.has(u.hostname)) return src;
  } catch { /* relative path */ }

  // Local upload paths -> cdn images
  if (src.startsWith('/') || !src.startsWith('http')) {
    const clean = src.replace(/^\//, '');
    const params = new URLSearchParams();
    if (opts.w) params.set('w', String(opts.w));
    if (opts.h) params.set('h', String(opts.h));
    if (opts.quality) params.set('q', String(opts.quality));
    if (opts.format) params.set('fm', opts.format);
    const qs = params.toString();
    return `https://${CDN_DOMAINS.images}/${clean}${qs ? `?${qs}` : ''}`;
  }

  return src;
}

/**
 * Build a srcset for responsive image loading.
 */
export function buildSrcSet(
  src: string,
  widths: number[] = [320, 640, 960, 1280, 1920],
  opts: { quality?: number; format?: 'webp' | 'avif' | 'auto' } = {},
): string {
  return widths
    .map((w) => `${cdnImage(src, { ...opts, w })} ${w}w`)
    .join(', ');
}

/**
 * Build Cache-Control / CDN cache hint headers for an asset response.
 */
export function buildCacheHeaders(ttlSeconds: number, opts: { immutable?: boolean; staleWhileRevalidate?: number } = {}): Record<string, string> {
  const directives: string[] = [`public`, `max-age=${ttlSeconds}`];
  if (opts.immutable) directives.push('immutable');
  if (opts.staleWhileRevalidate) {
    directives.push(`stale-while-revalidate=${opts.staleWhileRevalidate}`);
  }
  return {
    'Cache-Control': directives.join(', '),
    'CDN-Cache-Control': `max-age=${ttlSeconds}`,
    'Vary': 'Accept-Encoding, Accept',
  };
}

function appendCacheHints(url: string, opts: { cacheTtl?: number; immutable?: boolean }): string {
  if (!opts.cacheTtl && !opts.immutable) return url;
  const sep = url.includes('?') ? '&' : '?';
  const params = new URLSearchParams();
  if (opts.cacheTtl) params.set('ttl', String(opts.cacheTtl));
  if (opts.immutable) params.set('immutable', '1');
  return `${url}${sep}${params.toString()}`;
}

/**
 * Edge-region preference for client-side hinting.
 */
export function getEdgeRegion(): string {
  if (typeof navigator === 'undefined') return 'global';
  const lang = navigator.language || 'en';
  if (lang.startsWith('en')) return 'us-east';
  if (lang.startsWith('de') || lang.startsWith('fr') || lang.startsWith('es')) return 'eu-west';
  if (lang.startsWith('ja') || lang.startsWith('ko') || lang.startsWith('zh')) return 'ap-east';
  return 'global';
}

export const cdn = {
  asset: cdnAsset,
  image: cdnImage,
  srcset: buildSrcSet,
  headers: buildCacheHeaders,
  edge: getEdgeRegion,
};
export default cdn;
