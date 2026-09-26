import { dedupeMediaAssets } from '@/lib/mediaLibrary';

describe('dedupeMediaAssets', () => {
  it('keeps the first occurrence and drops duplicate URLs', () => {
    const assets = [
      { name: 'a.jpg', url: 'https://x/a.jpg' },
      { name: 'a-copy.jpg', url: 'https://x/a.jpg' },
      { name: 'b.jpg', url: 'https://x/b.jpg' },
    ];
    expect(dedupeMediaAssets(assets)).toEqual([
      { name: 'a.jpg', url: 'https://x/a.jpg' },
      { name: 'b.jpg', url: 'https://x/b.jpg' },
    ]);
  });

  it('preserves order of first occurrences', () => {
    const assets = [
      { name: 'z.jpg', url: 'https://x/z.jpg' },
      { name: 'a.jpg', url: 'https://x/a.jpg' },
      { name: 'z2.jpg', url: 'https://x/z.jpg' },
    ];
    expect(dedupeMediaAssets(assets).map((a) => a.name)).toEqual(['z.jpg', 'a.jpg']);
  });

  it('skips entries without a url', () => {
    const assets = [
      { name: 'ok.jpg', url: 'https://x/ok.jpg' },
      { name: 'no-url.jpg', url: '' },
      { name: 'no-asset', url: undefined } as any,
    ];
    expect(dedupeMediaAssets(assets)).toEqual([{ name: 'ok.jpg', url: 'https://x/ok.jpg' }]);
  });

  it('returns an empty array for empty input', () => {
    expect(dedupeMediaAssets([])).toEqual([]);
  });
});