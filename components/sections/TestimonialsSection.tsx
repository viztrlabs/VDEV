'use client';

import React from 'react';
import { homepageData } from '@/data/homepage';
import { Star, Quote } from 'lucide-react';

export default function TestimonialsSection() {
  const { testimonials, stats } = homepageData;

  return (
    <section id="testimonials-section" className="py-16 px-4 sm:px-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#27272A]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#3ECF8E]">
              CLIENT ENDORSEMENTS & METRICS
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FAFAFA]">
            What Clients Say
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-md">
          Trusted by premier architects, sovereign wealth developers, and luxury interior studios worldwide.
        </p>
      </div>

      {/* TESTIMONIAL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-[#3f3f46] transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-[#3ECF8E]">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#3ECF8E]" />
                ))}
              </div>
              <p className="text-xs text-[#FAFAFA] leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-[#27272A]">
              <h4 className="text-xs font-bold text-[#FAFAFA]">
                {t.clientName}
              </h4>
              <p className="text-[10px] font-mono text-[#71717A] mt-0.5">
                {t.role}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* STATS ROW */}
      <div className="p-6 rounded-xl bg-[#18181B] text-white border border-[#27272A] grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {stats.map((s, idx) => (
          <div key={idx} className="space-y-0.5">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#3ECF8E]">
              {s.value}
            </div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA]">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
