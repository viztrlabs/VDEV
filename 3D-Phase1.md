# 3D-Phase1.md — Engine Hardening & Compression Pipeline

**Duration:** Weeks 1-2 (10 working days)
**Status:** ⏳ Pending Execution
**Owner:** 3D Platform Team

---

## 1. Objective

Bring VizTR's 3D/XR engine layer to **production-grade reliability** by:
1. Migrating from ad-hoc PlayCanvas + Three.js dual codebases to a **unified engine abstraction**
2. Installing a **complete compression pipeline** (Draco + Meshopt + KTX2) so GLB files can ship at production size
3. Adding a **declarative React layer** (R3F + Drei) so the Developer Dashboard can author scenes idiomatically
4. Adding **runtime validation** (glTF-Validator, asset manifest integrity)

---

## 2. Scope

### ✅ In Scope
- PlayCanvas engine upgrade path (2.21.x → 2.13.x LTS where needed, or pin to current LTS)
- Three.js r167 → r170 (keep aligned with PlayCanvas math)
- Install `@react-three/fiber` + `@react-three/drei`
- Install `draco3d`, `meshoptimizer`, `basis-universal` (KTX2)
- Install `@gltf-transform/core` + `@gltf-transform/functions` + `@gltf-transform/extensions`
- Add `gltf-validator` to build pipeline
- Add asset manifest generator (`manifest.json` with checksums)
- Refactor `PlayCanvasXRViewer.tsx` to consume the new engine abstraction
- Refactor `PlayCanvasConfigurator.tsx` to R3F idioms where appropriate
- Add `useEngine()` hook — single entry point for engine selection (PC vs Three.js)
- Add `useCompressedAsset(url, opts)` hook — handles Draco/Meshopt/KTX2 transparently

### ❌ Out of Scope (deferred to later phases)
- WebXR Hands API (Phase 2A)
- Gaussian Splat viewer (Phase 2B)
- USDZ export (Phase 2A)
- Stripe / billing (Phase 3B)
- Public `/viewer/[id]` route (Phase 3A)

---

## 3. Technical Components

### 3.1 New Dependencies

```jsonc
// package.json — additions
{
  "dependencies": {
    "@react-three/fiber": "^8.17.10",
    "@react-three/drei": "^9.114.0",
    "three": "^0.170.0",
    "draco3d": "^1.5.7",
    "meshoptimizer": "^0.21.0",
    "ktx-parse": "^0.5.0",
    "basis-universal": "^1.4.0",
    "@gltf-transform/core": "^4.1.1",
    "@gltf-transform/functions": "^4.1.1",
    "@gltf-transform/extensions": "^4.1.1",
    "@gltf-transform/draco": "^4.1.1"
  },
  "devDependencies": {
    "@types/three": "^0.170.0",
    "gltf-validator": "^2.0.0-dev.3.10"
  }
}
```

### 3.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  3D-Phase1 Target Stack                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  React Layer (Authoring)                                   │
│   └─ @react-three/fiber + @react-three/drei                │
│        └─ <Canvas> declarative scene graph                 │
│             └─ useEngine()  ←─ chooses PC | Three.js      │
│                                                              │
│  Engine Layer (Runtime)                                    │
│   ├─ PlayCanvas 2.21.x (PC-native scenes)                 │
│   └─ Three.js r170 (R3F + fallback)                       │
│        └─ useCompressedAsset()                            │
│             ├─ Draco3d decoder (mesh)                      │
│             ├─ Meshopt decoder (mesh v2)                   │
│             └─ KTX2/Basis decoder (texture)               │
│                                                              │
│  Build Pipeline (Build-time)                               │
│   └─ scripts/compress-glb.ts                               │
│        ├─ gltf-transform pipeline                          │
│        ├─ Draco encode                                      │
│        ├─ Meshopt encode                                    │
│        └─ KTX2 basis encode                                 │
│                                                              │
│  Validation (CI)                                           │
│   └─ scripts/validate-glb.ts                               │
│        └─ gltf-validator                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. File-by-File Implementation

### 4.1 New Files to Create

| File | Purpose |
|------|---------|
| `lib/3d/engine.ts` | Engine abstraction (PC | Three.js unified API) |
| `lib/3d/useEngine.ts` | React hook returning current engine |
| `lib/3d/useCompressedAsset.ts` | Asset loader with Draco/Meshopt/KTX2 support |
| `lib/3d/manifest.ts` | Asset manifest types + validator |
| `scripts/compress-glb.ts` | Node script to compress GLB files |
| `scripts/validate-glb.ts` | GLB spec compliance check |
| `scripts/build-manifest.ts` | Generate manifest.json with checksums |
| `components/3d/EngineProvider.tsx` | Context provider for engine selection |
| `components/3d/AssetManifestLoader.tsx` | Loads and validates manifest |
| `__tests__/3d/engine.test.ts` | Engine abstraction unit tests |
| `__tests__/3d/useCompressedAsset.test.ts` | Asset loader unit tests |
| `__tests__/3d/compress-glb.test.ts` | Compression script tests |

### 4.2 Files to Modify

| File | Change |
|------|--------|
| `package.json` | Add new dependencies (3.1 above) |
| `tsconfig.json` | Add `"lib/3d"` to path aliases |
| `components/xr/PlayCanvasXRViewer.tsx` | Refactor to use `useEngine()` |
| `components/xr/PlayCanvasConfigurator.tsx` | Refactor to R3F where appropriate |
| `components/xr/hooks/usePlayCameraEngine.ts` | Update to consume engine abstraction |
| `jest.config.js` | Already has `three` in transform list — verify |

---

## 5. Verification Gates

### Gate 1A: Dependency Installation
```bash
cd C:\Users\Arch_Viz\Desktop\VizTR\Dev\vdev
pnpm install
# Must complete without peer-dep errors
```

### Gate 1B: TypeScript Compilation
```bash
pnpm tsc --noEmit
# Must pass with ZERO new errors
```

### Gate 1C: Engine Abstraction Unit Tests
```bash
pnpm test __tests__/3d/engine.test.ts
# Must pass: engine selection, asset loading, error paths
```

### Gate 1D: GLB Compression Test
```bash
# Download a sample GLB (10MB+ unoptimized)
curl -o /tmp/test.glb https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb

# Run compression
node scripts/compress-glb.ts /tmp/test.glb --output /tmp/test-compressed.glb \
  --draco --meshopt --ktx2

# Verify compression
ls -la /tmp/test-compressed.glb
# Should be smaller than input + manifest
```

### Gate 1E: Build Pass
```bash
pnpm build
# Must complete successfully
```

---

## 6. Dependencies on Prior Phases

- **None** — Phase 1 is the foundation. All later phases depend on this.

---

## 7. Deliverables

1. ✅ Unified engine abstraction (`lib/3d/engine.ts`)
2. ✅ React hooks (`useEngine`, `useCompressedAsset`)
3. ✅ Compression CLI (`scripts/compress-glb.ts`)
4. ✅ Validation CLI (`scripts/validate-glb.ts`)
5. ✅ Asset manifest system (`manifest.json` generation + types)
6. ✅ R3F + Drei integrated into Configurator
7. ✅ All existing Viewer/Configurator components refactored to consume new engine
8. ✅ Unit tests passing
9. ✅ Build passing
10. ✅ Documentation: `docs/3d-engine.md`

---

## 8. Risk Register

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Draco decoder WASM loading fails | Medium | Fallback to non-compressed GLB |
| KTX2 basis encoder OS-specific | High | Use cloud-based encoding fallback |
| R3F + PlayCanvas runtime conflict | Medium | Engine abstraction prevents both from loading |
| Three.js version drift | Low | Pin to r170 explicitly |

---

## 9. Definition of Done

- [ ] All 4 new dependencies installed and pnpm-lock.yaml updated
- [ ] `lib/3d/` directory created with 4 modules
- [ ] `scripts/` directory created with 3 CLI tools
- [ ] `__tests__/3d/` directory created with 3 test suites
- [ ] All Gates 1A-1E passing
- [ ] `docs/3d-engine.md` written (≥500 words)
- [ ] `pnpm build` passes
- [ ] `pnpm tsc --noEmit` passes (0 new errors)
- [ ] `pnpm test` passes for all 3D tests
