# Virtual Tour Enhancement Roadmap

**Scope:** Marzipano-based 360° virtual tour platform  
**Objective:** Close the 12-feature implementation gap while maintaining backward compatibility for all existing tours, viewers, and editor workflows.  
**Constraints:** No breaking changes to existing API contracts, data models, or public routes. All new features are additive.

---

## Current State Summary

The codebase contains **two parallel virtual tour stacks**:

1. **Legacy XR World stack** (`components/xr/`) — Marzipano-based `TourViewer.tsx` + `MarzipanoViewer.tsx` adapter
2. **New Virtual Tour stack** (`app/xr-world/virtual-tour/` + `components/viewers/PanoramaViewer.tsx`) — **Three.js-based** viewer (despite planning docs citing Marzipano)

The active public viewer is `PanoramaViewer.tsx` (Three.js, 1400+ lines, monolithic). The Marzipano viewer is only used in the editor preview and legacy XR paths.

**Feature coverage vs. 44-feature spec:** 32 fully implemented, 5 partial, 7 missing.

---

## Phase 0 — Stabilization (Week 1–2)

**Goal:** Establish a single, maintainable viewer stack and clean up architectural debt before adding features.

### Step 1: Unify viewer stack
- **Decision gate:** Choose either Three.js or Marzipano as the primary viewer runtime.
  - **Option A — Keep Three.js:** Retire Marzipano dependency from the public path; keep `PanoramaViewer.tsx` as the canonical viewer; remove dead tile-pyramid code.
  - **Option B — Migrate to Marzipano:** Replace `PanoramaViewer.tsx` internals with `Marzipano.Source.fromImage`; keep Three.js only for View Modes dollhouse.
- **Backward compatibility:** Both options preserve existing tour URLs (`?scene=`), localStorage keys, and API responses. Choose based on team preference for Marzipano-native hotspot/tile features vs. existing Three.js animation work.

### Step 2: Break up PanoramaViewer monolith
- Extract sub-components: `HotspotLayer`, `ControlBar`, `ShareDialog`, `SearchPanel`, `PreferencesPanel`, `FloorPlanOverlay`.
- Extract hooks: `usePanoramaPreloader`, `useAutorotate`, `useFullscreen`, `useTourNavigation`.
- **Impact:** No public API change; only internal file structure. Reduces merge conflicts and improves testability.

### Step 3: Synchronize state systems
- Bridge `useWebXRStore` (XR layer) with `useTourStore` / `useEditorStore` (tour layer) via a shared `TourDataContext`.
- Ensure scene/hotspot edits in the editor immediately reflect in the viewer without manual data copying.
- **Backward compatibility:** Existing stores remain functional; new context is additive.

---

## Phase 1 — Core MVP Gap Fill (Week 3–6)

**Goal:** Implement the 7 fully missing features from the spec.

### Feature 6: Multi-Level Floor Navigation
- **Files to modify:** `lib/tourClientStore.ts`, `components/viewers/PanoramaViewer.tsx`, `app/api/tour/route.ts`
- **Data model:** Extend `TourRoom` with `floorLevel: number` (default 1). Extend tour config with `floors: Floor[]` where `Floor = { id, name, level, sceneIds[] }`.
- **UI:** Floor switcher dropdown in control bar; floor plan overlay shows only scenes on selected floor.
- **Backward compatibility:** `floorLevel` is optional; existing rooms default to floor 1. Existing tours without `floors` array show a single implicit floor.

### Feature 9: Measurement Tool
- **Files to create:** `components/viewers/MeasurementTool.tsx`, `lib/measurement.ts`
- **Implementation:** Two-click distance measurement on the panorama sphere. Convert yaw/pitch deltas to approximate real-world units using a configurable `scaleMetersPerUnit` on the tour config.
- **UI:** Toggle button in control bar; measurement line with distance label; clear button.
- **Backward compatibility:** Opt-in via `TourSettings.measurementEnabled = false` by default.

### Feature 14: Photo Galleries per Room
- **Files to modify:** `data/tour-config.ts`, `lib/tourStore.ts`, `app/api/tour/media`
- **Data model:** Add `gallery: TourGallery[]` to `TourRoom` where `TourGallery = { id, images: { url, caption, thumbnail }[] }`.
- **UI:** Gallery hotspot type (`image_overlay` extended) or dedicated gallery panel accessible from room info.
- **API:** New `POST /api/tour/galleries` and `GET /api/tour/galleries?roomId=` endpoints.
- **Backward compatibility:** Existing rooms without `gallery` field show no gallery UI.

### Feature 16: Timeline/Sweep
- **Files to create:** `components/viewers/TimelineSweep.tsx`
- **Implementation:** Visual timeline scrubber at bottom of viewer showing waypoints from `tourCollaboration.ts`. Play/pause advances through waypoints with `dwell_seconds` delays.
- **Data:** Reuses existing `Waypoint` type; no schema change.
- **Backward compatibility:** Only visible when `TourSettings.timelineEnabled = true`.

### Feature 22: Responsive Hamburger Menu
- **Files to modify:** `components/viewers/PanoramaViewer.tsx`
- **UI:** Mobile-only bottom-sheet or slide-out menu containing: scene list, floor selector, share button, settings toggle.
- **Trigger:** Hamburger icon appears at `< md` breakpoint; replaces desktop top-bar layout.
- **Backward compatibility:** Desktop layout unchanged; new mobile menu is additive.

### Feature 32: Photo Gallery Manager (Admin)
- **Files to create:** `app/xr-world/virtual-tour/editor-dashboard/gallery-manager/`, `components/admin/GalleryManager.tsx`
- **Implementation:** CRUD for room galleries; drag-drop image upload; reorder; caption editing.
- **API:** `POST /api/tour/galleries`, `PUT /api/tour/galleries/{id}`, `DELETE /api/tour/galleries/{id}`.
- **Backward compatibility:** Existing tours without galleries are unaffected.

### Feature 33: Menu Builder (Admin)
- **Files to modify:** `lib/editorStore.ts`, `app/xr-world/virtual-tour/editor-dashboard/`
- **Implementation:** Visual reorderer for control-bar items (play/pause, arrows, floorplan, share, fullscreen, measurement, gallery). Toggle visibility per item.
- **Data model:** Add `controlBarOrder: string[]` and `controlBarVisibility: Record<string, boolean>` to `VtedSettings`.
- **Backward compatibility:** Default order matches current hardcoded order; existing settings without these fields use defaults.

---

## Phase 2 — Enhanced Experience (Week 7–10)

**Goal:** Complete the 5 partial features and add missing social sharing.

### Feature 8: View Modes (Full Hybrid)
- **Files to modify:** `components/xr/ModeManager.tsx`, `components/viewers/PanoramaViewer.tsx`
- **Implementation:** Unhide the existing dollhouse icon/route; wire `ModeManager` to toggle between Marzipano/Three.js panorama and Babylon.js `PhotoDome` dollhouse. Share camera position via `tour-config.json`.
- **Backward compatibility:** Default mode remains panorama; dollhouse is opt-in per tour.

### Feature 19: Social Sharing Buttons
- **Files to modify:** `components/viewers/PanoramaViewer.tsx`
- **Implementation:** Add Twitter/X, Facebook, LinkedIn, WhatsApp share buttons alongside existing clipboard copy. Use `navigator.share` on mobile, fallback to `window.open` share URLs.
- **Backward compatibility:** Existing copy-URL behavior preserved; new buttons are additive.

### Feature 31: Floor Plan Visual Editor
- **Files to modify:** `app/xr-world/virtual-tour/editor-dashboard/floorplan-manager/`
- **Implementation:** 2D canvas where admin can drag room markers, draw walls, set door positions. Persist to `VtedFloorplan.aiData`.
- **Dependencies:** Reuse existing `CanvasTab` component pattern.
- **Backward compatibility:** Existing floorplan upload flow unchanged; visual editor is an advanced mode.

### Feature 37: Analytics Dashboard with Heatmaps
- **Files to create:** `app/xr-world/virtual-tour/dashboard/analytics/`, `app/api/tour/analytics/heatmap`
- **Implementation:** Replace synthetic data in `/api/tour/analytics` with real event tracking (room dwell time, hotspot clicks, navigation paths). Add per-room heatmap overlay on floor plan.
- **Backward compatibility:** `/api/tour/analytics` still returns same shape; `heatmap` is a new optional sub-resource.

### Feature 43: Asset CDN/Caching
- **Files to modify:** `app/api/tour/upload/route.ts`, `next.config.ts`
- **Implementation:** Configure `images.remotePatterns` for CDN origins; add `Cache-Control` headers to `/api/tour/media`; integrate Cloudflare R2 signed URLs for tile serving.
- **Backward compatibility:** Existing `/public/tour/` serving continues; CDN is used only when `TourSettings.cdnEnabled = true`.

---

## Phase 3 — Advanced Features (Week 11–12)

**Goal:** Polish, performance, and white-label readiness.

### Performance: Use tile pyramids in active viewer
- Wire `PanoramaViewer.tsx` to load `tileUrl` from tour config instead of full-res equirect. Fallback to full-res when `tileUrl` is absent.
- **Backward compatibility:** Existing tours without `tileUrl` continue loading full-res.

### Performance: Service worker for offline caching
- Add `public/sw.js` to cache panorama tiles and static assets. Register in `PanoramaViewer.tsx`.
- **Backward compatibility:** Online behavior unchanged; offline is opt-in.

### White-label preparation
- Extract all `#3ECF8E` color literals in tour components to CSS custom properties (`--tour-accent`, `--tour-bg`, etc.).
- Parameterize `"VizTR Virtual Tour"` strings via `TourSettings.brand.title`.
- Scope localStorage keys: `viztr-tour-{tourId}-preferences`.
- **Backward compatibility:** Default values match current VizTR branding; no visual change unless explicitly configured.

---

## Phase 4 — White-Label & Branding (Week 13–16)

**Goal:** Make the virtual tour fully white-labelable for client-branded deployments.

### Brand injection system
- **Files to create:** `lib/tour-branding.ts`, `components/tour/BrandProvider.tsx`
- **Implementation:**
  - `BrandProvider` reads `TourSettings.brand` and injects CSS variables into `:root` or a scoped container.
  - Supported fields: `title`, `logoUrl`, `accentColor`, `fontFamily`, `backgroundColor`, `textColor`, `socialLinks`.
  - All tour components read colors from CSS variables instead of hardcoded Tailwind classes.

### CSS variable migration
- Replace all `#3ECF8E`, `#18181B`, `#27272A`, `#09090B` in `PanoramaViewer.tsx`, `HotspotLayer.tsx`, `ControlBar.tsx` with `var(--tour-accent)`, `var(--tour-bg)`, etc.
- Provide fallback values matching current VizTR theme.

### Per-tenant config loading
- **Files to modify:** `app/xr-world/virtual-tour/[tourId]/page.tsx`
- **Implementation:** Fetch `TourSettings` server-side, inject brand config as JSON into page props, hydrate `BrandProvider` client-side.
- **Backward compatibility:** Tours without brand config use VizTR defaults.

### Email/SEO/analytics white-label
- Replace hardcoded `viztr.com` in SEO metadata, Open Graph tags, and email templates with `TourSettings.brand.domain`.
- Replace Google Analytics ID with `TourSettings.brand.analyticsId`.

---

## Testing Strategy

| Phase | Test Type | Coverage |
|-------|-----------|----------|
| 0 | Unit | Store synchronization, component extraction regressions |
| 1 | Integration | New API endpoints (galleries, measurements), UI e2e per feature |
| 2 | E2E | View mode switching, social share flows, analytics accuracy |
| 3 | Performance | Tile pyramid loading, service worker caching, Lighthouse |
| 4 | Visual regression | Brand theme switching, CSS variable overrides |

All tests must pass against existing tour fixtures (`data/tour-config.ts`, `.data/tour/local-tour.json`) to confirm backward compatibility.

---

## Rollback Plan

- Each phase is gated by feature flags in `TourSettings.features`.
- Disabling a feature flag reverts to pre-phase behavior without data loss.
- Database migrations (if any) are additive columns with nullable defaults.
- API versions remain `/api/tour/*`; no breaking changes to request/response shapes.
