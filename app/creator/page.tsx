'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Sparkles, ArrowRight } from 'lucide-react';

export default function CreatorHub() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold font-display mb-6">Creator Hub</h1>
          <p className="text-xl text-zinc-300 mb-8">
            Your complete workspace for 3D visualization, XR creation, and collaborative project management.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Link
              href="/editor-projects"
              className="group p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-emerald-500/50 transition-all"
            >
              <Sparkles className="w-8 h-8 text-emerald-400 mb-3" />
              <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400">Open 3D Editor</h3>
              <p className="text-sm text-zinc-400">Create and edit 3D scenes with full WebGL support</p>
            </Link>
            <Link
              href="/xr-world/supersplat"
              className="group p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-rose-500/50 transition-all"
            >
              <Sparkles className="w-8 h-8 text-rose-400 mb-3" />
              <h3 className="text-xl font-bold mb-2 group-hover:text-rose-400">SuperSplat Editor</h3>
              <p className="text-sm text-zinc-400">Gaussian splatting capture and editing</p>
            </Link>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center">
            <p className="text-zinc-400">Full Creator Hub is being built.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
