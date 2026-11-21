import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/api-guard';
import { getSupabaseRepository } from '@/lib/repositories';

// POST /api/admin/ga4/credentials/set-active - Set credentials as active
export async function POST(req: NextRequest) {
  try {
    const guard = await requireSuperAdmin(req);
    if (guard.error) return guard.error;

    const body = await req.json();
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Credentials ID is required' },
        { status: 400 }
      );
    }

    const repo = getSupabaseRepository();
    await repo.ga4Credentials.setActive(body.id);

    return NextResponse.json({
      success: true,
      message: 'GA4 credentials set as active successfully',
    });
  } catch (error: any) {
    console.error('GA4 credentials set active error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to set GA4 credentials as active' },
      { status: 500 }
    );
  }
}