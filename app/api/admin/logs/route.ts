export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import {
  handleApiError,
  successResponse,
  applyRateLimit,
  generateRequestId,
  addRequestIdHeaders,
} from '@/lib/api/validation';
import { getAuthUser, requireAdmin } from '@/lib/api/auth';
import {
  CreateSystemLogSchema,
  type SystemHealthLog,
} from '@/lib/api/contracts/schemas';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

function requireDb() {
  const db = getSupabaseAdmin();
  if (!db) {
    throw new Error('Database unavailable: server storage not configured');
  }
  return db;
}

// System logs are persisted in the Prisma `AuditLog` table:
// service -> entity, message -> action, level/details/region/ip -> metadata.
function toLog(row: any): SystemHealthLog {
  const meta = (row.metadata ?? {}) as Record<string, any>;
  const level = meta.level === 'warn' || meta.level === 'error' || meta.level === 'critical' ? meta.level : 'info';
  return {
    id: row.id,
    timestamp: new Date(row.createdAt).toISOString(),
    level,
    service: row.entity,
    message: row.action,
    details: meta.details,
    region: meta.region,
    ip: meta.ip,
  };
}

// GET /api/admin/logs - List system logs with filtering and pagination
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const user = await getAuthUser();
    requireAdmin(user);

    const rateLimitResponse = await applyRateLimit(request, { limit: 100, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    const { searchParams } = request.nextUrl;
    const level = searchParams.get('level') || undefined;
    const service = searchParams.get('service') || undefined;
    const search = searchParams.get('search') || undefined;
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const pageSize = Math.min(Math.max(parseInt(searchParams.get('pageSize') || '50', 10), 1), 200);

    const db = requireDb();
    const { data, error } = await db
      .from('AuditLog')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);

    let filtered = ((data ?? []) as any[]).map(toLog);
    if (level) filtered = filtered.filter((l) => l.level === level);
    if (service) filtered = filtered.filter((l) => l.service === service);
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.message.toLowerCase().includes(s) ||
          l.service.toLowerCase().includes(s) ||
          l.details?.toLowerCase().includes(s)
      );
    }
    if (dateFrom) filtered = filtered.filter((l) => l.timestamp >= dateFrom);
    if (dateTo) filtered = filtered.filter((l) => l.timestamp <= dateTo);

    const start = (page - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    return addRequestIdHeaders(
      successResponse(
        { data: paginated, total: filtered.length, page, pageSize, totalPages: Math.ceil(filtered.length / pageSize) },
        { requestId }
      ) as NextResponse,
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

    const db = requireDb();
    const row = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: user.id,
      action: data.message,
      entity: data.service,
      entityId: null,
      metadata: {
        level: data.level,
        details: data.details ?? null,
        region: data.region ?? null,
        ip: data.ip ?? null,
      },
      createdAt: new Date().toISOString(),
    };
    const { data: inserted, error } = await db.from('AuditLog').insert(row).select('*').single();
    if (error) throw new Error(error.message);

    return addRequestIdHeaders(
      NextResponse.json(
        { success: true, data: toLog(inserted), meta: { timestamp: new Date().toISOString(), requestId } },
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

    const db = requireDb();
    const { error } = await db.from('AuditLog').delete().gte('createdAt', '1970-01-01T00:00:00.000Z');
    if (error) throw new Error(error.message);

    return addRequestIdHeaders(new NextResponse(null, { status: 204 }), requestId);
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}
