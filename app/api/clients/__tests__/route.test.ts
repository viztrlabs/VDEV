/**
 * @jest-environment node
 */
import { GET } from '@/app/api/clients/route';
import { NextRequest } from 'next/server';

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));
jest.mock('@/lib/supabase/repositories', () => ({
  isSupabaseAdminReady: () => false,
  listClientsSupabase: async () => null,
}));

import { getServerSession } from 'next-auth/next';

function makeRequest(url: string): NextRequest {
  return new NextRequest(url);
}

describe('GET /api/clients', () => {
  beforeEach(() => {
    (getServerSession as jest.Mock).mockReset();
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { role: 'admin' },
    });
  });

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

describe('GET /api/clients — auth guard', () => {
  beforeEach(() => {
    (getServerSession as jest.Mock).mockReset();
  });

  it('returns 401 when unauthenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const res = await GET(new NextRequest('http://localhost:3000/api/clients'));
    expect(res.status).toBe(401);
  });

  it('returns full records for admins', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { role: 'super_admin' },
    });
    const res = await GET(new NextRequest('http://localhost:3000/api/clients'));
    expect(res.status).toBe(200);
    const body = await res.json();
    for (const c of body.clients) {
      expect(c).toHaveProperty('portalAccessCode');
    }
  });

  it('strips portalAccessCode, notes, totalSpend for non-admins', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { role: 'user' },
    });
    const res = await GET(new NextRequest('http://localhost:3000/api/clients'));
    expect(res.status).toBe(200);
    const body = await res.json();
    for (const c of body.clients) {
      expect(c).not.toHaveProperty('portalAccessCode');
      expect(c).not.toHaveProperty('notes');
      expect(c).not.toHaveProperty('totalSpend');
    }
  });
});