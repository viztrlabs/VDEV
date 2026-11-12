'use client';

import React, { Suspense } from 'react';
import ViztrIntroOverlay from '@/components/landing/ViztrIntroOverlay';
import SiteContentProvider from '@/components/site/SiteContentProvider';
import HomeSectionRenderer from '@/components/site/HomeSectionRenderer';

export default function HomePage() {
  return (
    <main id="viztr-homepage" className="flex-1 w-full overflow-hidden">
      <ViztrIntroOverlay />
      <Suspense fallback={null}>
        <SiteContentProvider>
          <HomeSectionRenderer />
        </SiteContentProvider>
      </Suspense>
    </main>
  );
}
