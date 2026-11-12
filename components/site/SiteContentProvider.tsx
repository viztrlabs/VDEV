'use client';

import React, { createContext, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  useSiteContentStore,
  useSiteContentDraftStore,
  SITE_CONTENT_STORAGE_KEYS,
} from '@/lib/site-content-store';

export type SiteContentMode = 'published' | 'draft';

export const SiteContentModeContext = createContext<SiteContentMode>('published');

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const mode: SiteContentMode = searchParams?.get('cms-preview') === '1' ? 'draft' : 'published';

  useEffect(() => {
    const key = mode === 'draft' ? SITE_CONTENT_STORAGE_KEYS.draft : SITE_CONTENT_STORAGE_KEYS.published;
    const store = mode === 'draft' ? useSiteContentDraftStore : useSiteContentStore;
    const handler = (event: StorageEvent) => {
      if (event.key === key) {
        store.persist.rehydrate();
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [mode]);

  const value = useMemo(() => mode, [mode]);
  return <SiteContentModeContext.Provider value={value}>{children}</SiteContentModeContext.Provider>;
}

export default SiteContentProvider;
