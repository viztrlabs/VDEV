'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { TourBuilderShell } from '@/components/tour-builder/TourBuilderShell';

export default function TourEditorPage() {
  const params = useParams<{ projectId?: string; experienceId?: string }>();
  const projectId = params?.projectId || 'proj_smart_luxury_villa';
  const experienceId = params?.experienceId;

  return (
    <TourBuilderShell
      projectId={projectId}
      experienceId={experienceId}
    />
  );
}
