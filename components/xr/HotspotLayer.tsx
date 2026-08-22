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
        showAnnotation(match);
      } else {
        showAnnotation({
          id: `ann-${hotspot.id}`,
          hotspotId: hotspot.id,
          title: hotspot.title,
          text: 'Architectural specification node: Photorealistic material reflection and lighting calibrated.',
          style: 'glass'
        });
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
