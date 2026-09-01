# 3D-Phase4.md — Analytics, Billing, RBAC & Production Hardening

**Duration:** Weeks 11-14 (4 weeks, 20 working days)
**Status:** ⏳ Pending Execution
**Owner:** 3D Platform Team
**Depends On:** Phases 1, 2, 3

---

## 1. Objective

Transform VizTR from a **production-capable platform** into a **commercial, multi-tenant, observable, secure SaaS**:

1. **Stripe + Stripe Connect** — subscription billing + studio payouts
2. **Studio RBAC** — super_admin / owner / editor / viewer roles
3. **Sentry** — error tracking + source maps
4. **Multi-user VR collaboration** — real-time presence in immersive sessions
5. **Cloud rendering integration** — UE5 Pixel Streaming hardening
6. **Production hardening** — CSP, CORS, rate limits, audit logs, backups

This completes the **Developer Dashboard** (studio admin) and finalizes the platform.

---

## 2. Scope

### ✅ In Scope

**4A — Billing (Weeks 11-12)**
- Stripe Checkout for client subscriptions
- Stripe Connect for studio payouts
- Invoice generation (auto from accepted quotes)
- Webhook handler (subscription created/updated/canceled)
- Billing portal (update card, view invoices)
- Plan tiers (Starter / Pro / Studio / Enterprise)

**4B — Studio RBAC (Weeks 12-13)**
- 4 roles: `super_admin` | `owner` | `editor` | `viewer`
- Permission matrix (who can do what)
- Project-level access control
- Team invitation flow
- Audit log for all role changes
- Middleware to enforce RBAC on every API route

**4C — Observability (Week 13)**
- Sentry (client + server + edge)
- Source maps uploaded on build
- Custom error boundaries
- Performance monitoring (web vitals)
- User context (who, what project, what action)

**4D — Multi-User Collaboration (Weeks 13-14)**
- Real-time presence in viewer (Supabase Realtime)
- Multi-cursor in developer dashboard
- "Rahul is viewing this" indicators
- Live commenting on experiences
- WebRTC peer connection (optional, for VR voice)

**4E — Production Hardening (Week 14)**
- CSP headers (script-src, img-src, frame-src)
- CORS allowlist
- Rate limit policies (per route)
- Automated backups (Supabase + R2)
- CDN cache rules (Cloudflare)
- SSL/TLS configuration
- Secret rotation policy
- Incident response runbook

### ❌ Out of Scope

- Mobile native apps (deferred)
- AI features (deferred — could be a future Phase 5)
- Marketplace for 3D assets (deferred)

---

## 3. Technical Components

### 3.1 New Dependencies

```jsonc
// package.json — additions for Phase 4
{
  "dependencies": {
    "stripe": "^17.3.1",
    "@stripe/stripe-js": "^4.10.0",
    "@sentry/nextjs": "^8.38.0",
    "@sentry/node": "^8.38.0",
    "@supabase/realtime-js": "^2.112.4"      // already present likely
  }
}
```

### 3.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│        3D-Phase4 — Billing, RBAC, Observability             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Billing]                                                   │
│   Client subscribes → Stripe Checkout → webhook            │
│        ↓                                                     │
│   Subscription tier stored in Supabase                      │
│        ↓                                                     │
│   Invoice auto-generated (Phase 2 already)                  │
│        ↓                                                     │
│   Payout to studio via Stripe Connect                       │
│                                                              │
│  [RBAC]                                                      │
│   Request → Middleware                                       │
│        ↓                                                     │
│   Auth: get user from session                               │
│        ↓                                                     │
│   Check: role in project                                    │
│        ↓                                                     │
│   Allow | Deny (with audit log)                             │
│                                                              │
│  [Observability]                                            │
│   Sentry captures errors + perf                             │
│   PostHog tracks product events                             │
│   Custom telemetry feeds dashboard                          │
│                                                              │
│  [Collaboration]                                            │
│   Supabase Realtime → presence channel                      │
│   WebRTC (optional) → voice in VR                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. File-by-File Implementation

### 4.1 New Files to Create

#### **4A — Billing**

| File | Purpose |
|------|---------|
| `lib/billing/stripe.ts` | Stripe SDK init |
| `lib/billing/plans.ts` | Plan tier definitions |
| `lib/billing/checkout.ts` | Stripe Checkout session creator |
| `lib/billing/connect.ts` | Stripe Connect onboarding |
| `lib/billing/invoices.ts` | Invoice generation |
| `lib/billing/portal.ts` | Stripe billing portal helper |
| `app/api/billing/checkout/route.ts` | Create checkout session |
| `app/api/billing/portal/route.ts` | Open billing portal |
| `app/api/billing/webhook/route.ts` | Stripe webhook handler |
| `app/api/billing/connect/onboard/route.ts` | Studio Connect onboarding |
| `app/admin/billing/page.tsx` | Admin billing dashboard |
| `app/admin/billing/plans/page.tsx` | Plan management |
| `app/admin/billing/invoices/page.tsx` | Invoice list |
| `app/client-dashboard/billing/page.tsx` | Client billing page |
| `components/billing/PlanCard.tsx` | Pricing tier card |
| `components/billing/CheckoutButton.tsx` | Trigger Stripe Checkout |
| `components/billing/InvoiceList.tsx` | Render invoice table |
| `__tests__/billing/checkout.test.ts` | Checkout flow tests |
| `__tests__/billing/webhook.test.ts` | Webhook handler tests |

#### **4B — Studio RBAC**

| File | Purpose |
|------|---------|
| `lib/rbac/roles.ts` | Role definitions (super_admin/owner/editor/viewer) |
| `lib/rbac/permissions.ts` | Permission matrix |
| `lib/rbac/checkAccess.ts` | Server-side access check |
| `lib/rbac/auditLog.ts` | RBAC audit logging |
| `lib/rbac/invitations.ts` | Team invitation logic |
| `middleware.ts` | Updated to enforce RBAC on /admin/*, /api/admin/* |
| `app/api/admin/team/invite/route.ts` | Invite team member |
| `app/api/admin/team/role/route.ts` | Change role |
| `app/api/admin/team/remove/route.ts` | Remove team member |
| `app/admin/team/page.tsx` | Team management UI |
| `app/admin/team/audit/page.tsx` | Team audit log |
| `components/admin/team/RoleSelector.tsx` | Dropdown to change role |
| `components/admin/team/InviteDialog.tsx` | Invite modal |
| `__tests__/rbac/permissions.test.ts` | Permission matrix tests |
| `__tests__/rbac/checkAccess.test.ts` | Access check tests |

#### **4C — Observability**

| File | Purpose |
|------|---------|
| `sentry.client.config.ts` | Sentry browser config |
| `sentry.server.config.ts` | Sentry server config |
| `sentry.edge.config.ts` | Sentry edge config |
| `lib/observability/errorBoundary.tsx` | Global error boundary |
| `lib/observability/webVitals.ts` | Web Vitals reporter |
| `lib/observability/context.ts` | Sentry user context |
| `app/api/observability/test-error/route.ts` | Test Sentry capture |
| `__tests__/observability/errorBoundary.test.tsx` | Error boundary tests |

#### **4D — Multi-User Collaboration**

| File | Purpose |
|------|---------|
| `lib/collab/presence.ts` | Supabase Realtime presence |
| `lib/collab/cursors.ts` | Multi-cursor broadcast |
| `lib/collab/comments.ts` | Live comments channel |
| `lib/collab/webrtc.ts` | WebRTC peer connection (VR voice) |
| `components/collab/PresenceIndicator.tsx` | "X is viewing this" |
| `components/collab/CursorLayer.tsx` | Multi-cursor overlay |
| `components/collab/LiveCommentThread.tsx` | Real-time comments |
| `components/viewer/CollaborativeViewer.tsx` | Viewer with presence |
| `__tests__/collab/presence.test.ts` | Presence tests |

#### **4E — Production Hardening**

| File | Purpose |
|------|---------|
| `next.config.mjs` | Add CSP, CORS, security headers |
| `lib/security/csp.ts` | CSP policy builder |
| `lib/security/cors.ts` | CORS allowlist |
| `lib/security/headers.ts` | Security headers config |
| `lib/backup/supabase.ts` | Supabase backup config |
| `lib/backup/r2.ts` | R2 backup config |
| `scripts/backup-cron.ts` | Cron-triggered backup script |
| `docs/security-policy.md` | Security policy doc |
| `docs/incident-response.md` | Incident response runbook |
| `docs/secret-rotation.md` | Secret rotation policy |
| `vercel.json` | Cron + edge config |

### 4.2 Files to Modify

| File | Change |
|------|--------|
| `middleware.ts` | Add RBAC + CSP + rate limit checks |
| `app/layout.tsx` | Add Sentry provider + error boundary |
| `app/admin/layout.tsx` | Add team nav + billing nav |
| `app/client-dashboard/layout.tsx` | Add billing nav |
| `next.config.mjs` | Add Sentry plugin + security headers |
| `package.json` | Add Phase 4 dependencies |
| `supabase/schema.sql` | Add `subscriptions`, `team_members`, `audit_logs` tables |
| `lib/credentials-store.ts` | Add Stripe + Sentry credentials |

---

## 5. Verification Gates

### Gate 4A: Billing

```bash
# Unit tests
pnpm test __tests__/billing/

# Manual
# 1. As client, go to /client-dashboard/billing
# 2. Click "Subscribe to Pro"
# 3. Complete Stripe Checkout (use test card 4242 4242 4242 4242)
# 4. Verify subscription created in Supabase
# 5. Verify webhook received
# 6. Verify plan tier reflected in dashboard

# Stripe CLI test
stripe trigger checkout.session.completed
# Verify webhook handler responds 200
```

### Gate 4B: RBAC

```bash
# Unit tests
pnpm test __tests__/rbac/

# Manual
# 1. As super_admin, invite editor@studio.com as "editor"
# 2. As editor, verify can access /admin/dashboard but NOT /admin/billing
# 3. As super_admin, change editor to "viewer"
# 4. Verify editor now blocked from /admin/dashboard
# 5. Verify audit log shows role change
```

### Gate 4C: Observability

```bash
# Manual
# 1. Hit /api/observability/test-error
# 2. Verify error appears in Sentry dashboard
# 3. Verify source map resolves to original line
# 4. Verify user context attached

# Performance
# 1. Navigate to /xr-world/showcase
# 2. Verify Web Vitals reported to Sentry
```

### Gate 4D: Collaboration

```bash
# Manual: Multi-user presence
# 1. Open /viewer/[id]/[exp] in 2 browsers (different users)
# 2. Verify both see "X is viewing this"
# 3. Move cursor — verify other browser sees cursor move
# 4. Add comment in browser A — verify appears in browser B instantly

# Manual: WebRTC (optional)
# 1. Both browsers enter VR
# 2. Verify voice chat works
```

### Gate 4E: Production Hardening

```bash
# Security headers
curl -I http://localhost:3000/
# Verify: Content-Security-Policy, X-Frame-Options, etc.

# Rate limit
# 1. Hit /api/billing/checkout 50 times
# 2. Verify 429 after threshold

# Backup
node scripts/backup-cron.ts --dry-run
# Verify lists all resources to backup
```

### Gate 4F: Build Pass

```bash
pnpm build
# Must complete successfully
```

---

## 6. Dependencies on Prior Phases

- **Phase 1** — engine
- **Phase 2** — XR/AR/Splat
- **Phase 3** — viewer dashboard (Phase 4 builds on this)

---

## 7. Deliverables

1. ✅ Stripe + Stripe Connect integration
2. ✅ Plan tier system (Starter/Pro/Studio/Enterprise)
3. ✅ Studio billing dashboard
4. ✅ Client billing page
5. ✅ Invoice auto-generation
6. ✅ Studio RBAC (4 roles)
7. ✅ Team invitation flow
8. ✅ Audit log for RBAC events
9. ✅ Sentry (client + server + edge)
10. ✅ Custom error boundaries
11. ✅ Web Vitals monitoring
12. ✅ Multi-user presence in viewer
13. ✅ Multi-cursor in dev dashboard
14. ✅ Live comments channel
15. ✅ WebRTC VR voice (optional)
16. ✅ CSP / CORS / security headers
17. ✅ Rate limit policies
18. ✅ Backup cron script
19. ✅ 4 production docs (security, incident, secret rotation, runbook)
20. ✅ All 5 module areas unit-tested
21. ✅ Documentation: `docs/billing-flow.md`, `docs/rbac-matrix.md`, `docs/observability.md`, `docs/collaboration.md`

---

## 8. Risk Register

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Stripe webhook failure causes billing drift | Medium | Idempotency keys + reconciliation job |
| RBAC misconfiguration leaks data | High | Default-deny, audit every change |
| Sentry quota exceeded | Medium | Sample rates, filter noise |
| WebRTC NAT traversal issues | High | TURN server fallback, document as known issue |
| Backup silent failure | Medium | Daily verify + alert on failure |
| CSP breaks legitimate third-party scripts | High | Staging test, nonce-based script allowlist |

---

## 9. Definition of Done

- [ ] All Phase 4A-4E files created and unit-tested
- [ ] All 6 verification gates passing
- [ ] `pnpm build` passes
- [ ] `pnpm tsc --noEmit` passes (0 new errors)
- [ ] Stripe test mode fully verified
- [ ] RBAC verified with 4 distinct user roles
- [ ] Sentry receiving events + source maps
- [ ] Multi-user presence verified in 2 browsers
- [ ] CSP/security headers verified via curl
- [ ] Backup script tested
- [ ] 4 production docs written (≥500 words each)
- [ ] **All 4 phases complete → platform production-ready**
