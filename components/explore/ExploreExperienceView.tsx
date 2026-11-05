'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import * as THREE from 'three';
import {
  ArrowLeft,
  Box,
  Smartphone,
  Headset,
  Compass,
  Sparkles,
  Tv,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Sun,
  Layers,
  RotateCcw,
  Sliders,
  QrCode,
  Scan,
  Activity,
  Cpu,
  Wifi,
  Radio,
  CheckCircle2,
  MapPin,
  Info,
  X,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  Move3d,
  Sparkle
} from 'lucide-react';

export type ExperienceMode = 'xr' | 'ar' | 'vr' | 'vt' | 'splat' | 'pixel-stream';

interface ModeOption {
  id: ExperienceMode;
  key: string;
  altKey: string;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  color: string;
  engine: string;
}

const MODES: ModeOption[] = [
  {
    id: 'xr',
    key: '1',
    altKey: 'X',
    label: 'XR',
    sublabel: '3D Spatial Canvas',
    icon: Box,
    color: '#00F0FF',
    engine: 'Three.js / WebXR',
  },
  {
    id: 'ar',
    key: '2',
    altKey: 'A',
    label: 'AR',
    sublabel: 'Augmented Reality',
    icon: Smartphone,
    color: '#42CF8B',
    engine: 'WebXR Device API / QuickLook',
  },
  {
    id: 'vr',
    key: '3',
    altKey: 'V',
    label: 'VR',
    sublabel: 'Immersive Headset',
    icon: Headset,
    color: '#A855F7',
    engine: 'WebXR 6-DoF Stereo',
  },
  {
    id: 'vt',
    key: '4',
    altKey: 'T',
    label: 'VT',
    sublabel: '360° Virtual Tour',
    icon: Compass,
    color: '#F59E0B',
    engine: 'Equirectangular Spherical',
  },
  {
    id: 'splat',
    key: '5',
    altKey: 'S',
    label: 'SPLAT',
    sublabel: '3D Gaussian Splatting',
    icon: Sparkles,
    color: '#EC4899',
    engine: 'Radiance Field / WebGL2',
  },
  {
    id: 'pixel-stream',
    key: '6',
    altKey: 'P',
    label: 'Pixel Streaming',
    sublabel: 'Unreal Engine 5 Cloud',
    icon: Tv,
    color: '#3B82F6',
    engine: 'WebRTC 4K 60FPS RT',
  },
];

// Synth audio chime generator via Web Audio API
function playSpatialChime(freq = 440, type: OscillatorType = 'sine', duration = 0.12) {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Ignore audio context autoplay limitations
  }
}

export default function ExploreExperienceView() {
  const router = useRouter();
  const [currentMode, setCurrentMode] = useState<ExperienceMode>('xr');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHud, setShowHud] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [fps, setFps] = useState(60);
  const [latency, setLatency] = useState(16);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Play sound on mode change
  const handleModeChange = useCallback(
    (newMode: ExperienceMode) => {
      if (newMode === currentMode) return;
      if (audioEnabled) {
        playSpatialChime(580, 'triangle', 0.15);
      }
      setCurrentMode(newMode);
    },
    [currentMode, audioEnabled]
  );

  // Exit / Back handler
  const handleBack = useCallback(() => {
    if (audioEnabled) playSpatialChime(320, 'sine', 0.1);
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }, [router, audioEnabled]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Keyboard shortcut listeners: 1-6, X, A, V, T, S, P, Esc/B, H, F, M
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.key.toLowerCase();

      if (e.key === 'Escape' || key === 'b') {
        e.preventDefault();
        handleBack();
        return;
      }

      if (key === '1' || key === 'x') {
        e.preventDefault();
        handleModeChange('xr');
      } else if (key === '2' || key === 'a') {
        e.preventDefault();
        handleModeChange('ar');
      } else if (key === '3' || key === 'v') {
        e.preventDefault();
        handleModeChange('vr');
      } else if (key === '4' || key === 't') {
        e.preventDefault();
        handleModeChange('vt');
      } else if (key === '5' || key === 's') {
        e.preventDefault();
        handleModeChange('splat');
      } else if (key === '6' || key === 'p') {
        e.preventDefault();
        handleModeChange('pixel-stream');
      } else if (key === 'h') {
        e.preventDefault();
        setShowHud((prev) => !prev);
      } else if (key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (key === 'm') {
        e.preventDefault();
        setAudioEnabled((prev) => !prev);
      } else if (key === '?') {
        e.preventDefault();
        setShowShortcutsHelp((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBack, handleModeChange, toggleFullscreen]);

  // Dynamic telemetry simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setFps(Math.floor(59 + Math.random() * 2));
      setLatency(Math.floor(14 + Math.random() * 5));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const activeMeta = MODES.find((m) => m.id === currentMode)!;

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-[#050507] text-white select-none font-sans"
    >
      {/* 1. BACKGROUND EXPERIENCE CANVAS / VIEWER LAYER */}
      <div className="absolute inset-0 z-0">
        {currentMode === 'xr' && <XRCanvasView />}
        {currentMode === 'ar' && <ARSimulationView />}
        {currentMode === 'vr' && <VRHeadsetView />}
        {currentMode === 'vt' && <VirtualTourCanvasView />}
        {currentMode === 'splat' && <SplatCanvasView />}
        {currentMode === 'pixel-stream' && <PixelStreamingLiveView />}
      </div>

      {/* 2. CHROME & HUD OVERLAY (Can be toggled via [H] key for cinema mode) */}
      <div
        className={`absolute inset-0 pointer-events-none z-30 transition-opacity duration-300 ${
          showHud ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* TOP BAR */}
        <div className="flex items-center justify-between p-4 sm:p-6 w-full">
          {/* ONLY BACK BUTTON (with high-end cyber glassmorphism) */}
          <div className="pointer-events-auto flex items-center gap-3">
            <button
              onClick={handleBack}
              title="Exit Experience [Esc / B]"
              aria-label="Exit Experience"
              className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#0E0E12]/85 hover:bg-[#181820] backdrop-blur-xl border border-white/10 hover:border-[#00F0FF]/50 text-white shadow-2xl transition-all duration-200 cursor-pointer active:scale-95"
            >
              <div className="w-6 h-6 rounded-full bg-white/5 group-hover:bg-[#00F0FF]/20 flex items-center justify-center transition-colors">
                <ArrowLeft className="w-3.5 h-3.5 text-zinc-300 group-hover:text-[#00F0FF] transition-colors" />
              </div>
              <span className="text-xs font-semibold tracking-wider uppercase text-zinc-200 group-hover:text-white">
                Back
              </span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-white/10 text-zinc-400 group-hover:text-zinc-200 border border-white/5">
                ESC
              </kbd>
            </button>

            {/* Active Mode Badge Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: activeMeta.color }}
              />
              <span className="font-mono text-zinc-400">Mode:</span>
              <span className="font-bold text-white tracking-wide">{activeMeta.label}</span>
              <span className="text-[11px] text-zinc-500 font-mono">({activeMeta.engine})</span>
            </div>
          </div>

          {/* TOP RIGHT TELEMETRY & CONTROLS HUD */}
          <div className="pointer-events-auto flex items-center gap-2">
            {/* FPS & Latency telemetry pill */}
            <div className="hidden lg:flex items-center gap-3 px-3.5 py-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#42CF8B]" />
                <span className="text-zinc-300">{fps} FPS</span>
              </div>
              <span className="text-zinc-600">|</span>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span className="text-zinc-300">{latency} ms</span>
              </div>
              <span className="text-zinc-600">|</span>
              <span className="text-[10px] text-[#42CF8B] font-bold tracking-widest uppercase">
                4K HDR
              </span>
            </div>

            {/* Shortcuts Guide Toggle */}
            <button
              onClick={() => setShowShortcutsHelp((prev) => !prev)}
              title="Keyboard Shortcuts [?]"
              className="w-10 h-10 rounded-full bg-[#0E0E12]/80 hover:bg-[#181820] backdrop-blur-xl border border-white/10 hover:border-white/30 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setAudioEnabled((prev) => !prev)}
              title={audioEnabled ? 'Mute Spatial Audio [M]' : 'Enable Audio [M]'}
              className="w-10 h-10 rounded-full bg-[#0E0E12]/80 hover:bg-[#181820] backdrop-blur-xl border border-white/10 hover:border-white/30 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              {audioEnabled ? (
                <Volume2 className="w-4 h-4 text-[#00F0FF]" />
              ) : (
                <VolumeX className="w-4 h-4 text-zinc-500" />
              )}
            </button>

            {/* Cinema Mode Toggle (Hide HUD) */}
            <button
              onClick={() => setShowHud((prev) => !prev)}
              title="Toggle HUD / Cinema View [H]"
              className="w-10 h-10 rounded-full bg-[#0E0E12]/80 hover:bg-[#181820] backdrop-blur-xl border border-white/10 hover:border-white/30 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              title="Toggle Fullscreen [F]"
              className="w-10 h-10 rounded-full bg-[#0E0E12]/80 hover:bg-[#181820] backdrop-blur-xl border border-white/10 hover:border-white/30 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* 3. CENTER / BOTTOM FLOATING MODE TOGGLE DOCK */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center px-4">
          <div className="pointer-events-auto flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-2xl sm:rounded-full bg-[#0A0A0E]/90 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-x-auto max-w-full">
            {MODES.map((mode) => {
              const Icon = mode.icon;
              const isActive = currentMode === mode.id;

              return (
                <button
                  key={mode.id}
                  onClick={() => handleModeChange(mode.id)}
                  className={`
                    relative group flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-full
                    transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95
                    ${
                      isActive
                        ? 'text-black font-bold shadow-lg'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                  style={{
                    backgroundColor: isActive ? mode.color : 'transparent',
                    boxShadow: isActive ? `0 0 24px ${mode.color}66` : 'none',
                  }}
                  title={`${mode.label} (${mode.sublabel}) — Shortcut: [${mode.key}]`}
                >
                  <Icon
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isActive ? 'scale-110 text-black' : 'group-hover:scale-110'
                    }`}
                  />
                  <div className="flex flex-col text-left">
                    <span
                      className={`text-xs font-bold tracking-wider ${
                        isActive ? 'text-black' : 'text-zinc-200'
                      }`}
                    >
                      {mode.label}
                    </span>
                  </div>

                  {/* Keyboard key tag */}
                  <kbd
                    className={`
                      ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors
                      ${
                        isActive
                          ? 'bg-black/20 text-black'
                          : 'bg-white/10 text-zinc-400 group-hover:text-white'
                      }
                    `}
                  >
                    {mode.key}
                  </kbd>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. KEYBOARD SHORTCUTS MODAL / OVERLAY */}
        {showShortcutsHelp && (
          <div className="pointer-events-auto fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-[#0F0F14] border border-white/15 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkle className="w-4 h-4 text-[#00F0FF]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Experience Hotkeys
                  </h3>
                </div>
                <button
                  onClick={() => setShowShortcutsHelp(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 py-4 text-xs font-mono">
                {MODES.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5"
                  >
                    <span className="text-zinc-300">{m.label} Mode</span>
                    <kbd className="px-2 py-0.5 rounded bg-white/10 text-[#00F0FF] font-bold">
                      [{m.key}] or [{m.altKey}]
                    </kbd>
                  </div>
                ))}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-zinc-300">Exit / Back</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/10 text-[#42CF8B] font-bold">
                    [Esc] / [B]
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-zinc-300">Cinema View (HUD)</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">
                    [H]
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-zinc-300">Toggle Fullscreen</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">
                    [F]
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-zinc-300">Spatial Audio</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">
                    [M]
                  </kbd>
                </div>
              </div>

              <div className="pt-2 text-center text-[11px] text-zinc-500 font-mono">
                Press any key to execute action instantly. Press [?] to close.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden HUD quick-restore prompt */}
      {!showHud && (
        <button
          onClick={() => setShowHud(true)}
          className="fixed top-4 right-4 z-40 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/10 text-xs font-mono text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span>Show UI [H]</span>
        </button>
      )}
    </div>
  );
}

// ============================================================================
// MODE 1: XR — INTERACTIVE 3D SPATIAL CANVAS
// ============================================================================
function XRCanvasView() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [modelType, setModelType] = useState<'apex' | 'interior' | 'vehicle'>('interior');
  const [renderShader, setRenderShader] = useState<'pbr' | 'wireframe' | 'clay'>('pbr');
  const [lightingPreset, setLightingPreset] = useState<'noon' | 'sunset' | 'cyber'>('noon');
  const [autoRotate, setAutoRotate] = useState(true);

  const modelUrls = {
    interior: '/models/interior.glb',
    apex: '/models/apex-tower-v3-draco.glb',
    vehicle: '/assets/bmw-i8.glb',
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let raf = 0;

    (async () => {
      try {
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

        if (disposed) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          45,
          mount.clientWidth / Math.max(mount.clientHeight, 1),
          0.1,
          1000
        );
        camera.position.set(4, 3, 5);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        mount.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = 0.8;

        // Dynamic Lighting
        const keyLight = new THREE.DirectionalLight(
          lightingPreset === 'sunset' ? 0xffaa66 : lightingPreset === 'cyber' ? 0x00f0ff : 0xffffff,
          2.6
        );
        keyLight.position.set(6, 12, 8);

        const fillLight = new THREE.DirectionalLight(
          lightingPreset === 'cyber' ? 0xff0088 : 0x88bbff,
          1.2
        );
        fillLight.position.set(-6, 4, -6);

        const ambientLight = new THREE.AmbientLight(0xffffff, lightingPreset === 'cyber' ? 0.3 : 0.8);
        scene.add(keyLight, fillLight, ambientLight);

        // Cyber floor grid
        const grid = new THREE.GridHelper(16, 32, 0x00f0ff, 0x222228);
        (grid.material as THREE.Material).opacity = 0.35;
        (grid.material as THREE.Material).transparent = true;
        grid.position.y = -0.01;
        scene.add(grid);

        // Fallback procedural geometry if glb fails or is loading
        const placeholderGroup = new THREE.Group();
        const boxGeo = new THREE.BoxGeometry(2, 1.4, 2);
        const mat = new THREE.MeshStandardMaterial({
          color: 0x27272a,
          roughness: 0.2,
          metalness: 0.8,
        });
        const boxMesh = new THREE.Mesh(boxGeo, mat);
        boxMesh.position.y = 0.7;
        placeholderGroup.add(boxMesh);
        scene.add(placeholderGroup);

        // Load Real GLTF model
        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/draco/');
        loader.setDRACOLoader(dracoLoader);

        const targetUrl = modelUrls[modelType];
        loader.load(
          targetUrl,
          (gltf) => {
            if (disposed) return;
            scene.remove(placeholderGroup);
            const model = gltf.scene;

            // Compute bounding box to center & scale
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 3.5 / (maxDim || 1);

            model.scale.setScalar(scale);
            model.position.sub(center.multiplyScalar(scale));
            model.position.y += (size.y * scale) / 2;

            // Apply Render Shader
            model.traverse((o: any) => {
              if (o.isMesh && o.material) {
                if (renderShader === 'wireframe') {
                  o.material = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true });
                } else if (renderShader === 'clay') {
                  o.material = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8, metalness: 0.05 });
                }
              }
            });

            scene.add(model);
          },
          undefined,
          () => {
            // Keep procedural box on error
          }
        );

        // Resize observer
        const handleResize = () => {
          if (!mount || !renderer || !camera) return;
          camera.aspect = mount.clientWidth / Math.max(mount.clientHeight, 1);
          camera.updateProjectionMatrix();
          renderer.setSize(mount.clientWidth, mount.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        // Render loop
        const animate = () => {
          if (disposed) return;
          controls.update();
          renderer.render(scene, camera);
          raf = requestAnimationFrame(animate);
        };
        raf = requestAnimationFrame(animate);

        return () => {
          disposed = true;
          cancelAnimationFrame(raf);
          window.removeEventListener('resize', handleResize);
          dracoLoader.dispose();
          renderer.dispose();
          if (mount.contains(renderer.domElement)) {
            mount.removeChild(renderer.domElement);
          }
        };
      } catch (err) {
        console.error('XRCanvas init error:', err);
      }
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
    };
  }, [modelType, renderShader, lightingPreset, autoRotate]);

  return (
    <div className="relative w-full h-full">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Contextual Sidebar Controls */}
      <div className="absolute top-24 left-4 sm:left-6 z-20 flex flex-col gap-2.5 max-w-xs">
        <div className="p-3.5 rounded-2xl bg-[#0C0C10]/85 backdrop-blur-2xl border border-white/10 shadow-2xl text-xs flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-[#00F0FF]" /> XR Canvas Controls
            </span>
            <span className="text-[10px] text-[#00F0FF] font-mono">Interactive 3D</span>
          </div>

          {/* Model Switcher */}
          <div className="flex flex-col gap-1.5">
            <span className="text-zinc-400 text-[10px] uppercase font-mono">Asset Model</span>
            <div className="grid grid-cols-3 gap-1">
              {(['interior', 'apex', 'vehicle'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setModelType(m)}
                  className={`py-1.5 px-2 rounded-lg text-center font-mono capitalize transition-all cursor-pointer ${
                    modelType === m
                      ? 'bg-[#00F0FF] text-black font-bold'
                      : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  {m === 'apex' ? 'Tower' : m}
                </button>
              ))}
            </div>
          </div>

          {/* Shader Mode */}
          <div className="flex flex-col gap-1.5">
            <span className="text-zinc-400 text-[10px] uppercase font-mono">Material Shader</span>
            <div className="grid grid-cols-3 gap-1">
              {(['pbr', 'clay', 'wireframe'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setRenderShader(s)}
                  className={`py-1.5 px-2 rounded-lg text-center font-mono uppercase transition-all cursor-pointer ${
                    renderShader === s
                      ? 'bg-white text-black font-bold'
                      : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Lighting Preset */}
          <div className="flex flex-col gap-1.5">
            <span className="text-zinc-400 text-[10px] uppercase font-mono">Lighting Environment</span>
            <div className="grid grid-cols-3 gap-1">
              {(['noon', 'sunset', 'cyber'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLightingPreset(l)}
                  className={`py-1.5 px-2 rounded-lg text-center font-mono capitalize transition-all cursor-pointer ${
                    lightingPreset === l
                      ? 'bg-[#42CF8B] text-black font-bold'
                      : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Orbit controls info */}
          <div className="pt-1 flex items-center justify-between text-[10px] text-zinc-500 font-mono border-t border-white/5">
            <span>Left Click: Orbit</span>
            <span>Scroll: Zoom</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODE 2: AR — AUGMENTED REALITY SPATIAL VIEW
// ============================================================================
function ARSimulationView() {
  const [scaleMode, setScaleMode] = useState<'1:1' | '1:10'>('1:1');
  const [surfaceDetected, setSurfaceDetected] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
      {/* Live Architectural Video Background Simulation */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-70">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=85"
          alt="AR Passthrough Room Environment"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60" />
      </div>

      {/* AR HUD Reticle & Measurement Hologram */}
      <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
        {/* Holographic Target Reticle */}
        <div className="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center">
          {/* Outer pulsed rings */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#42CF8B]/40 animate-[spin_18s_linear_infinite]" />
          <div className="absolute inset-6 rounded-full border border-[#42CF8B]/60 animate-pulse" />
          <div className="absolute inset-16 rounded-full border border-dashed border-cyan-400/40 animate-[spin_10s_linear_infinite_reverse]" />

          {/* Center reticle crosshairs */}
          <div className="w-16 h-16 border-2 border-[#42CF8B] rounded-lg flex items-center justify-center relative shadow-[0_0_20px_#42CF8B88]">
            <div className="w-2 h-2 rounded-full bg-[#42CF8B] animate-ping" />
          </div>

          {/* Real-time spatial dimension tags */}
          <div className="absolute -top-6 px-3 py-1 rounded bg-[#42CF8B]/20 backdrop-blur-md border border-[#42CF8B]/40 text-[#42CF8B] font-mono text-xs shadow-lg">
            FLOOR PLANE LOCKED (Y: 0.00m)
          </div>
          <div className="absolute -bottom-6 px-3 py-1 rounded bg-black/70 backdrop-blur-md border border-white/20 text-white font-mono text-xs">
            SCALE: {scaleMode === '1:1' ? '1:1 TRUE ARCHITECTURAL SCALE' : '1:10 TABLETOP HOLOGRAM'}
          </div>
          <div className="absolute -left-16 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-black/70 font-mono text-[10px] text-zinc-300 border border-white/10">
            W: 14.8m
          </div>
          <div className="absolute -right-16 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-black/70 font-mono text-[10px] text-zinc-300 border border-white/10">
            H: 3.4m
          </div>
        </div>
      </div>

      {/* Floating AR Action Controls */}
      <div className="absolute top-24 left-4 sm:left-6 z-20 flex flex-col gap-2 max-w-xs">
        <div className="p-4 rounded-2xl bg-[#0C0C10]/85 backdrop-blur-2xl border border-white/10 shadow-2xl text-xs flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Scan className="w-3.5 h-3.5 text-[#42CF8B]" /> WebAR Session
            </span>
            <span className="text-[10px] text-[#42CF8B] font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#42CF8B] animate-pulse" /> Tracking
            </span>
          </div>

          {/* Scale Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-zinc-400 text-[10px] uppercase font-mono">Scale Ratio</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setScaleMode('1:1')}
                className={`py-2 px-3 rounded-lg font-mono text-xs transition-all cursor-pointer ${
                  scaleMode === '1:1'
                    ? 'bg-[#42CF8B] text-black font-bold'
                    : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                }`}
              >
                1:1 Full Scale
              </button>
              <button
                onClick={() => setScaleMode('1:10')}
                className={`py-2 px-3 rounded-lg font-mono text-xs transition-all cursor-pointer ${
                  scaleMode === '1:10'
                    ? 'bg-[#42CF8B] text-black font-bold'
                    : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                }`}
              >
                1:10 Tabletop
              </button>
            </div>
          </div>

          {/* Launch on Mobile Button */}
          <button
            onClick={() => setShowQrModal(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#42CF8B] to-[#00F0FF] text-black font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer shadow-lg"
          >
            <QrCode className="w-4 h-4" /> Open AR on Mobile Phone
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#121218] border border-white/20 rounded-2xl p-6 flex flex-col items-center gap-4 text-center">
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Scan With Mobile Phone
              </span>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated QR Code box */}
            <div className="w-48 h-48 rounded-xl bg-white p-3 flex items-center justify-center shadow-2xl">
              <div className="w-full h-full border-4 border-black flex flex-col items-center justify-center text-black font-mono font-bold text-xs p-2 text-center">
                <QrCode className="w-24 h-24 text-black mb-1" />
                <span className="text-[10px]">SCAN FOR WEBAR / QUICKLOOK</span>
              </div>
            </div>

            <p className="text-xs text-zinc-400">
              Point your iPhone or Android camera at the QR code to view this architecture model in your physical room with AR QuickLook / Scene Viewer.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MODE 3: VR — IMMERSIVE WEBXR HEADSET MODE
// ============================================================================
function VRHeadsetView() {
  const [ipd, setIpd] = useState(64);
  const [isStereo, setIsStereo] = useState(true);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#020204]">
      {/* Dual Barrel Eye Viewport Simulation */}
      <div className={`w-full h-full flex ${isStereo ? 'flex-row' : 'flex-col'}`}>
        {/* Left Eye */}
        <div className="relative flex-1 h-full overflow-hidden border-r border-white/10">
          <Image
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85"
            alt="VR Left Eye"
            fill
            className="object-cover scale-105"
            priority
          />
          {/* Barrel Vignette */}
          <div className="absolute inset-0 rounded-full border-[30px] border-black/80 pointer-events-none" />
          <div className="absolute bottom-6 left-6 px-3 py-1 rounded bg-black/60 backdrop-blur-md text-[11px] font-mono text-[#A855F7] border border-[#A855F7]/30">
            LEFT EYE • 90Hz
          </div>
        </div>

        {/* Right Eye (Stereo) */}
        {isStereo && (
          <div className="relative flex-1 h-full overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85"
              alt="VR Right Eye"
              fill
              className="object-cover scale-105 translate-x-2"
              priority
            />
            {/* Barrel Vignette */}
            <div className="absolute inset-0 rounded-full border-[30px] border-black/80 pointer-events-none" />
            <div className="absolute bottom-6 right-6 px-3 py-1 rounded bg-black/60 backdrop-blur-md text-[11px] font-mono text-[#A855F7] border border-[#A855F7]/30">
              RIGHT EYE • 90Hz
            </div>
          </div>
        )}
      </div>

      {/* Center Separation Line */}
      <div className="absolute inset-y-0 left-1/2 w-0.5 bg-black/80 -translate-x-1/2 pointer-events-none" />

      {/* Floating VR Headset Control Sidebar */}
      <div className="absolute top-24 left-4 sm:left-6 z-20 flex flex-col gap-2 max-w-xs">
        <div className="p-4 rounded-2xl bg-[#0C0C10]/85 backdrop-blur-2xl border border-white/10 shadow-2xl text-xs flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Headset className="w-3.5 h-3.5 text-[#A855F7]" /> WebXR VR Mode
            </span>
            <span className="text-[10px] text-[#A855F7] font-mono">6-DoF Ready</span>
          </div>

          {/* Stereo vs Mono toggle */}
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-xs">Stereoscopic Dual Lenses</span>
            <button
              onClick={() => setIsStereo((prev) => !prev)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                isStereo ? 'bg-[#A855F7] text-white' : 'bg-white/10 text-zinc-400'
              }`}
            >
              {isStereo ? 'DUAL' : 'SINGLE'}
            </button>
          </div>

          {/* IPD Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-zinc-400 text-[10px] font-mono">
              <span>IPD Spacing</span>
              <span className="text-white font-bold">{ipd} mm</span>
            </div>
            <input
              type="range"
              min={58}
              max={72}
              value={ipd}
              onChange={(e) => setIpd(Number(e.target.value))}
              className="w-full accent-[#A855F7] bg-white/10 rounded-lg cursor-pointer"
            />
          </div>

          {/* Enter VR Button */}
          <button
            onClick={() => {
              if (typeof navigator !== 'undefined' && (navigator as any).xr) {
                (navigator as any).xr
                  .requestSession('immersive-vr')
                  .then(() => alert('WebXR VR session started!'))
                  .catch((err: any) =>
                    alert('WebXR Headset not detected on this browser/hardware: ' + err.message)
                  );
              } else {
                alert('WebXR API is not supported in this browser or requires a connected VR headset (Meta Quest / HTC Vive / Apple Vision Pro).');
              }
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#EC4899] text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer shadow-lg"
          >
            <Headset className="w-4 h-4" /> Enter WebXR VR Headset
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODE 4: VT — 360° PHOTOREALISTIC VIRTUAL TOUR
// ============================================================================
function VirtualTourCanvasView() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<any | null>(null);

  const rooms = [
    {
      id: '00',
      name: 'Penthouse Living Gallery',
      url: '/360-images/00.jpg',
      hotspots: [
        {
          id: 'hs-1',
          x: 48,
          y: 52,
          title: 'Bookmatched Calacatta Marble Island',
          desc: 'Custom-milled Italian Calacatta marble with concealed induction cooktops and bronze shadowline reveals.',
        },
        {
          id: 'hs-2',
          x: 75,
          y: 44,
          title: 'Floor-to-Ceiling Acoustic Glazing',
          desc: 'High-performance Low-E double glazing with motorized automated blackout & sheer solar shading.',
        },
      ],
    },
    {
      id: '01',
      name: 'Sky Lounge & Terrace',
      url: '/360-images/01.jpg',
      hotspots: [
        {
          id: 'hs-3',
          x: 32,
          y: 50,
          title: 'Flush Sill Threshold',
          desc: 'Seamless zero-step transition to the outdoor heated travertine deck.',
        },
      ],
    },
    {
      id: '02',
      name: 'Master Sanctuary Suite',
      url: '/360-images/02.jpg',
      hotspots: [
        {
          id: 'hs-4',
          x: 60,
          y: 48,
          title: 'Custom White Oak Millwork',
          desc: 'Integrated ambient LED lighting with concealed acoustic insulation backing.',
        },
      ],
    },
    {
      id: '04',
      name: 'Architectural Kitchen & Dining',
      url: '/360-images/04.jpg',
      hotspots: [
        {
          id: 'hs-5',
          x: 50,
          y: 54,
          title: 'Polished Terrazzo Flooring',
          desc: 'Continuous cast-in-place terrazzo with integrated radiant hydronic floor heating.',
        },
      ],
    },
  ];

  const currentRoom = rooms[activeRoomIndex];

  // 360 Spherical Panorama Renderer with Three.js
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let raf = 0;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / Math.max(mount.clientHeight, 1),
      0.1,
      1000
    );
    camera.position.set(0, 0, 0.1);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Inverted Sphere for 360 panorama projection
    const sphereGeo = new THREE.SphereGeometry(50, 64, 40);
    sphereGeo.scale(-1, 1, 1);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(currentRoom.url, (texture) => {
      if (disposed) return;
      texture.colorSpace = THREE.SRGBColorSpace;
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const sphereMesh = new THREE.Mesh(sphereGeo, material);
      scene.add(sphereMesh);
    });

    // Mouse drag interaction
    let isUserInteracting = false;
    let onPointerDownPointerX = 0;
    let onPointerDownPointerY = 0;
    let onPointerDownLon = 0;
    let onPointerDownLat = 0;
    let lon = 0;
    let lat = 0;
    let phi = 0;
    let theta = 0;

    const onPointerDown = (e: MouseEvent) => {
      isUserInteracting = true;
      onPointerDownPointerX = e.clientX;
      onPointerDownPointerY = e.clientY;
      onPointerDownLon = lon;
      onPointerDownLat = lat;
    };

    const onPointerMove = (e: MouseEvent) => {
      if (!isUserInteracting) return;
      lon = (onPointerDownPointerX - e.clientX) * 0.1 + onPointerDownLon;
      lat = (e.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
    };

    const onPointerUp = () => {
      isUserInteracting = false;
    };

    const onWheel = (e: WheelEvent) => {
      camera.fov = Math.max(40, Math.min(100, camera.fov + e.deltaY * 0.05));
      camera.updateProjectionMatrix();
    };

    mount.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    mount.addEventListener('wheel', onWheel, { passive: true });

    const handleResize = () => {
      if (!mount || !renderer || !camera) return;
      camera.aspect = mount.clientWidth / Math.max(mount.clientHeight, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      if (disposed) return;
      if (autoRotate && !isUserInteracting) {
        lon += 0.08;
      }
      lat = Math.max(-85, Math.min(85, lat));
      phi = THREE.MathUtils.degToRad(90 - lat);
      theta = THREE.MathUtils.degToRad(lon);

      const lookTarget = new THREE.Vector3(
        500 * Math.sin(phi) * Math.cos(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.sin(theta)
      );
      camera.lookAt(lookTarget);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      mount.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      mount.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [currentRoom.url, autoRotate]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 360 WebGL Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Interactive Hotspot Buttons Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {currentRoom.hotspots.map((hs) => (
          <button
            key={hs.id}
            onClick={() => setActiveHotspot(hs)}
            style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
            className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute w-8 h-8 rounded-full bg-[#F59E0B]/30 animate-ping" />
              <div className="w-6 h-6 rounded-full bg-[#F59E0B] text-black flex items-center justify-center shadow-[0_0_15px_#F59E0B] group-hover:scale-125 transition-transform">
                <Info className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Hotspot Info Modal */}
      {activeHotspot && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-40 max-w-sm w-full p-4 rounded-2xl bg-[#121218]/95 backdrop-blur-2xl border border-white/20 text-white shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-white/10">
            <h4 className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
              {activeHotspot.title}
            </h4>
            <button
              onClick={() => setActiveHotspot(null)}
              className="p-1 rounded text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-zinc-300 mt-2 leading-relaxed">{activeHotspot.desc}</p>
        </div>
      )}

      {/* Floating Tour Room Switcher & Controls */}
      <div className="absolute top-24 left-4 sm:left-6 z-20 flex flex-col gap-2 max-w-xs">
        <div className="p-4 rounded-2xl bg-[#0C0C10]/85 backdrop-blur-2xl border border-white/10 shadow-2xl text-xs flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#F59E0B]" /> 360° Virtual Tour
            </span>
            <button
              onClick={() => setAutoRotate((prev) => !prev)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                autoRotate ? 'bg-[#F59E0B] text-black font-bold' : 'bg-white/10 text-zinc-400'
              }`}
            >
              {autoRotate ? 'AUTOSPIN ON' : 'PAUSED'}
            </button>
          </div>

          {/* Rooms List */}
          <div className="flex flex-col gap-1">
            <span className="text-zinc-400 text-[10px] uppercase font-mono">Navigate Spaces</span>
            {rooms.map((r, idx) => (
              <button
                key={r.id}
                onClick={() => {
                  setActiveRoomIndex(idx);
                  setActiveHotspot(null);
                }}
                className={`py-2 px-3 rounded-xl text-left text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                  activeRoomIndex === idx
                    ? 'bg-[#F59E0B] text-black font-bold shadow-md'
                    : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                }`}
              >
                <span>{r.name}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>

          <div className="pt-1 text-[10px] text-zinc-500 font-mono">
            Drag to pan 360° • Scroll to zoom FOV
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODE 5: SPLAT — 3D GAUSSIAN SPLATTING RADIANCE FIELD
// ============================================================================
function SplatCanvasView() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [renderMode, setRenderMode] = useState<'radiance' | 'pointcloud' | 'density'>('radiance');
  const [splatCount, setSplatCount] = useState(1420000);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let raf = 0;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / Math.max(mount.clientHeight, 1),
      0.1,
      1000
    );
    camera.position.set(0, 2, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Procedural 3D Gaussian Splat Particle Field
    const particleCount = 18000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Architectural volumetric distribution (rooms, walls, furniture)
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 3.5;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3;
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Splat Radiance field colors (warm luxury architecture tones + cyan accents)
      if (renderMode === 'radiance') {
        colors[i * 3] = 0.8 + Math.random() * 0.2;
        colors[i * 3 + 1] = 0.5 + Math.random() * 0.3;
        colors[i * 3 + 2] = 0.3 + Math.random() * 0.7;
      } else if (renderMode === 'pointcloud') {
        colors[i * 3] = 0.0;
        colors[i * 3 + 1] = 0.94;
        colors[i * 3 + 2] = 1.0;
      } else {
        // Density map
        colors[i * 3] = 0.92;
        colors[i * 3 + 1] = 0.28;
        colors[i * 3 + 2] = 0.6;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: renderMode === 'radiance' ? 0.045 : 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    // Drag Orbit
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      pointCloud.rotation.y += deltaX * 0.005;
      pointCloud.rotation.x += deltaY * 0.005;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const animate = () => {
      if (disposed) return;
      if (!isDragging) {
        pointCloud.rotation.y += 0.003;
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      mount.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [renderMode]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Splat Parameters Drawer */}
      <div className="absolute top-24 left-4 sm:left-6 z-20 flex flex-col gap-2 max-w-xs">
        <div className="p-4 rounded-2xl bg-[#0C0C10]/85 backdrop-blur-2xl border border-white/10 shadow-2xl text-xs flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" /> 3D Gaussian Splat
            </span>
            <span className="text-[10px] text-[#EC4899] font-mono">{(splatCount / 1000000).toFixed(2)}M Splats</span>
          </div>

          {/* Render Mode */}
          <div className="flex flex-col gap-1.5">
            <span className="text-zinc-400 text-[10px] uppercase font-mono">Radiance Shader</span>
            <div className="grid grid-cols-3 gap-1">
              {(['radiance', 'pointcloud', 'density'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setRenderMode(m)}
                  className={`py-1.5 px-2 rounded-lg font-mono text-[10px] uppercase transition-all cursor-pointer ${
                    renderMode === m
                      ? 'bg-[#EC4899] text-white font-bold'
                      : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  {m === 'pointcloud' ? 'Points' : m}
                </button>
              ))}
            </div>
          </div>

          {/* Splat Budget Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-zinc-400 text-[10px] font-mono">
              <span>Splat Budget</span>
              <span className="text-white font-bold">{(splatCount / 1000000).toFixed(2)}M</span>
            </div>
            <input
              type="range"
              min={500000}
              max={2500000}
              step={100000}
              value={splatCount}
              onChange={(e) => setSplatCount(Number(e.target.value))}
              className="w-full accent-[#EC4899] bg-white/10 rounded-lg cursor-pointer"
            />
          </div>

          <div className="pt-1 flex items-center justify-between text-[10px] text-zinc-500 font-mono border-t border-white/5">
            <span>Render Time: 0.38ms</span>
            <span>VRAM: 248 MB</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODE 6: PIXEL STREAMING — UNREAL ENGINE 5 CLOUD STREAM TERMINAL
// ============================================================================
function PixelStreamingLiveView() {
  const [activeCamera, setActiveCamera] = useState<'living' | 'balcony' | 'master' | 'pool'>('living');
  const [activeMaterial, setActiveMaterial] = useState<'calacatta' | 'marquina' | 'oak' | 'brass'>('calacatta');

  const cameraFeeds = {
    living: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2400&q=85',
    balcony: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=85',
    master: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=2400&q=85',
    pool: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2400&q=85',
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
      {/* Real-time Photorealistic Cloud Unreal Engine 5 Stream Feed */}
      <div className="absolute inset-0 z-0">
        <Image
          src={cameraFeeds[activeCamera]}
          alt="Cloud Unreal Engine 5 Pixel Stream"
          fill
          className="object-cover"
          priority
        />
        {/* Subtle scanline / stream raster overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
      </div>

      {/* Floating Cloud UE5 Stream Controls */}
      <div className="absolute top-24 left-4 sm:left-6 z-20 flex flex-col gap-2 max-w-xs">
        <div className="p-4 rounded-2xl bg-[#0C0C10]/85 backdrop-blur-2xl border border-white/10 shadow-2xl text-xs flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-[#3B82F6]" /> Unreal Engine 5 Cloud
            </span>
            <span className="text-[10px] text-[#42CF8B] font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#42CF8B] animate-pulse" /> LIVE STREAM
            </span>
          </div>

          {/* Camera Angles */}
          <div className="flex flex-col gap-1.5">
            <span className="text-zinc-400 text-[10px] uppercase font-mono">Camera Angle</span>
            <div className="grid grid-cols-2 gap-1.5">
              {(['living', 'balcony', 'master', 'pool'] as const).map((cam) => (
                <button
                  key={cam}
                  onClick={() => setActiveCamera(cam)}
                  className={`py-2 px-2.5 rounded-lg text-xs font-mono capitalize transition-all cursor-pointer ${
                    activeCamera === cam
                      ? 'bg-[#3B82F6] text-white font-bold'
                      : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  {cam}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Material Swatch */}
          <div className="flex flex-col gap-1.5">
            <span className="text-zinc-400 text-[10px] uppercase font-mono">RT Material Finish</span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'calacatta' as const, label: 'Calacatta' },
                { id: 'marquina' as const, label: 'Nero Marquina' },
                { id: 'oak' as const, label: 'White Oak' },
                { id: 'brass' as const, label: 'Brushed Brass' },
              ].map((mat) => (
                <button
                  key={mat.id}
                  onClick={() => setActiveMaterial(mat.id)}
                  className={`py-2 px-2.5 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                    activeMaterial === mat.id
                      ? 'bg-white text-black font-bold'
                      : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  {mat.label}
                </button>
              ))}
            </div>
          </div>

          {/* WebRTC Low-Latency Stream Telemetry */}
          <div className="pt-2 border-t border-white/5 flex flex-col gap-1 text-[10px] font-mono text-zinc-400">
            <div className="flex items-center justify-between">
              <span>Server Node:</span>
              <span className="text-zinc-200">AWS RTX 4090 ADA</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Codec:</span>
              <span className="text-zinc-200">H.265 / WebRTC RT</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Bitrate:</span>
              <span className="text-[#3B82F6]">25.4 Mbps</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
