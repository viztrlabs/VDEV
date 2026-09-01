"use client';

import React, { useState, useEffect, useRef } from 'react';
import { useXRHandHook } from './useXRHandHook';
import * as PC from 'playcanvas';

interface XRHandVisualizerProps {
  handId: number;
  handModelUrl?: string;
  showArOverlay?: boolean;
}

export function XRHandVisualizer({ handId, handModelUrl, showArOverlay = false }: XRHandVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [handMesh, setHandMesh] = useState<PC.Mesh | null>(null);
  const handHook = useXRHandHook({ enabled: true, handIds: [handId] });

  useEffect(() => {
    if (!containerRef.current) return;

    // Create hand mesh if not exists
    if (handMesh === null && handModelUrl) {
      // In a real implementation, this would load the hand model
      // For now, create a simple sphere representation
      const scene = (window as any).playcanvasApp?.scene;
      if (!scene) return;

      const handMesh = new PC.Mesh({
        material: new PC.Material(),
        primitive: PC.Primitive.SPHERE,
        width: 0.1,
        height: 0.1,
        length: 0.1,
        divisions: 8,
      });

      // Add to scene
      scene.root.addChild(handMesh as PC.Entity);
      setHandMesh(handMesh as PC.Mesh);
    }
  }, [handModelUrl, handMesh]);

  useEffect(() => {
    if (!handMesh) return;

    const updateHandMesh = () => {
      const pose = handHook.getHandPose(handId);
      if (!pose || pose.length === 0) return;

      // Update mesh position and rotation based on hand pose
      const palm = pose.find(p => p.finger === 'palm');
      if (palm) {
        const entity = handMesh as PC.Entity;
        entity.setPosition(palm.position.x, palm.position.y, palm.position.z);
        
        // Calculate rotation from palm normal
        const normal = palm.normal;
        const direction = palm.direction;
        
        // Simple rotation: look at direction vector
        entity.setEulerAngles(0, Math.atan2(direction.x, direction.z) * 180 / Math.PI, 0);
      }
    };

    const interval = setInterval(updateHandMesh, 1000 / 60);

    return () => clearInterval(interval);
  }, [handMesh, handHook]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '200px',
        height: '200px',
        position: 'relative',
        display: 'inline-block',
      }}
    >
      {showArOverlay && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '300px',
            height: '300px',
            border: '2px dashed #00ff00',
            borderRadius: '8px',
            pointerEvents: 'none',
          }}
        >
          AR Overlay
        </div>
      )}
    </div>
  );
}
