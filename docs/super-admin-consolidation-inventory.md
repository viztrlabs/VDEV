# Super Admin Dashboard Consolidation — Inventory & Gap Analysis

**Branch**: `feat/super-admin-consolidation`
**Date**: 2026-09-10
**Status**: Phase 1 — Inventory Complete

---

## 1. Route Inventory

| Route | Type | Status | Auth Guard | Notes |
|-------|------|--------|------------|-------|
| `/admin/dashboard` | **Active** (canonical) | Monolithic client page (1217 lines) | Middleware: `super_admin`/`admin` | 20+ embedded sections via `activeSection` state |
| `/admin/*` (tours, security) | Active | Separate pages | Middleware: `super_admin`/`admin` | |
| `/app/super-admin` | **Legacy** (decommissioned) | Stub page with stats cards | Middleware + `RoleLayout` (RBAC) | Redirects to `/admin/dashboard` (added) |
| `/app/super-admin/*` (13 pages) | Legacy | All stubs — "This Client feature is being built." | Same as above | To be removed after redirect verified |
| `/app/admin/*` | Active (Admin role) | 13 stub pages | Middleware: `admin`/`super_admin` | Separate from Super Admin |
| `/app/user/*` | Active (User role) | 13 stub pages | Middleware: `user`/`admin`/`super_admin` | |
| `/app/client/*` | Active (Client role) | 7 stub pages + project detail | Middleware: `client`/`user`/`admin`/`super_admin` | |

---

## 2. Component Inventory (Active Dashboard)

| Component | File | Lines | Purpose | Data Source | Lazy-Load Candidate |
|-----------|------|-------|---------|-------------|---------------------|
| `SuperAdminPanel` | `components/admin/SuperAdminPanel.tsx` | 1876 | Users, Analytics, Revenue, GPU, Feature Toggles, System Health, Permissions | `lib/super-admin-store.ts` (Zustand, localStorage) | ✅ Yes |
| `DocStudioCRM` | `components/admin/DocStudioCRM.tsx` | ~800 | CRM Kanban, Documents, Leads | `lib/supabase` (via API) | ✅ Yes |
| `AIDashboardPanel` | `components/admin/AIDashboardPanel.tsx` | ~600 | NLP, Predictive, Collaboration | `/api/ai` (fetch) | ✅ Yes |
| `PixelStreamingSessionControl` | `components/admin/PixelStreamingSessionControl.tsx` | ~400 | WebRTC sessions, GPU telemetry | `/api/pixel-streaming/*` | ✅ Yes |
| `SuperAdminCMSManager` | `components/admin/SuperAdminCMSManager.tsx` | ~2200 | Pages, Blog, Services, Media, Themes, Navigation, Social | Local state + `/api/cms` | ✅ Yes |
| `VirtualTourAdminPanel` | `components/admin/VirtualTourAdminPanel.tsx` | ~400 | Tour features, views, settings | `/api/tour/*` | ✅ Yes |
| `SuperAdminProjectManager` | `components/admin/SuperAdminProjectManager.tsx` | ~700 | Project CRUD, hours, pipeline | `INITIAL_MANAGED_PROJECTS` (mock) | ✅ Yes |
| `ProjectManagementSystem` | `components/admin/ProjectManagementSystem.tsx` | ~900 | Kanban, filters, project grid | Same mock data | ✅ Yes |
| `XRLinkGenerator` | `components/admin/XRLinkGenerator.tsx` | ~600 | Token generation, QR, sharing | `/api/xr-links` | ✅ Yes |
| `ClientDiscoveryManager` | `components/admin/ClientDiscoveryManager.tsx` | ~600 | Google Forms integration | `/api/discovery` | ✅ Yes |
| `FileStorageManager` | `components/admin/FileStorageManager.tsx` | ~600 | Multi-cloud file browser | Local state + `/api/storage` | ✅ Yes |
| `GoogleDriveAdminManager` | `components/admin/GoogleDriveAdminManager.tsx` | ~800 | Drive accounts, sync | localStorage + OAuth | ❌ Keep eager (auth) |
| `GoogleMeetAdminManager` | `components/admin/GoogleMeetAdminManager.tsx` | ~900 | Meet rooms, accounts | localStorage + OAuth | ❌ Keep eager (auth) |
| `ModelManager` | `components/admin/ModelManager.tsx` | ~400 | GLB/GLTF upload, Draco | Local state | ❌ Keep eager |
| `PlayCanvasEngineDashboardTile` | `components/admin/PlayCanvasEngineDashboardTile.tsx` | ~100 | Engine status tile | `/api/playcanvas/status` | ✅ Yes |
| `ApiCredentialsManager` | `components/admin/ApiCredentialsManager.tsx` | ~200 | API key storage | localStorage | ❌ Keep eager |
| `FeatureFlagsDashboard` | `components/admin/FeatureFlagsDashboard.tsx` | ~300 | Flag toggles, metrics | localStorage + `lib/feature-flags.ts` | ✅ Yes |
| `CollapsibleLeftFilterPanel` | `components/dashboard/CollapsibleLeftFilterPanel.tsx` | ~200 | Project filters | Props | ❌ Keep eager |
| `CollapsibleRightInspectorPanel` | `components/dashboard/CollapsibleRightInspectorPanel.tsx` | ~300 | Hours logging, pipeline | Props | ❌ Keep eager |
| `HermesButton` | `components/admin/HermesButton.tsx` | ~250 | AI chat widget | `/api/hermes` | ✅ Yes |

**Total active dashboard bundle**: ~14,000 lines across 22 components — all eagerly imported.

---

## 3. Data Layer Inventory

| Domain | Current Source | Target Supabase Table | RLS Status | Migration Needed |
|--------|----------------|----------------------|------------|------------------|
| Users/Admins | `lib/super-admin-store.ts` → `AdminUser[]` (mock) | `public.profiles` (extend) | Enabled, policies use `SUPER_ADMIN`/`ADMIN` (uppercase) | **Yes** — extend columns, fix RLS casing |
| Projects | `lib/projects-data.ts` → `INITIAL_MANAGED_PROJECTS` (mock) | `public."Project"` + `project_services` + `experiences` | Enabled, policies use `auth_role()` helper | **Yes** — repositories only |
| GPU Nodes | `lib/super-admin-store.ts` → `INITIAL_GPU_NODES` (mock) | **New** `public.gpu_nodes` | — | **Yes** — create table + RLS |
| Feature Toggles | `lib/super-admin-store.ts` → `INITIAL_FEATURE_TOGGLES` (mock) | **New** `public.feature_toggles` | — | **Yes** — create table + RLS |
| System Logs | `lib/super-admin-store.ts` → `INITIAL_SYSTEM_LOGS` (mock) | **New** `public.system_logs` | — | **Yes** — create table + RLS |
| Revenue Metrics | Hardcoded in dashboard | **New** materialized view `mv_revenue_monthly` | — | **Yes** — create view |
| DocStudio (CRM) | `components/admin/DocStudioStore.ts` (Zustand) | `public.documents`, `public.leads`, `public.studio_profile` | Enabled, policies check `auth.jwt()->>'role' IN ('SUPER_ADMIN','ADMIN')` | **Yes** — fix RLS casing |
| XR Links | `lib/xr-links-store.ts` + `/api/xr-links` | `public.xr_links` | Enabled, **no policies** (service-role only) | OK |
| Tours | `lib/tourStore.ts` + `/api/tours` | `public.tours`, `tour_members`, `tour_comments`, `tour_tasks`, `tour_waypoints` | Enabled, policies use `auth_uid()`/`auth_role()` | OK |

---

## 4. Auth / RBAC Inventory

| Artifact | Current Behavior | Issue | Fix |
|----------|------------------|-------|-----|
| `lib/rbac.ts` | Lowercase roles (`super_admin`, `admin`, `user`, `client`) | Single source of truth — **good** | Keep |
| `lib/super-admin-store.ts` | Uppercase `UserRole = 'SUPER_ADMIN' \| 'ADMIN' \| 'USER' \| 'CLIENT'` | **Mismatch** with `rbac.ts` | Align to lowercase |
| Middleware (`middleware.ts`) | Uses `normalizeUserRole` → lowercase | **Good** | Keep |
| NextAuth JWT `role` claim | Set via `normalizeUserRole` in `auth.ts` callbacks | Lowercase | Keep |
| DocStudio RLS policies | `auth.jwt() ->> 'role' IN ('SUPER_ADMIN','ADMIN')` | **Broken** — uppercase vs lowercase | Migration to lowercase |
| Supabase `profiles.role` enum | `super_admin`, `owner`, `editor`, `viewer` | `owner` ≠ `admin` | Map `owner` → `admin` in `normalizeUserRole` or add `admin` to enum |

---

## 5. API Contract Inventory

| Endpoint | Method | Used By | Typed? | Validation |
|----------|--------|---------|--------|------------|
| `/api/hermes` | POST | `HermesButton` | ❌ | ❌ |
| `/api/pixel-streaming/start` | POST | `PixelStreamingSessionControl` | ❌ | ❌ |
| `/api/pixel-streaming/stop` | POST | `PixelStreamingSessionControl` | ❌ | ❌ |
| `/api/xr-links` | GET/POST | `XRLinkGenerator` | ❌ | ❌ |
| `/api/tour/settings` | GET/PUT | `VirtualTourAdminPanel` | ❌ | ❌ |
| `/api/tour/views` | GET | `VirtualTourAdminPanel` | ❌ | ❌ |
| `/api/tours` | GET/POST/PATCH/DELETE | `TourManager` | ❌ | ❌ |
| `/api/tour/collab` | GET/POST/PATCH | `TourManager` (collab tabs) | ❌ | ❌ |
| `/api/discovery` | GET/POST | `ClientDiscoveryManager` | ❌ | ❌ |
| `/api/ai` | GET/POST | `AIDashboardPanel` | ❌ | ❌ |
| `/api/cms/*` | GET/POST/PUT/DELETE | `SuperAdminCMSManager` | ❌ | ❌ |
| `/api/admin/*` | — | **Not yet created** | — | **Phase 5** |

---

## 6. Dependency & Compatibility Checklist

| Dependency | Version | Action |
|------------|---------|--------|
| `next` | 15.1.6 | ✅ OK |
| `react` / `react-dom` | 19.0.0 | ✅ OK |
| `@supabase/ssr` | 0.12.5 | ✅ OK |
| `@supabase/supabase-js` | 2.112.3 | ✅ OK |
| `zustand` | 5.0.15 | Keep for UI state |
| `pnpm` | 9.x (lockfile) | Add `packageManager` to `package.json` |
| `typescript` | 6.0.3 | Strict mode ✅ |
| `jest` | 29.7.0 | Add Supabase mocks |
| `playwright` | — | **Add** for E2E |
| `zod` | — | **Add** for API schemas |
| `@tanstack/react-query` or `swr` | — | **Add** for server state |

---

## 7. Phase 1 Deliverables ✅

- [x] Redirect `/app/super-admin/:path*` → `/admin/dashboard` added to `next.config.ts`
- [x] Inventory matrix documented (this file)
- [x] Gap analysis complete (roles, data, components, APIs)

---

## 8. Next Steps (Phase 2)

1. **RBAC Normalization PR**
   - Align `lib/super-admin-store.ts` roles to lowercase
   - Add `admin` to Supabase `profiles.role` enum (migration)
   - Fix DocStudio RLS policies to lowercase
   - Unit tests for `normalizeUserRole`

2. **Middleware Test PR**
   - Add `jest` tests for middleware redirect matrix
   - Verify `/admin/*`, `/app/*`, `/client-dashboard` guards

3. **Documentation PR**
   - Update `docs/architecture-implementation-audit.md` (Super Admin section)
   - Update `docs/current-sitemap.md` (remove legacy routes)

---

## 9. File References for Implementers

| Area | Files |
|------|-------|
| Redirects | `next.config.ts:132` |
| Active Dashboard | `app/admin/dashboard/page.tsx:1` |
| Legacy Stubs | `app/app/super-admin/**/*.tsx` |
| RBAC | `lib/rbac.ts:1` |
| Middleware | `middleware.ts:1` |
| Super Admin Store | `lib/super-admin-store.ts:1` |
| App Store | `lib/store.ts:1` |
| Projects Data | `lib/projects-data.ts:1` |
| Feature Flags | `lib/feature-flags.ts:1` |
| Supabase Schema | `supabase/schema.sql:1`, `supabase/migrations/*.sql` |
| Admin Components | `components/admin/*.tsx` |
| Dashboard Components | `components/dashboard/*.tsx` |
| Docs | `docs/architecture-implementation-audit.md`, `docs/current-sitemap.md` |