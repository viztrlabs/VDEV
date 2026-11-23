export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-guard';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { createTelegramClient } from '@/lib/telegram/client';
import { getChatConfig, parseSupportGroupId } from '@/lib/chat/config';

/** GET — admin-only health check for the live-chat + Telegram stack. */
export async function GET(req: NextRequest) {
  const guard = await requireAuth(req, ['super_admin', 'admin']);
  if (guard.error) return guard.error;

  const cfg = await getChatConfig();
  const groupId = parseSupportGroupId(cfg.supportGroupId);

  // 1) Schema check — does the conversations.session_id column exist yet?
  let schemaReady = false;
  let schemaDetail = 'Unknown';
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const check = await supabase.from('conversations').select('session_id').limit(1);
    schemaReady = !check.error;
    schemaDetail = check.error ? check.error.message : 'conversations.session_id present';
  } else {
    schemaDetail = 'Supabase admin client not configured';
  }

  // 2) Bot checks — getMe + getWebhookInfo + support group reachability.
  let botConnected = false;
  let botUsername = cfg.botUsername || null;
  let botDetail = '';
  let webhookUrl: string | null = null;
  let pendingUpdates: number | null = null;
  let webhookDetail = '';
  let supportGroupConnected = false;
  let supportGroupDetail = '';

  if (!cfg.botToken) {
    botDetail = 'Bot token is not configured';
    webhookDetail = 'Bot token is not configured';
    supportGroupDetail = 'Bot token is not configured';
  } else {
    const client = createTelegramClient(cfg.botToken);
    try {
      const me: any = await client.getMe();
      botConnected = true;
      botUsername = `@${me.username || cfg.botUsername || 'unknown'}`;
    } catch (err: any) {
      botDetail = err?.message || 'getMe failed';
    }
    try {
      const info: any = await client.getWebhookInfo();
      webhookUrl = info?.url || null;
      pendingUpdates = typeof info?.pending_update_count === 'number' ? info.pending_update_count : null;
      webhookDetail = info?.last_error_message || (info?.url ? 'Webhook registered' : 'No webhook registered');
    } catch (err: any) {
      webhookDetail = err?.message || 'getWebhookInfo failed';
    }
    if (groupId === null) {
      supportGroupDetail = 'Support group ID is invalid';
    } else {
      try {
        const chat: any = await client.getChat(groupId);
        supportGroupConnected = Boolean(chat?.id);
        supportGroupDetail = supportGroupConnected ? `${chat.title || chat.id} (forum: ${chat.is_forum === true})` : 'Chat not found';
      } catch (err: any) {
        supportGroupDetail = err?.message || 'getChat failed';
      }
    }
  }

  const healthy = schemaReady && botConnected && supportGroupConnected && Boolean(webhookUrl);
  return NextResponse.json({
    success: true,
    healthy,
    checks: {
      schemaReady: { ok: schemaReady, detail: schemaDetail },
      botConnected: { ok: botConnected, username: botUsername, detail: botDetail },
      webhook: { ok: Boolean(webhookUrl), url: webhookUrl, pendingUpdates, detail: webhookDetail },
      supportGroup: { ok: supportGroupConnected, groupId: cfg.supportGroupId, detail: supportGroupDetail },
    },
  });
}
