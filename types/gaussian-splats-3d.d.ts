declare module '@mkkellogg/gaussian-splats-3d' {
  import * as THREE from 'three';

  export enum SplatRenderMode {
    Everywhere = 0,
    Rasterize = 1,
    Sort = 2,
    Edit = 3,
  }

  export class DropInViewer extends THREE.Object3D {
    constructor(options?: Record<string, any>);
    addSplatScene(
      path: string,
      options?: {
        format?: 'splat' | 'ply' | 'ksplat';
        onProgress?: (percent: number) => void;
        position?: [number, number, number];
        rotation?: [number, number, number, number];
        scale?: [number, number, number];
        visible?: boolean;
      }
    ): Promise<void>;
    removeSplatScene(index?: number): void;
    setSplatSceneVisible(index: number, visible: boolean): void;
    dispose(): void;
  }

  export class Viewer {
    constructor(options?: Record<string, any>);
    addSplatScene(path: string, options?: Record<string, any>): Promise<void>;
    dispose(): void;
  }

  export class KSplatLoader {}
  export class SplatLoader {}
}
