'use client';

import React from 'react';
import { homepageData } from '@/data/homepage';
import { Star, Quote } from 'lucide-react';

export default function TestimonialsSection() {
  const { testimonials, stats } = homepageData;

  return (
    <section id="testimonials-section" className="py-16 px-4 sm:px-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#42CF8B] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#42CF8B]">
              CLIENT ENDORSEMENTS & METRICS
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-[#FAFAFA]">
            What Clients Say
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#B9CACB] max-w-md">
          Trusted by premier architects, sovereign wealth developers, and luxury interior studios worldwide.
        </p>
      </div>

      {/* TESTIMONIAL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className="p-6 rounded-[2rem] bg-[#131314] border border-[#1E293B] hover:border-[#00F0FF]/40 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-[#00F0FF]">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#00F0FF]" />
                ))}
              </div>
              <p className="text-sm text-[#FAFAFA] leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>

            <div className="pt-5 mt-5 border-t border-[#1E293B]">
              <h4 className="text-sm font-display font-bold text-[#FAFAFA]">
                {t.clientName}
              </h4>
              <p className="text-xs text-[#B9CACB] mt-0.5">
                {t.role}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* STATS ROW */}
      <div className="p-8 rounded-[2rem] bg-[#131314] text-white border border-[#1E293B] grid grid-cols-2 md:grid-cols-4 gap-6 text-center shadow-xl">
        {stats.map((s, idx) => (
          <div key={idx} className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold font-display text-[#00F0FF]">
              {s.value}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#B9CACB]">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
