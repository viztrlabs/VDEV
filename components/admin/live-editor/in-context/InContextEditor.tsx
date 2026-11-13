'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import HomeSectionRenderer from '@/components/site/HomeSectionRenderer';
import { SiteContentModeContext } from '@/components/site/SiteContentProvider';
import { useIsDraftDirty } from '@/lib/site-content-store';
import { EditModeProvider, useEditMode } from './EditModeContext';
import EditorToolbar from './EditorToolbar';
import SectionOverlayLayer from './SectionOverlayLayer';
import SectionDrawer from './SectionDrawer';

function InContextShell({ onExit }: { onExit: () => void }) {
  const { editMode } = useEditMode();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClickCapture = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!editMode) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a');
      if (!anchor) return;
      if (containerRef.current && !containerRef.current.contains(anchor)) return;
      event.preventDefault();
    },
    [editMode],
  );

  return (
    <div className="flex h-screen w-full flex-col bg-[#09090B] text-[#FAFAFA]">
      <EditorToolbar onExit={onExit} />
      <div
        ref={containerRef}
        onClickCapture={handleClickCapture}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        data-testid="in-context-canvas"
      >
        <SiteContentModeContext.Provider value="draft">
          <HomeSectionRenderer />
        </SiteContentModeContext.Provider>
      </div>
      <SectionOverlayLayer containerRef={containerRef} />
      <SectionDrawer />
    </div>
  );
}

export default function InContextEditor({ onExit }: { onExit: () => void }) {
  const dirty = useIsDraftDirty();

  useEffect(() => {
    if (!dirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  return (
    <EditModeProvider>
      <InContextShell onExit={onExit} />
    </EditModeProvider>
  );
}
