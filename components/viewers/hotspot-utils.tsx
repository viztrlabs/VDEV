import {
  DoorOpen,
  Palette,
  Box,
  Layers,
  Eye,
  Zap,
  Flame,
  Info,
  Tag,
  Volume2,
  Sparkles,
} from 'lucide-react';
import type { HotspotColor } from '@/components/viewers/PanoramaViewer';

export function getColorClasses(color?: HotspotColor) {
  switch (color) {
    case 'emerald':
      return {
        bg: 'bg-emerald-600',
        text: 'text-emerald-400',
        border: 'border-emerald-500/40',
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.6)]',
      };
    case 'cyan':
      return {
        bg: 'bg-cyan-600',
        text: 'text-cyan-400',
        border: 'border-cyan-500/40',
        glow: 'shadow-[0_0_20px_rgba(6,182,212,0.6)]',
      };
    case 'amber':
      return {
        bg: 'bg-amber-600',
        text: 'text-amber-400',
        border: 'border-amber-500/40',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.6)]',
      };
    case 'violet':
      return {
        bg: 'bg-violet-600',
        text: 'text-violet-400',
        border: 'border-violet-500/40',
        glow: 'shadow-[0_0_20px_rgba(139,92,246,0.6)]',
      };
    case 'blue':
      return {
        bg: 'bg-blue-600',
        text: 'text-blue-400',
        border: 'border-blue-500/40',
        glow: 'shadow-[0_0_20px_rgba(59,130,246,0.6)]',
      };
    case 'rose':
    default:
      return {
        bg: 'bg-rose-600',
        text: 'text-rose-400',
        border: 'border-rose-500/40',
        glow: 'shadow-[0_0_20px_rgba(225,29,72,0.6)]',
      };
  }
}

export function getHotspotIcon(iconName?: string, type?: string) {
  if (type === 'room_link') return <DoorOpen className="w-4 h-4" />;
  switch (iconName) {
    case 'palette':
      return <Palette className="w-4 h-4" />;
    case 'box':
      return <Box className="w-4 h-4" />;
    case 'layers':
      return <Layers className="w-4 h-4" />;
    case 'eye':
      return <Eye className="w-4 h-4" />;
    case 'zap':
      return <Zap className="w-4 h-4" />;
    case 'flame':
      return <Flame className="w-4 h-4" />;
    case 'info':
      return <Info className="w-4 h-4" />;
    case 'tag':
      return <Tag className="w-4 h-4" />;
    case 'acoustic':
      return <Volume2 className="w-4 h-4" />;
    case 'sparkles':
    default:
      return <Sparkles className="w-4 h-4" />;
  }
}
