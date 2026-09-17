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
import type { RevenueMetric, RevenueSummary } from '@/lib/api/contracts/schemas';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

function requireDb() {
  const db = getSupabaseAdmin();
  if (!db) {
    throw new Error('Database unavailable: server storage not configured');
  }
  return db;
}

function toMetric(row: any): RevenueMetric {
  const num = (v: unknown) => (typeof v === 'string' ? parseFloat(v) : Number(v ?? 0));
  return {
    month: row.month,
    mrr: num(row.mrr),
    oneOffCommissions: num(row.one_off_commissions),
    gpuStreamingRevenue: num(row.gpu_streaming_revenue),
    vrLicenses: num(row.vr_licenses),
    total: num(row.total),
    expenses: num(row.expenses),
    netMargin: num(row.net_margin),
  };
}

function toSummary(metrics: RevenueMetric[]): RevenueSummary {
  if (metrics.length === 0) {
    return { currentMRR: 0, currentARR: 0, growthRateMoM: 0 };
  }
  const latest = metrics[0];
  const previous = metrics[1];
  const growth =
    previous && previous.mrr > 0 ? ((latest.mrr - previous.mrr) / previous.mrr) * 100 : 0;
  return {
    currentMRR: latest.mrr,
    currentARR: latest.mrr * 12,
    growthRateMoM: Math.round(growth * 10) / 10,
  };
}

// GET /api/admin/revenue - Monthly revenue metrics from `revenue_metrics`
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const user = await getAuthUser();
    requireAdmin(user);

    const rateLimitResponse = await applyRateLimit(request, { limit: 100, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    const db = requireDb();
    const { data, error } = await db
      .from('revenue_metrics')
      .select('*')
      .order('month', { ascending: false });
    if (error) throw new Error(error.message);

    const metrics = ((data ?? []) as any[]).map(toMetric);
    return addRequestIdHeaders(
      successResponse({ monthly: metrics, summary: toSummary(metrics) }, { requestId }) as NextResponse,
      requestId
    );
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}

// POST /api/admin/revenue - Recompute metrics from project bookings (super_admin only)
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const user = await getAuthUser();
    requireAdmin(user);

    const rateLimitResponse = await applyRateLimit(request, { limit: 5, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    if (user.role !== 'super_admin') {
      throw new Error('Only super_admin can refresh revenue metrics');
    }

    const db = requireDb();
    const { data: projects, error: projectsError } = await db
      .from('projects')
      .select('booking_amount,created_at');
    if (projectsError) throw new Error(projectsError.message);

    // Aggregate confirmed booking value per calendar month. Category
    // breakdowns (MRR, GPU, VR) have no billing source yet and stay 0.
    const byMonth = new Map<string, number>();
    for (const p of (projects ?? []) as any[]) {
      const month = new Date(p.created_at).toISOString().slice(0, 7);
      byMonth.set(month, (byMonth.get(month) ?? 0) + (parseFloat(p.booking_amount) || 0));
    }

    const rows = [...byMonth.entries()].map(([month, total]) => ({
      month,
      mrr: 0,
      one_off_commissions: total,
      gpu_streaming_revenue: 0,
      vr_licenses: 0,
      total,
      expenses: 0,
      net_margin: total > 0 ? 100 : 0,
      updated_at: new Date().toISOString(),
    }));

    if (rows.length > 0) {
      const { error: upsertError } = await db.from('revenue_metrics').upsert(rows, { onConflict: 'month' });
      if (upsertError) throw new Error(upsertError.message);
    }

    const { data, error } = await db
      .from('revenue_metrics')
      .select('*')
      .order('month', { ascending: false });
    if (error) throw new Error(error.message);
    const metrics = ((data ?? []) as any[]).map(toMetric);

    return addRequestIdHeaders(
      successResponse(
        { message: 'Revenue metrics refreshed from project bookings', summary: toSummary(metrics) },
        { requestId }
      ) as NextResponse,
      requestId
    );
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}
