# VizTR Tour Builder — Master Implementation & UX Specification

**Version:** 1.0
**Date:** 2026-09-20
**Status:** Specification Complete — Ready for Implementation

---

## Role

You are the lead product engineer and UX architect for the **VizTR Virtual Tour Builder**.

Build the Tour Builder as a **professional no-code / low-code authoring tool for 3D artists, ArchViz artists, architects, photographers, and tour operators**.

The user should not need programming knowledge. The user uploads 360-degree panoramic images and should be able to build a complete interactive Virtual Tour through a visual editor using mouse, drag and drop, visual controls, context menus, keyboard shortcuts, toolbar commands, inspector panels, and visual previews.

Do not expose technical implementation details to the normal artist workflow.

---

## 1. Primary User Goal

```
UPLOAD 360 IMAGES
        |
ORGANIZE ROOMS
        |
SET START VIEW
        |
CONNECT ROOMS
        |
ADD HOTSPOTS
        |
ADD INFO / GALLERY / VIDEO
        |
CUSTOMIZE HOTSPOT ICONS
        |
ADD 3D / SPLAT EXPERIENCES
        |
ALIGN IF REQUIRED
        |
PREVIEW
        |
VALIDATE
        |
PUBLISH
        |
PUBLIC VIRTUAL TOUR
```

The artist completes this without writing code.

---

## 2. Product Mental Model

```
PROJECT
   |
VIRTUAL TOUR SERVICE
   |
TOUR EXPERIENCE
   |
ROOMS
   |
360 PANORAMAS
   |
HOTSPOTS + CONTENT
   |
EXPERIENCE CONFIG
   |
PUBLISH
```

Do not expose database terminology unless the user opens Developer Mode.

---

## 3. Tour Builder UI Layout

```
+-------------------------------------------------------------+
| VizTR Tour Builder                       [Save] [Preview] [Publish] |
+--------------+-------------------------------+--------------+
|              |                               |              |
|  ROOMS       |        PANORAMA VIEW          |  INSPECTOR   |
|              |                               |              |
|  Floor 01    |       360 Viewer              |  Selected    |
|   Entrance   |                               |  Object      |
|   Living     |                               |  Properties  |
|   Dining     |                               |              |
|              |                               |              |
|  Floor 02    |                               |              |
|   Master     |                               |              |
|   Bedroom    |                               |              |
|              |                               |              |
+--------------+-------------------------------+--------------+
| [Select] [Move] [Hotspot] [Connect] [Info] [Gallery] [3D]  |
+-------------------------------------------------------------+
```

---

## Architectural Rule

The Tour Builder is an **authoring tool**. It edits the existing VizTR data model:

```
Project -> Service -> Experience -> Experience Config -> Publish
```

Do NOT create:
- A separate product database
- A second Tour model
- localStorage as production source of truth
- A second alignment system
- Three.js as replacement for PlayCanvas

Reuse existing: TourRoom, Tour configuration, Marzipano adapter, Experience Config, Supabase persistence, asset management, alignment system, publishing system, TourViewer, ExperienceViewer, SharedExperienceContext.
