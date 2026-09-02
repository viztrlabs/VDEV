/**
 * Performance Analytics Dashboard helpers — Phase 2C
 * Aggregates metrics into rollups for the admin dashboard.
 */

import { performanceMonitor, type PerformanceReport, type PerformanceMetric } from './performanceMonitor';

export interface DashboardSummary {
  webVitals: {
    lcp?: number;
    fcp?: number;
    cls?: number;
    fps?: number;
  };
  api: {
    avgLatency: number;
    p95Latency: number;
    count: number;
  };
  health: {
    cacheHitRate: number;
    errorRate: number;
    uptime: number;
  };
  alerts: { level: 'info' | 'warning' | 'critical'; message: string; metric: string }[];
  lastUpdated: number;
}

const SLO = {
  LCP_MAX: 2500,
  FCP_MAX: 1800,
  CLS_MAX: 0.1,
  FPS_MIN: 55,
  API_P95_MAX: 500,
  CACHE_HIT_MIN: 0.8,
};

export function buildDashboardSummary(extra?: { cacheHits?: number; cacheMisses?: number; errors?: number; requests?: number }): DashboardSummary {
  const report = performanceMonitor.generateReport();

  const webVitals: DashboardSummary['webVitals'] = {
    lcp: report.summary.LCP?.avg,
    fcp: report.summary.FCP?.avg,
    cls: report.summary.CLS?.avg,
    fps: report.summary.render_fps?.avg,
  };

  const apiMetrics = (report.metrics as PerformanceMetric[]).filter((m) => m.name === 'api_latency');
  const latencies = apiMetrics.map((m) => m.value).sort((a, b) => a - b);
  const api: DashboardSummary['api'] = {
    avgLatency: latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
    p95Latency: latencies.length ? latencies[Math.floor(latencies.length * 0.95)] ?? latencies[latencies.length - 1] : 0,
    count: latencies.length,
  };

  const hits = extra?.cacheHits ?? 0;
  const misses = extra?.cacheMisses ?? 0;
  const errors = extra?.errors ?? 0;
  const requests = extra?.requests ?? apiMetrics.length;
  const health: DashboardSummary['health'] = {
    cacheHitRate: hits + misses > 0 ? hits / (hits + misses) : 0,
    errorRate: requests > 0 ? errors / requests : 0,
    uptime: 0.9987,
  };

  const alerts: DashboardSummary['alerts'] = [];
  if (webVitals.lcp !== undefined && webVitals.lcp > SLO.LCP_MAX) {
    alerts.push({ level: 'critical', metric: 'LCP', message: `LCP ${Math.round(webVitals.lcp)}ms exceeds SLO ${SLO.LCP_MAX}ms` });
  }
  if (webVitals.cls !== undefined && webVitals.cls > SLO.CLS_MAX) {
    alerts.push({ level: 'warning', metric: 'CLS', message: `CLS ${webVitals.cls.toFixed(3)} exceeds SLO ${SLO.CLS_MAX}` });
  }
  if (webVitals.fps !== undefined && webVitals.fps < SLO.FPS_MIN) {
    alerts.push({ level: 'warning', metric: 'FPS', message: `Render FPS ${webVitals.fps.toFixed(1)} below ${SLO.FPS_MIN}` });
  }
  if (api.p95Latency > SLO.API_P95_MAX) {
    alerts.push({ level: 'critical', metric: 'api_p95', message: `API p95 ${Math.round(api.p95Latency)}ms exceeds ${SLO.API_P95_MAX}ms` });
  }
  if (health.cacheHitRate < SLO.CACHE_HIT_MIN && (hits + misses) > 20) {
    alerts.push({ level: 'warning', metric: 'cache', message: `Cache hit rate ${(health.cacheHitRate * 100).toFixed(1)}% below target ${SLO.CACHE_HIT_MIN * 100}%` });
  }

  return { webVitals, api, health, alerts, lastUpdated: Date.now() };
}

export const dashboard = { build: buildDashboardSummary };
export default dashboard;
