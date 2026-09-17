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
  ManagedProjectSchema,
  UpdateProjectSchema,
  type ManagedProject,
  type UpdateProject,
} from '@/lib/api/contracts/schemas';

const mockProjects: ManagedProject[] = [
  {
    id: 'VIZTR-882',
    name: 'Nordic Monolith - Phase 1',
    clientName: 'Nordic Monolith Architects',
    projectType: 'Architectural',
    status: 'Work in Progress',
    startDate: '2025-08-15T00:00:00Z',
    endDate: '2025-10-30T00:00:00Z',
    estimatedHours: 320,
    assignedTeam: ['Kenji Takahashi', 'Chloe Zhang'],
    hoursMonitoring: {
      estimatedHours: 320,
      hoursSpent: 145,
      hoursRemaining: 175,
      timesheetEntries: [],
    },
    bookingAmount: 48500,
    paymentStatus: 'Partial 50%',
    notes: 'Initial concept design phase',
  },
  {
    id: 'VIZTR-883',
    name: 'Vance Luxury Towers - VR Tour',
    clientName: 'Vance Luxury Towers Dubai',
    projectType: 'Virtual Reality',
    status: 'Client Review',
    startDate: '2025-07-01T00:00:00Z',
    endDate: '2025-09-15T00:00:00Z',
    estimatedHours: 200,
    assignedTeam: ['Damon Morales'],
    hoursMonitoring: {
      estimatedHours: 200,
      hoursSpent: 180,
      hoursRemaining: 20,
      timesheetEntries: [],
    },
    bookingAmount: 89000,
    paymentStatus: 'Paid',
    notes: 'Final VR tour review pending client approval',
  },
];

// GET /api/admin/projects/[id] - Get single project
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const user = await getAuthUser();
    requireAdmin(user);
    const id = request.nextUrl.pathname.split('/').pop() || '';
    
    const rateLimitResponse = await applyRateLimit(request, { limit: 100, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    const project = mockProjects.find(p => p.id === id);
    if (!project) {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: `Project ${id} not found` } },
          { status: 404 }
        ),
        requestId
      );
    }

    return addRequestIdHeaders(successResponse(project, { requestId }), requestId);
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}

// PATCH /api/admin/projects/[id] - Update project
export async function PATCH(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const user = await getAuthUser();
    requireAdmin(user);
    const id = request.nextUrl.pathname.split('/').pop() || '';
    
    const rateLimitResponse = await applyRateLimit(request, { limit: 50, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    if (user.role !== 'super_admin' && user.role !== 'admin') {
      throw new Error('Insufficient permissions');
    }

    const body = await request.json().catch(() => ({}));
    const data = UpdateProjectSchema.parse(body);

    const projectIndex = mockProjects.findIndex(p => p.id === id);
    if (projectIndex === -1) {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: `Project ${id} not found` } },
          { status: 404 }
        ),
        requestId
      );
    }

    mockProjects[projectIndex] = { ...mockProjects[projectIndex], ...data };

    return addRequestIdHeaders(successResponse(mockProjects[projectIndex], { requestId }), requestId);
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}

// DELETE /api/admin/projects/[id] - Delete project
export async function DELETE(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const user = await getAuthUser();
    requireAdmin(user);
    const id = request.nextUrl.pathname.split('/').pop() || '';
    
    const rateLimitResponse = await applyRateLimit(request, { limit: 10, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    if (user.role !== 'super_admin') {
      throw new Error('Only super_admin can delete projects');
    }

    const projectIndex = mockProjects.findIndex(p => p.id === id);
    if (projectIndex === -1) {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: `Project ${id} not found` } },
          { status: 404 }
        ),
        requestId
      );
    }

    mockProjects.splice(projectIndex, 1);

    return addRequestIdHeaders(noContentResponse(), requestId);
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}

// POST /api/admin/projects/[id]/hours - Log hours
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const user = await getAuthUser();
    requireAdmin(user);
    const id = request.nextUrl.pathname.split('/').slice(-2)[0];
    
    const rateLimitResponse = await applyRateLimit(request, { limit: 50, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    const body = await request.json().catch(() => ({}));
    const data = z.object({
      date: z.string().datetime(),
      hours: z.number().positive(),
      description: z.string().min(1),
      billable: z.boolean(),
    }).parse(body);

    const projectIndex = mockProjects.findIndex(p => p.id === id);
    if (projectIndex === -1) {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: `Project ${id} not found` } },
          { status: 404 }
        ),
        requestId
      );
    }

    const newEntry = {
      id: `ts-${Date.now()}`,
      ...data,
    };

    mockProjects[projectIndex] = {
      ...mockProjects[projectIndex],
      hoursMonitoring: {
        ...mockProjects[projectIndex].hoursMonitoring,
        hoursSpent: mockProjects[projectIndex].hoursMonitoring.hoursSpent + data.hours,
        hoursRemaining: Math.max(0, mockProjects[projectIndex].hoursMonitoring.hoursRemaining - data.hours),
        timesheetEntries: [newEntry, ...mockProjects[projectIndex].hoursMonitoring.timesheetEntries],
      },
    };

    return addRequestIdHeaders(successResponse(mockProjects[projectIndex], { requestId }), requestId);
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}