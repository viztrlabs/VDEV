/**
 * Marzipano 360° Panorama Engine Adapter
 *
 * Connects the Marzipano panoramic viewer to the unified EngineBridge.
 * Dispatches hotspot creation, view orientation, zoom, and receives UI commands.
 */

import {
  EngineAdapter,
  EngineCommand,
  EngineEvent,
  EngineInitOptions,
  EngineType,
  SceneSnapshot,
  TelemetryMetrics,
  HotspotData,
} from '../types';

let cachedMarzipano: any = null;
async function loadMarzipano() {
  if (cachedMarzipano) return cachedMarzipano;
  const mod: any = await import('marzipano');
  cachedMarzipano = mod.default || mod;
  return cachedMarzipano;
}

export class MarzipanoEngineAdapter implements EngineAdapter {
  public readonly engineType: EngineType = 'marzipano';
  public isInitialized = false;

  private container: HTMLElement | null = null;
  private viewer: any = null;
  private currentScene: any = null;
  private view: any = null;
  private hotspots: Map<string, { data: HotspotData; domElement: HTMLElement }> = new Map();
  private eventHandlers: Set<(event: EngineEvent) => void> = new Set();
  private viewChangeUnsub: (() => void) | null = null;

  public async init(options: EngineInitOptions): Promise<void> {
    if (this.isInitialized) return;
    this.container = options.container;

    const Marzipano = await loadMarzipano();
    if (!this.container) return;

    this.viewer = new Marzipano.Viewer(this.container, {
      controls: {
        mouseViewMode: 'drag',
        scrollZoom: true,
        touchViewMode: 'drag',
        dragRotate: true,
      },
    });

    const limiter = Marzipano.RectilinearView.limit.traditional(
      (120 * Math.PI) / 180,
      (100 * Math.PI) / 180
    );

    this.view = new Marzipano.RectilinearView(
      {
        yaw: 0,
        pitch: 0,
        fov: (60 * Math.PI) / 180,
      },
      limiter
    );

    // Initial equirectangular sample or transparent canvas
    const samplePanoUrl =
      options.initialSnapshot?.environmentUrl ||
      'https://images.unsplash.com/photo-1557683316-973673baf926?w=2048&q=80';

    const source = Marzipano.ImageUrlSource.fromString(samplePanoUrl);
    const geometry = new Marzipano.EquirectGeometry([{ width: 2048 }]);

    this.currentScene = this.viewer.createScene({
      source,
      geometry,
      view: this.view,
    });

    this.currentScene.switchTo();

    // Listen to camera movements
    this.viewChangeUnsub = this.view.addEventListener('change', () => {
      const yawDeg = (this.view.yaw() * 180) / Math.PI;
      const pitchDeg = (this.view.pitch() * 180) / Math.PI;
      const fovDeg = (this.view.fov() * 180) / Math.PI;

      this.emit({
        type: 'CAMERA_MOVED',
        payload: {
          position: { x: 0, y: 0, z: 0 },
          target: { x: Math.sin(this.view.yaw()), y: Math.sin(this.view.pitch()), z: Math.cos(this.view.yaw()) },
          yaw: yawDeg,
          pitch: pitchDeg,
          fov: fovDeg,
        },
      });
    });

    // Populate initial hotspots if snapshot provided
    if (options.initialSnapshot?.hotspots) {
      options.initialSnapshot.hotspots.forEach((h) => this.addHotspot(h));
    }

    this.isInitialized = true;
    this.emit({
      type: 'ENGINE_READY',
      payload: { engine: 'marzipano', version: '0.10.2' },
    });
  }

  public destroy(): void {
    if (this.viewChangeUnsub) {
      this.viewChangeUnsub();
      this.viewChangeUnsub = null;
    }

    this.hotspots.forEach(({ domElement }) => {
      if (domElement.parentElement) {
        domElement.parentElement.removeChild(domElement);
      }
    });
    this.hotspots.clear();

    if (this.viewer) {
      try {
        this.viewer.destroy();
      } catch {
        /* cleanup */
      }
      this.viewer = null;
    }

    this.currentScene = null;
    this.view = null;
    this.container = null;
    this.isInitialized = false;
    this.eventHandlers.clear();
  }

  public resize(width: number, height: number): void {
    if (this.viewer) {
      this.viewer.updateSize();
    }
  }

  public async dispatchCommand(command: EngineCommand): Promise<boolean> {
    if (!this.isInitialized) return false;

    switch (command.type) {
      case 'SET_CAMERA_POSE': {
        const { yaw, pitch, fov } = command.payload;
        if (this.view) {
          const params: any = {};
          if (yaw !== undefined) params.yaw = (yaw * Math.PI) / 180;
          if (pitch !== undefined) params.pitch = (pitch * Math.PI) / 180;
          if (fov !== undefined) params.fov = (fov * Math.PI) / 180;
          this.view.setParameters(params);
          return true;
        }
        return false;
      }

      case 'ADD_HOTSPOT': {
        this.addHotspot(command.payload);
        return true;
      }

      case 'UPDATE_HOTSPOT': {
        const { id, patch } = command.payload;
        const entry = this.hotspots.get(id);
        if (entry) {
          entry.data = { ...entry.data, ...patch };
          if (patch.yaw !== undefined && patch.pitch !== undefined && this.currentScene) {
            const container = this.currentScene.hotspotContainer();
            container.destroyHotspot(entry.domElement);
            this.createHotspotElement(entry.data);
          }
          return true;
        }
        return false;
      }

      case 'DELETE_HOTSPOT': {
        const entry = this.hotspots.get(command.payload.id);
        if (entry && this.currentScene) {
          this.currentScene.hotspotContainer().destroyHotspot(entry.domElement);
          this.hotspots.delete(command.payload.id);
          return true;
        }
        return false;
      }

      case 'RESET_VIEW': {
        if (this.view) {
          this.view.setParameters({ yaw: 0, pitch: 0, fov: (60 * Math.PI) / 180 });
          return true;
        }
        return false;
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
    const hotspots = Array.from(this.hotspots.values()).map((h) => h.data);
    const yawDeg = this.view ? (this.view.yaw() * 180) / Math.PI : 0;
    const pitchDeg = this.view ? (this.view.pitch() * 180) / Math.PI : 0;

    return {
      id: 'marzipano-tour-scene',
      version: 1,
      name: '360 Virtual Tour',
      engine: 'marzipano',
      camera: {
        position: { x: 0, y: 0, z: 0 },
        target: { x: 0, y: 0, z: 1 },
        yaw: yawDeg,
        pitch: pitchDeg,
        fov: this.view ? (this.view.fov() * 180) / Math.PI : 60,
      },
      entities: [],
      materials: [],
      hotspots,
      updatedAt: new Date().toISOString(),
    };
  }

  public async loadSceneSnapshot(snapshot: SceneSnapshot): Promise<void> {
    this.hotspots.forEach(({ domElement }) => {
      if (this.currentScene) {
        this.currentScene.hotspotContainer().destroyHotspot(domElement);
      }
    });
    this.hotspots.clear();

    if (snapshot.hotspots) {
      snapshot.hotspots.forEach((h) => this.addHotspot(h));
    }

    if (snapshot.camera && this.view) {
      this.view.setParameters({
        yaw: ((snapshot.camera.yaw || 0) * Math.PI) / 180,
        pitch: ((snapshot.camera.pitch || 0) * Math.PI) / 180,
        fov: ((snapshot.camera.fov || 60) * Math.PI) / 180,
      });
    }

    this.emit({ type: 'SCENE_LOADED', payload: { snapshot } });
  }

  public getTelemetry(): TelemetryMetrics {
    return {
      fps: 60,
      frameTimeMs: 16.6,
      drawCalls: 1,
      triangles: 128,
      webglContextState: 'active',
    };
  }

  private addHotspot(data: HotspotData) {
    if (!this.currentScene) return;
    this.createHotspotElement(data);
  }

  private createHotspotElement(data: HotspotData) {
    const el = document.createElement('div');
    el.className = 'marzipano-hotspot-pin cursor-pointer transition-transform hover:scale-125';
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = data.color || '#3ecf8e';
    el.style.border = '2px solid white';
    el.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    el.title = data.title;

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      this.emit({
        type: 'HOTSPOT_SELECTED',
        payload: { hotspotId: data.id },
      });
    });

    const coords = {
      yaw: ((data.yaw || 0) * Math.PI) / 180,
      pitch: ((data.pitch || 0) * Math.PI) / 180,
    };

    this.currentScene.hotspotContainer().createHotspot(el, coords);
    this.hotspots.set(data.id, { data, domElement: el });
  }

  private emit(event: EngineEvent): void {
    this.eventHandlers.forEach((h) => h(event));
  }
}
