export type AssetCategory = 'image' | 'video' | 'audio' | 'model' | 'document' | 'archive' | 'other';
export type AssetFormat = 'glb' | 'gltf' | 'splat' | 'ply' | 'spz' | 'usdz' | 'hdr' | 'exr' | 'panorama' | 'texture' | 'video' | 'audio' | 'document' | 'other';

export interface AssetTypeDefinition {
  extensions: string[];
  mimeTypes: string[];
  magicBytes?: { offset: number; bytes: number[] }[];
  maxSize: number; // bytes
  category: AssetCategory;
  format: AssetFormat;
  label: string;
}

export const ASSET_TYPES: Record<string, AssetTypeDefinition> = {
  '3d-model': {
    extensions: ['.glb', '.gltf'],
    mimeTypes: ['model/gltf-binary', 'model/gltf+json'],
    magicBytes: [{ offset: 0, bytes: [0x67, 0x6C, 0x54, 0x46] }], // glTF
    maxSize: 200 * 1024 * 1024, // 200MB
    category: 'model',
    format: 'glb',
    label: '3D Model (glTF/GLB)',
  },
  'gaussian-splat': {
    extensions: ['.splat', '.ply', '.spz'],
    mimeTypes: ['application/octet-stream'],
    maxSize: 500 * 1024 * 1024, // 500MB
    category: 'model',
    format: 'splat',
    label: 'Gaussian Splat',
  },
  'panorama': {
    extensions: ['.jpg', '.jpeg', '.png'],
    mimeTypes: ['image/jpeg', 'image/png'],
    magicBytes: [
      { offset: 0, bytes: [0xFF, 0xD8, 0xFF] }, // JPEG
      { offset: 0, bytes: [0x89, 0x50, 0x4E, 0x47] }, // PNG
    ],
    maxSize: 100 * 1024 * 1024, // 100MB
    category: 'image',
    format: 'panorama',
    label: 'Panorama Image',
  },
  'hdr-env': {
    extensions: ['.hdr', '.exr'],
    mimeTypes: ['image/vnd.radiance', 'application/octet-stream'],
    magicBytes: [
      { offset: 0, bytes: [0x23, 0x3F, 0x52, 0x41, 0x44, 0x49, 0x41, 0x4E, 0x43, 0x45] }, // #?RADIANCE
      { offset: 0, bytes: [0x23, 0x3F, 0x52, 0x47, 0x42, 0x45] }, // #?RGBE
    ],
    maxSize: 100 * 1024 * 1024, // 100MB
    category: 'image',
    format: 'hdr',
    label: 'HDR Environment Map',
  },
  'usdz': {
    extensions: ['.usdz'],
    mimeTypes: ['model/vnd.usdz+zip', 'application/octet-stream'],
    maxSize: 200 * 1024 * 1024, // 200MB
    category: 'model',
    format: 'usdz',
    label: 'USDZ (Apple AR)',
  },
  'video': {
    extensions: ['.mp4', '.webm', '.mov'],
    mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    maxSize: 500 * 1024 * 1024, // 500MB
    category: 'video',
    format: 'video',
    label: 'Video',
  },
  'audio': {
    extensions: ['.mp3', '.wav', '.ogg', '.m4a'],
    mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
    maxSize: 50 * 1024 * 1024, // 50MB
    category: 'audio',
    format: 'audio',
    label: 'Audio',
  },
  'texture': {
    extensions: ['.basis', '.ktx2'],
    mimeTypes: ['application/octet-stream'],
    maxSize: 100 * 1024 * 1024, // 100MB
    category: 'image',
    format: 'texture',
    label: 'Compressed Texture',
  },
};

export function getAssetTypeByExtension(ext: string): AssetTypeDefinition | undefined {
  return Object.values(ASSET_TYPES).find(t => t.extensions.includes(ext.toLowerCase()));
}

export function getAssetTypeByMime(mime: string): AssetTypeDefinition | undefined {
  return Object.values(ASSET_TYPES).find(t => t.mimeTypes.includes(mime));
}

export function validateMagicBytes(buffer: Buffer, assetType: AssetTypeDefinition): boolean {
  if (!assetType.magicBytes || assetType.magicBytes.length === 0) return true;
  return assetType.magicBytes.some(({ offset, bytes }) =>
    bytes.every((byte, i) => buffer[offset + i] === byte)
  );
}

export function getAllAllowedExtensions(): string[] {
  return Object.values(ASSET_TYPES).flatMap(t => t.extensions);
}
