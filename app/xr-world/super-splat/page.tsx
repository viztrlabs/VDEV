'use client';

import React, { useEffect } from 'react';

export default function SuperSplatEditorPage() {
  useEffect(() => {
    window.location.replace('/supersplat/index.html');
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-rose-500/50 border-t-rose-500 rounded-full animate-spin mx-auto" />
        <p className="text-lg font-mono text-white">Opening SuperSplat Editor…</p>
        <p className="text-sm text-zinc-400">Loading Gaussian Splat workspace</p>
      </div>
    </div>
  );
}