# SuperSplat Editor Integration Plan

**Project:** VizTR XR World - Gaussian Splat Editor  
**Target:** Replicate https://superspl.at/editor functionality locally  
**Location:** `C:\Users\Arch_Viz\Desktop\VizTR\Dev\vdev`  
**Created:** 2026-09-03

---

## Phase Overview

| Phase | Duration | Focus | Deliverable |
|-------|----------|-------|-------------|
| **Phase 0** | Day 1 | Dependency Alignment | package.json, rollup config, tsconfig |
| **Phase 1** | Days 2-5 | Core Engine Port | 27 SuperSplat source files → `src/splat-editor/` |
| **Phase 2** | Days 6-8 | React UI Components | 12+ editor panels in `components/editor/splat/` |
| **Phase 3** | Days 3-4 (parallel) | State & Data Layer | Zustand store, Supabase integration |
| **Phase 4** | Days 9-10 | Editor Pages & Routing | `/xr-world/gaussian-splat/editor` + admin route |
| **Phase 5** | Days 11-12 | Operational Setup | Build scripts, static assets, COOP/COEP |
| **Phase 6** | Days 13-15 | Feature Parity & Testing | All tools, export, shortcuts, i18n |

**Total Estimate:** 15 working days

---

## Phase 0: Dependency Alignment (Day 1)

### Tasks

- [ ] Add SuperSplat dependencies to `package.json`
- [ ] Create `rollup.config.splat.mjs` for editor bundle
- [ ] Create `tsconfig.splat.json` for editor TypeScript
- [ ] Update `next.config.mjs` with COOP/COEP headers + WASM support
- [ ] Copy static assets (webp.wasm, locales) to `public/splat-editor/`
- [ ] Run `pnpm install` and verify no peer dependency conflicts

### Dependencies to Add

```json
{
  "dependencies": {
    "@playcanvas/pcui": "^6.1.4",
    "@playcanvas/splat-transform": "^3.3.3",
    "i18next": "^26.4.0",
    "i18next-browser-languagedetector": "^8.2.1",
    "i18next-http-backend": "^4.0.1",
    "mediabunny": "^1.55.2"
  },
  "devDependencies": {
    "@playcanvas/eslint-config": "^2.1.0",
    "@rollup/plugin-alias": "^6.0.0",
    "@rollup/plugin-image": "^3.0.3",
    "@rollup/plugin-json": "^6.1.0",
    "@rollup/plugin-node-resolve": "^16.0.3",
    "@rollup/plugin-terser": "^1.0.0",
    "@rollup/plugin-typescript": "^12.3.0",
    "@types/wicg-file-system-access": "^2023.10.7",
    "@typescript-eslint/eslint-plugin": "^8.68.0",
    "@typescript-eslint/parser": "^8.68.0",
    "@webgpu/types": "^0.1.71",
    "autoprefixer": "^10.5.4",
    "concurrently": "^10.0.5",
    "cross-env": "^10.1.0",
    "eslint": "^10.9.1",
    "eslint-import-resolver-typescript": "^4.4.5",
    "globals": "^17.11.0",
    "postcss": "^8.5.26",
    "rollup": "^4.63.0",
    "rollup-plugin-scss": "^4.0.1",
    "sass": "^1.103.1",
    "serve": "^14.2.6",
    "tslib": "^2.8.1",
    "typescript": "^6.0.3"
  }
}
```

### Rollup Config (`rollup.config.splat.mjs`)

```javascript
import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import scss from 'rollup-plugin-scss';
import terser from '@rollup/plugin-terser';
import image from '@rollup/plugin-image';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  input: 'src/splat-editor/main.ts',
  output: {
    file: 'public/splat-editor/bundle.js',
    format: 'esm',
    sourcemap: true,
    name: 'SuperSplatEditor'
  },
  plugins: [
    alias({
      entries: [
        { find: 'playcanvas', replacement: path.resolve(__dirname, 'node_modules/playcanvas') }
      ]
    }),
    resolve({ browser: true, preferBuiltins: false }),
    json(),
    image(),
    scss({
      output: 'public/splat-editor/bundle.css',
      sass: require('sass')
    }),
    typescript({
      tsconfig: './tsconfig.splat.json',
      sourceMap: true
    }),
    terser({ compress: { ecma: 2020 }, format: { comments: false } })
  ],
  external: []
};
```

---

## Phase 1: Core Engine Port (Days 2-5)

### Directory Structure

```
src/splat-editor/
├── main.ts                      # Bootstrap
├── editor.ts                    # Core event registration
├── pc-app.ts                    # Minimal PlayCanvas app
├── scene.ts                     # Scene management
├── render.ts                    # Rendering pipeline
├── splat.ts                     # Splat data model
├── splat-state.ts               # Per-splat state
├── edit-history.ts              # Undo/redo
├── edit-ops.ts                  # Operations
├── command-queue.ts             # Async queue
├── events.ts                    # Event bus
├── data-processor/              # GPU compute
├── projected-splat-renderer.ts  # Projected renderer
├── camera.ts                    # Camera controller
├── camera-poses.ts              # Camera poses
├── tools/                       # 13 tools
├── ui/                          # pcui-based UI (will wrap in React)
├── shaders/                     # WGSL shaders
├── file-handler.ts              # Import/export
├── publish.ts                   # Publish integration
├── preferences.ts               # User prefs
├── serializer.ts                # .splat/.ply serialization
├── doc.ts                       # Document model
├── doc-instances.ts             # Multi-doc support
├── sequence.ts                  # Timeline/animation
├── timeline.ts                  # Timeline data
├── shortcut-manager.ts          # Keyboard shortcuts
├── index-ranges.ts              # Selection index ranges
├── picker.ts                    # GPU picking
├── transform.ts                 # Transform math
├── transform-handler.ts         # Gizmo handling
├── entity-transform-handler.ts  # Entity transform
├── splats-transform-handler.ts  # Splats transform
├── transform-palette.ts         # Transform presets
├── pivot.ts                     # Pivot manipulation
├── sh-utils.ts                  # Spherical harmonics
├── color-grade.ts               # Color grading
├── color-palette.ts             # Color palette
├── spherical-metadata.ts        # Spherical metadata
├── gaussian-instances.ts        # Instance data
├── splat-centers.ts             # Centers computation
├── splat-surface-pick.ts        # Surface picking
├── splat-serialize.ts           # Serialization
├── box-shape.ts                 # Box gizmo
├── sphere-shape.ts              # Sphere gizmo
├── infinite-grid.ts             # Grid overlay
├── underlay.ts                  # Underlay
├── outline.ts                   # Selection outline
├── element.ts                   # Element base
├── anim-track.ts                # Animation tracks
├── track-manager.ts             # Track manager
├── anim/                        # Animation
├── io/                          # I/O
├── drop-handler.ts              # Drag-drop
├── recent-files.ts              # Recent files
├── video-config.ts              # Video settings
├── png-writer.ts                # PNG export
└── iframe-api.ts                # Embed API
```

### Implementation Order (Dependency-Sorted)

1. **Foundation:** `events.ts`, `command-queue.ts`, `edit-history.ts`, `edit-ops.ts`, `index-ranges.ts`
2. **Math/Geometry:** `transform.ts`, `transform-handler.ts`, `entity-transform-handler.ts`, `splats-transform-handler.ts`, `pivot.ts`, `box-shape.ts`, `sphere-shape.ts`, `sh-utils.ts`
3. **Data Model:** `splat.ts`, `splat-state.ts`, `gaussian-instances.ts`, `splat-centers.ts`, `splat-surface-pick.ts`, `splat-serialize.ts`, `spherical-metadata.ts`
4. **Rendering:** `projected-splat-renderer.ts`, `render.ts`, `camera.ts`, `camera-poses.ts`, `infinite-grid.ts`, `underlay.ts`, `outline.ts`
5. **Scene:** `scene.ts`, `pc-app.ts`
6. **Tools:** `tool-manager.ts`, then all 13 tools
7. **UI:** `ui/editor.ts`, `ui/menu.ts`, `ui/bottom-toolbar.ts`, `ui/right-toolbar.ts`, `ui/scene-panel.ts`, `ui/settings-panel.ts`, `ui/appearance-panel.ts`, `ui/overlays-panel.ts`, `ui/data-panel.ts`, `ui/timeline-panel.ts`, `ui/status-bar.ts`, `ui/view-cube.ts`, `ui/perf-overlay.ts`, `ui/camera-info-overlay.ts`, `ui/popup.ts`, `ui/tooltip.ts`, `ui/spinner.ts`, `ui/progress.ts`, `ui/export-popup.ts`, `ui/publish-settings-dialog.ts`, `ui/image-settings-dialog.ts`, `ui/video-settings-dialog.ts`, `ui/shortcuts-popup.ts`, `ui/about-popup.ts`, `ui/localization.ts`, `ui/select-cursor.ts`
8. **Integration:** `main.ts`, `editor.ts`, `file-handler.ts`, `publish.ts`, `preferences.ts`, `serializer.ts`, `doc.ts`, `doc-instances.ts`, `sequence.ts`, `timeline.ts`, `shortcut-manager.ts`, `drop-handler.ts`, `recent-files.ts`, `video-config.ts`, `png-writer.ts`, `iframe-api.ts`, `picker.ts`, `transform-palette.ts`, `track-manager.ts`, `anim-track.ts`, `anim/`, `io/`, `color-grade.ts`, `color-palette.ts`
9. **Shaders:** Copy all `.wgsl` files from SuperSplat `src/shaders/`

---

## Phase 2: React UI Components (Days 6-8)

### Components to Create

```
components/editor/splat/
├── SplatEditorCanvas.tsx              # Main canvas wrapper
├── SplatScenePanel.tsx                # Layer list (left sidebar)
├── SplatSettingsPanel.tsx             # Camera, grid, bound settings
├── SplatAppearancePanel.tsx           # Color, SH bands, selection viz
├── SplatOverlaysPanel.tsx             # Centers, rings, selection overlay toggles
├── SplatDataPanel.tsx                 # Statistics, histograms
├── SplatTimelinePanel.tsx             # Animation timeline
├── SplatBottomToolbar.tsx             # Tools: move, rotate, scale, select modes
├── SplatRightToolbar.tsx              # Selection modes, footprint, depth
├── SplatMenu.tsx                      # File, Edit, View, Export, Publish
├── SplatExportPopup.tsx               # Export dialog (.splat, .ply, .ksplat)
├── SplatPublishDialog.tsx             # Publish to VizTR/Supabase
├── SplatImageSettingsDialog.tsx       # Image render settings
├── SplatVideoSettingsDialog.tsx       # Video render settings
├── SplatShortcutsPopup.tsx            # Keyboard shortcuts reference
├── SplatStatusBar.tsx                 # Status bar with panel toggles
├── SplatViewCube.tsx                  # View cube gizmo
├── SplatPerfOverlay.tsx               # Performance overlay
├── SplatCameraInfoOverlay.tsx         # Camera info overlay
├── SplatSelectCursor.tsx              # Selection cursor overlay
└── useSplatEditor.ts                  # Editor hook (initialization, events)
```

### UI Architecture Decision

**Do NOT use `pcui` directly.** Re-implement all panels in React + Tailwind following existing patterns:
- `components/editor/SceneConfigPanel.tsx` → `SplatSettingsPanel.tsx`
- `components/editor/HotspotInspector.tsx` → `SplatScenePanel.tsx`
- `components/editor/CanvasTab.tsx` → `SplatScenePanel.tsx` (layer list)
- `components/editor/ViewConstraintsPanel.tsx` → `SplatOverlaysPanel.tsx`

---

## Phase 3: State & Data Layer (Days 3-4, Parallel)

### Files to Create

```
lib/splat/
├── splat-types.ts                   # TypeScript interfaces (from SplatConfigurator + SuperSplat)
├── splat-editor-store.ts            # Zustand store with temporal undo/redo
├── splat-store.ts                   # Runtime splat data (parallels tourStore.ts)
├── compression.ts                   # KTX2/Draco pipeline (parallels marzipano/tiling.ts)
├── validation.ts                    # File format validation
├── events-bridge.ts                 # SuperSplat Events → Zustand bridge
├── supabase/
│   ├── splat-repo.ts                # CRUD for project splats
│   ├── splat-collab.ts              # Realtime collaboration
│   └── splat-preferences.ts         # User preferences sync
└── index.ts                         # Barrel exports
```

### Store Pattern (Mirroring `lib/tourStore.ts`)

```typescript
// temporal + immer + persist + zundo
export const useSplatEditorStore = create<SplatEditorState>()(
  temporal(
    persist(
      immer((set) => ({ /* state + actions */ })),
      { name: 'viztr-splat-editor', partialize: ... }
    ),
    { partialize: (state) => ({ splats: state.splats }), limit: 50 }
  )
);
```

---

## Phase 4: Editor Pages & Routing (Days 9-10)

### Pages to Create

| Page | Path | Purpose |
|------|------|---------|
| Primary Editor | `app/xr-world/gaussian-splat/editor/page.tsx` | Standalone builder (mirrors `virtual-tour/editor/`) |
| Admin Editor | `app/under-admin/users/[userId]/projects/[projectId]/editor-dashboard/gaussian-splat/editor/page.tsx` | Project-scoped editor |

### Route Structure

```
app/xr-world/gaussian-splat/
├── page.tsx                    # (exists) Public showcase
├── editor/
│   ├── page.tsx                # Main editor entry
│   ├── layout.tsx              # Editor layout wrapper
│   └── loading.tsx             # Loading UI

app/under-admin/users/[userId]/projects/[projectId]/editor-dashboard/gaussian-splat/
├── page.tsx                    # (exists) Data table
└── editor/
    └── page.tsx                # Project-scoped editor
```

---

## Phase 5: Operational Setup (Days 11-12)

### Build Configuration

- [ ] `pnpm build:splat-editor` script
- [ ] `pnpm dev:splat-editor` with concurrent watch
- [ ] Static asset copy script (webp.wasm, locales)
- [ ] Verify WebGPU + WASM loading in production build

### Static Assets

```
public/splat-editor/
├── bundle.js                    # Rollup output
├── bundle.css                   # Rollup SCSS output
├── lib/webp/webp.wasm           # From @playcanvas/splat-transform
└── locales/                     # i18n JSON files
    ├── en.json
    ├── fr.json
    ├── de.json
    ├── es.json
    └── ...
```

### Next.js Config Updates

```javascript
// next.config.mjs
{
  webpack: (config) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    config.module.rules.push({ test: /\.wgsl$/, type: 'asset/source' });
    return config;
  },
  async headers() {
    return [{
      source: '/splat-editor/:path*',
      headers: [
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' }
      ]
    }];
  }
}
```

---

## Phase 6: Feature Parity & Testing (Days 13-15)

### Feature Checklist

| Category | Features | Source |
|----------|----------|--------|
| **Viewer** | Orbit/fly controls, dolly, align, focus, grid, bound, poses | `GaussianSplatViewer` + SuperSplat |
| **Scene Panel** | Layer list, visibility, lock, rename, duplicate, delete, reorder | `ScenePanel` |
| **Settings** | Camera FOV, tonemapping, control mode, fly speed, fov dolly | `SettingsPanel` |
| **Appearance** | BG color, selection color, SH bands, center/ring size, blends | `AppearancePanel` |
| **Overlays** | Gaussians/centers/rings toggles, selection viz, outline, min pixel, stochastic | `OverlaysPanel` |
| **Data Panel** | Splat count, memory, SH bands histogram, bounds | `DataPanel` |
| **Timeline** | Keyframes, camera poses, playback | `TimelinePanel` |
| **Tools** | Move, Rotate, Scale, 7 Selection types, Measure, Orient | `tools/` |
| **Selection** | Rect, Brush, Sphere Brush, Flood, Polygon, Lasso, Sphere, Box, Eyedropper | All selection tools |
| **Edit Ops** | Select all/none/invert, hide/unhide, delete, duplicate, separate, color grade | `edit-ops.ts` |
| **Undo/Redo** | 50 steps, integrated with zundo | `EditHistory` → `zundo` |
| **Export** | .splat, .ply, .ksplat (SOG), .png, .jpg, .webp, video (webm/mp4/mov/mkv) | `ExportPopup` + `publish.ts` |
| **Publish** | Adapt to VizTR hosting (Supabase Storage + signed URLs) | `PublishSettingsDialog` |
| **Shortcuts** | 40+ mapped shortcuts | `ShortcutManager` |
| **i18n** | Locale switching via `?lng=` | `i18next` |
| **PWA** | File System Access API, launchQueue | `main.ts` |

### Testing Matrix

- [ ] Chrome (WebGPU)
- [ ] Edge (WebGPU)
- [ ] Firefox (WebGPU behind flag)
- [ ] Safari (WebGL2 fallback)
- [ ] Mobile Chrome (touch controls)
- [ ] Large splats (>10M points) - stochastic rendering
- [ ] Multiple splat layers
- [ ] Undo/redo stress test
- [ ] Export/import round-trip

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| `pcui` + React conflict | High | High | **Don't use pcui** — React re-implementation |
| WebGPU unavailable | Medium | Medium | WebGL2 fallback in `createGraphicsDevice` |
| WASM 404 in prod | Medium | High | Copy to `public/splat-editor/lib/webp/` in build |
| Bundle size > 2MB | Medium | Medium | Rollup code-splitting + dynamic import |
| GPU readback deadlocks | Low | High | `CommandQueue` serialization |
| PlayCanvas version drift | Low | Medium | Pin `playcanvas@2.21.4` (matches existing) |

---

## File Creation Order (Execution Sequence)

```
1. package.json                    ← Add deps
2. rollup.config.splat.mjs         ← Editor bundler
3. tsconfig.splat.json             ← Editor TS config
4. next.config.mjs                 ← COOP/COEP + WASM
5. public/splat-editor/            ← Static assets (webp.wasm, locales)
6. src/splat-editor/               ← Core engine port (27 files)
7. lib/splat/                      ← Types, store, compression, bridge
8. components/editor/splat/        ← React UI panels (12+ components)
9. app/xr-world/gaussian-splat/editor/page.tsx
10. app/under-admin/.../gaussian-splat/editor/page.tsx
```

---

## Start Commands

```bash
# Development
pnpm dev:splat-editor    # Runs: rollup watch + next dev concurrently

# Production build
pnpm build:splat-editor  # Rollup production bundle
pnpm build               # Next.js build
```

---

## Notes for Implementation

1. **Port incrementally** - Get main.ts bootstrapping working first, then add modules one at a time
2. **Test each module** - Verify no TypeScript errors after each file
3. **Reuse existing patterns** - Follow `lib/tourStore.ts`, `components/editor/SceneConfigPanel.tsx`, `lib/marzipano/` patterns
4. **Don't rewrite shaders** - Copy WGSL files directly, load via `fetch`
5. **Bridge Events → Zustand** - Don't fight the two event systems; bridge them
6. **Supabase integration last** - Get editor working locally first, then add backend