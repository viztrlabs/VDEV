# Virtual Tour Editor Dashboard — 12-Phase Implementation Plan

## Goal
Extend the existing Virtual Tour Editor at `app/xr-world/virtual-tour/editor/page.tsx` to add the Panoee-style features described in `VTDF.txt`. Dollhouse and 3D Model Builder features (features #85-107) are explicitly out of scope. The editor is a 2D web-based 360° tour authoring tool — do not merge with the existing 3D XR viewer (`components/xr/`).

## Scope Decisions
- **Editor stays 2D**: Use the existing flat-panorama + click-to-place-hotspot model. No replacement of the Marzipano/WebXR viewer.
- **In-memory + Supabase fallback**: All new persistence reuses the pattern in `lib/toursRepo.ts` (Supabase when configured, local JSON otherwise).
- **Existing editor structure**: 3-pane layout (scene list / panorama / inspector) plus section tabs (Editor, Design, Content, Settings, Model, Marketing) becomes the foundation. Tabs get added/repurposed to cover the 12 phases.
- **Multi-project**: Current editor is single-project (uses `localStorage('viztr_active_tour')`). Multi-project dashboard (Main Dashboard module) is the largest new addition and is phased in last (Phase 12).

## Out of Scope (per user)
- Dollhouse Enabled/Background/Hotspot colors
- 3D Model Builder (4-step wizard, surface tools, render progress, statistics)
- Dollhouse 3D Assembly wizard
- AI Floorplan Maker (AI generation is out of scope — wizard UI shell only)
- All dollhouse-related property UI

## Existing Codebase Anchors
| Area | File | Reuse for |
|---|---|---|
| Editor page | `app/xr-world/virtual-tour/editor/page.tsx` | Base layout, hotspot ops, panorama drag-drop |
| Tour store | `lib/tourStore.ts`, `lib/toursRepo.ts` | Room CRUD, hotspot persistence |
| Tour settings | `lib/tourSettings.ts` | Extend with design/content/marketing config |
| Tour API | `app/api/tour/route.ts`, `app/api/tour/settings/route.ts`, `app/api/tour/media/route.ts`, `app/api/tour/upload/route.ts` | Existing endpoints to extend |
| Admin panel | `components/admin/VirtualTourAdminPanel.tsx` | Pattern reference for feature toggles |
| Data model | `data/tour-config.ts` (TourRoom, Hotspot types) | Extend types; do not replace |

---

## Phase 1 — Hotspot System Completion (Styling, Per-Type Distortion, Point Setup)
**Goal:** Replace the current 6-type hotspot enum with the full 8-type VTDF hotspot model and add per-hotspot style, label, and point-setup panels.

**Tasks:**
1. Extend `Hotspot` type (in `data/tour-config.ts` and editor) to include: `icon`, `shape`, `effect`, `distort`, `style` (icon/shape/color/size/opacity/rotate/effect), `label` (font/size/weight/padding/radius/shadow/uppercase/italic/showOnHover), `pointSetup` (transitioning/hidePreview/viewMode).
2. Add Hotspot Type selector in inspector with 8 types: Point, Chevron, Image, Article, Video, Sound, Link, Compact, Product.
3. Add Style tab: icon (Font Awesome string), shape (circle/square), background color (hex+opacity), size slider, opacity slider, rotate, effect (Normal/Radar/Glowing/Subtle), visibility count, distort toggle.
4. Add Label tab: font family, size, weight, letter-spacing, padding X/Y, border-radius, background color, text color, text shadow, uppercase toggle, italic toggle, show-on-hover toggle.
5. Add Global tab: Lock hotspot, keep position on zoom, hide title on top, hide preview box on hover, popup size (Custom/Fixed), popup layout.
6. Add Copy/Revert/Delete buttons on each hotspot card.
7. Save hotspot style/label as part of the room data via existing PUT `/api/tour`.

**Validation:** Create a hotspot of each type, set style + label, reload editor, confirm persistence.

---

## Phase 2 — Scene Configuration & Image Processing
**Goal:** Replace the basic scene settings with the full VTDF scene config (Title, ID, Featured, Replace Pano, Audio, Nadir fix, Light/Sharpen/Sun filters, Staging).

**Tasks:**
1. In the inspector, replace the Scene Settings card with: Title (T) text, ID (#) text, Set Featured toggle, Replace Pano button (file picker), Audio Upload (.mp3).
2. Add Nadir section: Quick Fix (auto-blur nadir patch), Custom Fix (image upload).
3. Add Staging section: dropdown (None / Staging / Day to Dusk), Sun Light toggle (Disabled/Enabled).
4. Add Filter Processing section:
   - Light Filter: enable + Exposure/Lights/Shadows/Range/Masking/Quality sliders
   - Sharpen Filter: enable + Strength/Range/Quality sliders
   - Sun Light: enable + drag-drop sun position (X/Y), Brightness Sun, Effect, Brightness Rainbow, Exposure Bias
5. Extend `TourRoom` type in `data/tour-config.ts` with `lightFilter`, `sharpenFilter`, `sunLight`, `nadirFix`, `stagingMode`, `featured` (already present).
6. Update the panorama preview `<img>` to apply CSS filters (`filter: brightness() contrast() saturate()`) from the scene settings.

**Validation:** Toggle Light Filter, save, reload, confirm filter re-applied.

---

## Phase 3 — Viewer Controls & Orientation (Save Default View, Set North, Mini-map, View Limits)
**Goal:** Add orientation tools and view constraint controls per VTDF.

**Tasks:**
1. Add orientation toolbar (above the panorama) with: Save Default View, Set North (0°), and live Pitch/Yaw/Roll indicators.
2. On "Save Default View" / "Set North", persist the current Yaw/Pitch back to the room's `initialYaw` / `initialPitch`.
3. Add a floating Mini-map (bottom-left of panorama): show the current panorama as a small thumbnail with red dot for each hotspot; display "X hotspots" label.
4. Add View Constraints section in inspector: Top/Bottom/Left/Right numeric inputs (default -90/90/-180/180) with clear (×) buttons, Zoom Limit dual-handle slider (60/150), Mobile Zoom Limit toggle, Save All button.
5. Persist view constraints in `TourRoom.viewConstraints` (new field).

**Validation:** Set North, reload, confirm initial yaw is 0. Adjust limit view, save, reload viewer, confirm panning is constrained.

---

## Phase 4 — Design & Theming (Theme Presets, Colors, Fonts, Display Toggles)
**Goal:** Replace the single "accent color" design tab with a full theme system.

**Tasks:**
1. Extend `TourSettings.theme` in `lib/tourSettings.ts` with: `preset` (Default/Default 2.0/Solid/Wall/Base/Folio/Blank), `primaryColor` (hex+opacity), `textColor`, `primaryFont`, `secondaryFont`, `display` (hideProjectTitle, hideSceneTitleOnCard, hideSceneTitle, autoOpenSceneList, showSceneTitleInList).
2. Build a "Design" tab (replaces current Design panel) with: preset selector (7 options), primary color picker, text color picker, primary font selector, secondary font selector, 5 display toggles.
3. Generate CSS variables (already supported in `lib/theme-provider.tsx`); on save, the live viewer pulls the new theme.
4. Add Save Branding button (currently in editor page).

**Validation:** Pick "Wall" preset, save, open `/xr-world/virtual-tour`, confirm new theme applies.

---

## Phase 5 — Form, Polygon, Popup Setup
**Goal:** Add the three VTDF component styling panels (form, polygon hotspot, popup).

**Tasks:**
1. Form Setup panel: Layout (Dialog/Panel), Position (Left/Right), Background Color (hex), Overlay Color (hex+opacity%).
2. Polygon Setup panel: Background Color, Background Hover, Border Color, Border Hover, Border Width (px).
3. Popup Setup panel: Background Color, Text Color.
4. Add these as nested sections under the "Hotspot" tab in the inspector (or as new tabs). Store in `TourSettings.designComponents` (new field).
5. Live preview thumbnails that reflect color changes (mini modal mockup).

**Validation:** Change polygon hover color, save, reload, confirm persisted in `tourSettings.json`.

---

## Phase 6 — Floorplan Creator & Display Settings
**Goal:** Add the VTDF floorplan (image-based) feature — NOT the 2D editor or AI floorplan maker.

**Tasks:**
1. Build a "Floorplans" tab in the section bar. Create `lib/floorplanStore.ts` (analogous to `tourStore.ts`): CRUD over floorplan records `{id, name, imageUrl, draft, publishedAt, roomsLinked[]}`.
2. Floorplan list: cards with thumbnail, name, Publish/Draft toggle, Edit/Delete.
3. Floorplan Creator modal: Name input, drag-drop image upload, Create button.
4. Add Floorplan Display Settings in `TourSettings.floorplan`: Show on start (bool), Layout (Box/Panel), Position (Left/Right), Background color, Radar (enabled/color/border/width), Marker (background/border).
5. Add `/api/tour/floorplans` route with GET/POST/PUT/DELETE (Supabase table `floorplans` with fallback to `lib/floorplanStore.ts`).
6. Update the public viewer to render the floorplan overlay when enabled (simplified: a static image with room markers — defer interactive markers to Phase 8).

**Validation:** Create "Lobby Floorplan", publish, enable in settings, open viewer, confirm overlay shows.

---

## Phase 7 — Google Map Integration & Map Markers
**Goal:** Add the map panel for geolocated scenes (no real-time Google Maps API; use Leaflet + OpenStreetMap as free fallback).

**Tasks:**
1. Build a "Map" tab: mini map component (Leaflet) with markers for each scene that has `lat`/`lng`.
2. Extend `TourRoom` with optional `lat`, `lng`, `floorName`, `mapMarkerImage` fields.
3. Map settings in `TourSettings.googleMap`: Enabled, Show on start, Map Type (Road/Satellite/Terrain — fallback to OSM tile variants), Layout (Box/Panel), Position, Background, Radar, Marker (image + active image + width px).
4. Add scene-level Map Marker picker in the inspector (with edit/rotate icons for the uploaded marker image).
5. Leaflet already declared in `package.json` (no install needed).
6. Scene context menu (right-click) gets new items: "Set on Map" → opens a "click on map to set lat/lng" mini-modal.

**Validation:** Set two scenes on the map, enable in settings, open viewer, confirm both markers render.

---

## Phase 8 — Canvas / Tour Map (Drag-and-Drop Scene Layout)
**Goal:** Add the visual "Canvas" mode showing scenes as draggable cards with auto-arrange and GPS-based auto-link.

**Tasks:**
1. Add "Canvas" to the section tab bar. New view replaces the 3-pane editor with a full-canvas grid.
2. Each scene renders as a draggable card (thumbnail + name + hotspot count) on a pannable canvas.
3. Bottom toolbar: Drag toggle, Auto Arrange (grid layout), Auto-link by GPS (draw line between scenes within X meters), Save Layout.
4. Hold Space + drag pans the canvas; right-click opens context menu.
5. Persist `floorPlanX` / `floorPlanY` already on `TourRoom` — wire those to the canvas.
6. Auto-link by GPS reads `lat`/`lng` and writes portal hotspots between nearby scenes.

**Validation:** Drag a scene card, save, reopen Canvas, confirm position persisted. Auto-link creates a hotspot on each scene pointing to the other.

---

## Phase 9 — Call To Action & Control Bar Configuration
**Goal:** Add CTA settings and the 25-item control bar configurator.

**Tasks:**
1. CTA panel in `TourSettings.callToAction`: Layout (Bubble/List), Position (Left/Right), Offset Left/Right/Bottom (px).
2. Control Bar panel: list of 25 items (Floorplan, Sound, Auto rotate, Home, Auto change scene, View mode, Multi-Staging, Gyro, VR, Full screen, Map, Info, Group Auto Play, View mode normal/little planet/mirror, Snapshot, Multi-Language). Each row: ID, Category (Icon/Text), Source (Font Awesome icon string), Hide toggle.
3. Persist in `TourSettings.controlBar.items[]`. Default to all visible.
4. Update the public viewer (Marzipano) to read control bar config and render only enabled items.

**Validation:** Hide "Gyro" and "Multi-Language", save, open viewer, confirm those buttons don't render.

---

## Phase 10 — Marketing (Forms Config, Analytics, SEO, Script Chats, Snapshot)
**Goal:** Build the Marketing section with five sub-modules.

**Tasks:**
1. Forms Configuration: list of `formConfigs[]` (id, formId, closeable, eventType [project/scene/hotspot], sceneId?, waitTime). UI: list with Add/Remove, dropdowns.
2. Analytics Dashboard: date range picker, 5 metric cards (Unique, Total, Page Views, Time, Duration), line chart (recharts — already installed), 4 tables (Top Pages, Sources, Countries, Devices). Data source: `/api/tour/analytics` with mock data fallback.
3. SEO panel: Favicon upload, Meta Title, Meta Description, Google Analytics ID (UA or G format with regex validation), SEO image generator button (calls `/api/tour/seo-image` — stub for now), SEO Preview Panel (live preview card), Optimize Suggestions (count + 3 clickable items: Title, Copyright, Slug).
4. Script Chats: list of `{html, script}` items with Add/Update/Delete. Rendered into the viewer at runtime.
5. Snapshot: Hide Watermark toggle, Watermark Image upload, Change/Reset buttons. Sets a global watermark applied to viewer canvas snapshots.
6. New API routes: `/api/tour/analytics`, `/api/tour/seo-image`, extend `/api/tour/settings` to accept the marketing sub-config.
7. Extend `lib/tourSettings.ts` with `marketing: { forms[], analytics, seo, scripts[], snapshot }`.

**Validation:** Add a Form Config, set event=Hotspot + wait=3s, save, open viewer, click a hotspot, confirm form appears after 3s.

---

## Phase 11 — Content Settings (View, Logo, Popup Intro, System, Collaboration)
**Goal:** Add the five content sub-modules in the existing "Content" tab.

**Tasks:**
1. Move Scene View Settings (Limit/Zoom/Mobile Zoom) into Content → View (already partially in Phase 3 inspector — move duplication).
2. Logo Setup: Enabled, Image upload, Width (px), Redirect URL, Position (Top Left/Center/Right). Persist in `TourSettings.logo`.
3. Popup Intro: Enabled + 3 modes (Image, Video, Description Tour). Each mode has its own field set per VTDF.
4. System: Archived Images status + Restore button + Refresh status (no-op stub for now since we don't have S3 archive integration).
5. Collaboration: Enabled toggle, comments counters (mocked), Sharing Permissions (Anyone/Restricted), Collaboration URL with copy/open. The URL is the public viewer link with `?collab=1`.
6. Multi-Language toggle + Description Tour textarea + Initial Scene selector + Generate SEO Image button + Background Sound (upload/delete, type, volume slider) + Category dropdown + Location map (mini Leaflet) + Nadir toggle + Copyright section (link, author, description, QR, premium upsell banner).
7. New `TourSettings.content` object holding all of the above.

**Validation:** Enable Logo, set image, save, open viewer, confirm logo appears top-right.

---

## Phase 12 — Main Dashboard (Project Management, Hosting, Profile, Multi-Project)
**Goal:** Add the outer "Main Dashboard" shell that hosts multiple projects (instead of the current single `viztr_active_tour`).

**Tasks:**
1. Create `app/xr-world/virtual-tour/dashboard/page.tsx` (project list view). Top nav: Project | Media | Tools | Promotion | Enterprise. Grid/List toggle. Filter dropdown. Search bar. New Project button.
2. Project card: 360° preview, author, scene count, status badge, timestamp. Hover actions: Edit, View, Duplicate, Delete.
3. New `lib/projectsStore.ts`: CRUD over `Project[]` `{id, name, tourId, author, sceneCount, status, thumbnailUrl, createdAt, updatedAt}`. Mirrors `lib/tourStore.ts` pattern with Supabase fallback.
4. `/api/projects` GET/POST/PUT/DELETE.
5. Editor `/xr-world/virtual-tour/editor` accepts `?tour=<id>` query param. Removes `viztr_active_tour` from localStorage dependency. If no tour, redirect to dashboard.
6. Tools section (AI Floorplan shell, Static Hosting, Object 360 Creator stub).
7. Promotion section: 3 promo cards (Survey, Trustpilot, ProductHunt) with "Submit Result" CTAs.
8. Enterprise section: upgrade banner + White Label fields (gated by plan flag, all disabled in demo).
9. Profile/Subscriptions/Payment/Affiliate sections: read-only placeholder UI matching the VTDF.
10. Hosting modal (Self-hosted tab with AWS S3 fields + show/hide Secret toggle + Region dropdown; Panoee Cloud tab shows current plan + storage usage + Buy more button). 3-step guide. Cost comparison table (static data).

**Validation:** Create two projects from dashboard, edit one in `/editor?tour=<id>`, confirm the other is untouched. Delete one, confirm gone from dashboard.

---

## File Touch List (high-level)

**New files**
- `lib/floorplanStore.ts`, `app/api/tour/floorplans/route.ts`
- `lib/projectsStore.ts`, `app/api/projects/route.ts` (or `app/api/tours/route.ts` is renamed — keep existing)
- `app/xr-world/virtual-tour/dashboard/page.tsx`
- `components/editor/tabs/CanvasTab.tsx`
- `components/editor/tabs/MarketingTab.tsx` (split into Forms, Analytics, SEO, Scripts, Snapshot panels)
- `components/editor/tabs/ContentTab.tsx` (split into View, Logo, PopupIntro, System, Collab)
- `components/editor/tabs/DesignTab.tsx` (replace existing)
- `components/editor/tabs/ToolsTab.tsx` (Floorplan shell, Static Hosting, Object 360 stub)
- `components/editor/insights/*` (MiniMap, SunLight overlay, LightFilter overlay)
- `app/api/tour/analytics/route.ts`
- `app/api/tour/seo-image/route.ts`

**Modified files**
- `app/xr-world/virtual-tour/editor/page.tsx` (refactor: route `/editor` to render tab content; data layer via hooks)
- `data/tour-config.ts` (extend `TourRoom` and `Hotspot` types — additive, do not break existing fields)
- `lib/tourSettings.ts` (add `design`, `floorplan`, `googleMap`, `callToAction`, `controlBar`, `marketing`, `content`, `logo`, `popupIntro`, `viewConstraints` sub-objects — all optional)
- `app/api/tour/settings/route.ts` (accept new sub-objects)

## Risks & Mitigations
| Risk | Mitigation |
|---|---|
| Editor page grows beyond 3000 lines | Refactor to per-tab sub-components from Phase 1; introduce `components/editor/tabs/` directory |
| Supabase schema for new tables (floorplans, projects, marketing) not migrated | All new persistence writes use the same `toursRepo.ts` + `localFallback` pattern; ship with local-only first |
| Public viewer (`/xr-world/virtual-tour/page.tsx`) must consume new settings | Add incremental `useEffect` reads of new `TourSettings` sub-objects; no breaking change to existing fields |
| Font Awesome icons not in repo (only used in VTDF, not in current codebase) | Use lucide-react equivalents by default; allow raw icon string in `Hotspot.style.icon` for advanced users (render as plain text if not a known icon) |
| Multi-project model changes `viztr_active_tour` contract | Phase 12 keeps a localStorage fallback if `?tour=` is missing, so old bookmarks still work |
| Scope creep from 260 features into 12 phases | Document clearly in this plan that this is 12 incremental phases. Dollhouse/3D Builder/AI Floorplan explicitly excluded. Enterprise white-label UI is shell-only. |

## Validation Strategy
- Run `npm run lint` after each phase; 0 new errors.
- Run `npm run test -- --testPathPattern=editor` after each phase (add new Jest tests covering API routes for floorplans, projects, marketing, analytics).
- Manual smoke test after each phase: load editor, change settings, save, reload, confirm persistence; open public viewer, confirm new features render.
- For Phases 11-12 specifically: verify no regression in the existing public viewer by re-running the manual checklist from HANDOFF.md §2 Prompt 07.

## Open Decisions
- **Hosting storage backend**: VTDF says S3 self-host; current `app/api/tour/upload/route.ts` writes to local `/public/uploads`. For Phase 12, ship a stub modal that stores credentials in localStorage and shows the cost comparison, deferring actual S3 upload to a future phase.
- **AI Floorplan Maker**: Out of scope (per user). The 3-step wizard shell in Tools can be a static placeholder pointing to "Coming soon".
- **Analytics data source**: No real tracking exists. Phase 10 uses synthetic data from `/api/tour/analytics` until a real tracking layer is added.

## Estimated Phase Order (rationale)
1-3: Editor core (hotspots, scene config, viewer) — highest user value, smallest data changes
4-5: Design & component styling — extends settings, no public viewer work yet
6-7: Floorplan + Map — reuses `TourSettings`; reuses Leaflet
8: Canvas — reuses `floorPlanX/Y` already on `TourRoom`
9: Control Bar — drives the public viewer surface area
10: Marketing — bulk of the work, but isolated to settings + 1 new API
11: Content settings — last settings panel group before dashboard
12: Main dashboard — biggest new page, can be done after the editor is feature-complete
