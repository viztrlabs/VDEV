export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';
import { applyRateLimit } from '@/lib/rate-limit';
import {
  isValidSessionId,
  getConversationBySessionId,
  resumeStaleHumanSession,
} from '@/lib/chat/session';
import { performHandoff } from '@/lib/chat/handoff';
import { getChatConfig } from '@/lib/chat/config';

/** POST /api/chat/handoff — visitor's "Talk to specialist" button. */
export async function POST(req: NextRequest) {
  const limited = await applyRateLimit(req, { limit: 10, window: '60 s' });
  if (limited) return limited;

  let body: { sessionId?: unknown };
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
    const found = await getConversationBySessionId(supabase, body.sessionId as string);
    if (!found) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 });
    }
    const cfg = await getChatConfig();
    const conversation = await resumeStaleHumanSession(
      supabase,
      found,
      Date.now(),
      cfg.autoResumeHours * 60 * 60 * 1000,
    );
    const result = await performHandoff({ supabase, conversation, trigger: 'manual' });
    return NextResponse.json({
      success: result.ok,
      mode: result.ok ? 'human' : conversation.mode,
      error: result.error,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Handoff failed' },
      { status: 500 },
    );
  }
}
