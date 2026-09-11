import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  withAuth,
  handleApiError,
  successResponse,
  noContentResponse,
  applyRateLimit,
  generateRequestId,
  addRequestIdHeaders,
} from '@/lib/api/validation';
import {
  TourSchema,
  UpdateTourSchema,
  type Tour,
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

// GET /api/admin/tours/[id] - Get single tour
export const GET = withAuth(
  z.object({ id: z.string() }).optional(),
  async (params, request, user) => {
    const requestId = generateRequestId();
    const id = request.nextUrl.pathname.split('/').pop() || '';
    
    const rateLimitResponse = applyRateLimit(request, { limit: 100, windowMs: 60000 });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    try {
      const tour = mockTours.find(t => t.id === id);
      if (!tour) {
        return addRequestIdHeaders(
          NextResponse.json(
            { success: false, error: { code: 'NOT_FOUND', message: `Tour ${id} not found` } },
            { status: 404 }
          ),
          requestId
        );
      }

      return addRequestIdHeaders(successResponse(tour, { requestId }), requestId);
    } catch (error) {
      return addRequestIdHeaders(handleApiError(error), requestId);
    }
  }
);

// PATCH /api/admin/tours/[id] - Update tour
export const PATCH = withAuth(
  UpdateTourSchema,
  async (data, request, user) => {
    const requestId = generateRequestId();
    const id = request.nextUrl.pathname.split('/').pop() || '';
    
    const rateLimitResponse = applyRateLimit(request, { limit: 50, windowMs: 60000 });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    try {
      const tourIndex = mockTours.findIndex(t => t.id === id);
      if (tourIndex === -1) {
        return addRequestIdHeaders(
          NextResponse.json(
            { success: false, error: { code: 'NOT_FOUND', message: `Tour ${id} not found` } },
            { status: 404 }
          ),
          requestId
        );
      }

      mockTours[tourIndex] = { 
        ...mockTours[tourIndex], 
        ...data,
        updatedAt: new Date().toISOString() 
      };

      return addRequestIdHeaders(successResponse(mockTours[tourIndex], { requestId }), requestId);
    } catch (error) {
      return addRequestIdHeaders(handleApiError(error), requestId);
    }
  }
);

// DELETE /api/admin/tours/[id] - Delete tour
export const DELETE = withAuth(
  z.object({ id: z.string() }).optional(),
  async (params, request, user) => {
    const requestId = generateRequestId();
    const id = request.nextUrl.pathname.split('/').pop() || '';
    
    const rateLimitResponse = applyRateLimit(request, { limit: 10, windowMs: 60000 });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    try {
      if (user.role !== 'super_admin') {
        throw new Error('Only super_admin can delete tours');
      }

      const tourIndex = mockTours.findIndex(t => t.id === id);
      if (tourIndex === -1) {
        return addRequestIdHeaders(
          NextResponse.json(
            { success: false, error: { code: 'NOT_FOUND', message: `Tour ${id} not found` } },
            { status: 404 }
          ),
          requestId
        );
      }

      mockTours.splice(tourIndex, 1);

      return addRequestIdHeaders(noContentResponse(), requestId);
    } catch (error) {
      return addRequestIdHeaders(handleApiError(error), requestId);
    }
  }
);