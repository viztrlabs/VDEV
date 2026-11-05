'use client';

import React from 'react';
import Link from 'next/link';
import { homepageData } from '@/data/homepage';
import { Building2, Home, Building, Palette, Briefcase, ArrowRight } from 'lucide-react';

export default function SolutionsSection() {
 const { solutions } = homepageData;

 const getIcon = (name: string) => {
 const icons: Record<string, React.ReactNode> = {
 Building2: <Building2 className="w-5 h-5"/>,
 Home: <Home className="w-5 h-5"/>,
 Building: <Building className="w-5 h-5"/>,
 Palette: <Palette className="w-5 h-5"/>,
 Briefcase: <Briefcase className="w-5 h-5"/>,
 };
 return icons[name] || <Building2 className="w-5 h-5"/>;
 };

 return (
 <section id="solutions-section"className="py-28 bg-transparent border-y border-[var(--glass-border)] relative">
 <div className="w-full container-ultrawide">
 {/* Section Header */}
 <div className="text-center max-w-2xl mx-auto mb-16">
 <span className="px-4 py-1.5 rounded-full glass-pill text-[#42CF8B] text-xs font-bold uppercase tracking-widest inline-block mb-4 border border-[#1E293B]">
 Solutions
 </span>
 <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white font-display mb-4">
 {solutions.title}
 </h2>
 <p className="text-lg text-[#B9CACB] font-medium">{solutions.subtitle}</p>
 </div>

 {/* Solution Cards */}
 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
 {solutions.audiences.map((audience) => (
 <Link
 key={audience.id}
 href={audience.href}
 className="p-6 rounded-[2rem] bg-[#131314] border border-[#1E293B] hover:border-[#42CF8B]/40 transition-all duration-300 flex flex-col justify-between group shadow-sm"
 >
 <div>
 <div className="w-10 h-10 rounded-full bg-[#0A0A0B] border border-[#1E293B] flex items-center justify-center mb-4 text-[#42CF8B] group-hover:border-[#42CF8B]/50 transition-colors">
 {getIcon(audience.icon)}
 </div>
 <h3 className="text-base font-display font-bold text-[#FAFAFA] mb-2">{audience.title}</h3>
 <p className="text-xs text-[#B9CACB] leading-relaxed">{audience.description}</p>
 </div>
 <div className="pt-5 mt-4 border-t border-[#1E293B]">
 <div className="w-full py-2.5 rounded-full bg-[#0A0A0B] group-hover:bg-[#42CF8B] group-hover:text-black text-[#FAFAFA] border border-[#1E293B] group-hover:border-[#42CF8B] text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm">
 <span>Learn More</span>
 <ArrowRight className="w-3.5 h-3.5"/>
 </div>
 </div>
 </Link>
 ))}
 </div>
 </div>
 </section>
 );
}