'use client';

import React from 'react';
import Head from 'next/head';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  type?: 'website' | 'article' | 'service';
  schema?: Record<string, any>;
}

export default function SEOHead({
  title = 'VizTR | Architecture Visualization Studio & XR World Platform',
  description = 'High-end photorealistic 8K architectural visualization, cinematic walkthroughs, WebXR, WebAR, 360° virtual tours, and Unreal Engine Pixel Streaming.',
  keywords = ['architectural visualization', 'CGI rendering', 'WebXR', 'Pixel Streaming', 'Unreal Engine 5', 'virtual tour 360', 'real estate rendering'],
  ogImage = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  canonicalUrl = 'https://viztr.io',
  type = 'website',
  schema,
}: SEOHeadProps) {
  const defaultSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'VizTR Architectural Visualization & XR Labs',
    image: ogImage,
    url: canonicalUrl,
    telephone: '+1 (800) 849-8799',
    priceRange: '$$$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '100 Bishopsgate, Level 24',
      addressLocality: 'London',
      postalCode: 'EC2N 4AG',
      addressCountry: 'GB',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '20:00',
      },
    ],
    sameAs: [
      'https://www.linkedin.com/company/viztr',
      'https://www.instagram.com/viztr.studios',
      'https://twitter.com/viztr_xr',
    ],
  };

  const activeSchema = schema || defaultSchema;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(activeSchema) }}
      />
    </>
  );
}
