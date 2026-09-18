# VizTR Development Tracker
## Three-Dimensional Architecture / Implementation / Production Audit
**Generated:** 2026-09-18 (revised)
**Repository:** VizTR (Next.js App Router + Supabase)
**Database:** Supabase project `naludjmicbqcagrlsrba`

---

# 1. Executive Summary

VizTR has a solid foundational architecture with 30+ database tables, 18+ migrations, 74 API routes, and 9 service definitions. The domain model is clean (PROJECT ≠ SERVICE ≠ ASSET ≠ EXPERIENCE ≠ DELIVERABLE) with proper FK chains.

However, the codebase has **significant structural debt** that must be resolved before building new features:

- **Two parallel admin systems** sharing no code, layout, or data layer
- **Two parallel client systems** with different UIs and data sources
- **Three tour persistence layers** (filesystem + Supabase fallback + Supabase)
- **Duplicate project tables** (`projects` vs `"Project"`)
- **Duplicate auth/helper/client implementations** across the codebase
- **Virtual Tour** outside the unified Project model (legacy `tours` table)
- **7+ editor entry points** with 30+ orphaned panel components
- **Critical security issues**: queryable `password_hash`, open editor reads, unauthenticated endpoints
- **9 unused forks** (5.1 GB) not imported by the main app

**Do not build new services (WebAR, VR, Splat, Pixel Streaming) on top of the current structural duplication.**

### Assessment Summary

| Dimension | Status |
|---|---|
| **Architecture** | NEEDS RESTRUCTURING |
| **Implementation** | PARTIAL (advanced foundation in some areas) |
| **Production** | BLOCKED until security remediated |

---

# 2. Current Overall Status

## Architecture Status

| Area | Status | Evidence |
|---|---|---|
| Domain Model | ADVANCED FOUNDATION | Clean PROJECT ≠ SERVICE ≠ ASSET ≠ EXPERIENCE ≠ DELIVERABLE with proper FK chains |
| Data Model | NEEDS RESTRUCTURING | 3 table "universes"; duplicate project tables; duplicate xr_links; duplicate revenue data |
| Admin Architecture | NEEDS RESTRUCTURING | Two parallel systems: legacy monolith + SaaS role-based; share no code |
| Client Architecture | NEEDS RESTRUCTURING | Two parallel systems: legacy client-dashboard + SaaS portal |
| Editor Architecture | NEEDS CONSOLIDATION | 7+ entry points; canonical route exists but 30+ panel components orphaned |
| Virtual Tour | NEEDS MIGRATION | Legacy tours table independent from project model; 3 persistence layers |
| Route Structure | NEEDS CONSOLIDATION | Duplicate routes; (saas) route group empty |
| Auth Architecture | PARTIAL | Two auth helper systems; demo accounts gated; client portal token separate |
| RBAC | ADVANCED FOUNDATION | Single canonical lib/rbac.ts; 4 roles; middleware guards work |
| Real-time | ADVANCED FOUNDATION | Single lib/useRealtime.ts; 6 table subscriptions; polling fallback |

## Implementation Status

| Area | Status | Evidence |
|---|---|---|
| Core Data Model | NEAR COMPLETE | 30 tables, 18+ migrations, RLS enabled; duplicate tables need reconciliation |
| Authentication | ADVANCED FOUNDATION | NextAuth + credentials + Google OAuth + demo accounts + client portal token |
| API Surface | PARTIAL | 74 routes; 53 real, 11 mock, 2 filesystem, 3 CMS (no implementation), 5 no auth |
| Client Dashboard | PARTIAL | 30+ components; real-time syncing; RLS blocks anon realtime |
| Admin Dashboard | PARTIAL / DUPLICATED | Legacy monolith works; SaaS pages exist; super admin entirely mock-backed |
| Virtual Tour | ADVANCED FOUNDATION | Most complete service; viewer, editor, dashboard, hosting, showcase; filesystem fallback |
| WebXR | ADVANCED FOUNDATION | PlayCanvas viewer works; GLB upload works; XR links published; PlayCanvas Cloud dormant |
| WebAR | PARTIAL | No real AR marker/image tracking; basic Three.js overlay |
| Virtual Reality | PARTIAL | Basic WebXR mode; no dedicated VR viewer |
| Gaussian Splat | PARTIAL | WebGPU viewer works; no processing/generation pipeline |
| Pixel Streaming | FOUNDATION | API clean (honest 503); no GPU infrastructure |
| Still Renders | PARTIAL | No dedicated render viewer or preview |
| Animation/Walkthrough | PARTIAL | No animation pipeline |
| Publishing | FOUNDATION | Publish action exists; no job queue, no tracking |
| Storage | ADVANCED FOUNDATION | Supabase Storage with chunked upload; public bucket; no signed URLs |
| Real-time | PARTIAL | 6 tables in publication; client-side only |

## Production Status

| Area | Status | Blockers |
|---|---|---|
| Authentication | CONDITIONAL | Demo accounts work on non-production; real login requires Supabase env |
| RLS / Data Boundary | BLOCKED | `password_hash` queryable; editor reads open; forms/tour media unauthenticated |
| API Security | BLOCKED | `forms/[type]` NO auth; `tour/media` NO auth; rate limiting in-memory |
| Filesystem Persistence | BLOCKED | `tourStore`/`tourCollaboration`/`tourSettings` write to `.data/tour/` |
| Storage | CONDITIONAL | Public bucket works; signed URLs return 501 |
| Pixel Streaming | NOT READY | No GPU controller; returns simulated/503 |
| PlayCanvas Cloud | NOT READY | `PLAYCANVAS_API_KEY` not set |
| Redis | NOT READY | `UPSTASH_REDIS_REST_URL` not set |
| Collaboration Server | NOT READY | Falls back to `localhost:4000` |
| Mock Data | DEFERRED | 11 admin API routes + super admin store + contact store = mock |

---

# 3. Architecture Status

## 3.1 Domain Model

```
PROJECT → project_services (junction) → SERVICE
         → experiences → experience_configs
         → assets
         → deliverables
         → project_members
```

**Status: ADVANCED FOUNDATION** — Clean, distinct entities with proper FK chains.

## 3.2 Data Model Issues

| Issue | Severity | Location |
|---|---|---|
| `projects` (lowercase) vs `"Project"` (quoted) — two separate project tables | HIGH | `20250101000000_init_clients_projects.sql` vs `20260903_phase1_project_model.sql` |
| `xr_links` created twice (schema.sql + migration) | MEDIUM | `schema.sql:215` vs `20260909_xr_links.sql:4` |
| `revenue_metrics` table vs `mv_revenue_monthly` view | LOW | `20260910_rbac_normalization.sql` vs `20260918_revenue_metrics.sql` |
| 3 table "universes" (Prisma, lowercase custom, editor) | HIGH | Multiple migrations |

## 3.3 Admin Architecture

**Two parallel systems coexist:**

| System | Route | Layout | Data Source | Status |
|---|---|---|---|---|
| Legacy monolith | `/admin/dashboard` | 1077-line layout | `useAppStore` + Supabase Realtime | WORKS |
| SaaS role-based | `/app/admin/*` (14 pages) | `RoleLayout` component | Independent page-level fetches | WORKS |

**They share no code, no layout, no data layer.** Both are functional. The canonical boundary must be established before any migration.

## 3.4 Client Architecture

| System | Route | Pages | Status |
|---|---|---|---|
| Legacy | `/client-dashboard` | 1 page | WORKS |
| SaaS portal | `/app/client/*` | 21 pages | WORKS |

## 3.5 Editor Architecture

| Entry Point | Route | Status |
|---|---|---|
| Canonical | `/admin/projects/[projectId]/editor-dashboard/[service]` | WORKS (PR #3) |
| User editor | `/app/user/editor` | EXISTS |
| Generic editor | `/editor/[projectId]` | EXISTS |
| Editor projects | `/editor-projects` | EXISTS |
| Creator 3D | `/creator/3d-editor` | EXISTS |
| Creator SuperSplat | `/creator/supersplat` | EXISTS |
| VT editor | `/xr-world/virtual-tour/editor` | DEAD (redirects to canonical) |
| Splat editor | `/xr-world/vizsplat/editor` | EXISTS |

**30+ panel components in `components/editor/` are orphaned** — only used by the dead tour editor page.

---

# 4. Product Structure Status

## Target Architecture

```
VIZTR
├── STUDIO
│   ├── Still Renders
│   └── Animation / Walkthrough
├── XR WORLD
│   ├── WebXR
│   ├── WebAR
│   ├── Virtual Reality
│   ├── Virtual Tour
│   ├── Gaussian Splat
│   └── Pixel Streaming
├── PROJECTS
├── CLIENT PLATFORM
└── ADMIN PLATFORM
```

## Current Route Tree (Key Routes)

| Route | Purpose | Status |
|---|---|---|
| `/` | Homepage | WORKS |
| `/studio` | Studio hub | WORKS |
| `/studio/exterior`, `/studio/interior`, `/studio/walkthrough` | Service showcase | WORKS |
| `/xr-world` | XR hub | WORKS |
| `/xr-world/webxr`, `/webar`, `/virtual-reality` | Service showcase | WORKS |
| `/xr-world/virtual-tour/*` (6 sub-pages) | VT subsystem | WORKS |
| `/xr-world/vizsplat`, `/super-splat`, `/splat-showcase` | Splat pages | WORKS |
| `/login`, `/signup` | Auth | WORKS |
| `/admin/dashboard` | Legacy admin | WORKS |
| `/admin/projects/[projectId]/editor-dashboard/[service]` | Canonical editor | WORKS (PR #3) |
| `/app/admin/*` (14 pages) | SaaS admin | WORKS |
| `/app/user/*` (14 pages) | SaaS user | WORKS |
| `/app/client/*` (21 pages) | SaaS client | WORKS |
| `/experience/[slug]` | Public experience | WORKS |
| `/experience-live/[projectId]` | Live experience | WORKS (moved from `/experience/[projectId]`) |
| `/virtual-tour/[tourId]` | Public tour viewer | WORKS |

---

# 5. Project Architecture Status

**Is Project the central hub? YES — with caveats.**

The Phase 1 data model establishes Project as the central entity. The canonical route `/admin/projects/[projectId]/editor-dashboard/[service]` works correctly.

**Issues:**
1. Canonical route is under `/admin/projects/` (legacy tree), not `/app/admin/projects/` (SaaS tree)
2. `/app/admin/projects` page exists but has no sub-routes for `[projectId]` or `editor-dashboard`
3. Super Admin SaaS pages don't exist (15 routes, 0 pages, all redirect)
4. Project data hydration at admin level uses old `/api/admin/projects` endpoint

---

# 6. Database Status

## Table Status Matrix

| Table | Purpose | Status | Duplicate? | Legacy? |
|---|---|---|---|---|
| `"Project"` (Prisma) | Core project model | ACTIVE | YES (vs `projects`) | NO |
| `"User"` (Prisma) | User accounts | ACTIVE | NO | NO |
| `"Service"` (Prisma) | Service catalog | ACTIVE | NO | NO |
| `projects` (lowercase) | Client portal projects | ACTIVE | YES (vs `"Project"`) | QUESTIONABLE |
| `clients` | Client contacts | ACTIVE | NO | NO |
| `profiles` | Auth user profiles | ACTIVE | NO | NO |
| `tours` | Virtual tours | ACTIVE | NO | LEGACY (outside project model) |
| `tour_members` | Tour team | ACTIVE | NO | LEGACY |
| `tour_comments` | Tour comments | ACTIVE | NO | LEGACY |
| `tour_tasks` | Tour tasks | ACTIVE | NO | LEGACY |
| `tour_waypoints` | Tour waypoints | ACTIVE | NO | LEGACY |
| `xr_links` | XR link publish | ACTIVE | YES (created twice) | NO |
| `project_services` | Project-service entitlements | ACTIVE | NO | NO |
| `experiences` | Experience definitions | ACTIVE | NO | NO |
| `experience_configs` | Experience config | ACTIVE | NO | NO |
| `deliverables` | Deliverables | ACTIVE | NO | NO |
| `assets` | Project assets | ACTIVE | NO | NO |
| `project_members` | Project team | ACTIVE | NO | NO |
| `studio_profile` | Studio settings | ACTIVE | NO | NO |
| `documents` | CRM documents | ACTIVE | NO | NO |
| `leads` | Sales leads | ACTIVE | NO | NO |
| `bookings` | Bookings | ACTIVE | NO | NO |
| `editor_projects` | 3D editor projects | ACTIVE | NO | NO |
| `editor_scenes` | Editor scenes | ACTIVE | NO | NO |
| `editor_assets` | Editor assets | ACTIVE | NO | NO |
| `editor_branches` | Editor branches | ACTIVE | NO | NO |
| `editor_checkpoints` | Editor checkpoints | ACTIVE | NO | NO |
| `gpu_nodes` | GPU monitoring | ACTIVE | NO | NO |
| `feature_toggles` | Feature flags | ACTIVE | NO | NO |
| `system_logs` | System logs | ACTIVE | NO | NO |
| `activity_logs` | Activity audit | ACTIVE | NO | NO |
| `feedback` | Project feedback | ACTIVE | NO | NO |
| `revenue_metrics` | Revenue data | ACTIVE | YES (vs MV) | NO |
| `upload_sessions` | Chunked uploads | ACTIVE | NO | NO |
| `vted_projects` | VTED projects | ACTIVE | NO | NO |
| `mv_revenue_monthly` | Revenue MV | ACTIVE | YES (vs table) | NO |

**Total: 30 unique tables + 1 materialized view**

---

# 7. Route / IA Status

## Complete Route Inventory

| Category | Count | Status |
|---|---|---|
| Marketing/Public | ~20 | WORKS |
| Service Showcase | ~15 | WORKS |
| Auth | 7 | WORKS |
| SaaS App Shell | ~50 | PARTIAL (empty (saas) group) |
| Legacy Admin | 5 | WORKS |
| Client Portal | ~25 | WORKS |
| Other Functional | ~15 | MIXED |
| API Routes | 74 | MIXED (53 real, 21 mock/filesystem) |

## Duplicate Routes

| Route A | Route B | Issue |
|---|---|---|
| `/virtual-tour/[tourId]/` | `/xr-world/virtual-tour/` (6 sub-pages) | Two tour systems |
| `/vizsplat/` | `/xr-world/vizsplat/` | Two splat pages |
| `/client-dashboard` | `/app/client/*` | Two client systems |
| `/admin/dashboard` | `/app/admin/*` | Two admin systems |

---

# 8. Dashboard Status

## Hierarchy

```
SUPER ADMIN → ADMIN/STAFF → CLIENT → PROJECT → SERVICE → EXPERIENCE → EDITOR
```

| Level | Route | Page Exists | Role Guard |
|---|---|---|---|
| SUPER ADMIN | `/app/super-admin/*` | NO (15 routes, all redirect) | RBAC defined but phantom |
| SUPER ADMIN (actual) | `/admin/dashboard` | YES (monolith) | middleware.ts |
| ADMIN | `/app/admin/*` | YES (14 pages) | middleware.ts + RBAC |
| STAFF | `/app/user/*` | YES (14 pages) | middleware.ts + RBAC |
| CLIENT | `/app/client/*` | YES (21 pages) | middleware.ts + RBAC |
| PROJECT | `/admin/projects/[projectId]/editor-dashboard` | YES | `/admin/*` guard |
| SERVICE | `/admin/projects/[projectId]/editor-dashboard/[service]` | YES | Same |
| EDITOR | Service editor panels | YES | `PermissionProvider` |

---

# 9. Editor Status

## Canonical Editor

**Route:** `/admin/projects/[projectId]/editor-dashboard/[service]`
**Status:** WORKS (PR #3)
**DRY:** 9 per-service editors collapsed to 1 dynamic route

## Editor Components

| Component | Purpose | Status |
|---|---|---|
| `service-editor-tabs.tsx` | Tab configuration | WORKS |
| `service-meta.ts` | Service metadata | WORKS |
| `service-shell.tsx` | Editor shell | DEAD (unused) |
| `components/editor/` (34 files) | VT editor panels | ORPHANED (only used by dead tour editor) |

---

# 10. State Management Status

## Store Inventory

| Store | Purpose | Canonical? | Status |
|---|---|---|---|
| `useAppStore` (lib/store.ts) | Global state | YES | WORKS |
| `useEditorStore` (lib/editorStore.ts) | Tour editor | YES | WORKS |
| `useTourStore` (lib/tourClientStore.ts) | Tour client | DUPLICATE | APPEARS UNUSED |
| `useSuperAdminStore` | Super admin | YES | MOCK-BACKED |
| `useBookingStore` | Bookings | YES | WORKS |
| `useCMSStore` | CMS | YES | LOCALSTORAGE |
| `useCredentialsStore` | API credentials | YES | LOCALSTORAGE |
| `useXRStore` | WebXR | YES | WORKS |

## Server-Side Stores

| Store | Backend | Status |
|---|---|---|
| `tourStore.ts` | FILESYSTEM | PRODUCTION BLOCKER |
| `tourCollaboration.ts` | FILESYSTEM + Supabase | PRODUCTION BLOCKER |
| `tourSettings.ts` | FILESYSTEM | PRODUCTION BLOCKER |
| `projectsStore.ts` | Supabase | WORKS |
| `floorplanStore.ts` | FILESYSTEM | PRODUCTION BLOCKER |
| `xr-links-store.ts` | Supabase + in-memory fallback | WORKS |
| `leadsStore.ts` | Supabase | WORKS |
| `contact-store.ts` | IN-MEMORY | MOCK |

---

# 11. API Status

## Classification

| Category | Count | Real | Mock/Filesystem |
|---|---|---|---|
| AUTH | 2 | 2 | 0 |
| PROJECT | 7 | 7 | 0 |
| CLIENT | 2 | 1 | 1 |
| SERVICE | 1 | 1 | 0 |
| ASSET | 3 | 3 | 0 |
| UPLOAD | 2 | 2 | 0 |
| EXPERIENCE | 3 | 3 | 0 |
| EDITOR | 6 | 4 | 2 |
| TOUR | 10 | 9 | 1 |
| ADMIN | 18 | 7 | 11 |
| ANALYTICS | 2 | 2 | 0 |
| FEEDBACK | 3 | 1 | 2 |
| ACTIVITY | 2 | 2 | 0 |
| XR | 4 | 4 | 0 |
| PIXEL_STREAMING | 3 | 3 | 0 |
| AI | 2 | 2 | 0 |
| CMS | 3 | 0 | 3 |
| DISCOVERY | 1 | 0 | 1 |
| **TOTAL** | **74** | **53** | **21** |

## Unauthenticated Endpoints

| Route | Issue |
|---|---|
| `/api/forms/[type]` | NO auth, NO rate limiting |
| `/api/tour/media` | NO auth |
| `/api/experiences/public/[slug]` | Public by design (OK) |
| `/api/deliverables/public/[id]` | Public by design (OK) |
| `/api/xr-links/public/[slug]` | Public by design (OK) |

---

# 12. Security Status

## Security Blockers

| # | Issue | Severity | Location | Fix |
|---|---|---|---|---|
| S1 | `clients` table: any authenticated user can read `password_hash` + `portal_access_code` | CRITICAL | `20260916_clients_projects_rls_fix.sql` | Drop `clients_auth_read`; add column-level restrictions |
| S2 | Editor tables: any authenticated user can read all projects regardless of ownership | HIGH | `20260916_editor_rls_fix.sql` | Change to owner-only or project-member-only |
| S3 | `forms/[type]` has NO auth, NO rate limiting | HIGH | `app/api/forms/[type]/route.ts` | Add `requireAuth()` |
| S4 | `tour/media` has NO auth | HIGH | `app/api/tour/media/route.ts` | Add `requireAuth()` |
| S5 | Storage bucket fully public; signed URLs return 501 | MEDIUM | `app/api/storage/[id]/signed-url/route.ts` | Implement signed URLs |
| S6 | Hardcoded dev JWT secret fallback | MEDIUM | `lib/auth.ts:157` | Remove fallback |

## Auth Architecture

- **Primary:** NextAuth.js (JWT, credentials + Google OAuth)
- **Secondary:** Client portal token (HMAC-SHA256)
- **Roles:** super_admin, admin, user, client
- **Demo accounts:** 5 accounts, gated by `!isProduction()`
- **Two auth helper systems:** `lib/api-guard.ts` + `lib/api/auth.ts`

---

# 13. Storage Status

- **Backend:** Supabase Storage (`viztr-assets` bucket, public, 500MB limit)
- **Upload:** Single-file + chunked upload via `upload_sessions` table
- **Signed URLs:** NOT IMPLEMENTED (returns 501)
- **Filesystem stores:** tourStore, tourCollaboration, tourSettings, floorplanStore, editor/sync — ALL PRODUCTION BLOCKERS

---

# 14. Service-by-Service Status

| Service | Architecture | UI | API | Editor | Asset | Preview | Publish | Supabase | Completeness |
|---|---|---|---|---|---|---|---|---|---|
| Still Renders (Exterior) | YES | YES | YES | NO | YES | NO | YES | YES | 40% |
| Still Renders (Interior) | YES | YES | YES | NO | YES | NO | YES | YES | 40% |
| Animation/Walkthrough | YES | YES | YES | NO | YES | NO | YES | YES | 35% |
| WebXR | YES | YES | YES | YES | YES | YES | YES | YES | 75% |
| WebAR | YES | YES | YES | YES | YES | PARTIAL | YES | YES | 45% |
| Virtual Reality | YES | YES | YES | YES | YES | PARTIAL | YES | YES | 40% |
| Virtual Tour | YES | YES | YES | YES | PARTIAL | YES | PARTIAL | PARTIAL | 70% |
| Gaussian Splat | YES | YES | NO | YES | PARTIAL | YES | NO | PARTIAL | 45% |
| Pixel Streaming | YES | YES | YES | YES | NO | PARTIAL | NO | N/A | 30% |

---

# 15. Mock / Deferred Systems

## Critical Mock Systems (Production-Breaking)

| # | System | File | Mock Type | Priority |
|---|---|---|---|---|
| M1 | Super Admin Store | `lib/super-admin-store.ts` | Mock repository | HIGH |
| M2 | Mock Repositories | `lib/repositories/mock-repositories.ts` | 694-line localStorage mock | HIGH |
| M3 | Admin GPU Route | `app/api/admin/gpu/route.ts` | Hardcoded mock nodes | HIGH |
| M4 | Admin Tours Route | `app/api/admin/tours/route.ts` | In-memory mock | HIGH |
| M5 | Admin Users Route | `app/api/admin/users/route.ts` | In-memory mock | HIGH |
| M6 | Contact Store | `lib/contact-store.ts` | In-memory array | MEDIUM |

## Filesystem Persistence (Production Blockers)

| # | System | File | Backend | Issue |
|---|---|---|---|---|
| F1 | Tour Store | `lib/tourStore.ts` | `.data/tour/local-tour.json` | Data lost on restart; breaks on Vercel |
| F2 | Tour Collaboration | `lib/tourCollaboration.ts` | `data/tour/multi-tour.json` | Same |
| F3 | Tour Settings | `lib/tourSettings.ts` | `.data/tour/` | Same |
| F4 | Floorplan Store | `lib/floorplanStore.ts` | `.data/tour/floorplans.json` | Same |
| F5 | Editor Sync | `app/api/editor/sync/route.ts` | `data/editor/` | Same |

## Deferred (Acceptable for Dev)

| System | Status |
|---|---|
| Admin revenue analytics | MOCK — accept for dev |
| Admin feature toggles | MOCK — accept for dev |
| Admin bookings | MOCK — accept for dev |
| Discovery/search | MOCK — accept for dev |
| AI modules | SIMULATION — accept for dev |

---

# 16. Infrastructure Status

## Forks Classification

| Fork | Size | Classification | Rationale |
|---|---|---|---|
| `editor` | 624 MB | FUTURE/OPTIONAL | PlayCanvas editor server; standalone deployment |
| `editor-src` | 576 MB | FUTURE/OPTIONAL | PlayCanvas editor source |
| `supersplat` | 234 MB | FUTURE/OPTIONAL | Gaussian Splat editor; standalone |
| `supersplat-viewer` | 134 MB | FUTURE/OPTIONAL | Splat viewer; standalone |
| `engine` | 342 MB | FUTURE/OPTIONAL | PlayCanvas engine fork |
| `observer` | 117 MB | EXPERIMENTAL | No evidence of use |
| `pcui` | 325 MB | FUTURE/OPTIONAL | PlayCanvas UI components |
| `pcui-graph` | 239 MB | EXPERIMENTAL | No evidence of use |
| `developer-site` | 2,605 MB | LEGACY/ABANDONED | Docusaurus; 2.6 GB; no active use |

**None are imported by the main app.** Total: 5.1 GB of unused forks.

## Missing Infrastructure

| System | Status | Impact |
|---|---|---|
| GPU Controller | NOT DEPLOYED | Pixel Streaming non-functional |
| Redis | NOT CONFIGURED | Rate limiting degraded |
| PlayCanvas Cloud | DORMANT | WebXR publish blocked |
| WebRTC Signaling | URL set, unconfirmed | May not work |
| TURN Server | URL set, unconfirmed | May not work |
| Collaboration Server | No URL | Falls back to localhost |

---

# 17. Completed Development

- Phase 0 — Architecture audit complete
- Phase 1 — Security/storage blockers fixed (filesystem → Supabase for projects, storage, xr-links, pixel streaming)
- Phase 2 — Project/service/asset model wired to dashboards; experience viewers; seed data; realtime publication
- Phase 3 — Admin/editor consolidation (PR #3): canonical route, DRY 9→1, under-admin removed, dead XR routes removed
- Domain model: clean PROJECT ≠ SERVICE ≠ ASSET ≠ EXPERIENCE ≠ DELIVERABLE
- RBAC: 4 roles, middleware guards, canonical lib/rbac.ts
- Real-time: 6 table subscriptions with polling fallback
- Auth: NextAuth + credentials + Google OAuth + demo accounts + client portal token

---

# 18. Partially Completed Development

- Client dashboard: 30+ components exist; realtime has RLS issue
- Admin dashboard: legacy monolith works; SaaS pages exist; super admin mock-backed
- Virtual Tour: most complete service (70%); filesystem fallback blocks production
- WebXR: 75% — viewer works; PlayCanvas Cloud dormant
- Storage: chunked upload works; signed URLs return 501
- Publishing: publish action exists; no job queue

---

# 19. Missing Development

- Super admin SaaS pages (15 routes, 0 pages)
- Service-specific processing pipelines
- Async publish pipeline (publish_jobs table)
- Service status tracking
- Notifications table
- QR tracking
- Signed URL generation
- Proper CSRF protection on public forms

---

# 20. Blocked Development

| Blocker | Impact | Dependencies |
|---|---|---|
| Security: `password_hash` queryable | Cannot go to production | Phase B |
| Security: editor reads open | Cannot go to production | Phase B |
| Security: unauthenticated endpoints | Cannot go to production | Phase B |
| Filesystem persistence | Tour data lost on restart; breaks on Vercel | Phase E (VT migration) |
| Dual admin systems | Cannot maintain or extend admin cleanly | Phase A |
| Duplicate project tables | Data inconsistency risk | Phase A |

---

# 21. Architecture Debt

| # | Debt | Severity | Location |
|---|---|---|---|
| D1 | Two admin systems | HIGH | `/admin/dashboard` vs `/app/admin/*` |
| D2 | Two client systems | HIGH | `/client-dashboard` vs `/app/client/*` |
| D3 | Three tour persistence layers | HIGH | `tourStore.ts`, `tourCollaboration.ts`, `tourSettings.ts` |
| D4 | Duplicate project tables | HIGH | `projects` vs `"Project"` |
| D5 | Duplicate auth helpers | MEDIUM | `api-guard.ts` + `api/auth.ts` |
| D6 | Duplicate Supabase clients | MEDIUM | 3 anon clients, 2 admin clients |
| D7 | Orphaned editor components | MEDIUM | 30+ panels in `components/editor/` |
| D8 | Dead tour editor page | LOW | 1529 lines, redirects to canonical |
| D9 | Dead `tourClientStore.ts` | LOW | Unused Zustand store |
| D10 | Empty (saas) route group | LOW | 12 empty subdirectories |

---

# 22. Duplicate / Legacy Systems

| Duplicate | Location A | Location B | Resolution |
|---|---|---|---|
| Project tables | `projects` (lowercase) | `"Project"` (quoted) | Establish canonical boundary |
| Admin systems | `/admin/dashboard` | `/app/admin/*` | Establish canonical boundary |
| Client systems | `/client-dashboard` | `/app/client/*` | Establish canonical boundary |
| Tour persistence | `tourStore.ts` | `tourCollaboration.ts` | Consolidate to Supabase (Phase E) |
| Auth helpers | `lib/api-guard.ts` | `lib/api/auth.ts` | Merge into one |
| Supabase admin clients | `lib/supabase-admin.ts` | `lib/supabase/admin.ts` | Consolidate |
| Supabase anon clients | `lib/supabase.ts` | `lib/supabase/client.ts` | Consolidate |
| Editor entry points | 7+ routes | 1 canonical | Reduce to canonical + specialized |

---

# 23. Regression Check

## Deleted Routes — Clean

| Deleted Route | References | Status |
|---|---|---|
| `/under-admin` | All cleaned in Phase 3 | CLEAN |
| `unified-editor` | Cleaned in Phase 3 | CLEAN |
| `xr-editor` | 1 inert `case` in xr-world/page.tsx | DEAD CODE (plan-sanctioned) |
| `virtual-tour/editor-dashboard` | Redirect exists | WORKS |

## Moved Files — Clean

| From | To | Status |
|---|---|---|
| `experience/[projectId]` | `experience-live/[projectId]` | CLEAN |

---

# 24. Current Development Phase

**Phase 3 (Experience + Editor) is COMPLETE.**
**Phase A (Architecture Consolidation) is the correct next phase.**

Do NOT proceed to new feature development until architecture is restructured.

---

# 25. Development Phase Status

## Phase A — Architecture Consolidation
**Status: NOT STARTED**
**Objective:** Establish canonical boundaries for database, admin, client, auth, and editor systems.
**No destructive changes.** Produce Architecture Consolidation Plan → review → approval → implementation.

| Task | Description | Status |
|---|---|---|
| A.1 | **Database canonicalization** — Determine which project table (`projects` vs `"Project"`) becomes authoritative; map every consumer; plan migration | NOT STARTED |
| A.2 | **Admin canonical boundary** — Determine which admin system is canonical; establish migration boundary; do NOT remove legacy yet | NOT STARTED |
| A.3 | **Client canonical boundary** — Determine which client system is canonical; establish migration boundary | NOT STARTED |
| A.4 | **Auth/client canonicalization** — Merge `api-guard.ts` + `api/auth.ts`; consolidate Supabase clients | NOT STARTED |
| A.5 | **Editor canonicalization** — Reduce 7+ entry points to canonical + specialized; catalog orphaned components | NOT STARTED |
| A.6 | **Virtual Tour boundary** — Document how VT fits into unified project model (legacy tours table → Project → ProjectService → Experience) | NOT STARTED |

## Phase B — Security Remediation
**Status: EXECUTABLE (production blocked by security findings)**
**Objective:** Fix critical security issues that prevent production deployment.

| Task | Description | Status |
|---|---|---|
| B.1 | Fix `clients` table RLS — Drop `clients_auth_read`; restrict `password_hash` + `portal_access_code` | NOT STARTED |
| B.2 | Fix editor table RLS — Restrict read to owner/project-member | NOT STARTED |
| B.3 | Add auth to `forms/[type]` endpoint | NOT STARTED |
| B.4 | Add auth to `tour/media` endpoint | NOT STARTED |
| B.5 | Implement signed URLs for storage | NOT STARTED |
| B.6 | Remove hardcoded dev JWT secret fallback | NOT STARTED |

## Phase C — Unified Project/Service/Experience
**Status: ADVANCED FOUNDATION / PARTIAL**
**Objective:** Ensure all services use the unified project model; legacy `tours` and duplicate `projects` become service-specific implementations.

| Task | Description | Status |
|---|---|---|
| C.1 | Reconcile `projects` table into unified model (depends on A.1) | BLOCKED |
| C.2 | Migrate `tours` table into `Project → ProjectService(virtual-tour) → Experience → TourConfig` | BLOCKED |
| C.3 | Ensure all 9 services use `project_services` junction | PARTIAL |

## Phase D — Route + Dashboard + Editor Migration
**Status: PARTIAL (PR #3 complete; admin/client consolidation remaining)**
**Objective:** Complete route consolidation; merge admin dashboards; merge client dashboards; integrate orphaned editor panels.

| Task | Description | Status |
|---|---|---|
| D.1 | Complete admin dashboard consolidation (depends on A.2) | BLOCKED |
| D.2 | Complete client dashboard consolidation (depends on A.3) | BLOCKED |
| D.3 | Integrate 30+ orphaned editor panels into canonical editor | NOT STARTED |
| D.4 | Clean dead routes and empty (saas) group | NOT STARTED |

## Phase E — Virtual Tour Migration
**Status: NOT STARTED**
**Objective:** Migrate legacy VT into unified model; eliminate filesystem persistence; preserve all existing functionality.

| Task | Description | Status |
|---|---|---|
| E.1 | Consolidate 3 tour persistence layers into Supabase | NOT STARTED |
| E.2 | Remove all filesystem writes (`.data/tour/`) | NOT STARTED |
| E.3 | Wire VT editor to canonical project model | NOT STARTED |

## Phase F — Service Pipelines
**Status: FOUNDATION**
**Objective:** Per-service processing pipelines; pipeline status tracking; automated quality checks.

## Phase G — Publishing / Delivery
**Status: FOUNDATION**
**Objective:** Async publish pipeline; publish_jobs table; service status tracking; notifications.

## Phase H — Infrastructure
**Status: EARLY**
**Objective:** Deploy GPU controller; configure Redis; deploy collaboration server; PlayCanvas Cloud.

## Phase I — Mock Data
**Status: DEFERRED**
**Objective:** Implement supabase-repositories.ts; wire super admin store to Supabase; replace mock admin API routes.

## Phase J — AI / MCP
**Status: DEFERRED**
**Objective:** Real AI integration; MCP automation; predictive analytics.

---

# 26. Prioritized Development Queue

1. **Phase A: Architecture Consolidation** — Establish canonical boundaries (no destructive changes)
2. **Phase B: Security Remediation** — Fix critical security issues (executable now)
3. **Phase C: Unified Project Model** — Ensure all services use unified model
4. **Phase D: Route/Editor Consolidation** — Complete PR #3 work; merge dashboards
5. **Phase E: VT Migration** — Migrate legacy tours into unified model

---

# 27. Verification Evidence

- **Domain model:** Clean FK chains verified in `20260903_phase1_project_model.sql`
- **Duplicate tables:** Confirmed via migration file analysis
- **Security issues:** Confirmed via RLS policy inspection + route auth checks
- **Forks:** None imported by main app (grep confirmed)
- **Dead code:** Tour editor redirects to canonical (line 144 of `app/xr-world/virtual-tour/editor/page.tsx`)
- **Mock systems:** Confirmed via `lib/repositories/mock-repositories.ts` (694 lines)

---

# 28. Recommended Next Agent Prompt

```
ROLE: Senior Software Architect + Full-Stack Developer

CURRENT STATE: VizTR has completed Phases 0-3. The domain model is clean
but the codebase has significant structural debt: two admin systems, two
client systems, three tour persistence layers, duplicate project tables,
7+ editor entry points, and critical security issues.

OBJECTIVE: Produce an Architecture Consolidation Plan (Phase A) with NO
destructive changes. Map every consumer of duplicate systems before
merging anything.

P0 TASK: Determine the canonical database universe.
- `projects` (lowercase, from 20250101000000) vs `"Project"` (quoted, from 20260903)
- Map every consumer: which API routes, which components, which stores use each
- Determine which becomes authoritative
- Plan migration path (not implementation — just the plan)

FILES / ROUTES / SYSTEMS TO MAP:
- lib/supabase-admin.ts + lib/supabase/admin.ts
- lib/api-guard.ts + lib/api/auth.ts
- lib/supabase.ts + lib/supabase/client.ts
- projects (lowercase) vs "Project" (quoted) — every consumer
- /admin/dashboard + /app/admin/* — boundary analysis
- /client-dashboard + /app/client/* — boundary analysis
- 7+ editor entry points — which are canonical, which are orphaned

ARCHITECTURE RULES:
- PROJECT ≠ SERVICE ≠ ASSET ≠ EXPERIENCE ≠ DELIVERABLE
- Project is the central business entity
- Establish canonical boundaries BEFORE removing legacy
- No destructive changes in this phase
- Map consumers before merging

DO NOT TOUCH:
- Virtual Tour viewer functionality (preserve)
- Existing marketing pages
- Phase 1-3 completed work
- Mock data systems (deferred by design)
- Forks (classified as FUTURE/OPTIONAL)
- Any production code — this is a PLANNING phase only

OUTPUT: Architecture Consolidation Plan document with:
1. Canonical database universe decision
2. Admin system boundary (which is canonical, migration path)
3. Client system boundary
4. Auth/client consolidation plan
5. Editor canonicalization plan
6. Virtual Tour boundary definition
7. Dependency map for each change
8. Risk assessment for each migration

TESTING REQUIREMENTS:
- This is a planning phase — no code changes
- Document findings in Architecture_Consolidation_Plan.md
- Present plan for review before any implementation

ACCEPTANCE CRITERIA:
- Every duplicate system has a documented canonical owner
- Every consumer of duplicates is mapped
- Migration paths are defined (not implemented)
- Risk assessment is complete
- Plan is approved before any destructive changes
```
