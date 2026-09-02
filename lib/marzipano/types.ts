/**
 * Marzipano tour import/export data model.
 *
 * Mirrors the upstream tool's `data.js` / `app-data.json` schema (see the
 * upstream `EXPORT_FORMAT.md`). This file is the single source of truth for
 * the on-disk ZIP shape — both importer and exporter reference these types.
 *
 * Coordinate convention: yaw ∈ [-π, π], pitch ∈ [-π/2, π/2]. See coords.ts.
 */

export interface MarzipanoLevel {
  tileSize: number;
  size: number;
  fallbackOnly?: boolean;
}

export interface MarzipanoLinkHotspot {
  yaw: number;
  pitch: number;
  rotation: number;
  target: string;
}

export interface MarzipanoInfoHotspot {
  yaw: number;
  pitch: number;
  title: string;
  text: string;
}

export interface MarzipanoScene {
  id: string;
  name: string;
  levels: MarzipanoLevel[];
  faceSize: number;
  initialViewParameters: { pitch: number; yaw: number; fov: number };
  linkHotspots: MarzipanoLinkHotspot[];
  infoHotspots: MarzipanoInfoHotspot[];
  /** Optional pre-tiled equirect source URL. Upstream doesn't emit one. */
  sourceUrl?: string;
}

export interface MarzipanoSettings {
  mouseViewMode: 'drag' | 'qtvr';
  autorotateEnabled?: boolean;
  autorotateSpeed?: number;
  fullscreenButton?: boolean;
  viewControlButtons?: boolean;
}

export interface MarzipanoTour {
  name: string;
  scenes: MarzipanoScene[];
  settings: MarzipanoSettings;
}