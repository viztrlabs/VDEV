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
      {/* HERO SECTION */}
      <section className="relative py-28 px-6 bg-[#09090B] text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/30 via-[#09090B] to-[#09090B]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))_from-purple-500/10_via-transparent_to-transparent]" />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <span className="px-3.5 py-1 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-400 text-xs font-bold uppercase tracking-widest inline-block flex items-center gap-1.5">
            <Box className="w-3 h-3" />
            <span>Marzipano Virtual Tours</span>
          </span>

          <h1 className="text-4xl md:text-6xl font-bold font-display text-white">
            Immersive  360o Tours with <span className="text-purple-400">Marzipano</span>
          </h1>

          <p className="text-lg text-[#A1A1AA] max-w-2xl mx-auto">
            Explore real-world spaces with interactive 360o panoramas. Navigate through rooms, discover hotspots, and experience architecture in complete immersion.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => handleRoomSelect('room-grand-salon')}
              className="px-6 py-3 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-5 h-5" /> Start Tour
            </button>
            <Link
              href="#how-it-works"
              className="px-6 py-3 rounded-xl bg-[#27272A] hover:bg-[#3ECF8E] hover:text-black border border-[#27272A] text-sm font-mono transition-all cursor-pointer"
            >
              <ExternalLink className="w-5 h-5" /> How It Works
            </Link>
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
