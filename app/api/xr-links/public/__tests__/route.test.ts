/**
 * @jest-environment node
 */
import { GET } from '@/app/api/xr-links/public/[slug]/route';
import { NextRequest } from 'next/server';
import { XR_LINKS_DB, buildXRLinkRecord } from '@/lib/xr-links-store';

function makeRequest(url: string): NextRequest {
  return new NextRequest(url);
}

async function getRes(slug: string): Promise<Response> {
  return GET(makeRequest(`http://localhost:3000/api/xr-links/public/${slug}`), {
    params: { slug },
  } as any);
}

describe('GET /api/xr-links/public/[slug]', () => {
  it('resolves an active seeded slug and omits accessPassword and analytics', async () => {
    const res = await getRes('glass-pavilion-v1');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.xrLink.slug).toBe('glass-pavilion-v1');
    expect(data.xrLink).not.toHaveProperty('accessPassword');
    expect(data.xrLink).not.toHaveProperty('viewsCount');
  });

  it('returns 404 for an unknown slug', async () => {
    const res = await getRes('does-not-exist');
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.success).toBe(false);
  });
});

describe('GET /api/xr-links/public/[slug] status branches', () => {
  const injectedIds: string[] = [];

  beforeAll(() => {
    const cases: Array<{ slug: string; status: 'expired' | 'revoked' | 'draft' | 'processing' }> = [
      { slug: 'test-expired', status: 'expired' },
      { slug: 'test-revoked', status: 'revoked' },
      { slug: 'test-draft', status: 'draft' },
      { slug: 'test-processing', status: 'processing' },
    ];
    for (const c of cases) {
      const record = { ...buildXRLinkRecord({ name: c.slug, projectId: 'PRJ-VTR-TEST' }), slug: c.slug, status: c.status };
      injectedIds.push(record.id);
      XR_LINKS_DB.push(record);
    }
  });

  afterAll(() => {
    for (const id of injectedIds) {
      const idx = XR_LINKS_DB.findIndex((l) => l.id === id);
      if (idx !== -1) XR_LINKS_DB.splice(idx, 1);
    }
  });

  it('returns 200 with expired:true for an expired link', async () => {
    const res = await getRes('test-expired');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.expired).toBe(true);
  });

  it('returns 200 with revoked:true for a revoked link', async () => {
    const res = await getRes('test-revoked');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.revoked).toBe(true);
  });

  it('returns 404 with error "Link not ready" for a draft link', async () => {
    const res = await getRes('test-draft');
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Link not ready');
  });

  it('returns 404 with error "Link not ready" for a processing link', async () => {
    const res = await getRes('test-processing');
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Link not ready');
  });
});

describe('GET /api/xr-links/public/[slug] — Next 15 params shape', () => {
  it('resolves a slug when params is a Promise (Next 15 runtime shape)', async () => {
    const res = await GET(
      makeRequest('http://localhost:3000/api/xr-links/public/glass-pavilion-v1'),
      { params: Promise.resolve({ slug: 'glass-pavilion-v1' }) } as any
    );
    expect(res.status).toBe(200);
  });
});
