# Part 4 — Editor Operations

## 32. Duplicate Hotspots

Shortcut: Ctrl/Cmd + D. Duplicate the selected hotspot. Useful when creating multiple similar information points.

## 33. Copy / Paste

Support: Ctrl/Cmd + C, Ctrl/Cmd + V for supported objects. Use cases: duplicate hotspot, duplicate style, duplicate configuration.

## 34. Delete

Shortcut: Delete / Backspace. Delete selected hotspot, room, gallery item, or configuration object. Always confirm destructive room deletion.

## 35. Undo / Redo

Mandatory shortcuts: Ctrl/Cmd + Z, Ctrl/Cmd + Shift + Z. Provide visible toolbar buttons: Undo, Redo.

## 36. Save

Primary shortcut: Ctrl/Cmd + S. Display status: Saved, Saving..., Unsaved changes, Save failed. Never silently discard changes.

## 37. Preview Mode

Shortcut: P. Preview hides editing controls. The artist sees the tour approximately as the visitor will see it. Provide "Exit Preview".

## 38. Publish Validation

Before Publish, automatically check:

- All rooms have panoramas
- All required room names exist
- Starting views configured
- Navigation links valid
- No broken assets
- No missing gallery images
- No invalid URLs
- Alignment valid where required
- Experience configuration valid

Show errors in human-readable language. Example:

> Kitchen -> Living Room navigation points to a deleted room.

Provide [Fix] beside the problem.

## 39. Publish

Primary action: PUBLISH. Show confirmation dialog. After publishing show: Published, URL, QR Code, Copy Link, Open Experience.

## 40. Keyboard Shortcut System

Create a visible shortcut reference inside Help -> Keyboard Shortcuts.

| Shortcut | Action |
|----------|--------|
| H | Add Hotspot |
| N | Navigation Hotspot |
| F | Info Hotspot |
| G | Gallery |
| V | Video |
| L | Link |
| C | Connect Rooms |
| A | Alignment Mode |
| S | Set Start View |
| I | Icon Selector |
| R | Rotate Selected Hotspot |
| P | Preview |
| Ctrl/Cmd + S | Save |
| Ctrl/Cmd + Z | Undo |
| Ctrl/Cmd + Shift + Z | Redo |
| Ctrl/Cmd + D | Duplicate |
| Delete | Delete |
| Esc | Cancel / Close |
| Space | Temporary navigation/pan mode |

Do not allow shortcuts to conflict with text input fields.

## 41. Context Menu

Right-click empty panorama: Add Navigation Hotspot, Add Info Hotspot, Add Gallery, Add Image, Add Video, Add Link, Add 3D Model, Set Starting View, Paste.

Right-click hotspot: Edit, Duplicate, Change Icon, Change Type, Rotate, Copy, Delete.

Right-click room: Open, Rename, Duplicate, Set Thumbnail, Set Start View, Connect, Delete.

## 42. Drag and Drop

Support drag/drop wherever practical: Image to Gallery, Asset to Room, Room to Floor, Hotspot to New Position, Room ordering. Provide visual feedback while dragging.

## 43. Inspector Design

When nothing is selected: Tour Settings. When a room is selected: Room Inspector. When a hotspot is selected: Hotspot Inspector. When an asset is selected: Asset Inspector. When alignment is active: Alignment Inspector. Do not show irrelevant fields.

## 44. Simple Mode / Advanced Mode

**Artist Mode** — Show only: Name, Icon, Destination, Position, Direction, Content, Save.

**Advanced Mode** — Show: Yaw, Pitch, Transform, FOV, Metadata, Experience Config, Runtime settings, Performance, Technical properties.

This is important because the same builder should work for beginners and experienced developers.

## 45. Tooltip System

Every important button should have a tooltip. Example: "Connect Rooms — Create a navigation link between two tour rooms." For advanced settings: "Spatial Alignment — Defines the relationship between the panorama and another spatial experience such as a Gaussian Splat."
