export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, sanitizeString, validateEnum } from '@/lib/api-guard';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface ChatMessageInput {
  conversationId?: string;
  text: string;
  sender: 'user' | 'agent' | 'bot';
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  externalId?: string;
  provider?: 'web' | 'telegram' | 'whatsapp';
}

/**
 * POST /api/chat
 * Send a message in a conversation. Creates a new conversation if none provided.
 * Visitors (unauthenticated) can start conversations; authenticated users are linked.
 */
export async function POST(req: NextRequest) {
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

  const userId = session?.user?.id || null;
  const userRole = session?.user?.role || null;

  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin || !isSupabaseAdminConfigured) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Determine or create conversation
    let conversationId: string | null = body.conversationId || null;

    if (conversationId) {
      // Verify conversation exists and user has access
      const { data: conv, error: convError } = await supabaseAdmin
        .from('conversations')
        .select('id, user_id, status, provider')
        .eq('id', conversationId)
        .single();

      if (convError || !conv) {
        return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 });
      }

      // Access check: owner or admin
      const isOwner = conv.user_id === userId;
      const isAdmin = userRole === 'super_admin' || userRole === 'admin';
      if (!isOwner && !isAdmin && conv.provider === 'web') {
        return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
      }
    } else {
      // Create new conversation
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
        .select('id')
        .single();

      if (createError) {
        return NextResponse.json({ success: false, error: createError.message }, { status: 500 });
      }
      conversationId = newConv.id;
    }

    // Save the message
    const { data: message, error: msgError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender,
        text,
        message_type: 'text',
        status: 'sent',
        external_id: body.externalId || undefined,
        metadata: {},
      })
      .select('*, conversations!inner(id, provider, status)')
      .single();

    if (msgError) {
      return NextResponse.json({ success: false, error: msgError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      conversationId,
      message: {
        id: message.id,
        conversationId: message.conversation_id,
        sender: message.sender,
        text: message.text,
        status: message.status,
        createdAt: message.created_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat
 * Retrieve messages for a conversation. Requires authentication.
 * Query params: conversationId, limit, offset
 */
export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('conversationId');
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  if (!conversationId) {
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
    // Verify access to conversation
    const { data: conv, error: convError } = await supabaseAdmin
      .from('conversations')
      .select('id, user_id, status')
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

    // Fetch messages
    const { data: messages, error: msgError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (msgError) {
      return NextResponse.json({ success: false, error: msgError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      conversationId,
      messages: messages || [],
      count: messages?.length || 0,
      offset,
      limit,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to retrieve messages' },
      { status: 500 }
    );
  }
}
