'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { serializeSplatScene } from '@/lib/splat/splat-config-serializer';
import { notifyEditorSave } from '@/lib/editor-sync';

const SplatEditorCanvas = dynamic(
  () => import('@/components/editor/splat/SplatEditorCanvas'),
  { ssr: false, loading: () => <div className="h-full flex items-center justify-center text-[#3ECF8E] text-xs font-mono">Loading Splat Editor…</div> },
);

interface SplatConfig {
  splat: {
    camera: {
      position: [number, number, number];
      target: [number, number, number];
      fov: number;
      near: number;
      far: number;
    };
    bounds: {
      center: [number, number, number];
      size: [number, number, number];
    };
    points: {
      count: number;
      bounds: {
        min: [number, number, number];
        max: [number, number, number];
      };
    };
    background: {
      type: 'color' | 'skybox' | 'gradient';
      color?: string;
      skyboxUrl?: string;
      intensity?: number;
    };
  };
  rendering: {
    camera: {
      fov: number;
      nearClip: number;
      farClip: number;
      clearColor: string;
    };
    quality: {
      preset: 'low' | 'medium' | 'high' | 'ultra';
      textureQuality: number;
      textureResolutionLimit: number;
      shadows: boolean;
      shadowResolution: number;
      postProcessing: boolean;
    };
    postProcessing: {
      bloom: { enabled: boolean; intensity: number; threshold: number };
      vignette: { enabled: boolean; intensity: number };
      fxaa: { enabled: boolean };
    };
    lighting: {
      ambient: string;
      exposure: number;
      tonemapping: string;
      skybox?: string;
      skyboxIntensity: number;
    };
  };
  assets: Array<{
    id: string;
    name: string;
    type: 'splat' | 'ply' | 'ksplat' | 'texture' | 'skybox' | 'other';
    url?: string;
    storagePath?: string;
    mimeType?: string;
    size?: number;
    width?: number;
    height?: number;
    tags?: string[];
    metadata?: Record<string, unknown>;
  }>;
  performance: {
    targetFPS: number;
    budgets: {
      maxDrawCalls: number;
      maxTriangles: number;
      maxTextureMemoryMB: number;
      maxSplatCount: number;
    };
    lod: {
      enabled: boolean;
      distances: number[];
    };
  };
  metadata: {
    version: number;
    createdAt: string;
    updatedAt: string;
    author?: string;
    description?: string;
    tags?: string[];
    serviceType: 'gaussian-splat';
    projectId?: string;
    experienceId?: string;
    assetId?: string;
  };
}

export default function GaussianSplatEditorPage() {
  const params = useParams<{ projectId?: string; experienceId?: string }>();
  const projectId = params?.projectId || 'proj_smart_luxury_villa';
  const experienceId = params?.experienceId;

  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Initializing editor…');

  useEffect(() => {
    let cancelled = false;
    let editor: any = null;

    const init = async () => {
      try {
        setStatus('Checking WebGPU…');
        if (!navigator.gpu) {
          throw new Error('WebGPU is not available in this browser.');
        }

        setStatus('Loading editor module…');
        const module = await import('@/splat-editor/main');
        setStatus('Editor loaded…');

        if (containerRef.current && !cancelled) {
          editor = module.main();
          setReady(true);
          setStatus('Editor ready');
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Failed to initialize editor');
          setStatus('Initialization failed');
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      if (editor && typeof editor.destroy === 'function') {
        try {
          editor.destroy();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  // Save to VizTR Experience Config
  const saveToVizTR = async () => {
    try {
      // Try to get the editor instance
      const editorModule = await import('@/splat-editor/main');
      // The editor is stored in window.scene by SuperSplat
      const scene = (window as any).scene;
      const settings = (window as any).sceneConfig || {};

      // Import the serializer dynamically
      const { serializeSplatScene } = await import('@/lib/splat/splat-config-serializer');

      const config = serializeSplatScene(
        (window as any).scene,
        settings,
        'proj_smart_luxury_villa',
        new URLSearchParams(window.location.search).get('experienceId') || undefined
      );

      const payload = {
        experience_id: new URLSearchParams(window.location.search).get('experienceId') || '',
        config: config.splat,
        assets: config.assets,
        settings: {
          rendering: config.rendering,
          performance: config.performance,
          metadata: config.metadata,
        },
      };

      const response = await fetch('/api/experience-configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          experience_id: new URLSearchParams(window.location.search).get('experienceId') || '',
          config: config.splat,
          assets: config.assets,
          settings: {
            rendering: config.rendering,
            performance: config.performance,
            metadata: config.metadata,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to save' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      console.log('[SplatEditor] Config saved to VizTR API');
      notifyEditorSave();
    } catch (e) {
      console.warn('[SplatEditor] Failed to sync to VizTR Experience Config:', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <div className="px-4 sm:px-6 py-3 border-b border-[#27272A] flex items-center justify-between">
        <div>
          <h1 className="text-sm font-mono font-bold text-white">Gaussian Splat Editor</h1>
          <p className="text-[10px] font-mono text-[#71717A]">WebGPU-powered 3D Gaussian splatting editor</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => saveToVizTR()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#3ECF8E]/40 bg-[#3ECF8E]/15 text-[10px] font-mono font-semibold text-[#3ECF8E] hover:bg-[#3ECF8E]/25 transition"
          >
            <span>Save to VizTR</span>
          </button>
          <div className="text-[10px] font-mono text-[#71717A]">{status}</div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {error && (
          <div className="mb-4 rounded border border-rose-500/40 bg-rose-500/10 p-3 text-[11px] font-mono text-rose-300">
            {error}
          </div>
        )}

        <div className="rounded border border-[#27272A] bg-[#0F0F11] overflow-hidden">
          <div className="h-[70vh]">
            {!ready && !error && (
              <div className="h-full flex items-center justify-center gap-2 text-[#3ECF8E]">
                <div className="w-5 h-5 border-2 border-[#3ECF8E] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-mono">Loading editor…</span>
              </div>
            )}
            <div ref={containerRef} className="h-full w-full" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded border border-[#27272A] bg-[#0F0F11] p-4">
            <div className="text-[10px] font-mono text-[#71717A]">Renderer</div>
            <div className="text-xs font-mono text-white">WebGPU</div>
          </div>
          <div className="rounded border border-[#27272A] bg-[#0F0F11] p-4">
            <div className="text-[10px] font-mono text-[#71717A]">Status</div>
            <div className="text-xs font-mono text-white">{ready ? 'Ready' : error ? 'Error' : 'Loading'}</div>
          </div>
          <div className="rounded border border-[#27272A] bg-[#0F0F11] p-4">
            <div className="text-[10px] font-mono text-[#71717A]">Environment</div>
            <div className="text-xs font-mono text-white">{process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}