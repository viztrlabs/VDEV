import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { SharedExperienceProvider, useSharedExperience } from '@/components/xr/SharedExperienceContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SharedExperienceProvider>{children}</SharedExperienceProvider>
);

describe('SharedExperienceContext', () => {
  it('initializes with default yaw/pitch of 0', () => {
    const { result } = renderHook(() => useSharedExperience(), { wrapper });
    expect(result.current.yaw).toBe(0);
    expect(result.current.pitch).toBe(0);
  });

  it('setOrientation updates yaw and pitch', () => {
    const { result } = renderHook(() => useSharedExperience(), { wrapper });
    act(() => result.current.setOrientation(1.5, 0.3));
    expect(result.current.yaw).toBe(1.5);
    expect(result.current.pitch).toBe(0.3);
  });

  it('setOrientation clamps pitch to [-PI/2, PI/2]', () => {
    const { result } = renderHook(() => useSharedExperience(), { wrapper });
    act(() => result.current.setOrientation(0, 2.0));
    expect(result.current.pitch).toBe(Math.PI / 2);
    act(() => result.current.setOrientation(0, -2.0));
    expect(result.current.pitch).toBe(-Math.PI / 2);
  });

  it('activeEngine defaults to tour', () => {
    const { result } = renderHook(() => useSharedExperience(), { wrapper });
    expect(result.current.activeEngine).toBe('tour');
  });

  it('setActiveEngine updates engine type', () => {
    const { result } = renderHook(() => useSharedExperience(), { wrapper });
    act(() => result.current.setActiveEngine('splat'));
    expect(result.current.activeEngine).toBe('splat');
  });
});
