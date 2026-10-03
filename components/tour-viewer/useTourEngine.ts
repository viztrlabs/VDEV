'use client';

/**
 * useTourEngine — shared Marzipano engine for the tour viewer and the builder
 * viewport. Owns the Viewer lifecycle, a lazy per-scene scene cache,
 * cross-fade switching (Scene#switchTo), and view state publishing.
 *
 * Verified against marzipano 0.10.2 sources:
 * - Viewer ctor opts: controls | stage | cursors (no defaultTransition).
 * - scene.switchTo({ transitionDuration }, done) -> Viewer#switchScene.
 * - viewer.addEventListener('viewChange' | 'sceneChange', cb) (event emitter).
 * - viewer.scene() returns the current scene (Viewer.js:484).
 * - The stage canvas is appended synchronously in the Viewer constructor.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { TourScene } from '@/lib/tourClientStore';
import { renderViewerHotspot, renderAlignmentMarker, destroyHotspotElement } from './hotspotRenderers';

type MarzipanoAny = any;

export interface EngineView {
  yaw: number;
  pitch: number;
  fov: number;
}

interface UseTourEngineOpts {
  scenes: TourScene[];
  activeSceneId: string;
  transitionDuration?: number;
  onSceneChange?: (sceneId: string) => void;
  onHotspotClick?: (sceneId: string, hotspotId: string) => void;
}

export interface EngineApi {
  loading: boolean;
  progress: number;
  error: string | null;
  view: EngineView;
  getViewer: () => MarzipanoAny;
  getMarzipano: () => MarzipanoAny;
  getCurrentScene: () => MarzipanoAny;
  lookTo: (yaw: number, pitch: number, fov?: number) => void;
  zoomBy: (factor: number) => void;
  screenToCoordinates: (x: number, y: number) => { yaw: number; pitch: number } | null;
  setAutorotate: (enabled: boolean, speedDegPerSec?: number) => void;
  reload: () => void;
}

export function useTourEngine(
  containerRef: React.RefObject<HTMLElement | null>,
  opts: UseTourEngineOpts
): EngineApi {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<EngineView>({ yaw: 0, pitch: 0, fov: Math.PI / 2 });
  const [ready, setReady] = useState(false);
  const [activatedSceneId, setActivatedSceneId] = useState<string | null>(null);
  const [autorotateState, setAutorotateState] = useState({ enabled: false, speed: 1 });
  const [autorotateTick, setAutorotateTick] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  const viewerRef = useRef<MarzipanoAny>(null);
  const MarzipanoRef = useRef<MarzipanoAny>(null);
  const scenesCacheRef = useRef<Map<string, { ms: MarzipanoAny; signature: string }>>(new Map());
  const hotspotElsRef = useRef<Map<string, { hotspot: MarzipanoAny; el: HTMLElement }[]>>(new Map());
  const hotspotSyncRef = useRef<{ sceneId: string | null; sig: string }>({ sceneId: null, sig: '' });
  const viewChangeRef = useRef<(() => void) | null>(null);
  const canvasCleanupRef = useRef<(() => void) | null>(null);
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const publishView = useCallback(() => {
    const ms = viewerRef.current?.scene?.();
    const v = ms?.view?.();
    if (!v) return;
    setView({ yaw: v.yaw(), pitch: v.pitch(), fov: v.fov() });
  }, []);

  const sceneSignature = useCallback((scene: TourScene) => {
    const vc = scene.viewConstraints;
    return [
      scene.url,
      scene.tileUrl || '',
      scene.initialYaw, scene.initialPitch, scene.initialFov,
      vc ? [vc.top, vc.bottom, vc.left, vc.right, vc.zoomMin, vc.zoomMax].join(',') : '',
    ].join('|');
  }, []);

  const ensureScene = useCallback(async (scene: TourScene): Promise<MarzipanoAny> => {
    const viewer = viewerRef.current;
    const Marzipano = MarzipanoRef.current;
    if (!viewer || !Marzipano) throw new Error('Viewer not initialized');
    const signature = sceneSignature(scene);
    const cached = scenesCacheRef.current.get(scene.id);
    if (cached && cached.signature === signature) return cached.ms;
    if (cached) {
      try { viewer.destroyScene(cached.ms); } catch { /* already removed */ }
      scenesCacheRef.current.delete(scene.id);
      // Recreated scene gets a fresh hotspot container — force a re-sync.
      hotspotSyncRef.current = { sceneId: null, sig: '' };
    }

    let source: MarzipanoAny;
    if (scene.tileUrl) {
      source = Marzipano.ImageUrlSource.fromString(
        `${scene.tileUrl}/{z}/{y}/{x}.jpg`,
        { crossOrigin: 'anonymous' }
      );
    } else {
      source = Marzipano.ImageUrlSource.fromString(scene.url, { crossOrigin: 'anonymous' });
    }

    const geometry = new Marzipano.EquirectGeometry([
      { width: 4096 }, { width: 2048 }, { width: 1024 }, { width: 512 }, { width: 256 },
    ]);

    const vc = scene.viewConstraints || {
      top: -90, bottom: 90, left: -180, right: 180, zoomMin: 60, zoomMax: 120,
    };
    const limiter = Marzipano.RectilinearView.limit.traditional(
      1024, (vc.zoomMax * Math.PI) / 180, (vc.zoomMax * Math.PI) / 180
    );

    let yaw = ((scene.initialYaw || 0) * Math.PI) / 180;
    let pitch = ((scene.initialPitch || 0) * Math.PI) / 180;
    if (scene.spatialAlignment) {
      const r = scene.spatialAlignment.rotation;
      const sinYaw = 2 * (r.w * r.y + r.x * r.z);
      const cosYaw = 1 - 2 * (r.y * r.y + r.z * r.z);
      yaw += Math.atan2(sinYaw, cosYaw);
      const sinPitch = 2 * (r.w * r.x - r.y * r.z);
      pitch += Math.asin(Math.max(-1, Math.min(1, sinPitch)));
    }

    const viewInstance = new Marzipano.RectilinearView(
      { yaw, pitch, fov: ((scene.initialFov || 75) * Math.PI) / 180 },
      limiter
    );

    const ms = viewer.createScene({ source, geometry, view: viewInstance, pinFirstLevel: true });
    scenesCacheRef.current.set(scene.id, { ms, signature });
    return ms;
  }, [sceneSignature]);

  // --- Viewer lifecycle (re-runs on WebGL context restore via reloadKey) ---
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    const init = async () => {
      try {
        setLoading(true);
        setError(null);
        setProgress(0.1);
        const mod: MarzipanoAny = await import('marzipano');
        const Marzipano: MarzipanoAny = mod.default ?? mod;
        if (cancelled) return;
        MarzipanoRef.current = Marzipano;

        const viewer = new Marzipano.Viewer(containerRef.current!, {
          controls: { mouseViewMode: 'drag', scrollZoom: true, scrollZoomSpeed: 0.3 },
        });
        viewerRef.current = viewer;
        setProgress(0.4);

        // Viewer-level viewChange fires for the current scene's view changes
        // and on every scene switch (Viewer.js:392,727).
        const handleChange = () => publishView();
        viewChangeRef.current = handleChange;
        viewer.addEventListener('viewChange', handleChange);

        // Canvas exists synchronously (Viewer ctor appends the stage), so the
        // context-loss listener attaches reliably here.
        const canvas = containerRef.current!.querySelector('canvas');
        const onContextRestored = () => setReloadKey((k) => k + 1);
        canvas?.addEventListener('webglcontextrestored', onContextRestored);
        canvasCleanupRef.current = () =>
          canvas?.removeEventListener('webglcontextrestored', onContextRestored);

        setProgress(0.7);
        setReady(true);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to initialize tour engine');
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      canvasCleanupRef.current?.();
      canvasCleanupRef.current = null;
      const viewer = viewerRef.current;
      if (viewer) {
        try {
          if (viewChangeRef.current) {
            viewer.removeEventListener?.('viewChange', viewChangeRef.current);
            viewChangeRef.current = null;
          }
          viewer.stopMovement?.();
          for (const { ms } of scenesCacheRef.current.values()) {
            try { viewer.destroyScene?.(ms); } catch { /* ignore */ }
          }
          scenesCacheRef.current.clear();
          for (const els of hotspotElsRef.current.values()) {
            for (const { el } of els) destroyHotspotElement(el);
          }
          hotspotElsRef.current.clear();
          hotspotSyncRef.current = { sceneId: null, sig: '' };
          viewer.destroy?.();
        } catch { /* swallow destroy errors */ }
        viewerRef.current = null;
        setReady(false);
        setActivatedSceneId(null);
      }
    };
  }, [reloadKey, containerRef, publishView]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Cross-fade switch on activeSceneId change ---
  useEffect(() => {
    if (!ready || !opts.activeSceneId) return;
    const { scenes, transitionDuration = 500, onSceneChange } = optsRef.current;
    const scene = scenes.find((s) => s.id === opts.activeSceneId);
    if (!scene) return;
    let cancelled = false;

    (async () => {
      try {
        const ms = await ensureScene(scene);
        if (cancelled) return;
        ms.switchTo({ transitionDuration }, () => {
          if (cancelled) return;
          setActivatedSceneId(scene.id);
          publishView();
          onSceneChange?.(scene.id);
          setAutorotateState({
            enabled: !!scene.autorotateEnabled,
            speed: scene.autorotateSpeed || 1,
          });
          setAutorotateTick((k) => k + 1);
        });
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load scene');
      }
    })();

    return () => { cancelled = true; };
  }, [ready, opts.activeSceneId, ensureScene, publishView]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Hotspot sync for the active scene (re-syncs on list change; never
  // recreates the scene). Gated on activation: the cross-fade switch is async,
  // and viewer.scene() is null/stale until its done callback fires. ---
  useEffect(() => {
    if (!ready) return;
    const { scenes, activeSceneId, onHotspotClick } = optsRef.current;
    if (activatedSceneId !== activeSceneId) return;
    const scene = scenes.find((s) => s.id === activeSceneId);
    const ms = viewerRef.current?.scene?.();
    if (!scene || !ms) return;
    const container = ms.hotspotContainer?.();
    if (!container) return;

    // Idempotency: callers pass fresh array identities each render; skip when
    // the hotspot/marker set for this scene is already in sync.
    const sig =
      JSON.stringify((scene.hotspots ?? []).map((h) => [h.id, h.yaw, h.pitch, h.type])) +
      JSON.stringify((scene.alignmentMarkers ?? []).map((m) => [m.id, m.yaw, m.pitch]));
    if (hotspotSyncRef.current.sceneId === scene.id && hotspotSyncRef.current.sig === sig) return;
    hotspotSyncRef.current = { sceneId: scene.id, sig };

    for (const { hotspot, el } of hotspotElsRef.current.get(scene.id) || []) {
      try { container.destroyHotspot?.(hotspot); } catch { /* ignore */ }
      destroyHotspotElement(el);
    }
    const created: { hotspot: MarzipanoAny; el: HTMLElement }[] = [];
    for (const hs of scene.hotspots || []) {
      const el = renderViewerHotspot(hs, () => onHotspotClick?.(scene.id, hs.id));
      const hotspot = container.createHotspot(el, { yaw: hs.yaw, pitch: hs.pitch });
      created.push({ hotspot, el });
    }
    for (const marker of scene.alignmentMarkers || []) {
      const el = renderAlignmentMarker(marker);
      const hotspot = container.createHotspot(el, { yaw: marker.yaw, pitch: marker.pitch });
      created.push({ hotspot, el });
    }
    hotspotElsRef.current.set(scene.id, created);
  }, [ready, activatedSceneId, opts.activeSceneId, opts.scenes]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- API ---
  const getViewer = useCallback(() => viewerRef.current, []);
  const getMarzipano = useCallback(() => MarzipanoRef.current, []);
  const getCurrentScene = useCallback(() => viewerRef.current?.scene?.() ?? null, []);

  const lookTo = useCallback((yaw: number, pitch: number, fov?: number) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const params: Record<string, number> = { yaw, pitch };
    if (fov != null) params.fov = fov;
    viewer.lookTo(params, { transitionDuration: 750 });
  }, []);

  const zoomBy = useCallback((factor: number) => {
    const v = viewerRef.current?.scene?.()?.view?.();
    if (!v || typeof v.fov !== 'function' || typeof v.setFov !== 'function') return;
    const o = optsRef.current;
    const sc = o.scenes.find((s) => s.id === o.activeSceneId);
    const vc = sc?.viewConstraints;
    const minF = ((vc?.zoomMin ?? 60) * Math.PI) / 180;
    const maxF = ((vc?.zoomMax ?? 120) * Math.PI) / 180;
    v.setFov(Math.min(maxF, Math.max(minF, v.fov() * factor)));
  }, []);

  const screenToCoordinates = useCallback((x: number, y: number) => {
    const v = viewerRef.current?.scene?.()?.view?.();
    if (!v?.screenToCoordinates) return null;
    const coords = v.screenToCoordinates({ x, y });
    return { yaw: coords.yaw, pitch: coords.pitch };
  }, []);

  const setAutorotate = useCallback((enabled: boolean, speedDegPerSec?: number) => {
    setAutorotateState({ enabled, speed: speedDegPerSec ?? 1 });
  }, []);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  // Autorotate is wired via Marzipano's idle movement: user interaction stops
  // it automatically (Controls 'active' handler) and the idle timer restarts
  // it after 3s. Disabling clears the idle movement.
  useEffect(() => {
    const viewer = viewerRef.current;
    const Marzipano = MarzipanoRef.current;
    if (!ready || !viewer || !Marzipano) return;
    const v = viewer.scene?.()?.view?.();
    if (!v) return;
    if (autorotateState.enabled) {
      const movement = Marzipano.autorotate({
        yawSpeed: (autorotateState.speed * Math.PI) / 180,
        targetPitch: v.pitch(),
        targetFov: null,
      });
      viewer.setIdleMovement(3000, movement);
      viewer.startMovement(movement);
    } else {
      viewer.setIdleMovement(3000, null);
      viewer.stopMovement();
    }
  }, [ready, autorotateState, autorotateTick, reloadKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    loading, progress, error, view,
    getViewer, getMarzipano, getCurrentScene, lookTo, zoomBy, screenToCoordinates,
    setAutorotate, reload,
  };
}
