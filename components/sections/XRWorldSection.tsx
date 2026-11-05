'use client';

import React from 'react';
import Link from 'next/link';
import { homepageData } from '@/data/homepage';
import { ArrowRight, Box, ScanLine, Headset, Compass, Sparkles, Cpu } from 'lucide-react';

export default function XRWorldSection() {
 const { xrWorld } = homepageData;

 const getIcon = (name: string) => {
 const icons: Record<string, React.ReactNode> = {
 Box: <Box className="w-5 h-5"/>,
 ScanLine: <ScanLine className="w-5 h-5"/>,
 Headset: <Headset className="w-5 h-5"/>,
 Compass: <Compass className="w-5 h-5"/>,
 Sparkles: <Sparkles className="w-5 h-5"/>,
 Cpu: <Cpu className="w-5 h-5"/>,
 };
 return icons[name] || <Box className="w-5 h-5"/>;
 };

 return (
 <section id="xr-world-section"className="py-28 px-6 bg-transparent border-y border-[var(--glass-border)] relative">
 <div className="container-ultrawide">
 {/* Section Header */}
 <div className="text-center max-w-2xl mx-auto mb-16">
 <span className="px-4 py-1.5 rounded-full glass-pill text-[#42CF8B] text-xs font-bold uppercase tracking-widest inline-block mb-4 border border-[#1E293B]">
 Section 02
 </span>
 <h2 className="text-fluid-h2 font-bold tracking-tight text-white font-display mb-4">
 {xrWorld.title}
 </h2>
 <p className="text-lg text-[#B9CACB] font-medium prose-readable mx-auto">{xrWorld.tagline}</p>
 </div>

 {/* Experience Cards Grid */}
 <div className="grid md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 grid-ultrawide-3 gap-6 w-full">
 {xrWorld.experiences.map((exp) => (
 <Link
 key={exp.id}
 href={exp.href}
 className="p-6 rounded-[2rem] bg-[#131314] border border-[#1E293B] hover:border-[#42CF8B]/40 transition-all duration-300 flex flex-col justify-between group shadow-sm"
 >
 <div>
 <div className="w-10 h-10 rounded-full bg-[#0A0A0B] border border-[#1E293B] flex items-center justify-center mb-4 text-[#42CF8B] group-hover:border-[#42CF8B]/50 transition-colors">
 {getIcon(exp.icon)}
 </div>
 <div className="space-y-2">
 <div className="flex items-center gap-2">
 <h3 className="text-base font-display font-bold text-[#FAFAFA]">{exp.name}</h3>
 {exp.badge && (
 <span className="px-2.5 py-0.5 rounded-full bg-[#0A0A0B] border border-[#42CF8B]/35 text-[#42CF8B] text-[9px] font-extrabold uppercase tracking-wider">
 {exp.badge}
 </span>
 )}
 </div>
 <p className="text-xs text-[#B9CACB] leading-relaxed">{exp.purpose}</p>
 </div>
 </div>
 <div className="pt-5 mt-4 border-t border-[#1E293B]">
 <div className="w-full py-2.5 rounded-full bg-[#0A0A0B] group-hover:bg-[#42CF8B] group-hover:text-black text-[#FAFAFA] border border-[#1E293B] group-hover:border-[#42CF8B] text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm">
 <span>Explore {exp.name}</span>
 <ArrowRight className="w-3.5 h-3.5"/>
 </div>
 </div>
 </Link>
 ))}
 </div>

 {/* CTA */}
 <div className="text-center mt-12">
 <Link
 href={xrWorld.cta.href}
 className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#42CF8B] hover:bg-[#58dc9b] text-black font-bold text-sm transition-all hover:scale-105"
 >
 <span>{xrWorld.cta.label}</span>
 <ArrowRight className="w-4 h-4"/>
 </Link>
 </div>
 </div>
 </section>
 );
}