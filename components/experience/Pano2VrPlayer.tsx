'use client';

import React from 'react';

/**
 * Pano2VrPlayer — hosts an exported Pano2VR Web Output package.
 *
 * The package is served from VizTR object storage (cross-origin to the app),
 * and the iframe is sandboxed: package scripts run but cannot touch VizTR
 * cookies, DOM, or storage. Fullscreen + XR permissions are delegated for
 * Pano2VR's WebXR (VR) output mode.
 */
export default function Pano2VrPlayer({
  entryUrl,
  title,
  className,
}: {
  entryUrl: string;
  title?: string;
  className?: string;
}) {
  if (!entryUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0A0A0B]">
        <p className="text-zinc-500 font-mono text-sm">No tour package published yet.</p>
      </div>
    );
  }
  return (
    <iframe
      src={entryUrl}
      title={title || 'Virtual Tour'}
      sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups"
      allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer"
      className={className || 'w-full h-full border-0'}
      loading="lazy"
    />
  );
}
