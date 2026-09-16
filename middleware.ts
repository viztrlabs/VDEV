import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { normalizeUserRole, hasRouteAccess, getDefaultDashboard } from './lib/rbac';
import { checkRateLimit } from './lib/rate-limit';
import { isEnabledServer } from './lib/feature-flags';
import { verifyClientPortalToken, getClientPortalTokenFromRequest } from './lib/client-auth';

const PROTECTED_CLIENT_PATHS = ['/client-dashboard'];
const ADMIN_PATHS = ['/admin/dashboard', '/admin', '/under-admin'];
const CLIENT_PORTAL_PATHS = ['/app/client'];

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const rawRole = (token as any)?.role;
  const role = normalizeUserRole(rawRole);

  // Feature flag: Super Admin Dashboard Consolidation
  const superAdminEnabled = isEnabledServer('super-admin-consolidation');
  if (!superAdminEnabled && pathname.startsWith('/admin/dashboard')) {
    // If feature disabled, redirect to old location or show maintenance
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  // 1. /app/* routes (SaaS role-based dashboards)
  if (pathname.startsWith('/app')) {
    const isAppAuthRoute =
      pathname === '/app/login' ||
      pathname === '/app/register' ||
      pathname === '/app/forgot-password';

    if (isAppAuthRoute) {
      // If already logged in, redirect away from app login to their dashboard
      if (token) {
        return NextResponse.redirect(new URL(getDefaultDashboard(role), req.url));
      }
      return NextResponse.next();
    }

    // Require authentication
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname + search);
      return NextResponse.redirect(loginUrl);
    }

    // If accessing generic /app or /app/dashboard, redirect to role-specific dashboard
    if (pathname === '/app' || pathname === '/app/dashboard') {
      return NextResponse.redirect(new URL(getDefaultDashboard(role), req.url));
    }

    // Role-based access control
    if (!hasRouteAccess(role, pathname)) {
      const redirectUrl = new URL(getDefaultDashboard(role), req.url);
      redirectUrl.searchParams.set('error', 'unauthorized_access');
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 2. Client Dashboard
  const isClientRoute = PROTECTED_CLIENT_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (isClientRoute) {
    if (!token) {
      const loginUrl = new URL('/client-access', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname + search);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== 'client' && role !== 'super_admin' && role !== 'admin') {
      const redirectUrl = new URL(getDefaultDashboard(role), req.url);
      redirectUrl.searchParams.set('error', 'forbidden');
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 3. Admin routes
  const isAdminRoute = ADMIN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (isAdminRoute) {
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname + search);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== 'super_admin' && role !== 'admin') {
      const redirectUrl = new URL(getDefaultDashboard(role), req.url);
      redirectUrl.searchParams.set('error', 'admin_only');
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 3b. Client Portal Routes (/app/client/*)
  const isClientPortalRoute = CLIENT_PORTAL_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (isClientPortalRoute) {
    const clientToken = verifyClientPortalToken(getClientPortalTokenFromRequest(req) || '');
    const hasClientToken = !!clientToken;
    const hasValidSession = token && (role === 'client' || role === 'super_admin' || role === 'admin');

    if (!hasClientToken && !hasValidSession) {
      const loginUrl = new URL('/client-access', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname + search);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. API Rate Limiting
  if (pathname.startsWith('/api')) {
    // Skip rate limiting for auth endpoints
    if (pathname.startsWith('/api/auth/')) {
      return NextResponse.next();
    }
    
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const identifier = token ? `auth:${(token as any)?.id || (token as any)?.email}` : `anon:${ip}`;
    const limit = token ? 100 : 30;

    const rateResult = await checkRateLimit(identifier, { limit, window: '60 s' });
    if (!rateResult.allowed) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Too many requests. Please try again later.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((rateResult.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/client-dashboard/:path*', '/admin/:path*', '/under-admin/:path*', '/app/:path*', '/app/client/:path*', '/api/:path*'],
};

