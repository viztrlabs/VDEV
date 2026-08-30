'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  Eye,
  ExternalLink,
  Copy,
  Download,
  Check,
  Radio,
  Layers,
  RotateCw,
  Map,
  Navigation,
  Music,
  ZoomIn,
  Hash,
  Sparkles,
  Share2,
  Search,
  Palette,
  QrCode,
  Lock,
  RefreshCw,
} from 'lucide-react';
import QRCode from 'qrcode';

interface TourFeatureToggles {
  hotspots: boolean;
  autoRotate: boolean;
  floorPlan: boolean;
  minimap: boolean;
  music: boolean;
  zoomControls: boolean;
  sceneCounter: boolean;
  branding: boolean;
  share: boolean;
  search: boolean;
}

interface TourSettings {
  live: boolean;
  publicUrl: string;
  features: TourFeatureToggles;
  theme: { accentColor: string; logoUrl: string; title: string };
  accessLevel: 'public' | 'private';
  version: number;
}

const DEFAULT_THEME = { accentColor: '#3ECF8E', logoUrl: '', title: 'VizTR Virtual Tour' };

const DEFAULT_FEATURES: TourFeatureToggles = {
  hotspots: true,
  autoRotate: false,
  floorPlan: true,
  minimap: true,
  music: false,
  zoomControls: true,
  sceneCounter: true,
  branding: true,
  share: true,
  search: true,
};

const FEATURE_ROWS: { key: keyof TourFeatureToggles; label: string; icon: any }[] = [
  { key: 'hotspots', label: 'Hotspots / Tags', icon: Layers },
  { key: 'autoRotate', label: 'Auto-Rotate (Guided)', icon: RotateCw },
  { key: 'floorPlan', label: 'Floor Plan Minimap', icon: Map },
  { key: 'minimap', label: 'Mini Map Navigator', icon: Navigation },
  { key: 'music', label: 'Background Music', icon: Music },
  { key: 'zoomControls', label: 'Zoom Controls', icon: ZoomIn },
  { key: 'sceneCounter', label: 'Scene Counter', icon: Hash },
  { key: 'branding', label: 'Branding / Logos', icon: Palette },
  { key: 'share', label: 'Share Button', icon: Share2 },
  { key: 'search', label: 'Room Search', icon: Search },
];

export default function VirtualTourAdminPanel() {
  const [settings, setSettings] = useState<TourSettings | null>(null);
  const [views, setViews] = useState<number | null>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/tour/settings');
      const data = await res.json();
      setSettings({
        live: data.live !== false,
        publicUrl: data.publicUrl || '/xr-world/virtual-tour',
        features: { ...DEFAULT_FEATURES, ...(data.features || {}) },
        theme: { ...DEFAULT_THEME, ...(data.theme || {}) },
        accessLevel: data.accessLevel === 'private' ? 'private' : 'public',
        version: typeof data.version === 'number' ? data.version : 1,
      });
    } catch (e: any) {
      setError(e?.message || 'failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loadViews = useCallback(async () => {
    try {
      const res = await fetch('/api/tour/views');
      const data = await res.json();
      setViews(data.count ?? 0);
    } catch {
      setViews(0);
    }
  }, []);

  useEffect(() => {
    loadViews();
  }, [loadViews]);

  // Generate QR code for the public link whenever settings load
  useEffect(() => {
    if (settings?.publicUrl) {
      QRCode.toDataURL(
        typeof window !== 'undefined' ? window.location.origin + settings.publicUrl : settings.publicUrl,
        { width: 160, margin: 1, color: { dark: '#0a0a0a', light: '#ffffff' } }
      )
        .then((url: string) => setQrCode(url))
        .catch(() => setQrCode(''));
    }
  }, [settings?.publicUrl, settings?.live]);

  const setAccessLevel = (level: 'public' | 'private') => {
    if (!settings) return;
    const next = { ...settings, accessLevel: level };
    setSettings(next);
    persist(next);
  };

  const clearCache = () => {
    if (!settings) return;
    const next = { ...settings, version: (settings.version || 1) + 1 };
    setSettings(next);
    persist(next);
  };
  const persist = useCallback(
    async (next: TourSettings) => {
      setSaving(true);
      setError('');
      try {
        const res = await fetch('/api/tour/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(next),
        });
        if (!res.ok) throw new Error('save failed');
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (e: any) {
        setError(e?.message || 'save failed');
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const toggleFeature = (key: keyof TourFeatureToggles) => {
    if (!settings) return;
    const next = { ...settings, features: { ...settings.features, [key]: !settings.features[key] } };
    setSettings(next);
    persist(next);
  };

  const updateTheme = (patch: Partial<NonNullable<TourSettings['theme']>>) => {
    if (!settings) return;
    const next = { ...settings, theme: { ...settings.theme, ...patch } };
    setSettings(next);
    persist(next);
  };

  const toggleLive = () => {
    if (!settings) return;
    const next = { ...settings, live: !settings.live };
    setSettings(next);
    persist(next);
  };

  const copyLink = async () => {
    if (!settings) return;
    try {
      await navigator.clipboard.writeText(window.location.origin + settings.publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be blocked; ignore */
    }
  };

  if (loading) {
    return (
      <div className="text-xs font-mono text-[#71717A] p-4">Loading virtual tour settings…</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#3ECF8E]">
          <Globe className="w-4 h-4" /> Virtual Tour — Operator Console
        </div>
        {saved && (
          <span className="flex items-center gap-1 text-[10px] font-mono text-[#3ECF8E]">
            <Check className="w-3 h-3" /> Saved
          </span>
        )}
        {views !== null && (
          <span className="flex items-center gap-1 text-[10px] font-mono text-[#71717A]">
            <Eye className="w-3 h-3" /> {views} views
          </span>
        )}
      </div>

      {error && (
        <div className="px-3 py-2 rounded-lg bg-rose-950/40 border border-rose-900 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: embedded live preview */}
        <div className="rounded-2xl border border-[#27272A] bg-[#0c0c0f] overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#27272A]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] flex items-center gap-1.5">
              <Eye className="w-3 h-3" /> Public Tour Preview
            </span>
            <button
              onClick={() => settings && window.open(settings.publicUrl, '_blank')}
              className="flex items-center gap-1 text-[10px] font-mono text-[#3ECF8E] hover:underline"
            >
              Open <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="relative w-full aspect-video bg-black">
            {settings && (
              <iframe
                src={settings.publicUrl}
                title="Virtual Tour Preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
              />
            )}
            {settings && !settings.live && (
              <div className="absolute inset-0 bg-[#09090B]/85 flex flex-col items-center justify-center text-center">
                <Radio className="w-6 h-6 text-rose-400 mb-2" />
                <div className="text-xs font-mono font-bold text-rose-300 uppercase">Unpublished (Offline)</div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: controls */}
        <div className="space-y-4">
          {/* Publish switch */}
          <div className="rounded-2xl border border-[#27272A] bg-[#0c0c0f] p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">Publish Tour</div>
                <div className="text-[10px] font-mono text-[#71717A]">
                  When off, the public link shows an offline state.
                </div>
              </div>
              <button
                onClick={toggleLive}
                disabled={saving}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings?.live ? 'bg-[#3ECF8E]' : 'bg-[#3f3f46]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    settings?.live ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Feature toggles */}
          <div className="rounded-2xl border border-[#27272A] bg-[#0c0c0f] p-4 space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] flex items-center gap-1.5 pb-1">
              <Sparkles className="w-3 h-3" /> Editable Public Features
            </div>
            {FEATURE_ROWS.map((row) => {
              const Icon = row.icon;
              const on = settings?.features[row.key];
              return (
                <div key={row.key} className="flex items-center justify-between py-1">
                  <span className="flex items-center gap-2 text-xs text-[#E4E4E7]">
                    <Icon className="w-3.5 h-3.5 text-[#71717A]" /> {row.label}
                  </span>
                  <button
                    onClick={() => toggleFeature(row.key)}
                    disabled={saving}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      on ? 'bg-[#3ECF8E]' : 'bg-[#3f3f46]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        on ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          {/* THEME / BRANDING */}
          {settings && (
          <div className="rounded-2xl border border-[#27272A] bg-[#0c0c0f] p-4 space-y-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] flex items-center gap-1.5 pb-1">
              <Palette className="w-3 h-3" /> Theme &amp; Branding
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-mono text-[#A1A1AA]">Tour Title</label>
              <input
                value={settings.theme.title}
                onChange={(e) => updateTheme({ title: e.target.value })}
                className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-mono text-[#A1A1AA]">Client Logo URL</label>
              <input
                value={settings.theme.logoUrl}
                onChange={(e) => updateTheme({ logoUrl: e.target.value })}
                placeholder="https://…/logo.png"
                className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-mono text-[#A1A1AA]">Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.theme.accentColor}
                  onChange={(e) => updateTheme({ accentColor: e.target.value })}
                  className="w-9 h-8 rounded bg-[#18181B] border border-[#27272A] cursor-pointer"
                />
                <input
                  value={settings.theme.accentColor}
                  onChange={(e) => updateTheme({ accentColor: e.target.value })}
                  className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>
          )}

          {/* Client link generator */}
          <div className="rounded-2xl border border-[#27272A] bg-[#0c0c0f] p-4 space-y-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
              Client Link
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  settings?.live ? 'bg-[#3ECF8E] animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span
                className={`text-xs font-mono font-bold ${
                  settings?.live ? 'text-[#3ECF8E]' : 'text-rose-400'
                }`}
              >
                {settings?.live ? 'LIVE' : 'OFFLINE'}
              </span>
              <span className="text-[10px] font-mono text-[#71717A] truncate">
                {settings?.publicUrl}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-mono text-white"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#3ECF8E]" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Link'}
              </button>
              <button
                onClick={() => settings && window.open(settings.publicUrl, '_blank')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b876] text-black text-xs font-bold font-mono"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Preview
              </button>
              <button
                onClick={() => window.open('/api/tour/export', '_blank')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-mono text-white"
                title="Download self-hostable ZIP"
              >
                <Download className="w-3.5 h-3.5" /> Export ZIP
              </button>
            </div>

            {/* ACCESS LEVEL + CLEAR CACHE */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAccessLevel(settings?.accessLevel === 'private' ? 'public' : 'private')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono ${
                    settings?.accessLevel === 'private'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-[#18181B] hover:bg-[#27272A] border-[#27272A] text-white'
                  }`}
                >
                  {settings?.accessLevel === 'private' ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                  {settings?.accessLevel === 'private' ? 'Private' : 'Public'}
                </button>
                <button
                  onClick={clearCache}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-mono text-white"
                  title="Bump version so visitors see fresh data"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Clear Cache (v{settings?.version || 1})
                </button>
              </div>
            </div>

            {/* QR + EMBED */}
            <div className="flex items-start gap-3 pt-1">
              <div className="shrink-0 rounded-lg bg-white p-1.5">
                {qrCode ? (
                  <img src={qrCode} alt="Tour QR" className="w-24 h-24" />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center text-[#999]">
                    <QrCode className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="text-[10px] font-mono text-[#71717A] flex items-center gap-1.5">
                  <Share2 className="w-3 h-3" /> Embed snippet
                </div>
                <pre className="text-[10px] font-mono text-[#A1A1AA] bg-[#09090B] border border-[#27272A] rounded p-2 overflow-x-auto">
{`<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}${settings?.publicUrl}" width="100%" height="600" style="border:0" allow="fullscreen"></iframe>`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
