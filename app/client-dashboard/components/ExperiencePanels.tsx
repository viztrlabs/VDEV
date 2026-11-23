'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Play, Sparkles, Box, Layers } from 'lucide-react';

export default function ExperiencePanels() {
  const { openPanorama, openModelViewer } = useAppStore();

  const experiences = [
    {
      id: 'exp-tour',
      title: '16K Ultra-HD Panoramic Virtual Tour',
      badge: 'Spatial Hotspots',
      description: 'Explore 360° master cameras with interactive material swaps and architectural metadata overlays.',
      icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
      action: () => openPanorama('/assets/tours/viztr-882-tour.ply', 'The Apex Tower — Panoramic Tour')
    },
    {
      id: 'exp-webxr',
      title: 'Interactive WebXR 3D Model Viewer',
      badge: 'Browser 3D Engine',
      description: 'Inspect LOD400 architectural geometry, BIM layers, floor isolations, and sun simulation.',
      icon: <Box className="w-5 h-5 text-amber-400" />,
      action: () => openModelViewer('/assets/models/viztr-882.glb', 'The Apex Tower — WebXR Model')
    }
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#353436]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#dbfcff]" />
            <span>Interactive Spatial & Realtime Viewers</span>
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Launch browser-based immersive models and 360° virtual tours
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {experiences.map((exp) => (
          <div
            key={exp.id}
            className="p-5 rounded-xl bg-[#201f20] border border-[#353436] hover:border-[#dbfcff]/40 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-lg bg-[#131314] border border-[#353436]">
                  {exp.icon}
                </div>
                <span className="px-2 py-0.5 rounded bg-[#dbfcff]/10 border border-[#dbfcff]/30 text-[#dbfcff] text-[10px] font-mono font-bold uppercase">
                  {exp.badge}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#dbfcff] transition-colors">
                {exp.title}
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                {exp.description}
              </p>
            </div>

            <button
              onClick={exp.action}
              className="w-full py-2.5 px-4 rounded-lg bg-[#131314] hover:bg-[#dbfcff] text-white hover:text-black border border-[#353436] hover:border-[#dbfcff] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
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
