export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  handleApiError,
  successResponse,
  applyRateLimit,
  generateRequestId,
  addRequestIdHeaders,
  type RateLimitConfig,
} from '@/lib/api/validation';
import { getAuthUser, requireAdmin } from '@/lib/api/auth';
import {
  RevenueMetricSchema,
  RevenueSummarySchema,
  type RevenueMetric,
  type RevenueSummary,
} from '@/lib/api/contracts/schemas';

const mockRevenueMetrics: RevenueMetric[] = [
  {
    month: '2025-09',
    mrr: 128500,
    oneOffCommissions: 45200,
    gpuStreamingRevenue: 89300,
    vrLicenses: 34100,
    total: 297100,
    expenses: 89200,
    netMargin: 69.9,
  },
  {
    month: '2025-08',
    mrr: 115200,
    oneOffCommissions: 38900,
    gpuStreamingRevenue: 76400,
    vrLicenses: 29800,
    total: 260300,
    expenses: 78100,
    netMargin: 69.9,
  },
  {
    month: '2025-07',
    mrr: 102800,
    oneOffCommissions: 32100,
    gpuStreamingRevenue: 68200,
    vrLicenses: 24500,
    total: 227600,
    expenses: 68300,
    netMargin: 69.9,
  },
];

const mockRevenueSummary: RevenueSummary = {
  currentMRR: 128500,
  currentARR: 1542000,
  growthRateMoM: 11.5,
};

// GET /api/admin/revenue - Get monthly revenue metrics
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const user = await getAuthUser();
    requireAdmin(user);

    const rateLimitResponse = await applyRateLimit(request, { limit: 100, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    let metrics = [...mockRevenueMetrics].sort((a, b) => b.month.localeCompare(a.month));

    return addRequestIdHeaders(
      successResponse({
        monthly: metrics,
        summary: mockRevenueSummary,
      }, { requestId }) as NextResponse,
      requestId
    );
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}

// POST /api/admin/revenue/refresh - Refresh revenue materialized view (super_admin only)
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

    return addRequestIdHeaders(
      successResponse({
        message: 'Revenue metrics refreshed successfully',
        summary: mockRevenueSummary,
      }, { requestId }) as NextResponse,
      requestId
    );
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}