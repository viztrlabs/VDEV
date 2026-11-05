# VizTR — Virtual Tour Editor Dashboard: 12-Phase Development Plan

Based on: consolidated 320+ feature analysis (Panoee reference) + current viztr screenshots
(media library, scene panel, hotspot editor, canvas, GSV, design/theme settings, floorplan, Google Map).

Legend: 🟢 Appears already in progress in your screenshots | ⚪ Not yet started

---

## PHASE 1 — Foundation: Project & Media Core 🟢
**Goal:** Get a user from "no tour" to "18 scenes ready to edit."
- Main dashboard shell: project list (grid/list toggle), + New Project, search/filter
- Media Library modal: Root folder, Album creation, Upload (360 Image / Flat Image)
- Grid/List view toggle, sort (name/upload time, asc/desc), search media
- Bulk select → "Create X Scenes" batch action, Deselect All
- Metadata display: thumbnail, name, size, uploaded time
- Basic auth/account shell (needed before anything persists per-user)

**Exit criteria:** User can create a project, upload a folder of panoramas, and auto-generate scenes from them.

---

## PHASE 2 — Scene Management & 360 Viewer Core 🟢
**Goal:** The actual editing surface.
- Left sidebar: scene list with thumbnails/IDs, visibility (eye) toggle, New Group/Collapse/Select/Info
- Scene context menu: Move to Group, Change Media, Show Hotspots, Delete Scene
- Bulk scene actions: Move, Delete, "X selected" indicator
- Center 360 viewer (pannellum/photo-sphere-viewer or custom WebGL)
- Mini-map (floating panorama strip + hotspot count)
- Orientation controls: Save default view, Set North, pitch/yaw/zoom readouts
- Scene config sidebar: Title, ID, Set Featured, Replace Pano, audio upload (.mp3)
- Nadir fix (Quick Fix / Custom Fix)

**Exit criteria:** User can click any scene, view it in 360°, set its default orientation, and edit its metadata.

---

## PHASE 3 — Hotspot System (Core) 🟢
**Goal:** Make scenes navigable and interactive.
- Bottom toolbar: + Hotspot / + Media / + Polygon
- 8-9 hotspot types: Point, Chevron, Image, Article, Video, Sound, Link, Compact, Product
- Hotspot config panel: Symbol / Label / Global tabs
- Symbol tab: icon picker (Font Awesome), shape, bg color, size, opacity, rotate, effect, visibility, distort
- Label tab: font, size, weight, letter-spacing, padding, border-radius, bg/text color, shadow, uppercase/italic
- Point Setup: transitioning, hide preview, view modes (360Flat/Thumbnail/Upload)
- Copy / Revert / Delete actions per hotspot
- Polygon-specific hotspot (custom shape drawing)

**Exit criteria:** User can drop any hotspot type onto a scene, link scenes via navigation hotspots, and fully restyle each hotspot.

---

## PHASE 4 — Canvas / Tour Map View 🟢
**Goal:** Visual, spatial way to manage scene connections at scale.
- Canvas mode: drag-and-drop scene cards to arrange tour flow
- Auto arrange, Auto-link by GPS, Save Layout
- Canvas quick actions: space+drag pan, right-click context menu, quick-action tooltip overlay
- Object 360 Creator (product-spin sequences: folder select, prefix, extension, filename length, live preview)

**Exit criteria:** User can visually see and rearrange the entire tour graph, not just scene-by-scene.

---

## PHASE 5 — Design & Theming 🟢
**Goal:** Brand consistency across the published tour.
- Design settings sidebar: Theme, Hotspot, Polygon, Popup, Floorplan, Googlemap, Form, Call To Action, Control Bar, Dollhouse
- Theme presets (Default, Default 2.0, Solid, Wall, Base, Folio, Blank)
- Primary/Text color pickers (with opacity), Primary/Secondary font selectors
- Display toggles: hide project title, hide scene title (card/global), auto-open scene list
- Polygon setup (bg/border colors incl. hover states, border width)
- Popup setup (bg/text color)
- Form setup (layout: dialog/panel, position, bg/overlay color)
- Call To Action setup (layout: bubble/list, position, offsets)
- Control Bar: 25+ togglable items (sound, autorotate, home, VR, fullscreen, map, dollhouse, etc.) with per-item icon/category/hide

**Exit criteria:** User can fully re-skin the published viewer UI without touching code.

---

## PHASE 6 — Content Settings 🟢/⚪
**Goal:** Tour-wide metadata, constraints, and branding assets.
- Left nav: Content / Effect / View / Logo / Popup Intro / Collaboration / System
- View settings: limit view (T/B/L/R), zoom limit (min/max slider), mobile zoom limit, Save All
- Logo setup: enable, image, width, redirect URL, position (top L/C/R)
- Popup Intro: Image mode / Video mode / Description-tour mode, auto-close timing, translatable close text
- Description Tour, Initial Scene selector, Category dropdown
- Background sound: upload/type/delete + volume slider
- Nadir toggle (global), Copyright block (link, author, description, QR code) + premium upsell banner
- Multi-language toggle + List Language / List Translation management

**Exit criteria:** Tour-level defaults and legal/branding metadata are fully configurable.

---

## PHASE 7 — Floorplan, Google Map & GSV 🟢
**Goal:** Spatial navigation beyond scene-to-scene hotspots.
- Floorplan creator: publish/draft, name, image upload
- Floorplan 2D editor: Draw/Edit/Assist/History/View/Actions toolbar, layers panel, draft summary (walls/rooms/markers), source image scale/opacity, marquee select, snap
- Floorplan display settings: show on start, layout (box/panel), position, radar (enabled/color/border/width), marker (color/border)
- Google Map integration: enabled, map/satellite/terrain, layout/position, radar, marker (image/active-state/width), address search
- Google Street View (GSV): lat/lng, floor name, GSV ID/URL/thumbnail, sync from GSV, anchor↔target connections, distance between scenes, align location, location-permission handling

**Exit criteria:** User can drop pins on a real floorplan or Google Map and connect them to matching 360° scenes.

---

## PHASE 8 — Content Management & Lead Capture ⚪
**Goal:** Turn the tour into a business tool, not just a viewer.
- Content management sidebar: Posts, Products, Floorplan, Forms (with count badges), search/add
- Form Capture (lead gen): publish/draft, title, description, button text, dynamic fields (+Add Field)
- Google Sheet ID integration + OAuth "Grant Permission" flow
- Product hotspot → product catalog linkage (name, price, buy link)
- Article/Post content editor for info hotspots

**Exit criteria:** Tours can capture leads and showcase products, not just navigate rooms.

---

## PHASE 9 — Marketing Suite ⚪
**Goal:** Distribution, measurement, and optimization tools.
- Marketing → Forms Configuration: multiple form configs, event type (project/scene/hotspot), scene selector, wait time, closeable toggle
- Analytics dashboard: date range filter, unique visitors/total visits/page views/time-on-page, visits line chart, top pages/sources/countries/devices tables
- SEO module: favicon, meta title/description, GA integration (UA & G format), SEO image generator, live SEO preview, "optimize suggestions" nudges
- Script Chats: custom HTML/JS injection (multiple entries, add/update/delete)
- Snapshot: watermark toggle, custom watermark upload, change/reset

**Exit criteria:** Owners can see who's viewing their tour, tune SEO, and inject 3rd-party scripts (chat widgets, pixels).

---

## PHASE 10 — Dollhouse & 3D / AI Tools ⚪
**Goal:** Differentiated, higher-effort premium features.
- Dollhouse basic: enable toggle, bg color, hotspot color
- 3D Model Builder wizard: set vertical point (floor/ceiling click) → draw (polygon/rect, union/subtract, rotation slider) → preview/render (progress bar, model stats) → save
- Dollhouse 3D Assembly: select model → move/rotate/scale in 3D space → match heights/align floors → publish
- AI Floorplan Maker: upload 2D floorplan → configure (output type, perspective, rendering style, color scheme, detail level, background, extra options) → editable AI prompt preview → generate

**Exit criteria:** User can go from flat panoramas to an interactive 3D dollhouse and AI-generated floorplan render.

---

## PHASE 11 — Collaboration, Hosting & System Tools ⚪
**Goal:** Team workflows, storage flexibility, and reliability.
- Collaboration: enable, comment counts (total/resolved/unresolved), sharing (anyone/restricted), shareable collab URL (copy/open)
- System → Storage & Recovery: archived-image status, restore button, refresh status
- Hosting: Self-hosted (AWS S3 credential form: region/key/secret/bucket) vs Panoee-Cloud-style managed storage
- Cost calculator (storage slider vs provider comparison table) — optional marketing/trust page
- In-app virtual assistant / support widget (ask a question, share idea, request collab, submit ticket)

**Exit criteria:** Teams can collaborate on one tour, and users can choose/manage where their media is stored.

---

## PHASE 12 — Platform, Monetization & Enterprise ⚪
**Goal:** Business layer around the editor itself.
- Main dashboard polish: trial badge, language selector, avatar/profile menu, project table view w/ actions (edit/view/share/delete)
- Subscriptions & billing: plan tiers, storage add-on packages, invoices, payment method management
- Affiliate program: referral link, stats (visitors/leads/conversions/earnings), payout settings
- Portfolio builder (optional, for agencies/photographers reselling tours): profile, style presets, collections, menu
- Enterprise/white-label: custom domain + DNS verification, branding (logo/colors/favicon), studio & tour URL branding, locked-until-upgrade gating
- Promotions module: in-app offers (review-for-discount, referral incentives)

**Exit criteria:** viztr is a sellable SaaS product with tiered plans, not just a tool.

---

## Suggested Sequencing Notes
- **Phases 1–4 are your MVP.** Nothing else matters until upload → scene → hotspot → publish works end-to-end.
- **Phases 5–7** are what make it feel "professional" (branding + spatial navigation) — this is likely where most competitive comparison with Panoee happens.
- **Phases 8–9** turn it into a business tool (leads, analytics) — prioritize based on your target customer (real estate agents care about leads; hospitality cares about analytics).
- **Phase 10** is the most expensive to build (3D/AI) — treat as a differentiator to build once the core is solid, not a blocker.
- **Phases 11–12** can run in parallel with 8–10 since they're mostly infrastructure/business, not tour-editing UX.

Once you send the next 3 sets of reference images, I'll cross-check them against this plan and flag anything that needs a new phase or should move between phases (e.g., if the screenshots reveal an AI feature you want earlier, or a simpler MVP scope than 320 features implies).

---

## 🔄 SET 2 CROSS-CHECK (20 images received)

No new phases needed — everything in this set slots directly into Phases 5, 7, 9, and 10. What's new is **exact field-level detail**, and a clear signal on **build status**: the UI shells exist, but most are still empty-state/unwired (0 forms, "No shapes yet," "No source image," all-zero analytics, "No model saved for this scene"). Treat this set as **spec-confirmation**, not new scope.

### → Phase 5 (Design & Theming) — confirmed & detailed
- **Form Setup**: Layout dropdown is **Dialog | Panel**; Panel adds a **Position (Left/Right)** field that Dialog doesn't show — conditional field, not two separate settings.
- **Call To Action Setup**: Layout **Bubble | List**; Position **Left | Right**; offset field is **conditional by side** — "Offset Left" only appears when Position=Left, "Offset Right" + "Offset Bottom" appear when Position=Right. Build this as one offset object `{side, offsetX, offsetBottom}`, not 3 static inputs.
- **Control Bar**: Full 24-row table confirmed (Floorplan, tour/scene sound on/off, auto-rotate on/off, Home, auto-change-scene on/off, View mode, Multi-Staging, Gyro, VR, Full screen, Map, Info of Scene, Info of Tour, Group Auto Play, 3 view-mode variants, Snapshot, Multi-Language, Dollhouse). Each row = same 3-column shape: **Category (dropdown, currently always "Icon") | Source (icon picker, Font Awesome "far fa-*" string) | Hide (toggle)**. This is a single reusable `ControlBarItemRow` component driven by a config array — don't hand-build 24 rows.
- **Dollhouse (basic, under Design)**: Just 3 fields — Enabled toggle, Background color, Hotspot color. Trivial; bundle with Phase 5, not Phase 10.

### → Phase 7 (Floorplan & Map) — confirmed
- Google Map panel screenshot re-confirms Map/Radar/Marker structure from Set 1 exactly — no new fields.
- **Floorplan 2D Editor** (`22_floor_plan.PNG`) gives the real toolbar grouping: **Draw | Edit | Assist | History | View | Actions**, a **Layers** panel (currently "0"), a **Draft summary** (walls/rooms/markers counts), a **Source image** block (Select image, Scale slider, Opacity slider, Show on canvas toggle), and a **Getting Started** 5-step tooltip. Also shows a live **"Select & move"** tooltip with the actual interaction rules (marquee select, drag handles, shift-snap, right-click context menu, Esc to cancel) — build this as an actual onboarding tooltip component, not just documentation.
- Note: this screenshot shows **"No source image" / "0 walls · 0 rooms · 0 markers"** — confirms the floorplan editor shell exists but drawing logic isn't wired yet in your build.

### → Phase 9 (Marketing Suite) — confirmed, all currently empty-state
- **SEO Onpage**: Favicon upload, Meta data (single "title" field — not split title/description into two top-level fields, description is its own textarea below), Google Analytics **UA-XXXXXXXXXX-YY OR G-XXXXXXXXXX** (mutually exclusive — build as one field with format auto-detection/validation, not two independent inputs), SEO image preview card (Create/Change/Reset).
- **Forms Configuration**: Confirmed repeatable "Form Config N" blocks — Closeable toggle, Select Form dropdown, Event type (**project | Scene | Hotspot** segmented control), conditional **Select Scene** dropdown (only when Event type = Scene), Wait Time (seconds), Remove button per block, "Add Form Config" to append more. Build as an array of config objects, each independently removable.
- **Analytics dashboard**: Confirmed shell — date range picker, 5 metric counters (Unique Visitor / Total Visits / Total Page Views / Time On Page / Visit Duration), one line chart (daily buckets, currently flat at 0), and 4 identical-shape tables (Top Pages / Top Sources / Top Countries / Top Devices — same 3-column layout: label | Visitors | Views). Build the 4 tables from one reusable `TopStatsTable` component.
- **Script Chats**: Two-column HTML + Script textareas per entry, **Add field** to append more pairs, single **Update** button commits all, delete (trash icon) per row. This is arbitrary code injection — flag for CSP/sandboxing review before wiring live (this is the one area to treat as a security-sensitive feature, not just a form).
- **Snapshot**: Just Hide-watermark toggle + watermark image (Change/Reset). Simple — bundle into the same sprint as SEO.

### → Phase 10 (Dollhouse & 3D) — confirmed, most detailed set yet
- **3D Model Builder wizard**, all 4 steps now visible end-to-end:
  1. *Set vertical point* — literally "double-click floor point, double-click ceiling point" (screenshot shows the cyan dot marker mid-click)
  2. *Draw* — Surface (Ceiling/Floor), Type (Polygon/Rectangle), Operation (Union/Subtract), rotation slider (0–360° + Auto), yellow alignment grid overlay, Undo/Back/Confirm top bar
  3. *Preview Model* — cyan wireframe cube overlaid on the panorama, Render Progress bar (100%, "6/6 surfaces"), full stats block (Polygon points, Surface total, Floor/Roof, Wall surfaces, Texture images, Texture approx KB, Render duration, Texture bake time), Download Textures .zip
  4. *Model Saved* — confirmation state; note top bar swaps Confirm→**Clear (red) / Save (blue)** once a model draft exists
- **3D Assembly wizard** (separate from the per-scene builder above — this is the *multi-room* stitching step): Select a model → Move in 3D space → Publish. Edit Type **Move(W)/Rotate(E)/Scale(R)**, tools **Match All Models Height** / **Align All Models To Same Floor**, View toggles **Show Outline / Show Grid**, ends with **Publish Dollhouse** button → **"Ready To View"** confirmation state.
- Confirms these are genuinely two distinct sub-phases within Phase 10: (a) per-scene 3D reconstruction, (b) cross-scene assembly into one dollhouse. Sequence accordingly — (a) must fully work before (b) has anything to assemble.
- Screenshots also show a **404 "Coordinates Not Found"** custom error state for the 3D assembly view when no model exists yet — worth reusing that pattern (branded 404) elsewhere in viztr rather than a generic error.

### Build-status signal worth flagging
Several of these screens are visibly **unwired placeholders** in your current build (Forms count "0", Script Chats empty, Analytics all-zero, Floorplan "No source image," Dollhouse "No model saved for this scene"). That's expected at this stage, but it confirms Phases 9–10 are UI-first / logic-second in your current build order — worth deciding now whether that's intentional (ship UI shells → wire data later) or whether backend should lead UI for these specific modules.

**Waiting on Set 3 of 3** to finish the cross-check.

---

## 🔄 SET 3 CROSS-CHECK (20 images received) — FINAL SET

This closes the loop. No new phases required here either — but two structural refinements fall out of this set (flagged below with ⚠️), and Phases 6, 9, 11, and 12 are now fully spec'd at the field level.

### → Phase 6 (Content Settings) — now fully specified
- **Content tab** (left nav: Content/Effect/View/Logo/Popup Intro/Collaboration/System) confirms the exact grouping from the plan. New detail: the **"Generate SEO image"** button lives inside Content → Config, not only under Marketing → SEO — build it as one shared action wired to both locations, not two separate features.
- **Multi-language**: simple top-level Enabled/Disabled toggle at the Content root (separate from the more detailed List Language/List Translation screens confirmed in Set 1's Phase 6 entry).
- **View**: confirms Limit View has a **per-field remove (×)** next to Top/Bottom/Left/Right — meaning each edge is independently unset-able, not just numeric. Zoom limit is a **dual-handle slider** bound to Min/Max number inputs with their own × resets. "Save all" is a single explicit commit button — don't auto-save this panel.
- **Logo**: Enabled toggle, Set Image, Width(px), Redirect to (URL), Position **Top Left | Top Center | Top Right** (3-way, not 2-way as might be assumed).
- **Popup Intro**: Category is a 3-way switch **Image | Video | Description Tour**, and each branch has genuinely different fields:
  - *Image*: Image(Desktop) + Image(Mobile) uploads, Auto-close toggle, Time Auto Close (sec), Text close (translatable)
  - *Video*: Video(Desktop) + Video(Mobile), **Mute** toggle (video-only field), Auto-close, Time Auto Close, Text close
  - *Description Tour*: Description Tour dropdown + Mode **Fullscreen | Modal**
  Build this as one component with a discriminated-union config shape (`category: 'image'|'video'|'description'`), not three parallel forms.

### → Phase 9 (Marketing Suite) — one addition
- **SEO Preview widget**: this is NOT just the Marketing→SEO tab from Set 2 — it's also a **floating inline panel inside the Tour Editor itself** (top-right, alongside the Scene/Hotspot/Location tabs), showing a live search-style preview card plus a **"3 Optimize suggestion"** checklist (e.g. "Update SEO Title & Description," "Copyright need more customized," "You might need better slug"). This is an actionable nudge system, not a passive preview — each suggestion is clickable and presumably deep-links into the relevant settings panel. Worth building as a small rules engine (checks: has custom title? has custom copyright? has custom slug?) rather than hardcoded text.

### → Phase 11 (Collaboration, Hosting & System) — now fully specified
- **Collaboration setup**: Enabled toggle, 3 counters (Comments/Resolved/Unresolved — all read-only, populated from actual comment data), Sharing **Anyone | Restricted** radio, and a generated collaboration URL (`tour.panoee.net/collaboration?tour={id}`) with copy + open-in-new icons.
- **System → Storage & Recovery**: confirms exact copy/flow — status card ("Archived Images... Status: Ready to restore"), **Restore archived images** primary action, **Refresh status** secondary action, plus a note that status may need manual refresh (i.e., this is backed by an async job, not a synchronous call — build with polling or a manual refresh, not a blocking spinner).
- **Panoee Virtual Assistant** (in-app support widget): confirmed as exactly 4 entry points — **Ask about Panoee** (features/tutorials/roadmap/quick help), **Share an idea** (features/improvements/possibilities), **Ask for collaboration** (agencies/affiliates/tech partners), **Submit an account ticket** (login/billing/account issues). Build as a simple router to 4 destinations (help docs search, feedback form, partnerships form, support ticket form) rather than one generic contact form — the routing itself is the UX value.
- **Hosting** (`Tools → Hosting`): full page confirmed — "100x cheaper" pitch, cost-comparison table (Hostinger/GoDaddy/Wix/Linode/Pano2VR Cloud/3DVista Cloud/**AWS S3**) driven by a 1–90 GB slider, 3-step guide (Create AWS Credential → Connect Storage → Upload Tours), and a **Select Hosting Method** modal with **Self-hosted | Panoee Cloud** tabs — self-hosted form = Region, AWS Key, Secret key (masked, toggle-visible), Bucket Name. Copy explicitly promises the key "is stored locally on your browser and never sent anywhere else" — if you replicate this claim, the implementation must actually match it (client-side-only storage, e.g. encrypted localStorage, not a silent server round-trip).

### → Phase 10 (Dollhouse & 3D) — AI Floorplan Maker fully specified
- **Floorplan Maker** (`Tools → Floorplan Maker`, separate top-level tool, not buried in per-project settings): 3-step flow **Select 2D Floorplan → Configure Style → Generate Floorplan**.
- Input panel fields: Select Floorplan Image (from Media Library), **Output type** (e.g. 3D Floorplan), **Perspective** (e.g. Isometric), **Rendering style** (e.g. Photorealistic), **Color scheme** (e.g. Modern Interior), **Detail level** (e.g. High), **Background** (e.g. White Background), plus **Extra options** checkboxes: Room labels/dimensions, Indoor decor, Sims/RPG style, Realistic furniture (default on), Natural shadows (default on), Professional CAD.
- **Prompt Preview panel**: a live, human-readable generated prompt assembled from the above fields (shown editable-style) — confirms this feature is literally a structured-form-to-LLM-image-prompt builder. Build the prompt as a template string interpolating the form state; showing it live in the UI (rather than hiding it) is itself a trust/transparency feature worth keeping.
- **Generated Result panel**: simple placeholder → output image once generated.

### → Phase 12 (Platform & Enterprise) — now fully specified
- **Main dashboard** confirmed in both grid and list view: top nav **Project | Media | Tools ▾ | Promotion | Enterprise**, trial countdown badge ("7d 9m Trial left"), language selector, **+ New Project**, avatar menu. Grid card: 360° badge, thumbnail, project name, author, image count, status pill (Published/Draft), relative modified time. **List view** adds a proper table: Project Name | Type | Status | Modified date | **Actions** (edit / preview / duplicate / delete icons) — build list view as the "power user" mode, grid as default.
- ⚠️ **Global Media Library** (top-nav "Media") is a **separate, cross-project surface** from the per-project Media Library modal seen in Set 1 (Phase 1) — same Root/Album/Upload/grid-list pattern, but scoped to Pano vs Asset tabs instead of 360/Flat, with Move/Download/Delete bulk actions and Filter/Sort controls. **Action item: split Phase 1** into "1a — Per-project media picker" (modal, scoped to one tour) and "1b — Global media library" (top-nav page, spans all projects) — they likely share a component but need separate data scoping (project_id filter vs none).
- **Enterprise → White Label**: gated behind an "Upgrade Now" banner (confirms tiered plan gating pattern to reuse elsewhere). Branding form: Name, Title, Description, Studio URL + Tour URL each with **DNS A-record verification** ("Point both A records to `18.142.178.243` before verification" + Verify your domain button + per-field verified/not-verified status), Primary color, Logo, SEO Image, Favicon, Save changes. Sidebar also lists **Users** and **Default Setup** as sibling Enterprise sections (not detailed in screenshots, but confirms Phase 12 needs a Users/roles page and a tenant-default-config page alongside White Label).

### Final Notes Across All 3 Sets
1. **No 13th phase needed.** Every screenshot across all 60 images maps cleanly into the original 12 phases — the plan structure holds.
2. **Two scope splits worth making before you start building:**
   - Split Phase 1 into 1a (per-project picker) / 1b (global library) as noted above.
   - Within Phase 10, keep AI Floorplan Maker and the 3D Model Builder/Assembly wizards as clearly separate epics — they share the "Phase 10 — differentiator" label but have zero code overlap (one is a form→AI-image pipeline, the other is a 3D-from-panorama reconstruction pipeline).
3. **Security flag carried over from Set 2** stands: Script Chats (raw HTML/JS injection) needs a CSP/sandboxing decision before Phase 9 ships live, not after.
4. **Build-status pattern held across all 60 images**: your own viztr screenshots show UI-first development (many empty states: "0 shapes," "0 walls," all-zero analytics, "No model saved," gated Enterprise). This is a reasonable and common approach (ship the shell, wire data after), but worth explicitly deciding per-phase in sprint planning so "UI done" isn't mistaken for "phase done" in status tracking.

This roadmap is now fully cross-checked against all 3 reference sets and ready to drive sprint planning.
