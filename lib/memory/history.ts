export interface HistoryCore<S> { past: S[]; future: S[]; }

export function createHistory<S>(): HistoryCore<S> {
  return { past: [], future: [] };
}

export function pushHistory<S>(core: HistoryCore<S>, current: S, next: S, cap = 60): void {
  if (current === next) return;
  core.past.push(current);
  if (core.past.length > cap) core.past.shift();
  core.future = [];
}

export function undoHistory<S>(core: HistoryCore<S>, current: S): S | undefined {
  const prev = core.past.pop();
  if (prev === undefined) return undefined;
  core.future.push(current);
  return prev;
}

export function redoHistory<S>(core: HistoryCore<S>, current: S): S | undefined {
  const next = core.future.pop();
  if (next === undefined) return undefined;
  core.past.push(current);
  return next;
}