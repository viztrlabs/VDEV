'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Palette, Box, BarChart3, Wrench } from 'lucide-react';

interface Pillar {
  id: string;
  number: string;
  title: string;
  verb: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  bgColor: string;
}

const pillars: Pillar[] = [
  {
    id: 'studio',
    number: '01',
    title: 'Studio',
    verb: 'Create.',
    description: 'Professional architectural visualization with photorealistic renders and cinematic walkthroughs.',
    icon: Palette,
    href: '/studio',
    color: 'text-[#00F0FF]',
    bgColor: 'bg-[#00F0FF]/10',
  },
  {
    id: 'xr-world',
    number: '02',
    title: 'XR World',
    verb: 'Experience.',
    description: 'Interactive, immersive property experiences with WebXR, WebAR, VR, and virtual tours.',
    icon: Box,
    href: '/xr-world',
    color: 'text-[#42CF8B]',
    bgColor: 'bg-[#42CF8B]/10',
  },
  {
    id: 'project-hub',
    number: '03',
    title: 'Project Hub',
    verb: 'Track.',
    description: 'Real-time project progress, feedback, and delivery — all in one place.',
    icon: BarChart3,
    href: '/track-project',
    color: 'text-[#F59E0B]',
    bgColor: 'bg-[#F59E0B]/10',
  },
  {
    id: 'creator',
    number: '04',
    title: 'Creator',
    verb: 'Build.',
    description: 'Tools to create and configure experiences with 3D editing, Gaussian Splat, and publishing.',
    icon: Wrench,
    href: '/creator',
    color: 'text-[#EC4899]',
    bgColor: 'bg-[#EC4899]/10',
  },
];

export default function FourPillarsSection() {
  return (
    <section
      id="four-pillars-section"
      className="py-20 px-4 sm:px-6 bg-[#0A0A0B] text-white border-y border-[#1E293B] relative overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#42CF8B] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#42CF8B]">
              THE VIZTR PLATFORM
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-[#FAFAFA] mb-4">
            Four Pillars. One Vision.
          </h2>
          <p className="text-sm sm:text-base text-[#B9CACB] max-w-2xl mx-auto">
            From visualization to experience — from creation to delivery.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Link
                key={pillar.id}
                href={pillar.href}
                className="group relative p-6 rounded-[1.5rem] bg-[#131314] border border-[#1E293B] hover:border-[#42CF8B]/40 transition-all duration-300 flex flex-col items-center text-center shadow-sm hover:shadow-lg hover:shadow-[#42CF8B]/5"
              >
                {/* Number */}
                <span className="text-[10px] font-mono font-bold text-[#71717A] tracking-widest mb-4">
                  {pillar.number}
                </span>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl ${pillar.bgColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${pillar.color}`} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-display font-bold text-[#FAFAFA] mb-1">
                  {pillar.title}
                </h3>

                {/* Verb */}
                <p className={`text-sm font-semibold ${pillar.color} mb-3`}>
                  {pillar.verb}
                </p>

                {/* Description */}
                <p className="text-xs text-[#B9CACB] leading-relaxed mb-5">
                  {pillar.description}
                </p>

                {/* CTA */}
                <div className="mt-auto flex items-center gap-1.5 text-xs font-bold text-[#FAFAFA] group-hover:text-[#42CF8B] transition-colors">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Project Hub Preview Card */}
        <div className="mt-12 max-w-md mx-auto">
          <div className="p-5 rounded-2xl bg-[#131314] border border-[#1E293B]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#FAFAFA]">LUXURY SMART VILLA</p>
                <p className="text-[10px] font-mono text-[#71717A]">Project #VTR-2048</p>
              </div>
            </div>
            <div className="space-y-2.5 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#B9CACB]">Modeling</span>
                <span className="text-xs font-mono text-[#42CF8B]">✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#B9CACB]">Visualization</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-[#27272A] rounded-full overflow-hidden">
                    <div className="w-[78%] h-full bg-[#F59E0B] rounded-full" />
                  </div>
                  <span className="text-xs font-mono text-[#F59E0B]">78%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#B9CACB]">XR Experience</span>
                <span className="text-xs font-mono text-[#00F0FF]">In Progress</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#B9CACB]">Final Delivery</span>
                <span className="text-xs font-mono text-[#71717A]">—</span>
              </div>
            </div>
            <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#71717A]">Last update · 12 min ago</span>
              <Link
                href="/track-project"
                className="text-xs font-bold text-[#F59E0B] hover:underline flex items-center gap-1"
              >
                Review Project <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
