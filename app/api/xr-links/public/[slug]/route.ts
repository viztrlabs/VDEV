import { NextRequest, NextResponse } from 'next/server';
import { getXRLinksFromDB, getXRLinkBySlug, XRLinkRecord } from '@/lib/xr-links-store';

type PublicLink = Omit<
  XRLinkRecord,
  'accessPassword' | 'viewsCount' | 'uniqueVisitors' | 'avgEngagementSecs'
>;

function toPublic(link: XRLinkRecord): PublicLink {
  const { accessPassword, viewsCount, uniqueVisitors, avgEngagementSecs, ...rest } = link;
  return rest;
}

export async function GET(
  req: NextRequest,
  ctx: { params: { slug: string } }
): Promise<NextResponse> {
  const slug = ctx.params.slug;
  const links = await getXRLinksFromDB();
  const link = getXRLinkBySlug(slug, links);

  if (!link || link.status === 'draft' || link.status === 'processing') {
    return NextResponse.json(
      { success: false, error: !link ? 'Link not found' : 'Link not ready' },
      { status: 404 }
    );
  }

  if (link.status === 'expired') {
    return NextResponse.json({ success: true, xrLink: toPublic(link), expired: true });
  }

  if (link.status === 'revoked') {
    return NextResponse.json({ success: true, xrLink: toPublic(link), revoked: true });
  }

  return NextResponse.json({ success: true, xrLink: toPublic(link) });
}
