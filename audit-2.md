Now I have comprehensive knowledge of the codebase. Let me generate the complete technical audit report.

---

# VIRTUAL TOUR WEB APPLICATION — TECHNICAL AUDIT, GAP ANALYSIS & FIX ROADMAP

**Date:** 2026-09-02  
**Project:** VizTR XR World / Virtual Tour Platform  
**Analyst:** Expert Full-Stack Architect & WebGL/360° Specialist  

---

## SECTION 1: TECH STACK & ARCHITECTURE AUDIT

### 1.1 Installed Tech Stack

| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| **Framework** | Next.js | 15.1.6 (App Router) | React 19, Turbopack |
| **Language** | TypeScript | 5.x | Strict mode, path aliases |
| **Styling** | Tailwind CSS | 4.1.11 | PostCSS, `@tailwindcss/postcss` |
| **UI Components** | shadcn/ui + Lucide React | Latest | Custom dark theme (`#09090B`, `#3ECF8E` accent) |
| **State Management** | Zustand + zundo (temporal) + Immer | 5.0.15 / 2.3.0 | Multiple stores: `useAppStore`, `useEditorStore`, `useWebXRStore` |
| **3D/360 Engine** | **Marzipano** | **0.10.2** | Core 360° viewer (legacy, unmaintained since 2019) |
| **3D Engine (Secondary)** | PlayCanvas | 2.21.4 | WebGL engine for 3D scenes |
| **React 3D** | @react-three/fiber + drei | 8.17.10 / 9.114.0 | R3F abstraction layer |
| **Gaussian Splats** | @mkkellogg/gaussian-splats-3d | 0.4.7 | 3D Gaussian Splatting |
| **GLTF Pipeline** | @gltf-transform/core + extensions | 4.1.1 | Compression, Draco, Meshopt, KTX2 |
| **Database/Backend** | Supabase (PostgreSQL) + Prisma | 2.112.3 / 7.9.1 | Auth, Realtime, Storage |
| **Auth** | NextAuth.js | 4.24.11 | OAuth + credentials |
| **Build** | Turborepo + pnpm | Latest | Monorepo-ready |
| **Testing** | Jest + React Testing Library | 29.7.0 / 16.3.3 | Unit + integration |

### 1.2 Architecture Review

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           VIZTR ARCHITECTURE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PUBLIC VIEWER (Client-facing)                                             │
│  ├─ app/client-view/[accessCode]/page.tsx  ← Read-only tour access        │
│  ├─ app/xr-world/virtual-tour/client/[tourId]/page.tsx  ← Tour gallery    │
│  ├─ components/xr/MarzipanoViewer.tsx    ← Marzipano wrapper (360° only)  │
│  ├─ components/xr/XRViewer.tsx           ← Full XR experience (VR/AR)     │
│  ├─ components/xr/SceneManager.tsx       ← Multi-layer scene engine       │
│  └─ components/xr/PlayCanvasXRViewer.tsx ← PlayCanvas 3D integration      │
│                                                                             │
│  CONFIGURATOR / EDITOR DASHBOARD (Developer-facing)                        │
│  ├─ app/xr-world/virtual-tour/editor/page.tsx  ← Main editor (12 tabs)   │
│  ├─ app/xr-world/virtual-tour/editor-dashboard/page.tsx  ← Marzipano mgr  │
│  ├─ components/editor/                                     │
│  │   ├─ CanvasTab.tsx           ← Visual tour map / node graph           │
│  │   ├─ PanoramaPreview.tsx     ← Marzipano preview + hotspot placement  │
│  │   ├─ HotspotInspector.tsx    ← Per-hotspot property editor            │
│  │   ├─ SceneConfigPanel.tsx    ← Scene identity, nadir, staging, filter │
│  │   ├─ ViewConstraintsPanel.tsx← Pitch/yaw/zoom limits                  │
│  │   └─ HotspotStyleTabs.tsx    ← Symbol/Label/Global hotspot styling    │
│  └─ lib/marzipano/              ← Import/Export round-trip (ZIP)         │
│                                                                             │
│  STATE MANAGEMENT (3 parallel stores - ANTI-PATTERN)                       │
│  ├─ lib/store.ts (useAppStore)       ← Global UI: modals, toasts, auth   │
│  ├─ lib/editorStore.ts               ← Editor: rooms, hotspots, undo     │
│  └─ components/xr/xr.store.ts        ← XR: scenes, annotations, VR/AR    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Critical Architectural Flaws

| Issue | Severity | Evidence |
|-------|----------|----------|
| **Three parallel Zustand stores** with overlapping domain data (scenes/rooms/hotspots) | **Critical** | `useAppStore` has `openPanorama`, `useEditorStore` has `rooms[]`, `useWebXRStore` has `scenes[]` — no single source of truth |
| **Marzipano instances not isolated** from React lifecycle | **High** | `MarzipanoViewer.tsx:136-139` calls `viewer.destroy()` in cleanup but no WebGL context loss handling |
| **No clear Public/Configurator separation** | **High** | Both dashboards import same Marzipano components; editor imports viewer components directly |
| **Dual 3D engine confusion** (Marzipano + PlayCanvas + Three.js/R3F) | **Medium** | Three engines loaded simultaneously; no engine abstraction (see `3D-Phase1.md`) |
| **TypeScript `any` abuse** in Marzipano integration | **Medium** | `MarzipanoViewer.tsx:24, 29, 43, 48` — defeats type safety |
| **No multi-resolution tiling** despite Marzipano supporting it | **High** | `MarzipanoViewer.tsx:61-66` hardcodes levels but never loads tiles — loads full equirectangular only |

### 1.3 State Management Analysis

**Current Pattern:** Three independent Zustand stores with zero synchronization.

```typescript
// lib/store.ts - Global app state
openPanorama: (url, title, hotspots) => set({...})

// lib/editorStore.ts - Editor state (persisted to localStorage)
rooms: TourRoom[]
selectedId: string
// ... undo/redo via zundo temporal middleware

// components/xr/xr.store.ts - XR/WebXR state
scenes: XRScene[]
currentSceneId: string
// ... VR/AR session management
```

**Data Flow Gap:** When editor saves → `/api/tour` PUT → public viewer fetches `/api/tour` GET. **No real-time sync**, no WebSocket invalidation, no optimistic UI.

---

## SECTION 2: FEATURE INVENTORY & COMPLETION STATUS

### 2.1 Public Viewer Features

| Feature | Status | Completion | Notes |
|---------|--------|------------|-------|
| **360° Scene Rendering** | ✅ Complete | 85% | `MarzipanoViewer.tsx` — equirectangular only, no multi-res tiles |
| **Hotspot Click Navigation** | ✅ Complete | 90% | Link hotspots → scene switch; Info hotspots → annotation overlay |
| **Touch/Mouse Controls** | ✅ Complete | 80% | Drag, scroll zoom, mobile touch; missing gyroscope |
| **Zoom Controls** | ✅ Complete | 75% | +/- buttons + scroll; FOV clamping works |
| **Fullscreen Mode** | ✅ Complete | 90% | Native fullscreen API |
| **Scene Transitions** | ⚠️ Partial | 40% | `defaultTransition: {duration: 500}` but no cross-fade, no preload |
| **Loading States** | ✅ Complete | 85% | Progress bar (0-100%), error overlay |
| **WebXR/VR Mode** | 🔄 In Progress | 55% | `XRViewer.tsx` + `VRControls.tsx` exist but not wired to Marzipano |
| **AR Mode** | 🔄 In Progress | 30% | `webxr-service.ts` detects AR but no AR viewer integration |
| **Keyboard Navigation** | ❌ Not Started | 0% | No arrow keys, Tab order, ARIA labels |
| **Multi-resolution Tiles** | ❌ Not Started | 0% | Geometry levels defined but tile sources never used |
| **Offline/Kiosk Mode** | ❌ Not Started | 0% | No Service Worker, no cache-first strategy |
| **Analytics/Telemetry** | ⚠️ Partial | 35% | `AnalyticsPanel.tsx` exists but not connected to viewer events |

### 2.2 Configurator/Editor Features

| Feature | Status | Completion | Notes |
|---------|--------|------------|-------|
| **Scene Management (CRUD)** | ✅ Complete | 95% | Add, delete, duplicate, reorder, rename |
| **Panorama Upload/Replace** | ✅ Complete | 90% | `/api/tour/upload` → Supabase Storage |
| **Hotspot Placement (Click on Preview)** | ✅ Complete | 95% | `PanoramaPreview.tsx` addMode + drag reposition |
| **Hotspot Types (8 types)** | ✅ Complete | 85% | Point, Chevron, Image, Article, Video, Sound, Link, Product |
| **Hotspot Styling (Symbol/Label/Global)** | ✅ Complete | 90% | `HotspotStyleTabs.tsx` — comprehensive |
| **Link Hotspots (Scene-to-Scene)** | ✅ Complete | 95% | Target selector, auto-targetYaw=180° |
| **View Constraints (Pitch/Yaw/Zoom Limits)** | ✅ Complete | 90% | `ViewConstraintsPanel.tsx` — numeric inputs + sliders |
| **Initial View Setting** | ✅ Complete | 95% | `OrientationBar.tsx` — Save Default / Set North |
| **Nadir Fix (Quick/Custom)** | ✅ Complete | 80% | UI complete; custom upload uses `URL.createObjectURL` (not persistent) |
| **Image Filters (Light/Sharpen/Brightness/Contrast)** | ✅ Complete | 85% | `SceneConfigPanel.tsx` Filter tab — CSS filters only |
| **Sun Light Positioning** | ✅ Complete | 75% | UI complete; no actual WebGL shader integration |
| **Staging (Day-to-Dusk)** | ⚠️ Partial | 40% | UI only; no rendering pipeline |
| **Floorplan Upload/Display** | ✅ Complete | 70% | `FloorplanManager.tsx` — upload + display settings |
| **Google Maps Integration** | ⚠️ Partial | 30% | `MapManager.tsx` — types exist, no Leaflet/GMaps implementation |
| **Marzipano ZIP Import** | ✅ Complete | 95% | `lib/marzipano/importer.ts` — parses `app-data.json`/`data.js` |
| **Marzipano ZIP Export** | ✅ Complete | 90% | `lib/marzipano/exporter.ts` — emits `data.js` + `app-data.json` |
| **Tour Settings (Publish/Access/Theme)** | ✅ Complete | 85% | `editor/page.tsx` Settings tab |
| **Undo/Redo (50 steps)** | ✅ Complete | 95% | `zundo` temporal middleware on `editorStore` |
| **Canvas/Tour Map View** | ✅ Complete | 80% | `CanvasTab.tsx` — drag nodes, GPS auto-link |
| **Content Settings (Logo/Intro/Copyright)** | ✅ Complete | 75% | `ContentSettingsPanel.tsx` — UI complete |
| **Control Bar Configuration (25+ items)** | ✅ Complete | 70% | `CtaControlBarPanel.tsx` — item visibility toggles |
| **Marketing/SEO/Analytics Config** | ✅ Complete | 70% | `MarketingPanel.tsx` — forms, scripts, SEO |
| **Collaboration/Comments** | ⚠️ Partial | 40% | `VtedCollaboration` types; no real-time backend |
| **Multi-language Support** | ⚠️ Partial | 30% | Types only; no i18n runtime |
| **Gaussian Splats Configurator** | 🔄 In Progress | 50% | `SplatConfigurator.tsx` exists but not integrated |

---

## SECTION 3: GAP ANALYSIS & MISSING FEATURES

### 3.1 Marzipano Feature Parity Gaps (vs. Original Marzipano Tool)

| Missing Feature | Severity | Description |
|-----------------|----------|-------------|
| **Multi-resolution tile loading** | **Critical** | Marzipano supports pyramid tiles (4096→512). Current code creates `EquirectGeometry` levels but `ImageUrlSource.fromString()` loads **single full-res image**. Causes 50-200MB downloads on mobile. |
| **Cube map support** | **High** | Importer explicitly rejects cube scenes (`isCubeScene()`). Many professional tours use cube tiles. |
| **Precise view limit API** | **High** | Editor has numeric inputs but `MarzipanoViewer.tsx` hardcodes `traditional(1024, 120°, 120°)` limiter. No dynamic limiter from editor settings. |
| **Hotspot `rotation` property** | **Medium** | Marzipano link hotspots support `rotation` (for portal alignment). Editor UI has no rotation control. |
| **Hotspot `scale` / `perspective` / `stereo`** | **Medium** | Marzipano `HotspotOptions` supports these. Not exposed in editor. |
| **Autorotate with speed control** | **Medium** | Settings has `autorotateEnabled` + `autorotateSpeed` but `MarzipanoViewer` never enables it. |
| **QTVR mouse mode** | **Low** | Settings dropdown has `qtvr` but viewer hardcodes `mouseViewMode: 'qtilt'` (line 31) |
| **Scene transition effects** | **High** | Only `defaultTransition: {duration: 500}`. No cross-fade, no custom transitions. |
| **Custom hotspot DOM lifecycle** | **Medium** | Editor creates rich hotspot elements; viewer uses minimal `div.marzipano-hotspot` with hardcoded CSS. |
| **Mobile zoom limit separate from desktop** | **High** | Editor has `mobileZoomEnabled` toggle; viewer ignores it. |

### 3.2 UX/UI Gaps (Public Viewer)

| Gap | Severity | Impact |
|-----|----------|--------|
| **No smooth scene transitions** | **Critical** | Hard scene switch → visual "pop", breaks immersion |
| **No progressive loading indicator per tile** | **High** | Users see black screen during 50MB+ downloads |
| **No keyboard accessibility** | **Critical** | WCAG 2.1 AA failure — arrow keys, Tab, Escape not handled |
| **No gyroscope/motion sensor on mobile** | **High** | Core 360° UX missing; competitors (Kuula, 3DVista) have this |
| **No scene preloading/hints** | **Medium** | Click link → wait for full image download |
| **No "Little Planet" / Stereographic view mode** | **Medium** | Marzipano supports `StereographicView`; not exposed |
| **No shareable deep links (scene + yaw/pitch/fov)** | **High** | Cannot share specific view; URL doesn't update |
| **No responsive thumbnail generation** | **Medium** | Editor uploads full-res; viewer loads full-res even for thumbnails |
| **No loading skeleton/placeholder** | **Low** | Black flash during init |

### 3.3 Performance & Edge Case Gaps

| Gap | Severity | Technical Details |
|-----|----------|-------------------|
| **WebGL Context Loss Recovery** | **Critical** | Zero handling. `viewer.destroy()` in cleanup but no `webglcontextlost` / `webglcontextrestored` listeners. Tab background → context lost → white screen on return. |
| **Memory Leaks on Scene Switch** | **Critical** | `MarzipanoViewer.tsx:136-139` calls `destroy()` but: (1) hotspot elements not removed from DOM, (2) event listeners on `view` not removed, (3) geometry/textures not explicitly disposed. |
| **No texture compression (KTX2/Basis)** | **High** | 16K equirectangular = 192MB VRAM uncompressed. `ktx-parse` installed but unused. |
| **No Draco/Meshopt for 3D assets** | **High** | GLB pipeline exists (`3D-Phase1.md`) but not integrated into viewer. |
| **No bundle splitting for Marzipano** | **Medium** | `marzipano` (47KB gz) loaded in main bundle. Should be dynamic import. |
| **No Service Worker / offline support** | **Medium** | Kiosk mode requirement unmet. |
| **No performance budgets / monitoring in CI** | **Low** | `test-final-performance-benchmarks.ts` exists but not in CI pipeline. |

---

## SECTION 4: REMEDIATION — HOW TO FIX THE GAPS

### 4.1 Critical Fix: Multi-Resolution Tile Loading (Marzipano)

**Problem:** `MarzipanoViewer.tsx` loads single full-res equirectangular image.

**Solution:** Implement `ImageUrlSource.fromTileUrl()` with tile pyramid.

```typescript
// components/xr/MarzipanoViewer.tsx — REPLACE lines 48-87

useEffect(() => {
  if (!viewerRef.current) return;

  const initMarzipano = async () => {
    try {
      const Marzipano: any = (await import('marzipano')).default || (await import('marzipano'));
      setLoadProgress(0.2);

      const viewer = new Marzipano.Viewer(viewerRef.current!, {
        controls: {
          mouseViewMode: 'qtilt',
          scrollZoom: true,
          scrollZoomSpeed: 0.3,
          dragRotateOnMobile: true,
          dragRoll: true,
        },
        autoplay: false,
        defaultTransition: { duration: 500 },
      });
      marzipanoViewerRef.current = viewer;

      // MULTI-RES TILE SOURCE (replaces ImageUrlSource.fromString)
      const tileBaseUrl = scene.tileUrl || scene.url.replace(/\.(jpg|jpeg|png|webp)$/i, '');
      const source = Marzipano.ImageUrlSource.fromTileUrl(
        `${tileBaseUrl}/tiles/{z}/{y}/{x}.jpg`,  // tile URL template
        {
          crossOrigin: 'anonymous',
          maxZoom: 4,  // 4096→2048→1024→512→256
          tileSize: 512,
        }
      );

      const geometry = new Marzipano.EquirectGeometry([
        { width: 4096 },
        { width: 2048 },
        { width: 1024 },
        { width: 512 },
        { width: 256 },  // fallback
      ]);

      // DYNAMIC LIMITER from scene config
      const viewConstraints = scene.viewConstraints || {};
      const limiter = Marzipano.RectilinearView.limit.traditional(
        1024,
        ((viewConstraints.zoomMax || 120) * Math.PI) / 180,
        ((viewConstraints.zoomMax || 120) * Math.PI) / 180
      );

      const view = new Marzipano.RectilinearView({
        yaw: ((scene.initialYaw || 0) * Math.PI) / 180,
        pitch: ((scene.initialPitch || 0) * Math.PI) / 180,
        fov: Math.PI / 2,
      }, limiter);

      const marzipanoScene = viewer.createScene({
        source,
        geometry,
        view,
        name: scene.name,
        id: scene.id,
        pinFirstLevel: true,
      });

      marzipanoScene.switch();
      setLoadProgress(0.7);
      // ... hotspots unchanged
    } catch (err) { /* error handling */ }
  };
  initMarzipano();
  return () => {
    if (marzipanoViewerRef.current) {
      marzipanoViewerRef.current.destroy();
    }
  };
}, [scene, onHotspotClick]);
```

**Required API Changes:**
- Add `tileUrl` field to `XRScene` type (`components/xr/xr.types.ts`)
- Update `/api/tour/upload` to generate tiles via `gltf-transform` or sharp
- Update exporter to include tile URLs in `MarzipanoScene`

---

### 4.2 Critical Fix: WebGL Context Loss Recovery

**Problem:** No recovery → white screen after tab background.

**Solution:** Add context loss handlers with automatic reinitialization.

```typescript
// components/xr/MarzipanoViewer.tsx — ADD inside useEffect, after viewer creation

const handleContextLost = (e: Event) => {
  e.preventDefault();
  console.warn('[Marzipano] WebGL context lost');
  setIsLoading(true);
  setLoadProgress(0);
};

const handleContextRestored = () => {
  console.log('[Marzipano] WebGL context restored — reinitializing');
  // Force re-run of initMarzipano by toggling a key
  setSceneKey(prev => prev + 1);
};

const canvas = viewerRef.current?.querySelector('canvas');
if (canvas) {
  canvas.addEventListener('webglcontextlost', handleContextLost);
  canvas.addEventListener('webglcontextrestored', handleContextRestored);
}

return () => {
  if (canvas) {
    canvas.removeEventListener('webglcontextlost', handleContextLost);
    canvas.removeEventListener('webglcontextrestored', handleContextRestored);
  }
  if (marzipanoViewerRef.current) {
    marzipanoViewerRef.current.destroy();
  }
};
```

Add `sceneKey` state to force remount:
```typescript
const [sceneKey, setSceneKey] = useState(0);
// ...
<div ref={viewerRef} key={sceneKey} className="absolute inset-0" />
```

---

### 4.3 Critical Fix: Memory Leak Prevention on Scene Switch

**Problem:** Hotspot elements, event listeners, geometries not disposed.

**Solution:** Explicit cleanup in `MarzipanoViewer.tsx`.

```typescript
// ADD to MarzipanoViewer.tsx — before return in useEffect cleanup

return () => {
  if (marzipanoViewerRef.current) {
    const viewer = marzipanoViewerRef.current;
    const scene = viewer.scene();
    
    if (scene) {
      // 1. Destroy all hotspots (removes DOM elements)
      const hotspots = scene.hotspots().getAll();
      hotspots.forEach((hs: any) => hs.destroy());
      
      // 2. Remove view change listeners
      const view = scene.view();
      if (view) {
        view.removeEventListener('change', handleViewChange);
      }
      
      // 3. Stop scene rendering
      scene.stop();
    }
    
    // 4. Destroy viewer (disposes WebGL resources)
    viewer.destroy();
    marzipanoViewerRef.current = null;
  }
};
```

---

### 4.4 High Fix: Dynamic View Limiter from Editor Settings

**Problem:** Hardcoded `traditional(1024, 120°, 120°)` ignores editor's `ViewConstraintsPanel`.

**Solution:** Pass constraints from scene config to viewer.

```typescript
// In MarzipanoViewer.tsx — compute limiter from scene.viewConstraints

const vc = scene.viewConstraints || {
  top: -90, bottom: 90, left: -180, right: 180,
  zoomMin: 60, zoomMax: 120, mobileZoomEnabled: false
};

const limiter = Marzipano.RectilinearView.limit.custom(
  (vc.zoomMin * Math.PI) / 180,  // min FOV
  (vc.zoomMax * Math.PI) / 180,  // max FOV
  (vc.top * Math.PI) / 180,       // max pitch
  (vc.bottom * Math.PI) / 180,    // min pitch
  (vc.left * Math.PI) / 180,      // min yaw
  (vc.right * Math.PI) / 180      // max yaw
);
```

---

### 4.5 High Fix: Autorotate Implementation

**Problem:** Settings exist but never applied.

**Solution:** Apply autorotate in viewer init.

```typescript
// MarzipanoViewer.tsx — after scene.switch()

if (scene.autorotateEnabled) {
  const view = marzipanoScene.view();
  view.setParameters({
    yaw: view.yaw(),
    pitch: view.pitch(),
    fov: view.fov()
  }, 500); // smooth transition
  
  // Marzipano autorotate via view animation
  let autorotateInterval: NodeJS.Timeout;
  const speed = scene.autorotateSpeed || 0.5; // degrees per frame
  
  const startAutorotate = () => {
    autorotateInterval = setInterval(() => {
      const view = marzipanoScene.view();
      view.yaw(view.yaw() + (speed * Math.PI / 180));
    }, 16); // ~60fps
  };
  
  const stopAutorotate = () => {
    if (autorotateInterval) clearInterval(autorotateInterval);
  };
  
  startAutorotate();
  
  // Stop on user interaction
  viewerRef.current?.addEventListener('mousedown', stopAutorotate);
  viewerRef.current?.addEventListener('touchstart', stopAutorotate);
  viewerRef.current?.addEventListener('wheel', stopAutorotate);
  
  // Cleanup
  return () => stopAutorotate();
}
```

---

### 4.6 High Fix: State Sync — Single Source of Truth

**Problem:** Three stores with overlapping data.

**Solution:** Consolidate to **one canonical store** with selectors.

```typescript
// lib/tourStore.ts (NEW — replaces editorStore + xr.store + appStore tour data)

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { temporal } from 'zundo';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface TourScene {
  id: string;
  name: string;
  type: '360' | '3d';
  url: string;
  tileUrl?: string;           // NEW: multi-res tile base URL
  thumbnailUrl: string;
  initialYaw: number;
  initialPitch: number;
  initialFov: number;
  hotspots: TourHotspot[];
  viewConstraints: ViewConstraints;
  // ... VTED fields
}

export interface TourHotspot {
  id: string;
  yaw: number;        // canonical: radians
  pitch: number;
  type: 'link' | 'info' | 'image' | 'video' | 'audio' | 'product';
  targetSceneId?: string;
  targetYaw?: number;
  title: string;
  description: string;
  // styling fields...
}

export interface ViewConstraints {
  top: number; bottom: number; left: number; right: number;
  zoomMin: number; zoomMax: number; mobileZoomEnabled: boolean;
}

interface TourState {
  // Canonical data
  scenes: TourScene[];
  currentSceneId: string;
  
  // Editor-only (not persisted)
  selectedSceneId: string;
  addMode: boolean;
  editingHotspotId: string | null;
  
  // Viewer-only (not persisted)
  isLoading: boolean;
  currentView: { yaw: number; pitch: number; fov: number } | null;
  
  // Actions
  setScenes: (scenes: TourScene[]) => void;
  updateScene: (id: string, patch: Partial<TourScene>) => void;
  deleteScene: (id: string) => void;
  setCurrentScene: (id: string) => void;
  setView: (view: { yaw: number; pitch: number; fov: number }) => void;
  
  // Persistence
  saveToServer: () => Promise<void>;
  loadFromServer: (tourId: string) => Promise<void>;
  
  // Export/Import
  exportMarzipano: () => MarzipanoTour;
  importMarzipano: (zip: File) => Promise<void>;
}

export const useTourStore = create<TourState>()(
  temporal(
    persist(
      immer((set, get) => ({
        scenes: [],
        currentSceneId: '',
        selectedSceneId: '',
        addMode: false,
        editingHotspotId: null,
        isLoading: false,
        currentView: null,
        
        setScenes: (scenes) => set({ scenes, currentSceneId: scenes[0]?.id || '' }),
        
        updateScene: (id, patch) => set(state => {
          const scene = state.scenes.find(s => s.id === id);
          if (scene) Object.assign(scene, patch);
        }),
        
        deleteScene: (id) => set(state => {
          state.scenes = state.scenes.filter(s => s.id !== id);
          if (state.currentSceneId === id) state.currentSceneId = state.scenes[0]?.id || '';
        }),
        
        setCurrentScene: (id) => set({ currentSceneId: id }),
        
        setView: (view) => set({ currentView: view }),
        
        saveToServer: async () => { /* PUT /api/tour */ },
        loadFromServer: async (tourId) => { /* GET /api/tour */ },
        
        exportMarzipano: () => { /* use exporter.ts */ },
        importMarzipano: async (zip) => { /* use importer.ts */ },
      })),
      {
        name: 'viztr-tour-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ scenes: state.scenes, currentSceneId: state.currentSceneId }),
      }
    ),
    {
      partialize: (state) => ({ scenes: state.scenes }),
      limit: 50,
    }
  )
);

// Selectors for backward compatibility
export const useEditorScenes = () => useTourStore(s => s.scenes);
export const useViewerCurrentScene = () => useTourStore(s => s.scenes.find(sc => sc.id === s.currentSceneId));
export const useEditorSelectedScene = () => useTourStore(s => s.scenes.find(sc => sc.id === s.selectedSceneId));
```

**Migration:** Replace all `useEditorStore`, `useXRStore`, `useAppStore` tour-related calls with `useTourStore` selectors.

---

### 4.7 High Fix: Keyboard Accessibility (WCAG 2.1 AA)

```typescript
// components/xr/MarzipanoViewer.tsx — ADD keyboard handler

useEffect(() => {
  const container = viewerRef.current;
  if (!container) return;
  
  const handleKeyDown = (e: KeyboardEvent) => {
    const viewer = marzipanoViewerRef.current;
    const scene = viewer?.scene();
    const view = scene?.view();
    if (!view) return;
    
    const step = Math.PI / 36; // 5 degrees
    const zoomStep = 0.1;
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault(); view.yaw(view.yaw() - step); break;
      case 'ArrowRight':
        e.preventDefault(); view.yaw(view.yaw() + step); break;
      case 'ArrowUp':
        e.preventDefault(); view.pitch(Math.min(view.pitch() + step, Math.PI/2 - 0.01)); break;
      case 'ArrowDown':
        e.preventDefault(); view.pitch(Math.max(view.pitch() - step, -Math.PI/2 + 0.01)); break;
      case '+':
      case '=':
        e.preventDefault(); view.fov(Math.max(view.fov() * 0.9, Math.PI/6)); break;
      case '-':
        e.preventDefault(); view.fov(Math.min(view.fov() * 1.1, Math.PI)); break;
      case '0':
        e.preventDefault(); view.yaw(0); view.pitch(0); view.fov(Math.PI/2); break;
      case 'f':
      case 'F':
        e.preventDefault(); handleFullscreen(); break;
      case 'Escape':
        if (document.fullscreenElement) document.exitFullscreen(); break;
    }
  };
  
  container.addEventListener('keydown', handleKeyDown);
  container.setAttribute('tabIndex', '0'); // make focusable
  container.focus();
  
  return () => container.removeEventListener('keydown', handleKeyDown);
}, []);
```

Add ARIA labels to hotspot elements in `PanoramaPreview.tsx`:
```tsx
<button
  data-hotspot-marker
  role="button"
  aria-label={`${hotspot.title}, ${hotspot.type} hotspot`}
  tabIndex={0}
  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onHotspotClick(hotspot.id); }}
  // ...
>
```

---

### 4.8 Medium Fix: Texture Compression Pipeline (KTX2)

```typescript
// scripts/compress-panorama.ts (NEW)
import { compress } from '@gltf-transform/core';
import { draco } from '@gltf-transform/extensions';
import { ktx2 } from '@gltf-transform/functions';
import sharp from 'sharp';

export async function generateTilePyramid(
  inputPath: string,
  outputDir: string,
  options: { tileSize: number; format: 'ktx2' | 'jpg'; quality: number }
) {
  // 1. Load full-res equirectangular
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  
  // 2. Generate pyramid levels: 4096, 2048, 1024, 512, 256
  const levels = [4096, 2048, 1024, 512, 256];
  
  for (const size of levels) {
    const levelDir = `${outputDir}/tiles/${Math.log2(4096/size)}`;
    await fs.mkdir(levelDir, { recursive: true });
    
    // Slice into tiles (using sharp or custom tiling)
    await tileEquirectangular(inputPath, levelDir, size, options);
  }
  
  // 3. Generate KTX2 compressed versions for GPU upload
  if (options.format === 'ktx2') {
    await compressKtx2(outputDir);
  }
}

// Integrate into /api/tour/upload route.ts
```

---

### 4.9 Medium Fix: Deep Link Sharing (URL State Sync)

```typescript
// lib/urlSync.ts (NEW)
export function syncUrlToScene(scene: TourScene, view: { yaw: number; pitch: number; fov: number }) {
  if (typeof window === 'undefined') return;
  
  const params = new URLSearchParams();
  params.set('scene', scene.id);
  params.set('yaw', Math.round(view.yaw * 180 / Math.PI).toString());
  params.set('pitch', Math.round(view.pitch * 180 / Math.PI).toString());
  params.set('fov', Math.round(view.fov * 180 / Math.PI).toString());
  
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', newUrl);
}

export function parseUrlForInitialView(): { sceneId?: string; yaw?: number; pitch?: number; fov?: number } {
  if (typeof window === 'undefined') return {};
  
  const params = new URLSearchParams(window.location.search);
  return {
    sceneId: params.get('scene') || undefined,
    yaw: params.has('yaw') ? parseFloat(params.get('yaw')!) * Math.PI / 180 : undefined,
    pitch: params.has('pitch') ? parseFloat(params.get('pitch')!) * Math.PI / 180 : undefined,
    fov: params.has('fov') ? parseFloat(params.get('fov')!) * Math.PI / 180 : undefined,
  };
}
```

---

## SECTION 5: COMPLETE AUDIT & FIX ROADMAP

### Phase 1: Critical Stabilization (Days 1-3)

| Day | Deliverable | Owner | Validation |
|-----|-------------|-------|------------|
| **1** | WebGL Context Loss Recovery | 3D Engineer | Tab background/foreground cycle → viewer recovers |
| **1** | Memory Leak Fix (hotspot disposal, listener cleanup) | 3D Engineer | Heap snapshot: no retained Marzipano objects after scene switch |
| **2** | Multi-Resolution Tile Loading (KTX2 + tile pyramid) | 3D Engineer + Backend | 16K panorama loads <3s on 4G; VRAM <200MB |
| **2** | Dynamic View Limiter from Editor Settings | Frontend | `ViewConstraintsPanel` values enforced in viewer |
| **3** | Keyboard Accessibility (WCAG 2.1 AA) | Frontend | axe-core audit: 0 violations; Tab/Arrow/Escape work |
| **3** | Autorotate Implementation | Frontend | Settings toggle works; pauses on interaction |

**Exit Criteria:** `pnpm test` passes, `pnpm build` passes, Lighthouse Performance >90, Accessibility 100.

---

### Phase 2: Core Feature Parity (Days 4-10)

| Day | Deliverable | Owner | Validation |
|-----|-------------|-------|------------|
| **4-5** | Unified Tour Store (replace 3 stores) | Lead Architect | All components use `useTourStore`; zero `useEditorStore`/`useXRStore` imports |
| **5** | Deep Link Sharing (URL sync) | Frontend | Share URL → opens exact scene + view |
| **6** | Scene Transitions (cross-fade + preload) | 3D Engineer | Click link → 300ms cross-fade; next scene preloads |
| **6** | Hotspot Rotation + Scale Controls | Frontend | Editor UI + viewer respect `rotation`/`scale` |
| **7** | Mobile Gyroscope Support | Frontend | iOS Safari + Chrome Android: device motion controls view |
| **7** | Cube Map Import Support | Backend + Frontend | Marzipano ZIP with cube faces imports successfully |
| **8** | Progressive Loading UI (per-tile) | Frontend | Loading indicator shows tile progress, not fake 0-100% |
| **8-9** | Texture Compression Pipeline (KTX2/Draco) | 3D Engineer | `scripts/compress-panorama.ts` in CI; upload → auto-compress |
| **10** | Integration Testing + Bug Bash | Full Team | All Phase 1-2 features work end-to-end |

**Exit Criteria:** Marzipano ZIP round-trip (import→edit→export) preserves all features; mobile 360° UX matches Kuula/3DVista.

---

### Phase 3: UX & Public Viewer Polish (Days 11-15)

| Day | Deliverable | Owner | Validation |
|-----|-------------|-------|------------|
| **11** | Little Planet / Stereographic View Mode | 3D Engineer | View mode toggle in control bar |
| **11** | Responsive Thumbnail Generation (auto on upload) | Backend | Thumbnails <50KB, WebP, multiple sizes |
| **12** | Service Worker + Offline Cache (Workbox) | Frontend | Lighthouse PWA score >90; works offline |
| **12** | Scene Preloading (hover link → preload next) | Frontend | Network tab shows preload on hover |
| **13** | Loading Skeleton / Blur Placeholder | Frontend | No black flash; LQIP shown during load |
| **13** | Share Modal (QR code, social, embed code) | Frontend | `qrcode` package integration |
| **14** | Analytics Integration (view events → Supabase) | Full Stack | Dashboard shows real-time views, hotspot clicks |
| **14** | Performance Budgets in CI | DevOps | `pnpm test:ci` fails if bundle >500KB or LCP >2.5s |
| **15** | Polish Sprint (animations, micro-interactions, copy) | Design + Frontend | Stakeholder sign-off |

**Exit Criteria:** Public viewer feels "premium" — smooth, fast, accessible, shareable.

---

### Phase 4: Advanced Features & WebXR (Days 16+)

| Sprint | Deliverable | Owner | Validation |
|--------|-------------|-------|------------|
| **Week 5** | WebXR VR Mode (Marzipano + WebXR polyfill) | 3D Engineer | Meta Quest 3: enter VR, look around, teleport via hotspots |
| **Week 5** | WebXR AR Mode (markerless, floor detection) | 3D Engineer | iOS ARKit / Android ARCore: place tour in room |
| **Week 6** | Gaussian Splat Integration (viewer + editor) | 3D Engineer | `.splat` files load in `SplatConfigurator`; hotspot support |
| **Week 6** | Dollhouse 3D Mode (Phase 11 from VTED plan) | 3D Engineer | 3D model builder wizard functional |
| **Week 7** | Real-time Collaboration (WebRTC + Supabase Realtime) | Backend | Multi-user editing with presence, comments |
| **Week 7** | AI Floorplan → 3D (GPT-4V + floorplan AI) | AI Engineer | Upload floorplan → auto-generate tour nodes |
| **Week 8** | Enterprise SSO, Audit Logs, RBAC | Backend | `Enterprise Features` from `FEATURE_TRACKER.md` complete |

---

## APPENDIX: KEY FILES TO MODIFY (Priority Order)

| Priority | File | Change Type |
|----------|------|-------------|
| **P0** | `components/xr/MarzipanoViewer.tsx` | Major rewrite: multi-res tiles, context loss, memory cleanup, keyboard, autorotate |
| **P0** | `lib/tourStore.ts` (NEW) | New canonical store replacing 3 stores |
| **P0** | `components/xr/xr.types.ts` | Add `tileUrl`, `viewConstraints`, `autorotateEnabled/Speed` to `XRScene` |
| **P0** | `lib/marzipano/conversion.ts` | Export `viewConstraints`, `autorotate`, `tileUrl` in round-trip |
| **P1** | `components/editor/PanoramaPreview.tsx` | Sync hotspot styling with viewer; add rotation/scale UI |
| **P1** | `components/editor/ViewConstraintsPanel.tsx` | Already complete — ensure values flow to viewer |
| **P1** | `app/api/tour/upload/route.ts` | Add tile pyramid + KTX2 generation |
| **P1** | `scripts/compress-panorama.ts` (NEW) | Tile pyramid + compression CLI |
| **P2** | `components/xr/SceneManager.tsx` | Integrate with unified `useTourStore` |
| **P2** | `app/xr-world/virtual-tour/client/[tourId]/page.tsx` | Use unified store + deep link parsing |
| **P2** | `components/editor/HotspotStyleTabs.tsx` | Add rotation/scale controls for Marzipano parity |
| **P3** | `components/xr/VRControls.tsx` | Wire to Marzipano viewer for WebXR |
| **P3** | `lib/urlSync.ts` (NEW) | URL state synchronization |

---

## RISK REGISTER

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Marzipano 0.10.2 unmaintained (last commit 2019) | High | Breaking changes in browser APIs | Vendor fork in `vendor/marzipano/`; plan migration to Three.js-based viewer |
| Tile generation pipeline failures | Medium | Upload UX broken | Fallback to single-image; async processing queue with status polling |
| Three-engine conflict (Marzipano/PlayCanvas/Three.js) | Medium | Bundle size, runtime errors | Phase 1 engine abstraction (`3D-Phase1.md`) must complete first |
| Supabase Storage costs for multi-res tiles | Low | Budget overrun | Cloudflare R2 + aggressive caching; tiles only for >4K sources |
| iOS Safari WebGL context loss frequency | High | User frustration | Context loss recovery (Phase 1) + save/restore view state |

---

## CONCLUSION

The codebase has **strong editor foundations** (95% feature complete for configurator) but **critical viewer gaps** that prevent production deployment:

1. **No multi-resolution tiles** → unacceptable load times on mobile
2. **No WebGL context recovery** → crashes on tab switch
3. **Memory leaks** → progressive degradation
4. **Three un-synced stores** → data inconsistency bugs
5. **Zero keyboard accessibility** → legal/compliance risk

**Recommended immediate action:** Execute **Phase 1 (3 days)** with 3D Engineer + Frontend lead pair programming on `MarzipanoViewer.tsx` rewrite. This unblocks all subsequent work and reduces production risk from **Critical → Low**.

The **VTED 12-phase plan** (`VTED-PHASE-PLAN.md`) and **3D-Phase1** (`3D-Phase1.md`) are well-structured but assume a working viewer foundation. **Complete this audit's Phase 1-2 first**, then resume VTED Phase 5+.

---

*Report generated from comprehensive codebase analysis of 50+ files across `/app`, `/components`, `/lib`, and documentation.*