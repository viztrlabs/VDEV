export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-guard';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { z } from 'zod';

const SendMessageSchema = z.object({
  text: z.string().min(1).max(4000),
  sender: z.enum(['agent', 'bot']).default('agent'),
});

/**
 * GET /api/whatsapp/conversations/[id]/messages
 * Get message history for a conversation
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const conversationId = params.id;

  try {
    // Verify conversation exists and is WhatsApp
    const { data: conv, error: convError } = await supabaseAdmin
      .from('conversations')
      .select('id, provider, status, client_name, client_phone, external_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conv.provider !== 'whatsapp') {
      return NextResponse.json({ error: 'Not a WhatsApp conversation' }, { status: 400 });
    }

    // Mark messages as read
    await supabaseAdmin
      .from('messages')
      .update({ status: 'read' })
      .eq('conversation_id', conversationId)
      .eq('sender', 'user')
      .neq('status', 'read');

    // Fetch messages
    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      conversation: {
        id: conv.id,
        client_name: conv.client_name,
        client_phone: conv.client_phone,
        external_id: conv.external_id,
        status: conv.status,
      },
      messages: messages || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/whatsapp/conversations/[id]/messages
 * Send a reply message via WhatsApp bot
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const conversationId = params.id;

  let body: { text?: string; sender?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validated = SendMessageSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: 'Invalid request', issues: validated.error.issues },
      { status: 422 }
    );
  }

  const { text, sender } = validated.data;

  try {
    // Verify conversation exists
    const { data: conv, error: convError } = await supabaseAdmin
      .from('conversations')
      .select('id, provider, external_id, status, client_phone')
      .eq('id', conversationId)
      .single();

    if (convError || !conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conv.provider !== 'whatsapp') {
      return NextResponse.json({ error: 'Not a WhatsApp conversation' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Save message to database
    const { data: savedMessage, error: msgError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender: 'agent',
        text,
        message_type: 'text',
        status: 'sent',
        metadata: {
          source: 'whatsapp_admin',
          sent_by: guard.userId,
          sent_at: now,
        },
        created_at: now,
      })
      .select()
      .single();

    if (msgError) {
      return NextResponse.json({ error: msgError.message }, { status: 500 });
    }

    // Update conversation status to 'assigned' if it was 'open'
    if (conv.status === 'open') {
      await supabaseAdmin
        .from('conversations')
        .update({ status: 'assigned', updated_at: now })
        .eq('id', conversationId);
    }

    // Send via WhatsApp bot webhook (VizTR_SEND_URL equivalent)
    // The bot polls this endpoint or we can call it directly
    const whatsappPhone = conv.external_id || conv.client_phone;
    try {
      await fetch(`${req.nextUrl.origin}/api/messaging/whatsapp/send`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          to: whatsappPhone,
          text,
        }),
      });
    } catch {
      // Non-fatal - message is saved, bot will pick it up
    }

    return NextResponse.json({
      success: true,
      message: {
        id: savedMessage.id,
        conversationId: savedMessage.conversation_id,
        sender: savedMessage.sender,
        text: savedMessage.text,
        status: savedMessage.status,
        createdAt: savedMessage.created_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}
