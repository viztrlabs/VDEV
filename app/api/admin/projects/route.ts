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
  ManagedProjectSchema,
  CreateProjectSchema,
  UpdateProjectSchema,
  ProjectTypeSchema,
  ProjectStatusSchema,
  PaymentStatusSchema,
  PaginationParamsSchema,
  type ManagedProject,
  type CreateProject,
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

// GET /api/admin/projects - List projects with filtering and pagination
export const GET = withAuth(
  z.object({
    search: z.string().optional(),
    status: ProjectStatusSchema.optional(),
    projectType: ProjectTypeSchema.optional(),
    paymentStatus: PaymentStatusSchema.optional(),
  }).merge(PaginationParamsSchema).optional(),
  async (query, request, user) => {
    const requestId = generateRequestId();
    
    const rateLimitResponse = applyRateLimit(request, { limit: 100, windowMs: 60000 });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    try {
      let filtered = [...mockProjects];
      
      if (query?.search) {
        const s = query.search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(s) ||
          p.clientName.toLowerCase().includes(s) ||
          p.id.toLowerCase().includes(s)
        );
      }
      if (query?.status) filtered = filtered.filter(p => p.status === query.status);
      if (query?.projectType) filtered = filtered.filter(p => p.projectType === query.projectType);
      if (query?.paymentStatus) filtered = filtered.filter(p => p.paymentStatus === query.paymentStatus);

      const page = query?.page || 1;
      const pageSize = query?.pageSize || 20;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginated = filtered.slice(start, end);

      return addRequestIdHeaders(
        successResponse({
          data: paginated,
          total: filtered.length,
          page,
          pageSize,
          totalPages: Math.ceil(filtered.length / pageSize),
        }, { requestId }) as NextResponse,
        requestId
      );
    } catch (error) {
      return addRequestIdHeaders(handleApiError(error), requestId);
    }
  }
);

// POST /api/admin/projects - Create project
export const POST = withAuth(
  CreateProjectSchema,
  async (data, request, user) => {
    const requestId = generateRequestId();
    
    const rateLimitResponse = applyRateLimit(request, { limit: 20, windowMs: 60000 });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    try {
      if (user.role !== 'super_admin' && user.role !== 'admin') {
        throw new Error('Insufficient permissions');
      }

      const newProject: ManagedProject = {
        ...data,
        id: `VIZTR-${Date.now().toString().slice(-3)}`,
        hoursMonitoring: {
          estimatedHours: data.estimatedHours,
          hoursSpent: 0,
          hoursRemaining: data.estimatedHours,
          timesheetEntries: [],
        },
      };
      mockProjects.unshift(newProject);

      return addRequestIdHeaders(
        NextResponse.json(
          { success: true, data: newProject, meta: { timestamp: new Date().toISOString(), requestId } },
          { status: 201 }
        ),
        requestId
      );
    } catch (error) {
      return addRequestIdHeaders(handleApiError(error), requestId);
    }
  }
);