'use client';

import React, { useEffect, useRef, useState } from 'react';

function IWSDKLoading() {
  return (
    <div className="flex items-center justify-center h-full bg-[#131314]">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-[#dbfcff] border-t-transparent rounded-full animate-spin mb-3 mx-auto" />
        <p className="font-mono text-xs text-zinc-500">Initializing IWSDK…</p>
      </div>
    </div>
  );
}

interface IWSDKViewerProps {
  experienceId: string;
  config: Record<string, any>;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  /**
   * Immersive mode requested by the UI. When set with a live `xrSession`, the
   * viewer starts a real immersive-ar / immersive-vr session.
   */
  mode?: 'immersive-ar' | 'immersive-vr' | null;
  /** Pre-created XRSession from a user-gesture click handler. */
  xrSession?: any;
}

export function IWSDKViewer({ experienceId, config, containerRef, mode = null, xrSession = null }: IWSDKViewerProps) {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRefInternal = useRef<HTMLDivElement | null>(null);
  // Kept in a ref so the cleanup closure always sees the live adapter instance.
  // (The previous version shadowed this variable inside `init`, so cleanup never
  // ran and WebGL/XR contexts leaked on unmount.)
  const adapterRef = useRef<any>(null);

  const mergedRef = (el: HTMLDivElement | null) => {
    containerRefInternal.current = el;
    if (containerRef) containerRef.current = el;
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { IWSDKEngineAdapter } = await import('@/lib/3d/bridge/adapters/IWSDKEngineAdapter');
        if (!mounted) return;

        const adapterInstance = new IWSDKEngineAdapter();
        adapterRef.current = adapterInstance;

        const container = containerRefInternal.current;
        if (!container) throw new Error('Container not available');

        const width = container.clientWidth || 800;
        const height = container.clientHeight || 600;

        await adapterInstance.init({
          container,
          antialias: true,
          pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
          backgroundColor: '#131314',
          xrMode: mode ?? undefined,
        });

        if (!mounted) {
          adapterInstance.destroy();
          adapterRef.current = null;
          return;
        }

        // Attach to EngineBridge so other systems can access it.
        const { engineBridge } = await import('@/lib/3d/bridge/engine-bridge');
        if (engineBridge.getActiveAdapter() === adapterInstance) {
          engineBridge.detachAdapter();
        }
        engineBridge.attachAdapter(adapterInstance);

        // Start an immersive session if one was requested from a user gesture.
        if (xrSession && mode) {
          const started = await adapterInstance.startXR(xrSession, mode);
          if (!started) {
            setError('Failed to start the AR/VR session. Your browser may have denied camera access.');
          }
        }

        if (!mounted) return;
        setInitialized(true);
      } catch (e: any) {
        console.error('[IWSDKViewer] Initialization failed:', e);
        if (mounted) setError(e?.message || 'Failed to initialize the AR/VR viewer.');
      }
    };

    init();

    return () => {
      mounted = false;
      const adapter = adapterRef.current;
      adapterRef.current = null;

      // End any active immersive session explicitly.
      try {
        const session = xrSession;
        if (session && typeof session.end === 'function') {
          session.end().catch(() => {});
        }
      } catch {
        /* no active session */
      }

      if (adapter) {
        const { engineBridge } = require('@/lib/3d/bridge/engine-bridge');
        if (engineBridge.getActiveAdapter() === adapter) {
          engineBridge.detachAdapter();
        }
        adapter.destroy();
      }
    };
    // Re-init when the experience identity or requested mode/session changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experienceId, mode, xrSession]);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#131314] p-6">
        <div className="max-w-md text-center">
          <div className="w-10 h-10 rounded-full bg-rose-500/15 border border-rose-500/40 flex items-center justify-center mx-auto mb-3">
            <span className="text-rose-300 text-lg">!</span>
          </div>
          <p className="text-sm font-mono text-rose-300 mb-2">AR/VR unavailable</p>
          <p className="text-xs text-zinc-400 leading-relaxed">{error}</p>
          <p className="text-[11px] text-zinc-500 mt-3">
            You can still explore the interactive 3D preview. For immersive AR, open this link on an
            AR-capable device (Android Chrome) or scan the QR code on iPhone.
          </p>
        </div>
      </div>
    );
  }

  if (!initialized) {
    return <IWSDKLoading />;
  }

  return <div ref={mergedRef} className="w-full h-full" />;
}