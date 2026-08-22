# VizTR Platform — Technical Architecture & Implementation Handoff Guide

## 1. Project Overview
**VizTR** is an enterprise-grade architectural visualization studio platform, WebXR spatial digital twin viewer, and cloud-rendered Unreal Engine 5 Pixel Streaming engine. Built with Next.js 15 App Router, TypeScript, Tailwind CSS, Prisma ORM, Zustand, and WebXR APIs.

---

## 2. Architecture & Modules Built

### 🛰️ Prompt 05 — Backend, Database & Admin CMS Shell
- **Prisma Schema (`packages/database/schema.prisma`)**: 32+ relational models (User, Session, Account, VerificationToken, Client, Project, ProjectAsset, ProjectUpdate, Service, PortfolioItem, BlogPost, Category, Tag, Testimonial, FAQ, MediaAsset, Model3D, Panorama, XRLink, PixelStreamSession, FormSubmission, Booking, Lead, NavigationMenu, Theme, DesignSettings, SEOSettings, AnalyticsEvent, AuditLog, Notification, SiteSettings, PricingPlan).
- **Authentication & RBAC (`lib/auth.ts`, `lib/rbac.ts`)**: 4 tier roles (`SUPER_ADMIN`, `ADMIN`, `USER`, `CLIENT`) with granular capability checks.
- **Admin CMS Dashboard (`/admin/dashboard`)**: Full 260px collapsible sidebar with 6 sections (20 navigation routes), real-time cluster telemetry, stats cards, activity logs, and 3D Draco model manager.
- **Database Seeder (`packages/database/seed.ts`)**: Automated seed pipeline for projects, services, users, testimonials, and default site settings.

### 🏢 Prompt 06 — Client Portal, Tracking & Forms
- **Client Access Portal (`/client-access`)**: Two-tab authentication (Project ID & Password / Corporate Email & Password), Google Workspace SSO, and access token recovery.
- **Client Dashboard (`/client-dashboard`)**: Project cards with live progress bars, 7-stage production tracker (`ProjectTracker.tsx`), download archive with direct file master assets, and client revision feedback submission.
- **Public Read-Only Milestone View (`/client-view/[accessCode]`)**: Token-validated public link for client stakeholders.
- **All 6 Form Types & Unified API Route (`/api/forms/[type]`)**:
  1. `ContactForm.tsx` (`/contact`)
  2. `BookingForm.tsx` (`/book-consultation`)
  3. `DemoRequestForm.tsx` (`/xr-world/pixel-streaming`)
  4. `InquiryForm.tsx` (Portfolio detail modal)
  5. `NewsletterForm.tsx` (Footer engineering journal)
  6. `PortfolioEnquiryForm.tsx` (Floating portfolio catalog enquiry)

### 🪐 Prompt 07 — 4-Layer Hybrid XR Engine
- **Layer 1 (Scene Layer)**: `SceneLayer.tsx` (Equirectangular 360 photosphere & 3D canvas with smooth drag-to-look).
- **Layer 2 (Interaction Layer)**: `HotspotLayer.tsx` & `Hotspot.tsx` (Pulsing spatial coordinate markers).
- **Layer 3 (Info Layer)**: `AnnotationLayer.tsx` & `Annotation.tsx` (Frosted glass architectural specification cards).
- **Layer 4 (Navigation Layer)**: `TeleportLayer.tsx` & `TeleportPoint.tsx` (Room-to-room spatial navigation rings).
- **XR Mode Manager (`ModeManager.tsx`)**: Device capability detector for Tour, WebXR VR Headsets, and WebAR mobile surface projection.
- **Cinematic Entry & Progressive Reveal (`CinematicEntry.tsx`, `ProgressiveReveal.tsx`)**: Dynamic 300ms fade transitions and VR button reveal after room exploration.
- **External Data Bridge (`/xr/view?project=ID`)**: Autonomous spatial rendering with query parameters.

### ⚡ Prompt 08 — Pixel Streaming & SEO Optimization
- **Pixel Streaming Module (`PixelStreaming.tsx` & `/xr-world/pixel-streaming`)**: Real-time WebRTC stream allocation with latency metrics, FPS counter, and GPU node management API routes (`/api/pixel-streaming/*`).
- **WebXR VR Controls (`VRControls.tsx`)**: 90 FPS immersive stereo session with reticle raycasting and floating in-VR menu.
- **SEO & Schema Infrastructure (`SEOHead.tsx`, `sitemap.ts`, `robots.ts`)**: Structured JSON-LD metadata for LocalBusiness, Service, and Article schemas.
- **Analytics Event Engine (`lib/analytics.ts`)**: Unified dispatch helper for CTA interactions, 3D model launches, and form submissions.

---

## 3. How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Setup database schema & seed
npx prisma generate --schema=packages/database/schema.prisma
npx prisma db push --schema=packages/database/schema.prisma
npm run db:seed

# 3. Start development server
npm run dev
```

---

## 4. Test Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin@viztr.com` | `password123` |
| **Admin / Manager** | `manager@viztr.com` | `password123` |
| **Client** | `user@viztr.com` | `password123` |
| **Project Token** | Project ID: `VIZTR-882` | Pin: `882-APEX` |

---

## 5. Verification Summary
- **Lint Check**: Passed (0 errors).
- **Production Build**: Compiles cleanly with Next.js 15 App Router.
- **Responsive Viewports**: Tested across Mobile (375px), Tablet (768px), Desktop (1024px), and Ultra-Wide (1440px+).
