import { planReconstruction, estimateBudget, detectPreset, QUALITY_PRESETS } from '../hooks/splatProcessing';

describe('splatProcessing', () => {
  it('rejects image captures with too few frames', () => {
    const res = planReconstruction({
      id: 'c1',
      kind: 'images',
      count: 5,
      sizeBytes: 50 * 1024 * 1024,
    });
    expect('error' in res).toBe(true);
  });

  it('plans a valid reconstruction job', () => {
    const res = planReconstruction({
      id: 'c2',
      kind: 'images',
      count: 40,
      sizeBytes: 200 * 1024 * 1024,
    });
    expect('error' in res).toBe(false);
    if (!('error' in res)) {
      expect(res.status).toBe('queued');
      expect(res.outputFormat).toBe('splat');
    }
  });

  it('estimates a budget with a warning for large scenes', () => {
    const budget = estimateBudget({
      id: 'c3',
      kind: 'video',
      sizeBytes: 2 * 1024 * 1024 * 1024,
    });
    expect(budget.estSplats).toBeGreaterThan(0);
    expect(budget.estMinutes).toBeGreaterThanOrEqual(1);
  });

  it('selects a mobile preset for mobile devices', () => {
    const preset = detectPreset({ isMobile: true });
    expect(preset.id).toBe('low');
  });

  it('exposes three quality presets', () => {
    expect(QUALITY_PRESETS.length).toBe(3);
  });
});
