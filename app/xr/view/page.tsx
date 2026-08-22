'use client';

import React, { use, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import XRViewer from '@/components/xr/XRViewer';
import Link from 'next/link';
import { ArrowLeft, Box, ExternalLink } from 'lucide-react';

function XRViewerBridgeContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project') || 'apex-tower';

  return (
    <main className="min-h-screen bg-black text-[#FAFAFA] flex flex-col justify-between p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/xr-world"
          className="inline-flex items-center gap-2 text-xs font-mono text-[#A1A1AA] hover:text-[#3ECF8E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to XR World Hub</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E]">
          <Box className="w-4 h-4" />
          <span>Autonomous Spatial Bridge • Project ID: {projectId}</span>
        </div>
      </div>

      <div className="flex-1 w-full flex items-center justify-center">
        <XRViewer projectId={projectId} className="h-[75vh]" />
      </div>

      <div className="text-center text-[11px] font-mono text-[#71717A]">
        VizTR Hybrid XR Engine • 360 Photosphere, PBR WebXR & Room Teleport Bridge
      </div>
    </main>
  );
}

export default function XRViewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-xs font-mono text-[#3ECF8E]">Loading Spatial Scene Bridge...</div>}>
      <XRViewerBridgeContent />
    </Suspense>
  );
}
