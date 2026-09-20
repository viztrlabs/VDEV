# Part 1 — Room Manager

## 4. Left Panel — Room Manager

The left panel manages tour rooms. Each room represents a physical location.

Example structure:

```
GROUND FLOOR
  Entrance
  Living Room
  Dining Room
  Kitchen
  Pool Deck

FIRST FLOOR
  Stair Lobby
  Master Bedroom
  Bedroom 02
  Bedroom 03
```

Allow: Create Room, Rename Room, Duplicate Room, Delete Room, Reorder Room, Move Room between floors, Hide/show room, Set room thumbnail, Set room starting view, Search rooms, Filter rooms, Drag/drop room ordering.

## 5. Room Creation

After uploading a 360 image, "Create Room" allows: Room Name, Floor, Zone, Description, Thumbnail, Panorama, Starting View.

Provide automatic suggestions from filename. Example: `GF_01_Living_Room.jpg` suggests Floor: Ground Floor, Room: Living Room. The user must be able to change everything manually.

## 6. 360 Image Upload

Support: drag and drop, file picker, multiple upload, batch upload.

After upload show validation:

```
Valid panorama
2:1 equirectangular
Resolution: 4096x2048
File size: 3.2 MB
Processing status: Ready
```

If an image does not appear to be a valid panorama, show a human-readable warning:

> This image may not be an equirectangular 360 panorama. Check the image projection before continuing.

Do not display technical errors such as raw stack traces.

## 7. Panorama Viewer

The central viewport is the main authoring area. Required controls: orbit/pan, zoom, reset view, fullscreen, compass, horizon indicator, field of view control, starting-view marker, hotspot preview.

The user should always know: Current Room, Current View, Selected Object.

## 8. Starting View

Every room must have a starting camera. Command: SET START VIEW.

Workflow: Rotate panorama to desired view, click Set Start View. Also support "Use Current View as Start". Shortcut: S.

When saved, store: yaw, pitch, FOV where applicable.
