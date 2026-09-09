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
    <section id="xr-experience-section" className="py-16 px-4 sm:px-6 bg-[#0A0A0B] text-white border-y border-[#1E293B] relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#1E293B]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#42CF8B] animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#42CF8B]">
                LIVE INTERACTIVE RUNTIME
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-[#FAFAFA]">
              Experience the Future of Architecture
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#B9CACB] max-w-md">
            Test zero-install spatial modules directly in your browser with hardware-accelerated WebXR.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {experiences.map((exp) => {
            const Icon = exp.icon;
            return (
              <div
                key={exp.id}
                className="p-6 rounded-[2rem] bg-[#131314] border border-[#1E293B] hover:border-[#00F0FF]/40 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
              >
                <div>
                  <div className="w-10 h-10 rounded-full bg-[#0A0A0B] border border-[#1E293B] flex items-center justify-center mb-4 text-[#00F0FF] group-hover:border-[#00F0FF]/50 transition-colors">
                    <Icon className="w-4 h-4 text-[#00F0FF]" />
                  </div>
                  <h3 className="text-base font-display font-bold text-[#FAFAFA] mb-2">
                    {exp.title}
                  </h3>
                  <p className="text-xs text-[#B9CACB] leading-relaxed">
                    {exp.desc}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-[#1E293B]">
                  {exp.action ? (
                    <button
                      onClick={exp.action}
                      className="w-full py-2.5 rounded-full bg-[#0A0A0B] hover:bg-[#00F0FF] hover:text-black text-[#FAFAFA] border border-[#1E293B] hover:border-[#00F0FF] text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-[0_0_16px_rgba(0,240,255,0.3)]"
                    >
                      <span>{exp.cta}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <Link
                      href={exp.href!}
                      className="w-full py-2.5 rounded-full bg-[#0A0A0B] hover:bg-[#00F0FF] hover:text-black text-[#FAFAFA] border border-[#1E293B] hover:border-[#00F0FF] text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-[0_0_16px_rgba(0,240,255,0.3)]"
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
