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

  const testTelegramWebhook = async () => {
    const botToken = credentials.find((c) => c.key === 'TELEGRAM_BOT_TOKEN')?.value;
    const secret = credentials.find((c) => c.key === 'TELEGRAM_WEBHOOK_SECRET')?.value;

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

      {/* TELEGRAM STATUS & TEST */}
      <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#3ECF8E]" />
            <span className="text-sm font-bold text-white font-display">Telegram Bot</span>
          </div>
          <button
            type="button"
            onClick={testTelegramWebhook}
            disabled={!credentials.find((c) => c.key === 'TELEGRAM_BOT_TOKEN')?.value}
            className="px-3 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] disabled:opacity-40 text-black text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Test Connection</span>
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
        <p className="text-[10px] text-[#71717A] leading-relaxed">
          Webhook URL: <code className="text-[#A1A1AA] bg-[#09090B] px-1 rounded">https://your-domain/api/messaging/telegram?secret_token=YOUR_SECRET</code>
        </p>
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
            <p>Deploy to Vercel (or tunnel with ngrok). Register webhook:</p>
            <pre className="text-[10px] mt-1 whitespace-pre-wrap bg-[#18181B] p-2 rounded border border-[#27272A]">
{`curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \\
  -d "url=https://YOUR_DOMAIN/api/messaging/telegram?secret_token=YOUR_SECRET"`}
            </pre>
            <p className="mt-1">Click <strong>Test Connection</strong> → should show your bot username.</p>
          </div>
        </div>
      </details>
    </div>
  );
}