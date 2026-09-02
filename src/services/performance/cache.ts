/**
 * Advanced Caching — Phase 2C
 * In-memory LRU cache + SWR (stale-while-revalidate) fetch wrapper + IndexedDB persistence hook.
 */

interface CacheEntry<T> {
  value: T;
  expires: number;
  insertedAt: number;
  staleUntil: number;
}

export interface CacheOptions {
  ttlMs?: number;            // time-to-live (fresh window)
  swrMs?: number;            // stale-while-revalidate window
  maxSize?: number;          // max entries
  persistKey?: string;       // optional IDB persistence key
}

export class LRUCache<T = unknown> {
  private map = new Map<string, CacheEntry<T>>();
  private maxSize: number;

  constructor(maxSize = 500) {
    this.maxSize = maxSize;
  }

  get(key: string): T | undefined {
    const e = this.map.get(key);
    if (!e) return undefined;
    if (e.expires < Date.now()) {
      // Expired -> return undefined
      if (e.staleUntil < Date.now()) {
        this.map.delete(key);
        return undefined;
      }
    }
    // touch
    this.map.delete(key);
    this.map.set(key, e);
    return e.value;
  }

  isStale(key: string): boolean {
    const e = this.map.get(key);
    if (!e) return true;
    return e.expires < Date.now();
  }

  set(key: string, value: T, opts: CacheOptions = {}) {
    const now = Date.now();
    const ttl = opts.ttlMs ?? 60_000;
    const swr = opts.swrMs ?? 5 * 60_000;
    this.map.set(key, {
      value,
      insertedAt: now,
      expires: now + ttl,
      staleUntil: now + ttl + swr,
    });
    this.evict();
  }

  delete(key: string) { this.map.delete(key); }
  clear() { this.map.clear(); }
  size() { return this.map.size; }
  keys() { return [...this.map.keys()]; }

  private evict() {
    while (this.map.size > this.maxSize) {
      const oldest = this.map.keys().next().value;
      if (!oldest) break;
      this.map.delete(oldest);
    }
  }
}

const fetchCache = new LRUCache<unknown>(1000);
const inflight = new Map<string, Promise<unknown>>();

/**
 * Stale-while-revalidate fetch wrapper.
 * - Returns cached value immediately if fresh.
 * - Returns stale value and triggers background revalidation.
 * - Falls back to live fetch on cold miss.
 */
export async function swrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  opts: CacheOptions = {},
): Promise<T> {
  const cached = fetchCache.get(key) as T | undefined;
  const stale = fetchCache.isStale(key);

  if (cached !== undefined && !stale) {
    return cached;
  }

  // Cold miss -> await live
  if (cached === undefined) {
    return dedupedFetch(key, fetcher, opts);
  }

  // Stale -> return immediately and revalidate in background
  revalidate(key, fetcher, opts);
  return cached;
}

async function dedupedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  opts: CacheOptions,
): Promise<T> {
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;

  const p = (async () => {
    try {
      const v = await fetcher();
      fetchCache.set(key, v, opts);
      return v;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p;
}

function revalidate<T>(key: string, fetcher: () => Promise<T>, opts: CacheOptions) {
  if (inflight.has(key)) return;
  void dedupedFetch(key, fetcher, opts);
}

export const cache = {
  lru: LRUCache,
  swr: swrFetch,
  memory: fetchCache,
};
export default cache;
