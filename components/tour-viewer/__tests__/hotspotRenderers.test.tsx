import {
  renderViewerHotspot, renderAlignmentMarker, destroyHotspotElement,
} from '@/components/tour-viewer/hotspotRenderers';
import type { TourHotspot } from '@/lib/tourClientStore';

const hs = (over: Partial<TourHotspot> = {}): TourHotspot => ({
  id: 'h1', yaw: 0, pitch: 0, type: 'navigation', title: 'Door', description: '', ...over,
});

describe('hotspotRenderers', () => {
  it('renders an accessible button for viewer hotspots', () => {
    const el = renderViewerHotspot(hs());
    expect(el.getAttribute('role')).toBe('button');
    expect(el.getAttribute('tabIndex')).toBe('0');
    expect(el.getAttribute('aria-label')).toContain('Door');
  });

  it('renders all 12 hotspot types with a colored dot', () => {
    const types = ['navigation', 'floor', 'info', 'link', 'image', 'gallery',
      'video', 'audio', 'model3d', 'splat', 'experience', 'custom'];
    for (const type of types) {
      const el = renderViewerHotspot(hs({ type: type as TourHotspot['type'] }));
      const dot = el.querySelector('div')!;
      expect(dot.className).toContain('rounded-full');
    }
  });

  it('applies size, opacity, animation and label appearance fields', () => {
    const el = renderViewerHotspot(hs({ size: 2, opacity: 0.5, animation: 'pulse', label: 'Go here' }));
    const dot = el.querySelector('div')!;
    expect(dot.style.width).toBe('32px');
    expect(dot.style.opacity).toBe('0.5');
    expect(dot.className).toContain('animate-pulse');
    expect(el.textContent).toContain('Go here');
  });

  it('activates on click and on Enter key', () => {
    const onActivate = jest.fn();
    const el = renderViewerHotspot(hs(), onActivate);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(onActivate).toHaveBeenCalledTimes(2);
  });

  it('stops propagation so the panorama container does not receive clicks', () => {
    const onActivate = jest.fn();
    const onParentClick = jest.fn();
    const parent = document.createElement('div');
    parent.addEventListener('click', onParentClick);
    parent.appendChild(renderViewerHotspot(hs(), onActivate));
    parent.querySelector('.viztr-hotspot')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onParentClick).not.toHaveBeenCalled();
  });

  it('renders alignment markers with role img and amber styling', () => {
    const el = renderAlignmentMarker({ id: 'm1', label: 'North wall', yaw: 0, pitch: 0 });
    expect(el.getAttribute('role')).toBe('img');
    expect(el.getAttribute('aria-label')).toContain('North wall');
    expect(el.querySelector('div')!.className).toContain('bg-amber-500');
  });

  it('applies rotation to the dot only when non-zero', () => {
    const base = hs();
    const rotated = renderViewerHotspot({ ...base, rotation: 45 });
    const dot = rotated.firstElementChild as HTMLElement;
    expect(dot.style.transform).toBe('rotate(45deg)');
    const plain = renderViewerHotspot(base);
    expect((plain.firstElementChild as HTMLElement).style.transform).toBe('');
  });

  it('destroyHotspotElement removes listeners and the element', () => {
    const onActivate = jest.fn();
    const parent = document.createElement('div');
    const el = renderViewerHotspot(hs(), onActivate);
    parent.appendChild(el);
    destroyHotspotElement(el);
    expect(el.parentElement).toBeNull();
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onActivate).not.toHaveBeenCalled();
  });
});
