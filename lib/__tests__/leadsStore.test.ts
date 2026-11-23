import { saveLead, listLeads } from '@/lib/leadsStore';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

jest.mock('@/lib/supabase-admin', () => ({ getSupabaseAdmin: jest.fn() }));

const insert = jest.fn();
const select = jest.fn();
const order = jest.fn();

function mockClient() {
  // Chain used by saveLead: from().insert().select().single()
  insert.mockReturnValue({ select: jest.fn(() => ({ single: jest.fn().mockResolvedValue({ data: null }) })) });
  // Chain used by listLeads: from().select().order()
  select.mockReturnValue({ order });
  order.mockResolvedValue({ data: [] });
  (getSupabaseAdmin as jest.Mock).mockReturnValue({
    from: jest.fn(() => ({ insert, select })),
  });
}

describe('lib/leadsStore.ts (Supabase-backed)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient();
  });

  it('saves a lead and returns it with id + timestamp', async () => {
    const lead = await saveLead('contact', { name: 'Ada', email: 'ada@x.dev' });
    expect(lead.id).toMatch(/^lead_/);
    expect(lead.type).toBe('contact');
    expect(lead.payload.name).toBe('Ada');
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      service: 'contact',
      name: 'Ada',
      contact: 'ada@x.dev',
      metadata: { name: 'Ada', email: 'ada@x.dev' },
    }));
  });

  it('lists leads from the leads table, defaulting to [] when empty', async () => {
    expect(await listLeads()).toEqual([]);
    expect(order).toHaveBeenCalled();
  });
});
