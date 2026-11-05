'use client';

import React from 'react';
import Link from 'next/link';
import { homepageData } from '@/data/homepage';
import { Box, Sparkles, Layers, PenTool, Zap, ExternalLink, ArrowRight } from 'lucide-react';

export default function CreatorSection() {
 const { creator } = homepageData;

 const getIcon = (name: string) => {
 const icons: Record<string, React.ReactNode> = {
 Box: <Box className="w-5 h-5"/>,
 Sparkles: <Sparkles className="w-5 h-5"/>,
 Layers: <Layers className="w-5 h-5"/>,
 PenTool: <PenTool className="w-5 h-5"/>,
 Zap: <Zap className="w-5 h-5"/>,
 ExternalLink: <ExternalLink className="w-5 h-5"/>,
 };
 return icons[name] || <Box className="w-5 h-5"/>;
 };

 return (
 <section id="creator-section"className="py-28 bg-transparent text-white relative">
 <div className="w-full container-ultrawide">
 {/* Section Header */}
 <div className="text-center max-w-2xl mx-auto mb-16">
 <span className="px-4 py-1.5 rounded-full glass-pill text-[#00F0FF] text-xs font-bold uppercase tracking-widest inline-block mb-4 border border-[#1E293B]">
 Creator
 </span>
 <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white font-display mb-4">
 {creator.title}
 </h2>
 <p className="text-lg text-[#B9CACB] font-medium">{creator.tagline}</p>
 </div>

 {/* Tools Grid */}
 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-12">
 {creator.tools.map((tool) => (
 <div
 key={tool.id}
 className={`p-6 rounded-[2rem] bg-[#131314] border border-[#1E293B] flex flex-col justify-between group shadow-sm transition-all duration-300 ${
 tool.comingSoon ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#00F0FF]/40 '
 }`}
 >
 <div>
 <div className="w-10 h-10 rounded-full bg-[#0A0A0B] border border-[#1E293B] flex items-center justify-center mb-4 text-[#00F0FF] group-hover:border-[#00F0FF]/50 transition-colors">
 {getIcon(tool.icon)}
 </div>
 <h3 className="text-base font-display font-bold text-[#FAFAFA] mb-2">{tool.name}</h3>
 <p className="text-xs text-[#B9CACB] leading-relaxed mb-4">{tool.description}</p>
 </div>

 <div className="pt-5 mt-4 border-t border-[#1E293B]">
 {tool.comingSoon ? (
 <div className="w-full py-2.5 rounded-full bg-[#0A0A0B] text-zinc-500 border border-[#1E293B] text-xs font-bold uppercase tracking-wider text-center">
 Coming Soon
 </div>
 ) : (
 <Link
 href={tool.href}
 className="w-full py-2.5 rounded-full bg-[#0A0A0B] hover:bg-[#00F0FF] hover:text-black text-[#FAFAFA] border border-[#1E293B] hover:border-[#00F0FF] text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
 >
 <span>Open Tool</span>
 <ArrowRight className="w-3.5 h-3.5"/>
 </Link>
 )}
 </div>
 </div>
 ))}
 </div>

 {/* CTA */}
 <div className="text-center">
 <Link
 href={creator.cta.href}
 className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-extrabold text-sm transition-all hover:scale-105"
 >
 <span>{creator.cta.label}</span>
 <ArrowRight className="w-4 h-4"/>
 </Link>
 </div>
 </div>
 </section>
 );
}