import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://viztr.io';

  const routes = [
    '',
    '/studio',
    '/studio/exterior',
    '/studio/interior',
    '/studio/walkthrough',
    '/xr-world',
    '/xr-world/webxr',
    '/xr-world/webar',
    '/xr-world/virtual-reality',
    '/xr-world/virtual-tour',
    '/xr-world/pixel-streaming',
    '/portfolio',
    '/about',
    '/blog',
    '/contact',
    '/book-consultation',
    '/client-access',
    '/track-project',
    '/privacy-policy',
    '/terms-conditions',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1.0 : route.startsWith('/studio') || route.startsWith('/xr-world') ? 0.9 : 0.8,
  }));
}
