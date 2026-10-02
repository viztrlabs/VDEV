'use client';

/**
 * ShareControl — share dialog with QR code for the tour viewer.
 * qrcode is dynamically imported (the only new dependency in this plan).
 * The public page has no sonner Toaster — feedback is inline.
 */
import React, { useCallback, useRef, useState } from 'react';
import { Share2, X, Copy, Check } from 'lucide-react';

interface ShareControlProps {
  tourId: string;
  tourName?: string;
}

const BTN_CLASS =
  'p-2 rounded-lg bg-[#18181B]/70 border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-all cursor-pointer';

export function ShareControl({ tourId, tourName }: ShareControlProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrError, setQrError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/virtual-tour/${tourId}`
    : `/virtual-tour/${tourId}`;

  const handleOpen = useCallback(() => {
    setOpen(true);
    setCopied(false);
    setQrError(false);
    (async () => {
      try {
        const QRCode = await import('qrcode');
        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, shareUrl, { width: 160, margin: 1 });
        }
      } catch {
        setQrError(true);
      }
    })();
  }, [shareUrl]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  }, [shareUrl]);

  return (
    <>
      <button onClick={handleOpen} className={BTN_CLASS} title="Share" aria-label="Share tour">
        <Share2 className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60" onClick={() => setOpen(false)}>
          <div
            className="bg-[#09090B] border border-[#27272A] rounded-lg p-4 flex flex-col gap-3 min-w-[240px]"
            role="dialog"
            aria-label={`Share ${tourName || 'tour'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono text-[#3ECF8E]">Share tour</div>
              <button onClick={() => setOpen(false)} className="text-[#71717A] hover:text-white cursor-pointer" aria-label="Close share dialog">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-center">
              {qrError ? (
                <div className="text-[10px] font-mono text-amber-400">QR unavailable</div>
              ) : (
                <canvas ref={canvasRef} aria-label="Tour QR code" />
              )}
            </div>
            <div className="text-[10px] font-mono text-[#A1A1AA] break-all">{shareUrl}</div>
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-3 py-1.5 rounded bg-[#27272A] text-white text-xs font-mono hover:bg-[#3F3F46] transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#3ECF8E]" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
