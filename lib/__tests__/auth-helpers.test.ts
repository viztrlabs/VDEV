import { requireClientRole, requireAdminRole, requireUnderAdminSession } from '@/lib/auth-helpers';
import { getServerSession } from 'next-auth/next';

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));

function sessionFor(role: string) {
  (getServerSession as jest.Mock).mockResolvedValue({
    user: { id: 'u1', email: 'a@b.c', name: 'A', role },
  });
}

describe('lib/auth-helpers.ts — lowercase role convention', () => {
  beforeEach(() => (getServerSession as jest.Mock).mockReset());

  it('requireClientRole passes for a lowercase client', async () => {
    sessionFor('client');
    const user = await requireClientRole();
    expect(user.role).toBe('client');
  });

  it('requireAdminRole passes for a lowercase super_admin', async () => {
    sessionFor('super_admin');
    const user = await requireAdminRole();
    expect(user.role).toBe('super_admin');
  });

  it('requireAdminRole rejects a lowercase user', async () => {
    sessionFor('user');
    await expect(requireAdminRole()).rejects.toThrow('FORBIDDEN');
  });

  it('requireUnderAdminSession passes for a lowercase admin', async () => {
    sessionFor('admin');
    const user = await requireUnderAdminSession();
    expect(user.role).toBe('admin');
  });
});