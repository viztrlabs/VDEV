export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';
import { applyRateLimit } from '@/lib/rate-limit';
import { isValidSessionId, ensureConversation, resumeStaleHumanSession } from '@/lib/chat/session';
import { getChatConfig } from '@/lib/chat/config';

/**
 * POST /api/chat/session — public, anonymous.
 * Initializes (or fetches) a conversation for a browser session token.
 * Deliberately does NOT require a message, avoiding the empty-text 422 in
 * POST /api/chat that prevented first-time visitors from chatting.
 */
export async function POST(req: NextRequest) {
  const limited = await applyRateLimit(req, { limit: 30, window: '60 s' });
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

  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
  }

  try {
    const name = typeof body.clientName === 'string' ? body.clientName : undefined;
    const email = typeof body.clientEmail === 'string' ? body.clientEmail : undefined;
    const conversation = await ensureConversation(supabase, {
      sessionId: body.sessionId,
      clientName: name,
      clientEmail: email,
    });
    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Could not initialize chat session' }, { status: 500 });
    }

    const cfg = await getChatConfig();
    const active = await resumeStaleHumanSession(
      supabase,
      conversation,
      Date.now(),
      cfg.autoResumeHours * 60 * 60 * 1000,
    );

    return NextResponse.json({
      success: true,
      sessionId: body.sessionId,
      conversationId: active.id,
      mode: active.mode,
      clientName: active.client_name,
      clientEmail: active.client_email,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to initialize chat session' },
      { status: 500 },
    );
  }
}
