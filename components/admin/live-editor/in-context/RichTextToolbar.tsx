'use client';

import React, { useCallback, useEffect, useState } from 'react';

export type RichTextCommand = 'bold' | 'italic' | 'link' | 'clear';

export interface RichTextToolbarProps {
  onCommand: (command: RichTextCommand, value?: string) => void;
}

interface ToolbarPosition {
  top: number;
  left: number;
}

const TOOLBAR_WIDTH = 196;
const TOOLBAR_MARGIN = 8;
const EDITABLE_SELECTOR = '[data-cms-rich="true"][contenteditable="true"]';

function runExecCommand(command: string, value?: string): void {
  if (typeof document === 'undefined') return;
  const exec = document.execCommand;
  if (typeof exec !== 'function') return;
  try {
    exec.call(document, command, false, value);
  } catch {
    void 0;
  }
}

function findEditableHost(node: Node | null): HTMLElement | null {
  if (!node) return null;
  const element = node.nodeType === 1 ? (node as HTMLElement) : node.parentElement;
  if (!element) return null;
  return element.closest<HTMLElement>(EDITABLE_SELECTOR);
}

function computePosition(): ToolbarPosition | null {
  if (typeof window === 'undefined') return null;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;

  let range: Range;
  try {
    range = selection.getRangeAt(0);
  } catch {
    return null;
  }

  if (!findEditableHost(range.commonAncestorContainer)) return null;

  const getRect = range.getBoundingClientRect;
  if (typeof getRect !== 'function') return null;

  let rect: DOMRect;
  try {
    rect = getRect.call(range);
  } catch {
    return null;
  }

  if (!rect) return null;
  if (rect.width === 0 && rect.height === 0 && rect.top === 0 && rect.left === 0) return null;

  const viewportWidth = typeof window.innerWidth === 'number' ? window.innerWidth : 0;
  const left = Math.max(TOOLBAR_MARGIN, Math.min(rect.left, viewportWidth - TOOLBAR_WIDTH - TOOLBAR_MARGIN));
  const top = rect.bottom + TOOLBAR_MARGIN;

  return { top, left };
}

export default function RichTextToolbar({ onCommand }: RichTextToolbarProps) {
  const [position, setPosition] = useState<ToolbarPosition | null>(null);

  const sync = useCallback(() => {
    setPosition(computePosition());
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.addEventListener('selectionchange', sync);
    return () => {
      document.removeEventListener('selectionchange', sync);
    };
  }, [sync]);

  const handleBold = useCallback(() => {
    runExecCommand('bold');
    onCommand('bold');
    sync();
  }, [onCommand, sync]);

  const handleItalic = useCallback(() => {
    runExecCommand('italic');
    onCommand('italic');
    sync();
  }, [onCommand, sync]);

  const handleClear = useCallback(() => {
    runExecCommand('removeFormat');
    onCommand('clear');
    sync();
  }, [onCommand, sync]);

  const handleLink = useCallback(() => {
    if (typeof window === 'undefined' || typeof window.prompt !== 'function') return;
    let url: string | null = null;
    try {
      url = window.prompt('Link URL', 'https://');
    } catch {
      return;
    }
    if (!url) return;
    const trimmed = url.trim();
    if (!trimmed) return;
    runExecCommand('createLink', trimmed);
    onCommand('link', trimmed);
    sync();
  }, [onCommand, sync]);

  if (!position) return null;

  return (
    <div
      role="toolbar"
      aria-label="Rich text formatting"
      style={{ position: 'fixed', top: position.top, left: position.left, zIndex: 60 }}
      className="flex items-center gap-1 rounded-lg border border-[#353436] bg-[#131314] px-1.5 py-1 shadow-xl"
    >
      <button
        type="button"
        aria-label="Bold"
        onMouseDown={(event) => event.preventDefault()}
        onClick={handleBold}
        className="rounded px-2 py-1 text-xs font-bold text-zinc-200 hover:bg-[#353436] hover:text-white"
      >
        B
      </button>
      <button
        type="button"
        aria-label="Italic"
        onMouseDown={(event) => event.preventDefault()}
        onClick={handleItalic}
        className="rounded px-2 py-1 text-xs italic text-zinc-200 hover:bg-[#353436] hover:text-white"
      >
        I
      </button>
      <button
        type="button"
        aria-label="Link"
        onMouseDown={(event) => event.preventDefault()}
        onClick={handleLink}
        className="rounded px-2 py-1 text-xs text-zinc-200 hover:bg-[#353436] hover:text-white"
      >
        Link
      </button>
      <button
        type="button"
        aria-label="Clear formatting"
        onMouseDown={(event) => event.preventDefault()}
        onClick={handleClear}
        className="rounded px-2 py-1 text-xs text-zinc-400 hover:bg-[#353436] hover:text-white"
      >
        Clear
      </button>
    </div>
  );
}
