import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { middleware } from '@/middleware';

// Mock next-auth/jwt
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

// Mock rate-limit
jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: jest.fn(() => ({ allowed: true, resetTime: Date.now() + 60000 })),
}));

const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;

function createMockRequest(pathname: string, search = '', role?: string) {
  const baseUrl = 'http://localhost:3000';
  const url = new URL(`${baseUrl}${pathname}${search}`);
  const request = {
    nextUrl: url,
    url: url.toString(),
    headers: {
      get: jest.fn((name: string) => {
        if (name === 'x-forwarded-for') return '127.0.0.1';
        return null;
      }),
    },
    cookies: {
      get: jest.fn(),
    },
  } as unknown as NextRequest;
  
  if (role) {
    mockGetToken.mockResolvedValue({ role, id: 'test-id', email: 'test@example.com' });
  } else {
    mockGetToken.mockResolvedValue(null);
  }
  
  return request;
}

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('/admin/* routes', () => {
    test('redirects to login when no token', async () => {
      const req = createMockRequest('/admin/dashboard');
      const res = await middleware(req);
      
      expect(res).toBeInstanceOf(NextResponse);
      expect(res.headers.get('location')).toContain('/login');
    });

    test('allows super_admin', async () => {
      const req = createMockRequest('/admin/dashboard', '', 'super_admin');
      const res = await middleware(req);
      
      expect(res).toBeInstanceOf(NextResponse);
      // Should pass through (no redirect)
      expect(res.headers.get('location')).toBeNull();
    });

    test('allows admin', async () => {
      const req = createMockRequest('/admin/dashboard', '', 'admin');
      const res = await middleware(req);
      
      expect(res).toBeInstanceOf(NextResponse);
      expect(res.headers.get('location')).toBeNull();
    });

    test('denies user role', async () => {
      const req = createMockRequest('/admin/dashboard', '', 'user');
      const res = await middleware(req);
      
      expect(res).toBeInstanceOf(NextResponse);
      expect(res.headers.get('location')).toContain('/app/user');
    });

    test('denies client role', async () => {
      const req = createMockRequest('/admin/dashboard', '', 'client');
      const res = await middleware(req);
      
      expect(res).toBeInstanceOf(NextResponse);
      expect(res.headers.get('location')).toContain('/app/client');
    });

    test('allows /admin path (redirect handled by next.config.ts)', async () => {
      const req = createMockRequest('/admin', '', 'super_admin');
      const res = await middleware(req);
      
      expect(res).toBeInstanceOf(NextResponse);
      // Middleware passes through; redirect is handled by next.config.ts redirects()
      expect(res.headers.get('location')).toBeNull();
    });
  });

  describe('/app/* routes (SaaS dashboards)', () => {
    test('redirects unauthenticated to /login', async () => {
      const req = createMockRequest('/app/super-admin');
      const res = await middleware(req);
      
      expect(res).toBeInstanceOf(NextResponse);
      expect(res.headers.get('location')).toContain('/login');
    });

    test('allows super_admin to /app/super-admin', async () => {
      const req = createMockRequest('/app/super-admin', '', 'super_admin');
      const res = await middleware(req);
      
      expect(res).toBeInstanceOf(NextResponse);
      expect(res.headers.get('location')).toBeNull();
    });

    test('denies admin from /app/super-admin', async () => {
      const req = createMockRequest('/app/super-admin', '', 'admin');
      const res = await middleware(req);
      
      expect(res).toBeInstanceOf(NextResponse);
      expect(res.headers.get('location')).toContain('/app/admin');
    });

    test('allows admin to /app/admin', async () => {
      const req = createMockRequest('/app/admin', '', 'admin');
      const res = await middleware(req);
      
      expect(res).toBeInstanceOf(NextResponse);
      expect(res.headers.get('location')).toBeNull();
    });

    test('redirects /app/dashboard to role-specific dashboard', async () => {
      const req = createMockRequest('/app/dashboard', '', 'super_admin');
      const res = await middleware(req);
      
      expect(res).toBeInstanceOf(NextResponse);
      expect(res.headers.get('location')).toContain('/app/super-admin');
    });

    test('allows client to /app/client', async () => {
      const req = createMockRequest('/app/client', '', 'client');
      const res = await middleware(req);
      
      expect(res).toBeInstanceOf(NextResponse);
      expect(res.headers.get('location')).toBeNull();
    });

    test('allows user to /app/user/projects', async () => {
      const req = createMockRequest('/app/user/projects', '', 'user');
      const res = await middleware(req);
      
      expect(res).toBeInstanceOf(NextResponse);
      expect(res.headers.get('location')).toBeNull();
    });
  });

  describe('/client-dashboard route', () => {
    test('redirects to /client-access when no token', async () => {
      const req = createMockRequest('/client-dashboard');
      const res = await middleware(req);
      
      expect(res).toBeInstanceOf(NextResponse);
      expect(res.headers.get('location')).toContain('/client-access');
    });

    test('allows client role', async () => {
      const req = createMockRequest('/client-dashboard', '', 'client');
      const res = await middleware(req);
      
      expect(res).toBeInstanceOf(NextResponse);
      expect(res.headers.get('location')).toBeNull();
    });

    test('allows super_admin', async () => {
      const req = createMockRequest('/client-dashboard', '', 'super_admin');
      const res = await middleware(req);
      
      expect(res).toBeInstanceOf(NextResponse);
      expect(res.headers.get('location')).toBeNull();
    });

    test('allows admin', async () => {
      const req = createMockRequest('/client-dashboard', '', 'admin');
      const res = await middleware(req);
      
      expect(res).toBeInstanceOf(NextResponse);
      expect(res.headers.get('location')).toBeNull();
    });

    test('denies user role', async () => {
      const req = createMockRequest('/client-dashboard', '', 'user');
      const res = await middleware(req);
      
      expect(res).toBeInstanceOf(NextResponse);
      expect(res.headers.get('location')).toContain('/app/user');
    });
  });

  describe('Rate limiting', () => {
    test('applies rate limit to /api routes', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limit');
      (checkRateLimit as jest.Mock).mockReturnValueOnce({ 
        allowed: false, 
        resetTime: Date.now() + 60000 
      });
      
      const req = createMockRequest('/api/test', '', 'super_admin');
      const res = await middleware(req);
      
      expect(res.status).toBe(429);
      expect(res.headers.get('Retry-After')).toBeDefined();
    });
  });

  describe('Role normalization', () => {
    test('normalizes SUPER_ADMIN to super_admin', async () => {
      const req = createMockRequest('/admin/dashboard', '', 'SUPER_ADMIN');
      const res = await middleware(req);
      
      expect(res.headers.get('location')).toBeNull();
    });

    test('normalizes ADMIN to admin', async () => {
      const req = createMockRequest('/admin/dashboard', '', 'ADMIN');
      const res = await middleware(req);
      
      expect(res.headers.get('location')).toBeNull();
    });

    test('normalizes SuperAdmin to super_admin', async () => {
      const req = createMockRequest('/admin/dashboard', '', 'SuperAdmin');
      const res = await middleware(req);
      
      expect(res.headers.get('location')).toBeNull();
    });
  });
});