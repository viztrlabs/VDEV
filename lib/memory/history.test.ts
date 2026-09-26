import { createHistory, pushHistory, undoHistory, redoHistory, type HistoryCore } from './history';

describe('history core', () => {
  it('pushes current onto past and clears future', () => {
    const h: HistoryCore<string> = createHistory<string>();
    pushHistory(h, 'a', 'b');
    pushHistory(h, 'b', 'c');
    expect(h.past).toEqual(['a', 'b']);
    expect(h.future).toEqual([]);
  });

  it('ignores no-op pushes (same reference/value)', () => {
    const h: HistoryCore<string> = createHistory<string>();
    pushHistory(h, 'a', 'a');
    expect(h.past).toEqual([]);
  });

  it('caps past at the limit', () => {
    const h: HistoryCore<number> = createHistory<number>();
    for (let i = 0; i < 70; i++) pushHistory(h, i, i + 1, 60);
    expect(h.past).toHaveLength(60);
    expect(h.past[0]).toBe(10);
  });

  it('undo moves current to future and returns previous', () => {
    const h: HistoryCore<string> = createHistory<string>();
    pushHistory(h, 'a', 'b');
    expect(undoHistory(h, 'b')).toBe('a');
    expect(h.future).toEqual(['b']);
    expect(h.past).toEqual([]);
  });

  it('redo restores the future state', () => {
    const h: HistoryCore<string> = createHistory<string>();
    pushHistory(h, 'a', 'b');
    undoHistory(h, 'b');
    expect(redoHistory(h, 'a')).toBe('b');
    expect(h.future).toEqual([]);
    expect(h.past).toEqual(['a']);
  });

  it('returns undefined when nothing to undo/redo', () => {
    const h: HistoryCore<string> = createHistory<string>();
    expect(undoHistory(h, 'a')).toBeUndefined();
    expect(redoHistory(h, 'a')).toBeUndefined();
  });
});