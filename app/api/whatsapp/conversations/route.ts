export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-guard';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { z } from 'zod';

/**
 * GET /api/whatsapp/conversations
 * List all WhatsApp conversations for admin dashboard
 */
export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const provider = searchParams.get('provider') || 'whatsapp';
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

  try {
    let query = supabaseAdmin
      .from('conversations')
      .select(`
        *,
        messages (
          id, sender, text, status, created_at
        )
      `, { count: 'exact' })
      .eq('provider', provider)
      .order('last_message_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`client_name.ilike.%${search}%,client_phone.ilike.%${search}%,external_id.ilike.%${search}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform: add last_message preview and unread count
    const conversations = (data || []).map((conv: any) => {
      const messages = conv.messages || [];
      const lastMessage = messages[messages.length - 1];
      const unreadCount = messages.filter((m: any) => m.sender === 'user' && m.status !== 'read').length;

      return {
        id: conv.id,
        provider: conv.provider,
        client_name: conv.client_name || 'Unknown',
        client_phone: conv.client_phone || '',
        external_id: conv.external_id || '',
        status: conv.status,
        assigned_to: conv.assigned_to,
        last_message: lastMessage?.text || '',
        last_message_at: conv.last_message_at,
        unread_count: unreadCount,
        created_at: conv.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      conversations,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/whatsapp/conversations
 * Create a new WhatsApp conversation (for testing/manual)
 */
export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  let body: { client_name?: string; client_phone?: string; external_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { client_name, client_phone, external_id } = body;

  if (!client_phone) {
    return NextResponse.json({ error: 'client_phone is required' }, { status: 422 });
  }

  try {
    const now = new Date().toISOString();
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .insert({
        provider: 'whatsapp',
        client_name: client_name || 'WhatsApp Client',
        client_phone,
        external_id: external_id || client_phone,
        status: 'open',
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, conversation: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
