import { yawPitchToXYPercents, xyPercentsToYawPitch } from '../coords';

describe('marzipano coords', () => {
  describe('yawPitchToXYPercents', () => {
    it('maps yaw=0, pitch=0 to image center (50, 50)', () => {
      expect(yawPitchToXYPercents(0, 0)).toEqual({ x: 50, y: 50 });
    });

    it('maps yaw=+π/2 to x=75% (one quarter past center)', () => {
      const result = yawPitchToXYPercents(Math.PI / 2, 0);
      expect(result.x).toBeCloseTo(75, 10);
      expect(result.y).toBeCloseTo(50, 10);
    });

    it('maps yaw=-π/2 to x=25% (one quarter before center)', () => {
      const result = yawPitchToXYPercents(-Math.PI / 2, 0);
      expect(result.x).toBeCloseTo(25, 10);
      expect(result.y).toBeCloseTo(50, 10);
    });

    it('maps yaw=+π to x=100% (right edge / back wrap)', () => {
      const result = yawPitchToXYPercents(Math.PI, 0);
      expect(result.x).toBeCloseTo(100, 10);
    });

    it('maps yaw=-π to x=0% (left edge / back wrap)', () => {
      const result = yawPitchToXYPercents(-Math.PI, 0);
      expect(result.x).toBeCloseTo(0, 10);
    });

    it('maps pitch=+π/2 to zenith (y=0)', () => {
      const result = yawPitchToXYPercents(0, Math.PI / 2);
      expect(result.x).toBeCloseTo(50, 10);
      expect(result.y).toBeCloseTo(0, 10);
    });

    it('maps pitch=-π/2 to nadir (y=100)', () => {
      const result = yawPitchToXYPercents(0, -Math.PI / 2);
      expect(result.x).toBeCloseTo(50, 10);
      expect(result.y).toBeCloseTo(100, 10);
    });

    it('clamps out-of-range values', () => {
      expect(yawPitchToXYPercents(Math.PI * 2, 0)).toEqual({ x: 100, y: 50 });
      expect(yawPitchToXYPercents(-Math.PI * 2, 0)).toEqual({ x: 0, y: 50 });
    });
  });

  describe('xyPercentsToYawPitch', () => {
    it('maps center (50, 50) to yaw=0, pitch=0', () => {
      expect(xyPercentsToYawPitch(50, 50)).toEqual({ yaw: 0, pitch: 0 });
    });

    it('maps x=75 to yaw=+π/2', () => {
      const result = xyPercentsToYawPitch(75, 50);
      expect(result.yaw).toBeCloseTo(Math.PI / 2, 10);
      expect(result.pitch).toBeCloseTo(0, 10);
    });

    it('maps x=25 to yaw=-π/2', () => {
      const result = xyPercentsToYawPitch(25, 50);
      expect(result.yaw).toBeCloseTo(-Math.PI / 2, 10);
      expect(result.pitch).toBeCloseTo(0, 10);
    });

    it('maps x=100 to yaw=+π (wrap to back)', () => {
      const result = xyPercentsToYawPitch(100, 50);
      expect(result.yaw).toBeCloseTo(Math.PI, 10);
    });

    it('maps x=0 to yaw=-π (wrap to back)', () => {
      const result = xyPercentsToYawPitch(0, 50);
      expect(result.yaw).toBeCloseTo(-Math.PI, 10);
    });

    it('maps zenith (50, 0) to pitch=+π/2', () => {
      const result = xyPercentsToYawPitch(50, 0);
      expect(result.yaw).toBeCloseTo(0, 10);
      expect(result.pitch).toBeCloseTo(Math.PI / 2, 10);
    });

    it('maps nadir (50, 100) to pitch=-π/2', () => {
      const result = xyPercentsToYawPitch(50, 100);
      expect(result.yaw).toBeCloseTo(0, 10);
      expect(result.pitch).toBeCloseTo(-Math.PI / 2, 10);
    });
  });

  describe('round-trip equality', () => {
    const samples = [
      { yaw: 0, pitch: 0 },
      { yaw: 1.2, pitch: -0.3 },
      { yaw: -2.7, pitch: 0.8 },
      { yaw: Math.PI / 4, pitch: Math.PI / 6 },
      { yaw: -Math.PI / 3, pitch: -Math.PI / 4 },
    ];

    it.each(samples)('round-trips yaw=$yaw pitch=$pitch via percentages', ({ yaw, pitch }) => {
      const { x, y } = yawPitchToXYPercents(yaw, pitch);
      const back = xyPercentsToYawPitch(x, y);
      expect(back.yaw).toBeCloseTo(yaw, 6);
      expect(back.pitch).toBeCloseTo(pitch, 6);
    });
  });
});