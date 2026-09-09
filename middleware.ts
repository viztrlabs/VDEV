import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { normalizeUserRole, hasRouteAccess, getDefaultDashboard } from './lib/rbac';
import { checkRateLimit } from './lib/rate-limit';

const PROTECTED_CLIENT_PATHS = ['/client-dashboard'];
const ADMIN_PATHS = ['/admin/dashboard', '/admin'];

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const rawRole = (token as any)?.role;
  const role = normalizeUserRole(rawRole);

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

  // 4. API Rate Limiting
  if (pathname.startsWith('/api')) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const identifier = token ? `auth:${(token as any)?.id || (token as any)?.email}` : `anon:${ip}`;
    const limit = token ? 100 : 30;

    const rateResult = checkRateLimit(identifier, { limit, windowMs: 60 * 1000 });
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
  matcher: ['/client-dashboard/:path*', '/admin/:path*', '/app/:path*', '/api/:path*'],
};

