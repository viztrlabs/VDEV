import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected paths
  const isAdminRoute = pathname.startsWith('/admin');
  const isClientDashboard = pathname.startsWith('/client-dashboard');

  // Let browser-side state handler manage authorization for smooth interactive demo
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/client-dashboard/:path*'],
};
