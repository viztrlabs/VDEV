import { useState, useEffect, useCallback } from 'react';
import { TourRoom, Hotspot } from '@/components/viewers/PanoramaViewer';

export interface UseTourNavigationOptions {
  rooms: TourRoom[];
  initialRoom?: TourRoom;
  onNavigate?: (room: TourRoom, yaw?: number) => void;
  showToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export function useTourNavigation({
  rooms,
  initialRoom,
  onNavigate,
  showToast,
}: UseTourNavigationOptions) {
  const [currentRoom, setCurrentRoom] = useState<TourRoom>(initialRoom || rooms[0]);
  const [roomHistory, setRoomHistory] = useState<string[]>([]);
  const [roomHistoryIndex, setRoomHistoryIndex] = useState(-1);

  // URL deep-linking: read ?scene=room-id on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const sceneId = params.get('scene');
    if (sceneId) {
      const found = rooms.find((r) => r.id === sceneId);
      if (found) {
        setCurrentRoom(found);
        onNavigate?.(found, found.initialYaw);
      }
    }
  }, []);

  // Update URL when room changes
  const updateUrlWithScene = useCallback((roomId: string) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('scene', roomId);
    window.history.replaceState(null, '', url.toString());
  }, []);

  const navigateToRoomWithHistory = useCallback(
    (room: TourRoom, targetYaw?: number) => {
      onNavigate?.(room, targetYaw);
      // Update history
      setRoomHistory((prev) => {
        const newHistory = prev.slice(0, roomHistoryIndex + 1);
        newHistory.push(room.id);
        return newHistory;
      });
      setRoomHistoryIndex((prev) => prev + 1);
      // Update URL
      updateUrlWithScene(room.id);
      showToast?.(`Teleported to ${room.name}`, 'success');
    },
    [onNavigate, roomHistoryIndex, updateUrlWithScene, showToast]
  );

  // Back navigation
  const goBack = useCallback(() => {
    if (roomHistoryIndex > 0) {
      const prevRoomId = roomHistory[roomHistoryIndex - 1];
      const prevRoom = rooms.find((r) => r.id === prevRoomId);
      if (prevRoom) {
        onNavigate?.(prevRoom);
        setRoomHistoryIndex((prev) => prev - 1);
        updateUrlWithScene(prevRoom.id);
        showToast?.(`Returned to ${prevRoom.name}`, 'success');
      }
    }
  }, [roomHistory, roomHistoryIndex, rooms, onNavigate, updateUrlWithScene, showToast]);

  // Forward navigation
  const goForward = useCallback(() => {
    if (roomHistoryIndex < roomHistory.length - 1) {
      const nextRoomId = roomHistory[roomHistoryIndex + 1];
      const nextRoom = rooms.find((r) => r.id === nextRoomId);
      if (nextRoom) {
        onNavigate?.(nextRoom);
        setRoomHistoryIndex((prev) => prev + 1);
        updateUrlWithScene(nextRoom.id);
        showToast?.(`Teleported to ${nextRoom.name}`, 'success');
      }
    }
  }, [roomHistory, roomHistoryIndex, rooms, onNavigate, updateUrlWithScene, showToast]);

  const currentSceneIndex = rooms.findIndex((r) => r.id === currentRoom.id);

  return {
    currentRoom,
    setCurrentRoom,
    roomHistory,
    roomHistoryIndex,
    navigateToRoomWithHistory,
    teleportToRoom: (targetRoomId: string, customUrl?: string, customName?: string, targetYaw?: number) => {
      const target = rooms.find((r) => r.id === targetRoomId);
      if (target) {
        navigateToRoomWithHistory(target, targetYaw);
      } else if (customUrl) {
        const dynamicRoom: TourRoom = {
          id: `room-${Date.now()}`,
          name: customName || 'New 360 Space',
          subtitle: 'Linked Architectural Space',
          panoramaUrl: customUrl,
          thumbnailUrl: customUrl,
          initialYaw: targetYaw || 180,
          initialPitch: 0,
          defaultHotspots: [],
        };
        navigateToRoomWithHistory(dynamicRoom, targetYaw);
      }
    },
    goBack,
    goForward,
    canGoBack: roomHistoryIndex > 0,
    canGoForward: roomHistoryIndex < roomHistory.length - 1,
    currentSceneIndex,
  };
}
