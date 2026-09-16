import { NextRequest, NextResponse } from 'next/server';
import { blogPosts } from '@/data/pages';

const BASE_URL = 'https://viztr.com';

const staticPages = [
  { url: '/', priority: 1.0, changeFrequency: 'daily' },
  { url: '/about', priority: 0.8, changeFrequency: 'monthly' },
  { url: '/solutions', priority: 0.8, changeFrequency: 'weekly' },
  { url: '/solutions/architects', priority: 0.7, changeFrequency: 'monthly' },
  { url: '/solutions/real-estate', priority: 0.7, changeFrequency: 'monthly' },
  { url: '/solutions/developers', priority: 0.7, changeFrequency: 'monthly' },
  { url: '/solutions/interior-designers', priority: 0.7, changeFrequency: 'monthly' },
  { url: '/solutions/agencies', priority: 0.7, changeFrequency: 'monthly' },
  { url: '/studio', priority: 0.8, changeFrequency: 'weekly' },
  { url: '/studio/exterior', priority: 0.7, changeFrequency: 'monthly' },
  { url: '/studio/interior', priority: 0.7, changeFrequency: 'monthly' },
  { url: '/studio/walkthrough', priority: 0.7, changeFrequency: 'monthly' },
  { url: '/xr-world', priority: 0.8, changeFrequency: 'weekly' },
  { url: '/xr-world/webxr', priority: 0.7, changeFrequency: 'monthly' },
  { url: '/xr-world/webar', priority: 0.7, changeFrequency: 'monthly' },
  { url: '/xr-world/virtual-reality', priority: 0.7, changeFrequency: 'monthly' },
  { url: '/xr-world/virtual-tour', priority: 0.7, changeFrequency: 'monthly' },
  { url: '/xr-world/pixel-streaming', priority: 0.7, changeFrequency: 'monthly' },
  { url: '/xr-world/link-generator', priority: 0.6, changeFrequency: 'monthly' },
  { url: '/xr-world/showcase', priority: 0.6, changeFrequency: 'weekly' },
  { url: '/blog', priority: 0.8, changeFrequency: 'weekly' },
  { url: '/contact', priority: 0.7, changeFrequency: 'monthly' },
  { url: '/book-consultation', priority: 0.7, changeFrequency: 'monthly' },
  { url: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly' },
  { url: '/terms-conditions', priority: 0.3, changeFrequency: 'yearly' },
  { url: '/client-access', priority: 0.5, changeFrequency: 'monthly' },
  { url: '/track-project', priority: 0.5, changeFrequency: 'monthly' },
];

export async function GET() {
  const urls: string[] = [];

  for (const page of staticPages) {
    urls.push(`  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <priority>${page.priority}</priority>
    <changefreq>${page.changeFrequency}</changefreq>
  </url>`);
  }

  for (const post of blogPosts) {
    urls.push(`  <url>
    <loc>${BASE_URL}/blog/${post.slug}</loc>
    <priority>0.6</priority>
    <changefreq>monthly</changefreq>
    <lastmod>${new Date(post.date).toISOString()}</lastmod>
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
