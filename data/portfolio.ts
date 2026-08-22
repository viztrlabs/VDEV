export interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  featuredImage: string;
  galleryImages: string[];
  video?: string;
  panorama?: string;
  model3d?: string;
  category: 'exterior' | 'interior' | 'walkthrough' | 'xr' | '360';
  tags: string[];
  client: string;
  clientName?: string;
  architect: string;
  location: string;
  shortDescription: string;
  longDescription: string;
  challenge: string;
  solution: string;
  services: string[];
  deliverables: string[];
  featured: boolean;
  year: string;
  area: string;
}

export const portfolioProjects: PortfolioProject[] = [
  {
    id: 'nordic-monolith',
    title: 'Nordic Monolith Residence',
    slug: 'nordic-monolith-residence',
    featuredImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80'
    ],
    video: 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-interior-living-room-4155-large.mp4',
    panorama: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2400&q=85',
    category: 'exterior',
    tags: ['Brutalist', 'Timber', 'Residential', 'Ray Tracing'],
    client: 'Snøhetta Atelier Group',
    clientName: 'Snøhetta Atelier Group',
    architect: 'Snøhetta Studio Oslo',
    location: 'Oslo Fjord, Norway',
    shortDescription: 'Monolithic concrete and blackened cedar villa sculpted into the glacial granite coast.',
    longDescription: 'Engineered with nanometer-precise material shaders and sub-surface scattering for raw exposed concrete and Scandinavian timber. Visualized under overcast Nordic daylight conditions to emphasize raw architectural texture.',
    challenge: 'Replicating the delicate sub-surface scattering of coastal granite and wet weathered charred timber under diffused, low-altitude Nordic winter light.',
    solution: 'Constructed custom spectral HDRI sky coordinates and multi-layered roughness maps to reproduce authentic tactile coastal atmosphere.',
    services: ['Exterior Master Renders', 'Atmospheric Daylight Study', '360° Node Setup'],
    deliverables: ['6x 8K Master Stills', 'High-bitrate 4K Day/Dusk Flyover', 'Print & Billboard CMYK Formats'],
    featured: true,
    year: '2026',
    area: '740 m²'
  },
  {
    id: 'solarium-penthouse',
    title: 'Solarium Sky Penthouse',
    slug: 'solarium-sky-penthouse',
    featuredImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=80'
    ],
    panorama: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2400&q=85',
    category: 'interior',
    tags: ['Luxury Interior', 'Calacatta Marble', 'Lighting Study'],
    client: 'Vanguard Luxury Real Estate',
    clientName: 'Vanguard Luxury Real Estate',
    architect: 'Foster & Partners NY',
    location: 'Tribeca, New York',
    shortDescription: 'Triplex penthouse with floor-to-ceiling curtain glass and custom bookmatched Italian marble.',
    longDescription: 'Comprehensive photorealistic interior staging highlighting custom B&B Italia furniture collections, brushed brass metalwork, and physical sky-luminescence mapping across varying twilight hours.',
    challenge: 'Balancing intense direct Manhattan skyline solar glare through triple-glazed acoustic glass with warm, delicate interior architectural cove fixtures.',
    solution: 'Employed bi-directional path tracing and photometrically calibrated IES light profiles to achieve flawless dynamic range and material fidelity.',
    services: ['Interior Staging CGI', 'Material Vignettes', '360° Panorama'],
    deliverables: ['8x 8K Interior Hero Perspectives', 'Interactive 360° Spherical Node', 'Material Option Booklets'],
    featured: true,
    year: '2025',
    area: '520 m²'
  },
  {
    id: 'apex-tower-xr',
    title: 'The Apex Tower Interactive WebXR',
    slug: 'the-apex-tower-webxr',
    featuredImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80'
    ],
    model3d: 'glb-apex-tower',
    panorama: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2400&q=85',
    category: 'xr',
    tags: ['WebXR', 'Babylon.js', 'Real-time 3D', 'AR Ready'],
    client: 'Mori Building Development',
    clientName: 'Mori Building Development',
    architect: 'Kengo Kuma & Associates',
    location: 'Roppongi, Tokyo',
    shortDescription: 'Zero-install interactive WebXR model enabling multi-user real-time spatial exploration in browser.',
    longDescription: 'Created using customized Babylon.js PBR materials with zero-install WebXR support. Allows real-time material swapping, daylight control sliders, and immersive AR table-scale projections.',
    challenge: 'Optimizing a massive 65-story skyscraper CAD geometry into a sub-10MB mobile-friendly bundle without losing facade articulation.',
    solution: 'Applied Draco polygon compression and baked ambient occlusion normal maps, achieving a 1.8-second load time on standard 4G connections.',
    services: ['WebXR Interactive Engine', 'WebAR QR Code Suite', 'Real-Time Shader Optimization'],
    deliverables: ['Custom Branded WebXR Link', 'Embeddable Web iFrame', 'AR QR Code Assets'],
    featured: true,
    year: '2026',
    area: '48,000 m²'
  },
  {
    id: 'mirage-pavilion',
    title: 'Desert Mirage Pavilion 360',
    slug: 'desert-mirage-pavilion-360',
    featuredImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80'
    ],
    panorama: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2400&q=85',
    category: '360',
    tags: ['360 Virtual Tour', 'HDR Equirectangular', 'Hotspots'],
    client: 'Al-Jazeera Hospitality Group',
    clientName: 'Al-Jazeera Hospitality Group',
    architect: 'Zaha Hadid Architects Dubai',
    location: 'Dubai Desert Reserve, UAE',
    shortDescription: 'Multi-node 8K virtual tour featuring interactive architectural hotspots and teleportation.',
    longDescription: 'High-dynamic range 360 spherical capture rendered at 16K resolution with smooth inertia camera navigation, spatial radar map, and detailed informational annotations embedded directly into the 3D space.',
    challenge: 'Providing high-resolution 16K panoramic fidelity that loads smoothly on international investor mobile devices.',
    solution: 'Designed a multi-resolution adaptive tile-loading pyramid with synchronized 2D floorplan radar orientation.',
    services: ['360° Panoramic Rendering', 'Virtual Tour Engine', 'Hotspot CMS'],
    deliverables: ['12-Node 16K Virtual Tour', 'Interactive Floorplan Overlay', 'Offline Showroom Executable'],
    featured: true,
    year: '2026',
    area: '1,200 m²'
  },
  {
    id: 'elysium-walkthrough',
    title: 'Elysium Botanical Villa Walkthrough',
    slug: 'elysium-botanical-villa-walkthrough',
    featuredImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80'
    ],
    video: 'https://assets.mixkit.co/videos/preview/mixkit-minimalist-living-room-with-modern-furniture-4156-large.mp4',
    category: 'walkthrough',
    tags: ['Cinematic Animation', '4K 60FPS', 'Biophilic Design'],
    client: 'Costa Smeralda Estates',
    clientName: 'Costa Smeralda Estates',
    architect: 'Studio MK27 Brazil',
    location: 'Sardinia, Italy',
    shortDescription: 'Cinematic 4K architectural flythrough demonstrating solar angles, vegetation physics, and evening illumination.',
    longDescription: 'Rendered with Unreal Engine 5.4 Lumen global illumination and custom cinematic camera trajectories with depth-of-field rack focusing to evoke emotional buyer connection.',
    challenge: 'Simulating wind physics through dense Mediterranean pine and olive groves while maintaining photorealistic path-traced lighting.',
    solution: 'Utilized Unreal Engine 5.4 Nanite foliage with physics-based vertex deformation and custom atmospheric mist shaders.',
    services: ['4K 60FPS Architectural Film', 'Drone Shot Matching', 'Audio Mastering'],
    deliverables: ['90-second Master 4K Film', 'Social Media 9:16 Cuts', 'Stills Extract Package'],
    featured: true,
    year: '2025',
    area: '890 m²'
  },
  {
    id: 'zenith-corporate-hq',
    title: 'Zenith Biophilic Headquarters',
    slug: 'zenith-biophilic-headquarters',
    featuredImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80'
    ],
    category: 'exterior',
    tags: ['Commercial', 'Curtain Wall', 'Sustainability'],
    client: 'Helix Global Ventures',
    clientName: 'Helix Global Ventures',
    architect: 'WOHA Architects Singapore',
    location: 'Marina Bay, Singapore',
    shortDescription: '42-story sustainable tower featuring double-skin facade and vertical tropical sky-gardens.',
    longDescription: 'High-density environmental lighting simulations depicting seasonal solar heat gain mitigations and nighttime LEED-certified architectural facade illumination.',
    challenge: 'Accurately portraying complex double-skin aerodynamic louvers and internal tropical atrium ecosystems.',
    solution: 'Constructed custom spectral transmittance glass shaders and lush procedural vertical garden simulations.',
    services: ['Commercial Exterior CGI', 'Sustainability Sunlight Study', 'Night Lighting Simulation'],
    deliverables: ['10x 8K Exterior Images', 'Environmental Solar Video Study', 'Competition Presentation Boards'],
    featured: false,
    year: '2025',
    area: '62,000 m²'
  }
];

export function getProjectById(id: string): PortfolioProject | undefined {
  return portfolioProjects.find((p) => p.id === id || p.slug === id);
}

export function getRelatedProjects(currentId: string, category: string, limit = 2): PortfolioProject[] {
  return portfolioProjects
    .filter((p) => p.id !== currentId && (p.category === category || p.featured))
    .slice(0, limit);
}
