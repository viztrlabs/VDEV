'use client';

import React, { useEffect } from 'react';

export default function SuperSplatEditorPage() {
  useEffect(() => {
    // Redirect to local SuperSplat instance running on port 3002
    window.location.href = 'http://localhost:3002';
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-rose-500/50 border-t-rose-500 rounded-full animate-spin mx-auto" />
        <p className="text-lg font-mono text-white">Redirecting to local SuperSplat Editor...</p>
        <p className="text-sm text-zinc-400">http://localhost:3002</p>
      </div>
    </div>
  );
}