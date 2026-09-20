'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ViztrIntroOverlay from '@/components/landing/ViztrIntroOverlay';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const isEditor = pathname.startsWith('/editor/');
  const isDashboard = pathname.startsWith('/app/') || pathname.startsWith('/dashboard/');
  const isTourBuilder = pathname.startsWith('/xr-world/virtual-tour/tour-builder');
  const isTourEditor = pathname.startsWith('/xr-world/virtual-tour/editor');

  // Listen for client-side navigation between pages
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Ignore external, anchors, downloads, or new-tab clicks
      if (
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('//') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        target.getAttribute('target') === '_blank' ||
        target.getAttribute('download') ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      ) {
        return;
      }

      // Extract target path without query string or hash
      const targetPath = href.split('?')[0].split('#')[0];
      const currentPath = pathname.split('?')[0].split('#')[0];

      // Trigger loader without time limitation for inter-page navigation
      if (targetPath && targetPath !== currentPath) {
        setIsNavigating(true);
      }
    };

    document.addEventListener('click', handleAnchorClick, { capture: true });
    return () => document.removeEventListener('click', handleAnchorClick, { capture: true });
  }, [pathname]);

  // When pathname changes, navigation has completed – dismiss loader
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  // Hide header and footer for editor, dashboard, and tour editor layouts
  if (isEditor || isDashboard || isTourBuilder || isTourEditor) {
    return (
      <>
        {isNavigating && <ViztrIntroOverlay mode="loading" isLoading={isNavigating} />}
        {children}
      </>
    );
  }

  return (
    <>
      {isNavigating && <ViztrIntroOverlay mode="loading" isLoading={isNavigating} />}
      <Header />
      <div className="flex-1 flex flex-col">{children}</div>
      <Footer />
    </>
  );
}
