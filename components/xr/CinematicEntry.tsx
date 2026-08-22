'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Compass } from 'lucide-react';
import { useXRStore } from './xr.store';

interface CinematicEntryProps {
  title: string;
  subtitle?: string;
  onComplete: () => void;
}

export default function CinematicEntry({ title, subtitle, onComplete }: CinematicEntryProps) {
  const [stage, setStage] = useState<'black' | 'text' | 'fadeout' | 'done'>('text');
  const { completeEntry } = useXRStore();

  useEffect(() => {
    const t1 = setTimeout(() => setStage('fadeout'), 1200);
    const t2 = setTimeout(() => {
      setStage('done');
      completeEntry();
      onComplete();
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [completeEntry, onComplete]);

  if (stage === 'done') return null;

  return (
    <div
      className={`absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 text-center transition-opacity duration-700 pointer-events-none ${
        stage === 'fadeout' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="space-y-3 max-w-md animate-in fade-in zoom-in-90 duration-700">
        <div className="w-10 h-10 rounded-xl bg-[#18181B] border border-[#3ECF8E]/40 flex items-center justify-center mx-auto text-[#3ECF8E] shadow-2xl">
          <Compass className="w-5 h-5 animate-spin-slow" />
        </div>
        <div className="text-[10px] font-mono text-[#3ECF8E] uppercase tracking-widest font-bold">
          VizTR Spatial Engine
        </div>
        <h2 className="text-2xl font-bold font-display text-white tracking-tight">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-[#A1A1AA] font-mono">{subtitle}</p>}
      </div>
    </div>
  );
}
