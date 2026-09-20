# Part 2 — Hotspot System

## 9. Hotspot Types

One unified hotspot system. Types: NAVIGATION, INFO, IMAGE, GALLERY, VIDEO, AUDIO, LINK, FLOOR, 3D MODEL, SPLAT, EXPERIENCE, CUSTOM.

The user selects a hotspot type before configuring it.

## 10. Hotspot Creation

Primary command: H or "Add Hotspot". Then show type selector:

```
[ Navigation ]  [ Info ]      [ Gallery ]
[ Image ]       [ Video ]     [ Audio ]
[ Link ]        [ 3D Model ]  [ Splat ]
[ Experience ]  [ Floor ]     [ Custom ]
```

The hotspot is placed at the current panorama position. Allow drag afterward.

## 11. Navigation Hotspot

Purpose: Move from one room to another. Shortcut: N.

Workflow: Press N, click panorama location, select destination room, confirm.

Inspector shows: Type: Navigation, Destination: Kitchen, Label: Go to Kitchen, Icon: Arrow, Direction: Auto.

## 12. Connect Two Rooms

Direct visual command: CONNECT ROOMS. Shortcut: C.

Workflow: Select source room, press C, click hotspot position, choose destination room, Save.

Also support: Room A -> Connect -> Room B.

Provide "Create Reverse Link" so Living->Kitchen and Kitchen->Living can be created together.

## 13. Hotspot Direction

Hotspot direction is independently editable. Provide: Direction, Yaw, Pitch, Rotation, Target.

Modes: Auto (orient toward destination), Manual (artist rotates arrow), Look At (point toward selected point, shortcut R), Target Room, Target Object.

## 14. Hotspot Position

Support two positioning concepts: PANORAMA POSITION + DIRECTION.

The artist can: click to place, drag, fine-adjust, rotate, duplicate. Show numerical values only in Advanced Inspector. Do not force the artist to work numerically.

## 15. Change Hotspot Icon

When a hotspot is selected, Icon opens an icon selector. Categories: Navigation, Information, Media, Architecture, Furniture, Location, Floor, Stairs, Door, Window, Camera, Video, Gallery, 3D, VR, AR, Custom.

Support: built-in icons, custom SVG, custom PNG, project icon library. Shortcut: I.

## 16. Custom Hotspot Appearance

Allow: Icon, Size, Color, Opacity, Label, Tooltip, Animation, Hover effect, Active state.

Presets: Minimal, Modern, Luxury, Technical, Real Estate, Architecture. Do not force users to manually style every hotspot.

## 17. Information Hotspot

Shortcut: F. Inspector: Title, Description, Image, Icon, Position, Direction.

Example: Title: Italian Marble. Description: Premium natural marble flooring selected for the main living area.

## 18. Image Hotspot

Allow a hotspot to open an image. Example uses: Floor Plan, Material Detail, Furniture Reference, Before/After, Construction Photograph.

## 19. Gallery Hotspot

Shortcut: G. Allow multiple images with drag/drop ordering, remove, replace, captions, thumbnails.

Inspector: Title, Images, Thumbnail, Layout, Caption.

## 20. Video Hotspot

Shortcut: V. Allow uploaded video, supported video URL, project video asset.

Configuration: Title, Video, Poster, Autoplay, Muted, Loop, Controls.

## 21. Audio Hotspot

Allow: Narration, Room description, Architect commentary, Ambient sound.

Configuration: Audio file, Title, Autoplay, Loop, Volume.

## 22. External Link Hotspot

Shortcut: L. Configuration: URL, Label, Icon, Open mode.

Do not allow arbitrary unsafe protocols. Only supported web URLs should be accepted.
