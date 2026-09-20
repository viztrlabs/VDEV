# Phase 7.3 — Unified Public Experience Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `/experience/[slug]` into a unified public experience viewer that renders Tour, Splat, and PlayCanvas content side-by-side with shared camera context.

**Architecture:** Config-Router pattern — `ExperienceViewer` reads `config.engine` and dispatches to the correct viewer combination. `SharedExperienceContext` (Zustand) provides camera yaw/pitch sync across viewers. Side-by-side layout with resizable divider.

**Tech Stack:** Next.js App Router, React, Zustand, Marzipano (TourViewer), @mkkellogg/gaussian-splats-3d (GaussianSplatViewer), PlayCanvas CDN v181 (PlayCanvasViewer)

## Global Constraints

- PlayCanvas CDN v181 (not custom VizTR build) for public viewer
- GaussianSplatViewer already exists — reuse, don't rewrite
- TourViewer already alignment-aware — extend for camera sync
- Config shapes established by Phase 7.2 serializers
- Desktop-first layout (mobile deferred)
- pnpm for all package management

---

## File Structure

| File | Responsibility |
|------|---------------|
| `components/xr/SharedExperienceContext.tsx` | Zustand store for shared camera yaw/pitch |
| `components/xr/ExperienceViewer.tsx` | Config router — reads engine type, dispatches viewers |
| `components/xr/ExperienceLayout.tsx` | Side-by-side layout with resizable divider |
| `components/xr/PlayCanvasPublicViewer.tsx` | Standalone PlayCanvas viewer (CDN v181) |
| `app/experience/[slug]/page.tsx` | Rewrite: server fetch → ExperienceViewer |
| `components/xr/TourViewer.tsx` | Modify: accept SharedExperienceContext for camera sync |
| `components/xr/GaussianSplatViewer.tsx` | Modify: accept SharedExperienceContext for camera sync |
| `__tests__/xr/shared-experience-context.test.ts` | Tests for context |
| `__tests__/xr/experience-viewer.test.ts` | Tests for config routing |
| `__tests__/xr/playcanvas-public-viewer.test.ts` | Tests for PlayCanvas viewer |

---

### Task 1: SharedExperienceContext

**Files:**
- Create: `components/xr/SharedExperienceContext.tsx`
- Create: `__tests__/xr/shared-experience-context.test.ts`

**Interfaces:**
- Consumes: Nothing (first task)
- Produces: `useSharedExperience()`, `SharedExperienceProvider`, `SharedExperienceState`

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/xr/shared-experience-context.test.ts
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { SharedExperienceProvider, useSharedExperience } from '@/components/xr/SharedExperienceContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SharedExperienceProvider>{children}</SharedExperienceProvider>
);

describe('SharedExperienceContext', () => {
  it('initializes with default yaw/pitch of 0', () => {
    const { result } = renderHook(() => useSharedExperience(), { wrapper });
    expect(result.current.yaw).toBe(0);
    expect(result.current.pitch).toBe(0);
  });

  it('setOrientation updates yaw and pitch', () => {
    const { result } = renderHook(() => useSharedExperience(), { wrapper });
    act(() => result.current.setOrientation(1.5, 0.3));
    expect(result.current.yaw).toBe(1.5);
    expect(result.current.pitch).toBe(0.3);
  });

  it('setOrientation clamps pitch to [-PI/2, PI/2]', () => {
    const { result } = renderHook(() => useSharedExperience(), { wrapper });
    act(() => result.current.setOrientation(0, 2.0));
    expect(result.current.pitch).toBe(Math.PI / 2);
    act(() => result.current.setOrientation(0, -2.0));
    expect(result.current.pitch).toBe(-Math.PI / 2);
  });

  it('activeEngine defaults to tour', () => {
    const { result } = renderHook(() => useSharedExperience(), { wrapper });
    expect(result.current.activeEngine).toBe('tour');
  });

  it('setActiveEngine updates engine type', () => {
    const { result } = renderHook(() => useSharedExperience(), { wrapper });
    act(() => result.current.setActiveEngine('splat'));
    expect(result.current.activeEngine).toBe('splat');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec jest __tests__/xr/shared-experience-context.test.ts --passWithNoTests`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write implementation**

```typescript
// components/xr/SharedExperienceContext.tsx
'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { create } from 'zustand';

export type ExperienceEngine = 'tour' | 'splat' | 'playcanvas';

export interface SharedExperienceState {
  yaw: number;
  pitch: number;
  activeEngine: ExperienceEngine;
  setOrientation: (yaw: number, pitch: number) => void;
  setActiveEngine: (engine: ExperienceEngine) => void;
}

const CLAMP_PITCH = Math.PI / 2 - 0.01;

export const useSharedExperienceStore = create<SharedExperienceState>((set) => ({
  yaw: 0,
  pitch: 0,
  activeEngine: 'tour',
  setOrientation: (yaw, pitch) =>
    set({ yaw, pitch: Math.max(-CLAMP_PITCH, Math.min(CLAMP_PITCH, pitch)) }),
  setActiveEngine: (engine) => set({ activeEngine: engine }),
}));

const SharedExperienceContext = createContext<SharedExperienceState | null>(null);

export function SharedExperienceProvider({ children }: { children: React.ReactNode }) {
  const store = useSharedExperienceStore();
  return (
    <SharedExperienceContext.Provider value={store}>
      {children}
    </SharedExperienceContext.Provider>
  );
}

export function useSharedExperience(): SharedExperienceState {
  const ctx = useContext(SharedExperienceContext);
  if (!ctx) {
    // Fallback to store directly if used outside provider
    return useSharedExperienceStore();
  }
  return ctx;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec jest __tests__/xr/shared-experience-context.test.ts --passWithNoTests`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/xr/SharedExperienceContext.tsx __tests__/xr/shared-experience-context.test.ts
git commit -m "feat: SharedExperienceContext for cross-viewer camera sync"
```

---

### Task 2: PlayCanvasPublicViewer

**Files:**
- Create: `components/xr/PlayCanvasPublicViewer.tsx`
- Create: `__tests__/xr/playcanvas-public-viewer.test.ts`

**Interfaces:**
- Consumes: `useSharedExperience()` from Task 1
- Produces: `<PlayCanvasPublicViewer scene={...} camera={...} />`

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/xr/playcanvas-public-viewer.test.ts
import React from 'react';
import { render, screen } from '@testing-library/react';
import { PlayCanvasPublicViewer } from '@/components/xr/PlayCanvasPublicViewer';

// Mock PlayCanvas CDN
global.document.createElement = jest.fn(() => ({
  getContext: jest.fn(() => ({})),
  appendChild: jest.fn(),
  remove: jest.fn(),
}));

describe('PlayCanvasPublicViewer', () => {
  it('renders container div', () => {
    render(
      <PlayCanvasPublicViewer
        scene={{ entities: {} }}
        camera={{ position: [0, 0, 5], target: [0, 0, 0], fov: 60 }}
      />
    );
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(
      <PlayCanvasPublicViewer
        scene={{ entities: {} }}
        camera={{ position: [0, 0, 5], target: [0, 0, 0], fov: 60 }}
      />
    );
    expect(screen.getByText(/Loading 3D/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec jest __tests__/xr/playcanvas-public-viewer.test.ts --passWithNoTests`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write implementation**

```typescript
// components/xr/PlayCanvasPublicViewer.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSharedExperience } from './SharedExperienceContext';

interface PlayCanvasPublicProps {
  scene: { entities?: Record<string, unknown>; settings?: Record<string, unknown> };
  camera: { position: [number, number, number]; target: [number, number, number]; fov: number };
}

export function PlayCanvasPublicViewer({ scene, camera }: PlayCanvasPublicProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setOrientation } = useSharedExperience();

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    const init = async () => {
      try {
        // Load PlayCanvas from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.playcanvas.com/engine/v181/playcanvas.min.js';
        script.async = true;

        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load PlayCanvas'));
          document.head.appendChild(script);
        });

        if (cancelled) return;

        const pc = (window as any).pc;
        if (!pc) throw new Error('PlayCanvas not available');

        const app = new pc.Application(containerRef.current!, {
          mouse: new pc.Mouse(document.body),
          touch: new pc.TouchDevice(document.body),
          keyboard: new pc.Keyboard(document.body),
        });

        appRef.current = app;

        // Configure canvas
        app.setCanvasResolution(pc.Resolution.AUTO);
        app.setCanvasFillMode(pc.FillMode.FIT);

        // Create camera entity
        const cameraEntity = new pc.Entity('camera');
        cameraEntity.addComponent('camera', {
          clearColor: new pc.Color(0.05, 0.05, 0.06),
          fov: camera.fov,
          nearClip: 0.1,
          farClip: 1000,
        });
        cameraEntity.setPosition(...camera.position);
        cameraEntity.lookAt(...camera.target);
        app.root.addChild(cameraEntity);

        // Basic lighting
        const light = new pc.Entity('light');
        light.addComponent('light', {
          type: pc.LIGHTTYPE_DIRECTIONAL,
          color: new pc.Color(1, 1, 1),
          intensity: 1,
        });
        light.setEulerAngles(45, -45, 0);
        app.root.addChild(light);

        // Sync camera back to shared context
        app.on('update', () => {
          const pos = cameraEntity.getPosition();
          const target = new pc.Vec3();
          cameraEntity.getWorldTransform().getTranslation(target);
          // Extract yaw from camera rotation
          const rot = cameraEntity.getRotation();
          const euler = new pc.Vec3();
          rot.getEulerAngles(euler);
          setOrientation(
            (euler.y * Math.PI) / 180,
            (euler.x * Math.PI) / 180
          );
        });

        app.start();
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to initialize');
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      appRef.current?.destroy?.();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="absolute inset-0 bg-[#09090B] flex items-center justify-center">
        <div className="text-sm text-red-400 font-mono">{error}</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#09090B]">
      <div ref={containerRef} className="absolute inset-0" role="region" aria-label="3D Experience" />
      {loading && (
        <div className="absolute inset-0 bg-[#09090B] flex items-center justify-center z-10">
          <div className="text-xs font-mono text-[#3ECF8E]">Loading 3D…</div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec jest __tests__/xr/playcanvas-public-viewer.test.ts --passWithNoTests`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/xr/PlayCanvasPublicViewer.tsx __tests__/xr/playcanvas-public-viewer.test.ts
git commit -m "feat: PlayCanvasPublicViewer standalone CDN-based 3D viewer"
```

---

### Task 3: ExperienceLayout

**Files:**
- Create: `components/xr/ExperienceLayout.tsx`

**Interfaces:**
- Consumes: Nothing (pure layout component)
- Produces: `<ExperienceLayout left={...} right={...} />`

- [ ] **Step 1: Write implementation**

```typescript
// components/xr/ExperienceLayout.tsx
'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

interface ExperienceLayoutProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export function ExperienceLayout({ left, right }: ExperienceLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [splitPercent, setSplitPercent] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = (x / rect.width) * 100;
      setSplitPercent(Math.max(20, Math.min(80, pct)));
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const hasRight = right != null;

  return (
    <div ref={containerRef} className="relative w-full h-full flex bg-[#09090B]">
      {/* Left panel */}
      <div
        className="h-full overflow-hidden"
        style={{ width: hasRight ? `${splitPercent}%` : '100%' }}
      >
        {left}
      </div>

      {/* Divider */}
      {hasRight && (
        <div
          className="relative w-1 bg-[#27272A] cursor-col-resize hover:bg-[#3ECF8E] transition-colors shrink-0"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-8 rounded bg-[#3ECF8E]/30 flex items-center justify-center">
            <div className="w-0.5 h-4 bg-[#3ECF8E] rounded" />
          </div>
        </div>
      )}

      {/* Right panel */}
      {hasRight && (
        <div className="h-full overflow-hidden" style={{ width: `${100 - splitPercent}%` }}>
          {right}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/xr/ExperienceLayout.tsx
git commit -m "feat: ExperienceLayout side-by-side with resizable divider"
```

---

### Task 4: ExperienceViewer (Config Router)

**Files:**
- Create: `components/xr/ExperienceViewer.tsx`
- Create: `__tests__/xr/experience-viewer.test.ts`

**Interfaces:**
- Consumes: `SharedExperienceProvider` (Task 1), `TourViewer` (existing), `GaussianSplatViewer` (existing), `PlayCanvasPublicViewer` (Task 2), `ExperienceLayout` (Task 3)
- Produces: `<ExperienceViewer experience={...} config={...} />`

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/xr/experience-viewer.test.ts
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ExperienceViewer } from '@/components/xr/ExperienceViewer';

jest.mock('@/components/xr/TourViewer', () => ({
  __esModule: true,
  default: () => <div data-testid="tour-viewer">TourViewer</div>,
}));

jest.mock('@/components/xr/GaussianSplatViewer', () => ({
  __dirname: true,
  default: () => <div data-testid="splat-viewer">SplatViewer</div>,
}));

jest.mock('@/components/xr/PlayCanvasPublicViewer', () => ({
  PlayCanvasPublicViewer: () => <div data-testid="playcanvas-viewer">PlayCanvas</div>,
}));

describe('ExperienceViewer', () => {
  it('renders TourViewer for tour engine config', () => {
    render(
      <ExperienceViewer
        experience={{ id: '1', title: 'Test' }}
        config={{ config: { engine: 'tour', tour: { rooms: [] } } }}
      />
    );
    expect(screen.getByTestId('tour-viewer')).toBeInTheDocument();
  });

  it('renders GaussianSplatViewer for splat engine config', () => {
    render(
      <ExperienceViewer
        experience={{ id: '1', title: 'Test' }}
        config={{ config: { engine: 'splat', splat: { url: 'test.splat' } } }}
      />
    );
    expect(screen.getByTestId('splat-viewer')).toBeInTheDocument();
  });

  it('renders both TourViewer and SplatViewer when config has tour + splat', () => {
    render(
      <ExperienceViewer
        experience={{ id: '1', title: 'Test' }}
        config={{
          config: {
            engine: 'tour',
            tour: { rooms: [] },
            splat: { url: 'test.splat' },
          },
        }}
      />
    );
    expect(screen.getByTestId('tour-viewer')).toBeInTheDocument();
    expect(screen.getByTestId('splat-viewer')).toBeInTheDocument();
  });

  it('renders PlayCanvasPublicViewer for playcanvas engine config', () => {
    render(
      <ExperienceViewer
        experience={{ id: '1', title: 'Test' }}
        config={{ config: { engine: 'playcanvas', scene: {}, camera: { position: [0,0,5], target: [0,0,0], fov: 60 } } }}
      />
    );
    expect(screen.getByTestId('playcanvas-viewer')).toBeInTheDocument();
  });

  it('shows fallback for unknown engine type', () => {
    render(
      <ExperienceViewer
        experience={{ id: '1', title: 'Test' }}
        config={{ config: { engine: 'unknown' } }}
      />
    );
    expect(screen.getByText(/Unsupported/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec jest __tests__/xr/experience-viewer.test.ts --passWithNoTests`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write implementation**

```typescript
// components/xr/ExperienceViewer.tsx
'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { SharedExperienceProvider, useSharedExperience } from './SharedExperienceContext';
import { ExperienceLayout } from './ExperienceLayout';

const TourViewer = dynamic(() => import('./TourViewer'), { ssr: false });
const GaussianSplatViewer = dynamic(() => import('./GaussianSplatViewer'), { ssr: false });
const PlayCanvasPublicViewer = dynamic(
  () => import('./PlayCanvasPublicViewer').then((m) => m.PlayCanvasPublicViewer),
  { ssr: false }
);

interface ExperienceViewerProps {
  experience: { id: string; title: string; description?: string };
  config: { config: Record<string, any> };
}

function ExperienceViewerInner({ config }: { config: Record<string, any> }) {
  const { setOrientation } = useSharedExperience();

  const engine = config.engine as string;
  const hasSplat = config.splat?.url;
  const hasTour = config.tour?.rooms?.length > 0;
  const hasPlayCanvas = engine === 'playcanvas';

  // Build tour scene from config for TourViewer
  const tourScene = useMemo(() => {
    if (!hasTour) return null;
    const rooms = config.tour.rooms;
    const room = rooms[0];
    return {
      id: room.id || 'room-0',
      name: room.name || 'Room',
      type: '360' as const,
      url: room.panorama || '',
      tileUrl: undefined,
      thumbnailUrl: room.thumbnail || '',
      initialYaw: (room.initialViewParameters?.yaw || 0) * (180 / Math.PI),
      initialPitch: (room.initialViewParameters?.pitch || 0) * (180 / Math.PI),
      initialFov: 90,
      hotspots: (room.linkHotspots || []).map((h: any, i: number) => ({
        id: `hs-${i}`,
        yaw: h.yaw,
        pitch: h.pitch,
        type: 'link' as const,
        targetSceneId: h.target,
        targetYaw: 0,
        title: h.target || 'Link',
        description: '',
      })),
      viewConstraints: { top: -90, bottom: 90, left: -180, right: 180, zoomMin: 60, zoomMax: 120, mobileZoomEnabled: false },
      autorotateEnabled: true,
      autorotateSpeed: 0.5,
      spatialAlignment: room.spatialAlignment,
      alignmentMarkers: room.alignmentMarkers,
    };
  }, [config, hasTour]);

  const left = useMemo(() => {
    if (hasTour && tourScene) {
      return <TourViewer scene={tourScene} />;
    }
    if (hasPlayCanvas) {
      return (
        <PlayCanvasPublicViewer
          scene={config.scene || {}}
          camera={config.camera || { position: [0, 0, 5], target: [0, 0, 0], fov: 60 }}
        />
      );
    }
    return null;
  }, [hasTour, hasPlayCanvas, tourScene, config]);

  const right = useMemo(() => {
    if (hasSplat) {
      // GaussianSplatViewer expects SplatSceneDef format
      return <GaussianSplatViewer splatUrl={config.splat.url} />;
    }
    return null;
  }, [hasSplat, config]);

  // Single viewer (no split)
  if (!right && left) return left;
  if (!left && right) return right;

  // Both viewers
  if (left && right) {
    return <ExperienceLayout left={left} right={right} />;
  }

  return (
    <div className="flex items-center justify-center h-full text-[#71717A] font-mono text-sm">
      No content available for this experience.
    </div>
  );
}

export function ExperienceViewer({ experience, config }: ExperienceViewerProps) {
  return (
    <SharedExperienceProvider>
      <ExperienceViewerInner config={config.config} />
    </SharedExperienceProvider>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec jest __tests__/xr/experience-viewer.test.ts --passWithNoTests`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/xr/ExperienceViewer.tsx __tests__/xr/experience-viewer.test.ts
git commit -m "feat: ExperienceViewer config router for unified public experience"
```

---

### Task 5: Wire Camera Sync into TourViewer

**Files:**
- Modify: `components/xr/TourViewer.tsx`

**Interfaces:**
- Consumes: `useSharedExperience()` from Task 1
- Produces: TourViewer syncs camera with SharedExperienceContext

- [ ] **Step 1: Add camera sync to TourViewer**

In `components/xr/TourViewer.tsx`, add:
1. Import `useSharedExperience` from `./SharedExperienceContext`
2. In `init()`, after Marzipano scene is created:
   - Subscribe to Marzipano view change → update shared context
   - Subscribe to shared context change → update Marzipano view
3. Use `worldDirectionToPanorama()` to account for alignment offset

Key changes in the `init()` function:
```typescript
const { yaw: sharedYaw, pitch: sharedPitch, setOrientation } = useSharedExperience();

// After ms.switch():
const view = ms.view();
if (view) {
  // Sync Marzipano → shared context
  view.addEventListener('change', () => {
    setOrientation(view.yaw(), view.pitch());
  });
}

// Note: Context → Marzipano sync requires a separate effect
// to avoid circular updates. Use a ref to track source.
```

- [ ] **Step 2: Add useEffect for context → Marzipano sync**

After the main init useEffect, add:
```typescript
// Sync shared context → Marzipano view (when change originates from another viewer)
useEffect(() => {
  const ms = sceneRef.current;
  if (!ms) return;
  const view = ms.view();
  if (!view) return;
  // Only update if the change didn't originate from this viewer
  if (Math.abs(view.yaw() - scene.spatialAlignmentYawOffset) > 0.001) return;
  view.yaw(yaw);
  view.pitch(pitch);
}, [yaw, pitch]); // eslint-disable-line react-hooks/exhaustive-deps
```

- [ ] **Step 3: Commit**

```bash
git add components/xr/TourViewer.tsx
git commit -m "feat: TourViewer camera sync with SharedExperienceContext"
```

---

### Task 6: Wire Camera Sync into GaussianSplatViewer

**Files:**
- Modify: `components/xr/GaussianSplatViewer.tsx`

**Interfaces:**
- Consumes: `useSharedExperience()` from Task 1
- Produces: GaussianSplatViewer syncs camera with SharedExperienceContext

- [ ] **Step 1: Add camera sync to GaussianSplatViewer**

In `components/xr/GaussianSplatViewer.tsx`, add:
1. Import `useSharedExperience` from `./SharedExperienceContext`
2. Subscribe to Three.js camera change → update shared context
3. Subscribe to shared context change → update Three.js camera

The GaussianSplatViewer uses `@mkkellogg/gaussian-splats-3d` with a Three.js scene. After the viewer initializes:
- Hook into the orbit controls `change` event → extract camera yaw/pitch → `setOrientation()`
- Add a useEffect that reads `yaw`/`pitch` from context → sets Three.js camera position

- [ ] **Step 2: Commit**

```bash
git add components/xr/GaussianSplatViewer.tsx
git commit -m "feat: GaussianSplatViewer camera sync with SharedExperienceContext"
```

---

### Task 7: Rewrite /experience/[slug] Page

**Files:**
- Modify: `app/experience/[slug]/page.tsx`

**Interfaces:**
- Consumes: `ExperienceViewer` from Task 4
- Produces: Public experience page that renders ExperienceViewer

- [ ] **Step 1: Rewrite the page**

Replace the current metadata dump with:

```typescript
// app/experience/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getExperience } from '@/lib/experiences';
import { ExperienceViewer } from '@/components/xr/ExperienceViewer';

interface Props {
  params: { slug: string };
}

export default async function ExperiencePage({ params }: Props) {
  const data = await getExperience(params.slug);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white mb-2">Experience Not Found</h1>
          <p className="text-sm text-[#71717A]">This experience may not exist or has not been published.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B]">
      <ExperienceViewer experience={data.experience} config={data.config} />
    </div>
  );
}
```

- [ ] **Step 2: Verify getExperience function exists**

Check that `lib/experiences.ts` exports `getExperience(slug)` that returns `{ experience, config }`. If not, create it.

- [ ] **Step 3: Commit**

```bash
git add "app/experience/[slug]/page.tsx"
git commit -m "feat: rewrite /experience/[slug] as unified public experience viewer"
```

---

### Task 8: Integration Tests

**Files:**
- Create: `__tests__/xr/unified-experience-integration.test.ts`

**Interfaces:**
- Consumes: All previous tasks
- Produces: Integration test verifying full flow

- [ ] **Step 1: Write integration test**

```typescript
// __tests__/xr/unified-experience-integration.test.ts
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ExperienceViewer } from '@/components/xr/ExperienceViewer';

jest.mock('@/components/xr/TourViewer', () => ({
  __esModule: true,
  default: () => <div data-testid="tour-viewer">TourViewer</div>,
}));

jest.mock('@/components/xr/GaussianSplatViewer', () => ({
  __esModule: true,
  default: () => <div data-testid="splat-viewer">SplatViewer</div>,
}));

jest.mock('@/components/xr/PlayCanvasPublicViewer', () => ({
  PlayCanvasPublicViewer: () => <div data-testid="playcanvas-viewer">PlayCanvas</div>,
}));

describe('Unified Experience Integration', () => {
  it('tour-only experience renders single viewer', () => {
    render(
      <ExperienceViewer
        experience={{ id: '1', title: 'Tour Only' }}
        config={{ config: { engine: 'tour', tour: { rooms: [{ id: 'r1', name: 'Room', panorama: 'p.jpg', initialViewParameters: { yaw: 0, pitch: 0 } }] } } }}
      />
    );
    expect(screen.getByTestId('tour-viewer')).toBeInTheDocument();
    expect(screen.queryByTestId('splat-viewer')).not.toBeInTheDocument();
  });

  it('tour+splat experience renders both viewers in layout', () => {
    render(
      <ExperienceViewer
        experience={{ id: '1', title: 'Tour + Splat' }}
        config={{
          config: {
            engine: 'tour',
            tour: { rooms: [{ id: 'r1', name: 'Room', panorama: 'p.jpg', initialViewParameters: { yaw: 0, pitch: 0 } }] },
            splat: { url: 'test.splat' },
          },
        }}
      />
    );
    expect(screen.getByTestId('tour-viewer')).toBeInTheDocument();
    expect(screen.getByTestId('splat-viewer')).toBeInTheDocument();
  });

  it('splat-only experience renders single viewer', () => {
    render(
      <ExperienceViewer
        experience={{ id: '1', title: 'Splat Only' }}
        config={{ config: { engine: 'splat', splat: { url: 'test.splat' } } }}
      />
    );
    expect(screen.queryByTestId('tour-viewer')).not.toBeInTheDocument();
    expect(screen.getByTestId('splat-viewer')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run all tests**

Run: `pnpm exec jest __tests__/xr/ --passWithNoTests`
Expected: All PASS

- [ ] **Step 3: Commit**

```bash
git add __tests__/xr/unified-experience-integration.test.ts
git commit -m "test: unified experience integration tests"
```

---

### Task 9: Build Verification

- [ ] **Step 1: Run build**

Run: `pnpm run build`
Expected: PASS

- [ ] **Step 2: Run full test suite**

Run: `pnpm exec jest --passWithNoTests`
Expected: No new failures

- [ ] **Step 3: Manual verification**

Start dev server (`pnpm run dev:all`) and verify:
- `/experience/[slug]` loads a published experience
- Tour viewer renders panorama
- Splat viewer renders Gaussian Splat (if splat URL in config)
- Side-by-side layout works
- Camera sync works between viewers

---

## Summary

| Task | Description | Tests |
|------|-------------|-------|
| 1 | SharedExperienceContext | 5 tests |
| 2 | PlayCanvasPublicViewer | 2 tests |
| 3 | ExperienceLayout | — (visual) |
| 4 | ExperienceViewer (config router) | 5 tests |
| 5 | TourViewer camera sync | — (integration) |
| 6 | GaussianSplatViewer camera sync | — (integration) |
| 7 | Rewrite /experience/[slug] | — (E2E) |
| 8 | Integration tests | 3 tests |
| 9 | Build verification | — |

**Total new tests**: 15
**New files**: 6
**Modified files**: 3
