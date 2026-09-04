'use client';

import { useEffect, useState } from 'react';

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

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toISOString().replace('T', ' ').slice(0, 19);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <div className="px-4 sm:px-6 py-3 border-b border-[#27272A]">
        <h1 className="text-sm font-mono font-bold text-white">Analytics</h1>
        <p className="text-[10px] font-mono text-[#71717A]">Recent telemetry from client-side ingestion</p>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {loading && <div className="text-[11px] font-mono text-[#71717A]">Loading analytics…</div>}
        {error && <div className="rounded border border-rose-500/40 bg-rose-500/10 p-3 text-[11px] font-mono text-rose-300">{error}</div>}
        {!loading && !error && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded border border-[#27272A] bg-[#0F0F11] p-4">
                <div className="text-[10px] font-mono text-[#71717A]">Events</div>
                <div className="text-xl font-mono text-white">{recent.filter(r => r.kind === 'event').length}</div>
              </div>
              <div className="rounded border border-[#27272A] bg-[#0F0F11] p-4">
                <div className="text-[10px] font-mono text-[#71717A]">Perf Samples</div>
                <div className="text-xl font-mono text-white">{recent.filter(r => r.kind === 'perf').length}</div>
              </div>
              <div className="rounded border border-[#27272A] bg-[#0F0F11] p-4">
                <div className="text-[10px] font-mono text-[#71717A]">Recommendations</div>
                <div className="text-xl font-mono text-white">{recent.filter(r => r.kind === 'rec').length}</div>
              </div>
            </div>
            <div className="rounded border border-[#27272A] bg-[#0F0F11]">
              <div className="px-4 py-3 border-b border-[#27272A]">
                <div className="text-[11px] font-mono text-[#A1A1AA]">Recent Activity</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] font-mono text-[#A1A1AA]">
                  <thead className="text-[#71717A]">
                    <tr>
                      <th className="px-3 py-2">Time</th>
                      <th className="px-3 py-2">Kind</th>
                      <th className="px-3 py-2">Session</th>
                      <th className="px-3 py-2">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((row, idx) => (
                      <tr key={`${row.kind}-${row.ts}-${idx}`} className="border-t border-[#27272A]">
                        <td className="px-3 py-2 text-white">{formatDate(row.ts)}</td>
                        <td className="px-3 py-2">{row.kind}</td>
                        <td className="px-3 py-2">{row.sessionId}</td>
                        <td className="px-3 py-2">{JSON.stringify(row).slice(0, 120)}</td>
                      </tr>
                    ))}
                    {recent.length === 0 && (
                      <tr>
                        <td className="px-3 py-3 text-[#71717A]" colSpan={4}>No analytics data yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
