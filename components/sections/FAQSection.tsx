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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#27272A]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#3ECF8E]">
              KNOWLEDGE BASE
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FAFAFA]">
            Frequently Asked Questions
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-xs">
          Architectural CGI, WebXR formats, and project delivery specs.
        </p>
      </div>

      <div className="space-y-2">
        {faq.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-lg bg-[#18181B] border border-[#27272A] overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                aria-expanded={isOpen}
              >
                <span className="text-xs sm:text-sm font-bold text-[#FAFAFA]">
                  {item.q}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#71717A] shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#3ECF8E]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 text-xs text-[#A1A1AA] leading-relaxed border-t border-[#27272A] pt-3 animate-in fade-in duration-150">
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
