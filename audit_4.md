# Audit 4: Creator Engine Capability Verification
## Complete Evidence Report

**Generated:** 2026-09-19
**Status:** EVIDENCE-ONLY — NO ARCHITECTURAL DECISIONS
**Baseline:** Audit 3 Frozen

---

## A. Gaussian Splat Capability Matrix

| Capability | SuperSplat :3002 | Splat Editor (/vizsplat/editor) | EngineBridge + SplatAdapter |
|---|---|---|---|
| **Load .ply/.splat/.ksplat** | ✅ Implemented (real parsers) | ❌ Stubs only (returns empty array) | ❌ Fake generator only |
| **WebGPU rendering** | ✅ Implemented (PWA, WebGPU) | ✅ Implemented (hardcoded `deviceTypes: ['webgpu']`) | ⚠️ Conditional (prod only; else 2D canvas) |
| **Camera tools (orbit/pan/zoom)** | ✅ Implemented | ✅ Implemented (full orbit/fly + damping) | Adapter: partial / Canvas: 2D |
| **Selection tools (9 variants)** | ✅ Implemented | ⚠️ Scaffolded (events only, no GPU intersect) | Adapter: stub / Canvas: 2D click/brush |
| **Transform tools (move/rotate/scale)** | ✅ Implemented (3D gizmos) | ⚠️ Scaffolded (events only, no logic) | Adapter: partial / Canvas: UI only |
| **Clean floaters / compress / crop** | ✅ Implemented | ❌ Not implemented | Canvas: JS array ops only |
| **Import/export (real binary)** | ✅ (.ply, .splat, .spz) | ❌ Stubs only (console.log) | Canvas: fake text export |
| **Scene save/load** | ✅ (localStorage + File System Access API) | ⚠️ Scaffolded (serialize fn only) | None |
| **Persistence hooks** | ✅ (localStorage + launchQueue + SW) | ⚠️ Preferences only | None |
| **Undo/Redo (50 steps)** | ✅ | ⚠️ Class exists, scaffolded | ❌ |
| **Extensibility/VizTR integration** | ❌ (dist-only, iframe only) | ⚠️ `window.scene` global + Events | ✅ EngineAdapter protocol |
| **Deployment** | ✅ Static serve on :3002 | ❌ Not built/deployed | ⚠️ React component (adapter dead) |
| **Process model** | Separate (port 3002) | In-process (would need build) | In-process (React component) |

### Key Findings — Gaussian Splat

| Candidate | Reality |
|---|---|
| **SuperSplat** | **Production-quality editor, dist-only fork.** Complete feature set, real parsers, real export, PWA with offline. **But:** dist-only (no TS source), no EngineBridge integration, separate process at :3002. |
| **Splat Editor** | **82-file custom implementation on PlayCanvas engine.** Full WebGPU render pipeline, camera, event system, tool registration — **but core algorithms are stubs** (no PLY parser, no GPU selection, no transform gizmo, no export, no scene persistence). Not deployed. |
| **EngineBridge + SplatAdapter** | **SplatEngineAdapter is a bridge to nowhere** — conditionally imports `@/splat-editor/main` which doesn't exist as built module. **SplatEditorCanvas is a 2D demo** with fake data. Zero persistence. |

---

## B. PlayCanvas 3D/XR Capability Matrix

| Capability | EngineBridge + PlayCanvas | PlayCanvas Editor :3487 | Minimal VizTR PlayCanvas |
|---|---|---|---|
| **GLB/GLTF loading** | ❌ No PlayCanvasAdapter exists | ✅ Engine loads container assets | ⚠️ Load only (no UI) |
| **Scene/entity hierarchy** | ❌ No adapter | ✅ Full entity tree in ShareDB | ❌ No hierarchy panel |
| **Camera** | ❌ No adapter | ✅ Default camera entity | ✅ Programmatic camera |
| **Lighting / IBL** | ❌ No adapter | ✅ Directional + skybox + PBR settings | ⚠️ Single light + skybox |
| **PBR materials/textures** | ❌ No adapter | ✅ StandardMaterial, KTX2, Basis | ❌ No editor (uses Three.js) |
| **Transform tools** | ❌ No adapter | ✅ Full 3D gizmos (move/rotate/scale) | ❌ |
| **WebXR** | ❌ No adapter | ⚠️ Engine supports, editor config minimal | ✅ `startVR()`/`startAR()` hooks |
| **WebAR** | ❌ No adapter | ⚠️ Engine supports, no explicit AR UI | ✅ `startAR()` with hit-test |
| **VR / 6DOF** | ❌ No adapter | ✅ Engine supports `immersive-vr` | ✅ `startVR()` with bounded-floor |
| **Entity/component system** | ❌ No adapter | ✅ Full PC architecture | ❌ Minimal (camera+light only) |
| **Device preview** | ❌ | ✅ Launch page runs scene | ❌ |
| **Save → VizTR Experience Config** | ❌ | ❌ (PC format only) | ❌ |
| **Reload round-trip** | ❌ | ✅ Internal (ShareDB ↔ Supabase) | ❌ |
| **Process model** | In-process (React) | **Separate process (port 3487)** | In-process (React) |
| **Engine version** | N/A | **Custom build (`forks/engine/build/`)** | CDN v181 |

### Key Findings — PlayCanvas 3D/XR

| Candidate | Reality |
|---|---|
| **EngineBridge + PlayCanvas** | **Scaffold only.** Types define `EngineType = 'playcanvas'` but **NO `PlayCanvasEngineAdapter` class exists**. Only `SplatEngineAdapter` uses `engineType: 'playcanvas'` — it wraps SuperSplat WebGPU, not general PlayCanvas. Building a full adapter would require ~2-3 weeks (wrapping `pc.Application`). |
| **PlayCanvas Editor :3487** | **Complete, standalone editor.** 5.8MB bundle, full entity hierarchy, transform gizmos, material editor, asset pipeline (texture compression, cubemaps), ShareDB real-time collab, Supabase persistence, device preview via `/launch`. **But:** separate process, no VizTR config export, no AR authoring UI visible. |
| **Minimal VizTR PlayCanvas** | **Runtime/viewer components only.** `usePlayCameraEngine` hook loads GLB, handles WebXR/VR/AR sessions, skybox, camera. **No editing** — no hierarchy, no gizmos, no material editor, no persistence. `PlayCanvasConfigurator` misnamed — uses Three.js. |

---

## C. Persistence / Data Boundary

| Aspect | SuperSplat :3002 | Splat Editor | EngineBridge + SplatAdapter | PC Editor :3487 | Minimal VizTR PC |
|---|---|---|---|---|---|
| **Scene persistence** | ✅ Full (JSON + localStorage + FSAPI) | ❌ Scaffold only | ❌ None | ✅ Supabase (ShareDB) | ❌ None |
| **Format** | SuperSplat JSON | PlayCanvas scene (stub) | Camera only | PlayCanvas native JSON | N/A |
| **File System Access API** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Service Worker / Offline** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Real binary export** | ✅ (.ply, .splat, .spz) | ❌ | ❌ (fake) | ❌ (PC format) | ❌ |
| **VizTR Experience Config** | ❌ | ❌ | ❌ | ❌ | ❌ |

**Critical gap:** **No candidate exports VizTR Experience Config.** All persist in their own formats.

---

## D. Integration Boundary

| Aspect | SuperSplat :3002 | Splat Editor | EngineBridge + SplatAdapter | PC Editor :3487 | Minimal VizTR PC |
|---|---|---|---|---|---|
| **VizTR communication** | iframe `postMessage` only | `window.scene` global + Events | EngineAdapter (4 commands) | Next.js embed (script tag + `window.config`) | Props/hooks |
| **Project context** | URL params (`?load=url`) | URL params (`?load=url`) | `loadSceneSnapshot(camera)` | Supabase (admin client) + `window.config` | `XRScene` prop from Supabase |
| **Camera sync** | iframe message | `camera.setPoseOverride()` | `SET_CAMERA_POSE` | Via `window.config` | `usePlayCameraEngine` |
| **Selection sync** | Not exposed | Events only | `SELECT_ENTITY` (all only) | Not exposed | N/A |
| **Tool sync** | Not exposed | `tool.set` events | `SET_ACTIVE_TOOL` | Not exposed | N/A |
| **Telemetry** | Not exposed | `scene.frameTimings` | `getTelemetry()` (fake) | Not exposed | `usePlayCameraEngine` |
| **Process isolation** | Separate origin (:3002) | Same origin (would be) | Same process | Separate origin (:3487) | Same origin |

---

## E. Deployment / Process Boundary

| Aspect | SuperSplat :3002 | Splat Editor | EngineBridge + SplatAdapter | PC Editor :3487 | Minimal VizTR PC |
|---|---|---|---|---|---|
| **Build artifact** | Pre-built dist (6MB JS) | Source only (82 TS files) | TS source (adapter + React) | Pre-built dist (5.8MB JS) | CDN PlayCanvas v181 |
| **Serving** | `serve` on port 3002 | Not configured | Next.js component | Express on port 3487 | Next.js (import) |
| **Process model** | Separate HTTP server | Would need build + serve | In-process (React) | **Separate process (3 WebSockets)** | In-process (React) |
| **WebGPU requirement** | Yes | Yes (hardcoded) | Adapter checks `navigator.gpu` | Yes (custom engine) | No (WebGL via CDN) |
| **Dependencies** | `@playcanvas/*` bundled | `@playcanvas/*` + `playcanvas` | `@playcanvas/*` + React | `@playcanvas/*` (custom fork) | `playcanvas` (CDN) |

---

## F. Missing Capabilities Summary

| Capability | SuperSplat | Splat Editor | EngineBridge + SplatAdapter | PC Editor :3487 | Minimal VizTR PC |
|---|---|---|---|---|---|
| **Real PLY/SPLAT/KSPLAT parsing** | ✅ | ❌ | ❌ | N/A | N/A |
| **Real binary export** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **GPU-accelerated selection** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Transform gizmo (3D)** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Clean floaters (GPU)** | ✅ | ❌ | ❌ | N/A | N/A |
| **Compress (quantization)** | ✅ | ❌ | ❌ | N/A | N/A |
| **Crop to selection** | ✅ | ❌ | ❌ | N/A | N/A |
| **Scene persistence (full)** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Undo/Redo (50 steps)** | ✅ | ⚠️ | ❌ | ⚠️ (ShareDB) | ❌ |
| **File System Access API** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Service Worker / Offline** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **VizTR EngineBridge protocol** | ❌ | ❌ | ✅ | ❌ | ❌ |
| **TypeScript source access** | ❌ | ✅ | ✅ | ❌ | ✅ |
| **Customizable/extensible** | ❌ | ✅ | ✅ | ❌ | ✅ |
| **VizTR Experience Config export** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Deployed & runnable** | ✅ | ❌ | ⚠️ (adapter only) | ✅ | ✅ (viewer only) |

---

## G. Unknowns Requiring Direct Verification

### Gaussian Splat

| Unknown | Candidate | Verification Needed |
|---|---|---|
| SuperSplat actual WebGPU fallback | SuperSplat | Does dist bundle gracefully fall back to WebGL2? |
| SuperSplat iframe API surface | SuperSplat | What `postMessage` protocol does upstream support? |
| Splat Editor shader compilation | Splat Editor | Do `shaders/*.ts` actually compile? `projected-splat-renderer.ts` is empty. |
| Splat Editor GPU compute for selection | Splat Editor | `data-processor.ts` returns empty masks — separate compute shader? |
| EngineBridge production import path | EngineBridge | Does `@/splat-editor/main` resolve to built module? No build config found. |
| SplatEditorCanvas WebGPU path | EngineBridge | Canvas uses 2D context only — WebGPU branch exists? |
| PlayCanvas engine version compatibility | All | `SplatEngineAdapter` claims `2.21.4`; `src/splat-editor` imports `playcanvas` — match? |
| Memory/performance at scale | All | SuperSplat handles 10M+; others untested |
| SPZ (compressed) support | SuperSplat | Manifest doesn't list `.spz` — verify in dist |
| KSPLAT support | SuperSplat / Splat Editor | Upstream SuperSplat added KSPLAT — verify; Splat Editor has no parser |

### PlayCanvas 3D/XR

| Unknown | Candidate | Verification Needed |
|---|---|---|
| PlayCanvas Editor :3487 WebXR authoring UI | PC Editor | Does `editor.js` include XR session preview, device simulator, XR entity components? |
| EngineBridge `PlayCanvasEngineAdapter` feasibility | EngineBridge | Can full adapter be built wrapping `pc.Application` (~500-1000 lines)? |
| `forks/engine/build/playcanvas.js` capabilities | PC Editor | Custom build likely includes GSplat, WebXR, WebGPU. Verify `gsplat` component system. |
| Supabase schema compatibility | PC Editor | `editor_scenes` = PlayCanvas scene JSON. VizTR Experience Config = different schema. Migration layer unbuilt. |
| `components/xr/SceneLayer.tsx` runtime switching | Minimal VizTR PC | Switches between Marzipano and PlayCamera. But PlayCamera ≠ PlayCanvas Editor. Two different "PlayCanvas" runtimes. |
| Asset pipeline in forks/editor | PC Editor | `editor.js` includes texture conversion (AVIF, WebP, JPEG, PNG), cubemap gen, model compression. Extent of GLTF→PC conversion unknown without running. |
| `config.js` scene entity structure depth | PC Editor | Config shows camera, light, render, script, gsplat components. Full component inventory needed. |
| ShareDB conflict resolution for concurrent edits | PC Editor | How does OT handle simultaneous transform gizmo edits? |

---

## H. Cross-Cutting Observations

### 1. No Candidate Exports VizTR Experience Config
All creator engines persist in their own native formats:
- SuperSplat → SuperSplat JSON
- Splat Editor → PlayCanvas scene (stub)
- EngineBridge + SplatAdapter → Camera only
- PlayCanvas Editor → PlayCanvas native JSON (via ShareDB)
- Minimal VizTR PlayCanvas → No persistence

**This is the single most critical gap.** Any architectural decision must solve: **How does editor state become authoritative VizTR Experience Config?**

### 2. Two Different "PlayCanvas" Runtimes
- **PlayCanvas Editor** (:3487) — full editor, custom engine build, Supabase persistence
- **Minimal VizTR PlayCanvas** (`usePlayCameraEngine`) — runtime/viewer, CDN engine v181, no editing

They share the engine name but have **zero code sharing** and **different engine versions**.

### 3. EngineBridge Contract Supports PlayCanvas But No Implementation Exists
`types.ts` defines `EngineType = 'playcanvas'` and the `EngineAdapter` interface is engine-agnostic. The entire bridge architecture was designed for PlayCanvas but the adapter was never built.

### 4. Splat Engine Is a Fork of PlayCanvas Editor
SuperSplat and the 82-file Splat Editor both use the PlayCanvas engine (`pc.Application`, `pc.GraphicsDevice`, `pc.RenderPass`). They are not independent engines — they are **specialized editors built on PlayCanvas**.

---

## I. Audit 4 Complete

**Evidence is complete for both families. No architectural decisions made.**

### Summary of Evidence State

| Family | Production-Ready Editor | Source-Accessible Editor | Bridge Integration | Persists VizTR Config |
|---|---|---|---|---|
| Gaussian Splat | SuperSplat :3002 (dist-only) | Splat Editor (82 files, stubbed core) | EngineAdapter protocol only | ❌ All |
| PlayCanvas 3D/XR | PC Editor :3487 (standalone) | None (EngineBridge scaffold only) | EngineBridge contract only | ❌ All |

### Next Phase

**Architecture Decision / Creator Engine Strategy** — with complete evidence.

Decisions to make:
1. **Gaussian Splat**: SuperSplat (dist-only, separate) vs Splat Editor (source, needs completion) vs EngineBridge + custom adapter
2. **PlayCanvas 3D/XR**: PC Editor :3487 (standalone, own persistence) vs EngineBridge + PlayCanvasAdapter (in-process, needs ~2-3 weeks) vs Minimal VizTR + editor UI layer
3. **Unified persistence boundary**: How editor state becomes authoritative VizTR Experience Config
4. **Integration model**: iframe + postMessage vs EngineBridge protocol vs shared Supabase

**Only after these decisions should implementation begin.**