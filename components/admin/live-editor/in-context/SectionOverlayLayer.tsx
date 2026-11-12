'use client';

import React, { useEffect, useState } from 'react';
import { useSiteContentDraftStore } from '@/lib/site-content-store';
import { useEditMode } from './EditModeContext';
import { useSectionRect } from './use-section-rect';

const PAGE_ID = 'home';
const DELETE_CONFIRM_MS = 3000;

export interface SectionOverlayLayerProps {
  containerRef: React.RefObject<HTMLElement | null>;
}

interface OverlayTarget {
  id: string;
  rect: DOMRect;
}

function sectionElement(container: HTMLElement | null, sectionId: string | null): HTMLElement | null {
  if (!container || !sectionId) return null;
  const escaped = sectionId.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const found = container.querySelector<HTMLElement>(`[data-cms-section-id="${escaped}"]`);
  if (!found || !container.contains(found)) return null;
  return found;
}

function ActionButton({
  label,
  disabled,
  tone,
  onClick,
}: {
  label: string;
  disabled: boolean;
  tone?: 'accent' | 'danger';
  onClick: () => void;
}) {
  const toneClass =
    tone === 'danger'
      ? 'text-red-300 hover:bg-red-500/20'
      : tone === 'accent'
        ? 'text-[color:var(--accent)] hover:bg-white/10'
        : 'text-white/80 hover:bg-white/10';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded px-2 py-1 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${toneClass}`}
    >
      {label}
    </button>
  );
}

export default function SectionOverlayLayer({ containerRef }: SectionOverlayLayerProps) {
  const { editMode, hoveredSectionId, hoverSection, selectedSectionId, selectSection } = useEditMode();
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [pendingDelete, setPendingDelete] = useState(false);

  useEffect(() => {
    setContainer(containerRef.current);
  });

  useEffect(() => {
    setPendingDelete(false);
  }, [selectedSectionId]);

  useEffect(() => {
    if (!pendingDelete) return;
    const timer = window.setTimeout(() => setPendingDelete(false), DELETE_CONFIRM_MS);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPendingDelete(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pendingDelete]);

  useEffect(() => {
    if (!container) return;

    const idFrom = (target: EventTarget | null): string | null => {
      if (!(target instanceof Element)) return null;
      const section = target.closest('[data-cms-section-id]');
      if (!(section instanceof HTMLElement) || !container.contains(section)) return null;
      return section.getAttribute('data-cms-section-id');
    };

    const handleOver = (event: Event) => {
      hoverSection(idFrom(event.target));
    };

    const handleOut = (event: Event) => {
      const related = (event as PointerEvent).relatedTarget ?? null;
      const next = idFrom(related);
      if (next === idFrom(event.target)) return;
      hoverSection(next);
    };

    const handleLeave = () => {
      hoverSection(null);
    };

    container.addEventListener('pointerover', handleOver);
    container.addEventListener('pointerout', handleOut);
    container.addEventListener('pointerleave', handleLeave);

    return () => {
      container.removeEventListener('pointerover', handleOver);
      container.removeEventListener('pointerout', handleOut);
      container.removeEventListener('pointerleave', handleLeave);
    };
  }, [container, hoverSection]);

  const hoverElement = sectionElement(container, hoveredSectionId);
  const selectedElement = sectionElement(container, selectedSectionId);
  const hoverRect = useSectionRect(hoverElement);
  const selectedRect = useSectionRect(selectedElement);

  if (!editMode) return null;

  const outlineTarget: OverlayTarget | null =
    hoveredSectionId && hoverRect
      ? { id: hoveredSectionId, rect: hoverRect }
      : selectedSectionId && selectedRect
        ? { id: selectedSectionId, rect: selectedRect }
        : null;

  const barTarget: OverlayTarget | null =
    selectedSectionId && selectedRect
      ? { id: selectedSectionId, rect: selectedRect }
      : hoveredSectionId && hoverRect
        ? { id: hoveredSectionId, rect: hoverRect }
        : null;

  const activeId = selectedSectionId;

  const inspect = () => {
    if (!activeId) return;
    selectSection(activeId);
  };

  const duplicate = () => {
    if (!activeId) return;
    useSiteContentDraftStore.getState().duplicateSection(PAGE_ID, activeId);
  };

  const move = (direction: 'up' | 'down') => {
    if (!activeId) return;
    useSiteContentDraftStore.getState().moveSection(PAGE_ID, activeId, direction);
  };

  const toggle = () => {
    if (!activeId) return;
    useSiteContentDraftStore.getState().toggleSection(PAGE_ID, activeId);
  };

  const remove = () => {
    if (!activeId) return;
    if (!pendingDelete) {
      setPendingDelete(true);
      return;
    }
    useSiteContentDraftStore.getState().deleteSection(PAGE_ID, activeId);
    setPendingDelete(false);
    selectSection(null);
  };

  return (
    <>
      {outlineTarget ? (
        <div
          aria-hidden="true"
          data-testid="section-outline"
          data-cms-outline-section-id={outlineTarget.id}
          className="pointer-events-none fixed z-[60] rounded"
          style={{
            top: outlineTarget.rect.top,
            left: outlineTarget.rect.left,
            width: outlineTarget.rect.width,
            height: outlineTarget.rect.height,
            border: '2px solid var(--accent)',
          }}
        />
      ) : null}

      {barTarget ? (
        <div
          data-testid="section-action-bar"
          data-cms-action-bar-for={barTarget.id}
          role="toolbar"
          aria-label="Section actions"
          className="pointer-events-auto fixed z-[61] flex items-center gap-1 rounded-md border border-white/15 bg-black/85 p-1 font-mono text-[10px] uppercase tracking-widest text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)] backdrop-blur"
          style={{
            top: barTarget.rect.top,
            left: barTarget.rect.right,
            transform: 'translate(-100%, calc(-100% - 6px))',
          }}
        >
          <ActionButton label="Inspect" disabled={!activeId} tone="accent" onClick={inspect} />
          <ActionButton label="Duplicate" disabled={!activeId} onClick={duplicate} />
          <ActionButton label="Move Up" disabled={!activeId} onClick={() => move('up')} />
          <ActionButton label="Move Down" disabled={!activeId} onClick={() => move('down')} />
          <ActionButton label="Hide" disabled={!activeId} onClick={toggle} />
          <ActionButton
            label={pendingDelete ? 'Confirm delete' : 'Delete'}
            disabled={!activeId}
            tone="danger"
            onClick={remove}
          />
        </div>
      ) : null}
    </>
  );
}
