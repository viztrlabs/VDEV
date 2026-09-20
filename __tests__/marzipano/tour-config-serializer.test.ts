/**
 * Tests for tour-config-serializer.
 *
 * Verifies that serializeTourForExperienceConfig correctly includes
 * alignment data in the Experience Config output.
 */

import { serializeTourForExperienceConfig } from '@/lib/marzipano/tour-config-serializer';
import { IDENTITY_ALIGNMENT } from '@/lib/3d/bridge/spatial';
import type { SpatialAlignment, AlignmentMarker } from '@/lib/3d/bridge/types';

describe('serializeTourForExperienceConfig', () => {
  const mockRooms = [
    {
      id: 'room-1',
      name: 'Living Room',
      panoramaUrl: 'https://example.com/panorama1.jpg',
      thumbnailUrl: 'https://example.com/thumb1.jpg',
      initialYaw: 45,
      initialPitch: 10,
      defaultHotspots: [
        {
          id: 'hs-1',
          xPercent: 50,
          yPercent: 50,
          title: 'Link to Kitchen',
          type: 'room_link',
          category: 'portal',
          description: 'Go to kitchen',
          targetRoomId: 'room-2',
        },
      ],
      spatialAlignment: {
        position: { x: 10, y: 0, z: 5 },
        rotation: { x: 0, y: 0.707, z: 0, w: 0.707 },
        scale: 2,
      } as SpatialAlignment,
      alignmentMarkers: [
        {
          id: 'marker-1',
          yaw: 0.5,
          pitch: 0.3,
          panoramaDirection: { x: 1, y: 0, z: 0 },
          worldPoint: { x: 100, y: 0, z: 50 },
          label: 'Corner',
        },
      ] as AlignmentMarker[],
    },
    {
      id: 'room-2',
      name: 'Kitchen',
      panoramaUrl: 'https://example.com/panorama2.jpg',
      thumbnailUrl: 'https://example.com/thumb2.jpg',
      initialYaw: 0,
      initialPitch: 0,
      defaultHotspots: [],
      // No alignment data — should get defaults
    },
  ];

  it('includes spatialAlignment on rooms that have it', () => {
    const result = serializeTourForExperienceConfig(mockRooms, null, 'proj-1');

    expect(result.tour.rooms[0].spatialAlignment).toEqual({
      position: { x: 10, y: 0, z: 5 },
      rotation: { x: 0, y: 0.707, z: 0, w: 0.707 },
      scale: 2,
    });
  });

  it('includes alignmentMarkers on rooms that have them', () => {
    const result = serializeTourForExperienceConfig(mockRooms, null, 'proj-1');

    expect(result.tour.rooms[0].alignmentMarkers).toHaveLength(1);
    expect(result.tour.rooms[0].alignmentMarkers![0].id).toBe('marker-1');
    expect(result.tour.rooms[0].alignmentMarkers![0].label).toBe('Corner');
  });

  it('provides default alignment for rooms without it', () => {
    const result = serializeTourForExperienceConfig(mockRooms, null, 'proj-1');

    expect(result.tour.rooms[1].spatialAlignment).toEqual(IDENTITY_ALIGNMENT);
    expect(result.tour.rooms[1].alignmentMarkers).toEqual([]);
  });

  it('includes alignment metadata in settings', () => {
    const result = serializeTourForExperienceConfig(mockRooms, null, 'proj-1');

    expect(result.settings.tour.hasAlignment).toBe(true);
    expect(result.metadata.alignmentCount).toBe(1);
  });

  it('sets hasAlignment to false when no rooms have non-identity alignment', () => {
    const roomsWithoutAlignment = [
      { ...mockRooms[1], id: 'room-a', name: 'A', panoramaUrl: 'a.jpg' },
      { ...mockRooms[1], id: 'room-b', name: 'B', panoramaUrl: 'b.jpg' },
    ];

    const result = serializeTourForExperienceConfig(roomsWithoutAlignment, null, 'proj-1');

    expect(result.settings.tour.hasAlignment).toBe(false);
  });

  it('produces valid Experience Config POST payload structure', () => {
    const result = serializeTourForExperienceConfig(
      mockRooms,
      { version: 2 },
      'proj-1',
      'exp-1',
    );

    // Check top-level structure
    expect(result.tour.engine).toBe('tour');
    expect(result.tour.rooms).toHaveLength(2);
    expect(result.tour.initialRoom).toBe('room-1');
    expect(result.assets).toHaveLength(2);
    expect(result.settings.tour.version).toBe(2);
    expect(result.settings.metadata.projectId).toBe('proj-1');
    expect(result.settings.metadata.experienceId).toBe('exp-1');
  });

  it('preserves hotspot data alongside alignment', () => {
    const result = serializeTourForExperienceConfig(mockRooms, null, 'proj-1');

    const hotspots = result.tour.rooms[0].hotspots;
    expect(hotspots).toHaveLength(1);
    expect(hotspots[0].id).toBe('hs-1');
    expect(hotspots[0].targetRoomId).toBe('room-2');
  });

  it('handles empty rooms array', () => {
    const result = serializeTourForExperienceConfig([], null, 'proj-1');

    expect(result.tour.rooms).toEqual([]);
    expect(result.tour.initialRoom).toBe('');
    expect(result.assets).toEqual([]);
  });

  it('handles rooms with only some alignment fields', () => {
    const roomsPartial = [
      {
        id: 'room-partial',
        name: 'Partial',
        panoramaUrl: 'p.jpg',
        defaultHotspots: [],
        spatialAlignment: {
          position: { x: 5, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: 1,
        },
        // No alignmentMarkers
      },
    ];

    const result = serializeTourForExperienceConfig(roomsPartial, null, 'proj-1');

    expect(result.tour.rooms[0].spatialAlignment!.position.x).toBe(5);
    expect(result.tour.rooms[0].alignmentMarkers).toEqual([]);
  });
});
