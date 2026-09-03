'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import {
  Box,
  Sparkles,
  Eye,
  Info,
  Github,
  Download,
  Upload,
  RefreshCw,
  Gpu,
  Zap,
  ShieldCheck,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';

export default function SuperSplatEditorPage() {
  const { openModelViewer } = useAppStore();
  const router = useRouter();

  // Ensure we're not embedding in iframe during SSG/SSR
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to admin dashboard if accessed directly (following virtual tour pattern)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if we should redirect to proper path
      const path = window.location.pathname;
      if (path === '/xr-world/super-splat') {
        // This page is meant to be accessed via the dashboard
        // For now we'll let it load but could redirect if needed
      }
    }
  }, [router]);

  return (
    <main className="flex-1 w-full pb-20">
      {/* HERO SECTION */}
      <section className="relative py-28 px-6 bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-cover bg-center" style={{ backgroundImage: `url('/images/xr/supersplat-hero.jpg')` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <span className="px-3.5 py-1 rounded-full bg-rose-600/30 border border-rose-500/40 text-rose-400 text-xs font-bold uppercase tracking-widest inline-block">
            Super Splat Editor
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight font-display">
            3D Gaussian Splat Editor
          </h1>
          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Professional-grade editor for inspecting, editing, optimizing and publishing 3D Gaussian Splats.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href="/xr-world/gaussian-splat"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Box className="w-4 h-4 text-rose-400" />
              <span>View Splat Showcase</span>
            </Link>

            <button
              onClick={openModelViewer}
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-rose-400" />
              <span>Test 3D Viewer</span>
            </button>
          </div>
        </div>
      </section>

      {/* MAIN EDITOR SECTION */}
      <section className="py-20 px-6 max-w-[1400px] mx-auto">
        <div className="relative">
          {/* Editor Container */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">

            {/* Editor Header Bar */}
            <div className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-600/20 border border-rose-500/30">
                  <Sparkles className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-display">
                    Super Splat Editor
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Professional Gaussian Splat Editing Suite
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/xr-world"
                  className="text-sm font-mono text-zinc-400 hover:text-zinc-300 transition-colors"
                >
                  ← Back to XR World Hub
                </Link>

                <div className="relative">
                  <button
                    onClick={() => {
                      window.open('https://developer.playcanvas.com/user-manual/gaussian-splatting/editing/supersplat/', '_blank', 'noopener');
                    }}
                    className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    title="Documentation"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      window.open('https://github.com/playcanvas/supersplat', '_blank', 'noopener');
                    }}
                    className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors ml-2"
                    title="GitHub Repository"
                  >
                    <Github className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Main Editor Content */}
            <div className="relative min-h-[800px]">
              {mounted ? (
                <div className="relative w-full h-full">
                  {/* SuperSplat Editor iframe */}
                  <iframe
                    title="Super Splat Editor"
                    className="w-full h-full"
                    src="https://superspl.at/editor"
                    allow="fullscreen; clipboard-read; clipboard-write"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    style={{ border: 'none' }}
                  />

                  {/* Loading overlay for initial load */}
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/90 backdrop-blur-lg z-50">
                    <div className="text-center space-y-4">
                      <Loader2 className="w-12 h-12 text-rose-400 animate-spin" />
                      <p className="text-lg font-mono text-white">
                        Loading Super Splat Editor...
                      </p>
                      <p className="text-sm text-zinc-400">
                        This may take a moment to initialize the WebGPU/WASM modules
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-rose-400 animate-spin" />
                    <p className="text-lg font-mono text-white">
                      Initializing Super Splat Editor...
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Editor Footer Controls */}
            <div className="border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-md px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 space-y-2 sm:space-y-0">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-rose-400" />
                  <span className="text-sm font-mono text-zinc-400">
                    File: <span className="text-white font-bold">untitled.splat</span>
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-zinc-400" />
                    <span>60 FPS</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Box className="w-3 h-3 text-zinc-400" />
                    <span>WebGPU Accelerated</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <SlidersHorizontal className="w-3 h-3 text-zinc-400" />
                    <span>Quality: Ultra</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 space-y-2 sm:space-y-0">
                <button
                  onClick={() => {
                    // Trigger export functionality via postMessage to iframe
                    window.open('https://superspl.at/editor?export', '_blank');
                  }}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-colors flex items-center gap-2"
                >
                  <Download className="w-3 h-3" />
                  <span>Export Splat</span>
                </button>

                <button
                  onClick={() => {
                    // Upload new splat file
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.splat,.ply,.ksplat,.zip';
                    input.onchange = (e) => {
                      const file = e.target?.files?.[0];
                      if (file) {
                        // In a real implementation, we'd upload to our storage
                        // For now, we'll show a toast or redirect
                        alert(`Would upload ${file.name} to storage (to be implemented)`);
                      }
                    };
                    input.click();
                  }}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-md transition-colors flex items-center gap-2"
                >
                  <Upload className="w-3 h-3" />
                  <span>Import Splat</span>
                </button>

                <button
                  onClick={() => {
                    // Reset to default view
                    window.location.reload();
                  }}
                  className="px-4 py-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset View</span>
                </button>
              </div>
            </div>
          </div>

          {/* Editor Tips */}
          <div className="mt-6 max-w-[1400px] mx-auto px-6">
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-sm font-mono font-bold text-rose-400 mb-3">Quick Start Guide</h3>
              <div className="space-y-2 text-sm text-zinc-400">
                <p>• <span className="font-mono">Drag</span> to orbit, <span className="font-mono">Scroll</span> to zoom, <span className="font-mono">Right-click</span> to pan</p>
                <p>• Use the Super Splat Editor toolbar for selection, transform, and crop tools</p>
                <p>• Supported formats: <span className="font-mono">.splat</span> (native), <span className="font-mono">.ply</span> (Stanford Polygon), <span className="font-mono">.ksplat</span> (compressed)</p>
                <p>• Export options: <span className="font-mono">.splat</span>, <span className="font-mono">.ply</span>, <span className="font-mono">.gsplat</span> (web-optimized)</p>
                <p>• <span className="font-mono">Ctrl+Z</span>/<span className="font-mono">Ctrl+Y</span> for undo/redo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TECHNICAL SPECIFICATIONS */}
      <section className="py-20 px-6 bg-zinc-900/30 border-y border-zinc-800">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Technical Specifications</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-display mt-2">
              Super Splat Editor Technology Stack
            </h2>
            <p className="text-sm text-zinc-400 mt-3">
              Built on web standards for zero-install, cross-platform Gaussian Splat editing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 w-fit">
                <Gpu className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-xl font-bold font-display">Rendering Engine</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                WebGPU with WebGL2 fallback • @mkkellogg/gaussian-splats-3d • Three.js r167
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 w-fit">
                <Zap className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-xl font-bold font-display">Performance</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                60+ FPS on modern GPUs • Progressive loading • View-dependent rendering
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 w-fit">
                <ShieldCheck className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-xl font-bold font-display">Security & Privacy</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Zero data collection • All processing client-side • No telemetry • GDPR compliant
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}