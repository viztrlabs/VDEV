/**
 * Performance Monitoring Service — Phase 2C
 * Tracks Web Vitals, API latency, render performance, and custom metrics.
 * Persists metrics in-memory with optional remote flush to analytics endpoint.
 */

export type MetricName =
  | 'LCP' // Largest Contentful Paint
  | 'FID' // First Input Delay
  | 'CLS' // Cumulative Layout Shift
  | 'FCP' // First Contentful Paint
  | 'TTFB' // Time to First Byte
  | 'INP' // Interaction to Next Paint
  | 'api_latency'
  | 'render_fps'
  | 'websocket_latency'
  | 'cache_hit_rate'
  | 'db_query_time'
  | 'custom';

export interface PerformanceMetric {
  name: MetricName;
  value: number;
  unit: 'ms' | 's' | 'fps' | 'ratio' | 'bytes' | 'count';
  timestamp: number;
  context?: Record<string, string | number | boolean>;
  route?: string;
  userId?: string;
}

export interface PerformanceReport {
  timestamp: number;
  sessionId: string;
  metrics: PerformanceMetric[];
  summary: Record<string, { avg: number; min: number; max: number; count: number }>;
}

const SESSION_ID = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const METRIC_BUFFER: PerformanceMetric[] = [];
const MAX_BUFFER = 500;
const FLUSH_INTERVAL_MS = 30_000; // 30s
const FLUSH_ENDPOINT = '/api/analytics/performance';

class PerformanceMonitor {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private observers: PerformanceObserver[] = [];
  private isClient = typeof window !== 'undefined';

  constructor() {
    if (this.isClient) {
      this.startWebVitals();
      this.startFlushInterval();
      this.trackPageVisibility();
    }
  }

  // ---------- Core API ----------

  track(name: MetricName, value: number, opts: Partial<PerformanceMetric> = {}) {
    const metric: PerformanceMetric = {
      name,
      value,
      unit: opts.unit ?? this.inferUnit(name),
      timestamp: Date.now(),
      route: this.isClient ? window.location.pathname : undefined,
      ...opts,
    };
    METRIC_BUFFER.push(metric);
    if (METRIC_BUFFER.length > MAX_BUFFER) METRIC_BUFFER.shift();
  }

  startTimer(name: MetricName) {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.track(name, duration, { unit: 'ms' });
      return duration;
    };
  }

  async measure<T>(name: MetricName, fn: () => Promise<T> | T): Promise<T> {
    const end = this.startTimer(name);
    try {
      return await fn();
    } finally {
      end();
    }
  }

  getBuffer(): readonly PerformanceMetric[] {
    return METRIC_BUFFER;
  }

  generateReport(): PerformanceReport {
    const summary: PerformanceReport['summary'] = {};
    for (const m of METRIC_BUFFER) {
      const s = (summary[m.name] ??= { avg: 0, min: Infinity, max: -Infinity, count: 0 });
      s.count++;
      s.avg = (s.avg * (s.count - 1) + m.value) / s.count;
      s.min = Math.min(s.min, m.value);
      s.max = Math.max(s.max, m.value);
    }
    return {
      timestamp: Date.now(),
      sessionId: SESSION_ID,
      metrics: [...METRIC_BUFFER],
      summary,
    };
  }

  clear() {
    METRIC_BUFFER.length = 0;
  }

  dispose() {
    if (this.intervalId) clearInterval(this.intervalId);
    for (const o of this.observers) try { o.disconnect(); } catch { /* noop */ }
    this.observers = [];
  }

  // ---------- Web Vitals ----------

  private startWebVitals() {
    if (!this.isClient) return;
    // LCP
    try {
      const lcpObs = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) this.track('LCP', last.startTime, { unit: 'ms' });
      });
      lcpObs.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(lcpObs);
    } catch { /* unsupported */ }

    // FCP
    try {
      const fcpObs = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (e.name === 'first-contentful-paint') {
            this.track('FCP', e.startTime, { unit: 'ms' });
          }
        }
      });
      fcpObs.observe({ type: 'paint', buffered: true });
      this.observers.push(fcpObs);
    } catch { /* unsupported */ }

    // CLS
    try {
      let cls = 0;
      const clsObs = new PerformanceObserver((list) => {
        for (const e of list.getEntries() as PerformanceEntry[]) {
          const layoutShift = e as PerformanceEntry & { value: number; hadRecentInput?: boolean };
          if (!layoutShift.hadRecentInput) cls += layoutShift.value;
        }
        this.track('CLS', cls, { unit: 'ratio' });
      });
      clsObs.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(clsObs);
    } catch { /* unsupported */ }

    // Long tasks (proxy for INP)
    try {
      const ltObs = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          this.track('render_fps', 1000 / Math.max(e.duration, 1), { unit: 'fps', context: { task: 'long' } });
        }
      });
      ltObs.observe({ type: 'longtask', buffered: true });
      this.observers.push(ltObs);
    } catch { /* unsupported */ }
  }

  // ---------- Flush ----------

  private startFlushInterval() {
    if (!this.isClient) return;
    this.intervalId = setInterval(() => {
      if (METRIC_BUFFER.length === 0) return;
      if (document.visibilityState !== 'visible') return;
      this.flush();
    }, FLUSH_INTERVAL_MS);
  }

  private async flush() {
    if (METRIC_BUFFER.length === 0) return;
    const report = this.generateReport();
    try {
      // Use sendBeacon when available, fallback to fetch
      if (navigator.sendBeacon) {
        navigator.sendBeacon(FLUSH_ENDPOINT, JSON.stringify(report));
      } else {
        await fetch(FLUSH_ENDPOINT, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(report),
          keepalive: true,
        });
      }
      this.clear();
    } catch (err) {
      // Keep buffer on failure for retry
      if (process.env.NODE_ENV === 'development') {
        console.warn('[perf] flush failed', err);
      }
    }
  }

  private trackPageVisibility() {
    if (!this.isClient) return;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.flush();
    });
  }

  private inferUnit(name: MetricName): PerformanceMetric['unit'] {
    switch (name) {
      case 'render_fps': return 'fps';
      case 'CLS':
      case 'cache_hit_rate': return 'ratio';
      default: return 'ms';
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;
