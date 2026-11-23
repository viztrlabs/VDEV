import { NextResponse } from 'next/server';
import { createRepositoryFactory } from '@/lib/repositories';

// GET /api/gtm/config - Publicly accessible lightweight configuration for frontend injection
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const repo = await createRepositoryFactory();
    const settings = await repo.gtmSettings.get();

    if (!settings) {
      return NextResponse.json({
        success: true,
        data: {
          containerId: 'GTM-WL2Z8H5C',
          isEnabled: true,
          defaultRule: 'include_all',
          pageRules: [],
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        containerId: settings.containerId,
        isEnabled: settings.isEnabled,
        defaultRule: settings.defaultRule,
        pageRules: settings.pageRules,
      },
    });
  } catch (error) {
    // Fallback safe defaults if db query fails
    return NextResponse.json({
      success: true,
      data: {
        containerId: 'GTM-WL2Z8H5C',
        isEnabled: true,
        defaultRule: 'include_all',
        pageRules: [],
      },
    });
  }
}
