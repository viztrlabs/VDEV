# Developer Reference — Tour Builder Implementation

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
  config: { order: number };
}
```

### Experience

```typescript
interface Experience {
  id: string;
  project_id: string;
  project_service_id: string;
  title: string;
  slug: string;
  description: string;
  status: 'draft' | 'published';
  version: number;
  published_at: Date;
  metadata: Record<string, any>;
}
```

### ExperienceConfig

```typescript
interface ExperienceConfig {
  id: string;
  experience_id: string;
  config: TourSplatConfig;
  assets: Asset[];
  settings: {
    autoRotate: boolean;
    initialFov: number;
    transitionDuration: number;
  };
}
```

### TourScene (Room)

```typescript
interface TourScene {
  id: string;
  name: string;
  type: '360' | '3d';
  url: string;
  tileUrl?: string;
  thumbnailUrl: string;
  initialYaw: number;       // degrees
  initialPitch: number;     // degrees
  initialFov: number;       // degrees
  hotspots: TourHotspot[];
  viewConstraints: ViewConstraints;
  autorotateEnabled: boolean;
  autorotateSpeed: number;
  spatialAlignment?: SpatialAlignment;
  alignmentMarkers?: AlignmentMarker[];
}
```

### TourHotspot

```typescript
interface TourHotspot {
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

### ViewConstraints

```typescript
interface ViewConstraints {
  top: number;
  bottom: number;
  left: number;
  right: number;
  zoomMin: number;
  zoomMax: number;
  mobileZoomEnabled: boolean;
}
```

### AlignmentMarker (Phase 7.2)

```typescript
interface AlignmentMarker {
  id: string;
  yaw: number;       // panorama yaw
  pitch: number;     // panorama pitch
  worldPoint: [number, number, number];  // 3D position in splat space
  label?: string;
}
```

### SpatialAlignment (Phase 7.2)

```typescript
interface SpatialAlignment {
  translation: [number, number, number];
  rotation: { x: number; y: number; z: number; w: number };  // quaternion
  scale: [number, number, number];
}
```

## API Endpoints

### Get Public Experience

```
GET /api/experiences/public/{slug}
```

Returns: `{ success, experience, config: { config: { engine, tour, splat } } }`

### Create/Update Experience

```
POST /api/experiences
Body: { id, title, slug, status, ... }
```

### Upload Asset

```
POST /api/assets
Body: FormData with file
```

Returns: `{ id, url, storage_path }`

## Experience Config Schemas

### Tour + Splat

```json
{
  "engine": "tour+splat",
  "tour": {
    "rooms": [{
      "id": "room-0",
      "name": "Kitchen",
      "type": "360",
      "url": "https://storage-url/panorama.jpg",
      "thumbnail": "https://storage-url/thumb.jpg",
      "initialViewParameters": { "yaw": 0, "pitch": 0, "fov": 75 },
      "linkHotspots": [{ "yaw": 1.5, "pitch": 0, "target": "room-1" }],
      "infoHotspots": [{ "yaw": 0.5, "pitch": 0.2, "title": "...", "text": "..." }],
      "spatialAlignment": { "translation": [0,0,0], "rotation": {...}, "scale": [1,1,1] },
      "alignmentMarkers": [{ "id": "m1", "yaw": 0.5, "pitch": 0.1, "worldPoint": [1,2,3] }]
    }]
  },
  "splat": {
    "url": "https://storage-url/scene.ply",
    "format": "ply"
  }
}
```

### Tour Only

```json
{
  "engine": "tour",
  "tour": { "rooms": [...] }
}
```

### Splat Only

```json
{
  "engine": "splat",
  "splat": { "url": "...", "format": "ply" }
}
```

## Runtime Data Flow

```
/experience/[slug]
    |
getExperience(slug)
    |
/api/experiences/public/{slug}
    |
Returns { experience, config }
    |
ExperienceViewer receives config.config
    |
Routes to viewer(s):
  - TourViewer (left panel)
  - GaussianSplatViewer (right panel)
  - PlayCanvasPublicViewer (if engine=playcanvas)
    |
ExperienceLayout renders side-by-side
    |
SharedExperienceContext syncs camera yaw/pitch
```

## SharedExperienceContext

```typescript
// Zustand store
interface SharedExperienceState {
  yaw: number;
  pitch: number;
  activeEngine: string;
  setOrientation: (yaw: number, pitch: number) => void;
  setActiveEngine: (engine: string) => void;
}
```

### Camera Sync Protocol

**Outbound** (Viewer -> Context): Viewer detects camera change, calls setOrientation(yaw, pitch), context updates shared state.

**Inbound** (Context -> Viewer): Context state changes, viewer receives new yaw/pitch via useSharedExperience hook, viewer updates camera position, uses localUpdateRef flag to prevent infinite loops.

## Persistence

- All tour data stored in Supabase `tours` table (JSONB `data` column)
- Experience configs stored in `experience_configs` table
- Assets stored in Supabase Storage (`viztr-assets` bucket)
- No localStorage used for production data
- Editor may use localStorage for draft/working state only

## Key Files

```
components/xr/SharedExperienceContext.tsx    — Zustand store + React context
components/xr/TourViewer.tsx                — Marzipano wrapper with camera sync
components/xr/GaussianSplatViewer.tsx       — Three.js + gaussian-splats-3d
components/xr/ExperienceViewer.tsx          — Config router
components/xr/ExperienceLayout.tsx          — Side-by-side split view
components/xr/PlayCanvasPublicViewer.tsx    — Standalone CDN viewer
app/experience/[slug]/page.tsx             — Public experience page
app/api/experiences/public/[slug]/route.ts — API route
lib/tourClientStore.ts                     — Tour scene types + Zustand store
lib/3d/bridge/types.ts                     — AlignmentMarker, SpatialAlignment
lib/3d/bridge/spatial.ts                   — Alignment math functions
lib/marzipano/tour-config-serializer.ts    — Tour config serializer
lib/splat/splat-config-serializer.ts       — Splat config serializer
```
