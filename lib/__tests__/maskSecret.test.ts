import { maskSecret } from '@/lib/utils';

describe('maskSecret (server-safe utility)', () => {
  it('returns empty string for no value', () => {
    expect(maskSecret('')).toBe('');
  });

  it('fully masks short values', () => {
    expect(maskSecret('abc')).toBe('••••');
  });

  it('shows only the last four characters of a secret', () => {
    expect(maskSecret('1234567890')).toBe('••••7890');
  });
});
