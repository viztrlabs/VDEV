# VizTR Production Deployment Checklist

**Production URL:** https://viztr.vercel.app
**Supabase Project:** naludjmicbqcagrlsrba.supabase.co
**Branch:** feat/booking-system
**Last verified:** 2026-09-17

## Pre-Deployment

- [x] All 16 migrations applied to Supabase
- [x] Verify migrations: `SELECT * FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 10;`
- [x] Verify RLS: all critical tables have policies (clients, projects, experiences, assets, deliverables, feedback, activity_logs, users, sessions)
- [x] Environment variables set in Vercel (see Production Env Vars below)
- [x] `NEXTAUTH_SECRET` generated and set
- [x] `CLIENT_PORTAL_SECRET` generated and set
- [x] `viztr-assets` storage bucket exists and is public

## Deploy

- [x] Push to `feat/booking-system` branch
- [x] Deploy via `vercel --yes --force --prod`
- [x] Deployment URL loads (200)
- [x] KPSDK bot protection: fetch sanitizer applied in `app/layout.tsx`

## Production Environment Variables

| Variable | Status | Environment |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Set | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Set (BOM stripped) | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Set (BOM stripped) | Production (Sensitive) |
| `NEXTAUTH_URL` | ✅ Set (https://viztr.vercel.app) | Production |
| `NEXTAUTH_SECRET` | ✅ Set | Production (Sensitive) |
| `CLIENT_PORTAL_SECRET` | ✅ Set | Production (Sensitive) |

## Post-Deployment Smoke Test Results (2026-09-17)

### 1. Authentication ✅
- [x] Login page renders (200)
- [x] Signup page renders (200)
- [x] Auth providers: credentials configured
- [x] `admin@viztr.com` / `password123` login works (super_admin)
- [x] Demo accounts gated behind `!isProduction()` — disabled in production
- [x] CSRF protection working
- [x] Admin pages redirect to login when unauthenticated (307)

### 2. Database ✅
- [x] 54 tables present
- [x] RLS enabled on all 12 key tables
- [x] Policies on all critical tables
- [x] Storage bucket `viztr-assets` exists, public=true
- [x] E2E data chain: Client → Project → Service → Asset → Experience → Config → Deliverable → Feedback → Activity Log — all inserts successful

### 3. API Security ✅
- [x] Protected APIs return 401 for unauthenticated requests:
  - `/api/projects` → 401
  - `/api/assets` → 401
  - `/api/feedback` → 401
  - `/api/experiences` → 401
  - `/api/deliverables` → 401
  - `/api/project-services` → 401
- [x] Public APIs work without auth:
  - `/api/services` → 200 (4 services)
  - `/api/experiences/public/{slug}` → 200 (published experiences)
  - `/api/auth/providers` → 200

### 4. Public Pages ✅
- [x] `/` (Home) → 200
- [x] `/about` → 200
- [x] `/login` → 200
- [x] `/signup` → 200
- [x] `/portfolio` → 200
- [x] `/contact` → 200
- [x] `/book-consultation` → 200
- [x] `/client-access` → 200
- [x] `/xr-world` → 200
- [x] `/xr-world/virtual-tour` → 200
- [x] `/xr-world/pixel-streaming` → 200
- [x] `/xr-world/showcase` → 200
- [x] `/experience/{slug}` → 200 (public experience viewer)
- [x] `/deliverable/{id}` → 200 (GLB viewer)

### 5. Admin Pages (auth required) ✅
- [x] `/admin/projects` → 307 (redirect to login)
- [x] `/admin/clients` → 307
- [x] `/admin/dashboard` → 307
- [x] `/admin/analytics` → 307

### 6. Known Issues (NOT launch blockers)
- [ ] `/dashboard` returns 404 for unauthenticated users (expected behavior — client-side render)
- [ ] `/services` has no dedicated page (services displayed on landing page)
- [ ] Editor pages (`/editor/*`, `/xr-world/xr-editor`, `/xr-world/super-splat`) reference `localhost:3487` — requires separate editor server (POST-LAUNCH)

## Build Warnings (non-blocking)
- `lib/client-auth.ts`: Node.js `crypto` in Edge Runtime (rate limiter)
- `@upstash/redis`: `process.version` in Edge Runtime

## Vercel Deployment History

| Commit | Hash | Status |
|---|---|---|
| KPSDK fetch sanitizer | b89d46a | ✅ Production |
| stripBom for Supabase env | cc474fb | ✅ Production |
| stripBom for admin + server clients | (current) | ✅ Production |

## Rollback Plan

If issues are found:
1. Revert to previous deployment in Vercel
2. Migrations are additive only (no destructive changes) — no DB rollback needed
3. Supabase Storage bucket is idempotent (ON CONFLICT DO UPDATE)

## Post-Launch TODO

- [ ] Deploy editor server to production (or disable editor pages)
- [ ] Set up monitoring (Sentry or similar)
- [ ] Configure custom domain + SSL
- [ ] Set up backup schedule for Supabase
- [ ] Replace remaining `localhost` references with env vars
- [ ] Add `NEXT_PUBLIC_SITE_URL` env var for `experience/[slug]/page.tsx`
