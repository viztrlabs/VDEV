import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditorRightSidebar } from '@/components/editor/shell/EditorRightSidebar';
import type { TourRoom } from '@/data/tour-config';

beforeAll(() => {
  // jsdom 20 has no PointerEvent; routing to MouseEvent keeps clientX intact
  (global as any).PointerEvent = global.MouseEvent;
});

jest.mock('@/components/editor/SceneConfigPanel', () => ({
  __esModule: true,
  default: () => <div data-testid="scene-config-panel" />,
}));
jest.mock('@/components/editor/ViewConstraintsPanel', () => ({
  __esModule: true,
  default: () => <div data-testid="view-constraints-panel" />,
}));
jest.mock('@/components/editor/shell/HotspotInspector', () => ({
  HotspotInspector: () => <div data-testid="hotspot-inspector" />,
}));

const room: TourRoom = {
  id: 'r1',
  name: 'Room 1',
  subtitle: '',
  panoramaUrl: 'pano.jpg',
  thumbnailUrl: '',
  initialYaw: 0,
  initialPitch: 0,
  defaultHotspots: [],
};

function renderSidebar() {
  return render(
    <EditorRightSidebar
      selected={room}
      allRooms={[room]}
      onUpdateRoom={jest.fn()}
      onReplacePanorama={jest.fn()}
      onUploadAudio={jest.fn()}
      onSetFeatured={jest.fn()}
      uploading={false}
      onUpdateHotspot={jest.fn()}
      onDeleteHotspot={jest.fn()}
      onCopyHotspot={jest.fn()}
      onSetPortalTarget={jest.fn()}
      onCollapse={jest.fn()}
    />,
  );
}

describe('EditorRightSidebar resize', () => {
  it('renders at the default 320px width', () => {
    const { container } = renderSidebar();
    const aside = container.querySelector('aside');
    expect(aside).toHaveStyle('width: 320px');
  });

  it('widens when the left-edge handle is dragged left', () => {
    const { container } = renderSidebar();
    const aside = container.querySelector('aside');
    const handle = screen.getByLabelText('Resize inspector panel');

    fireEvent.pointerDown(handle, { clientX: 400, pointerId: 1 });
    fireEvent.pointerMove(window, { clientX: 300, pointerId: 1 });
    fireEvent.pointerUp(window, { pointerId: 1 });

    // 320 + (400 - 300) = 420
    expect(aside).toHaveStyle('width: 420px');
  });

  it('clamps the width between 260px and 480px', () => {
    const { container } = renderSidebar();
    const aside = container.querySelector('aside');
    const handle = screen.getByLabelText('Resize inspector panel');

    // drag far right -> shrink clamp at 260
    fireEvent.pointerDown(handle, { clientX: 400, pointerId: 1 });
    fireEvent.pointerMove(window, { clientX: 5000, pointerId: 1 });
    fireEvent.pointerUp(window, { pointerId: 1 });
    expect(aside).toHaveStyle('width: 260px');

    // drag far left -> grow clamp at 480
    fireEvent.pointerDown(handle, { clientX: 400, pointerId: 1 });
    fireEvent.pointerMove(window, { clientX: -5000, pointerId: 1 });
    fireEvent.pointerUp(window, { pointerId: 1 });
    expect(aside).toHaveStyle('width: 480px');
  });
});

describe('EditorRightSidebar render', () => {
  it('renders all three settings panels', () => {
    renderSidebar();
    expect(screen.getByTestId('scene-config-panel')).toBeInTheDocument();
    expect(screen.getByTestId('view-constraints-panel')).toBeInTheDocument();
    expect(screen.getByTestId('hotspot-inspector')).toBeInTheDocument();
  });

  it('does not make the Inspector header an accordion toggle', () => {
    renderSidebar();
    const header = screen.getByText('Inspector');
    fireEvent.doubleClick(header);
    expect(screen.getByTestId('scene-config-panel')).toBeInTheDocument();
    expect(screen.getByTestId('view-constraints-panel')).toBeInTheDocument();
    expect(screen.getByTestId('hotspot-inspector')).toBeInTheDocument();
  });
});