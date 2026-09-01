import { ClientRecord } from '@/app/api/clients/route';
import { getDemoAuthUser } from '@/lib/auth';

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
      role: 'SUPER_ADMIN',
    });

    expect(getDemoAuthUser('manager@viztr.com', 'password123')).toMatchObject({
      email: 'manager@viztr.com',
      role: 'ADMIN',
    });

    expect(getDemoAuthUser('admin@viztr.com', 'wrong-password')).toBeNull();
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
