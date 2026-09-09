/**
 * @jest-environment node
 */
import { POST } from '@/app/api/xr-links/route';
import { NextRequest } from 'next/server';

function makeRequest(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// NOTE: /api/xr-links POST is auth-gated via requireAuth. Under jest these
// handlers run without a session, so the POST returns 401. To test the
// URL-building logic in isolation, extract it into a pure helper in
// lib/xr-links-store.ts named `buildXRLinkRecord(params)` and assert on it
// here instead of on the route handler directly. See Step 2.

import { buildXRLinkRecord } from '@/lib/xr-links-store';

describe('buildXRLinkRecord shareUrl', () => {
  it('builds shareUrl against /xr-world/view/{slug} on the origin, never viztr.studio', () => {
    const rec = buildXRLinkRecord({
      name: 'My Tour',
      projectId: 'PRJ-1',
      slug: 'my-tour',
      origin: 'https://example.com',
    });
    expect(rec.shareUrl).toBe('https://example.com/xr-world/view/my-tour');
    expect(rec.shareUrl).not.toContain('viztr.studio');
  });

  it('falls back to generateSlug(name) when slug is absent', () => {
    const rec = buildXRLinkRecord({
      name: 'My Tour One',
      projectId: 'PRJ-2',
      origin: 'https://example.com',
    });
    expect(rec.slug).toBe('my-tour-one');
    expect(rec.shareUrl).toContain('/xr-world/view/my-tour-one');
  });

  it('qrCodeUrl encodes the shareUrl', () => {
    const rec = buildXRLinkRecord({
      name: 'T',
      projectId: 'P',
      slug: 't1',
      origin: 'https://example.com',
    });
    expect(rec.qrCodeUrl).toContain(encodeURIComponent(rec.shareUrl));
  });
});
