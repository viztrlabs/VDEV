'use client';

import TourManager from '@/components/admin/TourManager';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminToursPage() {
  return (
    <div className="min-h-screen bg-[#09090B] text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-1.5 text-xs font-mono text-[#A1A1AA] hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <div className="text-sm font-mono font-bold text-[#3ECF8E]">VizTR · Tour Manager</div>
        </div>
        <TourManager />
        <p className="mt-4 text-[10px] font-mono text-[#555]">
          Multi-tour, team &amp; roles, client collaboration, guided auto-play, and publish config. Requires Supabase
          configured (schema applied) — otherwise shows &quot;no tours yet&quot;.
        </p>
      </div>
    </div>
  );
}
