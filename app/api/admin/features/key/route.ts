export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  handleApiError,
  successResponse,
  noContentResponse,
  applyRateLimit,
  generateRequestId,
  addRequestIdHeaders,
  type RateLimitConfig,
} from '@/lib/api/validation';
import { getAuthUser, requireAdmin } from '@/lib/api/auth';
import {
  FeatureToggleSchema,
  UpdateFeatureToggleSchema,
  type FeatureToggle,
  type UpdateFeatureToggle,
} from '@/lib/api/contracts/schemas';

const mockFeatureToggles: FeatureToggle[] = [
  {
    id: 'ft-webxr',
    key: 'ENABLE_WEBXR_VIEWER',
    name: 'WebXR Spatial VR/AR Engine',
    description: 'Enables WebXR device API, Meta Quest 3 & Apple Vision Pro native immersive headset passthrough.',
    category: 'xr',
    enabled: true,
    requiresRestart: false,
    environment: 'all',
    lastModifiedBy: null,
    lastModifiedAt: new Date().toISOString(),
    createdAt: '2025-01-10T08:00:00Z',
  },
  {
    id: 'ft-pixel-streaming',
    key: 'ENABLE_PIXEL_STREAMING',
    name: 'Unreal Engine 5.4 Pixel Streaming',
    description: 'Routes WebRTC video/audio streams directly from global cloud GPU clusters to client web browsers.',
    category: 'rendering',
    enabled: true,
    requiresRestart: false,
    environment: 'all',
    lastModifiedBy: null,
    lastModifiedAt: new Date().toISOString(),
    createdAt: '2025-01-10T08:00:00Z',
  },
];

// GET /api/admin/features/[key] - Get single feature toggle
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const user = await getAuthUser();
    requireAdmin(user);
    const key = request.nextUrl.pathname.split('/').pop() || '';
    
    const rateLimitResponse = await applyRateLimit(request, { limit: 100, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    const toggle = mockFeatureToggles.find(f => f.key === key);
    if (!toggle) {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: `Feature toggle ${key} not found` } },
          { status: 404 }
        ),
        requestId
      );
    }

    return addRequestIdHeaders(successResponse(toggle, { requestId }), requestId);
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}

// PATCH /api/admin/features/[key] - Update feature toggle
export async function PATCH(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const user = await getAuthUser();
    requireAdmin(user);
    const key = request.nextUrl.pathname.split('/').pop() || '';
    
    const rateLimitResponse = await applyRateLimit(request, { limit: 50, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    if (user.role !== 'super_admin' && user.role !== 'admin') {
      throw new Error('Insufficient permissions');
    }

    const body = await request.json().catch(() => ({}));
    const data = UpdateFeatureToggleSchema.parse(body);

    const toggleIndex = mockFeatureToggles.findIndex(f => f.key === key);
    if (toggleIndex === -1) {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: `Feature toggle ${key} not found` } },
          { status: 404 }
        ),
        requestId
      );
    }

    mockFeatureToggles[toggleIndex] = { 
      ...mockFeatureToggles[toggleIndex], 
      ...data,
      lastModifiedBy: user.id,
      lastModifiedAt: new Date().toISOString(),
    };

    return addRequestIdHeaders(successResponse(mockFeatureToggles[toggleIndex], { requestId }), requestId);
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}

// POST /api/admin/features/[key]/toggle - Toggle feature
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const user = await getAuthUser();
    requireAdmin(user);
    const key = request.nextUrl.pathname.split('/').slice(-2)[0];
    
    const rateLimitResponse = await applyRateLimit(request, { limit: 50, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    if (user.role !== 'super_admin' && user.role !== 'admin') {
      throw new Error('Insufficient permissions');
    }

    const toggleIndex = mockFeatureToggles.findIndex(f => f.key === key);
    if (toggleIndex === -1) {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: `Feature toggle ${key} not found` } },
          { status: 404 }
        ),
        requestId
      );
    }

    mockFeatureToggles[toggleIndex] = { 
      ...mockFeatureToggles[toggleIndex], 
      enabled: !mockFeatureToggles[toggleIndex].enabled,
      lastModifiedBy: user.id,
      lastModifiedAt: new Date().toISOString(),
    };

    return addRequestIdHeaders(successResponse(mockFeatureToggles[toggleIndex], { requestId }), requestId);
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}

// DELETE /api/admin/features/[key] - Delete feature toggle (super_admin only)
export async function DELETE(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const user = await getAuthUser();
    requireAdmin(user);
    const key = request.nextUrl.pathname.split('/').pop() || '';
    
    const rateLimitResponse = await applyRateLimit(request, { limit: 10, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    if (user.role !== 'super_admin') {
      throw new Error('Only super_admin can delete feature toggles');
    }

    const toggleIndex = mockFeatureToggles.findIndex(f => f.key === key);
    if (toggleIndex === -1) {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: `Feature toggle ${key} not found` } },
          { status: 404 }
        ),
        requestId
      );
    }

    mockFeatureToggles.splice(toggleIndex, 1);

    return addRequestIdHeaders(
      new NextResponse(null, { status: 204 }),
      requestId
    );
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}