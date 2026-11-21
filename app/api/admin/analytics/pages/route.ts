import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/api-guard';
import analytics from '@/lib/services/GoogleAnalyticsDataService';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// GET /api/admin/analytics/pages
export async function GET(req: NextRequest) {
  try {
    const guard = await requireSuperAdmin(req);
    if (guard.error) return guard.error;

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate') || '30 days ago';
    const endDate = searchParams.get('endDate') || 'yesterday';

    const now = new Date();
    const resolveDate = (dateStr: string): string => {
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;
      if (dateStr === 'today') return dateStr;
      if (dateStr === 'yesterday') return new Date(now.getTime() - 86400000).toISOString().split('T')[0];
      if (dateStr === 'last 7 days') {
        const d = new Date(now);
        d.setDate(d.getDate() - 6);
        return `${d.toISOString().split('T')[0]},${now.toISOString().split('T')[0]}`;
      }
      if (dateStr === 'last 30 days') {
        const d = new Date(now);
        d.setDate(d.getDate() - 29);
        return `${d.toISOString().split('T')[0]},${now.toISOString().split('T')[0]}`;
      }
      if (dateStr === 'last 90 days') {
        const d = new Date(now.getTime() - 86400000 * 89);
        return `${d.toISOString().split('T')[0]},${now.toISOString().split('T')[0]}`;
      }
      if (dateStr === 'this month') {
        const first = new Date(now.getFullYear(), now.getMonth(), 1);
        return `${first.toISOString().split('T')[0]},${now.toISOString().split('T')[0]}`;
      }
      if (dateStr === 'last month') {
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        const first = new Date(year, lastMonth, 1);
        const last = new Date(year, lastMonth + 1, 0);
        return `${first.toISOString().split('T')[0]},${last.toISOString().split('T')[0]}`;
      }
      if (dateStr === '30 days ago') {
        const d = new Date(now.getTime() - 30 * 86400000);
        return `${d.toISOString().split('T')[0]},${now.toISOString().split('T')[0]}`;
      }
      return now.toISOString().split('T')[0];
    };

    const formattedStart = resolveDate(startDate);
    const formattedEnd = resolveDate(endDate);
    const [start, end] = formattedEnd.includes(',') ? formattedStart.split(',') : [formattedStart, formattedEnd];

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
      const { data: ga4Creds } = await supabaseAdmin
        .from('ga4_credentials')
        .select('property_id, service_account_email, private_key')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (ga4Creds) {
        propertyId = ga4Creds.property_id;
        credentials = {
          client_email: ga4Creds.service_account_email,
          private_key: ga4Creds.private_key,
        };
      }
    }

    // Fallback to env vars
    if (!propertyId && process.env.GA_PROPERTY_ID) {
      propertyId = process.env.GA_PROPERTY_ID;
    }
    if (!credentials && process.env.GA_SERVICE_ACCOUNT_EMAIL && process.env.GA_PRIVATE_KEY) {
      credentials = {
        client_email: process.env.GA_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GA_PRIVATE_KEY,
      };
    }

    if (!propertyId || !credentials) {
      return NextResponse.json(
        { success: false, error: 'GA4 credentials not configured' },
        { status: 503 }
      );
    }

    const pagesData = await analytics.getPagePerformanceData(propertyId, start, end, credentials);

    return NextResponse.json({
      success: true,
      pages: pagesData,
      period: { startDate: start, endDate: end },
    });
  } catch (error: any) {
    console.error('GA4 pages API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch page performance data' },
      { status: 500 }
    );
  }
}