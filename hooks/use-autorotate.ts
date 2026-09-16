import { useState, useEffect, useCallback } from 'react';
import { useTourPreferences, useReducedMotion } from '@/hooks/use-tour-preferences';

export function useAutorotate({
  setYaw,
  onAdvanceScene,
}: {
  setYaw: (fn: (prev: number) => number) => void;
  onAdvanceScene?: () => void;
}) {
  const { preferences, updatePreferences } = useTourPreferences();
  const { reducedMotion } = useReducedMotion(preferences);
  const [isPlaying, setIsPlaying] = useState(preferences.autoRotate);
  const [guidedOn, setGuidedOn] = useState(false);

  // Sync isPlaying with preferences.autoRotate
  useEffect(() => {
    if (preferences.autoRotate && !isPlaying) {
      setIsPlaying(true);
    }
  }, [preferences.autoRotate, isPlaying]);

  // Auto-rotate effect (play/pause)
  useEffect(() => {
    if (!isPlaying || reducedMotion) return;
    const speed = preferences.autoRotateSpeed || 1;
    const interval = setInterval(() => {
      setYaw((prev) => (prev + (0.05 * speed + 360) % 360));
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, reducedMotion, preferences.autoRotateSpeed, setYaw]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      updatePreferences({ autoRotate: next });
      return next;
    });
  }, [updatePreferences]);

  const startGuidedTour = useCallback(() => {
    setGuidedOn((prev) => !prev);
  }, []);

  // Guided-tour auto-play: step through rooms on a timed loop.
  useEffect(() => {
    if (!guidedOn) return;
    const interval = setInterval(() => {
      onAdvanceScene?.();
    }, 6000);
    return () => clearInterval(interval);
  }, [guidedOn, onAdvanceScene]);

  return {
    isPlaying,
    guidedOn,
    togglePlay,
    startGuidedTour,
    reducedMotion,
  };
}
