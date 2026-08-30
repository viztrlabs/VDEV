import { AnalyticsEngine } from '../analytics/analyticsEngine';

describe('AnalyticsEngine', () => {
  it('tracks events into the queue', () => {
    const engine = new AnalyticsEngine();
    engine.track('scene.view', { sceneId: 's1' });
    engine.track('xr.session.start');
    // flush should not throw without a transport
    expect(() => engine.flush()).not.toThrow();
    engine.dispose();
  });

  it('recommends lowering quality on low fps', () => {
    const engine = new AnalyticsEngine();
    for (let i = 0; i < 10; i++) {
      engine.recordPerf({ fps: 18, drawCalls: 100, triangles: 2_000_000, memoryMB: 512, frameMs: 55, timestamp: Date.now() });
    }
    const recs = engine.getRecommendations();
    expect(recs.some((r) => r.id === 'rec-lowfps')).toBe(true);
    engine.dispose();
  });

  it('reports healthy when perf is fine', () => {
    const engine = new AnalyticsEngine();
    for (let i = 0; i < 10; i++) {
      engine.recordPerf({ fps: 60, drawCalls: 50, triangles: 500_000, memoryMB: 256, frameMs: 16, timestamp: Date.now() });
    }
    const recs = engine.getRecommendations();
    expect(recs.some((r) => r.id === 'rec-healthy')).toBe(true);
    engine.dispose();
  });
});
