'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const ImmersiveSpikeClient = dynamic(
  () => import('./ImmersiveSpikeClient').then((mod) => mod.ImmersiveSpikeClient),
  { ssr: false }
);

export default function ImmersiveSpikePage() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="container-ultrawide py-12 px-6">
        <header className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            IWSDK + SparkJS Compatibility Spike
          </h1>
          <p className="text-zinc-400 max-w-2xl">
            Isolated test for Meta Immersive Web SDK and SparkJS Gaussian Splat integration
            within the VizTR Next.js 15 App Router environment.
          </p>
        </header>

        <ImmersiveSpikeClient />
      </div>
    </main>
  );
}