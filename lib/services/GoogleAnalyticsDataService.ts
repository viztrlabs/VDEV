/**
 * Google Analytics 4 Data API Server-Side Service
 * 
 * Uses the Google Analytics Data API (v1beta) to fetch reports.
 * Authentication via service account JWT.
 * 
 * All operations are server-side only — never expose credentials to the browser.
 */

import https from 'https';
import { URL } from 'url';
import { createSign } from 'crypto';

const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const DATA_API_BASE = 'https://analyticsdata.googleapis.com/v1beta';

interface GA4Credentials {
  client_email: string;
  private_key: string;
}

/**
 * Fetch an access token from Google using a service account JWT.
 */
function fetchAccessToken(credentials: GA4Credentials): Promise<string> {
  return new Promise((resolve, reject) => {
    // Replace escaped newlines with actual newlines for proper PEM format
    const privateKey = (credentials.private_key || '').replace(/\\n/g, '\n');

    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        iss: credentials.client_email,
        scope: 'https://www.googleapis.com/auth/analytics.readonly',
        aud: TOKEN_ENDPOINT,
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      })
    ).toString('base64url');

    const signingInput = `${header}.${payload}`;

    const signature = createSign('SHA256')
      .update(signingInput)
      .sign(privateKey, 'base64url');

    const jwt = `${signingInput}.${signature}`;

    const postData = `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`;

    const parsedUrl = new URL(TOKEN_ENDPOINT);

    const options = {
      method: 'POST',
      hostname: parsedUrl.host,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.access_token) {
            resolve(parsed.access_token);
          } else {
            reject(new Error('Failed to fetch access token: ' + data));
          }
        } catch {
          reject(new Error('Invalid token response: ' + data));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Build the GA4 property path string.
 */
function buildPropertyPath(propertyId: string): string {
  return `properties/${propertyId}`;
}

/**
 * Run a GA4 Data API report request.
 */
async function runReport(
  propertyId: string,
  request: {
    dimensions?: string[];
    metrics?: string[];
    dateRanges?: { start_date: string; end_date: string }[];
    filters?: string;
    order_by?: string;
    limit?: number;
    pivot?: any;
    timezone?: string;
  },
  credentials?: { client_email: string; private_key: string }
): Promise<any> {
  const creds: GA4Credentials = credentials || {
    client_email: process.env.GA_SERVICE_ACCOUNT_EMAIL!,
    private_key: (process.env.GA_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  };

  const accessToken = await fetchAccessToken(creds);
  const property = buildPropertyPath(propertyId);

  // Build the query string
  let query = '';

  if (request.dimensions) {
    query += `dimensions=${request.dimensions.map((d) => `dimension${request.dimensions.indexOf(d) + 1}`).join('&')}&`;
  }

  if (request.metrics) {
    query += `metrics=${request.metrics.map((m) => `metric${request.metrics.indexOf(m) + 1}`).join('&')}&`;
  }

  if (request.dateRanges) {
    const dr = request.dateRanges[0];
    query += `date_ranges=${JSON.stringify([{ start_date: dr.start_date, end_date: dr.end_date }])}&`;
  }

  if (request.filters) {
    query += `filters=${request.filters}&`;
  }

  if (request.order_by) {
    query += `order_by=${request.order_by}&`;
  }

  if (request.limit) {
    query += `view=${request.limit}&`;
  }

  const url = `${DATA_API_BASE}/${property}:runReport?${query}&access_token=${accessToken}`;

  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.host,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error('Invalid response: ' + data));
          }
        } else {
          reject(new Error(`GA4 API error ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/** Default export for the GA4 service */
export default {
  getOverviewKPIs,
  getTrafficData,
  getAcquisitionData,
  getAudienceData,
  getPagePerformanceData,
  getConversionData,
  getBizPerformanceData,
};

/**
 * Fetch overview KPIs from GA4.
 * Date range defaults to the last 30 days.
 */
export async function getOverviewKPIs(
  propertyId: string,
  startDate: string,
  endDate: string,
  credentials?: { client_email: string; private_key: string }
): Promise<OverviewKPIs> {
  const result = await runReport(propertyId, {
    dimensions: [],
    metrics: [
      'users',
      'newUsers',
      'sessions',
      'pageViews',
      'engagedSessions',
      'engagementRate',
      'averageEngagementTime',
      'conversions',
    ],
    dateRanges: [{ start_date: startDate, end_date: endDate }],
  }, credentials);

  const data = result?.rows?.[0] || [];
  const metrics: Record<string, number> = {};

  // GA4 Data API returns metrics in the order specified, indexed 1-based
  const metricNames = [
    'users',
    'newUsers',
    'sessions',
    'pageViews',
    'engagedSessions',
    'engagementRate',
    'averageEngagementTime',
    'conversions',
  ];

  for (let i = 0; i < metricNames.length; i++) {
    const value = data[i] ? Number(data[i]) : 0;
    metrics[metricNames[i]] = isNaN(value) ? 0 : value;
  }

  // engagementRate is a percentage (0-1), convert to percentage
  const engagementRate = metrics.engagementRate / 100;

  return {
    totalUsers: metrics.users,
    activeUsers: metrics.users, // GA4 activeUsers is typically same as total users in this context
    newUsers: metrics.newUsers,
    sessions: metrics.sessions,
    pageViews: metrics.pageViews,
    engagedSessions: metrics.engagedSessions,
    engagementRate,
    avgEngagementTime: metrics.averageEngagementTime,
    conversions: metrics.conversions,
  };
}

/**
 * Fetch traffic analytics (daily visitors) from GA4.
 */
export async function getTrafficData(
  propertyId: string,
  startDate: string,
  endDate: string,
  credentials?: { client_email: string; private_key: string }
): Promise<TrafficDataPoint[]> {
  const result = await runReport(propertyId, {
    dimensions: ['date'],
    metrics: ['users', 'newUsers', 'sessions', 'pageViews'],
    dateRanges: [{ start_date: startDate, end_date: endDate }],
    order_by: 'date ASC',
  }, credentials);

  const rows = result?.rows || [];
  return rows.map((row: string[]) => ({
    date: row[0],
    users: Number(row[1]) || 0,
    newUsers: Number(row[2]) || 0,
    sessions: Number(row[3]) || 0,
    pageViews: Number(row[4]) || 0,
  }));
}

/**
 * Fetch acquisition analytics (source/medium) from GA4.
 */
export async function getAcquisitionData(
  propertyId: string,
  startDate: string,
  endDate: string,
  credentials?: { client_email: string; private_key: string }
): Promise<AcquisitionSourceMedium[]> {
  const result = await runReport(propertyId, {
    dimensions: ['sessionSource', 'sessionMedium'],
    metrics: ['sessions', 'users'],
    dateRanges: [{ start_date: startDate, end_date: endDate }],
    order_by: 'sessions DESC',
  }, credentials);

  const rows = result?.rows || [];
  return rows.map((row: string[]) => ({
    source: row[0] || '(direct)',
    medium: row[1] || '(none)',
    sessions: Number(row[2]) || 0,
    users: Number(row[3]) || 0,
  }));
}

/**
 * Fetch audience analytics from GA4.
 */
export async function getAudienceData(
  propertyId: string,
  startDate: string,
  endDate: string,
  credentials?: { client_email: string; private_key: string }
): Promise<AudienceDataPoint[]> {
  const result = await runReport(propertyId, {
    dimensions: ['country', 'region', 'city', 'deviceCategory', 'operatingSystem', 'browser', 'newVsReturning'],
    metrics: ['users'],
    dateRanges: [{ start_date: startDate, end_date: endDate }],
    order_by: 'users DESC',
  }, credentials);

  const rows = result?.rows || [];
  return rows.map((row: string[]) => ({
    country: row[0],
    region: row[1],
    city: row[2],
    deviceCategory: row[3],
    operatingSystem: row[4],
    browser: row[5],
    newVsReturning: row[6],
  }));
}

/**
 * Fetch page performance data from GA4.
 */
export async function getPagePerformanceData(
  propertyId: string,
  startDate: string,
  endDate: string,
  credentials?: { client_email: string; private_key: string }
): Promise<PagePerformanceData[]> {
  const result = await runReport(propertyId, {
    dimensions: ['pagePath', 'pageTitle'],
    metrics: ['views', 'activeUsers', 'engagementRate', 'averageEngagementTime', 'eventCount'],
    dateRanges: [{ start_date: startDate, end_date: endDate }],
    order_by: 'views DESC',
  }, credentials);

  const rows = result?.rows || [];
  return rows.map((row: string[]) => ({
    pagePath: row[0] || '/',
    pageTitle: row[1] || 'Unknown Page',
    views: Number(row[2]) || 0,
    activeUsers: Number(row[3]) || 0,
    engagementRate: Number(row[4]) / 100 || 0,
    avgEngagementTime: Number(row[5]) || 0,
    eventCount: Number(row[6]) || 0,
  }));
}

/**
 * Fetch conversion analytics from GA4.
 */
export async function getConversionData(
  propertyId: string,
  startDate: string,
  endDate: string,
  credentials?: { client_email: string; private_key: string }
): Promise<{
  totalConversions: number;
  conversionEvents: Array<{ name: string; count: number }>;
}> {
  const result = await runReport(propertyId, {
    dimensions: ['eventName'],
    metrics: ['totalEvents'],
    dateRanges: [{ start_date: startDate, end_date: endDate }],
    filters: 'event_name IN (generate_lead, contact_form_submit, whatsapp_click, email_click, service_view, project_inquiry, cta_click, client_dashboard_access)',
    order_by: 'totalEvents DESC',
  }, credentials);

  const rows = result?.rows || [];
  const conversionEvents = rows.map((row: string[]) => ({
    name: row[0] || 'unknown',
    count: Number(row[1]) || 0,
  }));

  const totalConversions = conversionEvents.reduce((sum, ev) => sum + ev.count, 0);

  return {
    totalConversions,
    conversionEvents,
  };
}

/**
 * Fetch custom VizTR business events from GA4.
 * These are custom events tracked on the VizTR website.
 */
export async function getBizPerformanceData(
  propertyId: string,
  startDate: string,
  endDate: string,
  credentials?: { client_email: string; private_key: string }
): Promise<{
  serviceViews: Record<string, number>;
  formSubmissions: number;
  whatsappClicks: number;
  emailClicks: number;
  ctaClicks: number;
  clientDashboardAccesses: number;
}> {
  const result = await runReport(propertyId, {
    dimensions: ['eventName'],
    metrics: ['totalEvents'],
    dateRanges: [{ start_date: startDate, end_date: endDate }],
    filters: "event_name BEGINS WITH 'viztr_',",
    order_by: 'totalEvents DESC',
  }, credentials);

  const rows = result?.rows || [];
  const eventCounts: Record<string, number> = {};

  for (const row of rows) {
    const eventName = row[0] || 'unknown';
    const count = Number(row[1]) || 0;
    eventCounts[eventName] = count;
  }

  return {
    serviceViews: eventCounts['viztr_service_view'] || {},
    formSubmissions: eventCounts['viztr_form_submit'] || 0,
    whatsappClicks: eventCounts['viztr_whatsapp_click'] || 0,
    emailClicks: eventCounts['viztr_email_click'] || 0,
    ctaClicks: eventCounts['viztr_cta_click'] || 0,
    clientDashboardAccesses: eventCounts['viztr_client_dashboard_access'] || 0,
  };
}

/**
 * Types
 */

export interface OverviewKPIs {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  engagedSessions: number;
  engagementRate: number;
  avgEngagementTime: number;
  conversions: number;
}

export interface TrafficDataPoint {
  date: string;
  users: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
}

export interface AcquisitionSourceMedium {
  source: string;
  medium: string;
  sessions: number;
  users: number;
}

export interface AudienceDataPoint {
  country?: string;
  region?: string;
  city?: string;
  deviceCategory?: string;
  operatingSystem?: string;
  browser?: string;
  newVsReturning?: string;
}

export interface PagePerformanceData {
  pagePath: string;
  pageTitle: string;
  views: number;
  activeUsers: number;
  engagementRate: number;
  avgEngagementTime: number;
  eventCount: number;
}