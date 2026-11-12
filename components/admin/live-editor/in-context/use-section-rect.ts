'use client';

import { useEffect, useState } from 'react';

export function useSectionRect(element: HTMLElement | null): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!element) {
      setRect(null);
      return;
    }

    let frame: number | null = null;

    const measure = () => {
      frame = null;
      setRect(element.getBoundingClientRect());
    };

    const schedule = () => {
      if (frame !== null) return;
      if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
        measure();
        return;
      }
      frame = window.requestAnimationFrame(measure);
    };

    measure();

    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);

    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    observer?.observe(element);

    return () => {
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
      observer?.disconnect();
      if (frame !== null && typeof window !== 'undefined') {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [element]);

  return rect;
}

export default useSectionRect;
