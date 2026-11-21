import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/api-guard';
import analytics from '@/lib/services/GoogleAnalyticsDataService';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// GET /api/admin/analytics/overview
export async function GET(req: NextRequest) {
  try {
    const guard = await requireSuperAdmin(req);
    if (guard.error) return guard.error;

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate') || '30 days ago';
    const endDate = searchParams.get('endDate') || 'yesterday';

    // Resolve relative date strings to actual dates
    const now = new Date();
    const resolveDate = (dateStr: string): string => {
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;
      if (dateStr === 'today') return formatDate(now);
      if (dateStr === 'yesterday') return formatDate(new Date(now.getTime() - 86400000));
      if (dateStr === 'last 7 days') {
        const d = new Date(now);
        d.setDate(d.getDate() - 6);
        return `${formatDate(new Date(d.getTime() - 86400000))},${formatDate(now)}`;
      }
      if (dateStr === 'last 30 days') {
        const d = new Date(now);
        d.setDate(d.getDate() - 29);
        return `${formatDate(d)},${formatDate(now)}`;
      }
      if (dateStr === 'last 90 days') {
        const d = new Date(now);
        d.setDate(d.getDate() - 89);
        return `${formatDate(new Date(d.getTime() - 86400000 * 89))},${formatDate(now)}`;
      }
      if (dateStr === 'this month') {
        const first = new Date(now.getFullYear(), now.getMonth(), 1);
        return `${formatDate(first)},${formatDate(now)}`;
      }
      if (dateStr === 'last month') {
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        const first = new Date(year, lastMonth, 1);
        const last = new Date(year, lastMonth + 1, 0);
        return `${formatDate(first)},${formatDate(last)}`;
      }
      if (dateStr === '30 days ago') {
        const d = new Date(now.getTime() - 30 * 86400000);
        return `${formatDate(d)},${formatDate(now)}`;
      }
      return formatDate(now);
    };

    const formattedStart = resolveDate(startDate);
    const formattedEnd = resolveDate(endDate);

    // Parse the "start,end" format
    const [start, end] = formattedStart.split(',');
    const [end2] = formattedEnd.split(',');

    if (!start || !end) {
      return NextResponse.json(
        { success: false, error: 'Invalid date range' },
        { status: 400 }
      );
    }

    // Fetch active GA4 credentials from database
    const supabaseAdmin = getSupabaseAdmin();
    let propertyId = process.env.GA_PROPERTY_ID || '';
    let credentials: { client_email: string; private_key: string } | undefined;

    if (supabaseAdmin) {
      const { data: ga4Creds, error } = await supabaseAdmin
        .from('ga4_credentials')
        .select('property_id, service_account_email, private_key')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Only log real errors, not "table not found" or "no rows"
        if (error.code !== '42P01' && error.code !== 'PGRST116') {
          console.error('Failed to fetch GA4 credentials:', error);
        }
      }

      if (ga4Creds) {
        propertyId = ga4Creds.property_id;
        credentials = {
          client_email: ga4Creds.service_account_email,
          private_key: ga4Creds.private_key,
        };
      }
    }

    // Fallback to env vars if no DB credentials
    if (!propertyId && process.env.GA_PROPERTY_ID) {
      propertyId = process.env.GA_PROPERTY_ID;
    }
    if (!credentials && process.env.GA_SERVICE_ACCOUNT_EMAIL && process.env.GA_PRIVATE_KEY) {
      credentials = {
        client_email: process.env.GA_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GA_PRIVATE_KEY,
      };
    }

    // Check if we have valid credentials (not placeholders)
    const hasValidCredentials = propertyId && 
      credentials && 
      !propertyId.includes('YOUR_') &&
      credentials.client_email && 
      !credentials.client_email.includes('your-') &&
      credentials.private_key && 
      !credentials.private_key.includes('YOUR_');

    if (!hasValidCredentials) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'GA4 credentials not configured',
          details: 'Add credentials in Super Admin Dashboard → GA4 Credentials tab, or set GA_PROPERTY_ID, GA_SERVICE_ACCOUNT_EMAIL, and GA_PRIVATE_KEY in .env.local'
        },
        { status: 503 }
      );
    }

    const [kpiResult, trafficResult, acquisitionResult, audienceResult, pagesResult, conversionsResult] = await Promise.all([
      analytics.getOverviewKPIs(propertyId, start, end, credentials),
      analytics.getTrafficData(propertyId, start, end, credentials),
      analytics.getAcquisitionData(propertyId, start, end, credentials),
      analytics.getAudienceData(propertyId, start, end, credentials),
      analytics.getPagePerformanceData(propertyId, start, end, credentials),
      analytics.getConversionData(propertyId, start, end, credentials),
    ]);

    return NextResponse.json({
      success: true,
      kpi: kpiResult,
      traffic: trafficResult,
      acquisition: acquisitionResult,
      audience: audienceResult,
      pages: pagesResult,
      conversions: conversionsResult,
      period: { startDate: start, endDate: end },
    });
  } catch (error: any) {
    console.error('GA4 API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}