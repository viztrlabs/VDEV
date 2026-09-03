'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import SplatConfigurator from '@/components/xr/SplatConfigurator';
import GaussianSplatViewer from '@/components/xr/GaussianSplatViewer';
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
} from 'lucide-react';

const SPLAT_SCENES = [
  {
    id: 'train',
    name: 'Train Station',
    url: 'https://huggingface.co/cakewalk/splat-data/resolve/main/train.splat',
    format: 'splat' as const,
  },
  {
    id: 'garden',
    name: 'Garden Scene',
    url: 'https://huggingface.co/cakewalk/splat-data/resolve/main/garden.splat',
    format: 'splat' as const,
  },
  {
    id: 'bonsai',
    name: 'Bonsai Tree',
    url: 'https://huggingface.co/cakewalk/splat-data/resolve/main/bonsai.splat',
    format: 'splat' as const,
  },
  {
    id: 'kitchen',
    name: 'Kitchen Interior',
    url: 'https://huggingface.co/cakewalk/splat-data/resolve/main/kitchen.splat',
    format: 'splat' as const,
  },
];

export default function SplatShowcasePage() {
  return (
    <main className="flex-1 w-full pb-20">
      {/* HERO SECTION */}
      <section className="relative py-28 px-6 bg-[#09090B] text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-950/30 via-[#09090B] to-[#09090B]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))_from-rose-500/10_via-transparent_to-transparent]" />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <span className="px-3.5 py-1 rounded-full bg-rose-600/30 border border-rose-500/40 text-rose-400 text-xs font-bold uppercase tracking-widest inline-block flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            <span>Gaussian Splatting Engine</span>
          </span>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight font-display text-white">
            Real-Time <span className="text-rose-400">Gaussian Splat</span> Viewer
          </h1>

          <p className="text-base sm:text-lg text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed">
            Interactive WebGL Gaussian Splatting renderer powered{' '}
            <code className="font-mono text-[#3ECF8E] px-1.5 py-0.5 rounded bg-[#18181B] border border-[#27272A]">
              @mkkellogg/gaussian-splats-3d
            </code>{' '}
            . Switch between multiple scenes, toggle visibility, explore 3D Gaussian splats real-time zero install, runs any browser.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/admin/dashboard"
              className="px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-xl shadow-rose-900/40 transition-all hover:scale-105 flex items-center gap-2"
            >
              <Cpu className="w-4 h-4" />
              <span>Open Admin Dashboard</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <Link
              href="/xr-world/super-splat"
              className="px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-xl shadow-rose-900/40 transition-all hover:scale-105 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Open SuperSplat Editor</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <Link
              href="/xr-world"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <Globe className="w-4 h-4 text-rose-400" />
              <span>Back World Hub</span>
            </Link>
          </div>
        </div>
      </section>

      {/* MAIN VIEWER SECTION */}
      <section className="py-16 px-6 max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* LEFT PANEL Scene Info Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Scene Selector Card */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] font-bold uppercase">
                <Box className="w-4 h-4" />
                <span>Scene Library</span>
              </div>

              <p className="text-sm text-[#71717A]">
                Choose curated public Gaussian Splat samples hosted Hugging Face.
                All scenes use{' '}
                <code className="font-mono text-[#3ECF8E] px-1 py-0.5 rounded bg-[#09090B]">.splat</code> binary format.
              </p>

              <div className="space-y-2 pt-2 border-t border-[#27272A]">
                {SPLAT_SCENES.map((scene) => (
                  <div
                    key={scene.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[#09090B] border border-[#27272A] hover:border-[#3ECF8E]/50 transition-colors cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500/30 to-rose-600/30 flex items-center justify-center flex-shrink-0">
                      <Box className="w-5 h-5 text-rose-400" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-white truncate group-hover:text-rose-400 transition-colors">
                        {scene.name}
                      </p>
                      <p className="text-[10px] font-mono text-[#71717A]">
                        {scene.format.toUpperCase()} • {scene.url.split('/').slice(-2).join('/')}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#71717A] group-hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Specs Card */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] font-bold uppercase">
                <CheckCircle2 className="w-4 h-4" />
                <span>Engine Capabilities</span>
              </div>

              <div className="space-y-3 text-sm">
                {[
                  { icon: Box, label: 'Format Support', desc: '.splat, .ply, .ksplat binary formats' },
                  { icon: Loader2, label: 'Progressive Loading', desc: 'Streaming real-time progress indicator' },
                  { icon: Sparkles, label: 'Interactive Controls', desc: 'Orbit, pan, zoom mouse/touch' },
                  { icon: Globe, label: 'Multi-Scene Toggle', desc: 'Show/hide multiple splats simultaneously' },
                  { icon: Cpu, label: 'GPU Accelerated', desc: 'WebGL2 compute shaders, auto-fallback' },
                  { icon: Download, label: 'Zero Install', desc: 'Runs any modern browser WebXR' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-rose-400" />
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
            <div className="bg-gradient-to-br from-rose-950/60 via-[#18181B] to-[#09090B] border border-rose-500/50 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-rose-400 font-bold uppercase">
                <Sparkles className="w-4 h-4" />
                <span>XR Integration Ready</span>
              </div>

              <h3 className="text-xl font-bold font-display text-white">
                Deploy Vision Pro Quest
              </h3>

              <p className="text-sm text-[#A1A1AA]">
                Gaussian Splat engine integrates directly VizTR&apos;s WebXR pipeline.
                Launch immersive sessions Apple Vision Pro, Meta Quest, any WebXR-compatible device.
              </p>

              <Link
                href="/xr-world/webxr"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition-colors"
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
                  <Box className="w-5 h-5 text-rose-400" />
                  <span className="font-mono font-bold text-white">Gaussian Splat Viewer</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#71717A]">
                  <span className="px-2 py-0.5 rounded bg-[#09090B] border border-[#27272A]">WebGL2</span>
                  <span className="px-2 py-0.5 rounded bg-[#09090B] border border-[#27272A]">@mkkellogg/gaussian-splats-3d</span>
                </div>
              </div>

              {/* Viewer Container */}
              <div className="relative h-[600px] w-full">
                <Suspense
                  fallback={
                    <div className="absolute inset-0 flex items-center justify-center bg-[#09090B]">
                      <div className="text-center space-y-3">
                        <Loader2 className="w-8 h-8 text-rose-400 animate-spin mx-auto" />
                        <p className="text-sm font-mono text-[#71717A]">Initializing Gaussian Splat Engine...</p>
                        <p className="text-[10px] text-[#3ECF8E]">Loading @mkkellogg/gaussian-splats-3d WASM module</p>
                      </div>
                    </div>
                  }
                >
                  <SplatConfigurator
                    scenes={SPLAT_SCENES}
                    height="h-full w-full"
                    showControls={true}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER INFO */}
      <section className="py-12 px-6 border-t border-[#27272A]">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="space-y-2">
              <Box className="w-10 h-10 text-rose-400 mx-auto md:mx-0" />
              <h4 className="font-bold text-white">Source Data</h4>
              <p className="text-sm text-[#71717A] font-mono">Hugging Face: cakewalk/splat-data</p>
            </div>
            <div className="space-y-2">
              <Sparkles className="w-10 h-10 text-[#3ECF8E] mx-auto md:mx-0" />
              <h4 className="font-bold text-white">Engine</h4>
              <p className="text-sm text-[#71717A] font-mono">@mkkellogg/gaussian-splats-3d v0.4.7</p>
            </div>
            <div className="space-y-2">
              <Globe className="w-10 h-10 text-rose-400 mx-auto md:mx-0" />
              <h4 className="font-bold text-white">Runtime</h4>
              <p className="text-sm text-[#71717A] font-mono">WebGL2 WASM Three.js r167</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}