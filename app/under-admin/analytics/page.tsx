'use client';

import { useEffect, useState } from 'react';
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';

type AnalyticsEvent = {
  kind: 'event' | 'perf' | 'rec';
  sessionId: string;
  ts: number;
  [key: string]: any;
};

export default function AnalyticsPage() {
  const [recent, setRecent] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/analytics');
        const json = await res.json();
        if (!res.ok || json.success === false) throw new Error(json.error || 'Failed to load analytics');
        if (!cancelled) setRecent(json.recent || []);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load analytics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <div className="px-4 sm:px-6 py-3 border-b border-[#27272A]">
        <h1 className="text-sm font-mono font-bold text-white">Analytics</h1>
        <p className="text-[10px] font-mono text-[#71717A]">Recent telemetry from client-side ingestion</p>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {loading && <div className="text-[11px] font-mono text-[#71717A]">Loading analytics…</div>}
        {error && <div className="rounded border border-rose-500/40 bg-rose-500/10 p-3 text-[11px] font-mono text-rose-300">{error}</div>}
        {!loading && !error && <AnalyticsDashboard events={recent} />}
      </div>
    </div>
  );
}
