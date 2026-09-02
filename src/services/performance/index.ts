/**
 * Performance barrel — Phase 2C
 * Re-exports the Phase 2C performance modules.
 */
export { performanceMonitor, default as performanceMonitorDefault } from './performanceMonitor';
export type { PerformanceMetric, PerformanceReport, MetricName } from './performanceMonitor';

export { resourceManager, default as resourceManagerDefault } from './resourceManager';

export { cdn, cdnAsset, cdnImage, buildSrcSet, buildCacheHeaders, getEdgeRegion } from './cdnIntegration';

export { cache, LRUCache, swrFetch } from './cache';
export type { CacheOptions } from './cache';

export { dashboard, buildDashboardSummary } from './analyticsDashboard';
export type { DashboardSummary } from './analyticsDashboard';
