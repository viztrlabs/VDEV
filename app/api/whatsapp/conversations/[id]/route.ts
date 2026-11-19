export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-guard';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { z } from 'zod';

const UpdateConversationSchema = z.object({
  status: z.enum(['open', 'assigned', 'resolved', 'closed']).optional(),
  assigned_to: z.string().uuid().optional().nullable(),
});

/**
 * PATCH /api/whatsapp/conversations/[id]
 * Update conversation status or assignment
 */
export async function PATCH(
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

  let body: { status?: string; assigned_to?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validated = UpdateConversationSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: 'Invalid request', issues: validated.error.issues },
      { status: 422 }
    );
  }

  const { status, assigned_to } = validated.data;

  try {
    const updateData: { status?: string; assigned_to?: string | null; updated_at: string } = {
      updated_at: new Date().toISOString(),
    };
    if (status) updateData.status = status;
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to;

    const { data, error } = await supabaseAdmin
      .from('conversations')
      .update(updateData)
      .eq('id', conversationId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, conversation: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to update conversation' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/whatsapp/conversations/[id]
 * Delete a conversation (admin only)
 */
export async function DELETE(
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
    const { error } = await supabaseAdmin
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: conversationId });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}
