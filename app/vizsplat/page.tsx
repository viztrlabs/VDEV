'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Camera, Edit3, Download, BarChart2, ExternalLink, Box } from 'lucide-react';

const features = [
  {
    title: '3D Capture',
    description: 'Gaussian splatting capture from photos with sub-millimeter precision',
    icon: Camera,
    color: 'rose',
  },
  {
    title: 'Scene Editing',
    description: 'Real-time editing with density manipulation, color correction, and cleaning tools',
    icon: Edit3,
    color: 'cyan',
  },
  {
    title: 'Digital Twins',
    description: 'Create photogrammetry-free digital twins for architecture and real estate',
    icon: Sparkles,
    color: 'amber',
  },
  {
    title: 'Web Export',
    description: 'Export to WebXR, WebAR, and 3D viewers with zero-install playback',
    icon: Download,
    color: 'emerald',
  },
  {
    title: 'Performance',
    description: 'Real-time rendering with progressive loading and LOD support',
    icon: BarChart2,
    color: 'blue',
  },
  {
    title: 'SuperSplat Editor',
    description: 'Open-source editor by Reality Labs with full VizTR integration',
    icon: Box,
    color: 'purple',
  },
];

export default function VizSplatPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-12 h-12 text-rose-400" />
              <h1 className="text-5xl font-bold font-display">VizSplat</h1>
              <span className="px-2.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-rose-500 text-white font-mono">
                NEW
              </span>
            </div>
            <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
              Gaussian splatting 3D capture and editing platform for photorealistic digital twins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-rose-500/30 transition-all"
                >
                  <div className="mb-3 text-rose-400">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-zinc-400">{feature.description}</p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/xr-world/supersplat"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-all border border-rose-500/30"
            >
              Open SuperSplat Editor
              <ExternalLink className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-semibold transition-all"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export { features };
