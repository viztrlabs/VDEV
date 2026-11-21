# VizTR Experience Platform — Development Plan

**Date**: 2026-11-22
**Basis**: Repository audit (`docs/audit/immersive-web-sdk-audit.md`), IWSDK/SparkJS spike (`docs/audit/immersive-compatibility-spike.md`), and the recommended architecture (three dashboards · one project system · service-specific runtimes).
**Principle**: build on the existing Next.js 15 + Supabase + EngineBridge architecture. Nothing is rewritten; gaps are filled additively.

---

## 0. Decision Required: Builder Access Model — ANSWERED

**Recommendation: clients do NOT get Builder access. Clients get the Experience Dashboard only, plus a lightweight approval/feedback surface embedded in it. The Builder is staff-only (artists, editors, PMs).**

Rationale, grounded in what the repo already enforces:

1. **RBAC already splits this way.** `lib/rbac.ts` defines `super_admin | admin | user | client` with client routes limited to `/app/client/*` (projects, invoices, meetings, support). The Builder surfaces (`/editor`, `/editor-projects`, `/app/user/editor`, forks of PlayCanvas/SuperSplat editors) have no client-scoped permission path today. Adding one means inventing a new permission tier across middleware, route guards, and RLS — cost with no product need.
2. **Security posture.** The Builder embeds third-party editor forks served from separate dev servers (`forks/editor` :3002, `forks/supersplat` :3487) and will host uploaded HTML packages (Pano2VR). Exposing any of this to clients expands the attack surface (editor scripts, upload endpoints, engine launch tokens) for zero client value.
3. **The client's actual job is approve and view.** The workflow that matters is: artist publishes a draft → client views it in the Experience Dashboard → client approves or comments. That is a *feedback* surface, not an *editing* surface. `components/xr` already has `HotspotPopup`, `ThreadedComments`, `VisualFeedbackSystem`, and a `deliverables`/`feedback` tables exist — the approval loop belongs there.
4. **Contract clarity.** `project_members` already models `owner/admin/editor/staff/client/viewer` per project — staff roles edit, client roles view. The plan formalizes exactly this; no new role is introduced.

**Concrete permission model:**

| Surface | super_admin | admin | user (artist) | client |
|---|---|---|---|---|
| Project Management (`/app/admin`) | ✅ | ✅ | own projects | ❌ |
| Builder (`/editor`, service editors, uploads) | ✅ | ✅ | ✅ (member of project with `editor`+) | ❌ |
| Experience Dashboard (`/experience/...`) | ✅ | ✅ | ✅ | ✅ (published experiences only, per project_services entitlement) |
| Approval actions (approve/request changes/comment on published draft) | ✅ | ✅ | ❌ | ✅ |
| Publishing control (draft → published) | ✅ | ✅ | ✅ (with review gate) | ❌ |

If the product later wants client-side asset uploads (e.g., client supplies reference photos), that is a scoped "Client Uploads" module inside the Experience Dashboard — still not Builder access.

---

## 1. Locked Decisions (with repo amendments)

| # | Decision | Status | Repo note |
|---|---|---|---|
| 1 | Three dashboards only (Management / Builder / Experience) | **Adopt** | Maps to existing `/app/admin` + `/app/user` (management), `/editor` + `/editor-projects` (builder), new unified Experience hub |
| 2 | One project + asset system shared by all dashboards | **Adopt** | `Project → project_services → experiences → experience_configs/assets` already exists (migration `20260903_phase1_project_model.sql`); asset system needs master/derivative extension (§4.1) |
| 3 | Pano2VR for Virtual Tour authoring + playback; Marzipano legacy | **Adopt with amendment** | The *existing* in-app tour builder (`toursRepo`, `TourViewer`, `MarzipanoEngineAdapter`) is Marzipano-based and has live data. Pano2VR becomes the artist-authoring path for **new** tours; Marzipano stays as the runtime for legacy/builder-built tours. Both run behind the same `virtual-tour` service, selected by experience config (`tour.mode: 'pano2vr' | 'scenes'`). Marzipano is **not uninstalled** until existing experiences are migrated or retired |
| 4 | PlayCanvas remains primary 3D runtime | **Adopt** | `PlayCanvasEngineAdapter` + forks/editor unchanged |
| 5 | IWSDK + SparkJS are candidates, adopt after isolated testing | **Already satisfied** | Spike complete on `spike/iwsdk-sparkjs-compatibility` (14/14 pass, single three instance, prod build green). Adoption = optional `runtime: 'iwSDK'` in experience config, never app-wide. Merge spike branch to `main` as the gate |
| 6 | Gallery/Media = shared project content module | **Adopt** | Add `gallery-media` service slug (entitlement + switcher parity); rendered with native `<img>/<video>` — no 3D engine. `lib/mediaLibrary.ts` reused |
| 7 | One published project URL, in-place service switching | **Adopt** | New project-hub route with client-side runtime mount/unmount via `engineBridge.detachAdapter()` — no full reload |
| 8 | Device-aware delivery with fallbacks | **Adopt** | New capability-detection module + AR Quick Look (USDZ) + 3D viewer fallback chain (§4.5) |

---

## 2. Current Stack → Target Mapping

| Capability | Today (verified) | Gap → Action |
|---|---|---|
| Next.js 15.5.29 App Router, React 19, TS 6, Tailwind 4 | ✅ prod build green | None — keep |
| Auth (NextAuth 4 + Supabase) | ✅ | None |
| RBAC (roles, routeAccess, project_members) | ✅ staff/client split exists | Add Experience-Dashboard client routes to `routeAccess`; approval actions for `client` |
| Project/Service/Experience/Config data model | ✅ `20260903_phase1_project_model.sql` | Extend additively: asset master/derivative, runtime column, tour packages |
| Asset records | ⚠️ flat `assets` table (url, storage_path, metadata) | Master/derivative + hash dedup + reference protection (§4.1) |
| Storage | ⚠️ Supabase Storage `viztr-assets`, folder RLS, signed-URL APIs exist (`/api/storage/signed-url`) | `StorageProvider` interface + Supabase impl; R2 behind same interface later, only after benchmark |
| EngineBridge + adapters (Three, PlayCanvas, Splat, Marzipano) | ✅ | Add `iwSDK`, `pano2vr`, `gallery` engine types + adapters |
| IWSDK + SparkJS | ✅ spike-verified on branch | Merge; IWSDKEngineAdapter in Phase 06 |
| Single-experience playback (`/experience/[slug]` → ExperienceViewer) | ✅ dispatches tour/playcanvas/splat | Extend dispatch + build project hub with switcher (§4.4) |
| Virtual Tour (Marzipano, in-app builder) | ✅ live system | Keep as legacy mode; add Pano2VR package path (§4.3) |
| Gaussian Splat playback | ⚠️ `@mkkellogg/gaussian-splats-3d` viewer | Benchmark SparkJS 2.4 vs mkkellogg in Phase 06; winner becomes default |
| SuperSplat editing | ✅ fork + `SplatEngineAdapter` | Unchanged |
| WebAR | ⚠️ marketing pages only | Capability detection + PlayCanvas XR-AR + USDZ Quick Look fallback (§4.5) |
| Gallery/Media | ⚠️ `mediaLibrary.ts`, no service | Service slug + GalleryViewer + hub tab |
| Texture/model optimization | ⚠️ `draco3d`, `meshoptimizer`, `ktx-parse` installed, not wired into pipeline | Processing pipeline in Phase 07 |
| Analytics/monitoring | ⚠️ GA4 + basic events | Runtime perf telemetry (FPS, load, memory) per experience in Phase 07 |

---

## 3. Phase Plan

### Phase 01 — Audit + runtime spike ✅ COMPLETE
- Audit delivered (`immersive-web-sdk-audit.md`); spike 14/14 (`immersive-compatibility-spike.md`).
- **Gate action**: merge `spike/iwsdk-sparkjs-compatibility` → `main` after approval. Deps land but nothing loads them outside `/dev/immersive-spike` until Phase 06.

### Phase 02 — Shared project + asset system (the critical path)
**Gate: one master asset referenced by multiple services without duplicating the master file.**

Migration (single additive file `supabase/migrations/2026xxxx_asset_system.sql`):
1. `assets` columns: `parent_asset_id uuid REFERENCES assets(id)`, `hash_sha256 text`, `asset_role text CHECK ('master','derivative')`, `service_slug text`, `version int DEFAULT 1`, `thumbnail_url text`.
2. New table `asset_references (id, asset_id FK, experience_id FK NULL, project_service_id FK NULL, created_at, UNIQUE(asset_id, experience_id, project_service_id))` — deletion protection = reject delete while references exist.
3. Indexes: `assets(hash_sha256)`, `assets(parent_asset_id)`, `asset_references(asset_id)`.
4. RLS mirroring existing `assets` policies.

Code:
- `lib/storage/types.ts` — `StorageProvider { upload(path, blob, contentType), download, signedUrl(path, ttl), publicUrl(path), delete, list(prefix), head }`.
- `lib/storage/supabase-provider.ts` — wraps existing client + signed-URL logic (move `app/api/storage/signed-url` internals here).
- `lib/storage/index.ts` — provider factory (`STORAGE_PROVIDER=supabase|r2` env).
- `lib/assets/hash.ts` — SHA-256 via WebCrypto on upload; dedup check before insert (`GET /api/assets?hash=...`).
- `app/api/assets/route.ts` — extend: accept `parentAssetId`, `assetRole`, `serviceSlug`; return dedup hits.
- `app/api/assets/[id]/derivatives/route.ts` + `app/api/assets/[id]/references/route.ts` (GET refs, guarded delete).
- Upload flow: client computes hash → dedup check → direct browser→Storage upload (folder-scoped RLS already permits) → POST metadata. Avoids Vercel serverless body limits for large splats/GLBs.

**Tests**: dedup re-upload returns existing id; derivative points to master; delete blocked while referenced; RLS: client cannot read unpublished project assets.

### Phase 03 — Project Management Dashboard
**Gate: PM can enable/disable purchased services per project and control client visibility.**

- Add `gallery-media` to service seed (additive seed migration, `ON CONFLICT DO NOTHING`).
- `app/admin/dashboard` sections (components/admin/sections): "Services" tab already exists conceptually via `projectServices.ts` — extend with: enable/disable toggle (`PATCH /api/project-services/[id]`), service requirements text, publishing visibility flags per experience.
- Publishing control: `experiences.status` draft/review/published already modeled; add `PATCH /api/experiences/[id]/status` with role check (staff publish, client cannot).
- Team & assignments: `project_members` UI + `/api/project-members` (exists in API list) — wire invite flow to existing `user_invitations` table.
- Commercials: reuse existing quotes/invoices modules; out of scope for this plan beyond linking.

### Phase 04 — Editor/Builder Dashboard
**Gate: artist uploads a Pano2VR export and a splat/GLB master, creates derivatives, and assembles an experience per service.**

1. **Asset Library panel** (shared across service editors): `components/builder/AssetLibraryPanel.tsx` — grid of master assets + derivatives, upload with dedup + progress, "Use in this experience" action writing `asset_references`. Backed by `/api/assets`.
2. **Pano2VR Tour editor** (`components/builder/Pano2VrPackageEditor.tsx` + `app/api/tour-packages/route.ts`):
   - Artist picks the exported folder/zip in-browser → JSZip (already a dep) extracts client-side → files upload directly to `tours/{experienceId}/v{n}/...` via Storage (correct content-types; relative paths preserved) → manifest POST `{ entryFile, fileCount, totalBytes, checksum }` → server validates entry exists + size budget → `tour_packages` row (additive migration: `id, experience_id, version, storage_prefix, entry_file, status('processing','ready','failed'), checksum, created_at`).
   - Config write: `experience_configs.config.tour = { mode: 'pano2vr', packageId }`.
3. **Service-specific editors**: WebXR/VR = existing PlayCanvas configurator (+ optional `runtime: 'iwSDK'` selector dropdown, disabled until Phase 06); Splat = existing SuperSplat integration (`SplatConfigurator`); Gallery = simple media picker.
4. **Preview**: staff-only preview renders the same Experience Viewer components with draft configs.

### Phase 05 — Experience Dashboard (the client-facing hub)
**Gate: one project URL, switch services without page reload, only entitled services visible.**

- Route: `app/experience/p/[projectSlug]/page.tsx` (server component: fetch project + enabled `project_services` + published experiences; 404 unless published or staff preview token).
- Shell: `components/experience/ProjectExperienceHub.tsx` (client):
  - Service switcher (WebXR / WebAR / VR / Virtual Tour / Splat / Gallery), entitlement-filtered.
  - `ExperienceRuntimeMount`: per-service dynamic import (`next/dynamic`, `ssr:false`) of the right viewer; **unmount previous runtime before mounting next** (`engineBridge.detachAdapter()` + component unmount = GPU/context release). Zustand (`components/xr/xr.store.ts`) holds active service; URL sync via `?service=` for shareable deep links.
  - Viewers: existing `PlayCanvasPublicViewer`, `GaussianSplatViewer`, `TourViewer` (Marzipano legacy), **new** `Pano2VrPlayer` (sandboxed iframe → storage-hosted package, §4.3), **new** `GalleryViewer`.
  - Project info drawer, full-screen, QR/share, analytics events, mobile controls.
- Capability banner from §4.5 (e.g., "VR available on this device" vs "3D preview fallback").
- `/experience/[slug]` (single experience) stays for share links — it becomes a thin redirect/embed of the hub with one service active. `/client-view/[accessCode]` unchanged.

### Phase 06 — Runtime compatibility & adoption
**Gate: Pano2VR + PlayCanvas + WebXR + SparkJS + fallbacks verified on the device matrix.**
1. Merge spike branch → implement `lib/3d/bridge/adapters/IWSDKEngineAdapter.ts` behind `runtime: 'iwSDK'` (spike code is the seed).
2. SparkJS benchmark vs `@mkkellogg/gaussian-splats-3d` on the same `.spz` asset: load time, FPS, GPU memory (real GPUs — spike's SwiftShader numbers are not baselines). Winner becomes default splat runtime.
3. Pano2VR device matrix: desktop Chrome/Safari/Firefox, iOS Safari, Android Chrome, Quest browser (package VR mode).
4. WebAR: PlayCanvas XR-AR on Android Chrome; USDZ Quick Look path on iOS; 3D viewer fallback elsewhere.
5. IWSDK headset test (Quest 3) — teleport, grab, spatial UI, 72/90 Hz stability.

### Phase 07 — Performance & production hardening
**Gate: budgets met, monitoring live, security review passed.**
- Optimization pipeline (queued background processing): GLB → meshopt/Draco; textures → KTX2 (`ktx-parse` + `@gltf-transform/*` already installed); splat → `.spz` + LoD variants. Worker: start with Vercel cron + API route processing; escalate to a queue only if volume demands.
- Runtime telemetry: FPS/frame-time/context-loss/memory events per experience session → existing analytics pipeline.
- CSP updates in `next.config.ts`: `frame-src` += storage host (Pano2VR iframes), `connect-src` += storage host (splat fetches). No other header changes.
- Load testing on hub route; cache headers for immutable derivative paths; monitoring dashboards.
- Security review: Pano2VR package validation (entry allowlist, size caps, no server-side HTML execution — isolation via cross-origin iframe), signed-URL TTLs, RLS audit on new tables.

---

## 4. Key Technical Designs

### 4.1 Asset master/derivative model
```
assets (master)  ←— assets (derivative, parent_asset_id, service_slug, version)
        ↑                            ↑
        └──── asset_references ──────┘  (experience / project_service usage)
```
- Upload once → hash → dedup → derivatives registered against master per service.
- "Delete from WebXR experience" removes the `asset_reference` + derivative, never the master while other references exist.
- Pano2VR packages and splat LoD sets are derivative *bundles* (`asset_role='derivative'`, `metadata.kind='tour-package'|'splat-lod'`).

### 4.2 Storage abstraction
`StorageProvider` interface (§Phase 02). Supabase implementation first (existing bucket + RLS + signed URLs). R2 provider implemented only after benchmarking bandwidth/cost/limits — the interface makes it a config swap, not a migration.

### 4.3 Pano2VR hosting & playback (security-critical)
- **Upload**: client-side unzip (JSZip) → direct-to-storage batch upload under `tours/{experienceId}/v{n}/` → manifest registration + validation. No serverless upload bottleneck; no server-side zip execution.
- **Playback**: `<iframe src={storagePublicUrl(entry)} sandbox="allow-scripts allow-same-origin allow-pointer-lock" allow="xr-spatial-tracking; fullscreen">`. The storage host is cross-origin to the app, so package scripts cannot touch VizTR cookies/DOM — isolation by construction.
- **CSP**: add storage host to `frame-src` + `connect-src` only.
- **VR mode**: Pano2VR's WebXR entry runs inside the iframe with `xr-spatial-tracking` permission policy.
- **Versioning**: `v{n}` prefixes; publish flips pointer row; rollback = repoint.

### 4.4 Runtime selection & switching
- `lib/3d/bridge/types.ts`: `EngineType = 'three' | 'playcanvas' | 'marzipano' | 'iwSDK' | 'pano2vr' | 'gallery'`.
- Experience config gains `runtime` (default per service: webxr/vr→`playcanvas`, splat→`mkkellogg` until benchmark, tour→`marzipano` for legacy scenes / `pano2vr` for packages, gallery→`gallery`).
- Hub switching = unmount previous viewer (adapter destroy → context freed) → dynamic import next → mount. No duplicate WebGL contexts; verified pattern from spike cleanup tests.

### 4.5 Device capability + fallback chain
`lib/xr/capabilities.ts`:
```
detect(): { webxrVR, webxrAR, webgpu, quickLook(iOS), touch, mobile }
```
- WebAR: `webxrAR` → PlayCanvas AR session → else `quickLook` → USDZ Quick Look (`<a rel="ar">`) → else interactive 3D viewer → else gallery.
- WebXR/VR: `webxrVR` → "Enter VR" button → else desktop simulation/preview.
- USDZ derivative generation flagged as a Phase 06 risk (requires conversion tooling — external service or `usdz` wasm converter; decision deferred until a real AR client project needs it).

---

## 5. Pilot Acceptance — Luxury Villa 2050
1. One master asset set uploaded (villa GLB master, panorama set, splat master, media pack).
2. Derivatives generated: optimized GLB (WebXR/VR), mobile GLB (WebAR), `.spz` splat (Splat), Pano2VR package (Tour).
3. All five services enabled on the project; published.
4. `/experience/p/luxury-villa-2050` loads; switching WebXR → Tour → Splat → Gallery without reload; no duplicate master uploads anywhere (verified via dedup hashes + `asset_references`).
5. Client account sees only published services; approval/comment works from the hub.
6. Device matrix passes (desktop + Android + iOS fallbacks).

---

## 6. Risks & Dependencies

| Risk | Impact | Mitigation |
|---|---|---|
| Pano2VR export variations (skins, multires layouts) | Playback breakage | Validate manifest at upload; test against 7.1 + 7.2 exports in Phase 06 |
| USDZ conversion tooling unknown | WebAR iOS path delayed | Fallback chain ships regardless; USDZ deferred until required |
| IWSDK rc-channel churn | Adapter breakage | Pinned exact versions; spike route re-run on bump; PlayCanvas remains default |
| Spark vs mkkellogg performance on low-end mobile | Viewer regression | Benchmark gate in Phase 06 before switching default |
| Large package uploads on slow links | Artist UX | Client-side batching + resumable signed uploads; progress UI |
| Dual tour engines during migration | Complexity | Config-selected mode; retirement checklist for Marzipano after last legacy tour migrates |
| Prisma/Supabase-js duality | Consistency | Out of scope — existing convention preserved per non-negotiables |

---

## 7. Immediate Next Actions (on approval)
1. Merge `spike/iwsdk-sparkjs-compatibility` → `main`.
2. Phase 02 migration + `StorageProvider` + asset APIs (largest unknown removed first).
3. `gallery-media` seed + Experience hub skeleton behind a feature flag (`feature-flags.ts` already exists).
4. Pano2VR upload prototype with a real 7.x export package.
