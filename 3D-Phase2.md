# 3D-Phase2.md — WebXR/WebAR Modules & Gaussian Splat Viewer

**Duration:** Weeks 3-6 (4 weeks, 20 working days)
**Status:** ⏳ Pending Execution
**Owner:** 3D Platform Team
**Depends On:** Phase 1 (engine abstraction + compression)

---

## 1. Objective

Add **immersive runtime capabilities** to VizTR:
1. **WebXR Hands API** — full hand tracking for Quest 3 / Vision Pro
2. **WebXR Layers** — performance-optimized UI rendering in VR
3. **WebAR module** — AR session manager for surface/plane detection
4. **USDZ export** — iOS Quick Look for ARKit-compatible sharing
5. **Gaussian Splat viewer** — SuperSplat-style streaming splat loader
6. **Splat compression format** — `.spz` support for efficient splat data

---

## 2. Scope

### ✅ In Scope

**2A — WebXR Hands + Layers (Weeks 3-4)**
- `@playcanvas/webxr-hands` integration
- `@playcanvas/webxr-layers` integration (where applicable)
- Hand pose detection (pinch, grab, point)
- Hand-tracking UI (floating menu in VR)
- WebXR session manager abstraction (`useXRSession`)
- Comfort settings (locomotion, snap turn, vignette)

**2B — WebAR + USDZ (Weeks 5-6)**
- `useARSession()` hook
- AR surface detection (plane anchors)
- USDZ generator (server-side Python or Swift CLI)
- Cross-platform AR sharing link (GLB + USDZ)
- iOS Quick Look metadata generator

**2C — Gaussian Splat Viewer (Weeks 5-6)**
- `.splat` / `.ply` / `.spz` format loaders
- SuperSplat-style web viewer (will be cloned if user confirms)
- Splat streaming (progressive load)
- Splat editing tools (crop, transform, color correction)
- Splat → PlayCanvas integration (splat as material/texture)

### ❌ Out of Scope

- NeRF / Nerfstudio training (external service, deferred)
- COLMAP photogrammetry (external service, deferred)
- Multi-user VR collaboration (Phase 4)
- Cloud rendering (UE5 Pixel Streaming already exists, deferred to Phase 4)

---

## 3. Technical Components

### 3.1 New Dependencies

```jsonc
// package.json — additions for Phase 2
{
  "dependencies": {
    "@playcanvas/webxr-hands": "^0.4.0",   // OR cloned repo (pending confirmation)
    "usdz-tools": "^0.2.0",                  // Server-side USDZ generation
    "@playcanvas/observer": "^1.0.0"         // Splat format decoder
  }
}

// Server-side (Python, optional — runs in Edge Function)
"pyproject.toml"
{
  "usd": "^23.5",
  "usdz-converter": "^1.0"
}
```

### 3.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│              3D-Phase2 Target Stack                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  WebXR Runtime Layer                                        │
│   ├─ useXRSession() — manager (vr | ar | inline)           │
│   ├─ useHands() — hand tracking pose stream                 │
│   ├─ useARSession() — ARKit/ARCore surface detection       │
│   └─ useComfort() — vignette, snap turn, locomotion        │
│                                                              │
│  Splat Runtime Layer                                        │
│   ├─ SplatLoader (splat | ply | spz)                        │
│   ├─ SplatRenderer (SuperSplat-style GPU instancing)        │
│   └─ SplatEditor (crop | transform | color)                 │
│                                                              │
│  iOS AR Bridge                                               │
│   ├─ USDZ generator (Edge Function)                        │
│   └─ Cross-platform AR link router (/ar/[id])               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. File-by-File Implementation

### 4.1 New Files to Create

#### **2A — WebXR Hands & Layers**

| File | Purpose |
|------|---------|
| `lib/3d/xr/useXRSession.ts` | Session manager hook |
| `lib/3d/xr/useHands.ts` | Hand tracking stream hook |
| `lib/3d/xr/useComfort.ts` | Comfort settings hook |
| `lib/3d/xr/handPoses.ts` | Hand pose detector (pinch/grab/point) |
| `lib/3d/xr/floatingMenu.ts` | In-VR UI rendering |
| `components/3d/xr/XRSessionManager.tsx` | React provider for XR |
| `components/3d/xr/HandVisualizer.tsx` | Renders hand skeleton in VR |
| `components/3d/xr/Vignette.tsx` | Motion comfort overlay |
| `app/xr-world/webxr-hands/page.tsx` | Hands demo page |
| `app/api/xr/session-config/route.ts` | Returns XR session config |
| `__tests__/3d/xr/useXRSession.test.ts` | Unit tests |

#### **2B — WebAR + USDZ**

| File | Purpose |
|------|---------|
| `lib/3d/ar/useARSession.ts` | AR session manager |
| `lib/3d/ar/surfaceDetector.ts` | Plane/anchor detection |
| `lib/3d/ar/usdzGenerator.ts` | Server-side USDZ conversion |
| `lib/3d/ar/crossPlatformLink.ts` | Detects iOS/Android/desktop |
| `components/3d/ar/ARSessionManager.tsx` | React provider |
| `components/3d/ar/ARPlacementReticle.tsx` | Visual reticle for surface placement |
| `app/api/ar/usdz/route.ts` | Edge function: GLB → USDZ |
| `app/api/ar/share-link/[id]/route.ts` | Cross-platform link generator |
| `app/ar/[id]/page.tsx` | Public AR redirect page |
| `__tests__/3d/ar/useARSession.test.ts` | Unit tests |

#### **2C — Gaussian Splat Viewer**

| File | Purpose |
|------|---------|
| `lib/3d/splat/splatLoader.ts` | .splat/.ply/.spz format loader |
| `lib/3d/splat/splatRenderer.ts` | GPU instancing renderer |
| `lib/3d/splat/splatStreamer.ts` | Progressive streaming |
| `lib/3d/splat/splatEditor.ts` | Crop/transform/color tools |
| `lib/3d/splat/splatTransform.ts` | Coordinate system transforms |
| `components/3d/splat/SplatViewer.tsx` | Main viewer component |
| `components/3d/splat/SplatEditor.tsx` | Splat editor UI |
| `components/3d/splat/SplatUpload.tsx` | Upload + auto-process |
| `app/xr-world/gaussian-splat/page.tsx` | Splat viewer page (exists, refactor) |
| `app/api/splat/process/route.ts` | Splat processing endpoint |
| `app/api/splat/stream/[id]/route.ts` | Range-request streaming |
| `__tests__/3d/splat/splatLoader.test.ts` | Unit tests |

### 4.2 Files to Modify

| File | Change |
|------|--------|
| `components/xr/PlayCanvasXRViewer.tsx` | Add hand tracking + AR modes |
| `app/xr-world/showcase/page.tsx` | Add Hands / AR / Splat tabs |
| `lib/credentials-store.ts` | Add WebXR/AR/splat credentials |
| `components/admin/SuperAdminCMSManager.tsx` | Add XR feature toggles |
| `app/admin/dashboard/page.tsx` | Add Phase 2 admin sections |
| `package.json` | Add Phase 2 dependencies |

---

## 5. Verification Gates

### Gate 2A: WebXR Hands

```bash
# Manual verification on Meta Quest 3
# 1. Navigate to /xr-world/webxr-hands
# 2. Enter VR session
# 3. Verify hand skeleton appears
# 4. Verify pinch gesture detected
# 5. Verify floating menu appears on gesture

# Automated
pnpm test __tests__/3d/xr/
pnpm tsc --noEmit
```

### Gate 2B: WebAR + USDZ

```bash
# Unit tests
pnpm test __tests__/3d/ar/

# Manual verification on iOS Safari
# 1. Upload a GLB via admin
# 2. Open /ar/[id] on iPhone Safari
# 3. Verify iOS Quick Look launches
# 4. Verify model appears in AR

# Manual on Android Chrome
# 1. Open /ar/[id] on Pixel/Samsung
# 2. Verify ARCore Scene Viewer launches
```

### Gate 2C: Splat Viewer

```bash
# Unit tests
pnpm test __tests__/3d/splat/

# Manual
# 1. Upload a .splat file via /admin/dashboard
# 2. Navigate to /xr-world/gaussian-splat/[id]
# 3. Verify splat renders
# 4. Verify progressive streaming works (200+ MB file)
# 5. Verify crop tool works
```

### Gate 2D: Build Pass

```bash
pnpm build
# Must complete successfully
```

---

## 6. Dependencies on Prior Phase

- **Phase 1** — requires `lib/3d/engine.ts` abstraction and `useCompressedAsset()` for splat streaming

---

## 7. Deliverables

1. ✅ `useXRSession` + `useHands` + `useComfort` hooks
2. ✅ `useARSession` + USDZ generator
3. ✅ Splat loader (splat/ply/spz)
4. ✅ Splat editor (crop/transform/color)
5. ✅ `/xr-world/webxr-hands` demo page
6. ✅ `/ar/[id]` public AR page
7. ✅ `/xr-world/gaussian-splat/[id]` splat viewer page
8. ✅ All 3 module areas unit-tested
9. ✅ Build passing
10. ✅ Documentation: `docs/webxr-architecture.md`, `docs/ar-pipeline.md`, `docs/splat-pipeline.md`

---

## 8. Risk Register

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Meta Quest 3 hand tracking API unstable | High | Pin PlayCanvas version, add fallback controllers |
| USDZ conversion server cost | Medium | Cache converted files, set max file size |
| Splat files too large for browser | High | Aggressive compression, range-request streaming |
| ARKit/ARCore feature parity gaps | Medium | Document unsupported features per platform |
| iOS Safari WebXR still partial | High | USDZ + Quick Look fallback for iOS |

---

## 9. Definition of Done

- [ ] All Phase 2A/2B/2C files created and unit-tested
- [ ] All 4 verification gates passing
- [ ] `pnpm build` passes
- [ ] `pnpm tsc --noEmit` passes (0 new errors)
- [ ] Manual verification on Quest 3, iPhone, Android, desktop
- [ ] 3 docs files written (≥500 words each)
- [ ] SuperSplat clone (if approved) integrated or ref pattern documented
