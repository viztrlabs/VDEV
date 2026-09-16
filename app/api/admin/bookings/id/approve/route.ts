import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  withAuth,
  handleApiError,
  successResponse,
  applyRateLimit,
  generateRequestId,
  addRequestIdHeaders,
  type RateLimitConfig,
} from '@/lib/api/validation';
import {
  ApproveBookingSchema,
  type ApproveBooking,
} from '@/lib/api/contracts/schemas';

const RATE_LIMIT_CONFIG: RateLimitConfig = { limit: 50, window: '60 s' };

// POST /api/admin/bookings/[id]/approve - Approve booking
export const POST = withAuth(
  z.object({}).optional(),
  async (_, request, user) => {
    const requestId = generateRequestId();
    const id = request.nextUrl.pathname.split('/').slice(-2)[0];
    
    const rateLimitResponse = await applyRateLimit(request, { limit: 50, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    try {
      const body = await request.json().catch(() => ({}));
      const { admin_notes } = body;

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

      if (booking.status !== 'pending') {
        return addRequestIdHeaders(
          NextResponse.json(
            { success: false, error: { code: 'BAD_REQUEST', message: 'Only pending bookings can be approved' } },
            { status: 400 }
          ),
          requestId
        );
      }

      const updated = await repo.bookings.approve(id, body.admin_notes);

      // Send email notification
      try {
        const { sendBookingStatusNotification } = await import('@/lib/email-service');
        await sendBookingStatusNotification({
          id: updated.id,
          client_name: updated.client_name,
          client_email: updated.client_email,
          service_type: updated.service_type,
          status: 'approved',
          preferred_date: updated.preferred_date,
          preferred_time: updated.preferred_time,
          adminNotes: body.admin_notes,
        });
      } catch (emailError) {
        console.error('[Booking] Failed to send approval email:', emailError);
      }

      return addRequestIdHeaders(successResponse(updated, { requestId }), requestId);
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