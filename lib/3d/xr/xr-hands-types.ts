/**
 * XR Hand Tracking Type Definitions
 * 
 * Provides type-safe definitions for WebXR hand tracking integration.
 * Compatible with PlayCanvas and Three.js WebXR implementations.
 */

export type XRHandedness = 'left' | 'right' | 'none';

export interface XRJoint {
  type: string; // 'wrist', 'thumb', 'index', 'middle', 'ring', 'pinky', 'palm'
  position: { x: number; y: number; z: number };
  direction: { x: number; y: number; z: number };
  normal: { x: number; y: number; z: number };
  distance?: number;
  radius?: number;
  pinching?: boolean;
  touching?: boolean;
  holding?: boolean;
}

export interface XRHandTrackingData {
  joints: XRJoint[];
  pose: 'pinching' | 'pointing' | 'grabbing' | 'open' | 'closed';
  confidence: number; // 0-1
}

export interface WebXRHandModuleConfig {
  scene: any; // PlayCanvas Scene or Three.js Scene
  handedness?: XRHandedness[];
  maxHands?: number;
  updateRate?: number; // Hz
}