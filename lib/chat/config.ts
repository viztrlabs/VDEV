/**
 * Database-first runtime configuration for live chat + @viztr_bot.
 *
 * Admin-controlled values live in Supabase `settings` (key/value rows) and
 * take precedence over environment variables, so changes made in the Admin
 * CMS apply immediately on both Vercel and local dev without a redeploy.
 * Env vars remain the fallback for first-run / migration scenarios.
 *
 * Only non-sensitive values are ever sent to the browser. Tokens and secrets
 * stay server-side and are masked by the admin settings API.
 */

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { createTelegramClient } from '@/lib/telegram/client';

export const CHAT_SETTING_KEYS = {
  chatEnabled: 'chat_enabled',
  chatAiEnabled: 'chat_ai_enabled',
  supportGroupId: 'telegram_support_group_id',
  botToken: 'TELEGRAM_BOT_TOKEN',
  webhookSecret: 'TELEGRAM_WEBHOOK_SECRET',
  botUsername: 'TELEGRAM_BOT_USERNAME',
  autoResumeHours: 'chat_auto_resume_hours',
  topicPrefix: 'chat_topic_prefix',
  handoffKeywords: 'chat_handoff_keywords',
} as const;

export const CHAT_SETTING_DEFAULTS = {
  chatEnabled: 'true',
  chatAiEnabled: 'true',
  supportGroupId: '-1004419719289',
  autoResumeHours: '4',
  topicPrefix: 'Visitor #VTR-',
  handoffKeywords: 'human, agent, specialist, person, quote, pricing',
} as const;

export interface ChatRuntimeConfig {
  chatEnabled: boolean;
  chatAiEnabled: boolean;
  supportGroupId: string;
  botToken: string;
  webhookSecret: string;
  botUsername: string;
  autoResumeHours: number;
  topicPrefix: string;
  handoffKeywords: string[];
}

let cached: { at: number; value: ChatRuntimeConfig } | null = null;
const CACHE_TTL_MS = 30_000;

export function clearChatConfigCache(): void {
  cached = null;
}

async function loadSettingsRows(): Promise<Record<string, string>> {
  const client = getSupabaseAdmin();
  if (!client) return {};
  try {
    const { data, error } = await client.from('settings').select('key,value');
    if (error || !Array.isArray(data)) return {};
    const map: Record<string, string> = {};
    for (const row of data as Array<{ key: string; value: unknown }>) {
      if (typeof row.key === 'string' && typeof row.value === 'string') {
        map[row.key] = row.value;
      }
    }
    return map;
  } catch {
    return {};
  }
}

function bool(value: string | undefined, fallback: string): boolean {
  return (value ?? fallback).trim().toLowerCase() === 'true';
}

export async function getChatConfig(forceRefresh = false): Promise<ChatRuntimeConfig> {
  if (!forceRefresh && cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.value;

  const s = await loadSettingsRows();
  const env = process.env;
  const pick = (key: string, envKey: string | undefined, fallback: string): string => {
    const fromDb = s[key];
    if (typeof fromDb === 'string' && fromDb.trim() !== '') return fromDb.trim();
    if (envKey && typeof env[envKey] === 'string' && env[envKey]!.trim() !== '') return env[envKey]!.trim();
    return fallback;
  };

  const hoursRaw = Number(pick(CHAT_SETTING_KEYS.autoResumeHours, undefined, CHAT_SETTING_DEFAULTS.autoResumeHours));
  const value: ChatRuntimeConfig = {
    chatEnabled: bool(s[CHAT_SETTING_KEYS.chatEnabled], CHAT_SETTING_DEFAULTS.chatEnabled),
    chatAiEnabled: bool(s[CHAT_SETTING_KEYS.chatAiEnabled], CHAT_SETTING_DEFAULTS.chatAiEnabled),
    supportGroupId: pick(CHAT_SETTING_KEYS.supportGroupId, 'TELEGRAM_SUPPORT_GROUP_ID', CHAT_SETTING_DEFAULTS.supportGroupId),
    botToken: pick(CHAT_SETTING_KEYS.botToken, 'TELEGRAM_BOT_TOKEN', ''),
    webhookSecret: pick(CHAT_SETTING_KEYS.webhookSecret, 'TELEGRAM_WEBHOOK_SECRET', ''),
    botUsername: pick(CHAT_SETTING_KEYS.botUsername, 'TELEGRAM_BOT_USERNAME', ''),
    autoResumeHours: Number.isFinite(hoursRaw) && hoursRaw > 0 ? hoursRaw : 4,
    topicPrefix: pick(CHAT_SETTING_KEYS.topicPrefix, undefined, CHAT_SETTING_DEFAULTS.topicPrefix),
    handoffKeywords: pick(CHAT_SETTING_KEYS.handoffKeywords, undefined, CHAT_SETTING_DEFAULTS.handoffKeywords)
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean),
  };

  cached = { at: Date.now(), value };
  return value;
}

export function parseSupportGroupId(value: string): number | null {
  const id = Number(value.trim());
  return Number.isSafeInteger(id) ? id : null;
}

/** Telegram client built with the admin-configured token (DB first, env fallback). */
export async function createConfiguredTelegramClient() {
  const cfg = await getChatConfig();
  return createTelegramClient(cfg.botToken || undefined);
}
