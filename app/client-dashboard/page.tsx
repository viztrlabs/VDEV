'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
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
  Settings
} from 'lucide-react';
import ProjectTracker from '@/components/tracking/ProjectTracker';
import NotificationSettings from '@/components/ui/NotificationSettings';
import ProjectStatsWidget, { ProjectStatsData } from '@/components/tracking/ProjectStatsWidget';
import ProjectDocumentRepository, { ProjectDocument } from '@/components/tracking/ProjectDocumentRepository';
import ProjectPhaseRoadmap, { RoadmapStage } from '@/components/tracking/ProjectPhaseRoadmap';

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
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const selectedProject = CLIENT_PROJECTS.find((p) => p.id === selectedProjectId) || CLIENT_PROJECTS[0];

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSubmitted(true);
    showToast('Revision feedback logged and routed directly to the production lead.', 'success');
  };

  return (
    <main className="min-h-screen bg-[#09090B] text-[#FAFAFA] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER BAR */}
        <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#09090B] border border-[#3ECF8E]/40 text-[10px] font-mono font-bold uppercase text-[#3ECF8E]">
                Authorized Client Portal
              </span>
              <span className="text-xs font-mono text-[#71717A]">• Project Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
              Welcome, {user?.name || 'Elena Rostova'}
            </h1>
            <p className="text-xs text-[#A1A1AA]">
              Viewing 3 active architectural CGI pipelines under NDA license agreement.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/client-view/${selectedProject.id}`}
              className="px-3 py-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-xs font-mono text-white flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-[#3ECF8E]" />
              <span>Copy Public Link</span>
            </Link>
            <Link
              href="/contact"
              className="px-3.5 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
            >
              Schedule Review Call
            </Link>
          </div>
        </div>

        {/* ASSIGNED PROJECTS GRID */}
        <div className="space-y-3">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[#A1A1AA]">
            Assigned Architectural Commissions ({CLIENT_PROJECTS.length})
          </h2>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.05,
                },
              },
            }}
          >
            {CLIENT_PROJECTS.map((project, idx) => {
              const isSelected = project.id === selectedProjectId;
              return (
                <motion.div
                  key={project.id}
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
                  whileHover={{ y: -3 }}
                  onClick={() => {
                    setSelectedProjectId(project.id);
                    setFeedbackSubmitted(false);
                  }}
                  className={`hd-card p-4 rounded-2xl border transition-colors cursor-pointer flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'bg-[#18181B] border-[#3ECF8E] shadow-xl shadow-[#3ECF8E]/10'
                      : 'bg-[#18181B]/60 border-[#27272A] hover:border-[#3ECF8E]/40'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="relative h-36 rounded-xl overflow-hidden bg-[#09090B]">
                      <Image
                        src={project.image}
                        alt={project.name}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-white">
                        {project.id}
                      </div>
                      <div
                        className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          project.status === 'Completed'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                            : 'bg-[#3ECF8E]/20 text-[#3ECF8E] border border-[#3ECF8E]/40'
                        }`}
                      >
                        {project.status}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold font-display text-white line-clamp-1">
                        {project.name}
                      </h3>
                      <p className="text-[11px] text-[#71717A] font-mono">{project.category}</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#27272A]">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#A1A1AA]">Pipeline Progress</span>
                      <span className="text-white font-bold">{project.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#09090B] overflow-hidden">
                      <div
                        className="h-full bg-[#3ECF8E] transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-[#71717A] font-mono truncate">{project.lastUpdate}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

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
                    onClick={() => openModelViewer('models/apex-tower-v3-draco.glb', selectedProject.name)}
                    className="px-3 py-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#3ECF8E]/40 text-xs font-mono text-[#3ECF8E] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Box className="w-4 h-4" />
                    <span>Launch 3D WebXR Model</span>
                  </button>
                )}

                {selectedProject.pixelStreamingAvailable && (
                  <button
                    onClick={() => openPixelStream()}
                    className="px-3 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    <span>Launch Pixel Stream</span>
                  </button>
                )}

                <button
                  onClick={() => openPanorama('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=90', selectedProject.name)}
                  className="px-3 py-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-xs font-mono text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>360° Node Tour</span>
                </button>
              </div>
            </div>

            {/* PROJECT STATISTICS SUMMARY WIDGET */}
            <ProjectStatsWidget
              stats={selectedProject.stats}
              projectName={selectedProject.name}
              projectId={selectedProject.id}
            />

            {/* PROJECT PHASE ROADMAP (7-STAGE PIPELINE) */}
            <div className="space-y-4">
              <ProjectPhaseRoadmap
                stages={selectedProject.roadmapStages}
                currentStageNumber={selectedProject.stats.currentStageNumber}
                projectName={selectedProject.name}
                projectId={selectedProject.id}
              />
            </div>

            {/* EMBEDDED TRACKER ENGINE */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#3ECF8E]" />
                <span>Live 7-Stage Production Timeline & Access Token Query</span>
              </h3>
              <ProjectTracker initialProjectId={selectedProject.id} />
            </div>

            {/* REAL-TIME DESKTOP NOTIFICATIONS & MILESTONE ALERTS CONTROL */}
            <div className="space-y-4">
              <NotificationSettings />
            </div>

            {/* TECHNICAL DOCUMENT & CAD REPOSITORY SECTION */}
            <div className="space-y-4">
              <ProjectDocumentRepository
                documents={selectedProject.documents}
                projectName={selectedProject.name}
                projectId={selectedProject.id}
              />
            </div>

            {/* DOWNLOAD CENTER & ASSET ARCHIVE */}
            <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#3ECF8E]" />
                  <span>Approved Deliverables & Master Package Archive ({selectedProject.deliverablesCount})</span>
                </h4>
                <button
                  onClick={() => showToast('Master ZIP bundle packaging initiated (2.4 GB). Download will commence shortly.', 'success')}
                  className="text-xs font-mono text-[#3ECF8E] hover:underline"
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
                    onClick={() => showToast('Downloading 8K TIFF...', 'info')}
                    className="p-1.5 rounded hover:bg-[#27272A] text-[#A1A1AA] hover:text-white"
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
                    onClick={() => showToast('Downloading GLB asset...', 'info')}
                    className="p-1.5 rounded hover:bg-[#27272A] text-[#A1A1AA] hover:text-white"
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
                    onClick={() => showToast('Downloading 4K MP4 Master...', 'info')}
                    className="p-1.5 rounded hover:bg-[#27272A] text-[#A1A1AA] hover:text-white"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* DIRECT CLIENT REVISION FEEDBACK FORM */}
            <div className="p-5 rounded-xl bg-[#09090B] border border-[#27272A] space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#3ECF8E]" />
                <span>Submit Client Revision Notes & Material Markups</span>
              </h4>

              {feedbackSubmitted ? (
                <div className="p-3 rounded-lg bg-[#18181B] border border-[#3ECF8E]/40 text-xs font-mono text-[#3ECF8E] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Revision request logged. The studio lead will update render passes within 24 hours.</span>
                </div>
              ) : (
                <form onSubmit={handleSendFeedback} className="space-y-3">
                  <textarea
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Enter lighting adjustments, material revisions, or camera angle notes for this milestone..."
                    className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E] resize-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Dispatch Revision Notes
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
