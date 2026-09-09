'use client';

import React, { useState } from 'react';
import { homepageData } from '@/data/homepage';
import { ChevronDown } from 'lucide-react';

export default function FAQSection() {
  const { faq } = homepageData;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq-section" className="py-16 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#42CF8B] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#42CF8B]">
              KNOWLEDGE BASE
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-[#FAFAFA]">
            Frequently Asked Questions
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#B9CACB] max-w-xs">
          Architectural CGI, WebXR formats, and project delivery specs.
        </p>
      </div>

      <div className="space-y-3">
        {faq.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-[#131314] border border-[#1E293B] overflow-hidden transition-all duration-300 hover:border-[#00F0FF]/30 shadow-sm"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                aria-expanded={isOpen}
              >
                <span className="text-sm sm:text-base font-display font-bold text-[#FAFAFA]">
                  {item.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#71717A] shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#00F0FF]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-[#B9CACB] leading-relaxed border-t border-[#1E293B] pt-4 animate-in fade-in duration-200">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
