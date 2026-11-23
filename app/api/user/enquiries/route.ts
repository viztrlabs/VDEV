/**
 * GET/POST /api/user/enquiries
 * Client enquiry management
 * 
 * GET: List enquiries (with optional filtering for admin)
 * POST: Create a new enquiry (from Telegram bot or website)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireSuperAdmin } from '@/lib/api-guard';
import { createEnquiry, getEnquiries } from '@/lib/telegram-services';

export const dynamic = 'force-dynamic';

// Allowed service types
const VALID_SERVICE_TYPES = [
  'architectural',
  'virtual_reality',
  'webxr',
  'webar',
  'virtual_tour_360',
  'animation',
  'still_renders',
  'other',
];

export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const serviceType = searchParams.get('serviceType');
  const isAdmin = guard.role === 'super_admin' || guard.role === 'admin';

  try {
    const result = await getEnquiries(
      status || undefined,
      serviceType || undefined,
      isAdmin ? undefined : guard.userId // Non-admins only see their own enquiries
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to fetch enquiries' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      enquiries: result.data?.enquiries || [],
      total: result.data?.total || 0,
    });
  } catch (error: any) {
    console.error('[enquiries:GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      company,
      serviceType = 'other',
      projectType,
      budgetRange,
      timeline,
      message,
      telegramChatId,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'name is required' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'email is required' },
        { status: 400 }
      );
    }

    // Validate service_type
    if (!VALID_SERVICE_TYPES.includes(serviceType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid service_type: ${serviceType}. Valid types: ${VALID_SERVICE_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Create the enquiry
    const result = await createEnquiry(
      name,
      email,
      company,
      serviceType,
      projectType,
      budgetRange,
      timeline,
      message,
      telegramChatId
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create enquiry' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        enquiryId: result.data?.enquiryId,
        message: 'Enquiry submitted successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[enquiries:POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}