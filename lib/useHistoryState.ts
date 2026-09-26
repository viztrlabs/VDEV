'use client';
import { useCallback, useRef, useState } from 'react';
import { createHistory, pushHistory, undoHistory, redoHistory, type HistoryCore } from './memory/history';

export function useHistoryState<S>(initial: S): [
  S,
  (update: S | ((prev: S) => S)) => void,
  { undo(): void; redo(): void; canUndo: boolean; canRedo: boolean; reset(): void; setInitial(next: S): void },
] {
  const [state, setState] = useState<S>(initial);
  const core = useRef<HistoryCore<S>>(createHistory<S>());
  const [, tick] = useState(0);
  const bump = () => tick((t) => t + 1);

  const set = useCallback((update: S | ((prev: S) => S)) => {
    setState((prev) => {
      const next = typeof update === 'function' ? (update as (p: S) => S)(prev) : update;
      pushHistory(core.current, prev, next);
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setState((cur) => undoHistory(core.current, cur) ?? cur);
    bump();
  }, []);

  const redo = useCallback(() => {
    setState((cur) => redoHistory(core.current, cur) ?? cur);
    bump();
  }, []);

  const reset = useCallback(() => {
    core.current = createHistory<S>();
    bump();
  }, []);

  const setInitial = useCallback((next: S) => {
    core.current = createHistory<S>();
    setState(next);
    bump();
  }, []);

  return [state, set, { undo, redo, canUndo: core.current.past.length > 0, canRedo: core.current.future.length > 0, reset, setInitial }];
}