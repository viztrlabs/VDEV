export const dynamic = 'force-dynamic'
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
  type RateLimitConfig,
} from '@/lib/api/validation';
import {
  BookingSchema,
  CreateBookingSchema,
  UpdateBookingSchema,
  BookingFiltersSchema,
  PaginationParamsSchema,
  type Booking,
  type CreateBooking,
  type UpdateBooking,
  type BookingFilters,
  type PaginationParams,
} from '@/lib/api/contracts/schemas';

const RATE_LIMIT_CONFIG: RateLimitConfig = { limit: 100, window: '60 s' };

// GET /api/admin/bookings - List bookings with filtering and pagination
export const GET = withAuth(
  BookingFiltersSchema.merge(PaginationParamsSchema).optional(),
  async (query, request, user) => {
    const requestId = generateRequestId();
    
    const rateLimitResponse = await applyRateLimit(request, RATE_LIMIT_CONFIG);
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    try {
      const repo = getRepository();
      const result = await repo.bookings.findAll(query, { page: query?.page, pageSize: query?.pageSize });
      
      return addRequestIdHeaders(
        successResponse({
          data: result.data,
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: result.totalPages,
        }, { requestId }),
        requestId
      );
    } catch (error) {
      return addRequestIdHeaders(handleApiError(error), requestId);
    }
  }
);

// POST /api/admin/bookings - Create booking (public endpoint, no auth required for creation)
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  
  const rateLimitResponse = await applyRateLimit(request, { limit: 20, window: '60 s' });
  if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

  try {
    const body = await request.json().catch(() => ({}));
    
    // Validate required fields
    const { service_type, client_name, client_email, preferred_date, preferred_time } = body;
    
    if (!service_type || !client_name || !client_email || !preferred_date || !preferred_time) {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } },
          { status: 400 }
        ),
        requestId
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.client_email)) {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid email format' } },
          { status: 400 }
        ),
        requestId
      );
    }

    // Create booking via repository
    const repo = getRepository();
    const newBooking = await repo.bookings.create(body);

    // Send email notifications
    try {
      const { sendBookingCreatedNotification } = await import('@/lib/email-service');
      await sendBookingCreatedNotification({
        id: newBooking.id,
        client_name: newBooking.client_name,
        client_email: newBooking.client_email,
        service_type: newBooking.service_type,
        preferred_date: newBooking.preferred_date,
        preferred_time: newBooking.preferred_time,
        message: newBooking.message,
      });
    } catch (emailError) {
      console.error('[Booking] Failed to send email notification:', emailError);
    }

    return addRequestIdHeaders(
      NextResponse.json(
        { success: true, data: newBooking, meta: { timestamp: new Date().toISOString(), requestId } },
        { status: 201 }
      ),
      requestId
    );
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}

// Helper to get repository (uses mock for now)
function getRepository() {
  const { createMockRepositoryFactorySync } = require('@/lib/repositories/mock-repositories');
  return createMockRepositoryFactorySync();
}