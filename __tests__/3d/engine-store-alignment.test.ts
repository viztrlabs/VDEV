/**
 * Tests for engineStore alignment actions.
 *
 * Verifies that setSpatialAlignment, addAlignmentMarker, removeAlignmentMarker,
 * resetAlignment, and clearAlignmentDirty work correctly.
 */

import { useEngineStore } from '@/lib/editor/engineStore';
import { IDENTITY_ALIGNMENT } from '@/lib/3d/bridge/spatial';
import type { SpatialAlignment, AlignmentMarker } from '@/lib/3d/bridge/types';

// Reset store before each test
beforeEach(() => {
  useEngineStore.setState({
    spatialAlignment: { ...IDENTITY_ALIGNMENT },
    alignmentMarkers: [],
    alignmentDirty: false,
  });
});

describe('engineStore alignment actions', () => {
  describe('setSpatialAlignment', () => {
    it('sets alignment and marks dirty', () => {
      const newAlignment: SpatialAlignment = {
        position: { x: 1, y: 2, z: 3 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        scale: 2,
      };

      useEngineStore.getState().setSpatialAlignment(newAlignment);

      const state = useEngineStore.getState();
      expect(state.spatialAlignment.position).toEqual({ x: 1, y: 2, z: 3 });
      expect(state.spatialAlignment.scale).toBe(2);
      expect(state.alignmentDirty).toBe(true);
    });

    it('replaces previous alignment', () => {
      const alignment1: SpatialAlignment = {
        position: { x: 1, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        scale: 1,
      };
      const alignment2: SpatialAlignment = {
        position: { x: 0, y: 5, z: 0 },
        rotation: { x: 0, y: 0.5, z: 0, w: 0.866 },
        scale: 3,
      };

      useEngineStore.getState().setSpatialAlignment(alignment1);
      useEngineStore.getState().setSpatialAlignment(alignment2);

      const state = useEngineStore.getState();
      expect(state.spatialAlignment.position).toEqual({ x: 0, y: 5, z: 0 });
      expect(state.spatialAlignment.scale).toBe(3);
    });
  });

  describe('addAlignmentMarker', () => {
    it('adds marker to array and marks dirty', () => {
      const marker: AlignmentMarker = {
        id: 'test-marker-1',
        yaw: 0.5,
        pitch: 0.3,
        panoramaDirection: { x: 1, y: 0, z: 0 },
        worldPoint: { x: 10, y: 0, z: 5 },
        label: 'Test Landmark',
      };

      useEngineStore.getState().addAlignmentMarker(marker);

      const state = useEngineStore.getState();
      expect(state.alignmentMarkers).toHaveLength(1);
      expect(state.alignmentMarkers[0].id).toBe('test-marker-1');
      expect(state.alignmentDirty).toBe(true);
    });

    it('accumulates multiple markers', () => {
      const marker1: AlignmentMarker = {
        id: 'm1', yaw: 0, pitch: 0,
        panoramaDirection: { x: 1, y: 0, z: 0 },
        worldPoint: { x: 0, y: 0, z: 0 },
      };
      const marker2: AlignmentMarker = {
        id: 'm2', yaw: 1, pitch: 0,
        panoramaDirection: { x: 0, y: 1, z: 0 },
        worldPoint: { x: 5, y: 0, z: 0 },
      };

      useEngineStore.getState().addAlignmentMarker(marker1);
      useEngineStore.getState().addAlignmentMarker(marker2);

      const state = useEngineStore.getState();
      expect(state.alignmentMarkers).toHaveLength(2);
      expect(state.alignmentMarkers.map((m) => m.id)).toEqual(['m1', 'm2']);
    });
  });

  describe('removeAlignmentMarker', () => {
    it('removes marker by id', () => {
      const marker1: AlignmentMarker = {
        id: 'm1', yaw: 0, pitch: 0,
        panoramaDirection: { x: 1, y: 0, z: 0 },
        worldPoint: { x: 0, y: 0, z: 0 },
      };
      const marker2: AlignmentMarker = {
        id: 'm2', yaw: 1, pitch: 0,
        panoramaDirection: { x: 0, y: 1, z: 0 },
        worldPoint: { x: 5, y: 0, z: 0 },
      };

      useEngineStore.getState().addAlignmentMarker(marker1);
      useEngineStore.getState().addAlignmentMarker(marker2);
      useEngineStore.getState().removeAlignmentMarker('m1');

      const state = useEngineStore.getState();
      expect(state.alignmentMarkers).toHaveLength(1);
      expect(state.alignmentMarkers[0].id).toBe('m2');
    });

    it('handles removing non-existent marker gracefully', () => {
      const marker: AlignmentMarker = {
        id: 'm1', yaw: 0, pitch: 0,
        panoramaDirection: { x: 1, y: 0, z: 0 },
        worldPoint: { x: 0, y: 0, z: 0 },
      };

      useEngineStore.getState().addAlignmentMarker(marker);
      useEngineStore.getState().removeAlignmentMarker('non-existent');

      const state = useEngineStore.getState();
      expect(state.alignmentMarkers).toHaveLength(1);
    });
  });

  describe('resetAlignment', () => {
    it('resets to identity alignment and clears markers', () => {
      // Set non-identity alignment
      useEngineStore.getState().setSpatialAlignment({
        position: { x: 5, y: 5, z: 5 },
        rotation: { x: 0, y: 0.5, z: 0, w: 0.866 },
        scale: 3,
      });
      useEngineStore.getState().addAlignmentMarker({
        id: 'm1', yaw: 0, pitch: 0,
        panoramaDirection: { x: 1, y: 0, z: 0 },
        worldPoint: { x: 0, y: 0, z: 0 },
      });

      useEngineStore.getState().resetAlignment();

      const state = useEngineStore.getState();
      expect(state.spatialAlignment.position).toEqual({ x: 0, y: 0, z: 0 });
      expect(state.spatialAlignment.rotation).toEqual({ x: 0, y: 0, z: 0, w: 1 });
      expect(state.spatialAlignment.scale).toBe(1);
      expect(state.alignmentMarkers).toHaveLength(0);
      expect(state.alignmentDirty).toBe(true);
    });
  });

  describe('clearAlignmentDirty', () => {
    it('clears dirty flag', () => {
      useEngineStore.getState().setSpatialAlignment({
        position: { x: 1, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        scale: 1,
      });
      expect(useEngineStore.getState().alignmentDirty).toBe(true);

      useEngineStore.getState().clearAlignmentDirty();
      expect(useEngineStore.getState().alignmentDirty).toBe(false);
    });
  });

  describe('alignment round-trip via snapshot', () => {
    it('loadSnapshot restores alignment state', () => {
      const alignment: SpatialAlignment = {
        position: { x: 10, y: 20, z: 30 },
        rotation: { x: 0, y: 0.707, z: 0, w: 0.707 },
        scale: 2.5,
      };
      const markers: AlignmentMarker[] = [
        {
          id: 'm1', yaw: 0.5, pitch: 0.3,
          panoramaDirection: { x: 1, y: 0, z: 0 },
          worldPoint: { x: 100, y: 0, z: 50 },
          label: 'Landmark 1',
        },
      ];

      // Simulate a snapshot with alignment
      const snapshot = {
        id: 'scene-1',
        version: 1,
        name: 'Test Scene',
        engine: 'playcanvas' as const,
        camera: { position: [0, 0, 5] as [number, number, number], target: [0, 0, 0] as [number, number, number], fov: 60 },
        entities: [],
        materials: [],
        hotspots: [],
        spatialAlignment: alignment,
        alignmentMarkers: markers,
        updatedAt: new Date().toISOString(),
      };

      useEngineStore.getState().loadSnapshot(snapshot);

      const state = useEngineStore.getState();
      expect(state.spatialAlignment.position).toEqual({ x: 10, y: 20, z: 30 });
      expect(state.spatialAlignment.scale).toBe(2.5);
      expect(state.alignmentMarkers).toHaveLength(1);
      expect(state.alignmentMarkers[0].label).toBe('Landmark 1');
    });

    it('loadSnapshot without alignment preserves defaults', () => {
      const snapshot = {
        id: 'scene-1',
        version: 1,
        name: 'Test Scene',
        engine: 'playcanvas' as const,
        camera: { position: [0, 0, 5] as [number, number, number], target: [0, 0, 0] as [number, number, number], fov: 60 },
        entities: [],
        materials: [],
        hotspots: [],
        updatedAt: new Date().toISOString(),
      };

      useEngineStore.getState().loadSnapshot(snapshot);

      const state = useEngineStore.getState();
      expect(state.spatialAlignment).toEqual(IDENTITY_ALIGNMENT);
      expect(state.alignmentMarkers).toHaveLength(0);
    });
  });
});
