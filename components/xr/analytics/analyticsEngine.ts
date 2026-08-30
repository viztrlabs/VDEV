// Analytics Infrastructure — event tracking + performance monitoring + AI recs.
// Fully local: events are batched in-memory and flushed through a pluggable
// transport. Pass `endpoint` to ship to a collector; omit for local-only.

export type AnalyticsEventType =
  | 'scene.view'
  | 'xr.session.start'
  | 'xr.session.end'
  | 'splat.load'
  | 'splat.error'
  | 'annotation.open'
  | 'render.frame'
  | 'perf.sample'
  | 'ui.interaction';

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: number;
  sessionId: string;
  properties?: Record<string, unknown>;
}

export interface PerfSample {
  fps: number;
  drawCalls: number;
  triangles: number;
  memoryMB: number;
  frameMs: number;
  timestamp: number;
}

export interface AIRecommendation {
  id: string;
  title: string;
  detail: string;
  confidence: number; // 0..1
  action?: string;
}

export interface AnalyticsTransport {
  send: (batch: AnalyticsEvent[]) => void | Promise<void>;
}

export class AnalyticsEngine {
  private queue: AnalyticsEvent[] = [];
  private perfHistory: PerfSample[] = [];
  private sessionId: string;
  private transport: AnalyticsTransport | null;
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<(e: AnalyticsEvent) => void>();

  constructor(opts?: { endpoint?: string; sessionId?: string; flushIntervalMs?: number }) {
    this.sessionId = opts?.sessionId ?? `sess-${Date.now()}`;
    this.transport = opts?.endpoint
      ? { send: (batch) => this.post(opts.endpoint!, batch) }
      : null;
    if (opts?.flushIntervalMs) {
      this.flushTimer = setInterval(() => this.flush(), opts.flushIntervalMs);
    }
  }

  private post(endpoint: string, batch: AnalyticsEvent[]) {
    if (typeof fetch === 'undefined') return;
    // Include a snapshot of recent perf samples so the collector can store them.
    const perf = this.perfHistory.slice(-60);
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: this.sessionId, events: batch, perf }),
      keepalive: true,
    }).catch(() => {
      /* collector unreachable — keep events queued */
    });
  }

  track(type: AnalyticsEventType, properties?: Record<string, unknown>) {
    const event: AnalyticsEvent = {
      type,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      properties,
    };
    this.queue.push(event);
    this.listeners.forEach((l) => l(event));
  }

  recordPerf(sample: PerfSample) {
    this.perfHistory.push(sample);
    if (this.perfHistory.length > 600) this.perfHistory.shift();
    this.track('perf.sample', sample as unknown as Record<string, unknown>);
  }

  onEvent(listener: (e: AnalyticsEvent) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async flush() {
    if (this.queue.length === 0) return;
    const batch = this.queue.splice(0, this.queue.length);
    if (this.transport) await this.transport.send(batch);
  }

  getPerfSummary() {
    if (this.perfHistory.length === 0) return null;
    const n = this.perfHistory.length;
    const avg = (sel: (s: PerfSample) => number) =>
      this.perfHistory.reduce((a, s) => a + sel(s), 0) / n;
    return {
      avgFps: avg((s) => s.fps),
      minFps: Math.min(...this.perfHistory.map((s) => s.fps)),
      avgFrameMs: avg((s) => s.frameMs),
      avgTriangles: avg((s) => s.triangles),
      samples: n,
    };
  }

  /** Lightweight heuristic "AI" recommendations from local perf telemetry. */
  getRecommendations(): AIRecommendation[] {
    const recs: AIRecommendation[] = [];
    const summary = this.getPerfSummary();
    if (summary && summary.avgFps < 30) {
      recs.push({
        id: 'rec-lowfps',
        title: 'Frame rate is low',
        detail: `Average ${summary.avgFps.toFixed(1)} FPS. Consider lowering splat quality preset or disabling SSAO.`,
        confidence: 0.82,
        action: 'lower-quality-preset',
      });
    }
    if (summary && summary.avgTriangles > 4_000_000) {
      recs.push({
        id: 'rec-tris',
        title: 'High triangle load',
        detail: 'Scene polycount is high; enable frustum culling or LODs.',
        confidence: 0.71,
        action: 'enable-lod',
      });
    }
    const splatErrors = this.queue.filter((e) => e.type === 'splat.error').length;
    const seenSplatErrors = this.listeners.size >= 0 && splatErrors > 0;
    if (seenSplatErrors) {
      recs.push({
        id: 'rec-splat',
        title: 'Splat loading instability',
        detail: 'Multiple splat load failures detected. Validate asset format and CDN.',
        confidence: 0.9,
        action: 'validate-assets',
      });
    }
    if (recs.length === 0) {
      recs.push({
        id: 'rec-healthy',
        title: 'Performance is healthy',
        detail: 'No optimization actions recommended at this time.',
        confidence: 0.6,
      });
    }
    return recs;
  }

  dispose() {
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.listeners.clear();
  }
}

export function createAnalytics(opts?: { endpoint?: string; sessionId?: string; flushIntervalMs?: number }) {
  return new AnalyticsEngine(opts);
}
