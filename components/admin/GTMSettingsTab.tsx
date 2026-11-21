'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Save,
  Globe,
  Sliders,
  Power,
  RotateCcw,
  Plus,
  Trash2,
  ExternalLink,
  Code2,
} from 'lucide-react';
import type { GTMSettings, GTMSettingsInput, GTMPageRule } from '@/lib/super-admin-store-types';

interface GTMSettingsTabProps {
  settings: GTMSettings | null;
  loading: boolean;
  error: string | null;
  onSave: (settings: GTMSettingsInput) => Promise<void>;
  onRefresh: () => Promise<void>;
}

const DEFAULT_PAGES: Omit<GTMPageRule, 'enabled'>[] = [
  { id: 'home', path: '/', name: 'Homepage' },
  { id: 'portfolio', path: '/portfolio', name: 'Portfolio & Showcases' },
  { id: 'pricing', path: '/pricing', name: 'Pricing & Plans' },
  { id: 'book-consultation', path: '/book-consultation', name: 'Book Consultation' },
  { id: 'contact', path: '/contact', name: 'Contact Form' },
  { id: 'about', path: '/about', name: 'About Studio' },
  { id: 'blog', path: '/blog', name: 'Blog & Insights' },
  { id: 'solutions', path: '/solutions', name: 'Enterprise Solutions' },
  { id: 'virtual-tour', path: '/virtual-tour', name: '360° Virtual Tours' },
  { id: 'vizsplat', path: '/vizsplat', name: 'VizSplat 3D Spatial' },
  { id: 'xr-world', path: '/xr-world', name: 'XR World Metaverse' },
  { id: 'explore', path: '/explore', name: 'Interactive Explore' },
  { id: 'admin', path: '/admin', name: 'Admin / Super Admin Portal' },
  { id: 'client-dashboard', path: '/client-dashboard', name: 'Client Dashboard' },
];

export default function GTMSettingsTab({
  settings,
  loading,
  error,
  onSave,
  onRefresh,
}: GTMSettingsTabProps) {
  const [containerId, setContainerId] = useState(settings?.containerId || 'GTM-WL2Z8H5C');
  const [isEnabled, setIsEnabled] = useState(settings?.isEnabled ?? true);
  const [defaultRule, setDefaultRule] = useState<'include_all' | 'exclude_all'>(
    settings?.defaultRule || 'include_all'
  );
  const [pageRules, setPageRules] = useState<GTMPageRule[]>(settings?.pageRules || []);
  const [customPath, setCustomPath] = useState('');
  const [customName, setCustomName] = useState('');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state when props update
  useEffect(() => {
    if (settings) {
      setContainerId(settings.containerId || 'GTM-WL2Z8H5C');
      setIsEnabled(settings.isEnabled ?? true);
      setDefaultRule(settings.defaultRule || 'include_all');
      
      // If pageRules is empty, populate from default pages
      if (!settings.pageRules || settings.pageRules.length === 0) {
        setPageRules(
          DEFAULT_PAGES.map((p) => ({
            ...p,
            enabled: !p.path.startsWith('/admin') && !p.path.startsWith('/client-dashboard'),
          }))
        );
      } else {
        setPageRules(settings.pageRules);
      }
    }
  }, [settings]);

  const handleTogglePage = (path: string) => {
    setPageRules((prev) =>
      prev.map((r) => (r.path === path ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleToggleAll = (enabled: boolean) => {
    setPageRules((prev) => prev.map((r) => ({ ...r, enabled })));
  };

  const handleAddCustomPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPath.trim()) return;

    const normalizedPath = customPath.trim().startsWith('/')
      ? customPath.trim()
      : `/${customPath.trim()}`;

    if (pageRules.some((r) => r.path === normalizedPath)) {
      return;
    }

    const newRule: GTMPageRule = {
      id: `custom-${Date.now()}`,
      path: normalizedPath,
      name: customName.trim() || normalizedPath,
      enabled: true,
    };

    setPageRules((prev) => [...prev, newRule]);
    setCustomPath('');
    setCustomName('');
  };

  const handleRemovePage = (path: string) => {
    setPageRules((prev) => prev.filter((r) => r.path !== path));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await onSave({
        containerId: containerId.trim(),
        isEnabled,
        defaultRule,
        pageRules,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const scriptSnippet = `<script async src="https://www.googletagmanager.com/gtm.js?id=${containerId || 'GTM-WL2Z8H5C'}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
</script>`;

  const copySnippet = () => {
    navigator.clipboard.writeText(scriptSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)]">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              Google Tag Manager (GTM)
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  isEnabled
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {isEnabled ? 'Active' : 'Disabled'}
              </span>
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Manage container ID, global activation, and per-page script injection immediately after &lt;head&gt;.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {saving ? (
              <RotateCcw className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Container Configuration & Script Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Container Settings */}
        <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] space-y-5">
          <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Tag Manager Configuration
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                GTM Container ID
              </label>
              <input
                type="text"
                value={containerId}
                onChange={(e) => setContainerId(e.target.value)}
                placeholder="GTM-WL2Z8H5C"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                Your Google Tag Manager public container identifier.
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--subtle-bg)] border border-[var(--border-color)]">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Master GTM Switch</p>
                <p className="text-xs text-[var(--text-muted)]">
                  Enable or disable all GTM scripts across the entire site instantly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEnabled(!isEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isEnabled ? 'bg-cyan-500' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                    isEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--subtle-bg)] border border-[var(--border-color)]">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Default Route Behavior</p>
                <p className="text-xs text-[var(--text-muted)]">
                  For routes without an explicit toggle rule.
                </p>
              </div>
              <select
                value={defaultRule}
                onChange={(e) => setDefaultRule(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-cyan-500"
              >
                <option value="include_all">Enable GTM</option>
                <option value="exclude_all">Disable GTM</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 2: Script Snippet Preview */}
        <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              Injected Code Snippet (&lt;head&gt;)
            </h3>
            <button
              type="button"
              onClick={copySnippet}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
            >
              {copiedSnippet ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSnippet ? 'Copied' : 'Copy'}
            </button>
          </div>

          <p className="text-xs text-[var(--text-muted)]">
            This snippet is automatically rendered immediately after the &lt;head&gt; tag on all pages configured as active below:
          </p>

          <pre className="p-4 rounded-xl bg-black/60 border border-[var(--border-color)] text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed">
            {scriptSnippet}
          </pre>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300/90 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <span>
              <strong>Note:</strong> VizTR dynamically evaluates the active route. When a page is turned OFF in the rules below, the GTM script is suppressed and no events are transmitted.
            </span>
          </div>
        </div>
      </div>

      {/* Card 3: Per-Page Selection Rules */}
      <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              Per-Page Selection (ON / OFF)
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Select exactly which routes execute the Google Tag Manager tag.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleToggleAll(true)}
              className="px-3 py-1.5 rounded-lg bg-[var(--subtle-bg)] hover:bg-[var(--border-color)] text-xs font-medium text-[var(--text-primary)] transition-colors"
            >
              Enable All
            </button>
            <button
              type="button"
              onClick={() => handleToggleAll(false)}
              className="px-3 py-1.5 rounded-lg bg-[var(--subtle-bg)] hover:bg-[var(--border-color)] text-xs font-medium text-[var(--text-primary)] transition-colors"
            >
              Disable All
            </button>
          </div>
        </div>

        {/* Page List Table */}
        <div className="border border-[var(--border-color)] rounded-xl overflow-hidden">
          <div className="divide-y divide-[var(--border-color)]">
            {pageRules.map((rule) => (
              <div
                key={rule.path}
                className="flex items-center justify-between p-3.5 hover:bg-[var(--subtle-bg)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleTogglePage(rule.path)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      rule.enabled ? 'bg-emerald-500' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-black transition-transform ${
                        rule.enabled ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>

                  <div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {rule.name}
                    </span>
                    <span className="ml-2 font-mono text-xs text-[var(--text-muted)]">
                      {rule.path}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      rule.enabled
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-zinc-500/10 text-zinc-400'
                    }`}
                  >
                    {rule.enabled ? 'Tag Enabled' : 'Tag Disabled'}
                  </span>

                  {rule.id.startsWith('custom-') && (
                    <button
                      type="button"
                      onClick={() => handleRemovePage(rule.path)}
                      className="p-1 rounded text-zinc-500 hover:text-rose-400 transition-colors"
                      title="Remove custom rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Custom Route Rule */}
        <form onSubmit={handleAddCustomPage} className="p-4 rounded-xl bg-[var(--subtle-bg)] border border-[var(--border-color)] flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <input
              type="text"
              value={customPath}
              onChange={(e) => setCustomPath(e.target.value)}
              placeholder="e.g. /landing/promo or /custom-page"
              className="w-full px-3.5 py-2 rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="flex-1 w-full">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Label (optional)"
              className="w-full px-3.5 py-2 rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-zinc-700"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Route
          </button>
        </form>
      </div>
    </div>
  );
}
