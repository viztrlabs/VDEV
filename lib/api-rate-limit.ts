import { NextRequest, NextResponse } from 'next/server';

export function withRateLimitHeaders(response: NextResponse) {
  response.headers.set('X-RateLimit-Limit', '120');
  response.headers.set('X-RateLimit-Window', '60');
  return response;
}
