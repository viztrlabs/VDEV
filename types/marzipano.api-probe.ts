// Compile-only API probe: verifies the corrected marzipano.d.ts against the
// exact call shapes used by the app. Not matched by jest (not under
// __tests__ or *.test.* naming); checked via scoped tsc.
import {
  Viewer,
  RectilinearView,
  EquirectGeometry,
  ImageUrlSource,
  autorotate,
} from 'marzipano';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function probe(container: HTMLElement) {
  const viewer = new Viewer(container, {
    controls: { mouseViewMode: 'drag', scrollZoom: true, scrollZoomSpeed: 0.3 },
  });
  const source = ImageUrlSource.fromString('https://x/p.jpg', { crossOrigin: 'anonymous' });
  const tiles = ImageUrlSource.fromTileUrl('https://x/{z}/{y}/{x}.jpg', {
    crossOrigin: 'anonymous', tileSize: 512, maxZoom: 5,
  });
  const geometry = new EquirectGeometry([{ width: 4096 }]);
  const limiter = RectilinearView.limit.traditional(
    1024, (120 * Math.PI) / 180, (120 * Math.PI) / 180
  );
  const view = new RectilinearView({ yaw: 0, pitch: 0, fov: Math.PI / 2 }, limiter);
  const scene = viewer.createScene({ source, geometry, view, pinFirstLevel: true });

  scene.switchTo({ transitionDuration: 500 }, () => {});
  viewer.switchScene(scene, { transitionDuration: 500 }, () => {});
  viewer.switchScene(scene, null, () => {});
  viewer.switchScene(scene);

  const hotspotContainer = scene.hotspotContainer();
  const hs = hotspotContainer.createHotspot(document.createElement('div'), { yaw: 0, pitch: 0 });
  hotspotContainer.destroyHotspot(hs);
  hotspotContainer.listHotspots();

  const v = scene.view();
  v.yaw();
  v.yaw(0.5);
  v.pitch();
  v.fov();
  v.fovRange();
  v.screenToCoordinates({ x: 1, y: 1 });
  v.coordinatesToScreen({ yaw: 0, pitch: 0 });

  viewer.setIdleMovement(3000, autorotate({ yawSpeed: 0.1, targetPitch: null, targetFov: null }));
  viewer.setIdleMovement(3000, null);
  viewer.startMovement(() => null);
  viewer.stopMovement();
  viewer.addEventListener('viewChange', () => {});
  viewer.addEventListener('sceneChange', () => {});
  viewer.removeEventListener('viewChange', () => {});

  viewer.controls().registerMethod('deviceOrientation', {});
  viewer.controls().enableMethod('deviceOrientation');
  viewer.controls().disableMethod('deviceOrientation');

  viewer.scene();
  viewer.updateSize();
  viewer.destroy();

  void tiles;
}
