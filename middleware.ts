import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PROTECTED_PATHS = ['/client-dashboard'];

const ADMIN_PATHS = ['/admin/dashboard', '/admin'];

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isClientRoute = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const isAdminRoute = ADMIN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (isClientRoute) {
    if (!token) {
      const loginUrl = new URL('/client-access', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname + search);
      return NextResponse.redirect(loginUrl);
    }
    const role = (token as any).role;
    if (role && role !== 'CLIENT' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/client-access?error=forbidden', req.url));
    }
  }

  if (isAdminRoute) {
    if (!token) {
      const loginUrl = new URL('/client-access', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname + search);
      return NextResponse.redirect(loginUrl);
    }
    const role = (token as any).role;
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/client-access?error=admin_only', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/client-dashboard/:path*', '/admin/:path*'],
};
