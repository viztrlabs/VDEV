'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Bot,
  CheckCircle2,
  Clock,
  Database,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  MessageSquare,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
  Webhook,
  XCircle,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

type SettingField = { value: string; hasValue: boolean; updatedAt: string | null };
type SettingsMap = Record<string, SettingField>;

type HealthCheck = { ok: boolean; detail?: string; [key: string]: unknown };
type Health = {
  healthy: boolean;
  checks: {
    schemaReady: HealthCheck;
    botConnected: HealthCheck;
    webhook: HealthCheck;
    supportGroup: HealthCheck;
  };
};

const INPUT = 'w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]';
const CARD = 'p-4 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-3';
const PRIMARY = 'flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs disabled:opacity-50';
const SECONDARY = 'flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-[#A1A1AA] hover:text-white hover:border-[#3F3F46] disabled:opacity-50';

function StatusTile({ label, value, detail, ok }: { label: string; value: string; detail?: string; ok: boolean }) {
  return (
    <div className="p-3 rounded-xl bg-[#09090B] border border-[#27272A] space-y-1">
      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
        {ok ? <CheckCircle2 className="w-3.5 h-3.5 text-[#3ECF8E]" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
        {label}
      </div>
      <div className={`text-sm font-bold truncate ${ok ? 'text-white' : 'text-red-300'}`}>{value}</div>
      {detail && <div className="text-[10px] font-mono text-[#71717A] truncate" title={detail}>{detail}</div>}
    </div>
  );
}

export default function LiveChatSettings() {
  const { showToast } = useAppStore();
  const [settings, setSettings] = useState<SettingsMap>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [health, setHealth] = useState<Health | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookResult, setWebhookResult] = useState<string>('');
  const [testResult, setTestResult] = useState<string>('');
  const [busyWebhook, setBusyWebhook] = useState(false);
  const [busyTest, setBusyTest] = useState(false);
  const [revealToken, setRevealToken] = useState(false);
  const [revealSecret, setRevealSecret] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/live-chat/settings', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error || 'Failed to load settings');
      setSettings(data.settings);
      const next: Record<string, string> = {};
      for (const [key, field] of Object.entries(data.settings) as Array<[string, SettingField]>) {
        // Secrets are masked in responses — keep drafts blank ("leave blank to keep").
        next[key] = field.value && !field.value.includes('••••') ? field.value : '';
      }
      setDrafts(next);
    } catch (err: any) {
      showToast(err?.message || 'Failed to load live chat settings', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const loadHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const res = await fetch('/api/admin/telegram/status', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.success) setHealth(data as Health);
      else setWebhookResult((prev) => prev || data?.error || 'Health check failed');
    } catch {
      // keep previous health state
    } finally {
      setHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
    void loadHealth();
    setWebhookUrl(`${window.location.origin}/api/messaging/telegram`);
  }, [loadSettings, loadHealth]);

  const setDraft = (key: string, value: string) => setDrafts((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/live-chat/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatEnabled: String(drafts.chatEnabled === 'true'),
          chatAiEnabled: String(drafts.chatAiEnabled === 'true'),
          telegramSupportGroupId: drafts.telegramSupportGroupId || '',
          telegramBotUsername: drafts.telegramBotUsername || '',
          telegramBotToken: drafts.telegramBotToken || '',
          telegramWebhookSecret: drafts.telegramWebhookSecret || '',
          chatAutoResumeHours: drafts.chatAutoResumeHours || '4',
          chatTopicPrefix: drafts.chatTopicPrefix || 'Visitor #VTR-',
          chatHandoffKeywords: drafts.chatHandoffKeywords || '',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error || 'Save failed');
      showToast('Live chat & Telegram settings saved', 'success');
      await loadSettings();
      await loadHealth();
    } catch (err: any) {
      showToast(err?.message || 'Could not save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRegisterWebhook = async () => {
    setBusyWebhook(true);
    setWebhookResult('');
    try {
      const res = await fetch('/api/admin/telegram/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl }),
      });
      const data = await res.json();
      setWebhookResult(JSON.stringify(data.result ?? { error: data.error }, null, 2));
      showToast(data.success ? 'Webhook registered successfully' : 'Webhook registration failed', data.success ? 'success' : 'error');
      await loadHealth();
    } catch (err: any) {
      setWebhookResult(err?.message || 'Request failed');
      showToast('Webhook registration failed', 'error');
    } finally {
      setBusyWebhook(false);
    }
  };

  const handleTestTopic = async () => {
    setBusyTest(true);
    setTestResult('');
    try {
      const res = await fetch('/api/admin/telegram/test-topic', { method: 'POST' });
      const data = await res.json();
      setTestResult(data.success ? `Created topic “${data.topicName}” (thread ${data.messageThreadId})` : (data.error || 'Test failed'));
      showToast(data.success ? 'Test topic created — check Support_Bot' : 'Test topic failed', data.success ? 'success' : 'error');
    } catch (err: any) {
      setTestResult(err?.message || 'Request failed');
      showToast('Test topic failed', 'error');
    } finally {
      setBusyTest(false);
    }
  };

  const secretField = (key: string, label: string, revealed: boolean, toggle: () => void) => (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
        <KeyRound className="w-3 h-3" /> {label}
        {settings[key]?.hasValue && <span className="text-[9px] text-[#3ECF8E] normal-case">configured</span>}
      </label>
      <div className="relative">
        <input
          type={revealed ? 'text' : 'password'}
          value={drafts[key] || ''}
          onChange={(e) => setDraft(key, e.target.value)}
          placeholder={settings[key]?.value || 'Leave blank to keep existing'}
          className={`${INPUT} pr-10`}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white"
          aria-label={revealed ? 'Hide' : 'Show'}
        >
          {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#3ECF8E]/10 border border-[#3ECF8E]/20">
            <MessageSquare className="w-5 h-5 text-[#3ECF8E]" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-white">Live Chat &amp; Telegram</h1>
            <p className="text-[11px] font-mono text-[#A1A1AA] mt-0.5">
              Configure the AI-first visitor chat, human handoff and the @viztr_bot webhook — no CLI or .env edits required.
            </p>
          </div>
        </div>
        <button onClick={() => { void loadSettings(); void loadHealth(); }} disabled={healthLoading || loading} className={SECONDARY}>
          <RefreshCw className={`w-3.5 h-3.5 ${healthLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* System health */}
      <section className="space-y-2">
        <h2 className="text-xs font-mono font-bold text-[#e2c073] uppercase tracking-wider">System health</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatusTile
            label="Database schema"
            value={health?.checks.schemaReady?.ok ? 'Ready' : 'Not ready'}
            detail={health?.checks.schemaReady?.detail || 'Checking…'}
            ok={Boolean(health?.checks.schemaReady?.ok)}
          />
          <StatusTile
            label="Bot connected"
            value={health?.checks.botConnected?.ok ? String(health.checks.botConnected.username || 'Connected') : 'Disconnected'}
            detail={health?.checks.botConnected?.detail || 'Checking…'}
            ok={Boolean(health?.checks.botConnected?.ok)}
          />
          <StatusTile
            label="Webhook"
            value={health?.checks.webhook?.ok ? 'Registered' : 'Not registered'}
            detail={String(health?.checks.webhook?.url || health?.checks.webhook?.detail || 'Checking…')}
            ok={Boolean(health?.checks.webhook?.ok)}
          />
          <StatusTile
            label="Support group"
            value={health?.checks.supportGroup?.ok ? 'Connected' : 'Unreachable'}
            detail={health?.checks.supportGroup?.detail || 'Checking…'}
            ok={Boolean(health?.checks.supportGroup?.ok)}
          />
        </div>
        {health && !health.healthy && (
          <p className="text-[11px] font-mono text-amber-300">
            Some checks are failing — webhook registration or human handoff may not work until they are green.
          </p>
        )}
      </section>

      {/* Webhook registration */}
      <section className={CARD}>
        <div className="flex items-center gap-2">
          <Webhook className="w-4 h-4 text-[#3ECF8E]" />
          <h2 className="text-xs font-mono font-bold text-white">Webhook registration</h2>
          <span className="text-[10px] font-mono text-[#71717A]">auto-detected from this site&apos;s origin</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} className={INPUT} placeholder="https://viztr.vercel.app/api/messaging/telegram" />
          <button onClick={handleRegisterWebhook} disabled={busyWebhook} className={PRIMARY}>
            {busyWebhook ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Webhook className="w-3.5 h-3.5" />}
            Register / Sync
          </button>
          <button onClick={handleTestTopic} disabled={busyTest} className={SECONDARY}>
            {busyTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Send test topic
          </button>
        </div>
        {(webhookResult || testResult) && (
          <div className="grid gap-2">
            {webhookResult && <pre className="max-h-40 overflow-auto p-2 rounded-lg bg-[#09090B] border border-[#27272A] text-[10px] font-mono text-[#A1A1AA] whitespace-pre-wrap">{webhookResult}</pre>}
            {testResult && <p className="text-[11px] font-mono text-[#3ECF8E]">{testResult}</p>}
          </div>
        )}
      </section>

      {/* Settings form */}
      <section className={CARD}>
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold text-white">Configuration</h2>
          <button onClick={handleSave} disabled={saving || loading} className={PRIMARY}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save changes
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { key: 'chatEnabled', label: 'Live chat widget enabled', icon: MessageSquare },
            { key: 'chatAiEnabled', label: 'AI auto-reply enabled', icon: Bot },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setDraft(key, drafts[key] === 'true' ? 'false' : 'true')}
              className="flex items-center justify-between p-3 rounded-xl bg-[#09090B] border border-[#27272A] text-left"
            >
              <span className="flex items-center gap-2 text-xs font-mono text-zinc-200"><Icon className="w-3.5 h-3.5 text-[#3ECF8E]" />{label}</span>
              <span className={`w-9 h-5 rounded-full p-0.5 transition-colors ${drafts[key] === 'true' ? 'bg-[#3ECF8E]' : 'bg-[#3F3F46]'}`}>
                <span className={`block w-4 h-4 rounded-full bg-black transition-transform ${drafts[key] === 'true' ? 'translate-x-4' : ''}`} />
              </span>
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]"><ShieldCheck className="w-3 h-3" /> Support supergroup ID</label>
            <input value={drafts.telegramSupportGroupId || ''} onChange={(e) => setDraft('telegramSupportGroupId', e.target.value)} className={INPUT} placeholder="-1004419719289" />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]"><Clock className="w-3 h-3" /> Auto-resume AI after (hours)</label>
            <input type="number" min="1" max="720" value={drafts.chatAutoResumeHours || ''} onChange={(e) => setDraft('chatAutoResumeHours', e.target.value)} className={INPUT} placeholder="4" />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]"><Database className="w-3 h-3" /> Topic prefix label</label>
            <input value={drafts.chatTopicPrefix || ''} onChange={(e) => setDraft('chatTopicPrefix', e.target.value)} className={INPUT} placeholder="Visitor #VTR-" />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]"><MessageSquare className="w-3 h-3" /> Handoff trigger keywords</label>
            <input value={drafts.chatHandoffKeywords || ''} onChange={(e) => setDraft('chatHandoffKeywords', e.target.value)} className={INPUT} placeholder="human, agent, specialist, person, quote, pricing" />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]"><Bot className="w-3 h-3" /> Bot username</label>
            <input value={drafts.telegramBotUsername || ''} onChange={(e) => setDraft('telegramBotUsername', e.target.value)} className={INPUT} placeholder="@viztr_bot" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {secretField('telegramBotToken', 'Bot token', revealToken, () => setRevealToken((v) => !v))}
          {secretField('telegramWebhookSecret', 'Webhook secret', revealSecret, () => setRevealSecret((v) => !v))}
        </div>
        <p className="text-[10px] font-mono text-[#71717A]">
          Secrets are stored in the Supabase settings table, masked on read, and never sent to the browser widget. Leave a secret field blank to keep the existing value.
        </p>
      </section>
    </div>
  );
}
