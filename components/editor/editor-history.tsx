'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

type HistoryEntry = {
  data: any[];
  timestamp: number;
};

type UseEditorHistoryOptions = {
  maxEntries?: number;
  storageKey?: string;
};

export function useEditorHistory<T>(initialData: T[], options: UseEditorHistoryOptions = {}) {
  const maxEntries = options.maxEntries ?? 50;
  const storageKey = options.storageKey;

  const [history, setHistory] = useState<HistoryEntry[]>([
    { data: initialData as any[], timestamp: Date.now() },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [data, setData] = useState<T>(initialData);
  const isUndoRedoRef = useRef(false);

  const persist = useCallback(
    (entry: HistoryEntry) => {
      if (storageKey && typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(entry));
        } catch {
          // ignore storage errors
        }
      }
    },
    [storageKey],
  );

  const loadPersisted = useCallback((): HistoryEntry | null => {
    if (!storageKey || typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw) as HistoryEntry;
    } catch {
      return null;
    }
  }, [storageKey]);

  useEffect(() => {
    const persisted = loadPersisted();
    if (persisted && Array.isArray(persisted.data)) {
      setHistory([persisted]);
      setCurrentIndex(0);
      setData(persisted.data as T);
    }
  }, [loadPersisted]);

  const pushState = useCallback(
    (next: T) => {
      setData(next);
      if (isUndoRedoRef.current) {
        isUndoRedoRef.current = false;
        setHistory((prev) => {
          const sliced = prev.slice(0, currentIndex + 1);
          const entry = { data: next as any[], timestamp: Date.now() };
          persist(entry);
          return [...sliced, entry].slice(-maxEntries);
        });
        setCurrentIndex((prev) => Math.min(prev + 1, maxEntries - 1));
        return;
      }

      setHistory((prev) => {
        const sliced = prev.slice(0, currentIndex + 1);
        const entry = { data: next as any[], timestamp: Date.now() };
        persist(entry);
        return [...sliced, entry].slice(-maxEntries);
      });
      setCurrentIndex((prev) => Math.min(prev + 1, maxEntries - 1));
    },
    [currentIndex, maxEntries, persist],
  );

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (currentIndex <= 0) return prev;
      const nextIndex = currentIndex - 1;
      isUndoRedoRef.current = true;
      setCurrentIndex(nextIndex);
      setData(prev[nextIndex].data as T);
      return prev;
    });
  }, [currentIndex]);

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (currentIndex >= prev.length - 1) return prev;
      const nextIndex = currentIndex + 1;
      isUndoRedoRef.current = true;
      setCurrentIndex(nextIndex);
      setData(prev[nextIndex].data as T);
      return prev;
    });
  }, [currentIndex]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    data,
    setData: pushState,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}

type KeyboardShortcut = {
  key: string;
  ctrlOrMeta?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  preventDefault?: boolean;
};

type KeyboardShortcutsOptions = {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
};

export function useKeyboardShortcuts({ shortcuts, enabled = true }: KeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlOrMeta = shortcut.ctrlOrMeta ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shift = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const alt = shortcut.alt ? event.altKey : !event.altKey;

        if (
          ctrlOrMeta &&
          shift &&
          alt &&
          event.key.toLowerCase() === shortcut.key.toLowerCase()
        ) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enabled, shortcuts]);
}
