# Marzipano Full Parity — Implementation Plan (2026-10-02)

## Goal
Bring the VizTR virtual tour builder to full Marzipano feature parity (all 12 hotspot
types, cross-fade scene switching, scene menu, autorotate, gyroscope, share/QR, info
popups, view constraints) as **additive features** without disturbing working features.

## Architecture (approved Approach 1)
One shared Marzipano engine hook (`useTourEngine`) + additive feature modules +
unified schema with back-compat. No JSX rewrites of working features. Legacy editor +
`components/viewers/PanoramaViewer`/`ControlBar` untouched. Surface: Tour Builder
(`/xr-world/virtual-tour/tour-builder`), shared public viewer (`/virtual-tour/[tourId]`),
builder preview.

## Tech Stack
Next.js + React + zustand (immer/persist/temporal), Marzipano pinned `0.10.2`,
Tailwind (`bg-[#09090B]`, `border-[#27272A]`, `#3ECF8E`, `font-mono`, lucide-react),
jest + @testing-library (jsdom). **Only new dep: `qrcode`** (dynamic import; persist via
`PUT /api/tour`; no DB changes).

## Global Constraints
- **Unit contract:** `TourScene.initialYaw/Pitch/Fov` deg; `TourHotspot.yaw/pitch` rad; `ViewConstraints.*` deg.
- AGENTS.md baselines: jest **15 failing tests / 11 suites** (auth, leads, validation, `.kilo/worktrees/*`, playwright e2e); ~800 `tsc --noEmit` errors — judge via scoped `Select-String` filter. Never `pnpm run build` while dev runs — use `powershell -ExecutionPolicy Bypass -File scripts/safe-build.ps1`. Explicit `git add <file>` only. `docs/superpowers` gitignored → `git add -f`.
- **Verified Marzipano 0.10.2 API** (supersedes spec §5/§6 snippets):
  - Viewer ctor opts: `controls`/`stage`/`cursors` only — **no `defaultTransition`**.
  - `scene.switchTo({ transitionDuration }, done)` → `Viewer#switchScene(newScene, opts, done)`; opts key is **`transitionDuration`** (default 1000ms) — `Viewer.js:685`.
  - `scene.hotspotContainer().createHotspot(el, { yaw, pitch }, opts)`; `destroyHotspot(h)`; `listHotspots()` (**not `getAll`**) — `HotspotContainer.js:155,191`. `Hotspot.destroy()` removes the element (`Hotspot.js:94`).
  - `mouseViewMode` only `'drag'|'qtvr'` (`'qtilt'` throws "Unknown mouse view mode").
  - Viewer event emitter: `addEventListener`/`removeEventListener`, events `'viewChange'` + `'sceneChange'` (`Viewer.js:154,164,726`).
  - `viewer.scene()` returns current scene (`Viewer.js:484`); stage canvas appended synchronously in ctor (`Viewer.js:88`).
  - `setIdleMovement(timeoutMs, movement|null)` + `startMovement`/`stopMovement` (`Viewer.js:583,531,546`); user interaction auto-stops via Controls `'active'` handler (`Viewer.js:163`).
  - `Marzipano.autorotate({ yawSpeed, targetPitch, targetFov })` returns a movement fn (defaults `yawSpeed:0.1`).
  - `Marzipano.Dynamics` (index.js:64), `Marzipano.util.degToRad` (index.js:94), `Marzipano.dependencies.eventEmitter` (index.js:116) all exported.
  - `RectilinearView.screenToCoordinates`/`coordinatesToScreen` (`Rectilinear.js:793,739`).

## Task Order (dependencies)
1 → 2 → 3 (store) / 4 (types, independent) → 5, 6 (baseline hotfixes) → 7 (engine) → 8 (renderers) → 9 (wiring) → 10, 11, 12 (controls, parallel-safe) → 13 (TourViewer rewire) → 14 (popup) → 15 (viewport rewire) → 16 (toolbar) → 17 (inspector) → 18 (preview) → 19 (verify).

---

## Task 1 — `lib/tour-schema` compat layer + tests

**Files:** new `lib/tour-schema/index.ts`, `lib/tour-schema/compat.ts`, `lib/__tests__/tour-schema-compat.test.ts`

`lib/tour-schema/index.ts`:
```ts
import type { TourScene, TourHotspot, HotspotType } from '@/lib/tourClientStore';

export type { TourScene, TourHotspot, HotspotType };

export type ManifestHotspotKind = 'nav' | 'info' | 'metadata' | 'media' | 'link' | 'other';

export function kindForType(type: string): ManifestHotspotKind {
  switch (type) {
    case 'navigation':
    case 'floor':
      return 'nav';
    case 'metadata':
      return 'metadata';
    case 'info':
      return 'info';
    case 'link':
      return 'link';
    case 'image':
    case 'gallery':
    case 'video':
    case 'audio':
    case 'model3d':
    case 'splat':
      return 'media';
    default:
      return 'other';
  }
}
```

`lib/tour-schema/compat.ts`:
```ts
import { yawPitchToXYPercents } from '../marzipano/coords';
import { kindForType } from './index';
import type { TourHotspot } from './index';

export function readHotspots(scene: {
  hotspots?: TourHotspot[] | null;
  defaultHotspots?: any[] | null;
}): TourHotspot[] {
  if (scene.hotspots && scene.hotspots.length > 0) return scene.hotspots;
  const legacy = (scene.defaultHotspots ?? []) as any[];
  return legacy.filter((h) => h && h.id).map((h) => normalizeLegacyHotspot(h));
}

export function normalizeLegacyHotspot(h: any): TourHotspot {
  const t = h?.type;
  let type: string = t;
  switch (t) {
    case 'room_link':
    case 'teleport':
      type = 'navigation';
      break;
    case 'info_popup':
    case 'metadata':
      type = 'info';
      break;
    case 'image_overlay':
      type = 'image';
      break;
    case 'external':
      type = 'link';
      break;
    case 'product':
      type = 'model3d';
      break;
    case 'link':
      type = h.externalUrl ? 'link' : 'navigation';
      break;
  }
  return { ...h, type, title: h.title || 'Hotspot', description: h.description || '' } as TourHotspot;
}

export function toManifestHotspot(hs: TourHotspot): Record<string, unknown> {
  const { x, y } = yawPitchToXYPercents(hs.yaw ?? 0, hs.pitch ?? 0);
  return {
    ...hs,
    xPercent: Math.round(x * 10) / 10,
    yPercent: Math.round(y * 10) / 10,
    kind: kindForType(hs.type),
    targetRoomId: hs.targetSceneId,
  };
}
```

Tests (10): kindForType mapping (nav/info/metadata/link/media/other), readHotspots canonical preference, readHotspots legacy fallback + normalization, legacy type coercion (room_link/teleport→navigation, link→navigation unless externalUrl, external→link, product→model3d), toManifestHotspot emits both coordinate systems + spreads unknown fields + targetRoomId mapping.

---

## Task 2 — lossless manifest

**Files:** edit `lib/tourManifest.ts`; new `lib/__tests__/tour-schema-manifest.test.ts`

Edits:
1. Import `import { readHotspots, toManifestHotspot } from './tour-schema/compat';` (one direction — no cycles) and re-export `export type { ManifestHotspotKind } from './tour-schema';`
2. `buildTourManifest` hotspot chain (`:76-100`): replace manual field picking with:
```ts
const rawHotspots = readHotspots({ hotspots: (r as any).hotspots, defaultHotspots: r.defaultHotspots });
const hotspots: ManifestHotspot[] = rawHotspots
  .map((h: any) => {
    if (typeof h.yaw === 'number') return toManifestHotspot(h as TourHotspot);
    if (typeof h.xPercent === 'number' && typeof h.yPercent === 'number') {
      const { yaw, pitch } = xyPercentsToYawPitch(h.xPercent, h.yPercent);
      return toManifestHotspot({ ...h, yaw, pitch } as TourHotspot);
    }
    return toManifestHotspot({ ...h, yaw: 0, pitch: 0 } as TourHotspot);
  })
  .filter((h: ManifestHotspot) => h.kind !== 'nav' || (h.targetRoomId && idSet.has(h.targetRoomId!)));
```
3. Scene passthrough (`:102-112`): spread `...r` first (ManifestScene has `[key: string]: unknown`), keep canonical `panoramaUrl` + defaults — preserves `tileUrl`/`spatialAlignment`/`alignmentMarkers`/`autorotateEnabled`.
4. `manifestSceneToTourScene` (`:130-145`): spread `...h` and preserve the ORIGINAL type (`type: h.type as TourHotspot['type']`) instead of collapsing media→gallery.

Tests (5): unknown scene fields preserved; both coordinate systems emitted for canonical hotspots; legacy xPercent/yPercent conversion; original hotspot type preserved (video stays video); unknown hotspot fields spread.

---

## Task 3 — store `setScenes` normalization

**Files:** edit `lib/tourClientStore.ts:158-162`; new `lib/__tests__/tourClientStore-load.test.ts`

```ts
export function normalizeLoadedRoom(room: any): TourScene {
  const url = room.url ?? room.panoramaUrl ?? '';
  const hotspots = room.hotspots && room.hotspots.length > 0
    ? room.hotspots
    : ((room.defaultHotspots ?? []) as any[]).filter((h: any) => h && h.id);
  return { ...room, url, panoramaUrl: room.panoramaUrl ?? url, hotspots } as TourScene;
}
```
`setScenes` maps `scenes.map(normalizeLoadedRoom)` (single normalization choke point).

Tests (3): `panoramaUrl`→`url` for legacy saved rooms; unknown API fields (tileUrl, autorotateEnabled) preserved; `currentSceneId` = first loaded room.

---

## Task 4 — `types/marzipano.d.ts` corrections + compile probe

**Files:** rewrite `types/marzipano.d.ts` (all importers use `any` — breaking-safe); new `types/marzipano.api-probe.ts` (compile-only, not matched by jest).

Corrected d.ts (verified API): Viewer (`createScene`, `createEmptyScene`, `destroyScene`, `scene()`, `switchScene(scene, {transitionDuration}|null, done)`, `lookTo`, `startMovement`/`stopMovement`/`movement`, `setIdleMovement(timeout, movement|null)`, `breakIdleMovement`, `updateSize`, `addEventListener/removeEventListener('viewChange'|'sceneChange')`, `controls(){registerMethod/enableMethod/disableMethod}`, `destroy`); Scene (`switchTo`, `lookTo`, `startMovement`, `stopMovement`, `view()`, `viewer()`, `hotspotContainer()`, `destroy`); HotspotContainer (`createHotspot(el, {yaw,pitch}, opts?)`, `destroyHotspot`, `listHotspots`, `hasHotspot`, `domElement`, `destroy`); Hotspot (`setPosition`, `position`, `domElement`, `destroy`); RectilinearView (get/set `yaw/pitch/fov`, `fovRange()`, `screenToCoordinates`, `coordinatesToScreen`); `RectilinearView.limit.traditional`; `EquirectGeometry`; `ImageUrlSource.fromString/fromTileUrl` (statics); `autorotate`; `Dynamics`; `util.degToRad/radToDeg/clamp`; `dependencies.eventEmitter`; ViewerOptions (`mouseViewMode: 'drag'|'qtvr'`).

Probe (`types/marzipano.api-probe.ts`) asserts every call shape used by the app compiles: Viewer ctor + controls opts, source/geometry/limiter/view, `createScene`, `switchTo({transitionDuration}, cb)`, `switchScene(scene, {transitionDuration}, cb)`, `createHotspot(el, {yaw,pitch})`, `listHotspots`, view get/set + `fovRange`, `screenToCoordinates`, `coordinatesToScreen`, `setIdleMovement(3000, autorotate(...))`, `startMovement`, `stopMovement`, viewer events, `controls().registerMethod/enableMethod/disableMethod`, `scene()`, `updateSize`, `destroy`.

**Verify:** `pnpm exec tsc --noEmit 2>&1 | Select-String "types/marzipano"` — only probe/no new errors vs baseline.
**Commit:** `git add types/marzipano.d.ts types/marzipano.api-probe.ts` → `fix(types): corrected Marzipano 0.10.2 declarations`

---

## Task 5 — TourViewer baseline hotfix + regression test

**Files:** edit `components/xr/TourViewer.tsx`; new `components/xr/__tests__/TourViewer.test.tsx`

Edits (5 hunks):
1. `:109` `mouseViewMode: 'qtilt'` → `'drag'`
2. `:115` delete `defaultTransition: { duration: 500 },` (dead option)
3. `:189` `ms.switch();` → `ms.switchTo({ transitionDuration: 500 });`
4. `:206-265` replace both `ms.hotspots().create({type:'custom', create:…})` blocks: build element (named handlers, stored cleanup), then `ms.hotspotContainer().createHotspot(el, { yaw, pitch })`
5. `:74-82` cleanup: `ms.hotspotContainer?.().listHotspots?.().forEach(h => h.destroy?.())`; `ms.stop?.()` → `ms.stopMovement?.()`

Test asserts: `opts.controls.mouseViewMode === 'drag'`; first `switchTo.mock.calls[0][0]` equals `{ transitionDuration: 500 }`; hotspots via `createHotspot` with role=button/aria-label + radian coords; clean unmount. **These assertions must survive Task 13's rewire.**

---

## Task 6 — PanoramaViewport baseline hotfix + regression test

**Files:** edit `components/tour-builder/PanoramaViewport.tsx`; new `components/tour-builder/__tests__/PanoramaViewport-baseline.test.tsx`

Edits: `:72` `(await import('marzipano')).default` → `const mod = await import('marzipano'); const Marzipano: any = mod.default ?? mod;` (CJS-interop hardening); `:98` `ms.switch();` → `ms.switchTo({ transitionDuration: 300 });`

Test: initializes Marzipano, `switchTo.mock.calls[0][0]` equals `{ transitionDuration: 300 }`, no "Failed to load panorama" banner. Store seeded via `useTourStore.setState({ scenes: [room] })`.

---

## Task 7 — `useTourEngine` (lifecycle, scene cache, cross-fade)

**Files:** new `components/tour-viewer/useTourEngine.ts` + `components/tour-viewer/__tests__/useTourEngine.test.tsx`

Engine (full code in plan chat, 2026-10-02; summary of contract):
- `useTourEngine(containerRef, { scenes, activeSceneId, transitionDuration = 500, onSceneChange, onHotspotClick })` → `{ loading, progress, error, view, getViewer, getCurrentScene, lookTo, zoomBy, screenToCoordinates, setAutorotate, reload }`
- Viewer created with `{ controls: { mouseViewMode: 'drag', scrollZoom: true, scrollZoomSpeed: 0.3 } }`
- Lazy scene cache `Map<id, {ms, signature}>`; signature = url|tileUrl|initialYaw|initialPitch|initialFov|viewConstraints (NO hotspots — hotspots re-sync without scene recreation); signature change destroys + recreates
- Switch effect on `activeSceneId` change: `ensureScene` → `ms.switchTo({ transitionDuration }, done)` → `publishView()` + `onSceneChange` + autorotate from scene settings
- `viewer.addEventListener('viewChange', publishView)` at viewer level; canvas `webglcontextrestored` → `reload()` (listener attached in init — canvas exists synchronously)
- `ensureScene`: source (fromTileUrl if tileUrl else fromString), `EquirectGeometry` 5 levels, `RectilinearView.limit.traditional(1024, zoomMax, zoomMax)`, spatial-alignment quaternion yaw/pitch offsets, `initialFov` deg→rad
- `lookTo(params, {transitionDuration: 750})`; `zoomBy` clamps to `fovRange()`; `screenToCoordinates` container-relative px → `{yaw, pitch}`; `setAutorotate(enabled, speedDegPerSec)` → `setIdleMovement(3000, Marzipano.autorotate({ yawSpeed: (speed*π)/180, targetPitch: v.pitch(), targetFov: null }))` + `startMovement`; disabled → `setIdleMovement(3000, null)` + `stopMovement`
- Unmount: remove listener, `stopMovement`, `destroyScene` each cached scene, `destroy` viewer

Tests (harness component, not renderHook): viewer mouseViewMode 'drag'; initial switchTo `{transitionDuration: 500}`; lazy create + cross-fade on activeSceneId change; cache reuse on switch-back (no scene recreation); zoomBy clamps to fovRange; clean unmount destroy.

---

## Task 8 — `hotspotRenderers` (12 types, appearance, a11y, cleanup)

**Files:** new `components/tour-viewer/hotspotRenderers.ts` + `components/tour-viewer/__tests__/hotspotRenderers.test.tsx`

- `DOT_CLASS_BY_TYPE` (literal Tailwind classes — scanned from .ts): navigation/floor `bg-[#3ECF8E]`, info `bg-sky-400`, link `bg-amber-500`, image/gallery `bg-violet-400`, video `bg-rose-400`, audio `bg-orange-400`, model3d `bg-cyan-400`, splat `bg-lime-400`, experience `bg-fuchsia-400`, custom `bg-white`
- `ANIMATION_CLASS`: pulse/glow→`animate-pulse`, bounce→`animate-bounce`
- `applyAppearance`: size (16 × hs.size px), opacity, animation class
- `renderViewerHotspot(hs, onActivate?)`: `role=button`, `tabIndex=0`, aria-label `${title||type} hotspot`, `title=hs.tooltip`, colored dot + optional label (`hs.label ?? hs.title`), click+Enter/Space handlers with named cleanup stored as `__viztrCleanup`, click stopPropagation
- `renderAlignmentMarker({id,label,yaw,pitch})`: `role=img`, aria-label, amber dot (`bg-amber-500`), optional label
- `destroyHotspotElement(el)`: `__viztrCleanup?.()` + `el.remove()`

Tests (7): accessible button; all 12 types get colored dot; appearance fields (size 32px, opacity, animate-pulse, label text); click + Enter activation; click stopPropagation; alignment marker role/img + amber; destroy removes listeners + element.

---

## Task 9 — Engine hotspot sync + autorotate wiring

**Files:** edit `useTourEngine.ts` + append tests to `useTourEngine.test.tsx`

1. Import hotspotRenderers; add `hotspotElsRef = useRef<Map<string, {hotspot, el}[]>>(new Map())`
2. Hotspot sync effect (active scene only; re-syncs on list change; never recreates scene): destroy existing (`container.destroyHotspot(h)` + `destroyHotspotElement(el)`), then `createHotspot(el, { yaw: hs.yaw, pitch: hs.pitch })` for each `scene.hotspots` (with `onHotspotClick?.(scene.id, hs.id)`) and `scene.alignmentMarkers`
3. Unmount cleanup: iterate map → `destroyHotspotElement`
4. Switch done callback applies scene autorotate default: `setAutorotateState({ enabled: !!scene.autorotateEnabled, speed: scene.autorotateSpeed || 1 })`

Tests: engine hotspots created with radian coords + ARIA + click routes to onHotspotClick(sceneId, hotspotId); hotspot re-sync without scene recreation (destroyHotspot called, createScene count unchanged); disabled idle movement (null) registered for autorotateEnabled=false scene; `setAutorotate(true, 2)` → `Marzipano.autorotate` with `yawSpeed: (2π)/180` + `setIdleMovement(3000, fn)` + `startMovement`.

---

## Task 10 — `TourControls` (zoom, fullscreen, scene menu, autorotate toggle)

**Files:** new `components/tour-viewer/TourControls.tsx` + test

Props: `onZoomIn, onZoomOut, onToggleFullscreen, isFullscreen, autorotateEnabled, onToggleAutorotate?, scenes?, activeSceneId?, onSelectScene?`. Vertical cluster bottom-right; literal theme classes (`bg-[#18181B]/70`, `border-[#27272A]`, active `bg-[#3ECF8E]/20 border-[#3ECF8E]`); scene menu (ChevronUp) only when `scenes.length > 1`, outside-click + Escape close, `role=menu/menuitem`, active scene `text-[#3ECF8E]`; autorotate RotateCw/Pause with `aria-pressed`; Minimize/Maximize by isFullscreen. Tests (5): aria labels; callbacks fire; scene menu conditional + select + close on Escape; autorotate toggle aria-pressed.

---

## Task 11 — GyroscopeControl (device-orientation port)

**Files:** new `components/tour-viewer/GyroscopeControl.tsx` + test

Port of `marzipano/demos/device-orientation/DeviceOrientationControlMethod.js`: `createDeviceOrientationMethod(Marzipano)` — `Dynamics` for yaw/pitch, `window.deviceorientation` listener, `rotateEuler` (krpano matrix math, singularity handling), emits `'parameterDynamics'` `('yaw'|'pitch', dynamics)` on deltas, `__cleanup` removes listener. Component: toggle button (Smartphone icon, `aria-pressed`), states off/on/unsupported/denied, iOS 13+ `DeviceOrientationEvent.requestPermission()` gate, inline bubble (public page has no sonner Toaster). Registration: viewer wires engine `controls().registerMethod('deviceOrientation', …)` before first `enableMethod`. Tests: toggle on enables method; toggle off disables; unsupported bubble; parameterDynamics emitted from deviceorientation deltas.

---

## Task 12 — ShareControl + `qrcode`

**Install:** `pnpm add qrcode && pnpm add -D @types/qrcode`

**Files:** new `components/tour-viewer/ShareControl.tsx` + test

Props `{ tourId, tourName? }`. Share2 button opens dialog (`role=dialog`); URL `${origin}/virtual-tour/${tourId}`; QR via dynamic `import('qrcode')` → `QRCode.toCanvas(canvasRef.current, url, { width: 160, margin: 1 })` with inline "QR unavailable" on error; Copy button → `navigator.clipboard.writeText` + inline "Copied" (2s); close button + backdrop click. Tests: dialog opens + QR rendered with tour URL; copy + Copied feedback; close.

---

## Task 13 — Rewire `TourViewer` onto engine + `TourControls`

**Files:** edit `components/xr/TourViewer.tsx` (internal rewrite); touch `useTourEngine.ts` (add `getMarzipano()` to EngineApi)

Props stay compatible: `scene` required; new optional `scenes`, `activeSceneId`, `controls` (default true), `onSelectScene`. Engine wiring: `activeSceneId: activeSceneId ?? scene.id`, `transitionDuration: 500`. Keyboard nav ported (arrows ±5°, `+`/`=`/`-` via `engine.zoomBy`, `f` fullscreen, Escape exits fullscreen). Shared-context sync ported (`localUpdateRef` pattern; Marzipano→`setOrientation` on `engine.view`, sharedYaw/sharedPitch→view setters). Autorotate toggle state follows `scene.autorotateEnabled` on scene change; `toggleAutorotate` → `engine.setAutorotate(!on, scene.autorotateSpeed || 1)`. Loading/error overlay + Retry from engine (`engine.reload`). Controls: `TourControls` + `GyroscopeControl` (engine `getMarzipano` + lazy `registerMethod('deviceOrientation', createDeviceOrientationMethod(M))`) + `ShareControl`. Scene info chip kept.

**Task 5's test must pass unchanged** (drag/switchTo/createHotspot/ARIA/clean unmount).

---

## Task 14 — `HotspotPopup` extraction + public page scene menu

**Files:** new `components/xr/HotspotPopup.tsx` + `components/xr/__tests__/HotspotPopup.test.tsx`; edit `app/virtual-tour/[tourId]/page.tsx`

1. Extract popup JSX verbatim (`page.tsx:205-247`) into `HotspotPopup({ hotspot, onClose })` (title/description/images grid/external link/close button, all classes preserved); remove now-unused `ExternalLink` from page imports.
2. Page: `<HotspotPopup hotspot={popup} onClose={() => setPopup(null)} />`; wire Task 13 optional props: `scenes={manifest.scenes}` `activeSceneId={currentRoom?.id ?? null}` `onSelectScene={handleSelectScene}` (finds room by id → setCurrentRoom).

Tests: title/description/images/external link render; close button calls onClose.

---

## Task 15 — PanoramaViewport full rewire + navigation validation

**Files:** edit `components/tour-builder/PanoramaViewport.tsx`; new `__tests__/tour-builder/navigation-type-validation.test.ts`

1. Remove init effect + marzipano import → `useTourEngine(containerRef, { scenes, activeSceneId: roomId, transitionDuration: 300 })`
2. Zoom/Reset via `engine.getCurrentScene()?.view?.()` (same zoomMin/zoomMax clamp, `setYaw/setPitch/setFov`); `currentYaw/Pitch/Fov` derive from `engine.view`
3. **Placement via real unprojection** (handleClick + context menu): `engine.screenToCoordinates(e.clientX - rect.left, e.clientY - rect.top)` replaces the linearized `((x - 0.5) * 2 * Math.PI)` math
4. `TOOL_TYPES`: `hotspot-navigation`→`'navigation'` (not `'link'`), `hotspot-info`→`'info'`, `hotspot-link`→`'link'`, `hotspot-gallery`→`'gallery'`, `hotspot-model3d`→`'model3d'`; early-return `if (!TOOL_TYPES[activeTool] && activeTool !== 'connect') return;`
5. **Projected hotspot overlay** (PanoramaPreview pattern): per `engine.view` change, `coordinatesToScreen({ yaw: hs.yaw, pitch: hs.pitch })` → `Record<id, {x,y}|null>`; render only non-null with `left/top` px (keep selection ring/context menu/label)
6. Publish viewport view (deg) for the Inspector via `setViewportView` (Task 17)

**Task 6's baseline test must pass unchanged.**

Navigation validation test (new file — `__tests__/tour-builder/validation.test.tsx` is failing at baseline): `validateTour` flags `type:'navigation'` without `targetSceneId` (`h1-no-target`), accepts with target, still flags `link` without `externalUrl`.

---

## Task 16 — Toolbar flyout

**Files:** edit `components/tour-builder/Toolbar.tsx`; new `components/tour-builder/__tests__/Toolbar.test.tsx`

`ShortcutProvider` already wires `i/l/r/a/p` (`:186-202`) + help modal — no changes there. Toolbar: add `Link2/Sparkles/RotateCw/Crosshair/MoreHorizontal` imports; full tool list (select V, move M, hotspot H, connect C, info F, link L, gallery G, icon I, model3d 3, rotate R, alignment A, startview S); `PRIMARY_COUNT = 6` primary row; flyout behind "More tools" button (outside click + Escape) for the rest. Tests: primary select works; flyout exposes icon/alignment/startview; link in primary row; active tool highlighted (`text-[#3ECF8E]`).

---

## Task 17 — InspectorPanel fixes

**Files:** new `lib/tour-builder/viewportView.ts`; edit `components/tour-builder/InspectorPanel.tsx`; new `__tests__/tour-builder/inspector-position.test.ts`

1. `viewportView.ts`: `setViewportView({yaw,pitch,fov})` / `getViewportView()` deg store
2. Hotspot Position fields (`:604-622`): display deg (`(hotspot.yaw * 180) / Math.PI`), write rad (`(v * Math.PI) / 180`) — store is radians; same wrap for any `directionYaw/directionPitch` inputs (grep first)
3. Reset Position (`:625-627`): `onClick={() => handleHotspotUpdate({ yaw: 0, pitch: 0 })}`
4. Reset to Current View (`:847-849`): `getViewportView()` → `updateScene(room.id, { initialYaw, initialPitch, initialFov })` (room fields already deg)
5. Upload Image (`:287-289`) / Upload Model (`:445-447`): hidden file input → `POST /api/tour/upload` (response `{ url, filename, tileUrl, tiles }`), inline/sonner error; image → `onUpdate({ imageUrl, tileUrl })`, model (`.glb/.gltf`) → `onUpdate({ modelUrl })`

Tests: stored radian yaw (π/4) displays as 45°; editing to 90° stores `Math.PI/2` in the store.

---

## Task 18 — Builder preview mounts the shared viewer

**Files:** edit `components/tour-builder/TourBuilderShell.tsx`

1. `const TourViewer = dynamic(() => import('@/components/xr/TourViewer'), { ssr: false });` + manifest imports
2. Preview branch (`:187-212`): build manifest once via `useMemo`; derive `previewScene` (selected room via `manifestSceneToTourScene`) and the full scene list; replace `PanoramaViewport` with `<TourViewer scene={previewScene} scenes={allScenes} activeSceneId={selectedRoomId} onSelectScene={setSelectedRoomId} />`

---

## Task 19 — Verification + wrap-up

1. Scoped tsc: `pnpm exec tsc --noEmit 2>&1 | Select-String "components/xr|components/tour-viewer|components/tour-builder|lib/tour-schema|lib/tourManifest|lib/tourClientStore|lib/tour-builder|types/marzipano"` — zero new errors vs same-path baseline
2. Jest vs baseline: `pnpm exec jest` stays at 15 failing / 11 suites; all new suites pass
3. Build: `powershell -ExecutionPolicy Bypass -File scripts/safe-build.ps1`
4. Manual checklist (dev :3000): public tour `5a6369bf-a2ba-4a94-b3ac-da5e4bb9114e` ≥1 canvas, no `qtilt`/`ms.switch` errors; 12 hotspot types + nav/popup/link clicks; cross-fade; scene menu + strip; autorotate toggle/interrupt/resume; builder tour `911be3c8-…` (18 rooms) loads (no "No panorama image URL set"), placement lands at world position, navigation validates after target assignment, preview mounts shared viewer; Share QR + copy; gyroscope unsupported bubble on desktop
5. Docs: sync `docs/visual-tour/artist-workflow-guide.md` if it documents hotspot types/controls
