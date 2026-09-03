'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { ServiceEditorShell } from '@/components/editor/service-shell';

export default function GenericServiceEditorPage() {
  const params = useParams<{ userId: string; projectId: string; service: string }>();
  const userId = params?.userId;
  const projectId = params?.projectId;
  const service = params?.service;

  if (!userId || !projectId || !service) {
    notFound();
  }

  const title = service
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <ServiceEditorShell
      userId={userId}
      projectId={projectId}
      serviceSlug={service}
      serviceTitle={title}
      serviceIcon="⚙️"
    >
      This service editor shell is reserved for Phase 2 implementation. The canonical routing is now in place.
    </ServiceEditorShell>
  );
}
