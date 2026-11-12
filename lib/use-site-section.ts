import { useContext, useMemo } from 'react';
import { SiteSection, buildDefaultSiteContent } from '@/lib/site-content';
import {
  useSiteContentStore,
  useSiteContentDraftStore,
} from '@/lib/site-content-store';
import { SiteContentModeContext } from '@/components/site/SiteContentProvider';

export function useSiteSection(pageId: string, sectionId: string): SiteSection | null {
  const mode = useContext(SiteContentModeContext);
  const publishedContent = useSiteContentStore((s) => s.content);
  const draftContent = useSiteContentDraftStore((s) => s.content);
  const content = mode === 'draft' ? draftContent : publishedContent;

  return useMemo(() => {
    const defaults = buildDefaultSiteContent();
    const storedPage = content.pages.find((p) => p.id === pageId);
    const stored = storedPage?.sections.find((s) => s.id === sectionId);
    if (!stored) {
      return defaults.pages.find((p) => p.id === pageId)?.sections.find((s) => s.id === sectionId) ?? null;
    }
    if (!stored.isVisible) return null;
    const defaultSection = defaults.pages
      .find((p) => p.id === pageId)
      ?.sections.find((s) => s.id === sectionId);
    if (!defaultSection) return stored;
    const defaultFields = defaultSection.fields.filter(
      (df) => !stored.fields.some((sf) => sf.id === df.id),
    );
    return { ...stored, fields: [...stored.fields, ...defaultFields] };
  }, [content, pageId, sectionId]);
}
