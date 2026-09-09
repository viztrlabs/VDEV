'use client';

import React, { useEffect } from 'react';
import { Box } from 'lucide-react';

export default function Creator3DEditorPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center pt-20">
      <div className="text-center max-w-2xl mx-auto px-6 space-y-6">
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 w-fit mx-auto">
          <Box className="w-12 h-12 text-cyan-400 mx-auto" />
        </div>
        <h1 className="text-4xl font-bold font-display">3D Editor</h1>
        <p className="text-zinc-400 text-lg">
          Edit GLB, GLTF, FBX, OBJ, and USDZ models with full material, lighting, and camera controls.
        </p>
        <p className="text-zinc-500 text-sm">
          Redirecting to Editor Engine (port 3487)...
        </p>
      </div>
    </main>
  );
}
