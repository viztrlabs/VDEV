export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, sanitizeString, validateEnum } from '@/lib/api-guard';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { applyRateLimit } from '@/lib/rate-limit';
import { getViztrAgentReply } from '@/lib/messaging/viztr-agent';
import {
  isValidSessionId,
  ensureConversation,
  getConversationBySessionId,
  resumeStaleHumanSession,
  insertMessage,
  shouldHandoff,
  type ChatConversation,
} from '@/lib/chat/session';
import { performHandoff, type HandoffTrigger } from '@/lib/chat/handoff';
import { publishChatMessage } from '@/lib/chat/realtime';

interface ChatMessageInput {
  sessionId?: string;
  conversationId?: string;
  text: string;
  sender: 'user' | 'agent' | 'bot';
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  externalId?: string;
  provider?: 'web' | 'telegram' | 'whatsapp';
}

function serializeMessage(message: any) {
  return {
    id: message.id,
    conversationId: message.conversation_id,
    sender: message.sender,
    text: message.text,
    status: message.status,
    createdAt: message.created_at,
    metadata: message.metadata,
  };
}

/**
 * POST /api/chat — send a message in a conversation.
 * Visitors (unauthenticated) can chat via a `sessionId` token.
 */
export async function POST(req: NextRequest) {
  const limited = await applyRateLimit(req, { limit: 30, window: '60 s' });
  if (limited) return limited;

  let session: any = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    // Session may not exist for visitors — continue as anonymous
  }

  let body: ChatMessageInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const text = sanitizeString(body.text, 4000);
  if (!text) {
    return NextResponse.json({ success: false, error: 'Message text is required' }, { status: 422 });
  }

  const sender = validateEnum(body.sender, ['user', 'agent', 'bot']) || 'user';
  const provider = validateEnum(body.provider, ['web', 'telegram', 'whatsapp']) || 'web';

  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
  }
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
  }

  const userId = session?.user?.id || null;
  const userRole = session?.user?.role || null;
  const hasSession = isValidSessionId(body.sessionId);

  try {
    // ---------- Resolve or create the conversation ----------
    let conversation: ChatConversation | null = null;

    if (hasSession) {
      conversation = await ensureConversation(supabaseAdmin, {
        sessionId: body.sessionId as string,
        clientName: body.clientName,
        clientEmail: body.clientEmail,
      });
      if (!conversation) {
        return NextResponse.json({ success: false, error: 'Could not initialize chat session' }, { status: 500 });
      }
    } else if (body.conversationId) {
      const { data: conv, error: convError } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .eq('id', body.conversationId)
        .single();
      if (convError || !conv) {
        return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 });
      }
      const isOwner = conv.user_id === userId;
      const isAdmin = userRole === 'super_admin' || userRole === 'admin';
      if (!isOwner && !isAdmin && conv.provider === 'web') {
        return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
      }
      conversation = conv as ChatConversation;
    } else {
      const visitorName = sanitizeString(body.clientName || '', 255) || undefined;
      const visitorEmail = sanitizeString(body.clientEmail || '', 255) || undefined;
      const visitorPhone = sanitizeString(body.clientPhone || '', 50) || undefined;
      const { data: newConv, error: createError } = await supabaseAdmin
        .from('conversations')
        .insert({
          provider,
          user_id: userId || undefined,
          client_name: visitorName,
          client_email: visitorEmail,
          client_phone: visitorPhone,
          external_id: body.externalId || undefined,
          status: 'open',
        })
        .select('*')
        .single();
      if (createError || !newConv) {
        return NextResponse.json({ success: false, error: createError?.message || 'Failed to create conversation' }, { status: 500 });
      }
      conversation = newConv as ChatConversation;
    }

    // 4-hour stale-human fallback before deciding whether to call the AI.
    conversation = await resumeStaleHumanSession(supabaseAdmin, conversation);

    // ---------- Persist the visitor message ----------
    const saved = await insertMessage(supabaseAdmin, conversation.id, {
      sender,
      text,
      metadata: { provider, ...(body.externalId ? { externalId: body.externalId } : {}) },
    });
    if (!saved) {
      return NextResponse.json({ success: false, error: 'Failed to save message' }, { status: 500 });
    }

    const responseMessages: any[] = [serializeMessage(saved)];

    // A human owns this session — the AI must stay silent.
    if (conversation.mode === 'human') {
      return NextResponse.json({
        success: true,
        conversationId: conversation.id,
        sessionId: hasSession ? body.sessionId : undefined,
        mode: 'human',
        message: serializeMessage(saved),
        messages: responseMessages,
      });
    }

    // ---------- AI-first reply ----------
    let handoff: { ok: boolean; error?: string } | null = null;
    try {
      const reply = await getViztrAgentReply(text, {
        userId: hasSession ? (body.sessionId as string) : (userId ? String(userId) : undefined),
        provider: 'web',
        conversationId: conversation.id,
        escalateIfNoAnswer: true,
      });

      const botMessage = await insertMessage(supabaseAdmin, conversation.id, {
        sender: 'bot',
        text: reply.text,
        metadata: { model: reply.model, simulated: reply.simulated, escalated: reply.escalated, sources: reply.sources?.map((s) => ({ title: s.title, url: s.url })) },
      });
      if (botMessage) responseMessages.push(serializeMessage(botMessage));

      if (shouldHandoff(text, reply.escalated)) {
        const trigger: HandoffTrigger = reply.escalated
          ? 'ai_escalation'
          : /\b(human|agent|specialist|person|talk to someone|real person|speak to someone)\b/i.test(text)
            ? 'human_request'
            : 'quote_request';
        handoff = await performHandoff({ supabase: supabaseAdmin, conversation, trigger });
      }
    } catch (aiError: any) {
      // AI failure still delivers the visitor's message; log and keep the
      // conversation usable (a specialist handoff is attempted as fallback).
      console.error('[chat] AI reply failed:', aiError?.message);
      handoff = await performHandoff({ supabase: supabaseAdmin, conversation, trigger: 'ai_escalation' });
    }

    // Instant delivery to the widget (broadcast); polling remains the fallback.
    for (const m of responseMessages) {
      await publishChatMessage({ ...m, conversationId: conversation.id });
    }

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      sessionId: hasSession ? body.sessionId : undefined,
      mode: handoff?.ok ? 'human' : 'ai',
      message: serializeMessage(saved),
      messages: responseMessages,
      handoff: handoff ? { requested: true, ok: handoff.ok, error: handoff.error } : { requested: false },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to send message' },
      { status: 500 },
    );
  }
}

/**
 * GET /api/chat — retrieve messages for a conversation.
 * Anonymous visitors are authorized by their `sessionId` bearer token;
 * the original admin/user authentication path is preserved.
 */
export async function GET(req: NextRequest) {
  const limited = await applyRateLimit(req, { limit: 60, window: '60 s' });
  if (limited) return limited;

  const { searchParams } = new URL(req.url);
  const sessionIdParam = searchParams.get('sessionId');
  const conversationId = searchParams.get('conversationId');
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  const anonymous = isValidSessionId(sessionIdParam);
  let guard: any = null;
  if (!anonymous) {
    guard = await requireAuth(req);
    if (guard.error) return guard.error;
  }

  if (!conversationId && !anonymous) {
    return NextResponse.json({ success: false, error: 'conversationId is required' }, { status: 400 });
  }

  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
  }
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
  }

  try {
    let conversation: ChatConversation | null = null;

    if (anonymous) {
      conversation = await getConversationBySessionId(supabaseAdmin, sessionIdParam as string);
      if (!conversation) {
        return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 });
      }
      // A caller may pass both; refuse mismatched ids.
      if (conversationId && conversationId !== conversation.id) {
        return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
      }
      conversation = await resumeStaleHumanSession(supabaseAdmin, conversation);
    } else {
      const { data: conv, error: convError } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
      if (convError || !conv) {
        return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 });
      }
      const isOwner = conv.user_id === guard.userId;
      const isAdmin = guard.role === 'super_admin' || guard.role === 'admin';
      if (!isOwner && !isAdmin) {
        return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
      }
      conversation = conv as ChatConversation;
    }

    const { data: messages, error: msgError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
      .range(offset, offset + Math.min(limit, 200) - 1);

    if (msgError) {
      return NextResponse.json({ success: false, error: msgError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      sessionId: anonymous ? sessionIdParam : undefined,
      mode: conversation.mode,
      messages: (messages || []).map(serializeMessage),
      count: messages?.length || 0,
      offset,
      limit,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to retrieve messages' },
      { status: 500 },
    );
  }
}
