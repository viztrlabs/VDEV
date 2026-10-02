import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GyroscopeControl, createDeviceOrientationMethod } from '@/components/tour-viewer/GyroscopeControl';

jest.mock('marzipano', () => ({
  Dynamics: class {
    offset = 0;
  },
  util: { degToRad: (d: number) => (d * Math.PI) / 180 },
  dependencies: {
    eventEmitter: (obj: any) => {
      const listeners: Record<string, Function[]> = {};
      obj.addEventListener = (ev: string, cb: Function) => { (listeners[ev] ||= []).push(cb); };
      obj.removeEventListener = (ev: string, cb: Function) => {
        const l = listeners[ev]; if (l) { const i = l.indexOf(cb); if (i >= 0) l.splice(i, 1); }
      };
      obj.emit = (ev: string, ...args: unknown[]) => { (listeners[ev] || []).forEach((cb) => cb(...args)); };
    },
  },
}));

describe('GyroscopeControl', () => {
  const controlsMock: any = {
    registerMethod: jest.fn(),
    enableMethod: jest.fn(),
    disableMethod: jest.fn(),
  };
  const base = {
    getMarzipano: jest.fn(() => jest.requireMock('marzipano')),
    getViewer: jest.fn(() => ({ controls: () => controlsMock })),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    delete controlsMock.__deviceOrientationRegistered;
    (window as any).DeviceOrientationEvent = class {};
  });

  it('toggles on and enables the deviceOrientation method', async () => {
    render(<GyroscopeControl {...base} />);
    fireEvent.click(screen.getByLabelText('Toggle gyroscope control'));
    await waitFor(() => {
      const controls = base.getViewer().controls();
      expect(controls.enableMethod).toHaveBeenCalledWith('deviceOrientation');
      expect(controls.registerMethod).toHaveBeenCalledWith('deviceOrientation', expect.anything());
    });
    expect(screen.getByLabelText('Toggle gyroscope control').getAttribute('aria-pressed')).toBe('true');
  });

  it('toggles off and disables the method', async () => {
    render(<GyroscopeControl {...base} />);
    fireEvent.click(screen.getByLabelText('Toggle gyroscope control'));
    await waitFor(() => {
      expect(base.getViewer().controls().enableMethod).toHaveBeenCalled();
    });
    fireEvent.click(screen.getByLabelText('Toggle gyroscope control'));
    expect(base.getViewer().controls().disableMethod).toHaveBeenCalledWith('deviceOrientation');
  });

  it('shows an unsupported bubble when DeviceOrientationEvent is missing', async () => {
    delete (window as any).DeviceOrientationEvent;
    render(<GyroscopeControl {...base} />);
    fireEvent.click(screen.getByLabelText('Toggle gyroscope control'));
    await waitFor(() => expect(screen.getByText('Gyroscope not supported')).toBeInTheDocument());
  });
});

describe('createDeviceOrientationMethod', () => {
  class DeviceOrientationEventStub extends Event {
    alpha: number;
    beta: number;
    gamma: number;
    constructor(type: string, props: { alpha?: number; beta?: number; gamma?: number } = {}) {
      super(type);
      this.alpha = props.alpha ?? 0;
      this.beta = props.beta ?? 0;
      this.gamma = props.gamma ?? 0;
    }
  }

  beforeAll(() => {
    (globalThis as any).DeviceOrientationEvent = DeviceOrientationEventStub;
    (window as any).DeviceOrientationEvent = DeviceOrientationEventStub;
  });

  afterAll(() => {
    delete (globalThis as any).DeviceOrientationEvent;
    delete (window as any).DeviceOrientationEvent;
  });

  it('emits yaw/pitch parameterDynamics from deviceorientation deltas', () => {
    const method = createDeviceOrientationMethod(jest.requireMock('marzipano'));
    const emitted: Array<[string, unknown]> = [];
    method.addEventListener('parameterDynamics', (p: string, d: unknown) => emitted.push([p, d]));

    window.dispatchEvent(new DeviceOrientationEventStub('deviceorientation', { alpha: 90, beta: 0, gamma: 0 }));
    window.dispatchEvent(new DeviceOrientationEventStub('deviceorientation', { alpha: 100, beta: 10, gamma: 0 }));

    const names = emitted.map(([p]) => p);
    expect(names).toContain('yaw');
    expect(names).toContain('pitch');

    method.__cleanup?.();
  });
});
