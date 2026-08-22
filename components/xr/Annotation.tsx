'use client';

import React from 'react';
import { AnnotationItem } from './xr.types';
import { X, Sparkles, Box } from 'lucide-react';

interface AnnotationProps {
  annotation: AnnotationItem;
  onClose: () => void;
}

export default function Annotation({ annotation, onClose }: AnnotationProps) {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 max-w-sm w-full p-5 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/20 text-[#FAFAFA] shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E]">
          <Box className="w-3.5 h-3.5" />
          <span className="font-bold uppercase tracking-wider">{annotation.title}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-[#E4E4E7] leading-relaxed font-sans">
        {annotation.text}
      </p>

      <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A] pt-1">
        <span>VizTR Interactive Spatial Node</span>
        <button
          onClick={onClose}
          className="text-[#3ECF8E] hover:underline cursor-pointer"
        >
          Dismiss [ESC]
        </button>
      </div>
    </div>
  );
}
