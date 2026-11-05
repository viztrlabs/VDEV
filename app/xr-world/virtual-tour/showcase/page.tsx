'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import PanoramaViewer from '@/components/viewers/PanoramaViewer';
import { Sparkles, Box, ArrowRight, ChevronRight, Download, ExternalLink, Loader2, CheckCircle, Globe, Cpu, X } from 'lucide-react';

const SAMPLE_IMAGE = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2400&q=85';

export default function MarzipanoShowcasePage() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper function to get the active panorama URL
  const getActivePanoramaUrl = (selectedRoom: string | null): string => {
    if (!selectedRoom) return SAMPLE_IMAGE;
    
    const roomData = [
      { room: 'room-grand-salon', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2400&q=85' },
      { room: 'room-terrace', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2400&q=85' },
      { room: 'room-master-suite', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2400&q=85' },
      { room: 'room-kitchen', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=85' },
      { room: 'room-cinema', url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2400&q=85' }
    ];
    
    return roomData.find(r => r.room === selectedRoom)?.url || SAMPLE_IMAGE;
  };

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };

  return (
    <main className="flex-1 w-full pb-20">
      {/* 1. HERO PRESENTATION AREA (Full Landing Page Presentation Aspect Ratio) */}
      <section
        id="hero-section"
        className="relative w-full h-screen min-h-[680px] flex flex-col justify-between items-center overflow-hidden text-white select-none transition-colors duration-300 bg-[#09090B]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/30 via-[#09090B] to-[#09090B] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))_from-purple-500/10_via-transparent_to-transparent] pointer-events-none z-0" />

        {/* TOP AREA: Clears floating header & hosts Eyebrow Badge (No directory breadcrumbs) */}
        <div className="relative z-20 w-full pt-16 sm:pt-20 shrink-0 flex justify-center px-2 sm:px-4">
          <div className="hero-eyebrow inline-flex items-center gap-1.5 sm:gap-2.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[#0A0A0B] shadow-2xl transition-all border border-[#1E293B] text-[10px] sm:text-xs max-w-[95vw] sm:max-w-none">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#42CF8B] animate-pulse shrink-0" />
            <span className="font-bold text-[#42CF8B] tracking-wider uppercase shrink-0">Marzipano Virtual Tours</span>
          </div>
        </div>

        {/* BOTTOM HERO CONTENT: Fluid typography, original content & CTAs */}
        <div className="relative z-20 w-full container-ultrawide text-center flex flex-col items-center justify-end mt-auto px-4 sm:px-6 pb-6 sm:pb-8">
          <h1 className="hero-headline text-fluid-hero font-extrabold tracking-tight mb-2 sm:mb-3 font-sans">
            Immersive  360o Tours with <span className="text-purple-400">Marzipano</span>
          </h1>

          <p className="hero-desc text-fluid-desc max-w-2xl 2xl:max-w-3xl text-center prose-readable font-normal leading-relaxed mb-6 text-[#E5E2E3]">
            Explore real-world spaces with interactive 360o panoramas. Navigate through rooms, discover hotspots, and experience architecture in complete immersion.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none mb-6">
            <button
              onClick={() => handleRoomSelect('room-grand-salon')}
              id="hero-primary-cta"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4" /> <span>Start Tour</span>
            </button>
            <Link
              href="#how-it-works"
              id="hero-secondary-cta"
              className="hero-secondary-btn w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider bg-[#131314] hover:bg-[#1E293B] transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-xl hover:scale-105 active:scale-95 border border-[#1E293B]"
            >
              <ExternalLink className="w-4 h-4 text-[#42CF8B]" /> <span>How It Works</span>
            </Link>
          </div>

          {/* Bottom Bar: Scroll Indicator */}
          <div className="relative w-full flex items-center justify-center pt-2">
            <div className="sm:block">
              <a
                href="#how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById('how-it-works');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                  else window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                }}
                className="hero-scroll-btn group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0A0A0B] text-[#FAFAFA] text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer shadow-sm hover:bg-[#131314] border border-[#1E293B]"
                aria-label="Scroll down to explore"
              >
                <span>Scroll to explore</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#00F0FF] animate-bounce" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* TOUR GALLERY */}
      <section className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Grand Salon */}
          <div className="group relative rounded-xl bg-[#18181B] border border-[#27272A] overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer" onClick={() => handleRoomSelect('room-grand-salon')}>            <div className="aspect-[4/3] relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
                alt="Grand Salon"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-transparent to-transparent" />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white font-display">Grand Salon</h3>
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-sm text-[#A1A1AA] mb-4">The Solarium Sky Penthouse • Tribeca, Manhattan</p>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-purple-950/50 text-purple-400 text-xs font-mono">12 Hotspots</span>
                <ChevronRight className="w-4 h-4 text-[#71717A] group-hover:text-purple-400 transition-colors" />
              </div>
            </div>
          </div>

          {/* Terrace */}
          <div className="group relative rounded-xl bg-[#18181B] border border-[#27272A] overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer" onClick={() => handleRoomSelect('room-terrace')}>            <div className="aspect-[4/3] relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
                alt="Terrace"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-transparent to-transparent" />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white font-display">Private Terrace</h3>
                <Box className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-sm text-[#A1A1AA] mb-4">Outdoor Sky Garden • Cantilever Pool</p>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-purple-950/50 text-purple-400 text-xs font-mono">8 Hotspots</span>
                <ChevronRight className="w-4 h-4 text-[#71717A] group-hover:text-purple-400 transition-colors" />
              </div>
            </div>
          </div>

          {/* Master Suite */}
          <div className="group relative rounded-xl bg-[#18181B] border border-[#27272A] overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer" onClick={() => handleRoomSelect('room-master-suite')}>            <div className="aspect-[4/3] relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"
                alt="Master Suite"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-transparent to-transparent" />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white font-display">Master Suite & Spa</h3>
                <Globe className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-sm text-[#A1A1AA] mb-4">Nordic Monolith • Volcanic Stone Spa</p>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-purple-950/50 text-purple-400 text-xs font-mono">6 Hotspots</span>
                <ChevronRight className="w-4 h-4 text-[#71717A] group-hover:text-purple-400 transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl font-bold text-center text-white font-display mb-12">How Marzipano Tours Work</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-purple-950/50 border border-purple-800 flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-purple-400">1</span>
            </div>
            <h3 className="text-xl font-bold text-white">Select a Tour</h3>
            <p className="text-[#A1A1AA]">Choose from our collection of professionally created 360° tours.</p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-purple-950/50 border border-purple-800 flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-purple-400">2</span>
            </div>
            <h3 className="text-xl font-bold text-white">Navigate Interactively</h3>
            <p className="text-[#A1A1AA]">Click hotspots, explore rooms, and discover hidden details in each panorama.</p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-purple-950/50 border border-purple-800 flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-purple-400">3</span>
            </div>
            <h3 className="text-xl font-bold text-white">Experience VR</h3>
            <p className="text-[#A1A1AA]">Launch in VR mode for full immersion with headset support.</p>
          </div>
        </div>
      </section>

      {/* MODAL VIEWER */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
            onClick={closeModal}
          >
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-[#18181B] border border-[#27272A] text-white hover:text-purple-400 transition-colors flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full max-w-6xl h-[80vh] rounded-xl overflow-hidden bg-[#09090B] border border-[#27272A]">
                <PanoramaViewer
                  activePanoramaUrl={getActivePanoramaUrl(selectedRoom)}
                  activePanoramaTitle={selectedRoom ?? undefined}
                />
              </div>

              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-2xl font-bold font-display">
                  {[
                    { room: 'room-grand-salon', name: 'The Solarium Sky Penthouse - Grand Salon' },
                    { room: 'room-terrace', name: 'Private Panoramic Terrace & Pool' },
                    { room: 'room-master-suite', name: 'Nordic Monolith Master Suite & Spa' },
                    { room: 'room-kitchen', name: 'Minimalist Kitchen & Wine Gallery' },
                    { room: 'room-cinema', name: 'Private Screening Lounge & Cinema' }
                  ].find(r => r.room === selectedRoom)?.name || selectedRoom}
                </h3>
                <p className="text-sm text-[#A1A1AA]">Interactive 360° experience with clickable hotspots</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CALL TO ACTION */}
      <section className="mt-20 bg-gradient-to-r from-purple-950/20 to-transparent py-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-white font-display">Ready to Explore?</h2>
          <p className="text-lg text-[#A1A1AA] max-w-2xl mx-auto">
            Start your virtual tour experience now. Select a space and discover the details that matter.
          </p>
          <button
            onClick={() => handleRoomSelect('room-grand-salon')}
            className="px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-sm flex items-center gap-2 transition-all mx-auto cursor-pointer"
          >
            <Box className="w-5 h-5" /> Launch Virtual Tour
          </button>
        </div>
      </section>
    </main>
  );
}
