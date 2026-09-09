/**
 * @jest-environment node
 */
import { GET } from '@/app/api/xr-links/public/[slug]/route';
import { NextRequest } from 'next/server';

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
