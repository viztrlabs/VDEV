'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export default function CreatorSuperSplatPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center pt-20">
      <div className="text-center max-w-2xl mx-auto px-6 space-y-6">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 w-fit mx-auto">
          <Sparkles className="w-12 h-12 text-rose-400 mx-auto" />
        </div>
        <h1 className="text-4xl font-bold font-display">SuperSplat Editor</h1>
        <p className="text-zinc-400 text-lg">
          Specialized Gaussian Splat editor. Opens in a new tab.
        </p>
        <a
          href="http://localhost:3002"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-all"
        >
          Open SuperSplat Editor
        </a>
      </div>
    </main>
  );
}
