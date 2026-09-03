'use client';

/**
 * /virtual-tour/[tourId]/editor — Configurator/editor page.
 * Redirects from legacy /xr-world/virtual-tour/editor
 */
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const VirtualTourEditor = dynamic(
  () => import('@/app/xr-world/virtual-tour/editor/page'),
  { ssr: false, loading: () => <div className="min-h-screen bg-[#09090B] flex items-center justify-center"><div className="text-xs font-mono text-[#3ECF8E]">Loading editor…</div></div> }
);

export default function VirtualTourEditorPage() {
  const params = useParams();
  const tourId = Array.isArray(params.tourId) ? params.tourId[0] : params.tourId;
  const router = useRouter();

  // Persist tourId in localStorage for editor to pick up
  useEffect(() => {
    if (tourId) localStorage.setItem('viztr-active-tour-id', tourId);
  }, [tourId]);

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#27272A] bg-[#09090B]/90 backdrop-blur-sm z-20 shrink-0">
        <Link
          href={`/virtual-tour/${tourId}`}
          className="flex items-center gap-1.5 text-xs font-mono text-[#A1A1AA] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Viewer</span>
        </Link>
        <div className="text-xs font-mono text-[#3ECF8E]">Tour Editor: {tourId}</div>
        <div className="w-24" /> {/* spacer for balance */}
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <VirtualTourEditor />
      </div>
    </div>
  );
}