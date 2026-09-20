# Part 7 — Final Workflow and Acceptance Criteria

## 57. Final Artist Workflow

```
01 — UPLOAD        Upload 360 images
02 — ORGANIZE      Create floors and rooms
03 — COMPOSE       Set thumbnails and starting views
04 — CONNECT       Connect rooms with navigation hotspots
05 — ENRICH        Add information, galleries, images and videos
06 — CUSTOMIZE     Change icons, labels, directions and appearance
07 — EXTEND        Add 3D models, Splat and other experiences
08 — ALIGN         Align Tour + Splat when required
09 — REVIEW        Preview the complete tour
10 — VALIDATE      Run Tour Health checks
11 — PUBLISH       Publish the experience
12 — DELIVER       URL + QR + client access
```

## 58. Architectural Rule

The Tour Builder is an **authoring tool**. It should not become a separate product database. The authoritative structure remains: Project -> Service -> Experience -> Experience Config -> Publish.

The Tour Builder edits the relevant Experience and Experience Config.

## 59. Do Not Rebuild Existing Systems

Before implementing anything, inspect the existing VizTR codebase. Reuse existing:

- TourRoom type
- Tour configuration
- Marzipano adapter
- Experience Config schema
- Supabase persistence
- Asset management
- Alignment system
- Publishing system
- Existing hotspot functionality
- Existing TourViewer
- Existing ExperienceViewer
- Existing SharedExperienceContext

Do NOT create: duplicate persistence systems, a second Tour model, localStorage as production source of truth, a second alignment system, Three.js as replacement for PlayCanvas.

## 60. Developer Acceptance Criteria

A non-coding 3D artist must be able to perform:

```
Upload 10 360 images
Create 10 rooms
Set room names
Set starting views
Connect rooms
Add navigation hotspots
Add information hotspots
Add a gallery
Change hotspot icons
Change hotspot direction
Add a 3D model
Connect a Splat experience
Align Tour + Splat
Save
Reload
Preview
Validate
Publish
```

without writing code.

## 61. Final Product Test

The final test user should be: A competent 3D/ArchViz artist who has never seen the VizTR source code.

Give them 10 prepared 360 images and this guide. Do not explain the implementation manually. Observe whether they can produce: Complete Tour + Navigation + Information + Gallery + Custom Hotspots + Starting Views + 3D/Splat Integration + Alignment + Published Experience.

If they can, the Tour Builder has achieved its primary purpose.

## 62. Core Philosophy

The artist should think: "I am building a virtual space." Not: "I am configuring a database."

The interface should translate technical operations into familiar 3D-authoring concepts:

| Technical Term | Artist Term |
|---------------|-------------|
| Database relation | Connection |
| JSON configuration | Settings |
| Experience Config | Experience Settings |
| TourRoom | Room |
| Asset | Media / Model |
| SpatialAlignment | Align |
| Publish Job | Publish |
| Experience URL | Share Tour |

The final VizTR Tour Builder should feel closer to a **professional 3D/level editor** than an administrative CRUD dashboard.

The shortcut system should become a real part of the product. Make shortcuts visible inside the builder, not just documented. Press H to add hotspot, N for navigation, C to connect rooms, S for start view, I for icon, A for alignment, P for preview.

Support natural-language commands alongside shortcuts. This gives VizTR a path from a traditional 3D artist workflow to an AI-assisted workflow without changing the underlying data model.

The resulting experience: 360 images -> visual authoring -> shortcuts/AI -> publish, with essentially zero coding required.
