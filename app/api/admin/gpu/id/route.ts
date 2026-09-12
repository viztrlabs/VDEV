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
  GpuNodeSchema,
  UpdateGpuNodeSchema,
  GpuNodeStatusSchema,
  type GpuNode,
  type UpdateGpuNode,
} from '@/lib/api/contracts/schemas';

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

// GET /api/admin/gpu/[id] - Get single GPU node
export const GET = withAuth(
  z.object({ id: z.string() }).optional(),
  async (params, request, user) => {
    const requestId = generateRequestId();
    const id = request.nextUrl.pathname.split('/').pop() || '';
    
    const rateLimitResponse = applyRateLimit(request, { limit: 100, windowMs: 60000 });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    try {
      const node = mockGpuNodes.find(n => n.id === id);
      if (!node) {
        return addRequestIdHeaders(
          NextResponse.json(
            { success: false, error: { code: 'NOT_FOUND', message: `GPU node ${id} not found` } },
            { status: 404 }
          ),
          requestId
        );
      }

      return addRequestIdHeaders(successResponse(node, { requestId }), requestId);
    } catch (error) {
      return addRequestIdHeaders(handleApiError(error), requestId);
    }
  }
);

// PATCH /api/admin/gpu/[id] - Update GPU node
export const PATCH = withAuth(
  UpdateGpuNodeSchema,
  async (data, request, user) => {
    const requestId = generateRequestId();
    const id = request.nextUrl.pathname.split('/').pop() || '';
    
    const rateLimitResponse = applyRateLimit(request, { limit: 50, windowMs: 60000 });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    try {
      if (user.role !== 'super_admin' && user.role !== 'admin') {
        throw new Error('Insufficient permissions');
      }

      const nodeIndex = mockGpuNodes.findIndex(n => n.id === id);
      if (nodeIndex === -1) {
        return addRequestIdHeaders(
          NextResponse.json(
            { success: false, error: { code: 'NOT_FOUND', message: `GPU node ${id} not found` } },
            { status: 404 }
          ),
          requestId
        );
      }

      // Apply updates
      mockGpuNodes[nodeIndex] = { 
        ...mockGpuNodes[nodeIndex], 
        ...data, 
        updatedAt: new Date().toISOString() 
      };

      return addRequestIdHeaders(successResponse(mockGpuNodes[nodeIndex], { requestId }), requestId);
    } catch (error) {
      return addRequestIdHeaders(handleApiError(error), requestId);
    }
  }
);

// DELETE /api/admin/gpu/[id] - Delete GPU node
export const DELETE = withAuth(
  z.object({ id: z.string() }).optional(),
  async (params, request, user) => {
    const requestId = generateRequestId();
    const id = request.nextUrl.pathname.split('/').pop() || '';
    
    const rateLimitResponse = applyRateLimit(request, { limit: 10, windowMs: 60000 });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    try {
      if (user.role !== 'super_admin') {
        throw new Error('Only super_admin can delete GPU nodes');
      }

      const nodeIndex = mockGpuNodes.findIndex(n => n.id === id);
      if (nodeIndex === -1) {
        return addRequestIdHeaders(
          NextResponse.json(
            { success: false, error: { code: 'NOT_FOUND', message: `GPU node ${id} not found` } },
            { status: 404 }
          ),
          requestId
        );
      }

      mockGpuNodes.splice(nodeIndex, 1);

      return addRequestIdHeaders(noContentResponse(), requestId);
    } catch (error) {
      return addRequestIdHeaders(handleApiError(error), requestId);
    }
  }
);

// POST /api/admin/gpu/[id]/maintenance - Toggle maintenance mode
export const POST = withAuth(
  z.object({ id: z.string() }).optional(),
  async (params, request, user) => {
    const requestId = generateRequestId();
    const id = request.nextUrl.pathname.split('/').slice(-2)[0];
    
    const rateLimitResponse = applyRateLimit(request, { limit: 20, windowMs: 60000 });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    try {
      if (user.role !== 'super_admin' && user.role !== 'admin') {
        throw new Error('Insufficient permissions');
      }

      const nodeIndex = mockGpuNodes.findIndex(n => n.id === id);
      if (nodeIndex === -1) {
        return addRequestIdHeaders(
          NextResponse.json(
            { success: false, error: { code: 'NOT_FOUND', message: `GPU node ${id} not found` } },
            { status: 404 }
          ),
          requestId
        );
      }

      const newStatus = mockGpuNodes[nodeIndex].status === 'maintenance' ? 'healthy' : 'maintenance';
      mockGpuNodes[nodeIndex] = { 
        ...mockGpuNodes[nodeIndex], 
        status: newStatus,
        updatedAt: new Date().toISOString() 
      };

      return addRequestIdHeaders(successResponse(mockGpuNodes[nodeIndex], { requestId }), requestId);
    } catch (error) {
      return addRequestIdHeaders(handleApiError(error), requestId);
    }
  }
);