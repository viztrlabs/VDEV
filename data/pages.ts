export interface ServicePageData {
  title: string;
  category: string;
  badge: string;
  heroBadge: string;
  heroImage: string;
  tagline?: string;
  description: string;
  subtitle: string;
  capabilities: string[];
  benefits?: Array<{
    title: string;
    desc: string;
  }>;
  process?: Array<{
    step: number;
    title: string;
    desc: string;
  }>;
  deliverables: string[];
  gallery: string[];
  faq?: Array<{
    q: string;
    a: string;
  }>;
  services?: Array<{
    id: string;
    title: string;
    desc: string;
    features: string[];
    href: string;
    image: string;
  }>;
}

export type ServicePageKey = 'exterior' | 'interior' | 'walkthrough' | 'xr-gaussian-splat' | 'xr-pixel-streaming' | 'studioHub' | 'xrHub' | 'vr' | 'virtualTour' | 'webar';

export const servicePagesData: Record<ServicePageKey, ServicePageData> = {
  exterior: {
    title: 'Exterior Architectural Visualization',
    category: 'Studio',
    badge: 'Photorealistic CGI',
    heroBadge: 'Photorealistic CGI',
    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85',
    subtitle: 'Monumental architectural form, environmental context, and physical lighting.',
    description: 'We translate CAD blueprints and BIM models into emotionally evocative, photorealistic exterior imagery. Our team meticulously simulates real-world sun trajectories, physical atmospheric scattering, true-to-spec vegetation, and photometrically calibrated materials.',
    capabilities: [
      'Spectral HDRI lighting & real-world geographic sun simulation',
      'High-poly procedural foliage & biophilic landscaping',
      'Drone matching & surrounding context photomontage',
      'Photogrammetry-driven texture mapping and integration'
    ],
    benefits: [
      {
        title: 'Photorealistic Realism',
        desc: 'Physical lighting and atmospheric effects that fool the eye'
      },
      {
        title: 'Contextual Accuracy',
        desc: 'Precise representation of site-specific conditions'
      },
      {
        title: 'Quick Iteration',
        desc: 'Rapid visualization with photorealistic quality'
      }
    ],
    process: [
      {
        step: 1,
        title: 'Site Assessment & Lighting Analysis',
        desc: 'Evaluate solar path, shadows, and environmental conditions'
      },
      {
        step: 2,
        title: 'Model Preparation & Enhancement',
        desc: 'Optimize CAD/BIM data for rendering efficiency'
      },
      {
        step: 3,
        title: 'Lighting Setup & Materials',
        desc: 'Configure physically accurate lighting and materials'
      },
      {
        step: 4,
        title: 'Render & Refine',
        desc: 'Production rendering with iterative quality checks'
      }
    ],
    deliverables: [
      'Ultra-HD cinematic renders (4K+)',
      '360° interactive walkthroughs',
      'Virtual reality simulations',
      'Photorealistic stills and animations',
      'Lighting analysis and sun path reports'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    faq: [
      {
        q: 'What makes your exterior renderings different?',
        a: 'Our renderings combine architectural precision with cinematic storytelling, using physically accurate lighting and materials that create emotionally compelling environments.'
      },
      {
        q: 'How long does a typical exterior visualization take?',
        a: 'Most exterior projects range from 3-10 days depending on complexity, with initial concepts delivered within 48-72 hours.'
      },
      {
        q: 'Do you work with existing CAD files?',
        a: 'Yes! We accept all major CAD formats and can import directly into our rendering pipeline for seamless integration.'
      }
    ],
    services: [
      {
        id: 'exterior-cgi',
        title: 'Exterior CGI & Architectural Visualization',
        desc: 'Photorealistic exterior imagery for architecture, planning, and marketing',
        features: [
          'Cinematic lighting and atmosphere',
          'Photogrammetry integration',
          'Environmental context',
          'Interactive walkthroughs'
        ],
        href: '/exterior',
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'urban-context',
        title: 'Urban Context & Integration',
        desc: 'Seamless integration with surrounding urban environment and context',
        features: [
          'Drone survey integration',
          'Shadow analysis',
          'Site-specific vegetation',
          'Cultural heritage considerations'
        ],
        href: '/urban-context',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  'xr-gaussian-splat': {
    title: 'Gaussian Splatting 3D Capture',
    category: 'XR World',
    badge: '3D CAPTURE TECH',
    heroBadge: 'Real-Time 3D From Photos',
    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85',
    tagline: 'Revolutionary 3D capture technology that transforms photos into interactive Gaussian Splatting scenes.',
    description: 'Gaussian Splatting represents a breakthrough in 3D representation, using millions of 3D Gaussians to create photorealistic, real-time renderable scenes with unprecedented detail and performance.',
    subtitle: 'Real-time 3D from everyday photos',
    capabilities: [
      'Instant 3D conversion from photo collections',
      'Real-time WebGL/WebGPU rendering at 60+ FPS',
      'Photorealistic lighting and material accuracy',
      'Interactive 3D scene manipulation and exploration'
    ],
    benefits: [
      {
        title: 'Instant 3D Creation',
        desc: 'Transform hundreds of photos into immersive 3D scenes in minutes'
      },
      {
        title: 'Real-time Performance',
        desc: 'Experience smooth, interactive 3D rendering in any browser'
      },
      {
        title: 'Photorealistic Quality',
        desc: 'Achieve cinematic visual fidelity with accurate lighting and materials'
      }
    ],
    process: [
      {
        step: 1,
        title: 'Photo Collection & Processing',
        desc: 'Upload and preprocess photo collections for optimal 3D reconstruction'
      },
      {
        step: 2,
        title: 'Gaussian Splatting Training',
        desc: 'AI-powered training creates millions of 3D Gaussians from your images'
      },
      {
        step: 3,
        title: 'WebGL/WebGPU Optimization',
        desc: 'Optimize 3D scenes for real-time browser rendering'
      },
      {
        step: 4,
        title: 'Interactive Showcase',
        desc: 'Deploy immersive 3D experiences for exploration and presentation'
      }
    ],
    deliverables: [
      'Interactive Gaussian Splatting web pages',
      '360° camera paths and animations',
      'Real-time scene manipulation controls',
      'Performance-optimized 3D assets',
      'Analytics and engagement tracking'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560518881-e2c60c24623f?auto=format&fit=crop&w=1200&q=80'
    ],
    faq: [
      {
        q: 'What is Gaussian Splatting and how does it work?',
        a: 'Gaussian Splatting is a novel 3D representation technique that uses millions of 3D Gaussians to create photorealistic scenes. Each Gaussian contains position, orientation, scale, and color information for ultra-realistic rendering.'
      },
      {
        q: 'What kind of photos work best for this service?',
        a: 'A collection of 20-100+ photos taken from different angles and perspectives works best. Consistent lighting and overlapping coverage produce the best results.'
      },
      {
        q: 'Can I interact with the 3D scenes?',
        a: 'Yes! All Gaussian Splatting scenes are fully interactive with mouse/keyboard controls for camera movement, object selection, and scene exploration.'
      }
    ],
    services: [
      {
        id: 'gaussian-splat-demo',
        title: 'Gaussian Splatting Interactive Demo',
        desc: 'Live demonstration of real-time 3D rendering from photos',
        features: [
          'Interactive 3D scene exploration',
          'Real-time camera controls',
          'Object manipulation and selection',
          'Performance statistics and analytics'
        ],
        href: '/gaussian-splat',
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'photo-to-3d',
        title: 'Photo-to-3D Conversion Service',
        desc: 'Professional conversion of photo collections into interactive 3D scenes',
        features: [
          'AI-powered 3D reconstruction',
          'Optimized for web performance',
          'Customizable 3D scene controls',
          'Branding and customization options'
        ],
        href: '/photo-to-3d',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  'xr-pixel-streaming': {
    title: 'Cloud Pixel Streaming',
    category: 'XR World',
    badge: 'REAL-TIME CLOUD RENDERING',
    heroBadge: 'Zero-Install XR Experiences',
    heroImage: 'https://images.unsplash.com/photo-1560518881-e2c60c24623f?auto=format&fit=crop&w=1800&q=85',
    tagline: 'Access complex 3D applications from any device, instantly.',
    description: 'Cloud pixel streaming delivers high-performance 3D rendering over the internet, eliminating the need for downloads, installations, or powerful hardware.',
    subtitle: 'Unleash powerful 3D applications instantly',
    capabilities: [
      'Instant access to complex 3D software',
      'High-quality streaming over standard internet connections',
      'Multi-user collaborative experiences',
      'Scalable cloud rendering infrastructure'
    ],
    benefits: [
      {
        title: 'Zero Installation',
        desc: 'Launch complex 3D applications instantly from any browser'
      },
      {
        title: 'Hardware Independence',
        desc: 'Access professional-grade 3D tools on any device'
      },
      {
        title: 'Collaborative Spaces',
        desc: 'Real-time multi-user 3D collaboration and sharing'
      }
    ],
    process: [
      {
        step: 1,
        title: 'Application Selection',
        desc: 'Choose from library of cloud-rendered 3D applications'
      },
      {
        step: 2,
        title: 'Streaming Setup',
        desc: 'Automatic configuration for optimal streaming performance'
      },
      {
        step: 3,
        title: 'Real-time Access',
        desc: 'Launch and use professional 3D tools instantly'
      },
      {
        step: 4,
        title: 'Collaboration & Sharing',
        desc: 'Share access and collaborate with team members in real-time'
      }
    ],
    deliverables: [
      'Streaming application portals',
      'Custom user interfaces and dashboards',
      'Performance monitoring and analytics',
      'Multi-user collaboration features',
      'Security and access controls'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1560518881-e2c60c24623f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    faq: [
      {
        q: 'What kind of applications can I stream?',
        a: 'We support a wide range of 3D applications including modeling software, game engines, CAD programs, and specialized 3D design tools.'
      },
      {
        q: 'How much bandwidth do I need?',
        a: 'Typical applications require 5-50 Mbps depending on complexity and quality settings. Our adaptive streaming adjusts automatically to your connection.'
      },
      {
        q: 'Can I collaborate with others?',
        a: 'Absolutely! Our platform supports real-time multi-user collaboration with shared workspaces and synchronized 3D environments.'
      }
    ],
    services: [
      {
        id: 'pixel-streaming-portal',
        title: 'Pixel Streaming Portal',
        desc: 'Custom portal for streaming 3D applications',
        features: [
          'Application library management',
          'Performance optimization',
          'User authentication and access',
          'Analytics and usage tracking'
        ],
        href: '/pixel-streaming',
        image: 'https://images.unsplash.com/photo-1560518881-e2c60c24623f?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'cloud-3d-apps',
        title: 'Cloud 3D Application Suite',
        desc: 'Professional suite of cloud-rendered 3D applications',
        features: [
          'Modeling and design tools',
          'Real-time collaboration',
          'Version control and backup',
          'Custom integration options'
        ],
        href: '/cloud-3d-apps',
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  interior: {
    title: 'Interior Architectural Visualization',
    category: 'Studio',
    badge: 'LUXURY INTERIORS',
    heroBadge: 'Luxury Interior CGI',
    heroImage: 'https://images.unsplash.com/photo-1493809842364-78817add8ffb?auto=format&fit=crop&w=1800&q=85',
    subtitle: 'Curated materials, custom FF&E, and bespoke lighting moods for interior spaces.',
    description: 'We craft hyper-realistic interior visualizations with physically accurate materials, custom FF&E specification, and cinematic lighting that captures the essence of every curated surface.',
    capabilities: [
      'PBR material authoring with microfiber displacement and sheen',
      'Natural marble and stone book-matching',
      'Metal finishing and patina simulation',
      'Custom FF&E integration and staging'
    ],
    deliverables: [
      '8K ultra-high-resolution stills',
      '360° interior panoramas',
      'Animated walkthrough sequences',
      'Virtual staging with custom furniture'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1493809842364-78817add8ffb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2400&q=85'
    ],
    process: [
      { step: 1, title: 'Space Planning & FF&E Spec', desc: 'Analyze floor plan and specify custom furniture and fixtures' },
      { step: 2, title: 'Material Library Curation', desc: 'Select and configure PBR materials for all surfaces' },
      { step: 3, title: 'Lighting Mood Design', desc: 'Design cinematic lighting scenarios for the space' },
      { step: 4, title: 'Render & Refinement', desc: 'Execute high-fidelity renders with final client review' }
    ]
  },
  walkthrough: {
    title: 'Architectural Walkthrough Animation',
    category: 'Studio',
    badge: 'CINEMATIC MOTION',
    heroBadge: 'Architectural Film Studio',
    heroImage: 'https://images.unsplash.com/photo-1580293848491-3d8166032018?auto=format&fit=crop&w=1800&q=85',
    subtitle: 'Cinematic camera movement through architectural sequences with real-world physics.',
    description: 'We choreograph cinematic camera paths through your architectural designs, combining real-world physics, dramatic lighting transitions, and storytelling to create compelling animated walkthroughs.',
    capabilities: [
      'Cinematic camera path choreography with real physics',
      'HDR time-of-day lighting progression',
      'Material weathering and aging simulation',
      '4K stereo and HDR10 output'
    ],
    deliverables: [
      '4K UHD animated walkthrough (60fps)',
      'Stereo 3D and HDR10 variants',
      'Interactive real-time version',
      'Storyboard and animatic previews'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1580293848491-3d8166032018?auto=format&fit=crop&w=1200&q=80'
    ],
    process: [
      { step: 1, title: 'Camera Path Choreography', desc: 'Design cinematic camera movements with physics-based motion' },
      { step: 2, title: 'Lighting & Atmosphere', desc: 'Set up HDR lighting with time-of-day progression' },
      { step: 3, title: 'Material & Asset Detailing', desc: 'Apply weathering, aging, and surface imperfections' },
      { step: 4, title: 'Render & Post-Production', desc: 'Execute final renders with color grading and compositing' }
    ]
  },
  studioHub: {
    title: 'Studio Hub',
    category: 'Services',
    badge: 'CREATIVE WORKSPACE',
    heroBadge: 'Professional Studio Tools',
    heroImage: 'https://images.unsplash.com/photo-1560518881-e2c60c24623f?auto=format&fit=crop&w=1800&q=85',
    tagline: 'All your creative tools in one unified workspace.',
    description: 'Studio Hub provides a comprehensive creative workspace with integrated tools for architectural visualization, 3D modeling, and collaborative design workflows.',
    subtitle: 'Your complete creative studio solution',
    capabilities: [
      'Integrated design and visualization tools',
      'Collaborative project management',
      'Asset library and resource management',
      'Real-time preview and rendering'
    ],
    benefits: [
      {
        title: 'Unified Workspace',
        desc: 'All creative tools integrated in one seamless environment'
      },
      {
        title: 'Team Collaboration',
        desc: 'Real-time collaboration with team members and clients'
      },
      {
        title: 'Asset Management',
        desc: 'Complete library of 3D models, textures, and materials'
      }
    ],
    process: [
      {
        step: 1,
        title: 'Workspace Setup',
        desc: 'Customize your creative workspace with preferred tools'
      },
      {
        step: 2,
        title: 'Project Management',
        desc: 'Organize and manage creative projects and workflows'
      },
      {
        step: 3,
        title: 'Asset Integration',
        desc: 'Access and integrate 3D assets and resources'
      },
      {
        step: 4,
        title: 'Collaborative Creation',
        desc: 'Work together with team members in real-time'
      }
    ],
    deliverables: [
      'Custom workspace environments',
      'Project management dashboards',
      'Asset libraries and templates',
      'Real-time collaboration tools',
      'Performance analytics and reporting'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1560518881-e2c60c24623f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    faq: [
      {
        q: 'What tools are included in Studio Hub?',
        a: 'Studio Hub includes 3D modeling, visualization, asset management, project management, and real-time collaboration tools.'
      },
      {
        q: 'Can I customize the workspace?',
        a: 'Yes! Studio Hub supports extensive customization with drag-and-drop tools, custom layouts, and personalized workflows.'
      },
      {
        q: 'How does collaboration work?',
        a: 'Studio Hub provides real-time collaboration with shared workspaces, version control, and synchronized editing capabilities.'
      }
    ],
    services: [
      {
        id: 'studio-workspace',
        title: 'Studio Workspace',
        desc: 'Professional creative workspace with integrated tools',
        features: [
          '3D modeling and visualization',
          'Asset library management',
          'Real-time collaboration',
          'Project organization tools'
        ],
        href: '/studio',
        image: 'https://images.unsplash.com/photo-1560518881-e2c60c24623f?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'asset-center',
        title: 'Asset Center',
        desc: 'Comprehensive library of 3D assets and resources',
        features: [
          '3D model database',
          'Textures and materials',
          'Lighting setups',
          'Custom asset uploads'
        ],
        href: '/assets',
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  xrHub: {
    title: 'XR Hub',
    category: 'Technology',
    badge: 'IMMERSIVE EXPERIENCES',
    heroBadge: 'Virtual & Augmented Reality',
    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85',
    tagline: 'Experience the future of web-based immersive reality.',
    description: 'XR Hub delivers cutting-edge WebXR experiences that bring virtual and augmented reality to life in standard web browsers, making immersive technology accessible to everyone.',
    subtitle: 'WebXR made simple and powerful',
    capabilities: [
      'WebXR and AR/VR experiences',
      'Browser-based immersive technology',
      'Device-agnostic implementation',
      'Interactive 3D environments'
    ],
    benefits: [
      {
        title: 'Browser Access',
        desc: 'Experience XR directly in any web browser, no apps needed'
      },
      {
        title: 'Device Independence',
        desc: 'Works with VR headsets, AR devices, and standard screens'
      },
      {
        title: 'Instant Accessibility',
        desc: 'Zero installation, instant deployment of immersive experiences'
      }
    ],
    process: [
      {
        step: 1,
        title: 'XR Experience Design',
        desc: 'Design and develop immersive WebXR experiences'
      },
      {
        step: 2,
        title: 'Device Integration',
        desc: 'Implement multi-device support and interaction'
      },
      {
        step: 3,
        title: 'Browser Optimization',
        desc: 'Optimize for performance across different browsers'
      },
      {
        step: 4,
        title: 'Deployment & Testing',
        desc: 'Launch and test immersive experiences'
      }
    ],
    deliverables: [
      'WebXR application development',
      'Browser compatibility testing',
      'Mobile AR/VR experiences',
      'Interactive 3D environments',
      'Performance optimization'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560518881-e2c60c24623f?auto=format&fit=crop&w=1200&q=80'
    ],
    faq: [
      {
        q: 'What devices does WebXR support?',
        a: 'WebXR supports VR headsets, AR devices, mobile phones, tablets, and desktop computers with web browsers.'
      },
      {
        q: 'Is WebXR secure for users?',
        a: 'Yes, WebXR follows modern web security standards and provides safe, controlled immersive experiences.'
      },
      {
        q: 'How do users access XR experiences?',
        a: 'Users can access XR experiences directly in their web browser by visiting the URL - no downloads or installations required.'
      }
    ],
    services: [
      {
        id: 'webxr-experiences',
        title: 'WebXR Experiences',
        desc: 'Professional WebXR and AR/VR application development',
        features: [
          'VR headset support',
          'AR content integration',
          'Browser-based deployment',
          'Mobile optimization'
        ],
        href: '/xr',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'immersive-web',
        title: 'Immersive Web Development',
        desc: 'Cutting-edge immersive web technology implementation',
        features: [
          '3D web environments',
          'Interactive experiences',
          'Performance optimization',
          'Cross-platform compatibility'
        ],
        href: '/immersive',
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  vr: {
    title: 'Virtual Reality Studio',
    category: 'Services',
    badge: 'IMMERSIVE VIRTUAL WORLDS',
    heroBadge: 'Enter Completely Virtual Environments',
    heroImage: 'https://images.unsplash.com/photo-1560518881-e2c60c24623f?auto=format&fit=crop&w=1800&q=85',
    tagline: 'Create fully immersive virtual reality experiences.',
    description: 'Virtual Reality Studio delivers high-quality VR content and experiences, from architectural walkthroughs to interactive virtual environments, powered by cutting-edge VR technology.',
    subtitle: 'Step into completely virtual worlds',
    capabilities: [
      'High-quality VR content creation',
      'Interactive virtual environments',
      'VR headset optimization',
      'Virtual reality storytelling'
    ],
    benefits: [
      {
        title: 'Total Immersion',
        desc: 'Experience completely virtual environments with full presence'
      },
      {
        title: 'Interactive Design',
        desc: 'Create interactive VR experiences and virtual prototypes'
      },
      {
        title: 'Professional Quality',
        desc: 'Deliver cinematic VR experiences with high production values'
      }
    ],
    process: [
      {
        step: 1,
        title: 'VR Content Creation',
        desc: 'Develop 3D models and environments for VR experiences'
      },
      {
        step: 2,
        title: 'VR Optimization',
        desc: 'Optimize content for VR headset performance'
      },
      {
        step: 3,
        title: 'Interactive Elements',
        desc: 'Add interactive features and user controls'
      },
      {
        step: 4,
        title: 'VR Deployment',
        desc: 'Deploy and test VR experiences'
      }
    ],
    deliverables: [
      'VR content creation and development',
      'Interactive virtual environments',
      'VR headset optimization',
      'Virtual reality storytelling',
      'VR analytics and tracking'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1560518881-e2c60c24623f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    faq: [
      {
        q: 'What VR equipment is needed?',
        a: 'Professional VR equipment includes VR headsets like Oculus Quest, HTC Vive, and high-end gaming PCs for optimal performance.'
      },
      {
        q: 'How long does VR content creation take?',
        a: 'VR content creation typically ranges from 2-6 weeks depending on complexity, with initial concepts delivered within 3-5 days.'
      },
      {
        q: 'Can users access VR content on mobile devices?',
        a: 'Yes, we create VR content optimized for both desktop VR headsets and mobile VR experiences.'
      }
    ],
    services: [
      {
        id: 'vr-content-creation',
        title: 'VR Content Creation',
        desc: 'Professional VR content and experience development',
        features: [
          '3D environment creation',
          'Interactive VR elements',
          'VR headset optimization',
          'Virtual reality storytelling'
        ],
        href: '/vr',
        image: 'https://images.unsplash.com/photo-1560518881-e2c60c24623f?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'virtual-environments',
        title: 'Virtual Environments',
        desc: 'Custom virtual environment creation and design',
        features: [
          'Architectural VR walkthroughs',
          'Interactive virtual spaces',
          'Custom VR scene design',
          'Virtual reality prototyping'
        ],
        href: '/environments',
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  webar: {
    title: 'WebAR Augmented Reality',
    category: 'XR World',
    badge: 'AUGMENTED REALITY',
    heroBadge: 'WebAR Experiences',
    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85',
    tagline: 'Bring architectural models to life in augmented reality.',
    description: 'WebAR delivers cutting-edge augmented reality experiences that allow users to place and interact with 3D architectural models in their own environment using just a mobile browser.',
    subtitle: 'AR experiences directly in the browser',
    capabilities: [
      'Mobile AR model placement',
      'QR code triggered experiences',
      'Cross-platform WebAR',
      'No app installation required'
    ],
    benefits: [
      {
        title: 'Zero Installation',
        desc: 'Launch AR experiences directly from any mobile browser'
      },
      {
        title: 'QR Code Triggered',
        desc: 'Instant AR activation via QR codes on print and digital'
      },
      {
        title: 'Cross-Platform',
        desc: 'Works on iOS and Android without native apps'
      }
    ],
    process: [
      {
        step: 1,
        title: '3D Model Optimization',
        desc: 'Optimize architectural models for mobile AR rendering'
      },
      {
        step: 2,
        title: 'AR Experience Design',
        desc: 'Design intuitive AR interactions and placement'
      },
      {
        step: 3,
        title: 'QR Code Generation',
        desc: 'Create branded QR codes for AR activation'
      },
      {
        step: 4,
        title: 'Testing & Deployment',
        desc: 'Test across devices and deploy AR experiences'
      }
    ],
    deliverables: [
      'WebAR experiences',
      'QR code asset generator',
      'Mobile-optimized 3D models',
      'Analytics and engagement tracking'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560518881-e2c60c24623f?auto=format&fit=crop&w=1200&q=80'
    ],
    faq: [
      {
        q: 'What devices support WebAR?',
        a: 'WebAR works on most modern smartphones and tablets with iOS 12+ or Android 10+ and a compatible browser.'
      },
      {
        q: 'Do users need to install an app?',
        a: 'No! WebAR runs directly in the mobile browser - no app store download required.'
      },
      {
        q: 'How do users access the AR experience?',
        a: 'Users can scan a QR code or click a link to instantly launch the AR experience in their browser.'
      }
    ],
    services: [
      {
        id: 'webar-experiences',
        title: 'WebAR Experiences',
        desc: 'Professional WebAR implementation and deployment',
        features: [
          'Mobile AR model placement',
          'QR code triggered experiences',
          'Cross-platform WebAR',
          'No app installation required'
        ],
        href: '/webar',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  virtualTour: {
    title: 'Virtual Tours',
    category: 'Services',
    badge: 'INTERACTIVE VIRTUAL EXPLORATIONS',
    heroBadge: 'Walk Through Properties Virtually',
    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85',
    tagline: 'Take virtual tours of properties and spaces anywhere, anytime.',
    description: 'Virtual Tours delivers immersive, interactive tour experiences that allow users to explore properties, buildings, and spaces virtually, from anywhere in the world.',
    subtitle: 'Explore properties virtually, anytime',
    capabilities: [
      'Interactive virtual property tours',
      '360° virtual walkthroughs',
      'Virtual space exploration',
      'Multi-device virtual tour access'
    ],
    benefits: [
      {
        title: 'Virtual Access',
        desc: 'Explore properties and spaces from anywhere in the world'
      },
      {
        title: 'Interactive Experience',
        desc: 'Navigate virtual tours with intuitive controls'
      },
      {
        title: 'Time & Cost Efficiency',
        desc: 'Save time and money with virtual exploration options'
      }
    ],
    process: [
      {
        step: 1,
        title: 'Virtual Tour Creation',
        desc: 'Create immersive virtual tour experiences'
      },
      {
        step: 2,
        title: 'Interactive Features',
        desc: 'Add interactive elements and navigation'
      },
      {
        step: 3,
        title: 'Multi-Device Optimization',
        desc: 'Optimize for different devices and platforms'
      },
      {
        step: 4,
        title: 'Tour Deployment',
        desc: 'Deploy and test virtual tours'
      }
    ],
    deliverables: [
      'Interactive virtual tour experiences',
      '360° virtual walkthroughs',
      'Virtual space exploration',
      'Multi-device virtual tour access',
      'Virtual tour analytics and tracking'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560518881-e2c60c24623f?auto=format&fit=crop&w=1200&q=80'
    ],
faq: [
        {
          q: 'What types of properties work best with virtual tours?',
          a: 'Virtual tours work excellently for real estate properties, architectural projects, hotel suites, museum exhibits, and any space where visual exploration is valuable.'
        },
        {
          q: 'How do users navigate virtual tours?',
          a: 'Users navigate virtual tours using intuitive controls like mouse clicks, keyboard arrows, touch gestures on mobile devices, and virtual reality headsets.'
        },
        {
          q: 'Can I create custom virtual tour experiences?',
          a: 'Yes! We create custom virtual tour experiences with personalized navigation, interactive hotspots, and customized content.'
        }
      ],
    services: [
      {
        id: 'virtual-property-tours',
        title: 'Virtual Property Tours',
        desc: 'Professional virtual tours of properties and real estate',
        features: [
          'Real estate virtual tours',
          'Property walkthroughs',
          'Virtual space exploration',
          'Multi-angle virtual views'
        ],
        href: '/tours',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'virtual-experiences',
        title: 'Virtual Experiences',
        desc: 'Custom virtual tour and experience creation',
        features: [
          'Custom virtual tours',
          'Interactive virtual experiences',
          'Virtual exploration tools',
          'Virtual reality integration'
        ],
        href: '/experiences',
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
      }
    ]
  }
}

export const blogPosts = [
  {
    slug: 'future-of-architectural-visualization',
    title: 'The Future of Architectural Visualization: AI, Real-Time, and Beyond',
    excerpt: 'Explore how AI, real-time rendering, and cloud technologies are reshaping the architectural visualization industry.',
    content: [
      'The architectural visualization industry is undergoing a seismic transformation driven by emerging technologies.',
      'Real-time rendering, powered by engines like Unreal Engine 5, enables instant feedback and iteration.',
      'AI-assisted workflows are automating tedious tasks like lighting setup and material creation.',
      'Cloud-based solutions make high-end visualization accessible to firms of all sizes.',
      'WebXR technologies are bringing immersive experiences directly to browsers without installations.'
    ],
    category: 'Technology & Real Estate',
    author: 'Marcus Vance',
    authorRole: 'Chief Technology Officer',
    date: 'August 28, 2026',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    tags: ['AI', 'Real-Time', 'Visualization', 'Future Tech']
  },
  {
    slug: 'mastering-photorealistic-rendering',
    title: 'Mastering Photorealistic Rendering: A Studio Guide',
    excerpt: 'Learn the techniques and workflows behind stunning photorealistic architectural renders.',
    content: [
      'Photorealism in architectural visualization requires attention to lighting, materials, and composition.',
      'Physically-based rendering (PBR) ensures materials respond realistically to light.',
      'HDRI lighting captures real-world illumination for authentic ambiance.',
      'Post-production techniques enhance the final output without compromising realism.'
    ],
    category: 'Visualization Craft',
    author: 'Sarah Lin',
    authorRole: 'CGI & Unreal Engine Lead',
    date: 'August 20, 2026',
    readTime: '12 min read',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    tags: ['Rendering', 'Photorealism', 'PBR', 'Lighting']
  },
  {
    slug: 'webxr-spatial-computing',
    title: 'WebXR and the Future of Spatial Computing',
    excerpt: 'How WebXR is making immersive experiences accessible through standard web browsers.',
    content: [
      'WebXR eliminates the friction of app installations for immersive experiences.',
      'Browser-based VR and AR reach users across devices seamlessly.',
      'Progressive web app capabilities enable offline access to 3D content.',
      'Performance optimization techniques ensure smooth experiences on mobile devices.'
    ],
    category: 'Engineering & Web3D',
    author: 'David Kalu',
    authorRole: 'WebXR & Spatial Computing Lead',
    date: 'August 15, 2026',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1560518881-e2c60c24623f?auto=format&fit=crop&w=1200&q=80',
    tags: ['WebXR', 'Spatial Computing', 'VR', 'AR']
  },
  {
    slug: 'cloud-pixel-streaming-architecture',
    title: 'Cloud Pixel Streaming: Architecture and Implementation',
    excerpt: 'Deep dive into building scalable cloud pixel streaming infrastructure for real-time 3D.',
    content: [
      'Pixel streaming delivers high-fidelity 3D graphics to any device with a browser.',
      'Cloud GPU instances handle the heavy lifting of real-time rendering.',
      'WebRTC protocols ensure low-latency video and audio streaming.',
      'TURN servers handle NAT traversal for reliable peer connections.',
      'Auto-scaling infrastructure adapts to varying user demand.'
    ],
    category: 'Engineering & Web3D',
    author: 'Elena Rostova',
    authorRole: 'Cloud Streaming Engineer',
    date: 'August 10, 2026',
    readTime: '15 min read',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    tags: ['Pixel Streaming', 'Cloud', 'WebRTC', 'Infrastructure']
  },
  {
    slug: 'ai-generated-marketing-content',
    title: 'AI-Generated Marketing Content for Architecture',
    excerpt: 'Leveraging AI to create compelling marketing visuals and content for architectural projects.',
    content: [
      'AI tools accelerate the creation of marketing renderings and animations.',
      'Generative AI assists in concept development and mood boarding.',
      'Automated workflows reduce turnaround times for marketing deliverables.',
      'Human-AI collaboration produces the best results for client presentations.'
    ],
    category: 'Technology & Real Estate',
    author: 'Marcus Vance',
    authorRole: 'Chief Technology Officer',
    date: 'August 5, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    tags: ['AI', 'Marketing', 'Content Generation', 'Automation']
  },
  {
    slug: 'draco-compression-3d-assets',
    title: 'Draco Compression: Optimizing 3D Assets for the Web',
    excerpt: 'Technical guide to compressing 3D geometry using Draco for faster web delivery.',
    content: [
      'Draco compression reduces 3D geometry size by up to 95%.',
      'WebAssembly decoders enable fast decompression in the browser.',
      'Level-of-detail strategies balance quality and performance.',
      'Progressive loading delivers visible content faster.'
    ],
    category: 'Engineering & Web3D',
    author: 'David Kalu',
    authorRole: 'WebXR & Spatial Computing Lead',
    date: 'July 28, 2026',
    readTime: '11 min read',
    image: 'https://images.unsplash.com/photo-1560518881-e2c60c24623f?auto=format&fit=crop&w=1200&q=80',
    tags: ['Draco', 'Compression', '3D Assets', 'Web Optimization']
  }
]