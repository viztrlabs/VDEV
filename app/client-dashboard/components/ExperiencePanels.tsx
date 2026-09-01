'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Play, Sparkles, Box, Layers, Monitor } from 'lucide-react';

export default function ExperiencePanels() {
  const { openPixelStream, openPanorama, openModelViewer } = useAppStore();

  const experiences = [
    {
      id: 'exp-ps',
      title: 'Unreal Engine 5.4 Pixel Streaming',
      badge: 'Realtime Cloud GPU',
      description: 'Stream the photorealistic Lumen interactive architectural walkthrough at 60fps directly in your browser.',
      icon: <Monitor className="w-5 h-5 text-[#3ECF8E]" />,
      action: () => openPixelStream('VIZTR-882')
    },
    {
      id: 'exp-tour',
      title: '16K Ultra-HD Panoramic Virtual Tour',
      badge: 'Spatial Hotspots',
      description: 'Explore 360° master cameras with interactive material swaps and architectural metadata overlays.',
      icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
      action: () => openPanorama('VIZTR-882')
    },
    {
      id: 'exp-webxr',
      title: 'Interactive WebXR 3D Model Viewer',
      badge: 'Browser 3D Engine',
      description: 'Inspect LOD400 architectural geometry, BIM layers, floor isolations, and sun simulation.',
      icon: <Box className="w-5 h-5 text-amber-400" />,
      action: () => openModelViewer('VIZTR-882')
    }
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#3ECF8E]" />
            <span>Interactive Spatial & Realtime Viewers</span>
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Launch browser-based immersive models, 360° virtual tours, and cloud GPU streams
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {experiences.map((exp) => (
          <div
            key={exp.id}
            className="p-5 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-[#3ECF8E]/40 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-lg bg-[#09090B] border border-[#27272A]">
                  {exp.icon}
                </div>
                <span className="px-2 py-0.5 rounded bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 text-[#3ECF8E] text-[10px] font-mono font-bold uppercase">
                  {exp.badge}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#3ECF8E] transition-colors">
                {exp.title}
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                {exp.description}
              </p>
            </div>

            <button
              onClick={exp.action}
              className="w-full py-2.5 px-4 rounded-lg bg-[#09090B] hover:bg-[#3ECF8E] text-white hover:text-black border border-[#27272A] hover:border-[#3ECF8E] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Experience</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
