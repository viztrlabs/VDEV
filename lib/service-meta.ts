export interface ServiceMeta {
  title: string;
  category: 'studio' | 'xr';
  icon: string;
  description: string;
  showDeviceCompatibility?: boolean;
  showTimeline?: boolean;
  wrapPermissions?: boolean;
}

export const SERVICE_META: Record<string, ServiceMeta> = {
  exterior: { title: 'Exterior', category: 'studio', icon: '🏠', description: 'Exterior renders and imagery', wrapPermissions: true },
  interior: { title: 'Interior', category: 'studio', icon: '🛋️', description: 'Interior renders and walkthroughs' },
  'animation-walkthrough': { title: 'Animation / Walkthrough', category: 'studio', icon: '🎬', description: '3D animation and walkthrough videos', showTimeline: true, wrapPermissions: true },
  'virtual-tour': { title: 'Virtual Tour', category: 'xr', icon: '🌐', description: '360° interactive panoramic tours', showTimeline: true },
  webar: { title: 'WebAR', category: 'xr', icon: '📱', description: 'Browser-based augmented reality', showDeviceCompatibility: true },
  webxr: { title: 'WebXR', category: 'xr', icon: '🥽', description: 'Immersive WebXR experiences', showDeviceCompatibility: true },
  'virtual-reality': { title: 'Virtual Reality', category: 'xr', icon: '🎮', description: 'Full VR experience', showDeviceCompatibility: true },
  'gaussian-splat': { title: 'Gaussian Splat', category: 'xr', icon: '🧊', description: '3D Gaussian Splatting viewer' },
  'pixel-streaming': { title: 'Pixel Streaming', category: 'xr', icon: '📺', description: 'Unreal Engine pixel streaming', showDeviceCompatibility: true },
};