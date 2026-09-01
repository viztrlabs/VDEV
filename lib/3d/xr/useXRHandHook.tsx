'use client';

/**
 * WebXR Hands Hook
 *
 * React hook for WebXR hand tracking integration in VizTR.
 * Provides access to hand tracking data for immersive interactions.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { EngineDescriptor } from '../engine';
import type { XRHand, HandPose } from './webxr-hands';
import { useEngine } from '../useEngine';

interface XRHandHookOptions {
  enabled?: boolean;
  handIds?: number[];
  onHandUpdate?: (hand: XRHand) => void;
}

interface XRHandHookState {
  hands: Map<number, XRHand>;
  isSupported: boolean;
  isInitialized: boolean;
  error: string | null;
}

export function useXRHandHook(options: XRHandHookOptions = {}): {
  state: XRHandHookState;
  addHand: (handedness: 'left' | 'right') => void;
  removeHand: (id: number) => void;
  isPinching: (id: number) => boolean;
  isPointing: (id: number) => boolean;
  isGrabbing: (id: number) => boolean;
  getHandPose: (id: number) => HandPose[] | null;
} {
  const {
    enabled = true,
    handIds = [],
    onHandUpdate,
  } = options;

  const engine = useEngine();
  const [handHookState, setHandHookState] = useState<XRHandHookState>({
    hands: new Map(),
    isSupported: false,
    isInitialized: false,
    error: null,
  });

  const handModuleRef = useRef<any>(null);

  // Initialize hand tracking module
  useEffect(() => {
    if (!enabled || !engine.capabilities.xr) {
      setHandHookState(prev => ({ ...prev, isSupported: false }));
      return;
    }

    // Import the WebXR hand module dynamically
    const importHandModule = async () => {
      try {
        const { WebXRHandModule } = await import('../webxr-hands');
        const scene = (window as any).playcanvasApp?.scene;

        if (!scene) {
          setHandHookState(prev => ({ ...prev, error: 'PlayCanvas scene not found' }));
          return;
        }

        const handModule = new WebXRHandModule(scene);
        handModuleRef.current = handModule;

        // Add configured hands
        handIds.forEach((handedness, index) => {
          handModule.addHand(index, handedness);
        });

        setHandHookState(prev => ({
          ...prev,
          isSupported: true,
          isInitialized: true,
        }));
      } catch (error) {
        setHandHookState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to initialize hand tracking',
        }));
      }
    };

    importHandModule();
  }, [enabled, engine.capabilities.xr, handIds.join(', ')]);

  // Update hand tracking
  useEffect(() => {
    if (!handModuleRef.current || !enabled) return;

    const scene = (window as any).playcanvasApp?.scene;
    if (!scene) return;

    const animate = () => {
      handModuleRef.current?.updateHandTracking(1/60);
      setHandHookState(prev => ({
        ...prev,
        hands: new Map(prev.hands),
      }));
    };

    const animationFrame = setInterval(animate, 1000 / 60);

    return () => clearInterval(animationFrame);
  }, [enabled]);

  // Add hand handler
  const addHand = useCallback((handedness: 'left' | 'right') => {
    if (!handModuleRef.current) return;

    const handId = handHookState.hands.size;
    const hand = handModuleRef.current.addHand(handId, handedness);

    setHandHookState(prev => {
      const newHands = new Map(prev.hands);
      newHands.set(handId, hand);
      return { ...prev, hands: newHands };
    });\n
    onHandUpdate?.(hand);
  }, [handModuleRef, handHookState.hands, onHandUpdate]);

  // Remove hand handler
  const removeHand = useCallback((id: number) => {
    if (!handModuleRef.current) return;

    handModuleRef.current.hands?.delete(id);
    setHandHookState(prev => {
      const newHands = new Map(prev.hands);
      newHands.delete(id);
      return { ...prev, hands: newHands };
    });
  }, [handModuleRef]);

  // Action checkers
  const isPinching = useCallback((id: number) => {
    return handModuleRef.current?.getHand(id)?.isPinching() ?? false;
  }, [handModuleRef]);

  const isPointing = useCallback((id: number) => {
    return handModuleRef.current?.getHand(id)?.isPointing() ?? false;
  }, [handModuleRef]);

  const isGrabbing = useCallback((id: number) => {
    return handModuleRef.current?.getHand(id)?.isGrabbing() ?? false;
  }, [handModuleRef]);

  // Get hand pose
  const getHandPose = useCallback((id: number) => {
    return handModuleRef.current?.getHand(id)?.pose ?? null;
  }, [handModuleRef]);

  return {
    state: handHookState,
    addHand,
    removeHand,
    isPinching,
    isPointing,
    isGrabbing,
    getHandPose,
  };
}
