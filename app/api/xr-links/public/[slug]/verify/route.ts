import { NextRequest, NextResponse } from 'next/server';
import { getXRLinksFromDB, getXRLinkBySlug } from '@/lib/xr-links-store';

export async function POST(
  req: NextRequest,
  ctx: { params: { slug: string } }
): Promise<NextResponse> {
  const slug = ctx.params.slug;
  const links = await getXRLinksFromDB();
  const link = getXRLinkBySlug(slug, links);

  if (!link) {
    return NextResponse.json({ success: false, error: 'Link not found' }, { status: 404 });
  }

  if (!link.passwordProtected || !link.accessPassword) {
    return NextResponse.json(
      { success: false, error: 'This link has no password' },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const submitted = typeof body?.password === 'string' ? body.password : '';

  const a = Buffer.from(submitted);
  const b = Buffer.from(link.accessPassword);
  const same = a.length === b.length && a.equals(b);

  if (!same) {
    return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
