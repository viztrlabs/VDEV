# 3D-Phase3.md — Publishing, Distribution & Public Viewer Dashboard

**Duration:** Weeks 7-10 (4 weeks, 20 working days)
**Status:** ⏳ Pending Execution
**Owner:** 3D Platform Team
**Depends On:** Phase 1 (engine), Phase 2 (XR/AR/splat)

---

## 1. Objective

Ship the **Viewer Dashboard** — the public, client-facing side of VizTR where end-users consume experiences — and the **distribution pipeline** that powers it:

1. **Public viewer routes** — `/viewer/[projectId]`, `/embed/[experienceId]`, `/ar/[id]`
2. **Web component** — `<viztr-viewer>` for drop-in embedding
3. **QR + short URL** generator
4. **Permissions** — public, code-gated, email-gated, expiring
5. **Viewer-side analytics** — PostHog integration
6. **Open Graph + meta tags** for social sharing

This is the **Viewer Dashboard** the original question asked about.

---

## 2. Scope

### ✅ In Scope

**3A — Public Viewer Routes (Weeks 7-8)**
- `/viewer/[projectId]` — public access page (Project ID + Access Code entry)
- `/viewer/[projectId]/[experienceId]` — direct experience view
- `/embed/[experienceId]` — iframe-optimized embed (no chrome)
- `<viztr-viewer>` — Web Component (custom element)
- Auth gate (rate-limited, audit-logged)
- Entry page (Project ID + Access Code form, styled)

**3B — Sharing Pipeline (Weeks 9)**
- QR code generator (PNG + SVG)
- Short URL service (Dub.co or self-hosted)
- Open Graph meta tags (per project)
- Email share (Resend integration)
- WhatsApp share (Twilio integration)

**3C — Permissions + Analytics (Week 10)**
- Permission levels (public | access-code | email-allowlist | password | expiring)
- PostHog events (view_start, view_end, fps_sample, dropout, share, etc.)
- Viewer-side telemetry (FPS, dropped frames, asset load time)
- Server-side rate limiting (Upstash Redis)
- Audit log integration (every view = activity_event)

### ❌ Out of Scope

- Stripe billing (Phase 4)
- Studio team RBAC (Phase 4)
- Multi-user VR collaboration (Phase 4)
- Cloud rendering integration (already exists, will be re-tested in Phase 4)

---

## 3. Technical Components

### 3.1 New Dependencies

```jsonc
// package.json — additions for Phase 3
{
  "dependencies": {
    "qrcode": "^1.5.4",
    "@types/qrcode": "^1.5.5",
    "dub": "^0.0.10",                        // OR self-hosted short URL
    "posthog-js": "^1.187.0",
    "posthog-node": "^4.4.0",
    "@upstash/ratelimit": "^2.0.4",
    "@upstash/redis": "^1.34.3",
    "resend": "^4.0.0",
    "twilio": "^5.3.5"
  }
}
```

### 3.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│           3D-Phase3 — Viewer Dashboard + Sharing           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Studio Side]                                              │
│   Studio creates project → assigns experience → publishes  │
│        ↓                                                     │
│   Generates: projectId + accessCode + experienceId         │
│        ↓                                                     │
│   Issues: public URL + QR + short URL + embed snippet       │
│                                                              │
│  [Public Side]                                              │
│   Client receives link (email, QR, embed)                   │
│        ↓                                                     │
│   /viewer/[projectId] (gated entry)                         │
│        ↓                                                     │
│   Auth (Project ID + Access Code) OR auto-pass             │
│        ↓                                                     │
│   /viewer/[projectId]/[experienceId]                        │
│        ↓                                                     │
│   Engine selection: PC | Three.js | Splat | Marzipano       │
│        ↓                                                     │
│   Render experience + PostHog events                        │
│        ↓                                                     │
│   Audit log: view_event (who, when, device, duration)      │
│                                                              │
│  [Embed Side]                                                │
│   <iframe src="/embed/[experienceId]">                      │
│        OR                                                   │
│   <viztr-viewer experience-id="..." project-id="...">       │
│        ↓                                                     │
│   Loads experience with minimal chrome                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. File-by-File Implementation

### 4.1 New Files to Create

#### **3A — Public Viewer Routes**

| File | Purpose |
|------|---------|
| `app/viewer/[projectId]/page.tsx` | Entry page (Project ID + Access Code) |
| `app/viewer/[projectId]/[experienceId]/page.tsx` | Experience view |
| `app/viewer/[projectId]/layout.tsx` | Viewer-specific layout (no admin chrome) |
| `app/embed/[experienceId]/page.tsx` | iframe-optimized embed page |
| `app/embed/[experienceId]/layout.tsx` | Minimal embed layout |
| `app/api/viewer/auth/route.ts` | Auth gate (Project ID + Access Code verify) |
| `app/api/viewer/grant/route.ts` | Issue viewer session token |
| `app/api/viewer/track/route.ts` | Viewer telemetry endpoint |
| `components/viewer/ViewerEntryForm.tsx` | Project ID + Access Code form |
| `components/viewer/ViewerExperience.tsx` | Renders experience with engine selector |
| `components/viewer/ViewerHeader.tsx` | Minimal header (project name, share) |
| `components/viewer/ViewerFooter.tsx` | Powered-by VizTR footer |
| `lib/viewer/session.ts` | Viewer session token utilities |
| `lib/viewer/permissions.ts` | Permission level checks |
| `lib/viewer/audit.ts` | Audit event logging for views |
| `components/web-components/ViztrViewer.tsx` | <viztr-viewer> web component |
| `public/viztr-viewer.js` | Bundled web component (UMD) |
| `__tests__/viewer/permissions.test.ts` | Permission logic tests |
| `__tests__/viewer/audit.test.ts` | Audit logging tests |

#### **3B — Sharing Pipeline**

| File | Purpose |
|------|---------|
| `lib/sharing/qrCode.ts` | QR code generator (PNG/SVG) |
| `lib/sharing/shortUrl.ts` | Short URL service (Dub or self-hosted) |
| `lib/sharing/openGraph.ts` | OG meta tag generator |
| `lib/sharing/emailShare.ts` | Resend email share |
| `lib/sharing/whatsappShare.ts` | Twilio WhatsApp share |
| `components/admin/sharing/ShareDialog.tsx` | Admin share modal |
| `components/admin/sharing/QRCodeDisplay.tsx` | QR code preview |
| `components/admin/sharing/EmbedCode.tsx` | Copy-embed snippet UI |
| `app/api/sharing/short-url/route.ts` | Short URL creation |
| `app/api/sharing/qr/route.ts` | QR code image generation |
| `app/api/sharing/email/route.ts` | Send share email |
| `app/api/sharing/whatsapp/route.ts` | Send WhatsApp share |
| `__tests__/sharing/shortUrl.test.ts` | Short URL tests |
| `__tests__/sharing/qrCode.test.ts` | QR code tests |

#### **3C — Permissions + Analytics**

| File | Purpose |
|------|---------|
| `lib/analytics/posthog.ts` | PostHog client + server SDKs |
| `lib/analytics/events.ts` | Event constants (view_start, etc.) |
| `lib/analytics/telemetry.ts` | FPS/dropout sampler |
| `lib/ratelimit/upstash.ts` | Upstash Redis rate limiter |
| `app/api/analytics/track/route.ts` | PostHog event ingest |
| `app/api/ratelimit/check/route.ts` | Rate limit check endpoint |
| `components/viewer/TelemetryBeacon.tsx` | Client-side telemetry reporter |
| `__tests__/analytics/posthog.test.ts` | PostHog event tests |
| `__tests__/ratelimit/upstash.test.ts` | Rate limit tests |

### 4.2 Files to Modify

| File | Change |
|------|--------|
| `app/layout.tsx` | Add PostHog provider (only on /viewer/* routes) |
| `components/viewers/PanoramaViewer.tsx` | Add telemetry sampling |
| `components/viewers/ModelViewer.tsx` | Add telemetry sampling |
| `components/xr/PlayCanvasXRViewer.tsx` | Add telemetry sampling |
| `app/admin/dashboard/page.tsx` | Add "Share Experience" button to projects |
| `app/client-dashboard/page.tsx` | Add per-experience "Share" actions |
| `supabase/schema.sql` | Add `viewer_sessions`, `view_events`, `short_urls` tables |
| `package.json` | Add Phase 3 dependencies |

---

## 5. Verification Gates

### Gate 3A: Public Viewer Routes

```bash
# TypeScript
pnpm tsc --noEmit

# Manual: Viewer Entry
# 1. Navigate to http://localhost:3000/viewer/test-project
# 2. Verify entry form shows
# 3. Enter valid Project ID + Access Code
# 4. Verify redirect to /viewer/[projectId]/[experienceId]
# 5. Verify experience renders

# Manual: Embed
# 1. Navigate to http://localhost:3000/embed/[experienceId]
# 2. Verify minimal chrome (no admin nav)
# 3. Verify experience renders correctly
# 4. Verify iframe-compatible (no overflow, no popups)

# Manual: Web Component
# 1. Create test.html with <viztr-viewer experience-id="...">
# 2. Open in browser
# 3. Verify viewer loads
```

### Gate 3B: Sharing Pipeline

```bash
# Unit tests
pnpm test __tests__/sharing/

# Manual
# 1. As admin, open project, click "Share"
# 2. Verify QR code displays
# 3. Verify short URL generated
# 4. Verify embed snippet copyable
# 5. Verify email share sends (if Resend configured)
```

### Gate 3C: Permissions + Analytics

```bash
# Unit tests
pnpm test __tests__/viewer/permissions.test.ts
pnpm test __tests__/analytics/posthog.test.ts
pnpm test __tests__/ratelimit/upstash.test.ts

# Manual: Rate limit
# 1. Open incognito
# 2. Hit /viewer/test-project 20 times in 1 minute
# 3. Verify 429 response after threshold
# 4. Verify wait period enforced

# Manual: Analytics
# 1. Open browser dev tools
# 2. Navigate to /viewer/[id]/[exp]
# 3. Verify PostHog events fire (view_start, etc.)
# 4. Verify FPS samples sent periodically
```

### Gate 3D: Build Pass

```bash
pnpm build
# Must complete successfully
```

---

## 6. Dependencies on Prior Phases

- **Phase 1** — engine abstraction required for engine selection in viewer
- **Phase 2** — XR/AR/Splat modes rely on Phase 2 modules
- **Phase 1 Client Dashboard** — share button integrates with existing UI

---

## 7. Deliverables

1. ✅ `/viewer/[projectId]` public entry page
2. ✅ `/viewer/[projectId]/[experienceId]` experience view
3. ✅ `/embed/[experienceId]` iframe embed page
4. ✅ `<viztr-viewer>` web component (UMD bundle)
5. ✅ QR code generator (PNG + SVG)
6. ✅ Short URL service
7. ✅ Open Graph meta tag generator
8. ✅ Resend email share
9. ✅ Twilio WhatsApp share
10. ✅ Upstash Redis rate limiter
11. ✅ PostHog analytics (client + server)
12. ✅ 5-state permission system (public | code | email | password | expiring)
13. ✅ Audit log integration (every view recorded)
14. ✅ All 3 module areas unit-tested
15. ✅ Documentation: `docs/viewer-dashboard.md`, `docs/sharing-pipeline.md`, `docs/analytics-events.md`

---

## 8. Risk Register

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| PostHog SDK bloats client bundle | Medium | Lazy-load PostHog only on /viewer routes |
| Web Component SSR issues | Medium | Use dynamic import, no SSR for web component |
| Rate limiter cold start (Redis) | Low | In-memory fallback for dev |
| QR codes get too complex | Low | Auto-truncate long URLs |
| iframe CSP blocks asset CDN | High | Set proper `Content-Security-Policy` headers |

---

## 9. Definition of Done

- [ ] All Phase 3A/3B/3C files created and unit-tested
- [ ] All 4 verification gates passing
- [ ] `pnpm build` passes
- [ ] `pnpm tsc --noEmit` passes (0 new errors)
- [ ] Manual verification on desktop, mobile, embed
- [ ] PostHog events verified in dashboard
- [ ] Rate limiting verified under load
- [ ] 3 docs files written (≥500 words each)
