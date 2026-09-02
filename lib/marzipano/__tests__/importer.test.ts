import JSZip from 'jszip';
import { analyzeZip, importTourFromZip } from '../importer';

function makeTourFile(scenes: any[], settings?: any): Promise<Blob> {
  const tour = {
    name: 'Test Tour',
    scenes,
    settings: settings || { mouseViewMode: 'drag' },
  };
  const json = JSON.stringify(tour, null, 2);
  const zip = new JSZip();
  zip.file('app-data.json', json);
  zip.file('data.js', `var data = ${json};\n`);
  return zip.generateAsync({ type: 'blob' });
}

describe('marzipano importer', () => {
  it('analyzes a ZIP with equirect scenes', async () => {
    const blob = await makeTourFile([
      {
        id: 'room-a',
        name: 'A',
        levels: [{ tileSize: 256, size: 256, fallbackOnly: true }],
        faceSize: 256,
        initialViewParameters: { yaw: 0, pitch: 0, fov: Math.PI / 2 },
        linkHotspots: [],
        infoHotspots: [],
      },
    ]);
    const analysis = await analyzeZip(blob);
    expect(analysis.ok).toBe(true);
    expect(analysis.sceneCount).toBe(1);
    expect(analysis.cubeCount).toBe(0);
  });

  it('flags cube scenes in analysis', async () => {
    const blob = await makeTourFile([
      {
        id: 'room-a',
        name: 'A',
        levels: [
          { tileSize: 512, size: 512 },
          { tileSize: 256, size: 256 },
        ],
        faceSize: 512,
        initialViewParameters: { yaw: 0, pitch: 0, fov: Math.PI / 2 },
        linkHotspots: [],
        infoHotspots: [],
      },
    ]);
    const analysis = await analyzeZip(blob);
    expect(analysis.ok).toBe(true);
    expect(analysis.cubeCount).toBe(1);
    expect(analysis.equirectCount).toBe(0);
  });

  it('parses data.js via new Function', async () => {
    const blob = await makeTourFile([
      {
        id: 'room-js',
        name: 'From JS',
        levels: [{ tileSize: 256, size: 256, fallbackOnly: true }],
        faceSize: 256,
        initialViewParameters: { yaw: 0, pitch: 0, fov: Math.PI / 2 },
        linkHotspots: [],
        infoHotspots: [],
      },
    ]);
    // Strip app-data.json so the importer falls back to data.js.
    const zip = await JSZip.loadAsync(blob);
    zip.remove('app-data.json');
    const fallback = await zip.generateAsync({ type: 'blob' });
    const result = await importTourFromZip(fallback);
    expect(result.ok).toBe(true);
    // The scene has no equirect source bundled in the ZIP, so the importer
    // emits an `equirect_source_missing` warning and skips the scene. This
    // confirms data.js was parsed (otherwise we'd get a fatal parse error).
    expect(result.warnings.some((w) => w.code === 'equirect_source_missing')).toBe(true);
  });

  it('imports a scene when its equirect source is bundled', async () => {
    const tour = {
      name: 'With Equirect',
      scenes: [
        {
          id: 'room-eq',
          name: 'Equirect Room',
          levels: [{ tileSize: 256, size: 256, fallbackOnly: true }],
          faceSize: 256,
          initialViewParameters: { yaw: 0, pitch: 0, fov: Math.PI / 2 },
          linkHotspots: [],
          infoHotspots: [],
        },
      ],
      settings: { mouseViewMode: 'drag' },
    };
    const zip = new JSZip();
    zip.file('app-data.json', JSON.stringify(tour));
    zip.file('tiles/room-eq/equirect.jpg', 'fake-image-bytes');
    const blob = await zip.generateAsync({ type: 'blob' });
    const result = await importTourFromZip(blob);
    expect(result.ok).toBe(true);
    expect(result.tour?.rooms.length).toBe(1);
    expect(result.tour?.rooms[0].panoramaUrl).toMatch(/equirect\.jpg$/);
  });

  it('skips cube scenes on import', async () => {
    const blob = await makeTourFile([
      {
        id: 'cube',
        name: 'Cube',
        levels: [
          { tileSize: 512, size: 512 },
          { tileSize: 256, size: 256 },
        ],
        faceSize: 512,
        initialViewParameters: { yaw: 0, pitch: 0, fov: Math.PI / 2 },
        linkHotspots: [],
        infoHotspots: [],
      },
    ]);
    const result = await importTourFromZip(blob);
    expect(result.ok).toBe(true);
    expect(result.tour?.rooms.length).toBe(0);
    expect(result.warnings.some((w) => w.code === 'cube_tiles_rejected')).toBe(true);
  });

  it('returns fatal for ZIP without a data file', async () => {
    const zip = new JSZip();
    zip.file('readme.txt', 'hello');
    const blob = await zip.generateAsync({ type: 'blob' });
    const analysis = await analyzeZip(blob);
    expect(analysis.ok).toBe(false);
    expect(analysis.fatal).toBeDefined();
  });
});