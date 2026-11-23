export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-guard';
import { getChatConfig, clearChatConfigCache } from '@/lib/chat/config';

/**
 * POST /api/admin/telegram/webhook — register/sync @viztr_bot webhook.
 * Returns Telegram's exact API JSON so the panel can display it verbatim.
 */
export async function POST(req: NextRequest) {
  const guard = await requireAuth(req, ['super_admin', 'admin']);
  if (guard.error) return guard.error;

  let body: { webhookUrl?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    // Bodies are optional: default to the current site origin.
  }

  const origin = new URL(req.url).origin;
  const webhookUrl = typeof body.webhookUrl === 'string' && body.webhookUrl.trim()
    ? body.webhookUrl.trim()
    : `${origin}/api/messaging/telegram`;

  let parsed: URL;
  try {
    parsed = new URL(webhookUrl);
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid webhook URL' }, { status: 400 });
  }
  if (parsed.protocol !== 'https:' && !(parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')) {
    return NextResponse.json({ success: false, error: 'Webhook URL must use HTTPS (or localhost with a tunnel)' }, { status: 400 });
  }

  const cfg = await getChatConfig();
  if (!cfg.botToken) {
    return NextResponse.json({ success: false, error: 'Telegram bot token is not configured in Admin settings' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${cfg.botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: cfg.webhookSecret || undefined,
        drop_pending_updates: true,
      }),
    });
    const result = await res.json();
    clearChatConfigCache();
    return NextResponse.json({ success: result?.ok === true, webhookUrl, result }, { status: res.ok ? 200 : 502 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to contact Telegram' }, { status: 500 });
  }
}
