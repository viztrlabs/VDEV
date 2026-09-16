import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { applyRateLimit } from '@/lib/rate-limit';
import { generateRequestId, addRequestIdHeaders } from '@/lib/api/validation';
import { listClientDirectory } from '@/lib/client-directory';
import { createClientPortalToken } from '@/lib/client-auth';

const VerifyClientSchema = z.object({
  projectId: z.string().min(1),
  accessCode: z.string().min(1),
});

// POST /api/client-auth/verify - Verify project ID + access code
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const rateLimitResponse = await applyRateLimit(request, { limit: 20, window: '60 s' });
  if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

  try {
    const body = await request.json().catch(() => ({}));
    const validated = VerifyClientSchema.parse(body);

    const clients = await listClientDirectory({
      id: validated.projectId,
      accessCode: validated.accessCode,
    });

    const client = clients.find((c) => {
      const projectIdMatch = c.id === validated.projectId || c.id === validated.projectId.toUpperCase();
      const accessCodeMatch = c.portalAccessCode === validated.accessCode || c.portalAccessCode === validated.accessCode.toUpperCase();
      return projectIdMatch && accessCodeMatch;
    });

    if (!client) {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'AUTH_ERROR', message: 'Invalid Project ID or Access Code' } },
          { status: 401 }
        ),
        requestId
      );
    }

    const token = createClientPortalToken({
      clientId: client.id,
      clientName: client.name,
      clientFirm: client.firmName,
      clientEmail: client.email,
      accessCode: client.portalAccessCode,
      assignedDirector: client.assignedDirector,
      tier: client.tier,
    });

    const response = NextResponse.json(
      {
        success: true,
        data: {
          clientId: client.id,
          clientName: client.name,
          clientFirm: client.firmName,
          clientEmail: client.email,
          accessCode: client.portalAccessCode,
          assignedDirector: client.assignedDirector,
          tier: client.tier,
          activeProjects: client.activeProjects,
          token,
        },
        meta: { timestamp: new Date().toISOString(), requestId },
      },
      { status: 200 }
    );

    response.cookies.set('viztr-client-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return addRequestIdHeaders(response, requestId);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues?.[0]?.message || 'Invalid request', issues: error.issues } },
          { status: 400 }
        ),
        requestId
      );
    }
    return addRequestIdHeaders(
      NextResponse.json(
        { success: false, error: { code: 'INTERNAL_ERROR', message: 'Authentication failed' } },
        { status: 500 }
      ),
      requestId
    );
  }
}
