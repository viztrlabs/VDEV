# Virtual Tour — Phase 2 Plan (Corrected)

> **Note:** This plan replaces the document titled "Virtual Tour Development — Phase 2 Strategic Plan." The original doc contains broken code samples, references nonexistent components, and assumes a monorepo that does not exist on disk. This plan is grounded in the actual repository state at `C:\Users\Arch_Viz\Desktop\VizTR\Dev\vdev` as of 2026-08-29.

---

## Current Reality (Verified From Code)

| Claimed | Actual |
|---|---|
| Monorepo with `apps/xr-world` and `packages/experience-engine` | `pnpm-workspace.yaml` has **no `packages:` field** — workspace is effectively broken. Root `package.json` is `ai-studio-applet`, not a monorepo. |
| `MarzipanoTour` class working | Class was written in this session, never compiled, contains API misuse (`Marzipano.ImageUrlSource.fromString()` signature is wrong for v0.10.2). |
| `useAudio` / `audio-service` / `MusicPlayer` complete | Written in this session, not integrated anywhere, not tested, no CSS imported into the app. |
| `tour-viewport.tsx`, `tour-navigation.tsx`, `tour-header.tsx`, `hotspot-panel.tsx`, `tour-config.ts`, `app/page.tsx`, `app/layout.tsx` exist | Files were written in this session under `apps/xr-world/`, but there is no monorepo wiring, no `tsconfig.json` for the new app, no way to run it. |
| Existing XR components (MarzipanoViewer, XRViewer, etc.) are the "Phase 1 foundation" | They live in `components/xr/` and are used by the existing `app/xr-world/page.tsx`. The new `apps/xr-world/` is a parallel universe, not an evolution. |

**Net effect:** The "Phase 1" the doc references is aspirational scaffolding created minutes ago in this conversation. Phase 2 must first stabilize that scaffolding before adding features.

---

## Goal (Restated)

Add genuine value on top of the working `app/xr-world` virtual tour without breaking:
- The existing `MarzipanoViewer` rendering in `app/xr-world/page.tsx`
- The existing 4-mode XR hub navigation
- The existing TypeScript build (`npx tsc --noEmit`)
- The existing 8-role RBAC and auth flows

---

## Out of Scope (Explicitly)

- Multi-app monorepo split (`apps/xr-world/` as a separate Next.js app)
- Migrating the existing `MarzipanoViewer.tsx` to the new `MarzipanoTour` class
- Backend: user preferences, analytics persistence, sharing endpoints
- Real WebRTC pixel streaming, real WebXR sessions, real Marzipano multi-resolution tile generation
- Hermes agent integration, Supabase migrations, CI/CD
- Marketing site changes, admin dashboard changes, CMS changes

---

## Phase 0 — Stabilize What Was Just Written (Prerequisite)

Must be done **before any Phase 2 feature work**, or everything downstream is built on sand.

1. **Fix `pnpm-workspace.yaml`** — add a real `packages:` block (or remove the file and inline `apps/xr-world` into the root as a `src/` subfolder).
2. **Decide the home for the new code:** either (a) absorb `apps/xr-world/lib`, `components`, `hooks` into the root app under a `xr-world/` folder, or (b) genuinely stand up a pnpm workspace. Document the decision.
3. **Fix `MarzipanoTour.loadScene`** — correct API is `Marzipano.ImageUrlSource.fromString(...)` is not a function; use `Marzipano.ImageUrlSource.fromString()` then `.fromEquirectangular(url, opts)` for single-image, or `Marzipano.CubeGeometry` for cubemaps. Add a smoke test that initializes against `app/xr-world/page.tsx`'s existing scene data.
4. **Wire `music-player.css`** into the actual app (either `app/globals.css` import or a CSS module).
5. **Run `npx tsc --noEmit`** and resolve the 33 pre-existing errors before adding more surface area.

**Verification:** `npx tsc --noEmit` returns 0 new errors; `next build` succeeds; the existing `/xr-world/virtual-tour` page still renders.

---

## Phase 2 — Ordered Task List

Each task is small, independently mergeable, and preserves the existing app.

### Task 1: Keyboard Navigation for MarzipanoViewer
**Files:** `components/xr/MarzipanoViewer.tsx` only.
**What:** Add `←`/`→` for yaw, `↑`/`↓` for pitch, `+`/`-` for zoom, `Home` to reset, `F` for fullscreen. Wire to the existing `marzipanoSceneRef.current.view()` and `viewerRef.current.requestFullscreen()`.
**Why first:** Highest user value, smallest blast radius, no dependencies.
**Verify:** Manual: load `/xr-world/virtual-tour`, press arrows, confirm view rotates.

### Task 2: Scene Transition Loading State
**Files:** `components/xr/MarzipanoViewer.tsx` only.
**What:** When `scene.id` prop changes, set `isLoading=true` until the new scene's first level is visible; show the existing `TourLoader` overlay. The `useEffect` dep array already includes `scene`, so the hook re-fires; the only addition is the `isLoading` gate.
**Verify:** Hotspot click triggers the loader, then the new scene appears.

### Task 3: Progress Indicator
**Files:** `components/xr/MarzipanoViewer.tsx` only.
**What:** Show a small "1 / 5" scene counter when a `totalScenes` prop is provided. This piggybacks on existing scene ID, not on a new state system.
**Verify:** Prop renders correctly; doesn't render when prop is absent.

### Task 4: `useViewHistory` Hook
**Files:** new `hooks/use-view-history.ts`; one-line import in `MarzipanoViewer`.
**What:** Bounded LRU (max 20) of recent scene IDs, `back()`/`forward()` actions, `canBack`/`canForward` flags. Pure logic, no UI.
**Verify:** Jest test for the hook; one component integration test.

### Task 5: Back/Forward Buttons in Viewport
**Files:** `components/xr/MarzipanoViewer.tsx` only.
**What:** Add two buttons to the existing controls overlay that call `useViewHistory` actions. Disable when not at boundary.
**Verify:** Manual click sequence; buttons enable/disable correctly.

### Task 6: Extract Tour Config from `data/pages.ts` `virtualTour` Block
**Files:** new `lib/tour-config-loader.ts`; read in `app/xr-world/page.tsx`.
**What:** Type the existing `servicePagesData.virtualTour` object strictly; validate it has the fields `MarzipanoViewer` expects (`id`, `name`, `url`, `type: '360'`, `hotspots[]`).
**Verify:** `tsc --noEmit` clean; existing page still works.

### Task 7: Tour Statistics (Read-Only)
**Files:** new `lib/tour-stats.ts`; one optional read in `MarzipanoViewer`.
**What:** `getStats(scenes, currentId)` returns `{ total, visited, current, percent }`. Renders only if a `showStats` prop is true. No persistence, no tracking — this is a derived view, not analytics.
**Verify:** Pure function test; manual toggle of `showStats`.

### Task 8: User Preferences — Local Only
**Files:** new `hooks/use-tour-preferences.ts` (zustand `persist` middleware, `localStorage` key `viztr.tour.prefs`).
**What:** `motionIntensity` ('off' | 'low' | 'high'), `autoRotateSpeed` (0–10), `defaultZoom` (0.5–2), `theme` ('dark' | 'system'). No network. No SSR read at render.
**Verify:** `jest` test for the store; manual: change pref, refresh, persists.

### Task 9: Preferences Panel
**Files:** new `components/tour/PreferencesPanel.tsx`; one toggle in `app/xr-world/page.tsx` toolbar.
**What:** Renders controls for the four prefs in Task 8. Pure UI; no backend.
**Verify:** Manual: open panel, change settings, close, refresh, settings persisted.

### Task 10: Share Link
**Files:** new `lib/tour-share.ts`; one button in `app/xr-world/page.tsx`.
**What:** Build a URL like `https://viztr.io/xr-world/virtual-tour?scene=terrace&yaw=0.5&pitch=0.1`. Encode current view from `marzipanoSceneRef.current.view()`. `navigator.share` if available, else `navigator.clipboard.writeText`. No URL shortener, no analytics.
**Verify:** Manual: click share, URL contains current scene and view params.

### Task 11: Read URL Params on Mount
**Files:** `app/xr-world/page.tsx` and `components/xr/MarzipanoViewer.tsx`.
**What:** Parse `?scene=...&yaw=...&pitch=...` after `MarzipanoViewer` reports `onReady`. Apply via `view.setYaw/setPitch`. Guard against invalid values (clamp to allowed ranges, default to 0).
**Verify:** Manual: open shared URL, lands on correct scene and view.

### Task 12: Hotspot Tooltip on Hover
**Files:** `components/xr/MarzipanoViewer.tsx` only.
**What:** The existing hotspot DOM element already has a `title` attribute. Replace it with a positioned `<div>` that fades in on `mouseenter`/`focus`. No new state system — reuse `hotspotVisible`.
**Verify:** Manual hover on a hotspot; tooltip appears after ~150ms.

### Task 13: Accessibility Audit Pass
**Files:** `components/xr/MarzipanoViewer.tsx`, `app/xr-world/page.tsx`.
**What:** Add `aria-label` to all icon-only buttons, `role="application"` on the viewer container, focus visible styles, skip-to-content link.
**Verify:** `axe-core` smoke test via `jest-axe` on the page.

### Task 14: Performance — Reduce Initial Bundle
**Files:** `components/xr/MarzipanoViewer.tsx` only.
**What:** Confirm `import('marzipano')` is dynamic (it is). Add `loading="lazy"` to the `<img>` if any. Confirm no Three.js / PlayCanvas is imported in this subtree.
**Verify:** `next build` output shows the Marzipano chunk is separate and route-bounded.

### Task 15: Error Boundary
**Files:** new `components/xr/ViewerErrorBoundary.tsx`; wrap `MarzipanoViewer` in `app/xr-world/page.tsx`.
**What:** Class component with `getDerivedStateFromError`. On error, render the existing "Failed to load tour" UI with a "Reload" button. Logs to `console.error` only.
**Verify:** Force-throw in `MarzipanoViewer`; boundary catches and renders fallback.

### Task 16: Documentation
**Files:** new `apps/xr-world/README.md` (or `xr-world/README.md` after Task 0 decision).
**What:** How to add a new scene (the `servicePagesData.virtualTour` shape), how to test, known limits.
**Verify:** A new dev can add a scene from the README alone.

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Phase 0 reveals the new files don't compile | Gate all of Phase 2 behind `npx tsc --noEmit` clean. |
| Feature creep reintroduces the MarzipanoTour API bug | All view manipulation in Phase 2 goes through the existing `marzipanoSceneRef.current.view()` path, not through new abstractions. |
| `localStorage` access breaks SSR | All preference reads are inside `useEffect` or `persist`'s `skipHydration`. |
| URL param injection | Clamp yaw/pitch to `[-π, π]`; whitelist scene IDs against the loaded config before switching. |
| Bundle bloat from new components | `next build` size check is part of the verification for Task 14. |

---

## Out-of-Scope Reminders (Do NOT Pull In)

- "Tour statistics" must not become analytics — Task 7 is a derived view only.
- "User preferences" must not become a backend — Task 8 is `localStorage` only.
- "Share" must not become a shortener service — Task 10 is a URL builder.
- No new dependencies in `package.json` for Phase 2. If a task seems to need one, stop and re-evaluate.

---

## Validation Plan (Per Task)

For every task:
1. `npx tsc --noEmit` returns 0 new errors.
2. `npx next build` succeeds.
3. Manual smoke: load `http://localhost:3000/xr-world/virtual-tour`, exercise the new feature, confirm the existing flow (panorama loads, hotspots click, zoom works) still works.
4. If the task adds a hook or pure function, add a `jest` test under `__tests__/`.

---

## Open Question (Blocking)

I am stopping here to ask one question before writing the final implementation-ready plan. See `question` tool output.