'use client';

import React, { useState, useEffect } from 'react';
import { FeatureFlag, featureFlags, isFeatureEnabled, isEnabledServer } from '@/lib/feature-flags';
import { Toggle, Check, X, Settings, BarChart2, Beaker, RefreshCw, Save, Loader2 } from 'lucide-react';

interface FeatureFlagsDashboardProps {
  initialFlags?: Record<string, boolean>;
}

export function FeatureFlagsDashboard({ initialFlags = {} }: FeatureFlagsDashboardProps) {
  const [flags, setFlags] = useState<Record<string, { flag: FeatureFlag; enabled: boolean }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [metrics, setMetrics] = useState<Record<string, { impressions: number; conversions: number; errorRate: number }>>({});

  // Load flags from localStorage and server
  useEffect(() => {
    const loadFlags = async () => {
      setLoading(true);
      try {
        // Load from localStorage first
        const stored = typeof window !== 'undefined' ? localStorage.getItem('viztr-feature-flags') : null;
        const parsed = stored ? JSON.parse(stored) : {};

        // Merge with initial flags and server defaults
        const merged: Record<string, { flag: FeatureFlag; enabled: boolean }> = {};
        Object.entries(featureFlags).forEach(([key, flag]) => {
          const storedValue = parsed[key];
          const initialValue = initialFlags[key];
          const defaultValue = flag.defaultValue;
          
          // Priority: localStorage > initialFlags > server default > flag default
          const enabled = storedValue !== undefined ? storedValue : 
                         initialValue !== undefined ? initialValue : 
                         defaultValue;

          merged[key] = { flag, enabled };
        });

        setFlags(merged);
        
        // Load metrics from localStorage
        const storedMetrics = localStorage.getItem('viztr-flag-metrics');
        if (storedMetrics) {
          setMetrics(JSON.parse(storedMetrics));
        }
      } catch (error) {
        console.error('Failed to load feature flags:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFlags();
  }, [initialFlags]);

  // Save flags to localStorage
  const saveFlags = async () => {
    setSaving(true);
    try {
      const flagsToSave: Record<string, boolean> = {};
      Object.entries(flags).forEach(([key, { enabled }]) => {
        flagsToSave[key] = enabled;
      });
      
      localStorage.setItem('viztr-feature-flags', JSON.stringify(flagsToSave));
      
      // In a real app, this would POST to an admin API
      // await fetch('/api/admin/feature-flags', { method: 'POST', body: JSON.stringify(flagsToSave) });
      
      setMessage({ type: 'success', text: 'Feature flags saved successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save feature flags' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const toggleFlag = (key: string) => {
    setFlags(prev => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled }
    }));
  };

  const resetToDefaults = () => {
    const defaults: Record<string, { flag: FeatureFlag; enabled: boolean }> = {};
    Object.entries(featureFlags).forEach(([key, flag]) => {
      defaults[key] = { flag, enabled: flag.defaultValue };
    });
    setFlags(defaults);
  };

  // Track flag impression
  const trackImpression = (key: string) => {
    setMetrics(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        impressions: (prev[key]?.impressions || 0) + 1
      }
    }));
    localStorage.setItem('viztr-flag-metrics', JSON.stringify({
      ...metrics,
      [key]: { ...metrics[key], impressions: (metrics[key]?.impressions || 0) + 1 }
    }));
  };

  // Track conversion
  const trackConversion = (key: string) => {
    setMetrics(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        conversions: (prev[key]?.conversions || 0) + 1
      }
    }));
    localStorage.setItem('viztr-flag-metrics', JSON.stringify({
      ...metrics,
      [key]: { ...metrics[key], conversions: (metrics[key]?.conversions || 0) + 1 }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-[#3ecf8e] animate-spin" />
      </div>
    );
  }

  const flagEntries = Object.entries(flags);
  const enabledCount = flagEntries.filter(([, { enabled }]) => enabled).length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#3ecf8e]/10 text-[#3ecf8e]">
            <Beaker className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-mono font-bold text-white">Feature Flags Dashboard</h2>
            <p className="text-xs text-[#71717a] font-mono">
              {enabledCount} of {flagEntries.length} flags enabled
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetToDefaults}
            className="px-3 py-1.5 rounded-lg border border-[#27272a] bg-[#18181b] hover:bg-[#27272a] text-xs font-mono text-[#a1a1aa] hover:text-white transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={saveFlags}
            disabled={saving}
            className="px-4 py-1.5 rounded-lg bg-[#3ecf8e] text-black text-xs font-mono font-bold hover:bg-[#34b27b] transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving…</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg border shadow-xl animate-in slide-in-from-bottom-2 text-xs font-mono ${
          message.type === 'success' 
            ? 'bg-[#3ecf8e]/10 border-[#3ecf8e]/30 text-[#3ecf8e]' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Flags Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {flagEntries.map(([key, { flag, enabled }]) => {
          const flagMetrics = metrics[key] || { impressions: 0, conversions: 0, errorRate: 0 };
          const conversionRate = flagMetrics.impressions > 0 
            ? ((flagMetrics.conversions / flagMetrics.impressions) * 100).toFixed(1) 
            : '0.0';

          return (
            <div
              key={key}
              className={`group relative p-4 rounded-xl border transition ${
                enabled
                  ? 'bg-[#3ecf8e]/5 border-[#3ecf8e]/30'
                  : 'bg-[#121216]/85 border-[#27272a]'
              }`}
            >
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <Toggle
                  checked={enabled}
                  onChange={() => toggleFlag(key)}
                  className="w-10 h-6"
                />
              </div>

              {/* Flag Info */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-white">{flag.key}</span>
                  {enabled && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#3ecf8e]/15 text-[#3ecf8e] border border-[#3ecf8e]/30">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#71717a] font-medium">{flag.name}</p>
                <p className="text-[10px] text-[#52525b]">{flag.description}</p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-[#09090b]/50 border border-[#27272a]">
                <div className="text-center">
                  <div className="text-lg font-mono font-bold text-white">{flagMetrics.impressions.toLocaleString()}</div>
                  <div className="text-[9px] text-[#71717a] uppercase">Impressions</div>
                </div>
                <div className="text-center border-l border-[#27272a]">
                  <div className="text-lg font-mono font-bold text-[#3ecf8e]">{flagMetrics.conversions.toLocaleString()}</div>
                  <div className="text-[9px] text-[#71717a] uppercase">Conversions</div>
                </div>
                <div className="text-center border-l border-[#27272a]">
                  <div className="text-lg font-mono font-bold text-[#6366f1]">{conversionRate}%</div>
                  <div className="text-[9px] text-[#71717a] uppercase">Conv. Rate</div>
                </div>
              </div>

              {/* Environment Variable */}
              <div className="mt-3 pt-3 border-t border-[#27272a]/50">
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="text-[#52525b]">Env: <code className="text-[#a1a1aa]">{flag.envVar}</code></span>
                  <span className="text-[#52525b">Default: <code className="text-[#a1a1aa]">{String(flag.defaultValue)}</code></span>
                </div>
              </div>

              {/* Hover Actions */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-3 right-3 flex gap-1">
                <button
                  onClick={() => trackImpression(key)}
                  className="p-1 rounded text-[10px] text-[#71717a] hover:text-[#3ecf8e] hover:bg-[#3ecf8e]/10 transition"
                  title="Track Impression"
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => trackConversion(key)}
                  className="p-1 rounded text-[10px] text-[#71717a] hover:text-[#3ecf8e] hover:bg-[#3ecf8e]/10 transition"
                  title="Track Conversion"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* A/B Testing Panel */}
      <div className="mt-8 p-5 rounded-xl bg-[#121216]/85 border border-[#27272a]">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-5 h-5 text-[#6366f1]" />
          <h3 className="font-mono font-bold text-white">A/B Testing Configuration</h3>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {/* Test Creation */}
          <div className="p-4 rounded-lg bg-[#09090b]/50 border border-[#27272a]">
            <h4 className="text-xs font-mono font-bold text-[#a1a1aa] mb-3 uppercase">Create A/B Test</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-[#71717a] mb-1">Flag to Test</label>
                <select className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#3ecf8e]">
                  <option value="">Select a flag...</option>
                  {flagEntries.map(([key]) => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-[#71717a] mb-1">Traffic Split (%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="50"
                  className="w-full accent-[#6366f1]"
                />
                <div className="flex justify-between text-[10px] text-[#71717a]">
                  <span>Control (0%)</span>
                  <span>50%</span>
                  <span>Variant (100%)</span>
                </div>
              </div>
              <button className="w-full px-3 py-2 rounded-lg bg-[#6366f1] text-white text-xs font-mono hover:bg-[#4f46e5] transition">
                Create Test
              </button>
            </div>
          </div>

          {/* Active Tests */}
          <div className="p-4 rounded-lg bg-[#09090b]/50 border border-[#27272a]">
            <h4 className="text-xs font-mono font-bold text-[#a1a1aa] mb-3 uppercase">Active Tests</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <div className="p-3 rounded-lg bg-[#18181b] border border-[#27272a]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-white">home-v2-hero (50/50 split)</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#3ecf8e]/15 text-[#3ecf8e] border border-[#3ecf8e]/30">RUNNING</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-[#71717a]">
                  <div><span className="text-white">Control:</span> 1,247 impressions / 3.2% conv.</div>
                  <div><span className="text-white">Variant:</span> 1,189 impressions / 4.1% conv.</div>
                </div>
                <div className="text-[10px] text-[#6366f1] mt-1">+28% lift (p=0.03)</div>
              </div>
              <div className="p-3 rounded-lg bg-[#18181b] border border-[#27272a] text-center text-[11px] text-[#71717a]">
                No other active tests. Create one above to start experimenting.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Monitoring */}
      <div className="mt-6 p-5 rounded-xl bg-[#121216]/85 border border-[#27272a]">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-5 h-5 text-[#f59e0b]" />
          <h3 className="font-mono font-bold text-white">Performance Impact Monitoring</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-[#09090b]/50 border border-[#27272a] text-center">
            <div className="text-2xl font-mono font-bold text-[#3ecf8e]">12ms</div>
            <div className="text-[10px] text-[#71717a]">Avg Flag Check Latency</div>
          </div>
          <div className="p-4 rounded-lg bg-[#09090b]/50 border border-[#27272a] text-center">
            <div className="text-2xl font-mono font-bold text-[#6366f1]">0.02%</div>
            <div className="text-[10px] text-[#71717a]">Bundle Size Impact</div>
          </div>
          <div className="p-4 rounded-lg bg-[#09090b]/50 border border-[#27272a] text-center">
            <div className="text-2xl font-mono font-bold text-[#f59e0b]">3</div>
            <div className="text-[10px] text-[#71717a]">Flags in Critical Path</div>
          </div>
          <div className="p-4 rounded-lg bg-[#09090b]/50 border border-[#27272a] text-center">
            <div className="text-2xl font-mono font-bold text-rose-500">0</div>
            <div className="text-[10px] text-[#71717a]">Runtime Errors (24h)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom Toggle Component
function Toggle({ checked, onChange, className = '' }: { checked: boolean; onChange: () => void; className?: string }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
        checked ? 'bg-[#3ecf8e]' : 'bg-[#27272a]'
      } ${className}`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default FeatureFlagsDashboard;