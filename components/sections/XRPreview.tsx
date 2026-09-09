'use client';

import React from 'react';
import Link from 'next/link';
import { homepageData } from '@/data/homepage';
import { useAppStore } from '@/lib/store';
import {
  Box,
  ScanLine,
  Headset,
  Compass,
  Cpu,
  ArrowRight,
  Sparkles,
  Play
} from 'lucide-react';

export default function XRPreview() {
  const { xrPreview } = homepageData;
  const { openPixelStream, openPanorama, openModelViewer } = useAppStore();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Box':
        return <Box className="w-5 h-5 text-[#00F0FF]" />;
      case 'ScanLine':
        return <ScanLine className="w-5 h-5 text-[#42CF8B]" />;
      case 'Headset':
        return <Headset className="w-5 h-5 text-[#00F0FF]" />;
      case 'Compass':
        return <Compass className="w-5 h-5 text-[#42CF8B]" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-[#00F0FF]" />;
      default:
        return <Box className="w-5 h-5 text-[#00F0FF]" />;
    }
  };

  return (
    <section id="xr-preview-section" className="py-16 px-4 sm:px-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#42CF8B] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#42CF8B]">
              REAL-TIME MATRIX
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-[#FAFAFA]">
            {xrPreview.title}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#B9CACB] max-w-md">
          {xrPreview.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {xrPreview.services.map((svc) => {
          const isFlagship = svc.isFlagship;

          return (
            <div
              key={svc.id}
              className={`rounded-[2rem] p-6 flex flex-col justify-between transition-all duration-300 group shadow-sm hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)] ${
                isFlagship
                  ? 'lg:col-span-2 bg-[#131314] text-white border-2 border-[#00F0FF] shadow-[0_0_24px_rgba(0,240,255,0.15)]'
                  : 'bg-[#131314] border border-[#1E293B] text-white hover:border-[#00F0FF]/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#0A0A0B] border border-[#1E293B] flex items-center justify-center shadow-inner">
                    {getIcon(svc.icon)}
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full border ${
                      isFlagship
                        ? 'bg-[#00F0FF] text-black border-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                        : 'bg-[#0A0A0B] text-[#42CF8B] border-[#1E293B]'
                    }`}
                  >
                    {svc.badge}
                  </span>
                </div>

                <h3 className="text-base font-display font-bold text-[#FAFAFA] mb-2">
                  {svc.name}
                </h3>
                <p className="text-xs leading-relaxed text-[#B9CACB]">
                  {svc.description}
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-[#1E293B] flex items-center justify-between gap-2">
                <Link
                  href={svc.href}
                  className="text-xs font-bold text-[#00F0FF] hover:underline inline-flex items-center gap-1.5"
                >
                  <span>Specs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {isFlagship ? (
                  <button
                    onClick={openPixelStream}
                    className="px-4 py-2 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-[0_0_16px_rgba(0,240,255,0.3)] active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-black text-black" />
                    <span>Launch Pixel Stream</span>
                  </button>
                ) : svc.id === 'webxr' ? (
                  <button
                    onClick={() => openModelViewer('', 'WebXR Apex Tower')}
                    className="px-3.5 py-1.5 rounded-full bg-[#0A0A0B] hover:bg-[#00F0FF] hover:text-black text-xs font-bold text-[#FAFAFA] border border-[#1E293B] hover:border-[#00F0FF] transition-all duration-300 cursor-pointer shadow-sm"
                  >
                    3D Orbit
                  </button>
                ) : svc.id === 'virtual-tour' ? (
                  <button
                    onClick={() => openPanorama('', 'Sample 360 Tour')}
                    className="px-3.5 py-1.5 rounded-full bg-[#0A0A0B] hover:bg-[#00F0FF] hover:text-black text-xs font-bold text-[#FAFAFA] border border-[#1E293B] hover:border-[#00F0FF] transition-all duration-300 cursor-pointer shadow-sm"
                  >
                    360° Node
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
