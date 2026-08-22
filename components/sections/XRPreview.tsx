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
        return <Box className="w-6 h-6 text-rose-500" />;
      case 'ScanLine':
        return <ScanLine className="w-6 h-6 text-emerald-400" />;
      case 'Headset':
        return <Headset className="w-6 h-6 text-sky-400" />;
      case 'Compass':
        return <Compass className="w-6 h-6 text-amber-400" />;
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-rose-400" />;
      default:
        return <Box className="w-6 h-6 text-rose-500" />;
    }
  };

  return (
    <section id="xr-preview-section" className="py-16 px-4 sm:px-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#27272A]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#3ECF8E]">
              REAL-TIME MATRIX
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FAFAFA]">
            {xrPreview.title}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-md">
          {xrPreview.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {xrPreview.services.map((svc) => {
          const isFlagship = svc.isFlagship;

          return (
            <div
              key={svc.id}
              className={`rounded-xl p-5 flex flex-col justify-between transition-all ${
                isFlagship
                  ? 'lg:col-span-2 bg-[#18181B] text-white border-2 border-[#3ECF8E] shadow-xl'
                  : 'bg-[#18181B] border border-[#27272A] text-white hover:border-[#3f3f46]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded bg-[#09090B] border border-[#27272A]">
                    {getIcon(svc.icon)}
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                      isFlagship
                        ? 'bg-[#3ECF8E] text-black border-[#3ECF8E]'
                        : 'bg-[#09090B] text-[#3ECF8E] border-[#27272A]'
                    }`}
                  >
                    {svc.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#FAFAFA] mb-1">
                  {svc.name}
                </h3>
                <p className="text-xs leading-relaxed text-[#A1A1AA]">
                  {svc.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#27272A] flex items-center justify-between gap-2">
                <Link
                  href={svc.href}
                  className="text-xs font-mono font-semibold text-[#3ECF8E] hover:underline inline-flex items-center gap-1"
                >
                  <span>Specs</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>

                {isFlagship ? (
                  <button
                    onClick={openPixelStream}
                    className="px-3 py-1.5 rounded bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-black text-black" />
                    <span>Launch Pixel Stream</span>
                  </button>
                ) : svc.id === 'webxr' ? (
                  <button
                    onClick={() => openModelViewer('', 'WebXR Apex Tower')}
                    className="px-2.5 py-1 rounded bg-[#27272A] hover:bg-[#3ECF8E] hover:text-black text-xs font-mono font-semibold text-[#FAFAFA] transition-colors cursor-pointer"
                  >
                    3D Orbit
                  </button>
                ) : svc.id === 'virtual-tour' ? (
                  <button
                    onClick={() => openPanorama('', 'Sample 360 Tour')}
                    className="px-2.5 py-1 rounded bg-[#27272A] hover:bg-[#3ECF8E] hover:text-black text-xs font-mono font-semibold text-[#FAFAFA] transition-colors cursor-pointer"
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
