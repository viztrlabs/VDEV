'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/lib/store';
import { requestARSession, requestVRSession, launchQuickLook, canRequestXR, isQuickLookSupported } from '@/lib/xr/capabilities';
import { DEFAULT_VIEWER_SETTINGS, type ViewerSettings } from '@/lib/xr/viewer-settings';
import { resolveModelUrl, DEMO_MODEL_URL } from '@/lib/storage/resolve-model-url';
import {
  X,
  Box,
  Compass,
  Headset,
  Camera,
  Cuboid,
  Maximize2,
  Minimize2,
  Smartphone,
  QrCode,
  Settings,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Share2,
} from 'lucide-react';

type RenderMode = 'pbr' | 'clay' | 'wireframe';
type Lighting = 'noon' | 'sunset' | 'night';

export interface ModelCanvasApi {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
}

const SHOWCASE_SERVICES = [
  { slug: 'webxr', name: 'WebXR', short: 'WebXR', icon: Box, accent: '#00E5FF' },
  { slug: 'webar', name: 'WebAR', short: 'AR', icon: Camera, accent: '#00E5FF' },
  { slug: 'virtual-reality', name: 'Virtual Reality', short: 'VR', icon: Headset, accent: '#FFB800' },
  { slug: 'virtual-tour', name: 'Virtual Tour', short: 'Tour', icon: Compass, accent: '#3ECF8E' },
  { slug: 'gaussian-splat', name: 'Gaussian Splat', short: 'Splat', icon: Cuboid, accent: '#3ECF8E' },
];

function ViewerLoading({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#131314] text-xs font-mono text-[#dbfcff] animate-pulse">
      {label}
    </div>
  );
}

// Loaded only when the user selects these engines (keeps the initial bundle lean).
const TourViewer = dynamic(() => import('@/components/xr/TourViewer'), {
  ssr: false,
  loading: () => <ViewerLoading label="Loading 360° tour…" />,
});
const GaussianSplatViewer = dynamic(() => import('@/components/xr/GaussianSplatViewer'), {
  ssr: false,
  loading: () => <ViewerLoading label="Loading Gaussian splat…" />,
});

// Demo fallbacks so Tour / Splat load immediately even without project content.
const DEMO_TOUR_SCENE: any = {
  id: 'demo-room',
  name: 'Demo 360° Room',
  type: '360',
  url: 'https://pannellum.org/images/alma.jpg',
  tileUrl: undefined,
  thumbnailUrl: '',
  initialYaw: 0,
  initialPitch: 0,
  initialFov: 90,
  hotspots: [],
  viewConstraints: { top: -90, bottom: 90, left: -180, right: 180, zoomMin: 60, zoomMax: 120, mobileZoomEnabled: false },
  autorotateEnabled: true,
  autorotateSpeed: 0.5,
};
const DEMO_SPLAT_SCENES = [
  { id: 'demo', name: 'Demo Splat', url: 'https://huggingface.co/cakewalk/splat-data/resolve/main/train.splat' },
];

/**
 * Real WebGL model renderer — loads a .glb/.gltf via three.js and honours the
 * orbit / zoom / render-mode / lighting controls, plus WebXR immersive-ar
 * (camera passthrough + hit-test) and immersive-vr (controllers + locomotion).
 */
export function ModelCanvas({
  url,
  settings = DEFAULT_VIEWER_SETTINGS,
  renderMode = 'pbr',
  lighting = 'sunset',
  showGrid = true,
  xrSession = null,
  xrKind = 'ar',
  apiRef,
  resetSignal = 0,
  onError,
  // legacy props kept for the deliverable page; ignored by the new controls
  rotX: _rotX,
  rotY: _rotY,
  zoom: _zoom,
}: {
  url: string;
  settings?: ViewerSettings;
  renderMode?: RenderMode;
  lighting?: Lighting;
  showGrid?: boolean;
  xrSession?: any;
  xrKind?: 'ar' | 'vr';
  apiRef?: React.MutableRefObject<ModelCanvasApi | null>;
  resetSignal?: number;
  onError?: () => void;
  rotX?: number;
  rotY?: number;
  zoom?: number;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<any>(null);
  const settingsRef = useRef<ViewerSettings>(settings);
  settingsRef.current = settings;

  const xrRef = useRef<{
    hitTestSource?: any;
    refSpace?: any;
    reticle?: THREE.Mesh;
  }>({});

  const stateRef = useRef<{
    model?: any;
    modelRoot?: THREE.Group;
    key?: any;
    fill?: any;
    amb?: any;
    clayMaterial?: any;
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    controls?: any;
    initialCamPos?: THREE.Vector3;
  }>({});

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(url ? 'loading' : 'ready');
  const [errorMsg, setErrorMsg] = useState('');

  // Apply live settings (scale / rotation / elevation / auto-rotate / sensitivity).
  const applySettings = useCallback((s: ViewerSettings) => {
    const st = stateRef.current;
    if (st.modelRoot) {
      st.modelRoot.scale.setScalar(s.scale);
      st.modelRoot.rotation.y = THREE.MathUtils.degToRad(s.rotationY);
      st.modelRoot.position.y = s.elevation;
    }
    if (st.controls) {
      st.controls.autoRotate = s.autoRotate;
      st.controls.rotateSpeed = 0.9 * s.sensitivity;
      st.controls.zoomSpeed = 0.9 * s.sensitivity;
    }
  }, []);

  useEffect(() => {
    applySettings(settings);
  }, [settings, applySettings]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (!url) {
      setStatus('ready');
      return;
    }
    let disposed = false;
    const cleanupFns: Array<() => void> = [];

    (async () => {
      try {
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');
        const { KTX2Loader } = await import('three/examples/jsm/loaders/KTX2Loader.js');
        const { MeshoptDecoder } = await import('three/examples/jsm/libs/meshopt_decoder.module.js');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
        if (disposed) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / Math.max(mount.clientHeight, 1), 0.01, 1000);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        renderer.xr.enabled = true;
        mount.appendChild(renderer.domElement);

        // Rig holds camera + controllers so locomotion moves everything together.
        const xrRig = new THREE.Group();
        scene.add(xrRig);
        xrRig.add(camera);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.screenSpacePanning = true;
        controls.autoRotate = settingsRef.current.autoRotate;
        controls.autoRotateSpeed = 0.6;
        controls.enableZoom = true;
        controls.enablePan = true;

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

        model.traverse((o: any) => {
          if (o.isMesh && o.material) o.userData.originalMaterial = o.material;
        });

        // Center the model inside a transform root so settings pivot around its centre.
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        const modelRoot = new THREE.Group();
        modelRoot.add(model);
        scene.add(modelRoot);

        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        camera.position.set(maxDim * 0.8, maxDim * 0.6, maxDim * 1.6);
        controls.target.set(0, 0, 0);
        controls.minDistance = maxDim * 0.25;
        controls.maxDistance = maxDim * 8;
        controls.update();
        stateRef.current.initialCamPos = camera.position.clone();

        const clayMaterial = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.65, metalness: 0.05 });

        const applyMaterialMode = () => {
          model.traverse((o: any) => {
            if (!o.isMesh) return;
            if (renderMode === 'clay') o.material = clayMaterial;
            else if (o.userData.originalMaterial) {
              o.material = o.userData.originalMaterial;
              const mats = Array.isArray(o.material) ? o.material : [o.material];
              for (const m of mats) if (m) { m.wireframe = renderMode === 'wireframe'; m.needsUpdate = true; }
            }
          });
        };

        const applyLighting = () => {
          if (lighting === 'noon') { key.intensity = 3.0; key.color.set(0xffffff); fill.intensity = 1.1; amb.intensity = 0.8; }
          else if (lighting === 'sunset') { key.intensity = 2.2; key.color.set(0xffb27a); fill.intensity = 0.7; amb.intensity = 0.5; }
          else { key.intensity = 0.9; key.color.set(0x9bb8ff); fill.intensity = 0.4; amb.intensity = 0.3; }
        };

        stateRef.current = { model, modelRoot, key, fill, amb, clayMaterial, renderer, scene, camera, controls, initialCamPos: camera.position.clone() };
        applyMaterialMode();
        applyLighting();
        applySettings(settingsRef.current);

        // AR hit-test reticle.
        const reticle = new THREE.Mesh(
          new THREE.RingGeometry(0.08, 0.12, 32).rotateX(-Math.PI / 2),
          new THREE.MeshBasicMaterial({ color: 0x00e5ff, side: THREE.DoubleSide })
        );
        reticle.matrixAutoUpdate = false;
        reticle.visible = false;
        scene.add(reticle);
        xrRef.current.reticle = reticle;

        // WebXR controllers: laser pointers + grip models.
        const raycaster = new THREE.Raycaster();
        const tempMatrix = new THREE.Matrix4();
        const controllers: any[] = [];
        try {
          const { XRControllerModelFactory } = await import('three/examples/jsm/webxr/XRControllerModelFactory.js');
          if (disposed) return;
          const factory = new XRControllerModelFactory();
          const laserGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);
          const laserMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.85 });
          for (let i = 0; i < 2; i++) {
            const controller = renderer.xr.getController(i);
            const grip = renderer.xr.getControllerGrip(i);
            grip.add(factory.createControllerModel(grip));
            const laser = new THREE.Line(laserGeo, laserMat);
            laser.scale.z = 6;
            controller.add(laser);
            controller.addEventListener('selectstart', () => {
              tempMatrix.identity().extractRotation(controller.matrixWorld);
              raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
              raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
              const hits = raycaster.intersectObject(modelRoot, true);
              if (hits[0]) controls.target.copy(hits[0].point);
            });
            controller.addEventListener('squeezestart', () => {
              xrRig.rotation.y += Math.PI / 6; // 30° snap turn
            });
            xrRig.add(controller, grip);
            controllers.push(controller);
            cleanupFns.push(() => {
              controller.removeEventListener('selectstart', () => {});
              laserGeo.dispose();
              laserMat.dispose();
            });
          }
          cleanupFns.push(() => {
            controllers.forEach((c) => xrRig.remove(c));
          });
        } catch {
          /* controllers optional */
        }

        setStatus('ready');

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

        const onDoubleClick = (e: MouseEvent) => {
          const rect = renderer.domElement.getBoundingClientRect();
          const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera);
          const hits = raycaster.intersectObject(modelRoot, true);
          if (hits[0]) controls.target.copy(hits[0].point);
        };
        renderer.domElement.addEventListener('dblclick', onDoubleClick);
        cleanupFns.push(() => renderer.domElement.removeEventListener('dblclick', onDoubleClick));

        const zoomBy = (factor: number) => {
          const offset = camera.position.clone().sub(controls.target).multiplyScalar(factor);
          camera.position.copy(controls.target).add(offset);
          controls.update();
        };
        if (apiRef) {
          apiRef.current = {
            zoomIn: () => zoomBy(0.85),
            zoomOut: () => zoomBy(1.18),
            resetView: () => {
              const ip = stateRef.current.initialCamPos;
              if (ip) camera.position.copy(ip);
              controls.target.set(0, 0, 0);
              controls.update();
            },
          };
        }

        const animate = (time?: number, frame?: any) => {
          if (disposed) return;
          if (renderer.xr.isPresenting) {
            const hit = xrRef.current;
            if (xrKind === 'ar' && hit.hitTestSource && hit.refSpace && frame && model) {
              const results = frame.getHitTestResults(hit.hitTestSource);
              if (results.length > 0) {
                const pose = results[0].getPose(hit.refSpace);
                if (pose && hit.reticle) {
                  hit.reticle.visible = true;
                  hit.reticle.matrix.fromArray(pose.transform.matrix);
                  const p = new THREE.Vector3().setFromMatrixPosition(hit.reticle.matrix);
                  model.position.lerp(p, 0.35);
                }
              } else if (hit.reticle) hit.reticle.visible = false;
            }
            // Thumbstick locomotion (forward/back + snap turn).
            const session = renderer.xr.getSession();
            if (session) {
              for (const src of Array.from(session.inputSources as any)) {
                const gp = (src as any).gamepad;
                if (!gp) continue;
                const ax = gp.axes || [];
                const y = ax[3] ?? ax[1] ?? 0;
                const x = ax[2] ?? ax[0] ?? 0;
                if (Math.abs(y) > 0.15) {
                  const dir = new THREE.Vector3(0, 0, -y * 0.06).applyAxisAngle(new THREE.Vector3(0, 1, 0), xrRig.rotation.y);
                  xrRig.position.add(dir);
                }
                if (Math.abs(x) > 0.15) xrRig.rotation.y -= x * 0.03;
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
          clayMaterial.dispose();
          model.traverse((o: any) => {
            if (o.isMesh) {
              o.geometry?.dispose?.();
              const mats = Array.isArray(o.material) ? o.material : [o.material];
              mats.forEach((m: any) => m?.dispose?.());
            }
          });
          if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
          if (apiRef) apiRef.current = null;
        });
      } catch (err: any) {
        if (disposed) return;
        console.error('ModelViewer WebGL error:', err);
        setStatus('error');
        setErrorMsg(err?.message || 'Failed to load model');
        onError?.();
      }
    })();

    return () => {
      disposed = true;
      cleanupFns.forEach((f) => f());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // Reset view when the parent bumps resetSignal.
  useEffect(() => {
    if (apiRef?.current) apiRef.current.resetView();
  }, [resetSignal, apiRef]);

  // Real WebXR immersive session (AR hit-test or VR controllers).
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
      renderer.xr.setReferenceSpaceType(xrKind === 'ar' ? 'local' : 'local-floor');
    } catch {
      /* ignore */
    }
    scene.background = null;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.background = 'transparent';

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
        if (xrKind === 'ar') {
          const session = renderer.xr.getSession();
          if (!session) return;
          const anySession = session as any;
          const viewerSpace = await anySession.requestReferenceSpace('viewer');
          const refSpace = renderer.xr.getReferenceSpace();
          hitTestSource = await anySession.requestHitTestSource({ space: viewerSpace });
          xrRef.current.hitTestSource = hitTestSource;
          xrRef.current.refSpace = refSpace;
        }
      } catch (e) {
        console.warn('[ModelViewer] XR session setup failed:', e);
      }
    };
    start();

    return () => {
      cancelled = true;
      xrRef.current.hitTestSource = undefined;
      xrRef.current.refSpace = undefined;
      if (xrRef.current.reticle) xrRef.current.reticle.visible = false;
      try { hitTestSource?.cancel?.(); } catch { /* ignore */ }
      try { xrSession.end?.()?.catch?.(() => {}); } catch { /* ignore */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xrSession, xrKind, status]);

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
  const { modelViewerOpen, activeModelUrl, activeModelTitle, closeModelViewer, showToast } = useAppStore();

  const [renderMode, setRenderMode] = useState<RenderMode>('pbr');
  const [lighting, setLighting] = useState<Lighting>('sunset');
  const [showGrid, setShowGrid] = useState(true);
  const [arSupported, setArSupported] = useState(false);
  const [vrSupported, setVrSupported] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [xrSession, setXrSession] = useState<any>(null);
  const [xrError, setXrError] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<ViewerSettings>(DEFAULT_VIEWER_SETTINGS);
  const [resetSignal, setResetSignal] = useState(0);
  const [activeService, setActiveService] = useState('webar');
  const [modelFallback, setModelFallback] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<ModelCanvasApi | null>(null);

  const usdzUrl = activeModelUrl && /\.usdz(\?|$)/i.test(activeModelUrl) ? activeModelUrl : null;
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/xr-world/webar` : '/xr-world/webar';

  // Resolve bare storage keys (e.g. `models/r2-…glb`) to an absolute/root URL,
  // never route-relative (`/admin/models/...`). Falls back to the demo GLB if
  // the resolved asset fails to load.
  const resolvedModelUrl = resolveModelUrl(activeModelUrl);
  useEffect(() => {
    setModelFallback(false);
  }, [activeModelUrl]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'xr' in navigator) {
      (navigator as any).xr?.isSessionSupported?.('immersive-ar').then((r: boolean) => setArSupported(r));
      (navigator as any).xr?.isSessionSupported?.('immersive-vr').then((r: boolean) => setVrSupported(r));
    }
    if (typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search).get('service');
      if (q && SHOWCASE_SERVICES.some((s) => s.slug === q)) {
        setActiveService(q);
        return;
      }
      const p = window.location.pathname;
      const found = SHOWCASE_SERVICES.find((s) => p.includes(s.slug));
      setActiveService(found?.slug || 'webar');
    }
  }, []);

  useEffect(() => {
    if (showQr) {
      const canvas = qrCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const size = 256, gridSize = 21;
      const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
      const finder = (ox: number, oy: number) => {
        for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) grid[oy + y][ox + x] = y <= 1 || y >= 5 || x <= 1 || x >= 5 ? 1 : 0;
      };
      finder(0, 0); finder(gridSize - 7, 0); finder(0, gridSize - 7);
      for (let i = 8; i < gridSize - 8; i++) { grid[6][i] = i % 2; grid[i][6] = i % 2; }
      canvas.width = size; canvas.height = size;
      ctx.fillStyle = '#131314'; ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#e5e2e3';
      const cell = size / gridSize;
      for (let y = 0; y < gridSize; y++) for (let x = 0; x < gridSize; x++) if (grid[y][x]) ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  }, [showQr]);

  if (!modelViewerOpen) return null;

  const endXR = () => {
    try { xrSession?.end?.(); } catch { /* ignore */ }
    setXrSession(null);
  };

  const handleLaunchAR = () => {
    setXrError(null);
    if (xrSession) { endXR(); return; }
    if (usdzUrl && isQuickLookSupported()) { if (launchQuickLook(usdzUrl)) return; }
    if (canRequestXR() && arSupported) {
      requestARSession(hudRef.current)
        .then((s) => { setXrSession(s); })
        .catch((e: any) => { const m = e?.message || 'Failed to start the live AR camera.'; setXrError(m); showToast(m, 'error'); });
      return;
    }
    setXrError('Live camera AR is not supported here. Showing the 3D simulator — scan the QR to open on an AR-capable phone.');
    setShowQr(true);
  };

  const handleLaunchVR = () => {
    setXrError(null);
    if (xrSession) { endXR(); return; }
    if (canRequestXR() && vrSupported) {
      requestVRSession()
        .then((s) => { setXrSession(s); })
        .catch((e: any) => { const m = e?.message || 'Failed to start VR.'; setXrError(m); showToast(m, 'error'); });
      return;
    }
    setXrError('WebXR VR is not supported here. Showing the 3D orbit preview.');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const p = document.documentElement.requestFullscreen?.();
      if (p) p.then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      const p = document.exitFullscreen?.();
      if (p) p.then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // In-place engine switching — never navigates, never unmounts the modal.
  const selectService = (slug: string) => {
    if (slug === activeService) return;
    endXR();
    setActiveService(slug);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('service') !== slug) {
        url.searchParams.set('service', slug);
        window.history.replaceState({}, '', url.toString());
      }
    }
  };

  const isIWSDK = activeService !== 'virtual-tour' && activeService !== 'gaussian-splat';
  const engineKind: 'ar' | 'vr' = activeService === 'webar' ? 'ar' : 'vr';
  const engineBadge =
    activeService === 'virtual-tour'
      ? 'TOUR'
      : activeService === 'gaussian-splat'
        ? 'SPLAT'
        : xrSession
          ? activeService === 'webar'
            ? 'IWSDK • AR'
            : 'IWSDK • VR'
          : activeService === 'webar'
            ? 'IWSDK • AR'
            : 'IWSDK • VR';
  const readyDotClass = xrSession ? 'bg-emerald-400 animate-pulse' : arSupported || vrSupported ? 'bg-emerald-400' : 'bg-amber-400';
  const statusLabel =
    activeService === 'virtual-tour'
      ? '360° tour'
      : activeService === 'gaussian-splat'
        ? 'splat'
        : xrSession
          ? activeService === 'webar'
            ? 'live camera'
            : 'headset'
          : 'orbit preview';

  return (
    <div
      ref={containerRef}
      id="3d-webxr-model-viewer"
      className="fixed inset-0 z-[999] bg-[#131314] text-white select-none animate-in fade-in duration-200"
    >
      {/* Full-bleed viewport — keyed by service so engines swap in place */}
      <div key={activeService} className="absolute inset-0">
        {activeService === 'virtual-tour' ? (
          <TourViewer scene={DEMO_TOUR_SCENE} />
        ) : activeService === 'gaussian-splat' ? (
          <GaussianSplatViewer scenes={DEMO_SPLAT_SCENES} />
        ) : (
          <ModelCanvas
            url={modelFallback ? DEMO_MODEL_URL : resolvedModelUrl}
            settings={settings}
            renderMode={renderMode}
            lighting={lighting}
            showGrid={showGrid}
            xrSession={xrSession}
            xrKind={engineKind}
            apiRef={apiRef}
            resetSignal={resetSignal}
            onError={() => {
              if (!modelFallback && resolvedModelUrl !== DEMO_MODEL_URL) setModelFallback(true);
            }}
          />
        )}
      </div>

      {/* Slim top bar */}
      <div className="absolute top-0 left-0 right-0 z-40 px-3 py-2 flex items-center justify-between gap-2 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/50 border border-white/10 text-[10px] font-mono font-bold uppercase tracking-wider text-[#00E5FF]">
            <Box className="w-3.5 h-3.5" /> WebXR Showcase
          </span>
          <h2 className="text-xs font-mono font-semibold text-white/80 truncate">{activeModelTitle || 'Interactive WebXR Master Model'}</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={toggleFullscreen} className="p-1.5 rounded-lg bg-black/50 border border-white/10 hover:bg-black/70" title="Fullscreen">
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button onClick={closeModelViewer} className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-500" title="Close">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* XR status pill */}
      {xrError && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 max-w-md w-[calc(100%-2rem)] rounded-full border border-rose-500/50 bg-rose-950/85 backdrop-blur px-3 py-1 text-[10px] font-mono text-rose-200 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          <span className="truncate flex-1">{xrError}</span>
          <button onClick={() => setXrError(null)} className="text-rose-300 hover:text-white px-0.5">✕</button>
        </div>
      )}

      {/* Bottom-docked Spatial HUD */}
      <div className="absolute bottom-0 left-0 right-0 z-40 px-2 pb-2 sm:px-4 sm:pb-4 pointer-events-none">
        <div ref={hudRef} className="pointer-events-auto mx-auto max-w-6xl rounded-2xl border border-[#27272A] bg-[#080808]/90 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2">
            {/* LEFT — status */}
            <div className="flex items-center gap-2 min-w-0 shrink-0">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10">
                <Box className="w-4 h-4 text-[#00E5FF]" />
                <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#080808] ${readyDotClass}`} />
              </div>
              <div className="min-w-0 hidden sm:block">
                <div className="truncate text-xs font-semibold leading-tight max-w-[160px]">{activeModelTitle || 'WebAR Showcase'}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[#00E5FF] whitespace-nowrap">{engineBadge}</span>
                  <span className="text-[9px] font-mono text-zinc-500 truncate max-w-[110px]">{statusLabel}</span>
                </div>
              </div>
            </div>

            {/* CENTER — 5 service keys */}
            <nav className="flex-1 flex items-center justify-center gap-0.5 sm:gap-1 min-w-0" aria-label="XR World services">
              {SHOWCASE_SERVICES.map((svc) => {
                const Icon = svc.icon;
                const isActive = activeService === svc.slug;
                return (
                  <button
                    key={svc.slug}
                    onClick={() => selectService(svc.slug)}
                    title={svc.name}
                    className={`group relative flex items-center gap-1.5 px-2 sm:px-2.5 py-2 rounded-xl border transition-all ${
                      isActive ? 'bg-white/[0.07] border-white/20' : 'border-transparent hover:bg-white/[0.05]'
                    }`}
                    style={isActive ? { borderColor: `${svc.accent}66`, boxShadow: `0 0 0 1px ${svc.accent}22` } : undefined}
                  >
                    <Icon className="w-4 h-4" style={{ color: isActive ? svc.accent : undefined }} />
                    <span className={`text-[9px] sm:text-[10px] font-mono uppercase tracking-wider whitespace-nowrap ${isActive ? 'inline text-white' : 'hidden md:group-hover:inline text-zinc-400'}`}>
                      {svc.short}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* RIGHT — actions + utilities */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {isIWSDK && (
                <>
                  {activeService === 'webar' ? (
                    <button
                      onClick={handleLaunchAR}
                      className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#00d4e6] text-black text-[10px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{xrSession ? 'Exit AR' : arSupported ? 'Launch Live AR' : 'Simulate AR'}</span>
                      <span className="sm:hidden">AR</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleLaunchVR}
                      className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-[#FFB800] hover:bg-[#e6a600] text-black text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap"
                    >
                      <Headset className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{xrSession ? 'Exit VR' : 'Enter VR'}</span>
                      <span className="sm:hidden">VR</span>
                    </button>
                  )}

                  <div className="flex items-center rounded-xl border border-[#27272A] bg-white/[0.03] overflow-hidden">
                    <button onClick={() => apiRef.current?.zoomIn()} title="Zoom in" className="p-2 hover:bg-white/[0.08] text-zinc-300"><ZoomIn className="w-4 h-4" /></button>
                    <button onClick={() => apiRef.current?.zoomOut()} title="Zoom out" className="p-2 hover:bg-white/[0.08] text-zinc-300"><ZoomOut className="w-4 h-4" /></button>
                  </div>
                  <button onClick={() => setResetSignal((n) => n + 1)} title="Reset view" className="p-2 rounded-xl border border-[#27272A] bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300"><RotateCcw className="w-4 h-4" /></button>
                  <button onClick={() => setShowSettings((v) => !v)} title="Viewer settings" className="p-2 rounded-xl border border-[#27272A] bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300"><Settings className="w-4 h-4" /></button>
                </>
              )}
              <button onClick={() => setShowQr(true)} title="QR mobile handoff" className="p-2 rounded-xl border border-[#27272A] bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300"><QrCode className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Settings popover */}
          {showSettings && isIWSDK && (
            <div className="border-t border-[#27272A] px-3 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px] font-mono">
              <label className="flex items-center justify-between gap-2 col-span-2 sm:col-span-4">
                <span className="text-zinc-300">Model Position Lock</span>
                <button
                  onClick={() => setSettings((s) => ({ ...s, modelLocked: !s.modelLocked }))}
                  className={`px-2 py-0.5 rounded font-bold ${settings.modelLocked ? 'bg-[#3ECF8E] text-black' : 'bg-[#201f20] text-zinc-400 border border-[#353436]'}`}
                >
                  {settings.modelLocked ? 'LOCKED' : 'UNLOCKED'}
                </button>
              </label>
              <label className={`flex flex-col gap-1 ${settings.modelLocked ? 'opacity-40 pointer-events-none' : ''}`}>
                <span className="text-zinc-400">Scale {settings.scale.toFixed(1)}x</span>
                <input type="range" min={0.1} max={3} step={0.1} value={settings.scale} onChange={(e) => setSettings((s) => ({ ...s, scale: +e.target.value }))} className="accent-[#00E5FF]" />
              </label>
              <label className={`flex flex-col gap-1 ${settings.modelLocked ? 'opacity-40 pointer-events-none' : ''}`}>
                <span className="text-zinc-400">Y-Rotation {Math.round(settings.rotationY)}°</span>
                <input type="range" min={0} max={360} step={1} value={settings.rotationY} onChange={(e) => setSettings((s) => ({ ...s, rotationY: +e.target.value }))} className="accent-[#00E5FF]" />
              </label>
              <label className={`flex flex-col gap-1 ${settings.modelLocked ? 'opacity-40 pointer-events-none' : ''}`}>
                <span className="text-zinc-400">Elevation {settings.elevation.toFixed(2)}m</span>
                <input type="range" min={-1} max={2} step={0.05} value={settings.elevation} onChange={(e) => setSettings((s) => ({ ...s, elevation: +e.target.value }))} className="accent-[#00E5FF]" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-zinc-400">Sensitivity {settings.sensitivity.toFixed(1)}x</span>
                <input type="range" min={0.2} max={2} step={0.1} value={settings.sensitivity} onChange={(e) => setSettings((s) => ({ ...s, sensitivity: +e.target.value }))} className="accent-[#3ECF8E]" />
              </label>
              <div className="flex items-center gap-2 col-span-2">
                <button onClick={() => setSettings((s) => ({ ...s, autoRotate: !s.autoRotate }))} className={`px-2 py-1 rounded border ${settings.autoRotate ? 'bg-[#3ECF8E] text-black border-[#3ECF8E]' : 'bg-[#201f20] text-zinc-300 border-[#353436]'}`}>Auto-Rotate</button>
                <button onClick={() => { setSettings(DEFAULT_VIEWER_SETTINGS); setResetSignal((n) => n + 1); }} className="px-2 py-1 rounded bg-[#201f20] text-zinc-300 border border-[#353436]">Reset All</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR modal */}
      {showQr && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4" onClick={() => setShowQr(false)}>
          <div className="bg-[#080808] border border-[#27272A] rounded-2xl p-6 flex flex-col items-center gap-3 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-mono text-white">Scan to open live AR on mobile</h3>
            <canvas ref={qrCanvasRef} className="rounded bg-white p-2" width={256} height={256} />
            <p className="text-[10px] font-mono text-zinc-500 break-all text-center">{shareUrl}</p>
            <div className="flex gap-2">
              <button onClick={() => setShowQr(false)} className="px-3 py-1.5 rounded bg-[#00E5FF] text-black text-[11px] font-mono font-bold">Close</button>
              <button onClick={async () => { try { await navigator.clipboard.writeText(shareUrl); showToast('Link copied', 'success'); } catch { /* ignore */ } }} className="px-3 py-1.5 rounded bg-[#201f20] text-zinc-200 border border-[#353436] text-[11px] font-mono">Copy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModelViewer;