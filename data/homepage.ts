export const homepageData = {
  hero: {
    headline: 'Where Architecture Meets Immersive Reality',
    subheadline: 'Premium visualization, extended reality, and pixel-perfect delivery for architects, real estate developers, and visionary designers.',
    primaryCTA: { label: 'Start Your Project', href: '/contact' },
    secondaryCTA: { label: 'Book Consultation', href: '/book-consultation' },
    tertiaryCTA: { label: 'Explore XR World', href: '/xr-world' },
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=85',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=85'
    ]
  },
  marquee: {
    items: [
      'EXTERIOR VISUALIZATION',
      'INTERIOR ARCHITECTURE',
      'CINEMATIC WALKTHROUGH',
      'WebXR ENGINE',
      'WebAR EXPERIENCES',
      'VIRTUAL REALITY',
      '8K VIRTUAL TOUR',
      'PIXEL STREAMING'
    ],
    speed: 35
  },
  serviceCategories: {
    title: 'Dual Architectural Core',
    subtitle: 'Choose between pure photorealistic studio renders or interactive real-time spatial worlds.',
    studio: {
      title: 'Studio',
      subtitle: 'Architecture Visualization Studio',
      description: 'Photorealistic renders, cinematic walkthroughs, and detailed visual narratives for master plans, high-rises, and private villas.',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      cta: 'Explore Studio Services',
      href: '/studio',
      services: ['Exterior Visualization', 'Interior Visualization', 'Walkthrough Animation']
    },
    xrWorld: {
      title: 'XR World',
      subtitle: 'Immersive Technology Experiences',
      description: 'WebXR, WebAR, VR, virtual tours, and cloud pixel streaming — zero software installation required on client devices.',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      cta: 'Explore XR World',
      href: '/xr-world',
      services: ['WebXR In-Browser', 'WebAR Mobile Projection', 'Virtual Reality Tour', '360° Spherical Hub', 'Unreal Pixel Streaming']
    }
  },
  studioPreview: {
    title: 'Studio Services',
    subtitle: 'Bringing architectural visions to life through optical precision, physical lighting, and cinematic composition.',
    services: [
      {
        id: 'exterior',
        title: 'Exterior Visualization',
        description: 'Photorealistic exterior renders that showcase architectural form, context, landscaping, and changing daylight.',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        href: '/studio/exterior',
        tag: 'Exterior'
      },
      {
        id: 'interior',
        title: 'Interior Visualization',
        description: 'Detailed interior scenes with accurate material roughness, custom bespoke furniture, and natural spatial composition.',
        image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
        href: '/studio/interior',
        tag: 'Interior'
      },
      {
        id: 'walkthrough',
        title: 'Walkthrough Animation',
        description: 'Cinematic 4K 60fps flythrough animations that weave emotion, atmospheric audio, and architectural elegance.',
        image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
        href: '/studio/walkthrough',
        tag: 'Walkthrough'
      }
    ]
  },
  xrPreview: {
    title: 'XR World Services',
    subtitle: 'Next-generation spatial computation built natively for the modern web browser.',
    services: [
      {
        id: 'webxr',
        name: 'WebXR',
        badge: 'Extended Reality',
        description: 'Native in-browser 3D architectural exploration with responsive lighting and orbital navigation.',
        href: '/xr-world/webxr',
        icon: 'Box'
      },
      {
        id: 'webar',
        name: 'WebAR',
        badge: 'Augmented Reality',
        description: 'Place 1:1 scale architectural models or building massing directly on physical desks or project sites.',
        href: '/xr-world/webar',
        icon: 'ScanLine'
      },
      {
        id: 'vr',
        name: 'Virtual Reality',
        badge: 'Full Immersion',
        description: 'High-presence VR environments optimized for Meta Quest, Apple Vision Pro, and browser headsets.',
        href: '/xr-world/virtual-reality',
        icon: 'Headset'
      },
      {
        id: 'virtual-tour',
        name: 'Virtual Tour',
        badge: '360° Exploration',
        description: 'Ultra-high-res 16K panoramic nodes featuring interactive information hotspots and spatial teleportation.',
        href: '/xr-world/virtual-tour',
        icon: 'Compass'
      },
      {
        id: 'pixel-streaming',
        name: 'Pixel Streaming',
        badge: 'FLAGSHIP',
        description: 'Cloud-rendered real-time Unreal Engine 5 experiences streamed live to any smartphone, tablet, or browser with zero lag.',
        href: '/xr-world/pixel-streaming',
        icon: 'Cpu',
        isFlagship: true
      }
    ]
  },
  showreel: {
    title: 'VizTR Showreel',
    subtitle: 'Watch our photorealistic architectural and spatial worlds in motion.',
    poster: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-minimalist-living-room-with-modern-furniture-4156-large.mp4',
    ctaText: 'View Portfolio',
    ctaHref: '/portfolio'
  },
  benefits: [
    {
      title: 'Premium Visual Presentation',
      desc: 'Photorealistic ray-traced materials that faithfully represent unbuilt architecture to discerning buyers.'
    },
    {
      title: 'Faster Client Approvals',
      desc: 'Interactive 3D and 360 review workflows reduce revision cycles by up to 60%.'
    },
    {
      title: 'No Hardware Dependency',
      desc: 'Clients can explore complex 3D and VR models instantly on standard mobile browsers.'
    },
    {
      title: 'Real-Time Spatial Interaction',
      desc: 'Dynamic daylight controls, furniture customization, and instant floorplan switching.'
    },
    {
      title: 'Improved Property Marketing',
      desc: 'Compelling cinematic assets and WebXR links ready for social, digital ads, and luxury brochures.'
    },
    {
      title: 'Stronger Buyer Confidence',
      desc: 'Immersive spatial comprehension creates visceral emotional attachment before groundbreaking.'
    },
    {
      title: 'Scalable Digital Delivery',
      desc: 'Direct cloud delivery, password-secured client portals, and live production milestone tracking.'
    }
  ],
  howItWorks: [
    {
      step: 1,
      title: 'Share Requirements',
      desc: 'Provide your CAD, Revit/BIM, 3ds Max, or SketchUp models along with material moodboards and design goals.'
    },
    {
      step: 2,
      title: 'We Create & Render',
      desc: 'Our artists and XR engineers craft geometry, calibrate physical illumination, and configure real-time shaders.'
    },
    {
      step: 3,
      title: 'Review & Collaborate',
      desc: 'Log in to your private client portal to review draft renders, mark spatial annotations, and test live XR scenes.'
    },
    {
      step: 4,
      title: 'Deliver & Track',
      desc: 'Receive master 8K imagery, cinematic 4K animations, or live interactive WebXR URLs with instant cloud archival.'
    }
  ],
  useCases: [
    {
      audience: 'Real Estate Developers',
      problem: 'Struggling to sell off-plan luxury residences before physical construction begins.',
      solution: 'Hyper-realistic interactive walkthroughs and Pixel Streaming sales center kiosks.',
      benefit: 'Accelerate pre-sales cycles and secure early high-yield deposits.'
    },
    {
      audience: 'Architects & Design Studios',
      problem: 'Difficulty conveying complex spatial geometries and material textures to non-technical clients.',
      solution: 'Zero-install WebXR 3D links and photorealistic exterior daylight studies.',
      benefit: 'Rapid design validation and winning prestigious international design competitions.'
    },
    {
      audience: 'Interior Designers',
      problem: 'Uncertainty over custom millwork, furniture scale, and ambient lighting transitions.',
      solution: 'True-to-scale photorealistic interior rendering and interactive 360 panoramic tours.',
      benefit: 'Eliminate costly on-site change orders and elevate bespoke brand prestige.'
    },
    {
      audience: 'Property Marketers',
      problem: 'Standard 2D render decks fail to engage digital-native luxury buyers.',
      solution: 'Embedded WebAR spatial models, 8K 360 virtual tours, and cinematic video flythroughs.',
      benefit: 'Triple website engagement time and boost social campaign conversion rates.'
    },
    {
      audience: 'Enterprise & Hospitality',
      problem: 'Global stakeholders unable to physically inspect distant resort and resort developments.',
      solution: 'Cloud Pixel Streaming sessions with synchronized multi-user guided tours.',
      benefit: 'Seamless remote investor presentations and global stakeholder consensus.'
    }
  ],
  testimonials: [
    {
      quote: 'VizTR delivered an astonishing WebXR experience for our flagship Roppongi tower. Our investors were able to walk through penthouse floorplans right in their browser without downloading any apps.',
      clientName: 'Kenji Takahashi',
      role: 'Managing Director, Mori Building Development',
      rating: 5
    },
    {
      quote: 'The level of photometric accuracy and material fidelity in their Scandinavian villa renders was flawless. The project tracking portal kept our entire studio aligned.',
      clientName: 'Astrid Lindholm',
      role: 'Lead Architect, Snøhetta Atelier Group',
      rating: 5
    },
    {
      quote: 'Their Pixel Streaming solution powered our luxury Dubai showroom. Customers could customize marble finishes in real-time on our iPad displays with zero latency.',
      clientName: 'Tariq Al-Mansoor',
      role: 'VP of Development, Al-Jazeera Hospitality',
      rating: 5
    }
  ],
  stats: [
    { label: 'Completed Projects', value: '200+' },
    { label: 'Global Clients', value: '50+' },
    { label: 'Countries Served', value: '15+' },
    { label: 'Client Satisfaction', value: '99%' }
  ],
  faq: [
    {
      q: 'What file formats can I provide for architectural visualization?',
      a: 'We accept Revit (.rvt), Rhino (.3dm), SketchUp (.skp), ArchiCAD (.pln), AutoCAD (.dwg), 3ds Max (.max), FBX, and IFC files along with reference photography or PDF moodboards.'
    },
    {
      q: 'What is WebXR and do my clients need to install special software?',
      a: 'No software or plugin installation is required. WebXR runs natively in modern web browsers (Chrome, Safari, Edge, Firefox) on laptops, tablets, and smartphones.'
    },
    {
      q: 'How does Cloud Pixel Streaming work?',
      a: 'We host high-end Unreal Engine 5.4 instances on cloud GPU servers. The photorealistic scene is rendered in the cloud and streamed as an interactive video stream (under 30ms latency) to your client\'s device.'
    },
    {
      q: 'What is the typical timeline for an exterior or interior visualization?',
      a: 'Standard studio render packages typically require 5 to 10 business days depending on complexity and revision rounds. Rush timelines are available upon request.'
    },
    {
      q: 'How does the Client Project Tracking system work?',
      a: 'Every project receives a dedicated Project ID and secure Access Code. You can log into your client portal at any time to monitor the 7 production stages, review draft markups, and download master assets.'
    },
    {
      q: 'Can 360 Virtual Tours be embedded on our company website or listing?',
      a: 'Yes! We provide clean iframe embed codes, standalone responsive URLs, and self-hosted WebGL packages that integrate seamlessly with any CMS or property portal.'
    },
    {
      q: 'Can we request VR headset support for sales centers?',
      a: 'Absolutely. All our XR tours support WebXR immersive VR mode with one-click headset detection for Meta Quest 2/3/Pro, Apple Vision Pro, and HTC Vive.'
    },
    {
      q: 'How do we get started with VizTR?',
      a: 'You can submit a project brief via our Contact page or Book a Consultation call. Our visual directors will review your files and provide a detailed timeline and proposal within 24 hours.'
    }
  ]
};
