'use client';

import React, { useState, useMemo } from 'react';
import GaussianSplatViewer from '@/components/xr/GaussianSplatViewer';
import { ChevronDown, Eye, EyeOff, Loader2, CheckCircle2, XCircle, Box } from 'lucide-react';

interface SplatSceneDef {
  id: string;
  name: string;
  url: string;
  format?: 'splat' | 'ply' | 'ksplat';
  position?: [number, number, number];
  rotation?: [number, number, number, number];
  scale?: [number, number, number];
  thumbnail?: string;
}

interface SplatConfiguratorProps {
  scenes?: SplatSceneDef[];
  className?: string;
  height?: string;
  showControls?: boolean;
}

// Default public sample splat scenes
const DEFAULT_SCENES: SplatSceneDef[] = [
  {
    id: 'train',
    name: 'Train Station',
    url: 'https://huggingface.co/cakewalk/splat-data/resolve/main/train.splat',
    format: 'splat',
  },
  {
    id: 'garden',
    name: 'Garden Scene',
    url: 'https://huggingface.co/cakewalk/splat-data/resolve/main/garden.splat',
    format: 'splat',
  },
  {
    id: 'bonsai',
    name: 'Bonsai Tree',
    url: 'https://huggingface.co/cakewalk/splat-data/resolve/main/bonsai.splat',
    format: 'splat',
  },
  {
    id: 'kitchen',
    name: 'Kitchen Interior',
    url: 'https://huggingface.co/cakewalk/splat-data/resolve/main/kitchen.splat',
    format: 'splat',
  },
];

export default function SplatConfigurator({
  scenes = DEFAULT_SCENES,
  className = '',
  height = 'h-[600px]',
  showControls = true,
}: SplatConfiguratorProps) {
  const [activeSceneId, setActiveSceneId] = useState<string>(scenes[0]?.id ?? 'train');
  const [visibleScenes, setVisibleScenes] = useState<Record<string, boolean>>(
    useMemo(() => {
      const initial: Record<string, boolean> = {};
      scenes.forEach((_, index) => {
        initial[index.toString()] = index === 0;
      });
      return initial;
    }, [scenes])
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const activeScene = scenes.find((s) => s.id === activeSceneId) ?? scenes[0];
  const activeSceneIndex = scenes.findIndex((s) => s.id === activeSceneId);

  const toggleVisibility = (index: number) => {
    setVisibleScenes((prev) => ({
      ...prev,
      [index.toString()]: !prev[index.toString()],
    }));
  };

  const handleSceneChange = (scene: SplatSceneDef) => {
    setActiveSceneId(scene.id);
    setDropdownOpen(false);
    setIsLoading(true);
    // GaussianSplatViewer handles actual loading
    // trigger re-render new scene
    setTimeout(() => setIsLoading(false), 300);
  };

  // Build scenes array GaussianSplatViewer visibility
  const viewerScenes = useMemo(() => {
    return scenes.map((scene, index) => ({
      ...scene,
      visible: visibleScenes[index.toString()] ?? (index === 0),
    }));
  }, [scenes, visibleScenes]);

  return (
    <div className={`relative w-full ${height} ${className}`}>
      {/* Scene Selector Dropdown */}
      {showControls && (
        <div className="absolute top-3 left-3 z-20">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-[#18181B]/90 backdrop-blur-sm border border-[#27272A] rounded-lg text-sm font-mono text-white hover:border-[#3ECF8E] transition-colors"
              aria-label="Select splat scene"
            >
              <Box className="w-4 h-4 text-[#3ECF8E]" />
              <span className="max-w-[200px] truncate">{activeScene?.name ?? 'Select Scene'}</span>
              <ChevronDown
                className={`w-4 h-4 text-[#A1A1AA] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-[#18181B] border border-[#27272A] rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                {scenes.map((scene, index) => {
                  const isActive = scene.id === activeSceneId;
                  const isVisible = visibleScenes[index.toString()] ?? (index === 0);
                  return (
                    <button
                      key={scene.id}
                      onClick={() => handleSceneChange(scene)}
                      className={`w-full px-3 py-2.5 flex items-center gap-2.5 text-left transition-colors ${
                        isActive ? 'bg-[#3ECF8E]/10' : 'hover:bg-[#09090B]'
                      }`}
                    >
                      <div className="relative w-5 h-5 flex-shrink-0">
                        {isVisible ? (
                          <CheckCircle2 className="w-5 h-5 text-[#3ECF8E]" />
                        ) : (
                          <XCircle className="w-5 h-5 text-[#71717A]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-mono truncate ${
                            isActive ? 'text-[#3ECF8E] font-bold' : 'text-white'
                          }`}
                        >
                          {scene.name}
                        </p>
                        <p className="text-[10px] text-[#71717A] font-mono truncate">
                          {scene.format?.toUpperCase() ?? 'SPLAT'} • {scene.url.split('/').pop()?.slice(0, 30)}...
                        </p>
                      </div>
                      {isActive && (
                        <span className="text-xs text-[#3ECF8E] font-mono">Active</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visibility Toggles */}
      {showControls && scenes.length > 1 && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-[#18181B]/90 backdrop-blur-sm border border-[#27272A] rounded-lg p-1.5">
          {scenes.map((scene, index) => {
            const isVisible = visibleScenes[index.toString()] ?? (index === 0);
            return (
              <button
                key={scene.id}
                onClick={() => toggleVisibility(index)}
                className={`p-1.5 rounded transition-colors ${
                  isVisible
                    ? 'bg-[#3ECF8E]/20 text-[#3ECF8E] border border-[#3ECF8E]/40'
                    : 'text-[#71717A] hover:text-white hover:bg-[#09090B]'
                }`}
                title={isVisible ? `Hide ${scene.name}` : `Show ${scene.name}`}
                aria-label={isVisible ? `Hide ${scene.name}` : `Show ${scene.name}`}
              >
                {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Active Scene Name Display */}
      {showControls && (
        <div className="absolute bottom-3 left-3 z-10 bg-[#09090B]/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-[#27272A]">
          <div className="flex items-center gap-2 text-xs font-mono text-[#A1A1AA]">
            <Box className="w-3.5 h-3.5 text-[#3ECF8E]" />
            <span>{activeScene?.name ?? 'No Scene'}</span>
            <span className="px-1.5 py-0.5 rounded bg-[#27272A] text-[10px] font-mono text-[#3ECF8E]">
              {activeScene?.format?.toUpperCase() ?? 'SPLAT'}
            </span>
            {isLoading && (
              <>
                <Loader2 className="w-3.5 h-3.5 text-[#3ECF8E] animate-spin" />
                <span className="text-[#3ECF8E]">Loading...</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Gaussian Splat Viewer */}
      <GaussianSplatViewer
        scenes={viewerScenes as SplatSceneDef[]}
        initialSceneId={activeSceneId}
        className="w-full h-full"
      />
    </div>
  );
}