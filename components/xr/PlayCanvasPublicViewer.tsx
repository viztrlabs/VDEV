'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSharedExperience } from './SharedExperienceContext';

interface PlayCanvasPublicProps {
  scene: { entities?: Record<string, unknown>; settings?: Record<string, unknown> };
  camera: { position: [number, number, number]; target: [number, number, number]; fov: number };
}

export function PlayCanvasPublicViewer({ scene, camera }: PlayCanvasPublicProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setOrientation } = useSharedExperience();
  const prevYawRef = useRef<number>(0);
  const prevPitchRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    const init = async () => {
      try {
        const pcUrl = 'https://cdn.playcanvas.com/engine/v181/playcanvas.min.js';
        const existingScript = document.querySelector(`script[src="${pcUrl}"]`);
        if (!existingScript) {
          const script = document.createElement('script');
          script.src = pcUrl;
          script.async = true;
          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load PlayCanvas'));
            document.head.appendChild(script);
          });
        }
        // Wait for PlayCanvas engine to be available
        if (!(window as any).pc) {
          await new Promise<void>((resolve, reject) => {
            const startTime = Date.now();
            const check = () => {
              if ((window as any).pc) {
                resolve();
              } else if (Date.now() - startTime > 5000) {
                reject(new Error('PlayCanvas engine failed to load'));
              } else {
                setTimeout(check, 50);
              }
            };
            check();
          });
        }

        if (cancelled) return;

        const pc = (window as any).pc;
        if (!pc) throw new Error('PlayCanvas not available');

        const app = new pc.Application(containerRef.current!, {
          mouse: new pc.Mouse(document.body),
          touch: new pc.TouchDevice(document.body),
          keyboard: new pc.Keyboard(document.body),
        });

        appRef.current = app;

        app.setCanvasResolution(pc.Resolution.AUTO);
        app.setCanvasFillMode(pc.FillMode.FIT);

        const cameraEntity = new pc.Entity('camera');
        cameraEntity.addComponent('camera', {
          clearColor: new pc.Color(0.05, 0.05, 0.06),
          fov: camera.fov,
          nearClip: 0.1,
          farClip: 1000,
        });
        cameraEntity.setPosition(...camera.position);
        cameraEntity.lookAt(...camera.target);
        app.root.addChild(cameraEntity);

        const light = new pc.Entity('light');
        light.addComponent('light', {
          type: pc.LIGHTTYPE_DIRECTIONAL,
          color: new pc.Color(1, 1, 1),
          intensity: 1,
        });
        light.setEulerAngles(45, -45, 0);
        app.root.addChild(light);

        // Add entities from scene data
        if (scene.entities) {
          Object.values(scene.entities).forEach((entityData: any) => {
            if (!entityData || entityData.type === 'camera') return;
            const entity = new pc.Entity(entityData.name || 'Entity');
            switch (entityData.type) {
              case 'mesh':
                entity.addComponent('model', { type: 'box' });
                if (entityData.materialId) {
                  // Material loading not implemented in this simplified viewer
                }
                break;
              case 'light':
                entity.addComponent('light', {
                  type: 'directional',
                  color: new pc.Color(1, 1, 1),
                  intensity: 1,
                });
                break;
              default:
                // generic entity
                break;
            }
            if (entityData.position) {
              entity.setLocalPosition(
                entityData.position.x || 0,
                entityData.position.y || 0,
                entityData.position.z || 0
              );
            }
            if (entityData.rotation) {
              entity.setLocalEulerAngles(
                entityData.rotation.x || 0,
                entityData.rotation.y || 0,
                entityData.rotation.z || 0
              );
            }
            if (entityData.scale) {
              entity.setLocalScale(
                entityData.scale.x || 1,
                entityData.scale.y || 1,
                entityData.scale.z || 1
              );
            }
            entity.enabled = entityData.visible !== false;
            app.root.addChild(entity);
          });
        }

        app.on('update', () => {
          const rot = cameraEntity.getRotation();
          const euler = new pc.Vec3();
          rot.getEulerAngles(euler);
          const yaw = (euler.y * Math.PI) / 180;
          const pitch = (euler.x * Math.PI) / 180;
          const deltaYaw = Math.abs(yaw - prevYawRef.current);
          const deltaPitch = Math.abs(pitch - prevPitchRef.current);
          if (deltaYaw > 0.001 || deltaPitch > 0.001) {
            setOrientation(yaw, pitch);
            prevYawRef.current = yaw;
            prevPitchRef.current = pitch;
          }
        });

        app.start();
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to initialize');
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      appRef.current?.destroy?.();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="absolute inset-0 bg-[#09090B] flex items-center justify-center">
        <div className="text-sm text-red-400 font-mono">{error}</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#09090B]">
      <div ref={containerRef} className="absolute inset-0" role="region" aria-label="3D Experience" />
      {loading && (
        <div className="absolute inset-0 bg-[#09090B] flex items-center justify-center z-10">
          <div className="text-xs font-mono text-[#3ECF8E]">Loading 3D…</div>
        </div>
      )}
    </div>
  );
}
