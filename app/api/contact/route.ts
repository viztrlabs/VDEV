import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  CreateContactSchema,
  ContactFiltersSchema,
  type ContactSubmission,
  type ContactFilters,
  type ContactStats,
} from '@/lib/api/contracts/schemas';
import { applyRateLimit } from '@/lib/rate-limit';
import { generateRequestId, addRequestIdHeaders } from '@/lib/api/validation';
import { getContactStore, setContactStore, applyContactFilters, paginateContacts, computeContactStats } from '@/lib/contact-store';
import { requireAuth } from '@/lib/api-guard';

// POST /api/contact - Submit contact form (public endpoint)
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const rateLimitResponse = await applyRateLimit(request, { limit: 10, window: '60 s' });
  if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

  try {
    const body = await request.json().catch(() => ({}));
    const validated = CreateContactSchema.parse(body);

    const now = new Date().toISOString();
    const store = getContactStore();
    const newSubmission: ContactSubmission = {
      id: `CONT-${new Date().getFullYear()}-${String(store.submissions.length + 1).padStart(3, '0')}`,
      ...validated,
      status: 'new',
      created_at: now,
      updated_at: now,
    };

    setContactStore([...store.submissions, newSubmission]);

    // Send email notifications
    try {
      const { sendContactNotification } = await import('@/lib/email-service');
      await sendContactNotification({
        id: newSubmission.id,
        name: newSubmission.name,
        email: newSubmission.email,
        company: newSubmission.company,
        service_interest: newSubmission.service_interest,
        message: newSubmission.message,
      });
    } catch (emailError) {
      console.error('[Contact] Failed to send email notification:', emailError);
    }

    return addRequestIdHeaders(
      NextResponse.json(
        { success: true, data: newSubmission, meta: { timestamp: now, requestId } },
        { status: 201 }
      ),
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
        { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to submit contact form' } },
        { status: 500 }
      ),
      requestId
    );
  }
}

// GET /api/contact - List contact submissions (admin)
export async function GET(request: NextRequest) {
  const guard = await requireAuth(request, ['super_admin', 'admin']);
  if (guard.error) return guard.error;

  const requestId = generateRequestId();
  const rateLimitResponse = await applyRateLimit(request, { limit: 100, window: '60 s' });
  if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

  try {
    const searchParams = request.nextUrl.searchParams;
    const filters: ContactFilters = {
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') as ContactFilters['status'] || undefined,
      service_interest: searchParams.get('service_interest') as ContactFilters['service_interest'] || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
    };

    const store = getContactStore();
    let filtered = applyContactFilters([...store.submissions], filters);

    const sortField = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';
    filtered.sort((a, b) => {
      const aVal = a[sortField as keyof ContactSubmission] as string;
      const bVal = b[sortField as keyof ContactSubmission] as string;
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const paginated = paginateContacts(filtered, { page, pageSize, sortBy: sortField, sortOrder });

    return addRequestIdHeaders(
      {
        success: true,
        data: paginated.data,
        total: paginated.total,
        page: paginated.page,
        pageSize: paginated.pageSize,
        totalPages: paginated.totalPages,
        stats: computeContactStats(store.submissions),
      } as any,
      requestId
    );
  } catch (error) {
    return addRequestIdHeaders(
      NextResponse.json(
        { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch contact submissions' } },
        { status: 500 }
      ),
      requestId
    );
  }
}
