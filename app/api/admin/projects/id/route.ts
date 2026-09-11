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
export const GET = withAuth(
  z.object({ id: z.string() }).optional(),
  async (params, request, user) => {
    const requestId = generateRequestId();
    const id = request.nextUrl.pathname.split('/').pop() || '';
    
    const rateLimitResponse = applyRateLimit(request, { limit: 100, windowMs: 60000 });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    try {
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
);

// PATCH /api/admin/projects/[id] - Update project
export const PATCH = withAuth(
  UpdateProjectSchema,
  async (data, request, user) => {
    const requestId = generateRequestId();
    const id = request.nextUrl.pathname.split('/').pop() || '';
    
    const rateLimitResponse = applyRateLimit(request, { limit: 50, windowMs: 60000 });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    try {
      if (user.role !== 'super_admin' && user.role !== 'admin') {
        throw new Error('Insufficient permissions');
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

      // Apply updates
      mockProjects[projectIndex] = { ...mockProjects[projectIndex], ...data };

      return addRequestIdHeaders(successResponse(mockProjects[projectIndex], { requestId }), requestId);
    } catch (error) {
      return addRequestIdHeaders(handleApiError(error), requestId);
    }
  }
);

// DELETE /api/admin/projects/[id] - Delete project
export const DELETE = withAuth(
  z.object({ id: z.string() }).optional(),
  async (params, request, user) => {
    const requestId = generateRequestId();
    const id = request.nextUrl.pathname.split('/').pop() || '';
    
    const rateLimitResponse = applyRateLimit(request, { limit: 10, windowMs: 60000 });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    try {
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
);

// POST /api/admin/projects/[id]/hours - Log hours
export const POST = withAuth(
  z.object({
    date: z.string().datetime(),
    hours: z.number().positive(),
    description: z.string().min(1),
    billable: z.boolean(),
  }),
  async (data, request, user) => {
    const requestId = generateRequestId();
    const id = request.nextUrl.pathname.split('/').slice(-2)[0];
    
    const rateLimitResponse = applyRateLimit(request, { limit: 50, windowMs: 60000 });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    try {
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
);