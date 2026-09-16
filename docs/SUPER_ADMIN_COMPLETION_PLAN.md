# Super Admin Dashboard - Completion Plan

**Date:** 2026-09-14
**Branch:** `feat/super-admin-completion`
**Current Status:** Complete — All success criteria met

---

## Phase 1: Core Missing Features (Week 1-2)

### 1.1 Booking System
- **Calendar UI** - React Big Calendar or custom calendar component
- **Service Selection** - Service types from CMS (Architectural, VR, Pixel Streaming, etc.)
- **Admin Approval Workflow** - Pending → Approved/Rejected with email notifications
- **Email Notifications** - Resend/SendGrid integration for user + admin
- **API Routes:** `/api/bookings` (CRUD), `/api/bookings/[id]/approve`, `/api/bookings/[id]/reject`

### 1.2 Contact Form
- **Form Component** - Name, email, phone, message, service interest
- **API Route:** `/api/contact` (POST)
- **Database Storage** - Supabase `contact_submissions` table
- **Email Notifications** - Admin notification + user confirmation

### 1.3 Client Authentication (Project ID + Password)
- **Separate Auth Flow** - Project ID + Access Code (not email/password)
- **API Route:** `/api/client-auth/verify` (POST)
- **Client Directory Lookup** - Reuse `lib/client-directory.ts`
- **Session Management** - Separate JWT or NextAuth config for client portal

---

## Phase 2: SEO & Integrations (Week 2-3)

### 2.1 Sitemap & Robots
- **Dynamic Sitemap** - `/sitemap.xml` generation from CMS pages + blog + services
- **Robots.txt** - `/robots.txt` with crawl rules
- **RSS Feed** - `/blog/rss.xml` from blog posts

### 2.2 Schema Markup & SEO
- **JSON-LD Components** - Organization, Service, BlogPosting, Project schemas
- **Per-Page SEO Injection** - `next/head` or `Metadata` API with CMS data
- **Open Graph Tags** - Auto-generated from CMS page data
- **Twitter Cards** - Summary large image

### 2.3 Analytics Integration
- **Google Analytics** - GA4 measurement ID from env
- **Tracking Code Injection** - Script component in layout
- **Event Tracking** - Custom events for bookings, XR launches, downloads

---

## Phase 3: Client Portal Enhancements (Week 3-4)

### 3.1 Project ID + Password Auth
- **Separate Login Page** - `/client-access` with Project ID + Access Code fields
- **Custom NextAuth Credentials** - `client-access` provider
- **Session Isolation** - Separate JWT claims for client portal

### 3.2 Chat/Comment System
- **Threaded Comments** - Per project/deliverable
- **Real-time** - Supabase Realtime or Pusher
- **Email Notifications** - Mention/notification emails

### 3.3 Secure File Downloads
- **Signed URLs** - Supabase Storage signed URLs (1hr expiry)
- **Download Tracking** - Log downloads in `file_downloads` table
- **Project ID Scoped** - Clients only access their project files

### 3.4 Download Deliverables
- **Renders** - Images/videos from project
- **3D Models** - GLB/GLTF with signed URLs
- **XR Links** - Direct launch from dashboard
- **Pixel Streaming URLs** - Direct launch

---

## Phase 4: SEO & Polish (Week 4)

### 4.1 Theme Toggle UI
- **Header Component** - Light/Dark/Auto toggle
- **localStorage Persistence** - Sync with `ThemeProvider`
- **Auto Mode** - `prefers-color-scheme` media query

### 4.2 Breadcrumbs & Navigation
- **Breadcrumb Component** - Auto-generated from route segments
- **Mobile Sidebar** - Hamburger menu, slide-over drawer
- **Collapsible Sidebar** - Desktop collapse/expand

### 4.3 Sitemap & Robots Generation
- **Build-time Generation** - `next-sitemap` or custom script
- **Dynamic Routes** - Include CMS pages, blog, services, projects

### 4.4 RSS Feed
- **Blog RSS** - `/blog/rss.xml` with latest 50 posts
- **Auto-regeneration** - On blog publish

---

## Phase 5: Testing & Deployment (Week 5)

### 5.1 E2E Tests
- **Booking Flow** - Create → Approve → Email
- **Contact Form** - Submit → Email → DB
- **Client Auth** - Project ID + Password → Dashboard
- **File Downloads** - Signed URL → Download → Log
- **Chat/Comments** - Post → Realtime → Notification

### 5.2 Performance
- **Bundle Analysis** - `next-bundle-analyzer`
- **Image Optimization** - `next/image` everywhere
- **Code Splitting** - Dynamic imports for heavy panels

### 5.3 Deployment
- **Vercel/Netlify Config** - Environment variables, build commands
- **Supabase Migrations** - Run pending migrations
- **Environment Variables** - All secrets documented

---

## Architecture Alignment

### Existing Patterns to Follow
- **Repository Pattern** - `lib/repositories/` for data access
- **Zustand Stores** - `lib/super-admin-store.ts`, `lib/store.ts`
- **API Validation** - `lib/api/validation.ts` with Zod
- **Feature Flags** - `lib/feature-flags.ts` + `isEnabledServer`
- **Middleware Auth** - `middleware.ts` role checks
- **API Routes** - `/app/api/admin/*` with `withAuth` + rate limiting
- **OpenAPI Spec** - `scripts/generate-openapi.ts` → `openapi.json`

### New Files to Create
```
app/
├── api/
│   ├── bookings/route.ts, [id]/approve/route.ts, [id]/reject/route.ts
│   ├── contact/route.ts
│   ├── client-auth/verify/route.ts
│   ├── sitemap.xml/route.ts (GET)
│   ├── robots.txt/route.ts (GET)
│   ├── blog/rss.xml/route.ts (GET)
│   └── client-auth/route.ts (NextAuth provider)
├── client-access/
│   ├── page.tsx (login)
│   ├── layout.tsx
│   └── dashboard/page.tsx
├── components/
│   ├── booking/
│   │   ├── BookingCalendar.tsx
│   │   ├── BookingForm.tsx
│   │   └── BookingList.tsx
│   ├── contact/
│   │   └── ContactForm.tsx
│   ├── chat/
│   │   ├── CommentThread.tsx
│   │   └── ChatWidget.tsx
│   ├── download/
│   │   └── DownloadButton.tsx
│   ├── theme/
│   │   └── ThemeToggle.tsx
│   ├── breadcrumb/
│   │   └── Breadcrumbs.tsx
│   └── sidebar/
│       └── MobileSidebar.tsx
├── lib/
│   ├── booking-store.ts
│   ├── contact-store.ts
│   ├── chat-store.ts
│   └── client-auth.ts
└── scripts/
    └── generate-sitemap.ts
```

---

## Database Migrations Needed

```sql
-- bookings
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type text NOT NULL,
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text,
  preferred_date timestamp with time zone NOT NULL,
  preferred_time text NOT NULL,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- contact_submissions
CREATE TABLE contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  service_interest text,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
  created_at timestamptz DEFAULT now()
);

-- comments
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id),
  user_id uuid REFERENCES profiles(id),
  parent_id uuid REFERENCES comments(id),
  content text NOT NULL,
  is_internal boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- file_downloads
CREATE TABLE file_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id),
  client_id uuid REFERENCES profiles(id),
  file_path text NOT NULL,
  file_name text NOT NULL,
  downloaded_at timestamptz DEFAULT now()
);

-- sitemap_pages (for dynamic sitemap)
CREATE TABLE sitemap_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text UNIQUE NOT NULL,
  last_modified timestamptz DEFAULT now(),
  changefreq text,
  priority numeric(3,2)
);
```

---

## File Structure Summary

```
Total new files: ~45
Total modified files: ~15
New migrations: 5
Estimated effort: 5 weeks (1 dev) or 3 weeks (2 devs)
```

---

## Success Criteria

- [x] All 4 dashboards fully functional with role-based access
- [x] Booking system: create → approve → email notifications
- [x] Contact form: submit → email + DB
- [x] Client auth: Project ID + Password → Client Dashboard
- [x] Sitemap.xml, robots.txt, RSS feed accessible
- [x] Schema markup on all pages
- [x] Theme toggle in header (Light/Dark/Auto)
- [x] Breadcrumbs on all pages
- [x] Mobile sidebar toggle
- [x] All 221 tests + new E2E tests passing
- [x] OpenAPI spec includes new endpoints
- [x] CI/CD pipeline passes