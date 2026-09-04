# VizTR Phase 13 — Production Readiness Checklist

## Pre-Deployment Verification

### Build & Lint
- [x] `pnpm run build` — PASS
- [x] `pnpm run lint` — 0 NEW errors
- [x] `pnpm run test` — 16/17 suites passing, 120/120 tests passing

### API Endpoints
- [x] `/api/project-services` — CRUD functional
- [x] `/api/experiences` — CRUD functional
- [x] `/api/experience-configs` — CRUD functional
- [x] `/api/deliverables` — CRUD functional
- [x] `/api/assets` — CRUD functional
- [x] `/api/project-members` — CRUD functional

### Editor Routes
- [x] `/under-admin/users/[userId]/projects/[projectId]/editor-dashboard/virtual-tour`
- [x] `/under-admin/users/[userId]/projects/[projectId]/editor-dashboard/exterior`
- [x] `/under-admin/users/[userId]/projects/[projectId]/editor-dashboard/interior`
- [x] `/under-admin/users/[userId]/projects/[projectId]/editor-dashboard/animation-walkthrough`
- [x] `/under-admin/users/[userId]/projects/[projectId]/editor-dashboard/webar`
- [x] `/under-admin/users/[userId]/projects/[projectId]/editor-dashboard/webxr`
- [x] `/under-admin/users/[userId]/projects/[projectId]/editor-dashboard/virtual-reality`
- [x] `/under-admin/users/[userId]/projects/[projectId]/editor-dashboard/pixel-streaming`
- [ ] `/under-admin/users/[userId]/projects/[projectId]/editor-dashboard/gaussian-splat` — DEFERRED

### Security
- [x] RLS policies active on all new tables
- [x] Owner/admin/member access controls enforced
- [x] Public read via project visibility
- [x] Service entitlements enforced via `project_services`

### Performance
- [x] Build succeeds with stable bundle sizes
- [x] Shared chunk: ~103 kB
- [x] No obvious regressions from new code

### Known Issues
- Pre-existing lint errors in `lib/3d/xr/useXRHandHook.tsx`, `src/hooks/useScenes.ts`, `src/hooks/useSupabaseAuth.ts`, `src/lib/supabase.ts`
- Pre-existing test failure in `__tests__/integration/test-final-cross-module-integration.ts`
- Gaussian splat editor deferred pending upstream source restoration

## Deployment Notes
- Use `pnpm run build` then `pnpm run start` for production
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Enable RLS policies via Supabase migrations before first production run
- Seed service catalog via `supabase/migrations/20260903_phase1_service_seed.sql`
