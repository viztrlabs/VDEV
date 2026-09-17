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
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const user = await getAuthUser();
    requireAdmin(user);

    const rateLimitResponse = await applyRateLimit(request, { limit: 100, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    const { searchParams } = request.nextUrl;
    const projectId = searchParams.get('projectId') || undefined;

    let filtered = [...mockXrLinks];
    if (projectId) filtered = filtered.filter(l => l.projectId === projectId);

    return addRequestIdHeaders(successResponse(filtered, { requestId }), requestId);
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}

// POST /api/admin/xr-links - Create XR link
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const user = await getAuthUser();
    requireAdmin(user);

    const rateLimitResponse = await applyRateLimit(request, { limit: 50, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    const body = await request.json().catch(() => ({}));
    const data = CreateXRLinkSchema.parse(body);

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