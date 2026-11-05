'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import PlayCanvasXRViewer from '@/components/xr/PlayCanvasXRViewer';
import PlayCanvasConfigurator from '@/components/xr/PlayCanvasConfigurator';
import {
  Sparkles,
  Box,
  ArrowRight,
  ChevronRight,
  Download,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Globe,
  Cpu,
  Settings,
  Eye,
  EyeOff,
  Activity
} from 'lucide-react';

export default function PlayCanvasShowcasePage() {
  const [activeView, setActiveView] = useState<'viewer' | 'configurator'>('viewer');

  return (
    <main className="flex-1 w-full pb-20">
      {/* 1. HERO PRESENTATION AREA (Full Landing Page Presentation Aspect Ratio) */}
      <section
        id="hero-section"
        className="relative w-full h-screen min-h-[680px] flex flex-col justify-between items-center overflow-hidden text-white select-none transition-colors duration-300 bg-[#09090B]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/30 via-[#09090B] to-[#09090B] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))_from-purple-500/10_via-transparent_to-transparent] pointer-events-none z-0" />

        {/* TOP AREA: Clears floating header & hosts Eyebrow Badge */}
        <div className="relative z-20 w-full pt-16 sm:pt-20 shrink-0 flex justify-center px-2 sm:px-4">
          <div className="hero-eyebrow inline-flex items-center gap-1.5 sm:gap-2.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[#0A0A0B] shadow-2xl transition-all border border-[#1E293B] text-[10px] sm:text-xs max-w-[95vw] sm:max-w-none">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500 animate-pulse shrink-0" />
            <span className="font-bold text-purple-400 tracking-wider uppercase shrink-0">PlayCanvas WebXR Engine</span>
          </div>
        </div>

        {/* BOTTOM HERO CONTENT */}
        <div className="relative z-20 w-full container-ultrawide text-center flex flex-col items-center justify-end mt-auto px-4 sm:px-6 pb-6 sm:pb-8">
          <h1 className="hero-headline text-fluid-hero font-extrabold tracking-tight mb-2 sm:mb-3 font-sans">
            Real-Time <span className="text-purple-400">PlayCanvas</span> WebXR Runtime
          </h1>

          <p className="hero-desc text-fluid-desc max-w-2xl 2xl:max-w-3xl text-center prose-readable font-normal leading-relaxed mb-6 text-[#E5E2E3]">
            Native WebXR engine with{' '}
            <code className="font-mono text-[#3ECF8E] px-1.5 py-0.5 rounded bg-[#18181B] border border-[#27272A]">
              @playcanvas/pc
            </code>{' '}
            . Real-time GLTF loading, material editing, GPU-accelerated rendering. Access immersive 3D experiences directly in browser — zero install, runs any device.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 w-full max-w-2xl mx-auto mb-6">
            <Link
              href="/admin/dashboard"
              id="hero-primary-cta"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Cpu className="w-4 h-4" />
              <span>Open Admin Dashboard</span>
            </Link>

            <Link
              href="/xr-world"
              className="hero-secondary-btn w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider bg-[#131314] hover:bg-[#1E293B] transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-xl hover:scale-105 active:scale-95 border border-[#1E293B]"
            >
              <Globe className="w-4 h-4 text-purple-400" />
              <span>Back World Hub</span>
            </Link>
          </div>
          
          <div className="relative w-full flex items-center justify-center pt-2">
            <div className="sm:block">
              <Link
                href="/xr-world"
                className="hero-scroll-btn group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0A0A0B] text-[#FAFAFA] text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer shadow-sm hover:bg-[#131314] border border-[#1E293B]"
              >
                <span>Scroll to explore</span>
                <ChevronRight className="w-3.5 h-3.5 text-purple-400 animate-bounce" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* VIEW SELECTOR TABS */}
      <section className="px-6 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-purple-400" />
            <span className="font-mono font-bold text-white">PlayCanvas Engine</span>
          </div>
          <div className="flex items-center gap-1 bg-[#18181B] border border-[#27272A] rounded-lg p-1">
            <button
              onClick={() => setActiveView('viewer')}
              className={`px-4 py-2 rounded-md text-sm font-mono transition-colors ${
                activeView === 'viewer'
                  ? 'bg-[#3ECF8E] text-black'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-1" /> XR Viewer
            </button>
            <button
              onClick={() => setActiveView('configurator')}
              className={`px-4 py-2 rounded-md text-sm font-mono transition-colors ${
                activeView === 'configurator'
                  ? 'bg-[#3ECF8E] text-black'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-1" /> Configurator
            </button>
          </div>
        </div>
      </section>

      {/* MAIN VIEWER SECTION */}
      <section className="py-16 px-6 max-w-[1400px] mx-auto">
        {activeView === 'viewer' ? (
          <>
            {/* VIEWER GRID */}
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              {/* LEFT PANEL Scene Info Controls */}
              <div className="lg:col-span-1 space-y-6">
                {/* Engine Status Card */}
                <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] font-bold uppercase">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Engine Status</span>
                  </div>

                  <p className="text-sm text-[#71717A]">
                    Live telemetry from PlayCanvas stream controller. Shows WebXR support, active session
                    mode, FPS, draw calls, and triangle count.
                  </p>

                  <div className="space-y-3 pt-2 border-t border-[#27272A]">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#09090B] border border-[#27272A]">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/30 to-purple-600/30 flex items-center justify-center flex-shrink-0">
                        <Box className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium text-white truncate">WebXR Support</p>
                        <p className="text-[10px] font-mono text-[#71717A]">VR & AR session detection</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#09090B] border border-[#27272A]">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500/30 to-rose-600/30 flex items-center justify-center flex-shrink-0">
                        <Activity className="w-5 h-5 text-rose-400" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium text-white truncate">Live Performance</p>
                        <p className="text-[10px] font-mono text-[#71717A]">FPS, draw calls, triangle count</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#09090B] border border-[#27272A]">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/30 to-cyan-600/30 flex items-center justify-center flex-shrink-0">
                        <Download className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium text-white truncate">GLTF Streaming</p>
                        <p className="text-[10px] font-mono text-[#71717A]">Progressive model loading</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Specs Card */}
                <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] font-bold uppercase">
                    <Settings className="w-4 h-4" />
                    <span>Engine Capabilities</span>
                  </div>

                  <div className="space-y-3 text-sm">
                    {[
                      { icon: Box, label: 'Format Support', desc: 'GLTF/GLB, Draco, KTX2, Meshopt' },
                      { icon: Loader2, label: 'Progressive Loading', desc: 'Streaming real-time progress indicator' },
                      { icon: Sparkles, label: 'Interactive Controls', desc: 'Orbit, pan, zoom mouse/touch/XR' },
                      { icon: Globe, label: 'WebXR Sessions', desc: 'VR, AR, inline modes supported' },
                      { icon: Cpu, label: 'GPU Accelerated', desc: 'WebGL2, high-performance mode' },
                      { icon: Download, label: 'Zero Install', desc: 'Runs any modern browser WebXR' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{item.label}</p>
                          <p className="text-[11px] text-[#71717A] font-mono">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Card */}
                <div className="bg-gradient-to-br from-purple-950/60 via-[#18181B] to-[#09090B] border border-purple-500/50 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-bold uppercase">
                    <Sparkles className="w-4 h-4" />
                    <span>XR Integration Ready</span>
                  </div>

                  <h3 className="text-xl font-bold font-display text-white">
                    Deploy Vision Pro & Quest
                  </h3>

                  <p className="text-sm text-[#A1A1AA]">
                    PlayCanvas engine integrates directly with VizTR&apos;s WebXR pipeline.
                    Launch immersive sessions on Apple Vision Pro, Meta Quest, any WebXR-compatible device.
                  </p>

                  <Link
                    href="/xr-world/webxr"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Explore WebXR Pipeline</span>
                  </Link>
                </div>
              </div>

              {/* RIGHT PANEL Viewer */}
              <div className="lg:col-span-2">
                <div className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden">
                  {/* Viewer Header */}
                  <div className="px-4 py-3 border-b border-[#27272A] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Box className="w-5 h-5 text-purple-400" />
                      <span className="font-mono font-bold text-white">PlayCanvas XR Viewer</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[#71717A]">
                      <span className="px-2 py-0.5 rounded bg-[#09090B] border border-[#27272A]">WebGL2</span>
                      <span className="px-2 py-0.5 rounded bg-[#09090B] border border-[#27272A]">@playcanvas/pc v1.81</span>
                    </div>
                  </div>

                  {/* Viewer Container */}
                  <div className="relative h-[600px] w-full">
                    <Suspense
                      fallback={
                        <div className="absolute inset-0 flex items-center justify-center bg-[#09090B]">
                          <div className="text-center space-y-3">
                            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
                            <p className="text-sm font-mono text-[#71717A]">Initializing PlayCanvas Engine...</p>
                            <p className="text-[10px] text-[#3ECF8E]">Loading @playcanvas/pc WASM module</p>
                          </div>
                        </div>
                      }
                    >
      <PlayCanvasXRViewer />
                    </Suspense>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* CONFIGURATOR VIEW */}
            <div className="space-y-6">
              <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white font-display">PlayCanvas Configurator</h2>
                  <span className="px-3 py-1 rounded-full bg-[#3ECF8E]/20 border border-[#3ECF8E]/40 text-[#3ECF8E] text-xs font-mono font-bold">
                    GLTF Material Editor
                  </span>
                </div>
              </div>
              <Suspense
                fallback={
                  <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-12 text-center">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
                    <p className="text-sm font-mono text-[#71717A]">Loading PlayCanvas Configurator...</p>
                  </div>
                }
              >
                <PlayCanvasConfigurator />
              </Suspense>
            </div>
          </>
        )}

        {/* FOOTER INFO */}
        <section className="py-12 px-6 border-t border-[#27272A] mt-16">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
              <div className="space-y-2">
                <Box className="w-10 h-10 text-purple-400 mx-auto md:mx-0" />
                <h4 className="font-bold text-white">Engine</h4>
                <p className="text-sm text-[#71717A] font-mono">PlayCanvas @playcanvas/pc v1.81</p>
              </div>
              <div className="space-y-2">
                <Sparkles className="w-10 h-10 text-[#3ECF8E] mx-auto md:mx-0" />
                <h4 className="font-bold text-white">Runtime</h4>
                <p className="text-sm text-[#71717A] font-mono">WebGL2 WASM Three.js r167</p>
              </div>
              <div className="space-y-2">
                <Globe className="w-10 h-10 text-purple-400 mx-auto md:mx-0" />
                <h4 className="font-bold text-white">WebXR</h4>
                <p className="text-sm text-[#71717A] font-mono">VR/AR/Inline modes supported</p>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}