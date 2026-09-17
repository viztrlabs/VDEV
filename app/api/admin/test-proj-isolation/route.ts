import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, requireAdmin } from '@/lib/api/auth';
import { handleApiError, successResponse } from '@/lib/api/validation';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    requireAdmin(user);
    const supabase = getSupabaseAdmin();
    return successResponse({ ok: true, hasSupabase: !!supabase });
  } catch (e: any) {
    return handleApiError(e);
  }
}
