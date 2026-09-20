# VizTR Tour Builder Guide

**Version:** 1.0
**Last Updated:** 2026-09-20
**Audience:** 3D Artists, Tour Designers, Developers

---

## Table of Contents

### Artist Guide

1. [Tour Artist Fundamentals](#part-1--tour-artist-fundamentals)
2. [Building a Tour](#part-2--building-a-tour)
3. [Navigation](#part-3--navigation)
4. [Interactive Content](#part-4--interactive-content)
5. [Alignment Mode](#part-5--alignment-mode)
6. [Experience Configuration](#part-6--experience-configuration)
7. [Preview & QA](#part-7--preview--qa)
8. [Publishing](#part-8--publishing)
9. [Troubleshooting](#part-9--troubleshooting)
10. [Production Checklist](#part-10--production-checklist)

### Developer Reference

- [Data Model](#developer-reference--data-model)
- [API Reference](#developer-reference--api-reference)
- [Experience Config Schema](#developer-reference--experience-config-schema)
- [Runtime Integration](#developer-reference--runtime-integration)

---

# Artist Guide

## Part 1 — Tour Artist Fundamentals

### What is a VizTR Tour?

A VizTR Tour is an interactive 360° virtual tour that allows users to navigate through spaces, view information hotspots, and experience spatial content. Tours can be standalone or combined with Gaussian Splat 3D reconstructions for a unified experience.

### Project → Service → Experience → Tour Rooms

Understanding the VizTR hierarchy:

```
PROJECT
  └── SERVICE (virtual-tour, gaussian-splat, etc.)
        └── EXPERIENCE (published tour)
              └── TOUR ROOMS (individual 360° scenes)
```

- **Project**: The top-level container (e.g., "Smart Luxury Villa")
- **Service**: The type of content (virtual-tour, gaussian-splat, pixel-streaming)
- **Experience**: A published, shareable instance of your tour
- **Tour Rooms**: Individual 360° panoramas that make up the tour

### 360° Panorama Requirements

| Property | Requirement |
|----------|-------------|
| **Format** | Equirectangular projection (.jpg, .png) |
| **Resolution** | 4096×2048 recommended (minimum 2048×1024) |
| **Aspect Ratio** | 2:1 (width:height) |
| **File Size** | Under 10MB per image |
| **Color Space** | sRGB |
| **Orientation** | Horizon level, camera level |

### File Preparation and Naming

**Recommended naming convention:**
```
room-name.jpg
living-room.jpg
kitchen.jpg
bedroom-master.jpg
```

**Avoid:**
- Spaces in filenames
- Special characters
- Very long names
- Uppercase extensions

### Folder Organization

Prepare your assets in a clear folder structure:

```
project-name/
├── panoramas/
│   ├── living-room.jpg
│   ├── kitchen.jpg
│   └── bedroom.jpg
├── thumbnails/
│   ├── living-room-thumb.jpg
│   └── kitchen-thumb.jpg
└── splat/
    └── scene.ply (optional)
```

---

## Part 2 — Building a Tour

### Create a Tour Experience

1. Navigate to your project in the VizTR Dashboard
2. Select **Virtual Tour** service
3. Click **Create Experience**
4. Enter a title (e.g., "Smart Luxury Villa Tour")
5. The system generates a unique slug for publishing

### Upload Panoramas

1. In the Tour Editor, click **Upload Panorama**
2. Select your 360° image file
3. Wait for upload to complete
4. The panorama appears in your asset library

**Upload tips:**
- Upload panoramas in room order
- Verify each upload completes successfully
- Check thumbnail generation

### Create Rooms

1. Click **Add Room** in the room list
2. Assign a panorama to the room
3. Set room properties:
   - **Name**: Descriptive room name
   - **Thumbnail**: Auto-generated or custom
   - **Starting View**: Initial camera direction

### Organize Floors/Zones

For multi-story or multi-zone properties:

1. Create rooms for each area
2. Use naming conventions:
   ```
   Level 1 - Living Room
   Level 1 - Kitchen
   Level 2 - Master Bedroom
   Level 2 - Bathroom
   ```
3. Connect rooms with navigation hotspots

### Room Metadata

Each room can have:
- **Name**: Display name for navigation
- **Description**: Optional description text
- **Thumbnail**: Preview image for room selection
- **Starting Camera**: Initial yaw, pitch, FOV

### Thumbnails

Thumbnails are used in:
- Room selection panels
- Navigation UI
- Loading screens

**Thumbnail requirements:**
- Square aspect ratio (1:1)
- Minimum 256×256 pixels
- Shows representative view of room

### Starting Camera/View

The starting view determines what users see first:

- **Yaw** (horizontal): 0° = forward, 90° = right, -90° = left
- **Pitch** (vertical): 0° = level, 45° = looking up, -45° = looking down
- **FOV** (field of view): 75° = natural, 60° = zoomed, 90° = wide

**Tip:** Start with the most interesting feature of each room in view.

---

## Part 3 — Navigation

### Navigation Hotspots

Navigation hotspots allow users to move between rooms.

**Creating hotspots:**
1. Select a room
2. Click **Add Hotspot** → **Navigation**
3. Position the hotspot in the panorama
4. Set the target room
5. Configure hotspot appearance

### Room-to-Room Connections

**Best practices:**
- Create bidirectional connections (A→B and B→A)
- Place hotspots at natural transition points (doorways, hallways)
- Use consistent hotspot placement across similar rooms
- Test all navigation paths

### Hotspot Positioning

**Positioning tips:**
- Place at eye level (approximately 0 pitch)
- Position near doorways or passages
- Avoid placing in corners or hidden areas
- Ensure visibility from multiple angles

### Navigation Graph

The navigation graph shows all room connections:

```
Living Room ←→ Kitchen
     ↓
  Hallway
     ↓
Bedroom ←→ Bathroom
```

**Verify:**
- All rooms are reachable
- No dead ends (unless intentional)
- Bidirectional connections exist

### Backtracking

Users should be able to:
- Return to the previous room
- Navigate back through their path
- Access a room overview/mini-map

### Common Navigation Mistakes

| Mistake | Solution |
|---------|----------|
| Missing return connection | Add bidirectional hotspots |
| Hotspot points to wrong room | Verify target room selection |
| Hotspot invisible | Check positioning and visibility |
| Circular navigation | Review navigation graph |

---

## Part 4 — Interactive Content

### Information Hotspots

Information hotspots display content without navigating away.

**Types:**
- **Text**: Simple text overlay
- **Image**: Image popup
- **Video**: Embedded video player
- **Link**: External URL
- **Product**: Product information

### Creating Information Hotspots

1. Select a room
2. Click **Add Hotspot** → **Information**
3. Choose hotspot type
4. Position in panorama
5. Add content (text, image, video, etc.)

### Architectural/Product Information

Use hotspots to highlight:
- Room features and materials
- Architectural details
- Product specifications
- Pricing information
- Contact details

### Hotspot Naming and Organization

**Naming convention:**
```
[Type] - [Location] - [Content]
info - living-room - fireplace-details
product - kitchen - countertop-material
video - master-bedroom - renovation-timelapse
```

### Presentation Principles

- **Less is more**: Don't overload with hotspots
- **Relevant content**: Only add useful information
- **Consistent style**: Use similar hotspot designs
- **Clear labels**: Make hotspot purpose obvious
- **Test usability**: Verify hotspot accessibility

---

## Part 5 — Alignment Mode

### When Alignment is Required

Alignment is required when you want to:
- Combine Tour + Gaussian Splat in one experience
- Synchronize camera between Tour and Splat views
- Ensure spatial consistency across viewers

### Panorama ↔ Splat Concept

The alignment maps between:
- **Panorama space**: Yaw/pitch coordinates in 360° image
- **World space**: 3D coordinates in Gaussian Splat

```
Panorama (yaw, pitch) ←→ World (x, y, z)
```

### Landmark Selection

Choose recognizable points visible in both:
- Corners of rooms
- Distinctive features (fireplace, window, door)
- High-contrast areas
- Geometric landmarks

**Minimum:** 3 landmarks for basic alignment
**Recommended:** 5-8 landmarks for accuracy

### Automatic Calibration

1. Enter **Alignment Mode**
2. Select **Auto-Calibrate**
3. System analyzes landmarks and computes alignment
4. Review the computed alignment
5. Accept or refine manually

### Manual Refinement

If automatic calibration isn't accurate:

1. Select a landmark
2. Adjust **Yaw** and **Pitch** in panorama view
3. Adjust **World Position** in splat view
4. Repeat for each landmark
5. Save alignment

### Saving/Reloading Alignment

- **Save**: Alignment saves with the tour configuration
- **Reload**: Alignment loads when experience is published
- **Version**: Alignment version tracked for consistency

### Alignment QA

Verify alignment is correct:
1. Switch between Tour and Splat views
2. Camera position should match
3. Landmarks should align visually
4. Navigation should feel consistent

---

## Part 6 — Experience Configuration

### Tour Configuration

Configure tour behavior:

```json
{
  "autoRotate": false,
  "initialFov": 75,
  "transitionDuration": 2.5
}
```

**Settings:**
- **autoRotate**: Automatically rotate panorama
- **initialFov**: Default field of view
- **transitionDuration**: Time between room transitions (seconds)

### Assets vs Experience Config

- **Assets**: Raw files (panoramas, splats, models)
- **Experience Config**: Runtime settings and behavior

### Published Configuration

When you publish, the system creates:
- Unique experience URL
- QR code for sharing
- Published configuration snapshot

### Runtime Behavior

The published experience:
- Loads configuration from database
- Fetches assets from Supabase storage
- Renders viewers (Tour, Splat, PlayCanvas)
- Synchronizes camera across viewers

### Tour + Splat Relationship

When combined:
- **Tour**: Left panel (or full screen on mobile)
- **Splat**: Right panel
- **Camera Sync**: Yaw/pitch synchronized via SharedExperienceContext
- **Layout**: Side-by-side with draggable divider

---

## Part 7 — Preview & QA

### Room-by-Room QA

For each room:
- [ ] Panorama loads correctly
- [ ] Image quality is acceptable
- [ ] No distortion or artifacts
- [ ] Starting view is correct

### Navigation QA

- [ ] All hotspots are visible
- [ ] Hotspots navigate to correct rooms
- [ ] Return navigation works
- [ ] No dead ends (unless intentional)

### Starting-View QA

- [ ] Each room starts at correct view
- [ ] FOV is appropriate
- [ ] Initial direction highlights key feature

### Hotspot QA

- [ ] Information hotspots display correctly
- [ ] Content is accurate and readable
- [ ] Hotspot positioning is intuitive

### Alignment QA

- [ ] Tour ↔ Splat camera sync works
- [ ] Landmarks align visually
- [ ] No drift or offset

### Desktop/Browser Testing

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Testing

Test on:
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Touch interactions work
- [ ] Layout adapts to screen size

### Refresh/Direct-URL Testing

- [ ] Direct URL loads correctly
- [ ] Page refresh preserves state
- [ ] Share link works for others

---

## Part 8 — Publishing

### Preview

Before publishing:
1. Click **Preview**
2. Review complete experience
3. Test all navigation
4. Verify alignment
5. Check mobile layout

### Validate

Run validation checks:
- [ ] All rooms have panoramas
- [ ] All hotspots have targets
- [ ] Configuration is complete
- [ ] Assets are accessible

### Publish

1. Click **Publish**
2. System generates:
   - Unique URL: `/experience/[slug]`
   - QR code
   - Published configuration
3. Verify publish succeeded

### Published URL

The published URL format:
```
https://viztr.com/experience/[project-slug]-[experience-slug]
```

Example:
```
https://viztr.com/experience/smart-luxury-villa-unified
```

### QR Generation

QR codes are generated automatically:
- Size: 300×300 pixels
- Format: PNG
- Usage: Print, display, share

### Client Delivery

Delivery options:
1. **Direct URL**: Share the experience URL
2. **QR Code**: Print or display QR code
3. **Embed**: Embed in client website
4. **Export**: Download experience package

---

## Part 9 — Troubleshooting

### Panorama doesn't load

**Symptoms:** Black screen, loading spinner never completes

**Causes:**
- File format incorrect (not equirectangular)
- File too large
- Storage URL incorrect
- CORS issue

**Solutions:**
1. Verify file is equirectangular .jpg/.png
2. Compress image to under 10MB
3. Check storage URL is accessible
4. Verify CORS headers on storage

### Wrong starting direction

**Symptoms:** Room starts facing wall instead of feature

**Solutions:**
1. Adjust room's initialYaw value
2. Use preview to test before publishing
3. Check yaw calculation (0=forward, positive=right)

### Hotspot points incorrectly

**Symptoms:** Hotspot appears in wrong location

**Solutions:**
1. Verify yaw/pitch values
2. Check hotspot positioning in editor
3. Test with different FOV values

### Room connection broken

**Symptoms:** Clicking hotspot doesn't navigate

**Solutions:**
1. Verify target room exists
2. Check hotspot type is "navigation"
3. Verify target room ID is correct

### Alignment appears incorrect

**Symptoms:** Tour and Splat views don't match

**Solutions:**
1. Re-run alignment calibration
2. Verify landmark positions
3. Check for rotation/translation errors
4. Save and reload alignment

### Splat doesn't load

**Symptoms:** Splat panel shows error

**Solutions:**
1. Verify .ply/.splat file is accessible
2. Check file format is supported
3. Verify file size is manageable
4. Check browser WebGL support

### Camera synchronization issue

**Symptoms:** Tour and Splat cameras don't stay in sync

**Solutions:**
1. Verify SharedExperienceContext is active
2. Check for JavaScript errors in console
3. Reload the experience
4. Verify alignment data exists

### Published experience differs from editor

**Symptoms:** Published version looks different

**Solutions:**
1. Re-publish the experience
2. Clear browser cache
3. Verify configuration saved correctly
4. Check asset URLs are correct

---

## Part 10 — Production Checklist

### Pre-Delivery Checklist

Use this checklist before every client delivery:

#### Assets
- [ ] All panoramas uploaded
- [ ] All panoramas verified (correct format, quality)
- [ ] Thumbnails generated
- [ ] Splat file uploaded (if applicable)

#### Rooms
- [ ] All rooms created
- [ ] Room names are descriptive
- [ ] Room order is logical
- [ ] Starting views configured

#### Navigation
- [ ] All hotspots created
- [ ] Navigation connections bidirectional
- [ ] No dead ends
- [ ] Hotspot positioning intuitive

#### Content
- [ ] Information hotspots populated
- [ ] Content is accurate
- [ ] No typos or errors
- [ ] Links work correctly

#### Alignment (if applicable)
- [ ] Alignment mode completed
- [ ] Landmarks selected (minimum 3)
- [ ] Auto-calibration successful
- [ ] Manual refinement (if needed)
- [ ] Alignment verified

#### Configuration
- [ ] Experience config set
- [ ] Auto-rotate setting correct
- [ ] Initial FOV appropriate
- [ ] Transition duration set

#### Testing
- [ ] Desktop testing complete
- [ ] Mobile testing complete
- [ ] All browsers tested
- [ ] Direct URL works
- [ ] Page refresh works

#### Publishing
- [ ] Preview reviewed
- [ ] Validation passed
- [ ] Published successfully
- [ ] URL tested
- [ ] QR code generated

#### Delivery
- [ ] URL shared with client
- [ ] QR code provided
- [ ] Instructions included
- [ ] Support contact provided

---

# Developer Reference

## Data Model

### Project

```typescript
interface Project {
  id: string;           // "proj_smart_luxury_villa"
  name: string;         // "Smart Luxury Villa"
  created_at: Date;
  updated_at: Date;
}
```

### Service

```typescript
interface ProjectService {
  id: string;
  project_id: string;   // References Project.id
  service_id: string;   // "svc_virtual_tour"
  status: 'active' | 'inactive';
  config: {
    order: number;
  };
}
```

### Experience

```typescript
interface Experience {
  id: string;
  project_id: string;
  project_service_id: string;
  title: string;
  slug: string;         // URL-friendly identifier
  description: string;
  status: 'draft' | 'published';
  version: number;
  published_at: Date;
  metadata: Record<string, any>;
}
```

### Experience Config

```typescript
interface ExperienceConfig {
  id: string;
  experience_id: string;
  config: TourSplatConfig;  // See Config Schema
  assets: Asset[];
  settings: {
    autoRotate: boolean;
    initialFov: number;
    transitionDuration: number;
  };
}
```

### Tour Room

```typescript
interface TourRoom {
  id: string;
  name: string;
  type: '360' | '3d';
  url: string;              // Panorama URL
  tileUrl?: string;         // Multi-res tile URL
  thumbnailUrl: string;
  initialYaw: number;       // degrees
  initialPitch: number;     // degrees
  initialFov: number;       // degrees
  hotspots: Hotspot[];
  viewConstraints: ViewConstraints;
  autorotateEnabled: boolean;
  autorotateSpeed: number;
  spatialAlignment?: SpatialAlignment;
  alignmentMarkers?: AlignmentMarker[];
}
```

### Hotspot

```typescript
interface Hotspot {
  id: string;
  yaw: number;
  pitch: number;
  type: 'link' | 'info' | 'image' | 'video' | 'audio' | 'product';
  targetSceneId?: string;
  targetYaw?: number;
  title: string;
  description: string;
}
```

## API Reference

### Get Public Experience

```
GET /api/experiences/public/{slug}
```

**Response:**
```json
{
  "success": true,
  "experience": {
    "id": "...",
    "title": "...",
    "slug": "...",
    "status": "published"
  },
  "config": {
    "config": {
      "engine": "tour+splat",
      "tour": { "rooms": [...] },
      "splat": { "url": "..." }
    }
  }
}
```

### Create/Update Experience

```
POST /api/experiences
```

**Body:**
```json
{
  "id": "...",
  "title": "...",
  "slug": "...",
  "status": "published"
}
```

## Experience Config Schema

### Tour + Splat Config

```typescript
interface TourSplatConfig {
  engine: 'tour+splat';
  tour: {
    rooms: TourRoom[];
  };
  splat: {
    url: string;
    format?: 'splat' | 'ply' | 'ksplat';
    position?: [number, number, number];
    rotation?: [number, number, number, number];
    scale?: [number, number, number];
  };
}
```

### Tour Only Config

```typescript
interface TourOnlyConfig {
  engine: 'tour';
  tour: {
    rooms: TourRoom[];
  };
}
```

### Splat Only Config

```typescript
interface SplatOnlyConfig {
  engine: 'splat';
  splat: {
    url: string;
    format?: 'splat' | 'ply' | 'ksplat';
  };
}
```

## Runtime Integration

### Data Flow

```
/experience/[slug]
    ↓
getExperience(slug)
    ↓
/api/experiences/public/{slug}
    ↓
Returns { experience, config }
    ↓
ExperienceViewer receives config.config
    ↓
Routes to correct viewer(s):
  - TourViewer (left)
  - GaussianSplatViewer (right)
  - PlayCanvasPublicViewer (if engine=playcanvas)
    ↓
ExperienceLayout renders side-by-side
    ↓
SharedExperienceContext syncs camera
```

### SharedExperienceContext

```typescript
interface SharedExperienceState {
  yaw: number;           // Current yaw (radians)
  pitch: number;         // Current pitch (radians)
  activeEngine: string;  // 'tour' | 'splat' | 'playcanvas'
  setOrientation: (yaw: number, pitch: number) => void;
  setActiveEngine: (engine: string) => void;
}
```

### Camera Synchronization

**Outbound (Viewer → Context):**
1. Viewer detects camera change
2. Calls `setOrientation(yaw, pitch)`
3. Context updates shared state

**Inbound (Context → Viewer):**
1. Context state changes
2. Viewer receives new yaw/pitch
3. Viewer updates camera position
4. Uses `localUpdateRef` to prevent loops

---

**End of VizTR Tour Builder Guide**
