// Type declarations for Marzipano
declare module 'marzipano' {
  export interface Viewer {
    elem(): HTMLElement;
    pano(): Pano;
    createScene(data: SceneData): Scene;
    addScene(scene: Scene): void;
    switchScene(scene: Scene, transition?: any): void;
    destroy(): void;
    findElement(): HTMLElement;
    findScene(): Scene | null;
    findSceneById(id: string): Scene | null;
    isLoading(): boolean;
    load(): void;
    setOptions(options: any): void;
    requestFullscreen(): void;
  }

  export interface Pano {
    setView(equiangular: boolean): void;
    setAdaptiveQualityLimit(limit: number): void;
    setMaxCacheSize(size: number): void;
    setMaxFramesPerSampleCount(count: number): void;
    setMaxTileCount(count: number): void;
  }

  export interface Scene {
    obj(): any;
    switchTo(options?: any): void;
    start(): void;
    stop(): void;
    isActive(): boolean;
    viewer(): Viewer;
    pano(): Pano;
    hotspots(): HotspotContainer;
    rects(): any;
  }

  export interface HotspotContainer {
    create(options: HotspotOptions): Hotspot;
    getAll(): Hotspot[];
  }

  export interface Hotspot {
    setLatLng(lat: number, lng: number): void;
    setScene(scene: Scene): void;
    setPano(pano: Pano): void;
    setPitchYaw(pitch: number, yaw: number): void;
    setRotation(rotation: number): void;
    element(): HTMLElement | null;
    destroy(): void;
  }

  export interface RectElement {
    push(): void;
    pop(): void;
    destroy(): void;
  }

  export interface Options {
    autoplay?: boolean;
    defaultTransition?: any;
    defaultViewParams?: any;
    controls?: {
      mouseViewMode?: string;
      scrollZoom?: boolean;
      scrollZoomSpeed?: number;
      dragRotateOnMobile?: boolean;
      dragRoll?: boolean;
    };
  }

  export interface SceneData {
    source: any;
    levels?: any[];
    faceSize?: number;
    autoplay?: boolean;
    repeat?: boolean;
    name?: string;
    id?: string;
  }

  export interface HotspotOptions {
    pitch: number;
    yaw: number;
    rotation?: number;
    scale?: number;
    perspective?: boolean;
    stereo?: boolean;
    view?: any;
    type?: string;
    create?: (hotspot: Hotspot) => HTMLElement;
    destroy?: (el: HTMLElement) => void;
  }

  // Exported functions
  export function Viewer(container: HTMLElement | string, options?: Options): Viewer;
  export function Rect(viewer: Viewer, element: HTMLElement): RectElement;
  export function classNames(obj: Record<string, boolean>): string;
  export const VERSION: string;
  export function panicube(url: string): any;
}

declare global {
  interface Window {
    Marzipano?: typeof import('marzipano');
  }
}
