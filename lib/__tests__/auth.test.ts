import { ClientRecord } from '@/app/api/clients/route';
import { authenticateUser, getDemoAuthUser } from '@/lib/auth';

jest.mock('@/lib/supabase', () => {
  const mock = { auth: { signInWithPassword: jest.fn() } };
  return { isSupabaseConfigured: true, supabase: mock };
});

describe('lib/auth.ts — ClientAuthLookup type contract', () => {
  it('exposes required fields for client authentication', () => {
    const sample: ClientRecord & { portalAccessCode: string } = {
      id: 'cli_test',
      name: 'Test Client',
      firmName: 'Test Studio',
      email: 'test@studio.com',
      phone: '+1 555 555 5555',
      tier: 'Standard Studio',
      activeProjects: 1,
      totalSpend: '$0',
      status: 'Active',
      portalAccessCode: 'TST-2025-VTR',
      assignedDirector: 'Test Director',
      joinedDate: '2025-01-01',
      notes: '',
    };
    expect(sample.portalAccessCode).toBe('TST-2025-VTR');
    expect(sample.email).toBe('test@studio.com');
  });
});

describe('Demo auth contract (lib/auth.ts)', () => {
  it('accepts the documented admin credentials and rejects incorrect passwords', () => {
    expect(getDemoAuthUser('admin@viztr.com', 'password123')).toMatchObject({
      email: 'admin@viztr.com',
      role: 'super_admin',
    });

    expect(getDemoAuthUser('manager@viztr.com', 'password123')).toMatchObject({
      email: 'manager@viztr.com',
      role: 'admin',
    });

    expect(getDemoAuthUser('admin@viztr.com', 'wrong-password')).toBeNull();
  });

  it('rejects admin demo credentials in production', () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    expect(getDemoAuthUser('admin@viztr.com', 'password123')).toBeNull();
    expect(getDemoAuthUser('manager@viztr.com', 'password123')).toBeNull();
    process.env.NODE_ENV = prev;
  });

  it('still allows demo accounts in non-production', () => {
    expect(getDemoAuthUser('admin@viztr.com', 'password123')).toMatchObject({
      role: 'super_admin',
    });
  });
});

describe('UserSession extension (lib/store.ts)', () => {
  it('supports optional clientId, accessCode, clientFirm, assignedDirector fields', async () => {
    const { useAppStore } = await import('@/lib/store');
    useAppStore.getState().setUser({
      id: 'cli_test',
      name: 'Test Client',
      email: 'test@studio.com',
      role: 'CLIENT',
      clientId: 'cli_test',
      accessCode: 'TST-2025-VTR',
      clientFirm: 'Test Studio',
      assignedDirector: 'Test Director',
    });
    const u = useAppStore.getState().user;
    expect(u?.clientId).toBe('cli_test');
    expect(u?.accessCode).toBe('TST-2025-VTR');
    expect(u?.clientFirm).toBe('Test Studio');
    expect(u?.assignedDirector).toBe('Test Director');
    useAppStore.getState().logout();
  });
});

describe('authenticateUser — Supabase-first validation', () => {
  const supabaseMock = (require('@/lib/supabase') as any).supabase;
  const originalFetch = global.fetch;

  beforeEach(() => {
    (supabaseMock.auth.signInWithPassword as jest.Mock).mockReset();
    // Deterministic /api/clients directory response for the client-path tests.
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        clients: [
          {
            id: 'cli_test_1',
            name: 'Test Client',
            firmName: 'Test Studio',
            email: 'client@test.com',
            portalAccessCode: 'FST-2025-VTR',
            assignedDirector: 'Alex',
            status: 'Active',
          },
        ],
      }),
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns the Supabase user with role normalized from user_metadata', async () => {
    (supabaseMock.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: {
        user: {
          id: 'usr_supabase_1',
          email: 'real@user.com',
          user_metadata: { full_name: 'Real User', role: 'owner' },
        },
      },
      error: null,
    });

    const user = await authenticateUser({ email: 'real@user.com', password: 'pw123' });
    expect(user).toMatchObject({
      id: 'usr_supabase_1',
      email: 'real@user.com',
      name: 'Real User',
      role: 'user', // owner -> 'user' via normalizeUserRole
    });
    expect(supabaseMock.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'real@user.com',
      password: 'pw123',
    });
  });

  it('falls through to demo when Supabase rejects the credentials', async () => {
    (supabaseMock.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    });

    const user = await authenticateUser({ email: 'admin@viztr.com', password: 'password123' });
    expect(user).toMatchObject({ email: 'admin@viztr.com', role: 'super_admin' });
  });

  it('falls through to client lookup when Supabase says the user is unconfirmed/unknown', async () => {
    (supabaseMock.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: 'Email not confirmed' },
    });

    // client@test.com is NOT a demo account, so reaching the resolved client
    // record proves Supabase failure did not short-circuit the chain AND that
    // the /api/clients directory path resolves for it.
    const user = await authenticateUser({ email: 'client@test.com', password: 'password123' });
    expect(user).not.toBeNull();
    expect(user).toMatchObject({
      email: 'client@test.com',
      role: 'client',
      clientId: 'cli_test_1',
      accessCode: 'FST-2025-VTR',
      assignedDirector: 'Alex',
      clientFirm: 'Test Studio',
    });
  });

  it('does not call Supabase for access-code-only logins', async () => {
    const user = await authenticateUser({ accessCode: 'FST-2025-VTR', password: 'pw' });
    expect(supabaseMock.auth.signInWithPassword).not.toHaveBeenCalled();
    expect(user).toMatchObject({ role: 'client' });
  });

  it('returns null when every path fails', async () => {
    (supabaseMock.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    });

    // Empty directory so the client-lookup path also fails for the unmatched
    // email (the beforeEach stub would otherwise fall through to clients[0]).
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ clients: [] }),
    }) as unknown as typeof fetch;

    const user = await authenticateUser({ email: 'nobody@example.com', password: 'wrongpw' });
    expect(user).toBeNull();
  });

  it('falls back to user email when Supabase metadata has no full_name', async () => {
    (supabaseMock.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: {
        user: {
          id: 'usr_no_name',
          email: 'noname@user.com',
          user_metadata: { role: 'owner' },
        },
      },
      error: null,
    });

    const user = await authenticateUser({ email: 'noname@user.com', password: 'pw123' });
    expect(user).toMatchObject({
      id: 'usr_no_name',
      email: 'noname@user.com',
      name: 'noname@user.com',
      role: 'user',
    });
  });

  it('normalizes role to user when Supabase metadata has no role', async () => {
    (supabaseMock.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: {
        user: {
          id: 'usr_no_role',
          email: 'norole@user.com',
          user_metadata: { full_name: 'No Role User' },
        },
      },
      error: null,
    });

    const user = await authenticateUser({ email: 'norole@user.com', password: 'pw123' });
    expect(user).toMatchObject({
      id: 'usr_no_role',
      email: 'norole@user.com',
      name: 'No Role User',
      role: 'user',
    });
  });

  it('survives a thrown Supabase error and falls through to demo user', async () => {
    (supabaseMock.auth.signInWithPassword as jest.Mock).mockRejectedValue(
      new Error('Supabase is down'),
    );

    const user = await authenticateUser({ email: 'admin@viztr.com', password: 'password123' });
    expect(user).toMatchObject({ email: 'admin@viztr.com', role: 'super_admin' });
  });
});
