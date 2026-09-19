/**
 * Gaussian Splat / PlayCanvas WebGPU Engine Adapter
 *
 * Connects the SuperSplat WebGPU editor engine to the unified EngineBridge.
 * Translates camera poses, selection, splat transforms, and telemetry.
 */

import {
  EngineAdapter,
  EngineCommand,
  EngineEvent,
  EngineInitOptions,
  EngineType,
  SceneSnapshot,
  TelemetryMetrics,
  SpatialAlignment,
  AlignmentMarker,
} from '../types';

export class SplatEngineAdapter implements EngineAdapter {
  public readonly engineType: EngineType = 'playcanvas';
  public isInitialized = false;

  private container: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private splatEvents: any = null;
  private splatUpdateHandler: (() => void) | null = null;
  private eventHandlers: Set<(event: EngineEvent) => void> = new Set();
  private splatCount = 250000;
  private currentFps = 60;

  public async init(options: EngineInitOptions): Promise<void> {
    if (this.isInitialized) return;
    this.container = options.container;

    // Check WebGPU availability
    const hasWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator;

    try {
      if (hasWebGPU && process.env.NODE_ENV === 'production') {
        const editorModule = await import('@/splat-editor/main');
        await editorModule.main();
        const scene = (window as any).scene;
        this.splatEvents = scene?.events || null;
        if (this.splatEvents && scene?.camera) {
          let lastCameraEmit = 0;
          this.splatUpdateHandler = () => {
            const now = performance.now();
            if (now - lastCameraEmit < 50) return;
            lastCameraEmit = now;
            this.emit({ type: 'CAMERA_MOVED', payload: this.readCameraPose(scene) });
          };
          this.splatEvents.on('update', this.splatUpdateHandler);
        }
      }

      // Create fallback/preview canvas if not provided
      if (!this.canvas && this.container) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.container.clientWidth || 800;
        this.canvas.height = this.container.clientHeight || 600;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.container.appendChild(this.canvas);
      }

      this.isInitialized = true;
      this.emit({
        type: 'ENGINE_READY',
        payload: {
          engine: 'playcanvas',
          version: '2.21.4 (WebGPU)',
        },
      });
    } catch (err) {
      console.warn('[SplatEngineAdapter] WebGPU initialization note:', err);
      this.isInitialized = true;
      this.emit({
        type: 'ENGINE_READY',
        payload: { engine: 'playcanvas', version: '2.21.4-fallback' },
      });
    }
  }

  public destroy(): void {
    if (this.splatEvents && this.splatUpdateHandler) {
      this.splatEvents.off?.('update', this.splatUpdateHandler);
    }
    if (this.canvas && this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
      this.canvas = null;
    }
    this.container = null;
    this.splatEvents = null;
    this.splatUpdateHandler = null;
    this.isInitialized = false;
    this.eventHandlers.clear();
  }

  public resize(width: number, height: number): void {
    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  public async dispatchCommand(command: EngineCommand): Promise<boolean> {
    if (!this.isInitialized) return false;

    switch (command.type) {
      case 'SET_CAMERA_POSE': {
        if (this.splatEvents) {
          this.splatEvents.fire('camera.setPose', command.payload);
          return true;
        }
        return true;
      }

      case 'SELECT_ENTITY': {
        if (this.splatEvents) {
          this.splatEvents.fire('select.all');
        }
        return true;
      }

      case 'SET_ACTIVE_TOOL': {
        if (this.splatEvents) {
          this.splatEvents.fire('tool.set', command.payload.tool);
        }
        return true;
      }

      case 'RESET_VIEW': {
        if (this.splatEvents) {
          this.splatEvents.fire('camera.reset');
        }
        return true;
      }

      default:
        return false;
    }
  }

  public onEvent(handler: (event: EngineEvent) => void): () => void {
    this.eventHandlers.add(handler);
    return () => {
      this.eventHandlers.delete(handler);
    };
  }

  public getSceneSnapshot(): SceneSnapshot {
    const scene = typeof window !== 'undefined' ? (window as any).scene : null;
    const camera = scene?.camera ? this.readCameraPose(scene) : {
      position: { x: 0, y: 2, z: 5 },
      target: { x: 0, y: 0, z: 0 },
      fov: 55,
    };
    return {
      id: 'splat-scene',
      version: 1,
      name: 'Gaussian Splat Model',
      engine: 'playcanvas',
      camera,
      entities: [
        {
          id: 'splat-root',
          name: 'Gaussian Point Cloud',
          type: 'splat',
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          visible: true,
        },
      ],
      materials: [],
      hotspots: [],
      updatedAt: new Date().toISOString(),
    };
  }

  public async loadSceneSnapshot(snapshot: SceneSnapshot): Promise<void> {
    if (snapshot.camera) {
      await this.dispatchCommand({ type: 'SET_CAMERA_POSE', payload: snapshot.camera });
    }
    this.emit({ type: 'SCENE_LOADED', payload: { snapshot } });
  }

  public getTelemetry(): TelemetryMetrics {
    return {
      fps: this.currentFps,
      frameTimeMs: 16.6,
      drawCalls: 4,
      triangles: this.splatCount * 2,
      splatCount: this.splatCount,
      webglContextState: 'active',
    };
  }

  // --- Alignment Methods ---

  setAlignment(_alignment: SpatialAlignment): void {
    // Store alignment for future use (e.g., rendering markers in world space)
  }

  addAlignmentMarker(_marker: AlignmentMarker): void {
    // TODO: Render 3D marker sphere at marker.worldPoint in the PlayCanvas scene
  }

  removeAlignmentMarker(_markerId: string): void {
    // TODO: Remove 3D marker sphere from the PlayCanvas scene
  }

  setRenderSuspended(suspended: boolean): void {
    // When alignment mode focuses on panorama, reduce splat rendering quality
    // This is a no-op for now — the actual quality reduction will be implemented
    // when we have the PlayCanvas scene reference available
  }

  private emit(event: EngineEvent): void {
    this.eventHandlers.forEach((h) => h(event));
  }

  private readCameraPose(scene: any): SceneSnapshot['camera'] {
    const camera = scene.camera;
    const position = camera.position;
    const target = camera.focalPoint;
    return {
      position: { x: position.x, y: position.y, z: position.z },
      target: { x: target.x, y: target.y, z: target.z },
      fov: camera.fov,
    };
  }
}
