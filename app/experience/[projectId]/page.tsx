'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import {
  Box,
  ScanLine,
  Headset,
  Compass,
  Cpu,
  Tv,
  Globe,
  Sparkles,
  Play,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

interface ServiceConfig {
  id: string;
  name: string;
  slug: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  description: string;
  viewerComponent: string;
}

const SERVICES: ServiceConfig[] = [
  {
    id: 'webxr',
    name: 'WebXR',
    slug: 'webxr',
    icon: Box,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    description: 'Immersive WebXR experiences in your browser',
    viewerComponent: 'XRViewer',
  },
  {
    id: 'webar',
    name: 'WebAR',
    slug: 'webar',
    icon: ScanLine,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    description: 'Browser-based augmented reality experiences',
    viewerComponent: 'ARViewer',
  },
  {
    id: 'virtual-reality',
    name: 'Virtual Reality',
    slug: 'virtual-reality',
    icon: Headset,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    description: 'Full VR experience with headset support',
    viewerComponent: 'VRViewer',
  },
  {
    id: 'virtual-tour',
    name: 'Virtual Tour',
    slug: 'virtual-tour',
    icon: Compass,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    description: '360° interactive panoramic tours',
    viewerComponent: 'TourViewer',
  },
  {
    id: 'gaussian-splat',
    name: 'Gaussian Splat',
    slug: 'gaussian-splat',
    icon: Cpu,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    description: '3D Gaussian Splatting viewer',
    viewerComponent: 'SplatViewer',
  },
  {
    id: 'pixel-streaming',
    name: 'Pixel Streaming',
    slug: 'pixel-streaming',
    icon: Tv,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    description: 'Unreal Engine pixel streaming at 60fps',
    viewerComponent: 'PixelStreamingPlayer',
  },
];

const STUDIO_SERVICES: ServiceConfig[] = [
  {
    id: 'exterior',
    name: 'Still Renders',
    slug: 'exterior',
    icon: Globe,
    color: 'text-[#3ECF8E]',
    bgColor: 'bg-[#3ECF8E]/10',
    description: 'Exterior architectural renders and imagery',
    viewerComponent: 'ImageViewer',
  },
  {
    id: 'interior',
    name: 'Interior',
    slug: 'interior',
    icon: Sparkles,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    description: 'Interior renders and walkthroughs',
    viewerComponent: 'ImageViewer',
  },
  {
    id: 'animation-walkthrough',
    name: 'Animation',
    slug: 'animation-walkthrough',
    icon: Play,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    description: '3D animation and walkthrough videos',
    viewerComponent: 'VideoViewer',
  },
];

export default function ExperiencePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string || 'proj_smart_luxury_villa';
  const { openPixelStream, openPanorama, openModelViewer } = useAppStore();

  const [activeService, setActiveService] = useState<string>('webxr');
  const [loading, setLoading] = useState(false);
  const [isStudio, setIsStudio] = useState(false);

  const allServices = isStudio ? STUDIO_SERVICES : SERVICES;
  const activeConfig = allServices.find((s) => s.id === activeService);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const serviceId = hash.slice(1);
      if (allServices.find((s) => s.id === serviceId)) {
        setActiveService(serviceId);
      }
    }
  }, [allServices]);

  const handleServiceSwitch = useCallback(
    (serviceId: string) => {
      setLoading(true);
      setActiveService(serviceId);
      window.location.hash = serviceId;
      setTimeout(() => setLoading(false), 300);
    },
    []
  );

  const renderViewer = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-12 h-12 text-[#3ECF8E] animate-spin" />
        </div>
      );
    }

    switch (activeService) {
      case 'webxr':
        return (
          <div className="h-96 flex items-center justify-center bg-black/20 rounded-xl border border-white/10">
            <Box className="w-16 h-16 text-amber-400" />
            <div className="ml-4">
              <h3 className="text-xl font-bold">WebXR Experience</h3>
              <p className="text-sm text-gray-400">Loading PlayCanvas renderer...</p>
            </div>
          </div>
        );
      case 'webar':
        return (
          <div className="h-96 flex items-center justify-center bg-black/20 rounded-xl border border-white/10">
            <ScanLine className="w-16 h-16 text-cyan-400" />
            <div className="ml-4">
              <h3 className="text-xl font-bold">WebAR Experience</h3>
              <p className="text-sm text-gray-400">Loading AR session...</p>
            </div>
          </div>
        );
      case 'virtual-reality':
        return (
          <div className="h-96 flex items-center justify-center bg-black/20 rounded-xl border border-white/10">
            <Headset className="w-16 h-16 text-violet-400" />
            <div className="ml-4">
              <h3 className="text-xl font-bold">Virtual Reality</h3>
              <p className="text-sm text-gray-400">Connecting to VR headset...</p>
            </div>
          </div>
        );
      case 'virtual-tour':
        return (
          <div className="h-96 flex items-center justify-center bg-black/20 rounded-xl border border-white/10">
            <Compass className="w-16 h-16 text-sky-400" />
            <div className="ml-4">
              <h3 className="text-xl font-bold">Virtual Tour</h3>
              <p className="text-sm text-gray-400">Loading Marzipano tour...</p>
            </div>
          </div>
        );
      case 'gaussian-splat':
        return (
          <div className="h-96 flex items-center justify-center bg-black/20 rounded-xl border border-white/10">
            <Cpu className="w-16 h-16 text-emerald-400" />
            <div className="ml-4">
              <h3 className="text-xl font-bold">Gaussian Splat</h3>
              <p className="text-sm text-gray-400">Loading Splat viewer...</p>
            </div>
          </div>
        );
      case 'pixel-streaming':
        return (
          <div className="h-96 flex items-center justify-center bg-black/20 rounded-xl border border-white/10">
            <Tv className="w-16 h-16 text-rose-400" />
            <div className="ml-4">
              <h3 className="text-xl font-bold">Pixel Streaming</h3>
              <p className="text-sm text-gray-400">Connecting to GPU stream...</p>
            </div>
          </div>
        );
      case 'exterior':
      case 'interior':
        return (
          <div className="h-96 flex items-center justify-center bg-black/20 rounded-xl border border-white/10">
            <Globe className="w-16 h-16 text-[#3ECF8E]" />
            <div className="ml-4">
              <h3 className="text-xl font-bold">Still Renders</h3>
              <p className="text-sm text-gray-400">Loading architectural renders...</p>
            </div>
          </div>
        );
      case 'animation-walkthrough':
        return (
          <div className="h-96 flex items-center justify-center bg-black/20 rounded-xl border border-white/10">
            <Play className="w-16 h-16 text-pink-400" />
            <div className="ml-4">
              <h3 className="text-xl font-bold">Animation Walkthrough</h3>
              <p className="text-sm text-gray-400">Loading video player...</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="h-96 flex items-center justify-center bg-black/20 rounded-xl border border-white/10">
            <Sparkles className="w-16 h-16 text-white/40" />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0A0A0B]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-xl font-bold">Experience Viewer</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsStudio(!isStudio)}
              className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 transition"
            >
              {isStudio ? 'XR World' : 'Studio'}
            </button>
          </div>
        </div>
      </header>

      {/* Service Selector */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-3 mb-6">
          {allServices.map((service) => {
            const Icon = service.icon;
            const isActive = activeService === service.id;
            return (
              <button
                key={service.id}
                onClick={() => handleServiceSwitch(service.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                  isActive
                    ? `${service.bgColor} ${service.color} border-current`
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{service.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Service Info */}
        {activeConfig && (
          <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">{activeConfig.name}</h2>
                <p className="text-sm text-gray-400">{activeConfig.description}</p>
              </div>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${activeConfig.bgColor} ${activeConfig.color}`}>
                Active
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Viewer Area */}
      <main className="max-w-7xl mx-auto px-4 pb-12">
        {renderViewer()}
      </main>
    </div>
  );
}
