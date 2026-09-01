/**
 * Engine abstraction unit tests
 *
 * Verifies that:
 *   - ENGINES registry has both engines
 *   - getDefaultEngine() honors the env var override
 *   - getEngine() throws on unknown ids
 *   - engineSupports() returns correct capability booleans
 */

import { ENGINES, getDefaultEngine, getEngine, engineSupports } from '../../lib/3d/engine';

describe('engine abstraction', () => {
  describe('ENGINES registry', () => {
    it('registers both three and playcanvas', () => {
      expect(ENGINES.three).toBeDefined();
      expect(ENGINES.playcanvas).toBeDefined();
      expect(ENGINES.three.id).toBe('three');
      expect(ENGINES.playcanvas.id).toBe('playcanvas');
    });

    it('declares the same capability set for both engines', () => {
      // Both engines should be feature-equivalent at the capability level;
      // the actual implementations differ but both should be sufficient
      // for the Viewer Dashboard.
      const threeCaps = ENGINES.three.capabilities;
      const pcCaps = ENGINES.playcanvas.capabilities;
      for (const k of Object.keys(threeCaps) as Array<keyof typeof threeCaps>) {
        expect(pcCaps[k]).toBe(threeCaps[k]);
      }
    });

    it('declares viewer capability true for both', () => {
      expect(ENGINES.three.capabilities.viewer).toBe(true);
      expect(ENGINES.playcanvas.capabilities.viewer).toBe(true);
    });

    it('declares xr capability true for both', () => {
      expect(ENGINES.three.capabilities.xr).toBe(true);
      expect(ENGINES.playcanvas.capabilities.xr).toBe(true);
    });
  });

  describe('getDefaultEngine()', () => {
    const originalEnv = process.env.NEXT_PUBLIC_ENGINE;

    afterEach(() => {
      if (originalEnv === undefined) delete process.env.NEXT_PUBLIC_ENGINE;
      else process.env.NEXT_PUBLIC_ENGINE = originalEnv;
    });

    it("returns 'three' when no env var is set", () => {
      delete process.env.NEXT_PUBLIC_ENGINE;
      expect(getDefaultEngine()).toBe('three');
    });

    it("returns 'playcanvas' when env var is set", () => {
      process.env.NEXT_PUBLIC_ENGINE = 'playcanvas';
      expect(getDefaultEngine()).toBe('playcanvas');
    });

    it("returns 'three' when env var is invalid (defensive default)", () => {
      process.env.NEXT_PUBLIC_ENGINE = 'unknown-engine';
      expect(getDefaultEngine()).toBe('three');
    });
  });

  describe('getEngine()', () => {
    it('returns the three descriptor when id is omitted', () => {
      const e = getEngine();
      expect(e.id).toBe('three');
      expect(e.name).toBe('Three.js');
    });

    it('returns the playcanvas descriptor when id is explicit', () => {
      const e = getEngine('playcanvas');
      expect(e.id).toBe('playcanvas');
      expect(e.name).toBe('PlayCanvas');
    });

    it('throws on unknown engine id', () => {
      // @ts-expect-error - testing runtime guard, not types
      expect(() => getEngine('not-a-real-engine')).toThrow(/Unknown engine id/);
    });
  });

  describe('engineSupports()', () => {
    it('returns true for capabilities the engine declares', () => {
      expect(engineSupports('three', 'xr')).toBe(true);
      expect(engineSupports('playcanvas', 'splat')).toBe(true);
    });

    it('returns false for unknown engine ids', () => {
      // @ts-expect-error - testing runtime guard
      expect(engineSupports('not-real', 'xr')).toBe(false);
    });
  });
});
