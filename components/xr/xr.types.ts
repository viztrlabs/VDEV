export type XRMode = 'tour' | 'vr' | 'ar';

export interface HotspotItem {
  id: string;
  position: [number, number, number] | { yaw: number; pitch: number };
  action: 'teleport' | 'open_info' | 'play_media' | 'external';
  target: string;
  title: string;
  icon?: string;
  visible?: boolean;
}

export interface AnnotationItem {
  id: string;
  hotspotId: string;
  title: string;
  text: string;
  position?: [number, number, number] | { x: number; y: number };
  singleOpen?: boolean;
  style?: 'glass' | 'solid' | 'minimal';
}

export interface TeleportPointItem {
  id: string;
  position: [number, number, number] | { yaw: number; pitch: number };
  targetSceneId: string;
  label: string;
  thumbnail?: string;
}

export interface XRScene {
  id: string;
  name: string;
  type: '360' | '3d';
  url: string;
  thumbnail?: string;
  hotspots: HotspotItem[];
  annotations: AnnotationItem[];
  teleportPoints: TeleportPointItem[];
  preload?: string[];
}

export interface DeviceCapabilities {
  hasWebXR: boolean;
  hasVR: boolean;
  hasAR: boolean;
}
