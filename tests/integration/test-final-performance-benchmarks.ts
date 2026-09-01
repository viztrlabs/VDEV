import { SplatLoader } from '../../../lib/3d/splat/splat-loader';
import { SplatRenderer } from '../../../lib/3d/splat/splat-renderer';
import { SplatStreamingManager } from '../../../lib/3d/splat/splat-streaming-manager';

describe('Final Performance Benchmark Integration', () => {
  let splatLoader: SplatLoader;
  let splatRenderer: SplatRenderer;
  let streamingManager: SplatStreamingManager;

  beforeEach(() => {
    splatLoader = new SplatLoader();
    splatRenderer = new SplatRenderer();
    streamingManager = new SplatStreamingManager();
  });

  describe('✅ Memory Efficiency Integration', () {
    test('Memory Usage After Complete Integration', async () => {
      const initialMemory = getMemoryUsage();
      
      const splatData = await splatLoader.loadSplat('/test/splats/final-memory-test.splat');
      await splatRenderer.initializeRenderer();
      splatRenderer.updateSplatData(splatData);
      
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = getMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;
      
      expect(memoryIncrease).toBeLessThan(500 * 1024 * 1024);
    });
  });

  describe('✅ Rendering Performance Integration', () {
    test('120 FPS Target Achievement', async () => {
      const splatData = await splatLoader.loadSplat('/test/splats/final-120fps-test.splat');
      await splatRenderer.initializeRenderer();
      splatRenderer.updateSplatData(splatData);
      
      const frameTimes: number[] = [];
      
      for (let i = 0; i < 240; i++) {
        const frameStart = performance.now();
        splatRenderer.render();
        const frameEnd = performance.now();
        frameTimes.push(frameEnd - frameStart);
      }
      
      const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      const p95FrameTime = frameTimes.sort((a, b) => a - b)[Math.floor(frameTimes.length * 0.95)];
      
      expect(avgFrameTime).toBeLessThan(8.33); // 120fps target
      expect(p95FrameTime).toBeLessThan(16.67); // 60fps p95
    });
  });

  describe('✅ Streaming Performance Integration', () {
    test('Concurrent Streaming Performance', async () => {
      const requests = [
        streamingManager.createRequest('/test/splats/final-stream1.splat', { format: 'ply' }),
        streamingManager.createRequest('/test/splats/final-stream2.splat', { format: 'obj' }),
        streamingManager.createRequest('/test/splats/final-stream3.splat', { format: 'gltf' })
      ];
      
      const startTime = performance.now();
      const results = await Promise.all(
        requests.map(request => streamingManager.processFile(request))
      );
      const endTime = performance.now();
      
      const processingTime = endTime - startTime;
      expect(results).toHaveLength(3);
      expect(results.every(r => r !== null)).toBe(true);
      expect(processingTime).toBeLessThan(15000); // 15 seconds
    });
  });
});

// Helper function to get memory usage
function getMemoryUsage(): number {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const memory = (performance as any).memory;
    return memory.usedJSHeapSize || 0;
  }
  return 0;
}