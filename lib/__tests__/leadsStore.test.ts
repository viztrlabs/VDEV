import { saveLead, listLeads } from '@/lib/leadsStore';

jest.mock('node:fs', () => {
  const actual = jest.requireActual('node:fs') as typeof import('node:fs');
  return {
    ...actual,
    promises: {
      readFile: jest.fn(),
      mkdir: jest.fn().mockResolvedValue(undefined),
      writeFile: jest.fn().mockResolvedValue(undefined),
    },
  };
});

import { promises as fs } from 'node:fs';

describe('lib/leadsStore.ts', () => {
  beforeEach(() => {
    (fs.readFile as jest.Mock).mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    (fs.writeFile as jest.Mock).mockClear();
  });

  it('saves a lead and returns it with id + timestamp', async () => {
    const lead = await saveLead('contact', { name: 'Ada', email: 'ada@x.dev' });
    expect(lead.id).toMatch(/^lead_/);
    expect(lead.type).toBe('contact');
    expect(lead.payload.name).toBe('Ada');
    expect(fs.writeFile).toHaveBeenCalled();
  });

  it('lists leads from file, defaulting to [] when missing', async () => {
    const leads = await listLeads();
    expect(Array.isArray(leads)).toBe(true);
  });
});