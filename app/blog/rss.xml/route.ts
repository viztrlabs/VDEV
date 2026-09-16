import { NextRequest, NextResponse } from 'next/server';
import { blogPosts } from '@/data/pages';

const BASE_URL = 'https://viztr.com';

export async function GET() {
  const items = blogPosts
    .slice(0, 50)
    .map(
      (post) => `<item>
    <title>${escapeXml(post.title)}</title>
    <link>${BASE_URL}/blog/${post.slug}</link>
    <guid>${BASE_URL}/blog/${post.slug}</guid>
    <description>${escapeXml(post.excerpt)}</description>
    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    <author>${escapeXml(post.author)}</author>
    <category>${escapeXml(post.category)}</category>
  </item>`
    )
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>VizTR Studio — Perspectives &amp; Research</title>
    <link>${BASE_URL}/blog</link>
    <description>High-density architectural rendering, real-time WebXR spatial computing, and scalable cloud Unreal Engine 5 pixel streaming.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/rss+xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
