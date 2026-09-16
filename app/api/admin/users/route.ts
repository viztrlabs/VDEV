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
  type RateLimitConfig,
} from '@/lib/api/validation';
import { getAuthUser, requireAdmin } from '@/lib/api/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
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

const RATE_LIMIT_CONFIG: RateLimitConfig = { limit: 100, window: '60 s' };

function mapSupabaseUser(row: any): AdminUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role || 'user',
    status: row.status || 'active',
    avatar: row.avatar || '',
    department: row.department || '',
    assignedProjectsCount: row.assigned_projects_count || 0,
    lastLogin: row.last_login || 'Never',
    twoFactorEnabled: row.two_factor_enabled || false,
    createdAt: row.created_at || new Date().toISOString(),
    phone: row.phone || '',
    company: row.company || '',
  };
}

// GET /api/admin/users - List users with filtering and pagination
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  
  const rateLimitResponse = await applyRateLimit(request, RATE_LIMIT_CONFIG);
  if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

  try {
    const user = await getAuthUser();
    const query = Object.fromEntries(request.nextUrl.searchParams.entries());
    
    const page = parseInt(query.page as string) || 1;
    const pageSize = parseInt(query.pageSize as string) || 20;

    // Try Supabase first
    if (supabaseAdmin) {
      try {
        let qb = supabaseAdmin
          .from('User')
          .select('*', { count: 'exact' });

        if (query.search) {
          const s = query.search.toLowerCase();
          qb = qb.or(`name.ilike.%${s}%,email.ilike.%${s}%,department.ilike.%${s}%`);
        }
        if (query.role) qb = qb.eq('role', query.role);
        if (query.status) qb = qb.eq('status', query.status);
        if (query.department) qb = qb.eq('department', query.department);

        const start = (page - 1) * pageSize;
        qb = qb.range(start, start + pageSize - 1);
        qb = qb.order('created_at', { ascending: false });

        const { data, error, count } = await qb;

        if (!error && data) {
          const users = data.map(mapSupabaseUser);
          return addRequestIdHeaders(
            successResponse({
              data: users,
              total: count ?? users.length,
              page,
              pageSize,
              totalPages: Math.ceil((count ?? users.length) / pageSize),
            }, { requestId }),
            requestId
          );
        }
      } catch {
        // Fall through to mock
      }
    }

    // Fallback to in-memory
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
      }, { requestId }),
      requestId
    );
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  
  const rateLimitResponse = await applyRateLimit(request, { limit: 20, window: '60 s' });
  if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

  try {
    const user = await getAuthUser();
    requireAdmin(user); // Only admin/super_admin can create users
    
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

    // Try Supabase first
    if (supabaseAdmin) {
      try {
        // Check if email already exists
        const { data: existing } = await supabaseAdmin
          .from('User')
          .select('id')
          .eq('email', email.toLowerCase())
          .single();

        if (existing) {
          return addRequestIdHeaders(
            NextResponse.json(
              { success: false, error: { code: 'CONFLICT', message: 'Email already exists' } },
              { status: 409 }
            ),
            requestId
          );
        }

        const newUser = {
          id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name,
          email: email.toLowerCase(),
          role,
          status,
          department: department || '',
          assigned_projects_count: assignedProjectsCount || 0,
          avatar: avatar || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=150`,
          last_login: 'Never',
          two_factor_enabled: twoFactorEnabled || false,
          created_at: new Date().toISOString(),
          phone: phone || '',
          company: company || '',
        };

        const { data, error } = await supabaseAdmin
          .from('User')
          .insert(newUser)
          .select()
          .single();

        if (!error && data) {
          return addRequestIdHeaders(
            NextResponse.json(
              { success: true, data: mapSupabaseUser(data), meta: { timestamp: new Date().toISOString(), requestId } },
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
