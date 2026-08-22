'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/lib/store';
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
  Flame,
  Volume2
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

export const TOUR_ROOMS: TourRoom[] = [
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
  }
];

export default function PanoramaViewer() {
  const {
    panoramaModalOpen,
    activePanoramaUrl,
    activePanoramaTitle,
    closePanorama,
    showToast
  } = useAppStore();

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

  // Active Hotspot Popup state
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

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

  // Keyboard navigation & Shortcuts
  useEffect(() => {
    if (!panoramaModalOpen) return;
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
        setYaw((prev) => (prev - 8 + 360) % 360);
      } else if (e.key === 'ArrowRight') {
        setYaw((prev) => (prev + 8) % 360);
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
    panoramaModalOpen,
    activeHotspot,
    isAddMode,
    configModalOpen,
    hotspotDrawerOpen,
    closePanorama,
    showToast
  ]);

  if (!panoramaModalOpen) return null;

  const currentHotspots = roomHotspotsMap[currentRoom.id] || [];

  // TELEPORT TO ROOM HANDLER
  const teleportToRoom = (targetRoomId: string, customUrl?: string, customName?: string, targetYaw?: number) => {
    setIsTeleporting(true);
    setActiveHotspot(null);

    setTimeout(() => {
      const target = TOUR_ROOMS.find((r) => r.id === targetRoomId);
      if (target) {
        setCurrentRoom(target);
        setYaw(targetYaw !== undefined ? targetYaw : target.initialYaw);
        setPitch(target.initialPitch);
        showToast(`Teleported to ${target.name}`, 'success');
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
        setCurrentRoom(dynamicRoom);
        setYaw(targetYaw || 180);
        showToast(`Teleported to ${dynamicRoom.name}`, 'success');
      }
      setIsTeleporting(false);
    }, 400);
  };

  // MOUSE DRAG & PANNING HANDLERS
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAddMode) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isAddMode) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setYaw((prev) => (prev - deltaX * 0.15 + 360) % 360);
    setPitch((prev) => Math.max(-45, Math.min(45, prev + deltaY * 0.15)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
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

      {/* TOP BAR WITH TOUR ROOM SELECTOR & CONTROLS */}
      <div className="absolute top-0 inset-x-0 z-30 px-4 py-2.5 bg-[#09090B]/95 border-b border-[#27272A] flex flex-wrap items-center justify-between gap-3 pointer-events-auto backdrop-blur-md">
        {/* LEFT: ROOM NODE SELECTOR */}
        <div className="flex items-center gap-3 relative">
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
                ? 'bg-amber-400 text-black animate-pulse ring-2 ring-amber-300'
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

          {/* ZOOM CONTROLS */}
          <div className="hidden sm:flex items-center bg-[#18181B] border border-[#27272A] rounded-xl p-0.5">
            <button
              onClick={() => setFov((prev) => Math.max(prev - 10, 45))}
              className="p-1 hover:text-white cursor-pointer text-zinc-300"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setFov((prev) => Math.min(prev + 10, 100))}
              className="p-1 hover:text-white cursor-pointer text-zinc-300"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#FAFAFA] transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={closePanorama}
            className="p-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer ml-1"
            title="Exit 360 Viewer (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
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
        onClick={handleCanvasClick}
        style={{
          perspective: `${fov * 10}px`,
        }}
      >
        {/* Equirectangular Projection Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-75"
          style={{
            backgroundImage: `url(${currentRoom.panoramaUrl})`,
            backgroundPosition: `${(yaw / 360) * 100}% ${50 - pitch * 0.8}%`,
            backgroundSize: `${fov * 3.5}% auto`,
            filter: 'contrast(1.05) brightness(0.98)',
          }}
        />

        {/* RENDERED INTERACTIVE HOTSPOTS */}
        {showHotspots &&
          currentHotspots.map((hp) => {
            // Spherical coordinate frustum projection
            let diff = (hp.xPercent - (yaw / 360) * 100) % 100;
            if (diff < -50) diff += 100;
            if (diff > 50) diff -= 100;

            const relativeX = 50 + diff * (100 / (fov / 360 * 100));
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
              className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[92vw] p-5 rounded-3xl bg-[#121215]/95 border border-[#27272A] backdrop-blur-2xl shadow-2xl font-mono pointer-events-auto"
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

      {/* BOTTOM HUD / RADAR COMPASS */}
      <div className="absolute bottom-4 inset-x-4 z-30 flex flex-wrap items-end justify-between gap-3 pointer-events-none">
        {/* Navigation Instructions */}
        <div className="hidden md:flex items-center gap-2 text-xs text-zinc-400 bg-black/75 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 pointer-events-auto">
          <Navigation className="w-3.5 h-3.5 text-rose-500" />
          <span>Click & Drag to look around • Click &quot;Add Hotspot&quot; or press [H] to drop interactive pins</span>
        </div>

        {/* RADAR COMPASS WIDGET */}
        <div className="flex items-center gap-3 bg-black/80 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-white/10 pointer-events-auto">
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
      </div>

      {/* HOTSPOT LIST DRAWER (SLIDE-OVER PANEL) */}
      <AnimatePresence>
        {hotspotDrawerOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="absolute top-0 right-0 bottom-0 w-full sm:w-96 bg-[#121215] border-l border-[#27272A] z-40 p-5 flex flex-col justify-between font-mono shadow-2xl pointer-events-auto overflow-y-auto"
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
              className="w-full max-w-xl rounded-3xl bg-[#121215] border border-[#27272A] shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
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
    </div>
  );
}
