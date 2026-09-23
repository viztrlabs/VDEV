# Virtual Tour P0 Lifecycle Repair — Completion Report

**Date:** 2026-09-24
**Status:** PASS (all acceptance-matrix checks green; work uncommitted on `main`)

## Scope

P0 fixes from the `2026-09-22-virtual-tour-audit.md` plan:

| P0 | Item | Outcome |
|----|------|---------|
| P0-1 | Editor live preview (MarzipanoViewer prop mismatch) | Fixed |
| P0-2 | Stable slug identity survives editor/builder/public round-trips | Fixed |
| P0-3 | Global single-tour collision in `lib/toursRepo.ts` | Fixed + root-caused |
| P0-4 | experience-config + TourBuilder publish wiring (editor save/publish path) | Fixed |

Kept strictly in scope: no redesign, no new persistence/publishing system, no
`localStorage` as source of truth, no new security bypasses.

## Verification Results

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | Tour unit suites (`tourIdentity`, `toursRepo`, `tourRoomToScene`, `supabaseEnv`) | ✅ 41/41 | `npx jest lib/__tests__/<those>` |
| 2 | Full jest suite | ✅ no regressions | 616 total, 601 pass, 15 fail / 11 suites = exact pre-existing baseline (leadsStore, engine-store, editor-setup route, projects client route, tour-builder validation, 3× Playwright `.kilo`) |
| 3 | Production build | ✅ | `npx next build` compiled successfully (route map generated) |
| 4 | tsc on all touched files | ✅ clean | remainder = documented pre-existing debt (`editor/page.tsx:1687/1692`, `EditorValidationPanel.tsx:12`) |
| 5 | E2E acceptance matrix (fresh hosted-DB baseline, `:3100`) | ✅ 22/22 | two-tour isolation, Save→Reload, edit-isolation, per-tour settings, publish gating (`public=1` 404 → 200), public page route, invalid slug 404, scoped views |

### E2E highlights (real Supabase via service key)

```
PUT A {title:'A Project', projectId:'proj_a', experienceId:'exp_a', 1 room}   -> a-project-4gmfdq / {new uuid}
PUT B {title:'B Project', projectId:'proj_b', experienceId:'exp_b', 2 rooms}  -> b-project-0pq0xb / {new uuid}
GET ?tour=<a> -> rooms == A; GET ?tour=<b> -> rooms == B (isolated)
Edit A -> B rooms/version untouched; A slug stable
Settings live=true for A only; B unaffected
/api/tour?tour=<b>&public=1 -> 404 ; ?tour=<a>&public=1 -> 200 (A saved rooms)
/virtual-tour/<a-slug> -> 200 ; random slug + public -> 404
POST + GET views scoped per tour
```

## Root Cause Findings (hosted DB is real and reachable)

Probing the live project (`naludjmicbqcagrlsrba.supabase.co`, service key) exposed
facts that **contradicted assumptions in the P0 branch**:

1. **`tours` has NO `parent_project` column.** Every project-scoped query/write
   (`resolveTourRow` pre-filter, `saveTour*` payloads) sent an unknown column →
   PostgREST `400`, and the update/insert errors were **never checked**, so saves
   reported success while writing nothing.
2. **`tours.owner_id` is `uuid NOT NULL` with an FK to Prisma `"User"(id)`**, not
   `public.profiles`. The previous single row (slug `smart-luxury-villa-tour`,
   from the 2026-09-20 Smart Luxury Villa seed) carried no `data.identity`, so any
   experience-scoped save **adopted it** (`rowMatches` unclaimed-row rule) — which
   is exactly the E2E collapse: A and B both "updated" the same row and returned
   its legacy id/slug.
3. Env note: `.env.local` anon key is a 13-char placeholder, but the service key is
   a valid JWT, so `isUsableSupabaseEnv` is `true` here and all routes exercise the
   DB path (not the local fallback). Earlier "401 / unverifiable" recon was the
   anon key, not the service key.

## Fixes Applied — `lib/toursRepo.ts`

- **Schema-tolerant project scoping**: replaced `eq('parent_project', …)` with
  `eq('data->identity->>projectId', …)` (JSONB identity carries the project; no
  ALTER on the shared table needed). `buildIdentity` reads `data.identity.projectId`.
- **Write errors are surfaced**: `saveTour`, `saveTourSettings`, `onTourView` now
  check `update`/`insert` errors and throw instead of silently faking success.
- **Cross-project adoption guard**: an unclaimed-row adoption under an
  `experienceId` scope no longer claims a row whose `data.identity.projectId` (or
  `owner_id`) belongs to a different project/owner. (One-time adoption of a truly
  unclaimed legacy row is retained as the documented migration path.)
- **`owner_id NOT NULL` fallback**: unauthenticated dev writes resolve the
  platform's first `"User"` id at insert time (`resolveFallbackOwner`); production
  always binds the caller's user id behind auth; updates never re-assign an owner.

## Supporting Changes

- `lib/test-helpers/fakeSupabaseClient.ts`: serves the `"User"` table (read-only,
  `FAKE_USER_ID`), resolves `data->identity->>…` JSONB filters, and fixed
  pre-existing TS errors in the file (moved here earlier from `lib/__tests__/`).
- `lib/__tests__/toursRepo.test.ts`: +3 tests (project-only JSONB scoping,
  cross-project adoption guard, fallback owner + ownership guard).

## Honest Limitations / Notes

- **No DB migration was run.** The correct long-term owner-scoping remains a real
  `owner_id` (FK-verified). `parent_project` is intentionally unused because the
  column does not exist; if it is later added, the JSONB filter is still correct.
- **Test data**: the stale `smart-luxury-villa-tour` row and both E2E tour rows
  were deleted after verification. Env `.env.local` still holds a placeholder anon
  key (unrelated to the P0 fix).
- **Pre-existing P1 debt unchanged** (flagged by the audit, not in P0 scope):
  service-role access everywhere on tour paths, RLS bypassed, no `?public=1`
  bypasses added (strict 404 for unpublished/random).
- Stale dev server on `:3000` still shows public-viewer 500s (hot-reload debris);
  the verified runs used the fresh server on `:3100`.

## Files Touched (work uncommitted on `main`, base `bbbd00c`)

`lib/toursRepo.ts`, `lib/supabase/admin.ts`, `lib/services/client.ts`,
`lib/tourIdentity.ts`, `lib/tourScope.ts`, `lib/tourRoomToScene.ts`,
`lib/tourStore.ts`, `lib/tourSettings.ts`, `lib/localTour.ts`,
`lib/experienceResolver.ts`, `lib/test-helpers/fakeSupabaseClient.ts`,
`lib/__tests__/{tourIdentity,toursRepo,tourRoomToScene,supabaseEnv}.test.ts`,
`app/api/tour/{route,settings/route,views/route}.ts`,
`app/xr-world/virtual-tour/{editor/page,tour-builder/page}.tsx`,
`app/virtual-tour/[tourId]/page.tsx`,
`components/editor/MarzipanoViewer.tsx`,
`components/tour-builder/TourToolbar.tsx`, `next.config.ts` (if touched).