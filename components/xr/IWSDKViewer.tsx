'use client';

import React, { useEffect, useRef, useState } from 'react';
import { engineBridge } from '@/lib/3d/bridge/engine-bridge';
import { IWSDKEngineAdapter } from '@/lib/3d/bridge/adapters/IWSDKEngineAdapter';
import { EngineInitOptions } from '@/lib/3d/bridge/types';

function IWSDKLoading() {
  return (
    <div className="flex items-center justify-center h-full bg-[#0A0A0B]">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-[#3ECF8E] border-t-transparent rounded-full animate-spin mb-3 mx-auto" />
        <p className="text-zinc-500 font-mono text-xs">Initializing IWSDK…</p>
      </div>
    </div>
  );
}

interface IWSDKViewerProps {
  experienceId: string;
  config: Record<string, any>;
  containerRef?: React.RefObject<HTMLDivElement>;
}

export function IWSDKViewer({ experienceId, config, containerRef }: IWSDKViewerProps) {
  const [adapter, setAdapter] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRefInternal = useRef<HTMLDivElement | null>(null);
  const mergedRef = (el: HTMLDivElement | null) => {
    containerRefInternal.current = el;
    if (containerRef) containerRef.current = el;
  };

  useEffect(() => {
    let mounted = true;
    let adapterInstance: any = null;

    const init = async () => {
      try {
        const { IWSDKEngineAdapter } = await import('@/lib/3d/bridge/adapters/IWSDKEngineAdapter');
        const adapterInstance = new IWSDKEngineAdapter();

        const container = containerRefInternal.current;
        if (!container) throw new Error('Container not available');

        const width = container.clientWidth || 800;
        const height = container.clientHeight || 600;

        await adapterInstance.init({
          container,
          antialias: true,
          pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
          backgroundColor: '#09090b',
        });

        if (!mounted) {
          await adapterInstance.destroy();
          return;
        }

        // Attach to EngineBridge so other systems can access it
        const { engineBridge } = await import('@/lib/3d/bridge/engine-bridge');
        engineBridge.attachAdapter(adapterInstance);

        setAdapter(adapterInstance);
        setInitialized(true);
      } catch (e: any) {
        console.error('[IWSDKViewer] Initialization failed:', e);
        setError(e.message);
      }
    };

    init();

    return () => {
      mounted = false;
      // Cleanup: detach from bridge and destroy adapter
      if (adapterInstance) {
        const { engineBridge } = require('@/lib/3d/bridge/engine-bridge');
        if (engineBridge.getActiveAdapter() === adapterInstance) {
          engineBridge.detachAdapter();
        }
        adapterInstance.destroy();
      }
    };
  }, []);

  if (!initialized) {
    return <IWSDKLoading />;
  }

  return <div ref={containerRefInternal} className="w-full h-full" />;
}

function IWSDKLoading() {
  return (
    <div className="flex items-center justify-center h-full bg-[#0A0A0B]">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-[#3ECF8E] border-t-transparent rounded-full animate-spin mb-3 mx-auto" />
        <p className="text-zinc-500 font-mono text-xs">Initializing IWSDK…</p>
      </div>
    </div>
  );
}