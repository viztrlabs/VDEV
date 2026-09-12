import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  withAuth,
  handleApiError,
  successResponse,
  applyRateLimit,
  generateRequestId,
  addRequestIdHeaders,
} from '@/lib/api/validation';
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
export const GET = withAuth(
  z.object({ 
    period: z.enum(['monthly', 'quarterly', 'yearly']).optional() 
  }).optional(),
  async (query, request, user) => {
    const requestId = generateRequestId();
    
    const rateLimitResponse = applyRateLimit(request, { limit: 100, windowMs: 60000 });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    try {
      let metrics = [...mockRevenueMetrics].sort((a, b) => b.month.localeCompare(a.month));
      
      // Could filter by period if needed
      
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
);

// POST /api/admin/revenue/refresh - Refresh revenue materialized view (super_admin only)
export const POST = withAuth(
  z.object({}).optional(),
  async (params, request, user) => {
    const requestId = generateRequestId();
    
    const rateLimitResponse = applyRateLimit(request, { limit: 5, windowMs: 60000 });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    try {
      if (user.role !== 'super_admin') {
        throw new Error('Only super_admin can refresh revenue metrics');
      }

      // In production: call supabase function to refresh materialized view
      // await supabase.rpc('refresh_revenue_mv');
      
      // For mock, just return current data
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
);