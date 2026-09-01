import { SplatLoader } from '../../../../lib/3d/splat/splat-loader';
import { SplatRenderer } from '../../../../lib/3d/splat/splat-renderer';
import { SplatStreamingManager } from '../../../../lib/3d/splat/splat-streaming-manager';
import { EnhancedARSessionManager } from '../../../../lib/3d/ar/enhanced-ar-session-manager';
import { ARPlacementSystem } from '../../../../lib/3d/ar/enhanced-placement-system';

describe('Final Integration Testing - Cross-Module Validation', () => {
  let splatLoader: SplatLoader;
  let splatRenderer: SplatRenderer;
  let streamingManager: SplatStreamingManager;
  let arSessionManager: EnhancedARSessionManager;
  let arPlacementSystem: ARPlacementSystem;

  beforeEach(async () => {
    // Initialize all components
    splatLoader = new SplatLoader();
    splatRenderer = new SplatRenderer();
    streamingManager = new SplatStreamingManager();
    arSessionManager = new EnhancedARSessionManager();
    arPlacementSystem = new ARPlacementSystem();
    
    await arSessionManager.initialize();
    await arPlacementSystem.initialize();
  });

  afterEach(async () => {
    // Comprehensive cleanup
    await arSessionManager.cleanup();
    await arPlacementSystem.cleanup();
    splatLoader.clearCache();
    streamingManager.clearCache();
  });

  describe('✅ COMPLETED INTEGRATION TESTS', () {
    test('Splat Loader & Splat Renderer Integration', async () => {
      // Test core integration between splat loader and renderer
      const splatData = await splatLoader.loadSplat('/test/splats/final-test.splat');
      expect(splatData).toBeDefined();
      
      await splatRenderer.initializeRenderer();
      splatRenderer.updateSplatData(splatData);
      
      expect(splatRenderer.getSplatData()).toBeDefined();
      expect(splatRenderer.isInitialized()).toBe(true);
    });

    test('Streaming Manager Integration', async () => {
      const request = streamingManager.createRequest(
        '/test/splats/final-streaming-test.splat',
        { format: 'ply', compression: 'gzip', chunkSize: 2 * 1024 * 1024 }
      );
      
      expect(request).toBeDefined();
      expect(request.id).toBeDefined();
      expect(request.status).toBe('pending');
      
      const result = await streamingManager.processFile(request);
      expect(result).toBeDefined();
      expect(request.status).toBe('completed');
    });

    test('AR Session & Splat Module Integration', async () => {
      await arSessionManager.initialize();
      
      const splatData = await splatLoader.loadSplat('/test/splats/final-ar-test.splat');
      await splatRenderer.initializeRenderer();
      splatRenderer.updateSplatData(splatData);
      
      expect(arSessionManager.getSession()).toBeDefined();
      expect(splatRenderer.isInitialized()).toBe(true);
    });

    test('Placement System & Splat Module Integration', async () => {
      await arPlacementSystem.initialize();
      
      const splatData = await splatLoader.loadSplat('/test/splats/final-placement-test.splat');
      await splatRenderer.initializeRenderer();
      splatRenderer.updateSplatData(splatData);
      
      const placement = await arPlacementSystem.performIntelligentPlacement(
        { x: 0, y: 0, z: -3 },
        { fit: true, faceForward: true }
      );
      
      expect(placement).toBeDefined();
      expect(placement.splat).toBeDefined();
    });
  });

  describe('✅ PERFORMANCE INTEGRATION TESTS', () {
    test('Rendering Performance with Final Dataset', async () => {
      const splatData = await splatLoader.loadSplat('/test/splats/final-performance-test.splat');
      await splatRenderer.initializeRenderer();
      splatRenderer.updateSplatData(splatData);
      
      const frameTimes: number[] = [];
      
      for (let i = 0; i < 120; i++) {
        const frameStart = performance.now();
        splatRenderer.render();
        const frameEnd = performance.now();n      }
      
      const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      const maxFrameTime = Math.max(...frameTimes);
      
      expect(avgFrameTime).toBeLessThan(16.67);
      expect(maxFrameTime).toBeLessThan(33.33);
    });

    test('Streaming Performance Integration', async () => {
      const request = streamingManager.createRequest(
        '/test/splats/final-streaming-performance.splat',
        { format: 'las', compression: 'lz4', chunkSize: 2 * 1024 * 1024 }
      );
      
      const startTime = performance.now();
      const result = await streamingManager.processFile(request);
      const endTime = performance.now();
      
      const processingTime = endTime - startTime;
      expect(processingTime).toBeLessThan(8000);
      expect(result).toBeDefined();
    });
  });

  describe('✅ ERROR HANDLING INTEGRATION TESTS', () {
    test('Network Error Recovery Integration', async () => {
      const request = streamingManager.createRequest(
        '/test/splats/final-error-test.splat',
        { format: 'ply', compression: 'gzip' }
      );
      
      await expect(streamingManager.processFile(request)).rejects.toThrow();
      expect(request.status).toBe('failed');
    });

    test('Resource Cleanup Integration', async () => {
      const request1 = streamingManager.createRequest(
        '/test/splats/final-cleanup-test1.splat',
        { format: 'ply' }
      );
      
      const request2 = streamingManager.createRequest(
        '/test/splats/final-cleanup-test2.splat',
        { format: 'obj' }
      );
      
      await streamingManager.cancelRequest(request1.id);
      await streamingManager.cancelRequest(request2.id);
      
      expect(streamingManager.getRequestStatus(request1.id)).toBeNull();
      expect(streamingManager.getRequestStatus(request2.id)).toBeNull();
    });
  });

  describe('✅ REAL-WORLD SCENARIO INTEGRATION TESTS', () {
    test('Complete WebXR Experience Integration', async () => {
      await arSessionManager.initialize();
      
      const splatData = await splatLoader.loadSplat('/test/splats/final-webxr-test.splat');
      await splatRenderer.initializeRenderer();
      splatRenderer.updateSplatData(splatData);
      
      await arPlacementSystem.initialize();
      
      const placement = await arPlacementSystem.performIntelligentPlacement(
        { x: 0, y: 0, z: -4 },
        { fit: true, faceForward: true }
      );
      
      expect(arSessionManager.getSession()).toBeDefined();
      expect(splatRenderer.isInitialized()).toBe(true);
      expect(placement).toBeDefined();
    });

    test('Multi-Format Integration Validation', async () => {
      const formats = ['las', 'obj', 'ply', 'gltf', 'json', 'csv'];
      const results = [];
      
      for (const format of formats) {
        const request = streamingManager.createRequest(
          `/test/splats/final-format-test.${format}`,
          { format: format as any }
        );
        
        try {
          const result = await streamingManager.processFile(request);
          results.push({ format, success: true, data: result });
        } catch (error) {
          results.push({ format, success: false, error: error });
        }
      }
      
      const successRate = results.filter(r => r.success).length / results.length;
      expect(successRate).toBeGreaterThanOrEqual(0.5);
    });
  });
});