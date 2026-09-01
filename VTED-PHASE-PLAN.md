# Virtual Tour Editor Dashboard (VTED) — 12-Phase Development Plan

> Based on comprehensive analysis of 162+ features from Panoee reference platform
> Reference images location: `C:\Users\Arch_Viz\Pictures\panoee`

---

## Executive Summary

This document outlines a 12-phase development plan for building a professional-grade Virtual Tour Editor Dashboard. The plan progresses from core infrastructure to advanced features, ensuring each phase builds upon the previous one and delivers incremental value.

**Total Estimated Duration:** 24-32 weeks (6-8 months)
**Technology Stack Recommendation:** Next.js + TypeScript + Three.js + WebGL + Canvas API

---

## Phase 1: Foundation & Core Infrastructure
**Duration:** 2-3 weeks
**Priority:** Critical

### Objectives
- Establish project architecture and development environment
- Build authentication and project management foundation
- Create the main dashboard layout and navigation

### Features to Implement

#### 1.1 Project Setup
- Next.js 14+ with App Router and TypeScript
- Tailwind CSS + shadcn/ui component library
- State management (Zustand or Jotai)
- API layer setup (tRPC or REST)
- Database schema (PostgreSQL + Prisma/Drizzle)

#### 1.2 Authentication System
- User registration/login (email + OAuth)
- Session management
- Role-based access control (Owner, Editor, Viewer)

#### 1.3 Main Dashboard (Feature #141-149)
- Top navigation: Project, Media, Tools, Promotion, Enterprise
- Trial badge with countdown
- Language selector (i18n setup)
- + New Project button
- User avatar/profile dropdown
- Grid/List view toggle for projects
- Filter dropdown (All, Published, Draft)
- Search bar
- Project cards with:
  - 360° preview image with "CLICK TO VIEW IN 360" overlay
  - Author name
  - Scene count
  - Published status badge
  - Project name
  - Last modified timestamp

#### 1.4 Project List View - Table Format (Feature #150)
- Columns: Project Name, Type (badge), Status, Modified date, Actions
- Sortable columns
- Row actions: Edit, View, Share, Delete

### Deliverables
- Working authentication flow
- Dashboard with project CRUD
- Responsive layout (desktop + tablet)
- Database migrations complete

---

## Phase 2: Media Library & Asset Management
**Duration:** 2-3 weeks
**Priority:** Critical

### Objectives
- Build the media upload and management system
- Implement file storage (AWS S3 or local)
- Create the album/folder structure

### Features to Implement

#### 2.1 Media Library Modal (Features #1-7)
- Album Management:
  - Create new albums ("+ Album")
  - Navigate folder structures ("Root" breadcrumb)
  - Search albums
- File Upload:
  - Dedicated upload button
  - Support "360 Image" and "Flat Image" types
  - Drag-and-drop upload zone
  - Upload progress indicator
- View Modes:
  - Grid View (large thumbnails with selection checkbox)
  - List View (detailed table: Thumbnail, Name, File Type, Size, Uploaded Time)
- Sorting & Filtering:
  - Order by: Upload time, Name, Size
  - Order direction: Descending/Ascending
  - Search media by name
- Bulk Actions:
  - Select multiple files (checkboxes)
  - "Deselect All" button
  - "Create [X] Scenes" button (batch scene creation)
- Metadata Display: Thumbnail, Name, File Type (image/jpeg), Size (MB), Uploaded Time/Date

#### 2.2 Storage Integration (Feature #147)
- AWS S3 credential setup modal
- Self-hosted vs Panoee Cloud options
- Region selection
- Bucket configuration
- Cost comparison calculator display

#### 2.3 Image Processing Pipeline
- Thumbnail generation (multiple sizes)
- 360° image metadata extraction
- EXIF data parsing
- Image validation (format, size limits)

### Deliverables
- Functional media library modal
- S3/Cloud storage integration
- Image upload with progress
- Thumbnail generation pipeline

---

## Phase 3: 360° Viewer Core
**Duration:** 3-4 weeks
**Priority:** Critical

### Objectives
- Build the panoramic image viewer
- Implement basic navigation controls
- Create scene switching functionality

### Features to Implement

#### 3.1 Panoramic Viewer Engine
- Three.js/WebGL-based 360° renderer
- Equirectangular image support
- Smooth panning (mouse drag, touch swipe)
- Gyroscope support for mobile
- Auto-rotation option

#### 3.2 Viewer Controls
- **Orientation Controls:**
  - Save default view button
  - Set North (0°) button
  - Angle indicators (Pitch/Yaw/Roll display)
- **Zoom Controls:**
  - Mouse wheel zoom
  - Pinch-to-zoom (mobile)
  - Zoom limits (Min/Max)
  - Mobile zoom limit toggle
- **View Constraints (Features #117-120):**
  - Limit View: Top/Bottom/Left/Right numeric inputs
  - Zoom Limit: Min/Max range slider
  - Mobile Zoom Limit toggle
  - Save All button

#### 3.3 Mini-map Navigation (Feature #136)
- Floating mini-map window
- Current panorama preview
- Hotspot position indicators (red dots)
- Current view orientation indicator
- Hotspot count display
- Draggable/resizable panel

#### 3.4 Scene Configuration Panel (Features #8-13)
- **Left Sidebar:**
  - Project header with "+ New"
  - Scene list with thumbnails & IDs
  - Scene visibility toggle (eye icon)
  - "+ Add item" button
  - Scene context menu:
    - Move to Group
    - Change Media
    - Show Hotspots
    - Delete Scene
  - Bulk scene management (Move, Delete)
  - "X scene(s) selected" indicator

#### 3.5 Scene Properties (Right Sidebar)
- **Tabs:** Scene, Hotspot (with count), Location
- **Config Section:**
  - Title (T) and ID (#) editing
  - "Set Featured" toggle
  - "Replace Pano" button
  - Audio upload ("Upload file .mp3")
- **View Section:**
  - Limit view coordinates
  - Zoom limit settings
  - Mobile zoom limit toggle

### Deliverables
- Working 360° viewer with pan/zoom
- Scene list and switching
- Mini-map with indicators
- Basic scene configuration

---

## Phase 4: Hotspot System
**Duration:** 3-4 weeks
**Priority:** Critical

### Objectives
- Implement the complete hotspot creation and management system
- Support all 8 hotspot types
- Build hotspot styling and configuration

### Features to Implement

#### 4.1 Hotspot Types (Features #14-18)
- **Point** - Location markers (fas fa-map-marker-alt)
- **Chevron** - Directional indicators
- **Image** - Display images (fas fa-images)
- **Article** - Text content/information (fas fa-newspaper)
- **Video** - Embed videos (fas fa-video)
- **Sound** - Audio elements (fas fa-waveform)
- **Link** - Navigation links between scenes (fas fa-link)
- **Product** - E-commerce integration (fas fa-tshirt)

#### 4.2 Hotspot Placement
- Click-to-place on panorama
- Drag to reposition
- Real-time preview
- Undo/Redo support

#### 4.3 Hotspot Configuration Panel
- **Tabs:** Symbol | Label | Global
- **Style Customization:**
  - Icon selection (Font Awesome icons)
  - Shape options
  - Background Color picker (hex + opacity)
  - Size slider
  - Opacity control (0-100)
  - Rotation control
  - Effect dropdown (Normal, etc.)
  - Visibility settings (current/total count)
  - Distorted toggle
- **Label Styling:**
  - Font Type, Size, Letter Spacing, Spacing
  - Font Weight, Padding (X/Y), Border Radius
  - Background Color (with opacity)
  - Text Color, Text Shadow
  - Uppercase, Italic, Only show on hover toggles

#### 4.4 Hotspot Type-Specific Settings
- **Point Setup:**
  - Transitioning options
  - Hide Preview toggle
  - View modes: 360Flat | Thumbnail | Upload
- **Article Hotspot:**
  - Popup Size (Custom/Fixed)
  - Popup Layout selector
- **Product Hotspot:**
  - Price display
  - Link to product page
  - CTA button text

#### 4.5 Per-Type Distortion Toggles (Feature #141)
- Point, Chevron, Image, Article, Video, Sound, Link, Compact, Product

#### 4.6 Hotspot Actions
- Copy hotspot
- Revert changes
- Delete hotspot
- Bulk delete

### Deliverables
- All 8 hotspot types functional
- Complete styling system
- Hotspot CRUD operations
- Label customization

---

## Phase 5: Design & Theming System
**Duration:** 2-3 weeks
**Priority:** High

### Objectives
- Build the theme system with presets
- Implement design settings for all UI components
- Create branding customization options

### Features to Implement

#### 5.1 Theme Presets (Features #19-22)
- **7 Theme Presets:**
  - Default
  - Default 2.0
  - Solid
  - Wall
  - Base
  - Folio
  - Blank
- Theme preview thumbnails
- One-click theme application

#### 5.2 Global Theme Settings
- **Color Customization:**
  - Primary color picker (with opacity)
  - Text color picker
- **Typography:**
  - Primary Font selector
  - Secondary Font selector
- **Display Options:**
  - Hide Project Title toggle
  - Hide Scene Title on Card Scene toggle
  - Hide Scene Title toggle
  - Auto open scene list toggle
  - Show Scene Title in Scene List toggle

#### 5.3 Design Settings Sidebar (Feature #17)
Left-side settings panel with sections:
- Theme
- Hotspot
- Polygon
- Popup
- Floorplan
- Googlemap
- Form
- Call To Action
- Control Bar
- Dollhouse

#### 5.4 Polygon Setup (Features #27-29)
- Background Color (normal & hover) with opacity
- Border Color (normal & hover)
- Border Width (px)

#### 5.5 Popup Setup (Features #30-31)
- Background Color
- Text Color

#### 5.6 Form Setup (Features #23-26)
- Layout: Dialog / Panel
- Position: Left / Right (for Panel)
- Background Color with hex input
- Overlay Color with opacity percentage

#### 5.7 Call To Action Setup (Features #43-45)
- Layout: Bubble / List
- Position: Left / Right
- Offset Left/Right/Bottom (px)

#### 5.8 Control Bar Configuration (Features #46-49)
- 25+ configurable control items table
- Per-item Category selection (Icon, Text, etc.)
- Per-item Source icon (Font Awesome)
- Per-item Hide toggle
- Items include: Floorplan, Sound controls, Auto-rotate, Home, View mode, VR, Fullscreen, Map, Snapshot, Language, Dollhouse, etc.

### Deliverables
- Theme system with 7 presets
- Complete design settings panel
- All UI component customization
- Real-time preview of changes

---

## Phase 6: Floorplan & Map Integration
**Duration:** 3-4 weeks
**Priority:** High

### Objectives
- Build floorplan creation and display
- Integrate Google Maps
- Implement Google Street View sync

### Features to Implement

#### 6.1 Floorplan Creator (Features #32-35, #68-73)
- **Creation Modal:**
  - Publish/Draft toggle
  - Name field (required)
  - Floorplan image upload (drag-and-drop)
  - Create button
- **2D Editor (Advanced):**
  - Top Toolbar: Draw, Edit, Assist, History, View, Actions
  - Layers panel with shape count
  - Draft summary (Walls, Rooms, Markers count)
  - Source image upload with Scale/Opacity/Show on canvas
  - Getting started guide (5 steps)
  - Select & move with marquee, handles, snap
  - Undo/Redo history

#### 6.2 Floorplan Display Settings
- **FLOORPLAN Section:**
  - Show on start (checkbox)
  - Layout: Box / Panel toggle
  - Position: Left / Right toggle
  - Background color (with opacity)
- **RADAR Section:**
  - Enabled toggle
  - Background color (with opacity)
  - Border width + color
  - Width (px)
- **MARKER Section:**
  - Background color
  - Border color

#### 6.3 Google Map Integration (Features #36-38)
- **MAP Section:**
  - Enabled toggle
  - Show on start (checkbox)
  - Map Type: Road map / Satellite / Terrain
  - Layout: Box / Panel toggle
  - Position: Left / Right
  - Background color
- **RADAR Section:** (same as Floorplan)
- **MARKER Section:**
  - Custom marker image (upload + rotate)
  - Active state marker image
  - Width (px)
- **Interactive Map:**
  - Leaflet + Google Maps
  - Scene thumbnails at bottom
  - Search bar for addresses
  - Location permission handling

#### 6.4 Google Street View Integration (Features #145-146)
- **GSV Scene Data:**
  - Latitude / Longitude coordinates
  - Floor Name
  - GSV ID, GSV URL
  - Upload time, GSV Thumbnail
- **GSV Scene Connections:**
  - Sync from GSV button
  - Anchor/Target connection table
  - Distance between scenes (meters)
  - Align Location button
  - Auto-sync rotation with map marker

### Deliverables
- Floorplan upload and display
- 2D floorplan editor (basic)
- Google Maps integration
- GSV sync capability

---

## Phase 7: Canvas & Tour Map
**Duration:** 2-3 weeks
**Priority:** Medium

### Objectives
- Build the visual tour flow arranger
- Implement drag-and-drop scene organization
- Create auto-linking capabilities

### Features to Implement

#### 7.1 Canvas View (Features #39-42)
- **Visual Scene Layout:**
  - Scene cards as draggable elements
  - Visual hotspot indicators on cards
  - Connection lines between linked scenes
- **Canvas Quick Actions:**
  - Click scene to show/edit hotspots
  - Drag scene cards to arrange tour map
  - Hold Space + drag to pan canvas
  - Right-click context menu
  - Zoom in/out

#### 7.2 Canvas Controls (Bottom Bar)
- Drag canvas toggle
- Auto arrange button (automatic layout)
- Auto-link by GPS button
- Save Layout button
- Zoom controls

#### 7.3 Scene Grouping
- Create groups/folders
- Drag scenes into groups
- Group collapse/expand
- Group naming

#### 7.4 Tour Flow Visualization
- Connection lines between linked scenes
- Directional arrows for one-way links
- Orphan scene indicators
- Broken link warnings

### Deliverables
- Interactive canvas view
- Drag-and-drop arrangement
- Auto-linking by GPS
- Tour flow visualization

---

## Phase 8: Image Processing & Effects
**Duration:** 3-4 weeks
**Priority:** Medium

### Objectives
- Implement client-side image filters
- Build the nadir fix tools
- Create lighting effects system

### Features to Implement

#### 8.1 Light Filter (Features #151-152)
- Enable/Disable toggle
- Exposure slider
- Lights slider
- Shadows slider
- Filter Range slider
- Masking slider
- Quality slider

#### 8.2 Sharpen Filter
- Enable/Disable toggle
- Strength slider
- Range slider
- Quality slider

#### 8.3 Sun Light Effect (Feature #153)
- Enable/Disable toggle
- Drag & drop sun position on panorama
- Brightness Sun slider
- Effect (bright sunlight) slider
- Brightness Rainbow slider
- Exposure Bias slider

#### 8.4 Nadir Fix (Feature #154)
- **Quick Fix:** One-click tripod/logo overlay
- **Custom Fix:** Upload custom nadir image
- Position adjustment
- Size adjustment
- Opacity control

#### 8.5 Staging Day to Dusk (Feature #155)
- Mode selector: None, Staging, Day to Dusk
- Automatic time-of-day lighting adjustment
- Preview before apply

#### 8.6 Object 360 Creator (Feature #159)
- **Create Object 360 Modal:**
  - Quick tutorial
  - Select folder / Upload Files
  - Scene Title & Base Path
  - Total Images count
  - Image Name Prefix
  - Image Extension (.png/.jpg)
  - File Name Length
  - Live preview of filename
  - Submit button

### Deliverables
- Client-side image filters
- Nadir fix tools
- Sun positioning effect
- Object 360 creator

---

## Phase 9: Content Management System
**Duration:** 2-3 weeks
**Priority:** Medium

### Objectives
- Build the content management sidebar
- Implement form capture for lead generation
- Create posts and products management

### Features to Implement

#### 9.1 Content Management Sidebar (Features #74-79)
- Posts (with count badge)
- Products (with count badge)
- Floorplan (with count badge, location items)
- Forms (with count badge)
- List Language
- List Translation
- Search bar + Add (+) button

#### 9.2 Form Capture / Lead Generation (Features #80-84)
- **Create/Edit Form:**
  - Publish/Draft toggle
  - Title (required)
  - Description textarea
  - Button Text (custom CTA)
  - Google Sheet ID (required)
  - "+ Add Field" button for dynamic fields
- **Google OAuth Integration:**
  - "Grant Permission To Update Sheet" button
  - OAuth flow for Google Sheets API

#### 9.3 Posts Management
- Create/Edit/Delete posts
- Rich text editor
- Image attachment
- SEO fields (title, description)
- Publish/Draft status

#### 9.4 Products Management
- Create/Edit/Delete products
- Product images
- Price and description
- External link
- CTA button text

#### 9.5 Multi-Language Support
- Language list management
- Translation fields per language
- Default language selection
- Language switcher in viewer

### Deliverables
- Content management sidebar
- Form capture with Google Sheets
- Posts and products CRUD
- Multi-language framework

---

## Phase 10: Marketing & Analytics
**Duration:** 3-4 weeks
**Priority:** Medium

### Objectives
- Build marketing configuration tools
- Implement analytics dashboard
- Create SEO optimization features

### Features to Implement

#### 10.1 Marketing - Forms Configuration (Features #85-89)
- Multiple form configs support
- Closeable toggle
- Event type: project/Scene/Hotspot
- Scene selector (when Event type = Scene)
- Wait Time (seconds) delay
- Add/Remove form config buttons

#### 10.2 Marketing - Analytics Dashboard (Features #90-93)
- **Date Range Filter:** From → To date picker
- **Visits Metrics:**
  - Unique Visitor count
  - Total Visits count
  - Total Page Views count
  - Time On Page
  - Visit Duration
- **Visits Chart:** Line graph (daily data points)
- **Top Tables:**
  - Top Pages (Entry Page, Visitors, Views)
  - Top Sources (Sources, Visitors, Views)
  - Top Countries (Country, Visitors, Views)
  - Top Devices (Device, Visitors, Views)

#### 10.3 Marketing - SEO (Features #94-99)
- **SEO Settings:**
  - Favicon upload
  - Meta title field
  - Description textarea
  - Google Analytics (UA-XXXXXXXXXX-YY or G-XXXXXXXXXX)
- **SEO Image:**
  - Preview of social sharing image
  - Create Image button
  - Change button
  - Reset button
- **SEO Preview Panel:**
  - Live preview of search/social appearance
  - 360° badge, title, description, author
  - URL preview
- **Optimize Suggestions:**
  - SEO Title & Description recommendations
  - Copyright customization suggestions
  - Slug optimization

#### 10.4 Marketing - Script Chats (Features #100-102)
- HTML textarea for custom code
- Script textarea for JavaScript
- Add Field / Update / Delete controls

#### 10.5 Marketing - Snapshot (Features #103-105)
- Hide watermark toggle
- Watermark image upload
- Change / Reset buttons

#### 10.6 SEO Preview & Generation
- Auto-generate SEO image from tour
- Social media preview (OG tags)
- Structured data (JSON-LD)

### Deliverables
- Analytics dashboard with charts
- SEO configuration panel
- Form trigger configuration
- Script injection system

---

## Phase 11: Dollhouse 3D Mode
**Duration:** 4-5 weeks
**Priority:** Low-Medium

### Objectives
- Build the 3D model builder from panoramas
- Implement dollhouse assembly editor
- Create the 3D viewing experience

### Features to Implement

#### 11.1 Dollhouse Settings (Features #50-52)
- Enabled toggle
- Background Color picker
- Hotspot Color picker

#### 11.2 3D Model Builder (Features #53-61)
**4-Step Wizard:**

**Step 1: Set Vertical Point**
- Double-click floor point → lowest point
- Double-click ceiling point → highest point
- Room height calculation

**Step 2: Draw**
- Surface toggle: Ceiling / Floor
- Type toggle: Polygon / Rectangle
- Operation toggle: Union / Subtract
- Drawing instructions overlay
- View rotation slider (0-360°) with Auto
- Yellow grid overlay for alignment
- Top toolbar: Undo, Back, Confirm

**Step 3: Preview Model**
- 3D cube model with wireframe edges
- Render Progress bar with percentage
- Surface count display
- Download Textures .zip button
- **Model Statistics:**
  - Polygon points
  - Surface total
  - Floor/Roof count
  - Wall surfaces
  - Texture images
  - Texture approx size (KB)
  - Render duration (seconds)
  - Texture bake time (seconds)

**Step 4: Model Saved**
- Confirmation state
- Return to editor

**Global Controls:**
- Top toolbar: Undo, Back, Clear, Save
- Bottom: "3D Ready scenes (X)" counter with + and Finalize buttons

#### 11.3 Dollhouse 3D Assembly (Features #62-67)
**3-Step Assembly Wizard:**

1. **Select a model** from created scenes
2. **Move models in 3D space**
   - Edit Type: Move (M) / Rotate (R) / Scale (S)
   - Match All Models Height tool
   - Align All Models To Same Floor tool
   - Show Outline toggle
   - Show Grid toggle
3. **Publish** the assembled dollhouse

#### 11.4 Dollhouse Viewer
- 3D navigation (orbit, pan, zoom)
- Click room to enter panorama
- Hotspot visibility in 3D
- Responsive controls

### Deliverables
- 3D model builder wizard
- Dollhouse assembly editor
- 3D viewer with room navigation
- Model export capability

---

## Phase 12: Publishing, Collaboration & Polish
**Duration:** 3-4 weeks
**Priority:** High (Final)

### Objectives
- Implement the publishing workflow
- Add collaboration features
- Polish UI/UX across all modules
- Performance optimization

### Features to Implement

#### 12.1 Publishing System
- **Publish/Draft workflow**
- **Publishing status indicator**
- **Version history** (basic)
- **Publish settings:**
  - Custom slug/URL
  - Password protection
  - Expiration date

#### 12.2 Content Settings (Features #106-136)
- **General:**
  - Multi-Language toggle
  - Description Tour textarea
  - Initial Scene selector
  - Generate SEO image button
  - Category dropdown
  - Location map
- **Audio:**
  - Background Sound upload (.mp3)
  - Background Sound Volume slider
- **Nadir:** Enabled toggle
- **Copyright:**
  - Enabled toggle
  - Link, Author name, Description
  - QRcode copyright
  - Premium upsell banner

#### 12.3 View Settings (Features #117-120)
- Limit View (Top/Bottom/Left/Right) with clear buttons
- Zoom Limit (Min/Max) with dual-handle slider
- Mobile Zoom Limit toggle
- Save All button

#### 12.4 Logo Setup (Features #121-125)
- Enabled toggle
- Image upload
- Width (px) input
- Redirect to URL
- Position: Top Left / Top Center / Top Right

#### 12.5 Popup Intro Setup (Features #126-129)
- Enabled toggle
- **Image Mode:** Desktop/Mobile images, Auto close, Time, Text close
- **Video Mode:** Desktop/Mobile videos, Mute, Auto close, Time, Text close
- **Description Tour Mode:** Description selector, Fullscreen/Modal

#### 12.6 Collaboration (Features #133-136)
- Enabled toggle
- Comment statistics (Total, Resolved, Unresolved)
- Sharing permissions (Anyone/Restricted)
- Collaboration URL with copy/open buttons
- Real-time comments (basic)

#### 12.7 System Settings (Feature #130-132)
- Archived Images status
- Restore archived images button
- Refresh status button

#### 12.8 Virtual Assistant (Features #137-140)
- Floating assistant panel
- Ask about Panoee
- Share an idea
- Ask for collaboration
- Submit an account ticket

#### 12.9 UI/UX Polish
- Loading states and skeletons
- Error boundaries and fallbacks
- Toast notifications
- Keyboard shortcuts
- Responsive design audit
- Accessibility (WCAG 2.1 AA)

#### 12.10 Performance Optimization
- Image lazy loading
- Viewer performance tuning
- Bundle size optimization
- Caching strategies
- CDN integration

### Deliverables
- Complete publishing workflow
- Collaboration features
- All settings panels
- Polished UI/UX
- Performance optimized

---

## Technology Stack Summary

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand / Jotai |
| 3D Viewer | Three.js + WebGL |
| Canvas | HTML5 Canvas API |
| Maps | Leaflet + Google Maps API |
| Database | PostgreSQL + Prisma/Drizzle |
| Storage | AWS S3 / Cloudflare R2 |
| Auth | NextAuth.js / Clerk |
| API | tRPC or REST |
| Analytics | Custom + Google Analytics |

---

## Development Priorities Matrix

| Phase | Impact | Effort | Priority |
|-------|--------|--------|----------|
| 1. Foundation | Critical | Medium | P0 |
| 2. Media Library | Critical | Medium | P0 |
| 3. 360° Viewer | Critical | High | P0 |
| 4. Hotspot System | Critical | High | P0 |
| 5. Design/Theming | High | Medium | P1 |
| 6. Floorplan/Map | High | High | P1 |
| 7. Canvas/Tour Map | Medium | Medium | P2 |
| 8. Image Processing | Medium | High | P2 |
| 9. Content Management | Medium | Medium | P2 |
| 10. Marketing/Analytics | Medium | High | P2 |
| 11. Dollhouse 3D | Low-Med | Very High | P3 |
| 12. Publishing/Polish | High | Medium | P1 |

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| 360° viewer performance | High | WebGL optimization, LOD system |
| S3 cost management | Medium | Use Cloudflare R2, implement caching |
| Google Maps API costs | Medium | Implement usage quotas, cache tiles |
| 3D model complexity | High | Start with simple cube models, iterate |
| Browser compatibility | Medium | Progressive enhancement, polyfills |
| Mobile performance | High | Touch optimization, reduced quality tiers |

---

## Next Steps

1. **Immediate:** Review and approve phase plan
2. **Week 1:** Set up development environment and project structure
3. **Week 2:** Begin Phase 1 implementation
4. **Ongoing:** Collect remaining reference images (Sets 11-12) for feature refinement

---

*Document Version: 1.0*
*Created: August 31, 2026*
*Based on: 162+ features from Panoee reference analysis*
