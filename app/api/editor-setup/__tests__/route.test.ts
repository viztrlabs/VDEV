/**
 * @jest-environment node
 */
import { POST } from '@/app/api/editor-setup/route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';

jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: { rpc: jest.fn().mockResolvedValue({ error: { message: 'function exec_sql does not exist' } }) },
}));

describe('POST /api/editor-setup', () => {
  beforeEach(() => (getServerSession as jest.Mock).mockReset());

  it('returns 401 for unauthenticated callers', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const res = await POST(new NextRequest('http://localhost:3000/api/editor-setup', { method: 'POST' }));
    expect(res.status).toBe(401);
  });

  it('returns 503 with clear diagnostics when exec_sql RPC is unavailable', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { role: 'super_admin' } });
    const res = await POST(new NextRequest('http://localhost:3000/api/editor-setup', { method: 'POST' }));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toMatch(/exec_sql/i);
  });
});