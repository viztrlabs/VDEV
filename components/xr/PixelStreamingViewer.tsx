'use client';

import { useEffect, useRef, useState } from 'react';
import { 
  PixelStreaming as PSFrontend, 
  Config, 
  Flags, 
  TextParameters, 
  NumericParameters, 
  OptionParameters 
} from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.6';

interface Props {
  signalingUrl?: string;
  streamId?: string;
  onStatusChange?: (status: 'connecting' | 'live' | 'error') => void;
}

export default function PixelStreamingViewer({
  signalingUrl = process.env.NEXT_PUBLIC_PS_SIGNALING_URL || 'wss://stream.viztr.io',
  streamId = 'apex-tower-ue5',
  onStatusChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const psRef = useRef<PSFrontend | null>(null);
  const [status, setStatus] = useState<'connecting' | 'live' | 'error'>('connecting');
  const [latency, setLatency] = useState<number | null>(null);
  const [fps, setFps] = useState<number>(60);

  useEffect(() => {
    if (!containerRef.current) return;

    const config = new Config({
      initialSettings: {
        [TextParameters.SignallingServerUrl]: signalingUrl,
        [Flags.AutoPlayVideo]: true,
        [Flags.AutoConnect]: true,
        [NumericParameters.WebRTCFPS]: 60,
        [NumericParameters.WebRTCMaxBitrate]: 50000000,
      },
    });

    const ps = new PSFrontend(config, {
      videoElementParent: containerRef.current,
    });

    ps.addEventListener('streamLoading', () => {
      setStatus('connecting');
      onStatusChange?.('connecting');
    });

    ps.addEventListener('videoInitialized', () => {
      setStatus('live');
      onStatusChange?.('live');
    });

    ps.addEventListener('playStreamError', (e: any) => {
      setStatus('error');
      onStatusChange?.('error');
      console.error('Pixel Streaming error:', e);
    });

    ps.addEventListener('latencyCalculated', (e: any) => {
      if (e.data?.latencyInfo?.latencyMs) {
        setLatency(e.data.latencyInfo.latencyMs);
      }
    });

    ps.addEventListener('statsReceived', (e: any) => {
      // Can extract FPS from stats if needed
    });

    psRef.current = ps;

    const statsInterval = setInterval(() => {
      if (psRef.current) {
        psRef.current.requestLatencyTest();
      }
    }, 5000);

    return () => {
      clearInterval(statsInterval);
      if (psRef.current) {
        psRef.current.disconnect();
      }
    };
  }, [signalingUrl, streamId, onStatusChange]);

  const handleRetry = () => {
    if (psRef.current) {
      psRef.current.disconnect();
    }
    setStatus('connecting');
    onStatusChange?.('connecting');

    if (containerRef.current) {
      const config = new Config({
        initialSettings: {
          [TextParameters.SignallingServerUrl]: signalingUrl,
          [Flags.AutoPlayVideo]: true,
          [Flags.AutoConnect]: true,
        },
      });
      const ps = new PSFrontend(config, {
        videoElementParent: containerRef.current,
      });
      psRef.current = ps;
    }
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-[#27272A]">
      {/* Status badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm
            ${status === 'live' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : ''}
            ${status === 'connecting' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : ''}
            ${status === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : ''}
          `}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              status === 'live' ? 'bg-emerald-400 animate-pulse' :
              status === 'connecting' ? 'bg-amber-400' : 'bg-red-400'
            }`}
          />
          {status === 'live' ? 'Live' : status === 'connecting' ? 'Connecting…' : 'Unavailable'}
        </span>
      </div>

      {/* Telemetry HUD (only when live) */}
      {status === 'live' && (latency !== null || fps > 0) && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-sm border border-[#27272A] text-xs font-mono text-[#A1A1AA]">
          {latency !== null && <span>Lat: {latency}ms</span>}
          <span>•</span>
          <span>{fps} FPS</span>
        </div>
      )}

      {/* PS video container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Error state */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80">
          <p className="text-white/60 text-sm">Stream unavailable — server may be offline</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition"
          >
            Retry connection
          </button>
        </div>
      )}

      {/* Connecting overlay */}
      {status === 'connecting' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/50">
          <div className="w-8 h-8 border-2 border-[#3ECF8E]/30 border-t-[#3ECF8E] rounded-full animate-spin" />
          <p className="text-xs text-[#A1A1AA]">Connecting to cloud GPU node…</p>
        </div>
      )}
    </div>
  );
}