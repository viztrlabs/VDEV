/**
 * @jest-environment node
 */
import { GET } from '@/app/api/projects/client/route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

// This endpoint is auth-gated (admin/client roles). Mock the session so the
// tests exercise the filtering logic instead of Next's request-scope headers().
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
// Keep the demo fallback deterministic regardless of local env vars.
jest.mock('@/lib/supabase/repositories', () => ({
  isSupabaseAdminReady: jest.fn(() => false),
  listProjectsSupabase: jest.fn(async () => null),
}));

function makeRequest(url: string): NextRequest {
  return new NextRequest(url);
}

describe('GET /api/projects/client', () => {
  beforeEach(() => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { role: 'admin', email: 'admin@viztr.in' } });
  });

  it('returns full list of managed projects when no filters are applied', async () => {
    const res = await GET(makeRequest('http://localhost:3000/api/projects/client'));
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.projects)).toBe(true);
    expect(data.projects.length).toBeGreaterThan(0);
  });

  it('filters by clientEmail', async () => {
    const res = await GET(
      makeRequest(
        'http://localhost:3000/api/projects/client?clientEmail=e.rostova@fosterpartners.com'
      )
    );
    const data = await res.json();
    expect(data.success).toBe(true);
    if (data.projects.length > 0) {
      data.projects.forEach((p: any) => {
        expect(p.clientEmail.toLowerCase()).toBe('e.rostova@fosterpartners.com');
      });
    }
  });

  it('returns empty list for non-existent clientId', async () => {
    const res = await GET(
      makeRequest('http://localhost:3000/api/projects/client?clientId=cli_nonexistent')
    );
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.projects.length).toBe(0);
  });
});
