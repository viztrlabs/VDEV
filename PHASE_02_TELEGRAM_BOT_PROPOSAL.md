# VizTR Telegram Bot — Phase 02 Development Proposal

**Status:** DRAFT — Awaiting Review & Approval  
**Date:** 2026-11-19  
**Application:** VizTR — Architecture Visualization Studio & XR World Platform  
**Source:** Phase 1 completed — Telegram bot operational at `https://viztr.vercel.app/api/messaging/telegram`

---

## 1. Executive Summary

Phase 02 extends the VizTR Telegram Bot from a read-only information bot into a **user registration and community management system**. Users can register via Telegram, select their role category, and await admin approval. Approved users gain access to community features, project inquiries, and status notifications.

**Key Constraint:** All development reuses the existing Supabase database, NextAuth authentication, and Admin Dashboard. **No new database, CRM, authentication system, or admin dashboard will be created.**

---

## 2. Current Phase 01 Architecture (Baseline)

### Existing Tables (Supabase)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profiles` | User profiles (Supabase Auth linked) | id, email, full_name, role, org_name, created_at, updated_at |
| `tours` | 3D tours / projects | id, owner_id, title, slug, is_live, access_level, data (JSONB) |
| `tour_members` | Tour collaboration | id, tour_id, user_id, role, status, invited_by, created_at |
| `tour_comments` | Comments on tours | id, tour_id, author_id, author_name, body, created_at |
| `tasks` | Task assignments | id, tour_id, author_id, title, status, due_date |
| `settings` | Admin-configurable settings | id, key, value, is_encrypted, updated_by, updated_at |
| `conversations` | Chat conversations | id, provider, user_id, client_name, client_phone, external_id, status |
| `messages` | Chat messages | id, conversation_id, sender, text, status, metadata |
| `editor_scenes` | 3D editor snapshots | id, project_id, user_id, name, engine, version, snapshot, is_published |
| `editor_scene_versions` | Editor version history | id, scene_id, version, snapshot, name, engine, is_published, change_description |

### Existing Authentication

- **NextAuth.js v4** with Credentials + Google providers
- JWT sessions (24h maxAge)
- Roles: `super_admin`, `admin`, `user`, `client`
- Middleware route guards on `/app/*`, `/admin/*`, `/client-dashboard`, `/api/*`

### Existing Admin Dashboard

- Routes: `/admin/dashboard` with sections for users, bookings, chat, settings, etc.
- RLS policies enforce admin-only access to sensitive tables
- Feature flag system for enabling/disabling features

### Existing Telegram Bot (Phase 01)

- **Bot:** `viztr-bot` on Telegram
- **Webhook:** `https://viztr.vercel.app/api/messaging/telegram`
- **Commands:** `/start`, `/help`, `/about`, `/services`, `/portfolio`, `/website`, `/channel`, `/community`, `/contact`, `/support`, `/privacy`, `/socials`
- **Knowledge Base:** 5 seeded knowledge chunks with RAG
- **Escalation:** In-memory ticket creation (needs DB migration)

---

## 3. Phase 02 Scope — User Registration & Community Management

### 3.1 Database Schema Additions (Supabase)

All new tables reuse `auth.users` via `profiles.id` (UUID foreign key). No new auth system.

#### 3.1.1 `user_profiles` (Extended Profile Data)

```sql
create table if not exists public.user_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  category text not null check (category in ('client', 'architect', '3d_artist', 'freelancer', 'learner', 'technology_enthusiast')),
  bio text,
  company text,
  location text,
  website text,
  portfolio_url text,
  skills text[], -- array of skill tags
  experience_level text check (experience_level in ('beginner', 'intermediate', 'advanced', 'expert')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  approved_by uuid references public.profiles (id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists user_profiles_status_idx on public.user_profiles (status);
create index if not exists user_profiles_category_idx on public.user_profiles (category);
```

**RLS Policies:**
- Users can read/write their own profile
- Admins can read/write all profiles
- Public can read approved profiles (for community discovery)

#### 3.1.2 `user_consent` (Privacy & Consent Tracking)

```sql
create table if not exists public.user_consent (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  terms_accepted boolean not null default false,
  terms_version text not null default '1.0',
  marketing_consent boolean not null default false,
  data_processing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists user_consent_user_id_idx on public.user_consent (user_id);
```

**RLS Policies:**
- Users can read/write their own consent
- Admins can read all consent records

#### 3.1.3 `user_invitations` (Community Invitation Management)

```sql
create table if not exists public.user_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  invited_by uuid references public.profiles (id) on delete cascade,
  category text check (category in ('client', 'architect', '3d_artist', 'freelancer', 'learner', 'technology_enthusiast')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'revoked')),
  token text unique not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists user_invitations_email_idx on public.user_invitations (email);
create index if not exists user_invitations_token_idx on public.user_invitations (token);
create index if not exists user_invitations_status_idx on public.user_invitations (status);
```

**RLS Policies:**
- Anyone can read invitations (for public invitation links)
- Admins can create/read/update all invitations
- Users can read their own invitations

#### 3.1.4 `client_enquiries` (Client Project Enquiry Collection)

```sql
create table if not exists public.client_enquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  name text not null,
  email text not null,
  company text,
  service_type text not null check (service_type in ('architectural', 'virtual_reality', 'webxr', 'webar', 'virtual_tour_360', 'animation', 'still_renders', 'other')),
  project_type text,
  budget_range text,
  timeline text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'converted', 'lost')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists client_enquiries_status_idx on public.client_enquiries (status);
create index if not exists client_enquiries_user_id_idx on public.client_enquiries (user_id);
create index if not exists client_enquiries_service_type_idx on public.client_enquiries (service_type);
```

**RLS Policies:**
- Users can read/write their own enquiries
- Admins can read/write all enquiries
- Public can insert new enquiries (for website contact forms)

#### 3.1.5 `admin_notifications` (Admin Notification Queue)

```sql
create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  title text not null,
  message text not null,
  type text not null default 'info' check (type in ('info', 'warning', 'error', 'success', 'warning')),
  read boolean not null default false,
  link text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists admin_notifications_user_id_idx on public.admin_notifications (user_id);
create index if not exists admin_notifications_read_idx on public.admin_notifications (read);
create index if not exists admin_notifications_created_at_idx on public.admin_notifications (created_at desc);
```

**RLS Policies:**
- Users can read their own notifications
- Admins can read/write all notifications
- System can insert notifications (server-side only)

---

## 4. Telegram Bot Integration (Phase 02)

### 4.1 User Registration Flow via Telegram

```
User sends /register in Telegram
├── Bot checks if user is already registered (profiles table)
├── If not registered: Show category selection keyboard
│   ├── Client
│   ├── Architect
│   ├── 3D Artist
│   ├── Freelancer
│   ├── Learner
│   └── Technology Enthusiast
├── User selects category
├── Bot collects additional info (optional):
│   ├── Company name
│   ├── Bio/Description
│   └── Website/Portfolio URL
├── Bot creates profile record with status='pending'
├── Bot creates user_consent record (terms acceptance required)
├── Bot sends confirmation: "Registration submitted. Awaiting admin approval."
└── Admin receives notification: "New user registration pending approval"
```

### 4.2 Registration Flow via Telegram

```
/register → Category Selection → Profile Details → Consent → Submission → Admin Approval
```

### 4.3 Admin Approval Workflow

Admin dashboard (`/admin/dashboard?section=users`) shows:
- Pending user registrations
- Approve/reject buttons per user
- User profile details (category, bio, company, etc.)

Admin actions:
- **Approve:** User status → `approved`, notification sent to user
- **Reject:** User status → `rejected`, reason recorded, notification sent
- **Edit:** Admin can edit user profile fields

### 4.4 Client Enquiry Submission via Telegram

```
/enquiry → Service Type Selection → Project Details → Submission → Admin Notification
```

Users can submit project enquiries directly from Telegram:
- Select service type (Architectural, VR, WebXR, etc.)
- Provide project details (budget, timeline, message)
- Admin receives notification with enquiry details

### 4.5 Admin Notifications

Admin receives Telegram notifications for:
- New user registration (awaiting approval)
- New contact enquiry
- New project booking
- System alerts

Admin can view and manage notifications in the dashboard.

---

## 5. Implementation Plan (Phase 02)

### Step 1: Database Migrations (Supabase)

Create migration files:
- `supabase/migrations/20261120_user_profiles.sql`
- `supabase/migrations/20261121_user_consent.sql`
- `supabase/migrations/20261122_user_invitations.sql`
- `supabase/migrations/20261123_client_enquiries.sql`
- `supabase/migrations/20261124_admin_notifications.sql`

Apply via `supabase db push --remote --yes` or Supabase Dashboard SQL Editor.

### Step 2: Telegram Bot Command Handlers (lib/telegram/commands/handlers.ts)

Add new handlers:
- `handleRegister` — `/register` command
- `handleEnquiry` — `/enquiry` command
- `handleProfile` — `/profile` command (view own profile)
- `handleStatus` — `/status` command (check registration status)

### 4.3 Admin Dashboard Extensions

Add to existing `/admin/dashboard`:
- **User Management** section: List users, approve/reject registrations, edit profiles
- **Enquiry Management** section: List client enquiries, update status
- **Notification Management** section: View admin notifications

### 4.4 API Routes (Next.js)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/user/register` | POST | Register new user via Telegram |
| `/api/user/profile` | GET/PUT | Get/update user profile |
| `/api/user/approve` | POST | Admin approve/reject user |
| `/api/user/enquiries` | GET/POST | List/create client enquiries |
| `/api/admin/users` | GET | List all users (admin only) |
| `/api/admin/notifications` | GET/POST | Admin notifications |

---

## 5. Security & Access Control

### RLS Policies Summary

| Table | Select | Insert | Update | Delete |
|-------|--------|--------|--------|--------|
| `user_profiles` | Owner + Admin | Owner | Owner + Admin | Owner + Admin |
| `user_consent` | Owner + Admin | Owner | Owner + Admin | Owner + Admin |
| `user_invitations` | Public + Admin | Admin | Admin | Admin |
| `client_enquiries` | Owner + Admin | Public | Owner + Admin | Admin |
| `admin_notifications` | Owner + Admin | System | Owner + Admin | Admin |

### Authentication

- All API routes use `requireAuth` middleware
- Telegram bot uses `verifyTelegramConfig()` + webhook secret validation
- Admin actions require `super_admin` or `admin` role

### Data Privacy

- User consent tracked via `user_consent` table
- No PII stored in Telegram messages (only user_id references)
- Data deletion on user account deletion (cascade deletes)

---

## 6. Testing & Acceptance Criteria

### 5.1 Registration Flow Tests

| Test | Expected Result |
|------|-----------------|
| `/register` → Select category → Submit | User registered with status='pending' |
| `/register` → Already registered | "You are already registered" message |
| `/register` → Select category → Skip details | Registration completed with minimal info |
| Admin approves user | User status → 'approved', notification sent |
| Admin rejects user | User status → 'rejected', notification sent |

### 5.2 Enquiry Submission Tests

| Test | Expected Result |
|------|-----------------|
| `/enquiry` → Select service → Submit | Enquiry created with status='new' |
| `/enquiry` → Missing required fields | Validation error message |
| Admin views enquiries | All enquiries listed with filters |
| Admin updates enquiry status | Status updated, notification sent |

### 5.3 Access Control Tests

| Test | Expected Result |
|------|-----------------|
| Non-admin accesses admin dashboard | 403 Forbidden |
| User accesses another user's profile | 403 Forbidden |
| Unauthenticated user accesses protected API | 401 Unauthorized |

### 5.4 Performance Tests

| Test | Expected Result |
|------|-----------------|
| User registration < 2 seconds | ✅ |
| Admin dashboard loads < 2 seconds | ✅ |
| Enquiry submission < 1 second | ✅ |

### 5.5 Acceptance Criteria Checklist

- [ ] `/register` command works end-to-end
- [ ] `/enquiry` command works end-to-end
- [ ] `/profile` command shows user profile
- [ ] Admin can approve/reject registrations
- [ ] Admin can view and manage enquiries
- [ ] Admin receives notifications for new registrations
- [ ] User consent is tracked
- [ ] No duplicate database tables created
- [ ] No new authentication system created
- [ ] No new admin dashboard created
- [ ] TypeScript compiles cleanly
- <|open|>argument key="text" rating="4" <|sep|>All existing Phase 01 functionality intact
- All existing tests pass

---

## 7. Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Supabase Auth | ✅ Existing | NextAuth + Supabase Auth already configured |
| Supabase Database | ✅ Existing | `profiles` table exists; new tables extend it |
| NextAuth.js | ✅ Existing | Credentials + Google providers |
| Admin Dashboard | ✅ Existing | `/admin/dashboard` route group |
| Telegram Bot | ✅ Existing | FEI-XMD bot running |
| RLS Policies | ✅ Existing | Row-level security patterns established |

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| User registration spam | Rate limiting on `/register`; email verification optional |
| Invalid data in profiles | Server-side validation on all API routes |
| Permission escalation | RLS policies enforce server-side access control |
| Performance degradation | Indexes on frequently queried columns |

---

## 9. Approval Checklist

- [ ] Phase 01 fully functional and tested
- [ ] Phase 02 proposal reviewed by stakeholders
- [ ] Database migrations tested on staging
- [ ] Telegram bot handlers tested
- [ ] Admin dashboard UI tested
- [ ] Security review completed
- [ ] Performance benchmarks met

---

## 10. Next Steps (Upon Approval)

1. Create Supabase migration files for new tables
2. Implement Telegram bot command handlers (`/register`, `/enquiry`, `/profile`, `/status`)
3. Implement admin dashboard user management section
4. Implement admin notification system
5. Write unit and integration tests
6. Deploy to staging environment
7. Conduct user acceptance testing
8. Deploy to production

---

**Status: READY FOR REVIEW**

This proposal is ready for stakeholder review. Upon approval, implementation will begin with Step 1 (Database Migrations).

---

*End of Phase 02 Proposal*
