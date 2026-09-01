/**
 * Tour Configuration Data Layer
 * Production-ready virtual tour pipeline with image upload, linking, and management.
 */

export type HotspotType = 'metadata' | 'room_link' | 'image_overlay' | 'info_popup';
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
  // Image overlay / linking without hotspot
  linkedImageUrl?: string;
  linkedMediaType?: 'image' | 'video' | 'model';
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
  // Floor plan coordinates for this room (optional)
  floorPlanX?: number;   // percentage position on floor plan (0-100)
  floorPlanY?: number;   // percentage position on floor plan (0-100)
}

export interface StandaloneImage {
  id: string;
  roomId: string;
  imageUrl: string;
  title: string;
  xPercent: number;
  yPercent: number;
  yaw: number;
  pitch: number;
  fov: number;
  isLinkedToRoom: boolean;
  linkedRoomId?: string;
}

export interface TourConfig {
  version: string;
  title: string;
  description: string;
  rooms: TourRoom[];
  standaloneImages: StandaloneImage[];
  settings: {
    clientLogoUrl: string;
    viztrLogoUrl: string;
    floorPlanImageUrl: string;
    backgroundMusicUrl: string;
    aiAssistantAvatarUrl: string;
    googleDriveFolderId: string;
  };
}

// ============================================================================
// DEFAULT TOUR CONFIGURATION
// ============================================================================

export const DEFAULT_TOUR_CONFIG: TourConfig = {
  version: '1.0.0',
  title: 'The Solarium Sky Penthouse',
  description: 'Triplex Penthouse · Tribeca, Manhattan',
  rooms: [
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
      ],
      floorPlanX: 50,
      floorPlanY: 50
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
      ],
      floorPlanX: 20,
      floorPlanY: 20
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
      ],
      floorPlanX: 20,
      floorPlanY: 80
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
      ],
      floorPlanX: 10,
      floorPlanY: 50
    },
    {
      id: 'room-screening-lounge',
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
      ],
      floorPlanX: 90,
      floorPlanY: 10
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
      ],
      floorPlanX: 30,
      floorPlanY: 80
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
      ],
      floorPlanX: 90,
      floorPlanY: 80
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
      ],
      floorPlanX: 10,
      floorPlanY: 80
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
      ],
      floorPlanX: 80,
      floorPlanY: 10
    }
  ],
  standaloneImages: [],
  settings: {
    clientLogoUrl: '',
    viztrLogoUrl: '',
    floorPlanImageUrl: '',
    backgroundMusicUrl: '',
    aiAssistantAvatarUrl: '',
    googleDriveFolderId: ''
  }
};

// Backward-compatible export
export const TOUR_ROOMS: TourRoom[] = DEFAULT_TOUR_CONFIG.rooms;

// ============================================================================
// TOUR CONFIG MANAGER - Production pipeline for virtual tour management
// ============================================================================

export class TourConfigManager {
  private config: TourConfig;

  constructor(config: TourConfig = DEFAULT_TOUR_CONFIG) {
    this.config = { ...config };
  }

  // Get all rooms
  getRooms(): TourRoom[] {
    return this.config.rooms;
  }

  // Get a room by ID
  getRoom(roomId: string): TourRoom | undefined {
    return this.config.rooms.find((r) => r.id === roomId);
  }

  // Get standalone images
  getStandaloneImages(): StandaloneImage[] {
    return this.config.standaloneImages;
  }

  // Add a standalone image (image linking without hotspot)
  addStandaloneImage(image: Omit<StandaloneImage, 'id'>): StandaloneImage {
    const newImage: StandaloneImage = {
      ...image,
      id: `img-${Date.now()}`,
    };
    this.config.standaloneImages = [...this.config.standaloneImages, newImage];
    return newImage;
  }

  // Link a standalone image to a room (non-hotspot linking)
  linkImageToRoom(imageId: string, roomId: string): boolean {
    const image = this.config.standaloneImages.find((img) => img.id === imageId);
    if (!image) return false;
    const room = this.config.rooms.find((r) => r.id === roomId);
    if (!room) return false;
    image.roomId = roomId;
    image.isLinkedToRoom = true;
    image.linkedRoomId = roomId;
    return true;
  }

  // Add a new room (production pipeline - image upload + linking)
  addRoom(room: Omit<TourRoom, 'id' | 'defaultHotspots'> & { id?: string; defaultHotspots?: Hotspot[] }): TourRoom {
    const newRoom: TourRoom = {
      ...room,
      id: room.id || `room-${Date.now()}`,
      defaultHotspots: room.defaultHotspots || [],
    };
    this.config.rooms = [...this.config.rooms, newRoom];
    return newRoom;
  }

  // Update room panorama URL (image upload/replace for existing room)
  updateRoomPanorama(roomId: string, panoramaUrl: string, thumbnailUrl?: string): boolean {
    const room = this.config.rooms.find((r) => r.id === roomId);
    if (!room) return false;
    room.panoramaUrl = panoramaUrl;
    if (thumbnailUrl) room.thumbnailUrl = thumbnailUrl;
    return true;
  }

  // Replace a room's panorama image (production pipeline)
  replaceRoomPanorama(roomId: string, file: File): Promise<string> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const thumbnailUrl = url; // In production, generate a thumbnail
      this.updateRoomPanorama(roomId, url, thumbnailUrl);
      resolve(url);
    });
  }

  // Get floor plan coordinates for a room (mini-map sync)
  getFloorPlanPosition(roomId: string): { x: number; y: number } | null {
    const room = this.config.rooms.find((r) => r.id === roomId);
    if (!room || room.floorPlanX === undefined || room.floorPlanY === undefined) return null;
    return { x: room.floorPlanX, y: room.floorPlanY };
  }

  // Update floor plan position for a room (real-time sync)
  updateFloorPlanPosition(roomId: string, x: number, y: number): boolean {
    const room = this.config.rooms.find((r) => r.id === roomId);
    if (!room) return false;
    room.floorPlanX = x;
    room.floorPlanY = y;
    return true;
  }

  // Export tour configuration as JSON
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  // Import tour configuration from JSON
  importConfig(json: string): boolean {
    try {
      const parsed = JSON.parse(json);
      this.config = { ...DEFAULT_TOUR_CONFIG, ...parsed };
      return true;
    } catch {
      return false;
    }
  }

  // Get brand settings
  getSettings() {
    return this.config.settings;
  }

  // Update brand settings (logos, assets, etc.)
  updateSettings(settings: Partial<TourConfig['settings']>): void {
    this.config.settings = { ...this.config.settings, ...settings };
  }

  // Get full config
  getConfig(): TourConfig {
    return this.config;
  }
}
