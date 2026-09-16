'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

export interface PanoramaViewState {
  yaw: number;
  pitch: number;
  fov: number;
}

interface UseMarzipanoPanoramaOptions {
  viewportRef: RefObject<HTMLDivElement | null>;
  view: PanoramaViewState;
  onViewChange?: (view: PanoramaViewState) => void;
  isActive: boolean;
  imageUrl: string;
}

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const MIN_FOV = 40;
const MAX_FOV = 100;

function toRadians(value: number) {
  return value * DEG_TO_RAD;
}

function toDegrees(value: number) {
  return value * RAD_TO_DEG;
}

function normalizeYaw(value: number) {
  return ((value % 360) + 360) % 360;
}

function readView(view: any): PanoramaViewState {
  return {
    yaw: normalizeYaw(toDegrees(view.yaw())),
    pitch: toDegrees(view.pitch()),
    fov: Math.round(toDegrees(view.fov()) * 100) / 100,
  };
}

function viewParameters(view: PanoramaViewState) {
  return {
    yaw: toRadians(view.yaw),
    pitch: toRadians(view.pitch),
    fov: toRadians(Math.max(MIN_FOV, Math.min(MAX_FOV, view.fov))),
  };
}

export function useMarzipanoPanorama({
  viewportRef,
  view,
  onViewChange,
  isActive,
  imageUrl,
}: UseMarzipanoPanoramaOptions) {
  const viewerRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const marzipanoViewRef = useRef<any>(null);
  const pendingViewRef = useRef<PanoramaViewState | null>(null);
  const latestViewRef = useRef(view);
  const latestOnViewChangeRef = useRef(onViewChange);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  latestViewRef.current = view;
  latestOnViewChangeRef.current = onViewChange;

  const destroy = useCallback(() => {
    const scene = sceneRef.current;
    if (scene?.destroy) {
      try {
        scene.destroy();
      } catch {
      }
    }

    const viewer = viewerRef.current;
    if (viewer?.destroy) {
      try {
        viewer.destroy();
      } catch {
      }
    }

    sceneRef.current = null;
    marzipanoViewRef.current = null;
    viewerRef.current = null;
  }, []);

  const setView = useCallback((nextView: PanoramaViewState) => {
    const marzipanoView = marzipanoViewRef.current;
    if (!marzipanoView) {
      pendingViewRef.current = nextView;
      return;
    }

    marzipanoView.setParameters(viewParameters(nextView));
  }, []);

  const zoomBy = useCallback((delta: number) => {
    const marzipanoView = marzipanoViewRef.current;
    if (!marzipanoView) return;

    const nextFov = Math.max(
      MIN_FOV,
      Math.min(MAX_FOV, toDegrees(marzipanoView.fov()) + delta)
    );
    marzipanoView.setParameters({ fov: toRadians(nextFov) });
  }, []);

  const screenToView = useCallback((clientX: number, clientY: number) => {
    const viewport = viewportRef.current;
    const marzipanoView = marzipanoViewRef.current;
    if (!viewport || !marzipanoView) return null;

    const rect = viewport.getBoundingClientRect();
    const coordinates = marzipanoView.screenToCoordinates({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });

    return {
      yaw: normalizeYaw(toDegrees(coordinates.yaw)),
      pitch: toDegrees(coordinates.pitch),
    };
  }, [viewportRef]);

  const screenToHotspotCoords = useCallback(
    (clientX: number, clientY: number) => {
      const coordinates = screenToView(clientX, clientY);
      if (!coordinates) return null;

      return {
        xPercent: Math.round((coordinates.yaw / 360) * 1000) / 10,
        yPercent: Math.round((50 - (coordinates.pitch / 90) * 50) * 10) / 10,
      };
    },
    [screenToView]
  );

  useEffect(() => {
    const marzipanoView = marzipanoViewRef.current;
    if (!marzipanoView) return;

    const current = readView(marzipanoView);
    const yawChanged = Math.abs(current.yaw - normalizeYaw(view.yaw)) > 0.01;
    const pitchChanged = Math.abs(current.pitch - view.pitch) > 0.01;
    const fovChanged = Math.abs(current.fov - view.fov) > 0.01;

    if (yawChanged || pitchChanged || fovChanged) {
      marzipanoView.setParameters({
        ...(yawChanged ? { yaw: toRadians(view.yaw) } : {}),
        ...(pitchChanged ? { pitch: toRadians(view.pitch) } : {}),
        ...(fovChanged ? { fov: toRadians(view.fov) } : {}),
      });
    }
  }, [view]);

  useEffect(() => {
    if (!isActive) return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    let cancelled = false;

    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const mod: any = await import('marzipano');
        if (cancelled) return;

        const Marzipano = mod.default ?? mod;
        destroy();

        const viewer = new Marzipano.Viewer(viewport, {
          controls: {
            mouseViewMode: 'drag',
            scrollZoom: true,
            scrollZoomSpeed: 0.25,
            dragRotateOnMobile: true,
            dragRoll: false,
          },
          defaultTransition: { duration: 350 },
        });

        const initialView = pendingViewRef.current ?? latestViewRef.current;
        const marzipanoView = new Marzipano.RectilinearView(
          viewParameters(initialView),
          Marzipano.RectilinearView.limit.traditional(1024, toRadians(MAX_FOV), toRadians(MAX_FOV))
        );
        const source = Marzipano.ImageUrlSource.fromString(imageUrl, {
          crossOrigin: 'anonymous',
        });
        const geometry = new Marzipano.EquirectGeometry([
          { width: 4096 },
          { width: 2048 },
          { width: 1024 },
          { width: 512 },
          { width: 256 },
        ]);
        const scene = viewer.createScene({
          source,
          geometry,
          view: marzipanoView,
          pinFirstLevel: true,
        });

        viewerRef.current = viewer;
        sceneRef.current = scene;
        marzipanoViewRef.current = marzipanoView;

        const handleViewChange = () => {
          if (!cancelled) latestOnViewChangeRef.current?.(readView(marzipanoView));
        };
        marzipanoView.addEventListener('change', handleViewChange);

        scene.switchTo({}, () => {
          if (!cancelled) setIsLoading(false);
        });

        if (pendingViewRef.current) {
          marzipanoView.setParameters(viewParameters(pendingViewRef.current));
          pendingViewRef.current = null;
        }

        requestAnimationFrame(() => {
          if (!cancelled) {
            latestOnViewChangeRef.current?.(readView(marzipanoView));
            setIsLoading(false);
          }
        });
      } catch (reason) {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : 'Failed to initialize panorama viewer');
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      cancelled = true;
      destroy();
    };
  }, [destroy, isActive, imageUrl, viewportRef]);

  useEffect(() => {
    return () => {
      destroy();
    };
  }, [destroy]);

  return {
    error,
    isLoading,
    screenToHotspotCoords,
    screenToView,
    setView,
    zoomBy,
  };
}
