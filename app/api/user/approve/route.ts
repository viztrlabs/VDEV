/**
 * POST /api/user/approve
 * Admin approval/rejection endpoint
 * 
 * Requires: super_admin or admin role
 * Body: { profileId, approved, adminNotes? }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin, requireAuth } from '@/lib/api-guard';
import { adminApproveReject, getAuthenticatedSupabase } from '@/lib/telegram-services';
import { normalizeUserRole, type UserRole } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Require admin or super_admin
  const guard = await requireSuperAdmin(req);
  if (guard.error) return guard.error;

  const adminId = guard.userId;
  const supa = getAuthenticatedSupabase();

  if (!supa) {
    return NextResponse.json(
      { success: false, error: 'Supabase not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { profileId, approved, adminNotes } = body;

    // Validate required fields
    if (!profileId) {
      return NextResponse.json(
        { success: false, error: 'profileId is required' },
        { status: 400 }
      );
    }

    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'approved must be a boolean' },
        { status: 400 }
      );
    }

    // Update the profile
    const result = await adminApproveReject(profileId, approved, adminNotes, adminId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Approval failed' },
        { status: 500 }
      );
    }

    // Create admin notification
    try {
      const profile = result.data?.profile;
      const userName = profile?.name || 'User';
      const userEmail = profile?.email || 'N/A';
      const action = approved ? 'approved' : 'rejected';

      await supa.from('admin_notifications').insert({
        user_id: null, // Admin-level notification
        title: `User ${action}`,
        message: `${userName} (${userEmail}) ${action} by ${guard.role}`,
        type: approved ? 'success' : 'warning',
      });
    } catch (notifError) {
      console.error('[approve] Notification creation error:', notifError);
      // Don't fail the approval if notification creation fails
    }

    return NextResponse.json({
      success: true,
      message: `User ${approved ? 'approved' : 'rejected'} successfully`,
      profile: result.data?.profile,
    });
  } catch (error: any) {
    console.error('[approve] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}