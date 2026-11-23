import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-16 bg-[#131314] text-[#e5e2e3]">
      <div className="max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#201f20] border border-[#353436] flex items-center justify-center mx-auto text-[#dbfcff] shadow-xl">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <h1 className="text-7xl sm:text-8xl font-bold font-display tracking-tight text-[#e5e2e3]">
            404
          </h1>
          <h2 className="text-xl font-bold text-[#e5e2e3]">
            Coordinates Not Found
          </h2>
          <p className="text-sm text-[#A1A1AA] leading-relaxed">
            The architectural scene, 3D coordinate, or XR portal you are looking for has been relocated or is currently in render cache.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded bg-[#dbfcff] hover:bg-[#34b27b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Studio Home</span>
          </Link>
          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded bg-[#201f20] hover:bg-[#353436] border border-[#353436] text-[#e5e2e3] font-mono text-xs transition-colors"
          >
            <span>Contact Studio Support</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
