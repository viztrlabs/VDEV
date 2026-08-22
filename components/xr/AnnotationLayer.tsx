'use client';

import React, { useEffect } from 'react';
import { useXRStore } from './xr.store';
import Annotation from './Annotation';

export default function AnnotationLayer() {
  const { activeAnnotation, hideAnnotation } = useXRStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeAnnotation) {
        hideAnnotation();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeAnnotation, hideAnnotation]);

  if (!activeAnnotation) return null;

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]"
      onClick={hideAnnotation}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <Annotation annotation={activeAnnotation} onClose={hideAnnotation} />
      </div>
    </div>
  );
}
