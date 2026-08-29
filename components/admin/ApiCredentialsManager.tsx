'use client';

import React, { useState } from 'react';
import {
  KeyRound,
  Eye,
  EyeOff,
  Save,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  Bot,
} from 'lucide-react';
import { useCredentialsStore, maskSecret, CredentialField } from '@/lib/credentials-store';

interface ApiCredentialsManagerProps {
  onSaved?: (message: string) => void;
}

export default function ApiCredentialsManager({ onSaved }: ApiCredentialsManagerProps) {
  const { credentials, setCredential, resetCredential } = useCredentialsStore();
  const [revealMap, setRevealMap] = useState<Record<string, boolean>>({});
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

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
    const lines = credentials
      .filter((c) => c.value)
      .map((c) => `${c.key}=${c.value}`);
    return lines.length ? lines.join('\n') : '# No credentials configured yet';
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

  return (
    <div className="space-y-6">
      {/* BANNER */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#18181B] via-[#121214] to-[#09090B] border border-[#27272A] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] font-bold uppercase tracking-wider">
            <KeyRound className="w-4 h-4" />
            <span>CORE SYSTEM 04 • AI &amp; INTEGRATION CREDENTIALS</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            API Key Management
          </h2>
          <p className="text-xs text-[#A1A1AA] max-w-2xl">
            Enter provider credentials here to activate AI and streaming features. Keys are
            stored in this browser (localStorage) for the session and exported as a{' '}
            <code className="text-[#3ECF8E]">.env.local</code> snippet for deployment. Swap any
            key here in the future without touching code.
          </p>
        </div>
        <button
          type="button"
          onClick={copySnippet}
          className="px-4 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied' : 'Copy .env.local'}</span>
        </button>
      </div>

      {/* CREDENTIAL FIELDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {credentials.map((field) => {
          const isRevealed = revealMap[field.key];
          const draftVal = draft[field.key] ?? '';
          const hasValue = !!field.value;
          return (
            <div
              key={field.key}
              className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {field.key.includes('GEMINI') || field.key.includes('OPENAI') ? (
                    <Bot className="w-4 h-4 text-[#3ECF8E]" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-[#3ECF8E]" />
                  )}
                  <span className="text-sm font-bold text-white font-display">
                    {field.label}
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
                  value={draftVal || (isRevealed ? field.value : maskSecret(field.value))}
                  placeholder={field.placeholder}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
                />
                <button
                  type="button"
                  onClick={() => toggleReveal(field.key)}
                  className="p-2 rounded-lg bg-[#09090B] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                  title={isRevealed ? 'Hide' : 'Reveal'}
                >
                  {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => commit(field)}
                  disabled={!draftVal}
                  className="px-3 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] disabled:opacity-40 text-black text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
                {hasValue && (
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
                  {field.updatedAt ? `updated ${new Date(field.updatedAt).toLocaleString()}` : 'env: ' + field.key}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* EXPORTED SNIPPET PREVIEW */}
      <div className="p-4 rounded-2xl bg-[#09090B] border border-[#27272A]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold text-[#A1A1AA] uppercase">
            .env.local snippet (paste into deployment)
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
    </div>
  );
}
