export const dynamic = 'force-dynamic'
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
  type RateLimitConfig,
} from '@/lib/api/validation';
import {
  BookingSchema,
  UpdateBookingSchema,
  type Booking,
  type UpdateBooking,
} from '@/lib/api/contracts/schemas';

const RATE_LIMIT_CONFIG: RateLimitConfig = { limit: 100, window: '60 s' };

// GET /api/admin/bookings/[id] - Get single booking
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const id = request.nextUrl.pathname.split('/').pop() || '';
  
  const rateLimitResponse = await applyRateLimit(request, RATE_LIMIT_CONFIG);
  if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

  try {
    const repo = getRepository();
    const booking = await repo.bookings.findById(id);
    
    if (!booking) {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: `Booking ${id} not found` } },
          { status: 404 }
        ),
        requestId
      );
    }

    return addRequestIdHeaders(successResponse(booking, { requestId }), requestId);
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}

// PATCH /api/admin/bookings/[id] - Update booking
export const PATCH = withAuth(
  z.object({}).optional(),
  async (_, request, user) => {
    const requestId = generateRequestId();
    const id = request.nextUrl.pathname.split('/').pop() || '';
    
    const rateLimitResponse = await applyRateLimit(request, { limit: 50, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    try {
      const body = await request.json().catch(() => ({}));

      const repo = getRepository();
      const bookings = await repo.bookings.findAll();
      const bookingIndex = bookings.data.findIndex((b: { id: string }) => b.id === id);
      if (bookingIndex === -1) {
        return addRequestIdHeaders(
          NextResponse.json(
            { success: false, error: { code: 'NOT_FOUND', message: `Booking ${id} not found` } },
            { status: 404 }
          ),
          requestId
        );
      }

      // Apply updates
      const updated = await repo.bookings.update(id, body);

      return addRequestIdHeaders(successResponse(updated, { requestId }), requestId);
    } catch (error) {
      return addRequestIdHeaders(handleApiError(error), requestId);
    }
  }
);

// DELETE /api/admin/bookings/[id] - Delete booking
export const DELETE = withAuth(
  z.object({}).optional(),
  async (_, request, user) => {
    const requestId = generateRequestId();
    const id = request.nextUrl.pathname.split('/').pop() || '';
    
    const rateLimitResponse = await applyRateLimit(request, { limit: 10, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    try {
      const repo = getRepository();
      await repo.bookings.delete(id);

      return addRequestIdHeaders(noContentResponse(), requestId);
    } catch (error) {
      return addRequestIdHeaders(handleApiError(error), requestId);
    }
  }
);

// Helper to get repository
function getRepository() {
  const { createMockRepositoryFactorySync } = require('@/lib/repositories/mock-repositories');
  return createMockRepositoryFactorySync();
}