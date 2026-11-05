'use client';

import React, { useState } from 'react';
import {
  Navigation, Info, Image, Images, Video, Music, Link, MapPin,
  Box, Compass, Camera, DoorOpen, AppWindow, Sofa, Lightbulb,
  Landmark, Globe, Layers, Eye, Star, Heart, Bookmark,
  Volume2, Play, Pause, RotateCcw, ZoomIn, Maximize,
  ChevronRight, ArrowRight, ArrowUpRight, ExternalLink,
} from 'lucide-react';

interface IconPickerProps {
  value?: string;
  onChange: (icon: string) => void;
  onClose: () => void;
}

const ICON_CATEGORIES: Record<string, { name: string; icons: { id: string; icon: React.ComponentType<any>; label: string }[] }> = {
  navigation: {
    name: 'Navigation',
    icons: [
      { id: 'navigation', icon: Navigation, label: 'Navigate' },
      { id: 'arrow-right', icon: ArrowRight, label: 'Arrow Right' },
      { id: 'arrow-up-right', icon: ArrowUpRight, label: 'Arrow Up Right' },
      { id: 'chevron-right', icon: ChevronRight, label: 'Chevron' },
      { id: 'door-open', icon: DoorOpen, label: 'Door' },
      { id: 'compass', icon: Compass, label: 'Compass' },
    ],
  },
  information: {
    name: 'Information',
    icons: [
      { id: 'info', icon: Info, label: 'Info' },
      { id: 'star', icon: Star, label: 'Star' },
      { id: 'heart', icon: Heart, label: 'Heart' },
      { id: 'bookmark', icon: Bookmark, label: 'Bookmark' },
      { id: 'lightbulb', icon: Lightbulb, label: 'Idea' },
    ],
  },
  media: {
    name: 'Media',
    icons: [
      { id: 'image', icon: Image, label: 'Image' },
      { id: 'images', icon: Images, label: 'Gallery' },
      { id: 'video', icon: Video, label: 'Video' },
      { id: 'music', icon: Music, label: 'Audio' },
      { id: 'camera', icon: Camera, label: 'Camera' },
      { id: 'volume-2', icon: Volume2, label: 'Volume' },
      { id: 'play', icon: Play, label: 'Play' },
    ],
  },
  architecture: {
    name: 'Architecture',
    icons: [
      { id: 'landmark', icon: Landmark, label: 'Landmark' },
      { id: 'window', icon: AppWindow, label: 'Window' },
      { id: 'sofa', icon: Sofa, label: 'Furniture' },
      { id: 'layers', icon: Layers, label: 'Floor' },
    ],
  },
  model: {
    name: '3D & Model',
    icons: [
      { id: 'box', icon: Box, label: '3D Model' },
      { id: 'eye', icon: Eye, label: 'View' },
      { id: 'maximize', icon: Maximize, label: 'Fullscreen' },
      { id: 'zoom-in', icon: ZoomIn, label: 'Zoom' },
      { id: 'rotate-ccw', icon: RotateCcw, label: 'Rotate' },
    ],
  },
  link: {
    name: 'Links',
    icons: [
      { id: 'link', icon: Link, label: 'Link' },
      { id: 'external-link', icon: ExternalLink, label: 'External' },
      { id: 'globe', icon: Globe, label: 'Website' },
      { id: 'map-pin', icon: MapPin, label: 'Location' },
    ],
  },
};

export function IconPicker({ value, onChange, onClose }: IconPickerProps) {
  const [activeCategory, setActiveCategory] = useState('navigation');
  const [search, setSearch] = useState('');

  const categories = Object.entries(ICON_CATEGORIES);
  const filteredIcons = search
    ? Object.values(ICON_CATEGORIES)
        .flatMap((cat) => cat.icons)
        .filter((ic) => ic.label.toLowerCase().includes(search.toLowerCase()) || ic.id.includes(search))
    : ICON_CATEGORIES[activeCategory]?.icons || [];

  return (
    <div className="absolute z-50 top-full left-0 mt-1 w-80 bg-[#09090B] border border-[#27272A] rounded-lg shadow-xl p-3">
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          placeholder="Search icons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
        />
        <button onClick={onClose} className="text-[#71717A] hover:text-white text-xs">✕</button>
      </div>

      {!search && (
        <div className="flex gap-1 mb-2 flex-wrap">
          {categories.map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                activeCategory === key ? 'bg-[#3ECF8E]/20 text-[#3ECF8E]' : 'bg-[#18181B] text-[#A1A1AA] hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto">
        {filteredIcons.map((ic) => {
          const IconComp = ic.icon;
          return (
            <button
              key={ic.id}
              onClick={() => { onChange(ic.id); onClose(); }}
              className={`p-2 rounded hover:bg-[#27272A] group relative ${
                value === ic.id ? 'bg-[#3ECF8E]/20 ring-1 ring-[#3ECF8E]' : ''
              }`}
              title={ic.label}
            >
              <IconComp className="w-4 h-4 text-[#A1A1AA] group-hover:text-white" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
