'use client';

import React, { useEffect } from 'react';

export default function XREditorPage() {
  useEffect(() => {
    // Redirect to local Editor Engine running on port 3487
    window.location.href = 'http://localhost:3487/editor/scene/1';
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-500/50 border-t-cyan-500 rounded-full animate-spin mx-auto" />
        <p className="text-lg font-mono text-white">Redirecting to XR Editor...</p>
        <p className="text-sm text-zinc-400">http://localhost:3487/editor/scene/1</p>
      </div>
    </div>
  );
}