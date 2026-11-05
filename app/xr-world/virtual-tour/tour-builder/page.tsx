'use client';

import React, { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { TourBuilderShell } from '@/components/tour-builder/TourBuilderShell';

function TourBuilderPageInner() {
  const params = useParams<{ projectId?: string; experienceId?: string }>();
  const search = useSearchParams();
  const projectId = params?.projectId || search.get('project') || 'proj_smart_luxury_villa';
  const experienceId = params?.experienceId || search.get('experience') || undefined;

  return (
    <TourBuilderShell
      projectId={projectId}
      experienceId={experienceId}
    />
  );
}

export default function TourBuilderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090B]" />}>
      <TourBuilderPageInner />
    </Suspense>
  );
}
