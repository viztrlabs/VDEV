/**
 * GET/POST /api/admin/notifications
 * Admin notification management
 * 
 * GET: List notifications (with optional filtering)
 * POST: Create a new notification (system-level)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireSuperAdmin } from '@/lib/api-guard';
import { getAuthenticatedSupabase } from '@/lib/telegram-services';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Require admin access
  const guard = await requireSuperAdmin(req);
  if (guard.error) return guard.error;

  const supa = getAuthenticatedSupabase();

  if (!supa) {
    return NextResponse.json(
      { success: false, error: 'Supabase not configured' },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(req.url);
  const read = searchParams.get('read'); // 'true' or 'false'
  const type = searchParams.get('type'); // 'info', 'warning', 'error', 'success'
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  try {
    let query = supa
      .from('admin_notifications')
      .select('id, user_id, title, message, type, read, link, created_at, read_at', {
        count: 'exact',
      })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (read !== null) {
      query = query.eq('read', read === 'true');
    }
    if (type) {
      query = query.eq('type', type);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[admin/notifications:GET] Error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch notifications', code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notifications: data || [],
      total: count || 0,
      unreadCount: (data || []).filter((n: any) => !n.read).length,
      page: Math.floor(offset / limit) + 1,
      limit,
    });
  } catch (error: any) {
    console.error('[admin/notifications:GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireSuperAdmin(req);
  if (guard.error) return guard.error;

  const supa = getAuthenticatedSupabase();

  if (!supa) {
    return NextResponse.json(
      { success: false, error: 'Supabase not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { title, message, type = 'info', link, userId } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { success: false, error: 'title is required' },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'message is required' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['info', 'warning', 'error', 'success'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid type: ${type}. Valid types: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Create notification
    const { data, error } = await supa
      .from('admin_notifications')
      .insert({
        user_id: userId || null,
        title,
        message,
        type,
        read: false,
        link,
      })
      .select()
      .single();

    if (error) {
      console.error('[admin/notifications:POST] Error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create notification', code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        notification: data,
        message: 'Notification created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[admin/notifications:POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to mark notifications as read
export async function DELETE(req: NextRequest) {
  const guard = await requireSuperAdmin(req);
  if (guard.error) return guard.error;

  const supa = getAuthenticatedSupabase();

  if (!supa) {
    return NextResponse.json(
      { success: false, error: 'Supabase not configured' },
      { status: 503 }
    );
  }

  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ids array is required' },
        { status: 400 }
      );
    }

    const { error } = await supa
      .from('admin_notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .in('id', ids);

    if (error) {
      console.error('[admin/notifications:DELETE] Error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to mark notifications as read' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Marked ${ids.length} notification(s) as read`,
    });
  } catch (error: any) {
    console.error('[admin/notifications:DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}