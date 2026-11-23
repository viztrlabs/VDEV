'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { type SiteMediaField, type SiteSection } from '@/lib/site-content';
import { useSiteContentDraftStore } from '@/lib/site-content-store';
import { useSectionInstance } from '@/components/site/SectionInstanceContext';
import MediaPickerModal from '@/components/admin/live-editor/MediaPickerModal';
import { useEditMode } from './EditModeContext';

export interface EditableMediaProps {
  fieldId: string;
  index?: number;
  mediaType: 'image' | 'video';
  children: React.ReactNode;
  className?: string;
}

function findSection(
  content: { pages: { id: string; sections: SiteSection[] }[] },
  pageId: string,
  sectionId: string | null,
): SiteSection | null {
  if (!sectionId) return null;
  return content.pages.find((page) => page.id === pageId)?.sections.find((s) => s.id === sectionId) ?? null;
}

function findMediaField(section: SiteSection | null, fieldId: string): SiteMediaField | null {
  if (!section) return null;
  return section.fields.find((field): field is SiteMediaField => field.kind === 'media' && field.id === fieldId) ?? null;
}

function isSingleElement(node: React.ReactNode): node is React.ReactElement {
  return React.isValidElement(node);
}

export default function EditableMedia({
  fieldId,
  index = 0,
  mediaType,
  children,
  className,
}: EditableMediaProps) {
  const instance = useSectionInstance();
  const { editMode } = useEditMode();
  const content = useSiteContentDraftStore((state) => state.content);
  const [pickerOpen, setPickerOpen] = useState(false);

  const pageId = instance?.pageId ?? 'home';
  const sectionId = instance?.sectionId ?? null;

  const section = useMemo(
    () => findSection(content, pageId, sectionId) ?? instance?.section ?? null,
    [content, instance?.section, pageId, sectionId],
  );
  const field = findMediaField(section, fieldId);
  const urls = field?.urls ?? [];
  const currentUrl = urls[index] ?? '';
  const isEmpty = currentUrl === '';

  const openPicker = useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setPickerOpen(true);
  }, []);

  const closePicker = useCallback(() => {
    setPickerOpen(false);
  }, []);

  const handlePick = useCallback(
    (url: string) => {
      setPickerOpen(false);
      if (!sectionId) return;
      const store = useSiteContentDraftStore.getState();
      const fresh = findMediaField(findSection(store.content, pageId, sectionId), fieldId);
      if (!fresh || fresh.urls.length === 0) {
        store.updateMediaField(pageId, sectionId, fieldId, { urls: [url] });
        return;
      }
      store.updateMediaUrl(pageId, sectionId, fieldId, index, url);
    },
    [fieldId, index, pageId, sectionId],
  );

  if (!editMode) {
    if (!isSingleElement(children)) return <>{children}</>;
    return React.cloneElement(children, { 'data-cms-field': fieldId } as Record<string, unknown>);
  }

  return (
    <>
      <div className={`relative${className ? ` ${className}` : ''}`} data-cms-field={fieldId}>
        {isEmpty ? (
          <button
            type="button"
            onClick={openPicker}
            className="flex min-h-[120px] w-full items-center justify-center rounded-lg border border-dashed border-white/30 bg-white/5 px-4 py-6 text-[11px] font-mono tracking-widest text-white/50 transition hover:border-[#dbfcff] hover:text-white/80"
          >
            Upload / Select Media
          </button>
        ) : (
          <>
            {children}
            <button
              type="button"
              onClick={openPicker}
              className="absolute right-2 top-2 z-20 rounded-full border border-white/20 bg-black/70 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur transition hover:border-[#dbfcff] hover:bg-[#dbfcff] hover:text-black"
            >
              Replace
            </button>
          </>
        )}
      </div>
      <MediaPickerModal open={pickerOpen} onClose={closePicker} filter={mediaType} onPick={handlePick} />
    </>
  );
}
