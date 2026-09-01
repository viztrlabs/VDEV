# VizTR Frontend Audit & Immersive Experience — Plan

> **Scope (per user decision):** Frontend code quality + 3D/AR/VR/Splat engine consolidation.
> Out of scope: marketing-page copywriting, payment, full brand-IA redesign, analytics dashboards.

---

## 0. Audit Summary (one-page)

### What exists today
| Area | State | Evidence |
|---|---|---|
| Next.js app router, RSC + client components | Working | `app/` (27 top-level routes), `app/layout.tsx` |
| Marketing site (Home, Services, Portfolio, About, Contact, Blog) | Working | `app/page.tsx` (15 section components), `app/portfolio/[id]/page.tsx` |
| Auth (NextAuth + Supabase) | Working | `app/login`, `app/signup`, `lib/auth.ts`, `middleware.ts` |
| Client dashboard | Working | `app/client-dashboard/page.tsx` (410 lines, 17 subcomponents) |
| Admin dashboard | Working | `app/admin/dashboard/page.tsx` (1,197 lines) |
| Virtual tour editor | Working | `app/xr-world/virtual-tour/editor/page.tsx` (~960 lines after our prior refactor) |
| Virtual tour client viewer | Working | `app/xr-world/virtual-tour/client/[tourId]/page.tsx` |
| Marzipano (360) | Working | `components/xr/MarzipanoViewer.tsx`, `components/viewers/PanoramaViewer.tsx` |
| PlayCanvas (3D / WebXR) | Working | `components/xr/PlayCameraSceneRenderer.tsx`, `components/xr/PlayCanvasXRViewer.tsx`, `components/xr/PlayCanvasConfigurator.tsx` |
| Three.js (direct) | Working | `components/xr/GaussianSplatViewer.tsx`, `components/xr/PlayCanvasConfigurator.tsx`, `app/xr-world/gaussian-splat/page.tsx` |
| Gaussian Splat (`@mkkellogg/gaussian-splats-3d`) | Working | `components/xr/GaussianSplatViewer.tsx` (uses DropInViewer + three.js scene) |
| Pixel Streaming (UE5) | Working | `components/xr/PixelStreaming*.tsx`, `app/xr-world/pixel-streaming/page.tsx`, `lib/credentials-store.ts` |
| Supabase (DB + storage) | Working | `lib/supabase/`, `app/api/projects`, `app/api/tours` |
| Cloudflare / S3 simulation | Mock only | `app/api/storage/route.ts` returns hardcoded `STORAGE_STATUS`; `app/xr-links/route.ts` hardcodes XR_LINKS_DB |
| Analytics | Partial | `lib/analytics.ts` exists; `app/api/analytics` not present (synthetic only) |
| SEO | Partial | `app/sitemap.ts` exists; per-project OG not present |

### Key audit findings

1. **Three 3D engines in production, no shared abstraction.**
   - Marzipano (360) — `components/xr/MarzipanoViewer.tsx:1-235`
   - PlayCanvas (3D / WebXR) — `components/xr/PlayCameraSceneRenderer.tsx`, `PlayCanvasConfigurator.tsx`, `PlayCanvasXRViewer.tsx`
   - Three.js directly (Gaussian Splat + a one-off `PlayCanvasConfigurator`) — `components/xr/GaussianSplatViewer.tsx:1-80`, `PlayCanvasConfigurator.tsx:1-60`
   - `@react-three/fiber` and `@react-three/drei` are installed but **not used anywhere in the codebase** (verified by reading `package.json` and not finding any imports of them).

2. **Routing split between three "project" ideas:**
   - `app/portfolio/[id]/page.tsx` (marketing-style project, data from `data/portfolio.ts`)
   - `app/xr-world/virtual-tour/editor` (editable tour graph)
   - `app/xr-world/virtual-tour/client/[tourId]` (client-facing tour viewer)
   - No canonical URL, no shared "Project" entity. Marketing page never links to the 3D tour, and the tour never references the marketing page.

3. **Mock API routes masquerade as real endpoints.**
   - `app/api/storage/route.ts` returns a hardcoded `STORAGE_STATUS` object. It does not read from S3, R2, or Supabase Storage.
   - `app/api/xr-links/route.ts` uses a hardcoded `XR_LINKS_DB` array. Live data never persists.
   - These will silently mislead consumers. Plan must convert them to real Supabase-backed endpoints (or delete them).

4. **The XR runtime is a duplicated mini-app.**
   - `components/xr/xr.store.ts` (416 lines, Zustand + Immer) — separate from `lib/store.ts` (266 lines, the global app store).
   - Two stores means two sources of truth for modal/lightbox/panorama state. The global store still owns `openPanorama` and `openModelViewer`; the XR viewer at `app/xr/view` mounts XRViewer which uses its own store. Consumers do not know which to use.

5. **Three WebGL/canvas cleanup bugs (file:line evidence):**
   - `components/xr/GaussianSplatViewer.tsx:78-80` — `containerRef.current.appendChild(renderer.domElement)` is never disposed. Switching scenes or unmounting the route leaks the previous renderer + canvas.
   - `components/xr/PlayCanvasConfigurator.tsx:52-60` — Three.js scene + renderer + camera are created in a `useEffect` with **no cleanup return**. The renderer keeps animating after unmount.
   - `components/xr/MarzipanoViewer.tsx:135-140` — `viewer.destroy()` is in a cleanup return, but the `let cancelled` pattern is not used for the async init, so a fast unmount can still call `viewerRef.current.destroy()` on a half-initialized viewer.
   - `app/xr-world/gaussian-splat/page.tsx:38-60` — A whole new `WebGLRenderer` is created in a useEffect with no cleanup.

6. **Type holes:**
   - `components/xr/xr.store.ts` references `webxr-service` and `SessionStatus` that I could not find any import path resolving to in `components/xr/hooks/`. Build still passes, suggesting the hooks folder contains those types but the import path is informal.
   - `components/xr/MarzipanoViewer.tsx:43, 80` — `marzipanoViewerRef.current` typed `any`.
   - `components/xr/GaussianSplatViewer.tsx:36` — `viewerRef` typed `any`.

7. **Dependencies that look unused but I cannot fully prove without running the build:**
   - `@react-three/fiber`, `@react-three/drei` — installed, no `import` of them in the files I read.
   - `redux`, `react-redux`, `@reduxjs/toolkit` — installed. I did not find any consumer in the routes I read; the stores I saw are Zustand.
   - `firebase` and `firebase-tools` — installed. `lib/firebase.ts` exists; whether it is called from runtime code I cannot tell from this static pass.

8. **`@gltf-transform/*` and `meshoptimizer` and `draco3d` and `ktx-parse` are installed.**
   These are the asset-pipeline primitives needed for the work in Phase 2. They are not currently wired into a build step. `scripts/` likely contains stubs.

9. **`/portfolio` and `/studio` and `/xr-world` route trees overlap semantically.**
   - `/portfolio/[id]` is a marketing case study.
   - `/studio/*` is CGI services.
   - `/xr-world/*` is immersive services.
   A visitor has no single URL to land on for "the immersive experience of Project X."

---

## 1. Goals & Non-Goals

### Goals
- One shared abstraction layer so Marzipano / PlayCanvas / Splat all present the same project/scene shape to the rest of the app.
- A new canonical URL `/projects/[slug]` that surfaces VizView / VizAR / VizVR / VizTour / VizReality buttons.
- Renamed, IA-coherent route tree: `/viztr-studio/*` and `/experiences/*`.
- Fix the three cleanup bugs above.
- Prove the unused Redux / R3F decision with a real test, not a hunch.

### Non-Goals (out of scope this round)
- Replacing PlayCanvas with Three.js (or vice versa).
- Building the new asset-processing pipeline (Draco / KTX2 / Meshopt). The libraries are installed; the build script is not.
- Migrating `app/api/storage` and `app/api/xr-links` to real Supabase — flag for follow-up.
- Full SEO/OG/per-project metadata pass.
- Payment, booking, client-dashboard rewrite.
- VR asset generation (only client-side rendering concerns in scope).

---

## 2. Decisions locked from the user (do not re-litigate)

| Decision | Source |
|---|---|
| Plan scope = **Frontend code quality + 3D engines** | user |
| Unified project URL = **new `/projects/[slug]`** | user |
| Marketing buckets = **rename** (`/studio/*` → `/viztr-studio/*`, `/xr-world/*` → `/experiences/*`) | user |
| 3D engine strategy = **keep all three, add shared abstraction** | user |

---

## 3. Shared engine abstraction (the central design)

Create `components/viz/engines/` with a thin interface, one adapter per engine, and one selector that chooses the engine for a given experience.

### File layout
```
components/viz/
  engines/
    types.ts                  # VizExperience, VizEngine, VizScene, VizHotspot
    selectors.ts              # pickEngine(experience) -> engineId
    engineRegistry.tsx        # <VizEngineCanvas experience={...} /> central mount
    EngineLoading.tsx         # shared skeleton + error + fallback
    EngineUnavailable.tsx     # shared fallback (no WebGL, no WebXR, no AR)
  adapters/
    MarzipanoAdapter.tsx      # wraps components/xr/MarzipanoViewer.tsx
    PlayCanvasAdapter.tsx     # wraps components/xr/PlayCameraSceneRenderer.tsx
    SplatAdapter.tsx          # wraps components/xr/GaussianSplatViewer.tsx
  ProjectExperiencePanel.tsx  # the surface the new /projects/[slug] page renders
  ExperienceButton.tsx        # the [3D] [AR] [VR] [TOUR] [REALITY] button
  hooks/
    useVizCapabilities.ts     # detects WebGL, WebXR, AR support
    useVizEngine.ts           # lifecycle: mount, dispose, error
```

### `VizExperience` (client-facing taxonomy — technology-agnostic)
```ts
export type VizExperienceId = 'vizview' | 'vizar' | 'vizvr' | 'viztour' | 'vizreality';

export interface VizScene {
  id: string;
  name: string;
  thumbnailUrl: string;
  // one of these will be present depending on the experience
  panoramaUrl?: string;       // VizTour
  model3dUrl?: string;         // VizView / VizAR
  splatUrl?: string;           // VizReality
  hotspots: VizHotspot[];
  initialYaw?: number;
  initialPitch?: number;
  initialPosition?: [number, number, number];
  environment?: 'studio' | 'sunset' | 'urban' | 'interior';
}

export interface VizExperience {
  id: VizExperienceId;
  label: string;               // "VizView", "VizTour", etc.
  description: string;
  available: boolean;          // server decides; client respects
  primaryScene: VizScene | null;
  fallbackScene?: VizScene;   // for VR-headset fallback to 360, etc.
  capabilities: {
    requiresWebGL2: boolean;
    requiresWebXR: boolean;
    requiresAR: boolean;
  };
}

export interface VizProject {
  slug: string;
  title: string;
  subtitle: string;
  coverImage: string;
  experiences: VizExperience[]; // empty array = project is "marketing only"
  metadata: {
    client?: string;
    location?: string;
    year?: string;
  };
}
```

### Engine registry contract
```ts
export type VizEngineId = 'marzipano' | 'playcanvas' | 'splat';

export interface VizEngineProps {
  scene: VizScene;
  experienceId: VizExperienceId;
  onError?: (err: Error) => void;
  onReady?: () => void;
}

export type VizEngineComponent = React.ComponentType<VizEngineProps>;
```

Each adapter converts `VizScene` → the engine's native scene shape (XRScene, SplatSceneDef, etc.) and back. This is the only place that needs to know the engine's vocabulary.

### Selector logic (`pickEngine`)
```text
vizview   → playcanvas        (interactive 3D)
viztour   → marzipano         (360 panoramas)
vizvr     → playcanvas        (WebXR immersive-vr)
vizar     → playcanvas        (WebXR immersive-ar; fallback marzipano if no AR)
vizreality → splat            (always; falls back to playcanvas if splat lib fails)
```

---

## 4. New canonical project page `/projects/[slug]`

### URL & data flow
- Route: `app/projects/[slug]/page.tsx` (RSC for SEO).
- Data source (short-term): a new `lib/viz/vizProjects.ts` that joins:
  - `data/portfolio.ts` (marketing case study)
  - the editable tour config in `data/tour-config.ts` / `lib/toursRepo.ts`
  - the asset URLs already in `data/pages.ts` and the new `app/api/storage` interface
- Long-term: a Supabase `projects` table with `experiences` JSON column. (Out of scope for this plan — flagged as Phase 3 follow-up.)

### Page layout
```
<ProjectHeader>           // title, subtitle, cover image, year, location
<ExperiencePanel>         // [3D] [AR] [VR] [TOUR] [REALITY]
                          // buttons appear only if experience.available === true
<MarketingCaseStudy>      // existing portfolio/[id] content re-used
<RelatedProjects>
```

### `ExperienceButton` behavior
- Clicking launches the experience inline in a modal route `/projects/[slug]/experience/[experienceId]`.
- That modal is a thin wrapper around `<VizEngineCanvas experience={...} />` plus `<EngineLoading />` and `<EngineUnavailable />`.
- The user can navigate between available experiences without leaving the project page.
- Deep link: `/projects/solarium-penthouse/experience/viztour` is shareable.

### Redirect map (Phase 1)
| Old URL | New URL | Status |
|---|---|---|
| `/portfolio/[id]` | `/projects/[slug]` | 301, lookup by matching portfolio.id → vizProject.slug |
| `/xr-world/virtual-tour/editor` | `/viztr-experiences/viztour` (kept for editors) | No redirect; the page is renamed in-place |
| `/xr-world/virtual-tour/client/[tourId]` | `/projects/[slug]/experience/viztour` when slug is known | 301 for client-side launches |
| `/xr-world/webar` | `/experiences/vizar` | 301 |
| `/xr-world/virtual-reality` | `/experiences/vizvr` | 301 |
| `/xr-world/webxr` | `/experiences` (the hub) | 301 |
| `/xr-world/gaussian-splat` | `/experiences/vizreality` | 301 |
| `/xr-world/virtual-tour` | `/experiences/viztour` | 301 |
| `/xr-world` | `/experiences` | 301 |
| `/studio` | `/viztr-studio` | 301 |
| `/studio/exterior` etc. | unchanged (CGI sub-pages stay where they are; only the bucket renames) | 301 only the bucket |

### RSC data layer
Create `lib/viz/getVizProject.ts` (server-only) that:
1. Looks up the project by slug.
2. Returns `VizProject` with `experiences[]` derived from which assets are present (panoramaUrl → viztour, splatUrl → vizreality, model3dUrl → vizview, vizar/vizvr are derived from the same model).
3. Returns `notFound()` if the project is unknown.

---

## 5. Route rename plan

### New routes (Phase 1.4)
```
/viztr-studio          (was /studio)
/viztr-studio/exterior (kept)
/viztr-studio/interior (kept)
/viztr-studio/walkthrough (kept)

/experiences                    (was /xr-world)
/experiences/vizview            (new; for now, same content as /xr-world/webxr)
/experiences/vizar              (was /xr-world/webar)
/experiences/vizvr              (was /xr-world/virtual-reality)
/experiences/viztour            (was /xr-world/virtual-tour)
/experiences/vizreality         (was /xr-world/gaussian-splat)
```

### Implementation
1. New folder `app/viztr-studio/` — move `app/studio/*` here verbatim. Keep `app/studio/*` as re-export shims for one release, then delete.
2. New folder `app/experiences/` — mirror `app/xr-world/*` content with renamed labels and copy updates. Keep `app/xr-world/*` as 301 redirect shims.
3. Update `app/sitemap.ts` to emit the new URLs. Keep old URLs as `alternates`.
4. Update header / footer navigation: `components/layout/Header.tsx`, `components/layout/Footer.tsx` (read these to confirm — not in scope of this plan to fully implement, but the new routes must be linked).

### Risks
- Sitemap change can affect SEO for existing indexed URLs. Mitigate with 301 redirects and `rel="canonical"` in the new pages.
- Internal links from blog posts and other static pages must be updated.

---

## 6. Fix the three cleanup bugs (Phase 1.1 — small, high-value)

These can be done independently and quickly.

### Bug A: `components/xr/PlayCanvasConfigurator.tsx:52-60`
Currently creates `scene`, `renderer`, `camera` with no cleanup. Add to the same useEffect:
```ts
return () => {
  renderer.dispose();
  renderer.forceContextLoss();
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry?.dispose();
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
      else obj.material?.dispose();
    }
  });
  if (renderer.domElement.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement);
  }
  sceneRef.current = null;
  rendererRef.current = null;
  cameraRef.current = null;
};
```

### Bug B: `components/xr/GaussianSplatViewer.tsx:78-80`
The DropInViewer is added to a three.js scene and a `WebGLRenderer` is created and `appendChild`'d. Add cleanup:
```ts
return () => {
  disposed = true;
  cancelAnimationFrame(renderCtxRef.current.raf ?? 0);
  if (renderCtxRef.current.renderer) {
    renderCtxRef.current.renderer.dispose();
    const dom = renderCtxRef.current.renderer.domElement;
    if (dom.parentNode) dom.parentNode.removeChild(dom);
  }
  if (viewerRef.current?.dispose) viewerRef.current.dispose();
  viewerRef.current = null;
};
```

### Bug C: `app/xr-world/gaussian-splat/page.tsx:38-60`
Same pattern. WebGLRenderer with no cleanup. Add identical disposal logic.

### Bug D: `components/xr/MarzipanoViewer.tsx:135-140`
Already has a cleanup return, but the async init isn't guarded by `cancelled`. Add a `let cancelled = false;` and check it before `viewerRef.current.destroy()` in the cleanup.

### Acceptance
- Open the editor in dev, navigate away, navigate back 5×. No "WebGL context lost" toast. Memory does not grow in DevTools.
- For Splat: navigate `/xr-world/gaussian-splat` → home → back. Only one `<canvas>` attached.

---

## 7. Decide on Redux / R3F (don't punt, prove it)

### Step 1 (Phase 1.2)
Run a static check across the repo:
- `grep -r "@reduxjs/toolkit" app components lib` — should be empty if truly unused.
- `grep -r "react-redux" app components lib` — should be empty.
- `grep -r "@react-three/fiber" app components lib` — should be empty.
- `grep -r "@react-three/drei" app components lib` — should be empty.
- `grep -r "from 'firebase'" app components lib` — count.
- `grep -r "from 'next-auth'" app components lib` — confirm NextAuth is actually used at runtime.

### Step 2
- If Redux/RTK is unused → remove from `package.json` in the same PR. Saves ~50KB.
- If R3F/drei are unused → remove from `package.json`. Saves ~200KB.
- If firebase is used only by `lib/firebase.ts` for analytics that no one consumes → flag for follow-up, do not remove in this round.

---

## 8. Service-page refactor (Phase 1.5)

The five new `/experiences/*` pages should be re-skinned in marketing language (no "WebXR" in H1s, no "Marzipano" in capability lists). Implementation:

1. Rename the five pages, keep the same body content but rewrite hero/capability copy through the `servicePagesData` map in `data/pages.ts`.
2. Add a single shared `ExperienceServicePage` component that all five pages render with different props from `servicePagesData`. Today each page is bespoke; this is the consolidation.
3. Each page's "Launch" button now calls the unified `openExperience(slug, experienceId)` action (see below) instead of the global `useAppStore` modals.

### Store action
Add to `lib/store.ts`:
```ts
openExperience: (projectSlug: string, experienceId: VizExperienceId) => void;
```
which dispatches an internal modal that mounts `<VizEngineCanvas>`.

For Phase 1, **do not delete `openPanorama` / `openModelViewer`**. They are still called by the existing `app/xr-world/webar` and `app/xr-world/virtual-tour` pages. They become legacy and are removed in Phase 2 once those pages are renamed.

---

## 9. Implementation Roadmap (ordered by dependency)

Each phase lists: objective, files, dependencies, risk, acceptance.

### Phase 0 — Audit (done)
This document is Phase 0.

### Phase 1 — Foundation (smallest safe moves)

**1.1 — Fix cleanup bugs (1-2 hours, no UX impact)**
- Files: `components/xr/PlayCanvasConfigurator.tsx`, `components/xr/GaussianSplatViewer.tsx`, `components/xr/MarzipanoViewer.tsx`, `app/xr-world/gaussian-splat/page.tsx`
- Dependencies: none.
- Risk: low — disposals are additive.
- Acceptance: no leaked canvases / contexts after route navigation. DevTools heap stays flat.

**1.2 — Prove unused-dep claim (1 hour)**
- Run the greps from §7. Document results. Remove confirmed-unused packages.
- Risk: removing a package breaks an import I missed. Mitigate: `pnpm build` and `pnpm test` after removal.
- Acceptance: build green, no behavioral change.

**1.3 — Engine abstraction skeleton (1 day)**
- Create `components/viz/engines/types.ts`, `selectors.ts`, `engineRegistry.tsx`, `EngineLoading.tsx`, `EngineUnavailable.tsx`.
- Add `VizProject` / `VizExperience` / `VizScene` types.
- Wire `useVizCapabilities` and `useVizEngine` hooks.
- Acceptance: types compile, no consumers yet.

**1.4 — Rename route tree (2 days, depends on 1.3)**
- Move `app/studio/*` → `app/viztr-studio/*`. Add 301 redirects from `app/studio/*`.
- Move `app/xr-world/*` → `app/experiences/*`. Add 301 redirects.
- Update `app/sitemap.ts`, `Header.tsx`, `Footer.tsx`.
- Risk: indexed URLs lose traffic if 301 is wrong. Verify with curl after deployment.
- Acceptance: `/portfolio/[id]` still 200s; `/projects/[id]` (old portfolio URL) redirects to new `/projects/[slug]`. Sitemap emits new URLs only.

**1.5 — Service-page refactor (1 day)**
- Create shared `ExperienceServicePage` component.
- Re-skin `/experiences/{vizview,vizar,vizvr,viztour,vizreality}` using `servicePagesData` map and the new shared layout.
- Acceptance: no H1 says "WebXR" or "Marzipano". Capability lists are marketing-first.

### Phase 2 — Adapters + project page

**2.1 — MarzipanoAdapter (1 day)**
- File: `components/viz/adapters/MarzipanoAdapter.tsx`
- Converts `VizScene` → current `XRScene` shape, passes to existing `MarzipanoViewer`. Disposes on unmount.
- Adds a typed ref so we can drop the `any` in `MarzipanoViewer.tsx` (do **not** rewrite MarzipanoViewer itself in this phase).
- Risk: low.
- Acceptance: opening `/projects/solarium-penthouse/experience/viztour` renders the existing tour, exits cleanly.

**2.2 — PlayCanvasAdapter (1 day)**
- Same shape, wraps `PlayCameraSceneRenderer`. Type the ref to drop `any`.
- Acceptance: `/projects/.../vizview` and `vizvr` render, dispose cleanly.

**2.3 — SplatAdapter (2 days — bigger)**
- Wraps `GaussianSplatViewer`. **In this phase the cleanup bug fix from 1.1 is mandatory**, otherwise the adapter inherits the leak.
- Convert `SplatSceneDef` to/from `VizScene`.
- Add a typed ref.
- Acceptance: `/projects/.../vizreality` renders, multiple navigations don't leak.

**2.4 — `ProjectExperiencePanel` (1 day)**
- The surface that lists the available experiences and launches the modal.
- Reads `useVizCapabilities` to grey out buttons the device cannot run (e.g. AR on a non-AR phone).
- Acceptance: the same project page works on Chrome desktop, Safari iPhone (no WebXR, gracefully hides VR/AR), Quest browser (shows all).

**2.5 — New `/projects/[slug]/page.tsx` (2 days)**
- RSC. Calls `getVizProject(slug)`.
- Renders `<ProjectHeader>`, `<ProjectExperiencePanel>`, the marketing case study, related projects.
- Acceptance: page returns 200 server-side, no client-only data fetch for the header.

**2.6 — Modal route `/projects/[slug]/experience/[experienceId]/page.tsx` (1 day)**
- Loads the experience, mounts `<VizEngineCanvas>`. Shows `<EngineLoading>` while assets load, `<EngineUnavailable>` if the engine fails.
- Acceptance: deep link works. Closing the modal returns to the project page.

### Phase 3 — Data layer

**3.1 — `lib/viz/vizProjects.ts` (1 day)**
- Joins `data/portfolio.ts` and the tour config. Returns `VizProject[]`.
- Add a thin `getVizProject(slug)` and `listVizProjects()`.
- Risk: `data/portfolio.ts` has 5 entries; only some have a panorama or model. The join must be opt-in: only projects that have a tour OR a model3d URL are eligible.
- Acceptance: `solarium-penthouse` (panorama + 9 hotspots) and `nordic-monolith` (panorama) both surface viztour. `bmw-i8` test model surfaces vizview.

**3.2 — `lib/viz/assetGuard.ts` (1 day)**
- Server-side helper: given a URL, HEAD-request it (or use Supabase `storage.from(...).exists()`), return boolean.
- Lets the project page decide which experiences are `available: true` without round-tripping on the client.
- Risk: HEAD requests can be slow if the bucket is slow. Mitigate by caching the result for 5 minutes.

**3.3 — Convert `app/api/storage` and `app/api/xr-links` to real Supabase (out of scope for this plan, flag as follow-up)**

### Phase 4 — DX hardening

**4.1 — Type the XR store and remove `any` (1 day)**
- Audit `components/xr/xr.store.ts`. The 416-line Zustand store has hidden coupling to `webxr-service` and `SessionStatus`. Find where these types actually live (likely `components/xr/hooks/webxr-service.ts`) and import them properly.

**4.2 — Add error boundaries around each engine adapter (1 day)**
- One `<ErrorBoundary>` per `<VizEngineCanvas>`. On error, show `<EngineUnavailable>` with a "Report this" CTA.

**4.3 — Add capability detection on first paint (1 day)**
- `useVizCapabilities` already exists in skeleton. Make it SSR-safe (only run on the client, return a stable default during SSR).

---

## 10. Out-of-scope follow-ups (flagged for next plan)

- Real Supabase-backed `app/api/storage` and `app/api/xr-links`.
- Asset-processing pipeline (Draco / KTX2 / Meshopt). Libraries are installed; the build script is not. This is a separate workstream.
- Migration of `lib/firebase.ts` (only used if anything in `app/` actually imports it — confirm in Phase 1.2).
- SEO/OG per project page.
- Pixel Streaming deep dive (the `app/xr-world/pixel-streaming` route is a separate concern; it streams UE5, not the in-house engines).
- Analytics dashboard in admin.

---

## 11. Validation plan (how we know each phase works)

- `pnpm build` green after every phase.
- `pnpm dev` smoke test on each renamed route.
- Manual WebGL memory check: open DevTools, navigate to `/projects/[slug]/experience/vizreality` five times, confirm heap stabilizes.
- Manual WebXR check (where hardware available): Quest browser launches `/projects/[slug]/experience/vizvr` into immersive-vr session.
- Mobile Safari check: `/projects/[slug]/experience/viztour` pans, hot spots respond, no console errors.
- Lighthouse on `/projects/[slug]` — Performance ≥ 80, Accessibility ≥ 90, SEO ≥ 90.
- 301 redirect audit: walk every URL that was reachable before Phase 1.4 and confirm it redirects correctly.

---

## 12. Open questions

1. **Project slug source of truth.** Today `data/portfolio.ts` has `slug` and the editable tour has `id` but no `slug`. They do not match. Confirm whether the editor should write back a `slug` to the tour config, or whether `getVizProject` does the join on `title.toLowerCase().replace(/\s+/g,'-')`.
2. **Auth on the project page.** The marketing `/portfolio/[id]` is public. The editor route requires NextAuth. The new `/projects/[slug]` should remain public. Confirm.
3. **Cloudflare / R2 status.** `app/api/storage` returns a hardcoded object. If R2/S3 is actually wired, that route is misleading. Decide: either wire it now or delete the route.
4. **Pixel Streaming retention.** Pixel Streaming is a real product area but lives outside the engine abstraction. Confirm scope: keep it on its own route, do not fold into `VizEngine`.

---

*End of plan. Implementation may begin after the user confirms and an implementation-capable agent picks this up.*
