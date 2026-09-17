export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, requireAdmin } from '@/lib/api/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import {
  handleApiError,
  successResponse,
  applyRateLimit,
  generateRequestId,
  addRequestIdHeaders,
} from '@/lib/api/validation';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  const rateLimitResponse = await applyRateLimit(request, { limit: 60, window: '60 s' });
  if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

  try {
    const user = await getAuthUser();
    requireAdmin(user);

    if (!getSupabaseAdmin()) {
      return addRequestIdHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'SERVICE_UNAVAILABLE',
              message: 'Supabase admin client not configured',
            },
          },
          { status: 503 }
        ),
        requestId
      );
    }

    const [projectsCount, clientsCount, experiencesCount, assetsCount, deliverablesCount] = await Promise.all([
      getSupabaseAdmin()!.from('projects').select('id', { count: 'exact', head: true }),
      getSupabaseAdmin()!.from('clients').select('id', { count: 'exact', head: true }),
      getSupabaseAdmin()!.from('experiences').select('id', { count: 'exact', head: true }),
      getSupabaseAdmin()!.from('assets').select('id', { count: 'exact', head: true }),
      getSupabaseAdmin()!.from('deliverables').select('id', { count: 'exact', head: true }),
    ]);

    return addRequestIdHeaders(
      successResponse(
        {
          projects: projectsCount.count ?? 0,
          clients: clientsCount.count ?? 0,
          experiences: experiencesCount.count ?? 0,
          assets: assetsCount.count ?? 0,
          deliverables: deliverablesCount.count ?? 0,
        },
        { requestId }
      ),
      requestId
    );
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}
