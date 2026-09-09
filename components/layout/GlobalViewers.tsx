'use client';

import dynamic from 'next/dynamic';

// Lazy-loaded viewers & overlays — keeps initial JS bundle lean
const GalleryViewer = dynamic(() => import('@/components/viewers/GalleryViewer'), { ssr: false });
const PanoramaViewer = dynamic(() => import('@/components/viewers/PanoramaViewer'), { ssr: false });
const ModelViewer = dynamic(() => import('@/components/viewers/ModelViewer'), { ssr: false });
const PixelStreamingTerminal = dynamic(() => import('@/components/viewers/PixelStreamingTerminal'), { ssr: false });
const ToastNotification = dynamic(() => import('@/components/ui/ToastNotification'), { ssr: false });
const PerformanceMonitor = dynamic(
  () => import('@/components/analytics/performance-monitor').then((mod) => ({ default: mod.PerformanceMonitor })),
  { ssr: false }
);

/**
 * Client-side wrapper that lazy-loads all global viewers and overlays.
 * Extracted from layout.tsx because `ssr: false` requires a Client Component.
 */
export default function GlobalViewers() {
  return (
    <>
      <GalleryViewer />
      <PanoramaViewer />
      <ModelViewer />
      <PixelStreamingTerminal />
      <ToastNotification />
      <PerformanceMonitor />
    </>
  );
}
