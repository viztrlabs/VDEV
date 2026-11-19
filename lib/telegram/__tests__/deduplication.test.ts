import { checkAndMarkProcessed, cleanup, getTrackedCount, isProcessed, clear } from '@/lib/telegram/deduplication';

describe('Update Deduplication', () => {
  beforeEach(() => {
    clear();
  });

  afterAll(() => {
    clear();
  });

  test('first call returns true (new)', () => {
    expect(checkAndMarkProcessed(1)).toBe(true);
  });

  test('second call with same ID returns false (duplicate)', () => {
    checkAndMarkProcessed(2);
    expect(checkAndMarkProcessed(2)).toBe(false);
  });

  test('different IDs are independent', () => {
    expect(checkAndMarkProcessed(3)).toBe(true);
    expect(checkAndMarkProcessed(4)).toBe(true);
    expect(checkAndMarkProcessed(3)).toBe(false);
  });

  test('isProcessed returns false for unknown ID', () => {
    expect(isProcessed(999)).toBe(false);
  });

  test('isProcessed returns true for tracked ID', () => {
    checkAndMarkProcessed(5);
    expect(isProcessed(5)).toBe(true);
  });

  test('getTrackedCount returns correct count', () => {
    expect(getTrackedCount()).toBe(0);
    checkAndMarkProcessed(10);
    checkAndMarkProcessed(11);
    expect(getTrackedCount()).toBe(2);
    checkAndMarkProcessed(10); // duplicate, shouldn't increase count
    expect(getTrackedCount()).toBe(2);
  });

  test('cleanup removes expired entries', () => {
    // We can't easily test TTL without waiting, but we can verify cleanup runs
    checkAndMarkProcessed(20);
    expect(getTrackedCount()).toBe(1);
    cleanup();
    expect(getTrackedCount()).toBe(1); // Not expired yet
  });

  test('clear removes all entries', () => {
    checkAndMarkProcessed(30);
    checkAndMarkProcessed(31);
    expect(getTrackedCount()).toBe(2);
    clear();
    expect(getTrackedCount()).toBe(0);
  });
});