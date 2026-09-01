import { NextRequest, NextResponse } from 'next/server';

// Synthetic analytics data. In production this would query a real tracking
// service. The shape is designed to match what the MarketingPanel expects so
// swapping in a real provider is a one-line change.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from') || '2026-07-01';
  const to = searchParams.get('to') || '2026-08-31';

  // Deterministic-ish synthetic data based on date range
  const seedFrom = new Date(from).getTime() || Date.now();
  const seedTo = new Date(to).getTime() || Date.now();
  const span = Math.max(1, Math.min(60, Math.round((seedTo - seedFrom) / 86_400_000)));

  const rand = (i: number) => Math.abs(Math.sin(seedFrom / 1e9 + i)) * 1000;
  const metrics = {
    uniqueVisitors: Math.round(rand(1) * 4),
    totalVisits: Math.round(rand(2) * 8),
    pageViews: Math.round(rand(3) * 24),
    avgTime: '04:32',
    avgDuration: '06:18',
  };

  const visitsByDay = Array.from({ length: span }, (_, i) => ({
    day: i,
    visits: Math.floor(80 + rand(100 + i) * 0.3),
  }));

  return NextResponse.json({
    success: true,
    from,
    to,
    metrics,
    visitsByDay,
    topPages: [
      { path: '/', visitors: Math.round(metrics.uniqueVisitors * 0.9), views: Math.round(metrics.pageViews * 0.34) },
      { path: '/xr-world/virtual-tour', visitors: Math.round(metrics.uniqueVisitors * 0.79), views: Math.round(metrics.pageViews * 0.37) },
      { path: '/xr-world/virtual-tour/client/VIZTR-882', visitors: Math.round(metrics.uniqueVisitors * 0.46), views: Math.round(metrics.pageViews * 0.19) },
    ],
    topSources: [
      { source: 'Google', visitors: Math.round(metrics.uniqueVisitors * 0.46), views: Math.round(metrics.pageViews * 0.19) },
      { source: 'Direct', visitors: Math.round(metrics.uniqueVisitors * 0.25), views: Math.round(metrics.pageViews * 0.10) },
      { source: 'Twitter', visitors: Math.round(metrics.uniqueVisitors * 0.10), views: Math.round(metrics.pageViews * 0.05) },
    ],
    topCountries: [
      { country: 'United States', visitors: Math.round(metrics.uniqueVisitors * 0.35), views: Math.round(metrics.pageViews * 0.16) },
      { country: 'United Kingdom', visitors: Math.round(metrics.uniqueVisitors * 0.20), views: Math.round(metrics.pageViews * 0.09) },
      { country: 'Germany', visitors: Math.round(metrics.uniqueVisitors * 0.14), views: Math.round(metrics.pageViews * 0.05) },
    ],
    topDevices: [
      { device: 'Desktop', visitors: Math.round(metrics.uniqueVisitors * 0.54), views: Math.round(metrics.pageViews * 0.25) },
      { device: 'Mobile', visitors: Math.round(metrics.uniqueVisitors * 0.30), views: Math.round(metrics.pageViews * 0.13) },
      { device: 'Tablet', visitors: Math.round(metrics.uniqueVisitors * 0.06), views: Math.round(metrics.pageViews * 0.03) },
    ],
  });
}
