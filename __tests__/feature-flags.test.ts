import { isEnabled, featureFlags, getAllFlags } from '@/lib/feature-flags';

describe('Feature Flag System', () => {
  test('featureFlags has expected keys', () => {
    expect(featureFlags['nav-v2']).toBeDefined();
    expect(featureFlags['saas-app']).toBeDefined();
    expect(featureFlags['creator-v2']).toBeDefined();
  });

  test('isEnabled returns boolean', () => {
    expect(typeof isEnabled('nav-v2')).toBe('boolean');
    expect(typeof isEnabled('saas-app')).toBe('boolean');
  });

  test('isEnabled returns false for unknown flags', () => {
    expect(isEnabled('nonexistent-flag')).toBe(false);
  });

  test('getAllFlags returns all flags', () => {
    const flags = getAllFlags();
    expect(typeof flags).toBe('object');
    expect(flags['saas-app']).toBeDefined();
  });
});
