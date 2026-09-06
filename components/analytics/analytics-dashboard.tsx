'use client';

import React, { useMemo } from 'react';

type AnalyticsEvent = {
  kind: 'event' | 'perf' | 'rec';
  sessionId: string;
  ts: number;
  [key: string]: any;
};

type SparklineProps = {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
};

export function Sparkline({ values, width = 120, height = 32, color = '#3ECF8E' }: SparklineProps) {
  const path = useMemo(() => {
    if (!values.length) return '';
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    const step = width / Math.max(values.length - 1, 1);
    return values
      .map((v, i) => {
        const x = i * step;
        const y = height - ((v - min) / range) * height;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [values, width, height]);

  if (!values.length) {
    return <div className="text-[10px] font-mono text-[#71717A]">No data</div>;
  }

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type MetricCardProps = {
  title: string;
  value: number;
  unit?: string;
  trend?: number[];
  color?: string;
};

export function MetricCard({ title, value, unit = '', trend, color = '#3ECF8E' }: MetricCardProps) {
  return (
    <div className="rounded border border-[#27272A] bg-[#0F0F11] p-4">
      <div className="text-[10px] font-mono text-[#71717A]">{title}</div>
      <div className="flex items-end gap-3">
        <div className="text-xl font-mono text-white">
          {value.toLocaleString()}
          {unit && <span className="text-[11px] text-[#71717A] ml-1">{unit}</span>}
        </div>
        {trend && trend.length > 1 && <Sparkline values={trend} color={color} />}
      </div>
    </div>
  );
}

type AnalyticsDashboardProps = {
  events: AnalyticsEvent[];
};

export function AnalyticsDashboard({ events }: AnalyticsDashboardProps) {
  const stats = useMemo(() => {
    const now = Date.now();
    const last24h = events.filter((e) => now - e.ts < 24 * 60 * 60 * 1000);
    const eventCount = last24h.filter((e) => e.kind === 'event').length;
    const perfCount = last24h.filter((e) => e.kind === 'perf').length;
    const recCount = last24h.filter((e) => e.kind === 'rec').length;

    const fpsValues = last24h
      .filter((e) => e.kind === 'perf' && typeof e.fps === 'number')
      .map((e) => e.fps as number)
      .slice(-20);

    const memoryValues = last24h
      .filter((e) => e.kind === 'perf' && typeof e.memoryMB === 'number')
      .map((e) => e.memoryMB as number)
      .slice(-20);

    const sessions = new Set(last24h.map((e) => e.sessionId)).size;
    const errors = last24h.filter((e) => e.kind === 'event' && e.type === 'error').length;
    const warnings = last24h.filter((e) => e.kind === 'event' && e.type === 'warning').length;

    const kindBuckets = last24h.reduce<Record<string, number>>((acc, e) => {
      acc[e.kind] = (acc[e.kind] || 0) + 1;
      return acc;
    }, {});

    const typeBuckets = last24h
      .filter((e) => e.kind === 'event')
      .reduce<Record<string, number>>((acc, e) => {
        const key = (e.type as string) || 'unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

    return {
      eventCount,
      perfCount,
      recCount,
      sessions,
      errors,
      warnings,
      fpsValues,
      memoryValues,
      kindBuckets,
      typeBuckets,
    };
  }, [events]);

  const recent = useMemo(() => events.slice(0, 25), [events]);

  const formatDate = (ts: number) => new Date(ts).toISOString().replace('T', ' ').slice(0, 19);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard title="Events (24h)" value={stats.eventCount} color="#3ECF8E" />
        <MetricCard title="Perf Samples" value={stats.perfCount} trend={stats.fpsValues} color="#60A5FA" />
        <MetricCard title="Recommendations" value={stats.recCount} color="#F472B6" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded border border-[#27272A] bg-[#0F0F11] p-4">
          <div className="text-[10px] font-mono text-[#71717A]">Sessions (24h)</div>
          <div className="text-xl font-mono text-white">{stats.sessions}</div>
        </div>
        <div className="rounded border border-[#27272A] bg-[#0F0F11] p-4">
          <div className="text-[10px] font-mono text-[#71717A]">Errors</div>
          <div className="text-xl font-mono text-rose-300">{stats.errors}</div>
        </div>
        <div className="rounded border border-[#27272A] bg-[#0F0F11] p-4">
          <div className="text-[10px] font-mono text-[#71717A]">Warnings</div>
          <div className="text-xl font-mono text-amber-300">{stats.warnings}</div>
        </div>
        <div className="rounded border border-[#27272A] bg-[#0F0F11] p-4">
          <div className="text-[10px] font-mono text-[#71717A]">Avg Memory</div>
          <div className="text-xl font-mono text-white">
            {stats.memoryValues.length ? Math.round(stats.memoryValues.reduce((a, b) => a + b, 0) / stats.memoryValues.length) : 0}
            <span className="text-[11px] text-[#71717A] ml-1">MB</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded border border-[#27272A] bg-[#0F0F11] p-4">
          <div className="text-[11px] font-mono text-[#A1A1AA] mb-2">Event Types</div>
          <div className="space-y-1">
            {Object.entries(stats.typeBuckets).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-[11px] font-mono text-[#A1A1AA]">
                <span className="capitalize">{key}</span>
                <span className="text-white">{value}</span>
              </div>
            ))}
            {!Object.keys(stats.typeBuckets).length && (
              <div className="text-[11px] font-mono text-[#71717A]">No event types yet.</div>
            )}
          </div>
        </div>
        <div className="rounded border border-[#27272A] bg-[#0F0F11] p-4">
          <div className="text-[11px] font-mono text-[#A1A1AA] mb-2">Kind Distribution</div>
          <div className="space-y-1">
            {Object.entries(stats.kindBuckets).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-[11px] font-mono text-[#A1A1AA]">
                <span className="capitalize">{key}</span>
                <span className="text-white">{value}</span>
              </div>
            ))}
            {!Object.keys(stats.kindBuckets).length && (
              <div className="text-[11px] font-mono text-[#71717A]">No kinds yet.</div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded border border-[#27272A] bg-[#0F0F11]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272A]">
          <div>
            <div className="text-[11px] font-mono text-[#A1A1AA]">Recent Activity</div>
            <div className="text-[10px] font-mono text-[#71717A]">Last {recent.length} items from local ingestion</div>
          </div>
          <button
            type="button"
            onClick={() => {
              const blob = new Blob([JSON.stringify(recent, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `analytics-export-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-2 py-1 rounded border border-[#27272A] bg-[#09090B] text-[10px] font-mono text-[#A1A1AA] hover:text-white"
          >
            Export JSON
          </button>
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
                  <td className="px-3 py-2 capitalize">{row.kind}</td>
                  <td className="px-3 py-2">{row.sessionId}</td>
                  <td className="px-3 py-2 max-w-xl truncate" title={JSON.stringify(row)}>
                    {JSON.stringify(row)}
                  </td>
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
  );
}
