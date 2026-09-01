"use strict";

// PlayCanvas WebXR Hands Module
// WebXR Hands tracking implementation for VizTR

import * as PC from 'playcanvas';
import type { XRHandedness } from './xr-hands-types';

export interface HandPose {
  finger: 'palm' | 'thumb' | 'index' | 'middle' | 'ring' | 'pinky';
  state: 'touching' | 'pressed' | 'held' | 'none';
  position: PC.Vec3;
  direction: PC.Vec3;
  normal: PC.Vec3;
  distance: number;
  jointRadius: number;
}

export interface XRHand {
  id: number;
  handedness: XRHandedness;
  active: boolean;
  pose: HandPose[];
  isPinching(): boolean;
  isPointing(): boolean;
  isGrabbing(): boolean;
}

export class WebXRHandModule {
  private hands: Map<number, XRHand> = new Map();
  private handTracking: any = null;
  private scene: PC.Scene;

  constructor(scene: PC.Scene) {
    this.scene = scene;
    this.initializeHandTracking();
  }

  private initializeHandTracking(): void {
    // Initialize hand tracking using PlayCanvas's XR system
    if (this.scene.app.xr.available.vr && this.scene.app.xr.available.ar) {
      // Enable hand tracking in WebXR session
      this.scene.app.xr.start(null, {
        optionalFeatures: ['hand-tracking'],
      });
    }
  }

  public updateHandTracking(deltaTime: number): void {
    // Update hand tracking data
    // This would typically interface with the WebXR Hand Tracking API
    // via PlayCanvas's XR system

    for (const [handId, hand] of this.hands) {
      this.updateHandPose(handId, deltaTime);
    }
  }

  public addHand(id: number, handedness: XRHandedness): XRHand {
    const hand: XRHand = {
      id,
      handedness,
      active: true,
      pose: [],
      isPinching: () => this.isPinching(hand),
      isPointing: () => this.isPointing(hand),
      isGrabbing: () => this.isGrabbing(hand),
    };

    this.hands.set(id, hand);
    return hand;
  }

  public getHand(id: number): XRHand | undefined {
    return this.hands.get(id);
  }

  private updateHandPose(hand: XRHand, deltaTime: number): void {
    // Update hand pose based on WebXR Hand Tracking API data
    // This is a simplified implementation - real implementation would
    // need to map WebXR hand joint data to our hand pose structure

    const webxrHandData = this.getWebXRHandData(hand.id);
    if (!webxrHandData) return;

    hand.pose = webxrHandData.map((joint: any) => ({
      finger: this.mapFingerType(joint.type),
      state: this.getJointState(joint),
      position: new PC.Vec3(joint.position.x, joint.position.y, joint.position.z),
      direction: new PC.Vec3(joint.direction.x, joint.direction.y, joint.direction.z),
      normal: new PC.Vec3(joint.normal.x, joint.normal.y, joint.normal.z),
      distance: joint.distance || 0,
      jointRadius: joint.radius || 0.01,
    }));
  }

  private getWebXRHandData(handId: number): any[] {
    // This would get data from PlayCanvas's XR hand tracking system
    // For now, return mock data for development
    return [
      {
        type: 'wrist',
        position: { x: 0, y: 1.2, z: -0.5 },
        direction: { x: 0, y: 0, z: 1 },
        normal: { x: 0, y: 1, z: 0 },
        distance: 0.5,
        radius: 0.05,
      },
      {
        type: 'thumb',
        position: { x: 0.05, y: 1.3, z: -0.4 },
        direction: { x: 0.2, y: 0, z: -0.9 },
        normal: { x: 0, y: 0, z: 1 },
        distance: 0.1,
        radius: 0.02,
      },
    ];
  }

  private mapFingerType(webxrType: string): HandPose['finger'] {
    switch (webxrType) {
      case 'thumb':
        return 'thumb';
      case 'index':
        return 'index';
      case 'middle':
        return 'middle';
      case 'ring':
        return 'ring';
      case 'pinky':
        return 'pinky';
      case 'palm':
        return 'palm';
      default:
        return 'palm'; // fallback
    }
  }

  private getJointState(joint: any): HandPose['state'] {
    // Determine joint state based on WebXR joint data
    // This is a simplified implementation
    if (joint.pinching) return 'pressed';
    if (joint.touching) return 'touching';
    if (joint.holding) return 'held';
    return 'none';
  }

  private isPinching(hand: XRHand): boolean {
    // Check if thumb and index fingers are touching
    const thumb = hand.pose.find(p => p.finger === 'thumb');
    const index = hand.pose.find(p => p.finger === 'index');

    if (!thumb || !index) return false;

    const distance = thumb.position.distanceTo(index.position);
    return distance < 0.05; // pinch threshold
  }

  private isPointing(hand: XRHand): boolean {
    // Check if index finger is extended
    const index = hand.pose.find(p => p.finger === 'index');
    if (!index) return false;

    // Simple check: index finger pointing forward
    return index.direction.z > 0.9;
  }

  private isGrabbing(hand: XRHand): boolean {
    // Check if hand is making a grab pose
    // This would require checking multiple joints
    return false; // placeholder
  }

  public renderHand(hand: XRHand, material: PC.Material): void {
    // Render hand visualization
    // In a real implementation, this would create 3D models
    // of the hand and update them with pose data
    console.log(`Rendering hand ${hand.id} (${hand.handedness})`);
  }
}
