# Plan — Marzipano Importer Integration (Round-Trip) into VizTR Virtual Tour Editor

> **Scope (locked from user):** Round-trip ZIP ↔ editor. Cube-format imports rejected, only equirectangular. Hotspot coords bridged via equirect approximation.
> **Integration target:** the existing `app/xr-world/virtual-tour/editor` page (Marzipano 0.10.2 + React 19 + Next.js 15) — not a new page.
> **Out of scope:** full UI port of the upstream tool, cube-tile rendering, server-side cube→equirect reprojection, persisting converted panoramas to the VizTR asset store.

---

## 0. What the upstream tool actually is (audit)

The repository at `https://github.com/archviz-rahul/marzipano-importer` (forked from `tunnaduong/marzipano-importer`, v1.0.0, 2025-11-07) is a single-page client-side web app:

- `index.html` — markup only, no framework, loads `marzipano-0.10.2/marzipano.js` as a `<script>` and `jszip.min.js` from CDN.
- `scripts/app.js` — the only JS file. Vanilla JS. Drives the entire editor: file input, panorama list, Marzipano init, hotspot modal, ZIP import, ZIP export, localStorage round-trip.
- `styles/app.css` — single CSS file.

The upstream data model is Marzipano's native cube-tile format with multi-resolution levels:

```ts
{
  name: string,
  scenes: [{
    id, name,
    levels: [{ tileSize, size, fallbackOnly? }],   // multi-resolution cube tiles
    faceSize: number,                                // 256..4096
    initialViewParameters: { pitch, yaw, fov },      // radians
    linkHotspots:  [{ yaw, pitch, rotation, target }],   // rad, target = sceneId
    infoHotspots:  [{ yaw, pitch, title, text }],
  }],
  settings: { mouseViewMode, autorotateEnabled, fullscreenButton, viewControlButtons }
}
```

This is **not** isomorphic to the VizTR editor's data model (`data/tour-config.ts`):

| Upstream (importer) | VizTR (editor) |
|---|---|
| `levels[]` of cube tiles, 6 faces | single `panoramaUrl` (equirect image) |
| hotspot `{ yaw, pitch }` in radians | hotspot `{ xPercent, yPercent }` in 0–100 |
| `linkHotspots[]` + `infoHotspots[]` (two types) | single `defaultHotspots[]` with 8 type union (incl. `room_link`, `info`, `metadata`) |
| `settings.mouseViewMode: 'drag'\|'qtvr'` | no equivalent (currently hard-coded `drag`) |
| scenes per tour → `data.js` or `app-data.json` inside ZIP | `rooms: TourRoom[]` inside a single JSON document at `data/tour-config.ts` / `lib/toursRepo.ts` |

The Marzipano **library** itself is already at `node_modules/marzipano@0.10.2` (see `package.json:43`) and is the same version the upstream tool vendors (`scripts/marzipano-0.10.2/`). The CDN dependency in `index.html` is for offline-friendliness in the upstream tool, not because the library is missing.

`JSZip 3.10.1` is **not** in `package.json`. Adding it is the only required dependency.

---

## 1. Decisions (do not re-litigate)

| Decision | Source |
|---|---|
| Scope = round-trip only (ZIP import + ZIP export) | user |
| Import format = equirectangular only; reject cube | user |
| Hotspot bridge = equirect approximation `yaw/pitch ↔ xPercent/yPercent` | user |
| Reuse existing `app/xr-world/virtual-tour/editor` as integration target | this plan |
| Reuse existing `lib/toursRepo.ts` and `lib/editorStore.ts` (created in prior refactor) | this plan |
| Add `jszip` as a project dependency (do not load from CDN) | this plan |

---

## 2. Architecture (the central diagram)

```
                         ┌────────────────────────────────────┐
                         │   Virtual Tour Editor (existing)   │
                         │   app/xr-world/virtual-tour/editor │
                         └────────────────┬───────────────────┘
                                          │
              ┌───────────────────────────┼───────────────────────────┐
              │                           │                           │
   ┌──────────▼─────────┐    ┌────────────▼────────────┐   ┌──────────▼─────────┐
   │  MarzipanoImpor-   │    │   MarzipanoExporter     │   │  Existing editor   │
   │  ter (new)         │    │   (new)                 │   │  state + UI        │
   │  lib/marzipano/    │    │   lib/marzipano/        │   │  (no changes       │
   │  importer.ts       │    │   exporter.ts           │   │   required)        │
   └──────────┬─────────┘    └────────────┬────────────┘   └────────────────────┘
              │                           │
              │  reads ZIP via JSZip      │  writes ZIP via JSZip
              ▼                           ▼
   ┌──────────────────────────────────────────────────────────────────┐
   │   jszip@3.10.1 (new dep, client-only)                            │
   └──────────────────────────────────────────────────────────────────┘
              │                           │
              ▼                           ▼
   ┌─────────────────────────┐   ┌──────────────────────────────────────┐
   │  TourConversion          │   │  CoordMapper (yaw/pitch ↔ xPct/yPct)│
   │  lib/marzipano/          │◄──┤  lib/marzipano/coords.ts            │
   │  conversion.ts           │   └──────────────────────────────────────┘
   └─────────────────────────┘
              ▲
              │  read/write
              │
   ┌──────────────────────────────────────────────────────────────────┐
   │   VizTR Tour Model                                              │
   │   data/tour-config.ts (TourRoom[], Hotspot)                     │
   │   lib/toursRepo.ts (Supabase + local store)                     │
   └──────────────────────────────────────────────────────────────────┘
```

The upstream tool is **not** a dependency. We do not clone or vendor it. We re-implement the same data-shape round-trip against the upstream ZIP format. The only shared asset is the on-disk ZIP spec, documented in `EXPORT_FORMAT.md`.

---

## 3. Folder layout

```
lib/marzipano/
  types.ts            # MarzipanoImportFormat types (scene, hotspot, settings)
  coords.ts           # yaw/pitch ↔ xPercent/yPercent with documented precision
  conversion.ts       # MarzipanoImportFormat ↔ VizTR TourRoom[]
  importer.ts         # importTourFromZip(file) → {tour, warnings[]}
  exporter.ts         # exportTourToZip(tour) → Blob
  __tests__/
    coords.test.ts    # round-trip equality for non-pole positions
    importer.test.ts  # parses the upstream sample tour
    exporter.test.ts  # writes a valid upstream-shaped ZIP
components/editor/
  ImportTourButton.tsx (new)   # toolbar button + hidden file input
  ExportTourButton.tsx (new)   # toolbar button + filename prompt
```

JSZip is added as a project dep:
```bash
pnpm add jszip
```
(Version 3.10.1 to match the upstream tool's `cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js`.)

---

## 4. Data model (single source of truth)

`lib/marzipano/types.ts` mirrors the upstream schema (from `EXPORT_FORMAT.md`):

```ts
export interface MarzipanoLevel {
  tileSize: number;
  size: number;
  fallbackOnly?: boolean;
}

export interface MarzipanoLinkHotspot {
  yaw: number;        // radians, 0 = front, π/2 = right, π = back
  pitch: number;      // radians
  rotation: number;
  target: string;     // target sceneId
}

export interface MarzipanoInfoHotspot {
  yaw: number;
  pitch: number;
  title: string;
  text: string;
}

export interface MarzipanoScene {
  id: string;
  name: string;
  levels: MarzipanoLevel[];
  faceSize: number;
  initialViewParameters: { pitch: number; yaw: number; fov: number };
  linkHotspots: MarzipanoLinkHotspot[];
  infoHotspots: MarzipanoInfoHotspot[];
  // optional first-level URL — upstream tool doesn't emit this but data.js can
  // reference an equirect source. We accept it for forward compat.
  sourceUrl?: string;
}

export interface MarzipanoSettings {
  mouseViewMode: 'drag' | 'qtvr';
  autorotateEnabled?: boolean;
  autorotateSpeed?: number;
  fullscreenButton?: boolean;
  viewControlButtons?: boolean;
}

export interface MarzipanoTour {
  name: string;
  scenes: MarzipanoScene[];
  settings: MarzipanoSettings;
}
```

Importing a `data.js` requires us to evaluate the JS module. The format is `var data = {...}`. We do this safely with `new Function('return (' + body + ')')()` so the upstream file does not run in the page global scope. (See §6.)

---

## 5. Coordinate bridge (`lib/marzipano/coords.ts`)

The user picked the equirect-approximation strategy. Document the math, the edge cases, and the test cases in code so future devs know what to expect.

```ts
// Equirectangular projection. yaw ∈ [-π, π], pitch ∈ [-π/2, π/2].
// Mapping used by Marzipano and the upstream tool:
//   yaw = 0          → image center (x = 50%)
//   yaw = +π/2       → image right  (x = 100%)
//   yaw = -π/2       → image left   (x = 0%)
//   pitch = 0        → horizon      (y = 50%)
//   pitch = +π/2     → zenith       (y = 0%)
//   pitch = -π/2     → nadir        (y = 100%)

export function yawPitchToXYPercents(yaw: number, pitch: number): { x: number; y: number } {
  const x = ((yaw + Math.PI) / (2 * Math.PI)) * 100;
  const y = ((Math.PI / 2 - pitch) / Math.PI) * 100;
  return { x: clamp(x, 0, 100), y: clamp(y, 0, 100) };
}

export function xyPercentsToYawPitch(x: number, y: number): { yaw: number; pitch: number } {
  const yaw = (x / 100) * 2 * Math.PI - Math.PI;
  const pitch = Math.PI / 2 - (y / 100) * Math.PI;
  return { yaw, pitch };
}
```

**Precision note** (document in the file): the equirect approximation is exact for round-trip when the user does not edit. Edits inside VizTR move the hotspot in equirect `(x, y)`; re-export gives correct yaw/pitch. The user cannot move a hotspot to a literal sphere angle from inside VizTR — they move in screen percentages. This is by design and matches the spec.

Pole singularity: hotspots at pitch = ±π/2 collapse to a single line in equirect. The exporter already accepts the loss (no special handling needed).

---

## 6. Importer (`lib/marzipano/importer.ts`)

The contract:

```ts
import { importTourFromZip, ImportResult, ImportWarning } from '@/lib/marzipano/importer';

interface ImportResult {
  tour: TourConfig;          // VizTR's existing data/tour-config.ts shape
  marzipanoName: string;     // upstream tour.name (used as default project name)
  warnings: ImportWarning[]; // non-fatal issues, surfaced as toasts
}
interface ImportWarning {
  level: 'info' | 'warn';
  code:
    | 'cube_tiles_rejected'    // scene has > 1 level OR faceSize > 4096
    | 'hotspot_dropped_link'   // linkHotspot references unknown scene
    | 'hotspot_dropped_oversize' // yaw/pitch out of range
    | 'settings_partial';      // unrecognized settings keys ignored
  sceneId?: string;
  message: string;
}
```

### Step-by-step

1. **Open the ZIP with JSZip.** (Add `jszip` dep, use `JSZip.loadAsync(file)`.)

2. **Find the data file.** Look for, in order: `data.js`, `app-data.json`. If neither, return `ImportResult` with a single fatal error (the editor surfaces it as a toast and aborts).

3. **Parse `data.js` safely.** The file is JavaScript of the form `var data = {...}` or `window.appData = {...}`. We do **not** `eval` it. We use:
   ```ts
   const parsed = new Function('"use strict"; return (' + body + ');')();
   ```
   This is evaluated in a function scope (no globals) and returns the data literal. Document the security rationale in the file: this is the same trust level as the existing `/api/tour/upload` (user-uploaded file, we never execute it server-side, only client-side). Add a `// SECURITY: only call with user-supplied files, never with content fetched from untrusted origins` comment.

4. **Parse `app-data.json`** with `JSON.parse`.

5. **Validate.** Each scene must have `id`, `name`, `levels` (≥1), `faceSize`, `initialViewParameters`. Mirror the rules in `EXPORT_FORMAT.md` §"Validation Rules" but be lenient: missing `levels` becomes `{ tileSize: 256, size: 256, fallbackOnly: true }`; missing `initialViewParameters` becomes `{ pitch: 0, yaw: 0, fov: π/2 }`.

6. **Reject cube scenes.** A scene is cube if `levels.length > 1` OR `faceSize !== 256 && any level.size > 512` (the heuristic the upstream tool uses; documented). Cube scenes get a `cube_tiles_rejected` warning and **are skipped from the import**, not converted. Surface this clearly in the editor UI before the import is committed (see §9.2).

7. **Accept equirect scenes.** Heuristic: a single-level equirect scene is a single equirectangular image. We treat the **first level** as the source. We need the image URL. Two cases:
   - `data.js` references a pre-tiled equirect source at the project's CDN path. Upstream doesn't emit one. So in practice this is empty.
   - The user provided a single panorama image that lives in the ZIP under `tiles/<sceneId>/l1/u/0/0_0.jpg` etc. — also cube. Not usable.
   - The user provides a sidecar `tiles/<sceneId>/equirect.jpg` or `<sceneId>.jpg` at the ZIP root. Look for these filenames in order: `equirect.jpg`, `equirect.png`, `<sceneId>.jpg`, `<sceneId>.png`. If none, the scene is not importable (warning + skip).
   - To be useful, **also** accept a ZIP whose data references a remote `sourceUrl` we already have in storage. Out of scope for this round (see §10).

8. **Convert each scene → VizTR `TourRoom`.** Map fields:
   - `id` → `id`
   - `name` → `name` (truncate to 80 chars)
   - equirect URL → `panoramaUrl` AND `thumbnailUrl` (same URL)
   - `initialViewParameters.yaw` / `.pitch` → `initialYaw` / `initialPitch` (degrees, not radians)
   - `linkHotspots` → `defaultHotspots[]` with `type: 'room_link'`, mapping yaw/pitch via `coords.ts`. `target` must reference an imported scene; otherwise emit `hotspot_dropped_link` and drop.
   - `infoHotspots` → `defaultHotspots[]` with `type: 'info'`, `title: h.title`, `description: h.text`, `article: h.text`.
   - Drop the rest of the VTED fields (`featured`, `viewConstraints`, etc.) — they will use defaults.

9. **Map settings.** `mouseViewMode: 'qtvr'` is not currently a feature in VizTR's editor preview (only `'drag'` is wired). The `mouseViewMode` field exists on the `VtedSettings` type but the editor doesn't read it. We save it into a new top-level `tour.settings.marzipanoMouseViewMode` (use the existing `TourSettings` type, see `lib/tourSettings.ts`). All other settings → ignored with `settings_partial` warning.

10. **Return `ImportResult`.** The caller (the editor) decides whether to commit, preview, or surface warnings.

### 9.2 Preview before commit (UI behavior)

To avoid silently dropping scenes, the import flow has two steps:

- **Step 1 — Analyze.** Run `analyzeZip(file)` which returns counts: total scenes, equirect scenes, cube scenes, link hotspots, dropped hotspots. Show a summary modal: "Found 12 scenes. 8 will be imported (equirect). 4 skipped (cube format). Continue?"
- **Step 2 — Import.** On user confirm, run `importTourFromZip(file)` and replace the editor's `rooms` state via `useEditorStore.setRooms(...)`.

This is critical because the upstream tool's default output is cube. A naive "click import → 80% of scenes vanish" experience would be unacceptable.

---

## 7. Exporter (`lib/marzipano/exporter.ts`)

The contract:

```ts
import { exportTourToZip } from '@/lib/marzipano/exporter';

exportTourToZip(tour, options?: { tourName?: string }): Promise<Blob>;
```

Output structure (mirrors `EXPORT_FORMAT.md`):

```
tour.zip
├── data.js          // var data = { name, scenes, settings }
├── app-data.json    // same content as JSON, for tools that prefer JSON
└── (no tile files — out of scope for this round; the upstream tool is for
    importing pre-existing tours, not for shipping tiles from a different tool)
```

Field mapping (VizTR → Marzipano):

- `tour.rooms` → `scenes[]`.
  - `id` → `id` (must be a valid JS identifier; reject if not, fall back to `scene_${i}`).
  - `name` → `name`.
  - `initialYaw` (deg) / `initialPitch` (deg) → `yaw` (rad) / `pitch` (rad).
  - `defaultHotspots`:
    - `type === 'room_link'` with `targetRoomId` → `linkHotspots[]` with `target: targetRoomId`, `yaw` / `pitch` from `xPercent` / `yPercent` via `coords.ts`.
    - `type === 'info'` (or any with `article` non-empty) → `infoHotspots[]` with `title: h.title`, `text: h.description || h.article`.
    - Other types (`metadata`, `image`, `video`, `audio`, `link`) → `infoHotspots[]` with `text: JSON.stringify(h)` so nothing is silently lost. (Round-trip will widen these when the upstream tool is extended; for now they are best-effort.)
  - **Skip `levels[]` and `faceSize` in the exported JSON.** The upstream tool requires these; we emit placeholder values `{ tileSize: 256, size: 256, fallbackOnly: true }` and `faceSize: 256`. The exported ZIP is a "tour manifest" intended for documentation or future round-trip; it is not directly viewable in Marzipano Tool without an equirect source file. Add a clear warning toast: "Exported as tour manifest. The upstream Marzipano Tool requires pre-rendered cube tiles to view. Use 'Export VizTR tour' to share the editable project."

- `settings`:
  - Hard-code `mouseViewMode: 'drag'`, `autorotateEnabled: false`, `fullscreenButton: true`, `viewControlButtons: true`. These match the upstream tool defaults; the user can edit them in the upstream tool after import.

File format: write both `data.js` (as `var data = ${JSON.stringify(payload, null, 2)};`) and `app-data.json` (as the same JSON without the `var data = ` wrapper). This matches the upstream tool's dual-format behavior.

The Blob is handed to a `URL.createObjectURL` and downloaded via an invisible `<a download>`.

---

## 8. Conversion helpers (`lib/marzipano/conversion.ts`)

Pure functions, no I/O. Single responsibility per function, so they are testable in isolation.

- `marzipanoSceneToTourRoom(scene, panoramaUrl, allSceneIds): { room, warnings }` — per-scene conversion.
- `tourRoomToMarzipanoScene(room): MarzipanoScene` — per-scene export.
- `pickEquirectSource(zip, sceneId): Promise<string | null>` — looks in the ZIP for an equirect image for the scene (see §6.7).
- `analyzeZip(file): Promise<{ sceneCount, equirectCount, cubeCount, hotspotCount, droppedLinkCount }>` — for the preview step in §6.9.

All four are pure or accept already-loaded JSZip instances, so they can be unit-tested without DOM.

---

## 9. Editor integration

### 9.1 New toolbar buttons in `app/xr-world/virtual-tour/editor/page.tsx`

The editor's header already has the `EditorHeader` component with `Save Tour`, `Undo`, `Redo` (per our prior refactor, see `components/editor/shell/EditorHeader.tsx`). Add two buttons in the same header:

- **Import** (folder-up icon) — opens a hidden `<input type="file" accept=".zip">`. On file change, runs `analyzeZip`. If `cubeCount > 0`, shows a confirmation modal with the summary. On confirm, runs `importTourFromZip` and commits via `useEditorStore.setRooms(rooms)`. Toasts: `"Imported X scenes, skipped Y cube scenes."` (warn) or `"Import failed: <reason>"` (error).
- **Export (Marzipano)** (folder-down icon) — runs `exportTourToZip(rooms)` and triggers a download. Filename: `${tourName || 'tour'}-marzipano-${YYYYMMDD-HHmm}.zip`.

Both buttons are disabled if `loading === true` or `saving === true`.

The buttons live in `EditorHeader.tsx`. New props: `onImportTour: () => void; onExportTour: () => void;`. The page passes closures that wire the file input + handlers. The hidden file input lives in the page (because it needs the actual handler) and is triggered by a ref.

**Reason for the page-level input:** EditorHeader is a memoized presentation component. Keeping the file input in the page lets us reuse the existing toast / error state without expanding the header's prop surface.

### 9.2 Cube-preview modal

A small modal component `components/editor/ImportPreviewModal.tsx`. Shown when the analysis step detects at least one cube scene. Displays:

- "We found N panoramas in this tour."
- "✓ M equirectangular scenes will be imported."
- "✗ K cube-tile scenes will be skipped (not supported by VizTR)."

Actions: `[Cancel]` / `[Import M scenes]`.

### 9.3 State transitions

Import flow is **explicit** and **reviewable**:
1. User clicks Import.
2. File picker opens. User selects ZIP.
3. Analysis runs. Toast on fatal errors (not a ZIP, no data file, etc.).
4. If mixed: preview modal. Else: skip the modal and go directly to step 5.
5. `importTourFromZip` runs.
6. `useEditorStore.setRooms(result.tour.rooms)` replaces the editor state. `saved` flag is set to `false` (unsaved changes), undo history is cleared (the imported tour is the new baseline).
7. Toasts: one info toast per warning, one success toast with scene count.

Export flow:
1. User clicks Export (Marzipano).
2. `exportTourToZip(rooms)` runs.
3. Browser download triggered.
4. Toast: `"Exported tour-name-marzipano-…zip"`.

### 9.4 What we deliberately do NOT change

- The existing `useEditorStore` (Zustand + zundo) keeps its current shape. Import is a one-shot `setRooms`. Undo history is intentionally cleared on import (the imported tour is a new baseline, not a delta).
- The Marzipano `PanoramaPreview` component (`components/editor/PanoramaPreview.tsx`) keeps rendering equirect images exactly as today.
- The `app/api/tour` and `app/api/tour/settings` routes are unchanged. The imported tour saves via the existing `Save Tour` button.

---

## 10. Out of scope (flagged for follow-up)

- **Cube-format support.** Rejecting cube is the user's choice. Future work: a Sharp / cube→equirect reprojection endpoint under `/api/tour/reproject`. Out of this round.
- **Tile export.** `exporter.ts` emits a manifest-only ZIP. Future work: render the equirect image to a 6-face cube at upload time and pack the result.
- **Carrying yaw/pitch alongside xPercent/yPercent.** User chose the equirect approximation. Future work: a `VtedHotspot.legacyCoords?: { yaw, pitch }` extension.
- **`mouseViewMode: 'qtvr'` in the editor.** The upstream tool supports QTVR; VizTR's `MarzipanoViewer` does not (it uses `mouseViewMode: 'drag'`). Future work: wire the existing Marzipano `qtvr` config through the editor.
- **Importing the upstream tool's UI wholesale.** User chose round-trip only. The upstream `index.html` + `scripts/app.js` are not in this codebase and we do not vendor them.
- **Cloud-storage round-trip.** `app/api/storage` and `app/api/xr-links` are still mocked (per the prior plan). The exporter writes a Blob in-memory; nothing is uploaded.

---

## 11. Validation plan (how we know each phase works)

### Build & typecheck
- `pnpm build` green after every phase.
- `pnpm lint` clean for the new files (the existing lint allowlist is fine).
- `pnpm test` passes; new tests added for `coords`, `importer`, `exporter`.

### Unit tests
- `coords.test.ts`: round-trip equality for known good values. Document pole cases.
- `importer.test.ts`: parse the upstream sample tour in `examples/`. Assert the expected number of equirect scenes, expected number of dropped cube scenes, expected hotspot count.
- `exporter.test.ts`: export a fixture tour, re-parse the resulting ZIP, assert the round-trip preserves all scene IDs, hotspot counts, and yaw/pitch values within `1e-6` radians.

### Manual / smoke
- Open the editor, click Import, select a real upstream-exported tour with 5 cube scenes. Expect: 5 cube scenes, 0 imported, modal says "0 will be imported, 5 skipped". User clicks Cancel. Nothing changes.
- Open the editor, create 3 rooms, click Export (Marzipano). Open the resulting ZIP with `unzip -l`. Expect: `data.js` and `app-data.json`, no `tiles/`. Open `app-data.json` in a text editor. Expect: 3 scenes, xPercent/yPercent converted back to yaw/pitch.
- Round-trip: import a ZIP, export it, import the export, compare scene counts. Expect equal.

### Visual regression
- None required. The Marzipano `PanoramaPreview` already renders equirect images; this round doesn't touch it.

---

## 12. Risks & open questions

1. **JSZip size.** 3.10.1 is ~95KB minified. If bundle size becomes a concern, use `next/dynamic` to import the importer module only when the Import button is clicked. (The exporter is needed for the download, so it loads with the page.) Acceptable for now.
2. **`new Function` for parsing `data.js`.** Same security model as `eval` but with a private scope. Acceptable because the file is a user upload. If security review objects, add a vendored JSON-only path that rejects `data.js` (acceptable for the long term; the upstream tool is the only known emitter of `data.js`).
3. **Scene ID collision on round-trip.** If a user imports a tour, edits it, exports, then re-imports, the upstream-emitted scene IDs must match the VizTR-emitted ones. We use the existing VizTR scene ID verbatim. Document this.
4. **Hotspot yPercent edge cases.** A hotspot at exactly `yPercent: 0` is the zenith; `yPercent: 100` is the nadir. Upstream data could have hotspots at exactly these values, which round-trip cleanly. Poles are lossy in equirect but we don't need to handle them specially for v1.
5. **`autorotateSpeed`.** Not currently surfaced in the VizTR editor UI but the type exists in `VtedTourSettings`. The exporter writes the upstream default (0.5). Out of scope to wire the editor UI to it this round.
6. **Compressed asset uploads.** The current `/api/tour/upload` accepts one file at a time. Importing a ZIP could batch-upload all panoramas in parallel. Out of scope; the importer currently sets `panoramaUrl` to the same equirect URL for all rooms (which won't exist on the local server yet). The Import button shows a follow-up "Upload panoramas" prompt if no panorama URLs resolve. Document this UX choice in the editor's `loading` toast.

---

## 13. Ordered task list (for an implementation agent)

1. **Add `jszip` to `package.json`.** `pnpm add jszip`. Confirm build still passes.
2. **Create `lib/marzipano/types.ts`.** The schema in §4. Pure types, no logic. Add a JSDoc block referencing the upstream `EXPORT_FORMAT.md`.
3. **Create `lib/marzipano/coords.ts`.** The two functions in §5 + their unit tests in `__tests__/coords.test.ts`.
4. **Create `lib/marzipano/conversion.ts`.** The four pure helpers in §8. Add unit tests for the two that are non-trivial (`marzipanaSceneToTourRoom` and `tourRoomToMarzipanaScene`).
5. **Create `lib/marzipano/importer.ts`.** The flow in §6. Add a unit test that parses the upstream sample tour and asserts the expected outcome.
6. **Create `lib/marzipano/exporter.ts`.** The flow in §7. Add a round-trip unit test.
7. **Create `components/editor/ImportPreviewModal.tsx`.** Cube-warning modal. No state; props only.
8. **Extend `components/editor/shell/EditorHeader.tsx`.** Add `onImportTour` and `onExportTour` props, render two new icon buttons. Default: no-ops if not provided (keeps EditorHeader reusable for the client viewer page that has its own header).
9. **Wire the editor page.** In `app/xr-world/virtual-tour/editor/page.tsx`:
   - Add a hidden `<input ref={fileInputRef} type="file" accept=".zip" onChange={onFileSelected} />` in a fragment.
   - Add `onImportTour: () => fileInputRef.current?.click()` and `onExportTour: handleExport` closures.
   - Add `handleExport` that calls `exportTourToZip({ name: projectName, rooms })` and triggers a download.
   - Add `onFileSelected` that runs the analysis → preview modal → import flow. Wire `useEditorStore.setRooms`.
10. **Manual smoke test.** Per §11. Test the 3-scenario flow.
11. **Document the new feature** in `VirtualTourPhase2.md` or a new `VirtualTourPhase3.md` (don't create a doc without being asked, but flag it to the user).

---

*End of plan. Implementation can begin after the user confirms and an implementation-capable agent picks this up. Switch to a code-capable agent to apply the changes.*
