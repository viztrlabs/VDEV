import {
  GLTFLoader
} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  DRACOLoader
} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {
  KTX2Loader
} from 'three/examples/jsm/loaders/KTX2Loader.js';
import {
  MeshoptDecoder
} from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import {
  Group,
  LoadingManager
} from 'three';

// Client-side only initialization
let manager: LoadingManager;
let dracoLoader: DRACOLoader;
let ktx2Loader: KTX2Loader;
let gltfLoader: GLTFLoader;

function initLoaders() {
  if (typeof window === 'undefined') return;
  
  manager = new LoadingManager();
  
  dracoLoader = new DRACOLoader(manager);
  dracoLoader.setDecoderPath('/draco/');
  dracoLoader.preload();
  
  ktx2Loader = new KTX2Loader(manager);
  ktx2Loader.setTranscoderPath('/basis/');
  
  gltfLoader = new GLTFLoader(manager);
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.setKTX2Loader(ktx2Loader);
  gltfLoader.setMeshoptDecoder(MeshoptDecoder);
}

export interface LoadAssetOptions {
  onProgress?: (progress: { loaded: number; total: number; percent: number }) => void;
}

export async function loadAsset(
  url: string,
  options: LoadAssetOptions = {}
): Promise<Group> {
  if (typeof window === 'undefined') {
    throw new Error('loadAsset can only be called on the client side');
  }
  
  // Initialize loaders lazily on first call
  if (!gltfLoader) {
    initLoaders();
  }
  
  const { onProgress } = options;

  return new Promise<Group>((resolve, reject) => {
    gltfLoader.load(
      url,
      (gltf) => {
        resolve(gltf.scene);
      },
      (progress) => {
        if (onProgress && progress.total > 0) {
          onProgress({
            loaded: progress.loaded,
            total: progress.total,
            percent: Math.round((progress.loaded / progress.total) * 100)
          });
        }
      },
      (error) => {
        reject(error);
      }
    );
  });
}

export function detectFormat(url: string): 'gltf' | 'glb' | 'unknown' {
  const lower = url.toLowerCase();
  if (lower.endsWith('.gltf')) return 'gltf';
  if (lower.endsWith('.glb')) return 'glb';
  return 'unknown';
}

export const supportedFormats = {
  draco: true,
  ktx2: true,
  meshopt: true
} as const;

export type SupportedFormat = keyof typeof supportedFormats;

export function isFormatSupported(format: SupportedFormat): boolean {
  return supportedFormats[format];
}

export function clearAssetCache(): void {
  dracoLoader.dispose();
  ktx2Loader.dispose();
  manager.onLoad = () => {};
  manager.onProgress = () => {};
  manager.onError = () => {};
}

export { dracoLoader, ktx2Loader, gltfLoader, manager };