import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Server-side client with service role (bypasses RLS)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

// Template scene definitions
export const TEMPLATES: Record<number, { name: string; entities: Record<string, any>; settings: Record<string, any> }> = {
  // Architecture Studio
  1001: {
    name: 'Arch Scene',
    entities: {
      'camera-main': { name: 'Main Camera', components: { camera: { clearColor: [0.3, 0.6, 0.9, 1], fov: 45, near: 0.1, far: 1000 } } },
      'light-sun': { name: 'Sun Light', components: { light: { type: 'directional', color: [1, 0.95, 0.8], intensity: 1.2, castShadows: true } } },
      'light-ambient': { name: 'Ambient', components: { light: { type: 'ambient', color: [0.4, 0.45, 0.5], intensity: 0.4 } } },
      'ground': { name: 'Ground Plane', components: { model: { type: 'plane', width: 100, length: 100 }, material: { color: [0.3, 0.35, 0.3] } } },
    },
    settings: { sky: { type: 'skybox', intensity: 0.8 }, render: { toneMapping: 'ACES', exposure: 1.0 } },
  },
  1002: {
    name: 'Walkthrough Scene',
    entities: {
      'camera-main': { name: 'Walkthrough Camera', components: { camera: { clearColor: [0.2, 0.4, 0.7, 1], fov: 60, near: 0.1, far: 500 } } },
      'camera-path': { name: 'Camera Path', components: { spline: { type: 'catmullrom', points: [[0,1.7,0],[5,1.7,0],[5,1.7,5],[0,1.7,5]] } } },
      'light-sun': { name: 'Sun Light', components: { light: { type: 'directional', color: [1, 0.95, 0.85], intensity: 1.0, castShadows: true } } },
      'ground': { name: 'Ground', components: { model: { type: 'plane', width: 50, length: 50 }, material: { color: [0.25, 0.3, 0.25] } } },
    },
    settings: { animation: { autoPlay: true, loop: true, duration: 10 } },
  },
  // XR World
  2001: {
    name: 'XR Scene',
    entities: {
      'camera-xr': { name: 'XR Camera', components: { camera: { clearColor: [0, 0, 0, 0], fov: 90, near: 0.01, far: 100 } } },
      'light-sun': { name: 'Sun Light', components: { light: { type: 'directional', color: [1, 1, 1], intensity: 1.0 } } },
      'light-ambient': { name: 'Ambient', components: { light: { type: 'ambient', color: [0.5, 0.5, 0.5], intensity: 0.5 } } },
      'floor': { name: 'Floor Plane', components: { model: { type: 'plane', width: 10, length: 10 }, material: { color: [0.2, 0.2, 0.2], opacity: 0.8 } } },
    },
    settings: { xr: { enabled: true, type: 'auto', imageTracking: true, hitTest: true, anchors: true } },
  },
  2002: {
    name: 'VR Scene',
    entities: {
      'camera-vr': { name: 'VR Camera', components: { camera: { clearColor: [0.1, 0.1, 0.15, 1], fov: 110, near: 0.01, far: 500 } } },
      'light-sun': { name: 'Sun Light', components: { light: { type: 'directional', color: [1, 0.98, 0.95], intensity: 1.0, castShadows: true } } },
      'light-ambient': { name: 'Ambient', components: { light: { type: 'ambient', color: [0.3, 0.3, 0.4], intensity: 0.3 } } },
      'floor': { name: 'VR Floor', components: { model: { type: 'plane', width: 20, length: 20 }, material: { color: [0.15, 0.15, 0.2] } } },
      'controller-left': { name: 'Left Controller', components: { input: { type: 'hand', hand: 'left' } } },
      'controller-right': { name: 'Right Controller', components: { input: { type: 'hand', hand: 'right' } } },
    },
    settings: { xr: { enabled: true, type: 'vr', teleportation: true, handTracking: true, controllerModel: true } },
  },
  2003: {
    name: 'Tour Scene',
    entities: {
      'camera-tour': { name: 'Tour Camera', components: { camera: { clearColor: [0.15, 0.15, 0.2, 1], fov: 75, near: 0.1, far: 200 } } },
      'hotspot-entry': { name: 'Entry Hotspot', components: { hotspot: { type: 'teleport', position: [0, 1.6, 0] } } },
      'light-ambient': { name: 'Ambient', components: { light: { type: 'ambient', color: [0.6, 0.6, 0.6], intensity: 0.6 } } },
    },
    settings: { tour: { hotspots: true, infoPanels: true, floorPlan: true, transitions: 'fade' } },
  },
  2004: {
    name: 'Splat Scene',
    entities: {
      'camera-splat': { name: 'Splat Camera', components: { camera: { clearColor: [0.05, 0.05, 0.08, 1], fov: 60, near: 0.1, far: 500 } } },
      'light-sun': { name: 'Sun Light', components: { light: { type: 'directional', color: [1, 0.98, 0.95], intensity: 0.8 } } },
    },
    settings: { splatting: { enabled: true, renderMode: 'splat', screenSpace: true, ViewState: 'adaptive' } },
  },
  2005: {
    name: 'Stream Scene',
    entities: {
      'camera-stream': { name: 'Stream Camera', components: { camera: { clearColor: [0.1, 0.1, 0.12, 1], fov: 60, near: 0.1, far: 1000 } } },
      'light-sun': { name: 'Sun Light', components: { light: { type: 'directional', color: [1, 1, 1], intensity: 1.0, castShadows: true } } },
      'light-ambient': { name: 'Ambient', components: { light: { type: 'ambient', color: [0.4, 0.4, 0.5], intensity: 0.4 } } },
    },
    settings: { streaming: { enabled: true, encoder: 'h264', bitrate: 10000, framerate: 60, resolution: [1920, 1080] } },
  },
};
