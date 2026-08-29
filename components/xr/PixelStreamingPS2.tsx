'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Cpu, Wifi, Volume2, VolumeX } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { 
  PixelStreaming as PSFrontend, 
  Config, 
  Flags, 
  TextParameters, 
  NumericParameters, 
  OptionParameters 
} from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.6';

let PS2Frontend: any = null;

async function initPixelStreamingPS2(signalingUrl: string, videoElementParent: HTMLElement) {
  try {
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
      videoElementParent,
    });

    PS2Frontend = ps;
    return ps;
  } catch (error) {
    console.error('Failed to initialize PS2:', error);
    return null;
  }
}

interface Props {
  signalingUrl?: string;
  streamId?: string;
  usePS2?: boolean;
}

export default function PixelStreamingPS2({
  signalingUrl = process.env.NEXT_PUBLIC_PS_SIGNALING_URL || 'wss://stream.viztr.io',
  streamId = 'apex-tower-ue5',
  usePS2 = true,
}: Props) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'live' | 'error'>('idle');
  const [fps, setFps] = useState(60);
  const [latency, setLatency] = useState(14);
  const [muted, setMuted] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const psRef = useRef<any>(null);
  const { showToast } = useAppStore();

  useEffect(() => {
    return () => {
      if (psRef.current) {
        psRef.current.disconnect();
      }
    };
  }, []);

  const startStream = async () => {
    setStatus('connecting');
    showToast(`Connecting to UE5.5 Pixel Streaming 2 via ${signalingUrl}...`, 'info');

    if (videoContainerRef.current) {
      const ps = await initPixelStreamingPS2(signalingUrl, videoContainerRef.current);
      if (ps) {
        psRef.current = ps;
        ps.addEventListener('videoInitialized', () => {
          setStatus('live');
          showToast('PS2 stream connected (UE5.5+ protocol)', 'success');
        });
        ps.addEventListener('playStreamError', () => setStatus('error'));
        ps.addEventListener('latencyCalculated', (e: any) => {
          if (e.data?.latencyInfo?.latencyMs) {
            setLatency(e.data.latencyInfo.latencyMs);
          }
        });
        ps.addEventListener('statsReceived', (e: any) => {
          // Extract FPS if available
        });
      } else {
        setStatus('error');
        showToast('Failed to connect PS2 stream', 'error');
      }
    }
  };

  const stopStream = () => {
    if (psRef.current) {
      psRef.current.disconnect();
      psRef.current = null;
    }
    setStatus('idle');
  };

  const retry = () => {
    if (psRef.current) {
      psRef.current.reconnect();
      setStatus('live');
    } else {
      startStream();
    }
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
      {/* Status badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm
            ${status === 'live' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : ''}
            ${status === 'connecting' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : ''}
            ${status === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : ''}
            ${status === 'idle' ? 'bg-zinc-500/20 text-zinc-300 border border-zinc-500/30' : ''}
          `}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full
              ${status === 'live' ? 'bg-emerald-400 animate-pulse' :
               status === 'connecting' ? 'bg-amber-400 animate-pulse' :
               status === 'error' ? 'bg-red-400' :
               'bg-zinc-400'}
            `}
          />
          {status === 'live' ? 'Live (PS2)' : status === 'connecting' ? 'Connecting…' : status === 'error' ? 'Error' : 'Idle'}
        </span>
      </div>

      {/* PS video container */}
      <div ref={videoContainerRef} className="w-full h-full" />

      {/* Controls overlay (bottom-right) */}
      {status !== 'idle' && status !== 'connecting' && (
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={() => setMuted(!muted)}
            className="p-2 rounded-lg bg-black/70 hover:bg-white/10 border border-white/15 text-white transition-colors cursor-pointer"
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#3ECF8E]" />}
          </button>
          <button
            onClick={stopStream}
            className="p-2 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-400 transition-colors cursor-pointer"
            title="Stop Stream"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80">
          <p className="text-white/60 text-sm">PS2 stream unavailable — server may be offline</p>
          <button
            onClick={retry}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition cursor-pointer"
          >
            Retry connection
          </button>
        </div>
      )}

      {/* Idle state - launch button */}
      {status === 'idle' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <Cpu className="w-12 h-12 text-[#3ECF8E]" />
          <button
            onClick={startStream}
            className="px-6 py-3 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-bold text-sm shadow-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black" />
            Launch PS2 Stream (UE5.5+)
          </button>
        </div>
      )}
    </div>
  );
}