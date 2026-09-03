# VizTR — Architecture Visualization Studio & XR World Platform

**Enterprise-grade 3D/XR visualization platform for architecture, engineering, and construction (AEC).**

---

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- Supabase project (PostgreSQL + Auth + Storage)
- Google Cloud OAuth credentials (optional, for SSO)

### Installation

```bash
# Clone and install
git clone <repository-url>
cd vdev
pnpm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
pnpm run dev

# Open http://localhost:3000
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret (32+ chars) | Yes |
| `NEXTAUTH_URL` | Production URL | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | For SSO |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | For SSO |
| `CLOUDFLARE_R2_*` | R2 storage credentials | For assets |
| `DATABASE_URL` | PostgreSQL connection string | Alternative to Supabase |
| `REDIS_URL` | Redis for caching/sessions | Optional |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        VizTR Platform                           │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (Next.js 15 + React 19 + TypeScript)                 │
│  ├── /app/*                    App Router pages                │
│  ├── /components/*             UI components (admin, XR, etc)  │
│  ├── /components/admin/*       Admin dashboard components      │
│  ├── /components/xr/*          WebXR/Three.js components       │
│  └── /lib/*                    Utilities, stores, auth         │
├─────────────────────────────────────────────────────────────────┤
│  API Layer (Next.js Route Handlers)                            │
│  ├── /api/ai/*                 AI/ML platform (Phase 3)        │
│  ├── /api/analytics/*          Performance analytics           │
│  ├── /api/enterprise/*         RBAC, SSO, audit, compliance    │
│  ├── /api/tours/*              Virtual tour CRUD               │
│  └── /api/enterprise/*         Enterprise features             │
├─────────────────────────────────────────────────────────────────┤
│  Services (TypeScript modules)                                 │
│  ├── /src/services/ai/*        Predictive, NLP, automation     │
│  ├── /src/services/enterprise/* RBAC, SSO, audit, backup       │
│  ├── /src/services/performance/* Monitoring, caching, CDN      │
│  └── /src/services/analytics/*   Dashboard, metrics            │
├─────────────────────────────────────────────────────────────────┤
│  Infrastructure                                                │
│  ├── Supabase (Auth + Postgres + Storage + Realtime)           │
│  ├── Cloudflare R2 (Asset storage)                             │
│  ├── Vercel (Edge deployment)                                  │
│  └── PlayCanvas (WebXR runtime)                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Feature Map

### Phase 1–2: Foundation & Collaboration (Complete)
- ✅ Authentication (Supabase Auth + NextAuth)
- ✅ Project management & CRUD
- ✅ Real-time collaboration (WebSocket)
- ✅ Virtual tour editor (360°/WebXR)
- ✅ Gaussian splat rendering
- ✅ PlayCanvas WebXR engine

### Phase 2C: Performance & Optimization (Complete)
- ✅ Performance monitoring (Web Vitals, custom metrics)
- ✅ Advanced caching (LRU, SWR, asset preloading)
- ✅ Resource management (priority queues, budgets)
- ✅ Analytics dashboard
- ✅ Load balancing optimization
- ✅ Cloudflare CDN integration

### Phase 2D: Enterprise Features (Complete)
- ✅ RBAC (roles, permissions, resource scoping)
- ✅ SSO (Google OAuth, SAML-ready)
- ✅ Audit logging (immutable, queryable)
- ✅ Compliance reporting (SOC2, GDPR, HIPAA)
- ✅ Disaster recovery & backup
- ✅ Enterprise monitoring & alerts

### Phase 3: AI/ML Platform (Complete)
- ✅ Predictive analytics (churn, risk, engagement)
- ✅ NLP engine (intent, entities, sentiment)
- ✅ Automation rules (triggers, actions, conditions)
- ✅ ML pipeline (register, train, evaluate, deploy)
- ✅ AI governance (policies, bias audit, compliance)
- ✅ AI-powered collaboration (agents, sessions, suggestions)

---

## Admin Dashboard

Access at `/admin/dashboard` (requires SUPER_ADMIN role).

**Sections:**
- **Projects** — Client projects, tour builder, AR/VR, streaming
- **Cloud Infrastructure** — Google Drive, AI credentials, PlayCanvas, Platform Settings, **AI Platform**
- **Meetings & Bookings** — Google Meet fleet, bookings, support
- **Enterprise** — Super Admin panel, Client Discovery, DocStudio CRM
- **AI Platform** — Predictive, NLP, Automation, ML Pipeline, Governance, Collaboration

---

## Deployment

### Vercel (Recommended)

```bash
# Link project (already configured)
vercel link

# Deploy preview
vercel

# Deploy production
vercel --prod
```

**Build Settings:**
- Framework: Next.js
- Build Command: `pnpm run build`
- Output Directory: `.next`
- Install Command: `pnpm install`

**Environment Variables:** Add all from `.env.example` to Vercel project settings.

### Docker

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/public ./public
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
docker build -t viztr .
docker run -p 3000:3000 --env-file .env.local viztr
```

---

## Quality Gates

```bash
# Lint
pnpm run lint

# Type check (skipped in build for speed)
pnpm run typecheck  # if configured

# Build
pnpm run build

# Test (if test suite exists)
pnpm run test
```

**Current Status:** `pnpm run build` ✅ PASS | `pnpm run lint` ✅ 0 new/real errors

---

## Development Commands

```bash
pnpm run dev          # Start dev server
pnpm run build        # Production build
pnpm run start        # Start production server
pnpm run lint         # ESLint
pnpm run test         # Vitest/Jest (if configured)
```

---

## License

Proprietary — VizTR Platform. All rights reserved.

---

**Last Updated:** September 2026 | **Version:** 0.1.0 (Phase 4 — Production Launch)