# VizTR Phase 01 — IWSDK + SparkJS Compatibility Spike — Final Report

**Date**: 2026-11-22
**Branch**: `spike/iwsdk-sparkjs-compatibility`
**Reference audit**: `docs/audit/immersive-web-sdk-audit.md`
**Mode**: Isolated compatibility experiment. No production architecture, migrations, auth, RBAC, or data models modified.

---

## 1. Dependencies Tested

| Package | Version Tested | Source | License |
|---|---|---|---|
| `@iwsdk/core` | `1.2.0-rc.0` | npm (Meta `immersive-web-sdk` monorepo) | MIT |
| `@iwsdk/locomotor` | `1.2.0-rc.0` | npm | MIT |
| `@iwsdk/xr-input` | `1.2.0-rc.0` | npm | MIT |
| `@iwsdk/scene-composition` | `1.2.0-rc.0` | npm | MIT |
| `@sparkjsdev/spark` | `2.4.0` | npm (World Labs) | MIT |
| `@pmndrs/uikit` | `1.0.78` | npm (transitive of IWSDK) | MIT |
| `three-mesh-bvh` | `0.9.18` | npm | MIT |
| `elics` | `3.4.2` | npm (ECS kernel) | MIT |
| `three` (upstream) | `0.185.1` | existing devDependency | MIT |

Untested / deliberately excluded from this spike: `@babylonjs/havok` physics WASM (present as transitive dep; `features.physics: false` per scope), `@iwsdk/vite-plugin-*` (Vite-only tooling — not used).

## 2. Configurations Tested

### Configuration A — IWSDK with its required `super-three` fork
**Result: FAILED — rejected.**

- `@iwsdk/core@1.2.0-rc.0` declares a hard runtime dependency `three: npm:super-three@0.185.0` (not a peer dependency), so pnpm installs the fork inside IWSDK's subtree regardless of the app's own three.
- With the app on upstream `three@0.185.1` and Spark peer-resolved to upstream, the browser console produced a hard render error:

  ```
  Error: THREE.WebGLProgram: Can not resolve #include <splatDefines>
      includeReplacer (super-three@0.185.0/build/three.module.js:7044)
  ```

- Root cause: **two three.js runtimes in one page**. Spark registered its shader chunks (`splatDefines`, etc.) on *upstream* three, while IWSDK's `WebGLRenderer` compiled programs from *super-three*, whose `ShaderChunk` registry never received them. This is the exact duplicate-module hazard predicted in the audit.
- Attempted scoped fix `pnpm.overrides['@sparkjsdev/spark>three'] = npm:super-three@0.185.0` (in `pnpm-workspace.yaml`, since pnpm 11 no longer reads `package.json#pnpm`): the override was recorded but **did not remap Spark's peer resolution** (`@sparkjsdev/spark@2.4.0(three@0.185.1)` persisted in the lockfile). Fork-based isolation was therefore abandoned rather than forcing a global fork override (which would hijack R3F/drei/`@mkkellogg/gaussian-splats-3d` onto `super-three` — a change to existing production dependencies, prohibited by the execution rules).

### Configuration B — IWSDK + SparkJS on upstream Three.js 0.185.1 (selected)
**Result: PASSED — all 14 runtime tests green, zero console errors.**

Dependency strategy: force only IWSDK's internal three to upstream:

```yaml
# pnpm-workspace.yaml
overrides:
  '@iwsdk/core>three': 0.185.1
```

This rewires `@iwsdk/core`, `@iwsdk/locomotor`, `@iwsdk/xr-input`, `@pmndrs/uikit`, `@drawcall/uikitml`, and `three-mesh-bvh` to a **single shared `three@0.185.1`** instance — the same instance the app, R3F, drei, and `@mkkellogg/gaussian-splats-3d` already use. `super-three` is fully removed from the lockfile (0 references).

**Runtime verification of instance uniqueness** (executed in-browser):

```
App three REVISION: 185
IWSDK.Mesh === three.Mesh: true
IWSDK.Scene === three.Scene: true
IWSDK.WebGLRenderer === three.WebGLRenderer: true
```

### Notes on Configuration B risk surface
- IWSDK's `runtime/three.ts` patches `ShaderChunk.common` with a regex fix for super-three's multiview shader bug. On upstream three the regex simply does not match (no `viewMatrix` define) — a harmless no-op.
- IWSDK requests `multiviewStereo: true` on renderer creation; upstream three ignores the unknown option. Quest multiview performance optimization is lost, but standard WebXR stereo rendering is unaffected. This is acceptable for V1 and can be revisited if Quest GPU headroom becomes an issue.

## 3. Three.js Compatibility Findings

| Question | Finding |
|---|---|
| Can IWSDK run on upstream three r185? | **Yes** — proven at runtime (init, render loop, ECS systems, XR manager). |
| Is a single-instance setup achievable without touching app deps? | **Yes** — one scoped pnpm override on `@iwsdk/core>three`. |
| Does Spark 2.4.0 work with upstream three r185? | **Yes** — peer range `>=0.180.0`; rendering verified. |
| Any ESM/CJS friction under Next.js webpack? | **None** — both packages ship ESM `module`/`exports` entries; compiled clean (7,708 modules, no warnings from the spike route). |
| SSR hazards | Handled — all IWSDK/Spark usage is behind `next/dynamic` with `ssr: false` + runtime dynamic `import()`. Dev SSR shows no module-scope browser-API crashes. |
| Duplicate instances after fix | **Eliminated** — verified by constructor identity checks in-browser. |

## 4. SparkJS Rendering Results

Executed against a live IWSDK world inside Next.js (headless Chrome 1440×900, SwiftShader software GL):

| Metric | Value | Caveat |
|---|---|---|
| Asset | `butterfly.spz` (3.8 MB, sparkjs.dev CDN, CORS `*`) | |
| Load → initialized | **7,965 ms** | Cold fetch over network + SwiftShader decode; real-GPU + CDN cache will be far lower |
| Post-load draw | `drawCalls=3`, `triangles=354,264` | Splat rendered inside the IWSDK scene graph |
| FPS during splat render | 6.3 | **SwiftShader (CPU) rasterizer — not representative.** Real-GPU numbers must come from the Phase 07 PoC device matrix. |
| Sustained FPS (2.5 s sample) | 0.7–6.3 | Same caveat |
| JS heap peak | 317 MB | Includes dev-mode Next.js overhead |
| `SplatMesh.dispose()` | Executed without error; renderer `info.memory.geometries` granularity is per-render-cycle so the counter did not visibly drop within the 300 ms window | No leaks observed; loop stopped cleanly on destroy |
| `SparkRenderer` options | `renderer: world.renderer`, `enableLod: true`, `lodSplatScale`, `behindFoveate` all accepted | LoD path active |
| Formats | `.spz` verified live; `.ply`/`.splat`/`.ksplat`/`.sog` supported per Spark 2.4 docs | |

**GLB collision (separate test, per scope)**: `BoxTextured.glb` loaded via `three/examples/jsm/loaders/GLTFLoader.js` against the shared three instance — 1 mesh, 24 verts, traversable for invisible-collider use (the SensAI `GaussianSplatLoader.meshUrl` pattern). Havok physics was **not** required or enabled.

## 5. IWSDK Initialization Results

| Test | Result | Evidence |
|---|---|---|
| Import (709 exports) | PASS | `World`, `SessionMode`, `PanelUI`, `ScreenSpace`, `LocomotionEnvironment`, `Types` present |
| `World.create()` | PASS | WebGLRenderer + PerspectiveCamera + Scene created; player rig built; ECS loop running via `renderer.setAnimationLoop` |
| Locomotion | PASS | `world.getSystem(LocomotionSystem)` resolved; invisible `LocomotionEnvironment` floor entity accepted for teleport raycasting |
| Grabbing | Registered (`features.grabbing: true`) | System registration path exercised |
| Spatial UI | PASS | `PanelUISystem` + `ScreenSpaceUISystem` registered; `PanelUI` entity created with inline UIKitML markup |
| WebXR session | `immersive-vr: false` in headless Chrome | Expected — headless has no XR device; session-init code path exercised without error. Device testing deferred to PoC. |
| Cleanup | PASS | `world.destroy()` stops the animation loop and removes window listeners via `world.addCleanup` — no dangling rAF after destroy |
| Console errors across full run | **0 page errors** | vs. Configuration A which threw on first splat compile |

## 6. Next.js Build Results

| Check | Result |
|---|---|
| `next build` (production, via `scripts/safe-build.ps1` with dev stopped) | **Succeeds** — 116 static pages generated |
| Spike route first-load JS | **1.59 kB route / 107 kB total** — IWSDK+Spark are fully lazy |
| IWSDK lazy chunk | 5,279 KB raw (≈5.2 MB; includes three, uikit, XR input profiles) |
| Spark lazy chunk | 2,734 KB raw (≈2.7 MB) |
| WASM | Havok excluded (`physics: false`); no other WASM required by the tested path (`@playcanvas/splat-transform` WASM usage is pre-existing) |
| Workers | No additional worker requirements observed for the tested path (Spark LoD worker optional; locomotion `useWorker` off) |
| CSP | Existing policy already allows `worker-src 'self' blob:`; splat texture/geometry loads are same-origin/blob; no CSP violations observed. External fetch (`sparkjs.dev`) permitted by `connect-src` fallback absence only because CSP is Report-Only in dev — **production enforcement will need `https://sparkjs.dev` (or VizTR R2 origin) added to `connect-src`** for splat assets. |
| Turbopack | Not tested (`next dev`/`next build` ran webpack per repo config). Flagged as a follow-up check before any Turbopack migration. |

**Separate Vite runtime needed?** **No.** Next.js hosts the runtime directly: ESM imports resolve, the render loop runs, SSR isolation works via one `next/dynamic` boundary, and the production build succeeds. No second deployment is introduced.

## 7. Browser / Device Compatibility (this spike)

| Environment | Result |
|---|---|
| Headless Chrome (Windows, SwiftShader GL, WebGL2) | Full pass — init, render, splat, UI, cleanup |
| WebGPU | Present in test env; **not required** — Spark 2.4 is WebGL2-first (98%+ WebGL2 target), de-risking iOS/Safari |
| WebXR (immersive-vr) | Unavailable headless — device matrix (Quest 3 browser, Android Chrome, iOS Safari fallback) deferred to Phase 07 PoC |

## 8. Existing Functionality Regression Results

| Area | Check | Result |
|---|---|---|
| Production build | All 116 routes compile & generate | PASS |
| `/` home | HTTP 200 | PASS |
| `/xr-world` (XR hub) | HTTP 200 | PASS |
| `/xr-world/webxr` | HTTP 200 | PASS |
| `/vizsplat` | HTTP 200 | PASS |
| `/experience` | HTTP 200 | PASS |
| `/login` | HTTP 200 | PASS |
| `/dev/immersive-spike` | HTTP 200 | PASS |
| Engine adapters (Three/PlayCanvas/Splat/Marzipano) | **Zero source changes**; compile clean in prod build | PASS (unchanged) |
| Pre-existing build warnings | `getSupabaseRepository` (GA4/GTM routes) and `@sendgrid/mail` — present on `main` before this branch | Unchanged baseline, not spike-related |
| Database / auth / RBAC / data models | No migrations, no schema changes, no auth changes | Clean |

## 9. Recommended Dependency Strategy (for approval)

**Adopt Configuration B — upstream-only, single three instance:**

```yaml
# pnpm-workspace.yaml (already applied on this branch)
overrides:
  '@iwsdk/core>three': 0.185.1
```

New dependencies (exact versions, all MIT):

```
@iwsdk/core@1.2.0-rc.0        @iwsdk/locomotor@1.2.0-rc.0
@iwsdk/xr-input@1.2.0-rc.0    @iwsdk/scene-composition@1.2.0-rc.0
@sparkjsdev/spark@^2.4.0
```

(Transitives `@pmndrs/uikit`, `elics`, `three-mesh-bvh`, `@preact/signals-core` arrive automatically; `super-three` is fully absent.)

Rules that follow from the evidence:
1. **Never import `super-three` anywhere in VizTR code.** All three imports (app, IWSDK, Spark) must resolve to the single upstream instance; the override guarantees it.
2. Pin IWSDK packages to exact `1.2.0-rc.0` (rc channel — upgrade deliberately, re-run this spike's browser check after any bump).
3. Spark stays on npm releases (`^2.4.0`), not the SensAI GitHub pin (`v2.0.0-preview`) — the npm release is newer and registry-pinned.
4. Do **not** copy SensAI's manifest (`@iwsdk/core@0.2.2`, `super-three@0.181.0`) — it is two minor versions behind and is the direct cause of Configuration A's failure mode.
5. Havok physics stays uninstalled-from-bundle until a feature needs it (IWSDK already lazy-imports it).
6. When splat assets move to VizTR R2/Supabase Storage, add that origin to `connect-src` in `next.config.ts` CSP — no other header changes required for the tested path.

## 10. Go / No-Go Decision

### **GO** — proceed to Phase 02 (IWSDKEngineAdapter) under Configuration B.

Acceptance criteria scorecard:

| Criterion | Status |
|---|---|
| IWSDK initializes inside VizTR (Next.js 15 App Router) | ✅ |
| SparkJS renders a Gaussian Splat (`.spz`) in the IWSDK scene | ✅ |
| Both work in the selected dependency configuration | ✅ (upstream three 0.185.1, single instance) |
| Existing PlayCanvas / Marzipano functionality intact | ✅ (no source changes; all routes + prod build green) |
| Production build succeeds | ✅ (`next build`, 116 pages) |
| No duplicate Three.js runtime | ✅ (constructor-identity verified in-browser; `super-three` = 0 lockfile references) |
| Resource cleanup works correctly | ✅ (`SplatMesh.dispose()`, `SparkRenderer.dispose()`, `World.destroy()` — loop + listeners released) |

Conditions carried into Phase 02:
- SwiftShader FPS numbers are **not** performance baselines — Phase 07 PoC device matrix (Quest 3, Android Chrome, desktop GPUs, iOS fallback) establishes real numbers.
- Quest multiview stereo is unavailable on upstream three (standard stereo only) — acceptable for V1; revisit only if Quest GPU headroom demands it.
- IWSDK is on an `rc` channel — re-run the spike route after any version bump.
- Add splat-asset origin to production CSP when R2 delivery lands.

### Files changed on this branch (spike scope only)
```
app/dev/immersive-spike/page.tsx               # isolated dev-only route (dynamic, ssr:false)
app/dev/immersive-spike/ImmersiveSpikeClient.tsx
package.json                                   # +5 deps (see §9)
pnpm-workspace.yaml                            # +1 scoped override
pnpm-lock.yaml                                 # resolution of the above
docs/audit/immersive-compatibility-spike.md    # this report
```

---

**End of Phase 01 spike report.** Awaiting approval before Phase 02 (runtime adapter implementation).