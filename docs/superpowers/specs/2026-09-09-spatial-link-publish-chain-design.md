# Spatial Link Publish Chain — Design (Approach A)

**Status:** Approved (spec) — for implementation planning.
**Date:** 2026-09-09
**Goal:** Make the XR link-generator's published spatial links actually resolve to a working viewer, as a real foundation for publishing client tours.

## Problem

The XR link-generator (`app/xr-world/link-generator/page.tsx`) publishes spatial links that point to a **nonexistent route**. Three mismatched URL schemes, none resolve:

1. **Link generator** (`page.tsx:81`) builds `${origin}/xr-world/view/${slug}` → route **does not exist** (404). Its sample slugs (`glass-pavilion-v1`, `tokyo-skyloft-xr`, `brutalist-garden-ar`) have no backing record or viewer.
2. **`/api/xr-links` POST** (`route.ts:262`) builds a *different* URL `${baseUrl}/xr/${slug}` where `baseUrl` defaults to `https://viztr.studio` (wrong domain for this repo) — and `/xr/[slug]` does not exist either.
3. **The real working viewer** is `app/xr/view` (static), rendering `XRViewer` from query param `?project=apex-tower`. Functional but not slug-parametric and unused by the generator.

Additionally, `/api/xr-links` is **auth-gated** (`requireAuth`), but shared spatial links must be readable by **unauthenticated** clients — a viewer resolving via the existing GET would 401.

## Scope Decision (user-confirmed)

**Approach A — full real pipeline**, even though current data is demo:
- New parametric `/xr-world/view/[slug]` route that resolves a slug and renders a viewer.
- **Dedicated public resolution endpoint** `GET /api/xr-links/public/[slug]` returning a sanitized record (no `accessPassword`).
- Fix `/api/xr-links` POST to build `shareUrl` against the real origin + `/xr-world/view/{slug}`.
- Seed sample records so the built-in generator slugs resolve out of the box.
- **Password gating included** now: `/xr-world/view/[slug]` shows a gate when `passwordProtected` is set.
- **No DB migration in this pass.** Persistence stays as-is: Supabase-if-configured (graceful fallback) else the in-memory `XR_LINKS_DB` store. Adding the `xr_links` table is a follow-up.

## Architecture

### 1. Public slug resolution — `app/api/xr-links/public/[slug]/route.ts`

New route handler, NOT auth-gated. Resolves a slug to a `XRLinkRecord` from the same source used by `/api/xr-links` (`getXRLinksFromDB`: Supabase if configured + reachable, else in-memory `XR_LINKS_DB`). **Slug lookup:** a record must carry a stable `slug` field; resolve by exact (case-insensitive) match.

**Behavior:**
- `GET /api/xr-links/public/{slug}`:
  - Found + status `active` → `200 { success: true, xrLink: { ...sanitized } }`.
  - Found + status `expired` → `200 { success: true, xrLink: { ...sanitized, status: 'expired' }, expired: true }` (viewer shows an expired state).
  - Found + status `revoked` → `200 { success: true, xrLink: { ...sanitized, status: 'revoked' }, revoked: true }`.
  - Not found → `404 { success: false, error: 'Link not found' }`.
  - `processing`/`draft` → `404` with `error: 'Link not ready'`.

**Sanitized record (expanded):** omit `accessPassword`; omit admin-only aggregates (`viewsCount`, `uniqueVisitors`, `avgEngagementSecs` — not needed by the viewer, avoids leaking analytics). Return the fields the viewer needs:
`id, name, projectId, sceneId?, modelUrl?, thumbnailUrl?, environment, arPlacement, passwordProtected, status, expiresAt, metadata { engineType, arConfig { placement, environment, passwordProtected }, delivery }`.

**Persistence refactor:** Extract the store access (`getXRLinksFromDB`, seed init, `XR_LINKS_DB`) into a shared module (e.g. `lib/xr-links-store.ts`) so both the public route and the existing `/api/xr-links` use one source of truth. The in-memory array gains a `slug` field per seeded record.

### 2. Parametric viewer — `app/xr-world/view/[slug]/page.tsx`

Client `'use client'` page (renders client `XRViewer`). Receives `params.slug`. On mount:
1. `GET /api/xr-links/public/{slug}`.
2. If `expired`/`revoked` → render a terminal state panel (icon + message + link back to `/xr-world`).
3. If `404` → render "Link not found or not ready" panel.
4. If `passwordProtected` → render a password prompt gate; on correct password (checked **client-side against the record's `accessPassword` delivered only after a successful check**, or via a small checked endpoint — see Notes) reveal the viewer.
5. Otherwise render `XRViewer projectId={record.projectId ?? fallback}` inside a chrome matching `/xr/view` (Exit/Project ID header, footer), honoring `environment`/`arPlacement` where `XRViewer` supports it.

Falls back to `XRViewer` for both `webxr` and `webar` modes (the actual WebXR rendering lives in `XRViewer`; the modes differ only in surrounding chrome and `arPlacement`, which is passed through where supported).

### 3. `/api/xr-links` changes (existing route)

- **POST:** fix `shareUrl` to `\`${origin}/xr-world/view/${slug}\`` where `origin = process.env.NEXT_PUBLIC_APP_URL || req request origin`. **Drop** the wrong `viztr.studio` default and the `/xr/{slug}` scheme. **Accept and persist an explicit `slug` from the request body when provided** (the generator sends one); otherwise fall back to deriving it from `name` via the existing `generateSlug`. Persist `slug` on the record and return it in the response so the client's copied link always matches the stored slug.
- **GET:** (optional, low cost) accept an optional `?slug=` filter for admin/internally-gated lookups. Auth stays as-is.
- **(NEW) GET `/public/[slug]`:** the dedicated public resolver from §1.

### 4. Seeding

Add three seed records to the shared store matching the generator's `SAMPLE_PROJECTS` default slugs so links work out of the box:
- `glass-pavilion-v1` (projectId `glass-pavilion`, engine `three`)
- `tokyo-skyloft-xr` (projectId `tokyo-skyloft`, engine `playcanvas`)
- `brutalist-garden-ar` (projectId `brutalist-garden`, engine `three`, `passwordProtected: false`)
Each with `environment`, `arPlacement`, `status: 'active'`, sensible `modelUrl`, `metadata.delivery`, and a `slug`.

### Usage in the generator

`app/xr-world/link-generator/page.tsx` already builds `/xr-world/view/{slug}` — **no URL change needed**; the route now exists and resolves. The generator's `handleInitializeLink` POST body already sends `slug`; the POST must persist that exact slug (not re-derive a different one) so the copied link matches the record.

## Data Flow

```
link-generator ──POST /api/xr-links {slug,...}──► record saved (shareUrl = origin/xr-world/view/{slug})
user copies/QRs  ${origin}/xr-world/view/{slug}
└──► GET /api/xr-links/public/{slug}  (public, sanitized)
     └──► active        → render XRViewer
          expired/revoked → terminal panel
          not-found/not-ready → not-ready panel
          passwordProtected → gate → viewer
```

## Error Handling

- Unknown slug → friendly "not found" panel (not raw 404).
- `expired`/`revoked` statuses → distinct terminal states.
- Supabase unavailable → in-memory seed still resolves links.
- Password check failure → inline error on the gate, no viewer reveal.

## Testing

- **Unit — public resolver** (`app/api/xr-links/public/[slug]/route.ts`):
  - known active slug → 200 with sanitized record (no `accessPassword`).
  - unknown slug → 404.
  - expired status → 200 with `expired: true`.
  - revoked status → 200 with `revoked: true`.
- **Unit — POST shareUrl:** posting a link yields `shareUrl` matching regex `^.+$/xr-world/view/[a-z0-9-]+$` and never contains `viztr.studio`.
- **Unit — slug seeding:** the three built-in slugs resolve to active records.
- Password gate: covered by component test for the gate (or deferred to manual if the check is client-side-only — see Notes).

## Notes / Open Follow-ups

- **Password check location:** Because a fully client-side check exposes `accessPassword` to anyone who inspects the payload, the robust design is a small **checked** endpoint (`POST /api/xr-links/public/{slug}/verify` with `{ password }`) that returns success/failure from the server without ever shipping `accessPassword` to the client. **This pass:** implement the server-side verify endpoint (keeps the pipeline real and secure). The public sanitized record therefore omits `accessPassword` entirely.
- **DB migration** for `xr_links` (id, name, slug, project_id, model_url, environment, ar_placement, password_protected, access_password, status, expires_at, metadata, timestamps) — **follow-up**, not this pass.
- **Analytics** (views/uniqueVisitors) are intentionally not exposed on the public path; wiring real view-tracking onto the viewer is a follow-up.
