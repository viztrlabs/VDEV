'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

interface ServiceEditorShellProps {
  userId: string;
  projectId: string;
  serviceSlug: string;
  serviceTitle: string;
  serviceIcon: string;
  children?: React.ReactNode;
}

export function ServiceEditorShell({
  userId,
  projectId,
  serviceSlug,
  serviceTitle,
  serviceIcon,
  children,
}: ServiceEditorShellProps) {
  if (!userId || !projectId || !serviceSlug) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#27272A]">
        <div className="flex items-center gap-3">
          <Link
            href={`/under-admin/users/${userId}/projects/${projectId}/editor-dashboard`}
            className="inline-flex items-center gap-1 text-[10px] font-mono text-[#A1A1AA] hover:text-white"
          >
            <ChevronLeft className="w-3 h-3" />
            Back
          </Link>
          <div>
            <h1 className="text-sm font-mono font-bold text-white">
              <span className="mr-2">{serviceIcon}</span>
              {serviceTitle} Editor
            </h1>
            <p className="text-[10px] font-mono text-[#71717A]">
              {userId} / {projectId} / {serviceSlug}
            </p>
          </div>
        </div>
        <span className="px-2 py-1 rounded bg-amber-500/15 text-amber-400 text-[10px] font-mono">Phase 2 shell</span>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-xs font-mono text-[#71717A]">
        {children || 'This service editor shell is reserved for Phase 2 implementation. The canonical routing is now in place.'}
      </div>
    </div>
  );
}
