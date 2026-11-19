export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sanitizeString, validateEnum } from '@/lib/api-guard';
import { requireAuth } from '@/lib/api-guard';

interface WhatsAppIncomingMessage {
  messageId: string;
  from: string;
  text: string;
  timestamp?: string;
  senderName?: string;
  isGroup?: boolean;
  groupName?: string;
}

interface WhatsAppOutgoingMessage {
  conversationId: string;
  to: string;
  text: string;
}

/**
 * GET /api/messaging/whatsapp
 * Returns WhatsApp integration status
 */
export async function GET() {
  const admin = getSupabaseAdmin();
  const configured = Boolean(process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_PHONE_NUMBER_ID);

  return NextResponse.json({
    ok: true,
    provider: 'whatsapp',
    configured,
    message: configured
      ? 'WhatsApp webhook endpoint ready for FEI XMD bot integration'
      : 'Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID to activate',
    webhookUrl: `${process.env.NEXTAUTH_URL || 'https://viztr.com'}/api/messaging/whatsapp`,
    sendUrl: `${process.env.NEXTAUTH_URL || 'https://viztr.com'}/api/messaging/whatsapp/send`,
  });
}

/**
 * POST /api/messaging/whatsapp
 * Webhook endpoint for FEI XMD bot to send incoming WhatsApp messages to VizTR.
 * Bot posts: { messageId, from, text, timestamp, senderName, isGroup, groupName }
 * VizTR stores in conversations/messages tables.
 */
export async function POST(req: NextRequest) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 });
  }

  // Verify webhook secret
  const expectedSecret = process.env.WHATSAPP_WEBHOOK_SECRET;
  if (expectedSecret) {
    const provided =
      req.nextUrl.searchParams.get('secret_token') ||
      req.headers.get('x-whatsapp-webhook-secret');
    if (provided !== expectedSecret) {
      return NextResponse.json({ ok: false, error: 'Unauthorized webhook' }, { status: 401 });
    }
  }

  let body: WhatsAppIncomingMessage;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const messageId = sanitizeString(body.messageId, 255);
  const from = sanitizeString(body.from, 255);
  const text = sanitizeString(body.text, 4000);
  const senderName = sanitizeString(body.senderName || '', 255) || undefined;

  if (!messageId || !from || !text) {
    return NextResponse.json({ ok: false, error: 'messageId, from, and text are required' }, { status: 422 });
  }

  try {
    // Find or create conversation for this WhatsApp user
    let conversationId: string | null = null;

    const { data: existing } = await admin
      .from('conversations')
      .select('id, user_id, status, external_id')
      .eq('provider', 'whatsapp')
      .eq('external_id', from)
      .order('last_message_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      conversationId = existing.id;
    } else {
      // Get or create a system user for WhatsApp messages
      const { data: systemUser } = await admin
        .from('profiles')
        .select('id')
        .eq('email', 'whatsapp-bot@viztr.com')
        .single();

      let userId = systemUser?.id;
      if (!userId) {
        const { data: newUser } = await admin
          .from('profiles')
          .insert({
            email: 'whatsapp-bot@viztr.com',
            role: 'client',
            full_name: senderName || 'WhatsApp User',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('id')
          .single();
        userId = newUser?.id;
      }

      const { data: newConv, error: createError } = await admin
        .from('conversations')
        .insert({
          provider: 'whatsapp',
          user_id: userId || undefined,
          client_name: senderName,
          client_phone: from,
          external_id: from,
          status: 'open',
        })
        .select('id')
        .single();

      if (createError) {
        return NextResponse.json({ ok: false, error: createError.message }, { status: 500 });
      }
      conversationId = newConv.id;
    }

    // Check if message already exists (dedup by external_id)
    const { data: existingMsg } = await admin
      .from('messages')
      .select('id')
      .eq('external_id', messageId)
      .single();

    if (existingMsg) {
      return NextResponse.json({ ok: true, conversationId, duplicate: true });
    }

    // Save the incoming message
    const { data: savedMessage, error: msgError } = await admin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender: 'user',
        text,
        message_type: body.isGroup ? 'text' : 'text',
        status: 'delivered',
        external_id: messageId,
        metadata: {
          source: 'whatsapp',
          sender_name: senderName,
          is_group: body.isGroup || false,
          group_name: body.groupName || null,
          timestamp: body.timestamp || null,
        },
      })
      .select('id, created_at')
      .single();

    if (msgError) {
      return NextResponse.json({ ok: false, error: msgError.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      conversationId,
      messageId: savedMessage.id,
      createdAt: savedMessage.created_at,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to process message' }, { status: 500 });
  }
}

/**
 * POST /api/messaging/whatsapp/send
 * Endpoint for VizTR to send replies via the WhatsApp bot.
 * The WhatsApp bot (FEI XMD) calls this to get pending outbound messages,
 * or VizTR calls this to hand off to the bot for delivery.
 * Body: { conversationId, to, text }
 */
export async function PUT(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 });
  }

  let body: WhatsAppOutgoingMessage;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const { conversationId, to, text } = body;
  const sanitizedText = sanitizeString(text, 4000);

  if (!conversationId || !to || !sanitizedText) {
    return NextResponse.json({ ok: false, error: 'conversationId, to, and text are required' }, { status: 422 });
  }

  // Verify conversation exists and user has access
  const { data: conv, error: convError } = await admin
    .from('conversations')
    .select('id, user_id, provider, external_id')
    .eq('id', conversationId)
    .single();

  if (convError || !conv) {
    return NextResponse.json({ ok: false, error: 'Conversation not found' }, { status: 404 });
  }

  const isOwner = conv.user_id === guard.userId;
  const isAdmin = guard.role === 'super_admin' || guard.role === 'admin';
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ ok: false, error: 'Access denied' }, { status: 403 });
  }

  try {
    // Save the outbound message
    const { data: savedMessage, error: msgError } = await admin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender: 'agent',
        text: sanitizedText,
        message_type: 'text',
        status: 'sent',
        external_id: null,
        metadata: {
          source: 'whatsapp',
          destination: to,
          delivered_via: 'fei-xmd-bot',
        },
      })
      .select('id, created_at')
      .single();

    if (msgError) {
      return NextResponse.json({ ok: false, error: msgError.message }, { status: 500 });
    }

    // Return the message for the WhatsApp bot to deliver via Baileys
    // The bot polls this endpoint or receives webhook callbacks
    return NextResponse.json({
      ok: true,
      messageId: savedMessage.id,
      conversationId,
      to,
      text: sanitizedText,
      createdAt: savedMessage.created_at,
      deliveryMethod: 'whatsapp_bot',
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to send message' }, { status: 500 });
  }
}
