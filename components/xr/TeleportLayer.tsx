'use client';

import React from 'react';
import { TeleportPointItem } from './xr.types';
import TeleportPoint from './TeleportPoint';
import { useXRStore } from './xr.store';

interface TeleportLayerProps {
  teleportPoints: TeleportPointItem[];
}

export default function TeleportLayer({ teleportPoints }: TeleportLayerProps) {
  const { setScene } = useXRStore();

  return (
    <div className="absolute inset-0 pointer-events-auto overflow-hidden">
      {teleportPoints.map((point) => (
        <TeleportPoint
          key={point.id}
          teleport={point}
          onTeleport={(targetId) => setScene(targetId)}
        />
      ))}
    </div>
  );
}
