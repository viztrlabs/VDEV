/**
 * Resolve a stored model key / URL into a browser-loadable URL.
 *
 * Bare keys such as `models/r2-123-scene.glb` must NEVER resolve relative to the
 * current route (e.g. `/admin/models/...`). They resolve to, in order:
 *   1. an absolute URL (http/https/blob/data/protocol-relative) — unchanged
 *   2. an already root-relative path (`/...`) — unchanged
 *   3. the configured Cloudflare R2 public base (`NEXT_PUBLIC_R2_PUBLIC_URL`)
 *   4. a root-relative `/models/...` path
 */
export const DEMO_MODEL_URL = '/assets/bmw-i8.glb';

export function resolveModelUrl(raw?: string | null): string {
  const url = (raw || '').trim();
  if (!url) return DEMO_MODEL_URL;

  // Absolute / protocol-relative / blob / data URLs are used as-is.
  if (/^(https?:|blob:|data:|\/\/)/i.test(url)) return url;

  // Already root-relative.
  if (url.startsWith('/')) return url;

  const key = url.replace(/^\/+/, '');
  const r2 = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '').replace(/\/+$/, '');
  if (r2) return `${r2}/${key}`;

  // Local / no-R2 fallback: root-relative, never route-relative.
  return key.startsWith('models/') ? `/${key}` : `/models/${key}`;
}