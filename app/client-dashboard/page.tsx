'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/lib/store';
import {
  Building,
  Layers,
  Sparkles,
  Download,
  Eye,
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Box,
  MessageSquare,
  Share2,
  ExternalLink,
  ChevronRight,
  User,
  ShieldCheck,
  Bell,
  BellRing,
  Settings,
  Film,
  Columns2,
  Video,
  FileText,
  Archive,
  Loader2,
  Check,
  AlertTriangle,
  CloudUpload,
  GripVertical,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  ArrowUpDown,
  History
} from 'lucide-react';
import ProjectTracker from '@/components/tracking/ProjectTracker';
import NotificationSettings from '@/components/ui/NotificationSettings';
import ProjectStatsWidget, { ProjectStatsData } from '@/components/tracking/ProjectStatsWidget';
import ProjectDocumentRepository, { ProjectDocument } from '@/components/tracking/ProjectDocumentRepository';
import ProjectPhaseRoadmap, { RoadmapStage } from '@/components/tracking/ProjectPhaseRoadmap';
import ProjectTimelapses from '@/components/tracking/ProjectTimelapses';
import ProjectRevisionCompare from '@/components/tracking/ProjectRevisionCompare';
import RevisionHistoryModal from '@/components/tracking/RevisionHistoryModal';
import GoogleDriveClientConnect from '@/components/drive/GoogleDriveClientConnect';
import GoogleMeetClientConnect from '@/components/meet/GoogleMeetClientConnect';
import CollapsibleLeftFilterPanel from '@/components/dashboard/CollapsibleLeftFilterPanel';
import CollapsibleRightInspectorPanel from '@/components/dashboard/CollapsibleRightInspectorPanel';
import {
  INITIAL_MANAGED_PROJECTS,
  ManagedProject,
  ProjectType,
  ProjectStatus,
  PaymentStatus,
  TimesheetEntry
} from '@/lib/projects-data';

interface ClientProject {
  id: string;
  name: string;
  category: string;
  status: 'In Production' | 'Client Review' | 'Final Delivery' | 'Completed';
  progress: number;
  lastUpdate: string;
  image: string;
  leadArchitect: string;
  deliverablesCount: number;
  xrAvailable: boolean;
  pixelStreamingAvailable: boolean;
  stats: ProjectStatsData;
  documents: ProjectDocument[];
  roadmapStages: RoadmapStage[];
}

const CLIENT_PROJECTS: ClientProject[] = [
  {
    id: 'VIZTR-882',
    name: 'The Apex Tower - Master Tower Facade & XR World',
    category: 'Commercial High-Rise & WebXR',
    status: 'Client Review',
    progress: 75,
    lastUpdate: '2 hours ago by Lead CGI Supervisor',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    leadArchitect: 'Elena Rostova, Foster & Partners',
    deliverablesCount: 14,
    xrAvailable: true,
    pixelStreamingAvailable: true,
    stats: {
      hoursSpent: 148.5,
      totalEstimatedHours: 190.0,
      assetsApproved: 11,
      totalAssets: 14,
      pendingRevisions: 2,
      revisionsSummary: '2 active tickets (reflective glazing & sunset luminescence)',
      nextMilestone: 'Stage 6: Final 8K Lighting Review',
      milestoneEta: 'ETA: 24h',
      currentStageNumber: 6,
      totalStages: 7,
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
        checksum: 'SHA-256: 9A01B44DC67EF1239988AC72',
        pageCountOrUnits: 'BIM IFC4',
      },
      {
        id: 'doc-882-4',
        title: 'PBR Photometric IES & Glass Spectra Calibration',
        fileName: 'PBR_Photometric_IES_Glazing_Spectra.json',
        fileType: 'spec',
        extension: 'JSON',
        fileSize: '4.2 MB',
        version: 'v2.0 (Unreal Engine 5.5 / V-Ray 6)',
        updatedAt: '5 days ago',
        uploadedBy: 'VizTR Optics Lab',
        category: 'Technical Specs',
        description: 'Spectral refractive index (IOR 1.52), dielectric roughness maps, and laboratory-measured spectral dispersion curve tables.',
        status: 'Approved',
        checksum: 'SHA-256: F011EA998B2376C11234098A',
        pageCountOrUnits: 'Spectra JSON',
      },
      {
        id: 'doc-882-5',
        title: 'Stage 05 Lighting Milestone Review & Signoff Sheet',
        fileName: 'Stage_05_Lighting_Milestone_Signoff.pdf',
        fileType: 'pdf',
        extension: 'PDF',
        fileSize: '8.1 MB',
        version: 'v1.0 (Formal Signoff)',
        updatedAt: '1 week ago',
        uploadedBy: 'Elena Rostova (Client Signoff)',
        category: 'Milestone Signoff',
        description: 'Client-approved milestone review protocol authorizing 8K final high-resolution render farm queue dispatch.',
        status: 'Approved',
        checksum: 'SHA-256: E8934C7A1190BCF4120938AA',
        pageCountOrUnits: '4 Sheets',
      },
    ],
    roadmapStages: [
      {
        stage: 1,
        title: 'Brief & CAD/BIM Ingestion',
        subtitle: 'Architectural permit sets, BIM IFC models, and PBR moodboards onboarded.',
        description: 'Ingestion of 48-sheet architectural permit package, LOD 400 curtain wall IFC geometry, and structural DWG models. Coordinate system calibration established at 1:1 metric scale.',
        status: 'completed',
        expectedDuration: '2 Days',
        actualDate: 'Feb 02, 2026',
        leadSupervisor: 'Foster & Partners BIM Studio',
        completionPercentage: 100,
        keyMilestoneNotes: 'All 48 sheets signed off and structural datum confirmed with project engineering team.',
        deliverables: [
          {
            id: 'd-882-1',
            name: 'Apex_Tower_Façade_Engineering_Set_Rev4.pdf',
            type: 'PDF',
            size: '42.8 MB',
            isAvailable: true,
          },
          {
            id: 'd-882-2',
            name: 'Apex_Tower_LOD400_CurtainWall_BIM.ifc',
            type: 'IFC',
            size: '85.0 MB',
            isAvailable: true,
          },
        ],
      },
      {
        stage: 2,
        title: 'High-Poly 3D Modeling & Environment Staging',
        subtitle: 'Subdivision surface modeling, podium cantilever trusses, and urban context scattering.',
        description: 'Constructing high-poly architectural assets, spandrel mullion geometry, ground level entrance canopies, surrounding city topography mesh, and procedural traffic/foliage distribution.',
        status: 'completed',
        expectedDuration: '4 Days',
        actualDate: 'Feb 08, 2026',
        leadSupervisor: 'VizTR Senior 3D Modeler',
        completionPercentage: 100,
        keyMilestoneNotes: 'High-poly steel node coordinates aligned to engineering structural drawings within 0.5mm tolerance.',
        deliverables: [
          {
            id: 'd-882-3',
            name: 'Level40_Podium_Cantilever_Steel_Mesh.dwg',
            type: 'DWG',
            size: '114.2 MB',
            isAvailable: true,
          },
          {
            id: 'd-882-4',
            name: 'Urban_Context_Site_Scattering_Draft.jpg',
            type: 'JPG',
            size: '6.4 MB',
            previewUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85',
            isAvailable: true,
          },
        ],
      },
      {
        stage: 3,
        title: 'Clay Render & Master Camera Composition',
        subtitle: 'Monochromatic clay passes, lens focal lengths, and architectural framing angles.',
        description: 'Establishing 6 primary camera perspectives (Hero Eye-Level, Helicopter Aerial, Penthouse Balcony, Nightfall Street View). Monochromatic clay passes evaluate volumetric massing and daylight shadow paths.',
        status: 'completed',
        expectedDuration: '3 Days',
        actualDate: 'Feb 14, 2026',
        leadSupervisor: 'Elena Rostova & CGI Director',
        completionPercentage: 100,
        keyMilestoneNotes: 'Client locked 6 master camera positions. Shift lenses configured to eliminate optical vertical keystoning.',
        deliverables: [
          {
            id: 'd-882-5',
            name: 'Apex_Façade_Clay_Angles_Master_Set.jpg',
            type: 'JPG',
            size: '5.8 MB',
            previewUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85',
            isAvailable: true,
          },
          {
            id: 'd-882-6',
            name: 'Camera_Signoff_Protocol_Signed.pdf',
            type: 'PDF',
            size: '2.1 MB',
            isAvailable: true,
          },
        ],
      },
      {
        stage: 4,
        title: 'Lighting Calibration, PBR Shading & Spectral Glazing',
        subtitle: 'Physical sun/sky simulation, 32-bit HDRI captures, and anisotropic glass dispersion.',
        description: 'Configuring Unreal Engine 5.5 Lumen & V-Ray 6 spectral lighting engines. Simulating low-angle golden hour solar angles, reflective dielectric curtain wall glass coatings, and interior warm luminescence.',
        status: 'completed',
        expectedDuration: '5 Days',
        actualDate: 'Feb 20, 2026',
        leadSupervisor: 'VizTR Optics & Material Lab',
        completionPercentage: 100,
        keyMilestoneNotes: 'Spectrophotometer laboratory data applied to triple-glazed low-E coatings with accurate solar reflectance index.',
        deliverables: [
          {
            id: 'd-882-7',
            name: 'PBR_Photometric_IES_Glazing_Spectra.json',
            type: 'JSON',
            size: '4.2 MB',
            isAvailable: true,
          },
          {
            id: 'd-882-8',
            name: 'Twilight_Atmospheric_HDRI_Proof_4K.jpg',
            type: 'JPG',
            size: '12.1 MB',
            previewUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85',
            isAvailable: true,
          },
        ],
      },
      {
        stage: 5,
        title: 'Client Collaborative Review & Markups',
        subtitle: 'Live review session, interactive markup pins, and lighting adjustments.',
        description: 'Interactive client review round. Markups logged for podium glass tint warmth, rooftop beacon intensity, and penthouse ambient lighting balance.',
        status: 'completed',
        expectedDuration: '3 Days',
        actualDate: 'Feb 25, 2026',
        leadSupervisor: 'Elena Rostova & Client Team',
        completionPercentage: 100,
        keyMilestoneNotes: 'Stage 05 review sheet executed. All 2 minor revision items accepted and cleared for final ray tracing.',
        deliverables: [
          {
            id: 'd-882-9',
            name: 'Stage_05_Lighting_Milestone_Signoff.pdf',
            type: 'PDF',
            size: '8.1 MB',
            isAvailable: true,
          },
          {
            id: 'd-882-10',
            name: 'Client_Markup_Overlay_Composite.jpg',
            type: 'JPG',
            size: '7.5 MB',
            previewUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
            isAvailable: true,
          },
        ],
      },
      {
        stage: 6,
        title: 'Multi-Pass 8K Production Rendering & WebXR Build',
        subtitle: 'Distributed GPU cloud farm computation, EXR cryptomatte passes, and WebXR compilation.',
        description: 'Active production pipeline stage. Full 7680x4320 8K frame rendering across 128 GPU nodes with depth, normal, ambient occlusion, reflection, and emission render buffers.',
        status: 'in-progress',
        expectedDuration: '4 Days',
        actualDate: 'Active Now (ETA: 24h)',
        leadSupervisor: 'VizTR Render Farm Dispatch',
        completionPercentage: 80,
        keyMilestoneNotes: 'Multi-pass rendering 80% finished. WebXR Draco compressed geometry compiled and verified.',
        deliverables: [
          {
            id: 'd-882-11',
            name: 'Apex_Tower_Hero_8K_MultiPass_Master.tiff',
            type: 'TIFF',
            size: '240 MB',
            isAvailable: false,
          },
          {
            id: 'd-882-12',
            name: 'Apex_Tower_WebXR_Interactive_World.glb',
            type: 'GLB',
            size: '8.4 MB',
            isAvailable: true,
          },
        ],
      },
      {
        stage: 7,
        title: 'Final Archival & Master Package Delivery',
        subtitle: 'Master TIFF color grading, video ProRes packaging, and cloud distribution.',
        description: 'Compiling high-bitrate ProRes master clips, lossless 8K print-ready TIFFs, commercial intellectual property licenses, and lifetime cloud download repository archiving.',
        status: 'pending',
        expectedDuration: '1 Day',
        actualDate: 'Expected March 02, 2026',
        leadSupervisor: 'Archival & Asset Packaging Team',
        completionPercentage: 0,
        keyMilestoneNotes: 'Will unlock immediately following Stage 06 quality assurance verification.',
        deliverables: [
          {
            id: 'd-882-13',
            name: 'Apex_Tower_Full_Commission_Archive.zip',
            type: 'PDF',
            size: '2.4 GB',
            isAvailable: false,
          },
        ],
      },
    ],
  },
  {
    id: 'VIZTR-904',
    name: 'Solarium Sky Penthouse - Interior & 360 Nodes',
    category: 'Luxury Residential Interior',
    status: 'In Production',
    progress: 50,
    lastUpdate: 'Yesterday at 17:40 EST',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
    leadArchitect: 'Markus Weber, Zaha Hadid Architects',
    deliverablesCount: 8,
    xrAvailable: true,
    pixelStreamingAvailable: false,
    stats: {
      hoursSpent: 86.0,
      totalEstimatedHours: 160.0,
      assetsApproved: 4,
      totalAssets: 8,
      pendingRevisions: 3,
      revisionsSummary: '3 active tickets (walnut millwork texturing)',
      nextMilestone: 'Stage 4: Lighting & Material Staging',
      milestoneEta: 'ETA: Friday',
      currentStageNumber: 4,
      totalStages: 7,
    },
    documents: [
      {
        id: 'doc-904-1',
        title: 'Bespoke Millwork & Custom Joinery Package',
        fileName: 'Solarium_Penthouse_Millwork_Lighting_Plan.pdf',
        fileType: 'pdf',
        extension: 'PDF',
        fileSize: '28.4 MB',
        version: 'Rev 2.1',
        updatedAt: '2 days ago',
        uploadedBy: 'Zaha Hadid Interior Studio',
        category: 'Architectural Blueprint',
        description: 'Detailed 24-sheet interior architectural millwork specification including fluted walnut panelling and hidden LED channels.',
        status: 'Approved',
        checksum: 'SHA-256: D7821B59C20A3E87994412EA',
        pageCountOrUnits: '24 Sheets',
      },
      {
        id: 'doc-904-2',
        title: 'Level 82 Penthouse Architectural Layout',
        fileName: 'Solarium_Level82_Architectural_Floorplan.dwg',
        fileType: 'cad',
        extension: 'DWG',
        fileSize: '64.1 MB',
        version: 'v2.0 (AutoCAD 2026)',
        updatedAt: '4 days ago',
        uploadedBy: 'Markus Weber Studio',
        category: 'CAD / 3D Exchange',
        description: 'Complete DWG plan with layer segregation for lighting tracks, HVAC diffusers, furniture layouts, and stone slab tiling joints.',
        status: 'Approved',
        checksum: 'SHA-256: 8812A90C3FE71B45560199AD',
        pageCountOrUnits: 'Metric / mm',
      },
      {
        id: 'doc-904-3',
        title: 'Calacatta Marble & Walnut PBR Material Index',
        fileName: 'Italian_Walnut_Calacatta_Marble_PBR_Index.json',
        fileType: 'spec',
        extension: 'JSON',
        fileSize: '2.8 MB',
        version: 'v1.4 (PBR Albedo / Normal / Roughness)',
        updatedAt: '5 days ago',
        uploadedBy: 'VizTR Surface Division',
        category: 'Technical Specs',
        description: 'Surface scanning photogrammetry metadata with 8K displacement height maps and anisotropic specular maps.',
        status: 'In Review',
        checksum: 'SHA-256: BC44910A77EE3210459811BA',
        pageCountOrUnits: 'JSON Schema',
      },
      {
        id: 'doc-904-4',
        title: 'Delta Light Photometric IES Lighting Profile Set',
        fileName: 'Delta_Light_IES_Photometric_Profile_Collection.ies',
        fileType: 'spec',
        extension: 'IES',
        fileSize: '6.2 MB',
        version: 'v2026.1 (LM-63 Format)',
        updatedAt: '1 week ago',
        uploadedBy: 'Lighting Design Partners',
        category: 'Technical Specs',
        description: 'Photometric candela distribution files for recessed wall-washers, ceiling spots, and cove accent luminaires.',
        status: 'Approved',
        checksum: 'SHA-256: AA9014523EF76B190287CC31',
        pageCountOrUnits: 'IES Photometric',
      },
    ],
    roadmapStages: [
      {
        stage: 1,
        title: 'Brief & CAD/BIM Ingestion',
        subtitle: 'Level 82 Penthouse layouts, millwork elevations, and lighting schedule.',
        description: 'Ingestion of architectural DWG floorplans, lighting fixture coordinates, and Italian walnut joinery technical elevations. Spatial room volumes calibrated to 1:1 scale.',
        status: 'completed',
        expectedDuration: '2 Days',
        actualDate: 'Feb 10, 2026',
        leadSupervisor: 'Zaha Hadid Interior Studio',
        completionPercentage: 100,
        keyMilestoneNotes: 'Spatial ceiling heights confirmed at 4.2m with double-height central atrium.',
        deliverables: [
          {
            id: 'd-904-1',
            name: 'Solarium_Level82_Architectural_Floorplan.dwg',
            type: 'DWG',
            size: '64.1 MB',
            isAvailable: true,
          },
        ],
      },
      {
        stage: 2,
        title: '3D Interior Staging & Custom Millwork',
        subtitle: 'Bespoke Italian joinery, curved plaster bulkheads, and designer furniture.',
        description: 'Modeling bespoke fluted walnut cabinetry, Calacatta marble monolithic kitchen island, and staging curated B&B Italia and Minotti furniture collections.',
        status: 'completed',
        expectedDuration: '4 Days',
        actualDate: 'Feb 16, 2026',
        leadSupervisor: 'VizTR Interior Modeler',
        completionPercentage: 100,
        keyMilestoneNotes: 'High-poly furniture models loaded with realistic fabric micro-creases and leather stitching details.',
        deliverables: [
          {
            id: 'd-904-2',
            name: 'Solarium_Penthouse_Millwork_Lighting_Plan.pdf',
            type: 'PDF',
            size: '28.4 MB',
            isAvailable: true,
          },
        ],
      },
      {
        stage: 3,
        title: 'Clay Renders & 360 Panorama Node Setup',
        subtitle: 'Monochromatic lighting massing and 360° spherical camera node placement.',
        description: 'Establishing 8 interactive 360° spherical camera nodes throughout the triplex layout (Grand Foyer, Salon, Master Library, Wine Room, Terrace).',
        status: 'completed',
        expectedDuration: '3 Days',
        actualDate: 'Feb 22, 2026',
        leadSupervisor: 'Virtual Reality Team',
        completionPercentage: 100,
        keyMilestoneNotes: 'Spherical nodes locked with smooth inter-room teleportation transitions.',
        deliverables: [
          {
            id: 'd-904-3',
            name: 'Solarium_Clay_Draft_Living_360.jpg',
            type: 'JPG',
            size: '6.2 MB',
            previewUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85',
            isAvailable: true,
          },
        ],
      },
      {
        stage: 4,
        title: 'Lighting, PBR Materials & Staging',
        subtitle: 'Active physical light simulation, Delta Light IES profiles, and marble caustics.',
        description: 'Currently applying real-world Delta Light photometric candela curves, bookmatched Calacatta marble normal displacement maps, and warm 2700K ambient cove lighting.',
        status: 'in-progress',
        expectedDuration: '4 Days',
        actualDate: 'Active Now (ETA: Friday)',
        leadSupervisor: 'Surface & Lighting Division',
        completionPercentage: 60,
        keyMilestoneNotes: '3 active revision tickets under review for library walnut veneer grain saturation.',
        deliverables: [
          {
            id: 'd-904-4',
            name: 'Italian_Walnut_Calacatta_Marble_PBR_Index.json',
            type: 'JSON',
            size: '2.8 MB',
            isAvailable: true,
          },
          {
            id: 'd-904-5',
            name: 'Delta_Light_IES_Photometric_Profile_Collection.ies',
            type: 'JSON',
            size: '6.2 MB',
            isAvailable: true,
          },
        ],
      },
      {
        stage: 5,
        title: 'Client Collaborative Review & Markups',
        subtitle: 'Interactive lighting review & material texture signoff session.',
        description: 'Reviewing fine-tuned wood stain tone and evening twilight horizon view calibration.',
        status: 'pending',
        expectedDuration: '3 Days',
        actualDate: 'Expected March 01, 2026',
        leadSupervisor: 'Markus Weber Studio',
        completionPercentage: 0,
        deliverables: [],
      },
      {
        stage: 6,
        title: 'Final 8K Production Rendering & 360 Nodes',
        subtitle: 'Multi-pass EXR ray tracing and spherical 360 panorama baking.',
        description: 'Full 8K production baking of all 8 room nodes with ambient occlusion and reflection passes.',
        status: 'pending',
        expectedDuration: '4 Days',
        actualDate: 'Expected March 06, 2026',
        leadSupervisor: 'VizTR Render Farm',
        completionPercentage: 0,
        deliverables: [],
      },
      {
        stage: 7,
        title: 'Final Archival & WebXR Node Package',
        subtitle: 'Delivery of 8K stills and interactive 360 cloud tour.',
        description: 'Archival ZIP bundle with high-resolution master stills and embeddable WebXR 360 tour.',
        status: 'pending',
        expectedDuration: '1 Day',
        actualDate: 'Expected March 10, 2026',
        leadSupervisor: 'Archival Team',
        completionPercentage: 0,
        deliverables: [],
      },
    ],
  },
  {
    id: 'VIZTR-771',
    name: 'Nordic Monolith Residence - 8K Photorealistic Stills',
    category: 'Residential Architecture',
    status: 'Completed',
    progress: 100,
    lastUpdate: 'Approved & Archival Master Dispatched',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    leadArchitect: 'Soren Lindqvist, Snøhetta Studio',
    deliverablesCount: 22,
    xrAvailable: false,
    pixelStreamingAvailable: false,
    stats: {
      hoursSpent: 210.0,
      totalEstimatedHours: 210.0,
      assetsApproved: 22,
      totalAssets: 22,
      pendingRevisions: 0,
      revisionsSummary: 'Zero blockers — all milestone batches signed off',
      nextMilestone: 'Archival Master Package Dispatched',
      milestoneEta: 'Completed',
      currentStageNumber: 7,
      totalStages: 7,
    },
    documents: [
      {
        id: 'doc-771-1',
        title: 'Full Building Permit & Architectural Blueprint Set',
        fileName: 'Nordic_Monolith_Permit_Set_Full.pdf',
        fileType: 'pdf',
        extension: 'PDF',
        fileSize: '52.0 MB',
        version: 'Final As-Built',
        updatedAt: '2 weeks ago',
        uploadedBy: 'Snøhetta Studio Oslo',
        category: 'Architectural Blueprint',
        description: '36-sheet final architectural blueprint set encompassing cross-sections, elevation cuts, and foundation concrete specifications.',
        status: 'Approved',
        checksum: 'SHA-256: 449A01C88DF23B671190EE12',
        pageCountOrUnits: '36 Sheets',
      },
      {
        id: 'doc-771-2',
        title: 'Site Topography & Terrain 3D Rhino Model',
        fileName: 'Nordic_Monolith_Terrain_Landscape_Topography.3dm',
        fileType: 'cad',
        extension: '3DM',
        fileSize: '142.8 MB',
        version: 'Rhino 8 NURBS Mesh',
        updatedAt: '3 weeks ago',
        uploadedBy: 'Geodetic Survey Norway',
        category: 'CAD / 3D Exchange',
        description: 'High-density LIDAR topography mesh containing fjord cliff contours, vegetation scatter points, and water level markers.',
        status: 'Approved',
        checksum: 'SHA-256: FF12890C67BA4512998814BC',
        pageCountOrUnits: 'NURBS / mm',
      },
      {
        id: 'doc-771-3',
        title: 'Archival Master Package Signoff Certificate',
        fileName: 'Archival_Master_Package_Signoff_Certificate.pdf',
        fileType: 'pdf',
        extension: 'PDF',
        fileSize: '3.4 MB',
        version: 'v1.0 (Archival)',
        updatedAt: '2 weeks ago',
        uploadedBy: 'Soren Lindqvist',
        category: 'Milestone Signoff',
        description: 'Final close-out certificate and intellectual property license for high-resolution 8K promotional still assets.',
        status: 'Approved',
        checksum: 'SHA-256: 1109AC87EE44321098BA76EF',
        pageCountOrUnits: '2 Sheets',
      },
    ],
    roadmapStages: [
      {
        stage: 1,
        title: 'Brief & CAD/BIM Ingestion',
        subtitle: 'Oslo architectural drawings, timber specs, and fjord topography.',
        description: 'Complete onboarding of Snøhetta architectural permit documentation and 3D Rhino terrain topography mesh.',
        status: 'completed',
        expectedDuration: '2 Days',
        actualDate: 'Jan 15, 2026',
        leadSupervisor: 'Snøhetta BIM Team',
        completionPercentage: 100,
        deliverables: [
          {
            id: 'd-771-1',
            name: 'Nordic_Monolith_Permit_Set_Full.pdf',
            type: 'PDF',
            size: '52.0 MB',
            isAvailable: true,
          },
        ],
      },
      {
        stage: 2,
        title: 'High-Poly 3D Modeling & Cliff Integration',
        subtitle: 'Board-formed concrete textures, cedar slats, and cliffside anchoring.',
        description: 'Constructing architectural volume nestled against coastal granite cliff with bespoke glazed floor-to-ceiling facade openings.',
        status: 'completed',
        expectedDuration: '5 Days',
        actualDate: 'Jan 22, 2026',
        leadSupervisor: 'VizTR Exterior Lead',
        completionPercentage: 100,
        deliverables: [
          {
            id: 'd-771-2',
            name: 'Nordic_Monolith_Terrain_Landscape_Topography.3dm',
            type: 'DWG',
            size: '142.8 MB',
            isAvailable: true,
          },
        ],
      },
      {
        stage: 3,
        title: 'Clay Renders & Cinematic Camera Angles',
        subtitle: 'Fjord reflection compositions and seasonal Nordic sun path study.',
        description: 'Composed 8 master still cameras capturing dramatic low-altitude winter sun and water reflections.',
        status: 'completed',
        expectedDuration: '3 Days',
        actualDate: 'Jan 28, 2026',
        leadSupervisor: 'CGI Art Director',
        completionPercentage: 100,
        deliverables: [
          {
            id: 'd-771-3',
            name: 'Nordic_Monolith_Clay_Camera_Batch.jpg',
            type: 'JPG',
            size: '7.8 MB',
            previewUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
            isAvailable: true,
          },
        ],
      },
      {
        stage: 4,
        title: 'Atmospheric Fog, Snow & Lighting Simulation',
        subtitle: 'Nordic twilight atmosphere, volumetric coastal mist, and interior hearth glow.',
        description: 'Unreal Engine 5.5 Lumen atmospheric fog scattering, water surface shaders with micro-ripples, and warm 2400K fireplace interior lighting.',
        status: 'completed',
        expectedDuration: '4 Days',
        actualDate: 'Feb 04, 2026',
        leadSupervisor: 'Atmosphere & VFX Team',
        completionPercentage: 100,
        deliverables: [],
      },
      {
        stage: 5,
        title: 'Client Review & Material Calibration',
        subtitle: 'Soren Lindqvist final markup review on charred timber facade.',
        description: 'Reviewing yakisugi charred cedar tone depth and wet concrete specular sheen.',
        status: 'completed',
        expectedDuration: '2 Days',
        actualDate: 'Feb 10, 2026',
        leadSupervisor: 'Snøhetta & VizTR Leads',
        completionPercentage: 100,
        deliverables: [],
      },
      {
        stage: 6,
        title: 'Multi-Pass 8K Final Production Rendering',
        subtitle: 'Full 8K ultra-high-resolution ray tracing with 32-bit floating point depth.',
        description: 'Completed 22 master 8K render passes with cryptomatte ID channels for print advertising and architectural magazine publication.',
        status: 'completed',
        expectedDuration: '4 Days',
        actualDate: 'Feb 16, 2026',
        leadSupervisor: 'Render Farm Operations',
        completionPercentage: 100,
        deliverables: [
          {
            id: 'd-771-4',
            name: 'Nordic_Monolith_8K_Master_Hero_Print.tiff',
            type: 'TIFF',
            size: '310 MB',
            isAvailable: true,
          },
        ],
      },
      {
        stage: 7,
        title: 'Final Archival & Master Package Delivery',
        subtitle: 'Master archival bundle delivered & closeout signoff certificate executed.',
        description: 'Commission completed in full. Master deliverables archived in cloud vault with lifetime client access.',
        status: 'completed',
        expectedDuration: '1 Day',
        actualDate: 'Feb 20, 2026',
        leadSupervisor: 'Soren Lindqvist (Client Acceptance)',
        completionPercentage: 100,
        keyMilestoneNotes: 'Signed off with zero revisions. Full commercial rights transferred.',
        deliverables: [
          {
            id: 'd-771-5',
            name: 'Archival_Master_Package_Signoff_Certificate.pdf',
            type: 'PDF',
            size: '3.4 MB',
            isAvailable: true,
          },
        ],
      },
    ],
  }
];

export default function ClientDashboardPage() {
  const { user, showToast, openModelViewer, openPanorama, openPixelStream } = useAppStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('VIZTR-882');
  const [activeTab, setActiveTab] = useState<'all' | 'timelapses' | 'compare' | 'pipeline' | 'documents' | 'reviews'>('all');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const [archivingProjects, setArchivingProjects] = useState<Record<string, boolean>>({});
  const [archivedProjects, setArchivedProjects] = useState<Record<string, boolean>>({});

  // Drag-and-drop & status filtering state
  const [orderedProjects, setOrderedProjects] = useState<ClientProject[]>(CLIENT_PROJECTS);
  const [managedProjects, setManagedProjects] = useState<ManagedProject[]>(INITIAL_MANAGED_PROJECTS);
  const [statusFilter, setStatusFilter] = useState<'all' | 'In Production' | 'Client Review' | 'Completed'>('all');
  const [draggedProjectIndex, setDraggedProjectIndex] = useState<number | null>(null);
  const [dragOverProjectIndex, setDragOverProjectIndex] = useState<number | null>(null);

  // Collapsible Side Panels State
  const [leftPanelOpen, setLeftPanelOpen] = useState<boolean>(true);
  const [rightPanelOpen, setRightPanelOpen] = useState<boolean>(true);

  // Dedicated Revision History & Chronological Markups Modal State
  const [revisionHistoryModalOpen, setRevisionHistoryModalOpen] = useState<boolean>(false);
  const [revisionHistoryProject, setRevisionHistoryProject] = useState<{ id: string; name: string } | null>(null);

  // Filter Criteria State
  const [filterCriteria, setFilterCriteria] = useState<{
    searchQuery: string;
    projectType: ProjectType | 'all';
    status: ProjectStatus | 'all';
    paymentStatus: PaymentStatus | 'all';
    category: string | 'all';
    budgetTier: 'all' | 'under50k' | '50kTo100k' | 'over100k';
  }>({
    searchQuery: '',
    projectType: 'all',
    status: 'all',
    paymentStatus: 'all',
    category: 'all',
    budgetTier: 'all',
  });

  const selectedProject = orderedProjects.find((p) => p.id === selectedProjectId) || orderedProjects[0];
  const selectedManagedProject = managedProjects.find((p) => p.id === selectedProjectId) || managedProjects[0];

  const handleResetAllFilters = () => {
    setFilterCriteria({
      searchQuery: '',
      projectType: 'all',
      status: 'all',
      paymentStatus: 'all',
      category: 'all',
      budgetTier: 'all',
    });
    setStatusFilter('all');
    showToast('Filters reset.', 'info');
  };

  const handleLogHours = (projectId: string, entry: Omit<TimesheetEntry, 'id'>) => {
    const newEntry: TimesheetEntry = {
      ...entry,
      id: `ts-${Date.now()}`,
    };
    setManagedProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const updatedHours = p.hoursMonitoring.hoursSpent + entry.hours;
          return {
            ...p,
            hoursMonitoring: {
              ...p.hoursMonitoring,
              hoursSpent: updatedHours,
              timesheetEntries: [newEntry, ...p.hoursMonitoring.timesheetEntries],
            },
          };
        }
        return p;
      })
    );
  };

  // Status Filter Counts
  const totalCount = orderedProjects.length;
  const inProdCount = orderedProjects.filter((p) => p.status === 'In Production').length;
  const reviewCount = orderedProjects.filter((p) => p.status === 'Client Review').length;
  const completedCount = orderedProjects.filter((p) => p.status === 'Completed').length;

  const filteredProjects = orderedProjects.filter((p) => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  const isCustomSorted = JSON.stringify(orderedProjects.map((p) => p.id)) !== JSON.stringify(CLIENT_PROJECTS.map((p) => p.id));

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedProjectIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverProjectIndex !== index) {
      setDragOverProjectIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedProjectIndex === null || draggedProjectIndex === targetIndex) {
      setDraggedProjectIndex(null);
      setDragOverProjectIndex(null);
      return;
    }

    const newProjects = [...orderedProjects];
    const [removed] = newProjects.splice(draggedProjectIndex, 1);
    newProjects.splice(targetIndex, 0, removed);
    setOrderedProjects(newProjects);
    setDraggedProjectIndex(null);
    setDragOverProjectIndex(null);
    showToast('Project list order updated.', 'success');
  };

  const handleDragEnd = () => {
    setDraggedProjectIndex(null);
    setDragOverProjectIndex(null);
  };

  const handleResetOrder = () => {
    setOrderedProjects(CLIENT_PROJECTS);
    showToast('Visual sorting order restored to default.', 'info');
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSubmitted(true);
    showToast('Revision feedback logged and routed directly to the production lead.', 'success');
  };

  const handleBatchArchive = (projectId: string, projectName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (archivingProjects[projectId]) return;

    setArchivingProjects((prev) => ({ ...prev, [projectId]: true }));
    showToast(`Triggering batch cloud backup for ${projectName} (CAD, BIM & 8K renders)...`, 'info');

    setTimeout(() => {
      setArchivingProjects((prev) => ({ ...prev, [projectId]: false }));
      setArchivedProjects((prev) => ({ ...prev, [projectId]: true }));
      showToast(`Batch Cloud Archive Complete: All approved deliverables for ${projectName} safely replicated to redundant vault.`, 'success');
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col w-full">
      {/* WIDESCREEN FLEX CONTAINER WITH COLLAPSIBLE SIDE PANELS */}
      <div className="flex-1 flex overflow-hidden w-full max-w-[2400px] mx-auto min-h-screen">
        {/* COLLAPSIBLE LEFT FILTER PANEL */}
        <CollapsibleLeftFilterPanel
          isOpen={leftPanelOpen}
          onToggle={() => setLeftPanelOpen(!leftPanelOpen)}
          projects={managedProjects}
          selectedProjectId={selectedProjectId}
          onSelectProject={(id) => {
            setSelectedProjectId(id);
            setFeedbackSubmitted(false);
          }}
          filters={filterCriteria}
          onFilterChange={setFilterCriteria}
          onResetFilters={handleResetAllFilters}
          userRole="CLIENT"
        />

        {/* CENTRAL WORKSPACE (EXPANDS ON WIDESCREEN) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 min-w-0">
          {/* HEADER BAR */}
          <div
            role="region"
            aria-label="Client Portal Header"
            className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  role="status"
                  aria-label="Portal authorization status: Authorized Client Portal"
                  className="px-2.5 py-0.5 rounded-md bg-[#09090B] border border-[#3ECF8E]/40 text-[10px] font-mono font-bold uppercase text-[#3ECF8E]"
                >
                  Authorized Client Portal
                </span>
                <span className="text-xs font-mono text-[#71717A]">• Project Workspace</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
                Welcome, {user?.name || 'Elena Rostova'}
              </h1>
              <p className="text-xs text-[#A1A1AA]">
                Viewing {orderedProjects.length} active architectural CGI pipelines under NDA license agreement.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Quick Side Panel Toggle Buttons */}
              <button
                type="button"
                onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  leftPanelOpen
                    ? 'bg-[#3ECF8E]/20 text-[#3ECF8E] border-[#3ECF8E]/40'
                    : 'bg-[#09090B] text-[#A1A1AA] border-[#27272A] hover:text-white'
                }`}
                title="Toggle Left Category & Status Filters"
              >
                <Filter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Filters</span>
              </button>

              <button
                type="button"
                onClick={() => setRightPanelOpen(!rightPanelOpen)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  rightPanelOpen
                    ? 'bg-[#3ECF8E]/20 text-[#3ECF8E] border-[#3ECF8E]/40'
                    : 'bg-[#09090B] text-[#A1A1AA] border-[#27272A] hover:text-white'
                }`}
                title="Toggle Right Hours Spent & Pipeline Inspector"
              >
                <Clock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hours & Pipeline</span>
              </button>

              <Link
                href={`/client-view/${selectedProject.id}`}
                aria-label={`Copy public review link for ${selectedProject.name}`}
                className="px-3 py-1.5 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-xs font-mono text-white flex items-center gap-1.5 transition-colors focus:outline-none focus:ring-1 focus:ring-[#3ECF8E]"
              >
                <Share2 className="w-3.5 h-3.5 text-[#3ECF8E]" />
                <span className="hidden sm:inline">Public Link</span>
              </Link>
              <Link
                href="/contact"
                aria-label="Schedule an architectural project review call"
                className="px-3.5 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
              >
                Schedule Call
              </Link>
            </div>
          </div>

        {/* ASSIGNED PROJECTS GRID WITH STATUS FILTER PILLS & DRAG-AND-DROP REORDER */}
        <section aria-labelledby="assigned-projects-heading" className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-1 border-b border-[#27272A]">
            <div className="flex items-center gap-3">
              <h2
                id="assigned-projects-heading"
                className="text-sm font-mono font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-2"
              >
                <span>Assigned Architectural Commissions ({filteredProjects.length})</span>
              </h2>
              {isCustomSorted && (
                <button
                  type="button"
                  onClick={handleResetOrder}
                  className="px-2 py-0.5 rounded bg-[#27272A] hover:bg-[#3ECF8E]/20 hover:text-[#3ECF8E] text-[10px] font-mono text-[#A1A1AA] flex items-center gap-1 transition-colors cursor-pointer"
                  title="Reset custom drag-and-drop order"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Order</span>
                </button>
              )}
            </div>

            {/* FILTER PILL-BUTTONS & DROPDOWN */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-xl bg-[#141416] border border-[#27272A]">
                <button
                  type="button"
                  id="filter-all-projects"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === 'all'
                      ? 'bg-[#3ECF8E] text-black font-bold shadow-md'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-[#27272A]'
                  }`}
                >
                  <span>All</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                      statusFilter === 'all' ? 'bg-black/20 text-black' : 'bg-[#27272A] text-[#A1A1AA]'
                    }`}
                  >
                    {totalCount}
                  </span>
                </button>

                <button
                  type="button"
                  id="filter-in-production"
                  onClick={() => setStatusFilter('In Production')}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === 'In Production'
                      ? 'bg-[#3ECF8E] text-black font-bold shadow-md'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-[#27272A]'
                  }`}
                >
                  <span>In Production</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                      statusFilter === 'In Production' ? 'bg-black/20 text-black' : 'bg-[#27272A] text-[#A1A1AA]'
                    }`}
                  >
                    {inProdCount}
                  </span>
                </button>

                <button
                  type="button"
                  id="filter-client-review"
                  onClick={() => setStatusFilter('Client Review')}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === 'Client Review'
                      ? 'bg-[#3ECF8E] text-black font-bold shadow-md'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-[#27272A]'
                  }`}
                >
                  <span>Client Review</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                      statusFilter === 'Client Review' ? 'bg-black/20 text-black' : 'bg-[#27272A] text-[#A1A1AA]'
                    }`}
                  >
                    {reviewCount}
                  </span>
                </button>

                <button
                  type="button"
                  id="filter-completed"
                  onClick={() => setStatusFilter('Completed')}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === 'Completed'
                      ? 'bg-[#3ECF8E] text-black font-bold shadow-md'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-[#27272A]'
                  }`}
                >
                  <span>Completed</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                      statusFilter === 'Completed' ? 'bg-black/20 text-black' : 'bg-[#27272A] text-[#A1A1AA]'
                    }`}
                  >
                    {completedCount}
                  </span>
                </button>
              </div>

              {/* MOBILE DROPDOWN FILTER */}
              <div className="sm:hidden relative w-full flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#3ECF8E] shrink-0" />
                <select
                  id="mobile-status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full bg-[#18181B] border border-[#27272A] text-white text-xs font-mono rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#3ECF8E]"
                >
                  <option value="all">All Projects ({totalCount})</option>
                  <option value="In Production">In Production ({inProdCount})</option>
                  <option value="Client Review">Client Review ({reviewCount})</option>
                  <option value="Completed">Completed ({completedCount})</option>
                </select>
              </div>

              <div className="hidden xl:flex items-center gap-1.5 text-[11px] font-mono text-[#71717A] pl-2 border-l border-[#27272A]">
                <GripVertical className="w-3.5 h-3.5 text-[#3ECF8E]" />
                <span>Drag cards to reorder</span>
              </div>
            </div>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.04,
                },
              },
            }}
          >
            {filteredProjects.map((project, index) => {
              const isSelected = project.id === selectedProjectId;
              const hasPendingRevisions = project.stats.pendingRevisions > 0;
              const isArchiving = !!archivingProjects[project.id];
              const isArchived = !!archivedProjects[project.id];
              const isDragging = draggedProjectIndex === index;
              const isDragOver = dragOverProjectIndex === index;

              return (
                <motion.div
                  key={project.id}
                  id={`project-card-${project.id}`}
                  draggable
                  onDragStartCapture={(e: React.DragEvent) => handleDragStart(e, index)}
                  onDragOverCapture={(e: React.DragEvent) => handleDragOver(e, index)}
                  onDragEndCapture={handleDragEnd}
                  onDropCapture={(e: React.DragEvent) => handleDrop(e, index)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`Select commission ${project.name}, Status: ${project.status}, Progress: ${project.progress}%. Drag to customize sort position.`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedProjectId(project.id);
                      setFeedbackSubmitted(false);
                    }
                  }}
                  onMouseEnter={() => setHoveredProjectId(project.id)}
                  onMouseLeave={() => setHoveredProjectId(null)}
                  onFocus={() => setHoveredProjectId(project.id)}
                  onBlur={() => setHoveredProjectId(null)}
                  aria-describedby={hoveredProjectId === project.id ? `project-peek-${project.id}` : undefined}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.45,
                        ease: [0.16, 1, 0.3, 1],
                      },
                    },
                  }}
                  animate={{
                    scale: isSelected ? 1.025 : 1,
                    boxShadow: isSelected
                      ? '0 0 28px -2px rgba(62, 207, 142, 0.28), 0 12px 24px -6px rgba(0, 0, 0, 0.6)'
                      : '0 0 0px 0px rgba(0, 0, 0, 0)',
                    borderColor: isSelected ? '#3ECF8E' : 'rgba(39, 39, 42, 1)',
                  }}
                  whileHover={{
                    scale: isSelected ? 1.035 : 1.015,
                    y: -3,
                    boxShadow: isSelected
                      ? '0 0 35px 0px rgba(62, 207, 142, 0.38), 0 16px 28px -6px rgba(0, 0, 0, 0.7)'
                      : '0 0 16px -2px rgba(62, 207, 142, 0.15), 0 8px 16px -4px rgba(0, 0, 0, 0.4)',
                  }}
                  whileTap={{ scale: 0.99 }}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 24,
                  }}
                  onClick={() => {
                    setSelectedProjectId(project.id);
                    setFeedbackSubmitted(false);
                  }}
                  className={`hd-card p-4 rounded-2xl border transition-colors cursor-grab active:cursor-grabbing flex flex-col justify-between space-y-4 focus:outline-none focus:ring-2 focus:ring-[#3ECF8E] relative overflow-hidden ${
                    isDragging
                      ? 'opacity-40 border-dashed border-[#3ECF8E] scale-95'
                      : isDragOver
                      ? 'ring-2 ring-[#3ECF8E] border-[#3ECF8E] scale-[1.02]'
                      : isSelected
                      ? 'bg-[#18181B] border-[#3ECF8E] ring-1 ring-[#3ECF8E]/40'
                      : 'bg-[#18181B]/60 border-[#27272A] hover:border-[#3ECF8E]/40'
                  }`}
                >
                  {/* HOVER-ACTIVATED DETAIL PEEK TOOLTIP / POPUP */}
                  <AnimatePresence>
                    {hoveredProjectId === project.id && (
                      <motion.div
                        id={`project-peek-${project.id}`}
                        role="tooltip"
                        aria-live="polite"
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="absolute inset-x-2.5 top-2.5 z-40 p-3 rounded-xl bg-[#09090B]/95 backdrop-blur-md border border-[#3ECF8E]/50 shadow-2xl shadow-black/90 pointer-events-none space-y-2.5 text-left"
                      >
                        {/* PEEK HEADER */}
                        <div className="flex items-center justify-between pb-1.5 border-b border-[#27272A]">
                          <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3ECF8E] opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3ECF8E]"></span>
                            </span>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#3ECF8E]">
                              Telemetry Peek
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-[#71717A]">
                            {project.id}
                          </span>
                        </div>

                        {/* CRITICAL METRIC: CURRENT STAGE */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-[#A1A1AA] flex items-center gap-1">
                              <Layers className="w-3 h-3 text-[#3ECF8E]" />
                              <span>Current Stage</span>
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-[#27272A] text-white font-bold text-[9px]">
                              Stage {project.stats.currentStageNumber} / {project.stats.totalStages}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono font-semibold text-white truncate">
                            {project.stats.nextMilestone}
                          </p>
                        </div>

                        {/* CRITICAL METRIC: PENDING REVISIONS COUNT */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-[#A1A1AA] flex items-center gap-1">
                              <AlertCircle className={`w-3 h-3 ${project.stats.pendingRevisions > 0 ? 'text-amber-400' : 'text-emerald-400'}`} />
                              <span>Pending Revisions</span>
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                                project.stats.pendingRevisions > 0
                                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                              }`}
                            >
                              {project.stats.pendingRevisions > 0
                                ? `${project.stats.pendingRevisions} Action Required`
                                : '0 (All Approved)'}
                            </span>
                          </div>
                          {project.stats.pendingRevisions > 0 ? (
                            <p className="text-[10px] font-mono text-amber-400/90 line-clamp-1">
                              {project.stats.revisionsSummary}
                            </p>
                          ) : (
                            <p className="text-[10px] font-mono text-emerald-400/90">
                              All current milestones signed off
                            </p>
                          )}
                        </div>

                        {/* SECONDARY QUICK METRICS ROW */}
                        <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-[#27272A]/80 text-[10px] font-mono">
                          <div>
                            <span className="text-[#71717A] text-[9px] block">ETA Milestone</span>
                            <span className="text-white font-medium">{project.stats.milestoneEta}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[#71717A] text-[9px] block">Approved Assets</span>
                            <span className="text-[#3ECF8E] font-medium">
                              {project.stats.assetsApproved}/{project.stats.totalAssets} Locked
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="space-y-3">
                    <div className="relative h-36 rounded-xl overflow-hidden bg-[#09090B]">
                      <Image
                        src={project.image}
                        alt={`Archival preview of ${project.name}`}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <div className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-white flex items-center gap-1">
                          <GripVertical className="w-3 h-3 text-[#3ECF8E]/80" />
                          <span>{project.id}</span>
                        </div>
                      </div>
                      
                      <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        {/* Revision History icon button on card */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRevisionHistoryProject({ id: project.id, name: project.name });
                            setRevisionHistoryModalOpen(true);
                          }}
                          aria-label={`View Revision History for ${project.name}`}
                          title="Revision History — view chronological markups and changes"
                          className="p-1 rounded bg-black/80 hover:bg-[#27272A] border border-white/10 hover:border-[#3ECF8E]/60 text-zinc-300 hover:text-[#3ECF8E] transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-mono shadow-sm"
                        >
                          <History className="w-3 h-3 text-[#3ECF8E]" />
                          <span className="hidden sm:inline">History</span>
                        </button>

                        <div
                          role="status"
                          aria-label={`Current phase status: ${project.status}`}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            project.status === 'Completed'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                              : 'bg-[#3ECF8E]/20 text-[#3ECF8E] border border-[#3ECF8E]/40'
                          }`}
                        >
                          {project.status}
                        </div>
                      </div>

                      {/* NEEDS-ATTENTION PULSE INDICATOR OVERLAY */}
                      {hasPendingRevisions && (
                        <div
                          role="status"
                          aria-label={`Needs Attention: ${project.stats.pendingRevisions} pending revision review`}
                          className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/85 backdrop-blur-md border border-amber-500/60 text-[10px] font-mono text-amber-400 shadow-lg"
                        >
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                          </span>
                          <span className="font-bold tracking-tight">Needs Attention ({project.stats.pendingRevisions})</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold font-display text-white line-clamp-1">
                          {project.name}
                        </h3>
                        {isSelected && (
                          <span className="px-1.5 py-0.5 rounded bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 text-[9px] font-mono text-[#3ECF8E] uppercase font-bold shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#71717A] font-mono">{project.category}</p>
                    </div>

                    {/* STATUS CHANGE / NEEDS ATTENTION NOTICE IN SELECTED CARD */}
                    {hasPendingRevisions && isSelected && (
                      <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/60 flex items-center justify-between text-[10px] font-mono text-amber-300">
                        <div className="flex items-center gap-1.5 truncate">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">{project.stats.pendingRevisions} Revision Feedback Action Pending</span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-amber-900/60 border border-amber-700/60 text-[9px] uppercase font-bold shrink-0">
                          Review
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-[#27272A]">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#A1A1AA]">Pipeline Progress</span>
                      <span className="text-white font-bold">{project.progress}%</span>
                    </div>
                    <div
                      role="progressbar"
                      aria-valuenow={project.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${project.name} pipeline completion: ${project.progress}%`}
                      className="w-full h-1.5 rounded-full bg-[#09090B] overflow-hidden"
                    >
                      <div
                        className="h-full bg-[#3ECF8E] transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px] text-[#71717A] font-mono">
                      <span className="truncate">{project.lastUpdate}</span>
                      <span className="shrink-0">{project.deliverablesCount} Deliverables</span>
                    </div>

                    {/* BATCH ARCHIVE TOGGLE / ACTION BUTTON */}
                    <button
                      type="button"
                      onClick={(e) => handleBatchArchive(project.id, project.name, e)}
                      disabled={isArchiving}
                      aria-label={`Trigger cloud batch archive backup of all approved documents for ${project.name}`}
                      className={`w-full py-1.5 px-2.5 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#3ECF8E] ${
                        isArchived
                          ? 'bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 hover:bg-emerald-900/80'
                          : isArchiving
                          ? 'bg-[#18181B] border border-[#3ECF8E]/50 text-[#3ECF8E] cursor-wait'
                          : isSelected
                          ? 'bg-[#3ECF8E]/15 hover:bg-[#3ECF8E] text-[#3ECF8E] hover:text-black border border-[#3ECF8E]/40 shadow-sm'
                          : 'bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#3ECF8E]/40 text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      {isArchiving ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-[#3ECF8E]" />
                          <span>Archiving to Cloud...</span>
                        </>
                      ) : isArchived ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Cloud Backup Synced</span>
                        </>
                      ) : (
                        <>
                          <Archive className="w-3 h-3" />
                          <span>Batch Archive Docs</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* SELECTED PROJECT DETAIL VIEW */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-[#27272A] pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E]">
                  <span>COMMISSION DETAIL</span>
                  <span>•</span>
                  <span>{selectedProject.id}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                  {selectedProject.name}
                </h2>
                <p className="text-xs text-[#A1A1AA]">
                  Lead Architectural Contact: {selectedProject.leadArchitect}
                </p>
              </div>

              {/* ACTION LAUNCHERS */}
              <div className="flex flex-wrap items-center gap-2">
                {selectedProject.xrAvailable && (
                  <button
                    type="button"
                    onClick={() => openModelViewer('models/apex-tower-v3-draco.glb', selectedProject.name)}
                    aria-label={`Launch 3D WebXR Model viewer for ${selectedProject.name}`}
                    className="px-3 py-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#3ECF8E]/40 text-xs font-mono text-[#3ECF8E] flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#3ECF8E]"
                  >
                    <Box className="w-4 h-4" />
                    <span>Launch 3D WebXR Model</span>
                  </button>
                )}

                {selectedProject.pixelStreamingAvailable && (
                  <button
                    type="button"
                    onClick={() => openPixelStream()}
                    aria-label="Launch real-time Unreal Engine 5.5 Pixel Streaming session"
                    className="px-3 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    <span>Launch Pixel Stream</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => openPanorama('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=90', selectedProject.name)}
                  aria-label={`Launch 360° Panorama Spherical Node Tour for ${selectedProject.name}`}
                  className="px-3 py-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-xs font-mono text-white flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#3ECF8E]"
                >
                  <Eye className="w-4 h-4" />
                  <span>360° Node Tour</span>
                </button>
              </div>
            </div>

            {/* DASHBOARD MODULE FILTER / NAVIGATION TABS */}
            <div
              role="tablist"
              aria-label="Dashboard Module View Selector"
              className="flex items-center gap-1.5 p-1 rounded-xl bg-[#09090B] border border-[#27272A] overflow-x-auto text-xs font-mono"
            >
              <button
                type="button"
                role="tab"
                id="tab-all-modules"
                aria-selected={activeTab === 'all'}
                aria-controls="panel-dashboard-modules"
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-[#18181B] text-[#3ECF8E] font-bold border border-[#3ECF8E]/40 shadow-sm'
                    : 'text-[#71717A] hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Modules</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-timelapses"
                aria-selected={activeTab === 'timelapses'}
                aria-controls="panel-dashboard-modules"
                onClick={() => setActiveTab('timelapses')}
                className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'timelapses'
                    ? 'bg-[#18181B] text-[#3ECF8E] font-bold border border-[#3ECF8E]/40 shadow-sm'
                    : 'text-[#71717A] hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Project Timelapses</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-compare-revisions"
                aria-selected={activeTab === 'compare'}
                aria-controls="panel-dashboard-modules"
                onClick={() => setActiveTab('compare')}
                className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'compare'
                    ? 'bg-[#18181B] text-[#3ECF8E] font-bold border border-[#3ECF8E]/40 shadow-sm'
                    : 'text-[#71717A] hover:text-white'
                }`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span>Compare Revisions</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-pipeline-roadmap"
                aria-selected={activeTab === 'pipeline'}
                aria-controls="panel-dashboard-modules"
                onClick={() => setActiveTab('pipeline')}
                className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'pipeline'
                    ? 'bg-[#18181B] text-[#3ECF8E] font-bold border border-[#3ECF8E]/40 shadow-sm'
                    : 'text-[#71717A] hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>7-Stage Pipeline</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-documents-cad"
                aria-selected={activeTab === 'documents'}
                aria-controls="panel-dashboard-modules"
                onClick={() => setActiveTab('documents')}
                className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'documents'
                    ? 'bg-[#18181B] text-[#3ECF8E] font-bold border border-[#3ECF8E]/40 shadow-sm'
                    : 'text-[#71717A] hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Documents & CAD</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-reviews-meet"
                aria-selected={activeTab === 'reviews'}
                aria-controls="panel-dashboard-modules"
                onClick={() => setActiveTab('reviews')}
                className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'bg-[#18181B] text-[#3ECF8E] font-bold border border-[#3ECF8E]/40 shadow-sm'
                    : 'text-[#71717A] hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Live Video Reviews</span>
              </button>
            </div>

            {/* MAIN DASHBOARD CONTENT REGION */}
            <div id="panel-dashboard-modules" role="tabpanel" className="space-y-6">
              {/* PROJECT STATISTICS SUMMARY WIDGET */}
              <ProjectStatsWidget
                stats={selectedProject.stats}
                projectName={selectedProject.name}
                projectId={selectedProject.id}
              />

              {/* 1. PROJECT TIMELAPSES SECTION */}
              {(activeTab === 'all' || activeTab === 'timelapses') && (
                <section aria-labelledby="section-timelapses-title" className="space-y-3">
                  <ProjectTimelapses
                    projectId={selectedProject.id}
                    projectName={selectedProject.name}
                  />
                </section>
              )}

              {/* 2. COMPARE REVISIONS TOOL */}
              {(activeTab === 'all' || activeTab === 'compare') && (
                <section aria-labelledby="section-compare-title" className="space-y-3">
                  <ProjectRevisionCompare
                    projectId={selectedProject.id}
                    projectName={selectedProject.name}
                    documents={selectedProject.documents}
                  />
                </section>
              )}

              {/* 3. 7-STAGE PIPELINE ROADMAP */}
              {(activeTab === 'all' || activeTab === 'pipeline') && (
                <section aria-labelledby="section-roadmap-title" className="space-y-4">
                  <ProjectPhaseRoadmap
                    stages={selectedProject.roadmapStages}
                    currentStageNumber={selectedProject.stats.currentStageNumber}
                    projectName={selectedProject.name}
                    projectId={selectedProject.id}
                  />

                  {/* EMBEDDED TRACKER ENGINE */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#3ECF8E]" />
                      <span>Live 7-Stage Production Timeline & Access Token Query</span>
                    </h3>
                    <ProjectTracker initialProjectId={selectedProject.id} />
                  </div>
                </section>
              )}

              {/* 4. TECHNICAL DOCUMENT & CAD REPOSITORY */}
              {(activeTab === 'all' || activeTab === 'documents') && (
                <section aria-labelledby="section-documents-title" className="space-y-4">
                  <ProjectDocumentRepository
                    documents={selectedProject.documents}
                    projectName={selectedProject.name}
                    projectId={selectedProject.id}
                  />

                  {/* DOWNLOAD CENTER & ASSET ARCHIVE */}
                  <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                        <Download className="w-4 h-4 text-[#3ECF8E]" />
                        <span>Approved Deliverables & Master Package Archive ({selectedProject.deliverablesCount})</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => showToast('Master ZIP bundle packaging initiated (2.4 GB). Download will commence shortly.', 'success')}
                        aria-label="Download all approved deliverables as a 2.4 GB ZIP archive"
                        className="text-xs font-mono text-[#3ECF8E] hover:underline cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#3ECF8E]"
                      >
                        Download All (ZIP) →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
                      <div className="p-3 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-[#3ECF8E]" />
                          <div>
                            <div className="text-white font-bold">8K Exterior Master Hero TIFF</div>
                            <div className="text-[10px] text-[#71717A]">7680x4320 · 240 MB</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => showToast('Downloading 8K TIFF...', 'info')}
                          aria-label="Download 8K Exterior Master Hero TIFF (240 MB)"
                          className="p-1.5 rounded hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-3 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-[#3ECF8E]" />
                          <div>
                            <div className="text-white font-bold">WebXR GLB Compressed Asset</div>
                            <div className="text-[10px] text-[#71717A]">Draco Geometry · 8.4 MB</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => showToast('Downloading GLB asset...', 'info')}
                          aria-label="Download WebXR GLB Compressed Asset (8.4 MB)"
                          className="p-1.5 rounded hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-3 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-[#3ECF8E]" />
                          <div>
                            <div className="text-white font-bold">4K 60FPS Cinematic MP4</div>
                            <div className="text-[10px] text-[#71717A]">ProRes & H.265 · 820 MB</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => showToast('Downloading 4K MP4 Master...', 'info')}
                          aria-label="Download 4K 60FPS Cinematic MP4 Master (820 MB)"
                          className="p-1.5 rounded hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* 5. REVIEWS, GOOGLE MEET & DRIVE CLOUD INTEGRATIONS */}
              {(activeTab === 'all' || activeTab === 'reviews') && (
                <section aria-labelledby="section-reviews-title" className="space-y-4">
                  {/* REAL-TIME DESKTOP NOTIFICATIONS & MILESTONE ALERTS */}
                  <NotificationSettings />

                  {/* GOOGLE DRIVE CLIENT CLOUD INTEGRATION */}
                  <GoogleDriveClientConnect
                    currentProjectId={selectedProject.id}
                    currentProjectName={selectedProject.name}
                  />

                  {/* GOOGLE MEET CLIENT LIVE REVIEWS & CALENDAR SLOT SELECTOR */}
                  <GoogleMeetClientConnect
                    currentProjectId={selectedProject.id}
                    currentProjectName={selectedProject.name}
                  />

                  {/* DIRECT CLIENT REVISION FEEDBACK FORM */}
                  <div className="p-5 rounded-xl bg-[#09090B] border border-[#27272A] space-y-3">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#3ECF8E]" />
                      <span>Submit Client Revision Notes & Material Markups</span>
                    </h4>

                    {feedbackSubmitted ? (
                      <div
                        role="status"
                        aria-live="polite"
                        className="p-3 rounded-lg bg-[#18181B] border border-[#3ECF8E]/40 text-xs font-mono text-[#3ECF8E] flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Revision request logged. The studio lead will update render passes within 24 hours.</span>
                      </div>
                    ) : (
                      <form onSubmit={handleSendFeedback} className="space-y-3">
                        <label htmlFor="client-revision-notes" className="sr-only">
                          Client Revision Notes and Feedback
                        </label>
                        <textarea
                          id="client-revision-notes"
                          rows={3}
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="Enter lighting adjustments, material revisions, or camera angle notes for this milestone..."
                          className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E] resize-none"
                        />
                        <button
                          type="submit"
                          aria-label="Dispatch revision notes to lead CGI supervisor"
                          className="px-4 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
                        >
                          Dispatch Revision Notes
                        </button>
                      </form>
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* COLLAPSIBLE RIGHT INSPECTOR & HOURS MONITORING PANEL */}
      {selectedManagedProject && (
        <CollapsibleRightInspectorPanel
          isOpen={rightPanelOpen}
          onToggle={() => setRightPanelOpen(!rightPanelOpen)}
          project={selectedManagedProject}
          onLogHours={handleLogHours}
          userRole="CLIENT"
        />
      )}

      {/* REVISION HISTORY & CHRONOLOGICAL MARKUPS MODAL */}
      <RevisionHistoryModal
        isOpen={revisionHistoryModalOpen}
        onClose={() => setRevisionHistoryModalOpen(false)}
        projectId={revisionHistoryProject?.id || selectedProject.id}
        projectName={revisionHistoryProject?.name || selectedProject.name}
      />
    </div>
  </main>
);
}
