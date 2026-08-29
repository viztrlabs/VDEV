'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Loader2, Box, Eye, EyeOff } from 'lucide-react';

interface SplatSceneDef {
  id: string;
  name: string;
  url: string;
  format?: 'splat' | 'ply' | 'ksplat';
  position?: [number, number, number];
  rotation?: [number, number, number, number];
  scale?: [number, number, number];
  thumbnail?: string;
}

interface GaussianSplatViewerProps {
  scenes: SplatSceneDef[];
  initialSceneId?: string;
  className?: string;
}

// Public sample splat (known-good .splat asset) default viewer
// renders without client asset.
const DEFAULT_SAMPLE =
  'https://huggingface.co/cakewalk/splat-data/resolve/main/train.splat';

export default function GaussianSplatViewer({
  scenes,
  initialSceneId,
  className = '',
}: GaussianSplatViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const renderCtxRef = useRef<{ renderer?: THREE.WebGLRenderer; camera?: THREE.PerspectiveCamera; raf?: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState(initialSceneId ?? scenes[0]?.id ?? 'sample');
  const [visibleScenes, setVisibleScenes] = useState<Record<number, boolean>>({});

  const activeScene =
    scenes.find((s) => s.id === activeId) ?? { id: 'sample', name: 'Sample Capture', url: DEFAULT_SAMPLE };

  // Init viewer load active scene
  useEffect(() => {
    if (!containerRef.current) return;
    let disposed = false;

    const mount = async () => {
      try {
        const mod = await import('@mkkellogg/gaussian-splats-3d');
        if (disposed || !containerRef.current) return;

        const viewer = new mod.DropInViewer({
          gpuAcceleration: 'auto',
          sharedMemoryForWorkers: false,
          ignoreDevicePixelRatio: false,
        });
        viewerRef.current = viewer;

        // Build minimal three.js scene camera renderer
        const scene = new THREE.Scene();
        scene.add(viewer);

        const camera = new THREE.PerspectiveCamera(
          75,
          containerRef.current.clientWidth / Math.max(containerRef.current.clientHeight, 1),
          0.1,
          1000
        );
        camera.position.set(0, 0, 4);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // Simple orbit controls (inline to avoid extra dep)
        let dragging = false;
        let lastX = 0;
        let lastY = 0;
        let theta = 0;
        let phi = 0;
        const onDown = (e: PointerEvent) => {
          dragging = true;
          lastX = e.clientX;
          lastY = e.clientY;
        };
        const onUp = () => {
          dragging = false;
        };
        const onMove = (e: PointerEvent) => {
          if (!dragging) return;
          theta += (e.clientX - lastX) * 0.005;
          phi += (e.clientY - lastY) * 0.005;
          phi = Math.max(-1.2, Math.min(1.2, phi));
          lastX = e.clientX;
          lastY = e.clientY;
          const radius = 4;
          camera.position.set(
            Math.sin(phi) * Math.sin(theta) * radius,
            Math.cos(phi) * radius,
            Math.sin(phi) * Math.cos(theta) * radius
          );
          camera.lookAt(0, 0, 0);
        };
        renderer.domElement.addEventListener('pointerdown', onDown);
        window.addEventListener('pointerup', onUp);
        renderer.domElement.addEventListener('pointermove', onMove);

        renderCtxRef.current.renderer = renderer;
        renderCtxRef.current.camera = camera;
        const animate = () => {
          if (disposed) return;
          renderCtxRef.current.raf = requestAnimationFrame(animate);
          renderer.render(scene, camera);
        };
        animate();

        await loadScene(viewer, activeScene, 0);
        if (disposed) return;
        setIsLoading(false);
      } catch (err) {
        if (disposed) return;
        setError(err instanceof Error ? err.message : 'Failed to load Gaussian splat viewer');
        setIsLoading(false);
      }
    };

    mount();

    return () => {
      disposed = true;
      const rc = renderCtxRef.current;
      if (rc.renderer) {
        rc.renderer.dispose();
        if (rc.renderer.domElement?.parentElement) {
          rc.renderer.domElement.parentElement.removeChild(rc.renderer.domElement);
        }
      }
      if (rc.raf) cancelAnimationFrame(rc.raf);
      viewerRef.current?.dispose?.();
      viewerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadScene = async (viewer: any, scene: SplatSceneDef, index: number) => {
    setProgress(0);
    await viewer.addSplatScene(scene.url, {
      format: scene.format ?? (scene.url.endsWith('.ksplat') ? 'ksplat' : scene.url.endsWith('.ply') ? 'ply' : 'splat'),
      position: scene.position,
      rotation: scene.rotation,
      scale: scene.scale,
      onProgress: (percent: number) => setProgress(Math.round(percent * 100)),
    });
    setVisibleScenes((v) => ({ ...v, [index]: true }));
  };

  const switchScene = async (scene: SplatSceneDef) => {
    if (!viewerRef.current) return;
    setIsLoading(true);
    setError(null);
    try {
      // DropInViewer supports single scene slot here; remove re-add
      viewerRef.current.removeSplatScene(0);
      await loadScene(viewerRef.current, scene, 0);
      setActiveId(scene.id);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch scene');
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center bg-[#09090B] ${className}`}>
        <div className="text-center p-4">
          <Box className="w-6 h-6 text-rose-400 mx-auto mb-2" />
          <p className="text-xs text-rose-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={containerRef} className="absolute inset-0" style={{ background: '#09090B' }} />

      {isLoading && (
        <div className="absolute inset-0 z-50 bg-[#09090B] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-[#3ECF8E] animate-spin" />
          <div className="text-xs font-mono text-[#3ECF8E]">Loading Gaussian Splat…</div>
          <div className="w-48 h-1 bg-[#27272A] rounded-full overflow-hidden">
            <div className="h-full bg-[#3ECF8E] transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="text-[10px] text-[#71717A]">{progress}%</div>
        </div>
      )}

      {/* Scene info overlay */}
      {!isLoading && (
        <div className="absolute bottom-3 left-3 z-10 bg-[#09090B]/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-[#27272A]">
          <div className="text-xs font-mono text-[#A1A1AA]">
            {activeScene.name} Gaussian Splat {activeScene.format?.toUpperCase() ?? 'SPLAT'}
          </div>
        </div>
      )}
    </div>
  );
}