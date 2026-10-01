# Marzipano Full-Parity Addons for the Virtual Tour Builder — Design

**Date:** 2026-10-02
**Status:** Approved by user (design phase complete)
**Scope decision:** Tour Builder surface only (`/xr-world/virtual-tour/tour-builder`) plus the shared
public viewer (`/virtual-tour/[tourId]`) and the builder's preview mode.

## 1. Goal

Bring the tour builder and its viewer to full feature parity with Marzipano's own reference
implementation (`node_modules/marzipano/demos/sample-tour`) — multi-scene switching with
cross-fade, all hotspot types authorable and rendered, autorotate toggle, scene menu, gyroscope,
share/QR, info popups, per-scene view constraints — as **additive** features that do not disturb
anything currently working.

Explicitly in scope because it blocks every other feature: today the builder's authored hotspots
never reach the public viewer (see §3).

## 2. Constraints

- **Approach 1 (approved):** one shared Marzipano engine hook + additive feature modules +
  unified schema with back-compat. No rewrite of existing JSX.
- Existing surfaces are not rebuilt: only wiring points change.
- New npm dependencies allowed if small — **`qrcode` is the only planned addition**.
- No new database tables, no migrations. Persistence keeps going through `/api/tour`.
- UI matches the current builder theme: `bg-[#09090B]`, `border-[#27272A]`, `#3ECF8E` accent,
  `font-mono`, Lucide icons.
- Marzipano stays pinned at `0.10.2` (vendoring/forking is a separate workstream).
- Repo baselines from `AGENTS.md` apply: jest 15 failing tests / 11 failing suites; ~800 pre-existing
  `tsc --noEmit` errors; never run `pnpm run build` while the dev server runs — use
  `scripts/safe-build.ps1`; scope commits with explicit `git add <file>`.

### Non-goals

Cubemap geometry, little-planet / `StereographicView`, VR/WebXR button, snapshot, multi-language,
offline/kiosk. Also untouched: the legacy `/xr-world/virtual-tour/editor` surface and
`components/viewers/PanoramaViewer` + `ControlBar`.

## 3. Problem statement (current state)

| # | Issue | Evidence |
|---|---|---|
| 1 | Builder hotspots are dropped before the public viewer: `buildTourManifest` reads only `defaultHotspots` and filters on `xPercent`/`yPercent`, which builder scenes don't have | `lib/tourManifest.ts:76-77` |
| 2 | `manifestSceneToTourScene` collapses 12 hotspot types into 4 and overwrites authored `viewConstraints`/`autorotate*` with hardcoded defaults | `lib/tourManifest.ts:134,157-158` |
| 3 | Builder hotspots render as a static 2D overlay with a screen-relative formula that ignores camera orientation — markers don't track the panorama and are placed in the wrong spot | `components/tour-builder/PanoramaViewport.tsx:290-347,206-237` |
| 4 | `InspectorPanel` labels yaw/pitch inputs `unit="deg"` while the store holds radians | `components/tour-builder/InspectorPanel.tsx:604-622` |
| 5 | `TourViewer` tears down and rebuilds the whole viewer per scene, so `defaultTransition` never cross-fades | `components/xr/TourViewer.tsx:91-304` |
| 6 | View limiter passes `zoomMax` twice and ignores `zoomMin`/`top`/`bottom`/`left`/`right` | `components/xr/TourViewer.tsx:146-150` |
| 7 | Autorotate is a hand-rolled `setInterval` that dies permanently on first interaction | `components/xr/TourViewer.tsx:58-66,275-276` |
| 8 | No gyroscope, scene menu, share, or in-viewer controls beyond zoom/fullscreen | `components/xr/TourViewer.tsx:375-391` |
| 9 | Dead builder controls: toolbar buttons `info`/`gallery`/`model3d`/`startview`, shortcuts `i`/`l`/`r`/`a`/`p`, inspector buttons Upload Image / Upload Model / Reset Position / Reset to Current View | `components/tour-builder/Toolbar.tsx:25-28`, `ShortcutProvider.tsx:195-199`, `InspectorPanel.tsx:287-289,445-447,625-627,847-849` |
| 10 | `validateTour` flags `link` hotspots without `externalUrl` as errors, yet the viewport's navigation tool creates exactly that type | `ValidationPanel.tsx:57-59`, `PanoramaViewport.tsx:223` |

## 4. Architecture

Three layers of new code, added alongside existing files:

```
lib/tour-schema/
  index.ts               canonical read/write + unit contract (documented)
  compat.ts              legacy defaultHotspots <-> canonical hotspots converters
  __tests__/

components/tour-viewer/
  useTourEngine.ts       one Marzipano lifecycle hook (viewer, scenes, hotspots, view API)
  hotspotRenderers.tsx   DOM builders for all 12 hotspot types (mode: viewer | builder)
  HotspotPopup.tsx       typed popup (extracted from the public page)
  controls/
    ControlCluster.tsx   shared button wrapper (styling + aria)
    SceneMenu.tsx
    AutorotateToggle.tsx
    ZoomControls.tsx
    FullscreenControl.tsx
    GyroscopeControl.tsx
    ShareControl.tsx
  TourControls.tsx       composes the enabled controls into the existing bottom-right cluster

components/tour-builder/PanoramaViewport.tsx   rewired to useTourEngine, JSX preserved
components/xr/TourViewer.tsx                   rewired to useTourEngine, props backward compatible
```

Data flow:

```
tourClientStore (TourScene[], yaw/pitch radians)
        |  save: PUT /api/tour  -> rooms verbatim (unchanged)
        v
lib/tourManifest.buildTourManifest(rooms)      <-- single choke point, now lossless
        v
TourViewer(scenes, activeSceneId)  <-- public page + builder preview
        |
   useTourEngine -> Marzipano viewer / scene cache / hotspot DOM
        |
   controls/* (scene menu, autorotate, zoom, fullscreen, gyro, share)
```

### 4.1 Schema contract

Units are **not** normalized (that would break saved data); they are documented and enforced at the
boundaries:

| Field | Unit | Rule |
|---|---|---|
| `TourScene.initialYaw/Pitch/Fov` | degrees | unchanged |
| `TourHotspot.yaw` / `TourHotspot.pitch` | **radians** | canonical, unchanged |
| `ViewConstraints.top/bottom/left/right/zoomMin/zoomMax` | degrees | unchanged |

`lib/tour-schema/` exposes:

- `readHotspots(roomLike)` — returns canonical hotspots from either `room.hotspots` (yaw/pitch) or
  legacy `room.defaultHotspots` (xPercent/yPercent via `xyPercentsToYawPitch`).
- `toManifestHotspot(canonical)` — emits an object carrying **both** `yaw`/`pitch` and
  `xPercent`/`yPercent` (via `yawPitchToXYPercents`) so every existing reader keeps working.
- `degToRad` / `radToDeg` helpers used by the Inspector inputs.

### 4.2 Back-compat

Old saved tours carry `defaultHotspots` with `xPercent`/`yPercent`; new saves carry `hotspots` with
yaw/pitch. Both load. `buildTourManifest` tries `hotspots` first, falls back to `defaultHotspots`.
No migration, no schema version bump, no DB change.

## 5. Engine: `useTourEngine`

Signature (abridged):

```ts
useTourEngine(containerRef, {
  scenes: TourScene[];            // all scenes -> enables switching + cross-fade
  activeSceneId: string;
  mode: 'viewer' | 'builder';
  mouseViewMode: 'qtilt' | 'drag';
  renderHotspot?: (hs, api) => HTMLElement;   // defaults to hotspotRenderers
  onHotspotActivate?: (sceneId, hotspotId) => void;
  onViewChange?: (view) => void;
}): {
  status: 'idle' | 'loading' | 'ready' | 'error';
  progress: number;
  api: {
    getView(): { yaw; pitch; fov };
    setView(p: { yaw?; pitch?; fov? }): void;
    zoomBy(factor: number): void;
    screenToCoordinates(x, y): { yaw; pitch };
    coordinatesToScreen(yaw, pitch): { x; y };
    startAutorotate(): void;
    stopAutorotate(): void;
    setAutorotateEnabled(on: boolean): void;
    switchScene(id: string): void;
    destroy(): void;
  };
}
```

Behavior:

- Dynamic `import('marzipano')` once per mount; **one** `Marzipano.Viewer` per mount that survives
  scene changes.
- Scene cache `Map<sceneId, MarzipanoScene>` built lazily; switching uses
  `viewer.switchScene(next)` so the existing `defaultTransition: { duration: 500 }` produces a real
  cross-fade. Scenes destroyed on unmount.
- Source: `ImageUrlSource.fromTileUrl` when `scene.tileUrl`, else `ImageUrlSource.fromString` —
  unchanged. Multi-level `EquirectGeometry` levels unchanged.
- Limiter per scene: `RectilinearView.limit.traditional(faceSize, zoomMax·π/180, zoomMin·π/180)`
  with `top/bottom/left/right` from the authored `viewConstraints` (fixes issue 6).
- Spatial-alignment initial-view offset logic ported verbatim from `TourViewer.tsx:156-168`.
- Autorotate uses `Marzipano.autorotate({ yawSpeed, targetPitch: 0, targetFov: π/2 })` with
  `viewer.startMovement` / `stopMovement` / `setIdleMovement(3000, …)` — resumes 3s after the user
  stops interacting; the explicit toggle overrides the idle behavior.
- Keyboard navigation (arrows, `+`/`-`, `f`, `Esc`) ported unchanged; `a` toggles autorotate.
- WebGL context-loss recovery and `SharedExperienceContext` camera sync ported unchanged.

## 6. Hotspots

- `hotspotRenderers.tsx` maps every member of `HotspotType`
  (`navigation | info | image | gallery | video | audio | link | floor | model3d | splat | experience | custom`)
  to a DOM builder honoring the authored appearance fields (`icon`, `size`, `color`, `opacity`,
  `label`, `tooltip`, `animation`).
- Created via `ms.hotspots().create({ pitch, yaw, type: 'custom', create, destroy })`, so markers are
  projected by Marzipano and stay glued to the panorama.
- `mode: 'builder'` adds: selection ring, drag-to-reposition (pointer → `screenToCoordinates`,
  reproject on move), right-click context menu (existing items preserved), delete.
- `mode: 'viewer'` adds: click / Enter / Space → `onHotspotActivate`, ARIA `role="button"`,
  `tabIndex`, `aria-label` (existing behavior preserved), and event-propagation stopping for
  `touchstart/touchmove/pointer*/wheel` (from the sample tour) so markers don't fight the drag
  controls.
- Alignment markers keep rendering as amber dots (existing behavior, moved into the engine).

### Placement fix

`PanoramaViewport.handleClick` and both context-menu placement paths compute yaw/pitch from
`view.screenToCoordinates({ x, y })` instead of the screen-relative formula. The `connect` tool
passes the same coordinates to `ConnectorSystem`.

### Type correctness

`hotspot-navigation` (and the Toolbar's navigation entries) create `type: 'navigation'`, not
`'link'` (`PanoramaViewport.tsx:223`). `validateTour` treats `navigation` as valid without
`externalUrl` and still requires `externalUrl` for `link`.

## 7. Viewer chrome modules

All in `components/tour-viewer/controls/`, every button wrapped by `ControlCluster`
(bg `#18181B`/70, border `#27272A`, hover white, `aria-label`, `title`):

| Module | Behavior |
|---|---|
| `SceneMenu` | Toggleable scene list with thumbnails, current-scene highlight, prev/next arrows. Public page's existing header scene strip stays as is. |
| `AutorotateToggle` | On/off button bound to engine autorotate; state seeded from `scene.autorotateEnabled` |
| `ZoomControls` | Existing zoom in/out markup lifted verbatim; calls `api.zoomBy` |
| `FullscreenControl` | Existing fullscreen markup lifted verbatim |
| `GyroscopeControl` | `deviceorientation` (port of `demos/device-orientation`), iOS `DeviceOrientationEvent.requestPermission()`, graceful "not supported" toast when unavailable |
| `ShareControl` | Popover: copy page URL, copy an `<iframe>` embed snippet built from `window.location.origin + window.location.pathname`, QR image of the page URL rendered with `qrcode` (dynamically imported) |

`HotspotPopup` is extracted from `app/virtual-tour/[tourId]/page.tsx:205-247` unchanged and imported
by both the public page and the builder preview.

`TourViewer` props: `scene` remains **required and unchanged**; new optional `scenes`,
`activeSceneId`, `controls` (which modules to mount). When `scenes` is omitted the viewer uses
`[scene]` and `activeSceneId = scene.id`, i.e. exactly today's single-scene behavior with no scene
switching. `controls` defaults to the full set (scene menu, autorotate, zoom, fullscreen, gyro,
share); a module that can't run on the current device (gyro without `DeviceOrientationEvent`,
fullscreen without API support) still renders but reports why when activated.

## 8. Builder wiring

- **Toolbar** (`Toolbar.tsx:25-28`): `info`/`gallery`/`model3d` create their hotspot types;
  `startview` captures the current view as the scene start. "Add Hotspot" opens a type flyout
  listing all 12 types → `activeTool = 'hotspot-<type>'` → `handleClick` creates that type.
- **PanoramaViewport**: `handleClick` handles `hotspot-<type>`, `connect`, `startview`;
  `mode: 'builder'` hotspots; dead-path removal of the old overlay rendering block (290-347).
- **ShortcutProvider**: `i` → info hotspot, `l` → link hotspot, `r` → reset view,
  `a` → autorotate toggle, `p` → `onPreview` (no longer sets a phantom `preview` tool);
  `?` help modal updated to the real key list.
- **InspectorPanel**: yaw/pitch inputs convert deg↔rad at the boundary; Reset Position zeroes
  yaw/pitch; Reset to Current View reads the live view (engine publishes current view into a tiny
  module store `lib/tour-builder/viewportView.ts`); Upload Image / Upload Model open the file picker
  and POST to the existing `/api/tour/upload`.
- **Preview mode** (`TourBuilderShell.tsx:187-212`) mounts the shared viewer with the store's
  scenes so preview = visitor experience: cross-fade, working nav hotspots, popups, full control
  cluster. `Esc` exit already wired.

## 9. Public page changes

`app/virtual-tour/[tourId]/page.tsx` passes `scenes` + `activeSceneId` to `TourViewer` (for
cross-fade and the scene menu) and uses the extracted `HotspotPopup`. Header strip, galaxy map,
comments, and hotspot click routing stay as they are.

## 10. Testing & verification

**New unit tests**

- `lib/tour-schema/__tests__/compat.test.ts` — round-trip legacy `defaultHotspots` ↔ canonical
  `hotspots`; `xPercent/yPercent` derived values match `yaw/pitch`.
- `lib/tour-schema/__tests__/manifest.test.ts` — `buildTourManifest` preserves all 12 types,
  authored `viewConstraints` and `autorotate*`; `manifestSceneToTourScene` is lossless; legacy
  rooms still produce the same manifest as today.
- Placement math tests (screen ↔ coordinates) alongside the existing
  `lib/marzipano/__tests__/coords.test.ts`.

**Component tests** (follow the existing `jest.mock('marzipano')` pattern from
`components/editor/__tests__/PanoramaPreview.test.tsx`):

- `hotspotRenderers` produces a distinct, labeled element for each of the 12 types.
- Each control module renders with an accessible name; `GyroscopeControl` degrades to a toast when
  `DeviceOrientationEvent` is undefined.
- `PanoramaViewport` creates a hotspot of the requested type at the engine-provided coordinates.

**Baselines (do not "fix" unrelated failures):** jest 15 failing / 11 suites; `tsc --noEmit` ~800
errors — judge by a scoped `Select-String` filter on touched paths. Build only via
`scripts/safe-build.ps1`.

**Manual E2E checklist**

1. Builder: place each of the 12 hotspot types; markers track the panorama while dragging the view.
2. Builder: hotspots stay where they were placed when the camera moves; yaw/pitch inputs show
   correct degrees.
3. Save → public `/virtual-tour/[tourId]` shows every hotspot with the right type and behavior.
4. Nav hotspots cross-fade between scenes; scene menu and prev/next work; start view honored.
5. Autorotate toggles, pauses on drag, resumes after 3s; fullscreen; zoom; gyro on a mobile device;
   share popover copies link and renders a QR.
6. Preview mode (F5) shows the same chrome and behavior as the public page; Esc exits.
7. Legacy tour (saved with `defaultHotspots`) still renders.

## 11. Risks

| Risk | Mitigation |
|---|---|
| `TourViewer` serves the public path | Props stay backward compatible; existing JSX preserved; unit + component tests; manual E2E |
| WebGL memory growth from scene cache | Cache bounded by scene count; all scenes destroyed on unmount |
| Builder preview behaves differently from visitor view | Both mount the same component with the same props |
| `qrcode` adds bundle weight | Dynamic `import()` inside `ShareControl` only when opened |
| Marzipano 0.10.2 unmaintained | Pinned; no API beyond what 0.10.2 exposes (verified against `node_modules/marzipano/src`) |
