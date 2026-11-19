'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Bot,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  Save,
  Copy,
  Check,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  ExternalLink,
  Wifi,
  Mail,
  RefreshCw,
  Terminal,
  Globe,
  Link2,
  ChevronDown,
  ChevronUp,
  FileText,
  Zap,
} from 'lucide-react';
import { useCredentialsStore, maskSecret, CredentialField } from '@/lib/credentials-store';

interface MessagingSettingsProps {
  onSaved?: (message: string) => void;
}

const MESSAGING_FIELDS: CredentialField[] = [
  {
    key: 'TELEGRAM_BOT_TOKEN',
    label: 'Telegram Bot Token',
    description: 'From @BotFather — activates the free Telegram connector for instant replies. This is the PRIMARY free path.',
    placeholder: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
    value: '',
  },
  {
    key: 'TELEGRAM_WEBHOOK_SECRET',
    label: 'Telegram Webhook Secret',
    description: 'Arbitrary secret used to verify inbound webhook calls. Add ?secret_token=VALUE to your webhook URL when registering with Telegram.',
    placeholder: 'openssl rand -hex 32',
    value: '',
  },
  {
    key: 'WHATSAPP_ACCESS_TOKEN',
    label: 'WhatsApp Access Token (reserved)',
    description: 'Meta Cloud API token — NOT free/easy. Requires Meta Business verification, phone number registration, and hosting partner. Placeholder for future official integration.',
    placeholder: 'EAAxxxx...',
    value: '',
  },
  {
    key: 'WHATSAPP_PHONE_NUMBER_ID',
    label: 'WhatsApp Phone Number ID (reserved)',
    description: 'Meta Cloud API phone number ID — paired with Access Token above.',
    placeholder: '123456789012345',
    value: '',
  },
];

export default function MessagingSettings({ onSaved }: MessagingSettingsProps) {
  const { credentials, setCredential, resetCredential } = useCredentialsStore();
  const [revealMap, setRevealMap] = useState<Record<string, boolean>>({});
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookResult, setWebhookResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [showFullGuide, setShowFullGuide] = useState(false);

  const toggleReveal = (key: string) =>
    setRevealMap((m) => ({ ...m, [key]: !m[key] }));

  const handleChange = (key: string, value: string) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const commit = (field: CredentialField) => {
    const next = draft[field.key] ?? '';
    if (next) setCredential(field.key, next);
    setDraft((d) => ({ ...d, [field.key]: '' }));
  };

  const generateEnvSnippet = () => {
    const lines = MESSAGING_FIELDS
      .filter((f) => {
        const c = credentials.find((x) => x.key === f.key);
        return c?.value;
      })
      .map((f) => {
        const c = credentials.find((x) => x.key === f.key);
        return `${f.key}=${c?.value}`;
      });
    return lines.length ? lines.join('\n') : '# No messaging credentials configured yet';
  };

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(generateEnvSnippet());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be blocked */
    }
  };

  const testTelegramBot = async () => {
    const botToken = credentials.find((c) => c.key === 'TELEGRAM_BOT_TOKEN')?.value;

    if (!botToken) {
      setTestResult({ ok: false, msg: 'Set TELEGRAM_BOT_TOKEN first' });
      return;
    }

    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      const data = await res.json();
      if (data.ok) {
        setTestResult({
          ok: true,
          msg: `Connected as @${data.result.username} (ID: ${data.result.id})`,
        });
      } else {
        setTestResult({ ok: false, msg: data.description || 'Invalid token' });
      }
    } catch (e) {
      setTestResult({ ok: false, msg: (e as Error).message });
    }
  };

  const registerWebhook = async () => {
    const botToken = credentials.find((c) => c.key === 'TELEGRAM_BOT_TOKEN')?.value;
    const secret = credentials.find((c) => c.key === 'TELEGRAM_WEBHOOK_SECRET')?.value;

    if (!botToken || !secret) {
      setWebhookResult({ ok: false, msg: 'Set TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET first' });
      return;
    }
    if (!webhookUrl) {
      setWebhookResult({ ok: false, msg: 'Enter webhook base URL (e.g. https://xxx.trycloudflare.com)' });
      return;
    }

    const fullUrl = `${webhookUrl.replace(/\/$/, '')}/api/messaging/telegram?secret_token=${secret}`;

    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fullUrl }),
      });
      const data = await res.json();
      if (data.ok) {
        setWebhookResult({ ok: true, msg: `Webhook registered: ${fullUrl}` });
        // Verify
        const info = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`).then(r => r.json());
        if (info.ok) {
          setWebhookResult({ ok: true, msg: `✅ Webhook active: ${info.result.url}` });
        }
      } else {
        setWebhookResult({ ok: false, msg: data.description || 'Failed to register' });
      }
    } catch (e) {
      setWebhookResult({ ok: false, msg: (e as Error).message });
    }
  };

  const checkWebhookInfo = async () => {
    const botToken = credentials.find((c) => c.key === 'TELEGRAM_BOT_TOKEN')?.value;
    if (!botToken) return;
    try {
      const info = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`).then(r => r.json());
      if (info.ok) {
        setWebhookResult({
          ok: true,
          msg: info.result.url
            ? `Current webhook: ${info.result.url} (pending: ${info.result.pending_update_count})`
            : 'No webhook set',
        });
      }
    } catch {
      setWebhookResult({ ok: false, msg: 'Failed to fetch webhook info' });
    }
  };

  return (
    <div className="space-y-6">
      {/* BANNER */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#18181B] via-[#121214] to-[#09090B] border border-[#27272A] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] font-bold uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" />
            <span>CORE SYSTEM 05 • MESSAGING & SOCIAL CONNECTORS</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            Messaging Settings
          </h2>
          <p className="text-xs text-[#A1A1AA] max-w-2xl">
            Configure Telegram (free, instant) and reserve WhatsApp (official Cloud API — requires Meta verification).
            Keys stored in browser (localStorage) and exported as <code className="text-[#3ECF8E]">.env.local</code> for deployment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copySnippet}
            className="px-4 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy .env.local'}</span>
          </button>
        </div>
      </div>

      {/* TELEGRAM WEBHOOK MANAGEMENT */}
      <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#3ECF8E]" />
            <span className="text-sm font-bold text-white font-display">Telegram Webhook Manager</span>
          </div>
        </div>

        {/* Webhook URL Input */}
        <div className="space-y-3">
          <label className="block text-xs font-mono text-[#A1A1AA]">Webhook Base URL (Cloudflare/Vercel)</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://trainer-exercises-smithsonian-lead.trycloudflare.com"
              className="flex-1 px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
            />
            <button
              onClick={registerWebhook}
              disabled={!webhookUrl || !credentials.find((c) => c.key === 'TELEGRAM_BOT_TOKEN')?.value || !credentials.find((c) => c.key === 'TELEGRAM_WEBHOOK_SECRET')?.value}
              className="px-4 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] disabled:opacity-40 text-black text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Register Webhook</span>
            </button>
            <button
              onClick={checkWebhookInfo}
              disabled={!credentials.find((c) => c.key === 'TELEGRAM_BOT_TOKEN')?.value}
              className="px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-[#A1A1AA] hover:text-white disabled:opacity-40 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Check Status</span>
            </button>
          </div>
          <p className="text-[10px] text-[#71717A]">
            After running <code className="bg-[#09090B] px-1 rounded">cloudflared tunnel --url http://localhost:3000</code>, paste the <strong>https://*.trycloudflare.com</strong> URL here and click Register.
          </p>
        </div>

        {webhookResult && (
          <div
            className={`p-3 rounded-lg text-xs font-mono flex items-center gap-2 ${
              webhookResult.ok
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                : 'bg-rose-950/80 text-rose-300 border border-rose-700/60'
            }`}
          >
            {webhookResult.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{webhookResult.msg}</span>
          </div>
        )}

        {/* Bot Connection Test */}
        <div className="pt-4 border-t border-[#27272A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-[#3ECF8E]" />
            <span className="text-sm font-bold text-white font-display">Bot Connection Test</span>
          </div>
          <button
            type="button"
            onClick={testTelegramBot}
            disabled={!credentials.find((c) => c.key === 'TELEGRAM_BOT_TOKEN')?.value}
            className="px-3 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] disabled:opacity-40 text-black text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Test Bot</span>
          </button>
        </div>
        {testResult && (
          <div
            className={`p-3 rounded-lg text-xs font-mono flex items-center gap-2 ${
              testResult.ok
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                : 'bg-rose-950/80 text-rose-300 border border-rose-700/60'
            }`}
          >
            {testResult.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{testResult.msg}</span>
          </div>
        )}
      </div>

      {/* CREDENTIAL FIELDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {MESSAGING_FIELDS.map((field) => {
          const cred = credentials.find((c) => c.key === field.key);
          const isRevealed = revealMap[field.key];
          const draftVal = draft[field.key] ?? '';
          const hasValue = !!cred?.value;
          const isReserved = field.key.startsWith('WHATSAPP_');

          return (
            <div
              key={field.key}
              className={`p-4 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-3 ${isReserved ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {field.key.includes('TELEGRAM') ? (
                    <Bot className="w-4 h-4 text-[#3ECF8E]" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-[#3ECF8E]" />
                  )}
                  <span className="text-sm font-bold text-white font-display">
                    {field.label} {isReserved && (
                      <span title="Reserved for future Meta Cloud API integration">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400/70" />
                      </span>
                    )}
                  </span>
                </div>
                {hasValue && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                    Set
                  </span>
                )}
              </div>

              <p className="text-[10px] text-[#71717A] leading-relaxed">
                {field.description}
              </p>

              <div className="flex items-center gap-2">
                <input
                  type={isRevealed ? 'text' : 'password'}
                  value={draftVal || (isRevealed ? (cred?.value ?? '') : maskSecret(cred?.value ?? ''))}
                  placeholder={field.placeholder}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  disabled={isReserved}
                  className={`flex-1 px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E] ${
                    isReserved ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => toggleReveal(field.key)}
                  disabled={isReserved}
                  className={`p-2 rounded-lg bg-[#09090B] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer ${
                    isReserved ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title={isRevealed ? 'Hide' : 'Reveal'}
                >
                  {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => commit(field)}
                  disabled={!draftVal || isReserved}
                  className={`px-3 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] disabled:opacity-40 text-black text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${isReserved ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
                {hasValue && !isReserved && (
                  <button
                    type="button"
                    onClick={() => resetCredential(field.key)}
                    className="px-3 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-[#A1A1AA] hover:text-rose-400 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
                <span className="text-[9px] font-mono text-[#71717A] ml-auto">
                  {cred?.updatedAt ? `updated ${new Date(cred.updatedAt).toLocaleString()}` : 'env: ' + field.key}
                </span>
              </div>

              {isReserved && (
                <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-700/40">
                  <p className="text-[9px] font-mono text-rose-400/80 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Reserved — requires Meta Business verification, phone registration fee, and hosting partner.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* EXPORTED SNIPPET PREVIEW */}
      <div className="p-4 rounded-2xl bg-[#09090B] border border-[#27272A]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold text-[#A1A1AA] uppercase">
            .env.local snippet (paste into Vercel / deployment)
          </span>
          <button
            type="button"
            onClick={copySnippet}
            className="text-[10px] font-mono text-[#3ECF8E] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Copy className="w-3 h-3" /> Copy all
          </button>
        </div>
        <pre className="text-[11px] font-mono text-[#A1A1AA] whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
{generateEnvSnippet()}
        </pre>
      </div>

      {/* QUICK START GUIDE */}
      <details className="group p-4 rounded-2xl bg-[#18181B] border border-[#27272A]">
        <summary className="flex items-center gap-2 cursor-pointer list-none text-sm font-bold text-white font-display">
          <KeyRound className="w-4 h-4 text-[#3ECF8E]" />
          Quick Start: Activate Telegram in 3 Steps
        </summary>
        <div className="mt-4 space-y-3 text-xs text-[#A1A1AA] font-mono leading-relaxed">
          <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A]">
            <div className="flex items-center gap-2 mb-2 text-[#3ECF8E] font-bold">1.</div>
            <p>Open Telegram → search <code className="bg-[#09090B] px-1 rounded">@BotFather</code> → send <code className="bg-[#09090B] px-1 rounded">/newbot</code> → name it → copy the token.</p>
          </div>
          <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A]">
            <div className="flex items-center gap-2 mb-2 text-[#3ECF8E] font-bold">2.</div>
            <p>Paste the token into <strong>Telegram Bot Token</strong> above. Generate a secret: <code className="bg-[#09090B] px-1 rounded">openssl rand -hex 32</code> → paste into <strong>Telegram Webhook Secret</strong>.</p>
          </div>
          <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A]">
            <div className="flex items-center gap-2 mb-2 text-[#3ECF8E] font-bold">3.</div>
            <p>Run tunnel, paste URL above, click Register:</p>
            <pre className="text-[10px] mt-1 whitespace-pre-wrap bg-[#18181B] p-2 rounded border border-[#27272A]">
{`cloudflared tunnel --url http://localhost:3000`}
            </pre>
            <p className="mt-1">Paste the <code className="bg-[#09090B] px-1 rounded">https://*.trycloudflare.com</code> URL in the Webhook Manager above → click <strong>Register Webhook</strong>.</p>
          </div>
        </div>
      </details>

      {/* COMPLETE GUIDE */}
      <details className="group p-4 rounded-2xl bg-[#18181B] border border-[#27272A]" open={showFullGuide}>
        <summary className="flex items-center gap-2 cursor-pointer list-none text-sm font-bold text-white font-display" onClick={() => setShowFullGuide(!showFullGuide)}>
          <FileText className="w-4 h-4 text-[#3ECF8E]" />
          Complete Telegram Bot Setup Guide
          {showFullGuide ? <ChevronUp className="w-4 h-4 ml-auto text-[#71717A]" /> : <ChevronDown className="w-4 h-4 ml-auto text-[#71717A]" />}
        </summary>
        <div className="mt-4 space-y-4 text-xs text-[#A1A1AA] font-mono leading-relaxed">
          
          {/* Prerequisites */}
          <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A]">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#3ECF8E]" /> Prerequisites
            </h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Node.js 18+ installed</li>
              <li>Cloudflare account (for cloudflared) — free at dash.cloudflare.com</li>
              <li>Telegram app installed</li>
              <li>VizTR dev server running (<code className="bg-[#18181B] px-1 rounded">pnpm run dev:all</code>)</li>
            </ul>
          </div>

          {/* Step 1: Create Bot */}
          <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A]">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#3ECF8E]" /> 1. Create Telegram Bot
            </h4>
            <ol className="space-y-1 list-decimal list-inside">
              <li>Open Telegram → search <code className="bg-[#18181B] px-1 rounded">@BotFather</code></li>
              <li>Send <code className="bg-[#18181B] px-1 rounded">/newbot</code></li>
              <li>Name: <code>VizTR Assistant</code> | Username: <code>viztr_bot</code> (must end in _bot)</li>
              <li>Copy the token: <code className="bg-[#18181B] px-1 rounded">123456:ABC-DEF...</code></li>
              <li>Paste into <strong>Telegram Bot Token</strong> field above → Save</li>
            </ol>
          </div>

          {/* Step 2: Generate Secret */}
          <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A]">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#3ECF8E]" /> 2. Generate Webhook Secret
            </h4>
            <ol className="space-y-1 list-decimal list-inside">
              <li>Run: <code className="bg-[#18181B] px-1 rounded">openssl rand -hex 32</code></li>
              <li>Copy output (e.g. <code className="bg-[#18181B] px-1 rounded">f0b93542221b5ce017c7452dd5412e708822081bfa052719c2bcca538a5715ecE</code>)</li>
              <li>Paste into <strong>Telegram Webhook Secret</strong> field above → Save</li>
            </ol>
          </div>

          {/* Step 3: Start Tunnel */}
          <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A]">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#3ECF8E]" /> 3. Start Cloudflare Tunnel
            </h4>
            <p className="mb-2">In a <strong>new terminal</strong> (keep dev server running in first terminal):</p>
            <pre className="text-[10px] whitespace-pre-wrap bg-[#18181B] p-2 rounded border border-[#27272A] mb-2">
{`# Install cloudflared (one-time)
# Windows: winget install Cloudflare.cloudflared
# Mac: brew install cloudflared
# Linux: snap install cloudflared

# Run tunnel
cloudflared tunnel --url http://localhost:3000`}
            </pre>
            <p className="mb-2">Copy the <strong>https://*.trycloudflare.com</strong> URL from output.</p>
            <p>Paste it in <strong>Webhook Base URL</strong> field above → click <strong>Register Webhook</strong>.</p>
          </div>

          {/* Step 4: Verify */}
          <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A]">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#3ECF8E]" /> 4. Verify & Test
            </h4>
            <ol className="space-y-1 list-decimal list-inside">
              <li>Click <strong>Check Status</strong> → should show your tunnel URL</li>
              <li>Click <strong>Test Bot</strong> → should show <code>Connected as @viztr_bot</code></li>
              <li>Open Telegram → message <code>@viztr_bot</code> → bot replies with AI response</li>
            </ol>
          </div>

          {/* Production */}
          <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-700/60">
            <h4 className="text-sm font-bold text-amber-300 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Production Deployment (Permanent URL)
            </h4>
            <p className="mb-2">Cloudflare tunnels change URL on restart. For production:</p>
            <ol className="space-y-1 list-decimal list-inside text-[10px]">
              <li>Deploy to Vercel (permanent <code className="bg-[#18181B] px-1 rounded">https://your-app.vercel.app</code>)</li>
              <li>Add all env vars in Vercel Dashboard (see .env.example)</li>
              <li>Register webhook with Vercel URL: <code className="bg-[#18181B] px-1 rounded">https://your-app.vercel.app/api/messaging/telegram?secret_token=YOUR_SECRET</code></li>
            </ol>
          </div>

          {/* Troubleshooting */}
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-700/60">
            <h4 className="text-sm font-bold text-rose-300 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Troubleshooting
            </h4>
            <ul className="space-y-1 list-disc list-inside text-[10px]">
              <li><strong>Bot not replying:</strong> Check dev server terminal for <code>POST /api/messaging/telegram</code> — if missing, webhook URL is wrong</li>
              <li><strong>401 Unauthorized:</strong> Webhook secret mismatch — ensure same secret in settings and webhook URL</li>
              <li><strong>Connection refused:</strong> Dev server not running — run <code>pnpm run dev:all</code></li>
              <li><strong>Tunnel URL changed:</strong> Re-run cloudflared, update Webhook Base URL, click Register</li>
              <li><strong>Build fails on Vercel:</strong> Add all env vars in Vercel Dashboard → Settings → Environment Variables</li>
            </ul>
          </div>

        </div>
      </details>
    </div>
  );
}