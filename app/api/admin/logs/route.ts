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
  SystemHealthLogSchema,
  CreateSystemLogSchema,
  LogFiltersSchema,
  PaginationParamsSchema,
  LogLevelSchema,
  type SystemHealthLog,
  type CreateSystemLog,
} from '@/lib/api/contracts/schemas';

const mockSystemLogs: SystemHealthLog[] = [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    level: 'info',
    service: 'super-admin-store',
    message: 'User session initialized',
    details: 'User alex.sterling@viztr.studio logged in from 192.168.1.1',
    region: 'us-east-1',
    ip: '192.168.1.1',
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    level: 'warn',
    service: 'gpu-cluster',
    message: 'High GPU temperature detected',
    details: 'Node gpu-eu-west reporting 68°C, approaching thermal throttle threshold',
    region: 'eu-central-1',
    ip: '10.0.1.5',
  },
  {
    id: 'log-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    level: 'error',
    service: 'pixel-streaming',
    message: 'WebRTC connection failed',
    details: 'ICE candidate gathering timeout for session ps-8472',
    region: 'us-east-1',
    ip: '203.0.113.42',
  },
];

// GET /api/admin/logs - List system logs with filtering and pagination
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const user = await getAuthUser();
    requireAdmin(user);

    const rateLimitResponse = await applyRateLimit(request, { limit: 100, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    const { searchParams } = request.nextUrl;
    const query: any = {};
    for (const [key, value] of searchParams.entries()) {
      if (key === 'page' || key === 'pageSize') query[key] = parseInt(value, 10);
      else query[key] = value;
    }

    let filtered = [...mockSystemLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (query.level) filtered = filtered.filter(l => l.level === query.level);
    if (query.service) filtered = filtered.filter(l => l.service === query.service);
    if (query.search) {
      const s = query.search.toLowerCase();
      filtered = filtered.filter(l => 
        l.message.toLowerCase().includes(s) ||
        l.service.toLowerCase().includes(s) ||
        l.details?.toLowerCase().includes(s)
      );
    }
    if (query.dateFrom) filtered = filtered.filter(l => l.timestamp >= query.dateFrom);
    if (query.dateTo) filtered = filtered.filter(l => l.timestamp <= query.dateTo);

    const page = query.page || 1;
    const pageSize = query.pageSize || 50;
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

// POST /api/admin/logs - Add system log
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const user = await getAuthUser();
    requireAdmin(user);

    const rateLimitResponse = await applyRateLimit(request, { limit: 200, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    const body = await request.json().catch(() => ({}));
    const data = CreateSystemLogSchema.parse(body);

    const newLog: SystemHealthLog = {
      ...data,
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    mockSystemLogs.unshift(newLog);
    
    if (mockSystemLogs.length > 10000) {
      mockSystemLogs.length = 10000;
    }

    return addRequestIdHeaders(
      NextResponse.json(
        { success: true, data: newLog, meta: { timestamp: new Date().toISOString(), requestId } },
        { status: 201 }
      ),
      requestId
    );
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}

// DELETE /api/admin/logs - Clear all logs (super_admin only)
export async function DELETE(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const user = await getAuthUser();
    requireAdmin(user);

    const rateLimitResponse = await applyRateLimit(request, { limit: 5, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    if (user.role !== 'super_admin') {
      throw new Error('Only super_admin can clear system logs');
    }

    mockSystemLogs.length = 0;

    return addRequestIdHeaders(
      new NextResponse(null, { status: 204 }),
      requestId
    );
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}