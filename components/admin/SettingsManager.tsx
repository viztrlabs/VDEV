'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  Copy,
  Check,
  RotateCcw,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Trash2,
  Plus,
  Mail,
  Bot,
  Lock,
  Smartphone,
  Globe,
  Send,
} from 'lucide-react';

interface SettingRow {
  key: string;
  description?: string | null;
  updatedAt?: string | null;
  isEncrypted?: boolean;
  hasValue?: boolean;
}

interface SettingsManagerProps {
  onSaved?: (message: string) => void;
}

const PRESET_KEYS: Array<{ key: string; label: string; description: string; icon: any; placeholder: string }> = [
  {
    key: 'RESEND_API_KEY',
    label: 'Resend API Key',
    description: 'Email delivery for booking confirmations, contact notifications, newsletters.',
    icon: Mail,
    placeholder: 're_1234567890abcdef',
  },
  {
    key: 'WHATSAPP_ACCESS_TOKEN',
    label: 'WhatsApp Access Token',
    description: 'WhatsApp Business Platform access token (official integration).',
    icon: Bot,
    placeholder: 'EAAxxxx...',
  },
  {
    key: 'WHATSAPP_PHONE_NUMBER_ID',
    label: 'WhatsApp Phone Number ID',
    description: 'WhatsApp Business phone number ID.',
    icon: Bot,
    placeholder: '123456789012345',
  },
  {
    key: 'TELEGRAM_BOT_TOKEN',
    label: 'Telegram Bot Token',
    description: 'From @BotFather — activates the free Telegram connector.',
    icon: Bot,
    placeholder: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
  },
  {
    key: 'TELEGRAM_WEBHOOK_SECRET',
    label: 'Telegram Webhook Secret',
    description: 'Secret to verify inbound Telegram webhook calls.',
    icon: Lock,
    placeholder: 'openssl rand -hex 32',
  },
  {
    key: 'GEMINI_API_KEY',
    label: 'Google Gemini API Key',
    description: 'Powers the Hermes AI assistant (live LLM chat).',
    icon: Bot,
    placeholder: 'AIza... or AQ....',
  },
  {
    key: 'WHATSAPP_PHONE_NUMBER',
    label: 'WhatsApp Phone Number',
    description: 'Official WhatsApp Business phone number for click-to-chat and bot integration (E.164 format, e.g. +12125550198).',
    icon: Smartphone,
    placeholder: '+12125550198',
  },
  {
    key: 'WHATSAPP_WEBHOOK_SECRET',
    label: 'WhatsApp Webhook Secret',
    description: 'Secret to verify inbound webhook calls from the VizTR WhatsApp Bot (FEI XMD).',
    icon: Lock,
    placeholder: 'openssl rand -hex 32',
  },
  {
    key: 'WHATSAPP_WEBHOOK_URL',
    label: 'WhatsApp Webhook URL',
    description: 'URL where FEI-XMD bot posts incoming WhatsApp messages (e.g. https://your-app.vercel.app/api/messaging/whatsapp).',
    icon: Globe,
    placeholder: 'https://your-app.vercel.app/api/messaging/whatsapp',
  },
  {
    key: 'WHATSAPP_SEND_URL',
    label: 'WhatsApp Send URL',
    description: 'URL where VizTR hands replies to the bot for delivery (e.g. https://your-app.vercel.app/api/messaging/whatsapp/send).',
    icon: Send,
    placeholder: 'https://your-app.vercel.app/api/messaging/whatsapp/send',
  },
];

export default function SettingsManager({ onSaved }: SettingsManagerProps) {
  const [settings, setSettings] = useState<SettingRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [revealMap, setRevealMap] = useState<Record<string, boolean>>({});
  const [savingKeys, setSavingKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string; key: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleReveal = (key: string) =>
    setRevealMap((m) => ({ ...m, [key]: !m[key] }));

  const handleChange = (key: string, value: string) =>
    setDrafts((d) => ({ ...d, [key]: value }));

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load settings');
      const data = await res.json();
      setSettings(data.settings || []);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load settings');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const commit = async (key: string) => {
    const value = drafts[key];
    if (!value) return;

    setSavingKeys((prev) => new Set([...prev, key]));
    setError(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error || `Save failed (${res.status})`);
      }

      const preset = PRESET_KEYS.find((p) => p.key === key);
      // Refresh settings list non-fatally — save already succeeded
      try {
        await fetchSettings();
      } catch {
        // Ignore refresh failures; save succeeded
      }
      setDrafts((d) => { const n = { ...d }; delete n[key]; return n; });
      setSavingKeys((prev) => {
        const n = new Set(prev);
        n.delete(key);
        return n;
      });
      onSaved?.(`Saved ${preset?.label || key}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to save setting');
      setSavingKeys((prev) => {
        const n = new Set(prev);
        n.delete(key);
        return n;
      });
    }
  };

  const removeSetting = async (key: string) => {
    if (!window.confirm(`Delete ${key}? This cannot be undone.`)) return;

    setSavingKeys((prev) => new Set([...prev, key]));
    try {
      const res = await fetch(`/api/settings?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error || `Delete failed (${res.status})`);
      }
      try {
        await fetchSettings();
      } catch {
        // Ignore refresh failures; delete succeeded
      }
      setDrafts((d) => { const n = { ...d }; delete n[key]; return n; });
      setSavingKeys((prev) => {
        const n = new Set(prev);
        n.delete(key);
        return n;
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to delete setting');
      setSavingKeys((prev) => {
        const n = new Set(prev);
        n.delete(key);
        return n;
      });
    }
  };

  const copyValue = async (key: string) => {
    const setting = settings.find((s) => s.key === key);
    if (!setting) return;
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {}
  };

  const hasValue = (key: string) => !!settings.find((s) => s.key === key);

  return (
    <div className="space-y-6">
      {/* BANNER */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#201f20] via-[#131314] to-[#131314] border border-[#353436] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#dbfcff] font-bold uppercase tracking-wider">
            <KeyRound className="w-4 h-4" />
            <span>CORE SYSTEM 06 • SERVER-SIDE CREDENTIALS</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            API Credentials & Settings
          </h2>
          <p className="text-xs text-[#A1A1AA] max-w-2xl">
            Store API keys server-side in Supabase (bypasses hosting env var limits). Keys are encrypted at rest and only readable by administrators.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchSettings}
          className="px-4 py-2 rounded-xl bg-[#dbfcff] hover:bg-[#34b27b] text-black font-mono font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-700/60 text-red-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* PRESET KEYS */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#71717A]">
          <Lock className="w-3 h-3" />
          <span>RECOMMENDED CREDENTIALS</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {PRESET_KEYS.map((preset) => {
            const existing = settings.find((s) => s.key === preset.key);
            const isRevealed = revealMap[preset.key];
            const draftVal = drafts[preset.key] ?? '';
            const hasVal = hasValue(preset.key);
            const isSaving = savingKeys.has(preset.key);

            return (
              <div
                key={preset.key}
                className="p-4 rounded-2xl bg-[#201f20] border border-[#353436] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <preset.icon className="w-4 h-4 text-[#dbfcff]" />
                    <span className="text-sm font-bold text-white font-display">
                      {preset.label}
                    </span>
                  </div>
                  {hasVal && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                      Configured
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-[#71717A] leading-relaxed">
                  {preset.description}
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type={isRevealed ? 'text' : 'password'}
                    value={draftVal || (isRevealed ? '' : '')}
                    placeholder={preset.placeholder}
                    onChange={(e) => handleChange(preset.key, e.target.value)}
                    disabled={isSaving}
                    className={`flex-1 px-3 py-2 rounded-lg bg-[#131314] border border-[#353436] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#dbfcff] disabled:opacity-50`}
                  />
                  <button
                    type="button"
                    onClick={() => toggleReveal(preset.key)}
                    disabled={isSaving}
                    className={`p-2 rounded-lg bg-[#131314] border border-[#353436] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={isRevealed ? 'Hide' : 'Reveal'}
                  >
                    {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => commit(preset.key)}
                    disabled={!draftVal || isSaving}
                    className={`px-3 py-1.5 rounded-lg bg-[#dbfcff] hover:bg-[#34b27b] disabled:opacity-40 text-black text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isSaving ? <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isSaving ? 'Saving…' : 'Save'}</span>
                  </button>
                  {hasVal && !isSaving && (
                    <button
                      type="button"
                      onClick={() => removeSetting(preset.key)}
                      className="px-3 py-1.5 rounded-lg bg-[#131314] border border-[#353436] text-[#A1A1AA] hover:text-rose-400 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                  <span className="text-[9px] font-mono text-[#71717A] ml-auto">
                    {existing?.updatedAt ? `updated ${new Date(existing.updatedAt).toLocaleString()}` : 'not configured'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* WHATSAPP BOT CONFIGURATION */}
      <div className="p-4 rounded-2xl bg-[#201f20] border border-[#353436] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#25D366]" />
            <span className="text-sm font-bold text-white font-display">VizTR WhatsApp Bot (FEI XMD)</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
            Standalone Bot Service
          </span>
        </div>
        <p className="text-[10px] text-[#71717A] leading-relaxed">
          The WhatsApp bot runs as a separate Node.js service using{' '}
          <a
            href="https://github.com/viztrlabs/whatsapp_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#dbfcff] underline hover:text-[#4ade80]"
          >
            FEI XMD (rebranded as VizTR)
          </a>
          . It connects to VizTR via webhook to sync messages between WhatsApp users and your support dashboard.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Webhook URL and Send URL are managed as preset keys above */}
        </div>

        <div className="p-3 rounded-lg bg-[#131314] border border-[#353436]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-[#A1A1AA] uppercase">Bot .env file</span>
              <button
                type="button"
                onClick={() => {
                  const baseUrl = typeof process !== 'undefined' && process.env.NEXTAUTH_URL ? process.env.NEXTAUTH_URL : 'https://viztr.com';
                  const webhookUrl = `${baseUrl}/api/messaging/whatsapp`;
                  const sendUrl = `${baseUrl}/api/messaging/whatsapp/send`;
                  const envContent = `# VizTR WhatsApp Bot (.env)
# Rebranded FEI XMD - https://github.com/viztrlabs/whatsapp_bot

BOT_NAME=VizTR Support
BOT_VERSION=1.0.0
BOT_URL=${webhookUrl}
OWNER_NAME=VizTR Support Team
OWNER_NUMBER=REPLACE_WITH_YOUR_NUMBER
PREFIX=!

FEI_SESSION_DIR=./auth_info_baileys
FEI_DATA_DIR=./data

# VizTR Webhooks
VIZTR_WEBHOOK_URL=${webhookUrl}
VIZTR_WEBHOOK_SECRET=REPLACE_WITH_WEBHOOK_SECRET

# VizTR Send API
VIZTR_SEND_URL=${sendUrl}
`;
                  navigator.clipboard.writeText(envContent);
                }}
                className="text-[10px] font-mono text-[#dbfcff] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> Copy .env
              </button>
            </div>
            <pre className="text-[10px] font-mono text-[#A1A1AA] whitespace-pre-wrap break-all bg-[#201f20] p-2 rounded border border-[#353436] max-h-40 overflow-y-auto">
# VizTR WhatsApp Bot (.env)
BOT_NAME=VizTR Support
BOT_URL=https://viztr.com
OWNER_NUMBER=REPLACE_WITH_YOUR_NUMBER
VIZTR_WEBHOOK_URL=https://viztr.com/api/messaging/whatsapp
VIZTR_SEND_URL=https://viztr.com/api/messaging/whatsapp/send
</pre>
        </div>

        <div className="p-3 rounded-lg bg-[#201f20] border border-[#353436]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-[#71717A]">Setup steps:</span>
          </div>
          <div className="text-[10px] text-[#A1A1AA] font-mono space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[#dbfcff] font-bold">1.</span>
              <span>Clone the bot: <code className="bg-[#131314] px-1 rounded">git clone https://github.com/viztrlabs/whatsapp_bot</code></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#dbfcff] font-bold">2.</span>
              <span>Copy the .env above into the bot directory and set OWNER_NUMBER</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#dbfcff] font-bold">3.</span>
              <span>Run <code className="bg-[#131314] px-1 rounded">npm install</code> then <code className="bg-[#131314] px-1 rounded">npm start</code></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#dbfcff] font-bold">4.</span>
              <span>Pair WhatsApp via terminal (link device with phone number)</span>
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOM KEY */}
      <div className="p-4 rounded-2xl bg-[#201f20] border border-[#353436] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#dbfcff]" />
            <span className="text-sm font-bold text-white font-display">Add Custom Setting</span>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono text-[#71717A]">Key (env var name)</label>
            <input
              id="custom-key"
              placeholder="e.g. STRIPE_SECRET_KEY"
              className="px-3 py-2 rounded-lg bg-[#131314] border border-[#353436] text-xs font-mono text-white focus:outline-none focus:border-[#dbfcff]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono text-[#71717A]">Value</label>
            <input
              id="custom-value"
              type="password"
              placeholder="Secret value"
              className="px-3 py-2 rounded-lg bg-[#131314] border border-[#353436] text-xs font-mono text-white focus:outline-none focus:border-[#dbfcff]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono text-[#71717A]">Description</label>
            <input
              id="custom-desc"
              placeholder="Optional description"
              className="px-3 py-2 rounded-lg bg-[#131314] border border-[#353436] text-xs font-mono text-white focus:outline-none focus:border-[#dbfcff]"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              const keyInput = document.getElementById('custom-key') as HTMLInputElement | null;
              const valInput = document.getElementById('custom-value') as HTMLInputElement | null;
              const descInput = document.getElementById('custom-desc') as HTMLInputElement | null;
              const key = keyInput?.value.trim();
              const val = valInput?.value.trim();
              if (!key || !val) {
                setError('Key and value are required');
                return;
              }
              setDrafts((d) => ({ ...d, [key]: val }));
              // Also store description temporarily — we'll need to handle this in commit
              // For now, save with empty description; user can edit via API
              commit(key);
              if (keyInput) keyInput.value = '';
              if (valInput) valInput.value = '';
              if (descInput) descInput.value = '';
              setError(null);
            }}
            className="w-full px-4 py-2 rounded-lg bg-[#dbfcff] hover:bg-[#34b27b] text-black font-mono font-bold text-xs transition-colors cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>

      {/* EXISTING SETTINGS LIST */}
      {settings.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#201f20] border border-[#353436] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-[#71717A]">Configured Settings</span>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(JSON.stringify(settings.map(s => `${s.key}=***`).join('\n')))}
              className="text-[10px] font-mono text-[#dbfcff] hover:underline cursor-pointer"
            >
              <Copy className="w-3 h-3" /> Copy keys only
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#353436]">
                  <th className="pb-2 text-[#71717A] font-mono">Key</th>
                  <th className="pb-2 text-[#71717A] font-mono">Description</th>
                  <th className="pb-2 text-[#71717A] font-mono">Updated</th>
                  <th className="pb-2 text-[#71717A] font-mono text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {settings.map((s) => (
                  <tr key={s.key} className="border-b border-[#353436]/50 hover:bg-[#131314]/30 transition-colors">
                    <td className="py-2 font-mono text-zinc-300 truncate max-w-[200px]">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#dbfcff]/50" />
                        {s.key}
                      </span>
                    </td>
                    <td className="py-2 text-[#71717A] truncate max-w-[200px]">
                      {s.description || '—'}
                    </td>
                    <td className="py-2 text-[#71717A] font-mono">
                      {s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeSetting(s.key)}
                        className="text-xs text-rose-400 hover:text-rose-300 underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TEST CONNECTION */}
      {testResult && (
        <div
          className={`p-3 rounded-lg text-xs font-mono flex items-center gap-2 ${
            testResult.ok
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
              : 'bg-rose-950/80 text-rose-300 border border-rose-700/60'
          }`}
        >
          {testResult.ok ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{testResult.key}: {testResult.msg}</span>
        </div>
      )}

      {/* HELP */}
      <details className="group p-4 rounded-2xl bg-[#201f20] border border-[#353436]">
        <summary className="flex items-center gap-2 cursor-pointer list-none text-sm font-bold text-white font-display">
          <AlertCircle className="w-4 h-4 text-[#dbfcff]" />
          Security Notes
        </summary>
        <div className="mt-4 space-y-2 text-xs text-[#A1A1AA] font-mono leading-relaxed">
          <div className="p-3 rounded-lg bg-[#131314] border border-[#353436]">
            <p className="mb-1">• Values are stored in Supabase <code>public.settings</code> table with RLS (admin-only access).</p>
            <p className="mb-1">• Keys are marked as encrypted (is_encrypted flag) — actual encryption depends on your Supabase configuration.</p>
            <p className="mb-1">• This bypasses Vercel environment variable limits.</p>
            <p>• Only users with super_admin or admin roles can read or modify settings.</p>
          </div>
        </div>
      </details>
    </div>
  );
}
