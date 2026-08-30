import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Routes that require an authenticated session (once Supabase is configured).
const PROTECTED_PREFIXES = [
  '/admin',
  '/client-dashboard',
  '/xr-world/virtual-tour/editor',
];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If Supabase is not configured, leave everything open (graceful demo mode).
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  // Public auth pages are never gated.
  if (pathname === '/login' || pathname === '/signup') {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response.headers.forEach((value, key) => response.cookies.set(key, value));
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Refresh the session so RLS + gating see a valid user.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtected(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }

  // Already-authenticated users hitting /login get bounced to the studio.
  if ((pathname === '/login' || pathname === '/signup') && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/client-dashboard/:path*',
    '/xr-world/virtual-tour/editor/:path*',
    '/login/:path*',
    '/signup/:path*',
  ],
};
