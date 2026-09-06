# VizTR Editor Dashboard — Design Spec

**Date:** 2026-09-05
**Status:** Approved

## Problem

The VizTR Editor at `http://localhost:3487` has a working backend with project CRUD APIs, but the project dashboard (`blank.html`) is a crude placeholder — a simple list with `prompt()` for project creation. It doesn't match the VizTR theme or provide a usable developer experience.

The PlayCanvas editor's dashboard (picker-cms.ts, ~1200 lines) is a complex PCUI overlay embedded in the editor bundle — too tightly coupled to extract.

The existing Next.js client-dashboard is a client portal for architectural visualization viewers — wrong purpose, wrong data model.

## Solution

Create a new `/editor-projects` page in the Next.js workspace that serves as a PlayCanvas-style project dashboard, proxying API calls to the editor backend at port 3487.

## Architecture

```
Next.js App (port 3000)
  /editor-projects          → React page (project grid + modal)
  /api/editor-projects/*    → API routes (proxy to port 3487)

Editor Backend (port 3487)
  /api/projects             → Project CRUD
  /editor/project/:id       → Full editor with config injection
```

## Components

### 1. Page: `app/editor-projects/page.tsx`

Standalone page (no auth required for local dev). Layout:
- Header bar: VizTR logo, "Editor Projects" title, user badge (`viztr-user`)
- Toolbar: Search input, sort dropdown (Last Edited / Name / Created), "New Project" button
- Project grid: Responsive 3-4 column grid of project cards
- Empty state: "No projects yet" message with create button

### 2. Component: `components/editor-projects/ProjectCard.tsx`

Each card renders:
- Thumbnail placeholder (gradient background with project initial letter)
- Project name
- Created/updated date (relative: "2 hours ago", "3 days ago")
- Scene count badge
- "Open" button → opens `http://localhost:3487/editor/project/:id` in new tab
- Dropdown menu → Delete project (with confirmation)

### 3. Component: `components/editor-projects/NewProjectModal.tsx`

Two-column modal dialog with:
- **Left panel**: Starter kit grid organized by service group
  - **General**: Blank Project
  - **Architecture Studio**: Exterior / Interior, Animation / Walkthrough
  - **XR World**: XR / AR, VR Experience, Virtual Tour, Gaussian Splat, Pixel Streaming
- **Right panel**: Sidebar form
  - Name input (pre-filled from selected kit)
  - Description textarea (pre-filled from selected kit)
  - Selected kit description preview
  - CREATE button → `POST /api/editor-projects` with `fork_from` → refresh list

Each kit has: id, name, description, gradient thumbnail, icon, `fork_from` ID.

When `fork_from` is provided, the backend pre-populates the scene with template entities (cameras, lights, ground planes, etc.).

### 4. API Routes: `app/api/editor-projects/`

| Route | Method | Proxies to | Purpose |
|-------|--------|-----------|---------|
| `/api/editor-projects` | GET | `GET http://localhost:3487/api/projects` | List all projects |
| `/api/editor-projects` | POST | `POST http://localhost:3487/api/projects` | Create project |
| `/api/editor-projects/[id]` | GET | `GET http://localhost:3487/api/projects/:id` | Get project |
| `/api/editor-projects/[id]` | PUT | `PUT http://localhost:3487/api/projects/:id` | Update project |
| `/api/editor-projects/[id]` | DELETE | `DELETE http://localhost:3487/api/projects/:id` | Delete project |
| `/api/editor-projects/[id]/scenes` | GET | `GET http://localhost:3487/api/projects/:id/scenes` | List scenes |

Error handling: If editor server is not running, return `{ error: "Editor server not running on port 3487" }` with 503 status.

## Styling

Use existing VizTR theme (Tailwind CSS):
- Background: `#0a0e27` (dark navy)
- Card background: `#111638`
- Accent: `#D4A843` (gold)
- Text: `#e0e0e0`
- Borders: `rgba(255,255,255,0.08)`
- Fonts: Inter (already in workspace)

## Data Flow

1. Page loads → `GET /api/editor-projects` → proxies to editor backend → renders grid
2. User clicks "New Project" → modal opens → user selects kit → form pre-fills → clicks CREATE → `POST /api/editor-projects` with `fork_from` → backend creates project with template scene → list refreshes
3. User clicks "Open" → new tab opens `http://localhost:3487/editor/project/:id`
4. User clicks "Delete" → confirmation dialog → `DELETE /api/editor-projects/:id` → list refreshes
5. User types in search → client-side filter by project name

## Files to Create

```
app/editor-projects/page.tsx
app/api/editor-projects/route.ts
app/api/editor-projects/[id]/route.ts
app/api/editor-projects/[id]/scenes/route.ts
components/editor-projects/ProjectCard.tsx
components/editor-projects/NewProjectModal.tsx
```

## Files to Modify

- `app/layout.tsx` — Add "Editor" link to navigation (optional)

## Verification

1. Start editor backend: `cd forks/editor && npm run start:local`
2. Start Next.js: `npm run dev`
3. Open `http://localhost:3000/editor-projects`
4. Verify: Empty state shows "No projects yet"
5. Click "New Project" → modal opens → create project → appears in grid
6. Click "Open" → editor opens in new tab with project loaded
7. Click "Delete" → confirmation → project removed from grid
8. Verify search filters projects by name
