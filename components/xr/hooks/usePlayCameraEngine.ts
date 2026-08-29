'use client';

import { useState, useEffect, useRef, useCallback, RefObject } from 'react';

// Use 'any' for PlayCamera types to avoid TS mismatches with library types
interface PlayCameraEngineState {
  app: any;
  scene: any;
  camera: any;
  isInitialized: boolean;
  isXRAvailable: boolean;
  xrMode: 'none' | 'vr' | 'ar';
  error: string | null;
}

interface PlayCameraEngineActions {
  initEngine: () => Promise<void>;
  startVR: () => Promise<void>;
  startAR: () => Promise<void>;
  endXR: () => Promise<void>;
  destroy: () => void;
  loadPanorama: (imageUrl: string) => Promise<void>;
  loadModel: (modelUrl: string) => Promise<any>;
  startAnimationLoop: () => void;
}

export interface UsePlayCameraEngineResult extends PlayCameraEngineState {
  actions: PlayCameraEngineActions;
}

export function usePlayCameraEngine(
  canvasRef: RefObject<HTMLCanvasElement>
): UsePlayCameraEngineResult {
  const [state, setState] = useState<PlayCameraEngineState>({
    app: null,
    scene: null,
    camera: null,
    isInitialized: false,
    isXRAvailable: false,
    xrMode: 'none',
    error: null,
  });

  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!canvasRef?.current) return;

    const init = async () => {
      try {
        // Try to load PlayCamera dynamically
        const pc = await import('playcanvas');

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Check for WebXR support
        const xrSupported = typeof navigator !== 'undefined' && 'xr' in navigator;
        let xrAvailable = false;

        if (xrSupported) {
          try {
            xrAvailable = await navigator.xr!.isSessionSupported('immersive-vr');
          } catch {
            xrAvailable = false;
          }
        }

        // Initialize PlayCamera application
        const app = new pc.Application(canvas, {
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          autoDepthRender: true,
          deviceTypes: ['webgl2', 'webgl1', 'webgl2-mobile', 'webgl1-mobile'],
        } as any);

        // Set up scene
        const scene = app.scene as any;
        scene.physicalRenderer = true;
        scene.lighting.global = true;
        scene.lighting.useHdr = true;

        // Create camera entity
        const cameraEntity: any = new pc.Entity('Camera');
        cameraEntity.addComponent('camera', {
          fov: 60,
          near: 0.1,
          far: 10000,
          clearColor: new pc.Color(0, 0, 0, 1),
        });

        // Enable WebXR on camera if supported
        if (xrSupported && cameraEntity.components.camera) {
          cameraEntity.components.camera.xr = {
            enabled: true,
            spaceType: 'bounded-floor',
            hitTest: true,
            planeDetection: true,
            lightEstimation: true,
          };
        }

        scene.root.addChild(cameraEntity);

        // Set initial camera position
        cameraEntity.setPosition(0, 1.7, 5);

        // Create default directional light
        const lightEntity: any = new pc.Entity('Light');
        lightEntity.addComponent('light', {
          type: 'directional',
          intensity: 2,
          color: new pc.Color(1, 1, 1),
        });
        lightEntity.setEuler(45, 45, 0);
        scene.root.addChild(lightEntity);

        // Start the application
        app.start();

        setState({
          app,
          scene,
          camera: cameraEntity,
          isInitialized: true,
          isXRAvailable: xrAvailable,
          xrMode: 'none',
          error: null,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize PlayCamera engine';
        setState(prev => ({ ...prev, error: errorMessage }));
      }
    };

    init();

    // Cleanup
    return () => {
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }

      if (state.app) {
        state.app.destroy();
      }
    };
  }, [canvasRef]);

  const initEngine = useCallback(async () => {
    // Already initialized in useEffect
  }, []);

  const startVR = useCallback(async () => {
    if (!state.camera || !state.app) return;

    try {
      const cameraComponent = state.camera.components?.camera;
      if (cameraComponent && cameraComponent.xr && cameraComponent.xr.start) {
        await cameraComponent.xr.start(
          'immersive-vr',
          'bounded-floor',
          {}
        );

        setState(prev => ({ ...prev, xrMode: 'vr' }));
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to start VR session'
      }));
    }
  }, [state.camera]);

  const startAR = useCallback(async () => {
    if (!state.camera || !state.app) return;

    try {
      const cameraComponent = state.camera.components?.camera;
      if (cameraComponent && cameraComponent.xr && cameraComponent.xr.start) {
        await cameraComponent.xr.start(
          'immersive-ar',
          'unbounded',
          {
            requiredFeatures: ['hit-test'],
            optionalFeatures: ['dom-overlay', 'light-estimation'],
          }
        );

        setState(prev => ({ ...prev, xrMode: 'ar' }));
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to start AR session'
      }));
    }
  }, [state.camera]);

  const endXR = useCallback(async () => {
    if (!state.app || !state.camera) return;

    try {
      const cameraComponent = state.camera.components?.camera;
      if (cameraComponent && cameraComponent.xr && typeof cameraComponent.xr.end === 'function') {
        await cameraComponent.xr.end();
        setState(prev => ({ ...prev, xrMode: 'none' }));
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to end XR session'
      }));
    }
  }, [state.camera, state.app]);

  const destroy = useCallback(() => {
    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }

    if (state.app) {
      state.app.destroy();
      setState({
        app: null,
        scene: null,
        camera: null,
        isInitialized: false,
        isXRAvailable: false,
        xrMode: 'none',
        error: null,
      });
    }
  }, [state.app]);

  const startAnimationLoop = useCallback(() => {
    if (animationFrameIdRef.current !== null || !state.app) return;

    const animate = () => {
      if (state.app) {
        state.app.render();
      }
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, [state.app]);

  const loadPanorama = useCallback(async (imageUrl: string) => {
    if (!state.scene) return;

    try {
      const pc = await import('playcanvas');
      const texture: any = new pc.Texture(state.app.graphicsDevice, {
        width: 2048,
        height: 1024,
      });

      // Load image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        texture.setSource(img);
        state.scene.skybox = texture;
        state.scene.skyboxIntensity = 1;
      };
      img.src = imageUrl;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load panorama'
      }));
    }
  }, [state.scene, state.app]);

  const loadModel = useCallback(async (modelUrl: string) => {
    if (!state.app || !state.scene) return null;

    try {
      const pc = await import('playcanvas');
      const asset: any = new pc.Asset('model', 'container', {
        url: modelUrl,
      } as any);

      state.app.assets.add(asset);

      return new Promise<void>((resolve, reject) => {
        asset.ready(() => {
          if (asset.resource) {
            const entity: any = new pc.Entity('Model');
            entity.addComponent('render', { type: 'asset', asset: asset.id });
            state.scene.root.addChild(entity);
          }
          resolve();
        });
        asset.load();
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load model'
      }));
      return null;
    }
  }, [state.app, state.scene]);

  return {
    ...state,
    actions: {
      initEngine,
      startVR,
      startAR,
      endXR,
      destroy,
      loadPanorama,
      loadModel,
      startAnimationLoop,
    },
  };
}
