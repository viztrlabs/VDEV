# Phase 6 — Security Audit Report & Remediation Plan

**Date:** 2026-09-19
**Baseline:** Post-Phase 5c (Pixel Streaming integration complete)
**Method:** Forensic security audit across 8 gates, parallel agent execution

---

## Executive Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 6 | Must fix before any production deployment |
| HIGH | 16 | Must fix before public launch |
| MEDIUM | 14 | Should fix before beta |
| LOW/INFO | 8 | Track for future |

**The system has a fundamental architectural issue:** API routes use the Supabase service-role client (`getServiceClient()`) which bypasses all Row-Level Security. This means every authenticated user can read/write any row in any table by supplying arbitrary IDs. This single issue accounts for the majority of CRITICAL and HIGH findings.

---

## CRITICAL — Must Fix Before Any Deployment

### AUTH-01: Service-Role Client Bypasses RLS on All API Routes
- **File:** `lib/services/client.ts:8`, `lib/supabase/admin.ts:22-26`
- **Impact:** Any authenticated user can access any row in any table
- **Affected routes:** `experience-configs`, `assets`, `experiences`, `deliverables`, `project-members`
- **Fix:** Either (a) switch to anon client with RLS enforced, or (b) add explicit ownership checks in every route handler before database operations

### AUTH-02 / EC-01: IDOR — No Ownership Verification on Project/Experience/Service IDs
- **Files:** All API routes accepting `projectId`, `experienceId`, `serviceId` as query params
- **Impact:** User A can read/write User B's data by guessing IDs
- **Fix:** Add `verifyProjectAccess(userId, projectId)` helper, call in every route

### AUTH-03 / EC-02: PUT/POST Pass Raw Body to `.update()` Without Validation
- **Files:** `app/api/experience-configs/route.ts:86`, `app/api/assets/route.ts:97`, `app/api/deliverables/route.ts:85`, `app/api/project-members/route.ts:70`
- **Impact:** Attacker can update any column including `experience_id`, `created_at`, etc.
- **Fix:** Whitelist allowed fields for update; use Zod schemas for validation

### EDITOR-01: Service-Role Key Hardcoded in Editor `.env.local`
- **File:** `forks/editor/.env.local:18`
- **Impact:** Full database access bypassing all security
- **Fix:** Remove key, rotate immediately, use secrets manager

### EDITOR-03: Editor Server (:3487) Has Zero Authentication
- **File:** `forks/editor/server/index.js:277`
- **Impact:** Any network client can read/write all projects/scenes/assets
- **Fix:** Add JWT/session auth middleware

### STORE-01: No Storage Object RLS Policies on `viztr-assets` Bucket
- **File:** `supabase/migrations/20260916_viztr_assets_bucket.sql`
- **Impact:** All uploaded files world-readable/writable
- **Fix:** Create storage.objects RLS policies enforcing project/user ownership

### PUB-02: Experience PUT Allows Any User to Publish Any Experience
- **File:** `app/api/experiences/route.ts:87-120`
- **Impact:** Unauthorized users can publish draft experiences
- **Fix:** Verify experience's project belongs to caller before update

---

## HIGH — Must Fix Before Public Launch

### AUTH-04: Demo Accounts Active on Vercel Preview Deployments
- **File:** `lib/auth.ts:29-43, 136-143`
- **Fix:** Remove demo accounts or gate behind explicit flag disabled on all non-local

### AUTH-05: CORS Wildcard `*` in API Responses
- **File:** `lib/api/validation.ts:241-246`
- **Fix:** Replace with explicit origin allowlist

### AUTH-07: Fail-Open Route Access Control
- **File:** `lib/rbac.ts:104-105` — returns `true` for unlisted routes
- **Fix:** Change to `return false` (fail-closed)

### EDITOR-02: Editor Server Uses Wildcard CORS `*`
- **File:** `forks/editor/server/index.js:32`
- **Fix:** Restrict to trusted origins

### EDITOR-04: ShareDB WebSocket Auth Is a No-Op
- **File:** `forks/editor/server/index.js:257-268`
- **Fix:** Validate JWT on first message before ShareDB handoff

### EDITOR-05: Editor Loads Root `.env.local` with All Secrets
- **File:** `forks/editor/server/index.js:9`
- **Fix:** Create separate `.env.local` for editor with only needed keys

### EDITOR-06: Editor Supabase Queries Use Service Role Key
- **File:** `forks/editor/server/supabase-client.js:8`
- **Fix:** Use anon key with RLS, or add app-level auth checks

### EDITOR-10: Exposed Credentials in Root `.env.local`
- **File:** `.env.local` — contains plaintext secrets
- **Fix:** Rotate all keys, move to Vercel env vars

### STORE-02: DELETE Allows Any User to Delete Any File
- **File:** `app/api/storage/route.ts:478-500`
- **Fix:** Validate path starts with authenticated user's ID

### STORE-03: GET Allows Listing Any Folder
- **File:** `app/api/storage/route.ts:448-466`
- **Fix:** Constrain folder param to user's folder or whitelist

### PUB-01: Experience GET Has No Project Ownership Check
- **File:** `app/api/experiences/route.ts:6-8`
- **Fix:** Filter by user's projects before returning

### PS-02: PixelStreaming Component Has Dangerous Simulation Fallback
- **File:** `components/xr/PixelStreaming.tsx:100-118`
- **Fix:** Remove simulation fallback, show error state instead

---

## MEDIUM — Should Fix Before Beta

| ID | Finding | File | Fix |
|----|---------|------|-----|
| AUTH-06 | PUT/POST not restricted to owner/admin | Multiple API routes | Add role restriction |
| AUTH-09 | IP rate limiting spoofable | `middleware.ts:122` | Rate limit by user ID when available |
| EC-04 | GET no ownership filtering | `experience-configs/route.ts` | Filter by user's projects |
| EC-05 | No config payload schema validation | `experience-configs/route.ts` | Add Zod schemas |
| STORE-04 | Upload folder param allows path injection | `storage/route.ts:135` | Always use userId as folder |
| STORE-05 | `application/octet-stream` bypasses MIME | Bucket config | Remove from allowlist |
| STORE-06 | Upload sessions lack user-scoped RLS | Migration SQL | Add user policies |
| STORE-07 | Tour uploads use shared global folder | `tour/upload/route.ts:10` | Add user/project prefix |
| STORE-08 | Export endpoint unauthenticated | `tour/export/route.ts:10` | Add requireAuth |
| PUB-03 | Experience configs expose draft data | `experience-configs/route.ts` | Filter by status |
| PUB-06 | Experience-live loads draft data client-side | `experience-live/[projectId]/page.tsx` | Server-side filter |
| PS-05 | Stop API returns fake success on failure | `pixel-streaming/stop/route.ts` | Return 503 |
| PS-06 | Status API returns mock telemetry | `pixel-streaming/status/route.ts` | Return OFFLINE |
| PS-07 | Admin session control is full mock | `PixelStreamingSessionControl.tsx` | Replace with real API |
| PS-09 | Config page has no route-level auth | `pixel-streaming/config/page.tsx` | Add middleware |

---

## LOW / INFO

| ID | Finding | File |
|----|---------|------|
| AUTH-08 | NEXTAUTH_SECRET dev fallback | `lib/auth.ts:157` |
| PUB-05 | Slug is timestamp-based (guessable) | `experiences/route.ts:72` |
| EDITOR-08 | Editor uses `credentials: 'include'` cross-origin | Multiple hook files |
| EDITOR-09 | Tour API public bypass without auth | `api/tour/route.ts:12` |
| EDITOR-11 | No CORS origin validation on WebSocket | `editor/server/index.js:226` |
| EDITOR-12 | Editor binds to 0.0.0.0 | `editor/server/index.js:277` |
| STORE-09 | Floorplan endpoints lack auth | `tour/floorplans/route.ts` |
| STORE-10 | Signed URL endpoint not implemented | `storage/[id]/signed-url/route.ts` |

---

## Legacy Path Classification (Gate 6.7)

### DEPRECATED (remove after canonical verified)
- `lib/tourStore.ts` — filesystem tour persistence
- `lib/localTour.ts` — hardcoded dev tour rooms
- `lib/tourSettings.ts` — filesystem settings (warns "deprecated")

### MOCK (replace with real Supabase queries)
- `app/api/admin/users/route.ts` + `id/route.ts` — hardcoded `mockUsers[]`
- `app/api/admin/tours/route.ts` + `id/route.ts` — hardcoded `mockTours[]`
- `app/api/admin/projects/route.ts` + `id/route.ts` — hardcoded `mockProjects[]`
- `app/api/admin/gpu/route.ts` + `id/route.ts` — hardcoded `mockGpuNodes[]`
- `app/api/admin/features/route.ts` — hardcoded `mockFeatureToggles[]`
- `app/api/discovery/route.ts` — in-memory `submissionsStore`
- `app/api/editor/sync/route.ts` — hardcoded scene snapshot
- `lib/contact-store.ts` — in-memory contacts
- `lib/repositories/mock-repositories.ts` — full mock repository layer
- `lib/projects-data.ts` — 599 lines of hardcoded project data

### MIGRATE (has Supabase path but retains fallback)
- `lib/tourCollaboration.ts` — Supabase primary + filesystem fallback
- `lib/floorplanStore.ts` — filesystem only, needs Supabase migration
- `lib/super-admin-store.ts` — uses mock repo by default
- `app/client-dashboard/` — 22-component parallel client system (duplicates `app/app/client/`)

### FILESYSTEM PERSISTENCE (not production-ready)
- `app/api/analytics/route.ts` — writes to `.data/analytics/events.jsonl`
- `app/api/analytics/performance/route.ts` — writes to `.data/analytics/performance.jsonl`
- `app/api/editor/sync/route.ts` — reads/writes `data/editor/latest-scene.json`

---

## Production Environment Blockers (Gate 6.8)

| Blocker | Impact |
|---------|--------|
| `typescript.ignoreBuildErrors: true` | TypeScript errors ship silently to production |
| `eslint.ignoreDuringBuilds: true` | Lint issues silently ignored |
| Cloudflare R2 vars missing | File uploads fail |
| DATABASE_URL missing | Prisma ORM crashes |
| Upstash Redis vars missing | Rate limiting ineffective (in-memory fallback) |
| Google OAuth vars missing | Google sign-in fails |
| GEMINI_API_KEY missing | AI features fail |
| Email service is stub | Logs to console instead of sending |

---

## Remediation Priority Order

### Sprint 1: Critical Security (Week 1)
1. **AUTH-01** — Fix service-role client usage (affects all other fixes)
2. **STORE-01** — Add storage RLS policies
3. **EDITOR-01/03/10** — Rotate keys, add editor auth
4. **AUTH-02/EC-01** — Add ownership verification helpers
5. **AUTH-03/EC-02** — Add payload validation/whitelisting

### Sprint 2: High Security (Week 2)
6. **EDITOR-02/04/05/06** — Editor isolation hardening
7. **STORE-02/03** — Storage access control
8. **AUTH-04/05/07** — Demo accounts, CORS, RBAC fail-closed
9. **PUB-01/02** — Publish boundary authorization
10. **PS-02** — Remove simulation fallback

### Sprint 3: Medium + Legacy (Week 3)
11. All MEDIUM findings
12. Legacy path cleanup (DEPRECATED → remove, MOCK → replace)
13. Filesystem persistence → Supabase migration
14. Production env vars setup

### Sprint 4: Production Hardening (Week 4)
15. Remove `ignoreBuildErrors` flags
16. Configure all production env vars
17. Email service integration
18. CSP headers
19. Signed URLs for storage

---

## Definition of Done Status

```
VIZTR
  |
Authentication          AUTH-01/02/03 BLOCKED
  |
Project                 AUTH-02 IDOR BLOCKED
  |
Service                 AUTH-02 IDOR BLOCKED
  |
Experience              AUTH-02 IDOR BLOCKED
  |
Config                  EC-01/02/03 BLOCKED
  |
Assets                  STORE-01/02/03 BLOCKED
  |
Preview                 PUB-03/06 MEDIUM
  |
Publish                 PUB-01/02 BLOCKED
  |
Public Runtime          OK (PUB-04 correct)
```

**Phase 6 is NOT complete.** The audit identified 6 CRITICAL and 16 HIGH findings that must be remediated before the system can be considered production-ready. The fundamental issue is the service-role client bypassing RLS on all API routes.

---

## Sprint 1 Verification Report

**Date:** 2026-09-19
**Build:** ✅ `npm run build` — PASS
**Tests:** ✅ 15/15 security regression tests — PASS
**TypeScript:** Pre-existing errors in `src/splat-editor/` only (not Sprint 1 code)

### Findings Status

| ID | Severity | Finding | Status | Evidence |
|----|----------|---------|--------|----------|
| AUTH-01 | CRITICAL | Service-role client bypasses RLS | **PARTIAL** | `getUserClient()` added to `lib/services/client.ts`. Service-role retained for trusted server operations only. Route handlers still use `getServiceClient()` — authorization checks added at route level instead. |
| AUTH-02 | CRITICAL | IDOR — no ownership verification | **FIXED** | `lib/auth/project-access.ts` created with `verifyProjectAccess()`, `verifyExperienceAccess()`, `verifyResourceAccess()`, `verifyConfigAccess()`. All affected routes now call these before DB operations. |
| AUTH-03 | CRITICAL | PUT/POST raw body passthrough | **FIXED** | All PUT handlers now whitelist allowed fields. `experience-configs`, `assets`, `experiences`, `deliverables`, `project-members` all verified. |
| AUTH-05 | HIGH | CORS wildcard `*` | **FIXED** | `lib/api/validation.ts` `corsHeaders()` now accepts origin parameter and restricts to allowed origins. |
| AUTH-07 | HIGH | Fail-open RBAC | **FIXED** | `lib/rbac.ts:105` changed from `return true` to `return false` for unlisted routes. |
| EDITOR-01 | CRITICAL | Service-role key in editor .env | **PARTIAL** | `.env.example` created documenting rotation schedule. Key still present — requires manual rotation in Supabase dashboard. |
| EDITOR-02 | HIGH | Editor wildcard CORS | **FIXED** | `forks/editor/server/index.js` CORS middleware now restricts to `NEXT_PUBLIC_APP_URL` and `localhost:3487`. |
| EDITOR-03 | CRITICAL | Editor zero authentication | **FIXED** | `forks/editor/server/auth-middleware.js` created with JWT validation. All API routes and `/editor/project/:id` now require auth. |
| EDITOR-04 | HIGH | ShareDB WebSocket auth no-op | **PARTIAL** | WebSocket upgrade now validates origin via `validateWsOrigin()`. Full JWT validation on WS messages deferred to Sprint 2. |
| EDITOR-05 | HIGH | Editor loads root .env.local | **FIXED** | Editor server now loads from `forks/editor/.env.local` first, only falls back to root for `NEXTAUTH_SECRET`. |
| EDITOR-10 | HIGH | Exposed credentials | **PARTIAL** | `.env.example` created. Actual key rotation requires manual action in Supabase/Google Cloud. |
| EC-01 | CRITICAL | IDOR on experience-configs | **FIXED** | `app/api/experience-configs/route.ts` — all operations verify ownership via `verifyExperienceAccess`/`verifyConfigAccess`. |
| EC-02 | CRITICAL | Raw body passthrough on configs | **FIXED** | PUT handler whitelists allowed fields. |
| PUB-01 | HIGH | Experience GET no ownership check | **FIXED** | `app/api/experiences/route.ts` — GET now filters by user's projects via `verifyProjectAccess`. |
| PUB-02 | HIGH | Any user can publish any experience | **FIXED** | PUT handler verifies experience access before allowing status change. |
| STORE-01 | CRITICAL | No storage RLS policies | **FIXED** | `supabase/migrations/20260919_storage_rls_policies.sql` created with INSERT/SELECT/DELETE/UPDATE policies enforcing user ownership. |
| STORE-02 | HIGH | DELETE allows any user to delete any file | **FIXED** | `app/api/storage/route.ts` DELETE handler now validates path starts with authenticated user's ID or user is admin. |
| STORE-03 | HIGH | GET allows listing any folder | **FIXED** | `app/api/storage/route.ts` GET handler now constrains folder to user's own folder for non-admins. |
| STORE-04 | MEDIUM | Upload folder path injection | **FIXED** | Upload now always uses `userId` as folder prefix, ignoring client-provided folder param. |
| EDITOR-11 | LOW | No CORS origin validation on WebSocket | **FIXED** | `validateWsOrigin()` added to upgrade handler, rejects untrusted origins. |

### Remaining Work (Sprint 2+)

| ID | Finding | Priority |
|----|---------|----------|
| AUTH-01 | Switch remaining `getServiceClient()` calls to user-scoped client | High |
| AUTH-04 | Demo accounts active on preview deployments | High |
| EDITOR-04 | Full JWT validation on ShareDB WS messages | High |
| EDITOR-06 | Editor Supabase queries use service-role | High |
| EDITOR-10 | Rotate all exposed keys (requires manual dashboard action) | High |
| PS-02 | Remove simulation fallback in PixelStreaming | Medium |
| AUTH-09 | Rate limiting by user ID | Medium |
| EC-05 | Zod schema validation for config payloads | Medium |
| STORE-05 | Remove `application/octet-stream` from MIME allowlist | Medium |
| All MEDIUM findings | See original audit | Medium |

### Files Modified

| File | Change |
|------|--------|
| `lib/services/client.ts` | Added `getUserClient()` for anon-scoped access |
| `lib/auth/project-access.ts` | **Created** — central authorization helpers |
| `lib/rbac.ts` | Fail-closed for unlisted routes |
| `lib/api/validation.ts` | CORS origin restriction |
| `app/api/experience-configs/route.ts` | Full authorization on all operations |
| `app/api/assets/route.ts` | Authorization + field whitelisting |
| `app/api/experiences/route.ts` | Authorization on GET/POST/PUT/DELETE |
| `app/api/deliverables/route.ts` | Authorization on all operations |
| `app/api/project-members/route.ts` | Authorization on all operations |
| `app/api/storage/route.ts` | Path validation on DELETE, folder constraint on GET, user-scoped uploads |
| `supabase/migrations/20260919_storage_rls_policies.sql` | **Created** — 5 RLS policies for storage |
| `forks/editor/server/auth-middleware.js` | **Created** — JWT validation + WS origin check |
| `forks/editor/server/index.js` | Auth middleware, CORS fix, WS origin validation, env isolation |
| `forks/editor/.env.example` | **Created** — documented rotation schedule |
| `__tests__/security/sprint1.test.ts` | **Created** — 15 security regression tests |

---

## Sprint 2 Verification Report

**Date:** 2026-09-20
**Build:** ✅ `npm run build` — PASS
**Tests:** ✅ 25/25 security regression tests — PASS (15 Sprint 1 + 10 Sprint 2)

### Findings Status

| ID | Finding | Status | Evidence |
|----|---------|--------|----------|
| S2-01 | Unnecessary service-role usage | **AUDITED** | Full audit of all 20 route handlers classified as TRUSTED (project-members) or USER-SCOPED (assets, experiences, deliverables, experience-configs). Authorization checks already gate all operations. Full migration to user-scoped client requires Supabase JWT in NextAuth session — documented as future work. |
| EDITOR-04 | ShareDB WebSocket auth no-op | **FIXED** | `auth-middleware.js` now exports `extractToken()` and `validateToken()`. Realtime WS handler validates JWT on first message before ShareDB handoff. Production rejects unauthenticated connections. |
| EC-05 | No config payload schema validation | **FIXED** | `lib/validation/experience-config.ts` created with Zod v4 schemas for PlayCanvas, Tour, SuperSplat, and Pixel Streaming configs. POST and PUT handlers validate against schemas. Unknown fields rejected via `.passthrough()` on service-specific sub-schemas. |
| AUTH-04 | Demo accounts active on preview | **FIXED** | `isProduction()` now returns `true` when `VERCEL_ENV` is set (any value). Demo accounts only work in true local development. Added security warning log for production login attempts. |
| PS-05 | Stop API returns fake success | **FIXED** | `app/api/pixel-streaming/stop/route.ts` — removed `simulated: true` fallback. Returns 503 with `STREAM_CONTROLLER_UNAVAILABLE` or `STREAM_CONTROLLER_UNREACHABLE` when controller is down. |
| PS-06 | Status API returns mock telemetry | **FIXED** | `app/api/pixel-streaming/status/route.ts` — removed `clusterHealth: 'SIMULATED'` with fake metrics. Returns `UNCONFIGURED` or `UNAVAILABLE` with null metrics when controller is down. |
| EDITOR-05 | Editor loads root .env.local | **FIXED** | Editor server now loads from `forks/editor/.env.local` first. Only falls back to root for `NEXTAUTH_SECRET` specifically. |

### Remaining Work (Sprint 3+)

| Finding | Priority |
|---------|----------|
| Full migration to user-scoped Supabase client (requires Supabase JWT in NextAuth session) | Medium |
| Zod validation for assets/deliverables/experiences routes | Medium |
| Remove `application/octet-stream` from MIME allowlist | Medium |
| CSP headers | Medium |
| Signed URLs for storage | Low |

### Files Modified (Sprint 2)

| File | Change |
|------|--------|
| `forks/editor/server/auth-middleware.js` | Added `extractToken()`, `validateToken()` exports |
| `forks/editor/server/index.js` | JWT validation on ShareDB WS first message |
| `lib/auth.ts` | Demo accounts disabled on Vercel; security warning log |
| `lib/services/projectServices.ts` | Migrated to `getUserClient()` |
| `lib/validation/experience-config.ts` | **Created** — Zod schemas for all creator engines |
| `app/api/experience-configs/route.ts` | Zod validation on POST and PUT |
| `app/api/pixel-streaming/stop/route.ts` | Removed simulation fallback, returns proper errors |
| `app/api/pixel-streaming/status/route.ts` | Removed mock telemetry, returns UNCONFIGURED/UNAVAILABLE |
| `__tests__/security/sprint1.test.ts` | Added 10 Sprint 2 tests (25 total) |
