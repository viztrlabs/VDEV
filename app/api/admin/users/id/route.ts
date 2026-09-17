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
  AdminUserSchema,
  UpdateAdminUserSchema,
  type AdminUser,
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

// GET /api/admin/users/[id] - Get single user
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const id = request.nextUrl.pathname.split('/').pop() || '';
  
  const rateLimitResponse = await applyRateLimit(request, RATE_LIMIT_CONFIG);
  if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

  try {
    await getAuthUser(); // Verify auth
    
    const targetUser = mockUsers.find(u => u.id === id);
    if (!targetUser) {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: `User ${id} not found` } },
          { status: 404 }
        ),
        requestId
      );
    }

    return addRequestIdHeaders(successResponse(targetUser, { requestId }), requestId);
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}

// PATCH /api/admin/users/[id] - Update user
export async function PATCH(request: NextRequest) {
  const requestId = generateRequestId();
  const id = request.nextUrl.pathname.split('/').pop() || '';
  
  const rateLimitResponse = await applyRateLimit(request, { limit: 50, window: '60 s' });
  if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

  try {
    const user = await getAuthUser();
    const body = await request.json().catch(() => ({}));

    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: `User ${id} not found` } },
          { status: 404 }
        ),
        requestId
      );
    }

    // Authorization checks
    if (body.role && user.role !== 'super_admin') {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'FORBIDDEN', message: 'Only super_admin can change roles' } },
          { status: 403 }
        ),
        requestId
      );
    }

    // Apply updates
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...body };

    return addRequestIdHeaders(successResponse(mockUsers[userIndex], { requestId }), requestId);
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(request: NextRequest) {
  const requestId = generateRequestId();
  const id = request.nextUrl.pathname.split('/').pop() || '';
  
  const rateLimitResponse = await applyRateLimit(request, { limit: 20, window: '60 s' });
  if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

  try {
    const user = await getAuthUser();

    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: `User ${id} not found` } },
          { status: 404 }
        ),
        requestId
      );
    }

    // Prevent self-deletion
    if (mockUsers[userIndex].email === user.email) {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'FORBIDDEN', message: 'Cannot delete your own account' } },
          { status: 403 }
        ),
        requestId
      );
    }

    mockUsers.splice(userIndex, 1);

    return addRequestIdHeaders(noContentResponse(), requestId);
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}