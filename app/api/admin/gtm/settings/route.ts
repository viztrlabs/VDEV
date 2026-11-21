import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/api-guard';
import { getSupabaseRepository } from '@/lib/repositories';
import type { GTMSettingsInput } from '@/lib/super-admin-store-types';

// GET /api/admin/gtm/settings - Fetch current GTM settings
export async function GET(req: NextRequest) {
  try {
    const guard = await requireSuperAdmin(req);
    if (guard.error) return guard.error;

    const repo = getSupabaseRepository();
    const settings = await repo.gtmSettings.get();

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error('GTM settings fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch GTM settings' },
      { status: 500 }
    );
  }
}

// POST /api/admin/gtm/settings - Update GTM settings
export async function POST(req: NextRequest) {
  try {
    const guard = await requireSuperAdmin(req);
    if (guard.error) return guard.error;

    const body: GTMSettingsInput = await req.json();

    if (!body.containerId || !body.containerId.trim()) {
      return NextResponse.json(
        { success: false, error: 'Container ID is required (e.g. GTM-XXXXXXX)' },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.pageRules)) {
      return NextResponse.json(
        { success: false, error: 'pageRules must be an array' },
        { status: 400 }
      );
    }

    const repo = getSupabaseRepository();
    const updated = await repo.gtmSettings.update({
      containerId: body.containerId.trim(),
      isEnabled: body.isEnabled !== undefined ? Boolean(body.isEnabled) : true,
      defaultRule: body.defaultRule || 'include_all',
      pageRules: body.pageRules,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'GTM settings updated successfully',
    });
  } catch (error: any) {
    console.error('GTM settings update error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update GTM settings' },
      { status: 500 }
    );
  }
}
