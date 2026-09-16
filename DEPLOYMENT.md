# VizTR Production Deployment Checklist

## Pre-Deployment

- [ ] All 9 migrations applied to Supabase (run `supabase/deploy/20260916_combined_migration.sql` in SQL Editor)
- [ ] Verify migrations: `SELECT * FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 10;`
- [ ] Verify RLS: `SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';`
- [ ] Environment variables set (see `deploy.env.example`)
- [ ] `NEXTAUTH_SECRET` generated and set
- [ ] `CLIENT_PORTAL_SECRET` generated and set
- [ ] `viztr-assets` storage bucket exists: Dashboard → Storage → viztr-assets

## Deploy

- [ ] Push to `feat/booking-system` branch (or merge to `main`)
- [ ] Deploy via Vercel/hosting dashboard
- [ ] Verify deployment URL loads

## Post-Deployment Smoke Test

### 1. Authentication
- [ ] Login as admin: `admin@viztr.com` (dev only — disable in production)
- [ ] Login as client: access code from client directory
- [ ] Verify JWT tokens are issued
- [ ] Verify `requireAuth` blocks unauthenticated API access

### 2. Project CRUD
- [ ] Create a new project via admin dashboard
- [ ] Verify project appears in project list
- [ ] Assign a service to the project

### 3. Asset Upload
- [ ] Upload a GLB file → verify it goes to Supabase Storage `viztr-assets`
- [ ] Upload a 360 panorama (JPG) → verify tile generation
- [ ] Verify file validation rejects invalid types/sizes
- [ ] Verify asset record created in `assets` table

### 4. Experience Creation
- [ ] Create an experience linked to the project
- [ ] Verify `project_service_id` auto-injects
- [ ] Configure the experience
- [ ] Link an asset to the experience (dropdown)

### 5. Publishing
- [ ] Set experience status to "published"
- [ ] Verify `published_at` timestamp set
- [ ] Verify public URL generated: `/experience/{slug}`
- [ ] Verify QR code generated
- [ ] Open public URL in incognito → verify experience visible

### 6. Virtual Tour
- [ ] Set tour `live: true`, `access_level: 'public'`
- [ ] Open `/virtual-tour/{tourId}` in incognito → verify tour loads (no auth required)
- [ ] Verify panorama tiles load from Supabase Storage

### 7. Client Portal
- [ ] Client logs in via `/client-access`
- [ ] Client sees their project in "My Projects"
- [ ] Client submits feedback → verify stored in `feedback` table
- [ ] Activity log shows recent actions

### 8. Admin Dashboard
- [ ] Admin stats show real counts (projects, clients, experiences, assets)
- [ ] Admin can list/manage users
- [ ] Admin can list/manage projects

### 9. GLB Viewer
- [ ] Open `/deliverable/{id}` for a GLB asset
- [ ] Verify ModelViewer loads with Draco/Meshopt decoders
- [ ] Verify compressed models render correctly

### 10. Security
- [ ] Anonymous users cannot access protected API routes
- [ ] RLS policies block cross-tenant data access
- [ ] TURN credentials not exposed in API responses
- [ ] Signed URLs return 501 (not forgeable tokens)

## Rollback Plan

If issues are found:
1. Revert to previous deployment in Vercel
2. Migrations are additive only (no destructive changes) — no DB rollback needed
3. Supabase Storage bucket is idempotent (ON CONFLICT DO UPDATE)

## Post-Launch

- [ ] Disable demo accounts in production (`!isProduction()` gates already in place)
- [ ] Set up monitoring (Sentry or similar)
- [ ] Configure custom domain + SSL
- [ ] Set up backup schedule for Supabase
