'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Compass,
  Play,
  Pause,
  Download
} from 'lucide-react';

export default function GalleryViewer() {
  const {
    lightboxOpen,
    lightboxItems,
    lightboxIndex,
    closeLightbox,
    setLightboxIndex,
    openPanorama
  } = useAppStore();

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleNext = useCallback(() => {
    if (lightboxItems.length === 0) return;
    setLightboxIndex((lightboxIndex + 1) % lightboxItems.length);
  }, [lightboxItems.length, lightboxIndex, setLightboxIndex]);

  const handlePrev = useCallback(() => {
    if (lightboxItems.length === 0) return;
    setLightboxIndex((lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length);
  }, [lightboxItems.length, lightboxIndex, setLightboxIndex]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const resetTransform = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const [prevTrackKey, setPrevTrackKey] = useState(`${lightboxIndex}-${lightboxOpen}`);
  const currentKey = `${lightboxIndex}-${lightboxOpen}`;
  if (prevTrackKey !== currentKey) {
    setPrevTrackKey(currentKey);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, closeLightbox, handleNext, handlePrev]);

  if (!lightboxOpen || lightboxItems.length === 0) return null;

  const currentItem = lightboxItems[lightboxIndex] || lightboxItems[0];

  // Drag-to-pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      id="immersive-gallery-viewer"
      className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-xl flex flex-col justify-between select-none text-white animate-in fade-in duration-200"
      onMouseUp={handleMouseUp}
    >
      {/* TOP BAR CONTROLS */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#09090B] border-b border-[#27272A] z-10">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-semibold tracking-wide text-[#FAFAFA]">
            {currentItem.title}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#18181B] border border-[#27272A] text-[#3ECF8E] font-mono">
            {lightboxIndex + 1} / {lightboxItems.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {currentItem.type === '360' && (
            <button
              onClick={() => {
                closeLightbox();
                openPanorama(currentItem.url, currentItem.title);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#3ECF8E] hover:bg-[#34b27b] text-black text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Launch 360 Tour</span>
            </button>
          )}

          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#FAFAFA] transition-colors cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#FAFAFA] transition-colors cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetTransform}
            className="p-1.5 rounded bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#FAFAFA] transition-colors cursor-pointer"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#FAFAFA] transition-colors cursor-pointer"
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={closeLightbox}
            className="p-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white transition-colors ml-1 cursor-pointer"
            title="Close Viewer (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MAIN VIEWPORT */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing px-4"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        {/* Previous Button */}
        {lightboxItems.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-6 z-20 p-3 rounded-full bg-black/60 hover:bg-rose-600 text-white backdrop-blur-md transition-all shadow-lg hover:scale-110"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Media Element */}
        <div
          className="transition-transform duration-100 ease-out max-w-full max-h-[75vh] flex items-center justify-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {currentItem.type === 'video' ? (
            <div className="relative group max-w-5xl rounded-xl overflow-hidden shadow-2xl">
              <video
                ref={videoRef}
                src={currentItem.url}
                autoPlay
                loop
                muted
                playsInline
                className="max-h-[70vh] rounded-xl object-contain"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (videoRef.current) {
                    if (videoRef.current.paused) {
                      videoRef.current.play();
                      setIsVideoPlaying(true);
                    } else {
                      videoRef.current.pause();
                      setIsVideoPlaying(false);
                    }
                  }
                }}
                className="absolute bottom-4 left-4 p-2.5 rounded-lg bg-black/70 hover:bg-rose-600 text-white backdrop-blur-sm transition-colors"
              >
                {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <div className="relative max-h-[72vh] max-w-[85vw] flex items-center justify-center">
              <Image
                src={currentItem.url}
                alt={currentItem.title}
                width={1920}
                height={1080}
                priority
                referrerPolicy="no-referrer"
                className="max-h-[72vh] max-w-[85vw] w-auto h-auto object-contain rounded-lg shadow-2xl pointer-events-none"
                draggable={false}
              />
            </div>
          )}
        </div>

        {/* Next Button */}
        {lightboxItems.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-6 z-20 p-3 rounded-full bg-black/60 hover:bg-rose-600 text-white backdrop-blur-md transition-all shadow-lg hover:scale-110"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* BOTTOM THUMBNAILS STRIP */}
      <div className="px-6 py-4 bg-gradient-to-t from-black/90 to-transparent z-10 flex flex-col items-center">
        {currentItem.caption && (
          <p className="text-xs text-zinc-400 mb-3 text-center max-w-xl">
            {currentItem.caption}
          </p>
        )}

        {lightboxItems.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto max-w-2xl py-1 px-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
            {lightboxItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxIndex(idx)}
                className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 transition-all ${
                  lightboxIndex === idx
                    ? 'ring-2 ring-rose-500 scale-105 opacity-100'
                    : 'opacity-50 hover:opacity-80'
                }`}
              >
                <Image
                  src={item.url}
                  alt={item.title}
                  fill
                  sizes="64px"
                  referrerPolicy="no-referrer"
                  className="object-cover"
                />
                {item.type === '360' && (
                  <div className="absolute inset-0 bg-rose-900/60 flex items-center justify-center">
                    <Compass className="w-3 h-3 text-white" />
                  </div>
                )}
                {item.type === 'video' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Play className="w-3 h-3 text-white fill-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
