import { render, screen, fireEvent } from '@testing-library/react';
import { RoomManager } from '@/components/tour-builder/RoomManager';
import { useTourStore } from '@/lib/tourClientStore';

describe('RoomManager', () => {
  beforeEach(() => {
    useTourStore.getState().setScenes([]);
  });

  it('renders empty state', () => {
    render(<RoomManager selectedRoomId="" onSelectRoom={() => {}} />);
    expect(screen.getByText('Your tour is empty.')).toBeInTheDocument();
  });

  it('renders rooms list', () => {
    useTourStore.getState().setScenes([
      {
        id: 'room-1',
        name: 'Living Room',
        type: '360',
        url: '',
        thumbnailUrl: '',
        initialYaw: 0,
        initialPitch: 0,
        initialFov: 75,
        hotspots: [],
      } as any,
    ]);

    render(<RoomManager selectedRoomId="" onSelectRoom={() => {}} />);
    expect(screen.getByText('Living Room')).toBeInTheDocument();
  });

  it('calls onSelectRoom when clicking a room', () => {
    const onSelectRoom = jest.fn();
    useTourStore.getState().setScenes([
      {
        id: 'room-1',
        name: 'Living Room',
        type: '360',
        url: '',
        thumbnailUrl: '',
        initialYaw: 0,
        initialPitch: 0,
        initialFov: 75,
        hotspots: [],
      } as any,
    ]);

    render(<RoomManager selectedRoomId="" onSelectRoom={onSelectRoom} />);
    fireEvent.click(screen.getByText('Living Room'));
    expect(onSelectRoom).toHaveBeenCalledWith('room-1');
  });

  it('adds a new room when clicking Add Room', () => {
    render(<RoomManager selectedRoomId="" onSelectRoom={() => {}} />);
    fireEvent.click(screen.getByText('Add First Room'));
    const scenes = useTourStore.getState().scenes;
    expect(scenes.length).toBe(1);
    expect(scenes[0].name).toBe('Room 1');
  });
});
