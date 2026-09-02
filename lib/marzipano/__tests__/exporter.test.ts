import JSZip from 'jszip';
import { exportTourToZip, makeExportFilename } from '../exporter';
import type { EditorRoom } from '../conversion';

const fixture: EditorRoom[] = [
  {
    id: 'roomA',
    name: 'A',
    subtitle: 'Test A',
    panoramaUrl: 'https://example.com/a.jpg',
    thumbnailUrl: 'https://example.com/a.jpg',
    initialYaw: 90,
    initialPitch: 0,
    defaultHotspots: [
      {
        id: 'hp-a-link',
        xPercent: 50,
        yPercent: 50,
        title: 'Portal',
        type: 'room_link',
        category: 'portal',
        description: '',
        targetRoomId: 'roomB',
        icon: 'door',
        color: 'emerald',
      },
      {
        id: 'hp-a-info',
        xPercent: 25,
        yPercent: 60,
        title: 'Note',
        type: 'info',
        category: 'custom',
        description: 'info text',
        article: 'info text',
        icon: 'info',
        color: 'cyan',
      },
    ],
  },
  {
    id: 'roomB',
    name: 'B',
    subtitle: 'Test B',
    panoramaUrl: 'https://example.com/b.jpg',
    thumbnailUrl: 'https://example.com/b.jpg',
    initialYaw: 0,
    initialPitch: -5,
    defaultHotspots: [],
  },
];

describe('marzipano exporter', () => {
  it('writes data.js and app-data.json with valid shape', async () => {
    const blob = await exportTourToZip(fixture, { tourName: 'Round Trip' });
    const zip = await JSZip.loadAsync(blob);
    const dataJson = await zip.file('app-data.json')!.async('string');
    const dataJs = await zip.file('data.js')!.async('string');

    const parsed = JSON.parse(dataJson);
    expect(parsed.scenes.length).toBe(2);
    expect(parsed.name).toBe('Round Trip');
    expect(parsed.settings.mouseViewMode).toBe('drag');

    // data.js contains a `var data = ...;` wrapper.
    expect(dataJs).toMatch(/^var data\s*=/);
  });

  it('honors viewer settings (QTVR + autorotate)', async () => {
    const blob = await exportTourToZip(fixture, {
      tourName: 'QTVR Tour',
      viewerSettings: {
        mouseViewMode: 'qtvr',
        autorotateEnabled: true,
        fullscreenButton: false,
        viewControlButtons: false,
      },
    });
    const zip = await JSZip.loadAsync(blob);
    const dataJson = await zip.file('app-data.json')!.async('string');
    const parsed = JSON.parse(dataJson);
    expect(parsed.settings.mouseViewMode).toBe('qtvr');
    expect(parsed.settings.autorotateEnabled).toBe(true);
    expect(parsed.settings.fullscreenButton).toBe(false);
    expect(parsed.settings.viewControlButtons).toBe(false);
  });

  it('round-trips scene IDs and hotspot counts', async () => {
    const blob = await exportTourToZip(fixture);
    const zip = await JSZip.loadAsync(blob);
    const text = await zip.file('app-data.json')!.async('string');
    const parsed = JSON.parse(text);

    const sceneA = parsed.scenes.find((s: any) => s.id === 'roomA');
    expect(sceneA).toBeDefined();
    expect(sceneA.linkHotspots.length).toBe(1);
    expect(sceneA.infoHotspots.length).toBe(1);
    expect(sceneA.linkHotspots[0].target).toBe('roomB');
  });

  it('preserves yaw/pitch within 1e-6', async () => {
    const blob = await exportTourToZip(fixture);
    const zip = await JSZip.loadAsync(blob);
    const text = await zip.file('app-data.json')!.async('string');
    const parsed = JSON.parse(text);
    const sceneA = parsed.scenes.find((s: any) => s.id === 'roomA');
    const ivp = sceneA.initialViewParameters;
    expect(ivp.yaw).toBeCloseTo(Math.PI / 2, 6);
    expect(ivp.pitch).toBeCloseTo(0, 6);
  });

  it('generates a filename with timestamp', () => {
    const name = makeExportFilename('My Tour');
    expect(name).toMatch(/^My-Tour-marzipano-\d{8}-\d{4}\.zip$/);
  });
});