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
 ArrowRight,
 Sparkles,
} from 'lucide-react';

export default function XRPreview() {
 const { xrPreview } = homepageData;
 const { openPanorama, openModelViewer } = useAppStore();

 const getIcon = (iconName: string) => {
 switch (iconName) {
 case 'Box':
 return <Box className="w-5 h-5 text-[#00F0FF]"/>;
 case 'ScanLine':
 return <ScanLine className="w-5 h-5 text-[#54de99]"/>;
 case 'Headset':
 return <Headset className="w-5 h-5 text-[#00F0FF]"/>;
 case 'Compass':
 return <Compass className="w-5 h-5 text-[#54de99]"/>;
 default:
 return <Box className="w-5 h-5 text-[#00F0FF]"/>;
 }
 };

 return (
 <section id="xr-preview-section"className="py-16 px-4 sm:px-6 max-w-[1400px] mx-auto">
 <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#3b494b]">
 <div>
 <div className="flex items-center gap-2 mb-1.5">
 <span className="w-2 h-2 rounded-full bg-[#54de99] animate-pulse"/>
 <span className="text-[11px] font-bold uppercase tracking-widest text-[#54de99]">
 REAL-TIME MATRIX
 </span>
 </div>
 <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-[#e5e2e3]">
 {xrPreview.title}
 </h2>
 </div>
 <p className="text-xs sm:text-sm text-[#B9CACB] max-w-md">
 {xrPreview.subtitle}
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {xrPreview.services.map((svc) => {
 return (
 <div
 key={svc.id}
 className="rounded-[2rem] p-6 flex flex-col justify-between transition-all duration-300 group shadow-sm bg-[#131314] border border-[#3b494b] text-white hover:border-[#00F0FF]/40"
 >
 <div>
 <div className="flex items-center justify-between mb-4">
 <div className="w-10 h-10 rounded-full bg-[#131314] border border-[#3b494b] flex items-center justify-center shadow-inner">
 {getIcon(svc.icon)}
 </div>
 <span
 className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full border bg-[#131314] text-[#54de99] border-[#3b494b]"
 >
 {svc.badge}
 </span>
 </div>

 <h3 className="text-base font-display font-bold text-[#e5e2e3] mb-2">
 {svc.name}
 </h3>
 <p className="text-xs leading-relaxed text-[#B9CACB]">
 {svc.description}
 </p>
 </div>

 <div className="pt-5 mt-4 border-t border-[#3b494b] flex items-center justify-between gap-2">
 <Link
 href={svc.href}
 className="text-xs font-bold text-[#00F0FF] hover:underline inline-flex items-center gap-1.5"
 >
 <span>Specs</span>
 <ArrowRight className="w-3.5 h-3.5"/>
 </Link>

 {svc.id === 'webxr' ? (
 <button
 onClick={() => openModelViewer('', 'WebXR Apex Tower')}
 className="px-3.5 py-1.5 rounded-full bg-[#131314] hover:bg-[#00F0FF] hover:text-black text-xs font-bold text-[#e5e2e3] border border-[#3b494b] hover:border-[#00F0FF] transition-all duration-300 cursor-pointer shadow-sm"
 >
 3D Orbit
 </button>
 ) : svc.id === 'virtual-tour' ? (
 <button
 onClick={() => openPanorama('', 'Sample 360 Tour')}
 className="px-3.5 py-1.5 rounded-full bg-[#131314] hover:bg-[#00F0FF] hover:text-black text-xs font-bold text-[#e5e2e3] border border-[#3b494b] hover:border-[#00F0FF] transition-all duration-300 cursor-pointer shadow-sm"
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
