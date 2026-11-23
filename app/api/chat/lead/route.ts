export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';
import { applyRateLimit } from '@/lib/rate-limit';
import { isValidSessionId, getConversationBySessionId, insertMessage } from '@/lib/chat/session';
import { createTelegramClient } from '@/lib/telegram/client';
import { publishChatMessage } from '@/lib/chat/realtime';
import { getChatConfig, parseSupportGroupId } from '@/lib/chat/config';

/**
 * POST /api/chat/lead — frictionless lead capture, shown only after handoff.
 * Stores the details on the conversation and posts them into the visitor's
 * bound Telegram Forum Topic so the specialist sees them immediately.
 */
export async function POST(req: NextRequest) {
  const limited = await applyRateLimit(req, { limit: 10, window: '60 s' });
  if (limited) return limited;

  let body: { sessionId?: unknown; clientName?: unknown; clientEmail?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!isValidSessionId(body.sessionId)) {
    return NextResponse.json({ success: false, error: 'A valid sessionId is required' }, { status: 400 });
  }
  const name = typeof body.clientName === 'string' ? body.clientName.trim().slice(0, 255) : '';
  const email = typeof body.clientEmail === 'string' ? body.clientEmail.trim().slice(0, 255) : '';
  if (!name && !email) {
    return NextResponse.json({ success: false, error: 'Name or email is required' }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 });
  }

  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
  }

  try {
    const conv = await getConversationBySessionId(supabase, body.sessionId as string);
    if (!conv) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 });
    }

    const patch: Record<string, unknown> = {};
    if (name) patch.client_name = name;
    if (email) patch.client_email = email;
    const { data: updated } = await supabase
      .from('conversations')
      .update(patch)
      .eq('id', conv.id)
      .select('*')
      .single();

    const detailText = `Visitor details — Name: ${name || 'not provided'}, Email: ${email || 'not provided'}`;
    const saved = await insertMessage(supabase, conv.id, {
      sender: 'system',
      text: detailText,
      metadata: { lead: true },
    });
    if (saved) {
      await publishChatMessage({
        id: saved.id,
        conversationId: conv.id,
        sender: saved.sender,
        text: saved.text,
        status: saved.status,
        createdAt: saved.created_at,
        metadata: saved.metadata,
      });
    }

    if (conv.mode === 'human' && conv.telegram_thread_id) {
      try {
        const cfg = await getChatConfig();
        const groupId = parseSupportGroupId(cfg.supportGroupId);
        if (groupId !== null) {
          const client = createTelegramClient(cfg.botToken || undefined);
          await client.sendMessage(groupId, `<b>${detailText}</b>`, {
            message_thread_id: conv.telegram_thread_id,
            parse_mode: 'HTML',
          });
        }
      } catch (err: any) {
        console.error('[chat/lead] failed to notify Telegram topic:', err?.message);
      }
    }

    return NextResponse.json({ success: true, clientName: updated?.client_name ?? name, clientEmail: updated?.client_email ?? email });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to save details' }, { status: 500 });
  }
}
