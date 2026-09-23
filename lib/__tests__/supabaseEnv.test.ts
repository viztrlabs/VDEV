import {
  trimEnvValue,
  isLikelyJwt,
  isUsableSupabaseEnv,
} from '@/lib/supabase/env';

describe('supabase env parsing', () => {
  it('strips surrounding double quotes from env values', () => {
    expect(trimEnvValue('"https://xyz.supabase.co"')).toBe('https://xyz.supabase.co');
  });

  it('strips BOM and whitespace', () => {
    expect(trimEnvValue('\uFEFF  https://xyz.supabase.co\t')).toBe('https://xyz.supabase.co');
  });

  it('returns empty for empty input', () => {
    expect(trimEnvValue('')).toBe('');
    expect(trimEnvValue('   ')).toBe('');
  });

  it('detects JWT-shaped service keys and rejects placeholders', () => {
    expect(isLikelyJwt('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.abc123')).toBe(true);
    expect(isLikelyJwt('placeholder')).toBe(false);
    expect(isLikelyJwt('')).toBe(false);
  });

  it('considers quoted-but-parseable url + jwt key usable', () => {
    expect(
      isUsableSupabaseEnv({ url: '"https://xyz.supabase.co"', serviceKey: 'a.b.c' }),
    ).toBe(true);
  });

  it('rejects malformed urls and placeholder keys', () => {
    expect(isUsableSupabaseEnv({ url: 'not a url', serviceKey: 'a.b.c' })).toBe(false);
    expect(isUsableSupabaseEnv({ url: 'https://xyz.supabase.co', serviceKey: '12345678901' })).toBe(false);
    expect(isUsableSupabaseEnv({ url: '', serviceKey: '' })).toBe(false);
  });
});