# VizTR Immersive Web SDK Integration — Repository Audit & Architecture Assessment

**Date**: 2026-11-21  
**Mode**: AUDIT / PLAN MODE — No code changes made  
**Scope**: Local VizTR repo + SensAI WebXR World Models + Meta Immersive Web SDK (IWSDK)

---

## A. Repository Audit — Current VizTR Architecture

### A.1 Dependency Versions (Exact, from `package.json` + `pnpm-lock.yaml`)

| Package | Version | Notes |
|---------|---------|-------|
| `next` | `15.5.29` | App Router, React 19 |
| `react` / `react-dom` | `19.3.1` | React 19 stable |
| `typescript` | `6.0.3` | Strict mode |
| `tailwindcss` | `4.3.5` | Tailwind v4 (PostCSS) |
| `three` | `0.185.1` (devDep) | **Upstream three.js** — in devDependencies only |
| `@types/three` | `0.185.4` | Type definitions for three 0.185.x |
| `@react-three/fiber` | `8.18.0` | R3F for React 19 |
| `@react-three/drei` | `9.122.0` | R3F helpers |
| `@mkkellogg/gaussian-splats-3d` | `0.4.7` | Gaussian splat renderer (Three.js based) |
| `@playcanvas/splat-transform` | `3.10.3` | SPZ/PLY transcoder (WASM) |
| `playcanvas` | `2.24.0` | PlayCanvas Engine |
| `@playcanvas/pcui` | `6.2.0` | PlayCanvas Editor UI |
| `marzipano` | `0.10.2` | 360° panorama viewer |
| `@supabase/supabase-js` | `2.119.0` | Supabase client |
| `@supabase/ssr` | `0.12.7` | SSR auth |
| `zustand` | `5.1.0` | State management |
| `next-auth` | `4.24.15` | Auth |
| `prisma` / `@prisma/client` | `7.10.1` | ORM |
| `motion` | `12.43.0` | Framer Motion v12 |
| `sharp` | `0.35.5` | Added for production build (native) |

**Key Finding**: `three` is **only a devDependency** (for `@types/three` and R3F). Runtime three comes transitively via `@react-three/fiber` → `three@0.185.1`. No `@iwsdk/*`, `@sparkjsdev/*`, `super-three`, or WebXR polyfills are installed.

### A.2 Architecture Map — Key Files & Directories

#### Engine Bridge & Runtime Adapters (Unified Adapter Pattern)
```
lib/3d/bridge/
├── engine-bridge.ts          # Central event bus + command queue (singleton)
├── types.ts                  # EngineType: 'three' | 'playcanvas' | 'marzipano'
│                              # EngineCommand / EngineEvent discriminated unions
│                              # SceneSnapshot, SpatialAlignment, HotspotData
└── adapters/
    ├── ThreeEngineAdapter.ts       # Three.js + R3F (dev/editor)
    ├── PlayCanvasEngineAdapter.ts  # PlayCanvas Engine (primary authoring)
    ├── SplatEngineAdapter.ts       # SuperSplat WebGPU (Gaussian splats)
    └── MarzipanoEngineAdapter.ts   # 360° panoramas
```

**Contract**: `EngineAdapter` interface with `init()`, `destroy()`, `dispatchCommand()`, `onEvent()`, `getSceneSnapshot()`, `loadSceneSnapshot()`, `getTelemetry()`, plus alignment methods.

#### XR World Service Architecture
```
app/xr-world/
├── page.tsx                           # Landing (service selection)
├── view/[slug]/                       # Client-facing published experience
├── webxr/page.tsx                     # Marketing page (WebXR service)
├── virtual-tour/                      # Marzipano 360° tours
├── vizsplat/                          # Gaussian splat viewer
├── virtual-reality/                   # WebXR entry
├── pixel-streaming/                   # Unreal Pixel Streaming
├── splat-showcase/                    # Demo
├── super-splat/ / supersplat/         # SuperSplat editor iframe
└── webxr/                             # WebXR routes

components/xr/
├── ExperienceViewer.tsx               # Runtime dispatcher
├── PlayCanvasXRViewer.tsx             # PlayCanvas runtime
├── PlayCanvasPublicViewer.tsx         # Public (no editor)
├── GaussianSplatViewer.tsx            # @mkkellogg/gaussian-splats-3d
├── MarzipanoViewer.tsx                # 360° viewer
├── PlayCanvasConfigurator.tsx         # Editor
├── SplatConfigurator.tsx              # Splat editor
├── XRViewer.tsx                       # Base viewer
├── xr.store.ts                        # Zustand store for XR state
├── xr.types.ts                        # Types
└── rendering/ + hooks/ + ui/ + analytics/ + collab/
```

#### Experience Data Model (Supabase — `20260903_phase1_project_model.sql`)
```sql
-- Core hierarchy
Project → Project.services (project_services) → Experience → ExperienceConfig
                                                      → Assets
                                                      → Deliverables
```
- `experiences`: `engine` not yet a column; `metadata.jsonb` holds config
- `experience_configs`: `config.jsonb`, `assets.jsonb`, `settings.jsonb`
- `assets`: `type IN ('image','video','audio','model','document','archive','other')`, `url`, `storage_path`
- RLS policies enforce project-scoped access

#### Experience Config Serializer
```
lib/splat/splat-config-serializer.ts
serializeSplatScene(scene, settings, projectId, experienceId?)
→ SerializedSplatConfig { splat: { engine: 'splat', splat: {...}, camera: {...} }, assets[], rendering, performance, metadata }
```

#### Engine Adapters — Capabilities Matrix

| Feature | ThreeEngineAdapter | PlayCanvasEngineAdapter | SplatEngineAdapter | MarzipanoEngineAdapter |
|---------|-------------------|------------------------|-------------------|----------------------|
| `engineType` | `'three'` | `'playcanvas'` | `'playcanvas'` | `'marzipano'` |
| Scene graph | Three.js `Scene` | PlayCanvas `pc.Application` | SuperSplat WebGPU | Marzipano `Viewer` |
| Camera control | Orbit (spherical) | Orbit + target | Splat camera events | Yaw/Pitch/FOV |
| Entities | `THREE.Mesh` | `pc.Entity` | Splat root only | Hotspots only |
| Materials | `MeshStandardMaterial` | `pc.StandardMaterial` | N/A | N/A |
| Hotspots | `THREE.Sprite` | `pc.Entity` (billboard) | N/A | DOM pins |
| Raycasting | `THREE.Raycaster` | `pc.CameraComponent.pick()` | N/A | Screen→coordinates |
| Telemetry | FPS, drawCalls, tris | PC stats, memory | Splat count, FPS | Fixed 60fps |
| Alignment | ✅ (full) | ✅ (full) | ✅ (stub) | ✅ (full) |
| GLB/SPZ load | Manual | Via editor server | `@/splat-editor/main` | ImageUrlSource |

#### Cloudflare R2 / Storage Implementation
- Bucket: `viztr-assets` (Supabase Storage, S3-compatible)
- RLS policies (`20260919_storage_rls_policies.sql`): folder-based per-user + `tour/` public + `published/` public
- No separate Cloudflare R2 client in codebase — uses Supabase Storage SDK
- Signed URLs: not yet implemented; assets served via Supabase public URLs or auth'd URLs

#### Auth & RBAC (`lib/rbac.ts`)
- Roles: `super_admin`, `admin`, `user`, `client`
- Route-based access control (fail-closed)
- Project members table with roles (`owner`, `admin`, `editor`, `staff`, `client`, `viewer`)

#### WebXR / WebAR Routes
- `app/xr-world/webxr/page.tsx` — Marketing page, loads GLB via `openModelViewer` (Three.js/R3F)
- `app/xr-world/virtual-reality/` — WebXR entry
- `components/xr/VRControls.tsx`, `TeleportLayer.tsx`, `PlayCanvasXRViewer.tsx` — Existing WebXR primitives
- No `@iwsdk/*` or `webxr-polyfill` installed

#### CSP Headers (`next.config.ts`)
```ts
connect-src 'self' https://*.supabase.co wss://*.supabase.co ${signalingUrl} ${editorUrl}
worker-src 'self' blob:
frame-src 'self' ${editorUrl}
```
- Allows `blob:` workers (needed for WASM, WebGPU, IWSDK)
- Allows `wss://*.supabase.co` (realtime)
- `frame-ancestors 'self' https://*.supabase.co` (XR iframe embedding)
- **Risk**: No explicit `https://*.sparkjs.dev` or WASM/CDN sources for IWSDK/SparkJS

---

## B. Compatibility Assessment — External Repos

### B.1 SensAI WebXR World Models (`V4C38/sensai-webxr-worldmodels`)

**Package Manifest** (`package.json`):
```json
{
  "name": "sensai-webxr-worldmodels",
  "type": "module",
  "dependencies": {
    "@iwsdk/core": "0.2.2",
    "@sparkjsdev/spark": "github:sparkjsdev/spark#v2.0.0-preview",
    "three": "npm:super-three@0.181.0"
  },
  "devDependencies": {
    "@iwsdk/vite-plugin-gltf-optimizer": "0.2.2",
    "@iwsdk/vite-plugin-iwer": "0.2.2",
    "@iwsdk/vite-plugin-uikitml": "0.2.2",
    "@types/three": "^0.181.0",
    "vite": "^7.1.4"
  },
  "engines": { "node": ">=20.19.0" }
}
```

**Key Findings**:
- **Three.js**: Uses **`super-three@0.181.0`** (fork) — **not upstream three**
- **IWSDK**: `@iwsdk/core@0.2.2` (older than current `1.2.0-rc.0`)
- **SparkJS**: `@sparkjsdev/spark` from **GitHub `v2.0.0-preview`** — not on npm
- **Build**: Vite 7, ESM only, `type: "module"`
- **Node**: `>=20.19.0`
- **License**: MIT (2026 SensAI)

**Source Implementation** (`src/`):
- `gaussianSplatLoader.ts` — IWSDK Component + System using `@sparkjsdev/spark` `SparkRenderer`, `SplatMesh`, LoD, GLB collider via `GLTFLoader`
- `gaussianSplatAnimator.ts` — GPU fly-in/out via `dyno` (SparkJS modifier), per-splat stagger, turbulence, scale pop (30%→100%), opacity fade
- `index.ts` — IWSDK `World.create()` with `locomotion: true`, `grabbing: true`, `handTracking: true`, `layers: true`, invisible floor for locomotion, `PanelUI` + `ScreenSpace` for spatial UI, hologram sphere interactable

**Compatibility Conflicts**:
| Dimension | VizTR | SensAI | Conflict |
|-----------|-------|--------|----------|
| Three.js | `0.185.1` (upstream) | `super-three@0.181.0` (fork) | **Major** — different package, different revision |
| IWSDK | Not installed | `0.2.2` | Missing |
| SparkJS | Not installed | GitHub `v2.0.0-preview` | Missing, unpinned |
| Build | Next.js 15 (webpack/Turbopack) | Vite 7 (ESM) | Different bundler, SSR vs SPA |
| Node | Unspecified | `>=20.19.0` | OK if aligned |
| React | 19.3.1 | None (vanilla) | SensAI is non-React |

### B.2 Meta Immersive Web SDK (`facebook/immersive-web-sdk`)

**Monorepo Root** (`package.json`):
```json
{
  "name": "iwsdk-monorepo",
  "packageManager": "pnpm@10.18.3",
  "type": "module",
  "pnpm": {
    "overrides": {
      "three": "npm:super-three@0.185.0",
      "@types/three": "0.185.4"
    }
  },
  "engines": { "node": ">=20.19.0 <21 || >=22.12.0 <23 || >=24" }
}
```

**Packages** (`packages/`):
| Package | Version | Description | Key Deps |
|---------|---------|-------------|----------|
| `@iwsdk/core` | `1.2.0-rc.0` | **Main runtime** — ECS (elics), transform, locomotion, grab, input, UI, physics, scene-understanding, layers, lighting, camera, audio, depth, mcp | `three: npm:super-three@0.185.0`, `three-mesh-bvh@0.9.1`, `@babylonjs/havok@1.3.10`, `elics@3.4.1`, `@pmndrs/uikit@1.0.74` |
| `@iwsdk/locomotor` | `1.2.0-rc.0` | Physics-based locomotion, teleport, collision | peer: `three>=0.160`, `three-mesh-bvh>=0.9.1` |
| `@iwsdk/xr-input` | `1.2.0-rc.0` | Controller/hand tracking, input profiles | peer: `three>=0.160` |
| `@iwsdk/scene-composition` | `1.2.0-rc.0` | Native scene document schema, validation, patching | — |
| `@iwsdk/cli` | workspace | Project scaffolding | — |
| `@iwsdk/create` | workspace | Starter templates | — |

**Core Exports** (`packages/core/src/index.ts`):
- Re-exports: `runtime/*`, `ecs/*`, `transform/*`, `asset/*`, `locomotion/*`, `visibility/*`, `ui/*`, `init/*`, `grab/*`, `input/*`, `gaze/*`, `environment/*`, `level/*`, `scene-understanding/*`, `environment-raycast/*`, `audio/*`, `physics/*`, `camera/*`, `depth/*`, `layers/*`, `lighting/*`, `mcp/*`, `project/*`, `runtime-settings/*`
- Re-exports `@iwsdk/xr-input`, `@iwsdk/locomotor`, `@pmndrs/uikit`, `@preact/signals-core`
- Logs version banner with `three.REVISION` and `elics.VERSION`

**ECS** (`packages/core/src/ecs/`): Built on **`elics`** (Entity Component System) — `createComponent`, `createSystem`, `Entity`, `World`, `Types`.

**Key Capabilities**:
- **Locomotion**: Teleport, smooth, physics-based (via `@babylonjs/havok` WASM)
- **Grab**: Distance + near-field, physics integration
- **Spatial UI**: `@pmndrs/uikit` panels, `ScreenSpace` component
- **Input**: `@iwsdk/xr-input` — controller profiles, hand tracking, visual adapters
- **Physics**: Havok WASM (via `@babylonjs/havok`)
- **Scene Understanding**: Planes, anchors, hit-test (WebXR features)
- **Desktop Simulator**: Provided via dev tools / CLI
- **Build**: Rollup, ESM output, `type: "module"`, Node `>=20.19.0`

**Licensing**: **MIT** (Meta Platforms, Inc.)

**Compatibility Conflicts**:
| Dimension | VizTR | IWSDK | Conflict |
|-----------|-------|-------|----------|
| Three.js | `0.185.1` (upstream) | `super-three@0.185.0` (fork, pinned) | **Major** — different package |
| React | 19.3.1 | None (vanilla/preact signals) | IWSDK uses `@preact/signals-core`, not React |
| Build | Next.js 15 (webpack) | Rollup (ESM) | Different output format |
| Node | Unspecified | `>=20.19.0 <21 \|\| >=22.12 <23 \|\| >=24` | Strict engine range |
| WASM | Not used | `@babylonjs/havok` (physics) | Needs `asyncWebAssembly: true` in webpack |
| WebGPU | Not required | Optional (layers, compute) | May need `cross-origin-isolated` headers |
| `@pmndrs/uikit` | Not installed | `^1.0.74` (UI) | New dependency |
| `elics` | Not installed | `^3.4.1` (ECS) | New dependency |

---

## C. Architecture Proposal — Runtime Adapter Design

### C.1 Core Principle
**Do not replace existing engines.** Extend the existing `EngineBridge` + `EngineAdapter` pattern to support IWSDK + SparkJS as **additional runtime adapters** alongside PlayCanvas, Three.js, and Marzipano.

### C.2 Proposed Adapter Hierarchy

```
EngineBridge (singleton)
    │
    ├─► ThreeEngineAdapter       → R3F / Three.js (editor, preview)
    ├─► PlayCanvasEngineAdapter  → PlayCanvas (primary authoring, GLB)
    ├─► SplatEngineAdapter       → SuperSplat WebGPU (splat editing)
    ├─► MarzipanoEngineAdapter   → 360° panoramas
    └─► IWSDKEngineAdapter       → **NEW** — IWSDK + SparkJS (immersive VR)
         │
         ├─► @iwsdk/core (ECS world, systems)
         ├─► @iwsdk/locomotor (teleport, smooth locomotion)
         ├─► @iwsdk/xr-input (controllers, hands)
         ├─► @sparkjsdev/spark (Gaussian splat renderer, LoD)
         └─► @babylonjs/havok (physics WASM) — optional
```

### C.3 Experience Config Extension — Runtime Selection

Add `runtime` field to `Experience` / `ExperienceConfig`:

```typescript
// lib/splat/splat-types.ts (extend)
type RuntimeEngine = 'playcanvas' | 'three' | 'marzipano' | 'iwSDK';

interface ExperienceConfig {
  runtime: RuntimeEngine;           // NEW: selects adapter
  splat?: SplatConfig;              // existing
  marzipano?: MarzipanoConfig;      // existing
  iwSDK?: IWSDKConfig;              // NEW
  playcanvas?: PlayCanvasConfig;    // existing
}
```

```typescript
interface IWSDKConfig {
  sceneUrl?: string;                 // .json scene document (scene-composition)
  splatUrl?: string;                 // .spz for SparkJS
  colliderUrl?: string;              // .glb collision mesh
  locomotion?: 'teleport' | 'smooth' | 'both';
  handTracking?: boolean;
  spatialUI?: boolean;
  physics?: boolean;
  sceneUnderstanding?: boolean;
}
```

### C.4 Asset Flow (Supabase + R2)

```
Admin Upload → /api/assets (signed URL) → Cloudflare R2 / Supabase Storage
     │
     ├─ .spz / .ply  → SparkJS (SplatEngineAdapter / IWSDKEngineAdapter)
     ├─ .glb         → PlayCanvas / IWSDK (collision mesh)
     ├─ .json        → IWSDK scene-composition document
     └─ .jpg/.png    → Marzipano / Skybox / UI textures
```
- **Never** commit large assets to Git
- Signed URLs for private assets; public for `tour/` and `published/`
- `Content-Type` validation on upload
- Asset metadata in `assets` table with `experience_id` FK

### C.5 Integration Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        VIZTR PLATFORM                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Projects   │  │  Services    │  │    Experiences       │  │
│  │  (metadata)  │──│ (xr-world,   │──│  (runtime: enum,     │  │
│  └──────────────┘  │  vizsplat,   │  │   config.jsonb)      │  │
│                    │  marzipano)  │  └──────────┬───────────┘  │
│  ┌──────────────┐  └──────────────┘             │              │
│  │    Assets    │  ┌──────────────┐             │              │
│  │  (R2/S3,    │  │ Experience   │             │              │
│  │   metadata)  │  │   Configs    │◀────────────┘              │
│  └──────────────┘  └──────────────┘                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ENGINE BRIDGE                               │
│  (Command Queue + Event Bus + Telemetry Throttle)               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ PlayCanvas      │ │ Three.js        │ │ Marzipano       │
│ EngineAdapter   │ │ EngineAdapter   │ │ EngineAdapter   │
│ (GLB, Editor)   │ │ (R3F, Preview)  │ │ (360° Tours)    │
└─────────────────┘ └─────────────────┘ └─────────────────┘
         ▲
         │
┌─────────────────┐
│ IWSDKEngine     │  ◀── NEW
│ Adapter         │
│ ┌─────────────┐ │
│ │ @iwsdk/core │ │  (ECS World, Systems)
│ │ @sparkjsdev │ │  (Splat Renderer, LoD)
│ │ @iwsdk/loc- │ │  (Teleport, Physics)
│ │   omotor    │ │
│ │ @iwsdk/xr-  │ │
│ │   input     │ │
│ └─────────────┘ │
└─────────────────┘
```

---

## D. Implementation Roadmap

### Phase 01 — Foundation (Week 1-2)
| Task | Files to Create/Modify | Complexity | Risk |
|------|------------------------|------------|------|
| Add `runtime` column to `experiences` table | `supabase/migrations/YYYYMMDD_add_runtime_to_experiences.sql` | Low | Migration conflict |
| Extend `ExperienceConfig` types | `lib/splat/splat-types.ts`, `lib/3d/bridge/types.ts` | Low | Type ripple |
| Update `serializeSplatScene` to include `runtime` | `lib/splat/splat-config-serializer.ts` | Low | — |
| Add IWSDK dependencies to `package.json` | `package.json` (see §E) | Medium | **Three.js fork conflict** |

### Phase 02 — IWSDKEngineAdapter (Week 2-4)
| Task | Files | Complexity | Risk |
|------|-------|------------|------|
| Create `IWSDKEngineAdapter.ts` | `lib/3d/bridge/adapters/IWSDKEngineAdapter.ts` | High | ECS lifecycle, cleanup |
| Implement `init()` — load `@iwsdk/core`, create `World` | — | High | SSR guard, dynamic import |
| Map `EngineCommand` → IWSDK systems (camera, entities, hotspots) | — | Medium | Command coverage |
| Implement `getSceneSnapshot()` / `loadSceneSnapshot()` | — | Medium | Scene document schema |
| SparkJS integration (`SplatMesh`, `SparkRenderer`, LoD) | — | High | WASM, WebGPU context |
| Locomotor integration (teleport, floor) | — | Medium | Collision mesh loading |
| XR Input integration (controllers, hands) | — | Medium | Profile loading |
| Physics (Havok WASM) — optional, behind flag | — | High | WASM load, memory |
| Desktop simulator support | — | Low | Dev-only |

### Phase 03 — Experience Manager Integration (Week 3-4)
| Task | Files | Complexity | Risk |
|------|-------|------------|------|
| `ExperienceManager` class with adapter registry | `lib/xr/ExperienceManager.ts` | Medium | — |
| `ExperienceManager.selectAdapter(runtime)` | — | Low | — |
| Admin UI: runtime selector in experience create/edit | `app/admin/experiences/...`, `components/admin/` | Medium | Form complexity |
| Client viewer: dispatch to correct adapter via `ExperienceManager` | `components/xr/ExperienceViewer.tsx` | Medium | SSR/hydration |

### Phase 04 — Asset Pipeline & Storage (Week 2-3)
| Task | Files | Complexity | Risk |
|------|-------|------------|------|
| Signed URL generation for R2/Supabase | `lib/storage/signed-urls.ts` | Medium | CORS, expiry |
| Asset validation (type, size, magic bytes) | `lib/validation/asset.ts` | Low | — |
| Upload progress + status polling | `components/xr/AssetUploader.tsx` | Medium | UX |
| CDN cache headers (`Cache-Control`, `ETag`) | `next.config.ts` headers | Low | — |

### Phase 05 — Admin & Client Workflows (Week 4-5)
| Task | Files | Complexity | Risk |
|------|-------|------------|------|
| Admin: Runtime selector + config forms | `app/admin/experiences/[id]/edit/...` | Medium | — |
| Admin: Preview button (launches correct adapter) | `components/admin/ExperiencePreview.tsx` | Medium | Adapter lifecycle |
| Client: Published experience page reads `runtime` | `app/xr-world/view/[slug]/page.tsx` | Low | — |
| Client: Fallback UI when WebXR unavailable | `components/xr/XRFallback.tsx` | Low | Graceful degradation |

### Phase 06 — Performance & Security (Week 5-6)
| Task | Files | Complexity | Risk |
|------|-------|------------|------|
| Dynamic import for IWSDK (browser-only) | `lib/3d/bridge/adapters/IWSDKEngineAdapter.ts` | Medium | SSR safety |
| Lazy-load SparkJS / Havok WASM | — | Medium | Chunk splitting |
| LoD config per device tier | `IWSDKConfig.lod` | Low | — |
| WebGL context loss handling | All adapters | Medium | Recovery UX |
| Error boundaries per adapter | `components/xr/AdapterErrorBoundary.tsx` | Low | — |
| Secure asset access (signed URLs, expiry) | `lib/storage/` | Medium | Token leakage |
| Device capability detection | `lib/xr/capabilities.ts` | Low | — |

---

## E. Proof of Concept Plan — Luxury Smart Villa 2050

### Prototype A — PlayCanvas (Existing)
- **Asset**: Existing GLB villa model
- **Runtime**: `PlayCanvasEngineAdapter`
- **Features**: Orbit camera, hotspot navigation, material picker, publish to `experience.runtime = 'playcanvas'`
- **Metrics**: Load time, FPS, draw calls, triangle count, memory

### Prototype B — IWSDK + SparkJS (New)
- **Asset**: Same villa as Gaussian Splat (`.spz` from SuperSplat) + simplified GLB collision mesh
- **Runtime**: `IWSDKEngineAdapter`
- **Features**:
  - SparkJS splat rendering with LoD (`enableLod: true`, `lodSplatScale`)
  - Teleport locomotion (floor mesh from collision GLB)
  - Grab interactions (distance + near)
  - Spatial UI panel (`PanelUI` + `ScreenSpace`) — property info
  - Desktop simulator (mouse/keyboard) — no headset required
  - Hand tracking (if headset available)
- **Metrics**: Same as A + GPU memory, frame time distribution, interaction latency

### Device Testing Matrix
| Device | PlayCanvas | IWSDK+SparkJS | Notes |
|--------|------------|---------------|-------|
| Desktop Chrome/Edge/Firefox | ✅ | ✅ (simulator) | Baseline |
| Desktop Safari | ✅ | ⚠️ (WebGPU limited) | SparkJS needs WebGPU |
| iOS Safari (iPhone 14+) | ✅ | ❌ (no WebXR) | Fallback to PlayCanvas |
| Android Chrome (Pixel 7+) | ✅ | ✅ (WebXR + WebGPU) | Full support |
| Meta Quest 3 (Browser) | ✅ | ✅ (immersive VR) | Target platform |
| Vision Pro (Safari) | ✅ | ⚠️ (visionOS WebXR) | Experimental |

---

## F. Go / No-Go Recommendation

### ✅ WHAT SHOULD BE INTEGRATED
1. **IWSDKEngineAdapter** as a **new `EngineAdapter`** — fits existing architecture perfectly
2. **SparkJS** for Gaussian splat rendering — superior LoD, GPU animation vs `@mkkellogg/gaussian-splats-3d`
3. **@iwsdk/locomotor** for teleport/smooth locomotion — physics-based, battle-tested
4. **@iwsdk/xr-input** for controller/hand tracking — comprehensive profile support
4. **@iwsdk/scene-composition** for declarative scene documents — versionable, patchable
5. **@pmndrs/uikit** for spatial UI — React/Preact compatible, already used in R3F ecosystem
6. **Havok WASM physics** (optional, behind flag) — only if physics interactions needed

### ⚠️ WHAT REQUIRES CAREFUL HANDLING
| Issue | Mitigation |
|-------|------------|
| **Three.js fork conflict** (`super-three` vs upstream) | **Pin `@iwsdk/core` to use upstream three via `peerDependency` override**: add `"three": "0.185.1"` to `pnpm.overrides` and verify IWSDK works with upstream. Test early. |
| **SparkJS not on npm** (GitHub `v2.0.0-preview`) | Vendor the SparkJS build or use GitHub Packages; pin commit hash; monitor for npm release |
| **Node engine range** (`<21 \|\| >=22.12 <23 \|\| >=24`) | Ensure CI/CD and Vercel use Node 22.12+ or 24.x |
| **WebGPU requirement** for SparkJS | Provide fallback to `@mkkellogg/gaussian-splats-3d` (WebGL) when WebGPU unavailable |
| **WASM physics** (Havok) | Lazy-load; make optional; ensure `cross-origin-isolated` headers if SharedArrayBuffer needed |
| **CSP headers** | Add `connect-src` for SparkJS CDN, `worker-src` for WASM, `script-src` for dynamic imports |

### ❌ WHAT SHOULD NOT BE INSTALLED / POSTPONED
1. **Do NOT replace PlayCanvas** — it remains primary authoring engine
2. **Do NOT replace Marzipano** — 360° tours work well
3. **Do NOT replace SuperSplat** — keep for splat *creation/editing*; use SparkJS for *runtime*
4. **Do NOT install `@iwsdk/*` at root without version pinning** — use exact versions, test compatibility
5. **Do NOT copy SensAI `package.json` wholesale** — its deps are outdated (`@iwsdk/core@0.2.2` vs `1.2.0-rc.0`)
6. **Do NOT modify existing production dependencies** (`three`, `@react-three/*`, `playcanvas`) until compatibility is demonstrated in isolated prototype
7. **Do NOT create parallel project/service/experience tables** — reuse existing schema with `runtime` enum

### 🎯 RECOMMENDED NEXT STEPS
1. **Week 1**: Spike — create minimal `IWSDKEngineAdapter` prototype in a branch, load a `.spz` via SparkJS, verify it runs alongside PlayCanvas adapter in the same Next.js app. Test three.js version conflict resolution.
2. **Week 1**: Add `runtime` column migration and type extensions.
3. **Week 2**: If spike succeeds, implement full `IWSDKEngineAdapter` with locomotor + xr-input.
4. **Week 3**: Admin UI for runtime selection + client viewer dispatch.
5. **Week 4**: PoC comparison (Luxury Smart Villa 2050) on target devices.
6. **Go/No-Go Gate**: Proceed to production only if:
   - Both prototypes run without three.js conflicts
   - SparkJS loads `.spz` with LoD on target devices (Quest 3, Android Chrome, Desktop)
   - No regression in existing PlayCanvas/Marzipano workflows
   - CSP headers allow all required origins

---

## Appendix — Key File Inventory (Local)

| Area | Files |
|------|-------|
| Engine Bridge | `lib/3d/bridge/engine-bridge.ts`, `lib/3d/bridge/types.ts` |
| Adapters | `lib/3d/bridge/adapters/*.ts` (4 files) |
| Experience Config | `lib/splat/splat-config-serializer.ts`, `lib/splat/splat-types.ts` |
| Experience Resolution | `lib/experienceResolver.ts` |
| XR Components | `components/xr/*.tsx` (25+ files) |
| Supabase Migrations | `supabase/migrations/20260903_phase1_project_model.sql` + 30 more |
| Auth/RBAC | `lib/rbac.ts`, `lib/auth.ts`, `lib/supabase.ts` |
| Storage | `supabase/migrations/20260919_storage_rls_policies.sql` |
| Next Config | `next.config.ts` (CSP, webpack, headers) |
| Package Manager | `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` |

---

**End of Audit Report** — Ready for architecture review and approval before implementation.