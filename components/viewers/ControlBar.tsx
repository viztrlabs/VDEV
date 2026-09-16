'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Layers,
  Eye,
  Smartphone,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Share2,
  Search,
  Settings,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  MapPin,
  Map,
  Compass,
  DoorOpen,
  Sparkles,
  Volume2,
  Music,
  Bot,
  Globe,
  Upload,
  ImageIcon,
} from 'lucide-react';
import type { Hotspot, TourRoom, HotspotCategory, HotspotColor, HotspotType, HotspotSpec } from '@/components/viewers/PanoramaViewer';
import type { TourPreferences } from '@/hooks/use-tour-preferences';
import { getColorClasses, getHotspotIcon } from './hotspot-utils';
import FloorPlanOverlay from './FloorPlanOverlay';
import ShareDialog from './ShareDialog';
import SearchPanel from './SearchPanel';
import PreferencesPanel from './PreferencesPanel';

export interface ControlBarProps {
  yaw: number;
  pitch: number;
  fov: number;
  currentRoom: TourRoom;
  rooms: TourRoom[];
  preferences: TourPreferences;
  updatePreferences: (updates: Partial<TourPreferences>) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  tourTheme: { accentColor: string; logoUrl: string; title: string };
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  closePanorama: () => void;
  isPlaying: boolean;
  setIsPlaying: (val: boolean) => void;
  guidedOn: boolean;
  setGuidedOn: (val: boolean) => void;
  roomHistory: string[];
  roomHistoryIndex: number;
  goBack: () => void;
  goForward: () => void;
  currentSceneIndex: number;
  navigateToRoomWithHistory: (room: TourRoom, targetYaw?: number) => void;
  showHotspots: boolean;
  setShowHotspots: (val: boolean) => void;
  isAddMode: boolean;
  setIsAddMode: (val: boolean) => void;
  activeHotspot: Hotspot | null;
  setActiveHotspot: (val: Hotspot | null) => void;
  hotspotDrawerOpen: boolean;
  setHotspotDrawerOpen: (val: boolean) => void;
  showHotspotListPanel: boolean;
  setShowHotspotListPanel: (val: boolean) => void;
  roomDropdownOpen: boolean;
  setRoomDropdownOpen: (val: boolean) => void;
  showShareDialog: boolean;
  setShowShareDialog: (val: boolean) => void;
  shareCopied: boolean;
  setShareCopied: (val: boolean) => void;
  showSearch: boolean;
  setShowSearch: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  showPreferences: boolean;
  setShowPreferences: (val: boolean) => void;
  settingsMenuOpen: boolean;
  setSettingsMenuOpen: (val: boolean) => void;
  showGoogleDrivePanel: boolean;
  setShowGoogleDrivePanel: (val: boolean) => void;
  showBottomControls: boolean;
  bottomControlsVisible: boolean;
  showBottomControlsOnHover: boolean;
  setShowBottomControls: (val: boolean) => void;
  setBottomControlsVisible: (val: boolean) => void;
  bottomControlsTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  reducedMotion: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  handleShare: () => void;
  handleCopyShareUrl: () => void;
  getShareUrl: () => string;
  teleportToRoom: (targetRoomId: string, customUrl?: string, customName?: string, targetYaw?: number) => void;
  screenToHotspotCoords: (clientX: number, clientY: number) => { xPercent: number; yPercent: number } | null;
  roomHotspotsMap: Record<string, Hotspot[]>;
  setRoomHotspotsMap: (val: Record<string, Hotspot[]> | ((prev: Record<string, Hotspot[]>) => Record<string, Hotspot[]>)) => void;
  currentHotspots: Hotspot[];
  handleCanvasClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleSaveHotspot: (e: React.FormEvent) => void;
  handleEditHotspot: (hp: Hotspot) => void;
  handleDeleteHotspot: (hpId: string) => void;
  focusOnHotspot: (hp: Hotspot) => void;
  handleExportTour: () => void;
  handleResetTour: () => void;
  placingCoords: { xPercent: number; yPercent: number } | null;
  configModalOpen: boolean;
  setConfigModalOpen: (val: boolean) => void;
  editingHotspotId: string | null;
  setEditingHotspotId: (val: string | null) => void;
  formType: HotspotType;
  formTitle: string;
  formCategory: HotspotCategory;
  formDescription: string;
  formColor: HotspotColor;
  formIcon: string;
  formPulse: 'radar' | 'glowing' | 'subtle';
  formSpecs: HotspotSpec[];
  formTargetRoomId: string;
  formCustomRoomName: string;
  formCustomPanoramaUrl: string;
  setFormType: (val: HotspotType) => void;
  setFormTitle: (val: string) => void;
  setFormCategory: (val: HotspotCategory) => void;
  setFormDescription: (val: string) => void;
  setFormColor: (val: HotspotColor) => void;
  setFormIcon: (val: string) => void;
  setFormPulse: (val: 'radar' | 'glowing' | 'subtle') => void;
  setFormSpecs: (val: HotspotSpec[]) => void;
  setFormTargetRoomId: (val: string) => void;
  setFormCustomRoomName: (val: string) => void;
  setFormCustomPanoramaUrl: (val: string) => void;
  onResetDefaults: () => void;
  showTutorial: boolean;
  setShowTutorial: (val: boolean) => void;
  tutorialStep: number;
  setTutorialStep: (val: number) => void;
  isTeleporting: boolean;
  tourOffline: boolean;
}

export default function ControlBar({
  yaw,
  pitch,
  fov,
  currentRoom,
  rooms,
  preferences,
  updatePreferences,
  showToast,
  tourTheme,
  isFullscreen,
  toggleFullscreen,
  closePanorama,
  isPlaying,
  setIsPlaying,
  guidedOn,
  setGuidedOn,
  roomHistory,
  roomHistoryIndex,
  goBack,
  goForward,
  currentSceneIndex,
  navigateToRoomWithHistory,
  showHotspots,
  setShowHotspots,
  isAddMode,
  setIsAddMode,
  activeHotspot,
  setActiveHotspot,
  hotspotDrawerOpen,
  setHotspotDrawerOpen,
  showHotspotListPanel,
  setShowHotspotListPanel,
  roomDropdownOpen,
  setRoomDropdownOpen,
  showShareDialog,
  setShowShareDialog,
  shareCopied,
  setShareCopied,
  showSearch,
  setShowSearch,
  searchQuery,
  setSearchQuery,
  showPreferences,
  setShowPreferences,
  settingsMenuOpen,
  setSettingsMenuOpen,
  showGoogleDrivePanel,
  setShowGoogleDrivePanel,
  showBottomControls,
  bottomControlsVisible,
  showBottomControlsOnHover,
  setShowBottomControls,
  setBottomControlsVisible,
  bottomControlsTimeoutRef,
  reducedMotion,
  audioRef,
  containerRef,
  handleShare,
  handleCopyShareUrl,
  getShareUrl,
  teleportToRoom,
  roomHotspotsMap,
  currentHotspots,
  handleCanvasClick,
  handleSaveHotspot,
  handleEditHotspot,
  handleDeleteHotspot,
  focusOnHotspot,
  handleExportTour,
  handleResetTour,
  placingCoords,
  configModalOpen,
  setConfigModalOpen,
  editingHotspotId,
  setEditingHotspotId,
  formType,
  formTitle,
  formCategory,
  formDescription,
  formColor,
  formIcon,
  formPulse,
  formSpecs,
  formTargetRoomId,
  formCustomRoomName,
  formCustomPanoramaUrl,
  setFormType,
  setFormTitle,
  setFormCategory,
  setFormDescription,
  setFormColor,
  setFormIcon,
  setFormPulse,
  setFormSpecs,
  setFormTargetRoomId,
  setFormCustomRoomName,
  setFormCustomPanoramaUrl,
  onResetDefaults,
  showTutorial,
  setShowTutorial,
  tutorialStep,
  setTutorialStep,
  isTeleporting,
  tourOffline,
}: ControlBarProps) {
  useEffect(() => {
    if (!showBottomControlsOnHover) {
      setShowBottomControls(true);
      return;
    }
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseY = e.clientY;
      const bottomThreshold = rect.bottom - 120;
      const isNearBottom = mouseY >= bottomThreshold;

      if (isNearBottom) {
        setBottomControlsVisible(true);
        setShowBottomControls(true);
        if (bottomControlsTimeoutRef.current) {
          clearTimeout(bottomControlsTimeoutRef.current);
        }
        bottomControlsTimeoutRef.current = setTimeout(() => {
          if (showBottomControlsOnHover) {
            setBottomControlsVisible(false);
          }
        }, 1500);
      } else if (bottomControlsVisible) {
        if (bottomControlsTimeoutRef.current) {
          clearTimeout(bottomControlsTimeoutRef.current);
        }
        bottomControlsTimeoutRef.current = setTimeout(() => {
          setBottomControlsVisible(false);
        }, 1500);
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      if (bottomControlsTimeoutRef.current) {
        clearTimeout(bottomControlsTimeoutRef.current);
      }
    };
  }, [
    showBottomControlsOnHover,
    bottomControlsVisible,
    containerRef,
    setShowBottomControls,
    setBottomControlsVisible,
    bottomControlsTimeoutRef,
  ]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsMenuOpen) {
        const target = e.target as HTMLElement;
        if (!target.closest('.settings-menu-trigger') && !target.closest('.settings-menu-dropdown')) {
          setSettingsMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [settingsMenuOpen, setSettingsMenuOpen]);

  return (
    <>
      {/* TOP BAR WITH TOUR ROOM SELECTOR & CONTROLS */}
      {!preferences.hideTopBar && (
        <div className="absolute top-0 left-0 right-0 z-30 px-4 py-2.5 bg-[var(--glass-bg)] border-b border-[var(--glass-border)] flex flex-wrap items-center justify-between gap-3 pointer-events-auto backdrop-blur-md">
          <FloorPlanOverlay
            yaw={yaw}
            pitch={pitch}
            preferences={preferences}
            updatePreferences={updatePreferences}
            showToast={showToast}
          />

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#18181B] border border-[#27272A] text-[#3ECF8E] text-[10px] font-mono font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
              <span>360° TOUR</span>
            </div>

            <div className="relative">
              <button
                onClick={() => setRoomDropdownOpen(!roomDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-mono text-white transition-colors cursor-pointer"
              >
                <DoorOpen className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-bold max-w-[200px] sm:max-w-[320px] truncate">{currentRoom.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#71717A]" />
              </button>

              {roomDropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-80 rounded-2xl bg-[#121215] border border-[#27272A] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 font-mono text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-2 py-1.5 text-[10px] text-[#71717A] uppercase font-bold tracking-wider border-b border-[#27272A] mb-1">
                    Tour Room Nodes ({rooms.length})
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {rooms.map((room) => {
                      const isSelected = room.id === currentRoom.id;
                      const hpCount = (roomHotspotsMap[room.id] || []).length;
                      return (
                        <button
                          key={room.id}
                          onClick={() => {
                            teleportToRoom(room.id);
                            setRoomDropdownOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded-xl flex items-center gap-3 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#18181B] text-[#3ECF8E] border border-[#3ECF8E]/30 font-bold'
                              : 'hover:bg-[#18181B] text-zinc-300 hover:text-white'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-cover bg-center shrink-0 border border-[#27272A]" style={{ backgroundImage: `url(${room.thumbnailUrl})` }} />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs truncate">{room.name}</div>
                            <div className="text-[10px] text-[#71717A] truncate">{hpCount} Hotspots · {room.subtitle}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-add-hotspot-mode"
              onClick={() => {
                if (isAddMode) {
                  setIsAddMode(false);
                  showToast('Exited hotspot placement mode.', 'info');
                } else {
                  setIsAddMode(true);
                  setActiveHotspot(null);
                  showToast('Click anywhere in the 360 scene to position your hotspot!', 'info');
                }
              }}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-lg ${
                isAddMode
                  ? 'bg-amber-400 text-black ' + (reducedMotion ? '' : 'animate-pulse') + ' ring-2 ring-amber-300'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
              title="Place a new hotspot in 360 space (H)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddMode ? 'Placing... (Click Scene)' : 'Add Hotspot'}</span>
            </button>

            <button
              onClick={() => setHotspotDrawerOpen(!hotspotDrawerOpen)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
                hotspotDrawerOpen
                  ? 'bg-[#3ECF8E] text-black border-[#3ECF8E] font-bold'
                  : 'bg-[#18181B] hover:bg-[#27272A] text-[#FAFAFA] border-[#27272A]'
              }`}
              title="Manage Room Hotspots"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hotspots</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-current font-bold">
                {currentHotspots.length}
              </span>
            </button>

            <button
              onClick={() => {
                setShowHotspots(!showHotspots);
                showToast(!showHotspots ? 'Hotspots visible.' : 'Hotspots hidden for clean tour view.', 'info');
              }}
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                showHotspots
                  ? 'bg-[#18181B] hover:bg-[#27272A] text-[#3ECF8E] border-[#27272A]'
                  : 'bg-zinc-800 text-zinc-500 border-zinc-700'
              }`}
              title={showHotspots ? 'Hide Hotspots' : 'Show Hotspots'}
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                updatePreferences({ gyroscopeEnabled: !preferences.gyroscopeEnabled });
                showToast(!preferences.gyroscopeEnabled ? 'Gyroscope simulator enabled.' : 'Gyroscope disabled.', 'info');
              }}
              className={`p-1.5 rounded-xl border text-[10px] font-mono transition-colors cursor-pointer hidden md:flex items-center gap-1 ${
                preferences.gyroscopeEnabled
                  ? 'bg-[#3ECF8E] text-black border-[#3ECF8E]'
                  : 'bg-[#18181B] hover:bg-[#27272A] text-[#FAFAFA] border-[#27272A]'
              }`}
              title="Toggle Gyroscope Mode"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>

            <div className="hidden sm:flex items-center bg-[#18181B] border border-[#27272A] rounded-xl p-0.5 gap-0.5">
              <button
                onClick={goBack}
                disabled={roomHistoryIndex <= 0}
                className="p-1 hover:text-white cursor-pointer text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous Room"
                title="Previous Room"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono text-[#3ECF8E] px-1 min-w-[28px] text-center" aria-label="Current scene">
                {roomHistoryIndex + 1}/{roomHistory.length || 1}
              </span>
              <button
                onClick={goForward}
                disabled={roomHistoryIndex >= roomHistory.length - 1}
                className="p-1 hover:text-white cursor-pointer text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next Room"
                title="Next Room"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleShare}
                className="p-1 hover:text-white cursor-pointer text-zinc-300"
                aria-label="Share Room Link"
                title="Share Room Link"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowSearch(true)}
                className="p-1 hover:text-white cursor-pointer text-zinc-300"
                aria-label="Search Rooms"
                title="Search Rooms"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="hidden sm:flex items-center bg-[#18181B] border border-[#27272A] rounded-xl p-0.5">
              <button
                onClick={() => setShowPreferences(true)}
                className="p-1 hover:text-white cursor-pointer text-zinc-300"
                aria-label="Preferences"
                title="Preferences"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="hidden sm:flex items-center bg-[#18181B] border border-[#27272A] rounded-xl p-0.5">
              <button
                onClick={() => updatePreferences({ defaultZoom: Math.max(0.5, preferences.defaultZoom - 0.5) })}
                className="p-1 hover:text-white cursor-pointer text-zinc-300"
                aria-label="Zoom In"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => updatePreferences({ defaultZoom: Math.min(3, preferences.defaultZoom + 0.5) })}
                className="p-1 hover:text-white cursor-pointer text-zinc-300"
                aria-label="Zoom Out"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#FAFAFA] transition-colors cursor-pointer"
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={closePanorama}
              className="p-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer ml-1"
              aria-label="Exit 360 Viewer"
              title="Exit 360 Viewer (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* CLIENT LOGO - Top Left */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-2.5">
        {(tourTheme.logoUrl || preferences.clientLogoUrl) ? (
          <img src={tourTheme.logoUrl || preferences.clientLogoUrl} alt="Client Logo" className="h-10 w-auto object-contain drop-shadow-xl" />
        ) : (
          <div className="h-10 w-28 rounded-lg bg-[#18181B]/90 border border-[#27272A] flex items-center justify-center text-xs font-mono text-[#71717A] backdrop-blur-md">
            Client Logo
          </div>
        )}
        {tourTheme.title && <span className="text-xs font-mono font-bold text-white/90 drop-shadow">{tourTheme.title}</span>}
        <label className="cursor-pointer p-1 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#71717A] hover:text-white transition-colors backdrop-blur-md">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const url = URL.createObjectURL(file);
                updatePreferences({ clientLogoUrl: url });
                showToast('Client logo uploaded.', 'success');
              }
            }}
          />
          <Upload className="w-3.5 h-3.5" />
        </label>
      </div>

      {/* VIZTR LOGO - Top Right */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2.5">
        {preferences.viztrLogoUrl ? (
          <img src={preferences.viztrLogoUrl} alt="VizTR Logo" className="h-8 w-auto object-contain drop-shadow-xl" />
        ) : (
          <div className="h-8 w-20 rounded-lg bg-[#18181B]/90 border border-[#27272A] flex items-center justify-center text-xs font-mono font-bold text-[#3ECF8E] backdrop-blur-md">
            VIZTR
          </div>
        )}
        <label className="cursor-pointer p-1 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#71717A] hover:text-white transition-colors backdrop-blur-md">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const url = URL.createObjectURL(file);
                updatePreferences({ viztrLogoUrl: url });
                showToast('VizTR logo uploaded.', 'success');
              }
            }}
          />
          <Upload className="w-3.5 h-3.5" />
        </label>
      </div>

      {/* PLACEMENT MODE BANNER */}
      {isAddMode && (
        <div className="absolute top-14 inset-x-0 z-40 flex justify-center pointer-events-none animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 rounded-2xl bg-amber-400 text-black border border-amber-300 shadow-2xl flex items-center gap-2.5 text-xs font-mono font-bold pointer-events-auto">
            <MapPin className="w-4 h-4 animate-bounce" />
            <span>Click anywhere in the 360 scene to position your hotspot</span>
            <button
              onClick={() => setIsAddMode(false)}
              className="ml-2 px-2 py-0.5 rounded-lg bg-black text-white text-[10px] hover:bg-zinc-800 cursor-pointer"
            >
              Cancel (Esc)
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM HUD */}
      {preferences.showBottomControls && (
        <div className="absolute bottom-4 inset-x-4 z-30 flex flex-wrap items-end justify-between gap-3 pointer-events-none">
          {/* BOTTOM-LEFT: Orientation widget + settings menu */}
          <div className="flex flex-wrap items-end gap-3 pointer-events-auto">
            <div className="flex items-center gap-3 bg-[var(--glass-bg)] backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-[var(--glass-border)] pointer-events-auto">
              <div className="relative w-11 h-11 rounded-full border-2 border-rose-500/40 bg-zinc-900/80 flex items-center justify-center shrink-0">
                <span className="absolute top-0.5 text-[9px] font-bold text-rose-500">N</span>
                <div className="w-0.5 h-7 bg-gradient-to-t from-transparent via-rose-500 to-white rounded-full transition-transform duration-75" style={{ transform: `rotate(${yaw}deg)` }} />
              </div>
              <div className="text-left font-mono">
                <div className="text-[10px] font-bold text-white uppercase tracking-wider">Orientation</div>
                <div className="text-[10px] text-zinc-400">Yaw: {Math.round(yaw)}° · Pitch: {Math.round(pitch)}°</div>
              </div>
            </div>

            {/* Settings menu in bottom-left */}
            <div className="flex items-center gap-1.5 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-full p-1">
              <button
                onClick={handleShare}
                className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Share Room Link"
                title="Share Room Link"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowSearch(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Search Rooms"
                title="Search Rooms"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowPreferences(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Preferences"
                title="Preferences"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setHotspotDrawerOpen(!hotspotDrawerOpen)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  hotspotDrawerOpen ? 'bg-[#3ECF8E] text-black' : 'text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
                aria-label="Manage Room Hotspots"
                title="Manage Room Hotspots"
              >
                <Layers className="w-4 h-4" />
              </button>

              {/* Settings Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer settings-menu-trigger ${
                    settingsMenuOpen ? 'bg-[#3ECF8E] text-black' : 'text-zinc-300 hover:text-white hover:bg-white/10'
                  }`}
                  aria-label="Settings Menu"
                  title="Settings Menu"
                >
                  <Settings className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {settingsMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                      className="absolute bottom-full right-0 mb-3 w-72 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl shadow-2xl p-3 font-mono text-xs z-50 settings-menu-dropdown backdrop-blur-xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-[9px] text-[#71717A] uppercase font-bold tracking-wider mb-3">
                        Settings Menu
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-[#27272A]">
                        <div className="flex items-center gap-2">
                          <Music className="w-4 h-4 text-[#3ECF8E]" />
                          <span className="text-xs text-white">Background Music</span>
                        </div>
                        <button
                          onClick={() => updatePreferences({ musicEnabled: !preferences.musicEnabled })}
                          className={`relative w-10 h-5 rounded-full transition-colors ${preferences.musicEnabled ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'}`}
                          role="switch"
                          aria-checked={preferences.musicEnabled}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${preferences.musicEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                          {preferences.musicEnabled && preferences.backgroundMusicUrl && (
                            <audio ref={audioRef} src={preferences.backgroundMusicUrl} autoPlay loop style={{ display: 'none' }} />
                          )}
                        </button>
                      </div>

                      <div className="py-2 border-b border-[#27272A]">
                        <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Music</span>
                          <input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = URL.createObjectURL(file);
                                updatePreferences({ backgroundMusicUrl: url, musicEnabled: true });
                                showToast('Background music uploaded.', 'success');
                              }
                            }}
                          />
                        </label>
                      </div>

                      <div className="py-2 border-b border-[#27272A]">
                        <div className="flex items-center gap-2 mb-1">
                          <Volume2 className="w-3.5 h-3.5 text-[#3ECF8E]" />
                          <span className="text-xs text-white">Music Volume: {Math.round(preferences.musicVolume * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={preferences.musicVolume}
                          onChange={(e) => updatePreferences({ musicVolume: parseFloat(e.target.value) })}
                          className="w-full h-1.5 bg-[#27272A] rounded-full appearance-none cursor-pointer accent-[#3ECF8E]"
                        />
                      </div>

                      <div className="py-2 border-b border-[#27272A]">
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="w-4 h-4 text-[#3ECF8E]" />
                          <span className="text-xs text-white">AI Assistant</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {preferences.aiAssistantAvatarUrl ? (
                            <img src={preferences.aiAssistantAvatarUrl} alt="AI Assistant Avatar" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center">
                              <Bot className="w-5 h-5 text-[#3ECF8E]" />
                            </div>
                          )}
                          <div className="flex-1">
                            <label className="flex items-center gap-1 text-xs text-white cursor-pointer mb-1">
                              <Upload className="w-3 h-3" />
                              <span>Upload Avatar</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = URL.createObjectURL(file);
                                    updatePreferences({ aiAssistantAvatarUrl: url });
                                    showToast('AI assistant avatar updated.', 'success');
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                        <button
                          onClick={() => updatePreferences({ aiAssistantEnabled: !preferences.aiAssistantEnabled })}
                          className={`w-full mt-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            preferences.aiAssistantEnabled
                              ? 'bg-[#3ECF8E] text-black font-bold'
                              : 'bg-[#18181B] text-[#A1A1AA] hover:bg-[#27272A] hover:text-white'
                          }`}
                        >
                          {preferences.aiAssistantEnabled ? 'Assistant On' : 'Assistant Off'}
                        </button>
                      </div>

                      <div className="py-2">
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowGoogleDrivePanel(!showGoogleDrivePanel)}>
                          <div className="flex items-center gap-2 text-xs text-white">
                            <Globe className="w-4 h-4 text-[#3ECF8E]" />
                            <span>Google Drive Images</span>
                          </div>
                          <ChevronDown className={`w-3.5 h-3.5 text-[#71717A] transition-transform ${showGoogleDrivePanel ? 'rotate-180' : ''}`} />
                        </div>

                        <AnimatePresence>
                          {showGoogleDrivePanel && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mt-2 space-y-2 overflow-hidden"
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder="Folder ID"
                                  value={preferences.googleDriveFolderId}
                                  onChange={(e) => updatePreferences({ googleDriveFolderId: e.target.value })}
                                  className="flex-1 px-2 py-1 rounded bg-[#09090B] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#3ECF8E]"
                                />
                                <button
                                  onClick={() => updatePreferences({ showGoogleDriveSection: !preferences.showGoogleDriveSection })}
                                  className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                                    preferences.showGoogleDriveSection ? 'bg-[#3ECF8E] text-black' : 'bg-[#18181B] text-[#A1A1AA] hover:text-white'
                                  }`}
                                >
                                  {preferences.showGoogleDriveSection ? 'Hide' : 'Load'}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#121215]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* BOTTOM-CENTER: Circular transport buttons */}
          <div
            className="pointer-events-auto"
            onMouseEnter={() => {
              setShowBottomControls(true);
              setBottomControlsVisible(true);
              if (bottomControlsTimeoutRef.current) clearTimeout(bottomControlsTimeoutRef.current);
            }}
            onMouseLeave={() => {
              if (showBottomControlsOnHover) {
                bottomControlsTimeoutRef.current = setTimeout(() => {
                  setBottomControlsVisible(false);
                }, 1500);
              }
            }}
          >
            <div
              className={`flex items-center gap-2 sm:gap-3 px-3 py-2 rounded-full transition-all duration-500 ${
                bottomControlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
              } bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-xl shadow-2xl`}
            >
              <button
                onClick={() => {
                  const next = !isPlaying;
                  setIsPlaying(next);
                  updatePreferences({ autoRotate: next });
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  isPlaying ? 'bg-[#3ECF8E] text-black hover:bg-[#34b27b] scale-105' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                aria-label={isPlaying ? 'Pause auto-rotate' : 'Play auto-rotate'}
                title={isPlaying ? 'Pause Auto-Rotate' : 'Play Auto-Rotate'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setGuidedOn(!guidedOn)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  guidedOn ? 'bg-[#3ECF8E] text-black hover:bg-[#34b27b] scale-105' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                aria-label="Toggle guided tour"
                title="Guided Tour (auto-advance scenes)"
              >
                {guidedOn ? <MapPin className="w-4 h-4" /> : <Map className="w-4 h-4" />}
              </button>

              <button
                onClick={goBack}
                disabled={roomHistoryIndex <= 0}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                aria-label="Previous Room"
                title="Previous Room"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {preferences.showSceneCounter && (
                <div className="px-2 py-0.5 text-[10px] font-mono text-[#3ECF8E] bg-black/40 rounded-full">
                  {roomHistoryIndex + 1}/{Math.max(roomHistory.length, 1)}
                </div>
              )}

              <button
                onClick={goForward}
                disabled={roomHistoryIndex >= roomHistory.length - 1}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                aria-label="Next Room"
                title="Next Room"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* BOTTOM-RIGHT: Hotspot list + zoom + fullscreen */}
          <div className="flex items-center gap-3 pointer-events-auto">
            {/* HOTSPOT LIST POPOVER */}
            {preferences.showHotspotButton && (
              <div className="relative">
                <button
                  onClick={() => setShowHotspotListPanel(!showHotspotListPanel)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    showHotspotListPanel ? 'bg-[#3ECF8E] text-black scale-105' : 'bg-white/10 hover:bg-white/20 text-white'
                  }} border border-white/10 backdrop-blur-xl shadow-xl`}
                  aria-label="Toggle Hotspot List"
                  title="Hotspot List"
                >
                  <Layers className="w-5 h-5" />
                  {currentHotspots.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-[9px] font-bold flex items-center justify-center">
                      {currentHotspots.length}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showHotspotListPanel && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                      className="absolute bottom-full right-0 mb-3 w-64 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl shadow-2xl p-3 font-mono text-xs z-50 backdrop-blur-xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-[9px] text-[#71717A] uppercase font-bold tracking-wider mb-2">
                        {currentRoom.name} Hotspots ({currentHotspots.length})
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {currentHotspots.length === 0 ? (
                          <div className="text-[10px] text-[#71717A] py-4 text-center">No hotspots in this room.</div>
                        ) : (
                          currentHotspots.map((hp) => {
                            const colorStyle = getColorClasses(hp.color);
                            return (
                              <div key={hp.id} className="flex items-center gap-2.5 p-2 rounded-xl bg-[#09090B] border border-[#27272A] hover:border-[#3ECF8E]/30 transition-all">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorStyle.bg} text-white`}>
                                  {getHotspotIcon(hp.icon, hp.type)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-bold text-white truncate">{hp.title}</div>
                                  <div className="text-[9px] text-[#71717A] truncate">
                                    {hp.type === 'room_link' ? 'Room Link' : hp.category}
                                  </div>
                                </div>
                                <div className="text-[9px] text-[#71717A]">
                                  X:{Math.round(hp.xPercent)}% Y:{Math.round(hp.yPercent)}%
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                      <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#121215]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ZOOM CONTROLS */}
            {preferences.showZoomControls && (
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-0.5">
                <button
                  onClick={() => updatePreferences({ defaultZoom: Math.max(0.5, preferences.defaultZoom - 0.5) })}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/15 transition-colors cursor-pointer"
                  aria-label="Zoom In"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <span className="text-[9px] font-mono text-[#3ECF8E] w-12 text-center">{Math.round(fov)}°</span>
                <button
                  onClick={() => updatePreferences({ defaultZoom: Math.min(3, preferences.defaultZoom + 0.5) })}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/15 transition-colors cursor-pointer"
                  aria-label="Zoom Out"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* FULLSCREEN */}
            <button
              onClick={toggleFullscreen}
              className="w-full h-full rounded-full flex items-center justify-center bg-[var(--glass-bg)] hover:bg-white/20 border border-[var(--glass-border)] text-white backdrop-blur-xl transition-colors cursor-pointer"
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* CLOSE */}
            <button
              onClick={closePanorama}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer"
              aria-label="Exit 360 Viewer"
              title="Exit 360 Viewer (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals: ShareDialog, SearchPanel, PreferencesPanel */}
      <ShareDialog
        currentRoom={currentRoom}
        showShareDialog={showShareDialog}
        shareCopied={shareCopied}
        onClose={() => setShowShareDialog(false)}
        onCopy={handleCopyShareUrl}
        showToast={showToast}
      />

      <SearchPanel
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        currentRoom={currentRoom}
        rooms={rooms}
        onNavigate={navigateToRoomWithHistory}
      />

      <PreferencesPanel
        showPreferences={showPreferences}
        preferences={preferences}
        updatePreferences={updatePreferences}
        showToast={showToast}
        audioRef={audioRef}
        onResetDefaults={onResetDefaults}
        onClose={() => setShowPreferences(false)}
      />
    </>
  );
}
