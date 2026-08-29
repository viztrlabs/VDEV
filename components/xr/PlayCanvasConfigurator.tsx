'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { loadAsset } from '@/lib/asset-pipeline';
import { Play, Pause, Settings, Box, Activity, Eye, EyeOff } from 'lucide-react';

interface LoadedGLTF {
  scene: THREE.Group;
  materials: THREE.Material[];
}

export default function PlayCanvasConfigurator() {
  const [gltf, setGLTF] = useState<LoadedGLTF | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'desktop' | 'vr' | 'ar' | 'none'>('desktop');
  const [materialColor, setMaterialColor] = useState('#3ECF8E'); // default green
  const viewerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Load GLTF asset
  const loadScene = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const scene = await loadAsset('/sample-scene.glb'); // TODO: replace with actual gltf path
      const gltfScene = scene as unknown as THREE.Group;
      // Extract materials from scene
      const materials: THREE.Material[] = [];
      gltfScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const meshMaterial = child.material;
          if (Array.isArray(meshMaterial)) {
            materials.push(...meshMaterial);
          } else {
            materials.push(meshMaterial);
          }
        }
      });
      setGLTF({ scene: gltfScene, materials });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load GLTF');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize Three.js scene and renderer
  useEffect(() => {
    if (!viewerRef.current) return;
    const container = viewerRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x09090b);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Simple orbit controls (keyboard + mouse)
    const controls = {
      angle: 0,
      polarAngle: Math.PI / 4,
      radius: 5,
      animate: () => {
        if (!cameraRef.current) return;
        cameraRef.current.position.setFromSphericalCoords(
          controls.radius,
          controls.polarAngle,
          controls.angle
        );
        cameraRef.current.lookAt(0, 0, 0);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft': controls.angle -= 0.1; break;
        case 'ArrowRight': controls.angle += 0.1; break;
        case 'ArrowUp': controls.polarAngle = Math.max(0.1, Math.min(Math.PI - 0.1, controls.polarAngle - 0.1)); break;
        case 'ArrowDown': controls.polarAngle = Math.max(0.1, Math.min(Math.PI - 0.1, controls.polarAngle + 0.1)); break;
        case '+': controls.radius = Math.max(1, controls.radius - 0.5); break;
        case '-': controls.radius += 0.5; break;
      }
      controls.animate();
    };

    const handleMouseDown = (e: MouseEvent) => {
      let startX = e.clientX;
      let startY = e.clientY;
      const onMouseMove = (e: MouseEvent) => {
        controls.angle -= (e.clientX - startX) * 0.01;
        controls.polarAngle -= (e.clientY - startY) * 0.01;
        controls.polarAngle = Math.max(0.1, Math.min(Math.PI - 0.1, controls.polarAngle));
        startX = e.clientX;
        startY = e.clientY;
        controls.animate();
      };
      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('keydown', handleKeyDown);
    container.addEventListener('mousedown', handleMouseDown);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (sceneRef.current && rendererRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('mousedown', handleMouseDown);
      if (rendererRef.current && rendererRef.current.domElement.parentNode) {
        rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
    };
  }, []);

  // Update materials color when changed
  useEffect(() => {
    if (!gltf) return;
    gltf.materials.forEach((material) => {
      if (material instanceof THREE.MeshStandardMaterial) {
        material.color.set(materialColor);
      }
    });
  }, [materialColor, gltf]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white font-display">PlayCanvas Configurator</h1>
        <button
          onClick={loadScene}
          className="px-4 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <Box className="w-4 h-4" />
          Load GLTF Scene
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-950/30 border border-red-700/30">
          <div className="text-sm text-red-300 font-mono">Error: {error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Viewer container */}
        <div className="lg:col-span-2 relative rounded-xl bg-[#09090B] border border-[#27272A] overflow-hidden">
          <div ref={viewerRef} className="w-full h-[500px]" />
          <div className="absolute top-4 left-4 bg-black/70 text-white text-xs font-mono px-2 py-1 rounded">
            Mode: {activeMode.toUpperCase()}
          </div>
        </div>

        {/* Controls Panel */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-3">
            <h2 className="text-lg font-bold text-white font-display">Controls</h2>

            {/* Mode Selection */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-[#A1A1AA]">XR Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveMode('desktop')}
                  className={`px-3 py-2 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${activeMode === 'desktop' ? 'bg-[#3ECF8E]/20 border-[#3ECF8E] text-[#3ECF8E]' : 'bg-[#09090B] border-[#27272A] text-[#A1A1AA] hover:text-white'}`}
                >
                  <Eye className="w-3 h-3 inline mr-1" /> Desktop
                </button>
                <button
                  onClick={() => setActiveMode('vr')}
                  className={`px-3 py-2 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${activeMode === 'vr' ? 'bg-[#3ECF8E]/20 border-[#3ECF8E] text-[#3ECF8E]' : 'bg-[#09090B] border-[#27272A] text-[#A1A1AA] hover:text-white'}`}
                >
                  <Box className="w-3 h-3 inline mr-1" /> VR
                </button>
                <button
                  onClick={() => setActiveMode('ar')}
                  className={`px-3 py-2 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${activeMode === 'ar' ? 'bg-[#3ECF8E]/20 border-[#3ECF8E] text-[#3ECF8E]' : 'bg-[#09090B] border-[#27272A] text-[#A1A1AA] hover:text-white'}`}
                >
                  <EyeOff className="w-3 h-3 inline mr-1" /> AR
                </button>
              </div>
            </div>

            {/* Material Color Picker */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-[#A1A1AA]">Material Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={materialColor}
                  onChange={(e) => setMaterialColor(e.target.value)}
                  className="w-8 h-8 rounded border border-[#27272A] cursor-pointer"
                />
                <input
                  type="text"
                  value={materialColor}
                  onChange={(e) => setMaterialColor(e.target.value)}
                  className="flex-1 px-2 py-1 rounded bg-[#09090B] border border-[#27272A] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
                />
              </div>
            </div>

            {/* Status Info */}
            <div className="space-y-2 pt-2 border-t border-[#27272A]">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#A1A1AA]">Status:</span>
                <span className="text-[#3ECF8E]">{gltf ? 'Loaded' : 'Not loaded'}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#A1A1AA]">Loading:</span>
                <span className="text-[#3ECF8E]">{isLoading ? 'In progress...' : 'Idle'}</span>
              </div>
            </div>
          </div>

          {/* VR/AR Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => setActiveMode('vr')}
              className="w-full px-4 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Box className="w-4 h-4" /> Enter VR
            </button>
            <button
              onClick={() => setActiveMode('ar')}
              className="w-full px-4 py-2 rounded-lg bg-[#27272A] hover:bg-[#3ECF8E] hover:text-black border border-[#27272A] text-xs font-mono transition-all cursor-pointer"
            >
              <EyeOff className="w-4 h-4" /> Enter AR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
