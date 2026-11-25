'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type * as THREEType from 'three';
import {
  Box,
  Compass,
  Footprints,
  Glasses,
  Loader2,
  MousePointerClick,
  Orbit,
  RotateCcw,
  SlidersHorizontal,
  Smartphone,
  Sun,
  Upload,
  Pause,
  Play,
  AlertCircle,
  Maximize2,
  Minimize2,
  Gamepad2,
  Crosshair,
  X,
} from 'lucide-react';
import type { XRDevice, XRHostInput } from 'iwer';
import {
  isQuickLookSupported,
  launchQuickLook,
  requestARSession,
  requestVRSession,
} from '@/lib/xr/capabilities';

export type DetectedSpatialFormat =
  | 'glb'
  | 'usdz'
  | 'splat'
  | '360-image'
  | '360-video';

export type CameraMode = 'orbit' | 'walk' | 'teleport';
export type LightingPreset = 'noon' | 'sunset' | 'night';
export type SpatialServicePresetId =
  | 'webar'
  | 'webxr'
  | 'virtual-reality'
  | 'virtual-tour'
  | 'gaussian-splat';

export const SPATIAL_SERVICE_PRESETS: Array<{
  id: Exclude<SpatialServicePresetId, 'virtual-reality'>;
  label: string;
  fileUrl: string;
  title: string;
  format: DetectedSpatialFormat;
}> = [
  {
    id: 'webar',
    label: 'WebAR (.glb/.usdz)',
    fileUrl: '/assets/bmw-i8.glb',
    title: 'BMW i8 — WebAR (.glb / .usdz)',
    format: 'glb',
  },
  {
    id: 'webxr',
    label: 'WebXR / VR Walkthrough',
    fileUrl: '/assets/bmw-i8.glb',
    title: 'WebXR / VR Architectural Walkthrough',
    format: 'glb',
  },
  {
    id: 'virtual-tour',
    label: '360° Virtual Tour',
    fileUrl: '/tour/00.jpg',
    title: '360° Equirectangular Virtual Tour',
    format: '360-image',
  },
  {
    id: 'gaussian-splat',
    label: 'Gaussian Splat',
    fileUrl: 'https://sparkjs.dev/assets/splats/butterfly.spz',
    title: 'SparkJS Gaussian Splat',
    format: 'splat',
  },
];

export interface UniversalSpatialViewerProps {
  fileUrl?: string;
  title?: string;
  /** Optional .glb floor collider for Gaussian Splat click-to-teleport */
  colliderUrl?: string;
  /** Optional .usdz asset for iOS Quick Look AR */
  usdzUrl?: string;
  format?: 'auto' | DetectedSpatialFormat;
  initialService?: SpatialServicePresetId;
  /** Optional initial format (e.g. from ?initialFormat=) mapped to a service tab. */
  initialFormat?: DetectedSpatialFormat;
  onClose?: () => void;
  className?: string;
  onFormatDetected?: (fmt: DetectedSpatialFormat) => void;
}

const EXPOSURE_MAP: Record<LightingPreset, { exposure: number; keyIntensity: number; keyColor: number; ambIntensity: number }> = {
  noon: { exposure: 1.25, keyIntensity: 2.8, keyColor: 0xffffff, ambIntensity: 0.85 },
  sunset: { exposure: 1.0, keyIntensity: 2.0, keyColor: 0xffb37a, ambIntensity: 0.55 },
  night: { exposure: 0.65, keyIntensity: 0.9, keyColor: 0x8fb0ff, ambIntensity: 0.35 },
};

export function detectSpatialFormat(urlOrName: string, mimeType?: string): DetectedSpatialFormat {
  let lower = urlOrName.toLowerCase().split('?')[0];
  // UUID-named storage/signed URLs: a filename hint may ride in the query string
  const qIndex = urlOrName.indexOf('?');
  if (qIndex >= 0) {
    try {
      const params = new URLSearchParams(urlOrName.slice(qIndex + 1));
      const hinted = params.get('filename') || params.get('name') || params.get('file');
      if (hinted) lower = hinted.toLowerCase();
    } catch {
      /* malformed query — fall back to the path */
    }
  }
  if (lower.endsWith('.usdz') || mimeType === 'model/vnd.usdz+zip') return 'usdz';
  if (
    lower.endsWith('.splat') ||
    lower.endsWith('.ksplat') ||
    lower.endsWith('.spz') ||
    lower.endsWith('.ply')
  ) {
    return 'splat';
  }
  if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov') || mimeType?.startsWith('video/')) {
    return '360-video';
  }
  if (
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.png') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.avif') ||
    mimeType?.startsWith('image/')
  ) {
    return '360-image';
  }
  return 'glb';
}

/** Map a detected/local format to the service tab that owns it. */
const FORMAT_TO_SERVICE: Record<DetectedSpatialFormat, SpatialServicePresetId> = {
  usdz: 'webar',
  glb: 'webxr',
  splat: 'gaussian-splat',
  '360-image': 'virtual-tour',
  '360-video': 'virtual-tour',
};

/**
 * Resolve which service tab + demo asset the viewer should start on.
 * Priority: explicit initialFormat > initialService (?service= param).
 */
function resolveInitialPreset(
  initialService?: SpatialServicePresetId,
  initialFormat?: DetectedSpatialFormat
) {
  const svc = initialFormat ? FORMAT_TO_SERVICE[initialFormat] : initialService;
  const normalized = svc === 'virtual-reality' ? 'webxr' : svc;
  if (!normalized) return undefined;
  return SPATIAL_SERVICE_PRESETS.find((p) => p.id === normalized);
}

export default function UniversalSpatialViewer({
  fileUrl = '/assets/bmw-i8.glb',
  title = 'Spatial Asset',
  colliderUrl,
  usdzUrl,
  format = 'auto',
  initialService,
  initialFormat,
  onClose,
  className = '',
  onFormatDetected,
}: UniversalSpatialViewerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const usdzBlobUrlRef = useRef<string | null>(null);

  const initialPreset = resolveInitialPreset(initialService, initialFormat);

  const [activeServiceTab, setActiveServiceTab] = useState<string>(
    initialPreset?.id ?? ''
  );
  const [activeUrl, setActiveUrl] = useState<string>(
    initialPreset?.fileUrl ?? fileUrl
  );
  const [activeTitle, setActiveTitle] = useState<string>(
    initialPreset?.title ?? title
  );
  const [activeMime, setActiveMime] = useState<string | undefined>(undefined);
  // Original filename for local uploads (blob:/UUID URLs carry no extension)
  const [activeFileName, setActiveFileName] = useState<string | undefined>(undefined);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cameraMode, setCameraMode] = useState<CameraMode>('orbit');
  const [lighting, setLighting] = useState<LightingPreset>('sunset');
  const [wireframe, setWireframe] = useState(false);
  const [splatLod, setSplatLod] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [simEnabled, setSimEnabled] = useState(false);
  const [simLoading, setSimLoading] = useState(false);
  const [simDevice, setSimDevice] = useState<'quest3' | 'questpro' | 'hand'>('quest3');
  const [simTarget, setSimTarget] = useState<'headset' | 'left' | 'right'>('headset');
  const [xrSupported, setXrSupported] = useState<{ vr: boolean; ar: boolean }>({ vr: false, ar: false });
  const [xrNotice, setXrNotice] = useState<string | null>(null);
  const [resetTick, setResetTick] = useState(0);
  // 360° tour controls
  const [autoRotate, setAutoRotate] = useState(true);
  const [tourFov, setTourFov] = useState(90);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [stereoView, setStereoView] = useState(false);
  // WebAR placement scale: '100' = fit-to-view, '1to1' = authored real-world scale
  const [scaleMode, setScaleMode] = useState<'100' | '1to1'>('100');

  const cameraModeRef = useRef<CameraMode>(cameraMode);
  cameraModeRef.current = cameraMode;
  const activeTabRef = useRef(activeServiceTab);
  activeTabRef.current = activeServiceTab;
  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;
  const gyroRef = useRef(gyroEnabled);
  gyroRef.current = gyroEnabled;
  const simActiveRef = useRef(simEnabled);
  simActiveRef.current = simEnabled;
  const simTargetRef = useRef(simTarget);
  simTargetRef.current = simTarget;
  // Master 360° orientation (single source of truth for mono + stereo eyes)
  const tourPoseRef = useRef({ yaw: 0, pitch: 0, fov: Math.PI / 2 });
  const applyTourPoseRef = useRef<(() => void) | null>(null);
  const xrDeviceRef = useRef<XRDevice | null>(null);
  const hostInputRef = useRef<XRHostInput | null>(null);
  const simSessionRef = useRef<XRSession | null>(null);
  const simPoseRef = useRef({
    headset: { pos: [0, 1.6, 0] as [number, number, number], yaw: 0, pitch: 0 },
    left: { pos: [-0.35, 1.4, -0.5] as [number, number, number], yaw: 0, pitch: 0 },
    right: { pos: [0.35, 1.4, -0.5] as [number, number, number], yaw: 0, pitch: 0 },
  });

  const sceneCtxRef = useRef<{
    THREE?: typeof THREEType;
    renderer?: THREEType.WebGLRenderer;
    scene?: THREEType.Scene;
    camera?: THREEType.PerspectiveCamera;
    rig?: THREEType.Group;
    controls?: any;
    sparkRenderer?: any;
    keyLight?: THREEType.DirectionalLight;
    ambLight?: THREEType.AmbientLight;
    modelRoot?: THREEType.Object3D;
    teleportTargets?: THREEType.Object3D[];
    reticle?: THREEType.Mesh;
    videoEl?: HTMLVideoElement;
    sphere?: THREEType.Mesh;
    controllers?: THREEType.Group[];
    fitScale?: number;
    marzipanoView?: any;
    marzipanoView2?: any;
    initialCamPos?: THREEType.Vector3;
    initialTarget?: THREEType.Vector3;
  }>({});

  useEffect(() => {
    if (initialPreset) {
      setActiveServiceTab(initialPreset.id);
      setActiveUrl(initialPreset.fileUrl);
      setActiveTitle(initialPreset.title);
      setActiveMime(undefined);
      setActiveFileName(undefined);
    } else {
      setActiveUrl(fileUrl);
      setActiveTitle(title);
      setActiveMime(undefined);
      setActiveFileName(undefined);
    }
  }, [fileUrl, title, initialPreset, initialService, initialFormat]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      el.requestFullscreen?.().catch(() => {});
    }
  }, []);

  const resolvedFormat = useMemo<DetectedSpatialFormat>(() => {
    if (format !== 'auto') return format;
    return detectSpatialFormat(activeFileName || activeUrl || activeTitle, activeMime);
  }, [format, activeUrl, activeTitle, activeMime, activeFileName]);

  useEffect(() => {
    onFormatDetected?.(resolvedFormat);
  }, [resolvedFormat, onFormatDetected]);

  // Check native WebXR support
  const refreshXrSupport = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('xr' in navigator)) return;
    const xr = (navigator as any).xr;
    try {
      const [vr, ar] = await Promise.all([
        xr?.isSessionSupported?.('immersive-vr').catch(() => false) ?? false,
        xr?.isSessionSupported?.('immersive-ar').catch(() => false) ?? false,
      ]);
      setXrSupported({ vr: Boolean(vr), ar: Boolean(ar) });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    refreshXrSupport();
  }, [refreshXrSupport]);

  // Revoke local & generated USDZ ObjectURLs on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      if (usdzBlobUrlRef.current) {
        URL.revokeObjectURL(usdzBlobUrlRef.current);
        usdzBlobUrlRef.current = null;
      }
    };
  }, []);

  // Revoke generated USDZ Blob URL whenever the active asset changes
  useEffect(() => {
    return () => {
      if (usdzBlobUrlRef.current) {
        URL.revokeObjectURL(usdzBlobUrlRef.current);
        usdzBlobUrlRef.current = null;
      }
    };
  }, [activeUrl]);

  const handleLocalFile = useCallback((file: File) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setActiveUrl(url);
    setActiveTitle(file.name);
    setActiveMime(file.type || undefined);
    // Preserve the original name so extension-less blob: URLs still detect .ply/.splat/etc.
    setActiveFileName(file.name);
    setError(null);
  }, []);

  // Main engine mount effect (routes automatically by resolvedFormat)
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !activeUrl) return;
    let disposed = false;
    let marzipanoViewer: any = null;
    let rafId = 0;
    const cleanups: Array<() => void> = [];

    setIsLoading(true);
    setError(null);
    sceneCtxRef.current = {};

    if (resolvedFormat === 'usdz') {
      setIsLoading(false);
      return;
    }

    if (resolvedFormat === '360-image') {
      (async () => {
        try {
          const Marzipano = (await import('marzipano')).default ?? (await import('marzipano'));
          if (disposed || !mount) return;
          const source = Marzipano.ImageUrlSource.fromString(activeUrl);
          const geometry = new Marzipano.EquirectGeometry([{ width: 4000 }]);
          const limiter = Marzipano.RectilinearView.limit.traditional(4096, (110 * Math.PI) / 180);

          // Master orientation: the single source of truth for both eyes
          const master = tourPoseRef.current;
          master.fov = (tourFov * Math.PI) / 180;

          const makeView = () =>
            new Marzipano.RectilinearView(
              { yaw: master.yaw, pitch: master.pitch, fov: master.fov },
              limiter
            );

          let view: any;
          let view2: any = null;
          if (stereoView) {
            // Side-by-side stereo: left eye is the input surface, right eye is
            // driven strictly by the master controller (pointer-events: none).
            const leftEl = document.createElement('div');
            leftEl.style.cssText = 'position:absolute;inset:0;width:50%;height:100%;';
            const rightEl = document.createElement('div');
            rightEl.style.cssText = 'position:absolute;inset:0;left:50%;width:50%;height:100%;pointer-events:none;';
            mount.appendChild(leftEl);
            mount.appendChild(rightEl);
            const viewerL = new Marzipano.Viewer(leftEl, { controls: { mouseViewMode: 'drag' } });
            const viewerR = new Marzipano.Viewer(rightEl, { controls: { mouseViewMode: 'drag' } });
            marzipanoViewer = viewerL;
            const sceneL = viewerL.createScene({ source, geometry, view: makeView(), pinFirstLevel: true });
            view = sceneL.view();
            const sceneR = viewerR.createScene({ source, geometry, view: makeView(), pinFirstLevel: true });
            view2 = sceneR.view();
            sceneL.switchTo();
            sceneR.switchTo();
            cleanups.push(() => {
              try { viewerR.destroy?.(); } catch { /* ignore */ }
              leftEl.remove();
              rightEl.remove();
            });
          } else {
            const viewer = new Marzipano.Viewer(mount, { controls: { mouseViewMode: 'drag' } });
            marzipanoViewer = viewer;
            const scene = viewer.createScene({ source, geometry, view: makeView(), pinFirstLevel: true });
            view = scene.view();
            scene.switchTo();
          }
          sceneCtxRef.current.marzipanoView = view;
          sceneCtxRef.current.marzipanoView2 = view2;

          // Interpupillary stereo convergence offset (radians)
          const IPD_YAW_OFFSET = 0.012;
          const applyPose = () => {
            try {
              if (view) {
                view.setYaw(master.yaw);
                view.setPitch(master.pitch);
                view.setFov(master.fov);
              }
              if (view2) {
                view2.setYaw(master.yaw + IPD_YAW_OFFSET);
                view2.setPitch(master.pitch);
                view2.setFov(master.fov);
              }
            } catch { /* ignore */ }
          };
          applyTourPoseRef.current = applyPose;
          applyPose();

          // Single loop: adopt user input (left eye) -> master -> both eyes
          let last = performance.now();
          const tick = () => {
            if (disposed) return;
            const now = performance.now();
            const dt = Math.min((now - last) / 1000, 0.1);
            last = now;
            try {
              if (view2) {
                // Stereo: the left eye is authoritative (no offset applied to it)
                master.yaw = view.yaw();
                master.pitch = view.pitch();
                master.fov = view.fov();
                if (autoRotateRef.current && !gyroRef.current) {
                  master.yaw += dt * 0.12;
                }
              } else if (view) {
                if (gyroRef.current) {
                  // master pose driven by the deviceorientation listener
                } else if (autoRotateRef.current) {
                  view.setYaw(view.yaw() + dt * 0.12);
                  master.yaw = view.yaw();
                  master.pitch = view.pitch();
                  master.fov = view.fov();
                } else {
                  master.yaw = view.yaw();
                  master.pitch = view.pitch();
                  master.fov = view.fov();
                }
              }
              applyPose();
            } catch { /* ignore */ }
            rafId = requestAnimationFrame(tick);
          };
          rafId = requestAnimationFrame(tick);

          // Gyroscope (mobile): device orientation drives the master pose
          const onOrient = (e: DeviceOrientationEvent) => {
            if (!gyroRef.current) return;
            const yaw = ((e.alpha ?? 0) * Math.PI) / 180;
            const pitch = ((e.beta ?? 0) * Math.PI) / 180;
            master.yaw = -yaw;
            master.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch - Math.PI / 2));
            applyPose();
          };
          window.addEventListener('deviceorientation', onOrient);
          cleanups.push(() => window.removeEventListener('deviceorientation', onOrient));

          setIsLoading(false);
        } catch (err) {
          if (!disposed) {
            setError(err instanceof Error ? err.message : 'Failed to load 360° panorama');
            setIsLoading(false);
          }
        }
      })();

      return () => {
        disposed = true;
        applyTourPoseRef.current = null;
        try {
          marzipanoViewer?.destroy?.();
        } catch {
          /* ignore */
        }
        mount.innerHTML = '';
      };
    }

    // Three.js pipeline for: glb | splat (SparkJS) | 360-video
    (async () => {
      try {
        const THREE = await import('three');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
        if (disposed || !mount) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          55,
          mount.clientWidth / Math.max(mount.clientHeight, 1),
          0.05,
          1000
        );
        const rig = new THREE.Group();
        scene.add(rig);
        rig.add(camera);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = EXPOSURE_MAP[lighting].exposure;
        renderer.xr.enabled = true;
        mount.appendChild(renderer.domElement);

        const keyLight = new THREE.DirectionalLight(EXPOSURE_MAP[lighting].keyColor, EXPOSURE_MAP[lighting].keyIntensity);
        keyLight.position.set(6, 10, 6);
        const ambLight = new THREE.AmbientLight(0xffffff, EXPOSURE_MAP[lighting].ambIntensity);
        scene.add(keyLight, ambLight);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;

        // Teleport floor reticle
        const reticle = new THREE.Mesh(
          new THREE.RingGeometry(0.14, 0.22, 32).rotateX(-Math.PI / 2),
          new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide })
        );
        reticle.visible = false;
        scene.add(reticle);

        // Fallback ground plane for teleportation
        const floorPlane = new THREE.Mesh(
          new THREE.PlaneGeometry(120, 120).rotateX(-Math.PI / 2),
          new THREE.MeshBasicMaterial({ visible: false })
        );
        scene.add(floorPlane);
        const teleportTargets: THREEType.Object3D[] = [floorPlane];

        sceneCtxRef.current = {
          THREE,
          renderer,
          scene,
          camera,
          rig,
          controls,
          keyLight,
          ambLight,
          teleportTargets,
          reticle,
        };

        // WebXR controller target-ray groups (populated by the emulated/real session)
        const controllerGroups = [renderer.xr.getController(0), renderer.xr.getController(1)];
        controllerGroups.forEach((g, i) => {
          const isLeft = i === 0;
          const body = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.025, 0.1, 4, 8),
            new THREE.MeshStandardMaterial({ color: isLeft ? 0x00f0ff : 0x54de99, roughness: 0.4 })
          );
          body.rotation.x = Math.PI / 2;
          body.position.z = -0.03;
          const laser = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(0, 0, 0),
              new THREE.Vector3(0, 0, -5),
            ]),
            new THREE.LineBasicMaterial({ color: isLeft ? 0x00f0ff : 0x54de99, transparent: true, opacity: 0.7 })
          );
          g.add(body, laser);
          g.visible = false;
          scene.add(g);
        });
        sceneCtxRef.current.controllers = controllerGroups;

        if (resolvedFormat === '360-video') {
          const video = document.createElement('video');
          video.src = activeUrl;
          video.crossOrigin = 'anonymous';
          video.loop = true;
          video.muted = true;
          video.playsInline = true;
          await video.play().catch(() => {});
          if (disposed) return;

          const texture = new THREE.VideoTexture(video);
          texture.colorSpace = THREE.SRGBColorSpace;
          const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(50, 48, 32).scale(-1, 1, 1),
            new THREE.MeshBasicMaterial({ map: texture })
          );
          scene.add(sphere);
          sceneCtxRef.current.sphere = sphere;
          camera.position.set(0, 0, 0.1);
          controls.target.set(0, 0, 0);
          controls.enableZoom = false;
          sceneCtxRef.current.videoEl = video;
          cleanups.push(() => {
            video.pause();
            video.src = '';
            texture.dispose();
          });
        } else if (resolvedFormat === 'splat') {
          const { SparkRenderer, SplatMesh } = await import('@sparkjsdev/spark');
          if (disposed) return;
          const sparkRenderer = new SparkRenderer({
            renderer,
            enableLod: true,
            lodSplatScale: splatLod,
          });
          scene.add(sparkRenderer);
          sceneCtxRef.current.sparkRenderer = sparkRenderer;

          const splat = new SplatMesh({ url: activeUrl, lod: true });
          await splat.initialized;
          if (disposed) return;
          scene.add(splat);
          sceneCtxRef.current.modelRoot = splat;

          camera.position.set(0, 1.4, 3.5);
          controls.target.set(0, 0.8, 0);

          // Optional .glb floor collider for teleportation inside splats
          if (colliderUrl) {
            try {
              const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
              const gltf = await new GLTFLoader().loadAsync(colliderUrl);
              if (!disposed) {
                gltf.scene.traverse((o: any) => {
                  if (o.isMesh) {
                    o.material = new THREE.MeshBasicMaterial({ visible: false });
                  }
                });
                scene.add(gltf.scene);
                teleportTargets.unshift(gltf.scene);
              }
            } catch {
              /* optional collider failed; floorPlane remains active */
            }
          }

          cleanups.push(() => {
            scene.remove(splat);
            splat.dispose?.();
          });
        } else {
          // GLB / GLTF pipeline with lazy Draco / KTX2 / Meshopt decoders
          const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
          const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');
          const { KTX2Loader } = await import('three/examples/jsm/loaders/KTX2Loader.js');
          const { MeshoptDecoder } = await import('three/examples/jsm/libs/meshopt_decoder.module.js');

          const loader = new GLTFLoader();
          const draco = new DRACOLoader();
          draco.setDecoderPath('/draco/');
          loader.setDRACOLoader(draco);

          const ktx2 = new KTX2Loader();
          ktx2.setTranscoderPath('/basis/');
          ktx2.detectSupport(renderer);
          loader.setKTX2Loader(ktx2);
          loader.setMeshoptDecoder(MeshoptDecoder);

          const gltf = await loader.loadAsync(activeUrl);
          if (disposed) return;

          const model = gltf.scene;
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          model.position.sub(center);
          model.position.y += size.y / 2;

          scene.add(model);
          sceneCtxRef.current.modelRoot = model;
          teleportTargets.unshift(model);

          const maxDim = Math.max(size.x, size.y, size.z) || 2;
          sceneCtxRef.current.fitScale = 2.0 / maxDim;
          camera.position.set(maxDim * 0.9, maxDim * 0.65, maxDim * 1.5);
          controls.target.set(0, size.y * 0.35, 0);
          controls.update();

          cleanups.push(() => {
            draco.dispose();
            ktx2.dispose();
          });
        }

        sceneCtxRef.current.initialCamPos = camera.position.clone();
        sceneCtxRef.current.initialTarget = controls.target.clone();

        // WASD keyboard walk state
        const keys = new Set<string>();
        const onKeyDown = (e: KeyboardEvent) => keys.add(e.code);
        const onKeyUp = (e: KeyboardEvent) => keys.delete(e.code);
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        cleanups.push(() => {
          window.removeEventListener('keydown', onKeyDown);
          window.removeEventListener('keyup', onKeyUp);
        });

        // Floor click-to-teleport raycaster
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        const updatePointer = (e: PointerEvent) => {
          const rect = renderer.domElement.getBoundingClientRect();
          pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        };

        const onPointerMove = (e: PointerEvent) => {
          if (cameraModeRef.current !== 'teleport') {
            reticle.visible = false;
            return;
          }
          updatePointer(e);
          raycaster.setFromCamera(pointer, camera);
          const hits = raycaster.intersectObjects(teleportTargets, true);
          if (hits[0]) {
            reticle.position.copy(hits[0].point);
            reticle.position.y += 0.02;
            reticle.visible = true;
          } else {
            reticle.visible = false;
          }
        };

        const onPointerClick = (e: MouseEvent) => {
          if (cameraModeRef.current !== 'teleport') return;
          const rect = renderer.domElement.getBoundingClientRect();
          pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(pointer, camera);
          const hits = raycaster.intersectObjects(teleportTargets, true);
          if (hits[0]) {
            const p = hits[0].point;
            const forward = new THREE.Vector3();
            camera.getWorldDirection(forward);
            camera.position.set(p.x, p.y + 1.65, p.z);
            controls.target.set(p.x + forward.x * 2, p.y + 1.65 + forward.y * 2, p.z + forward.z * 2);
            controls.update();
          }
        };

        renderer.domElement.addEventListener('pointermove', onPointerMove);
        renderer.domElement.addEventListener('click', onPointerClick);
        cleanups.push(() => {
          renderer.domElement.removeEventListener('pointermove', onPointerMove);
          renderer.domElement.removeEventListener('click', onPointerClick);
        });

        const onResize = () => {
          if (!mount) return;
          camera.aspect = mount.clientWidth / Math.max(mount.clientHeight, 1);
          camera.updateProjectionMatrix();
          renderer.setSize(mount.clientWidth, mount.clientHeight);
        };
        window.addEventListener('resize', onResize);
        cleanups.push(() => window.removeEventListener('resize', onResize));

        const forwardVec = new THREE.Vector3();
        const rightVec = new THREE.Vector3();
        let lastTime = performance.now();

        const renderLoop = () => {
          if (disposed) return;
          const now = performance.now();
          const dt = Math.min((now - lastTime) / 1000, 0.1);
          lastTime = now;

          if (cameraModeRef.current === 'walk' && keys.size > 0) {
            const speed = 3.5 * dt;
            camera.getWorldDirection(forwardVec);
            forwardVec.y = 0;
            forwardVec.normalize();
            rightVec.crossVectors(forwardVec, camera.up).normalize();

            const move = new THREE.Vector3();
            if (keys.has('KeyW') || keys.has('ArrowUp')) move.add(forwardVec);
            if (keys.has('KeyS') || keys.has('ArrowDown')) move.sub(forwardVec);
            if (keys.has('KeyD') || keys.has('ArrowRight')) move.add(rightVec);
            if (keys.has('KeyA') || keys.has('ArrowLeft')) move.sub(rightVec);

            if (move.lengthSq() > 0) {
              move.normalize().multiplyScalar(speed);
              camera.position.add(move);
              controls.target.add(move);
            }
          }

          // 360° video auto-rotate
          if (resolvedFormat === '360-video' && autoRotateRef.current) {
            const sphere = sceneCtxRef.current.sphere;
            if (sphere) sphere.rotation.y += dt * 0.1;
          }

          // WebAR placement reticle preview (always visible on the WebAR tab)
          if (reticle) {
            if (activeTabRef.current === 'webar') {
              reticle.position.set(0, 0.02, 0);
              reticle.visible = true;
            } else if (cameraModeRef.current !== 'teleport') {
              reticle.visible = false;
            }
          }

          // Desktop headset/controller emulation: push keyboard/drag pose into iwer
          const xrDevice = xrDeviceRef.current;
          const hostInput = hostInputRef.current;
          if (simActiveRef.current && xrDevice && hostInput) {
            const pose = simPoseRef.current;
            const target = simTargetRef.current;
            const rotSpeed = 1.6 * dt;
            const moveSpeed = 2.5 * dt;
            const t = pose[target];
            if (keys.has('KeyQ')) t.yaw += rotSpeed;
            if (keys.has('KeyE')) t.yaw -= rotSpeed;
            if (target === 'headset') {
              if (keys.has('KeyW')) t.pos[2] -= moveSpeed;
              if (keys.has('KeyS')) t.pos[2] += moveSpeed;
              if (keys.has('KeyA')) t.pos[0] -= moveSpeed;
              if (keys.has('KeyD')) t.pos[0] += moveSpeed;
            } else {
              if (keys.has('KeyW')) t.pos[2] -= moveSpeed;
              if (keys.has('KeyS')) t.pos[2] += moveSpeed;
              if (keys.has('KeyA')) t.pos[0] -= moveSpeed;
              if (keys.has('KeyD')) t.pos[0] += moveSpeed;
              if (keys.has('KeyR')) t.pos[1] += moveSpeed;
              if (keys.has('KeyF')) t.pos[1] -= moveSpeed;
            }
            // Headset pose
            xrDevice.position.set(pose.headset.pos[0], pose.headset.pos[1], pose.headset.pos[2]);
            const hq = new THREE.Quaternion().setFromEuler(new THREE.Euler(pose.headset.pitch, pose.headset.yaw, 0, 'YXZ'));
            xrDevice.quaternion.set(hq.x, hq.y, hq.z, hq.w);
            // Controller poses (host input state, read by iwer each frame)
            (['left', 'right'] as const).forEach((side) => {
              const st = hostInput[side];
              const p = pose[side];
              const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(p.pitch, p.yaw, 0, 'YXZ'));
              st.targetRay.set([p.pos[0], p.pos[1], p.pos[2], q.x, q.y, q.z, q.w]);
              st.grip.set([p.pos[0], p.pos[1], p.pos[2], q.x, q.y, q.z, q.w]);
              st.targetRayValid = true;
              st.gripValid = true;
            });
            // Controller visibility
            controllerGroups.forEach((g) => {
              g.visible = true;
            });
          } else {
            controllerGroups.forEach((g) => {
              g.visible = false;
            });
          }

          controls.update();
          renderer.render(scene, camera);
        };

        renderer.setAnimationLoop(renderLoop);
        setIsLoading(false);
      } catch (err) {
        if (!disposed) {
          setError(err instanceof Error ? err.message : 'Failed to initialize spatial viewer');
          setIsLoading(false);
        }
      }
    })();

    return () => {
      disposed = true;
      if (rafId) cancelAnimationFrame(rafId);
      const { renderer, controls } = sceneCtxRef.current;
      renderer?.setAnimationLoop(null);
      cleanups.forEach((fn) => fn());
      controls?.dispose?.();
      if (renderer) {
        renderer.dispose();
        renderer.domElement?.parentElement?.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUrl, resolvedFormat, colliderUrl, stereoView]);

  // Live updates: Lighting / Exposure
  useEffect(() => {
    const { renderer, keyLight, ambLight } = sceneCtxRef.current;
    const cfg = EXPOSURE_MAP[lighting];
    if (renderer) renderer.toneMappingExposure = cfg.exposure;
    if (keyLight) {
      keyLight.intensity = cfg.keyIntensity;
      keyLight.color.setHex(cfg.keyColor);
    }
    if (ambLight) ambLight.intensity = cfg.ambIntensity;
  }, [lighting]);

  // Live updates: Wireframe (.glb)
  useEffect(() => {
    const { modelRoot } = sceneCtxRef.current;
    if (!modelRoot || resolvedFormat !== 'glb') return;
    modelRoot.traverse((obj: any) => {
      if (obj.isMesh && obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m: any) => {
          if (m && 'wireframe' in m) {
            m.wireframe = wireframe;
            m.needsUpdate = true;
          }
        });
      }
    });
  }, [wireframe, resolvedFormat]);

  // Live updates: Splat LoD quality
  useEffect(() => {
    const { sparkRenderer } = sceneCtxRef.current;
    if (sparkRenderer) {
      sparkRenderer.lodSplatScale = splatLod;
    }
  }, [splatLod]);

  // Reset View
  useEffect(() => {
    if (resetTick === 0) return;
    const { camera, controls, initialCamPos, initialTarget, marzipanoView } = sceneCtxRef.current;
    if (marzipanoView) {
      tourPoseRef.current.yaw = 0;
      tourPoseRef.current.pitch = 0;
      tourPoseRef.current.fov = (tourFov * Math.PI) / 180;
      applyTourPoseRef.current?.();
    }
    if (camera && controls && initialCamPos && initialTarget) {
      camera.position.copy(initialCamPos);
      controls.target.copy(initialTarget);
      controls.update();
    }
  }, [resetTick]);

  // Lazy-loaded Desktop Headset Simulator (iwer) with auto-launched emulated session
  const handleToggleSimulator = async () => {
    if (simEnabled) {
      // End the emulated session and restore the runtime
      try {
        await simSessionRef.current?.end?.().catch(() => {});
      } catch { /* ignore */ }
      simSessionRef.current = null;
      try {
        xrDeviceRef.current?.uninstallRuntime?.();
      } catch { /* ignore */ }
      xrDeviceRef.current = null;
      hostInputRef.current = null;
      setSimEnabled(false);
      setXrNotice('Headset simulator disabled.');
      refreshXrSupport();
      return;
    }
    setSimLoading(true);
    setXrNotice(null);
    try {
      const { XRDevice, metaQuest3, metaQuestPro } = await import('iwer');
      const profile = simDevice === 'questpro' ? metaQuestPro : metaQuest3;
      const xrDevice = new XRDevice(profile);
      xrDeviceRef.current = xrDevice;
      if (simDevice === 'hand') xrDevice.primaryInputMode = 'hand';
      xrDevice.installRuntime({ forceInstall: true } as any);
      const hostInput = xrDevice.enableHostInput();
      hostInputRef.current = hostInput;
      (['left', 'right'] as const).forEach((side) => {
        hostInput[side].mode = 1; // XRHostInputMode.Controller
      });
      setSimEnabled(true);
      await refreshXrSupport();

      // Auto-launch the emulated immersive session (AR on the WebAR tab)
      const { renderer } = sceneCtxRef.current;
      const mode = activeTabRef.current === 'webar' ? 'immersive-ar' : 'immersive-vr';
      try {
        const xr = (navigator as any).xr;
        const session = await xr?.requestSession?.(mode, {
          optionalFeatures: ['local-floor', 'bounded-floor'],
        });
        if (session && renderer) {
          simSessionRef.current = session;
          await renderer.xr.setSession(session);
          setXrNotice(
            `${simDevice === 'questpro' ? 'Meta Quest Pro' : 'Meta Quest 3'} emulated ${mode} session running — drag or WASD/QE to move the ${simTarget}.`
          );
        } else {
          setXrNotice('Runtime emulated. Click "Enter VR / AR" to launch the session.');
        }
      } catch (err) {
        setXrNotice(err instanceof Error ? err.message : 'Emulated session failed to start.');
      }
    } catch (err) {
      setXrNotice(err instanceof Error ? err.message : 'Failed to load iwer simulator');
    } finally {
      setSimLoading(false);
    }
  };

  // Sim drag-look: drag rotates the selected emulated target; OrbitControls pauses
  useEffect(() => {
    const { renderer, controls } = sceneCtxRef.current;
    if (!renderer || !simEnabled) {
      if (controls) controls.enabled = true;
      return;
    }
    if (controls) controls.enabled = false;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const el = renderer.domElement;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = (e.clientX - lastX) * 0.005;
      const dy = (e.clientY - lastY) * 0.005;
      lastX = e.clientX;
      lastY = e.clientY;
      const t = simPoseRef.current[simTargetRef.current];
      t.yaw -= dx;
      t.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, t.pitch - dy));
    };
    const onUp = () => {
      dragging = false;
    };
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      if (controls) controls.enabled = true;
    };
  }, [simEnabled]);

  // End the emulated session when the viewer unmounts
  useEffect(() => {
    return () => {
      try {
        simSessionRef.current?.end?.().catch(() => {});
      } catch { /* ignore */ }
      try {
        xrDeviceRef.current?.uninstallRuntime?.();
      } catch { /* ignore */ }
    };
  }, []);

  // WebAR scale: 100% fit-to-view vs 1:1 authored real-world scale
  useEffect(() => {
    const { modelRoot, fitScale } = sceneCtxRef.current;
    if (!modelRoot || resolvedFormat === 'splat' || fitScale == null) return;
    const s = scaleMode === '100' ? fitScale : 1;
    modelRoot.scale.setScalar(s);
  }, [scaleMode, resolvedFormat]);

  // Live FOV updates for 360° tour / video (writes the master pose)
  useEffect(() => {
    const rad = (tourFov * Math.PI) / 180;
    const { camera } = sceneCtxRef.current;
    tourPoseRef.current.fov = rad;
    applyTourPoseRef.current?.();
    if (camera && resolvedFormat === '360-video') {
      camera.fov = tourFov;
      camera.updateProjectionMatrix();
    }
  }, [tourFov, resolvedFormat]);

  // Simulator gamepad buttons (fire real WebXR select/squeeze events via iwer)
  const setSimButton = (side: 'left' | 'right', idx: number, pressed: boolean) => {
    const hi = hostInputRef.current;
    if (!hi) return;
    const st = hi[side];
    st.buttonValues[idx] = pressed ? 1 : 0;
    st.buttonPressed[idx] = pressed ? 1 : 0;
    st.buttonTouched[idx] = pressed ? 1 : 0;
  };
  const simButtonProps = (side: 'left' | 'right', idx: number) => ({
    onPointerDown: () => setSimButton(side, idx, true),
    onPointerUp: () => setSimButton(side, idx, false),
    onPointerLeave: () => setSimButton(side, idx, false),
  });
  const handleSimTeleport = () => {
    const side = simTargetRef.current === 'left' ? 'left' : 'right';
    setSimButton(side, 3, true);
    setTimeout(() => setSimButton(side, 3, false), 150);
    const { camera, controls, reticle, THREE } = sceneCtxRef.current;
    if (!camera || !controls || !THREE) return;
    let target: any = null;
    if (reticle?.visible) {
      target = reticle.position.clone();
    } else {
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      target = camera.position.clone().add(dir.multiplyScalar(3));
      target.y = Math.max(target.y, 0);
    }
    camera.position.set(target.x, target.y + 1.65, target.z);
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    controls.target.set(target.x + forward.x * 2, target.y + 1.65 + forward.y * 2, target.z + forward.z * 2);
    controls.update();
  };

  // Enter VR / AR auto-routing
  const handleEnterXR = async () => {
    setXrNotice(null);
    const { renderer } = sceneCtxRef.current;

    if (simActiveRef.current) {
      setXrNotice('Headset simulator session is already running — use the XR Simulator Controls panel.');
      return;
    }

    if (resolvedFormat === 'usdz' || (usdzUrl && isQuickLookSupported())) {
      const targetUsdz = usdzUrl || activeUrl;
      if (launchQuickLook(targetUsdz)) return;
    }

    // On-demand GLB/GLTF -> USDZ conversion for iOS Safari Quick Look
    if (resolvedFormat === 'glb' && !usdzUrl && isQuickLookSupported()) {
      const targetObj = sceneCtxRef.current.modelRoot ?? sceneCtxRef.current.scene;
      if (!targetObj) {
        setXrNotice('Model is still loading — please wait a moment before launching AR.');
        return;
      }
      try {
        setXrNotice('Preparing iOS AR Quick Look (.usdz)…');
        if (!usdzBlobUrlRef.current) {
          const { USDZExporter } = await import('three/examples/jsm/exporters/USDZExporter.js');
          const exporter = new USDZExporter();
          const arraybuffer = await exporter.parseAsync(targetObj);
          const blob = new Blob([arraybuffer], { type: 'model/vnd.usdz+zip' });
          usdzBlobUrlRef.current = URL.createObjectURL(blob);
        }
        const a = document.createElement('a');
        a.rel = 'ar';
        a.href = usdzBlobUrlRef.current;
        a.download = 'model.usdz';
        const img = document.createElement('img');
        img.alt = '';
        a.appendChild(img);
        a.style.position = 'fixed';
        a.style.left = '-9999px';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => a.remove(), 0);
        setXrNotice(null);
        return;
      } catch (err) {
        setXrNotice(err instanceof Error ? err.message : 'Failed to convert model to USDZ for iOS Quick Look.');
        return;
      }
    }

    // Android Scene Viewer fallback for .glb
    const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
    if (isAndroid && !xrSupported.ar && resolvedFormat === 'glb' && activeUrl.startsWith('http')) {
      const intent = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(activeUrl)}&mode=ar_preferred#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;end;`;
      window.location.href = intent;
      return;
    }

    if (!renderer) {
      setXrNotice('Switch to a 3D / Splat scene or enable Headset Simulator to launch WebXR.');
      return;
    }

    try {
      const session = xrSupported.vr
        ? await requestVRSession()
        : xrSupported.ar
        ? await requestARSession()
        : null;
      if (!session) {
        setXrNotice('No WebXR headset detected. Toggle "Headset Simulator" to test on desktop.');
        return;
      }
      await renderer.xr.setSession(session);
    } catch (err) {
      setXrNotice(err instanceof Error ? err.message : 'Unable to start WebXR session');
    }
  };

  return (
    <div
      ref={rootRef}
      className={`relative w-full h-full min-h-[480px] bg-[#131314] text-[#e5e2e3] overflow-hidden select-none rounded-2xl border border-[#353436] ${className}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingFile(true);
      }}
      onDragLeave={() => setIsDraggingFile(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingFile(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleLocalFile(file);
      }}
    >
      {/* Hidden local file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".glb,.gltf,.usdz,.splat,.ksplat,.spz,.ply,.jpg,.jpeg,.png,.webp,.mp4,.webm"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleLocalFile(file);
        }}
      />

      {/* Viewport Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* USDZ Quick Look Card */}
      {resolvedFormat === 'usdz' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-[#131314]">
          <Smartphone className="w-12 h-12 text-[#00F0FF] mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">{activeTitle}</h3>
          <p className="text-xs text-[#A1A1AA] max-w-md mb-5">
            iOS Quick Look (.usdz) asset detected. Tap below on iPhone/iPad Safari to place at true 1:1 architectural scale.
          </p>
          <a
            rel="ar"
            href={activeUrl}
            className="px-6 py-3 rounded-full bg-[#00F0FF] text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition"
          >
            Launch iOS Quick Look
          </a>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && resolvedFormat !== 'usdz' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-[#131314]/90 backdrop-blur-sm">
          <Loader2 className="w-7 h-7 text-[#00F0FF] animate-spin" />
          <span className="text-xs font-mono text-[#dbfcff]">
            Loading {resolvedFormat.toUpperCase()}…
          </span>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-[#131314]/95 p-6 text-center">
          <AlertCircle className="w-7 h-7 text-rose-400" />
          <p className="text-sm font-semibold text-rose-300">{error}</p>
        </div>
      )}

      {/* Drag & Drop Overlay */}
      {isDraggingFile && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-2 bg-[#00F0FF]/10 border-2 border-dashed border-[#00F0FF] backdrop-blur-sm pointer-events-none">
          <Upload className="w-10 h-10 text-[#00F0FF]" />
          <span className="text-sm font-mono font-bold text-white">
            Drop .glb, .usdz, .splat, .spz, .ply, or 360° file to preview
          </span>
        </div>
      )}

      {/* TOP HUD: Title + Service Switcher Tabs + File & XR Actions */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#131314]/85 backdrop-blur-md border border-[#353436] text-xs font-mono">
            <Box className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span className="font-semibold text-white max-w-[180px] truncate">{activeTitle}</span>
            <span className="px-1.5 py-0.5 rounded bg-[#201f20] border border-[#353436] text-[10px] text-[#54de99] uppercase">
              {resolvedFormat}
            </span>
          </div>

          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[#131314]/85 backdrop-blur-md border border-[#353436]">
            {SPATIAL_SERVICE_PRESETS.map((preset) => {
              const isActive = activeServiceTab === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setActiveServiceTab(preset.id);
                    setActiveUrl(preset.fileUrl);
                    setActiveTitle(preset.title);
                    setActiveMime(undefined);
                    setActiveFileName(undefined);
                    setError(null);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono cursor-pointer transition ${
                    isActive
                      ? 'bg-[#00F0FF] text-black font-bold'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-[#201f20]'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#201f20]/90 hover:bg-[#353436] border border-[#353436] text-xs font-mono text-[#e5e2e3] cursor-pointer transition"
          >
            <Upload className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Open Local File</span>
          </button>

          <button
            type="button"
            onClick={handleToggleSimulator}
            disabled={simLoading}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono cursor-pointer transition ${
              simEnabled
                ? 'bg-[#54de99]/20 border-[#54de99] text-[#54de99]'
                : 'bg-[#201f20]/90 hover:bg-[#353436] border-[#353436] text-[#e5e2e3]'
            }`}
          >
            <Glasses className="w-3.5 h-3.5" />
            <span>{simLoading ? 'Loading iwer…' : simEnabled ? 'VR Simulator On' : 'Simulate VR Headset'}</span>
          </button>

          <button
            type="button"
            onClick={handleEnterXR}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#00F0FF] hover:bg-[#33F3FF] text-black font-bold text-xs font-mono cursor-pointer transition"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Enter VR / AR</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Spatial Viewer"
              className="p-2 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white cursor-pointer transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* XR / Simulator Notice Toast */}
      {xrNotice && (
        <div className="absolute top-14 right-3 z-20 max-w-xs px-3 py-2 rounded-xl bg-[#201f20]/95 border border-[#353436] text-[11px] font-mono text-[#dbfcff]">
          {xrNotice}
        </div>
      )}

      {/* XR Simulator Controls (desktop head/controller emulation) */}
      {simEnabled && (
        <div className="absolute top-16 right-3 z-30 w-64 max-h-[70%] overflow-y-auto rounded-xl bg-[#201f20]/95 border border-[#353436] backdrop-blur-md p-3 text-[11px] font-mono pointer-events-auto">
          <div className="flex items-center gap-2 text-[#00F0FF] font-bold mb-2">
            <Gamepad2 className="w-4 h-4" />
            <span>XR Simulator Controls</span>
          </div>
          <label className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[#A1A1AA]">Device</span>
            <select
              aria-label="Simulator device"
              value={simDevice}
              onChange={(e) => setSimDevice(e.target.value as typeof simDevice)}
              className="bg-[#131314] border border-[#353436] rounded px-1.5 py-0.5 text-[#e5e2e3] focus:outline-none cursor-pointer"
            >
              <option value="quest3">Meta Quest 3</option>
              <option value="questpro">Meta Quest Pro</option>
              <option value="hand">Hand Tracking</option>
            </select>
          </label>
          <label className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[#A1A1AA]">Active Target</span>
            <select
              aria-label="Simulator active target"
              value={simTarget}
              onChange={(e) => setSimTarget(e.target.value as typeof simTarget)}
              className="bg-[#131314] border border-[#353436] rounded px-1.5 py-0.5 text-[#e5e2e3] focus:outline-none cursor-pointer"
            >
              <option value="headset">Headset (6DoF)</option>
              <option value="left">Left Controller</option>
              <option value="right">Right Controller</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            <button
              type="button"
              {...simButtonProps(simTarget === 'left' ? 'left' : 'right', 0)}
              className="px-2 py-1 rounded bg-[#131314] border border-[#353436] hover:border-[#00F0FF] text-[#e5e2e3] cursor-pointer select-none touch-none"
            >
              Trigger
            </button>
            <button
              type="button"
              {...simButtonProps(simTarget === 'left' ? 'left' : 'right', 1)}
              className="px-2 py-1 rounded bg-[#131314] border border-[#353436] hover:border-[#00F0FF] text-[#e5e2e3] cursor-pointer select-none touch-none"
            >
              Grip / Squeeze
            </button>
            <button
              type="button"
              onClick={handleSimTeleport}
              className="px-2 py-1 rounded bg-[#131314] border border-[#353436] hover:border-[#00F0FF] text-[#e5e2e3] cursor-pointer"
            >
              Thumbstick Teleport
            </button>
            <button
              type="button"
              {...simButtonProps(simTarget === 'left' ? 'left' : 'right', 4)}
              className="px-2 py-1 rounded bg-[#131314] border border-[#353436] hover:border-[#00F0FF] text-[#e5e2e3] cursor-pointer select-none touch-none"
            >
              A / X Menu
            </button>
          </div>
          <p className="text-[10px] text-[#A1A1AA] mt-2 leading-snug">
            Drag to look · WASD move · Q/E rotate · R/F up/down (controllers). Buttons fire real WebXR select/squeeze events.
          </p>
        </div>
      )}

      {/* BOTTOM HUD: Camera Mode, Lighting, Wireframe / Splat LoD, Reset */}
      {resolvedFormat !== 'usdz' && (
        <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Left dock: WebAR placement / 360° tour / camera modes */}
          {activeServiceTab === 'webar' && resolvedFormat !== '360-image' && resolvedFormat !== '360-video' ? (
            <div className="pointer-events-auto inline-flex items-center gap-2 px-2 py-1.5 rounded-full bg-[#131314]/85 backdrop-blur-md border border-[#353436]">
              <Crosshair className="w-3.5 h-3.5 text-[#00F0FF]" />
              <div className="inline-flex items-center gap-1">
                {(['100', '1to1'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setScaleMode(s)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono cursor-pointer transition ${
                      scaleMode === s ? 'bg-[#00F0FF] text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    {s === '100' ? '100%' : '1:1 Scale'}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleEnterXR}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00F0FF] hover:bg-[#33F3FF] text-black font-bold text-[10px] font-mono cursor-pointer transition"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Launch AR</span>
              </button>
            </div>
          ) : resolvedFormat === '360-image' || resolvedFormat === '360-video' ? (
            <div className="pointer-events-auto inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-full bg-[#131314]/85 backdrop-blur-md border border-[#353436] text-[11px] font-mono">
              {resolvedFormat === '360-video' && (
                <button
                  type="button"
                  onClick={() => {
                    const v = sceneCtxRef.current.videoEl;
                    if (!v) return;
                    if (v.paused) {
                      v.play().catch(() => {});
                      setVideoPlaying(true);
                    } else {
                      v.pause();
                      setVideoPlaying(false);
                    }
                  }}
                  className="inline-flex items-center gap-1 text-[#e5e2e3] hover:text-[#00F0FF] cursor-pointer"
                  title={videoPlaying ? 'Pause 360° Video' : 'Play 360° Video'}
                >
                  {videoPlaying ? <Pause className="w-3.5 h-3.5 text-[#00F0FF]" /> : <Play className="w-3.5 h-3.5 text-[#54de99]" />}
                </button>
              )}
              <button
                type="button"
                onClick={() => setAutoRotate((v) => !v)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border cursor-pointer transition ${
                  autoRotate ? 'border-[#00F0FF] text-[#00F0FF]' : 'border-[#353436] text-[#A1A1AA]'
                }`}
                title="Auto-Rotate"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Auto-Rotate</span>
              </button>
              <label className="inline-flex items-center gap-1.5 text-[#A1A1AA]">
                <SlidersHorizontal className="w-3 h-3" />
                <span>FOV</span>
                <input
                  type="range"
                  min={40}
                  max={110}
                  step={1}
                  value={tourFov}
                  onChange={(e) => setTourFov(parseInt(e.target.value, 10))}
                  className="w-16 accent-[#00F0FF] cursor-pointer"
                />
                <span className="text-[#e5e2e3] w-6">{tourFov}°</span>
              </label>
              {resolvedFormat === '360-image' && (
                <>
                  <button
                    type="button"
                    onClick={() => setGyroEnabled((v) => !v)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border cursor-pointer transition ${
                      gyroEnabled ? 'border-[#00F0FF] text-[#00F0FF]' : 'border-[#353436] text-[#A1A1AA]'
                    }`}
                    title="Gyroscope (mobile)"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Gyro</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStereoView((v) => !v)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border cursor-pointer transition ${
                      stereoView ? 'border-[#00F0FF] text-[#00F0FF]' : 'border-[#353436] text-[#A1A1AA]'
                    }`}
                    title="VR Stereo (side-by-side)"
                  >
                    <Glasses className="w-3.5 h-3.5" />
                    <span>VR Stereo</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="pointer-events-auto inline-flex items-center gap-1 p-1 rounded-full bg-[#131314]/85 backdrop-blur-md border border-[#353436]">
              {(
                [
                  { id: 'orbit', label: 'Orbit', icon: Orbit },
                  { id: 'walk', label: 'Walk (WASD)', icon: Footprints },
                  { id: 'teleport', label: 'Teleport', icon: MousePointerClick },
                ] as const
              ).map((m) => {
                const Icon = m.icon;
                const active = cameraMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setCameraMode(m.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono cursor-pointer transition ${
                      active ? 'bg-[#00F0FF] text-black font-bold' : 'text-[#e5e2e3] hover:bg-[#201f20]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{m.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Lighting, Quality/Wireframe, Reset */}
          <div className="pointer-events-auto inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-full bg-[#131314]/85 backdrop-blur-md border border-[#353436] text-[11px] font-mono">
            {resolvedFormat !== '360-image' && (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <select
                  aria-label="Lighting preset"
                  value={lighting}
                  onChange={(e) => setLighting(e.target.value as LightingPreset)}
                  className="bg-transparent text-[#e5e2e3] focus:outline-none cursor-pointer"
                >
                  <option value="noon" className="bg-[#131314]">Noon</option>
                  <option value="sunset" className="bg-[#131314]">Sunset</option>
                  <option value="night" className="bg-[#131314]">Night</option>
                </select>
              </>
            )}

            {resolvedFormat === 'glb' && (
              <button
                type="button"
                onClick={() => setWireframe((w) => !w)}
                className={`px-2 py-0.5 rounded-full border cursor-pointer transition ${
                  wireframe ? 'border-[#00F0FF] text-[#00F0FF]' : 'border-[#353436] text-[#A1A1AA]'
                }`}
              >
                Wireframe
              </button>
            )}

            {resolvedFormat === 'splat' && (
              <label className="inline-flex items-center gap-1.5 text-[#A1A1AA]">
                <SlidersHorizontal className="w-3 h-3" />
                <span>LoD</span>
                <input
                  type="range"
                  min={0.25}
                  max={2.0}
                  step={0.25}
                  value={splatLod}
                  onChange={(e) => setSplatLod(parseFloat(e.target.value))}
                  className="w-16 accent-[#00F0FF] cursor-pointer"
                />
              </label>
            )}

            <button
              type="button"
              onClick={() => setResetTick((t) => t + 1)}
              className="inline-flex items-center gap-1 text-[#e5e2e3] hover:text-[#00F0FF] cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="inline-flex items-center gap-1 text-[#e5e2e3] hover:text-[#00F0FF] cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
