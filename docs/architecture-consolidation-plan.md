# VizTR Architecture Consolidation Plan
## Phase A: Canonical Boundary Definition
**Generated:** 2026-09-18
**Status:** PLANNING — NO DESTRUCTIVE CHANGES
**Prerequisite:** VIZTR_DEVELOPMENT_TRACKER.md reviewed and approved

---

# Purpose

This document defines the canonical boundaries for every duplicated system in VizTR. It is a **planning document only** — no code changes should be made until this plan is reviewed and approved.

The goal is to answer one question for each duplicate:

> **Which system becomes authoritative, and what is the migration path?**

---

# P0: Database Canonicalization

## The Problem

Two project tables exist with different schemas:

| Table | Created By | PK Type | Referenced By |
|---|---|---|---|
| `"Project"` (quoted) | Prisma (`20260903_phase1_project_model.sql`) | TEXT | `project_services`, `experiences`, `experience_configs`, `deliverables`, `assets`, `project_members` |
| `projects` (lowercase) | Custom (`20250101000000_init_clients_projects.sql`) | TEXT | `activity_logs`, `feedback`, `clients` (via FK) |

## Consumer Map

### `"Project"` consumers (Phase 1 model):

| Consumer | File | How Used |
|---|---|---|
| `project_services` | FK target | `project_id TEXT REFERENCES "Project"(id)` |
| `experiences` | FK target | `project_id TEXT REFERENCES "Project"(id)` |
| `experience_configs` | FK via experiences | Indirect |
| `deliverables` | FK target | `project_id TEXT REFERENCES "Project"(id)` |
| `assets` | FK target | `project_id TEXT REFERENCES "Project"(id)` |
| `project_members` | FK target | `project_id TEXT REFERENCES "Project"(id)` |
| `/api/experiences` | Query | `eq(projectId)` filter |
| `/api/experience-configs` | Query | `eq(projectId)` filter |
| `/api/assets` | Query | `eq(projectId)` filter |
| `/api/deliverables` | Query | `eq(projectId)` filter |
| `/api/project-members` | Query | `eq(projectId)` filter |
| `/api/project-services` | Query | `eq(projectId)` filter |
| `lib/useRealtime.ts` | Subscription | `eq('project_id', projectId)` |
| `app/admin/projects/[projectId]/editor-dashboard/*` | Page | `useParams().projectId` |
| `app/experience-live/[projectId]` | Page | `useParams().projectId` |
| `app/editor/[projectId]` | Page | `useParams().projectId` |
| `app/creator/[projectId]` | Page | `useParams().projectId` |
| `lib/service-editor-tabs.tsx` | Config | `projectId` prop |
| `lib/service-meta.ts` | Config | `projectId` prop |

### `projects` (lowercase) consumers (client-portal model):

| Consumer | File | How Used |
|---|---|---|
| `activity_logs` | FK target | `project_id TEXT REFERENCES projects(id)` |
| `feedback` | FK target | `project_id TEXT REFERENCES projects(id)` |
| `clients` | FK source | `client_id` references `clients(id)` |
| `/api/admin/projects` | Query | Supabase `projects` table |
| `/api/admin/projects/[id]` | Query | Supabase `projects` table |
| `app/api/projects/client/route.ts` | Query | Supabase `projects` table |
| `lib/projects-data.ts` | Seed data | `INITIAL_MANAGED_PROJECTS` |
| `lib/super-admin-store.ts` | Mock | References project data |
| `app/admin/dashboard/layout.tsx` | Dashboard | Uses `useAppStore` which may reference either |

## Decision Required

**Question:** Which table becomes the single source of truth?

**Option A:** Keep `"Project"` (Phase 1 model) as canonical.
- Pro: Already used by the unified project→service→experience→asset→deliverable chain
- Pro: All Phase 1-3 work is built on it
- Con: Requires migrating `activity_logs` and `feedback` FKs from `projects` to `"Project"`
- Con: Requires migrating admin dashboard to use `"Project"` instead of `projects`

**Option B:** Keep `projects` (lowercase) as canonical.
- Pro: Already used by admin dashboard and client portal
- Con: Requires rebuilding the entire Phase 1 model FK chain on `projects`
- Con: Much larger migration surface

**Option C:** Create a new canonical table, migrate both.
- Pro: Clean slate
- Con: Largest migration; highest risk

## Recommendation

**Option A** (keep `"Project"` as canonical) because:
1. The Phase 1 model is the target architecture
2. 12+ consumers already use `"Project"`
3. Only 2 tables (`activity_logs`, `feedback`) need FK migration
4. The admin dashboard needs to be updated anyway (Phase D)

---

# A.1: Admin Canonical Boundary

## The Problem

Two admin systems coexist:

| System | Route | Layout | Data Source |
|---|---|---|---|
| Legacy monolith | `/admin/dashboard` | 1077-line layout | `useAppStore` + Supabase Realtime |
| SaaS role-based | `/app/admin/*` (14 pages) | `RoleLayout` component | Independent page-level fetches |

## Consumer Map

### Legacy admin (`/admin/dashboard`):

| Consumer | File | How Used |
|---|---|---|
| `/admin/dashboard/layout.tsx` | Layout | 1077-line monolith with sidebar |
| `/admin/dashboard/page.tsx` | Page | Dashboard content |
| `/admin/tours/page.tsx` | Page | Tour management |
| `/admin/security/page.tsx` | Page | Security settings |
| `/admin/projects/[projectId]/editor-dashboard/*` | Route | Canonical editor |
| `middleware.ts` | Guard | `/admin/*` requires super_admin or admin |
| `lib/rbac.ts` | Config | `super_admin` and `admin` roles include `/admin/*` |

### SaaS admin (`/app/admin/*`):

| Consumer | File | How Used |
|---|---|---|
| `app/app/admin/page.tsx` | Page | Admin home |
| `app/app/admin/projects/page.tsx` | Page | Project list |
| `app/app/admin/leads/page.tsx` | Page | Lead management |
| `app/app/admin/clients/page.tsx` | Page | Client management |
| `app/app/admin/team/page.tsx` | Page | Team management |
| `app/app/admin/quotes/page.tsx` | Page | Quote management |
| `app/app/admin/invoices/page.tsx` | Page | Invoice management |
| `app/app/admin/payments/page.tsx` | Page | Payment management |
| `app/app/admin/files/page.tsx` | Page | File management |
| `app/app/admin/approvals/page.tsx` | Page | Approval management |
| `app/app/admin/meetings/page.tsx` | Page | Meeting management |
| `app/app/admin/support/page.tsx` | Page | Support management |
| `app/app/admin/analytics/page.tsx` | Page | Analytics |
| `app/app/admin/settings/page.tsx` | Page | Settings |
| `lib/rbac.ts` | Config | `admin` role includes `/app/admin/*` |

## Decision Required

**Question:** Which admin system is canonical?

**Recommendation:** The legacy monolith (`/admin/dashboard`) is the more complete system (real-time data, 25+ sections, custom sidebar). The SaaS pages are newer but less complete.

**Migration path:**
1. Establish `/admin/dashboard` as canonical for super_admin + admin
2. SaaS `/app/admin/*` pages become a simplified view for non-super-admin roles
3. The canonical editor route stays at `/admin/projects/[projectId]/editor-dashboard/[service]`
4. Super Admin SaaS pages (`/app/super-admin/*`) remain phantom (redirect) until needed

---

# A.2: Client Canonical Boundary

## The Problem

Two client systems coexist:

| System | Route | Pages | Status |
|---|---|---|---|
| Legacy | `/client-dashboard` | 1 page | WORKS |
| SaaS portal | `/app/client/*` | 21 pages | WORKS |

## Consumer Map

### Legacy client (`/client-dashboard`):

| Consumer | File | How Used |
|---|---|---|
| `app/client-dashboard/page.tsx` | Page | Client dashboard |
| `app/client-dashboard/components/*` | Components | 30+ dashboard components |
| `middleware.ts` | Guard | `/client-dashboard/*` requires auth + client/admin role |

### SaaS client (`/app/client/*`):

| Consumer | File | How Used |
|---|---|---|
| `app/app/client/page.tsx` | Page | Client home |
| `app/app/client/projects/page.tsx` | Page | Project list |
| `app/app/client/projects/[id]/*` (10 sub-pages) | Pages | Per-project views |
| `app/app/client/meetings/page.tsx` | Page | Meetings |
| `app/app/client/messages/page.tsx` | Page | Messages |
| `app/app/client/invoices/page.tsx` | Page | Invoices |
| `app/app/client/payments/page.tsx` | Page | Payments |
| `app/app/client/support/page.tsx` | Page | Support |
| `app/app/client/profile/page.tsx` | Page | Profile |
| `middleware.ts` | Guard | `/app/client/*` requires client portal token or session |
| `lib/client-auth.ts` | Auth | HMAC-SHA256 client portal token |

## Decision Required

**Question:** Which client system is canonical?

**Recommendation:** The SaaS portal (`/app/client/*`) is the more complete system (21 pages, per-project views, client portal token auth). The legacy `/client-dashboard` is a single page with 30+ components.

**Migration path:**
1. Establish `/app/client/*` as canonical client portal
2. Migrate any unique functionality from legacy `/client-dashboard` components
3. Redirect `/client-dashboard` to `/app/client`
4. Keep client portal token auth system

---

# A.3: Auth/Client Canonicalization

## The Problem

Two auth helper systems exist:

| System | File | Used By | Pattern |
|---|---|---|---|
| `lib/api-guard.ts` | `requireAuth()` | Most API routes | Returns `{ session, role, userId }` or error response |
| `lib/api/auth.ts` | `getAuthUser()` + `requireAdmin()` | Admin API routes | Throws `UnauthorizedError`/`ForbiddenError` |

## Consumer Map

### `lib/api-guard.ts` consumers:

| Consumer | File |
|---|---|
| `/api/projects` | `app/api/projects/route.ts` |
| `/api/projects/client` | `app/api/projects/client/route.ts` |
| `/api/experiences` | `app/api/experiences/route.ts` |
| `/api/assets` | `app/api/assets/route.ts` |
| `/api/deliverables` | `app/api/deliverables/route.ts` |
| `/api/tour` | `app/api/tour/route.ts` |
| `/api/storage` | `app/api/storage/route.ts` |
| `/api/xr-links` | `app/api/xr-links/route.ts` |
| `/api/editor-projects` | `app/api/editor-projects/route.ts` |
| `/api/activity` | `app/api/activity/route.ts` |
| `/api/feedback` | `app/api/feedback/route.ts` |
| `/api/clients` | `app/api/clients/route.ts` |
| `/api/contact` | `app/api/contact/route.ts` |
| `/api/collab` | `app/api/collab/route.ts` |
| `/api/ai` | `app/api/ai/route.ts` |
| `/api/hermes` | `app/api/hermes/route.ts` |

### `lib/api/auth.ts` consumers:

| Consumer | File |
|---|---|
| `/api/admin/projects` | `app/api/admin/projects/route.ts` |
| `/api/admin/projects/[id]` | `app/api/admin/projects/[id]/route.ts` |
| `/api/admin/users` | `app/api/admin/users/route.ts` |
| `/api/admin/users/[id]` | `app/api/admin/users/[id]/route.ts` |
| `/api/admin/features` | `app/api/admin/features/route.ts` |
| `/api/admin/features/[key]` | `app/api/admin/features/[key]/route.ts` |
| `/api/admin/gpu` | `app/api/admin/gpu/route.ts` |
| `/api/admin/gpu/[id]` | `app/api/admin/gpu/[id]/route.ts` |
| `/api/admin/stats` | `app/api/admin/stats/route.ts` |
| `/api/admin/revenue` | `app/api/admin/revenue/route.ts` |
| `/api/admin/logs` | `app/api/admin/logs/route.ts` |
| `/api/admin/tours` | `app/api/admin/tours/route.ts` |
| `/api/admin/tours/[id]` | `app/api/admin/tours/[id]/route.ts` |
| `/api/admin/bookings` | `app/api/admin/bookings/route.ts` |
| `/api/admin/bookings/[id]` | `app/api/admin/bookings/[id]/route.ts` |
| `/api/admin/bookings/[id]/approve` | `app/api/admin/bookings/[id]/approve/route.ts` |
| `/api/admin/bookings/[id]/reject` | `app/api/admin/bookings/[id]/reject/route.ts` |
| `/api/admin/xr-links` | `app/api/admin/xr-links/route.ts` |

## Decision Required

**Question:** Which auth helper becomes canonical?

**Recommendation:** Merge into a single module. Keep `lib/api-guard.ts` as the canonical implementation (it's used by more routes). Absorb `requireAdmin` pattern from `lib/api/auth.ts` into it.

**Migration path:**
1. Add `requireAdmin()` to `lib/api-guard.ts`
2. Migrate all `lib/api/auth.ts` consumers to use `lib/api-guard.ts`
3. Remove `lib/api/auth.ts`

## Supabase Client Consolidation

| Client | File | Purpose |
|---|---|---|
| Anon (server) | `lib/supabase.ts` | Server-side anon client |
| Anon (browser) | `lib/supabase/client.ts` | Browser client via `@supabase/ssr` |
| Anon (realtime) | `lib/useRealtime.ts` | Creates its own client |
| Admin (lazy) | `lib/supabase-admin.ts` | Service-role lazy singleton |
| Admin (factory) | `lib/supabase/admin.ts` | Service-role factory function |

**Recommendation:** Consolidate into:
- `lib/supabase/index.ts` — exports `getAnonClient()`, `getAdminClient()`, `getBrowserClient()`
- Remove `lib/supabase-admin.ts` and `lib/supabase/admin.ts`

---

# A.4: Editor Canonicalization

## Entry Point Inventory

| Entry Point | Route | Status | Canonical? |
|---|---|---|---|
| Admin editor | `/admin/projects/[projectId]/editor-dashboard/[service]` | WORKS | YES (PR #3) |
| User editor | `/app/user/editor` | EXISTS | NO (orphaned) |
| Generic editor | `/editor/[projectId]` | EXISTS | NO (legacy) |
| Editor projects | `/editor-projects` | EXISTS | NO (legacy) |
| Creator 3D | `/creator/3d-editor` | EXISTS | NO (marketing) |
| Creator SuperSplat | `/creator/supersplat` | EXISTS | NO (marketing) |
| VT editor | `/xr-world/virtual-tour/editor` | DEAD (redirect) | NO |
| Splat editor | `/xr-world/vizsplat/editor` | EXISTS | SPECIALIZED (WebGPU splat) |

## Recommendation

1. **Canonical:** `/admin/projects/[projectId]/editor-dashboard/[service]`
2. **Specialized:** `/xr-world/vizsplat/editor` (WebGPU splat editor — keep as specialized)
3. **Redirect:** `/app/user/editor` → canonical (if user role should access editor)
4. **Deprecate:** `/editor/[projectId]`, `/editor-projects` (legacy, not linked)
5. **Remove:** Dead tour editor page (1529 lines, redirects to canonical)

## Orphaned Components

30+ panel components in `components/editor/` are only used by the dead tour editor page. These should be cataloged and either:
- Integrated into the canonical editor (if valuable)
- Removed (if dead code)

---

# A.5: Virtual Tour Boundary

## Current State

Virtual Tour exists as a standalone system:
- Legacy `tours` table (independent from project model)
- 3 persistence layers (filesystem + Supabase fallback + Supabase)
- 7 sub-pages under `/xr-world/virtual-tour/`
- Public viewer at `/virtual-tour/[tourId]`

## Target State

```
Project
  → ProjectService(service_type = 'virtual-tour')
    → Experience(service_type = 'virtual-tour')
      → ExperienceConfig(tour-specific config)
        → TourSettings (waypoints, hotspots, floorplans, etc.)
```

## Migration Path

1. **Phase A (this phase):** Document the boundary. Do NOT migrate yet.
2. **Phase C:** Ensure `project_services` supports `virtual-tour` as a service type
3. **Phase E:** Migrate `tours` table data into the unified model
4. **Phase E:** Consolidate 3 persistence layers into Supabase-only
5. **Phase E:** Wire VT editor to canonical project model

## What to Preserve

- All existing VT functionality (viewer, editor, dashboard, hosting, showcase)
- Public tour viewer at `/virtual-tour/[tourId]`
- VT-specific features (panorama editing, hotspot management, floorplan overlay)

---

# Risk Assessment

| Change | Risk | Mitigation |
|---|---|---|
| Database canonicalization (Option A) | MEDIUM — FK migration required | Run migration on staging first; verify all queries |
| Admin boundary definition | LOW — no code changes | Just establish which is canonical |
| Client boundary definition | LOW — no code changes | Just establish which is canonical |
| Auth helper merge | LOW — mechanical refactor | Verify all consumers compile |
| Supabase client consolidation | LOW — mechanical refactor | Verify all imports resolve |
| Editor canonicalization | MEDIUM — route changes | Redirect old routes; verify navigation |
| VT boundary documentation | NONE — planning only | Document only |

---

# Next Steps

1. **Review this plan** — Confirm canonical choices are correct
2. **Approve P0 decision** — Which project table becomes authoritative?
3. **Approve admin boundary** — Legacy monolith or SaaS?
4. **Approve client boundary** — Legacy or SaaS portal?
5. **Then execute Phase A tasks** — Still no destructive changes; just establish boundaries and consolidate helpers
6. **Then execute Phase B** — Security remediation (executable in parallel)
7. **Then execute Phase C-E** — Unified model, route migration, VT migration

---

# Appendix: Forks (No Action Required)

| Fork | Classification | Action |
|---|---|---|
| `editor` (624 MB) | FUTURE/OPTIONAL | Keep; intended for standalone deployment |
| `editor-src` (576 MB) | FUTURE/OPTIONAL | Keep; source for building editor |
| `supersplat` (234 MB) | FUTURE/OPTIONAL | Keep; intended for standalone deployment |
| `supersplat-viewer` (134 MB) | FUTURE/OPTIONAL | Keep; intended for standalone deployment |
| `engine` (342 MB) | FUTURE/OPTIONAL | Keep; dependency for editor/supersplat |
| `observer` (117 MB) | EXPERIMENTAL | Keep; may be useful for debugging |
| `pcui` (325 MB) | FUTURE/OPTIONAL | Keep; dependency for editor |
| `pcui-graph` (239 MB) | EXPERIMENTAL | Keep; may be useful for graph UI |
| `developer-site` (2,605 MB) | LEGACY/ABANDONED | Consider removing to save 2.6 GB |
