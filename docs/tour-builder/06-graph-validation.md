# Part 6 — Tour Graph, Validation, and Performance

## 52. Tour Graph View

Add an optional TOUR MAP showing:

```
Entrance
   |
   +-- Living
   |     +-- Dining
   |     +-- Kitchen
   |
   +-- Stair
          +-- Master
          +-- Bedroom 02
```

This allows artists to identify: isolated rooms, dead ends, missing links, incorrect connections. A graph view is particularly useful for large projects.

## 53. Room Connection Validation

Automatically identify: Rooms with no outgoing links, Rooms with no incoming links, Broken destinations, Duplicate connections, Unreachable rooms.

Display:

```
Tour Health
  18 rooms
  31 connections
  0 broken links
  1 isolated room
```

## 54. Tour Health

Create a simple status: Tour Health: 96%

Do not use this as a subjective quality score. It should represent objective validation only: Rooms valid, Assets valid, Links valid, Configuration valid, Publish requirements satisfied.

## 55. Performance Assistance

The builder should warn about: extremely large panoramas, very large galleries, oversized videos, unsupported assets, excessive simultaneous content.

Example:

> This panorama is very large and may increase loading time on mobile devices.

Do not automatically destroy quality. Provide optimization recommendations.

## 56. Mobile Preview

Provide Desktop, Tablet, Mobile preview modes where practical. The artist should verify: navigation, hotspot readability, gallery, information panels, orientation, touch controls.
