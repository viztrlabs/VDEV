'use client';

import { useRef, useCallback, useEffect } from 'react';

export type SyncDirection = 'panorama-to-splat' | 'splat-to-panorama' | 'bidirectional' | 'off';

/**
 * RAF-throttled synchronization between two engine views.
 * Supports one-directional or bidirectional camera sync modes.
 *
 * Initial implementation defaults to 'off' — the user explicitly
 * enables sync direction in the alignment panel.
 */
export function useAlignmentSync(enabled: boolean, direction: SyncDirection = 'off') {
  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef<((dt: number) => void) | null>(null);

  const scheduleUpdate = useCallback(
    (update: (dt: number) => void) => {
      if (!enabled || direction === 'off') return;
      pendingRef.current = update;
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame((time) => {
          rafRef.current = null;
          if (pendingRef.current) {
            pendingRef.current(time);
            pendingRef.current = null;
          }
        });
      }
    },
    [enabled, direction],
  );

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return { scheduleUpdate, direction };
}
