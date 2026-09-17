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
  GpuNodeSchema,
  UpdateGpuNodeSchema,
  GpuFiltersSchema,
  PaginationParamsSchema,
  GpuNodeStatusSchema,
  type GpuNode,
  type UpdateGpuNode,
  type GpuFilters,
} from '@/lib/api/contracts/schemas';

// Mock GPU nodes data
const mockGpuNodes: GpuNode[] = [
  {
    id: 'gpu-us-east',
    regionCode: 'us-east-1',
    regionName: 'US East (N. Virginia)',
    flagEmoji: '🇺🇸',
    gpuModel: 'NVIDIA A10G Tensor Core (24GB VRAM)',
    instanceType: 'AWS g5.4xlarge Dedicated Fleet',
    totalNodes: 8,
    activeNodes: 7,
    activeSessions: 19,
    maxSessions: 28,
    loadPercentage: 68,
    vramUsedGB: 114.2,
    vramTotalGB: 168.0,
    avgLatencyMs: 18.4,
    avgFps: 60.0,
    temperatureC: 62,
    status: 'healthy',
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-09-10T08:00:00Z',
  },
  {
    id: 'gpu-eu-west',
    regionCode: 'eu-central-1',
    regionName: 'EU Central (Frankfurt)',
    flagEmoji: '🇩🇪',
    gpuModel: 'NVIDIA RTX 6000 Ada (48GB VRAM)',
    instanceType: 'Hetzner Dedicated RTX Bare-Metal',
    totalNodes: 6,
    activeNodes: 6,
    activeSessions: 22,
    maxSessions: 24,
    loadPercentage: 89,
    vramUsedGB: 256.8,
    vramTotalGB: 288.0,
    avgLatencyMs: 24.1,
    avgFps: 59.8,
    temperatureC: 68,
    status: 'warning',
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-09-10T08:00:00Z',
  },
];

// GET /api/admin/gpu - List GPU nodes
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const user = await getAuthUser();
    requireAdmin(user);

    const rateLimitResponse = await applyRateLimit(request, { limit: 100, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    const { searchParams } = request.nextUrl;
    const regionCode = searchParams.get('regionCode') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    let filtered = [...mockGpuNodes];
    if (regionCode) filtered = filtered.filter(n => n.regionCode === regionCode);
    if (status) filtered = filtered.filter(n => n.status === status);

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

// POST /api/admin/gpu - Create GPU node (admin only)
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const user = await getAuthUser();
    requireAdmin(user);

    const rateLimitResponse = await applyRateLimit(request, { limit: 10, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    if (user.role !== 'super_admin' && user.role !== 'admin') {
      throw new Error('Insufficient permissions');
    }

    const body = await request.json().catch(() => ({}));
    const data = GpuNodeSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(body);

    const newNode: GpuNode = {
      ...data,
      id: `gpu-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockGpuNodes.push(newNode);

    return addRequestIdHeaders(createdResponse(newNode, { requestId }), requestId);
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}