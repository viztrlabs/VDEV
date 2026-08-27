'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, Globe, Sparkles, Cpu, Leaf, Award, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="flex-1 w-full pb-24">
      {/* HERO */}
      <section className="relative py-28 px-6 bg-zinc-950 text-white overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85"
          alt="VizTR Architectural Design"
          fill
          priority
          referrerPolicy="no-referrer"
          className="object-cover opacity-30 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <span className="px-3.5 py-1 rounded-full bg-rose-600/30 border border-rose-500/40 text-rose-400 text-xs font-bold uppercase tracking-widest inline-block">
            Architectural Vision & Spatial Engineering
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight font-display">
            The Studio Behind the World’s Most Iconic Unbuilt Architecture
          </h1>
          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            VizTR bridges the chasm between raw architectural blueprint and emotional reality through masterclass CGI rendering and real-time WebXR spatial computing.
          </p>
        </div>
      </section>

      {/* CORE PILLARS */}
      <section className="py-20 px-6 max-w-[1280px] mx-auto space-y-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white font-display">
              Uncompromising Artistry
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Every texture is physically measured, every shadow is path-traced against realistic atmospheric coordinates, and every composition is framed with classical architectural lens logic.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white font-display">
              XR Technological Leadership
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              We pioneer browser-native 3D, zero-install WebXR, and cloud Unreal Engine 5.4 Pixel Streaming so international buyers can walk unbuilt spaces without downloading an app.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white font-display">
              Zero-Carbon Cloud Computing
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              100% of our distributed GPU render farm operations are powered by hydro and geothermal green data centers, matching our architectural clients&apos; ESG commitments.
            </p>
          </div>
        </div>

        {/* STUDIO DIRECTORS / LEADERSHIP */}
        <div className="space-y-10">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Leadership
            </span>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white font-display mt-1">
              Architectural & Visual Directors
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Julian Vance, AIA',
                role: 'Principal Architectural Director',
                bio: 'Former Zaha Hadid Architects senior associate with 15 years in parametric masterplanning.',
                image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
              },
              {
                name: 'Elena Rostova',
                role: 'Head of CGI & Lighting',
                bio: 'Award-winning architectural lighting director specialized in large-scale Nordic daylight studies.',
                image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
              },
              {
                name: 'Kenji Takahashi',
                role: 'Chief Spatial / XR Engineer',
                bio: 'Pioneered WebGPU rendering engines and real-time Unreal 5 cloud stream optimization.',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
              },
              {
                name: 'Clara Delacroix',
                role: 'Director of Interior FF&E',
                bio: 'Parisian interior stylist curating photorealistic tactile PBR finishes for prime residences.',
                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
              },
            ].map((leader, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-md space-y-4"
              >
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <Image
                    src={leader.image}
                    alt={leader.name}
                    width={400}
                    height={400}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-zinc-900 dark:text-white font-display">
                    {leader.name}
                  </h4>
                  <div className="text-xs font-semibold text-rose-500">{leader.role}</div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-1 leading-relaxed">
                    {leader.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GLOBAL PRESENCE */}
        <div className="p-8 sm:p-12 rounded-3xl bg-zinc-950 text-white border border-zinc-800 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Global Operations
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-display">
              Four Hubs. 24-Hour Production Cycle.
            </h3>
            <p className="text-xs text-zinc-400">
              Our synchronized studios across London, New York, Dubai, and Tokyo ensure rapid, around-the-clock turnaround.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
              <div className="text-rose-500 text-sm font-bold">NEW YORK</div>
              <div className="text-xs text-zinc-400">Americas Commercial Hub</div>
              <div className="text-[11px] text-zinc-500 font-mono">EST / UTC-5</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
              <div className="text-rose-500 text-sm font-bold">LONDON</div>
              <div className="text-xs text-zinc-400">European Creative HQ</div>
              <div className="text-[11px] text-zinc-500 font-mono">GMT / UTC+0</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
              <div className="text-rose-500 text-sm font-bold">DUBAI</div>
              <div className="text-xs text-zinc-400">Middle East Megaprojects</div>
              <div className="text-[11px] text-zinc-500 font-mono">GST / UTC+4</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
              <div className="text-rose-500 text-sm font-bold">TOKYO</div>
              <div className="text-xs text-zinc-400">XR Spatial Research Lab</div>
              <div className="text-[11px] text-zinc-500 font-mono">JST / UTC+9</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
