export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  handleApiError,
  successResponse,
  createdResponse,
  applyRateLimit,
  generateRequestId,
  addRequestIdHeaders,
  type RateLimitConfig,
} from '@/lib/api/validation';
import { getAuthUser, requireAdmin } from '@/lib/api/auth';
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
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const user = await getAuthUser();
    requireAdmin(user);

    const rateLimitResponse = await applyRateLimit(request, { limit: 100, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    const { searchParams } = request.nextUrl;
    const projectId = searchParams.get('projectId') || undefined;
    const status = searchParams.get('status') || undefined;

    let filtered = [...mockTours];
    if (projectId) filtered = filtered.filter(t => t.projectId === projectId);
    if (status) filtered = filtered.filter(t => t.status === status);

    return addRequestIdHeaders(successResponse(filtered, { requestId }), requestId);
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}

// POST /api/admin/tours - Create tour
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const user = await getAuthUser();
    requireAdmin(user);

    const rateLimitResponse = await applyRateLimit(request, { limit: 20, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    const body = await request.json().catch(() => ({}));
    const data = CreateTourSchema.parse(body);

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