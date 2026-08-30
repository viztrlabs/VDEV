'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/lib/store';
import { useTourPreferences, useTheme, useReducedMotion } from '@/hooks/use-tour-preferences';
import { useScenePreloader } from '@/hooks/use-lazy-image';
import {
  X,
  Compass,
  Maximize2,
  Minimize2,
  Info,
  Layers,
  Smartphone,
  Navigation,
  Sparkles,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Plus,
  Edit2,
  Trash2,
  DoorOpen,
  Tag,
  Eye,
  Palette,
  Box,
  Zap,
  CheckCircle2,
  Copy,
  RotateCcw,
  MapPin,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Share2,
  Search,
  Settings,
  Flame,
  Volume2,
  Play,
  Pause,
  Upload,
  Music,
  Bot,
  Image as ImageIcon,
  Globe,
} from 'lucide-react';

export type HotspotType = 'metadata' | 'room_link';
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
  const {
    panoramaModalOpen,
    activePanoramaUrl: storeActivePanoramaUrl,
    activePanoramaTitle: storeActivePanoramaTitle,
    closePanorama,
    showToast

  } = useAppStore();

  // Use props if provided, otherwise fall back to store values
  const activePanoramaUrl = propActivePanoramaUrl ?? storeActivePanoramaUrl;
  const activePanoramaTitle = propActivePanoramaTitle ?? storeActivePanoramaTitle;

  // In standalone mode (props provided), always render. In modal mode, only render when open.
  const isStandalone = propActivePanoramaUrl !== undefined || propActivePanoramaTitle !== undefined;
  const isViewerActive = isStandalone || panoramaModalOpen;

  // Determine initial room
  const initialRoom = TOUR_ROOMS.find(
    (r) => r.panoramaUrl === activePanoramaUrl || r.name === activePanoramaTitle
  ) || TOUR_ROOMS[0];

  // Active Room state
  const [currentRoom, setCurrentRoom] = useState<TourRoom>(initialRoom);
  const [roomHotspotsMap, setRoomHotspotsMap] = useState<Record<string, Hotspot[]>>(() => {
    const initial: Record<string, Hotspot[]> = {};
    TOUR_ROOMS.forEach((r) => {
      initial[r.id] = [...r.defaultHotspots];
    });
    return initial;
  });

  // URL deep-linking: read ?scene=room-id on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const sceneId = params.get('scene');
    if (sceneId) {
      const found = TOUR_ROOMS.find((r) => r.id === sceneId);
      if (found) {
        setCurrentRoom(found);
        setYaw(found.initialYaw);
        setPitch(found.initialPitch);
      }
    }
  }, []);

  // URL deep-linking: track room navigation history
  const [roomHistory, setRoomHistory] = useState<string[]>([]);
  const [roomHistoryIndex, setRoomHistoryIndex] = useState(-1);

  // Update URL when room changes
  const updateUrlWithScene = (roomId: string) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('scene', roomId);
    window.history.replaceState(null, '', url.toString());
  };

  // Navigate to room with history tracking
  const navigateToRoomWithHistory = (room: TourRoom, targetYaw?: number) => {
    setIsTeleporting(true);
    setActiveHotspot(null);

    setTimeout(() => {
      setCurrentRoom(room);
      setYaw(targetYaw !== undefined ? targetYaw : room.initialYaw);
      setPitch(room.initialPitch);

      // Update history
      setRoomHistory((prev) => {
        const newHistory = prev.slice(0, roomHistoryIndex + 1);
        newHistory.push(room.id);
        return newHistory;
      });
      setRoomHistoryIndex((prev) => prev + 1);

      // Update URL
      updateUrlWithScene(room.id);

      showToast(`Teleported to ${room.name}`, 'success');
      setIsTeleporting(false);
    }, 400);
  };

  // Back navigation
  const goBack = () => {
    if (roomHistoryIndex > 0) {
      const prevRoomId = roomHistory[roomHistoryIndex - 1];
      const prevRoom = TOUR_ROOMS.find((r) => r.id === prevRoomId);
      if (prevRoom) {
        setIsTeleporting(true);
        setActiveHotspot(null);
        setTimeout(() => {
          setCurrentRoom(prevRoom);
          setYaw(prevRoom.initialYaw);
          setPitch(prevRoom.initialPitch);
          setRoomHistoryIndex((prev) => prev - 1);
          updateUrlWithScene(prevRoom.id);
          showToast(`Returned to ${prevRoom.name}`, 'success');
          setIsTeleporting(false);
        }, 400);
      }
    }
  };

  // Forward navigation
  const goForward = () => {
    if (roomHistoryIndex < roomHistory.length - 1) {
      const nextRoomId = roomHistory[roomHistoryIndex + 1];
      const nextRoom = TOUR_ROOMS.find((r) => r.id === nextRoomId);
      if (nextRoom) {
        setIsTeleporting(true);
        setActiveHotspot(null);
        setTimeout(() => {
          setCurrentRoom(nextRoom);
          setYaw(nextRoom.initialYaw);
          setPitch(nextRoom.initialPitch);
          setRoomHistoryIndex((prev) => prev + 1);
          updateUrlWithScene(nextRoom.id);
          showToast(`Teleported to ${nextRoom.name}`, 'success');
          setIsTeleporting(false);
        }, 400);
      }
    }
  };

  // Share URL
  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.set('scene', currentRoom.id);
    return url.toString();
  };

  const handleShare = () => {
    setShowShareDialog(true);
    setShareCopied(false);
  };

  const handleCopyShareUrl = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      showToast('Link copied to clipboard!', 'success');
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      showToast('Failed to copy link', 'error');
    }
  };

  // Track if activePanoramaUrl prop changes from outside
  const [lastPropUrl, setLastPropUrl] = useState(activePanoramaUrl);
  if (activePanoramaUrl && activePanoramaUrl !== lastPropUrl) {
    setLastPropUrl(activePanoramaUrl);
    const match = TOUR_ROOMS.find(
      (r) => r.panoramaUrl === activePanoramaUrl || r.name === activePanoramaTitle
    );
    if (match) {
      setCurrentRoom(match);
    }
  }

  // Navigation / Camera state
  const [yaw, setYaw] = useState(initialRoom.initialYaw); // 0 to 360 degrees
  const [pitch, setPitch] = useState(initialRoom.initialPitch); // -45 to 45 degrees
  const [fov, setFov] = useState(75); // 40 to 100 degrees
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [gyroActive, setGyroActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);

  // Bottom-center controls auto-hide on proximity
  const [showBottomControls, setShowBottomControls] = useState(true);
  const [bottomControlsVisible, setBottomControlsVisible] = useState(true);
  const bottomControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Bottom-right hotspot list panel
   const [showHotspotListPanel, setShowHotspotListPanel] = useState(false);
   const audioRef = useRef<HTMLAudioElement>(null);

  // Active Hotspot Popup state
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

  // Share dialog state
  const [showShareDialog, setShowShareDialog] = useState<boolean>(false);
  const [shareCopied, setShareCopied] = useState<boolean>(false);

  // Tutorial/onboarding state
  const [showTutorial, setShowTutorial] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('viztr-tutorial-seen');
  });
  const [tutorialStep, setTutorialStep] = useState<number>(0);

  // Search panel state
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Preferences panel state
  const [showPreferences, setShowPreferences] = useState<boolean>(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState<boolean>(false);
  const [showGoogleDrivePanel, setShowGoogleDrivePanel] = useState<boolean>(false);

  // User preferences
  const { preferences, updatePreferences } = useTourPreferences();
  const { theme } = useTheme(preferences);
  const { reducedMotion } = useReducedMotion(preferences);

  // Sync isPlaying with preferences.autoRotate
  const [isPlaying, setIsPlaying] = useState(preferences.autoRotate);

  // Auto-rotate effect (play/pause)
  useEffect(() => {
    if (!isPlaying || reducedMotion) return;
    const speed = preferences.autoRotateSpeed || 1;
    const interval = setInterval(() => {
      setYaw((prev) => (prev + 0.05 * speed + 360) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, reducedMotion, preferences.autoRotateSpeed]);

  // Sync autoRotate preference toggle
  useEffect(() => {
    if (preferences.autoRotate && !isPlaying) {
      setIsPlaying(true);
    }
  }, [preferences.autoRotate]);

   // Scroll-to-zoom effect (only when fullscreen)
   useEffect(() => {
     if (!isViewerActive || !preferences.scrollZoomEnabled) return;
     const handleWheel = (e: WheelEvent) => {
       e.preventDefault();
       const delta = e.deltaY < 0 ? -1 : 1;
       const step = preferences.scrollZoomStep || 10;
       setFov((prev) => Math.min(100, Math.max(40, prev + delta * step)));
     };
     const container = containerRef.current;
     if (!container) return;
     container.addEventListener('wheel', handleWheel, { passive: false });
     return () => container.removeEventListener('wheel', handleWheel);
    }, [isViewerActive, preferences.scrollZoomEnabled, preferences.scrollZoomStep]);

   // Update audio volume when preference changes
   useEffect(() => {
     if (audioRef.current) {
       audioRef.current.volume = preferences.musicVolume;
     }
   }, [preferences.musicVolume, preferences.musicEnabled, preferences.backgroundMusicUrl]);

   // Bottom-center controls auto-hide on cursor proximity
  useEffect(() => {
    if (!preferences.showBottomControlsOnHover) {
      setBottomControlsVisible(true);
      return;
    }
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseY = e.clientY;
      const bottomThreshold = rect.bottom - 120; // 120px from bottom
      const isNearBottom = mouseY >= bottomThreshold;

      if (isNearBottom) {
        setBottomControlsVisible(true);
        setShowBottomControls(true);
        if (bottomControlsTimeoutRef.current) {
          clearTimeout(bottomControlsTimeoutRef.current);
        }
        bottomControlsTimeoutRef.current = setTimeout(() => {
          if (preferences.showBottomControlsOnHover) {
            setBottomControlsVisible(false);
          }
        }, 1500);
      } else if (bottomControlsVisible) {
        // Fade out when moving away from bottom area
        if (bottomControlsTimeoutRef.current) {
          clearTimeout(bottomControlsTimeoutRef.current);
        }
        bottomControlsTimeoutRef.current = setTimeout(() => {
          setBottomControlsVisible(false);
        }, 1500);
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      if (bottomControlsTimeoutRef.current) {
        clearTimeout(bottomControlsTimeoutRef.current);
      }
    };
  }, [preferences.showBottomControlsOnHover, bottomControlsVisible]);

  // Close settings menu and other dropdowns when clicking outside
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

  const currentSceneIndex = TOUR_ROOMS.findIndex((r) => r.id === currentRoom.id);
  useScenePreloader(currentSceneIndex, TOUR_ROOMS, 2);

  // ADD HOTSPOT AUTHORING STATE
  const [isAddMode, setIsAddMode] = useState<boolean>(false);
  const [placingCoords, setPlacingCoords] = useState<{ xPercent: number; yPercent: number } | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState<boolean>(false);
  const [editingHotspotId, setEditingHotspotId] = useState<string | null>(null);
  const [hotspotDrawerOpen, setHotspotDrawerOpen] = useState<boolean>(false);
  const [roomDropdownOpen, setRoomDropdownOpen] = useState<boolean>(false);

  // Teleport animation flash
  const [isTeleporting, setIsTeleporting] = useState<boolean>(false);

  // Form Fields for new/edited hotspot
  const [formType, setFormType] = useState<HotspotType>('metadata');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formCategory, setFormCategory] = useState<HotspotCategory>('material');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formColor, setFormColor] = useState<HotspotColor>('rose');
  const [formIcon, setFormIcon] = useState<string>('sparkles');
  const [formPulse, setFormPulse] = useState<'radar' | 'glowing' | 'subtle'>('radar');
  const [formSpecs, setFormSpecs] = useState<HotspotSpec[]>([
    { label: 'Specification', value: '8K PBR Shader' }
  ]);
  const [formTargetRoomId, setFormTargetRoomId] = useState<string>(TOUR_ROOMS[1].id);
  const [formCustomRoomName, setFormCustomRoomName] = useState<string>('');
  const [formCustomPanoramaUrl, setFormCustomPanoramaUrl] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);
  const sphereViewportRef = useRef<HTMLDivElement>(null);

  // Spherical 360° viewer (Three.js) — renders the equirectangular image on the
  // INSIDE of an inverted sphere with the camera at center. True look-around +
  // auto-rotate (camera yaw spin), not a flat looping image.
  const sphereStateRef = useRef({ yaw, pitch, fov, url: currentRoom.panoramaUrl });
  sphereStateRef.current = { yaw, pitch, fov, url: currentRoom.panoramaUrl };

  // Load the editable tour from the persistence API when the viewer opens, so
  // changes made in the dedicated editor (hotspots, 1->many portals) are
  // reflected here. Falls back to the hardcoded TOUR_ROOMS if the API is empty.
  const [roomsTick, setRoomsTick] = useState(0);
  useEffect(() => {
    if (!isViewerActive) return;
    let cancelled = false;
    fetch('/api/tour')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data || !Array.isArray(data.rooms) || data.rooms.length === 0) return;
        // Mutate the module-level array in place so all TOUR_ROOMS references see it.
        TOUR_ROOMS.length = 0;
        data.rooms.forEach((r: TourRoom) => TOUR_ROOMS.push(r));
        // Re-point the active room + its hotspots to the freshly loaded version.
        const match = TOUR_ROOMS.find((r) => r.id === currentRoom.id) || TOUR_ROOMS[0];
        if (match) {
          setCurrentRoom(match);
          setRoomHotspotsMap((prev) => ({
            ...prev,
            [match.id]: [...match.defaultHotspots],
          }));
        }
        setRoomsTick((t) => t + 1);
      })
      .catch(() => {
        /* keep hardcoded rooms on failure */
      });
    return () => {
      cancelled = true;
    };
  }, [isViewerActive, roomsTick]);

  useEffect(() => {
    if (!isViewerActive) return;
    const host = sphereViewportRef.current?.querySelector('#sphere-canvas-host') as HTMLDivElement | null;
    const viewport = sphereViewportRef.current;
    if (!host || !viewport) return;
    let disposed = false;
    let raf = 0;
    let cleanupFns: Array<() => void> = [];

    (async () => {
      try {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          75,
          viewport.clientWidth / Math.max(viewport.clientHeight, 1),
          0.1,
          1100
        );
        camera.rotation.order = 'YXZ';

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(viewport.clientWidth, viewport.clientHeight);
        host.appendChild(renderer.domElement);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.display = 'block';

        const geometry = new THREE.SphereGeometry(500, 64, 40);
        geometry.scale(1, 1, -1); // view from the inside

        const material = new THREE.MeshBasicMaterial();
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Crossfade state: track the currently-shown mesh/material + its URL.
        let currentMesh = mesh;
        let currentMaterial = material;
        let loadedUrl = '';
        let fadeRaf = 0;
        let fadeStart = 0;
        const FADE_MS = 600;

        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin('anonymous');

        const transitionTo = (url: string) => {
          if (!url || url === loadedUrl) return;
          loader.load(
            url,
            (tex) => {
              if (disposed) return;
              loadedUrl = url;
              tex.colorSpace = THREE.SRGBColorSpace;
              const nextMat = new THREE.MeshBasicMaterial({
                map: tex,
                transparent: true,
                opacity: 0,
              });
              const nextMesh = new THREE.Mesh(geometry, nextMat);
              scene.add(nextMesh);

              const prevMat = currentMaterial;
              const prevMesh = currentMesh;
              currentMaterial = nextMat;
              currentMesh = nextMesh;

              // Animate crossfade: next 0->1, prev 1->0.
              fadeStart = performance.now();
              cancelAnimationFrame(fadeRaf);
              const step = () => {
                if (disposed) return;
                const t = Math.min(1, (performance.now() - fadeStart) / FADE_MS);
                nextMat.opacity = t;
                prevMat.opacity = 1 - t;
                if (t < 1) {
                  fadeRaf = requestAnimationFrame(step);
                } else {
                  scene.remove(prevMesh);
                  prevMat.map?.dispose();
                  prevMat.dispose();
                }
              };
              step();
            },
            undefined,
            () => {
              /* swallow load errors — keep last frame */
            }
          );
        };
        transitionTo(sphereStateRef.current.url);

        const render = () => {
          if (disposed) return;
          raf = requestAnimationFrame(render);
          const s = sphereStateRef.current;
          camera.rotation.y = THREE.MathUtils.degToRad(-s.yaw);
          camera.rotation.x = THREE.MathUtils.degToRad(s.pitch);
          if (camera.fov !== s.fov) {
            camera.fov = s.fov;
            camera.updateProjectionMatrix();
          }
          renderer.render(scene, camera);
        };
        render();

        const onResize = () => {
          if (disposed) return;
          const w = viewport.clientWidth;
          const h = viewport.clientHeight;
          if (w && h) {
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
          }
        };
        const ro = new ResizeObserver(onResize);
        ro.observe(viewport);

        // Trigger a crossfade when the room (panorama URL) changes.
        const watch = setInterval(() => {
          if (disposed) return;
          if (sphereStateRef.current.url !== loadedUrl) {
            transitionTo(sphereStateRef.current.url);
          }
        }, 300);


        cleanupFns.push(() => {
          cancelAnimationFrame(raf);
          cancelAnimationFrame(fadeRaf);
          clearInterval(watch);
          ro.disconnect();
          geometry.dispose();
          currentMaterial.map?.dispose();
          currentMaterial.dispose();
          renderer.dispose();
          if (renderer.domElement.parentElement === host) {
            host.removeChild(renderer.domElement);
          }
        });
      } catch {
        /* no-op */
      }
    })();

    return () => {
      disposed = true;
      cleanupFns.forEach((f) => f());
      cleanupFns = [];
    };
  }, [isViewerActive]);

   // Keyboard navigation & Shortcuts
   useEffect(() => {
     if (!isViewerActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (configModalOpen) {
          setConfigModalOpen(false);
          setPlacingCoords(null);
        } else if (isAddMode) {
          setIsAddMode(false);
          showToast('Add hotspot mode cancelled.', 'info');
        } else if (hotspotDrawerOpen) {
          setHotspotDrawerOpen(false);
        } else if (activeHotspot) {
          setActiveHotspot(null);
        } else {
          closePanorama();
        }
        } else if (e.key === 'ArrowLeft') {
          const baseStep = e.ctrlKey && preferences.ctrlAxisRotationEnabled ? preferences.ctrlAxisRotationStep : 8;
          setYaw((prev) => (prev - baseStep + 360) % 360);
        } else if (e.key === 'ArrowRight') {
          const baseStep = e.ctrlKey && preferences.ctrlAxisRotationEnabled ? preferences.ctrlAxisRotationStep : 8;
          setYaw((prev) => (prev + baseStep) % 360);
      } else if (e.key === 'ArrowUp') {
        setPitch((prev) => Math.min(prev + 4, 45));
      } else if (e.key === 'ArrowDown') {
        setPitch((prev) => Math.max(prev - 4, -45));
      } else if (e.key === 'h' || e.key === 'H') {
        if (!configModalOpen) {
          setIsAddMode((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isViewerActive,
    activeHotspot,
    isAddMode,
    configModalOpen,
    hotspotDrawerOpen,
    closePanorama,
    showToast
  ]);

  // In standalone mode (props provided), always render. In modal mode, only render when open.
  if (!isStandalone && !panoramaModalOpen) return null;

  const currentHotspots = roomHotspotsMap[currentRoom.id] || [];

  // TELEPORT TO ROOM HANDLER (with history tracking)
  const teleportToRoom = (targetRoomId: string, customUrl?: string, customName?: string, targetYaw?: number) => {
    const target = TOUR_ROOMS.find((r) => r.id === targetRoomId);
    if (target) {
      navigateToRoomWithHistory(target, targetYaw);
    } else if (customUrl) {
      const dynamicRoom: TourRoom = {
        id: `room-${Date.now()}`,
        name: customName || 'New 360 Space',
        subtitle: 'Linked Architectural Space',
        panoramaUrl: customUrl,
        thumbnailUrl: customUrl,
        initialYaw: targetYaw || 180,
        initialPitch: 0,
        defaultHotspots: []
      };
      navigateToRoomWithHistory(dynamicRoom, targetYaw);
    }
  };

  // MOUSE DRAG & PANNING HANDLERS
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAddMode) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAddMode) return;
    const touch = e.touches[0];
    if (!touch) return;
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isAddMode) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setYaw((prev) => (prev - deltaX * 0.15 + 360) % 360);
    setPitch((prev) => Math.max(-45, Math.min(45, prev + deltaY * 0.15)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isAddMode) return;
    const touch = e.touches[0];
    if (!touch) return;
    e.preventDefault(); // Prevent scrolling
    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;

    setYaw((prev) => (prev - deltaX * 0.15 + 360) % 360);
    setPitch((prev) => Math.max(-45, Math.min(45, prev + deltaY * 0.15)));
    setDragStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // CANVAS CLICK HANDLER (FOR DROPPING HOTSPOTS)
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddMode) return;
    if (!sphereViewportRef.current) return;

    const rect = sphereViewportRef.current.getBoundingClientRect();
    const clickXRel = (e.clientX - rect.left) / rect.width;
    const clickYRel = (e.clientY - rect.top) / rect.height;

    const clickXPercent = clickXRel * 100;
    const clickYPercent = clickYRel * 100;

    const calculatedXPercent = ((clickXPercent + (yaw / 360) * 100 - 50 + 1000) % 100);
    const calculatedYPercent = Math.max(10, Math.min(90, clickYPercent - pitch * 0.6));

    setPlacingCoords({
      xPercent: Math.round(calculatedXPercent * 10) / 10,
      yPercent: Math.round(calculatedYPercent * 10) / 10
    });

    // Reset Form Defaults
    setEditingHotspotId(null);
    setFormType('metadata');
    setFormTitle('');
    setFormCategory('material');
    setFormDescription('');
    setFormColor('rose');
    setFormIcon('sparkles');
    setFormPulse('radar');
    setFormSpecs([
      { label: 'Material Finish', value: 'High-Gloss PBR' },
      { label: 'Specification', value: 'Custom Commission' }
    ]);
    setFormTargetRoomId(TOUR_ROOMS.find((r) => r.id !== currentRoom.id)?.id || TOUR_ROOMS[0].id);
    setFormCustomRoomName('');
    setFormCustomPanoramaUrl('');

    setIsAddMode(false);
    setConfigModalOpen(true);
  };

  // SAVE OR UPDATE HOTSPOT
  const handleSaveHotspot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Please provide a title for the hotspot.', 'error');
      return;
    }

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
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setRoomHotspotsMap((prev) => {
      const roomList = prev[currentRoom.id] || [];
      if (editingHotspotId) {
        return {
          ...prev,
          [currentRoom.id]: roomList.map((h) => (h.id === editingHotspotId ? newHotspot : h))
        };
      } else {
        return {
          ...prev,
          [currentRoom.id]: [...roomList, newHotspot]
        };
      }
    });

    showToast(
      editingHotspotId
        ? `Updated hotspot: "${newHotspot.title}"`
        : `Hotspot "${newHotspot.title}" added to ${currentRoom.name}!`,
      'success'
    );

    setConfigModalOpen(false);
    setPlacingCoords(null);
    setEditingHotspotId(null);
  };

  // EDIT HOTSPOT HANDLER
  const handleEditHotspot = (hp: Hotspot) => {
    setEditingHotspotId(hp.id);
    setPlacingCoords({
      xPercent: hp.xPercent,
      yPercent: hp.yPercent
    });
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

  // DELETE HOTSPOT HANDLER
  const handleDeleteHotspot = (hpId: string) => {
    setRoomHotspotsMap((prev) => ({
      ...prev,
      [currentRoom.id]: (prev[currentRoom.id] || []).filter((h) => h.id !== hpId)
    }));
    if (activeHotspot?.id === hpId) setActiveHotspot(null);
    showToast('Hotspot removed from scene.', 'info');
  };

  // FOCUS CAMERA ON A SPECIFIC HOTSPOT
  const focusOnHotspot = (hp: Hotspot) => {
    const targetYaw = (hp.xPercent / 100) * 360;
    const targetPitch = Math.max(-30, Math.min(30, (hp.yPercent - 50) * 0.8));
    setYaw(targetYaw);
    setPitch(targetPitch);
    setActiveHotspot(hp);
    setHotspotDrawerOpen(false);
    showToast(`Centered view on "${hp.title}"`, 'info');
  };

  // EXPORT TOUR AS JSON
  const handleExportTour = () => {
    const tourJson = JSON.stringify(roomHotspotsMap, null, 2);
    navigator.clipboard.writeText(tourJson);
    showToast('360 Tour Hotspots JSON copied to clipboard!', 'success');
  };

  // RESET TO DEFAULT HOTSPOTS
  const handleResetTour = () => {
    const reset: Record<string, Hotspot[]> = {};
    TOUR_ROOMS.forEach((r) => {
      reset[r.id] = [...r.defaultHotspots];
    });
    setRoomHotspotsMap(reset);
    showToast('Restored default architectural hotspots.', 'info');
  };

  // Helper for color styles
  const getColorClasses = (color?: HotspotColor) => {
    switch (color) {
      case 'emerald':
        return {
          bg: 'bg-emerald-600',
          text: 'text-emerald-400',
          border: 'border-emerald-500/40',
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.6)]'
        };
      case 'cyan':
        return {
          bg: 'bg-cyan-600',
          text: 'text-cyan-400',
          border: 'border-cyan-500/40',
          glow: 'shadow-[0_0_20px_rgba(6,182,212,0.6)]'
        };
      case 'amber':
        return {
          bg: 'bg-amber-600',
          text: 'text-amber-400',
          border: 'border-amber-500/40',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.6)]'
        };
      case 'violet':
        return {
          bg: 'bg-violet-600',
          text: 'text-violet-400',
          border: 'border-violet-500/40',
          glow: 'shadow-[0_0_20px_rgba(139,92,246,0.6)]'
        };
      case 'blue':
        return {
          bg: 'bg-blue-600',
          text: 'text-blue-400',
          border: 'border-blue-500/40',
          glow: 'shadow-[0_0_20px_rgba(59,130,246,0.6)]'
        };
      case 'rose':
      default:
        return {
          bg: 'bg-rose-600',
          text: 'text-rose-400',
          border: 'border-rose-500/40',
          glow: 'shadow-[0_0_20px_rgba(225,29,72,0.6)]'
        };
    }
  };

  const getHotspotIcon = (iconName?: string, type?: HotspotType) => {
    if (type === 'room_link') return <DoorOpen className="w-4 h-4" />;
    switch (iconName) {
      case 'palette':
        return <Palette className="w-4 h-4" />;
      case 'box':
        return <Box className="w-4 h-4" />;
      case 'layers':
        return <Layers className="w-4 h-4" />;
      case 'eye':
        return <Eye className="w-4 h-4" />;
      case 'zap':
        return <Zap className="w-4 h-4" />;
      case 'flame':
        return <Flame className="w-4 h-4" />;
      case 'info':
        return <Info className="w-4 h-4" />;
      case 'tag':
        return <Tag className="w-4 h-4" />;
      case 'acoustic':
        return <Volume2 className="w-4 h-4" />;
      case 'sparkles':
      default:
        return <Sparkles className="w-4 h-4" />;
    }
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

  return (
    <div
      ref={containerRef}
      id="360-panorama-viewer-modal"
      role="dialog"
      aria-modal="true"
      aria-label="360° Virtual Tour Viewer"
      className="fixed inset-0 z-[999] bg-black text-white flex flex-col justify-between select-none animate-in fade-in duration-200"
      onMouseUp={handleMouseUp}
    >
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

      {/* TOP BAR WITH TOUR ROOM SELECTOR & CONTROLS (admin/editing mode only) */}
      {!preferences.hideTopBar && (
      <div className="absolute top-0 left-0 right-0 z-30 px-4 py-2.5 bg-[var(--glass-bg)] border-b border-[var(--glass-border)] flex flex-wrap items-center justify-between gap-3 pointer-events-auto backdrop-blur-md">
        {/* LEFT: Floor Plan Navigator (logos are positioned separately at top corners) */}
        <div className="flex items-center gap-4">
          {/* Floor Plan Live Location Navigator */}
          {preferences.showFloorPlan && preferences.floorPlanImageUrl && (
            <div className="flex items-center gap-2.5">
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden border-2 border-[#3ECF8E] bg-[#09090B]">
                <img
                  src={preferences.floorPlanImageUrl}
                  alt="Floor Plan"
                  className="w-full h-full object-cover"
                />
                {/* Live location dot */}
                <div
                  className="absolute rounded-full bg-[#3ECF8E] shadow-[0_0_8px_rgba(62,207,142,0.8)] animate-pulse"
                  style={{
                    width: '10px',
                    height: '10px',
                    left: `${(yaw / 360) * 80 + 10}%`,
                    top: `${((pitch + 45) / 90) * 80 + 10}%`,
                  }}
                />
              </div>
              {/* Floor Plan Upload (admin only) */}
              {!preferences.hideTopBar && (
                <label className="cursor-pointer p-1 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#71717A] hover:text-white transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        updatePreferences({ floorPlanImageUrl: url });
                        showToast('Floor plan uploaded.', 'success');
                      }
                    }}
                  />
                  <ImageIcon className="w-3.5 h-3.5" />
                </label>
              )}
            </div>
          )}

          {/* ROOM NODE SELECTOR */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#18181B] border border-[#27272A] text-[#3ECF8E] text-[10px] font-mono font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
            <span>360° TOUR</span>
          </div>

          {/* ROOM SWITCHER DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setRoomDropdownOpen(!roomDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-mono text-white transition-colors cursor-pointer"
            >
              <DoorOpen className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-bold max-w-[200px] sm:max-w-[320px] truncate">
                {currentRoom.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#71717A]" />
            </button>

            {roomDropdownOpen && (
              <div
                className="absolute top-full left-0 mt-2 w-80 rounded-2xl bg-[#121215] border border-[#27272A] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 font-mono text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-2 py-1.5 text-[10px] text-[#71717A] uppercase font-bold tracking-wider border-b border-[#27272A] mb-1">
                  Tour Room Nodes ({TOUR_ROOMS.length})
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {TOUR_ROOMS.map((room) => {
                    const isSelected = room.id === currentRoom.id;
                    const hpCount = (roomHotspotsMap[room.id] || []).length;
                    return (
                      <button
                        key={room.id}
                        onClick={() => {
                          teleportToRoom(room.id);
                          setRoomDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl flex items-center gap-3 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#18181B] text-[#3ECF8E] border border-[#3ECF8E]/30 font-bold'
                            : 'hover:bg-[#18181B] text-zinc-300 hover:text-white'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-lg bg-cover bg-center shrink-0 border border-[#27272A]"
                          style={{ backgroundImage: `url(${room.thumbnailUrl})` }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs truncate">{room.name}</div>
                          <div className="text-[10px] text-[#71717A] truncate">
                            {hpCount} Hotspots · {room.subtitle}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: AUTHORING ACTIONS & TOOLS */}
        <div className="flex items-center gap-2">
          {/* ADD HOTSPOT BUTTON (KEY FEATURE) */}
          <button
            id="btn-add-hotspot-mode"
            onClick={() => {
              if (isAddMode) {
                setIsAddMode(false);
                showToast('Exited hotspot placement mode.', 'info');
              } else {
                setIsAddMode(true);
                setActiveHotspot(null);
                showToast('Click anywhere in the 360 scene to position your hotspot!', 'info');
              }
            }}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-lg ${
              isAddMode
                ? 'bg-amber-400 text-black ' + (reducedMotion ? '' : 'animate-pulse') + ' ring-2 ring-amber-300'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
            title="Place a new hotspot in 360 space (H)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddMode ? 'Placing... (Click Scene)' : 'Add Hotspot'}</span>
          </button>

          {/* HOTSPOT LIST DRAWER TOGGLE */}
          <button
            onClick={() => setHotspotDrawerOpen(!hotspotDrawerOpen)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              hotspotDrawerOpen
                ? 'bg-[#3ECF8E] text-black border-[#3ECF8E] font-bold'
                : 'bg-[#18181B] hover:bg-[#27272A] text-[#FAFAFA] border-[#27272A]'
            }`}
            title="Manage Room Hotspots"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hotspots</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-current font-bold">
              {currentHotspots.length}
            </span>
          </button>

          {/* TOGGLE VISIBILITY */}
          <button
            onClick={() => {
              setShowHotspots(!showHotspots);
              showToast(!showHotspots ? 'Hotspots visible.' : 'Hotspots hidden for clean tour view.', 'info');
            }}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              showHotspots
                ? 'bg-[#18181B] hover:bg-[#27272A] text-[#3ECF8E] border-[#27272A]'
                : 'bg-zinc-800 text-zinc-500 border-zinc-700'
            }`}
            title={showHotspots ? 'Hide Hotspots' : 'Show Hotspots'}
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* GYROSCOPE SIMULATOR */}
          <button
            onClick={() => {
              setGyroActive(!gyroActive);
              showToast(!gyroActive ? 'Gyroscope simulator enabled.' : 'Gyroscope disabled.', 'info');
            }}
            className={`p-1.5 rounded-xl border text-[10px] font-mono transition-colors cursor-pointer hidden md:flex items-center gap-1 ${
              gyroActive ? 'bg-[#3ECF8E] text-black border-[#3ECF8E]' : 'bg-[#18181B] hover:bg-[#27272A] text-[#FAFAFA] border-[#27272A]'
            }`}
            title="Toggle Gyroscope Mode"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>

          {/* ROOM NAVIGATION (back/forward/share/search) */}
          <div className="hidden sm:flex items-center bg-[#18181B] border border-[#27272A] rounded-xl p-0.5 gap-0.5">
            <button
              onClick={goBack}
              disabled={roomHistoryIndex <= 0}
              className="p-1 hover:text-white cursor-pointer text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous Room"
              title="Previous Room"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-[#3ECF8E] px-1 min-w-[28px] text-center" aria-label="Current scene">
              {TOUR_ROOMS.findIndex((r) => r.id === currentRoom.id) + 1}/{TOUR_ROOMS.length}
            </span>
            <button
              onClick={goForward}
              disabled={roomHistoryIndex >= roomHistory.length - 1}
              className="p-1 hover:text-white cursor-pointer text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next Room"
              title="Next Room"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleShare}
              className="p-1 hover:text-white cursor-pointer text-zinc-300"
              aria-label="Share Room Link"
              title="Share Room Link"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowSearch(true)}
              className="p-1 hover:text-white cursor-pointer text-zinc-300"
              aria-label="Search Rooms"
              title="Search Rooms"
            >
              <Search className="w-3.5 h-3.5" />
</button>
          </div>

          {/* PREFERENCES */}
          <div className="hidden sm:flex items-center bg-[#18181B] border border-[#27272A] rounded-xl p-0.5">
            <button
              onClick={() => setShowPreferences(true)}
              className="p-1 hover:text-white cursor-pointer text-zinc-300"
              aria-label="Preferences"
              title="Preferences"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ZOOM CONTROLS */}
          <div className="hidden sm:flex items-center bg-[#18181B] border border-[#27272A] rounded-xl p-0.5">
            <button
              onClick={() => setFov((prev) => Math.max(prev - 10, 45))}
              className="p-1 hover:text-white cursor-pointer text-zinc-300"
              aria-label="Zoom In"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setFov((prev) => Math.min(prev + 10, 100))}
              className="p-1 hover:text-white cursor-pointer text-zinc-300"
              aria-label="Zoom Out"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#FAFAFA] transition-colors cursor-pointer"
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={closePanorama}
            className="p-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer ml-1"
            aria-label="Exit 360 Viewer"
            title="Exit 360 Viewer (Esc)"
          >
            <X className="w-4 h-4" />
           </button>
         </div>
       </div>
             )}

      {/* CLIENT LOGO - Top Left (separate from nav bar) */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-2.5">
        {preferences.clientLogoUrl ? (
          <img
            src={preferences.clientLogoUrl}
            alt="Client Logo"
            className="h-10 w-auto object-contain drop-shadow-xl"
          />
        ) : (
          <div className="h-10 w-28 rounded-lg bg-[#18181B]/90 border border-[#27272A] flex items-center justify-center text-xs font-mono text-[#71717A] backdrop-blur-md">
            Client Logo
          </div>
        )}
        {/* Logo Upload (admin only) */}
        <label className="cursor-pointer p-1 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#71717A] hover:text-white transition-colors backdrop-blur-md">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const url = URL.createObjectURL(file);
                updatePreferences({ clientLogoUrl: url });
                showToast('Client logo uploaded.', 'success');
              }
            }}
          />
          <Upload className="w-3.5 h-3.5" />
        </label>
      </div>

      {/* VIZTR LOGO - Top Right (separate from nav bar) */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2.5">
        {preferences.viztrLogoUrl ? (
          <img
            src={preferences.viztrLogoUrl}
            alt="VizTR Logo"
            className="h-8 w-auto object-contain drop-shadow-xl"
          />
        ) : (
          <div className="h-8 w-20 rounded-lg bg-[#18181B]/90 border border-[#27272A] flex items-center justify-center text-xs font-mono font-bold text-[#3ECF8E] backdrop-blur-md">
            VIZTR
          </div>
        )}
        <label className="cursor-pointer p-1 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#71717A] hover:text-white transition-colors backdrop-blur-md">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const url = URL.createObjectURL(file);
                updatePreferences({ viztrLogoUrl: url });
                showToast('VizTR logo uploaded.', 'success');
              }
            }}
          />
          <Upload className="w-3.5 h-3.5" />
        </label>
      </div>

      {/* PLACEMENT MODE BANNER WHEN ADDING HOTSPOT */}
      {isAddMode && (
        <div className="absolute top-14 inset-x-0 z-40 flex justify-center pointer-events-none animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 rounded-2xl bg-amber-400 text-black border border-amber-300 shadow-2xl flex items-center gap-2.5 text-xs font-mono font-bold pointer-events-auto">
            <MapPin className="w-4 h-4 animate-bounce" />
            <span>Click anywhere in the 360 scene to position your hotspot</span>
            <button
              onClick={() => setIsAddMode(false)}
              className="ml-2 px-2 py-0.5 rounded-lg bg-black text-white text-[10px] hover:bg-zinc-800 cursor-pointer"
            >
              Cancel (Esc)
            </button>
          </div>
        </div>
      )}

      {/* 360 PANORAMIC CANVAS VIEWPORT */}
      <div
        ref={sphereViewportRef}
        className={`relative w-full h-full overflow-hidden ${
          isAddMode ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCanvasClick}
        style={{
          perspective: `${fov * 10}px`,
          touchAction: 'none',
        }}
      >
        {/* Equirectangular Projection Layer — rendered on the INSIDE of a
            sphere via Three.js (true 360° look-around). The flat CSS
            background-image was replaced because it showed the panorama as a
            looping flat image rather than a spherical scene. */}
        <div
          id="sphere-canvas-host"
          className="absolute inset-0"
          style={{ filter: 'contrast(1.05) brightness(0.98)' }}
        />

        {/* RENDERED INTERACTIVE HOTSPOTS */}
        {showHotspots &&
          currentHotspots.map((hp) => {
            // Spherical coordinate frustum projection
            let diff = (hp.xPercent - (yaw / 360) * 100) % 100;
            if (diff < -50) diff += 100;
            if (diff > 50) diff -= 100;

            const relativeX = 50 + diff * (fov / 360);
            const relativeY = Math.max(12, Math.min(88, hp.yPercent + pitch * 0.65));

            const isVisible = relativeX >= 5 && relativeX <= 95;
            if (!isVisible) return null;

            const colorStyle = getColorClasses(hp.color);
            const isPortal = hp.type === 'room_link';

            return (
              <div
                key={hp.id}
                style={{
                  position: 'absolute',
                  left: `${relativeX}%`,
                  top: `${relativeY}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="z-20 group pointer-events-auto"
              >
                {/* RADAR / BEACON PULSING RING */}
                <div className="relative flex items-center justify-center">
                  <span
                    className={`absolute -inset-2 rounded-full opacity-75 animate-ping ${colorStyle.bg}`}
                  />
                  <span
                    className={`absolute -inset-4 rounded-full opacity-30 ${colorStyle.bg}`}
                  />

                   {/* HOTSPOT TRIGGER BUTTON */}
                   <button
                     onMouseDown={(e) => e.stopPropagation()}
                     onClick={(e) => {
                       e.stopPropagation();
                       if (isAddMode) return;
                       setActiveHotspot(activeHotspot?.id === hp.id ? null : hp);
                     }}
                    className={`relative flex items-center justify-center p-3 rounded-full text-white transition-all transform hover:scale-125 shadow-2xl cursor-pointer ${
                      colorStyle.bg
                    } ${colorStyle.glow} ${
                      activeHotspot?.id === hp.id ? 'ring-4 ring-white scale-125' : ''
                    }`}
                    aria-label={`Hotspot: ${hp.title}`}
                  >
                    {getHotspotIcon(hp.icon, hp.type)}
                  </button>

                  {/* FLOATING HOVER PILL LABEL */}
                  <div className="absolute -bottom-8 whitespace-nowrap px-2.5 py-1 rounded-xl bg-black/90 backdrop-blur-md text-[11px] font-mono font-bold text-white border border-white/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl flex items-center gap-1.5">
                    {isPortal && <DoorOpen className="w-3 h-3 text-[#3ECF8E]" />}
                    <span>{hp.title}</span>
                    {isPortal && <span className="text-[9px] text-[#3ECF8E]">» Jump</span>}
                  </div>
                </div>
              </div>
            );
          })}

        {/* ACTIVE HOTSPOT SPECIFICATION / PORTAL CARD */}
        <AnimatePresence>
          {activeHotspot && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[92vw] p-5 rounded-3xl bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-2xl shadow-2xl font-mono pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* CARD HEADER */}
              <div className="flex items-start justify-between gap-3 border-b border-[#27272A] pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                        getColorClasses(activeHotspot.color).text
                      } ${getColorClasses(activeHotspot.color).border} bg-black/40`}
                    >
                      {activeHotspot.type === 'room_link'
                        ? '🚪 Room Portal Link'
                        : `📐 ${activeHotspot.category}`}
                    </span>
                    {activeHotspot.isCustom && (
                      <span className="text-[9px] font-mono text-[#3ECF8E] bg-[#3ECF8E]/10 px-1.5 py-0.2 rounded border border-[#3ECF8E]/30">
                        Custom User Hotspot
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white font-display">
                    {activeHotspot.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  {/* EDIT BUTTON */}
                  <button
                    onClick={() => handleEditHotspot(activeHotspot)}
                    className="p-1.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Edit Hotspot Parameters"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* DELETE BUTTON */}
                  <button
                    onClick={() => handleDeleteHotspot(activeHotspot.id)}
                    className="p-1.5 rounded-lg bg-[#18181B] hover:bg-rose-950 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete Hotspot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setActiveHotspot(null)}
                    className="p-1.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* CARD BODY DESCRIPTION */}
              <p className="text-xs text-zinc-300 leading-relaxed mt-3 font-sans">
                {activeHotspot.description}
              </p>

              {/* METADATA TECHNICAL SPECS */}
              {activeHotspot.specs && activeHotspot.specs.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#27272A] grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {activeHotspot.specs.map((s, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-[#09090B] border border-[#27272A] space-y-0.5">
                      <div className="text-[9px] text-[#71717A] uppercase">{s.label}</div>
                      <div className="text-[11px] font-bold text-white truncate">{s.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* TELEPORT ACTION BUTTON FOR ROOM LINK HOTSPOTS */}
              {activeHotspot.type === 'room_link' && (
                <button
                  onClick={() =>
                    teleportToRoom(
                      activeHotspot.targetRoomId || '',
                      activeHotspot.targetPanoramaUrl,
                      activeHotspot.targetRoomName,
                      activeHotspot.targetYaw
                    )
                  }
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg"
                >
                  <DoorOpen className="w-4 h-4" />
                  <span>Teleport to {activeHotspot.targetRoomName || 'Destination Room'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BOTTOM HUD - Three sections: left controls, center transport, right hotspots */}
      {preferences.showBottomControls && (
      <div className="absolute bottom-4 inset-x-4 z-30 flex flex-wrap items-end justify-between gap-3 pointer-events-none">
        {/* BOTTOM-LEFT: Orientation widget */}
        <div className="flex flex-wrap items-end gap-3 pointer-events-auto">
          {/* RADAR COMPASS WIDGET (Orientation - moved from old location) */}
           <div className="flex items-center gap-3 bg-[var(--glass-bg)] backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-[var(--glass-border)] pointer-events-auto">
            <div className="relative w-11 h-11 rounded-full border-2 border-rose-500/40 bg-zinc-900/80 flex items-center justify-center shrink-0">
              <span className="absolute top-0.5 text-[9px] font-bold text-rose-500">N</span>
              <div
                className="w-0.5 h-7 bg-gradient-to-t from-transparent via-rose-500 to-white rounded-full transition-transform duration-75"
                style={{ transform: `rotate(${yaw}deg)` }}
              />
            </div>
            <div className="text-left font-mono">
              <div className="text-[10px] font-bold text-white uppercase tracking-wider">
                Orientation
              </div>
              <div className="text-[10px] text-zinc-400">
                Yaw: {Math.round(yaw)}° · Pitch: {Math.round(pitch)}°
              </div>
            </div>
          </div>

          {/* REMAINING SETTINGS: Share, Search, Preferences, Hotspot Drawer (bottom-left) */}
          <div className="flex items-center gap-1.5 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-full p-1">
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Share Room Link"
              title="Share Room Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSearch(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Search Rooms"
              title="Search Rooms"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowPreferences(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Preferences"
              title="Preferences"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => setHotspotDrawerOpen(!hotspotDrawerOpen)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                hotspotDrawerOpen
                  ? 'bg-[#3ECF8E] text-black'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
              aria-label="Manage Room Hotspots"
              title="Manage Room Hotspots"
            >
              <Layers className="w-4 h-4" />
            </button>

            {/* SETTINGS MENU (Music, AI Assistant, Google Drive) */}
            <div className="relative">
              <button
                onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer settings-menu-trigger ${
                  settingsMenuOpen
                    ? 'bg-[#3ECF8E] text-black'
                    : 'text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
                aria-label="Settings Menu"
                title="Settings Menu"
              >
                <Settings className="w-4 h-4" />
              </button>

               {/* SETTINGS MENU DROPDOWN */}
          <AnimatePresence>
            {settingsMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                 className="absolute bottom-full right-0 mb-3 w-72 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl shadow-2xl p-3 font-mono text-xs z-50 settings-menu-dropdown backdrop-blur-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-[9px] text-[#71717A] uppercase font-bold tracking-wider mb-3">
                  Settings Menu
                </div>

                {/* MUSIC TOGGLE */}
                <div className="flex items-center justify-between py-2 border-b border-[#27272A]">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-[#3ECF8E]" />
                    <span className="text-xs text-white">Background Music</span>
                  </div>
                  <button
                    onClick={() => updatePreferences({ musicEnabled: !preferences.musicEnabled })}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      preferences.musicEnabled ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
                    }`}
                    role="switch"
                    aria-checked={preferences.musicEnabled}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${
                        preferences.musicEnabled ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                    {preferences.musicEnabled && preferences.backgroundMusicUrl && (
                      <audio
                        ref={audioRef}
                        src={preferences.backgroundMusicUrl}
                        autoPlay
                        loop
                        style={{ display: 'none' }}
                      />
                    )}
                  </button>
                </div>

                {/* MUSIC UPLOAD */}
                <div className="py-2 border-b border-[#27272A]">
                  <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Music</span>
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          updatePreferences({ backgroundMusicUrl: url, musicEnabled: true });
                          showToast('Background music uploaded.', 'success');
                        }
                      }}
                    />
                  </label>
                </div>

                {/* MUSIC VOLUME SLIDER */}
                <div className="py-2 border-b border-[#27272A]">
                  <div className="flex items-center gap-2 mb-1">
                    <Volume2 className="w-3.5 h-3.5 text-[#3ECF8E]" />
                    <span className="text-xs text-white">Music Volume: {Math.round(preferences.musicVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={preferences.musicVolume}
                    onChange={(e) => updatePreferences({ musicVolume: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-[#27272A] rounded-full appearance-none cursor-pointer accent-[#3ECF8E]"
                  />
                </div>

                {/* AI ASSISTANT AVATAR */}
                <div className="py-2 border-b border-[#27272A]">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-[#3ECF8E]" />
                    <span className="text-xs text-white">AI Assistant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {preferences.aiAssistantAvatarUrl ? (
                      <img
                        src={preferences.aiAssistantAvatarUrl}
                        alt="AI Assistant Avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center">
                        <Bot className="w-5 h-5 text-[#3ECF8E]" />
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="flex items-center gap-1 text-xs text-white cursor-pointer mb-1">
                        <Upload className="w-3 h-3" />
                        <span>Upload Avatar</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = URL.createObjectURL(file);
                              updatePreferences({ aiAssistantAvatarUrl: url });
                              showToast('AI assistant avatar updated.', 'success');
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <button
                    onClick={() => updatePreferences({ aiAssistantEnabled: !preferences.aiAssistantEnabled })}
                    className={`w-full mt-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      preferences.aiAssistantEnabled
                        ? 'bg-[#3ECF8E] text-black font-bold'
                        : 'bg-[#18181B] text-[#A1A1AA] hover:bg-[#27272A] hover:text-white'
                    }`}
                  >
                    {preferences.aiAssistantEnabled ? 'Assistant On' : 'Assistant Off'}
                  </button>
                </div>

                {/* GOOGLE DRIVE SECTION */}
                <div className="py-2">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setShowGoogleDrivePanel(!showGoogleDrivePanel)}
                  >
                    <div className="flex items-center gap-2 text-xs text-white">
                      <Globe className="w-4 h-4 text-[#3ECF8E]" />
                      <span>Google Drive Images</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-[#71717A] transition-transform ${showGoogleDrivePanel ? 'rotate-180' : ''}`} />
                  </div>

                  <AnimatePresence>
                    {showGoogleDrivePanel && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 space-y-2 overflow-hidden"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Folder ID"
                            value={preferences.googleDriveFolderId}
                            onChange={(e) => updatePreferences({ googleDriveFolderId: e.target.value })}
                            className="flex-1 px-2 py-1 rounded bg-[#09090B] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#3ECF8E]"
                          />
                          <button
                            onClick={() => {
                              updatePreferences({ showGoogleDriveSection: !preferences.showGoogleDriveSection });
                            }}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                              preferences.showGoogleDriveSection
                                ? 'bg-[#3ECF8E] text-black'
                                : 'bg-[#18181B] text-[#A1A1AA] hover:text-white'
                            }`}
                          >
                            {preferences.showGoogleDriveSection ? 'Hide' : 'Load'}
                          </button>
                        </div>
                        {preferences.showGoogleDriveSection && preferences.googleDriveFolderId && (
                          <div className="text-[9px] text-[#71717A]">
                            Google Drive folder: {preferences.googleDriveFolderId}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Arrow */}
                <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#121215]" />
              </motion.div>
            )}
           </AnimatePresence>
        </div>
        </div>
      </div>

        {/* BOTTOM-CENTER: Glassmorphisim circular transport buttons */}
        <div
          className="pointer-events-auto"
          onMouseEnter={() => {
            setShowBottomControls(true);
            setBottomControlsVisible(true);
            if (bottomControlsTimeoutRef.current) clearTimeout(bottomControlsTimeoutRef.current);
          }}
          onMouseLeave={() => {
            if (preferences.showBottomControlsOnHover) {
              bottomControlsTimeoutRef.current = setTimeout(() => {
                setBottomControlsVisible(false);
              }, 1500);
            }
          }}
        >
          <div
             className={`flex items-center gap-2 sm:gap-3 px-3 py-2 rounded-full transition-all duration-500 ${
               bottomControlsVisible
                 ? 'opacity-100 translate-y-0'
                 : 'opacity-0 translate-y-4 pointer-events-none'
             } bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-xl shadow-2xl`}
          >
            {/* PLAY / PAUSE */}
            <button
              onClick={() => {
                setIsPlaying((prev) => {
                  const next = !prev;
                  updatePreferences({ autoRotate: next });
                  return next;
                });
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isPlaying
                  ? 'bg-[#3ECF8E] text-black hover:bg-[#34b27b] scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              aria-label={isPlaying ? 'Pause auto-rotate' : 'Play auto-rotate'}
              title={isPlaying ? 'Pause Auto-Rotate' : 'Play Auto-Rotate'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* PREVIOUS ROOM */}
            <button
              onClick={goBack}
              disabled={roomHistoryIndex <= 0}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
              aria-label="Previous Room"
              title="Previous Room"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* SCENE COUNTER */}
            {preferences.showSceneCounter && (
              <div className="px-2 py-0.5 text-[10px] font-mono text-[#3ECF8E] bg-black/40 rounded-full">
                {TOUR_ROOMS.findIndex((r) => r.id === currentRoom.id) + 1}/{TOUR_ROOMS.length}
              </div>
            )}

            {/* NEXT ROOM */}
            <button
              onClick={goForward}
              disabled={roomHistoryIndex >= roomHistory.length - 1}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
              aria-label="Next Room"
              title="Next Room"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BOTTOM-RIGHT: Hotspot button + zoom + fullscreen */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* HOTSPOT LIST BUTTON (bottom-right, opens with image previews) */}
          {preferences.showHotspotButton && (
            <div className="relative">
              <button
                onClick={() => setShowHotspotListPanel(!showHotspotListPanel)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  showHotspotListPanel
                    ? 'bg-[#3ECF8E] text-black scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }} border border-white/10 backdrop-blur-xl shadow-xl`}
                aria-label="Toggle Hotspot List"
                title="Hotspot List"
              >
                <Layers className="w-5 h-5" />
                {currentHotspots.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-[9px] font-bold flex items-center justify-center">
                    {currentHotspots.length}
                  </span>
                )}
              </button>

              {/* HOTSPOT LIST POPOVER (bottom-right, image previews) */}
              <AnimatePresence>
                {showHotspotListPanel && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="absolute bottom-full right-0 mb-3 w-64 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl shadow-2xl p-3 font-mono text-xs z-50 backdrop-blur-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-[9px] text-[#71717A] uppercase font-bold tracking-wider mb-2">
                      {currentRoom.name} Hotspots ({currentHotspots.length})
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {currentHotspots.length === 0 ? (
                        <div className="text-[10px] text-[#71717A] py-4 text-center">
                          No hotspots in this room.
                        </div>
                      ) : (
                        currentHotspots.map((hp) => {
                          const colorStyle = getColorClasses(hp.color);
                          return (
                            <div
                              key={hp.id}
                              className="flex items-center gap-2.5 p-2 rounded-xl bg-[#09090B] border border-[#27272A] hover:border-[#3ECF8E]/30 transition-all"
                            >
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorStyle.bg} text-white`}
                              >
                                {getHotspotIcon(hp.icon, hp.type)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-white truncate">{hp.title}</div>
                                <div className="text-[9px] text-[#71717A] truncate">
                                  {hp.type === 'room_link' ? 'Room Link' : hp.category}
                                </div>
                              </div>
                              <div className="text-[9px] text-[#71717A]">
                                X:{Math.round(hp.xPercent)}% Y:{Math.round(hp.yPercent)}%
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#121215]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ZOOM CONTROLS (bottom-right) */}
          {preferences.showZoomControls && (
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-0.5">
              <button
                onClick={() => setFov((prev) => Math.max(prev - (preferences.scrollZoomStep || 10), 40))}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/15 transition-colors cursor-pointer"
                aria-label="Zoom In"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="text-[9px] font-mono text-[#3ECF8E] w-12 text-center">{Math.round(fov)}°</span>
              <button
                onClick={() => setFov((prev) => Math.min(prev + (preferences.scrollZoomStep || 10), 100))}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/15 transition-colors cursor-pointer"
                aria-label="Zoom Out"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* FULLSCREEN */}
          <button
            onClick={toggleFullscreen}
             className="w-full h-full rounded-full flex items-center justify-center bg-[var(--glass-bg)] hover:bg-white/20 border border-[var(--glass-border)] text-white backdrop-blur-xl transition-colors cursor-pointer"
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* CLOSE */}
          <button
            onClick={closePanorama}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer"
            aria-label="Exit 360 Viewer"
            title="Exit 360 Viewer (Esc)"
          >
            <X className="w-4 h-4" />
           </button>
        </div>
      </div>
      )}

       {/* HOTSPOT LIST DRAWER (SLIDE-OVER PANEL) */}
      <AnimatePresence>
        {hotspotDrawerOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
             className="absolute top-0 right-0 bottom-0 w-full sm:w-96 bg-[var(--glass-bg)] border-l border-[var(--glass-border)] z-40 p-5 flex flex-col justify-between font-mono shadow-2xl pointer-events-auto overflow-y-auto backdrop-blur-xl"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#3ECF8E]" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Room Hotspots ({currentHotspots.length})
                  </h3>
                </div>
                <button
                  onClick={() => setHotspotDrawerOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#18181B]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* QUICK ADD BUTTON INSIDE DRAWER */}
              <button
                onClick={() => {
                  setHotspotDrawerOpen(false);
                  setIsAddMode(true);
                  showToast('Click anywhere in the 360 scene to drop your hotspot!', 'info');
                }}
                className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Hotspot to This Room</span>
              </button>

              {/* LIST OF HOTSPOTS */}
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {currentHotspots.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500 text-xs">
                    No hotspots placed yet in this space. Click &quot;Add Hotspot&quot; to create one.
                  </div>
                ) : (
                  currentHotspots.map((hp) => {
                    const colorStyle = getColorClasses(hp.color);
                    return (
                      <div
                        key={hp.id}
                        className="p-3 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-white/20 transition-all space-y-2 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${colorStyle.bg} text-white`}
                            >
                              {getHotspotIcon(hp.icon, hp.type)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-white truncate">
                                {hp.title}
                              </h4>
                              <div className="text-[10px] text-[#71717A] uppercase">
                                {hp.type === 'room_link' ? 'Room Link' : hp.category}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => focusOnHotspot(hp)}
                              className="p-1 rounded bg-[#09090B] hover:bg-[#27272A] text-zinc-300 hover:text-white text-[10px] flex items-center gap-1 cursor-pointer"
                              title="Look at this hotspot in 360 view"
                            >
                              <Eye className="w-3 h-3 text-[#3ECF8E]" />
                              <span>Look</span>
                            </button>

                            <button
                              onClick={() => handleEditHotspot(hp)}
                              className="p-1 rounded bg-[#09090B] hover:bg-[#27272A] text-zinc-400 hover:text-white cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>

                            <button
                              onClick={() => handleDeleteHotspot(hp.id)}
                              className="p-1 rounded bg-[#09090B] hover:bg-rose-950 text-zinc-400 hover:text-rose-400 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] text-zinc-400 line-clamp-2 font-sans">
                          {hp.description}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* DRAWER FOOTER / TOUR ACTIONS */}
            <div className="pt-4 border-t border-[#27272A] space-y-2">
              <button
                onClick={handleExportTour}
                className="w-full py-1.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-[#3ECF8E]" />
                <span>Export Tour Config JSON</span>
              </button>

              <button
                onClick={handleResetTour}
                className="w-full py-1.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs text-[#71717A] hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default Scene Hotspots</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONFIGURE 360 HOTSPOT MODAL */}
      <AnimatePresence>
        {configModalOpen && (
          <div
            id="configure-hotspot-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono animate-in fade-in duration-150"
            onClick={() => setConfigModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
               className="w-full max-w-xl rounded-3xl bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto backdrop-blur-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-display">
                      {editingHotspotId ? 'Edit 360 Hotspot' : 'Configure Spatial Hotspot'}
                    </h3>
                    <p className="text-[10px] text-[#71717A]">
                      Coords: X: {placingCoords?.xPercent}% · Y: {placingCoords?.yPercent}% in {currentRoom.name}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setConfigModalOpen(false)}
                  className="p-1.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] text-[#71717A] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* FORM CONTENT */}
              <form onSubmit={handleSaveHotspot} className="space-y-4 text-xs">
                {/* HOTSPOT TYPE SELECTOR */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">
                    Hotspot Interaction Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormType('metadata')}
                      className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                        formType === 'metadata'
                          ? 'bg-[#18181B] border-[#3ECF8E] text-white font-bold'
                          : 'bg-[#09090B] border-[#27272A] text-[#71717A] hover:text-white'
                      }`}
                    >
                      <Info className="w-4 h-4 text-[#3ECF8E]" />
                      <div className="text-left">
                        <div className="text-xs">Metadata & Specs</div>
                        <div className="text-[9px] text-[#71717A] font-normal">
                          PBR material / furniture info popup
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormType('room_link')}
                      className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                        formType === 'room_link'
                          ? 'bg-[#18181B] border-rose-500 text-white font-bold'
                          : 'bg-[#09090B] border-[#27272A] text-[#71717A] hover:text-white'
                      }`}
                    >
                      <DoorOpen className="w-4 h-4 text-rose-400" />
                      <div className="text-left">
                        <div className="text-xs">Link to Room (Portal)</div>
                        <div className="text-[9px] text-[#71717A] font-normal">
                          Teleport jump to another 360 space
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* TITLE */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">
                    Hotspot Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder={
                      formType === 'room_link'
                        ? 'e.g., Proceed to Cantilever Terrace'
                        : 'e.g., Bookmatched Calacatta Gold Marble'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-white text-xs placeholder:text-[#71717A] focus:border-[#3ECF8E] outline-none"
                  />
                </div>

                {/* IF METADATA: CATEGORY & ICON & SPECS */}
                {formType === 'metadata' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">
                          Category Classification
                        </label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value as HotspotCategory)}
                          className="w-full px-3 py-2 rounded-xl bg-[#09090B] border border-[#27272A] text-white text-xs outline-none cursor-pointer"
                        >
                          <option value="material">Material (PBR Texture)</option>
                          <option value="furniture">Furniture & FF&E</option>
                          <option value="spatial">Spatial Architecture</option>
                          <option value="lighting">Lighting & Lumens</option>
                          <option value="acoustic">Acoustic Spec</option>
                          <option value="custom">Custom Annotation</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">
                          Icon Symbol
                        </label>
                        <select
                          value={formIcon}
                          onChange={(e) => setFormIcon(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#09090B] border border-[#27272A] text-white text-xs outline-none cursor-pointer"
                        >
                          <option value="sparkles">Sparkles / Hero</option>
                          <option value="palette">Palette / Texture</option>
                          <option value="box">Box / 3D Asset</option>
                          <option value="layers">Layers / Glazing</option>
                          <option value="eye">Eye / Detail</option>
                          <option value="flame">Flame / Fireplace</option>
                          <option value="tag">Tag / Specification</option>
                          <option value="acoustic">Audio / Acoustic</option>
                        </select>
                      </div>
                    </div>

                    {/* SPECS KEY-VALUE PAIRS */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">
                          Technical Specs (Key/Value)
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormSpecs([...formSpecs, { label: '', value: '' }])}
                          className="text-[10px] text-[#3ECF8E] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Spec Field</span>
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {formSpecs.map((spec, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={spec.label}
                              onChange={(e) => {
                                const updated = [...formSpecs];
                                updated[idx].label = e.target.value;
                                setFormSpecs(updated);
                              }}
                              placeholder="Spec Label (e.g. Origin)"
                              className="w-1/3 px-2.5 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-white text-[11px] placeholder:text-[#71717A] outline-none"
                            />
                            <input
                              type="text"
                              value={spec.value}
                              onChange={(e) => {
                                const updated = [...formSpecs];
                                updated[idx].value = e.target.value;
                                setFormSpecs(updated);
                              }}
                              placeholder="Spec Value (e.g. Carrara, Italy)"
                              className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-white text-[11px] placeholder:text-[#71717A] outline-none"
                            />
                            {formSpecs.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setFormSpecs(formSpecs.filter((_, i) => i !== idx))}
                                className="p-1 rounded text-zinc-500 hover:text-rose-400"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* IF ROOM LINK: TARGET ROOM SELECTION */}
                {formType === 'room_link' && (
                  <div className="space-y-3 p-3.5 rounded-2xl bg-[#09090B] border border-[#27272A]">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">
                        Destination Room
                      </label>
                      <select
                        value={formTargetRoomId}
                        onChange={(e) => setFormTargetRoomId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-white text-xs outline-none cursor-pointer"
                      >
                        {TOUR_ROOMS.map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.name} ({room.subtitle})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="pt-2 border-t border-[#27272A] space-y-1.5">
                      <div className="text-[10px] text-[#71717A]">Or Link to Custom 360 Panorama URL:</div>
                      <input
                        type="url"
                        value={formCustomPanoramaUrl}
                        onChange={(e) => setFormCustomPanoramaUrl(e.target.value)}
                        placeholder="https://... (Equirectangular 360 JPG/PNG)"
                        className="w-full px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-white text-xs placeholder:text-[#71717A] outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* DESCRIPTION */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">
                    Detailed Annotation / Description
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Provide architectural rationale, material finish notes, or navigation guidance..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#09090B] border border-[#27272A] text-white text-xs placeholder:text-[#71717A] outline-none resize-none font-sans"
                  />
                </div>

                {/* COLOR PALETTE SELECTION */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">
                    Hotspot Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    {(['rose', 'emerald', 'cyan', 'amber', 'violet', 'blue'] as HotspotColor[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormColor(c)}
                        className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                          getColorClasses(c).bg
                        } ${formColor === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
                      >
                        {formColor === c && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* MODAL FOOTER ACTIONS */}
                <div className="pt-4 border-t border-[#27272A] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfigModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-zinc-300 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingHotspotId ? 'Save Changes' : 'Place Hotspot'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SHARE DIALOG */}
      <AnimatePresence>
        {showShareDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowShareDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
               className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl backdrop-blur-xl"
               onClick={(e) => e.stopPropagation()}
             >
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                   <Share2 className="w-5 h-5 text-[#3ECF8E]" />
                   Share This Room
                </h3>
                <button
                  onClick={() => setShowShareDialog(false)}
                  className="p-1.5 rounded-lg hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-[#A1A1AA] mb-4">
                Share <span className="text-[#3ECF8E] font-medium">{currentRoom.name}</span> with others. The link includes the exact room and view.
              </p>

              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  readOnly
                  value={getShareUrl()}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs text-white font-mono focus:outline-none focus:border-[#3ECF8E]"
                />
                <button
                  onClick={handleCopyShareUrl}
                  className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors shrink-0 ${
                    shareCopied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#3ECF8E] hover:bg-[#34b27b] text-black'
                  }`}
                >
                  {shareCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-[#71717A] font-mono">
                <Compass className="w-3 h-3" />
                <span>{currentRoom.subtitle}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TUTORIAL / ONBOARDING OVERLAY */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl text-center"
            >
              {tutorialStep === 0 && (
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#3ECF8E]/20 text-[#3ECF8E] flex items-center justify-center mx-auto">
                    <Compass className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-white">Welcome to the Virtual Tour</h3>
                  <p className="text-sm text-[#A1A1AA]">
                    Explore this architectural masterpiece in full 360°. Navigate between rooms, discover materials, and experience every detail.
                  </p>
                </div>
              )}
              {tutorialStep === 1 && (
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                    <Navigation className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-white">Navigation</h3>
                  <p className="text-sm text-[#A1A1AA]">
                    Click and drag to look around. Use arrow keys or click portal hotspots to move between rooms. Press <kbd className="px-1.5 py-0.5 rounded bg-[#27272A] text-white text-xs">H</kbd> to add your own hotspots.
                  </p>
                </div>
              )}
              {tutorialStep === 2 && (
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-white">Discover Details</h3>
                  <p className="text-sm text-[#A1A1AA]">
                    Click on glowing hotspots to learn about materials, finishes, and architectural features. Each hotspot reveals detailed specifications.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between mt-6">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((step) => (
                    <div
                      key={step}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        step === tutorialStep ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  {tutorialStep > 0 && (
                    <button
                      onClick={() => setTutorialStep((prev) => prev - 1)}
                      className="px-4 py-2 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Back
                    </button>
                  )}
                  {tutorialStep < 2 ? (
                    <button
                      onClick={() => setTutorialStep((prev) => prev + 1)}
                      className="px-4 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowTutorial(false);
                        localStorage.setItem('viztr-tutorial-seen', 'true');
                      }}
                      className="px-4 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Start Tour
                    </button>
                  )}
                </div>
              </div>

              {tutorialStep < 2 && (
                <button
                  onClick={() => {
                    setShowTutorial(false);
                    localStorage.setItem('viztr-tutorial-seen', 'true');
                  }}
                  className="mt-3 text-[10px] text-[#71717A] hover:text-white transition-colors font-mono"
                >
                  Skip tutorial
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEARCH PANEL */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-20"
            onClick={() => setShowSearch(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -10 }}
               className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-4 max-w-lg w-full mx-4 shadow-2xl max-h-[70vh] overflow-hidden flex flex-col backdrop-blur-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
                  <input
                    type="text"
                    placeholder="Search rooms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-sm text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
                  />
                </div>
                <button
                  onClick={() => setShowSearch(false)}
                  className="p-2 rounded-xl hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 space-y-2">
                {TOUR_ROOMS.filter((room) =>
                  room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  room.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((room) => (
                  <button
                    key={room.id}
                    onClick={() => {
                      navigateToRoomWithHistory(room);
                      setShowSearch(false);
                      setSearchQuery('');
                    }}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors text-left ${
                      room.id === currentRoom.id
                        ? 'bg-[#3ECF8E]/20 border border-[#3ECF8E]'
                        : 'bg-[#09090B] border border-[#27272A] hover:border-[#3ECF8E]/50'
                    }`}
                  >
                    <img
                      src={room.thumbnailUrl}
                      alt={room.name}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-white truncate">{room.name}</div>
                      <div className="text-[10px] text-[#71717A] truncate">{room.subtitle}</div>
                    </div>
                    {room.id === currentRoom.id && (
                      <span className="text-[9px] font-mono text-[#3ECF8E] uppercase tracking-wider shrink-0">Current</span>
                    )}
                  </button>
                ))}
                {TOUR_ROOMS.filter((room) =>
                  room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  room.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-8 text-[#71717A] text-xs">
                    No rooms found matching "{searchQuery}"
                  </div>
                )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

          {/* PREFERENCES PANEL */}
          <AnimatePresence>
            {showPreferences && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                onClick={() => setShowPreferences(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: -10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: -10 }}
                   className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden backdrop-blur-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                      <Settings className="w-5 h-5 text-[#3ECF8E]" />
                      Preferences
                    </h3>
                    <button
                      onClick={() => setShowPreferences(false)}
                      className="p-1.5 rounded-lg hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
                  {/* Motion Intensity */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white">Motion Intensity</label>
                    <div className="flex gap-2">
                      {(['off', 'low', 'high'] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => updatePreferences({ motionIntensity: level })}
                          className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${preferences.motionIntensity === level
                            ? 'bg-[#3ECF8E] text-black font-bold'
                            : 'bg-[#27272A] text-[#A1A1AA] hover:bg-[#3F3F46] hover:text-white'
                          }`}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Auto Rotate Speed */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white">Auto Rotate Speed</label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={preferences.autoRotateSpeed}
                      onChange={(e) => updatePreferences({ autoRotateSpeed: parseInt(e.target.value) })}
                      className="w-full h-2 bg-[#27272A] rounded-full appearance-none cursor-pointer accent-[#3ECF8E]"
                    />
                    <div className="flex justify-between text-[10px] text-[#71717A] font-mono">
                      <span>Off</span>
                      <span>{preferences.autoRotateSpeed}x</span>
                      <span>Max</span>
                    </div>
                  </div>

                  {/* Default Zoom */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white">Default Zoom</label>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={preferences.defaultZoom}
                      onChange={(e) => updatePreferences({ defaultZoom: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-[#27272A] rounded-full appearance-none cursor-pointer accent-[#3ECF8E]"
                    />
                    <div className="flex justify-between text-[10px] text-[#71717A] font-mono">
                      <span>0.5x</span>
                      <span>{preferences.defaultZoom.toFixed(1)}x</span>
                      <span>3x</span>
                    </div>
                  </div>

                  {/* Theme */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white">Theme</label>
                    <div className="flex gap-2">
                      {(['dark', 'light', 'system'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => updatePreferences({ theme: t })}
                          className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${preferences.theme === t
                            ? 'bg-[#3ECF8E] text-black font-bold'
                            : 'bg-[#27272A] text-[#A1A1AA] hover:bg-[#3F3F46] hover:text-white'
                          }`}
                        >
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                    {/* Show Hotspots */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-white">Show Hotspots</label>
                      <button
                        onClick={() => updatePreferences({ showHotspots: !preferences.showHotspots })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          preferences.showHotspots ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
                        }`}
                        role="switch"
                        aria-checked={preferences.showHotspots}
                      >
                        <span
                          className={`absolute top-0.5 transition-transform duration-200 ${
                            preferences.showHotspots ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-white shadow-md" />
                        </span>
                      </button>
                    </div>

                    {/* Gyroscope */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-white">Gyroscope</label>
                      <button
                        onClick={() => updatePreferences({ gyroscopeEnabled: !preferences.gyroscopeEnabled })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          preferences.gyroscopeEnabled ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
                        }`}
                        role="switch"
                        aria-checked={preferences.gyroscopeEnabled}
                      >
                        <span
                          className={`absolute top-0.5 transition-transform duration-200 ${
                            preferences.gyroscopeEnabled ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-white shadow-md" />
                        </span>
                      </button>
                    </div>

                    {/* Language */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-white">Language</label>
                      <select
                        value={preferences.language}
                        onChange={(e) => updatePreferences({ language: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#09090B] border border-[#27272A] text-sm text-white focus:outline-none focus:border-[#3ECF8E]"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="zh">中文</option>
                        <option value="ja">日本語</option>
                      </select>
                    </div>

                    {/* LAYOUT SETTINGS SECTION */}
                    <div className="pt-4 border-t border-[#27272A] space-y-4">
                      <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                        Layout & UI
                      </h4>

                      {/* Hide Top Bar */}
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-white">Hide Top Bar (Public)</label>
                        <button
                          onClick={() => updatePreferences({ hideTopBar: !preferences.hideTopBar })}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            preferences.hideTopBar ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
                          }`}
                          role="switch"
                          aria-checked={preferences.hideTopBar}
                        >
                          <span
                            className={`absolute top-0.5 transition-transform duration-200 ${
                              preferences.hideTopBar ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full bg-white shadow-md" />
                          </span>
                        </button>
                      </div>

                      {/* Show Bottom Controls */}
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-white">Show Bottom Controls</label>
                        <button
                          onClick={() => updatePreferences({ showBottomControls: !preferences.showBottomControls })}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            preferences.showBottomControls ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
                          }`}
                          role="switch"
                          aria-checked={preferences.showBottomControls}
                        >
                          <span
                            className={`absolute top-0.5 transition-transform duration-200 ${
                              preferences.showBottomControls ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full bg-white shadow-md" />
                          </span>
                        </button>
                      </div>

                      {/* Show Bottom Controls On Hover */}
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-white">Auto-hide on Hover</label>
                        <button
                          onClick={() => updatePreferences({ showBottomControlsOnHover: !preferences.showBottomControlsOnHover })}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            preferences.showBottomControlsOnHover ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
                          }`}
                          role="switch"
                          aria-checked={preferences.showBottomControlsOnHover}
                        >
                          <span
                            className={`absolute top-0.5 transition-transform duration-200 ${
                              preferences.showBottomControlsOnHover ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full bg-white shadow-md" />
                          </span>
                        </button>
                      </div>

                      {/* Show Hotspot Button */}
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-white">Show Hotspot Button</label>
                        <button
                          onClick={() => updatePreferences({ showHotspotButton: !preferences.showHotspotButton })}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            preferences.showHotspotButton ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
                          }`}
                          role="switch"
                          aria-checked={preferences.showHotspotButton}
                        >
                          <span
                            className={`absolute top-0.5 transition-transform duration-200 ${
                              preferences.showHotspotButton ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full bg-white shadow-md" />
                          </span>
                        </button>
                      </div>

                      {/* Show Zoom Controls */}
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-white">Show Zoom Controls</label>
                        <button
                          onClick={() => updatePreferences({ showZoomControls: !preferences.showZoomControls })}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            preferences.showZoomControls ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
                          }`}
                          role="switch"
                          aria-checked={preferences.showZoomControls}
                        >
                          <span
                            className={`absolute top-0.5 transition-transform duration-200 ${
                              preferences.showZoomControls ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full bg-white shadow-md" />
                          </span>
                        </button>
                      </div>

                      {/* Show Scene Counter */}
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-white">Show Scene Counter</label>
                        <button
                          onClick={() => updatePreferences({ showSceneCounter: !preferences.showSceneCounter })}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            preferences.showSceneCounter ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
                          }`}
                          role="switch"
                          aria-checked={preferences.showSceneCounter}
                        >
                          <span
                            className={`absolute top-0.5 transition-transform duration-200 ${
                              preferences.showSceneCounter ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full bg-white shadow-md" />
                          </span>
                        </button>
                      </div>

                      {/* CTRL Axis Rotation */}
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-white">Ctrl + Arrow Axis Rotation</label>
                        <button
                          onClick={() => updatePreferences({ ctrlAxisRotationEnabled: !preferences.ctrlAxisRotationEnabled })}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            preferences.ctrlAxisRotationEnabled ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
                          }`}
                          role="switch"
                          aria-checked={preferences.ctrlAxisRotationEnabled}
                        >
                          <span
                            className={`absolute top-0.5 transition-transform duration-200 ${
                              preferences.ctrlAxisRotationEnabled ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full bg-white shadow-md" />
                          </span>
                        </button>
                      </div>

                      {/* CTRL Axis Rotation Step */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">
                          Ctrl Rotation Step: {preferences.ctrlAxisRotationStep}°
                        </label>
                        <input
                          type="range"
                          min="5"
                          max="30"
                          step="1"
                          value={preferences.ctrlAxisRotationStep}
                          onChange={(e) => updatePreferences({ ctrlAxisRotationStep: parseInt(e.target.value) })}
                          className="w-full h-2 bg-[#27272A] rounded-full appearance-none cursor-pointer accent-[#3ECF8E]"
                        />
                      </div>

                      {/* Scroll Zoom */}
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-white">Mouse Scroll Zoom</label>
                        <button
                          onClick={() => updatePreferences({ scrollZoomEnabled: !preferences.scrollZoomEnabled })}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            preferences.scrollZoomEnabled ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
                          }`}
                          role="switch"
                          aria-checked={preferences.scrollZoomEnabled}
                        >
                          <span
                            className={`absolute top-0.5 transition-transform duration-200 ${
                              preferences.scrollZoomEnabled ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full bg-white shadow-md" />
                          </span>
                        </button>
                      </div>

                      {/* Scroll Zoom Step */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">
                          Scroll Zoom Step: {preferences.scrollZoomStep}°
                        </label>
                        <input
                          type="range"
                          min="5"
                          max="20"
                          step="1"
                          value={preferences.scrollZoomStep}
                          onChange={(e) => updatePreferences({ scrollZoomStep: parseInt(e.target.value) })}
                          className="w-full h-2 bg-[#27272A] rounded-full appearance-none cursor-pointer accent-[#3ECF8E]"
                         />
                      </div>
                      </div>

                    {/* BRANDING & ASSETS SECTION */}
                    <div className="pt-4 border-t border-[#27272A] space-y-4">
                      <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                        Branding & Assets
                      </h4>

                      {/* Client Logo Upload */}
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-white">Client Logo</label>
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer p-1 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#71717A] hover:text-white transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = URL.createObjectURL(file);
                                  updatePreferences({ clientLogoUrl: url });
                                  showToast('Client logo uploaded.', 'success');
                                }
                              }}
                            />
                            <Upload className="w-3.5 h-3.5" />
                          </label>
                          {preferences.clientLogoUrl && (
                            <span className="text-[9px] text-[#3ECF8E]">✓</span>
                          )}
                        </div>
                      </div>

                      {/* VizTR Logo Upload */}
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-white">VizTR Logo</label>
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer p-1 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#71717A] hover:text-white transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = URL.createObjectURL(file);
                                  updatePreferences({ viztrLogoUrl: url });
                                  showToast('VizTR logo uploaded.', 'success');
                                }
                              }}
                            />
                            <Upload className="w-3.5 h-3.5" />
                          </label>
                          {preferences.viztrLogoUrl && (
                            <span className="text-[9px] text-[#3ECF8E]">✓</span>
                          )}
                        </div>
                      </div>

                      {/* Floor Plan Upload */}
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-white">Floor Plan</label>
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer p-1 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#71717A] hover:text-white transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = URL.createObjectURL(file);
                                  updatePreferences({ floorPlanImageUrl: url });
                                  showToast('Floor plan uploaded.', 'success');
                                }
                              }}
                            />
                            <ImageIcon className="w-3.5 h-3.5" />
                          </label>
                          {preferences.floorPlanImageUrl && (
                            <span className="text-[9px] text-[#3ECF8E]">✓</span>
                          )}
                        </div>
                      </div>

                      {/* Show Floor Plan Toggle */}
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-white">Show Floor Plan Navigator</label>
                        <button
                          onClick={() => updatePreferences({ showFloorPlan: !preferences.showFloorPlan })}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            preferences.showFloorPlan ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
                          }`}
                          role="switch"
                          aria-checked={preferences.showFloorPlan}
                        >
                          <span
                            className={`absolute top-0.5 transition-transform duration-200 ${
                              preferences.showFloorPlan ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full bg-white shadow-md" />
                          </span>
                        </button>
                      </div>

                      {/* MUSIC TOGGLE */}
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-white">Background Music</label>
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer p-1 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#71717A] hover:text-white transition-colors">
                            <input
                              type="file"
                              accept="audio/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = URL.createObjectURL(file);
                                  updatePreferences({ backgroundMusicUrl: url, musicEnabled: true });
                                  showToast('Background music uploaded.', 'success');
                                }
                              }}
                            />
                            <Upload className="w-3.5 h-3.5" />
                          </label>
                          <button
                            onClick={() => updatePreferences({ musicEnabled: !preferences.musicEnabled })}
                            className={`relative w-8 h-4 rounded-full transition-colors ${
                              preferences.musicEnabled ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
                            }`}
                            role="switch"
                            aria-checked={preferences.musicEnabled}
                          >
                            <span
                              className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-md transition-transform duration-200 ${
                                preferences.musicEnabled ? 'translate-x-4' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Music Volume */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">
                          Music Volume: {Math.round(preferences.musicVolume * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={preferences.musicVolume}
                          onChange={(e) => updatePreferences({ musicVolume: parseFloat(e.target.value) })}
                          className="w-full h-1.5 bg-[#27272A] rounded-full appearance-none cursor-pointer accent-[#3ECF8E]"
                        />
                      </div>

                      {/* AI Assistant Avatar + Toggle */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer p-1 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#71717A] hover:text-white transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = URL.createObjectURL(file);
                                  updatePreferences({ aiAssistantAvatarUrl: url });
                                  showToast('AI assistant avatar uploaded.', 'success');
                                }
                              }}
                            />
                            <Upload className="w-3.5 h-3.5" />
                          </label>
                          {preferences.aiAssistantAvatarUrl ? (
                            <img
                              src={preferences.aiAssistantAvatarUrl}
                              alt="AI Avatar"
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <Bot className="w-8 h-8 text-[#3ECF8E]" />
                          )}
                        </div>
                        <button
                          onClick={() => updatePreferences({ aiAssistantEnabled: !preferences.aiAssistantEnabled })}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            preferences.aiAssistantEnabled ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
                          }`}
                          role="switch"
                          aria-checked={preferences.aiAssistantEnabled}
                        >
                          <span
                            className={`absolute top-0.5 transition-transform duration-200 ${
                              preferences.aiAssistantEnabled ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full bg-white shadow-md" />
                          </span>
                        </button>
                      </div>

                      {/* Google Drive Folder ID */}
                      <div className="space-y-1">
                        <label className="text-xs text-[#71717A] uppercase font-bold">
                          Google Drive Folder
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            placeholder="Folder ID"
                            value={preferences.googleDriveFolderId}
                            onChange={(e) => updatePreferences({ googleDriveFolderId: e.target.value })}
                            className="flex-1 px-2 py-1 rounded bg-[#09090B] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#3ECF8E]"
                          />
                          <button
                            onClick={() => updatePreferences({ showGoogleDriveSection: !preferences.showGoogleDriveSection })}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                              preferences.showGoogleDriveSection
                                ? 'bg-[#3ECF8E] text-black'
                                : 'bg-[#18181B] text-[#A1A1AA] hover:text-white'
                            }`}
                          >
                            {preferences.showGoogleDriveSection ? 'Hide' : 'Load'}
                          </button>
                        </div>
                        {preferences.showGoogleDriveSection && preferences.googleDriveFolderId && (
                          <div className="text-[9px] text-[#71717A]">
                            Drive folder: {preferences.googleDriveFolderId}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#27272A]">
                      <div className="mb-3 text-center">
                        <span className="text-xs text-[#71717A]">Ctrl + Arrow keys → faster axis rotation ({preferences.ctrlAxisRotationStep}°)</span>
                      </div>
                      <button
                        onClick={() => {
                          const { resetPreferences } = require('@/hooks/use-tour-preferences');
                          resetPreferences();
                          setShowPreferences(false);
                        }}
                        className="w-full px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        Reset to Defaults
                      </button>
                    </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}
