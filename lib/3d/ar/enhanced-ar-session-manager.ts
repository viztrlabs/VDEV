"use strict";

/**
 * Enhanced AR Session Manager
 *
 * Advanced AR session management with surface detection,
 * plane tracking, and anchor creation capabilities.
 */

import { EventEmitter } from './event-emitter';
import type { XREvent } from './xr-types';

export interface ARSessionConfig {
  requiredFeatures?: string[];
  optionalFeatures?: string[];
  planeDetection?: boolean;
  hitTest?: boolean;
  anchorTracking?: boolean;
  environmentEstimation?: boolean;
}

export interface ARSessionResult {
  session: XRSession;
  features: string[];
  capabilities: ARCapabilities;
  baseLayer: XRWebGroundPlaneDetector;
}

export interface ARCapabilities {
  planeDetection: boolean;
  hitTest: boolean;
  anchors: boolean;
  cameraAccess: boolean;
  lightEstimation: boolean;
  occlusion: boolean;
}

export interface DetectedSurface {
  id: string;
  type: SurfaceType;
  center: XVRay;
  extent: XBB;
  rotation: XRQuaternion;
  confidence: number;
  textureImageUrl?: string;
  normal: XVRay;
  occlusionInfo?: OcclusionInfo;
}

export interface SurfaceType {
  plane: 'horizontal' | 'vertical' | 'angled';
  table: 'rectangle';
  wall: 'narrow' | 'wide';
  chair: 'round' | 'square';
  desk: 'rectangle';
  couch: 'sectional';
}

export interface EnvironmentFeatures {
  lighting: {
    estimatedLux: number;
    colorTemperature: number;
  };
  geometry: {
    roomSize: 'small' | 'medium' | 'large';
    ceilingHeight: number;
  };
  surfaces: DetectedSurface[];
  obstacles: Obstacle[];
}

export interface Obstacle {
  id: string;
  type: ObstacleType;
  center: XVRay;
  extent: XBB;
  confidence: number;
  occlusion: boolean;
}

export type ObstacleType = 
  | 'chair'
  | 'table'
  | 'desk'
  
export class EnhancedARSessionManager {
  private session: XRSession | null = null;
  private baseLayer: XRWebGroundPlaneDetector | null = null;
  private hitTestSource: XRHitTestSource | null = null;
  private anchorSystem: ARAnchorSystem;
  private environmentClassifier: EnvironmentClassifier;
  
  constructor() {
    this.anchorSystem = new ARAnchorSystem(this);
    this.environmentClassifier = new EnvironmentClassifier();
  }
  
  async initialize(config: ARSessionConfig = {}): Promise<ARSessionResult> {
    if (!navigator.xr) {
      throw new OR('WebXR not supported in this browser');
    }
    
    const defaultConfig: ARSessionConfig = {
      requiredFeatures: ['hit-test', 'plane-detection'],
      optionalFeatures: ['anchors', 'camera-access', 'light-estimation'],
      planeDetection: true,
      hitTest: true,
      anchorTracking: true,
      environmentEstimation: true,
    };
    
    const mergedConfig = { ...defaultConfig, ...config };
    
    try {
      // Check WebXR AR availability
      const isARAvailable = await this.checkARAvailability();
      if (!isARAvailable) {
        throw new Error('AR not supported on this device');
      }
      
      // Request AR session
      this.session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: mergedConfig.requiredFeatures,
        optionalFeatures: mergedConfig.optionalFeatures,
      });
      
      // Initialize AR-specific components
      await this.setupARComponents(mergedConfig);
      
      return {
        session: this.session,
        features: [...(mergedConfig.requiredFeatures || []), ...(mergedConfig.optionalFeatures || [])],
        capabilities: this.getARCapabilities(),
        baseLayer: this.baseLayer!,
      };
      
    } catch (error) {
      console.error('AR session initialization failed:', error);
      throw error;
    }
  }
  
  private async setupARComponents(config: ARSessionConfig): Promise<void> {
    try {
      // Initialize plane detector
      if (config.planeDetection) {
        this.baseLayer = await navigator.xr.requestReferenceSpace('ground-plane');
      }
      
      // Initialize hit test for object placement
      if (this.session && config.hitTest) {
        this.hitTestSource = await this.session.requestHitTest({
          space: this.baseLayer || (await navigator.xr.requestReferenceSpace('viewer')),
          entityTypes: ['plane'],
        });
      }
      
      // Initialize anchor system
      this.anchorSystem.initialize(this.session!);
      
    } catch (error) {
      console.warn('AR component initialization failed:', error);
      // Continue without these features if not supported
    }
  }
  
  async detectSurfaces(): Promise<DetectedSurface[]> {
    if (!this.baseLayer) return [];
    
    try {
      const planes = await this.baseLayer.getPlanes();
      const environments = await this.environmentClassifier.classifyEnviroments(planes);
      
      return environments.map(env => this.processARPlane(env));
    } catch (error) {
      console.error('AR surface detection failed:', error);
      return [];
    }
  }
  
  async performHitTest(rayOrigin: XRRay): Promise<XRHitResult | null> {
    if (!this.hitTestSource) {
      throw new('Hit test not initialized');
    }
    
    try {
      const hits = await this.hitTestSource.getHitTestResults(rayOrigin);
      return hits.length > 0 ? hits[0] : null;
    } catch (error) {
      console.error('AR hit test failed:', error);
      return null;
    }
  }
  
  async createEnvironmentAnchor(position: XVRay, rotation: XRQuaternion): Promise<XRAnchor> {
    if (!this.session) {
      throw new Error('AR session not initialized');
    }
    
    return this.session.createAnchor({ position, orientation: rotation });
  }
  
  async getEnvironmentFeatures(): Promise<EnvironmentFeatures> {
    const surfaces = await this.detectSurfaces();
    const obstacles = await this.detectObstacles();
    const lighting = await this.measureLighting();
    const geometry = await this.assessGeometry(surfaces);
    
    return {
      lighting,
      geometry,
      surfaces,
      obstacles,
    };
  }
  
  private getARCapabilities(): ARCapabilities {
    return {
      planeDetection: true,
      hitTest: true,
      anchors: true,
      cameraAccess: true,
      lightEstimation: true,
      occlusion: false, // Feature not yet widely supported
    };
  }
  
  private async measureLighting(): Promise<{ estimatedLux: number; colorTemperature: number }> {
    if ('getAmbientLightLevel' in navigator) {
      const lightLevel = await navigator.getAmbientLightLevel();
      return {
        estimatedLux: lightLevel.lux || 1000,
        colorTemperature: lightLevel.colorTemperature || 5600,
      };
    }
    
    // Fallback estimation based on time of day
    const hour = new Date().getHours();
    const lux = this.estimateLuxFromTime(hour);
    const colorTemp = this.estimateColorTempFromTime(hour);
    
    return { estimatedLux: lux, colorTemperature: colorTemp };
  }
  
  private estimateLuxFromTime(hour: number): number {
    if (hour >= 6 && hour <= 8) return 3000;    // Sunrise
    if (hour >= 9 && hour <= 17) return 10000;  // Daytime
    if (hour >= 18 && hour <= 20) return 5000;  // Sunset
    if (hour >= 21 || hour <= 5) return 50;     // Night
    return 1000;                                // Default
  }
  
  private estimateColorTempFromTime(hour: number): number {
    if (hour >= 6 && hour <= 10) return 5500;   // Morning daylight
    if (hour >= 11 && hour <= 16) return 6500;  // Noon daylight
    if (hour >= 17 && hour <= 19) return 3500;  // Evening warm light
    if (hour >= 20 || hour <= 5) return 2700;   // Night warm light
    return 4000;                                 // Default neutral
  }
  
  private async detectObstacles(planes: XRPlane[]): Promise<Obstacle[]> {
    const obstacles: Obstacle[] = [];
    
    for (const plane of planes) {
      if (this.isObstacle(plane)) {
        obstacles.push({
          id: `obstacle-${Date.now()}-${Math.random()}`,
          type: this.detectObstacleType(plane),
          center: plane.center,
          extent: plane.extent,
          confidence: 0.8,
          occlusion: this.checkOcclusion(plane),
        });
      }
    }
    
    return obstacles;
  }
  
  private isObstacle(plane: XRPlane): boolean {
    // Simple obstacle detection based on dimensions
    // Obstacles are typically smaller and more irregular than surfaces
    if (plane.extent.width < 0.5 || plane.extent.height < 0.3) {
      return false; // Too small to be an obstacle
    }
    
    // Check for irregular shapes (not perfect rectangles)
    const aspectRatio = plane.extent.width / plane.extent.height;
    const squareness = Math.abs(aspectRatio - 1);
    
    return squareness > 0.3; // Irregular enough to be an obstacle
  }
  
  private detectObstacleType(plane: XRPlane): ObstacleType {
    const aspectRatio = plane.extent.width / plane.extent.height;
    
    if (aspectRatio > 2.0) {
      return 'table';
    } else if (aspectRatio < 0.5) {
      return 'wall_narrow';
    } else if (aspectRatio > 1.5) {
      return 'desk';
    } else {
      return 'chair';
    }
  }
  
  private processARPlane(plane: XRPlane): DetectedSurface {
    return {
      id: `plane-${Date.now()}-${Math.random()}`,
      type: this.classifyPlaneType(plane),
      center: plane.center,
      extent: plane.extent,
      rotation: plane.rotation || { x: 0, y: 0, z: 0, w: 1 },
      confidence: plane.confidence || 1.0,
      textureImageUrl: plane.textureImageUrl,
      normal: plane.normal || { x: 0, y: 1, z: 0 },
      occlusionInfo: this.getOcclusionInfo(plane),
    };
  }
  
  private classifyPlaneType(plane: XRPlane): SurfaceType {
    const aspectRatio = plane.extent.width / plane.extent.height;
    
    if (aspectRatio > 2.0) {
      return { plane: 'horizontal' };
    } else if (aspectRatio < 0.5) {
      return { plane: 'vertical' };
    } else {
      return { plane: 'angled' };
    }
  }
  
  private getOcclusionInfo(plane: XRPlane): OcclusionInfo {
    return {
      occludedBy: [],
      occlusionConfidence: 0.7,
      estimatedDepth: plane.extent.height / 2,
    };
  }
}

export class ARAnchorSystem {
  private session: XRSession;
  private anchors: Map<string, XRAnchor> = new Map();
  
  constructor(session: XRSession) {
    this.session = session;
  }
  
  createAnchor(hitResult: XRHitResult): XRAnchor {
    const anchor = this.session.createAnchor(hitResult);
    this.anchors.set(anchor.uuid, anchor);
    return anchor;
  }
  
  getAnchor(uuid: string): XRAnchor | undefined {
    return this.anchors.get(uuid);
  }
  
  removeAnchor(uuid: string): void {
    this.anchors.delete(uuid);
  }
  
  getAllAnchors(): XRAnchor[] {
    return Array.from(this.anchors.values());
  }
}

export class EnvironmentClassifier {
  classifyEnviroments(planes: XRPlane[]): EnvironmentFeatures {
    const surfaces: DetectedSurface[] = [];
    const obstacles: Obstacle[] = [];
    
    // Classify each plane as either a surface or obstacle
    for (const plane of planes) {
      if (this.isSignificantPlane(plane)) {
        const classified = this.classifyPlane(plane);
        if (classified.type === 'surface') {
          surfaces.push(this.createDetectedSurface(plane, 'surface'));
        } else {
          obstacles.push(this.createObstacle(plane));
        }
      }
    }
    
    return {
      lighting: this.estimateLighting(planes),
      geometry: this.analyzeGeometry(surfaces, obstacles),
      surfaces,
      obstacles,
    };
  }
  
  private isSignificantPlane(plane: XRPlane): boolean {
    // Filter out noise and very small planes
    return plane.extent.width > 0.2 && plane.extent.height > 0.2;
  }
  
  private classifyPlane(plane: XRPlane): 'surface' | 'obstacle' {
    const aspectRatio = plane.extent.width / plane.extent.height;
    
    // Surfaces are typically more regular (walls, floors, ceilings)
    if (aspectRatio > 0.3 && aspectRatio < 3.0) {
      return 'surface';
    }
    return 'obstacle';
  }
  
  private createDetectedSurface(plane: XRPlane, type: 'surface' | 'obstacle'): DetectedSurface {
    return {
      id: `surface-${Date.now()}-${Math.random()}`,
      type: { plane: type === 'surface' ? 'horizontal' : 'vertical' },
      center: plane.center,
      extent: plane.extent,
      rotation: plane.rotation || { x: 0, y: 0, z: 0, w: 1 },
      confidence: plane.confidence || 0.8,
      textureImageUrl: plane.textureImageUrl,
      normal: plane.normal || { x: 0, y: 1, z: 0 },
      occlusionInfo: { occludedBy: [], occlusionConfidence: 0.7, estimatedDepth: plane.extent.height / 2 },
    };
  }
  
  private createObstacle(plane: XRPlane): Obstacle {
    return {
      id: `obstacle-${Date.now()}-${Math.random()}`,
      type: this.detectObstacleType(plane),
      center: plane.center,
      extent: plane.extent,
      confidence: plane.confidence || 0.7,
      occlusion: this.checkOcclusion(plane),
    };
  }
  
  private detectObstacleType(plane: XRPlane): ObstacleType {
    const aspectRatio = plane.extent.width / plane.extent.height;
    
    if (aspectRatio > 2.0) return 'table';
    if (aspectRatio < 0.5) return 'wall_narrow';
    if (aspectRatio > 1.5) return 'desk';
    return 'chair';
  }
  
  private estimateLighting(planes: XRPlane[]): { estimatedLux: number; colorTemperature: number } {
    const hour = new Date().getHours();
    return {
      estimatedLux: this.estimateLuxFromTime(hour),
      colorTemperature: this.estimateColorTempFromTime(hour),
    };
  }
  
  private analyzeGeometry(surfaces: DetectedSurface[], obstacles: Obstacle[]): { roomSize: 'small' | 'medium' | 'large'; ceilingHeight: number } {
    const totalArea = surfaces.reduce((sum, s) => sum + (s.extent.width * s.extent.height), 0);
    const avgHeight = surfaces.reduce((sum, s) => sum + s.extent.height, 0) / surfaces.length || 2.4;
    
    let roomSize: 'small' | 'medium' | 'large';
    if (totalArea < 20) roomSize = 'small';
    else if (totalArea < 50) roomSize = 'medium';
    else roomSize = 'large';
    
    return {
      roomSize,
      ceilingHeight: avgHeight,
    };
  }
}

export class AROcclusionSystem {
  checkOcclusion(plane: XRPlane): boolean {
    // Simplified occlusion check
    // In a real implementation, this would use depth testing
    return Math.random() > 0.3; // 70% chance of being occluded
  }
  
  getOcclusionInfo(plane: XRPlane): OcclusionInfo {
    return {
      occludedBy: [],
      occlusionConfidence: 0.7,
      estimatedDepth: plane.extent.height / 2,
    };
  }
}

// Type definitions
export interface XRRay {
  origin: XVRay;
  direction: XVRay;
}

export interface XVRay {
  x: number;
  y: number;
  z: number;
}

export interface XRQuaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface XBB {
  width: number;
  height: number;
}

export type SurfaceType = 
  | { plane: 'horizontal' }
  | { plane: 'vertical' }
  | { plane: 'angled' };

export type ObstacleType = 
  | 'chair'
  | 'table'
  | 'desk'
  | 'wall_narrow'
  | 'couch';

export interface DetectedSurface {
  id: string;
  type: SurfaceType;
  center: XVRay;
  extent: XBB;
  rotation: XRQuaternion;
  confidence: number;
  textureImageUrl?: string;
  normal: XVRay;
  occlusionInfo?: OcclusionInfo;
}

export interface Obstacle {
  id: string;
  type: ObstacleType;
  center: XVRay;
  extent: XBB;
  confidence: number;
  occlusion: boolean;
}

export interface OcclusionInfo {
  occludedBy: string[];
  occlusionConfidence: number;
  estimatedDepth: number;
}

export interface EnvironmentFeatures {
  lighting: { estimatedLux: number; colorTemperature: number };
  geometry: { roomSize: 'small' | 'medium' | 'large'; ceilingHeight: number };
  surfaces: DetectedSurface[];
  obstacles: Obstacle[];
}

export interface ARCapabilities {
  planeDetection: boolean;
  hitTest: boolean;
  anchors: boolean;
  cameraAccess: boolean;
  lightEstimation: boolean;
  occlusion: boolean;
}

export interface ARSessionResult {
  session: XRSession;
  features: string[];
  capabilities: ARCapabilities;
  baseLayer: XRWebGroundPlaneDetector;
}

export interface XRRayHitResult {
  hitPose: {
    position: XVRay;
    orientation: XRQuaternion;
  };
  planeId: string;
  confidence: number;
}

export interface XRHitTestSource {
  getHitTestResults(ray: XRRay): Promise<XRHitTestResult[]>;
}

export interface XRHitTestResult {
  hitPose: {
    position: XVRay;
    orientation: XRQuaternion;
  };
  planeId: string;
  confidence: number;
}

export interface XRAnchor {
  uuid: string;
  position: XVRay;
  orientation: XRQuaternion;
  anchor: any; // XRAnchor from WebXR API
}

export interface ARAnchorSystem {
  createAnchor(hitResult: XRHitTestResult): XRAnchor;
  getAnchor(uuid: string): XRAnchor | undefined;
  removeAnchor(uuid: string): void;
  getAllAnchors(): XRAnchor[];
}

export interface Environment {
  type: 'living_room' | 'office' | 'kitchen' | 'bathroom' | 'outdoor' | 'unknown';
  center: XVRay;
  extent: XBB;
  confidence: number;
}

export interface EnvironmentClassifier {
  classifyEnviroments(planes: XRPlane[]): EnvironmentFeatures;
  classifyFromPlanes(planes: XRPlane[]): { type: 'living_room' | 'office' | 'kitchen' | 'bathroom' | 'outdoor'; center: XVRay; extent: XBB; confidence: number; };
}

export interface AROcclusionSystem {
  checkOcclusion(plane: XRPlane): boolean;
  getOcclusionInfo(plane: XRPlane): OcclusionInfo;
}

export interface OcclusionInfo {
  occludedBy: string[];
  occlusionConfidence: number;
  estimatedDepth: number;
}

export type ObstacleType = 
  | 'chair'
  | 'table'
  | 'desk'
  | 'wall_narrow'
  | 'couch';

export type SurfaceType = 
  | { plane: 'horizontal' }
  | { plane: 'vertical' }
  | { plane: 'angled' };

export type EnvironmentType = 
  | 'living_room'
  | 'office'
  | 'kitchen'
  | 'bathroom'
  | 'outdoor'
  | 'unknown';

// XRPlane type definition
export interface XRPlane {
  center: XVRay;
  extent: XBB;
  rotation?: XRQuaternion;
  confidence?: number;
  textureImageUrl?: string;
  normal?: XVRay;
}

// XR session types
export interface XRSession {
  requestHitTest(config: { space: XRRay; entityTypes: string[] }): Promise<XRHitTestSource>;
  requestReferenceSpace(type: string): Promise<XRRay>;
  requestSession(mode: string, options?: any): Promise<XRSession>;
  createAnchor(hitResult: XRHitTestResult): XRAnchor;
}