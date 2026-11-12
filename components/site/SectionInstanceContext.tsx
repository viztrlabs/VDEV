'use client';

import React, { createContext, useContext } from 'react';
import type { SiteSection } from '@/lib/site-content';

export interface SectionInstance {
  pageId: string;
  sectionId: string;
  section: SiteSection;
}

export const SectionInstanceContext = createContext<SectionInstance | null>(null);

export function SectionInstanceProvider({
  pageId,
  section,
  children,
}: {
  pageId: string;
  section: SiteSection;
  children: React.ReactNode;
}) {
  return (
    <SectionInstanceContext.Provider value={{ pageId, sectionId: section.id, section }}>
      {children}
    </SectionInstanceContext.Provider>
  );
}

export function useSectionInstance(): SectionInstance | null {
  return useContext(SectionInstanceContext);
}
