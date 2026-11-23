export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-guard';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { clearSettingsCache } from '@/lib/server-credentials';
import { maskSecret } from '@/lib/credentials-store';
import {
  CHAT_SETTING_KEYS,
  CHAT_SETTING_DEFAULTS,
  clearChatConfigCache,
  type ChatRuntimeConfig,
} from '@/lib/chat/config';

const SENSITIVE_KEYS = new Set<string>([CHAT_SETTING_KEYS.botToken, CHAT_SETTING_KEYS.webhookSecret]);

const FIELD_MAP: Record<string, { key: string; encrypted: boolean; description: string }> = {
  chatEnabled: { key: CHAT_SETTING_KEYS.chatEnabled, encrypted: false, description: 'Enable the public live chat widget' },
  chatAiEnabled: { key: CHAT_SETTING_KEYS.chatAiEnabled, encrypted: false, description: 'Enable AI auto-replies in live chat' },
  telegramSupportGroupId: { key: CHAT_SETTING_KEYS.supportGroupId, encrypted: false, description: 'Telegram forum supergroup ID for human handoff' },
  telegramBotToken: { key: CHAT_SETTING_KEYS.botToken, encrypted: true, description: '@viztr_bot token' },
  telegramWebhookSecret: { key: CHAT_SETTING_KEYS.webhookSecret, encrypted: true, description: 'Telegram webhook secret token' },
  telegramBotUsername: { key: CHAT_SETTING_KEYS.botUsername, encrypted: false, description: 'Telegram bot username' },
  chatAutoResumeHours: { key: CHAT_SETTING_KEYS.autoResumeHours, encrypted: false, description: 'Hours of inactivity before AI resumes' },
  chatTopicPrefix: { key: CHAT_SETTING_KEYS.topicPrefix, encrypted: false, description: 'Forum topic label prefix' },
  chatHandoffKeywords: { key: CHAT_SETTING_KEYS.handoffKeywords, encrypted: false, description: 'Comma-separated human handoff keywords' },
};

function adminGuard(req: NextRequest) {
  return requireAuth(req, ['super_admin', 'admin']);
}

/** GET — admin-only; sensitive values are masked, never returned in clear. */
export async function GET(req: NextRequest) {
  const guard = await adminGuard(req);
  if (guard.error) return guard.error;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
  }

  try {
    const { data, error } = await supabase.from('settings').select('key,value,is_encrypted,updated_at');
    if (error) throw new Error(error.message);
    const rows = new Map<string, any>(((data ?? []) as any[]).map((r) => [r.key, r]));

    const plain = (key: string, fallback: string) => {
      const row = rows.get(key);
      const value = typeof row?.value === 'string' && row.value.trim() !== '' ? row.value : fallback;
      return { value, hasValue: Boolean(row?.value), updatedAt: row?.updated_at ?? null };
    };

    const secret = (key: string) => {
      const row = rows.get(key);
      const value = typeof row?.value === 'string' ? row.value : '';
      return { value: maskSecret(value), hasValue: Boolean(value), updatedAt: row?.updated_at ?? null };
    };

    return NextResponse.json({
      success: true,
      settings: {
        chatEnabled: plain(CHAT_SETTING_KEYS.chatEnabled, CHAT_SETTING_DEFAULTS.chatEnabled),
        chatAiEnabled: plain(CHAT_SETTING_KEYS.chatAiEnabled, CHAT_SETTING_DEFAULTS.chatAiEnabled),
        telegramSupportGroupId: plain(CHAT_SETTING_KEYS.supportGroupId, CHAT_SETTING_DEFAULTS.supportGroupId),
        telegramBotToken: secret(CHAT_SETTING_KEYS.botToken),
        telegramWebhookSecret: secret(CHAT_SETTING_KEYS.webhookSecret),
        telegramBotUsername: plain(CHAT_SETTING_KEYS.botUsername, ''),
        chatAutoResumeHours: plain(CHAT_SETTING_KEYS.autoResumeHours, CHAT_SETTING_DEFAULTS.autoResumeHours),
        chatTopicPrefix: plain(CHAT_SETTING_KEYS.topicPrefix, CHAT_SETTING_DEFAULTS.topicPrefix),
        chatHandoffKeywords: plain(CHAT_SETTING_KEYS.handoffKeywords, CHAT_SETTING_DEFAULTS.handoffKeywords),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to load chat settings' }, { status: 500 });
  }
}

/**
 * POST — admin-only. Blank secrets mean "keep existing".
 * Values are stored in the same `settings` table used by the rest of the CMS.
 */
export async function POST(req: NextRequest) {
  const guard = await adminGuard(req);
  if (guard.error) return guard.error;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const updates: Array<{ key: string; value: string; is_encrypted: boolean; description: string }> = [];
  for (const [field, meta] of Object.entries(FIELD_MAP)) {
    const raw = body[field];
    if (raw === undefined || raw === null) continue;
    const value = String(raw).trim();
    // Blank sensitive input = leave the stored secret untouched.
    if (SENSITIVE_KEYS.has(meta.key) && value === '') continue;
    updates.push({ key: meta.key, value, is_encrypted: meta.encrypted, description: meta.description });
  }

  if (updates.length === 0) {
    return NextResponse.json({ success: false, error: 'No settings supplied' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
  }

  try {
    for (const u of updates) {
      const { error } = await supabase.from('settings').upsert(
        {
          key: u.key,
          value: u.value,
          is_encrypted: u.is_encrypted,
          description: u.description,
          updated_by: guard.userId ?? 'admin',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' },
      );
      if (error) throw new Error(`${u.key}: ${error.message}`);
    }
    clearChatConfigCache();
    await clearSettingsCache();
    return NextResponse.json({ success: true, saved: updates.map((u) => u.key) });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to save chat settings' }, { status: 500 });
  }
}

// Re-exported type for consumers that want the resolved runtime shape.
export type { ChatRuntimeConfig };
