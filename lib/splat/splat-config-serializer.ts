/**
 * Splat Config Serializer
 *
 * Converts SuperSplat editor scene data into the Experience Config format
 * for persistence via /api/experience-configs.
 *
 * Replaces the broken @/forks/editor-src import with a standalone implementation.
 */

interface SplatSettings {
  version?: number;
  [key: string]: any;
}

interface SerializedSplatConfig {
  splat: {
    engine: 'splat';
    splat: {
      url?: string;
      scale?: number;
      rotation?: [number, number, number];
      position?: [number, number, number];
      centers?: any;
    };
    camera?: {
      position?: [number, number, number];
      target?: [number, number, number];
    };
  };
  assets: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
  rendering: Record<string, any>;
  performance: Record<string, any>;
  metadata: Record<string, any>;
}

/**
 * Serialize SuperSplat scene data into the Experience Config format.
 */
export function serializeSplatScene(
  scene: any,
  settings: SplatSettings | null,
  projectId: string,
  experienceId?: string,
): SerializedSplatConfig {
  // Extract camera state from SuperSplat scene
  const camera = scene?.camera || scene?.view?.camera;
  const cameraPosition = camera?.position || [0, 0, 5];
  const cameraTarget = camera?.target || [0, 0, 0];

  // Extract splat data
  const splatData = scene?.splatData || scene?.data;
  const url = splatData?.url || scene?.url || '';

  // Extract bounds for scale/position
  const bounds = scene?.bounds || splatData?.bounds;
  const center = bounds?.center || [0, 0, 0];
  const size = bounds?.size || [1, 1, 1];

  return {
    splat: {
      engine: 'splat',
      splat: {
        url,
        scale: settings?.scale || 1,
        rotation: settings?.rotation || [0, 0, 0],
        position: settings?.position || [0, 0, 0],
        centers: splatData?.centers || null,
      },
      camera: {
        position: cameraPosition,
        target: cameraTarget,
      },
    },
    assets: url ? [{
      id: `splat-${projectId}`,
      name: 'Gaussian Splat',
      type: 'splat',
      url,
    }] : [],
    rendering: {
      quality: settings?.quality || 'high',
      maxPoints: settings?.maxPoints || 1000000,
      pointSize: settings?.pointSize || 1,
    },
    performance: {
      lodEnabled: settings?.lodEnabled !== false,
      frustumCulling: settings?.frustumCulling !== false,
    },
    metadata: {
      projectId,
      experienceId: experienceId || null,
      serializedAt: new Date().toISOString(),
      pointCount: splatData?.centers?.length || 0,
      boundsCenter: center,
      boundsSize: size,
    },
  };
}
