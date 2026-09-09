'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function GaussianSplatEditorPage() {
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

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <div className="px-4 sm:px-6 py-3 border-b border-[#27272A] flex items-center justify-between">
        <div>
          <h1 className="text-sm font-mono font-bold text-white">Gaussian Splat Editor</h1>
          <p className="text-[10px] font-mono text-[#71717A]">WebGPU-powered 3D Gaussian splatting editor</p>
        </div>
        <div className="text-[10px] font-mono text-[#71717A]">{status}</div>
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
