'use client';

import React from 'react';
import { HotspotItem, AnnotationItem } from './xr.types';
import Hotspot from './Hotspot';
import { useXRStore } from './xr.store';

interface HotspotLayerProps {
  hotspots: HotspotItem[];
  annotations: AnnotationItem[];
}

export default function HotspotLayer({ hotspots, annotations }: HotspotLayerProps) {
  const { showAnnotation, setScene } = useXRStore();

  const handleHotspotClick = (hotspot: HotspotItem) => {
    if (hotspot.action === 'open_info') {
      const match = annotations.find((a) => a.hotspotId === hotspot.id);
      if (match) {
        showAnnotation(hotspot.id);
      } else {
        showAnnotation(hotspot.id);
      }
    } else if (hotspot.action === 'teleport') {
      setScene(hotspot.target);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-auto overflow-hidden">
      {hotspots.map((hotspot) => (
        <Hotspot key={hotspot.id} hotspot={hotspot} onClick={handleHotspotClick} />
      ))}
    </div>
  );
}
