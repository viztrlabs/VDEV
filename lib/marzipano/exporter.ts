/**
 * Marzipano ZIP exporter.
 *
 * Produces a manifest-only ZIP containing both `data.js` and
 * `app-data.json` (same payload, two formats) so the upstream tool can
 * re-import it. We do NOT bundle panorama images or cube tiles; the user
 * is expected to have already uploaded those via the editor's normal flow.
 *
 * Round-trip notes:
 *   - mouseViewMode is hard-coded to 'drag' because the VizTR editor doesn't
 *     surface QTVR.
 *   - Hotspots of types other than `room_link` and `info` are serialized
 *     into infoHotspots[i].text via JSON.stringify so nothing is lost
 *     (lossy; documented).
 *   - Scene IDs must round-trip verbatim. The VizTR room id is reused as
 *     the Marzipano scene id; if the id is not a valid JS identifier, the
 *     caller should have sanitized it before reaching the editor store.
 */

import JSZip from 'jszip';
import type { MarzipanoTour } from './types';
import {
  editorRoomToMarzipanoScene,
  type EditorRoom,
} from './conversion';

export interface ExportOptions {
  tourName?: string;
  viewerSettings?: {
    mouseViewMode: 'drag' | 'qtvr';
    autorotateEnabled?: boolean;
    autorotateSpeed?: number;
    fullscreenButton?: boolean;
    viewControlButtons?: boolean;
  };
}

function buildTour(
  rooms: EditorRoom[],
  tourName: string,
  viewerSettings: ExportOptions['viewerSettings'],
): MarzipanoTour {
  const scenes = rooms.map((room) => editorRoomToMarzipanoScene(room));
  const vs = viewerSettings || {};
  return {
    name: tourName || 'VizTR tour',
    scenes,
    settings: {
      mouseViewMode: vs.mouseViewMode || 'drag',
      autorotateEnabled: vs.autorotateEnabled ?? false,
      autorotateSpeed: vs.autorotateSpeed ?? 0.5,
      fullscreenButton: vs.fullscreenButton ?? true,
      viewControlButtons: vs.viewControlButtons ?? true,
    },
  };
}

export async function exportTourToZip(
  rooms: EditorRoom[],
  options: ExportOptions = {},
): Promise<Blob> {
  const tour = buildTour(rooms, options.tourName || 'VizTR tour', options.viewerSettings);
  const json = JSON.stringify(tour, null, 2);

  const zip = new JSZip();
  zip.file('app-data.json', json);
  zip.file('data.js', `var data = ${json};\n`);
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

export function makeExportFilename(tourName: string): string {
  const safe = (tourName || 'tour').replace(/[^A-Za-z0-9._-]+/g, '-').slice(0, 60);
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp =
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `-${pad(now.getHours())}${pad(now.getMinutes())}`;
  return `${safe}-marzipano-${stamp}.zip`;
}