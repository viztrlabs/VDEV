'use client';

import React, { useState, useRef } from 'react';
import { XRScene } from './xr.types';
import Image from 'next/image';

interface SceneLayerProps {
  scene: XRScene;
}

export default function SceneLayer({ scene }: SceneLayerProps) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;
    setPan({
      x: dragStart.current.panX + deltaX * 0.1,
      y: Math.max(-20, Math.min(20, dragStart.current.panY + deltaY * 0.1)),
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div
      className="absolute inset-0 select-none overflow-hidden cursor-grab active:cursor-grabbing bg-black"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="w-full h-full relative transition-transform duration-75 ease-out scale-105"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px)`,
        }}
      >
        <Image
          src={scene.url}
          alt={scene.name}
          fill
          priority
          className="object-cover pointer-events-none"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-30" />
      </div>
    </div>
  );
}
