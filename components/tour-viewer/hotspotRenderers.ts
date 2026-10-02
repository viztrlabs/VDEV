import type { TourHotspot } from '@/lib/tourClientStore';

// Literal class strings only — Tailwind's JIT scans this file.
const DOT_CLASS_BY_TYPE: Record<string, string> = {
  navigation: 'bg-[#3ECF8E]',
  floor: 'bg-[#3ECF8E]',
  info: 'bg-sky-400',
  link: 'bg-amber-500',
  image: 'bg-violet-400',
  gallery: 'bg-violet-400',
  video: 'bg-rose-400',
  audio: 'bg-orange-400',
  model3d: 'bg-cyan-400',
  splat: 'bg-lime-400',
  experience: 'bg-fuchsia-400',
  custom: 'bg-white',
};

const ANIMATION_CLASS: Record<string, string> = {
  pulse: 'animate-pulse',
  glow: 'animate-pulse',
  bounce: 'animate-bounce',
  none: '',
};

function applyAppearance(dot: HTMLElement, hs: TourHotspot) {
  const size = Math.round(16 * (hs.size && hs.size > 0 ? hs.size : 1));
  dot.style.width = `${size}px`;
  dot.style.height = `${size}px`;
  if (hs.opacity != null) dot.style.opacity = String(hs.opacity);
  if (hs.animation && ANIMATION_CLASS[hs.animation]) {
    dot.classList.add(ANIMATION_CLASS[hs.animation]);
  }
}

export function renderViewerHotspot(hs: TourHotspot, onActivate?: () => void): HTMLElement {
  const el = document.createElement('div');
  el.className = 'viztr-hotspot';
  el.setAttribute('role', 'button');
  el.setAttribute('tabIndex', '0');
  el.setAttribute('aria-label', `${hs.title || hs.type} hotspot`);
  if (hs.tooltip) el.setAttribute('title', hs.tooltip);

  const dot = document.createElement('div');
  dot.className =
    (DOT_CLASS_BY_TYPE[hs.type] || 'bg-white') +
    ' rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform';
  applyAppearance(dot, hs);
  el.appendChild(dot);

  const label = hs.label ?? hs.title;
  if (label) {
    const labelEl = document.createElement('div');
    labelEl.className =
      'viztr-hotspot-label absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded bg-[#09090B] text-[9px] font-mono text-white whitespace-nowrap';
    labelEl.textContent = label;
    el.appendChild(labelEl);
  }

  if (onActivate) {
    const handleClick = (e: Event) => { e.stopPropagation(); onActivate(); };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivate(); }
    };
    el.addEventListener('click', handleClick);
    el.addEventListener('keydown', handleKey);
    (el as any).__viztrCleanup = () => {
      el.removeEventListener('click', handleClick);
      el.removeEventListener('keydown', handleKey);
    };
  }
  return el;
}

export function renderAlignmentMarker(marker: {
  id: string; label?: string; yaw: number; pitch: number;
}): HTMLElement {
  const el = document.createElement('div');
  el.className = 'viztr-alignment-marker';
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', `Alignment marker: ${marker.label || marker.id}`);

  const dot = document.createElement('div');
  dot.className = 'w-3 h-3 bg-amber-500 rounded-full shadow-lg border border-amber-300 cursor-help';
  el.appendChild(dot);

  if (marker.label) {
    const labelEl = document.createElement('div');
    labelEl.className =
      'absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded bg-[#09090B] text-[9px] font-mono text-amber-300 whitespace-nowrap';
    labelEl.textContent = marker.label;
    el.appendChild(labelEl);
  }
  return el;
}

export function destroyHotspotElement(el: HTMLElement) {
  (el as any).__viztrCleanup?.();
  el.remove();
}
