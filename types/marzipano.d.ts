// Type declarations for Marzipano 0.10.2
// Verified against node_modules/marzipano/src (Viewer.js, Scene.js,
// HotspotContainer.js, Hotspot.js, views/Rectilinear.js, index.js).
declare module 'marzipano' {
  export interface SceneOptions {
    source?: unknown;
    geometry?: unknown;
    view?: unknown;
    pinFirstLevel?: boolean;
    name?: string;
    id?: string;
  }

  export interface ViewerOptions {
    controls?: {
      mouseViewMode?: 'drag' | 'qtvr';
      scrollZoom?: boolean;
      scrollZoomSpeed?: number;
      dragRotateOnMobile?: boolean;
      dragRoll?: boolean;
    };
    stage?: Record<string, unknown>;
    cursors?: { drag?: Record<string, unknown> };
  }

  export class Viewer {
    constructor(container: HTMLElement, options?: ViewerOptions);
    createScene(opts: SceneOptions): Scene;
    createEmptyScene(opts?: SceneOptions): Scene;
    destroyScene(scene: Scene): void;
    scene(): Scene | null;
    switchScene(
      scene: Scene,
      opts?: {
        transitionDuration?: number;
        transitionUpdate?: (t: number, newScene: Scene, oldScene: Scene) => void;
      } | null,
      done?: () => void
    ): void;
    lookTo(
      params: { yaw?: number; pitch?: number; fov?: number },
      opts?: { transitionDuration?: number },
      done?: () => void
    ): void;
    startMovement(fn: (params: any, timestamp: number) => any, done?: () => void): void;
    stopMovement(): void;
    movement(): ((params: any, timestamp: number) => any) | undefined;
    setIdleMovement(
      timeoutMs: number,
      movement: ((params: any, timestamp: number) => any) | null
    ): void;
    breakIdleMovement(): void;
    updateSize(): void;
    addEventListener(event: 'viewChange' | 'sceneChange', cb: () => void): void;
    removeEventListener(event: 'viewChange' | 'sceneChange', cb: () => void): void;
    controls(): {
      registerMethod(name: string, instance: unknown, enabled?: boolean): void;
      enableMethod(name: string): void;
      disableMethod(name: string): void;
    };
    destroy(): void;
  }

  export interface Scene {
    switchTo(
      opts?: { transitionDuration?: number } | null,
      done?: () => void
    ): void;
    lookTo(
      params: { yaw?: number; pitch?: number; fov?: number },
      opts?: { transitionDuration?: number },
      done?: () => void
    ): void;
    startMovement(fn: (params: any, timestamp: number) => any, done?: () => void): void;
    stopMovement(): void;
    view(): RectilinearView;
    viewer(): Viewer;
    hotspotContainer(): HotspotContainer;
    destroy(): void;
  }

  export interface HotspotContainer {
    createHotspot(
      el: HTMLElement,
      coords: { yaw: number; pitch: number },
      opts?: { perspective?: { radius: number }; extra?: Record<string, unknown> }
    ): Hotspot;
    destroyHotspot(hotspot: Hotspot): void;
    listHotspots(): Hotspot[];
    hasHotspot(hotspot: Hotspot): boolean;
    domElement(): HTMLElement;
    destroy(): void;
  }

  export interface Hotspot {
    setPosition(coords: { yaw: number; pitch: number }): void;
    position(): { yaw: number; pitch: number };
    domElement(): HTMLElement;
    destroy(): void;
  }

  export class RectilinearView {
    constructor(
      params?: { yaw?: number; pitch?: number; fov?: number },
      limiter?: unknown
    );
    yaw(): number;
    pitch(): number;
    fov(): number;
    setYaw(value: number): void;
    setPitch(value: number): void;
    setFov(value: number): void;
    screenToCoordinates(
      point: { x: number; y: number },
      result?: { yaw: number; pitch: number }
    ): { yaw: number; pitch: number };
    coordinatesToScreen(
      coords: { yaw: number; pitch: number },
      result?: { x: number; y: number }
    ): { x: number; y: number } | null;
    static limit: {
      traditional(maxWidth: number, maxVFov?: number, maxHFov?: number): unknown;
    };
  }

  export class EquirectGeometry {
    constructor(levels: Array<{ width: number }>);
  }

  export class FlatGeometry {
    constructor(levels: Array<{ width: number }>);
  }

  export class ImageUrlSource {
    constructor(opts?: Record<string, unknown>);
    static fromString(url: string, opts?: { crossOrigin?: string }): unknown;
  }

  export function autorotate(opts?: {
    yawSpeed?: number;
    targetPitch?: number | null;
    targetFov?: number | null;
  }): (params: any, timestamp: number) => any;

  export class Dynamics {
    offset: number;
    velocity: number;
    update(other: { offset: number; velocity: number }, elapsed: number): void;
    reset(): void;
  }

  export const util: {
    degToRad(d: number): number;
    radToDeg(r: number): number;
  };

  export const dependencies: {
    eventEmitter(obj: object): void;
  };
}

declare global {
  interface Window {
    Marzipano?: typeof import('marzipano');
  }
}
