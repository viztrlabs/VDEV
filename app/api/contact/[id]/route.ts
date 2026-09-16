import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { applyRateLimit } from '@/lib/rate-limit';
import { generateRequestId, addRequestIdHeaders } from '@/lib/api/validation';
import { getContactStore, setContactStore } from '@/lib/contact-store';
import { requireAuth } from '@/lib/api-guard';

const ContactStatusSchema = z.enum(['new', 'read', 'responded', 'archived']);

const UpdateContactStatusSchema = z.object({
  status: ContactStatusSchema,
});

// PATCH /api/contact/[id]/status - Update contact status
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAuth(request, ['super_admin', 'admin']);
  if (guard.error) return guard.error;

  const requestId = generateRequestId();
  const rateLimitResponse = await applyRateLimit(request, { limit: 50, window: '60 s' });
  if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

  try {
    const body = await request.json().catch(() => ({}));
    const validated = UpdateContactStatusSchema.parse(body);
    const { id } = await params;

    const store = getContactStore();
    const idx = store.submissions.findIndex((c) => c.id === id);
    if (idx === -1) {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: `Contact ${id} not found` } },
          { status: 404 }
        ),
        requestId
      );
    }

    const updated = {
      ...store.submissions[idx],
      status: validated.status,
      updated_at: new Date().toISOString(),
    };
    const next = [...store.submissions];
    next[idx] = updated;
    setContactStore(next);

    return addRequestIdHeaders(
      NextResponse.json({ success: true, data: updated }, { status: 200 }),
      requestId
    );
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
        { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update contact status' } },
        { status: 500 }
      ),
      requestId
    );
  }
}

// DELETE /api/contact/[id] - Delete contact submission
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAuth(request, ['super_admin', 'admin']);
  if (guard.error) return guard.error;

  const requestId = generateRequestId();
  const rateLimitResponse = await applyRateLimit(request, { limit: 20, window: '60 s' });
  if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

  try {
    const { id } = await params;
    const store = getContactStore();
    const idx = store.submissions.findIndex((c) => c.id === id);
    if (idx === -1) {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: `Contact ${id} not found` } },
          { status: 404 }
        ),
        requestId
      );
    }

    const next = store.submissions.filter((c) => c.id !== id);
    setContactStore(next);
    return addRequestIdHeaders(NextResponse.json({ success: true }, { status: 200 }), requestId);
  } catch (error) {
    return addRequestIdHeaders(
      NextResponse.json(
        { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete contact submission' } },
        { status: 500 }
      ),
      requestId
    );
  }
}
