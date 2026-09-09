/**
 * @jest-environment node
 */
import { POST } from '@/app/api/forms/[type]/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/leadsStore', () => ({
  isLeadType: (v: unknown) =>
    ['contact', 'booking', 'demo', 'inquiry', 'newsletter', 'portfolio-enquiry'].includes(v as string),
  saveLead: jest.fn().mockResolvedValue({
    id: 'lead_1',
    type: 'contact',
    payload: {},
    receivedAt: '2026-09-10T00:00:00.000Z',
  }),
}));

function makePost(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/forms/[type]', () => {
  it('persists a contact lead', async () => {
    const res = await POST(
      makePost('http://localhost:3000/api/forms/contact', { name: 'Ada', email: 'ada@x.dev' }),
      { params: Promise.resolve({ type: 'contact' }) } as any
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.id).toBe('lead_1');
  });

  it('rejects invalid types', async () => {
    const res = await POST(
      makePost('http://localhost:3000/api/forms/bogus', { name: 'Ada' }),
      { params: Promise.resolve({ type: 'bogus' }) } as any
    );
    expect(res.status).toBe(400);
  });
});