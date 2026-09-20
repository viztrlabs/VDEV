# Phase 7.3 — Unified Public Experience Runtime

**Date**: 2026-09-20
**Status**: Approved
**Predecessor**: Phase 7.2 — Alignment Mode (COMPLETE)

## 1. Goal

Rewrite `/experience/[slug]` from a metadata dump page into a unified public experience viewer that renders Tour, Splat, and PlayCanvas content side-by-side with shared camera context.

## 2. Architecture

### Route

`/experience/[slug]` — server component fetches experience + config from Supabase, passes to client.

```
/experience/[slug]
    ↓
getExperience(slug) → Supabase (experiences + experience_configs)
    ↓
{ experience, config } passed to client
    ↓
ExperienceViewer (client component)
    ↓
Reads config.config.engine → dispatches to viewer(s)
    ↓
SharedExperienceContext provides camera sync
```

### Config Shapes (established by Phase 7.2)

| Engine | Config shape |
|--------|-------------|
| Tour | `{ engine: 'tour', tour: { rooms: [...] } }` |
| Splat | `{ engine: 'splat', splat: { url, scale, rotation, position } }` |
| PlayCanvas | `{ engine: 'playcanvas', scene: {...}, camera: {...} }` |

## 3. Components

### New Components

| Component | File | Purpose |
|-----------|------|---------|
| `ExperienceViewer` | `components/xr/ExperienceViewer.tsx` | Reads config, dispatches to correct viewer combo |
| `SharedExperienceContext` | `components/xr/SharedExperienceContext.tsx` | Zustand store for shared camera yaw/pitch |
| `ExperienceLayout` | `components/xr/ExperienceLayout.tsx` | Side-by-side layout with resizable divider |
| `PlayCanvasPublicViewer` | `components/xr/PlayCanvasPublicViewer.tsx` | Standalone PlayCanvas viewer (CDN v181) |

### Existing Components (reused)

| Component | File | Role |
|-----------|------|------|
| `TourViewer` | `components/xr/TourViewer.tsx` | Marzipano panorama (alignment-aware) |
| `GaussianSplatViewer` | `components/xr/GaussianSplatViewer.tsx` | Runtime splat viewer |

## 4. SharedExperienceContext

```typescript
interface SharedExperienceState {
  yaw: number;
  pitch: number;
  setOrientation: (yaw: number, pitch: number) => void;
  activeEngine: 'tour' | 'splat' | 'playcanvas';
}
```

Each viewer subscribes to the context. When user rotates one viewer, it updates the context, and the other viewer follows.

## 5. Layout

Side-by-side split view. Left panel = TourViewer, Right panel = GaussianSplatViewer. Resizable divider.

| Config.engine | Left Panel | Right Panel |
|---------------|-----------|-------------|
| `tour` | TourViewer | — |
| `splat` | — | GaussianSplatViewer |
| `tour` + splat URL | TourViewer | GaussianSplatViewer |
| `playcanvas` | PlayCanvasViewer | — |

## 6. Camera Synchronization

- TourViewer: Extract yaw/pitch from Marzipano view → update context. Apply alignment offset via `worldDirectionToPanorama()`.
- GaussianSplatViewer: Extract yaw/pitch from Three.js camera → update context.
- PlayCanvasViewer: Extract yaw/pitch from PlayCanvas camera → update context.
- Throttle: 60fps max to prevent feedback loops.
- Alignment: Shared camera operates in "world space". TourViewer applies alignment offset. SplatViewer uses world space directly.

## 7. PlayCanvas Standalone Viewer

- Loads PlayCanvas from CDN (`cdn.playcanvas.com/engine/v181/`)
- Renders scene entities from `config.scene.entities`
- Camera from `config.camera`
- Limitations: No WebGPU, no GSplat (use GaussianSplatViewer), basic lighting

## 8. Engine Routing

```
ExperienceViewer
    ↓
config.engine === 'tour'?
    → mount TourViewer
config.engine === 'splat'?
    → mount GaussianSplatViewer
config.engine === 'playcanvas'?
    → mount PlayCanvasViewer
config has tour + splat URL?
    → mount both side-by-side
```

## 9. Testing

| Test | Coverage |
|------|----------|
| ExperienceViewer config routing | Correct viewer renders for each engine type |
| SharedExperienceContext | Camera sync between viewers |
| Layout | Side-by-side renders, divider resizes |
| Public experience load | Config loads from Supabase, viewers mount |
| Alignment integration | TourViewer applies alignment offset in shared mode |

## 10. Files to Create/Modify

### Create
- `components/xr/ExperienceViewer.tsx`
- `components/xr/SharedExperienceContext.tsx`
- `components/xr/ExperienceLayout.tsx`
- `components/xr/PlayCanvasPublicViewer.tsx`
- `__tests__/xr/experience-viewer.test.ts`
- `__tests__/xr/shared-experience-context.test.ts`

### Modify
- `app/experience/[slug]/page.tsx` — rewrite from metadata to viewer
- `components/xr/TourViewer.tsx` — accept SharedExperienceContext for camera sync
- `components/xr/GaussianSplatViewer.tsx` — accept SharedExperienceContext for camera sync
- `lib/3d/bridge/types.ts` — add ExperienceConfig type if needed

## 11. Deferred

- PlayCanvas WebGPU/GSplat (requires custom engine bundling)
- PixelStreaming in public experience
- WebXR in public experience
- Mobile responsive layout (desktop first)
