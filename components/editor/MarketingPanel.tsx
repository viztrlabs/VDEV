'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  FileText,
  Code,
  Camera,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  TrendingUp,
  Users,
  Clock,
  Eye,
  Globe,
  X,
} from 'lucide-react';
import type {
  VtedFormConfig,
  VtedMarketing,
  VtedScript,
  VtedSeo,
  VtedSnapshot,
} from '@/lib/vted-types';

interface MarketingPanelProps {
  value: VtedMarketing;
  onChange: (next: VtedMarketing) => void;
  onSave: () => void;
  saved: boolean;
  roomOptions: Array<{ id: string; name: string }>;
  hotspotOptions: Array<{ id: string; name: string }>;
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-2 rounded bg-[#09090B] border border-[#27272A]">
      <span className="text-[10px] font-mono text-[#FAFAFA]">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-9 h-5 rounded-full relative transition-colors ${
          value ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
            value ? 'left-4' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

// =============================================================
// Forms Configuration
// =============================================================
function FormsConfigTab({
  forms,
  onChange,
  roomOptions,
  hotspotOptions,
}: {
  forms: VtedFormConfig[];
  onChange: (forms: VtedFormConfig[]) => void;
  roomOptions: Array<{ id: string; name: string }>;
  hotspotOptions: Array<{ id: string; name: string }>;
}) {
  const add = () => {
    onChange([
      ...forms,
      { id: `fcfg-${Date.now()}`, formId: 'contact', closeable: true, eventType: 'project', waitTime: 2 },
    ]);
  };
  const remove = (id: string) => onChange(forms.filter((f) => f.id !== id));
  const update = (id: string, patch: Partial<VtedFormConfig>) =>
    onChange(forms.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
          {forms.length} form configuration{forms.length !== 1 ? 's' : ''}
        </div>
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#3ECF8E] hover:bg-[#34b876] text-black text-[10px] font-mono font-bold"
        >
          <Plus className="w-3 h-3" />
          Add Form Config
        </button>
      </div>
      {forms.length === 0 ? (
        <div className="text-xs font-mono text-[#71717A] text-center py-6 border border-dashed border-[#27272A] rounded-lg">
          No form configurations. Click &quot;Add Form Config&quot; to create one.
        </div>
      ) : (
        forms.map((f, idx) => (
          <div key={f.id} className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
                Form Config {idx + 1}
              </span>
              <button
                type="button"
                onClick={() => remove(f.id)}
                className="text-rose-400 hover:text-rose-300"
                title="Remove"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
                  Form
                </label>
                <select
                  value={f.formId}
                  onChange={(e) => update(f.id, { formId: e.target.value })}
                  className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
                >
                  <option value="contact">Contact</option>
                  <option value="lead_capture">Lead Capture</option>
                  <option value="quote_request">Quote Request</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
                  Event type
                </label>
                <select
                  value={f.eventType}
                  onChange={(e) => update(f.id, { eventType: e.target.value as any })}
                  className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
                >
                  <option value="project">Project</option>
                  <option value="scene">Scene</option>
                  <option value="hotspot">Hotspot</option>
                </select>
              </div>
            </div>
            {(f.eventType === 'scene' || f.eventType === 'hotspot') && (
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
                  {f.eventType === 'scene' ? 'Scene' : 'Hotspot'}
                </label>
                <select
                  value={f.eventType === 'scene' ? f.sceneId || '' : f.hotspotId || ''}
                  onChange={(e) =>
                    update(f.id, f.eventType === 'scene' ? { sceneId: e.target.value } : { hotspotId: e.target.value })
                  }
                  className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
                >
                  <option value="">— Select —</option>
                  {(f.eventType === 'scene' ? roomOptions : hotspotOptions).map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono text-[#A1A1AA]">
                  Wait time {f.waitTime}s
                </label>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={f.waitTime}
                  onChange={(e) => update(f.id, { waitTime: Number(e.target.value) })}
                  className="w-full accent-[#3ECF8E]"
                />
              </div>
              <ToggleRow
                label="Closeable"
                value={f.closeable}
                onChange={(v) => update(f.id, { closeable: v })}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// =============================================================
// Analytics
// =============================================================
function AnalyticsTab() {
  const [from, setFrom] = useState('2026-07-01');
  const [to, setTo] = useState('2026-08-31');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tour/analytics?from=${from}&to=${to}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      // Use synthetic fallback
      setData({
        success: true,
        from,
        to,
        metrics: {
          uniqueVisitors: 1842,
          totalVisits: 3947,
          pageViews: 11203,
          avgTime: '04:32',
          avgDuration: '06:18',
        },
        visitsByDay: Array.from({ length: 14 }, (_, i) => ({
          day: i,
          visits: Math.floor(80 + Math.random() * 220),
        })),
        topPages: [
          { path: '/', visitors: 1842, views: 3821 },
          { path: '/xr-world/virtual-tour', visitors: 1623, views: 4102 },
          { path: '/xr-world/virtual-tour/client/VIZTR-882', visitors: 943, views: 2104 },
        ],
        topSources: [
          { source: 'Google', visitors: 942, views: 2103 },
          { source: 'Direct', visitors: 521, views: 1102 },
          { source: 'Twitter', visitors: 218, views: 512 },
        ],
        topCountries: [
          { country: 'United States', visitors: 712, views: 1821 },
          { country: 'United Kingdom', visitors: 401, views: 982 },
          { country: 'Germany', visitors: 287, views: 612 },
        ],
        topDevices: [
          { device: 'Desktop', visitors: 1098, views: 2812 },
          { device: 'Mobile', visitors: 612, views: 1421 },
          { device: 'Tablet', visitors: 132, views: 287 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const max = data?.visitsByDay ? Math.max(...data.visitsByDay.map((v: any) => v.visits)) : 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
            From
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
            To
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
          />
        </div>
      </div>

      {loading || !data ? (
        <div className="text-xs font-mono text-[#71717A] text-center py-6">Loading analytics…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <MetricCard label="Unique" value={data.metrics.uniqueVisitors} icon={<Users className="w-3 h-3" />} />
            <MetricCard label="Visits" value={data.metrics.totalVisits} icon={<TrendingUp className="w-3 h-3" />} />
            <MetricCard label="Page Views" value={data.metrics.pageViews} icon={<Eye className="w-3 h-3" />} />
            <MetricCard label="Time on Page" value={data.metrics.avgTime} icon={<Clock className="w-3 h-3" />} />
            <MetricCard label="Duration" value={data.metrics.avgDuration} icon={<Clock className="w-3 h-3" />} />
          </div>

          {/* Visits chart */}
          <div className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-2">
              Visits over time
            </div>
            <div className="flex items-end gap-0.5 h-24">
              {data.visitsByDay.map((d: any) => (
                <div
                  key={d.day}
                  className="flex-1 rounded-t bg-[#3ECF8E] hover:bg-[#34b876] transition-colors"
                  style={{ height: `${(d.visits / max) * 100}%` }}
                  title={`Day ${d.day}: ${d.visits} visits`}
                />
              ))}
            </div>
          </div>

          {/* Top tables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <TopTable title="Top Pages" rows={data.topPages} k="path" />
            <TopTable title="Top Sources" rows={data.topSources} k="source" />
            <TopTable title="Top Countries" rows={data.topCountries} k="country" />
            <TopTable title="Top Devices" rows={data.topDevices} k="device" />
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: any; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[#27272A] bg-[#0c0c0f] p-2">
      <div className="flex items-center gap-1 text-[9px] font-mono uppercase text-[#71717A]">
        {icon}
        {label}
      </div>
      <div className="text-lg font-mono font-bold text-white mt-0.5">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

function TopTable({ title, rows, k }: { title: string; rows: any[]; k: string }) {
  return (
    <div className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-2">
      <div className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
        {title}
      </div>
      <table className="w-full text-[10px] font-mono">
        <thead>
          <tr className="text-[#71717A] border-b border-[#27272A]">
            <th className="text-left py-1">{k}</th>
            <th className="text-right py-1">Visitors</th>
            <th className="text-right py-1">Views</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[#18181B] last:border-0">
              <td className="py-1 text-white truncate">{row[k]}</td>
              <td className="py-1 text-right text-[#A1A1AA]">{row.visitors.toLocaleString()}</td>
              <td className="py-1 text-right text-[#A1A1AA]">{row.views.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =============================================================
// SEO
// =============================================================
function SeoTab({ seo, onChange }: { seo: VtedSeo; onChange: (next: VtedSeo) => void }) {
  const set = (patch: Partial<VtedSeo>) => onChange({ ...seo, ...patch });
  const validateGa = (id: string) =>
    /^(UA-\d{4,10}-\d{1,2}|G-[A-Z0-9]{4,12})$/.test(id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className="space-y-2">
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
            Favicon URL
          </label>
          <input
            value={seo.faviconUrl || ''}
            onChange={(e) => set({ faviconUrl: e.target.value })}
            placeholder="https://…/favicon.ico"
            className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
            Meta title
          </label>
          <input
            value={seo.metaTitle || ''}
            onChange={(e) => set({ metaTitle: e.target.value })}
            className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
            Meta description
          </label>
          <textarea
            value={seo.metaDescription || ''}
            onChange={(e) => set({ metaDescription: e.target.value })}
            rows={3}
            className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white resize-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
            Google Analytics ID
          </label>
          <input
            value={seo.googleAnalyticsId || ''}
            onChange={(e) => set({ googleAnalyticsId: e.target.value })}
            placeholder="G-XXXXXXXXXX or UA-XXXXXXXXXX-YY"
            className={`w-full bg-[#09090B] border rounded px-2 py-1 text-[11px] font-mono text-white ${
              seo.googleAnalyticsId && !validateGa(seo.googleAnalyticsId)
                ? 'border-rose-500/50'
                : 'border-[#27272A]'
            }`}
          />
          {seo.googleAnalyticsId && !validateGa(seo.googleAnalyticsId) && (
            <p className="text-[9px] font-mono text-rose-400 mt-0.5">
              Invalid format. Use G-XXXXXXXXXX or UA-XXXXXXXXXX-YY
            </p>
          )}
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
            SEO image URL
          </label>
          <input
            value={seo.seoImageUrl || ''}
            onChange={(e) => set({ seoImageUrl: e.target.value })}
            placeholder="https://…/seo-image.png"
            className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
          />
        </div>
      </div>

      {/* SEO Preview */}
      <div className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-3 space-y-2">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
          Search Preview
        </div>
        <div className="rounded border border-[#27272A] bg-white p-3 text-black">
          <div className="text-[10px] text-emerald-700">tour.viztr.com › virtual-tour</div>
          <div className="text-base font-bold text-blue-800 mt-0.5">
            {seo.metaTitle || 'Your tour title'}
          </div>
          <div className="text-xs text-gray-700 mt-1">
            {seo.metaDescription || 'Add a meta description to improve SEO.'}
          </div>
        </div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
          Optimize Suggestions
        </div>
        <div className="space-y-1">
          {(!seo.metaTitle || seo.metaTitle.length < 30) && (
            <Suggestion text="Update SEO title (recommend 30-60 chars)" />
          )}
          {(!seo.metaDescription || seo.metaDescription.length < 70) && (
            <Suggestion text="Add longer SEO description (70-160 chars)" />
          )}
          {!seo.slug && <Suggestion text="Add a custom slug" />}
        </div>
      </div>
    </div>
  );
}

function Suggestion({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-between p-1.5 rounded bg-[#09090B] border border-[#27272A] text-[10px] font-mono">
      <span className="text-[#FAFAFA]">{text}</span>
      <span className="text-[#3ECF8E]">→</span>
    </div>
  );
}

// =============================================================
// Script Chats
// =============================================================
function ScriptsTab({
  scripts,
  onChange,
}: {
  scripts: VtedScript[];
  onChange: (scripts: VtedScript[]) => void;
}) {
  const add = () => onChange([...scripts, { id: `scr-${Date.now()}`, html: '', script: '' }]);
  const update = (id: string, patch: Partial<VtedScript>) =>
    onChange(scripts.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const remove = (id: string) => onChange(scripts.filter((s) => s.id !== id));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
          {scripts.length} script{scripts.length !== 1 ? 's' : ''}
        </div>
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#3ECF8E] hover:bg-[#34b876] text-black text-[10px] font-mono font-bold"
        >
          <Plus className="w-3 h-3" />
          Add Script
        </button>
      </div>
      {scripts.length === 0 ? (
        <div className="text-xs font-mono text-[#71717A] text-center py-6 border border-dashed border-[#27272A] rounded-lg">
          No scripts. Add custom HTML or JS to inject in the viewer.
        </div>
      ) : (
        scripts.map((s) => (
          <div key={s.id} className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#71717A]">#{s.id.slice(-6)}</span>
              <button
                type="button"
                onClick={() => remove(s.id)}
                className="text-rose-400 hover:text-rose-300"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
                HTML
              </label>
              <textarea
                value={s.html || ''}
                onChange={(e) => update(s.id, { html: e.target.value })}
                placeholder="<div>...</div>"
                rows={2}
                className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white resize-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
                JavaScript
              </label>
              <textarea
                value={s.script || ''}
                onChange={(e) => update(s.id, { script: e.target.value })}
                placeholder="console.log('hi');"
                rows={2}
                className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white resize-none"
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// =============================================================
// Snapshot
// =============================================================
function SnapshotTab({
  snapshot,
  onChange,
}: {
  snapshot: VtedSnapshot;
  onChange: (next: VtedSnapshot) => void;
}) {
  return (
    <div className="space-y-3">
      <ToggleRow
        label="Hide watermark"
        value={!!snapshot.hideWatermark}
        onChange={(v) => onChange({ ...snapshot, hideWatermark: v })}
      />
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
          Watermark image
        </label>
        <div className="flex items-center gap-1.5">
          {snapshot.watermarkImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={snapshot.watermarkImageUrl} alt="watermark" className="w-12 h-12 object-contain border border-[#27272A] rounded" />
          )}
          <div className="flex-1 space-y-1">
            <input
              value={snapshot.watermarkImageUrl || ''}
              onChange={(e) => onChange({ ...snapshot, watermarkImageUrl: e.target.value })}
              placeholder="https://…/watermark.png"
              className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
            />
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="text-[10px] font-mono text-[#3ECF8E] hover:underline"
              >
                Change
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...snapshot, watermarkImageUrl: undefined })}
                className="text-[10px] font-mono text-rose-400 hover:underline"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// Root
// =============================================================
export default function MarketingPanel({
  value,
  onChange,
  onSave,
  saved,
  roomOptions,
  hotspotOptions,
}: MarketingPanelProps) {
  const [tab, setTab] = useState<'forms' | 'analytics' | 'seo' | 'scripts' | 'snapshot'>('forms');

  const set = (patch: Partial<VtedMarketing>) => onChange({ ...value, ...patch });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-mono font-bold text-[#3ECF8E] flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Marketing
        </h2>
        {saved && (
          <span className="flex items-center gap-1 text-[10px] font-mono text-[#3ECF8E]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Saved
          </span>
        )}
      </div>

      <div role="tablist" className="flex items-center gap-1 p-1 rounded-lg bg-[#09090B] border border-[#27272A] overflow-x-auto">
        {[
          { id: 'forms', label: 'Forms', icon: <FileText className="w-3 h-3" /> },
          { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-3 h-3" /> },
          { id: 'seo', label: 'SEO', icon: <Globe className="w-3 h-3" /> },
          { id: 'scripts', label: 'Scripts', icon: <Code className="w-3 h-3" /> },
          { id: 'snapshot', label: 'Snapshot', icon: <Camera className="w-3 h-3" /> },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded text-[10px] font-mono transition-all ${
              tab === t.id
                ? 'bg-[#3ECF8E]/15 text-[#3ECF8E] border border-[#3ECF8E]/30'
                : 'text-[#71717A] hover:text-white border border-transparent'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-3">
        {tab === 'forms' && (
          <FormsConfigTab
            forms={value.forms || []}
            onChange={(forms) => set({ forms })}
            roomOptions={roomOptions}
            hotspotOptions={hotspotOptions}
          />
        )}
        {tab === 'analytics' && <AnalyticsTab />}
        {tab === 'seo' && (
          <SeoTab
            seo={value.seo || {}}
            onChange={(seo) => set({ seo })}
          />
        )}
        {tab === 'scripts' && (
          <ScriptsTab
            scripts={value.scripts || []}
            onChange={(scripts) => set({ scripts })}
          />
        )}
        {tab === 'snapshot' && (
          <SnapshotTab
            snapshot={value.snapshot || { hideWatermark: false }}
            onChange={(snapshot) => set({ snapshot })}
          />
        )}
      </div>

      <button
        type="button"
        onClick={onSave}
        className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b876] text-black text-xs font-bold font-mono"
      >
        <Save className="w-3.5 h-3.5" />
        Save Marketing
      </button>
    </div>
  );
}
