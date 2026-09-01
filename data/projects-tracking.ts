export interface ProjectMilestone {
  stage: number;
  name: string;
  status: 'completed' | 'in-progress' | 'pending';
  date?: string;
  description: string;
  deliverables?: Array<{ name: string; type: string; size: string; downloadUrl?: string; previewUrl?: string }>;
}

export interface TrackedProject {
  id: string;
  accessCode: string;
  name: string;
  clientName: string;
  clientEmail: string;
  serviceCategory: 'Exterior Visualization' | 'Interior Visualization' | 'Walkthrough Animation' | 'WebXR & 3D' | 'Pixel Streaming Experience';
  progressPercentage: number;
  currentStage: number; // 1 to 7
  targetCompletion: string;
  status: 'In Production' | 'Client Review' | 'Completed' | 'Revisions';
  unreadUpdates: number;
  stages: ProjectMilestone[];
}

export const ALL_STAGES = [
  { stage: 1, name: 'Brief Received', desc: 'Architectural blueprints, CAD/BIM files and material specifications onboarded.' },
  { stage: 2, name: 'In Production', desc: 'High-poly 3D modeling, lighting setup, and physical material shader assignments.' },
  { stage: 3, name: 'Draft Ready', desc: 'First iteration clay render & low-res color preview available for spatial signoff.' },
  { stage: 4, name: 'Client Review', desc: 'Collaborative feedback phase on lighting, camera angles, and furniture staging.' },
  { stage: 5, name: 'Revisions', desc: 'Refinements applied according to client markups and spatial adjustments.' },
  { stage: 6, name: 'Final Delivery', desc: 'Full 8K production render output, WebXR asset bundling, and master video encoding.' },
  { stage: 7, name: 'Completed', desc: 'Final deliverables archived, client acceptance confirmed, and interactive assets live.' }
];

export const mockTrackedProjects: TrackedProject[] = [
  {
    id: 'VIZTR-DEMO',
    accessCode: 'DEMO-2026',
    name: 'The Horizon Pavilion - Flagship Architectural Showcase',
    clientName: 'Foster & Partners Studio Group',
    clientEmail: 'commissions@fosterandpartners.com',
    serviceCategory: 'Pixel Streaming Experience',
    progressPercentage: 75,
    currentStage: 4,
    targetCompletion: 'April 10, 2026',
    status: 'Client Review',
    unreadUpdates: 3,
    stages: ALL_STAGES.map((s) => ({
      stage: s.stage,
      name: s.name,
      status: s.stage < 4 ? 'completed' : s.stage === 4 ? 'in-progress' : 'pending',
      date: s.stage <= 4 ? `Feb ${s.stage * 4 + 2}, 2026` : undefined,
      description: s.desc,
      deliverables: s.stage === 3 ? [
        { name: 'Horizon_Pavilion_Clay_4K.jpg', type: 'JPG', size: '6.8 MB' },
        { name: 'Horizon_Pavilion_BIM_LOD400.ifc', type: 'IFC', size: '48.2 MB' }
      ] : undefined
    }))
  },
  {
    id: 'VZ-9021',
    accessCode: 'ALPHA-99',
    name: 'The Solarium Sky Penthouse - Triplex Visualization',
    clientName: 'Vanguard Luxury Real Estate',
    clientEmail: 'acquisitions@vanguardrealestate.com',
    serviceCategory: 'Interior Visualization',
    progressPercentage: 85,
    currentStage: 5,
    targetCompletion: 'March 15, 2026',
    status: 'Revisions',
    unreadUpdates: 2,
    stages: [
      {
        stage: 1,
        name: 'Brief Received',
        status: 'completed',
        date: 'Feb 10, 2026',
        description: 'Revit model & moodboards successfully processed.',
      },
      {
        stage: 2,
        name: 'In Production',
        status: 'completed',
        date: 'Feb 18, 2026',
        description: 'PBR materials calibrated with natural New York twilight HDRI.',
      },
      {
        stage: 3,
        name: 'Draft Ready',
        status: 'completed',
        date: 'Feb 24, 2026',
        description: '12 draft camera positions submitted for review.',
        deliverables: [
          { name: 'Solarium_Living_Draft_v1.jpg', type: 'JPG', size: '4.2 MB', previewUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80' },
          { name: 'Solarium_Kitchen_Draft_v1.jpg', type: 'JPG', size: '3.8 MB', previewUrl: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80' }
        ]
      },
      {
        stage: 4,
        name: 'Client Review',
        status: 'completed',
        date: 'March 01, 2026',
        description: 'Client requested warmer walnut veneer on master library wall.',
      },
      {
        stage: 5,
        name: 'Revisions',
        status: 'in-progress',
        date: 'March 04, 2026',
        description: 'Applying wood veneer modifications & updating recessed ceiling fixtures.',
        deliverables: [
          { name: 'Solarium_Living_Revision_v2.jpg', type: 'JPG', size: '8.4 MB', previewUrl: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80' }
        ]
      },
      {
        stage: 6,
        name: 'Final Delivery',
        status: 'pending',
        description: 'Scheduled for 8K high-bitrate multi-pass ray tracing.',
      },
      {
        stage: 7,
        name: 'Completed',
        status: 'pending',
        description: 'Final sign-off and cloud archive.',
      }
    ]
  },
  {
    id: 'VZ-8410',
    accessCode: 'VIP-2026',
    name: 'Nordic Monolith Coastal Villa - Full CGI & Walkthrough',
    clientName: 'Snøhetta Atelier Group',
    clientEmail: 'projects@snohetta-atelier.no',
    serviceCategory: 'Exterior Visualization',
    progressPercentage: 100,
    currentStage: 7,
    targetCompletion: 'February 28, 2026',
    status: 'Completed',
    unreadUpdates: 0,
    stages: ALL_STAGES.map((s) => ({
      stage: s.stage,
      name: s.name,
      status: 'completed',
      date: `Feb ${s.stage * 3 + 2}, 2026`,
      description: s.desc,
      deliverables: s.stage === 6 ? [
        { name: 'Nordic_Monolith_8K_Master.zip', type: 'ZIP', size: '142 MB' },
        { name: 'Nordic_Monolith_Cinematic_4K.mp4', type: 'MP4', size: '380 MB' }
      ] : undefined
    }))
  },
  {
    id: 'VZ-7732',
    accessCode: 'SKY-404',
    name: 'The Apex Tower - Interactive WebXR & Real-Time Tour',
    clientName: 'Mori Building Development',
    clientEmail: 'vr@moribuilding.co.jp',
    serviceCategory: 'WebXR & 3D',
    progressPercentage: 45,
    currentStage: 3,
    targetCompletion: 'April 30, 2026',
    status: 'In Production',
    unreadUpdates: 1,
    stages: ALL_STAGES.map((s) => ({
      stage: s.stage,
      name: s.name,
      status: s.stage < 3 ? 'completed' : s.stage === 3 ? 'in-progress' : 'pending',
      date: s.stage < 3 ? `Feb ${s.stage * 5 + 4}, 2026` : undefined,
      description: s.desc
    }))
  }
];
