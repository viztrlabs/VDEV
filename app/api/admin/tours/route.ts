import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  withAuth,
  handleApiError,
  successResponse,
  createdResponse,
  noContentResponse,
  applyRateLimit,
  generateRequestId,
  addRequestIdHeaders,
} from '@/lib/api/validation';
import {
  TourSchema,
  CreateTourSchema,
  UpdateTourSchema,
  type Tour,
  type CreateTour,
  type UpdateTour,
} from '@/lib/api/contracts/schemas';

const mockTours: Tour[] = [
  {
    id: 'tour-001',
    name: 'Nordic Monolith VR Experience',
    projectId: 'VIZTR-882',
    rooms: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
  },
];

// GET /api/admin/tours - List tours
export const GET = withAuth(
  z.object({ 
    projectId: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
  }).optional(),
  async (query, request, user) => {
    const requestId = generateRequestId();
    
    const rateLimitResponse = applyRateLimit(request, { limit: 100, windowMs: 60000 });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    try {
      let filtered = [...mockTours];
      
      if (query?.projectId) filtered = filtered.filter(t => t.projectId === query.projectId);
      if (query?.status) filtered = filtered.filter(t => t.status === query.status);

      return addRequestIdHeaders(successResponse(filtered, { requestId }), requestId);
    } catch (error) {
      return addRequestIdHeaders(handleApiError(error), requestId);
    }
  }
);

// POST /api/admin/tours - Create tour
export const POST = withAuth(
  CreateTourSchema,
  async (data, request, user) => {
    const requestId = generateRequestId();
    
    const rateLimitResponse = applyRateLimit(request, { limit: 20, windowMs: 60000 });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    try {
      const newTour: Tour = {
        ...data,
        id: `tour-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockTours.unshift(newTour);

      return addRequestIdHeaders(
        NextResponse.json(
          { success: true, data: newTour, meta: { timestamp: new Date().toISOString(), requestId } },
          { status: 201 }
        ),
        requestId
      );
    } catch (error) {
      return addRequestIdHeaders(handleApiError(error), requestId);
    }
  }
);