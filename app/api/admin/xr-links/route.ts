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
  XRLinkSchema,
  CreateXRLinkSchema,
  type XRLink,
  type CreateXRLink,
} from '@/lib/api/contracts/schemas';

const mockProjects = [
  { id: 'VIZTR-882', name: 'Nordic Monolith - Phase 1' },
  { id: 'VIZTR-883', name: 'Vance Luxury Towers - VR Tour' },
];

const mockXrLinks: XRLink[] = [
  {
    id: 'xrl-001',
    projectId: 'VIZTR-883',
    projectName: 'Vance Luxury Towers - VR Tour',
    token: 'xrt_vance_7f3a2k9m',
    url: 'https://xr.viztr.studio/xrt_vance_7f3a2k9m',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    createdBy: 'usr-001',
    accessCount: 47,
    maxAccess: 100,
    allowedDomains: ['vance-realty.ae'],
    passwordProtected: true,
    passwordHash: '$2b$10$...',
  },
];

// GET /api/admin/xr-links - List XR links
export const GET = withAuth(
  z.object({ projectId: z.string().optional() }).optional(),
  async (query, request, user) => {
    const requestId = generateRequestId();
    
    const rateLimitResponse = applyRateLimit(request, { limit: 100, windowMs: 60000 });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    try {
      let filtered = [...mockXrLinks];
      
      if (query?.projectId) filtered = filtered.filter(l => l.projectId === query.projectId);

      return addRequestIdHeaders(successResponse(filtered, { requestId }), requestId);
    } catch (error) {
      return addRequestIdHeaders(handleApiError(error), requestId);
    }
  }
);

// POST /api/admin/xr-links - Create XR link
export const POST = withAuth(
  CreateXRLinkSchema,
  async (data, request, user) => {
    const requestId = generateRequestId();
    
    const rateLimitResponse = applyRateLimit(request, { limit: 50, windowMs: 60000 });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    try {
      // Find project
      const project = mockProjects.find(p => p.id === data.projectId);
      if (!project) {
        return addRequestIdHeaders(
          NextResponse.json(
            { success: false, error: { code: 'NOT_FOUND', message: `Project ${data.projectId} not found` } },
            { status: 404 }
          ),
          requestId
        );
      }

      const token = `xrt_${project.name.toLowerCase().replace(/\s+/g, '_')}_${Math.random().toString(36).slice(2, 10)}`;
      const newLink: XRLink = {
        id: `xrl-${Date.now()}`,
        projectId: data.projectId,
        projectName: project.name,
        token,
        url: `https://xr.viztr.studio/${token}`,
        expiresAt: data.expiresAt,
        createdAt: new Date().toISOString(),
        createdBy: user.id,
        accessCount: 0,
        maxAccess: data.maxAccess || 100,
        allowedDomains: data.allowedDomains,
        passwordProtected: !!data.password,
        passwordHash: data.password ? '$2b$10$...' : undefined,
      };
      mockXrLinks.unshift(newLink);

      return addRequestIdHeaders(
        NextResponse.json(
          { success: true, data: newLink, meta: { timestamp: new Date().toISOString(), requestId } },
          { status: 201 }
        ),
        requestId
      );
    } catch (error) {
      return addRequestIdHeaders(handleApiError(error), requestId);
    }
  }
);