import { useMemo } from 'react';
import {
  SectionType,
  SiteSection,
  getDefaultSection,
} from '@/lib/site-content';
import { useSiteContentStore } from '@/lib/site-content-store';
import { useSectionInstance } from '@/components/site/SectionInstanceContext';

export function useSiteSection(type: SectionType): SiteSection | null {
  const instance = useSectionInstance();
  const content = useSiteContentStore((s) => s.content);

  return useMemo(() => {
    if (instance) return instance.section;
    for (const page of content.pages) {
      const stored = page.sections.find((s) => s.type === type);
      if (stored) return stored;
    }
    return getDefaultSection(type);
  }, [instance, content, type]);
}
