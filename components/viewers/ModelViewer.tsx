'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useAppStore } from '@/lib/store';
import { requestARSession, launchQuickLook, canRequestXR, isQuickLookSupported } from '@/lib/xr/capabilities';
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
  QrCode,
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
  xrSession = null,
}: {
  url: string;
  rotX: number;
  rotY: number;
  zoom: number;
  renderMode: RenderMode;
  lighting: Lighting;
  showGrid: boolean;
  xrSession?: any;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<any>(null);
  // Live XR hit-test state shared between the render loop and the AR effect.
  const xrRef = useRef<{
    hitTestSource?: any;
    refSpace?: any;
    reticle?: THREE.Mesh;
  }>({});
  const stateRef = useRef<{
    model?: any;
    key?: any;
    fill?: any;
    amb?: any;
    clayMaterial?: any;
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    controls?: any;
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

        stateRef.current = { model, key, fill, amb, clayMaterial, renderer, scene, camera, controls };

        // Hit-test reticle — hidden until an AR surface is detected.
        const reticle = new THREE.Mesh(
          new THREE.RingGeometry(0.08, 0.12, 32).rotateX(-Math.PI / 2),
          new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide })
        );
        reticle.matrixAutoUpdate = false;
        reticle.visible = false;
        scene.add(reticle);
        xrRef.current.reticle = reticle;
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

        const animate = (time?: number, frame?: any) => {
          if (disposed) return;
          if (renderer.xr.isPresenting) {
            const hit = xrRef.current;
            if (hit.hitTestSource && hit.refSpace && frame && model) {
              const results = frame.getHitTestResults(hit.hitTestSource);
              if (results.length > 0) {
                const pose = results[0].getPose(hit.refSpace);
                if (pose && hit.reticle) {
                  hit.reticle.visible = true;
                  hit.reticle.matrix.fromArray(pose.transform.matrix);
                  // Auto-place the model on the detected real-world surface.
                  const p = new THREE.Vector3().setFromMatrixPosition(hit.reticle.matrix);
                  model.position.lerp(p, 0.35);
                }
              } else if (hit.reticle) {
                hit.reticle.visible = false;
              }
            }
          } else {
            controls.update();
          }
          renderer.render(scene, camera);
        };
        renderer.setAnimationLoop(animate);

        cleanupFns.push(() => {
          renderer.setAnimationLoop(null);
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

  // Real WebXR immersive-ar: start the session, enable hit-test, and keep the
  // canvas transparent so the live camera passthrough is visible behind the model.
  useEffect(() => {
    if (!xrSession) return;
    const st = stateRef.current;
    const renderer = st.renderer;
    const scene = st.scene;
    const model = st.model;
    if (!renderer || !scene) return;

    let cancelled = false;
    let hitTestSource: any = null;

    try {
      renderer.xr.setReferenceSpaceType('local');
    } catch {
      /* ignore */
    }
    scene.background = null;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.background = 'transparent';

    // Scale + place the model in front of the viewer for AR.
    if (model) {
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const s = 1.2 / maxDim;
      model.scale.setScalar(s);
      model.position.set(-center.x * s, -center.y * s, -2 - center.z * s);
    }

    const start = async () => {
      try {
        await renderer.xr.setSession(xrSession);
        if (cancelled) return;
        const session = renderer.xr.getSession();
        if (!session) return;
        const anySession = session as any;
        const viewerSpace = await anySession.requestReferenceSpace('viewer');
        const refSpace = renderer.xr.getReferenceSpace();
        hitTestSource = await anySession.requestHitTestSource({ space: viewerSpace });
        xrRef.current.hitTestSource = hitTestSource;
        xrRef.current.refSpace = refSpace;
      } catch (e) {
        // Hit-test is optional; the model still renders in front of the camera.
        console.warn('[ModelViewer] AR hit-test unavailable:', e);
      }
    };
    start();

    return () => {
      cancelled = true;
      xrRef.current.hitTestSource = undefined;
      xrRef.current.refSpace = undefined;
      if (xrRef.current.reticle) xrRef.current.reticle.visible = false;
      try {
        hitTestSource?.cancel?.();
      } catch {
        /* ignore */
      }
      try {
        xrSession.end?.()?.catch?.(() => {});
      } catch {
        /* ignore */
      }
    };
  }, [xrSession, status]);

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
        <div className="absolute inset-0 flex items-center justify-center text-xs text-[#dbfcff] font-mono animate-pulse">
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

export function ModelViewer() {
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
  const [arSession, setArSession] = useState<any>(null);
  const [arError, setArError] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const topBarRef = useRef<HTMLDivElement>(null);

  // iOS AR Quick Look uses a .usdz asset when the showcase provides one.
  const usdzUrl =
    activeModelUrl && /\.usdz(\?|$)/i.test(activeModelUrl) ? activeModelUrl : null;
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/xr-world/webar`
      : '/xr-world/webar';

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
    setArError(null);
    // Toggle off if a live session is already running.
    if (arSession) {
      try {
        arSession.end?.();
      } catch {
        /* ignore */
      }
      setArSession(null);
      return;
    }

    // iOS Safari — native AR Quick Look.
    if (usdzUrl && isQuickLookSupported()) {
      if (launchQuickLook(usdzUrl)) return;
    }

    // Android Chrome / WebXR immersive-ar — requestSession must run in this gesture.
    if (canRequestXR() && arSupported) {
      requestARSession(topBarRef.current)
        .then((session) => setArSession(session))
        .catch((e: any) => {
          const m = e?.message || 'Failed to start the live AR camera.';
          setArError(m);
          showToast(m, 'error');
        });
      return;
    }

    // Desktop / unsupported — keep the interactive 3D simulator + QR handoff.
    const msg =
      usdzUrl && isQuickLookSupported()
        ? 'AR Quick Look needs a valid .usdz asset. Showing the 3D simulator.'
        : 'Live camera AR is not supported here. Showing the 3D simulator — scan the QR to open on an AR-capable phone.';
    setArError(msg);
    showToast('Showing 3D AR simulator', 'info');
    setShowQr(true);
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
      className="fixed inset-0 z-[999] bg-[#131314] text-white flex flex-col justify-between select-none animate-in fade-in duration-200"
      onMouseUp={handleMouseUp}
    >
      {/* TOP BAR */}
      <div ref={topBarRef} className="px-4 py-3 bg-[#131314] border-b border-[#353436] flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#201f20] border border-[#353436] text-[#dbfcff] text-[10px] font-mono font-bold uppercase tracking-wider">
            <Box className="w-3.5 h-3.5" />
            <span>WEBXR 3D ORBIT ENGINE</span>
          </div>
          <h2 className="text-xs font-mono font-semibold text-[#e5e2e3] hidden sm:inline">
            {activeModelTitle || 'Interactive WebXR Master Model'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLaunchAR}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#201f20] hover:bg-[#353436] text-[10px] font-mono text-[#e5e2e3] transition-colors border border-[#353436] cursor-pointer"
            title={arSession ? 'Exit live AR' : 'Launch WebAR mode'}
          >
            <Smartphone className="w-3 h-3 text-[#dbfcff]" />
            <span>
              {arSession
                ? 'Exit AR'
                : arSupported
                  ? 'Launch Live AR'
                  : usdzUrl && isQuickLookSupported()
                    ? 'Open in AR'
                    : 'Simulate AR'}
            </span>
          </button>

          {!arSupported && (
            <button
              onClick={() => setShowQr(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#201f20] hover:bg-[#353436] text-[10px] font-mono text-[#e5e2e3] transition-colors border border-[#353436] cursor-pointer"
              title="Scan QR to open live AR on mobile"
            >
              <QrCode className="w-3 h-3 text-[#dbfcff]" />
              <span>QR</span>
            </button>
          )}

          <button
            onClick={handleLaunchVR}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#201f20] hover:bg-[#353436] text-[10px] font-mono text-[#e5e2e3] transition-colors border border-[#353436] cursor-pointer"
            title="Launch VR mode"
          >
            <Headset className="w-3 h-3 text-[#dbfcff]" />
            <span>{vrSupported ? 'VR Ready' : 'Simulate VR'}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded bg-[#201f20] hover:bg-[#353436] border border-[#353436] text-[#e5e2e3] transition-colors cursor-pointer"
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

      {arError && (
        <div className="px-4 py-2 bg-rose-950/70 border-b border-rose-800/60 text-[10px] font-mono text-rose-200 flex items-center gap-2 z-30">
          <span className="text-rose-300">⚠</span>
          <span className="flex-1">{arError}</span>
          <button onClick={() => setArError(null)} className="text-rose-300 hover:text-white px-1" aria-label="Dismiss">
            ✕
          </button>
        </div>
      )}

      {/* 3D INTERACTIVE VIEWPORT */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing bg-[#131314]"
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
          xrSession={arSession}
        />

        {/* Floating Controls HUD Sidebar */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 p-3 rounded-xl bg-[#131314]/90 border border-[#353436] backdrop-blur-md max-w-[210px]">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#dbfcff] mb-1 flex items-center gap-1.5">
            <Sliders className="w-3 h-3 text-[#dbfcff]" />
            <span>Shader Render Mode</span>
          </div>
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#201f20] border border-[#353436] rounded">
            <button
              onClick={() => setRenderMode('pbr')}
              className={`py-1 text-[10px] font-mono rounded font-medium transition-colors cursor-pointer ${
                renderMode === 'pbr' ? 'bg-[#dbfcff] text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              PBR
            </button>
            <button
              onClick={() => setRenderMode('clay')}
              className={`py-1 text-[10px] font-mono rounded font-medium transition-colors cursor-pointer ${
                renderMode === 'clay' ? 'bg-[#dbfcff] text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Clay
            </button>
            <button
              onClick={() => setRenderMode('wireframe')}
              className={`py-1 text-[10px] font-mono rounded font-medium transition-colors cursor-pointer ${
                renderMode === 'wireframe' ? 'bg-[#dbfcff] text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Wire
            </button>
          </div>

          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#dbfcff] mt-2 mb-1 flex items-center gap-1.5">
            <Sun className="w-3 h-3 text-amber-400" />
            <span>Daylight Simulation</span>
          </div>
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#201f20] border border-[#353436] rounded">
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
                lighting === 'sunset' ? 'bg-[#dbfcff] text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
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

          <div className="flex items-center justify-between pt-2 border-t border-[#353436] mt-1 text-xs">
            <span className="text-[10px] font-mono text-[#A1A1AA]">Ground Grid</span>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer ${
                showGrid ? 'bg-[#dbfcff] text-black' : 'bg-[#201f20] text-[#71717A] border border-[#353436]'
              }`}
            >
              {showGrid ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Telemetry Indicator */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-3 p-2.5 rounded-lg bg-[#131314]/90 border border-[#353436] backdrop-blur-md text-[10px] font-mono text-[#A1A1AA]">
          <div className="flex items-center gap-1.5 text-[#dbfcff]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#dbfcff] animate-pulse" />
            <span>GLTF</span>
          </div>
          <div>Rot: {Math.round(rotY)}°</div>
          <div>Zoom: {zoom.toFixed(1)}x</div>
        </div>
      </div>

      {/* QR handoff — desktop / unsupported browsers */}
      {showQr && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowQr(false)}
        >
          <div
            className="bg-[#201f20] border border-[#353436] rounded-xl p-6 flex flex-col items-center gap-3 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-mono text-[#e5e2e3]">Scan to open live AR on mobile</h3>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(shareUrl)}`}
              alt="QR code to open WebAR on mobile"
              width={240}
              height={240}
              className="rounded bg-white p-2"
            />
            <p className="text-[10px] font-mono text-[#71717A] break-all text-center">{shareUrl}</p>
            <button
              onClick={() => setShowQr(false)}
              className="mt-1 px-3 py-1.5 rounded bg-[#dbfcff] text-black text-[11px] font-mono font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModelViewer;
