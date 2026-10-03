/**
 * Regression: the builder viewport creates navigation hotspots with
 * type 'navigation', which validateTour checks for targetSceneId.
 * The old builder created type 'link', validated for externalUrl instead.
 * New file: __tests__/tour-builder/validation.test.tsx is failing at the
 * pre-existing baseline and must not be touched.
 */
import { validateTour } from '@/components/tour-builder/ValidationPanel';
import type { TourScene, TourHotspot } from '@/lib/tourClientStore';

const scene = (hotspots: TourHotspot[]): TourScene => ({
  id: 'r1', name: 'Lobby', type: '360', url: 'https://x/pano.jpg', thumbnailUrl: '',
  initialYaw: 10, initialPitch: 5, initialFov: 75, hotspots,
  viewConstraints: {
    top: -90, bottom: 90, left: -180, right: 180,
    zoomMin: 60, zoomMax: 120, mobileZoomEnabled: false,
  },
  autorotateEnabled: false, autorotateSpeed: 1,
});

describe('navigation hotspot type validation', () => {
  it('flags a navigation hotspot with no target room', () => {
    const issues = validateTour([scene([
      { id: 'h1', yaw: 0, pitch: 0, type: 'navigation', title: 'Navigate', description: '' },
    ])]);
    expect(issues.find((i) => i.id === 'h1-no-target')).toBeTruthy();
  });

  it('accepts a navigation hotspot with a target room', () => {
    const issues = validateTour([scene([
      { id: 'h1', yaw: 0, pitch: 0, type: 'navigation', title: 'Navigate', description: '', targetSceneId: 'r2' },
    ])]);
    expect(issues.find((i) => i.id === 'h1-no-target')).toBeUndefined();
  });

  it('still flags link hotspots missing an external URL', () => {
    const issues = validateTour([scene([
      { id: 'h2', yaw: 0, pitch: 0, type: 'link', title: 'Link', description: '' },
    ])]);
    expect(issues.find((i) => i.id === 'h2-no-url')).toBeTruthy();
  });
});
