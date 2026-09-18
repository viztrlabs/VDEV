'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const ROUTE_LABELS: Record<string, string> = {
  '': 'Home',
  'about': 'About',
  'solutions': 'Solutions',
  'studio': 'Studio',
  'xr-world': 'XR World',
  'blog': 'Blog',
  'contact': 'Contact',
  'pricing': 'Pricing',
  'portfolio': 'Portfolio',
  'privacy-policy': 'Privacy Policy',
  'terms-conditions': 'Terms & Conditions',
  'client-access': 'Client Access',
  'track-project': 'Track Project',
  'book-consultation': 'Book Consultation',
  'app': 'App',
  'admin': 'Admin',
  'client-dashboard': 'Client Dashboard',
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
  ];

  let accumulatedPath = '';
  for (const segment of segments) {
    accumulatedPath += `/${segment}`;
    const label = ROUTE_LABELS[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    breadcrumbs.push({
      label,
      href: accumulatedPath,
    });
  }

  return (
    <nav className="flex items-center gap-1 text-xs font-mono text-[#71717A]">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="w-3 h-3 text-[#3f3f46]" />}
            {isLast || !crumb.href ? (
              <span className="text-[#A1A1AA] font-medium">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-[#3ECF8E] transition-colors flex items-center gap-1">
                {index === 0 && <Home className="w-3 h-3" />}
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
