import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const robots = `User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /admin/
Disallow: /under-admin/
Disallow: /app/
Disallow: /_next/
Disallow: /api/admin/
Disallow: /api/auth/
Disallow: /api/client-auth/

# Allow public API endpoints
Allow: /api/contact/
Allow: /api/bookings/

# Sitemap
Sitemap: https://viztr.com/sitemap.xml

# Crawl delay
Crawl-delay: 1`;

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
