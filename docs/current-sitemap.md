# Current Sitemap - VizTR Studio

## Audit Date: 2026-09-07
## Status: Baseline established

---

## Public Routes (Existing)

### Core
- `/` - Homepage
- `/about` - About Studio
- `/contact` - Contact Page
- `/portfolio` - Portfolio Showcase
- `/portfolio/[id]` - Portfolio Project Detail
- `/blog` - Journal & Insights
- `/blog/[slug]` - Blog Post

### Studio
- `/studio` - Studio Overview
- `/studio/exterior` - Exterior Visualization
- `/studio/interior` - Interior Visualization
- `/studio/walkthrough` - Walkthrough Animation

### XR World
- `/xr-world` - XR World Hub
- `/xr-world/vizsplat` - VizSplat (Gaussian Splatting)
- `/xr-world/vizsplat/editor` - SuperSplat Editor
- `/xr-world/pixel-streaming` - Pixel Streaming (Flagship)
- `/xr-world/webxr` - WebXR
- `/xr-world/webar` - WebAR
- `/xr-world/virtual-reality` - Virtual Reality
- `/xr-world/virtual-tour` - Virtual Tour Overview
- `/xr-world/virtual-tour/[tourId]` - Virtual Tour Detail
- `/xr-world/virtual-tour/[tourId]/editor` - Tour Editor
- `/xr-world/virtual-tour/dashboard` - Tour Dashboard
- `/xr-world/virtual-tour/editor` - Tour Editor
- `/xr-world/virtual-tour/editor-dashboard` - Editor Dashboard
- `/xr-world/virtual-tour/hosting` - Hosting
- `/xr-world/virtual-tour/showcase` - Showcase
- `/xr-world/showcase` - Showcase
- `/xr-world/unified-editor` - Unified Editor
- `/xr-world/splat-showcase` - Splat Showcase
- `/xr-world/super-splat` - SuperSplat Editor
- `/xr-world/xr-editor` - XR Editor

### Creator (Existing)
- `/creator/3d-editor` - 3D Editor
- `/creator/assets` - Assets Manager
- `/creator/publish` - Publish Flow
- `/creator/supersplat` - SuperSplat Integration

### Client Areas (Existing)
- `/client-access` - Client Portal Access
- `/client-dashboard` - Client Dashboard
- `/client-view/[accessCode]` - Public Client View
- `/track-project` - Track Project by ID

### Legal
- `/privacy` - Privacy Policy
- `/privacy-policy` - Privacy Policy (alt)
- `/terms` - Terms of Service
- `/terms-conditions` - Terms (alt)

### Other
- `/book-consultation` - Book Consultation
- `/discovery` - Discovery
- `/login` - Login
- `/signup` - Sign Up
- `/under-admin/...` - Under Construction Admin Pages
- `/xr/view` - XR View
- `/editor/[projectId]` - Project Editor
- `/editor-projects` - Editor Projects

---

## New Routes (Phase 6 - Role-Based Dashboards)

### Super Admin Dashboard (`/admin/dashboard`)
- `/admin/dashboard` - Platform Overview & Telemetry
- `/admin/dashboard?section=super-admin-panel` - Master Super Admin Panel
- `/admin/dashboard?section=super-admin-users` - Manage Admins & Users
- `/admin/dashboard?section=super-admin-analytics` - System Analytics
- `/admin/dashboard?section=super-admin-revenue` - Revenue & MRR Tracking
- `/admin/dashboard?section=super-admin-gpu` - GPU Usage Monitoring
- `/admin/dashboard?section=super-admin-toggles` - Feature Toggles Switchboard
- `/admin/dashboard?section=super-admin-health` - Global Health & Error Logs
- `/admin/dashboard?section=client-discovery` - Client Discovery Form
- `/admin/dashboard?section=project-management` - Project Management
- `/admin/dashboard?section=xr-links` - XR Link Generator
- `/admin/dashboard?section=pixel-streaming-control` - Pixel Streaming Control
- `/admin/dashboard?section=file-storage` - Multi-Cloud File Storage
- `/admin/dashboard?section=asset-pipeline` - Asset Pipeline
- `/admin/dashboard?section=cms-manager` - Master CMS Engine
- `/admin/dashboard?section=pages` - Pages & Templates
- `/admin/dashboard?section=blog` - Blog Posts
- `/admin/dashboard?section=cms-services` - Services CMS
- `/admin/dashboard?section=media` - Media & Placeholders
- `/admin/dashboard?section=design-themes` - Theme & Layout
- `/admin/dashboard?section=doc-studio-crm` - Doc Studio & CRM
- `/admin/dashboard?section=vr-configurator` - VR Tour Builder
- `/admin/dashboard?section=ar` - AR QuickLook Assets
- `/admin/dashboard?section=streaming` - GPU Pixel Streaming
- `/admin/dashboard?section=splat-engine` - Gaussian Splat Engine
- `/admin/dashboard?section=virtual-tour-config` - 360° Virtual Tour
- `/admin/dashboard?section=google-meet` - Google Meet Fleet
- `/admin/dashboard?section=bookings` - All Bookings
- `/admin/dashboard?section=support` - Support Tickets
- `/admin/dashboard?section=google-drive` - Google Drive Fleet
- `/admin/dashboard?section=ai-credentials` - AI & API Credentials
- `/admin/dashboard?section=playcanvas-engine` - PlayCanvas XR Engine
- `/admin/dashboard?section=settings` - Platform Settings
- `/admin/dashboard?section=ai-platform` - AI Platform
- `/admin/dashboard?section=super-admin-crud` - Master CRUD
- `/admin/dashboard?section=models` - 3D Model Manager
- `/admin/dashboard?section=seo` - SEO Settings
- `/admin/dashboard?section=testimonials` - Testimonials
- `/admin/dashboard?section=navigation` - Navigation Menus
- `/admin/dashboard?section=social` - Social Links

### Admin Dashboard (`/app/admin`)
- `/app/admin` - Dashboard
- `/app/admin/projects`
- `/app/admin/leads`
- `/app/admin/clients`
- `/app/admin/team`
- `/app/admin/quotes`
- `/app/admin/invoices`
- `/app/admin/payments`
- `/app/admin/files`
- `/app/admin/approvals`
- `/app/admin/meetings`
- `/app/admin/support`
- `/app/admin/analytics`
- `/app/admin/settings`

### User Dashboard (`/app/user`)
- `/app/user` - Dashboard
- `/app/user/projects`
- `/app/user/projects/new`
- `/app/user/files`
- `/app/user/assets`
- `/app/user/renders`
- `/app/user/xr-experiences`
- `/app/user/vizsplat`
- `/app/user/editor`
- `/app/user/shared`
- `/app/user/team`
- `/app/user/usage`
- `/app/user/billing`
- `/app/user/settings`

### Client Dashboard (`/app/client`)
- `/app/client` - Dashboard
- `/app/client/projects`
- `/app/client/projects/[id]`
- `/app/client/projects/[id]/timeline`
- `/app/client/projects/[id]/milestones`
- `/app/client/projects/[id]/files`
- `/app/client/projects/[id]/renders`
- `/app/client/projects/[id]/3d`
- `/app/client/projects/[id]/webxr`
- `/app/client/projects/[id]/webar`
- `/app/client/projects/[id]/virtual-tour`
- `/app/client/projects/[id]/vizsplat`
- `/app/client/projects/[id]/approvals`
- `/app/client/projects/[id]/feedback`
- `/app/client/projects/[id]/downloads`
- `/app/client/meetings`
- `/app/client/messages`
- `/app/client/invoices`
- `/app/client/payments`
- `/app/client/support`
- `/app/client/profile`

### SaaS Auth (`/app`)
- `/app/login` - Login
- `/app/register` - Register
- `/app/forgot-password` - Forgot Password
- `/app/invite` - Invite (Email)
- `/app/dashboard` - Role-Aware Dashboard

---

## New Routes (Phase 2 - Public Sitemap)

- `/creator` - Creator Hub
- `/solutions` - Solutions Hub
- `/solutions/architects`
- `/solutions/real-estate`
- `/solutions/developers`
- `/solutions/interior-designers`
- `/solutions/agencies`
- `/pricing` - Pricing Page

---

## New Routes (Phase 4 - VizSplat Identity)

- `/vizsplat` - VizSplat Product Page (new alias)
- `/xr-world/vizsplat` - (existing, preserved)

---

## New Routes (Phase 7 - Creator)

- `/creator` - Creator Hub (done)
- `/creator/[projectId]` - Project Workspace
- `/creator/[projectId]/assets` - Assets Manager
- `/creator/[projectId]/assets/upload` - Upload
- `/creator/[projectId]/editor/3d` - 3D Editor
- `/creator/[projectId]/editor/materials`
- `/creator/[projectId]/editor/lighting`
- `/creator/[projectId]/editor/camera`
- `/creator/[projectId]/editor/environment`
- `/creator/[projectId]/editor/hotspots`
- `/creator/[projectId]/editor/annotations`
- `/creator/[projectId]/editor/configurator`
- `/creator/[projectId]/xr-settings`
- `/creator/[projectId]/xr/webxr`
- `/creator/[projectId]/xr/webar`
- `/creator/[projectId]/xr/vr`
- `/creator/[projectId]/xr/virtual-tour`
- `/creator/[projectId]/vizsplat`
- `/creator/[projectId]/publish`

---

## Existing Components & Libraries

### Core Components
- `components/layout/Header.tsx` - Main site header
- `components/layout/LayoutShell.tsx` - Site layout wrapper
- `components/ui/Logo.tsx` - Brand logo components
- `components/ui/NotificationCenter.tsx` - Notification system
- `components/ui/ThemeSwitcherDropdown.tsx` - Theme switcher
- `components/ui/ThemePreviewModal.tsx` - Theme preview

### Studio Components
- `components/studio/StudioHero.tsx`
- `components/studio/StudioServices.tsx`
- `components/studio/StudioProcess.tsx`
- `components/studio/StudioCTA.tsx`

### XR World Components
- `components/xr/XRHub.tsx`
- `components/xr/XRFeatureCard.tsx`
- `components/xr/XRWorldGrid.tsx`

### Editor Components
- `components/editors/EditorContainer.tsx`

### Viewers
- `components/viewers/GalleryViewer.tsx`
- `components/viewers/PanoramaViewer.tsx`
- `components/viewers/ModelViewer.tsx`
- `components/viewers/PixelStreamingTerminal.tsx`

### UI Components
- `components/ui/ToastNotification.tsx`

### Libraries
- `lib/feature-flags.ts` - Feature flag system
- `lib/rbac.ts` - Role-based access control
- `lib/nav-config.ts` - Centralized navigation config
- `lib/store.ts` - Zustand app store
- `lib/theme-provider.tsx` - Theme provider

---

## Data Flow

1. **Supabase** - Primary database for user data, projects, organizations
2. **Firebase** - Auth, realtime updates, notifications
3. **3D Engine** - Standalone services on ports 3002-3003
4. **SuperSplat** - Gaussian splatting editor on port 3002
5. **Pixel Streaming** - Unreal Engine on port 3003

---

## Summary

| Category | Count |
|----------|-------|
| Public routes (existing) | ~50 |
| SaaS app routes (new) | ~56 |
| Public new routes (Phase 2/4) | ~8 |
| Creator dynamic routes (Phase 7) | ~15 (pending) |
| **Total** | **~130 routes** |
