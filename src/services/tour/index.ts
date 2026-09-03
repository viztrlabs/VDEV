/**
 * Tour Services — barrel export.
 * Re-exports marzipano round-trip (types, coords, importer, exporter, conversion)
 * and client-side store types/selectors.
 */

// --- Marzipano round-trip ---
export type {
  MarzipanoLevel,
  MarzipanoLinkHotspot,
  MarzipanoInfoHotspot,
  MarzipanoScene,
  MarzipanoTour,
} from '@/lib/marzipano/types';
export { coordinatesToRadians, radiansToCoordinates } from '@/lib/marzipano/coords';
export { importMarzipanoTour } from '@/lib/marzipano/importer';
export { exportMarzipanoTour } from '@/lib/marzipano/exporter';
export { marzipanoToViztr, viztrToMarzipano } from '@/lib/marzipano/conversion';
export { generateTilePyramid, getTileUrl } from '@/lib/marzipano/tiling';

// --- Client-side store (tour viewer / editor canonical state) ---
export type {
  TourScene,
  TourHotspot,
  ViewConstraints,
  TourClientState,
} from '@/lib/tourClientStore';
export {
  useTourStore,
  useEditorScenes,
  useViewerCurrentScene,
  useEditorSelectedScene,
} from '@/lib/tourClientStore';

// --- Server-side persistence (data.js / local JSON fallback) ---
export type { SavedTour } from '@/lib/tourStore';
export { getTour, saveTour } from '@/lib/tourStore';
