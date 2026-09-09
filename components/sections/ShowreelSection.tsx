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
      className="relative w-full min-h-[65vh] flex items-center justify-center overflow-hidden bg-[#0A0A0B] text-[#FAFAFA] border-y border-[#1E293B]"
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
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/60 to-[#0A0A0B]/80 pointer-events-none" />

      {/* Centered Controls & Title */}
      <div className="relative z-10 text-center max-w-2xl mx-auto px-4 sm:px-6 py-14 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#131314] border border-[#1E293B] text-[10px] font-mono text-[#42CF8B] font-bold uppercase tracking-widest mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#42CF8B] animate-pulse shadow-[0_0_8px_#42CF8B]" />
          <span>CINEMATIC REEL 2026 // 4K 60FPS</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#FAFAFA] mb-2 font-display">
          {showreel.title}
        </h2>
        <p className="text-xs sm:text-sm text-[#B9CACB] mb-6 max-w-lg">
          {showreel.subtitle}
        </p>

        {/* Play/Pause Button - Maximum pill roundedness */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={togglePlay}
            id="showreel-play-btn"
            className="w-16 h-16 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black shadow-[0_0_28px_rgba(0,240,255,0.45)] flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
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
            className="p-3 rounded-full bg-[#131314] hover:bg-[#1E293B] text-[#FAFAFA] border border-[#1E293B] transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#00F0FF]" /> : <Volume2 className="w-4 h-4 text-[#FAFAFA]" />}
          </button>
        </div>

        {/* View Portfolio Link */}
        <Link
          href={showreel.ctaHref}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#00F0FF] hover:underline uppercase tracking-wider"
        >
          <span>{showreel.ctaText} →</span>
        </Link>
      </div>
    </section>
  );
}
