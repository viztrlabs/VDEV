import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  withAuth,
  handleApiError,
  successResponse,
  createdResponse,
  applyRateLimit,
  generateRequestId,
  addRequestIdHeaders,
} from '@/lib/api/validation';
import {
  FeatureToggleSchema,
  UpdateFeatureToggleSchema,
  FeatureToggleCategorySchema,
  FeatureToggleEnvironmentSchema,
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
  {
    id: 'ft-gaussian-splat',
    key: 'ENABLE_GAUSSIAN_SPLAT',
    name: 'Gaussian Splatting Engine',
    description: 'Real-time 3D Gaussian splat rendering with progressive loading.',
    category: 'rendering',
    enabled: true,
    requiresRestart: false,
    environment: 'all',
    lastModifiedBy: null,
    lastModifiedAt: new Date().toISOString(),
    createdAt: '2025-01-10T08:00:00Z',
  },
];

// GET /api/admin/features - List feature toggles
export const GET = withAuth(
  z.object({ 
    category: FeatureToggleCategorySchema.optional() 
  }).optional(),
  async (query, request, user) => {
    const requestId = generateRequestId();
    
    const rateLimitResponse = applyRateLimit(request, { limit: 100, windowMs: 60000 });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    try {
      let filtered = [...mockFeatureToggles].sort((a, b) => a.key.localeCompare(b.key));
      
      if (query?.category) filtered = filtered.filter(f => f.category === query.category);

      return addRequestIdHeaders(successResponse(filtered, { requestId }), requestId);
    } catch (error) {
      return addRequestIdHeaders(handleApiError(error), requestId);
    }
  }
);

// POST /api/admin/features - Create feature toggle (super_admin only)
export const POST = withAuth(
  FeatureToggleSchema.omit({ id: true, lastModifiedBy: true, lastModifiedAt: true, createdAt: true }),
  async (data, request, user) => {
    const requestId = generateRequestId();
    
    const rateLimitResponse = applyRateLimit(request, { limit: 10, windowMs: 60000 });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    try {
      if (user.role !== 'super_admin') {
        throw new Error('Only super_admin can create feature toggles');
      }

      const newToggle: FeatureToggle = {
        ...data,
        id: `ft-${data.key.toLowerCase().replace(/_/g, '-')}`,
        lastModifiedBy: user.id,
        lastModifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      mockFeatureToggles.push(newToggle);

      return addRequestIdHeaders(
        NextResponse.json(
          { success: true, data: newToggle, meta: { timestamp: new Date().toISOString(), requestId } },
          { status: 201 }
        ),
        requestId
      );
    } catch (error) {
      return addRequestIdHeaders(handleApiError(error), requestId);
    }
  }
);