import { NextResponse } from 'next/server';
import { getAuthUser, requireAdmin } from '@/lib/api/auth';
import { handleApiError, successResponse } from '@/lib/api/validation';

export async function GET() {
  try {
    const user = await getAuthUser();
    requireAdmin(user);
    return successResponse({ ok: true, route: 'test-validation-imports' }, 200);
  } catch (e: any) {
    return handleApiError(e);
  }
}
