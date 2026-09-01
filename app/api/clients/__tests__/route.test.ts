/**
 * @jest-environment node
 */
import { GET } from '@/app/api/clients/route';
import { NextRequest } from 'next/server';

function makeRequest(url: string): NextRequest {
  return new NextRequest(url);
}

describe('GET /api/clients', () => {
  it('returns all clients when no filters are applied', async () => {
    const res = await GET(makeRequest('http://localhost:3000/api/clients'));
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.clients)).toBe(true);
    expect(data.clients.length).toBeGreaterThan(0);
  });

  it('filters by accessCode (case-insensitive)', async () => {
    const res = await GET(
      makeRequest('http://localhost:3000/api/clients?accessCode=fst-2025-vtr')
    );
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.clients.length).toBeGreaterThan(0);
    expect(data.clients[0].portalAccessCode.toUpperCase()).toBe('FST-2025-VTR');
  });

  it('returns empty list for unknown access code', async () => {
    const res = await GET(
      makeRequest('http://localhost:3000/api/clients?accessCode=DONOTEXIST-9999')
    );
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.clients.length).toBe(0);
  });

  it('filters by query (q) across name, firm, email, access code', async () => {
    const res = await GET(
      makeRequest('http://localhost:3000/api/clients?q=foster')
    );
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.clients.length).toBeGreaterThan(0);
    expect(data.clients[0].firmName.toLowerCase()).toContain('foster');
  });

  it('filters by tier', async () => {
    const res = await GET(
      makeRequest('http://localhost:3000/api/clients?tier=Enterprise%20VIP')
    );
    const data = await res.json();
    expect(data.success).toBe(true);
    data.clients.forEach((c: any) => {
      expect(c.tier).toBe('Enterprise VIP');
    });
  });
});
