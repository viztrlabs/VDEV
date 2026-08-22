'use client';

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { ScanLine, Box, Headset, Compass, ArrowRight, Play } from 'lucide-react';

export default function XRExperienceSection() {
  const { openPanorama, openModelViewer, openPixelStream } = useAppStore();

  const experiences = [
    {
      id: 'webar',
      title: 'WebAR Experience',
      desc: 'Project 3D spatial buildings onto physical tables or on-site parcels via mobile browser.',
      cta: 'Launch AR Simulator',
      action: () => openModelViewer('', 'WebAR Tabletop Model'),
      icon: ScanLine,
      color: 'text-emerald-400'
    },
    {
      id: 'webxr',
      title: 'WebXR 3D Orbit',
      desc: 'Real-time in-browser orbital exploration with PBR lighting and material variations.',
      cta: 'Explore 3D Model',
      action: () => openModelViewer('', 'WebXR Apex Tower Model'),
      icon: Box,
      color: 'text-rose-400'
    },
    {
      id: 'vr',
      title: 'VR Headset Immersion',
      desc: 'Full 90 FPS stereoscopic immersion optimized for Meta Quest and Apple Vision Pro.',
      cta: 'Request VR Package',
      href: '/xr-world/virtual-reality',
      icon: Headset,
      color: 'text-sky-400'
    },
    {
      id: 'tour',
      title: '16K 360° Virtual Tour',
      desc: 'High-dynamic-range spherical nodes with pulsing spatial information hotspots.',
      cta: 'Explore 360° Tour',
      action: () => openPanorama('', 'Desert Mirage Pavilion 360'),
      icon: Compass,
      color: 'text-amber-400'
    }
  ];

  return (
    <section id="xr-experience-section" className="py-16 px-4 sm:px-6 bg-[#09090B] text-white border-y border-[#27272A] relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#27272A]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#3ECF8E]">
                LIVE INTERACTIVE RUNTIME
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FAFAFA]">
              Experience the Future of Architecture
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-md">
            Test zero-install spatial modules directly in your browser with hardware-accelerated WebXR.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {experiences.map((exp) => {
            const Icon = exp.icon;
            return (
              <div
                key={exp.id}
                className="p-5 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-[#3f3f46] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded bg-[#09090B] border border-[#27272A] flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 text-[#3ECF8E]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#FAFAFA] mb-1.5">
                    {exp.title}
                  </h3>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    {exp.desc}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-[#27272A]">
                  {exp.action ? (
                    <button
                      onClick={exp.action}
                      className="w-full py-2 rounded bg-[#09090B] hover:bg-[#3ECF8E] hover:text-black text-[#FAFAFA] border border-[#27272A] text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>{exp.cta}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <Link
                      href={exp.href!}
                      className="w-full py-2 rounded bg-[#09090B] hover:bg-[#3ECF8E] hover:text-black text-[#FAFAFA] border border-[#27272A] text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>{exp.cta}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
