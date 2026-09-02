/**
 * Marzipano ZIP importer.
 *
 * Reads a ZIP produced by the upstream Marzipano Importer tool and
 * converts it to a VizTR EditorRoom[].
 *
 * Workflow:
 *   1. Open the ZIP with JSZip.
 *   2. Locate the data file: prefer `app-data.json`, fall back to `data.js`.
 *   3. Parse safely. data.js uses `new Function` in a private scope.
 *      SECURITY: only call with user-supplied files. Never pass content
 *      fetched from an untrusted origin.
 *   4. Detect cube vs equirect scenes; reject cube (per plan).
 *   5. Find an equirect source per scene in the ZIP.
 *   6. Run the per-scene converter; collect warnings.
 *
 * The two-step analyze-then-import flow (analyzeZip → importTourFromZip)
 * lets the editor show a confirmation modal before committing changes.
 */

import JSZip from 'jszip';
import type {
  MarzipanoTour,
  MarzipanoScene,
} from './types';
import {
  marzipanoSceneToEditorRoom,
  isCubeScene,
  type ConversionWarning,
  type EditorRoom,
} from './conversion';

export interface ImportWarning extends ConversionWarning {}

export interface ImportAnalysis {
  ok: boolean;
  fatal?: string;
  sceneCount: number;
  equirectCount: number;
  cubeCount: number;
  hotspotCount: number;
  droppedLinkCount: number;
  warnings: ImportWarning[];
  tourName: string;
}

export interface ImportResult {
  ok: boolean;
  tour?: { name: string; rooms: EditorRoom[] };
  warnings: ImportWarning[];
  fatal?: string;
}

const EQUIRECT_FILENAMES = ['equirect.jpg', 'equirect.png'];

async function findEquirectSource(
  zip: JSZip,
  scene: MarzipanoScene,
): Promise<string | null> {
  const fileMap = new Map<string, string>();
  zip.forEach((relPath, entry) => {
    if (!entry.dir) {
      fileMap.set(relPath.toLowerCase(), relPath);
    }
  });

  // Look in three locations, in order: tiles/<sceneId>/, scene-root
  // variants (upstream conventions), and a global equirect.{jpg,png}.
  const safe = scene.id.replace(/[^A-Za-z0-9._-]/g, '_');
  const candidates = [
    `tiles/${safe}/equirect.jpg`,
    `tiles/${safe}/equirect.png`,
    `${safe}.jpg`,
    `${safe}.png`,
    'equirect.jpg',
    'equirect.png',
  ];
  for (const name of candidates) {
    const match = fileMap.get(name.toLowerCase());
    if (match) return match;
  }
  return null;
}

/**
 * SECURITY: `new Function` evaluates the body in a fresh function scope so
 * the file does not run in the page global scope. Same trust model as
 * `eval`. Acceptable because the file is a user upload; never use this with
 * content fetched from an untrusted origin.
 */
function parseDataJs(body: string): MarzipanoTour {
  const trimmed = body.trim();
  if (!trimmed) throw new Error('data.js is empty');
  // Strip optional `var data = ` / `window.appData = ` wrapper and any
  // trailing semicolon, then wrap as an expression so `new Function` can
  // return the literal.
  const stripped = trimmed
    .replace(
      /^(var\s+\w+\s*=|window\.\w+\s*=|let\s+\w+\s*=|const\s+\w+\s*=)/,
      '',
    )
    .replace(/[;\s]+$/, '');
  const wrapped = `"use strict"; return (${stripped});`;
  const fn = new Function(wrapped);
  return fn() as MarzipanoTour;
}

async function loadTourFromZip(zip: JSZip): Promise<MarzipanoTour> {
  let dataFile: { name: string; entry: JSZip.JSZipObject } | null = null;
  for (const candidate of ['app-data.json', 'data.js']) {
    const entry = zip.file(candidate);
    if (entry) {
      dataFile = { name: candidate, entry };
      break;
    }
  }
  if (!dataFile) {
    throw new Error('ZIP does not contain app-data.json or data.js');
  }
  const text = await dataFile.entry.async('string');
  if (dataFile.name === 'app-data.json') {
    return JSON.parse(text) as MarzipanoTour;
  }
  return parseDataJs(text);
}

function summarize(
  tour: MarzipanoTour,
  zip: JSZip,
): Promise<{
  analysis: ImportAnalysis;
  scenePlan: Array<{
    scene: MarzipanoScene;
    isCube: boolean;
    panoramaUrl: string | null;
  }>;
}> {
  const allSceneIds = new Set(tour.scenes.map((s) => s.id));
  const scenePlan = tour.scenes.map((scene) => ({
    scene,
    isCube: isCubeScene(scene),
    panoramaUrl: null as string | null,
  }));

  const promises = scenePlan.map(async (entry) => {
    if (entry.isCube) return;
    entry.panoramaUrl = await findEquirectSource(zip, entry.scene);
  });

  return Promise.all(promises).then(() => {
    let equirectCount = 0;
    let cubeCount = 0;
    let hotspotCount = 0;
    let droppedLinkCount = 0;
    for (const entry of scenePlan) {
      if (entry.isCube) {
        cubeCount += 1;
      } else if (entry.panoramaUrl) {
        equirectCount += 1;
      }
      const linkCount = entry.scene.linkHotspots?.length || 0;
      hotspotCount += linkCount + (entry.scene.infoHotspots?.length || 0);
      for (const link of entry.scene.linkHotspots || []) {
        if (!allSceneIds.has(link.target)) droppedLinkCount += 1;
      }
    }
    const analysis: ImportAnalysis = {
      ok: true,
      sceneCount: tour.scenes.length,
      equirectCount,
      cubeCount,
      hotspotCount,
      droppedLinkCount,
      warnings: cubeCount
        ? [
            {
              code: 'cube_tiles_rejected',
              message: `${cubeCount} scene(s) use cube tiles and will be skipped.`,
            },
          ]
        : [],
      tourName: tour.name || 'Imported tour',
    };
    return { analysis, scenePlan };
  });
}

export async function analyzeZip(file: File | Blob): Promise<ImportAnalysis> {
  try {
    const zip = await JSZip.loadAsync(file);
    const tour = await loadTourFromZip(zip);
    const { analysis } = await summarize(tour, zip);
    return analysis;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return {
      ok: false,
      fatal: `Failed to analyze ZIP: ${message}`,
      sceneCount: 0,
      equirectCount: 0,
      cubeCount: 0,
      hotspotCount: 0,
      droppedLinkCount: 0,
      warnings: [],
      tourName: '',
    };
  }
}

export async function importTourFromZip(
  file: File | Blob,
): Promise<ImportResult> {
  try {
    const zip = await JSZip.loadAsync(file);
    const tour = await loadTourFromZip(zip);
    const { scenePlan } = await summarize(tour, zip);

    const allSceneIds = new Set(tour.scenes.map((s) => s.id));
    const rooms: EditorRoom[] = [];
    const warnings: ImportWarning[] = [];

    for (let i = 0; i < scenePlan.length; i += 1) {
      const { scene, panoramaUrl } = scenePlan[i];
      const { room, warnings: sceneWarnings } = marzipanoSceneToEditorRoom(
        scene,
        panoramaUrl,
        allSceneIds,
        i,
      );
      warnings.push(...sceneWarnings);
      if (room) rooms.push(room);
    }

    return {
      ok: true,
      tour: { name: tour.name || 'Imported tour', rooms },
      warnings,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return {
      ok: false,
      fatal: `Failed to import ZIP: ${message}`,
      warnings: [],
    };
  }
}