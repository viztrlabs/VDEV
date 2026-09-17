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
import { getSupabaseAdmin } from '@/lib/supabase-admin';
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

function mapSupabaseProject(row: any): ManagedProject {
  return {
    id: row.id,
    name: row.name,
    clientName: row.client_name || '',
    projectType: row.project_type || 'Architectural',
    status: row.status || 'Work in Progress',
    startDate: row.start_date || '',
    endDate: row.end_date || '',
    estimatedHours: row.estimated_hours || 0,
    assignedTeam: row.assigned_team || [],
    hoursMonitoring: {
      estimatedHours: row.estimated_hours || 0,
      hoursSpent: row.hours_spent || 0,
      hoursRemaining: (row.estimated_hours || 0) - (row.hours_spent || 0),
      timesheetEntries: [],
    },
    bookingAmount: row.booking_amount || 0,
    paymentStatus: row.payment_status || 'Pending',
    notes: row.notes || '',
  };
}

// GET /api/admin/projects - List projects with filtering and pagination
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const user = await getAuthUser();
    requireAdmin(user);

    const rateLimitResponse = await applyRateLimit(request, { limit: 100, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    const { searchParams } = request.nextUrl;
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const projectType = searchParams.get('projectType') || undefined;
    const paymentStatus = searchParams.get('paymentStatus') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20', 10), 100);

    // Try Supabase first
    if (getSupabaseAdmin()) {
      try {
        let qb = getSupabaseAdmin()!
          .from('projects')
          .select('*', { count: 'exact' });

        if (search) {
          const s = search.toLowerCase();
          qb = qb.or(`name.ilike.%${s}%,client_name.ilike.%${s}%,id.ilike.%${s}%`);
        }
        if (status) qb = qb.eq('status', status);
        if (projectType) qb = qb.eq('project_type', projectType);
        if (paymentStatus) qb = qb.eq('payment_status', paymentStatus);

        const start = (page - 1) * pageSize;
        qb = qb.range(start, start + pageSize - 1);
        qb = qb.order('created_at', { ascending: false });

        const { data, error, count } = await qb;

        if (!error && data) {
          const projects = data.map(mapSupabaseProject);
          return addRequestIdHeaders(
            successResponse({
              data: projects,
              total: count ?? projects.length,
              page,
              pageSize,
              totalPages: Math.ceil((count ?? projects.length) / pageSize),
            }, { requestId }) as NextResponse,
            requestId
          );
        }
      } catch {
        // Fall through to mock
      }
    }

    // Fallback to in-memory
    let filtered = [...mockProjects];
    
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(s) ||
        p.clientName.toLowerCase().includes(s) ||
        p.id.toLowerCase().includes(s)
      );
    }
    if (status) filtered = filtered.filter(p => p.status === status);
    if (projectType) filtered = filtered.filter(p => p.projectType === projectType);
    if (paymentStatus) filtered = filtered.filter(p => p.paymentStatus === paymentStatus);

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

// POST /api/admin/projects - Create project
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const user = await getAuthUser();
    requireAdmin(user);

    const rateLimitResponse = await applyRateLimit(request, { limit: 20, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    const body = await request.json().catch(() => ({}));
    const data = CreateProjectSchema.parse(body);

    const projectId = `VIZTR-${Date.now().toString().slice(-3)}`;

    // Try Supabase first
    if (getSupabaseAdmin()) {
      try {
        const newProject = {
          id: projectId,
          name: data.name,
          client_name: data.clientName || '',
          project_type: data.projectType || 'Architectural',
          status: data.status || 'Work in Progress',
          start_date: data.startDate || new Date().toISOString(),
          end_date: data.endDate || '',
          estimated_hours: data.estimatedHours || 0,
          assigned_team: data.assignedTeam || [],
          hours_spent: 0,
          booking_amount: data.bookingAmount || 0,
          payment_status: data.paymentStatus || 'Pending',
          notes: data.notes || '',
          created_at: new Date().toISOString(),
        };

        const { data: created, error } = await getSupabaseAdmin()!
          .from('projects')
          .insert(newProject)
          .select()
          .single();

        if (!error && created) {
          return addRequestIdHeaders(
            NextResponse.json(
              { success: true, data: mapSupabaseProject(created), meta: { timestamp: new Date().toISOString(), requestId } },
              { status: 201 }
            ),
            requestId
          );
        }
      } catch {
        // Fall through to mock
      }
    }

    // Fallback to in-memory
    const newProject: ManagedProject = {
      ...data,
      id: projectId,
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