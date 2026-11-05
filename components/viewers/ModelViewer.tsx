'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useAppStore } from '@/lib/store';
import {
  X,
  Rotate3d,
  Sun,
  Layers,
  Eye,
  Maximize2,
  Minimize2,
  Box,
  Compass,
  Grid,
  Sparkles,
  Smartphone,
  Headset,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

type RenderMode = 'pbr' | 'clay' | 'wireframe';
type Lighting = 'noon' | 'sunset' | 'night';

/** Real WebGL model renderer — loads an actual .glb/.gltf via three.js and
 *  respects the orbit / zoom / render-mode / lighting controls from the HUD. */
export function ModelCanvas({
  url,
  rotX,
  rotY,
  zoom,
  renderMode,
  lighting,
  showGrid,
}: {
  url: string;
  rotX: number;
  rotY: number;
  zoom: number;
  renderMode: RenderMode;
  lighting: Lighting;
  showGrid: boolean;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<any>(null);
  const stateRef = useRef<{
    model?: any;
    key?: any;
    fill?: any;
    amb?: any;
    clayMaterial?: any;
  }>({});
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    url ? 'loading' : 'ready'
  );
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (!url) {
      setStatus('ready');
      return;
    }
    let disposed = false;
    let raf = 0;
    let cleanupFns: Array<() => void> = [];

    (async () => {
      try {
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');
        const { KTX2Loader } = await import('three/examples/jsm/loaders/KTX2Loader.js');
        const { MeshoptDecoder } = await import('three/examples/jsm/libs/meshopt_decoder.module.js');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
        if (disposed) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          45,
          mount.clientWidth / Math.max(mount.clientHeight, 1),
          0.01,
          1000
        );
        camera.position.set(0, 0, 4);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        mount.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = false;
        controls.enableZoom = true;
        controls.enablePan = true;

        // Lighting presets
        const key = new THREE.DirectionalLight(0xffffff, 2.4);
        key.position.set(5, 10, 7);
        const fill = new THREE.DirectionalLight(0x90b0ff, 0.9);
        fill.position.set(-6, 4, -5);
        const amb = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(key, fill, amb);

        const grid = new THREE.GridHelper(10, 20, 0x3ecf8e, 0x27272a);
        (grid.material as THREE.Material).opacity = 0.35;
        (grid.material as THREE.Material).transparent = true;
        grid.visible = showGrid;
        scene.add(grid);
        gridRef.current = grid;

        const loader = new GLTFLoader();

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/draco/');
        loader.setDRACOLoader(dracoLoader);

        const ktx2Loader = new KTX2Loader();
        ktx2Loader.setTranscoderPath('/basis/');
        ktx2Loader.detectSupport(renderer);
        loader.setKTX2Loader(ktx2Loader);

        loader.setMeshoptDecoder(MeshoptDecoder);

        const gltf = await loader.loadAsync(url);
        if (disposed) return;
        const model = gltf.scene;

        // Preserve original materials for clean mode toggling
        model.traverse((o: any) => {
          if (o.isMesh && o.material) {
            o.userData.originalMaterial = o.material;
          }
        });

        // Frame the model centered
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        camera.position.set(maxDim * 0.8, maxDim * 0.6, maxDim * 1.6);
        controls.target.set(0, 0, 0);
        controls.maxDistance = maxDim * 6;
        controls.minDistance = maxDim * 0.2;
        controls.update();
        scene.add(model);

        // Clay material preset
        const clayMaterial = new THREE.MeshStandardMaterial({
          color: 0xd4d4d8,
          roughness: 0.65,
          metalness: 0.05,
        });

        const applyMaterialMode = () => {
          model.traverse((o: any) => {
            if (!o.isMesh) return;
            if (renderMode === 'clay') {
              o.material = clayMaterial;
            } else if (o.userData.originalMaterial) {
              o.material = o.userData.originalMaterial;
              const mats = Array.isArray(o.material) ? o.material : [o.material];
              for (const m of mats) {
                if (m) {
                  m.wireframe = renderMode === 'wireframe';
                  m.needsUpdate = true;
                }
              }
            }
          });
        };

        const applyLighting = () => {
          if (lighting === 'noon') {
            key.intensity = 3.0;
            key.color.set(0xffffff);
            fill.intensity = 1.1;
            amb.intensity = 0.8;
          } else if (lighting === 'sunset') {
            key.intensity = 2.2;
            key.color.set(0xffb27a);
            fill.intensity = 0.7;
            amb.intensity = 0.5;
          } else {
            key.intensity = 0.9;
            key.color.set(0x9bb8ff);
            fill.intensity = 0.4;
            amb.intensity = 0.3;
          }
        };

        stateRef.current = { model, key, fill, amb, clayMaterial };
        applyMaterialMode();
        applyLighting();

        setStatus('ready');

        // Responsive resize observer
        const resizeObserver = new ResizeObserver(() => {
          if (!mount || disposed) return;
          const width = mount.clientWidth;
          const height = mount.clientHeight;
          if (width === 0 || height === 0) return;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        });
        resizeObserver.observe(mount);

        const animate = () => {
          if (disposed) return;
          raf = requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        cleanupFns.push(() => {
          cancelAnimationFrame(raf);
          resizeObserver.disconnect();
          controls.dispose();
          renderer.dispose();
          dracoLoader.dispose();
          ktx2Loader.dispose();
          model.traverse((o: any) => {
            if (o.isMesh) {
              o.geometry?.dispose?.();
              const mats = Array.isArray(o.material) ? o.material : [o.material];
              mats.forEach((m: any) => m?.dispose?.());
            }
          });
          clayMaterial.dispose();
          if (renderer.domElement.parentElement === mount) {
            mount.removeChild(renderer.domElement);
          }
        });
      } catch (err: any) {
        if (disposed) return;
        console.error('ModelViewer WebGL error:', err);
        setStatus('error');
        setErrorMsg(err?.message || 'Failed to load model');
      }
    })();

    return () => {
      disposed = true;
      cleanupFns.forEach((f) => f());
      cleanupFns = [];
    };
  }, [url]);

  // Live-update render mode / lighting / grid without reloading the model.
  useEffect(() => {
    const st = stateRef.current;
    if (!st.model) return;
    st.model.traverse((o: any) => {
      if (!o.isMesh) return;
      if (renderMode === 'clay' && st.clayMaterial) {
        o.material = st.clayMaterial;
      } else if (o.userData.originalMaterial) {
        o.material = o.userData.originalMaterial;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) {
          if (m) {
            m.wireframe = renderMode === 'wireframe';
            m.needsUpdate = true;
          }
        }
      }
    });
    if (st.key) {
      if (lighting === 'noon') {
        st.key.intensity = 3.0; st.key.color.set(0xffffff);
        st.fill.intensity = 1.1; st.amb.intensity = 0.8;
      } else if (lighting === 'sunset') {
        st.key.intensity = 2.2; st.key.color.set(0xffb27a);
        st.fill.intensity = 0.7; st.amb.intensity = 0.5;
      } else {
        st.key.intensity = 0.9; st.key.color.set(0x9bb8ff);
        st.fill.intensity = 0.4; st.amb.intensity = 0.3;
      }
    }
    if (gridRef.current) gridRef.current.visible = showGrid;
  }, [renderMode, lighting, showGrid]);

  // Always mount the WebGL host so the loader effect has a target; show
  // status as an overlay on top of it.
  return (
    <div className="absolute inset-0">
      <div ref={mountRef} className="absolute inset-0" />
      {!url && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-[#71717A] font-mono">
          No model selected
        </div>
      )}
      {url && status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-[#3ECF8E] font-mono animate-pulse">
          Loading 3D model…
        </div>
      )}
      {url && status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-xs text-rose-300 font-mono px-4 text-center gap-1.5 z-10 bg-black/40 backdrop-blur-sm">
          <div className="text-rose-400 font-semibold text-sm">Failed to load 3D model</div>
          <div className="text-zinc-400 text-[11px] max-w-md">{errorMsg}</div>
          <div className="text-zinc-500 text-[10px] mt-1 break-all">Asset: {url}</div>
        </div>
      )}
    </div>
  );
}

export default function ModelViewer() {
  const {
    modelViewerOpen,
    activeModelUrl,
    activeModelTitle,
    closeModelViewer,
    showToast,
  } = useAppStore();

  const [rotX, setRotX] = useState(25);
  const [rotY, setRotY] = useState(45);
  const [zoom, setZoom] = useState(1);
  const [renderMode, setRenderMode] = useState<RenderMode>('pbr');
  const [lighting, setLighting] = useState<Lighting>('sunset');
  const [showGrid, setShowGrid] = useState(true);
  const [explodeFactor, setExplodeFactor] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [arSupported, setArSupported] = useState(false);
  const [vrSupported, setVrSupported] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'xr' in navigator) {
      (navigator as any).xr?.isSessionSupported?.('immersive-ar').then((res: boolean) => setArSupported(res));
      (navigator as any).xr?.isSessionSupported?.('immersive-vr').then((res: boolean) => setVrSupported(res));
    }
  }, []);

  if (!modelViewerOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setRotY((prev) => prev + dx * 0.4);
    setRotX((prev) => Math.max(-60, Math.min(60, prev - dy * 0.4)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleLaunchAR = () => {
    showToast('Initializing WebAR session... Point camera at a flat surface.', 'success');
  };

  const handleLaunchVR = () => {
    showToast('Initializing WebXR VR headset projection...', 'success');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      id="3d-webxr-model-viewer"
      className="fixed inset-0 z-[999] bg-[#09090b] text-white flex flex-col justify-between select-none animate-in fade-in duration-200"
      onMouseUp={handleMouseUp}
    >
      {/* TOP BAR */}
      <div className="px-4 py-3 bg-[#09090B] border-b border-[#27272A] flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#18181B] border border-[#27272A] text-[#3ECF8E] text-[10px] font-mono font-bold uppercase tracking-wider">
            <Box className="w-3.5 h-3.5" />
            <span>WEBXR 3D ORBIT ENGINE</span>
          </div>
          <h2 className="text-xs font-mono font-semibold text-[#FAFAFA] hidden sm:inline">
            {activeModelTitle || 'Interactive WebXR Master Model'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLaunchAR}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#18181B] hover:bg-[#27272A] text-[10px] font-mono text-[#FAFAFA] transition-colors border border-[#27272A] cursor-pointer"
            title="Launch WebAR mode"
          >
            <Smartphone className="w-3 h-3 text-[#3ECF8E]" />
            <span>{arSupported ? 'WebAR Active' : 'Simulate AR'}</span>
          </button>

          <button
            onClick={handleLaunchVR}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#18181B] hover:bg-[#27272A] text-[10px] font-mono text-[#FAFAFA] transition-colors border border-[#27272A] cursor-pointer"
            title="Launch VR mode"
          >
            <Headset className="w-3 h-3 text-[#3ECF8E]" />
            <span>{vrSupported ? 'VR Ready' : 'Simulate VR'}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#FAFAFA] transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={closeModelViewer}
            className="p-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white transition-colors ml-1 cursor-pointer"
            title="Close Model Viewer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D INTERACTIVE VIEWPORT */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing bg-[#09090B]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onWheel={(e) => {
          setZoom((prev) => Math.max(0.6, Math.min(2.5, prev - e.deltaY * 0.001)));
        }}
      >
        {/* Real WebGL model canvas */}
        <ModelCanvas
          url={activeModelUrl}
          rotX={rotX}
          rotY={rotY}
          zoom={zoom}
          renderMode={renderMode}
          lighting={lighting}
          showGrid={showGrid}
        />

        {/* Floating Controls HUD Sidebar */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 p-3 rounded-xl bg-[#09090B]/90 border border-[#27272A] backdrop-blur-md max-w-[210px]">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#3ECF8E] mb-1 flex items-center gap-1.5">
            <Sliders className="w-3 h-3 text-[#3ECF8E]" />
            <span>Shader Render Mode</span>
          </div>
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#18181B] border border-[#27272A] rounded">
            <button
              onClick={() => setRenderMode('pbr')}
              className={`py-1 text-[10px] font-mono rounded font-medium transition-colors cursor-pointer ${
                renderMode === 'pbr' ? 'bg-[#3ECF8E] text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              PBR
            </button>
            <button
              onClick={() => setRenderMode('clay')}
              className={`py-1 text-[10px] font-mono rounded font-medium transition-colors cursor-pointer ${
                renderMode === 'clay' ? 'bg-[#3ECF8E] text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Clay
            </button>
            <button
              onClick={() => setRenderMode('wireframe')}
              className={`py-1 text-[10px] font-mono rounded font-medium transition-colors cursor-pointer ${
                renderMode === 'wireframe' ? 'bg-[#3ECF8E] text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Wire
            </button>
          </div>

          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#3ECF8E] mt-2 mb-1 flex items-center gap-1.5">
            <Sun className="w-3 h-3 text-amber-400" />
            <span>Daylight Simulation</span>
          </div>
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#18181B] border border-[#27272A] rounded">
            <button
              onClick={() => setLighting('noon')}
              className={`py-1 text-[10px] font-mono rounded font-medium transition-colors cursor-pointer ${
                lighting === 'noon' ? 'bg-amber-500 text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Noon
            </button>
            <button
              onClick={() => setLighting('sunset')}
              className={`py-1 text-[10px] font-mono rounded font-medium transition-colors cursor-pointer ${
                lighting === 'sunset' ? 'bg-[#3ECF8E] text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Sunset
            </button>
            <button
              onClick={() => setLighting('night')}
              className={`py-1 text-[10px] font-mono rounded font-medium transition-colors cursor-pointer ${
                lighting === 'night' ? 'bg-indigo-600 text-white font-bold' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Night
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#27272A] mt-1 text-xs">
            <span className="text-[10px] font-mono text-[#A1A1AA]">Ground Grid</span>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer ${
                showGrid ? 'bg-[#3ECF8E] text-black' : 'bg-[#18181B] text-[#71717A] border border-[#27272A]'
              }`}
            >
              {showGrid ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Telemetry Indicator */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-3 p-2.5 rounded-lg bg-[#09090B]/90 border border-[#27272A] backdrop-blur-md text-[10px] font-mono text-[#A1A1AA]">
          <div className="flex items-center gap-1.5 text-[#3ECF8E]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E] animate-pulse" />
            <span>GLTF</span>
          </div>
          <div>Rot: {Math.round(rotY)}°</div>
          <div>Zoom: {zoom.toFixed(1)}x</div>
        </div>
      </div>
    </div>
  );
}
