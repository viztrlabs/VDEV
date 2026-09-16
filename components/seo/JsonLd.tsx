import type { Metadata } from 'next';

export interface OrganizationSchema {
  name: string;
  url: string;
  logo: string;
  description: string;
  email?: string;
  phone?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  socialLinks?: string[];
}

export function OrganizationJsonLd(data: OrganizationSchema) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: data.url,
    logo: data.logo,
    description: data.description,
    email: data.email,
    telephone: data.phone,
    address: data.address,
    sameAs: data.socialLinks,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export interface ServiceSchema {
  name: string;
  description: string;
  provider: string;
  serviceType: string;
  url: string;
  image?: string;
  priceRange?: string;
  areaServed?: string;
}

export function ServiceJsonLd(data: ServiceSchema) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: data.name,
    description: data.description,
    provider: {
      '@type': 'Organization',
      name: data.provider,
    },
    serviceType: data.serviceType,
    url: data.url,
    image: data.image,
    priceRange: data.priceRange,
    areaServed: data.areaServed,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export interface BlogPostingSchema {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  authorUrl?: string;
  publisher: string;
  publisherLogo: string;
  category?: string;
  tags?: string[];
}

export function BlogPostingJsonLd(data: BlogPostingSchema) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.title,
    description: data.description,
    url: data.url,
    image: data.image,
    datePublished: data.datePublished,
    dateModified: data.dateModified || data.datePublished,
    author: {
      '@type': 'Person',
      name: data.author,
      url: data.authorUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: data.publisher,
      logo: {
        '@type': 'ImageObject',
        url: data.publisherLogo,
      },
    },
    keywords: data.tags?.join(', '),
    articleSection: data.category,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export interface ProjectSchema {
  name: string;
  description: string;
  url: string;
  image: string;
  dateCreated: string;
  dateModified?: string;
  client: string;
  serviceType: string;
  status?: string;
}

export function ProjectJsonLd(data: ProjectSchema) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: data.name,
    description: data.description,
    url: data.url,
    image: data.image,
    dateCreated: data.dateCreated,
    dateModified: data.dateModified || data.dateCreated,
    client: {
      '@type': 'Organization',
      name: data.client,
    },
    serviceType: data.serviceType,
    status: data.status,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebSiteJsonLd(options: { name: string; url: string; searchUrl?: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: options.name,
    url: options.url,
    ...(options.searchUrl && {
      potentialAction: {
        '@type': 'SearchAction',
        target: options.searchUrl,
        'query-input': 'required name=search_term_string',
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  path?: string;
  noIndex?: boolean;
  openGraph?: Partial<{
    title: string;
    description: string;
    image: string;
    url: string;
    type: 'website' | 'article' | 'profile';
  }>;
  twitter?: Partial<{
    card: 'summary' | 'summary_large_image' | 'app' | 'player';
    title: string;
    description: string;
    image: string;
    site: string;
  }>;
}

export function generateMetadata(meta: PageMetadata, baseUrl: string = 'https://viztr.com'): Metadata {
  const url = meta.path ? `${baseUrl}${meta.path}` : baseUrl;
  const image = meta.image || `${baseUrl}/og-default.jpg`;
  const title = meta.title;
  const description = meta.description;

  return {
    title,
    description,
    keywords: meta.keywords?.join(', '),
    robots: meta.noIndex ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      title: meta.openGraph?.title || title,
      description: meta.openGraph?.description || description,
      url: meta.openGraph?.url || url,
      siteName: 'VizTR Studio',
      images: [{ url: meta.openGraph?.image || image }],
      type: meta.openGraph?.type || 'website',
    },
    twitter: {
      card: meta.twitter?.card || 'summary_large_image',
      title: meta.twitter?.title || title,
      description: meta.twitter?.description || description,
      images: [meta.twitter?.image || image],
      site: meta.twitter?.site || '@viztr',
    },
    alternates: {
      canonical: url,
    },
  };
}
