'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/lib/store';
import { useTourPreferences, useTheme, useReducedMotion } from '@/hooks/use-tour-preferences';
import { usePanoramaPreloader } from '@/hooks/use-panorama-preloader';
import { useTourNavigation } from '@/hooks/use-tour-navigation';
import { useFullscreen } from '@/hooks/use-fullscreen';
import { useMarzipanoPanorama as usePanoramaRenderer } from './usePanoramaRenderer';
import HotspotLayer from './HotspotLayer';
import ControlBar from './ControlBar';

export type HotspotType = 'metadata' | 'room_link' | 'image' | 'video' | 'info' | 'audio' | 'link';
export type HotspotCategory =
  | 'material'
  | 'furniture'
  | 'spatial'
  | 'lighting'
  | 'architecture'
  | 'acoustic'
  | 'portal'
  | 'custom';

export type HotspotColor = 'rose' | 'emerald' | 'cyan' | 'amber' | 'violet' | 'blue';

export interface HotspotSpec {
  label: string;
  value: string;
}

export interface Hotspot {
  id: string;
  xPercent: number; // 0 to 100 on equirectangular map
  yPercent: number; // 0 to 100
  title: string;
  type: HotspotType;
  category: HotspotCategory;
  description: string;
  specs?: HotspotSpec[];
  targetRoomId?: string;
  targetRoomName?: string;
  targetPanoramaUrl?: string;
  targetYaw?: number;
  icon?: string;
  color?: HotspotColor;
  pulseStyle?: 'radar' | 'glowing' | 'subtle';
  isCustom?: boolean;
  createdAt?: string;
  mediaUrl?: string;
  article?: string;
  externalUrl?: string;
  audioUrl?: string;
}

export interface TourRoom {
  id: string;
  name: string;
  subtitle: string;
  panoramaUrl: string;
  thumbnailUrl: string;
  initialYaw: number;
  initialPitch: number;
  defaultHotspots: Hotspot[];
  featured?: boolean;
  backgroundAudioUrl?: string;
  nadirLogoUrl?: string;
  brightness?: number;
  contrast?: number;
}

import { LOCAL_TOUR_ROOMS } from '@/lib/localTour';

export const TOUR_ROOMS: TourRoom[] = [
  ...LOCAL_TOUR_ROOMS,
  {
    id: 'room-grand-salon',
    name: 'The Solarium Sky Penthouse - Grand Salon',
    subtitle: 'Triplex Penthouse · Tribeca, Manhattan',
    panoramaUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2400&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
    initialYaw: 180,
    initialPitch: 0,
    defaultHotspots: [
      {
        id: 'hp-salon-1',
        xPercent: 32,
        yPercent: 48,
        title: 'Bookmatched Calacatta Gold Marble',
        type: 'metadata',
        category: 'material',
        description: 'Directly quarried Italian Calacatta gold marble with seamless continuous vein alignment, low-sheen diamond honed finish, and zero-grout expansion joints.',
        specs: [
          { label: 'Origin', value: 'Carrara, Italy' },
          { label: 'Finish', value: 'Matte Honed (15 GU)' },
          { label: 'Thickness', value: '20mm Solid Slab' }
        ],
        icon: 'palette',
        color: 'amber',
        pulseStyle: 'radar'
      },
      {
        id: 'hp-salon-2',
        xPercent: 64,
        yPercent: 54,
        title: 'Custom Blackened Steel Hearth',
        type: 'metadata',
        category: 'spatial',
        description: 'Suspended zero-clearance bioethanol fireplace with integrated architectural 2700K LED cove backlight and thermal insulated ceramic baffle.',
        specs: [
          { label: 'Material', value: 'Hot-Rolled Blackened Steel' },
          { label: 'Heat Output', value: '8.5 kW Clean Burn' },
          { label: 'Control', value: 'Smart Home DALI / Zigbee' }
        ],
        icon: 'sparkles',
        color: 'rose',
        pulseStyle: 'glowing'
      },
      {
        id: 'hp-salon-3',
        xPercent: 82,
        yPercent: 42,
        title: 'Curtain Wall Dielectric Glazing',
        type: 'metadata',
        category: 'lighting',
        description: 'Triple-glazed low-iron structural glass facade with motorized solar-responsive drop micro-shades and 99.4% UV spectral rejection.',
        specs: [
          { label: 'VLT Index', value: '0.68 Visible Transmittance' },
          { label: 'SHGC', value: '0.24 Solar Heat Gain' },
          { label: 'Acoustics', value: 'STC 44 Sound Isolation' }
        ],
        icon: 'layers',
        color: 'cyan',
        pulseStyle: 'subtle'
      },
      {
        id: 'hp-salon-portal-terrace',
        xPercent: 12,
        yPercent: 58,
        title: 'Step Out to Cantilever Pool & Terrace',
        type: 'room_link',
        category: 'portal',
        description: 'Direct threshold access to the 120 m² panoramic outdoor terrace garden and cantilevered heated infinity pool overlooking the skyline.',
        targetRoomId: 'room-terrace',
        targetRoomName: 'Private Panoramic Terrace & Pool',
        targetPanoramaUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2400&q=85',
        targetYaw: 140,
        icon: 'door',
        color: 'emerald',
        pulseStyle: 'radar'
      },
      {
        id: 'hp-salon-portal-kitchen',
        xPercent: 92,
        yPercent: 60,
        title: 'Walkway to Sommelier Kitchen & Wine Vault',
        type: 'room_link',
        category: 'portal',
        description: 'Transition into the culinary pavilion featuring monolithic basalt island, sub-zero refrigeration, and custom temperature-controlled wine gallery.',
        targetRoomId: 'room-kitchen',
        targetRoomName: 'Minimalist Kitchen & Wine Gallery',
        targetPanoramaUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=85',
        targetYaw: 90,
        icon: 'door',
        color: 'violet',
        pulseStyle: 'radar'
      },
      {
        id: 'hp-salon-portal-wine',
        xPercent: 50,
        yPercent: 70,
        title: 'Descend to Wine Vault',
        type: 'room_link',
        category: 'portal',
        description: 'Private climate-controlled wine cellar with 2,000+ bottle collection and tasting room.',
        targetRoomId: 'room-wine-cellar',
        targetRoomName: 'Climate-Controlled Wine Vault',
        targetPanoramaUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=2400&q=85',
        targetYaw: 90,
        icon: 'door',
        color: 'amber',
        pulseStyle: 'radar'
      },
      {
        id: 'hp-salon-portal-gym',
        xPercent: 75,
        yPercent: 65,
        title: 'Private Fitness Center',
        type: 'room_link',
        category: 'portal',
        description: 'Full private gym with Technogym equipment, infrared sauna, and recovery zone.',
        targetRoomId: 'room-home-gym',
        targetRoomName: 'Private Fitness & Wellness Center',
        targetPanoramaUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2400&q=85',
        targetYaw: 270,
        icon: 'door',
        color: 'emerald',
        pulseStyle: 'radar'
      },
      {
        id: 'hp-salon-portal-library',
        xPercent: 25,
        yPercent: 65,
        title: 'Two-Story Library',
        type: 'room_link',
        category: 'portal',
        description: 'Private library with 5,000+ rare volumes, mahogany shelving, and reading lounge.',
        targetRoomId: 'room-library',
        targetRoomName: 'Two-Story Private Library',
        targetPanoramaUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=2400&q=85',
        targetYaw: 0,
        icon: 'door',
        color: 'violet',
        pulseStyle: 'radar'
      },
      {
        id: 'hp-salon-portal-cinema',
        xPercent: 8,
        yPercent: 45,
        title: 'Private Home Cinema',
        type: 'room_link',
        category: 'portal',
        description: 'Dolby Atmos 4K laser projection theater with reference-grade acoustics.',
        targetRoomId: 'room-cinema',
        targetRoomName: 'Private Home Cinema',
        targetPanoramaUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=2400&q=85',
        targetYaw: 180,
        icon: 'door',
        color: 'cyan',
        pulseStyle: 'radar'
      }
    ]
  },
  {
    id: 'room-terrace',
    name: 'Private Panoramic Terrace & Pool',
    subtitle: 'Outdoor Sky Garden · Cantilever Pool',
    panoramaUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2400&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80',
    initialYaw: 140,
    initialPitch: -5,
    defaultHotspots: [
      {
        id: 'hp-terrace-1',
        xPercent: 45,
        yPercent: 52,
        title: 'Cantilevered Horizon Glass Infinity Pool',
        type: 'metadata',
        category: 'spatial',
        description: 'Hydro-massage infinity pool projecting 4 meters beyond the structural facade slab with clear structural acrylic edge overflow.',
        specs: [
          { label: 'Capacity', value: '18,500 Liters' },
          { label: 'Heating', value: 'Geothermal Heat Exchange' },
          { label: 'Edge Wall', value: '100mm Laminated Acrylic' }
        ],
        icon: 'sparkles',
        color: 'cyan',
        pulseStyle: 'radar'
      },
      {
        id: 'hp-terrace-2',
        xPercent: 78,
        yPercent: 62,
        title: 'Sustainably Harvested Teak Decking',
        type: 'metadata',
        category: 'material',
        description: 'Marine-grade Burmese teak slats with hidden screw fastenings and integrated linear flush drainage gutters.',
        specs: [
          { label: 'Wood Grade', value: 'FSC-Certified Grade A Teak' },
          { label: 'Treatment', value: 'Nano-Ceramic UV Sealant' }
        ],
        icon: 'palette',
        color: 'amber',
        pulseStyle: 'subtle'
      },
      {
        id: 'hp-terrace-portal-salon',
        xPercent: 88,
        yPercent: 50,
        title: 'Return to Grand Salon',
        type: 'room_link',
        category: 'portal',
        description: 'Return indoors through the motorized acoustic glass slide doors into the main living pavilion.',
        targetRoomId: 'room-grand-salon',
        targetRoomName: 'The Solarium Sky Penthouse - Grand Salon',
        targetPanoramaUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2400&q=85',
        targetYaw: 180,
        icon: 'door',
        color: 'rose',
        pulseStyle: 'radar'
      },
      {
        id: 'hp-terrace-portal-spa',
        xPercent: 20,
        yPercent: 54,
        title: 'Enter Nordic Master Suite & Spa',
        type: 'room_link',
        category: 'portal',
        description: 'Walkway leading to the private master wing, sauna pavilion, and panoramic freestanding volcanic stone bath.',
        targetRoomId: 'room-master-suite',
        targetRoomName: 'Nordic Monolith Master Suite & Spa',
        targetPanoramaUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2400&q=85',
        targetYaw: 210,
        icon: 'door',
        color: 'violet',
        pulseStyle: 'radar'
      }
    ]
  },
  {
    id: 'room-master-suite',
    name: 'Nordic Monolith Master Suite & Spa',
    subtitle: 'Private Master Wing · Volcanic Stone Spa',
    panoramaUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2400&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
    initialYaw: 210,
    initialPitch: 0,
    defaultHotspots: [
      {
        id: 'hp-spa-1',
        xPercent: 40,
        yPercent: 55,
        title: 'Freestanding Carved Volcanic Basalt Tub',
        type: 'metadata',
        category: 'furniture',
        description: 'Monolithic single-block basalt bathtub hand-carved in Bali with floor-mounted brushed gunmetal thermostatic filler.',
        specs: [
          { label: 'Weight', value: '820 kg Solid Stone' },
          { label: 'Finish', value: 'Satin Silk Smooth Honed' },
          { label: 'Drainage', value: 'Concealed Pop-up Overflow' }
        ],
        icon: 'box',
        color: 'emerald',
        pulseStyle: 'radar'
      },
      {
        id: 'hp-spa-2',
        xPercent: 75,
        yPercent: 42,
        title: 'Acoustic Slatted White Oak Wall',
        type: 'metadata',
        category: 'acoustic',
        description: 'Sound-dampening architectural fluted timber paneling over recycled PET acoustic felt with 0.85 NRC absorption index.',
        specs: [
          { label: 'NRC Rating', value: '0.85 Class A Sound Barrier' },
          { label: 'Wood Species', value: 'Quarter-Sawn White Oak' }
        ],
        icon: 'layers',
        color: 'amber',
        pulseStyle: 'subtle'
      },
      {
        id: 'hp-spa-portal-salon',
        xPercent: 15,
        yPercent: 50,
        title: 'Passage to Grand Salon',
        type: 'room_link',
        category: 'portal',
        description: 'Return to the central salon and entertaining areas.',
        targetRoomId: 'room-grand-salon',
        targetRoomName: 'The Solarium Sky Penthouse - Grand Salon',
        targetPanoramaUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2400&q=85',
        targetYaw: 180,
        icon: 'door',
        color: 'rose',
        pulseStyle: 'radar'
      }
    ]
  },
  {
    id: 'room-kitchen',
    name: 'Minimalist Kitchen & Wine Gallery',
    subtitle: 'Culinary Pavilion · Basalt Island',
    panoramaUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
    initialYaw: 90,
    initialPitch: 0,
    defaultHotspots: [
      {
        id: 'hp-kitchen-1',
        xPercent: 50,
        yPercent: 58,
        title: 'Monolithic Sintered Stone Island',
        type: 'metadata',
        category: 'material',
        description: 'Seamless 4.2m cantilevered chef island with invisible induction cooking zones embedded beneath 12mm sintered porcelain.',
        specs: [
          { label: 'Material', value: 'Lapitec Sintered Stone' },
          { label: 'Induction', value: 'TpB Invisible Induction 4-Zone' },
          { label: 'Stain Resistance', value: 'Class 5 Non-Porous' }
        ],
        icon: 'sparkles',
        color: 'emerald',
        pulseStyle: 'radar'
      },
      {
        id: 'hp-kitchen-portal-salon',
        xPercent: 85,
        yPercent: 50,
        title: 'Return to Grand Salon',
        type: 'room_link',
        category: 'portal',
        description: 'Connect back to the main grand salon and living quarters.',
        targetRoomId: 'room-grand-salon',
        targetRoomName: 'The Solarium Sky Penthouse - Grand Salon',
        targetPanoramaUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2400&q=85',
        targetYaw: 180,
        icon: 'door',
        color: 'rose',
        pulseStyle: 'radar'
      }
    ]
  },
  {
    id: 'room-cinema',
    name: 'Private Screening Lounge & Cinema',
    subtitle: 'Media Sanctuary · Dolby Atmos Acoustic Array',
    panoramaUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2400&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80',
    initialYaw: 180,
    initialPitch: 0,
    defaultHotspots: [
      {
        id: 'hp-cinema-1',
        xPercent: 52,
        yPercent: 46,
        title: 'Micro-Perforated 4K Projection Screen',
        type: 'metadata',
        category: 'spatial',
        description: '220-inch acoustically transparent woven cinema canvas paired with 10,000-lumen 3-chip RGB laser projector.',
        specs: [
          { label: 'Diagonal', value: '220 Inches (16:9 Scope)' },
          { label: 'Gain', value: '1.1 Unity Gain Studio' }
        ],
        icon: 'eye',
        color: 'violet',
        pulseStyle: 'radar'
      },
      {
        id: 'hp-cinema-portal-salon',
        xPercent: 12,
        yPercent: 50,
        title: 'Back to Grand Salon',
        type: 'room_link',
        category: 'portal',
        description: 'Return to the main living quarters and outdoor terraces.',
        targetRoomId: 'room-grand-salon',
        targetRoomName: 'The Solarium Sky Penthouse - Grand Salon',
        targetPanoramaUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2400&q=85',
        targetYaw: 180,
        icon: 'door',
        color: 'rose',
        pulseStyle: 'radar'
      }
    ]
  },
  {
    id: 'room-wine-cellar',
    name: 'Climate-Controlled Wine Vault',
    subtitle: 'Private Collection · 2000+ Bottles',
    panoramaUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=2400&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=400&q=80',
    initialYaw: 90,
    initialPitch: 0,
    defaultHotspots: [
      {
        id: 'hp-wine-1',
        xPercent: 40,
        yPercent: 50,
        title: 'Oak Wine Rack System',
        type: 'metadata',
        category: 'material',
        description: 'Handcrafted American white oak wine racks with individual bottle compartments, LED accent lighting, and humidity-controlled environment.',
        specs: [
          { label: 'Capacity', value: '2,000 Bottles' },
          { label: 'Temperature', value: '13°C ± 1°C' },
          { label: 'Humidity', value: '65% RH Controlled' }
        ],
        icon: 'box',
        color: 'amber',
        pulseStyle: 'subtle'
      },
      {
        id: 'hp-wine-2',
        xPercent: 70,
        yPercent: 45,
        title: 'Tasting Table & Glassware',
        type: 'metadata',
        category: 'furniture',
        description: 'Hand-forged iron and marble tasting table with Riedel Sommeliers glassware collection and decanting station.',
        specs: [
          { label: 'Material', value: 'Carrara Marble Top' },
          { label: 'Seating', value: '8 Guests' }
        ],
        icon: 'sparkles',
        color: 'violet',
        pulseStyle: 'glowing'
      },
      {
        id: 'hp-wine-portal-salon',
        xPercent: 15,
        yPercent: 55,
        title: 'Return to Grand Salon',
        type: 'room_link',
        category: 'portal',
        description: 'Ascend back to the main living pavilion.',
        targetRoomId: 'room-grand-salon',
        targetRoomName: 'The Solarium Sky Penthouse - Grand Salon',
        targetPanoramaUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2400&q=85',
        targetYaw: 180,
        icon: 'door',
        color: 'rose',
        pulseStyle: 'radar'
      }
    ]
  },
  {
    id: 'room-home-gym',
    name: 'Private Fitness & Wellness Center',
    subtitle: 'Full Gym · Sauna · Recovery',
    panoramaUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2400&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80',
    initialYaw: 270,
    initialPitch: 0,
    defaultHotspots: [
      {
        id: 'hp-gym-1',
        xPercent: 35,
        yPercent: 55,
        title: 'Technogym Equipment Suite',
        type: 'metadata',
        category: 'furniture',
        description: 'Full Technogym Artis line including treadmill, bike, elliptical, and strength training zone with integrated touchscreen consoles.',
        specs: [
          { label: 'Equipment', value: 'Technogym Artis' },
          { label: 'Flooring', value: 'Rubber Athletic Surface' }
        ],
        icon: 'zap',
        color: 'emerald',
        pulseStyle: 'glowing'
      },
      {
        id: 'hp-gym-2',
        xPercent: 65,
        yPercent: 40,
        title: 'Infrared Sauna Cabin',
        type: 'metadata',
        category: 'spatial',
        description: 'Two-person full-spectrum infrared sauna with Canadian cedar interior, chromotherapy lighting, and Bluetooth audio.',
        specs: [
          { label: 'Type', value: 'Full-Spectrum Infrared' },
          { label: 'Capacity', value: '2 Persons' }
        ],
        icon: 'flame',
        color: 'amber',
        pulseStyle: 'radar'
      },
      {
        id: 'hp-gym-portal-salon',
        xPercent: 85,
        yPercent: 50,
        title: 'Return to Grand Salon',
        type: 'room_link',
        category: 'portal',
        description: 'Return to the main living pavilion.',
        targetRoomId: 'room-grand-salon',
        targetRoomName: 'The Solarium Sky Penthouse - Grand Salon',
        targetPanoramaUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2400&q=85',
        targetYaw: 180,
        icon: 'door',
        color: 'rose',
        pulseStyle: 'radar'
      }
    ]
  },
  {
    id: 'room-library',
    name: 'Two-Story Private Library',
    subtitle: 'Rare Books · Reading Lounge · Fireplace',
    panoramaUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=2400&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=400&q=80',
    initialYaw: 0,
    initialPitch: 0,
    defaultHotspots: [
      {
        id: 'hp-lib-1',
        xPercent: 30,
        yPercent: 45,
        title: 'Floor-to-Ceiling Mahogany Shelving',
        type: 'metadata',
        category: 'material',
        description: 'Handcrafted Honduras mahogany bookcases with rolling brass library ladder, housing over 5,000 rare volumes and first editions.',
        specs: [
          { label: 'Capacity', value: '5,000+ Volumes' },
          { label: 'Wood', value: 'Honduras Mahogany' }
        ],
        icon: 'layers',
        color: 'amber',
        pulseStyle: 'subtle'
      },
      {
        id: 'hp-lib-2',
        xPercent: 60,
        yPercent: 50,
        title: 'Chesterfield Reading Lounge',
        type: 'metadata',
        category: 'furniture',
        description: 'Button-tufted British Chesterfield sofa in oxblood leather with matching ottoman and brass reading lamp.',
        specs: [
          { label: 'Material', value: 'Full-Grain Leather' },
          { label: 'Style', value: 'Victorian Chesterfield' }
        ],
        icon: 'sparkles',
        color: 'violet',
        pulseStyle: 'glowing'
      },
      {
        id: 'hp-lib-portal-salon',
        xPercent: 80,
        yPercent: 55,
        title: 'Return to Grand Salon',
        type: 'room_link',
        category: 'portal',
        description: 'Return to the main living pavilion.',
        targetRoomId: 'room-grand-salon',
        targetRoomName: 'The Solarium Sky Penthouse - Grand Salon',
        targetPanoramaUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2400&q=85',
        targetYaw: 180,
        icon: 'door',
        color: 'rose',
        pulseStyle: 'radar'
      }
    ]
  },
  {
    id: 'room-cinema',
    name: 'Private Home Cinema',
    subtitle: 'Dolby Atmos · 4K Laser Projection',
    panoramaUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=2400&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80',
    initialYaw: 180,
    initialPitch: -5,
    defaultHotspots: [
      {
        id: 'hp-cinema-1',
        xPercent: 50,
        yPercent: 35,
        title: 'Sony VPL-GTZ380 4K Laser Projector',
        type: 'metadata',
        category: 'spatial',
        description: 'Native 4K SXRD laser projector with 10,000-lumen output, HDR10 support, and motorized anamorphic lens for 2.35:1 cinemascope.',
        specs: [
          { label: 'Resolution', value: '4096 x 2160 Native' },
          { label: 'Brightness', value: '10,000 Lumens' }
        ],
        icon: 'sparkles',
        color: 'cyan',
        pulseStyle: 'glowing'
      },
      {
        id: 'hp-cinema-2',
        xPercent: 25,
        yPercent: 55,
        title: 'Dolby Atmos 9.4.6 Speaker Array',
        type: 'metadata',
        category: 'acoustic',
        description: 'Reference-grade Dolby Atmos system with 9 earround channels, 4 subwoofers, and 6 overhead speakers in acoustically treated room.',
        specs: [
          { label: 'Configuration', value: '9.4.6 Channel' },
          { label: 'Treatment', value: 'Full Acoustic Paneling' }
        ],
        icon: 'volume2',
        color: 'violet',
        pulseStyle: 'radar'
      },
      {
        id: 'hp-cinema-portal-salon',
        xPercent: 10,
        yPercent: 50,
        title: 'Return to Grand Salon',
        type: 'room_link',
        category: 'portal',
        description: 'Return to the main living pavilion.',
        targetRoomId: 'room-grand-salon',
        targetRoomName: 'The Solarium Sky Penthouse - Grand Salon',
        targetPanoramaUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2400&q=85',
        targetYaw: 180,
        icon: 'door',
        color: 'rose',
        pulseStyle: 'radar'
      }
    ]
  }
];

export interface PanoramaViewerProps {
  activePanoramaUrl?: string;
  activePanoramaTitle?: string;
}

export default function PanoramaViewer({ activePanoramaUrl: propActivePanoramaUrl, activePanoramaTitle: propActivePanoramaTitle }: PanoramaViewerProps = {}) {
  const { panoramaModalOpen, closePanorama, showToast } = useAppStore();
  const activePanoramaUrl = propActivePanoramaUrl ?? useAppStore.getState().activePanoramaUrl;
  const activePanoramaTitle = propActivePanoramaTitle ?? useAppStore.getState().activePanoramaTitle;

  const isStandalone = propActivePanoramaUrl !== undefined || propActivePanoramaTitle !== undefined;
  const isViewerActive = isStandalone || panoramaModalOpen;

  const initialRoom = TOUR_ROOMS.find(
    (r) => r.panoramaUrl === activePanoramaUrl || r.name === activePanoramaTitle
  ) || TOUR_ROOMS[0];

  // User preferences
  const { preferences, updatePreferences, resetPreferences } = useTourPreferences();
  const { theme } = useTheme(preferences);
  const { reducedMotion } = useReducedMotion(preferences);

  // Camera state
  const [yaw, setYaw] = useState(initialRoom.initialYaw);
  const [pitch, setPitch] = useState(initialRoom.initialPitch);
  const [fov, setFov] = useState(75);
  const [showHotspots, setShowHotspots] = useState(true);

  // Teleport + active hotspot state
  const [isTeleporting, setIsTeleporting] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

  // Tour navigation (extracted hook manages room state + history)
  const {
    currentRoom,
    setCurrentRoom,
    roomHistory,
    roomHistoryIndex,
    navigateToRoomWithHistory,
    teleportToRoom,
    goBack,
    goForward,
    currentSceneIndex,
  } = useTourNavigation({
    rooms: TOUR_ROOMS,
    initialRoom,
    onNavigate: (room: TourRoom, targetYaw?: number) => {
      setIsTeleporting(true);
      setActiveHotspot(null);
      setTimeout(() => {
        setCurrentRoom(room);
        setYaw(targetYaw ?? room.initialYaw);
        setPitch(room.initialPitch);
        setIsTeleporting(false);
      }, 400);
    },
    showToast,
  });

  // Fullscreen (extracted hook)
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);

  // Ref for props URL change tracking
  const [lastPropUrl, setLastPropUrl] = useState(activePanoramaUrl);
  useEffect(() => {
    if (activePanoramaUrl && activePanoramaUrl !== lastPropUrl) {
      setLastPropUrl(activePanoramaUrl);
      const match = TOUR_ROOMS.find(
        (r) => r.panoramaUrl === activePanoramaUrl || r.name === activePanoramaTitle
      );
      if (match) setCurrentRoom(match);
    }
  }, [activePanoramaUrl, lastPropUrl, setCurrentRoom, activePanoramaTitle]);

  // Hotspot data per room
  const [roomHotspotsMap, setRoomHotspotsMap] = useState<Record<string, Hotspot[]>>(() => {
    const initial: Record<string, Hotspot[]> = {};
    TOUR_ROOMS.forEach((r) => {
      initial[r.id] = [...r.defaultHotspots];
    });
    return initial;
  });

  const currentHotspots = roomHotspotsMap[currentRoom.id] || [];

  // Auto-rotate (inline for ControlBar compatibility)
  const [isPlaying, setIsPlaying] = useState(preferences.autoRotate);
  const [guidedOn, setGuidedOn] = useState(false);
  useEffect(() => {
    if (!isPlaying || reducedMotion) return;
    const speed = preferences.autoRotateSpeed || 1;
    const interval = setInterval(() => {
      setYaw((prev) => (prev + 0.05 * speed + 360) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, reducedMotion, preferences.autoRotateSpeed]);

  useEffect(() => {
    if (preferences.autoRotate && !isPlaying) setIsPlaying(true);
  }, [preferences.autoRotate]);

  useEffect(() => {
    if (!guidedOn) return;
    const interval = setInterval(() => goForward(), 6000);
    return () => clearInterval(interval);
  }, [guidedOn, goForward]);

  // Hotspot authoring state
  const [isAddMode, setIsAddMode] = useState(false);
  const [placingCoords, setPlacingCoords] = useState<{ xPercent: number; yPercent: number } | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [editingHotspotId, setEditingHotspotId] = useState<string | null>(null);
  const [hotspotDrawerOpen, setHotspotDrawerOpen] = useState(false);
  const [roomDropdownOpen, setRoomDropdownOpen] = useState(false);

  // Form fields for hotspot creation/edit
  const [formType, setFormType] = useState<HotspotType>('metadata');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<HotspotCategory>('material');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState<HotspotColor>('rose');
  const [formIcon, setFormIcon] = useState('sparkles');
  const [formPulse, setFormPulse] = useState<'radar' | 'glowing' | 'subtle'>('radar');
  const [formSpecs, setFormSpecs] = useState<HotspotSpec[]>([{ label: 'Specification', value: '8K PBR Shader' }]);
  const [formTargetRoomId, setFormTargetRoomId] = useState(TOUR_ROOMS[1]?.id || TOUR_ROOMS[0].id);
  const [formCustomRoomName, setFormCustomRoomName] = useState('');
  const [formCustomPanoramaUrl, setFormCustomPanoramaUrl] = useState('');

  // UI panel state
  const [showHotspotListPanel, setShowHotspotListPanel] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [showGoogleDrivePanel, setShowGoogleDrivePanel] = useState(false);
  const [showBottomControls, setShowBottomControls] = useState(true);
  const [bottomControlsVisible, setBottomControlsVisible] = useState(true);
  const bottomControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showTutorial, setShowTutorial] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('viztr-tutorial-seen');
  });
  const [tutorialStep, setTutorialStep] = useState(0);

  // Refs
  const sphereViewportRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Tour settings from API
  const [tourOffline, setTourOffline] = useState(false);
  const [tourTheme, setTourTheme] = useState<{ accentColor: string; logoUrl: string; title: string }>({
    accentColor: '#3ECF8E', logoUrl: '', title: 'VizTR Virtual Tour'
  });

  // Marzipano panorama renderer
  const {
    error: panoramaError,
    isLoading: isPanoramaLoading,
    screenToHotspotCoords,
    screenToView,
    setView: setPanoramaView,
    zoomBy: zoomPanorama,
  } = usePanoramaRenderer({
    viewportRef: sphereViewportRef,
    view: { yaw, pitch, fov },
    onViewChange: (nextView: { yaw: number; pitch: number; fov: number }) => {
      setYaw(nextView.yaw);
      setPitch(nextView.pitch);
      setFov(nextView.fov);
    },
    isActive: isViewerActive,
    imageUrl: currentRoom?.panoramaUrl || '',
  });

  // Preload adjacent scenes
  usePanoramaPreloader(currentSceneIndex, TOUR_ROOMS, 2);

  // Load editable tour from persistence API
  const [roomsTick, setRoomsTick] = useState(0);
  useEffect(() => {
    if (!isViewerActive) return;
    let cancelled = false;
    fetch('/api/tour')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data || !Array.isArray(data.rooms) || data.rooms.length === 0) return;
        TOUR_ROOMS.length = 0;
        data.rooms.forEach((r: TourRoom) => TOUR_ROOMS.push(r));
        const featured = TOUR_ROOMS.find((r) => r.featured);
        const match = featured || TOUR_ROOMS.find((r) => r.id === currentRoom.id) || TOUR_ROOMS[0];
        if (match) {
          setCurrentRoom(match);
          setRoomHotspotsMap((prev) => ({ ...prev, [match.id]: [...match.defaultHotspots] }));
        }
        setRoomsTick((t) => t + 1);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isViewerActive, roomsTick, currentRoom.id, setCurrentRoom]);

  // Load admin-controlled tour settings
  useEffect(() => {
    if (!isViewerActive) return;
    let cancelled = false;
    fetch('/api/tour/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (cancelled || !s) return;
        setTourOffline(!s.live);
        if (s.theme) setTourTheme(s.theme);
        if (s.live) fetch('/api/tour/views', { method: 'POST' }).catch(() => {});
        const f = s.features || {};
        updatePreferences({
          showHotspots: f.hotspots !== false,
          autoRotate: f.autoRotate === true,
          showFloorPlan: f.floorPlan !== false,
          musicEnabled: f.music === true,
          showZoomControls: f.zoomControls !== false,
          showSceneCounter: f.sceneCounter !== false,
          hideTopBar: f.branding === false,
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isViewerActive, updatePreferences]);

  // Keyboard navigation
  useEffect(() => {
    if (!isViewerActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (configModalOpen) { setConfigModalOpen(false); setPlacingCoords(null); }
        else if (isAddMode) { setIsAddMode(false); showToast('Add hotspot mode cancelled.', 'info'); }
        else if (hotspotDrawerOpen) setHotspotDrawerOpen(false);
        else if (activeHotspot) setActiveHotspot(null);
        else closePanorama();
      } else if (e.key === 'ArrowLeft') {
        const step = e.ctrlKey && preferences.ctrlAxisRotationEnabled ? preferences.ctrlAxisRotationStep : 8;
        setYaw((prev) => (prev - step + 360) % 360);
      } else if (e.key === 'ArrowRight') {
        const step = e.ctrlKey && preferences.ctrlAxisRotationEnabled ? preferences.ctrlAxisRotationStep : 8;
        setYaw((prev) => (prev + step) % 360);
      } else if (e.key === 'ArrowUp') setPitch((prev) => Math.min(prev + 4, 45));
      else if (e.key === 'ArrowDown') setPitch((prev) => Math.max(prev - 4, -45));
      else if (e.key === 'h' || e.key === 'H') {
        if (!configModalOpen) setIsAddMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isViewerActive, activeHotspot, isAddMode, configModalOpen, hotspotDrawerOpen, closePanorama, showToast, preferences.ctrlAxisRotationEnabled, preferences.ctrlAxisRotationStep]);

  // Audio volume effect
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = preferences.musicVolume;
  }, [preferences.musicVolume, preferences.musicEnabled, preferences.backgroundMusicUrl]);

  // Close settings menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsMenuOpen) {
        const target = e.target as HTMLElement;
        if (!target.closest('.settings-menu-trigger') && !target.closest('.settings-menu-dropdown')) {
          setSettingsMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [settingsMenuOpen]);

  // Handlers
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddMode) return;
    const calculatedCoords = screenToHotspotCoords(e.clientX, e.clientY);
    if (!calculatedCoords) return;
    setPlacingCoords(calculatedCoords);
    setEditingHotspotId(null);
    setFormType('metadata');
    setFormTitle('');
    setFormCategory('material');
    setFormDescription('');
    setFormColor('rose');
    setFormIcon('sparkles');
    setFormPulse('radar');
    setFormSpecs([{ label: 'Material Finish', value: 'High-Gloss PBR' }, { label: 'Specification', value: 'Custom Commission' }]);
    setFormTargetRoomId(TOUR_ROOMS.find((r) => r.id !== currentRoom.id)?.id || TOUR_ROOMS[0].id);
    setFormCustomRoomName('');
    setFormCustomPanoramaUrl('');
    setIsAddMode(false);
    setConfigModalOpen(true);
  };

  const handleSaveHotspot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) { showToast('Please provide a title for the hotspot.', 'error'); return; }
    const targetRoomObj = TOUR_ROOMS.find((r) => r.id === formTargetRoomId);
    const newHotspot: Hotspot = {
      id: editingHotspotId || `hp-custom-${Date.now()}`,
      xPercent: placingCoords ? placingCoords.xPercent : 50,
      yPercent: placingCoords ? placingCoords.yPercent : 50,
      title: formTitle.trim(),
      type: formType,
      category: formType === 'room_link' ? 'portal' : formCategory,
      description: formDescription.trim() || 'Interactive 360 spatial marker with detailed architectural specifications.',
      specs: formType === 'metadata' ? formSpecs.filter((s) => s.label && s.value) : undefined,
      targetRoomId: formType === 'room_link' ? formTargetRoomId : undefined,
      targetRoomName: formType === 'room_link' ? (formCustomRoomName.trim() || targetRoomObj?.name || 'Linked Room') : undefined,
      targetPanoramaUrl: formType === 'room_link' ? (formCustomPanoramaUrl.trim() || targetRoomObj?.panoramaUrl) : undefined,
      targetYaw: formType === 'room_link' ? (targetRoomObj?.initialYaw || 180) : undefined,
      icon: formType === 'room_link' ? 'door' : formIcon,
      color: formColor,
      pulseStyle: formPulse,
      isCustom: true,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setRoomHotspotsMap((prev) => {
      const roomList = prev[currentRoom.id] || [];
      if (editingHotspotId) {
        return { ...prev, [currentRoom.id]: roomList.map((h) => (h.id === editingHotspotId ? newHotspot : h)) };
      }
      return { ...prev, [currentRoom.id]: [...roomList, newHotspot] };
    });
    showToast(
      editingHotspotId ? `Updated hotspot: "${newHotspot.title}"` : `Hotspot "${newHotspot.title}" added to ${currentRoom.name}!`,
      'success'
    );
    setConfigModalOpen(false);
    setPlacingCoords(null);
    setEditingHotspotId(null);
  };

  const handleEditHotspot = (hp: Hotspot) => {
    setEditingHotspotId(hp.id);
    setPlacingCoords({ xPercent: hp.xPercent, yPercent: hp.yPercent });
    setFormType(hp.type);
    setFormTitle(hp.title);
    setFormCategory(hp.category);
    setFormDescription(hp.description);
    setFormColor(hp.color || 'rose');
    setFormIcon(hp.icon || 'sparkles');
    setFormPulse(hp.pulseStyle || 'radar');
    setFormSpecs(hp.specs && hp.specs.length > 0 ? hp.specs : [{ label: 'Specification', value: '8K PBR' }]);
    setFormTargetRoomId(hp.targetRoomId || TOUR_ROOMS[0].id);
    setFormCustomRoomName(hp.targetRoomName || '');
    setFormCustomPanoramaUrl(hp.targetPanoramaUrl || '');
    setActiveHotspot(null);
    setHotspotDrawerOpen(false);
    setConfigModalOpen(true);
  };

  const handleDeleteHotspot = (hpId: string) => {
    setRoomHotspotsMap((prev) => ({ ...prev, [currentRoom.id]: (prev[currentRoom.id] || []).filter((h) => h.id !== hpId) }));
    if (activeHotspot?.id === hpId) setActiveHotspot(null);
    showToast('Hotspot removed from scene.', 'info');
  };

  const focusOnHotspot = (hp: Hotspot) => {
    setYaw((hp.xPercent / 100) * 360);
    setPitch(Math.max(-30, Math.min(30, (hp.yPercent - 50) * 0.8)));
    setActiveHotspot(hp);
    setHotspotDrawerOpen(false);
    showToast(`Centered view on "${hp.title}"`, 'info');
  };

  const handleExportTour = () => {
    navigator.clipboard.writeText(JSON.stringify(roomHotspotsMap, null, 2));
    showToast('360 Tour Hotspots JSON copied to clipboard!', 'success');
  };

  const handleResetTour = () => {
    const reset: Record<string, Hotspot[]> = {};
    TOUR_ROOMS.forEach((r) => { reset[r.id] = [...r.defaultHotspots]; });
    setRoomHotspotsMap(reset);
    showToast('Restored default architectural hotspots.', 'info');
  };

  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.set('scene', currentRoom.id);
    return url.toString();
  };

  const handleShare = () => { setShowShareDialog(true); setShareCopied(false); };

  const handleCopyShareUrl = async () => {
    try { await navigator.clipboard.writeText(getShareUrl()); setShareCopied(true); showToast('Link copied to clipboard!', 'success'); setTimeout(() => setShareCopied(false), 2000); }
    catch { showToast('Failed to copy link', 'error'); }
  };

  const onResetDefaults = () => { resetPreferences(); setShowPreferences(false); };

  // In standalone mode (props provided), always render. In modal mode, only render when open.
  if (!isStandalone && !panoramaModalOpen) return null;

  return (
    <div
      ref={containerRef}
      id="360-panorama-viewer-modal"
      role="dialog"
      aria-modal="true"
      aria-label="360° Virtual Tour Viewer"
      className="fixed inset-0 z-[999] bg-black text-white flex flex-col select-none animate-in fade-in duration-200"
      style={{ ['--accent' as any]: tourTheme.accentColor }}
    >
      {/* OFFLINE / UNPUBLISHED OVERLAY */}
      {tourOffline && (
        <div className="absolute inset-0 z-[60] bg-[#09090B] flex flex-col items-center justify-center text-center px-6">
          <div className="w-14 h-14 rounded-full bg-rose-500/15 border border-rose-500/40 flex items-center justify-center mb-4">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <div className="text-sm font-mono font-bold text-rose-300 uppercase tracking-widest">
            Virtual Tour Unpublished
          </div>
          <p className="text-xs text-[#A1A1AA] mt-2 max-w-sm">
            This 360° tour is currently offline. The operator can publish it from the admin dashboard.
          </p>
        </div>
      )}

      {/* TELEPORTATION TRANSITION FLASH */}
      <AnimatePresence>
        {isTeleporting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-50 bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="w-16 h-16 rounded-full border-2 border-rose-500 border-t-transparent animate-spin mb-4" />
            <div className="text-sm font-mono font-bold tracking-widest text-[#3ECF8E] uppercase">
              Teleporting to Room Node...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIEWPORT - Marzipano canvas host */}
      <div
        ref={sphereViewportRef}
        id="sphere-canvas-host"
        className="relative flex-1 w-full h-full"
        onClick={handleCanvasClick}
      >
        {isPanoramaLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
            <div className="flex flex-col items-center gap-3 text-zinc-300">
              <div className="w-10 h-10 rounded-full border-2 border-[#3ECF8E] border-t-transparent animate-spin" />
              <span className="text-xs font-mono">Loading 360° panorama...</span>
            </div>
          </div>
        )}
        {panoramaError && !isPanoramaLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
            <div className="text-center text-rose-400 text-xs">
              <p className="font-bold mb-1">Panorama Load Error</p>
              <p className="text-[10px]">{panoramaError}</p>
            </div>
          </div>
        )}
      </div>

      {/* HOTSPOT LAYER (HotspotOverlay, active card, drawer, config modal) */}
      <HotspotLayer
        hotspots={currentHotspots}
        yaw={yaw}
        pitch={pitch}
        fov={fov}
        showHotspots={showHotspots}
        isAddMode={isAddMode}
        activeHotspot={activeHotspot}
        placingCoords={placingCoords}
        configModalOpen={configModalOpen}
        editingHotspotId={editingHotspotId}
        formType={formType}
        formTitle={formTitle}
        formCategory={formCategory}
        formDescription={formDescription}
        formColor={formColor}
        formIcon={formIcon}
        formPulse={formPulse}
        formSpecs={formSpecs}
        formTargetRoomId={formTargetRoomId}
        formCustomRoomName={formCustomRoomName}
        formCustomPanoramaUrl={formCustomPanoramaUrl}
        hotspotDrawerOpen={hotspotDrawerOpen}
        roomHistoryIndex={roomHistoryIndex}
        roomHistoryLength={roomHistory.length}
        rooms={TOUR_ROOMS}
        currentRoom={currentRoom}
        currentHotspots={currentHotspots}
        screenToHotspotCoords={screenToHotspotCoords}
        showToast={showToast}
        onHotspotClick={setActiveHotspot}
        onSaveHotspot={handleSaveHotspot}
        onEditHotspot={handleEditHotspot}
        onDeleteHotspot={handleDeleteHotspot}
        onFocusHotspot={focusOnHotspot}
        onExportTour={handleExportTour}
        onResetTour={handleResetTour}
        onCanvasClick={handleCanvasClick}
        onSetIsAddMode={setIsAddMode}
        onSetPlacingCoords={setPlacingCoords}
        onSetConfigModalOpen={setConfigModalOpen}
        onSetEditingHotspotId={setEditingHotspotId}
        onSetFormType={setFormType}
        onSetFormTitle={setFormTitle}
        onSetFormCategory={setFormCategory}
        onSetFormDescription={setFormDescription}
        onSetFormColor={setFormColor}
        onSetFormIcon={setFormIcon}
        onSetFormPulse={setFormPulse}
        onSetFormSpecs={setFormSpecs}
        onSetFormTargetRoomId={setFormTargetRoomId}
        onSetFormCustomRoomName={setFormCustomRoomName}
        onSetFormCustomPanoramaUrl={setFormCustomPanoramaUrl}
        onSetHotspotDrawerOpen={setHotspotDrawerOpen}
        onTeleportToRoom={teleportToRoom}
      />

      {/* CONTROL BAR (top bar, bottom HUD, logos, share/search/preferences panels) */}
      <ControlBar
        yaw={yaw}
        pitch={pitch}
        fov={fov}
        currentRoom={currentRoom}
        rooms={TOUR_ROOMS}
        preferences={preferences}
        updatePreferences={updatePreferences}
        showToast={showToast}
        tourTheme={tourTheme}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        closePanorama={closePanorama}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        guidedOn={guidedOn}
        setGuidedOn={setGuidedOn}
        roomHistory={roomHistory}
        roomHistoryIndex={roomHistoryIndex}
        goBack={goBack}
        goForward={goForward}
        currentSceneIndex={currentSceneIndex}
        navigateToRoomWithHistory={navigateToRoomWithHistory}
        showHotspots={showHotspots}
        setShowHotspots={setShowHotspots}
        isAddMode={isAddMode}
        setIsAddMode={setIsAddMode}
        activeHotspot={activeHotspot}
        setActiveHotspot={setActiveHotspot}
        hotspotDrawerOpen={hotspotDrawerOpen}
        setHotspotDrawerOpen={setHotspotDrawerOpen}
        showHotspotListPanel={showHotspotListPanel}
        setShowHotspotListPanel={setShowHotspotListPanel}
        roomDropdownOpen={roomDropdownOpen}
        setRoomDropdownOpen={setRoomDropdownOpen}
        showShareDialog={showShareDialog}
        setShowShareDialog={setShowShareDialog}
        shareCopied={shareCopied}
        setShareCopied={setShareCopied}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showPreferences={showPreferences}
        setShowPreferences={setShowPreferences}
        settingsMenuOpen={settingsMenuOpen}
        setSettingsMenuOpen={setSettingsMenuOpen}
        showGoogleDrivePanel={showGoogleDrivePanel}
        setShowGoogleDrivePanel={setShowGoogleDrivePanel}
        showBottomControls={showBottomControls}
        bottomControlsVisible={bottomControlsVisible}
        showBottomControlsOnHover={preferences.showBottomControlsOnHover}
        setShowBottomControls={setShowBottomControls}
        setBottomControlsVisible={setBottomControlsVisible}
        bottomControlsTimeoutRef={bottomControlsTimeoutRef}
        reducedMotion={reducedMotion}
        audioRef={audioRef as React.RefObject<HTMLAudioElement>}
        containerRef={containerRef as React.RefObject<HTMLDivElement>}
        handleShare={handleShare}
        handleCopyShareUrl={handleCopyShareUrl}
        getShareUrl={getShareUrl}
        teleportToRoom={teleportToRoom}
        screenToHotspotCoords={screenToHotspotCoords}
        roomHotspotsMap={roomHotspotsMap}
        setRoomHotspotsMap={setRoomHotspotsMap}
        currentHotspots={currentHotspots}
        handleCanvasClick={handleCanvasClick}
        handleSaveHotspot={handleSaveHotspot}
        handleEditHotspot={handleEditHotspot}
        handleDeleteHotspot={handleDeleteHotspot}
        focusOnHotspot={focusOnHotspot}
        handleExportTour={handleExportTour}
        handleResetTour={handleResetTour}
        placingCoords={placingCoords}
        configModalOpen={configModalOpen}
        setConfigModalOpen={setConfigModalOpen}
        editingHotspotId={editingHotspotId}
        setEditingHotspotId={setEditingHotspotId}
        formType={formType}
        setFormType={setFormType}
        formTitle={formTitle}
        setFormTitle={setFormTitle}
        formCategory={formCategory}
        setFormCategory={setFormCategory}
        formDescription={formDescription}
        setFormDescription={setFormDescription}
        formColor={formColor}
        setFormColor={setFormColor}
        formIcon={formIcon}
        setFormIcon={setFormIcon}
        formPulse={formPulse}
        setFormPulse={setFormPulse}
        formSpecs={formSpecs}
        setFormSpecs={setFormSpecs}
        formTargetRoomId={formTargetRoomId}
        setFormTargetRoomId={setFormTargetRoomId}
        formCustomRoomName={formCustomRoomName}
        setFormCustomRoomName={setFormCustomRoomName}
        formCustomPanoramaUrl={formCustomPanoramaUrl}
        setFormCustomPanoramaUrl={setFormCustomPanoramaUrl}
        onResetDefaults={onResetDefaults}
        showTutorial={showTutorial}
        setShowTutorial={setShowTutorial}
        tutorialStep={tutorialStep}
        setTutorialStep={setTutorialStep}
        isTeleporting={isTeleporting}
        tourOffline={tourOffline}
      />
    </div>
  );
}

