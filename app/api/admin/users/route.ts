/**
 * GET /api/admin/users
 * List all registered users (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/api-guard';
import { getAuthenticatedSupabase } from '@/lib/telegram-services';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Require super_admin or admin
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
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  try {
    let query = supa
      .from('user_profiles')
      .select('id, category, bio, company, location, website, portfolio_url, experience_level, status, telegram_chat_id, created_at, updated_at, approved_by, approved_at', {
        count: 'exact',
      })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[admin/users:GET] Error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch users', code: error.code },
        { status: 500 }
      );
    }

    // Remove sensitive fields from response
    const users = (data || []).map((user: any) => ({
      ...user,
      // Don't expose telegram_chat_id in list views for privacy
      // It's only shown to the specific user or when approved
      telegram_chat_id: undefined,
    }));

    return NextResponse.json({
      success: true,
      users,
      total: count || 0,
      page: Math.floor(offset / limit) + 1,
      limit,
    });
  } catch (error: any) {
    console.error('[admin/users:GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}