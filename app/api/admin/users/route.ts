import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  handleApiError,
  successResponse,
  createdResponse,
  noContentResponse,
  applyRateLimit,
  generateRequestId,
  addRequestIdHeaders,
} from '@/lib/api/validation';
import {
  AdminUserSchema,
  CreateAdminUserSchema,
  UpdateAdminUserSchema,
  UserFiltersSchema,
  PaginationParamsSchema,
  type AdminUser,
  type CreateAdminUser,
  type UpdateAdminUser,
} from '@/lib/api/contracts/schemas';

const mockUsers: AdminUser[] = [
  {
    id: 'usr-001',
    name: 'Alexander Sterling',
    email: 'alex.sterling@viztr.studio',
    role: 'super_admin',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    department: 'Executive / Spatial Tech Lead',
    assignedProjectsCount: 14,
    lastLogin: '2 minutes ago',
    twoFactorEnabled: true,
    createdAt: '2025-01-10T08:00:00Z',
    phone: '+1 (555) 234-8901',
    company: 'VizTR Studio HQ',
  },
  {
    id: 'usr-002',
    name: 'Elena Rostova',
    email: 'elena.rostova@viztr.studio',
    role: 'admin',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    department: 'Principal ArchViz Director',
    assignedProjectsCount: 8,
    lastLogin: '1 hour ago',
    twoFactorEnabled: true,
    createdAt: '2025-02-14T10:15:00Z',
    phone: '+1 (555) 890-1234',
    company: 'VizTR Studio Europe',
  },
];

function getAuthUser(request: NextRequest): { id: string; email: string; role: string } {
  const authHeader = request.headers.get('x-user-role');
  if (!authHeader) {
    throw new Error('UNAUTHORIZED');
  }
  return {
    id: request.headers.get('x-user-id') || 'unknown',
    email: request.headers.get('x-user-email') || 'unknown',
    role: authHeader,
  };
}

// GET /api/admin/users - List users with filtering and pagination
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  
  const rateLimitResponse = applyRateLimit(request, { limit: 100, windowMs: 60000 });
  if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

  try {
    const user = getAuthUser(request);
    const query = Object.fromEntries(request.nextUrl.searchParams.entries());
    
    let filtered = [...mockUsers];
    
    if (query.search) {
      const s = query.search.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        u.department.toLowerCase().includes(s)
      );
    }
    if (query.role) filtered = filtered.filter(u => u.role === query.role);
    if (query.status) filtered = filtered.filter(u => u.status === query.status);
    if (query.department) filtered = filtered.filter(u => u.department === query.department);

    const page = parseInt(query.page as string) || 1;
    const pageSize = parseInt(query.pageSize as string) || 20;
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

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  
  const rateLimitResponse = applyRateLimit(request, { limit: 20, windowMs: 60000 });
  if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

  try {
    const user = getAuthUser(request);
    const body = await request.json().catch(() => ({}));
    
    // Validate required fields
    const { name, email, role, status, department, assignedProjectsCount, avatar, twoFactorEnabled, phone, company } = body;
    
    if (!name || !email || !role || !status) {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } },
          { status: 400 }
        ),
        requestId
      );
    }

    // Check authorization - only super_admin can create admins
    if (role === 'admin' && user.role !== 'super_admin') {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'FORBIDDEN', message: 'Only super_admin can create admin users' } },
          { status: 403 }
        ),
        requestId
      );
    }

    // Check if email already exists
    const existing = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'CONFLICT', message: 'Email already exists' } },
          { status: 409 }
        ),
        requestId
      );
    }

    // Create new user
    const newUser: AdminUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      email,
      role,
      status,
      department: department || '',
      assignedProjectsCount: assignedProjectsCount || 0,
      avatar: avatar || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=150`,
      lastLogin: 'Never',
      twoFactorEnabled: twoFactorEnabled || false,
      createdAt: new Date().toISOString(),
      phone,
      company,
    };
    mockUsers.unshift(newUser);

    return addRequestIdHeaders(
      NextResponse.json(
        { success: true, data: newUser, meta: { timestamp: new Date().toISOString(), requestId } },
        { status: 201 }
      ),
      requestId
    );
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}