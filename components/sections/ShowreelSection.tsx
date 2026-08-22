'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { homepageData } from '@/data/homepage';
import { Play, Pause, Volume2, VolumeX, ArrowRight, Maximize2 } from 'lucide-react';

export default function ShowreelSection() {
  const { showreel } = homepageData;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <section
      id="showreel-section"
      className="relative w-full min-h-[65vh] flex items-center justify-center overflow-hidden bg-[#09090B] text-[#FAFAFA] border-y border-[#27272A]"
    >
      {/* BACKGROUND VIDEO / POSTER */}
      <video
        ref={videoRef}
        src={showreel.videoUrl}
        poster={showreel.poster}
        playsInline
        loop
        muted={isMuted}
        className="absolute inset-0 w-full h-full object-cover opacity-40 transition-opacity duration-700"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/60 to-[#09090B]/80 pointer-events-none" />

      {/* Centered Controls & Title */}
      <div className="relative z-10 text-center max-w-2xl mx-auto px-4 sm:px-6 py-14 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#18181B] border border-[#27272A] text-[10px] font-mono text-[#3ECF8E] font-bold uppercase tracking-widest mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E] animate-pulse" />
          <span>CINEMATIC REEL 2026 // 4K 60FPS</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#FAFAFA] mb-2 font-sans">
          {showreel.title}
        </h2>
        <p className="text-xs sm:text-sm text-[#A1A1AA] mb-6 max-w-lg">
          {showreel.subtitle}
        </p>

        {/* Play/Pause Button */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={togglePlay}
            id="showreel-play-btn"
            className="w-14 h-14 rounded bg-[#3ECF8E] hover:bg-[#34b27b] text-black shadow-lg shadow-[#3ECF8E]/20 flex items-center justify-center transition-all cursor-pointer"
            aria-label={isPlaying ? 'Pause Video' : 'Play Showreel'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-black" />
            ) : (
              <Play className="w-6 h-6 fill-black ml-0.5" />
            )}
          </button>
          
          <button
            onClick={toggleMute}
            className="p-3 rounded bg-[#18181B] hover:bg-[#27272A] text-[#FAFAFA] border border-[#27272A] transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#3ECF8E]" /> : <Volume2 className="w-4 h-4 text-[#FAFAFA]" />}
          </button>
        </div>

        {/* View Portfolio Link */}
        <Link
          href={showreel.ctaHref}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#3ECF8E] hover:underline uppercase tracking-wider"
        >
          <span>{showreel.ctaText} →</span>
        </Link>
      </div>
    </section>
  );
}
