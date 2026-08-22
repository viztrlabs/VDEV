export interface ServicePageData {
  title: string;
  category: string;
  badge: string;
  heroImage: string;
  tagline: string;
  description: string;
  benefits: Array<{ title: string; desc: string }>;
  process: Array<{ step: number; title: string; desc: string }>;
  deliverables: string[];
  faq: Array<{ q: string; a: string }>;
}

export const servicePagesData = {
  exterior: {
    title: 'Exterior Architectural Visualization',
    heroBadge: 'Photorealistic CGI',
    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85',
    subtitle: 'Monumental architectural form, environmental context, and physical lighting.',
    description: 'We translate CAD blueprints and BIM models into emotionally evocative, photorealistic exterior imagery. Our team meticulously simulates real-world sun trajectories, physical atmospheric scattering, true-to-spec vegetation, and photometrically calibrated materials.',
    capabilities: [
      'Spectral HDRI lighting & real-world geographic sun simulation',
      'High-poly procedural foliage & biophilic landscaping',
      'Drone matching & surrounding context photomontage',
      'Weather conditions: Dawn, midday, golden hour, rainy, and twilight'
    ],
    benefits: [
      { title: 'Physically Based Shading', desc: 'Accurate specular reflections, sub-surface light scattering, and weathered material nuances.' },
      { title: 'Environmental Lighting Studies', desc: 'Visualizing golden hour, crisp morning light, overcast Scandinavian moods, and evening twilight illumination.' },
      { title: 'Landscape & Drone Integration', desc: 'Seamlessly matching architectural CGI into existing aerial drone photography and surrounding urban density.' }
    ],
    process: [
      { step: 1, title: 'CAD/BIM Import & Clean', desc: 'Optimization of geometry, terrain mapping, and architectural coordinate alignment.' },
      { step: 2, title: 'Camera & Composition', desc: 'Proposing 5 to 10 cinematic perspectives that emphasize scale and architectural proportion.' },
      { step: 3, title: 'Lighting & Texturing', desc: 'Calibrating HDRI environments and customized material shaders according to physical specifications.' },
      { step: 4, title: 'High-Res 8K Production', desc: 'Multi-pass rendering with meticulous post-production color grading.' }
    ],
    deliverables: [
      'Ultra 8K TIFF / PNG Master Stills at 300 DPI',
      'Day/Dusk/Night Illumination Pairs',
      'Aerial Master Plan Views',
      'Print-ready CMYK Conversions'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'
    ],
    faq: [
      { q: 'What resolution are exterior renders delivered in?', a: 'Standard delivery is 8K (7680x4320) at 300 DPI for billboard, print brochure, and ultra-high-definition digital displays.' },
      { q: 'Can you match specific physical cladding samples?', a: 'Yes. You can send manufacturer specs, RAL codes, or physical photo references, and we formulate custom PBR material maps.' }
    ]
  },
  interior: {
    title: 'Interior Architectural Visualization',
    heroBadge: 'Interior Staging',
    heroImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=85',
    subtitle: 'Tactile materials, curated designer furnishings, and bespoke architectural lighting.',
    description: 'Our interior visualizations capture the refined tactile elegance of luxury spaces. From bookmatched Calacatta marble to textured wool upholstery and bespoke architectural lighting fixtures, we craft scenes that ignite emotional buyer desire.',
    capabilities: [
      'Bespoke 3D furniture modeling (Minotti, Poliform, B&B Italia)',
      'Sub-surface scattering for stones, marbles, and fabrics',
      'Complex multi-layer interior IES artificial lighting',
      'Daylight vs. Evening artificial illumination studies'
    ],
    benefits: [
      { title: 'Bespoke Furniture Modeling', desc: 'Exact 3D replications of high-end designer pieces from Minotti, Poliform, B&B Italia, and custom cabinetry.' },
      { title: 'Complex Interior Lighting', desc: 'Simulating layered architectural recessed lighting, LED covings, natural window illumination, and fireplace warmth.' },
      { title: 'Material Richness', desc: 'True micro-roughness on brushed metals, open-pore woods, hand-tufted carpets, and transparent drapery.' }
    ],
    process: [
      { step: 1, title: 'Floorplan & Moodboard Study', desc: 'Analyzing interior architectural drawings, ceiling heights, and finishes palette.' },
      { step: 2, title: 'Spatial Staging & Cameras', desc: 'Placing curated furniture configurations and establishing intimate and wide-angle viewpoints.' },
      { step: 3, title: 'Lighting Calibration', desc: 'Balancing artificial luminaire Kelvin temperatures with exterior natural daylight.' },
      { step: 4, title: 'Detailing & Polish', desc: 'Adding micro-details such as art books, decorative flora, and subtle organic drapery wrinkles.' }
    ],
    deliverables: [
      '8K Master Interior Perspective Stills',
      'Material Close-up Vignette Shots',
      '360° Spherical Panoramic Nodes',
      'Interactive Color / Finish Variant Sheets'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80'
    ],
    faq: [
      { q: 'Can we change furniture items during the revision phase?', a: 'Yes, draft stages are intentionally designed for furniture layout and material customization before final render output.' },
      { q: 'Can you render both daylight and evening ambient lighting?', a: 'Yes, we frequently produce day/dusk packages to showcase both natural light and architectural fixture ambience.' }
    ]
  },
  walkthrough: {
    title: 'Cinematic Walkthrough Animation',
    heroBadge: '4K 60FPS Film',
    heroImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1800&q=85',
    subtitle: 'Film-grade motion, choreographed lighting, and custom spatial audio.',
    description: 'Transforming blueprints into unforgettable 4K architectural films. We direct camera motions with cinematic fluidity, orchestrate sunlight transitions across space, and compose custom musical and spatial sound designs.',
    capabilities: [
      'Smooth cinematic camera paths (dolly, crane, drone sweeps)',
      'Dynamic daylight transitions from morning sunrise to dusk',
      'Foliage wind physics, cloth simulation, and water ripples',
      'Full post-production colorist grading and audio mastering'
    ],
    benefits: [
      { title: 'Cinematic Camera Direction', desc: 'Smooth dolly shots, crane rises, drone sweeps, and gentle focal rack focusing.' },
      { title: 'Dynamic Atmospheric Physics', desc: 'Wind in surrounding foliage, flowing water ripples, changing sunlight, and ambient interior motion.' },
      { title: 'Sound Design & Mastering', desc: 'Custom tailored musical composition and authentic spatial audio mixing.' }
    ],
    process: [
      { step: 1, title: 'Animatic Storyboarding', desc: 'Creating a low-poly camera trajectory animatic timed precisely to the musical beat.' },
      { step: 2, title: 'High-Fidelity Animation', desc: 'Simulating cloth physics, foliage wind movement, and animated lighting transitions.' },
      { step: 3, title: 'GPU Cloud Rendering', desc: 'Rendering thousands of individual frames in high-bitrate ProRes and 4K MP4 formats.' },
      { step: 4, title: 'Color Grading & Audio Master', desc: 'Final post-production film colorist grading and audio mastering.' }
    ],
    deliverables: [
      '4K Ultra HD Master Video (ProRes / MP4)',
      'Social Media Cuts (9:16 Vertical & 1:1 Square)',
      'Motion Graphic Title Cards & Architectural Callouts',
      'Isolated Sound Effects & Musical Stems'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
    ],
    faq: [
      { q: 'What is the turnaround time for a 90-second architectural animation?', a: 'Typical turnaround is 3 to 4 weeks, with storyboard signoff within the first 7 days.' }
    ]
  },
  webxr: {
    title: 'WebXR Zero-Install Spatial Engine',
    heroBadge: 'Browser-Native 3D',
    heroImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1800&q=85',
    subtitle: 'Interact with unbuilt architecture in any browser at 60 FPS without downloading apps.',
    description: 'WebXR brings frictionless interactive 3D to the web. Buyers and stakeholders can rotate, orbit, fly inside, and inspect architectural models on phones, laptops, and VR headsets with a single URL click.',
    capabilities: [
      'Sub-2 second load times with Draco polygon compression',
      'Real-time PBR material and finishes switcher',
      'Interactive floorplan navigator and sun position study',
      'Universal browser support across iOS Safari, Android Chrome, Mac & PC'
    ],
    benefits: [
      { title: 'Zero Friction Access', desc: 'No App Store downloads required. Send a single hyperlink to high-net-worth buyers.' },
      { title: 'Interactive Finishes', desc: 'Allow clients to switch flooring woods, marble island colors, and kitchen cabinetry live.' },
      { title: 'High-Speed WebGL/WebGPU', desc: 'Draco compressed geometries load in under 2 seconds even over mobile cellular connections.' }
    ],
    process: [
      { step: 1, title: 'CAD/BIM Decimation', desc: 'Optimizing high-poly meshes into low-draw-call GLTF/GLB web-ready geometries.' },
      { step: 2, title: 'Bake Lighting & PBR Maps', desc: 'Baking ambient occlusion and raytraced global illumination into lightweight texture maps.' },
      { step: 3, title: 'UI & Camera Customization', desc: 'Configuring interactive hotspots, architectural tags, and floor plan navigation.' },
      { step: 4, title: 'Cloud Edge Hosting', desc: 'Deploying to high-speed global CDNs with custom branded domain integration.' }
    ],
    deliverables: [
      'Custom Branded WebXR Deployment URL',
      'Iframe Embed Codes for Website Integration',
      'Self-Hosted WebGL Static Package',
      'Real-Time User Engagement Telemetry'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
    ],
    faq: [
      { q: 'Do buyers need to install any app or plugin?', a: 'No. WebXR runs entirely natively within modern web browsers including Safari on iPhone and Chrome on Android/desktop.' },
      { q: 'Can this be embedded directly into our real estate listing page?', a: 'Yes, we provide standard responsive iframe embed codes and React components.' }
    ]
  },
  webar: {
    title: 'WebAR Augmented Reality',
    heroBadge: 'Real-World Scale',
    heroImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1800&q=85',
    subtitle: 'Project true-scale 3D buildings onto conference tables or physical site lots.',
    description: 'WebAR enables buyers to experience unbuilt architecture in their living room, sales center desk, or directly on the construction site using their phone camera.',
    capabilities: [
      'Tabletop architectural scale with 360 walk-around inspection',
      '1:1 true real-world scale projection on construction plots',
      'Instant QR code activation from print brochures',
      'USDZ for Apple Quick Look and GLB for Android Scene Viewer'
    ],
    benefits: [
      { title: 'True Physical Context', desc: 'Place full 1:1 scale architectural volumes directly onto vacant building sites.' },
      { title: 'Interactive Print Brochures', desc: 'Scan a printed floor plan brochure to pop up a physical 3D holographic model on the table.' },
      { title: 'Zero App Friction', desc: 'Utilizes native iOS Quick Look and Android Scene Viewer engines directly from QR codes.' }
    ],
    process: [
      { step: 1, title: 'AR Asset Optimization', desc: 'Constructing lightweight polygon meshes with packed PBR textures under 15MB.' },
      { step: 2, title: 'Scale & Pivot Setup', desc: 'Calibrating physical world ground plane anchors and true metric dimensions.' },
      { step: 3, title: 'Dual-Format Generation', desc: 'Generating native Apple USDZ and Android GLB spatial file containers.' },
      { step: 4, title: 'QR & Print Integration', desc: 'Deploying hosted AR redirect links and vector print-ready QR codes.' }
    ],
    deliverables: [
      'Universal WebAR QR Codes & Shortlinks',
      'Optimized GLB & USDZ 3D Files',
      'Brochure & Print Marketing Integration Package',
      'Sales Presentation Display Assets'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
    ],
    faq: [
      { q: 'Can WebAR be used directly on the empty plot of land?', a: 'Yes! Users can launch 1:1 scale AR directly outdoors on the plot to perceive real building massing.' }
    ]
  },
  vr: {
    title: 'Virtual Reality Immersive Experience',
    heroBadge: 'Full Immersion',
    heroImage: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&w=1800&q=85',
    subtitle: 'Walk unbuilt spaces with true human scale, spatial audio, and natural hand interactions.',
    description: 'Engineered for Meta Quest 3, Apple Vision Pro, and PC VR headsets. Provides full spatial freedom of movement, natural hand interactions, and realistic scale comprehension.',
    capabilities: [
      'Stereoscopic 90 FPS rendering with zero motion sickness',
      'Natural hand tracking and interactive object inspection',
      'Dual-headset synchronized guided tours for sales agents',
      'Spatial acoustics simulating room reverberation'
    ],
    benefits: [
      { title: 'True Human Scale', desc: 'Experience ceiling heights, spatial volumes, and architectural sightlines exactly as built.' },
      { title: 'Synchronized Sales Tours', desc: 'Sales agents can guide prospective buyers through multi-user synchronized VR sessions.' },
      { title: 'Multi-Headset Support', desc: 'Fully optimized for Meta Quest 3, Apple Vision Pro, and high-end SteamVR rigs.' }
    ],
    process: [
      { step: 1, title: 'VR Environment Staging', desc: 'Setting up high-performance baked lighting and stereoscopic rendering pipelines.' },
      { step: 2, title: 'Spatial Interaction Setup', desc: 'Adding natural hand tracking, teleport boundaries, and interactive light switches.' },
      { step: 3, title: '90 FPS Performance Tuning', desc: 'Rigorous optimization to ensure zero motion sickness and fluid framerates.' },
      { step: 4, title: 'Kiosk & Headset Package', desc: 'Deploying standalone APKs and VisionOS WebXR direct links.' }
    ],
    deliverables: [
      'WebXR Headset Direct URL Link',
      'Standalone Meta Quest APK / VisionOS Web Package',
      'Operator Remote Companion Tablet App',
      'Sales Center Hardware Setup Guide'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80'
    ],
    faq: [
      { q: 'Does this require tethered PC VR cables?', a: 'No, our solutions run wirelessly on standalone Meta Quest 3 and Apple Vision Pro headsets.' }
    ]
  },
  virtualTour: {
    title: '360° Spherical Virtual Tour',
    heroBadge: '16K Panoramic Nodes',
    heroImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1800&q=85',
    subtitle: 'Crystal-clear 16K panoramic exploration with interactive hotspots and radar floorplans.',
    description: 'Lightweight, ultra-high-resolution panoramic tours with smooth camera momentum, spatial audio, interactive specification tags, and seamless room-to-room teleportation.',
    capabilities: [
      '16K Equirectangular multi-resolution tiled panoramas',
      'Interactive architectural hotspots with material specs',
      'Synchronized 2D floorplan with real-time field-of-view radar',
      'White-label embeddable player with analytics'
    ],
    benefits: [
      { title: '16K Ultra-Crisp Fidelity', desc: 'Multi-resolution tiled panoramas render instant razor-sharp detail without lag.' },
      { title: 'Live Radar Floorplan', desc: 'Integrated 2D architectural plan showing exact camera position and orientation field of view.' },
      { title: 'Interactive Hotspots', desc: 'Embedded clickable tags showcasing manufacturer details, finishes, and specs.' }
    ],
    process: [
      { step: 1, title: 'Panoramic Node Placement', desc: 'Selecting optimal vantage points across all rooms and outdoor terraces.' },
      { step: 2, title: 'Equirectangular 16K Render', desc: 'Rendering high-dynamic-range 360-degree spherical master image layers.' },
      { step: 3, title: 'Hotspot & Plan Integration', desc: 'Linking floorplan radar coordinates and interactive specification tooltips.' },
      { step: 4, title: 'Cloud Player Deployment', desc: 'Generating white-label embed snippets and responsive portals.' }
    ],
    deliverables: [
      'Custom Branded 360 Tour Portal URL',
      'Iframe Embed Snippets & CMS Connector',
      'Offline Local Showroom Presentation Package',
      'High-Res Equirectangular Stills Export'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80'
    ],
    faq: [
      { q: 'Can we customize the player with our developer branding?', a: 'Yes, full custom colors, logos, and custom domain hosting are included standard.' }
    ]
  },
  pixelStreaming: {
    title: 'Cloud Pixel Streaming (Unreal 5.4)',
    heroBadge: 'FLAGSHIP TECHNOLOGY',
    heroImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1800&q=85',
    subtitle: 'Hollywood-grade Unreal Engine 5.4 Lumen rendering streamed to any browser with sub-30ms latency.',
    description: 'The pinnacle of architectural spatial technology. Stream Hollywood-grade CGI in real-time to any standard smartphone, laptop, or showroom touchscreen without requiring high-end graphics hardware.',
    capabilities: [
      'Unreal Engine 5.4 Lumen dynamic global illumination & Nanite',
      'Real-time sun time-of-day slider and weather simulation',
      'Sub-30ms WebRTC low-latency streaming on 4G/5G/Broadband',
      'Auto-scaling cloud GPU clusters across US, Europe, and Asia'
    ],
    benefits: [
      { title: 'Hollywood Visual Fidelity', desc: 'Real-time raytraced reflections, dynamic shadows, and physical volumetric clouds.' },
      { title: 'Sub-30ms WebRTC Streaming', desc: 'Ultra-low latency streaming delivers the feel of a local high-end workstation.' },
      { title: 'Auto-Scaling GPU Clusters', desc: 'Instantly spins up cloud instances to accommodate concurrent sales meetings worldwide.' }
    ],
    process: [
      { step: 1, title: 'Unreal Engine 5.4 Pipeline', desc: 'Importing BIM/CAD geometry with Nanite virtualization and Lumen dynamic global illumination.' },
      { step: 2, title: 'Interactive Logic & Shaders', desc: 'Implementing sun sliders, dynamic material configurators, and architectural cinematic cameras.' },
      { step: 3, title: 'Cloud GPU Deployment', desc: 'Packaging project for NVIDIA RTX GPU server nodes with low-latency WebRTC signaling.' },
      { step: 4, title: 'Showroom & Web Integration', desc: 'Connecting client portal with real-time session telemetry and showroom touchscreen support.' }
    ],
    deliverables: [
      'Dedicated Cloud Pixel Streaming Web Portal',
      'Sales Center Kiosk Launcher Executable',
      'GPU Auto-Scaling Infrastructure & Health Monitoring',
      'Multi-User Concurrent Presentation Tools'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80'
    ],
    faq: [
      { q: 'What internet speed is required to stream?', a: 'Any standard 15+ Mbps broadband, 4G, or 5G connection delivers fluid 1080p/60fps or 4K/60fps interaction.' }
    ]
  },
  studioHub: {
    title: 'VizTR Studio — Architectural Visualization',
    heroBadge: 'Photorealistic CGI & Film',
    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85',
    subtitle: 'Monumental architectural CGI, tactile interior staging, and cinematic 4K walkthrough films.',
    services: [
      {
        id: 'exterior',
        title: 'Exterior Architectural Visualization',
        desc: 'Monumental architectural form, environmental context, and physical lighting.',
        features: ['Spectral HDRI lighting', 'Procedural foliage & landscaping', 'Drone matching montage', 'Day, golden hour, twilight moods'],
        href: '/studio/exterior',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'interior',
        title: 'Interior Architectural Visualization',
        desc: 'Tactile materials, curated designer furnishings, and bespoke architectural lighting.',
        features: ['Bespoke 3D designer furniture', 'Sub-surface stone scattering', 'Multi-layer IES lighting', 'Day vs. Evening ambience'],
        href: '/studio/interior',
        image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'walkthrough',
        title: 'Cinematic Walkthrough Animation',
        desc: 'Film-grade motion, choreographed lighting, and custom spatial audio.',
        features: ['Dolly, crane, & drone paths', 'Sunrise-to-dusk transitions', 'Foliage wind & cloth physics', 'Colorist grading & audio master'],
        href: '/studio/walkthrough',
        image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  xrHub: {
    title: 'VizTR XR World — Spatial Computing',
    heroBadge: 'Zero-Install 3D & Cloud GPU',
    heroImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1800&q=85',
    subtitle: 'Browser-native 3D models, WebAR tabletop projections, Apple Vision Pro/Quest VR, 16K virtual tours, and Unreal Engine 5.4 cloud pixel streaming.',
    services: [
      {
        id: 'pixel-streaming',
        title: 'Cloud Pixel Streaming (Unreal 5.4)',
        desc: 'Stream Hollywood-grade Unreal Engine 5.4 Lumen global illumination to any browser with sub-30ms latency.',
        features: ['Unreal 5.4 Lumen & Nanite', 'Live time-of-day sun slider', 'Sub-30ms WebRTC low latency', 'Auto-scaling cloud GPU clusters'],
        href: '/xr-world/pixel-streaming'
      },
      {
        id: 'webxr',
        title: 'WebXR Zero-Install Spatial Engine',
        desc: 'Interactive 3D architectural models running at 60 FPS in iOS Safari and Chrome with zero downloads.',
        features: ['Sub-2s Draco compression', 'Real-time PBR material swap', 'Interactive 2D floorplan sync', 'Universal browser support'],
        href: '/xr-world/webxr'
      },
      {
        id: 'webar',
        title: 'WebAR Augmented Reality',
        desc: 'Project true-scale 3D buildings onto conference tables or physical construction plots directly via camera.',
        features: ['Tabletop & 1:1 lot scale', 'QR code instant activation', 'USDZ & GLB universal support', 'Brochure marketing integration'],
        href: '/xr-world/webar'
      },
      {
        id: 'vr',
        title: 'Virtual Reality Immersive Experience',
        desc: 'Walk unbuilt spaces with true human scale, spatial audio, and natural hand interactions on Meta Quest 3 & Vision Pro.',
        features: ['Stereoscopic 90 FPS rendering', 'Natural hand tracking', 'Synchronized multi-user tours', 'Spatial room acoustics'],
        href: '/xr-world/virtual-reality'
      },
      {
        id: 'virtual-tour',
        title: '360° Spherical Virtual Tour',
        desc: 'Crystal-clear 16K panoramic exploration with interactive specification hotspots and live radar floorplans.',
        features: ['16K Equirectangular panoramas', 'Interactive architectural specs', 'Synchronized radar floorplan', 'White-label embed player'],
        href: '/xr-world/virtual-tour'
      }
    ]
  }
};

export const servicesData: Record<string, ServicePageData> = {
  'studio-exterior': {
    title: 'Exterior Architectural Visualization',
    category: 'Studio',
    badge: 'Photorealistic CGI',
    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85',
    tagline: 'Capturing monumental architectural form, environmental context, and natural illumination.',
    description: 'We translate CAD blueprints and BIM models into emotionally evocative, photorealistic exterior imagery. Our team meticulously simulates real-world sun trajectories, physical atmospheric scattering, true-to-spec vegetation, and photometrically calibrated materials.',
    benefits: [
      { title: 'Physically Based Shading', desc: 'Accurate specular reflections, sub-surface light scattering, and weathered material nuances.' },
      { title: 'Environmental Lighting Studies', desc: 'Visualizing golden hour, crisp morning light, overcast Scandinavian moods, and evening twilight illumination.' },
      { title: 'Landscape & Drone Integration', desc: 'Seamlessly matching architectural CGI into existing aerial drone photography and surrounding urban density.' }
    ],
    process: [
      { step: 1, title: 'CAD/BIM Import & Clean', desc: 'Optimization of geometry, terrain mapping, and architectural coordinate alignment.' },
      { step: 2, title: 'Camera & Composition', desc: 'Proposing 5 to 10 cinematic perspectives that emphasize scale and architectural proportion.' },
      { step: 3, title: 'Lighting & Texturing', desc: 'Calibrating HDRI environments and customized material shaders according to physical specifications.' },
      { step: 4, title: 'High-Res 8K Production', desc: 'Multi-pass rendering with meticulous post-production color grading.' }
    ],
    deliverables: ['Ultra 8K Stills (TIFF/PNG/JPG)', 'Day/Night Illumination Pairs', 'Aerial Master Plan Views', 'Print-ready CMYK Conversions'],
    faq: [
      { q: 'What resolution are exterior renders delivered in?', a: 'Standard delivery is 8K (7680x4320) at 300 DPI for billboard, print brochure, and ultra-high-definition digital displays.' },
      { q: 'Can you match specific physical cladding samples?', a: 'Yes. You can send manufacturer specs, RAL codes, or physical photo references, and we formulate custom PBR material maps.' }
    ]
  },
  'studio-interior': {
    title: 'Interior Architectural Visualization',
    category: 'Studio',
    badge: 'Interior Staging',
    heroImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=85',
    tagline: 'Sensory spatial experiences highlighting bespoke furniture, tactile textures, and ambient light.',
    description: 'Our interior visualizations capture the refined tactile elegance of luxury spaces. From bookmatched Calacatta marble to textured wool upholstery and bespoke architectural lighting fixtures, we craft scenes that ignite emotional buyer desire.',
    benefits: [
      { title: 'Bespoke Furniture Modeling', desc: 'Exact 3D replications of high-end designer pieces from Minotti, Poliform, B&B Italia, and custom cabinetry.' },
      { title: 'Complex Interior Lighting', desc: 'Simulating layered architectural recessed lighting, LED covings, natural window illumination, and fireplace warmth.' },
      { title: 'Material Richness', desc: 'True micro-roughness on brushed metals, open-pore woods, hand-tufted carpets, and transparent drapery.' }
    ],
    process: [
      { step: 1, title: 'Floorplan & Moodboard Study', desc: 'Analyzing interior architectural drawings, ceiling heights, and finishes palette.' },
      { step: 2, title: 'Spatial Staging & Cameras', desc: 'Placing curated furniture configurations and establishing intimate and wide-angle viewpoints.' },
      { step: 3, title: 'Lighting Calibration', desc: 'Balancing artificial luminaire Kelvin temperatures with exterior natural daylight.' },
      { step: 4, title: 'Detailing & Polish', desc: 'Adding micro-details such as art books, decorative flora, and subtle organic drapery wrinkles.' }
    ],
    deliverables: ['8K Interior Perspective Stills', 'Material Close-up Vignettes', '360° Spherical Panoramic Nodes', 'Interactive Color Option Sheets'],
    faq: [
      { q: 'Can we change furniture items during the revision phase?', a: 'Yes, draft stages are intentionally designed for furniture layout and material customization before final render output.' },
      { q: 'Can you render both daylight and evening ambient lighting?', a: 'Yes, we frequently produce day/dusk packages to showcase both natural light and architectural fixture ambience.' }
    ]
  },
  'studio-walkthrough': {
    title: 'Cinematic Walkthrough Animation',
    category: 'Studio',
    badge: '4K 60FPS Film',
    heroImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1800&q=85',
    tagline: 'Dynamic motion pictures that breathe life, pacing, and human emotion into unbuilt spaces.',
    description: 'Transforming blueprints into unforgettable 4K architectural films. We direct camera motions with cinematic fluidity, orchestrate sunlight transitions across space, and compose custom musical and spatial sound designs.',
    benefits: [
      { title: 'Cinematic Camera Direction', desc: 'Smooth dolly shots, crane rises, drone sweeps, and gentle focal rack focusing.' },
      { title: 'Dynamic Atmospheric Physics', desc: 'Wind in surrounding foliage, flowing water ripples, changing sunlight, and ambient interior motion.' },
      { title: 'Sound Design & Mastering', desc: 'Custom tailored musical composition and authentic spatial audio mixing.' }
    ],
    process: [
      { step: 1, title: 'Animatic Storyboarding', desc: 'Creating a low-poly camera trajectory animatic timed precisely to the musical beat.' },
      { step: 2, title: 'High-Fidelity Animation', desc: 'Simulating cloth physics, foliage wind movement, and animated lighting transitions.' },
      { step: 3, title: 'GPU Cloud Rendering', desc: 'Rendering thousands of individual frames in high-bitrate ProRes and 4K MP4 formats.' },
      { step: 4, title: 'Color Grading & Audio Master', desc: 'Final post-production film colorist grading and audio mastering.' }
    ],
    deliverables: ['4K Ultra HD Master Video (ProRes / MP4)', 'Social Media Cuts (9:16 Vertical & 1:1 Square)', 'Motion Graphic Title Cards', 'Isolated Audio Stems'],
    faq: [
      { q: 'What is the turnaround time for a 90-second architectural animation?', a: 'Typical turnaround is 3 to 4 weeks, with storyboard signoff within the first 7 days.' }
    ]
  },
  'xr-webxr': {
    title: 'WebXR Spatial Engine',
    category: 'XR World',
    badge: 'Zero-Install 3D',
    heroImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1800&q=85',
    tagline: 'Explore architectural spaces interactively in any web browser with 60 FPS real-time WebGL/WebGPU.',
    description: 'WebXR brings frictionless interactive 3D to the web. Buyers and stakeholders can rotate, orbit, fly inside, and inspect architectural models on phones, laptops, and VR headsets with a single URL click.',
    benefits: [
      { title: 'Zero Friction Access', desc: 'No app download, no plugins, no installation barriers for prospective buyers.' },
      { title: 'Material & Variant Swapping', desc: 'Real-time switching of flooring, wall finishes, and lighting scenes in browser.' },
      { title: 'Ultra-Fast Web Load Times', desc: 'Optimized Draco-compressed 3D assets loaded in under 3 seconds over standard mobile networks.' }
    ],
    process: [
      { step: 1, title: 'Mesh Optimization & Baking', desc: 'Converting high-poly CAD/BIM into lightweight, high-performance real-time geometry with baked global illumination.' },
      { step: 2, title: 'Babylon.js Web Engine Setup', desc: 'Configuring camera boundaries, collision detection, and responsive touch controls.' },
      { step: 3, title: 'Interactive Features & UI', desc: 'Building custom floorplan navigation, material switchers, and spatial measurement tools.' },
      { step: 4, title: 'Cloud CDN Deployment', desc: 'Deploying worldwide edge-cached WebXR bundles with live analytics tracking.' }
    ],
    deliverables: ['Custom Branded WebXR Experience URL', 'Iframe Embed Codes for Website Integration', 'Self-Hosted WebGL Static Package', 'Real-Time User Analytics Dashboard'],
    faq: [
      { q: 'Will WebXR work on an iPhone or Android phone?', a: 'Yes! Our WebXR framework runs smoothly on iOS Safari and Android Chrome.' }
    ]
  },
  'xr-webar': {
    title: 'WebAR Augmented Reality',
    category: 'XR World',
    badge: 'Real-World Scale',
    heroImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1800&q=85',
    tagline: 'Project building massing and luxury residences directly onto physical tables or on-site land parcels.',
    description: 'WebAR enables buyers to experience unbuilt architecture in their living room, sales center desk, or directly on the construction site using their phone camera.',
    benefits: [
      { title: 'Tabletop Architectural Scale', desc: 'Inspect architectural models from any angle by walking around a physical table.' },
      { title: '1:1 True Real-World Scale', desc: 'Step onto the raw construction land plot and view the virtual building superimposed at true size.' },
      { title: 'Instant QR Code Activation', desc: 'Print QR codes on real estate marketing brochures to immediately launch AR in browser.' }
    ],
    process: [
      { step: 1, title: 'AR Asset Optimization', desc: 'Formulating USDZ (iOS Quick Look) and GLB (Android Model Viewer) formats.' },
      { step: 2, title: 'Plane Detection Calibration', desc: 'Configuring surface tracking and physical shadow projection.' },
      { step: 3, title: 'Interaction HUD Design', desc: 'Adding scale adjustment gestures, rotation sliders, and detail callouts.' },
      { step: 4, title: 'Packaging & QR Delivery', desc: 'Generating high-res vector QR codes for physical print collateral.' }
    ],
    deliverables: ['Universal WebAR QR Codes & Shortlinks', 'Optimized GLB & USDZ 3D Files', 'Brochure Print Integration Assets'],
    faq: [
      { q: 'Does WebAR require an app download?', a: 'No, WebAR activates instantly via native Safari Quick Look and Chrome Scene Viewer on modern iOS and Android devices.' }
    ]
  },
  'xr-virtual-reality': {
    title: 'Virtual Reality Immersive Experience',
    category: 'XR World',
    badge: 'Full Immersion',
    heroImage: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&w=1800&q=85',
    tagline: 'Step directly inside unbuilt architectural masterworks with true spatial depth and presence.',
    description: 'Engineered for Meta Quest 3, Apple Vision Pro, and PC VR headsets. Provides full spatial freedom of movement, natural hand interactions, and realistic scale comprehension.',
    benefits: [
      { title: 'True Spatial Presence', desc: 'Feel ceiling heights, spatial volume, and sightlines exactly as they will exist in reality.' },
      { title: 'Interactive Spatial Controls', desc: 'Open virtual doors, adjust lighting, and teleport between rooms using natural hand gestures.' },
      { title: 'Kiosk Sales Center Mode', desc: 'Designed for effortless sales center kiosk presentations with guided operator controls.' }
    ],
    process: [
      { step: 1, title: 'High-Presence Scene Setup', desc: 'Calibrating 90 FPS stereoscopic visuals with spatial audio reflections.' },
      { step: 2, title: 'Teleportation & Comfort', desc: 'Implementing nausea-free teleportation zones and field-of-view comfort vignettes.' },
      { step: 3, title: 'Headset Optimization', desc: 'Fine-tuning shader performance for standalone wireless VR headsets.' }
    ],
    deliverables: ['WebXR Headset Direct URL', 'Standalone Meta Quest APK / VisionOS Web Package', 'Operator Remote Companion Tablet App'],
    faq: [
      { q: 'Can we operate this at a sales gallery booth?', a: 'Yes! We provide single-click kiosk modes that allow your sales team to guide the client from an iPad while they wear the headset.' }
    ]
  },
  'xr-virtual-tour': {
    title: '360° Spherical Virtual Tour',
    category: 'XR World',
    badge: '8K Panoramic Nodes',
    heroImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1800&q=85',
    tagline: 'Crystal-clear 16K panoramic exploration with interactive hotspots, floorplans, and radar compass.',
    description: 'Lightweight, ultra-high-resolution panoramic tours with smooth camera momentum, spatial audio, interactive specification tags, and seamless room-to-room teleportation.',
    benefits: [
      { title: '16K Ultra-Res Clarity', desc: 'Razor-sharp equirectangular captures allowing deep zoom into fine material details.' },
      { title: 'Spatial Hotspots & Notes', desc: 'Clickable annotations revealing material specs, appliance models, and dimension popups.' },
      { title: 'Interactive Mini-Map Radar', desc: 'Synchronized 2D architectural floorplan showing real-time user orientation and position.' }
    ],
    process: [
      { step: 1, title: 'Panoramic Node Rendering', desc: 'Rendering seamless 360 equirectangular images at multiple high-value vantage points.' },
      { step: 2, title: 'Hotspot & Floorplan Integration', desc: 'Placing interactive pins and aligning camera yaw angles with floorplan blueprints.' },
      { step: 3, title: 'Cross-Device Optimization', desc: 'Generating multi-resolution tiles for instant streaming on low-bandwidth networks.' }
    ],
    deliverables: ['Custom Branded 360 Tour Portal', 'Iframe Embed Snippet', 'Offline Local Presentation Package'],
    faq: [
      { q: 'Can we update hotspots after the tour is live?', a: 'Yes, our Admin CMS allows real-time text and hotspot modifications without re-rendering the imagery.' }
    ]
  },
  'xr-pixel-streaming': {
    title: 'Cloud Pixel Streaming',
    category: 'XR World',
    badge: 'FLAGSHIP TECHNOLOGY',
    heroImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1800&q=85',
    tagline: 'Unreal Engine 5.4 Lumen photorealism rendered in the cloud and streamed live with sub-30ms latency.',
    description: 'The pinnacle of architectural spatial technology. Stream Hollywood-grade CGI in real-time to any standard smartphone, laptop, or showroom touchscreen without requiring high-end graphics hardware.',
    benefits: [
      { title: 'Hollywood Lumen Lighting', desc: 'Real-time ray tracing, dynamic global illumination, and nanite virtualized geometry.' },
      { title: 'Instant Material & Time Swapping', desc: 'Adjust time of day, weather, interior layouts, and finishes interactively at 60 FPS.' },
      { title: 'Sub-30ms Ultra-Low Latency', desc: 'WebRTC video streaming delivers instant touch response from cloud GPU clusters.' }
    ],
    process: [
      { step: 1, title: 'Unreal Engine 5 Build', desc: 'Constructing the master interactive architectural scene with Lumen lighting and physics.' },
      { step: 2, title: 'Cloud GPU Deployment', desc: 'Provisioning auto-scaling GPU nodes in edge server locations across North America, Europe, and Asia.' },
      { step: 3, title: 'WebRTC Interface Pairing', desc: 'Customizing touch UI controls, customization palettes, and live sales presenter controls.' }
    ],
    deliverables: ['Dedicated Pixel Streaming Web Portal', 'Sales Center Kiosk Launcher', 'GPU Auto-Scaling Infrastructure & Health Monitoring'],
    faq: [
      { q: 'What internet speed does the client need to view Pixel Streaming?', a: 'A standard 15-25 Mbps broadband or 4G/5G mobile connection provides a smooth 1080p/4K 60FPS stream.' },
      { q: 'How do you handle multiple simultaneous users?', a: 'Our cloud orchestration automatically scales GPU instances on demand to support hundreds of concurrent sales sessions.' }
    ]
  }
};

export const blogPosts = [
  {
    slug: 'future-of-architectural-visualization-2026',
    title: 'The Shift from Static 2D Renders to Cloud Pixel Streaming in 2026',
    excerpt: 'How real-time Unreal Engine streaming is dismantling traditional off-plan real estate sales cycles and boosting luxury developer pre-sales.',
    author: 'Alexander Vance',
    authorRole: 'Head of XR Innovation',
    date: 'February 20, 2026',
    readTime: '6 min read',
    category: 'Technology & Real Estate',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    content: `The architectural visualization industry is experiencing its most decisive transformation in two decades. For years, luxury developers relied on static 8K images and pre-rendered flythrough animations to market multi-million dollar residences.

While static renders will always retain their place for high-gloss print magazines and billboard campaigns, modern high-net-worth buyers expect interactive agency. They want to walk to the balcony, see what the sunset looks like at 7:30 PM in mid-July, and test how Italian walnut compares against fluted stone millwork.

### The Rise of Zero-Install WebXR and Cloud Streaming

Until recently, running high-fidelity real-time 3D required installing multi-gigabyte native desktop applications or distributing proprietary hardware headsets. Cloud Pixel Streaming eliminates this barrier entirely.

By rendering Unreal Engine 5 Lumen scenes on cloud-hosted enterprise GPUs and delivering the interactive feed via ultra-low-latency WebRTC streams, prospective buyers can tour complex skyscrapers directly from an iPhone Safari browser.

### Key Business Impacts for Developers

1. **Pre-Sales Acceleration**: Buyers who physically understand room proportions and sightlines make purchasing commitments significantly faster.
2. **Global Remote Investor Reach**: Investors in Singapore or London can tour New York or Dubai penthouses with synchronized guidance from the sales director.
3. **Drastic Reduction in Marketing Revision Overhead**: Real-time material adjustability means design modifications are reflected live without weeks of re-rendering.`
  },
  {
    slug: 'calibrating-photometric-lighting-in-scandinavian-architecture',
    title: 'Calibrating True Photometric Illumination in Nordic Architecture',
    excerpt: 'A technical deep-dive into balancing low winter sun angles, diffused overcast atmospheres, and warm interior lighting in CGI.',
    author: 'Elena Rostova',
    authorRole: 'Principal Lighting Artist',
    date: 'February 12, 2026',
    readTime: '8 min read',
    category: 'Visualization Craft',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    content: `Rendering architecture in extreme latitudes presents unique optical challenges. The Scandinavian winter sun never rises far above the horizon, casting long, soft shadows and tinting daylight in cold blue and pale gold hues.

To accurately visualize the Nordic Monolith coastal residence, our studio utilized calibrated spectral sky data measured in the Oslo fjord region.

### The Importance of Sub-Surface Scattering in Exposed Concrete

Raw cast-in-place concrete is often treated in CGI as a simple diffuse gray surface. In reality, concrete contains mineral aggregates, moisture absorption pockets, and subtle micro-relief that catches light at grazing angles.

By formulating multi-tiered roughness maps and subtle micro-displacement, we achieved the velvety, tactile warmth characteristic of authentic Scandinavian brutalism.`
  },
  {
    slug: 'optimizing-3d-assets-for-frictionless-webxr',
    title: 'Under 3 Seconds: Optimizing 3D Architectural Assets for WebXR',
    excerpt: 'Practical engineering methods for Draco mesh compression, PBR texture packing, and baked ambient occlusion for mobile browsers.',
    author: 'Marcus Chen',
    authorRole: 'Lead WebGL Engineer',
    date: 'January 28, 2026',
    readTime: '5 min read',
    category: 'Engineering & Web3D',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
    content: `When a prospective client taps a link in an Instagram ad or WhatsApp message, you have under four seconds before bounce rates skyrocket. Loading a 150MB architectural CAD file directly on a smartphone is out of the question.

Here is the exact pipeline we use at VizTR to compress comprehensive multi-room architectural spaces into under 12MB packages that initialize in under 2.5 seconds.`
  }
];
