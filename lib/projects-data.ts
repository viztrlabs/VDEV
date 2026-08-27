export type ProjectType =
  | 'WebXR'
  | 'WebAR'
  | 'Virtual Reality'
  | 'Virtual Tour 360'
  | 'Pixel Streaming'
  | 'Animation'
  | 'Still Renders';

export type ProjectStatus =
  | 'Complete'
  | 'Work in Progress'
  | 'Client Review'
  | 'Awaited'
  | 'Hold';

export type PaymentStatus =
  | 'Paid'
  | 'Partial 50%'
  | 'Milestone Pending'
  | 'Invoiced'
  | 'Deposit Received';

export interface TimesheetEntry {
  id: string;
  date: string;
  teamMember: string;
  role: string;
  task: string;
  hours: number;
  stage: string;
}

export interface DisciplineHours {
  discipline: string;
  hours: number;
  budgetHours: number;
  color: string;
}

export interface PipelineStage {
  stageNumber: number;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending' | 'review';
  eta: string;
  deliverablesCount: number;
  deliverablesApproved: number;
  deliverablesList?: string[];
}

export interface ProjectDocument {
  id: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'cad' | 'bim' | 'zip' | 'image';
  extension: string;
  fileSize: string;
  version: string;
  updatedAt: string;
  uploadedBy: string;
  category: string;
  description: string;
  status: 'Approved' | 'In Review' | 'Draft';
  checksum: string;
  pageCountOrUnits?: string;
}

export interface ManagedProject {
  id: string;
  name: string;
  clientName: string;
  clientEmail: string;
  clientCompany: string;
  category: string;
  projectType: ProjectType;
  status: ProjectStatus;
  paymentStatus: PaymentStatus;
  bookingAmount: number;
  progress: number;
  leadArchitect: string;
  image: string;
  lastUpdate: string;
  xrAvailable: boolean;
  pixelStreamingAvailable: boolean;
  hoursMonitoring: {
    estimatedHours: number;
    hoursSpent: number;
    hourlyRate: number;
    disciplineBreakdown: DisciplineHours[];
    timesheetEntries: TimesheetEntry[];
  };
  pipeline: {
    pipelineType: string;
    currentStageIndex: number;
    stages: PipelineStage[];
  };
  documents: ProjectDocument[];
  pendingRevisionsCount: number;
  revisionsSummary: string;
  notes?: string;
}

// 7 Tailored Pipeline Templates matching each Project Type
export const PIPELINE_TEMPLATES: Record<ProjectType, { pipelineType: string; stages: Omit<PipelineStage, 'status' | 'deliverablesApproved'>[] }> = {
  'WebXR': {
    pipelineType: 'WebXR Spatial Experience & Real-time WebGL Engine',
    stages: [
      { stageNumber: 1, title: 'BIM / CAD Ingestion & Polygon Retopology', description: 'Cleaning Rhino/Revit meshes and creating optimized LOD 0-3 assets.', eta: 'Completed', deliverablesCount: 6, deliverablesList: ['LOD Meshes (glTF)', 'UV Unwrap Sets', 'Topology Audit Report'] },
      { stageNumber: 2, title: 'PBR Materiality & Shader Graph Setup', description: 'Physically based rendering, metallic-roughness maps and glass refraction.', eta: 'Completed', deliverablesCount: 8, deliverablesList: ['4K PBR Texture Atlases', 'Custom Glazing Shaders', 'Subsurface Foliage Profiles'] },
      { stageNumber: 3, title: 'Spatial Lighting & Lightmap Baking', description: 'Baking high-dynamic range directional lightmaps for 60fps mobile WebXR.', eta: 'Completed', deliverablesCount: 4, deliverablesList: ['HDR Environment Probes', 'Baked Lightmap Texture Sets', 'Reflection Cubemaps'] },
      { stageNumber: 4, title: 'Interactive Hotspots & Spatial Audio', description: 'Navigation teleport nodes, architectural annotations, and ambient soundscapes.', eta: 'In Progress', deliverablesCount: 5, deliverablesList: ['Spatial Waypoints', 'Annotation Pins JSON', '3D Binaural Soundfield'] },
      { stageNumber: 5, title: 'Cross-Device Optimization & VR Headset Pass', description: 'Apple Vision Pro, Meta Quest 3, and WebXR browser performance tuning.', eta: 'ETA: 3 days', deliverablesCount: 3, deliverablesList: ['VisionOS Safari Pass', 'Quest WebXR Benchmark', 'Mobile Safari Touch Controls'] },
      { stageNumber: 6, title: 'Client VR Staging & Final Sign-Off', description: 'Collaborative multi-user walk-through review with principal architects.', eta: 'ETA: 5 days', deliverablesCount: 2, deliverablesList: ['Client Review Session Log', 'Approval Certificate'] },
    ],
  },
  'WebAR': {
    pipelineType: 'WebAR Instant Spatial Quick-Look & Augmented Placement',
    stages: [
      { stageNumber: 1, title: 'USDZ & GLB File Generation', description: 'Converting high-poly CAD models into high-efficiency USDZ and GLB formats.', eta: 'Completed', deliverablesCount: 4, deliverablesList: ['Optimized GLB Model', 'iOS USDZ QuickLook File', 'Scale Calibration Matrix'] },
      { stageNumber: 2, title: 'Surface Tracking & True-to-Scale Calibration', description: 'Plane detection anchor tuning and real-world shadow plane receivers.', eta: 'Completed', deliverablesCount: 3, deliverablesList: ['Floor Plane Occluder', 'Shadow Matte Catcher', 'Scale Lock Script'] },
      { stageNumber: 3, title: 'Interactive Material & Option Customizer', description: 'Material switching UI for stone, timber, metal, and lighting finishes.', eta: 'In Progress', deliverablesCount: 6, deliverablesList: ['Variant Configuration Map', 'Material Switcher UI', 'Snapshot Capture Tool'] },
      { stageNumber: 4, title: 'AR QR Code Portal & Cloud CDN Deployment', description: 'Deploying high-speed global WebAR landing links and scannable QR tokens.', eta: 'ETA: 2 days', deliverablesCount: 2, deliverablesList: ['High-Res Vector QR Assets', 'AR Web Landing Container'] },
    ],
  },
  'Virtual Reality': {
    pipelineType: 'Fully Immersive 6DOF Virtual Reality Experience',
    stages: [
      { stageNumber: 1, title: 'Spatial Layout & Architectural Volumetrics', description: 'Real-scale 1:1 VR environment construction and boundary safety grids.', eta: 'Completed', deliverablesCount: 5, deliverablesList: ['Master VR Scene Build', 'Boundary Collision Meshes', 'Scale Benchmark Asset'] },
      { stageNumber: 2, title: 'High-Fidelity Photorealistic Lighting', description: 'Cinematic global illumination, photometric IES lights, and volumetric fog.', eta: 'Completed', deliverablesCount: 6, deliverablesList: ['IES Luminaire Profiles', 'Global Illumination Bake', 'Volumetric Sun Beams'] },
      { stageNumber: 3, title: 'Physics, Door Animations & Spatial Audio', description: 'Interactive handles, sliding partitions, elevator rides, and realistic sound.', eta: 'In Progress', deliverablesCount: 4, deliverablesList: ['Kinematic Door Controllers', 'Elevator Ascent Sequence', 'Room Reverb Acoustics'] },
      { stageNumber: 4, title: 'Frame Rate Stress Testing (90 FPS VR Lock)', description: 'Draw call optimization, occlusion culling, and shader complexity pass.', eta: 'ETA: 4 days', deliverablesCount: 3, deliverablesList: ['Frame Time Telemetry Log', 'Occlusion Bounds Profile', 'VR Memory Profiler'] },
      { stageNumber: 5, title: 'Executive VR Demo Packaging', description: 'Standalone executable build for Meta Quest standalone and PCVR headsets.', eta: 'ETA: 6 days', deliverablesCount: 2, deliverablesList: ['Quest Standalone APK', 'PCVR SteamVR Build'] },
    ],
  },
  'Virtual Tour 360': {
    pipelineType: 'Gigapixel 360° Spherical Tour & Minimap Navigation',
    stages: [
      { stageNumber: 1, title: 'Equirectangular 16K Panorama Ingestion', description: 'Path-traced 16,000 x 8,000 HDR spherical renders for all vantage points.', eta: 'Completed', deliverablesCount: 12, deliverablesList: ['16K Master Equirectangular Panoramas', 'HDR Sky Domes', 'Nadir Patch Graphics'] },
      { stageNumber: 2, title: 'Spatial Alignment & Interactive Floorplan Radar', description: 'Connecting nodes on vector floor plans with dynamic camera cones.', eta: 'Completed', deliverablesCount: 8, deliverablesList: ['Vector SVG Floor Plans', 'Node Connection Graph', 'Dynamic Radar Cone Config'] },
      { stageNumber: 3, title: 'Custom Hotspots, Video Embeds & Info Drawers', description: 'Placing specifications, material callouts, and daylight slider transitions.', eta: 'In Progress', deliverablesCount: 10, deliverablesList: ['Info Popover Annotations', 'Day-to-Night Crossfade Map', 'Video Screen Insets'] },
      { stageNumber: 4, title: 'Gyroscope Mobile & VR Mode Optimization', description: 'Mobile device motion sensor integration and card-view WebXR split display.', eta: 'ETA: 2 days', deliverablesCount: 4, deliverablesList: ['Mobile Touch Controls', 'Stereoscopic Split Shader', 'Preload Tile Optimizer'] },
      { stageNumber: 5, title: 'White-Label Branding & Client Embed Code', description: 'Embedding custom domain, typography, logo watermark, and analytics tracker.', eta: 'ETA: 4 days', deliverablesCount: 3, deliverablesList: ['iFrame Embed Snippet', 'Custom Subdomain Bundle', 'Client Analytics Access'] },
    ],
  },
  'Pixel Streaming': {
    pipelineType: 'Unreal Engine 5.4 Lumen & Nanite Cloud GPU Cluster',
    stages: [
      { stageNumber: 1, title: 'UE 5.4 Nanite Mesh & Geometry Optimization', description: 'Importing billion-polygon master BIM geometry with real-time Nanite micro-poly.', eta: 'Completed', deliverablesCount: 6, deliverablesList: ['Nanite Asset Cache', 'Coordinate Zero Offset Matrix', 'Complex Collision Meshes'] },
      { stageNumber: 2, title: 'Lumen Real-Time GI & Dynamic Sun Positioner', description: 'Geographical latitude/longitude solar simulation with true real-time sun.', eta: 'Completed', deliverablesCount: 4, deliverablesList: ['Lumen Sky Atmosphere Setup', 'Sun Position Calculator Widget', 'Physical Camera Rig'] },
      { stageNumber: 3, title: 'WebRTC Signaling Server & Latency Tuning', description: 'Low-latency NVENC H.265 video stream encoding with <20ms input lag.', eta: 'In Progress', deliverablesCount: 5, deliverablesList: ['Signaling Server Manifest', 'WebRTC Player Frontend', 'Adaptive Bitrate Controller'] },
      { stageNumber: 4, title: 'Custom HTML5 Remote Control Overlay', description: 'Web UI for changing wall materials, furniture layouts, and camera paths.', eta: 'ETA: 3 days', deliverablesCount: 4, deliverablesList: ['Pixel Stream Command Bridge', 'Material Configurator Panel', 'Orbit & Fly-Through Cam Controller'] },
      { stageNumber: 5, title: 'Cloud GPU Scaling & Load Balancer Setup', description: 'Autoscaling AWS/Azure GPU instances across US, EU, and Asia edge clusters.', eta: 'ETA: 5 days', deliverablesCount: 3, deliverablesList: ['Edge Load Balancer Rules', 'Cluster Autoscaler Script', 'Client Access Link'] },
    ],
  },
  'Animation': {
    pipelineType: 'Cinematic 8K Architectural Film & Drone Cinematography',
    stages: [
      { stageNumber: 1, title: 'Storyboard, Camera Choreography & Animatic', description: 'Director shot list, lens selections (24mm, 35mm, 85mm), and timing cuts.', eta: 'Completed', deliverablesCount: 8, deliverablesList: ['24-Shot Storyboard Deck', 'Low-Res Previs Animatic', 'Camera Lens Spec Sheet'] },
      { stageNumber: 2, title: 'Set Dressing, Entourage & Dynamic Atmosphere', description: 'Animated vegetation with wind physics, vehicle traffic, and 3D human crowds.', eta: 'Completed', deliverablesCount: 6, deliverablesList: ['Wind Physics Foliage Set', 'Anima 3D Crowd Sims', 'Traffic Spline Sequences'] },
      { stageNumber: 3, title: 'Cloud Farm 8K Path-Tracing Render Pass', description: 'Multi-pass rendering (Beauty, Z-Depth, Cryptomatte, Ambient Occlusion).', eta: 'In Progress', deliverablesCount: 16, deliverablesList: ['Multi-Pass EXR Sequences', 'Raw Frame Cache', 'Denoise Passes'] },
      { stageNumber: 4, title: 'Color Grading, ACES Pipeline & Retouching', description: 'Hollywood DaVinci Resolve color timing, lens flare matching, and motion blur.', eta: 'ETA: 3 days', deliverablesCount: 4, deliverablesList: ['DaVinci LUT Profile', 'Beauty Retouch Passes', 'Motion Blur Vector Match'] },
      { stageNumber: 5, title: 'Spatial Sound Design & Master 8K Encoding', description: 'Original orchestral score mixing, foley sound effects, and ProRes master.', eta: 'ETA: 5 days', deliverablesCount: 3, deliverablesList: ['ProRes 4444 Master Film', '5.1 Surround Audio Stem', 'Web 4K Streaming MP4'] },
    ],
  },
  'Still Renders': {
    pipelineType: 'Hyperrealistic 8K Architectural Master Stills & Lighting Studies',
    stages: [
      { stageNumber: 1, title: 'Camera Composition & Focal Angle Selection', description: 'Drafting 12 dramatic perspective angles for architectural director approval.', eta: 'Completed', deliverablesCount: 12, deliverablesList: ['12 Clay Preview Perspectives', 'Golden Ratio Composition Maps', 'Focal Length Specs'] },
      { stageNumber: 2, title: 'PBR Material Detailing & Concrete Micro-Textures', description: 'Imperfections, board-marked concrete seams, and reflective puddle masks.', eta: 'Completed', deliverablesCount: 8, deliverablesList: ['High-Res Material Swatches', 'Imperfection Displacement Maps', 'Glazing Coating Profiles'] },
      { stageNumber: 3, title: 'Atmospheric Lighting & Dusk/Dawn Sun Studies', description: 'Golden hour twilight, rainy overcast mood, and nocturnal interior glow.', eta: 'In Progress', deliverablesCount: 6, deliverablesList: ['Dusk Lighting Study', 'Overcast Moody Pass', 'Interior Illumination Balance'] },
      { stageNumber: 4, title: '8K Final Master Rendering & Render Passes', description: 'Rendering at 7680 x 4320 with maximum ray-bounce path tracing.', eta: 'ETA: 2 days', deliverablesCount: 8, deliverablesList: ['Raw 8K EXR Masters', 'Z-Depth & Normal Channels', 'Reflection Isolations'] },
      { stageNumber: 5, title: 'Fine Art Architectural Post-Production', description: 'Atmospheric haze, micro-contrast enhancement, and print-ready TIFF export.', eta: 'ETA: 4 days', deliverablesCount: 8, deliverablesList: ['CMYK Print Masters (300 DPI)', 'Digital RGB Portfolio Assets', 'Client Approval Sign-Off'] },
    ],
  },
};

// Initial Seed Data with all statuses, payment states, project types, hours spent, and timesheets
export const INITIAL_MANAGED_PROJECTS: ManagedProject[] = [
  {
    id: 'VIZTR-882',
    name: 'The Apex Tower - Master Tower Facade & XR World',
    clientName: 'Elena Rostova',
    clientEmail: 'e.rostova@fosterpartners.com',
    clientCompany: 'Foster & Partners',
    category: 'Commercial High-Rise',
    projectType: 'WebXR',
    status: 'Client Review',
    paymentStatus: 'Partial 50%',
    bookingAmount: 125000,
    progress: 75,
    leadArchitect: 'Elena Rostova, Foster & Partners',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    lastUpdate: '2 hours ago by Lead CGI Supervisor',
    xrAvailable: true,
    pixelStreamingAvailable: true,
    pendingRevisionsCount: 2,
    revisionsSummary: '2 active tickets (reflective glazing & sunset luminescence)',
    notes: 'Priority commission for London commercial headquarters. Client requested interactive WebXR with Apple Vision Pro support.',
    hoursMonitoring: {
      estimatedHours: 190.0,
      hoursSpent: 148.5,
      hourlyRate: 175,
      disciplineBreakdown: [
        { discipline: '3D Modeling & CAD Ingestion', hours: 42.0, budgetHours: 40.0, color: '#3ECF8E' },
        { discipline: 'PBR Materials & Shaders', hours: 38.5, budgetHours: 45.0, color: '#06B6D4' },
        { discipline: 'Spatial WebXR & Audio', hours: 34.0, budgetHours: 50.0, color: '#8B5CF6' },
        { discipline: 'Lighting & Optimization', hours: 22.0, budgetHours: 35.0, color: '#F59E0B' },
        { discipline: 'Client Feedback Revisions', hours: 12.0, budgetHours: 20.0, color: '#EC4899' },
      ],
      timesheetEntries: [
        { id: 'ts-882-1', date: '2026-08-26', teamMember: 'Dmitri Vance', role: 'Senior WebXR Engineer', task: 'Optimized VisionOS Safari WebXR shader pipeline and eye-tracking depth', hours: 6.5, stage: 'Stage 4: Spatial WebXR' },
        { id: 'ts-882-2', date: '2026-08-25', teamMember: 'Sarah Lin', role: 'Lead Lighting Supervisor', task: 'Baked 8K directional ambient occlusion maps for podium atrium', hours: 7.0, stage: 'Stage 3: Spatial Lighting' },
        { id: 'ts-882-3', date: '2026-08-24', teamMember: 'Marcus Chen', role: 'Principal CGI Director', task: 'Refined reflective double-skin glass coating per Foster markup', hours: 4.5, stage: 'Stage 2: PBR Materials' },
        { id: 'ts-882-4', date: '2026-08-22', teamMember: 'Elena Rostova (Review)', role: 'Client Arch Director', task: 'Live WebXR staging walkthrough and ticket logging', hours: 2.0, stage: 'Stage 4: Spatial WebXR' },
      ],
    },
    pipeline: {
      pipelineType: 'WebXR Spatial Experience & Real-time WebGL Engine',
      currentStageIndex: 3,
      stages: [
        { stageNumber: 1, title: 'BIM / CAD Ingestion & Polygon Retopology', description: 'Cleaning Rhino/Revit meshes and creating optimized LOD 0-3 assets.', status: 'completed', eta: 'Completed', deliverablesCount: 6, deliverablesApproved: 6, deliverablesList: ['LOD Meshes (glTF)', 'UV Unwrap Sets', 'Topology Audit Report'] },
        { stageNumber: 2, title: 'PBR Materiality & Shader Graph Setup', description: 'Physically based rendering, metallic-roughness maps and glass refraction.', status: 'completed', eta: 'Completed', deliverablesCount: 8, deliverablesApproved: 8, deliverablesList: ['4K PBR Texture Atlases', 'Custom Glazing Shaders', 'Subsurface Foliage Profiles'] },
        { stageNumber: 3, title: 'Spatial Lighting & Lightmap Baking', description: 'Baking high-dynamic range directional lightmaps for 60fps mobile WebXR.', status: 'completed', eta: 'Completed', deliverablesCount: 4, deliverablesApproved: 4, deliverablesList: ['HDR Environment Probes', 'Baked Lightmap Texture Sets', 'Reflection Cubemaps'] },
        { stageNumber: 4, title: 'Interactive Hotspots & Spatial Audio', description: 'Navigation teleport nodes, architectural annotations, and ambient soundscapes.', status: 'in_progress', eta: 'In Progress', deliverablesCount: 5, deliverablesApproved: 3, deliverablesList: ['Spatial Waypoints', 'Annotation Pins JSON', '3D Binaural Soundfield'] },
        { stageNumber: 5, title: 'Cross-Device Optimization & VR Headset Pass', description: 'Apple Vision Pro, Meta Quest 3, and WebXR browser performance tuning.', status: 'pending', eta: 'ETA: 3 days', deliverablesCount: 3, deliverablesApproved: 0, deliverablesList: ['VisionOS Safari Pass', 'Quest WebXR Benchmark', 'Mobile Safari Touch Controls'] },
        { stageNumber: 6, title: 'Client VR Staging & Final Sign-Off', description: 'Collaborative multi-user walk-through review with principal architects.', status: 'pending', eta: 'ETA: 5 days', deliverablesCount: 2, deliverablesApproved: 0, deliverablesList: ['Client Review Session Log', 'Approval Certificate'] },
      ],
    },
    documents: [
      {
        id: 'doc-882-1',
        title: 'Architectural Façade Engineering Blueprint Set',
        fileName: 'Apex_Tower_Façade_Engineering_Set_Rev4.pdf',
        fileType: 'pdf',
        extension: 'PDF',
        fileSize: '42.8 MB',
        version: 'Rev 4.2',
        updatedAt: 'Yesterday at 14:20',
        uploadedBy: 'Foster & Partners BIM Studio',
        category: 'Architectural Blueprint',
        description: 'Complete 48-sheet architectural permit and structural glazing detail set including spandrel mullion specifications.',
        status: 'Approved',
        checksum: 'SHA-256: 7F88D92A0B3C14E59F672A8B',
        pageCountOrUnits: '48 Sheets',
      },
      {
        id: 'doc-882-2',
        title: 'Level 40 Podium Structural CAD Model',
        fileName: 'Apex_Tower_Level40_Podium_Structural.dwg',
        fileType: 'cad',
        extension: 'DWG',
        fileSize: '114.2 MB',
        version: 'v3.1 (AutoCAD 2026)',
        updatedAt: '3 days ago',
        uploadedBy: 'Thornton Tomasetti Structural',
        category: 'CAD / 3D Exchange',
        description: 'High-precision coordinate-referenced DWG containing steel node coordinate geometry and cantilever truss details.',
        status: 'Approved',
        checksum: 'SHA-256: 3C89E71F42BA091C88DE1134',
        pageCountOrUnits: 'Metric / mm (1:1)',
      },
      {
        id: 'doc-882-3',
        title: 'LOD 400 Curtain Wall BIM IFC Exchange',
        fileName: 'Apex_Tower_LOD400_CurtainWall_BIM.ifc',
        fileType: 'bim',
        extension: 'IFC',
        fileSize: '85.0 MB',
        version: 'IFC4 Reference View',
        updatedAt: '4 days ago',
        uploadedBy: 'VizTR Ingestion Engine',
        category: 'BIM Model',
        description: 'Open BIM exchange geometry mapped with thermal U-values, glass solar heat gain coefficients, and vertex normal data.',
        status: 'Approved',
        checksum: 'SHA-256: 9A11F04B38EE20CD77AA6190',
        pageCountOrUnits: 'IFC4 / LOD 400',
      },
    ],
  },
  {
    id: 'VIZTR-904',
    name: 'Serpentine Pavilions & Botanical Landscape VR',
    clientName: 'Marcus Weber',
    clientEmail: 'm.weber@zaha-hadid.com',
    clientCompany: 'Zaha Hadid Architects',
    category: 'Cultural & Landscape',
    projectType: 'Virtual Reality',
    status: 'Work in Progress',
    paymentStatus: 'Deposit Received',
    bookingAmount: 95000,
    progress: 45,
    leadArchitect: 'Marcus Weber, Zaha Hadid Architects',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    lastUpdate: '5 hours ago by Lead 3D Modeler',
    xrAvailable: true,
    pixelStreamingAvailable: false,
    pendingRevisionsCount: 1,
    revisionsSummary: '1 revision pending (botanical canopy density adjustment)',
    notes: 'Curved parametric timber structures with immersive Oculus Quest 3 walk-through.',
    hoursMonitoring: {
      estimatedHours: 160.0,
      hoursSpent: 72.0,
      hourlyRate: 175,
      disciplineBreakdown: [
        { discipline: '3D Parametric Modeling', hours: 32.0, budgetHours: 45.0, color: '#3ECF8E' },
        { discipline: 'Foliage & Botanical Sims', hours: 22.0, budgetHours: 35.0, color: '#10B981' },
        { discipline: 'VR Interaction & Lighting', hours: 14.0, budgetHours: 50.0, color: '#8B5CF6' },
        { discipline: 'Client Review Prep', hours: 4.0, budgetHours: 30.0, color: '#F59E0B' },
      ],
      timesheetEntries: [
        { id: 'ts-904-1', date: '2026-08-26', teamMember: 'Aria Thorne', role: 'Parametric BIM Lead', task: 'Refined Grasshopper timber rib interlocking geometry', hours: 5.0, stage: 'Stage 1: Spatial Layout' },
        { id: 'ts-904-2', date: '2026-08-25', teamMember: 'Leon Vance', role: 'VR Physics Developer', task: 'Implemented 6DOF haptic controllers and botanical wind collision', hours: 6.0, stage: 'Stage 3: Physics & Audio' },
      ],
    },
    pipeline: {
      pipelineType: 'Fully Immersive 6DOF Virtual Reality Experience',
      currentStageIndex: 2,
      stages: [
        { stageNumber: 1, title: 'Spatial Layout & Architectural Volumetrics', description: 'Real-scale 1:1 VR environment construction and boundary safety grids.', status: 'completed', eta: 'Completed', deliverablesCount: 5, deliverablesApproved: 5 },
        { stageNumber: 2, title: 'High-Fidelity Photorealistic Lighting', description: 'Cinematic global illumination, photometric IES lights, and volumetric fog.', status: 'completed', eta: 'Completed', deliverablesCount: 6, deliverablesApproved: 6 },
        { stageNumber: 3, title: 'Physics, Door Animations & Spatial Audio', description: 'Interactive handles, sliding partitions, elevator rides, and realistic sound.', status: 'in_progress', eta: 'In Progress', deliverablesCount: 4, deliverablesApproved: 2 },
        { stageNumber: 4, title: 'Frame Rate Stress Testing (90 FPS VR Lock)', description: 'Draw call optimization, occlusion culling, and shader complexity pass.', status: 'pending', eta: 'ETA: 4 days', deliverablesCount: 3, deliverablesApproved: 0 },
        { stageNumber: 5, title: 'Executive VR Demo Packaging', description: 'Standalone executable build for Meta Quest standalone and PCVR headsets.', status: 'pending', eta: 'ETA: 6 days', deliverablesCount: 2, deliverablesApproved: 0 },
      ],
    },
    documents: [
      {
        id: 'doc-904-1',
        title: 'Serpentine Curved Pavilion CAD Vector Linework',
        fileName: 'Serpentine_Pavilion_Master_CAD.dwg',
        fileType: 'cad',
        extension: 'DWG',
        fileSize: '68.4 MB',
        version: 'v2.4',
        updatedAt: '2 days ago',
        uploadedBy: 'ZHA Computational Unit',
        category: 'CAD / 3D Exchange',
        description: 'Complete curvilinear rib layout and terrain contour offsets.',
        status: 'Approved',
        checksum: 'SHA-256: B42918EF00318ACF4782A09',
        pageCountOrUnits: '1:100 Scale',
      },
    ],
  },
  {
    id: 'VIZTR-741',
    name: 'Aura Waterfront Ultra-Luxury Penthouse Suite',
    clientName: 'Chloe Dupont',
    clientEmail: 'c.dupont@gensler.com',
    clientCompany: 'Gensler Architecture',
    category: 'Luxury Residential',
    projectType: 'Virtual Tour 360',
    status: 'Complete',
    paymentStatus: 'Paid',
    bookingAmount: 65000,
    progress: 100,
    leadArchitect: 'Chloe Dupont, Gensler Architecture',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    lastUpdate: 'Yesterday - Final Master Signed Off',
    xrAvailable: true,
    pixelStreamingAvailable: false,
    pendingRevisionsCount: 0,
    revisionsSummary: '0 active tickets (All milestones locked & approved)',
    notes: 'Completed 16K 360 virtual tour with live day/night transition sliders and interactive FF&E spec sheets.',
    hoursMonitoring: {
      estimatedHours: 95.0,
      hoursSpent: 91.5,
      hourlyRate: 175,
      disciplineBreakdown: [
        { discipline: 'Interior CAD & FF&E Modeling', hours: 28.0, budgetHours: 30.0, color: '#3ECF8E' },
        { discipline: '16K Panorama Rendering', hours: 32.5, budgetHours: 35.0, color: '#3B82F6' },
        { discipline: 'Interactive Hotspot Logic', hours: 18.0, budgetHours: 18.0, color: '#8B5CF6' },
        { discipline: 'Color Timing & Delivery', hours: 13.0, budgetHours: 12.0, color: '#10B981' },
      ],
      timesheetEntries: [
        { id: 'ts-741-1', date: '2026-08-24', teamMember: 'Sarah Lin', role: 'Lead Lighting Supervisor', task: 'Final master 16K panoramic stitching and color balance', hours: 6.0, stage: 'Stage 5: White-Label Delivery' },
        { id: 'ts-741-2', date: '2026-08-23', teamMember: 'Dmitri Vance', role: 'Senior WebXR Engineer', task: 'Day-to-night smooth fade slider script integration', hours: 5.5, stage: 'Stage 3: Custom Hotspots' },
      ],
    },
    pipeline: {
      pipelineType: 'Gigapixel 360° Spherical Tour & Minimap Navigation',
      currentStageIndex: 4,
      stages: [
        { stageNumber: 1, title: 'Equirectangular 16K Panorama Ingestion', description: 'Path-traced 16,000 x 8,000 HDR spherical renders for all vantage points.', status: 'completed', eta: 'Completed', deliverablesCount: 12, deliverablesApproved: 12 },
        { stageNumber: 2, title: 'Spatial Alignment & Interactive Floorplan Radar', description: 'Connecting nodes on vector floor plans with dynamic camera cones.', status: 'completed', eta: 'Completed', deliverablesCount: 8, deliverablesApproved: 8 },
        { stageNumber: 3, title: 'Custom Hotspots, Video Embeds & Info Drawers', description: 'Placing specifications, material callouts, and daylight slider transitions.', status: 'completed', eta: 'Completed', deliverablesCount: 10, deliverablesApproved: 10 },
        { stageNumber: 4, title: 'Gyroscope Mobile & VR Mode Optimization', description: 'Mobile device motion sensor integration and card-view WebXR split display.', status: 'completed', eta: 'Completed', deliverablesCount: 4, deliverablesApproved: 4 },
        { stageNumber: 5, title: 'White-Label Branding & Client Embed Code', description: 'Embedding custom domain, typography, logo watermark, and analytics tracker.', status: 'completed', eta: 'Completed', deliverablesCount: 3, deliverablesApproved: 3 },
      ],
    },
    documents: [
      {
        id: 'doc-741-1',
        title: 'Interior FF&E Material Schedule & Specifications',
        fileName: 'Aura_Penthouse_FFE_Material_Schedule.pdf',
        fileType: 'pdf',
        extension: 'PDF',
        fileSize: '24.1 MB',
        version: 'Master Final',
        updatedAt: '3 days ago',
        uploadedBy: 'Gensler Interiors Studio',
        category: 'Material Schedule',
        description: 'Complete Italian marble, custom brass joinery, and bespoke lighting fixtures specification register.',
        status: 'Approved',
        checksum: 'SHA-256: F18471AA490C83921EB1908',
        pageCountOrUnits: '32 Pages',
      },
    ],
  },
  {
    id: 'VIZTR-615',
    name: 'Metropolis Mixed-Use City District & Transit Terminal',
    clientName: 'Julian Sterling',
    clientEmail: 'j.sterling@big.dk',
    clientCompany: 'BIG (Bjarke Ingels Group)',
    category: 'Masterplan & Infrastructure',
    projectType: 'Pixel Streaming',
    status: 'Work in Progress',
    paymentStatus: 'Partial 50%',
    bookingAmount: 185000,
    progress: 60,
    leadArchitect: 'Julian Sterling, BIG',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    lastUpdate: '3 hours ago · Cloud GPU Node Allocated',
    xrAvailable: true,
    pixelStreamingAvailable: true,
    pendingRevisionsCount: 3,
    revisionsSummary: '3 revision tickets (traffic crowd density, sky daylight angle, tram speed)',
    notes: 'Massive scale 4 sq km city center with Unreal Engine 5.4 Lumen real-time cloud pixel streaming at 60 FPS.',
    hoursMonitoring: {
      estimatedHours: 280.0,
      hoursSpent: 168.0,
      hourlyRate: 195,
      disciplineBreakdown: [
        { discipline: 'Masterplan BIM Ingestion', hours: 54.0, budgetHours: 65.0, color: '#3ECF8E' },
        { discipline: 'Nanite Mesh & Terrain Setup', hours: 48.0, budgetHours: 60.0, color: '#06B6D4' },
        { discipline: 'Lumen Real-Time Lighting', hours: 38.0, budgetHours: 70.0, color: '#EAB308' },
        { discipline: 'WebRTC Signaling Cluster', hours: 28.0, budgetHours: 85.0, color: '#EC4899' },
      ],
      timesheetEntries: [
        { id: 'ts-615-1', date: '2026-08-26', teamMember: 'Liam Gallagher', role: 'Lead Unreal Engine Tech', task: 'Configured dynamic tram spline simulation and Nanite transit roof', hours: 8.0, stage: 'Stage 3: WebRTC Signaling' },
        { id: 'ts-615-2', date: '2026-08-25', teamMember: 'Liam Gallagher', role: 'Lead Unreal Engine Tech', task: 'Lumen real-time global illumination and solar trajectory rig', hours: 7.5, stage: 'Stage 2: Lumen Real-Time GI' },
      ],
    },
    pipeline: {
      pipelineType: 'Unreal Engine 5.4 Lumen & Nanite Cloud GPU Cluster',
      currentStageIndex: 2,
      stages: [
        { stageNumber: 1, title: 'UE 5.4 Nanite Mesh & Geometry Optimization', description: 'Importing billion-polygon master BIM geometry with real-time Nanite micro-poly.', status: 'completed', eta: 'Completed', deliverablesCount: 6, deliverablesApproved: 6 },
        { stageNumber: 2, title: 'Lumen Real-Time GI & Dynamic Sun Positioner', description: 'Geographical latitude/longitude solar simulation with true real-time sun.', status: 'completed', eta: 'Completed', deliverablesCount: 4, deliverablesApproved: 4 },
        { stageNumber: 3, title: 'WebRTC Signaling Server & Latency Tuning', description: 'Low-latency NVENC H.265 video stream encoding with <20ms input lag.', status: 'in_progress', eta: 'In Progress', deliverablesCount: 5, deliverablesApproved: 2 },
        { stageNumber: 4, title: 'Custom HTML5 Remote Control Overlay', description: 'Web UI for changing wall materials, furniture layouts, and camera paths.', status: 'pending', eta: 'ETA: 3 days', deliverablesCount: 4, deliverablesApproved: 0 },
        { stageNumber: 5, title: 'Cloud GPU Scaling & Load Balancer Setup', description: 'Autoscaling AWS/Azure GPU instances across US, EU, and Asia edge clusters.', status: 'pending', eta: 'ETA: 5 days', deliverablesCount: 3, deliverablesApproved: 0 },
      ],
    },
    documents: [],
  },
  {
    id: 'VIZTR-532',
    name: 'Nordic Cliffside Villa & Fiord Horizon',
    clientName: 'Astrid Lindholm',
    clientEmail: 'a.lindholm@snøhetta.com',
    clientCompany: 'Snøhetta Architects',
    category: 'Luxury Residential',
    projectType: 'Still Renders',
    status: 'Awaited',
    paymentStatus: 'Invoiced',
    bookingAmount: 48000,
    progress: 15,
    leadArchitect: 'Astrid Lindholm, Snøhetta',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    lastUpdate: 'Awaiting CAD Site Survey Ingestion',
    xrAvailable: false,
    pixelStreamingAvailable: false,
    pendingRevisionsCount: 0,
    revisionsSummary: 'Awaiting client survey CAD data to begin camera placement',
    notes: '8K Master Still Renders celebrating rugged granite landscape and midnight sun reflections.',
    hoursMonitoring: {
      estimatedHours: 70.0,
      hoursSpent: 10.5,
      hourlyRate: 175,
      disciplineBreakdown: [
        { discipline: 'Site Survey & Terrain Modeling', hours: 8.5, budgetHours: 25.0, color: '#3ECF8E' },
        { discipline: 'Camera Composition Setup', hours: 2.0, budgetHours: 15.0, color: '#3B82F6' },
        { discipline: 'PBR Materiality & Rock Shaders', hours: 0, budgetHours: 15.0, color: '#8B5CF6' },
        { discipline: '8K Path-Trace Lighting', hours: 0, budgetHours: 15.0, color: '#F59E0B' },
      ],
      timesheetEntries: [
        { id: 'ts-532-1', date: '2026-08-24', teamMember: 'Marcus Chen', role: 'Principal CGI Director', task: 'Initial terrain LIDAR point-cloud alignment and camera angle study', hours: 6.0, stage: 'Stage 1: Camera Composition' },
      ],
    },
    pipeline: {
      pipelineType: 'Hyperrealistic 8K Architectural Master Stills & Lighting Studies',
      currentStageIndex: 0,
      stages: [
        { stageNumber: 1, title: 'Camera Composition & Focal Angle Selection', description: 'Drafting 12 dramatic perspective angles for architectural director approval.', status: 'in_progress', eta: 'In Progress', deliverablesCount: 12, deliverablesApproved: 2 },
        { stageNumber: 2, title: 'PBR Material Detailing & Concrete Micro-Textures', description: 'Imperfections, board-marked concrete seams, and reflective puddle masks.', status: 'pending', eta: 'ETA: 3 days', deliverablesCount: 8, deliverablesApproved: 0 },
        { stageNumber: 3, title: 'Atmospheric Lighting & Dusk/Dawn Sun Studies', description: 'Golden hour twilight, rainy overcast mood, and nocturnal interior glow.', status: 'pending', eta: 'ETA: 5 days', deliverablesCount: 6, deliverablesApproved: 0 },
        { stageNumber: 4, title: '8K Final Master Rendering & Render Passes', description: 'Rendering at 7680 x 4320 with maximum ray-bounce path tracing.', status: 'pending', eta: 'ETA: 7 days', deliverablesCount: 8, deliverablesApproved: 0 },
        { stageNumber: 5, title: 'Fine Art Architectural Post-Production', description: 'Atmospheric haze, micro-contrast enhancement, and print-ready TIFF export.', status: 'pending', eta: 'ETA: 9 days', deliverablesCount: 8, deliverablesApproved: 0 },
      ],
    },
    documents: [],
  },
  {
    id: 'VIZTR-419',
    name: 'Elysium Quantum Science Institute & Kinetic Facade',
    clientName: 'Dr. Hiroshi Tanaka',
    clientEmail: 'h.tanaka@nikkensekkei.co.jp',
    clientCompany: 'Nikken Sekkei',
    category: 'Commercial & Institutional',
    projectType: 'Animation',
    status: 'Hold',
    paymentStatus: 'Milestone Pending',
    bookingAmount: 140000,
    progress: 35,
    leadArchitect: 'Dr. Hiroshi Tanaka, Nikken Sekkei',
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    lastUpdate: 'Put on hold pending client engineering redesign',
    xrAvailable: false,
    pixelStreamingAvailable: false,
    pendingRevisionsCount: 1,
    revisionsSummary: '1 hold notice (structural cantilever redesign in progress by client)',
    notes: '8K cinematic architectural film with kinetic shading louvers simulation.',
    hoursMonitoring: {
      estimatedHours: 220.0,
      hoursSpent: 78.0,
      hourlyRate: 190,
      disciplineBreakdown: [
        { discipline: 'Kinetic Louver Animation Rig', hours: 38.0, budgetHours: 55.0, color: '#3ECF8E' },
        { discipline: 'Camera Previs & Animatic', hours: 26.0, budgetHours: 45.0, color: '#06B6D4' },
        { discipline: 'Atmospheric Cloud Sims', hours: 14.0, budgetHours: 60.0, color: '#EAB308' },
        { discipline: 'Cloud Rendering', hours: 0, budgetHours: 60.0, color: '#EC4899' },
      ],
      timesheetEntries: [
        { id: 'ts-419-1', date: '2026-08-20', teamMember: 'Aria Thorne', role: 'Parametric BIM Lead', task: 'Kinetic louvers mathematical rotation animation script', hours: 7.5, stage: 'Stage 1: Storyboard & Previs' },
      ],
    },
    pipeline: {
      pipelineType: 'Cinematic 8K Architectural Film & Drone Cinematography',
      currentStageIndex: 1,
      stages: [
        { stageNumber: 1, title: 'Storyboard, Camera Choreography & Animatic', description: 'Director shot list, lens selections (24mm, 35mm, 85mm), and timing cuts.', status: 'completed', eta: 'Completed', deliverablesCount: 8, deliverablesApproved: 8 },
        { stageNumber: 2, title: 'Set Dressing, Entourage & Dynamic Atmosphere', description: 'Animated vegetation with wind physics, vehicle traffic, and 3D human crowds.', status: 'in_progress', eta: 'On Hold', deliverablesCount: 6, deliverablesApproved: 2 },
        { stageNumber: 3, title: 'Cloud Farm 8K Path-Tracing Render Pass', description: 'Multi-pass rendering (Beauty, Z-Depth, Cryptomatte, Ambient Occlusion).', status: 'pending', eta: 'Pending', deliverablesCount: 16, deliverablesApproved: 0 },
        { stageNumber: 4, title: 'Color Grading, ACES Pipeline & Retouching', description: 'Hollywood DaVinci Resolve color timing, lens flare matching, and motion blur.', status: 'pending', eta: 'Pending', deliverablesCount: 4, deliverablesApproved: 0 },
        { stageNumber: 5, title: 'Spatial Sound Design & Master 8K Encoding', description: 'Original orchestral score mixing, foley sound effects, and ProRes master.', status: 'pending', eta: 'Pending', deliverablesCount: 3, deliverablesApproved: 0 },
      ],
    },
    documents: [],
  },
  {
    id: 'VIZTR-312',
    name: 'Horizon Oceanfront Pavilion AR QuickLook',
    clientName: 'Mateo Rossi',
    clientEmail: 'm.rossi@renzo-piano.it',
    clientCompany: 'Renzo Piano Building Workshop',
    category: 'Pavilion & Cultural',
    projectType: 'WebAR',
    status: 'Complete',
    paymentStatus: 'Paid',
    bookingAmount: 52000,
    progress: 100,
    leadArchitect: 'Mateo Rossi, RPBW',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    lastUpdate: 'Completed & Delivered',
    xrAvailable: true,
    pixelStreamingAvailable: false,
    pendingRevisionsCount: 0,
    revisionsSummary: '0 active tickets (All milestones locked & approved)',
    notes: 'Instant WebAR QuickLook experience viewable directly in Mobile Safari and Chrome with no app download.',
    hoursMonitoring: {
      estimatedHours: 80.0,
      hoursSpent: 76.5,
      hourlyRate: 175,
      disciplineBreakdown: [
        { discipline: 'USDZ & GLB Mesh Prep', hours: 28.0, budgetHours: 30.0, color: '#3ECF8E' },
        { discipline: 'True-Scale AR Calibration', hours: 22.5, budgetHours: 25.0, color: '#06B6D4' },
        { discipline: 'Material Customizer UI', hours: 16.0, budgetHours: 15.0, color: '#8B5CF6' },
        { discipline: 'QR Code & CDN Deploy', hours: 10.0, budgetHours: 10.0, color: '#10B981' },
      ],
      timesheetEntries: [
        { id: 'ts-312-1', date: '2026-08-18', teamMember: 'Dmitri Vance', role: 'Senior WebXR Engineer', task: 'Calibrated AR shadow matte catcher and USDZ QuickLook scale matrix', hours: 6.0, stage: 'Stage 4: AR QR Deployment' },
      ],
    },
    pipeline: {
      pipelineType: 'WebAR Instant Spatial Quick-Look & Augmented Placement',
      currentStageIndex: 3,
      stages: [
        { stageNumber: 1, title: 'USDZ & GLB File Generation', description: 'Converting high-poly CAD models into high-efficiency USDZ and GLB formats.', status: 'completed', eta: 'Completed', deliverablesCount: 4, deliverablesApproved: 4 },
        { stageNumber: 2, title: 'Surface Tracking & True-to-Scale Calibration', description: 'Plane detection anchor tuning and real-world shadow plane receivers.', status: 'completed', eta: 'Completed', deliverablesCount: 3, deliverablesApproved: 3 },
        { stageNumber: 3, title: 'Interactive Material & Option Customizer', description: 'Material switching UI for stone, timber, metal, and lighting finishes.', status: 'completed', eta: 'Completed', deliverablesCount: 6, deliverablesApproved: 6 },
        { stageNumber: 4, title: 'AR QR Code Portal & Cloud CDN Deployment', description: 'Deploying high-speed global WebAR landing links and scannable QR tokens.', status: 'completed', eta: 'Completed', deliverablesCount: 2, deliverablesApproved: 2 },
      ],
    },
    documents: [],
  },
];
