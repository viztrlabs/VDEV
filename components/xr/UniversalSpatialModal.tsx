'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { DetectedSpatialFormat, SpatialServicePresetId } from './UniversalSpatialViewer';

const UniversalSpatialViewer = dynamic(() => import('./UniversalSpatialViewer'), {
  ssr: false,
});

export interface UniversalSpatialModalProps {
  open: boolean;
  onClose: () => void;
  fileUrl?: string;
  title?: string;
  initialService?: SpatialServicePresetId;
  initialFormat?: DetectedSpatialFormat;
}

export default function UniversalSpatialModal({
  open,
  onClose,
  fileUrl,
  title,
  initialService,
  initialFormat,
}: UniversalSpatialModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md p-2 sm:p-4 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Universal Spatial Viewer'}
    >
      <div className="w-full h-full max-w-[1600px] max-h-[94vh]">
        <UniversalSpatialViewer
          fileUrl={fileUrl}
          title={title}
          initialService={initialService}
          initialFormat={initialFormat}
          onClose={onClose}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
