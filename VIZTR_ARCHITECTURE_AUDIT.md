# VizTR — Architecture-First Development Audit

## 1. Current Architecture Map

### 1.1 Database Schema

```
public.clients ──< public.projects ──< public.project_services ──> public.services
                    │
                    ├──< public.experiences ──< public.experience_configs
                    │
                    ├──< public.assets
                    │
                    ├──< public.deliverables
                    │
                    ├──< public.xr_links
                    │
                    ├──< public.bookings
                    │
                    ├──< public.activity_logs
                    │
                    └──< public.feedback
```

**Additional tables:** `public.Project` (Prisma/editor), `public."User"` (Prisma auth), `public.project_members`, `public.experience_published_at`, `public."Service"` (Prisma service catalog)

### 1.2 API Structure (36 directories)

```
/api/projects        → Project CRUD (filesystem store - BLOCKER)
/api/projects/client → Client project listing (Supabase with mock fallback)
/api/services        → Service definitions (Supabase)
/api/project-services → Project-service mapping (Supabase)
/api/experiences     → Experience CRUD + publish (Supabase)
/api/experience-configs → Experience configuration (Supabase)
/api/assets          → Asset CRUD + upload (Supabase)
/api/deliverables    → Deliverable management (Supabase)
/api/xr-links        → XR link management (dual mode)
/api/tours           → Tour CRUD (filesystem - BLOCKER)
/api/storage         → Asset upload (in-memory chunks - BLOCKER)
/api/pixel-streaming → Pixel streaming (localhost fallback - BLOCKER)
/api/activity        → Activity logs (Supabase)
/api/feedback        → Feedback (Supabase)
/api/clients         → Client management (Supabase)
/api/admin/*         → 10 admin modules (mixed mock/Supabase)
```

### 1.3 Route Structure

```
app/
├── page.tsx                          # Homepage
├── studio/                           # Public studio hub
├── client-dashboard/                 # Client workspace
├── client-access/                    # Client entry
├── client-view/[accessCode]/         # Client view
├── editor/[projectId]/               # Project editor
├── editor-projects/                  # Project list (duplicate)
├── admin/dashboard/                  # Admin dashboard
├── under-admin/                      # Duplicate admin sections
├── virtual-tour/[tourId]/            # Siloed virtual tour
├── xr-world/                         # XR hub with service silos
│   ├── webxr/webar/virtual-reality/  # Service-specific pages
│   ├── unified-editor/               # Duplicate editor
│   └── xr-editor/                    # Duplicate editor
├── deliverable/[id]/                 # Siloed deliverable
├── track-project/                    # Siloed project tracking
└── 40+ other marketing pages
```

### 1.4 Zustand Stores (11+)

| Store | Purpose | Domain |
|-------|---------|--------|
| `useAppStore` | Global state (auth, lightbox, notifications, toast) | Global |
| `useTourClientStore` | Virtual Tour viewer state | Virtual Tour |
| `useEditorStore` | Tour/editor state | Virtual Tour |
| `useSuperAdminStore` | Super admin state (mock) | Admin |
| `useBookingStore` | Booking state | Bookings |
| `useFloorplanStore` | Floorplan state | Floorplan |
| `useLeadsStore` | Leads state | CRM |
| `useCMSStore` | CMS state | CMS |
| `useContactStore` | Contact state | Contact |
| `useTourSettings` | Tour settings | Virtual Tour |
| `useZipStore` | Zip state | Export |

---

## 2. Target Architecture

```
                         VIZTR
                           │
             ┌─────────────┴─────────────┐
             │                           │
          PUBLIC                        AUTHENTICATED
             │                           │
    ┌────────┼────────┐          ┌───────┼───────┐
    ↓        ↓        ↓          ↓       ↓       ↓
 Marketing  Studio   XR World  Client  Admin   Editor
             │                           │       │
      ┌─────┴─────┐          ┌─────────┼─────────┤
      ↓           ↓          ↓         ↓         ↓
   Still Renders Animation  Services  Projects  Service Editor
                │            │         │         │
                ↓            ↓         ↓         ↓
            Walkthrough   WebXR     Assets    Experience
                          WebAR     Assets    Config
                          VR        Assets    Preview
                          Virtual   Assets    Feedback
                          Tour      Assets    Approval
                          Gaussian  Assets    Deliverable
                          Splat     Assets    Activity
                          Pixel     Assets    Activity
                               │
                          ┌────┴────┐
                          ↓       ↓
                     Storage   Experiences
                          │
                     ┌────┴────┐
                     ↓       ↓
                   QR      Deliverable
                   Codes


                    SUPER ADMIN
                        ↓
                    ADMIN / STAFF
                        ↓
                    CLIENT
                        ↓
                    PROJECT
                        ↓
                    SERVICE
                        ↓
                    EXPERIENCE
                        ↓
                    EDITOR / CONFIGURATOR
```

---

## 3. What to Keep (Untouched)

The following are verified working and must NOT be modified:

| Component | Status |
|-----------|--------|
| `app/api/experiences/route.ts` | ✅ Full Supabase integration with publish |
| `app/api/experience-configs/route.ts` | ✅ Supabase integration |
| `app/api/assets/route.ts` | ✅ Supabase Storage integration |
| `app/api/deliverables/route.ts` | ✅ Supabase integration |
| `app/api/activity/route.ts` | ✅ Supabase admin client |
| `app/api/feedback/route.ts` | ✅ Supabase admin client |
| `app/api/projects/client/route.ts` | ✅ Supabase fallback |
| `app/api/clients/route.ts` | ✅ Supabase integration |
| `app/api/project-services/route.ts` | ✅ Supabase integration |
| `app/api/admin/stats` | ✅ Real Supabase queries |
| `app/api/admin/users` | ✅ Real Supabase queries |
| `app/api/admin/bookings` | ✅ Real Supabase queries |
| `app/api/admin/features` | ✅ Real Supabase queries |
| `app/api/admin/tours` | ✅ Real Supabase queries |
| Auth system (`requireAuth`, `getAuthUser`, `requireAdmin`) | ✅ Working |
| All RLS policies | ✅ Enabled |
| `lib/api-guard.ts` | ✅ Working |
| `lib/api/auth.ts` | ✅ Working |
| `lib/supabase-admin.ts` | ✅ Working |
| `lib/services/client.ts` | ✅ Working |
| `lib/services/projectServices.ts` | ✅ Working |
| `lib/store.ts` (`useAppStore`) | ✅ Working |
| `lib/asset-types.ts` | ✅ Working |
| E2E smoke test (23/23) | ✅ Passing |
| `app/studio/` pages | ✅ Working |
| `app/xr-world/page.tsx` | ✅ Working |
| `app/editor/[projectId]/` | ✅ Working |
| `app/client-dashboard/` | ✅ Working |

---

## 4. What to Restructure

### 4.1 Virtual Tour — Connect to Project Hierarchy

- **Current:** `app/virtual-tour/[tourId]` is isolated
- **Target:** Connect to `app/editor/[projectId]/service/virtual-tour`
- **Why:** Virtual Tour is a service, not a standalone product
- **Risk:** Medium — preserve existing `tourClientStore` and `editorStore`

### 4.2 XR World Service Silos

- **Current:** `app/xr-world/webxr`, `webar`, `virtual-reality`, `virtual-tour`, `splat-showcase`, `pixel-streaming` are separate page directories
- **Target:** Remove service-specific page directories; use `/client-dashboard/[projectId]/service/[type]`
- **Why:** Service-specific pages create architectural silos
- **Risk:** Low

### 4.3 Duplicate Editors

- **Current:** `app/editor/[projectId]`, `app/xr-world/xr-editor`, `app/xr-world/unified-editor`, `app/virtual-tour/[tourId]/editor` are all editors
- **Target:** Keep `app/editor/[projectId]` as canonical
- **Risk:** Medium

### 4.4 Store Consolidation

- **Current:** 11+ Zustand stores with overlapping domains
- **Target:** Consolidate `tourClientStore` + `editorStore` + `tourSettings` into unified `useEditorStore`
- **Risk:** Medium

---

## 5. What to Merge

| Merge | Sources | Result |
|-------|---------|--------|
| Public pages | `/portfolio`, `/studio`, `/showcase` | `/studio` canonical |
| Project lists | `/editor-projects`, `/admin/projects`, `/projects` | `/projects` canonical |
| Admin sections | `/under-admin/analytics`, `/under-admin/users` | Merge into `/admin/dashboard` |
| Tour APIs | `/api/tour`, `/api/tours` | `/api/tours` canonical |
| Deliverable page | `/deliverable/[id]` | Move to `/projects/[id]/deliverables` |
| Project tracking | `/track-project` | Move to `/client-dashboard` |

---

## 6. What to Deprecate

| Item | Location | Reason |
|------|----------|--------|
| `app/v2/` | `app/v2/` | Unknown, unused |
| `app/vizsplat/` | `app/vizsplat/` | Unknown, unused |
| `app/super-splat/` | `app/xr-world/super-splat/` | Unknown, unused |
| `app/api/ai/` | `app/api/ai/` | Unknown purpose |
| `app/api/blog/` | `app/api/blog/` | Unlikely API |
| `app/api/forms/` | `app/api/forms/` | Unlikely API |
| `app/api/testimonials/` | `app/api/testimonials/` | Unlikely API |
| `app/api/collab/` | `app/api/collab/` | Collab feature |
| `app/api/enterprise/` | `app/api/enterprise/` | Enterprise features |
| `app/tour/api/` subdirs | `app/api/tour/ai/`, `collab/`, `export/`, etc. | Legacy, unclear |

---

## 7. What Must Remain Untouched

The **23/23 E2E baseline** is non-negotiable:

```
Project → Asset Upload → Storage → Experience → Preview → Publish → Public Viewer → Client Authentication → RLS → Feedback → Activity
```

Every architectural change must preserve this flow.

---

## 8. Exact Development Sequence

```
PHASE 0: Architecture Review (this document)
PHASE 1: Architecture Corrections (A0 — BLOCKERS)
  - Replace projectsStore.ts with Supabase
  - Replace tourStore.ts with Supabase
  - Replace tourCollaboration.ts with Supabase
  - Replace storage/route.ts in-memory chunks
  - Configure Pixel Streaming production endpoint
  - Replace mock admin APIs
PHASE 2: Consolidation (A1-A2)
  - Consolidate tour-related Zustand stores
  - Remove duplicate XR editor routes
  - Connect Virtual Tour to project hierarchy
  - Consolidate /api/tour and /api/tours
  - Consolidate /under-admin into /admin
PHASE 3: Route Alignment (A2-A3)
  - Remove service-specific page silos
  - Consolidate public marketing pages
  - Fix /deliverable and /track-project routes
PHASE 4: Dashboard Real-time Syncing
  - WebSocket/Polling for all dashboards
PHASE 5: Experience Page
  - 1-click service switching page
PHASE 6: Pilot Project Data
  - Smart Luxury Villa with all services
PHASE 7: Full Regression + Documentation
```

---

## 9. Service-by-Service Implementation Roadmap

### Still Renders
- Project relationship: ✅ `projects` table
- Asset upload: ✅ `assets` table
- Experience: ✅ `experiences` table
- Deliverable: ✅ `deliverables` table
- Action: Connect `/studio/exterior` and `/studio/interior` to project-service hierarchy

### Animation
- Same structure as Still Renders
- Action: Connect `/studio/walkthrough` to project-service hierarchy

### WebXR
- Project relationship: ✅ `projects` + `project_services`
- XR Links: ✅ `xr_links` table
- Action: Remove `/xr-world/webxr` siloed route

### WebAR
- Same structure as WebXR
- Action: Remove `/xr-world/webar` siloed route

### Virtual Reality
- Same structure as WebXR
- Action: Remove `/xr-world/virtual-reality` siloed route

### Virtual Tour
- **Critical:** Isolated from project flow
- Stores: `tourClientStore`, `editorStore`, `tourStore` — overlapping
- Action: Connect to project hierarchy, consolidate stores

### Gaussian Splat
- Asset types: ✅ `.splat`, `.ply`, `.spz`
- Action: Remove `/xr-world/splat-showcase` siloed route

### Pixel Streaming
- Project relationship: ✅ `projects` + `project_services`
- GPU Controller: ❌ Not deployed
- Action: Remove `/xr-world/pixel-streaming` siloed route, configure GPU controller

---

## 10. Mock-Data Replacement Roadmap

| Mock System | File | Future Source | Phase |
|-------------|------|--------------|-------|
| `mockProjects` | `app/api/admin/projects/route.ts` | `getSupabaseAdmin().from('projects')` | Phase 1 |
| `mockXrLinks` | `app/api/admin/xr-links/route.ts` | `getSupabaseAdmin().from('xr_links')` | Phase 1 |
| `mockRevenueMetrics` | `app/api/admin/revenue/route.ts` | Billing table | Phase 1 |
| `mockSystemLogs` | `app/api/admin/logs/route.ts` | `activity_logs` table | Phase 1 |
| `INITIAL_MANAGED_PROJECTS` | `app/api/projects/client/route.ts` | `getSupabaseAdmin().from('projects')` | Phase 1 |
| `XR_LINKS_DB` (in-memory) | `lib/xr-links-store.ts` | `getSupabaseAdmin().from('xr_links')` | Phase 1 |
| `projectsStore.ts` (filesystem) | `lib/projectsStore.ts` | `getServiceClient().from('projects')` | Phase 1 |
| `tourStore.ts` (filesystem) | `lib/tourStore.ts` | `getServiceClient().from('tours')` | Phase 1 |
| `tourCollaboration.ts` (filesystem) | `lib/tourCollaboration.ts` | `getServiceClient().from('tour_collaboration')` | Phase 1 |
| `storage/route.ts` (in-memory) | `app/api/storage/route.ts` | `supabase.storage.from('viztr-assets')` | Phase 1 |
| `pixel-streaming/localhost` | `app/api/pixel-streaming/start/route.ts` | `STREAM_CONTROLLER_URL` env var | Phase 1 |

**Deferred (future):** `publish_jobs`, `qr_codes`, `notifications`, `system_logs`

---

## 11. Pilot Project: Smart Luxury Villa

**Status:** ✅ Created in database

| Property | Value |
|----------|-------|
| Project ID | `proj_smart_luxury_villa` |
| Name | Smart Luxury Villa |
| Client | VizTR Labs (`viztr.labs@gmail.com`) |
| Status | IN_PRODUCTION |
| Access Code | VIZTR-2026 |
| Services | All 9 services enabled |
| Owner | `ca0fc6bb-0797-4094-a690-b3aa1f0f285a` (viztr.labs@gmail.com) |

**Super Admin User:** ✅ Created
- Email: viztr.labs@gmail.com
- Password: 123456
- Role: SUPER_ADMIN
- User ID: `ca0fc6bb-0797-4094-a690-b3aa1f0f285a`

---

## 12. Dashboard Real-time Syncing Architecture

### Requirements
- All dashboards (Client, Admin, Super Admin, User) must reflect updates automatically in real-time
- Use Supabase Realtime subscriptions for database changes
- Fallback to polling if WebSocket is unavailable

### Implementation Plan
- Add `useRealtime` hook to `lib/store.ts`
- Subscribe to `projects`, `experiences`, `assets`, `deliverables`, `activity_logs`, `feedback` tables
- Update all dashboard components when database changes occur
- Use Supabase `channel('realtime')` with `on('UPDATE', ...)` and `on('INSERT', ...)` events

---

## 13. Experience Page Architecture

### Requirements
- Single page where all services are shown
- 1-click switch between XR, VR, AR, VT, VIZSPLAT, Pixel Streaming
- Each service renders its appropriate viewer/experience

### Implementation Plan
- Create `app/experience/[projectId]/page.tsx`
- Service selector component with 1-click switching
- Dynamic import of service-specific viewers (XRViewer, TourViewer, SplatViewer, PixelStreamingPlayer)
- URL state for current service selection
- Project context from `useAppStore` or `useParams`

---

## 14. Architecture Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| One Project can contain multiple Services | ✅ Already in DB schema |
| All 8 services have independent service definitions | ✅ `services` table + `project_services` |
| Experiences belong to Projects/Services | ✅ `experiences` + `experience_configs` |
| Assets can be reused by appropriate Experiences | ✅ `assets` table has `project_id`, `service_id`, `experience_id` |
| Deliverables represent actual client outputs | ✅ `deliverables` table exists |
| Client can navigate: Project → Service → Preview → Feedback → Approval → Delivery | 🟡 Components exist; route alignment needed |
| Admin can navigate: Client → Project → Service → Production → Delivery | 🟡 Admin APIs exist; mock data needs replacement |
| Public users access only published experiences | ✅ `experience_published_at` + RLS |
| Editor belongs to: Project → Service → Experience | 🔴 Multiple duplicate editors |
| Asset storage is independent from UI/editor implementation | 🔴 In-memory chunks need replacement |
| No unnecessary duplicate Project/Service/Experience/Asset concepts | ✅ Core schema is correct |
| No unnecessary service-specific application silos | 🔴 Service-specific page directories exist |
| No overlapping canonical stores for the same domain | 🔴 11+ stores with overlapping domains |
| Mock systems are documented and intentionally deferred | 🟡 Mock admin APIs identified |
| Dashboards sync automatically in real-time | 🟡 To be implemented |
| 1-click service switching experience page | 🟡 To be implemented |
| Pilot project with all services | ✅ Smart Luxury Villa created |

---

## 15. Smart Luxury Villa Showreel Data Map

The pilot project "Smart Luxury Villa" should demonstrate all VizTR services:

| Service | Expected Assets | Expected Experience | Expected Deliverable |
|---------|----------------|--------------------|--------------------|
| Still Renders | `.glb`, `.jpg`, `.png` | Exterior/Interior renders | Final JPG/PNG |
| Animation | `.mp4` source, `.glb` | Walkthrough video | Final MP4 |
| WebXR | `.glb` model | PlayCanvas WebXR | WebXR URL |
| WebAR | `.glb` model | PlayCanvas WebAR | WebAR URL |
| Virtual Reality | `.glb` model | Browser VR | VR URL |
| Virtual Tour | `.jpg` panoramas | Marzipano Tour | Tour URL |
| Gaussian Splat | `.ply`/`.splat` | Splat Viewer | Splat URL |
| Pixel Streaming | Unreal Project | GPU Stream | Streaming URL |

---

## 16. Real-time Dashboard Syncing Design

```
┌─────────────────────────────────────────────────────────┐
│                    Supabase Database                      │
│  projects  experiences  assets  deliverables  activity_logs│
│       │              │              │           │         │
│       └──────┬───────┘              │           │         │
│              │              │         │           │         │
│         Realtime Subscriptions                              │
│              │              │         │           │         │
│     ┌────────┴────────┐      │         │           │         │
│     │  useRealtime     │      │         │           │         │
│     │  (Zustand hook)  │      │         │           │         │
│     └────────┬────────┘      │         │           │         │
│              │              │         │           │         │
│     ┌────────┼────────┼──────┼─────────┼───────────┼─────┐
│     ↓        ↓        ↓      ↓         ↓           ↓     │
│  Client   Admin    Super   User     Project     Service │
│  Dashboard Dashboard Admin    Dashboard   Dashboard   Dashboard│
│     ↓        ↓        ↓      ↓         ↓           ↓     │
│  Auto-refresh components when data changes               │
└─────────────────────────────────────────────────────────┘
```

### Implementation Details
- **Hook:** `useRealtime(tableName, callback)` in `lib/store.ts`
- **Subscription:** `supabase.channel('realtime:projects').on('postgres_changes', ...)`
- **Fallback:** Polling every 30 seconds if WebSocket fails
- **Dashboards:** All dashboard components subscribe to relevant tables
- **Notifications:** Real-time activity log updates trigger in-app notifications

---

## 17. 1-Click Service Switching Experience Page

```
┌─────────────────────────────────────────────────────────┐
│              Experience Page (app/experience/...)          │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Service Selector: [XR] [VR] [AR] [VT] [Splat] [PS] │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Active Service Viewer                   │  │
│  │  (Dynamic import based on selection)                 │  │
│  │                                                      │  │
│  │  XR → XRViewer   │  VT → TourViewer                 │  │
│  │  Splat → Splat   │  PS → PixelStreamingPlayer       │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Project Context: Smart Luxury Villa                 │  │
│  │  Service: WebXR | Status: Active | Progress: 75%     │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

*Document generated on 2026-09-18. Pilot project "Smart Luxury Villa" and super admin user created. Database setup complete.*
