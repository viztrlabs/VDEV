/**
 * @jest-environment node
 */
import { POST } from '@/app/api/xr-links/public/[slug]/verify/route';
import { NextRequest } from 'next/server';

function makeRequest(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/xr-links/public/[slug]/verify', () => {
  it('returns 404 for an unknown slug', async () => {
    const req = makeRequest('http://localhost:3000/api/xr-links/public/nope/verify', { password: 'x' });
    const res = await POST(req, { params: { slug: 'nope' } } as any);
    expect(res.status).toBe(404);
  });

  it('accepts the correct password', async () => {
    const req = makeRequest('http://localhost:3000/api/xr-links/public/client-secure-haven/verify', { password: 'VIZTR-2026' });
    const res = await POST(req, { params: { slug: 'client-secure-haven' } } as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const req = makeRequest('http://localhost:3000/api/xr-links/public/client-secure-haven/verify', { password: 'wrong' });
    const res = await POST(req, { params: { slug: 'client-secure-haven' } } as any);
    expect(res.status).toBe(401);
  });
});
