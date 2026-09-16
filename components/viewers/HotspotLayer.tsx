'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  CheckCircle2,
  DoorOpen,
  ExternalLink,
  Copy,
  RotateCcw,
  Info,
  Package,
  Layers,
  Eye,
  Zap,
  Flame,
  Tag,
  Volume2,
  Palette,
  Box,
  Map,
  ArrowRight,
} from 'lucide-react';
import type { Hotspot, HotspotColor, HotspotType, HotspotSpec, HotspotCategory, TourRoom } from '@/components/viewers/PanoramaViewer';
import { getColorClasses, getHotspotIcon } from './hotspot-utils';
import HotspotOverlay, { HotspotOverlayProps } from './HotspotOverlay';

export interface HotspotLayerProps {
  hotspots: Hotspot[];
  yaw: number;
  pitch: number;
  fov: number;
  showHotspots: boolean;
  isAddMode: boolean;
  activeHotspot: Hotspot | null;
  placingCoords: { xPercent: number; yPercent: number } | null;
  configModalOpen: boolean;
  editingHotspotId: string | null;
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
  hotspotDrawerOpen: boolean;
  roomHistoryIndex: number;
  roomHistoryLength: number;
  rooms: TourRoom[];
  currentRoom: TourRoom;
  currentHotspots: Hotspot[];
  screenToHotspotCoords: (clientX: number, clientY: number) => { xPercent: number; yPercent: number } | null;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onHotspotClick: (hp: Hotspot) => void;
  onSaveHotspot: (e: React.FormEvent) => void;
  onEditHotspot: (hp: Hotspot) => void;
  onDeleteHotspot: (hpId: string) => void;
  onFocusHotspot: (hp: Hotspot) => void;
  onExportTour: () => void;
  onResetTour: () => void;
  onCanvasClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onSetIsAddMode: (val: boolean) => void;
  onSetPlacingCoords: (val: { xPercent: number; yPercent: number } | null) => void;
  onSetConfigModalOpen: (val: boolean) => void;
  onSetEditingHotspotId: (val: string | null) => void;
  onSetFormType: (val: HotspotType) => void;
  onSetFormTitle: (val: string) => void;
  onSetFormCategory: (val: HotspotCategory) => void;
  onSetFormDescription: (val: string) => void;
  onSetFormColor: (val: HotspotColor) => void;
  onSetFormIcon: (val: string) => void;
  onSetFormPulse: (val: 'radar' | 'glowing' | 'subtle') => void;
  onSetFormSpecs: (val: HotspotSpec[]) => void;
  onSetFormTargetRoomId: (val: string) => void;
  onSetFormCustomRoomName: (val: string) => void;
  onSetFormCustomPanoramaUrl: (val: string) => void;
  onSetHotspotDrawerOpen: (val: boolean) => void;
  onTeleportToRoom: (targetRoomId: string, customUrl?: string, customName?: string, targetYaw?: number) => void;
}

export default function HotspotLayer({
  hotspots,
  yaw,
  pitch,
  fov,
  showHotspots,
  isAddMode,
  activeHotspot,
  placingCoords,
  configModalOpen,
  editingHotspotId,
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
  hotspotDrawerOpen,
  roomHistoryIndex,
  roomHistoryLength,
  rooms,
  currentRoom,
  currentHotspots,
  screenToHotspotCoords,
  showToast,
  onHotspotClick,
  onSaveHotspot,
  onEditHotspot,
  onDeleteHotspot,
  onFocusHotspot,
  onExportTour,
  onResetTour,
  onCanvasClick,
  onSetIsAddMode,
  onSetPlacingCoords,
  onSetConfigModalOpen,
  onSetEditingHotspotId,
  onSetFormType,
  onSetFormTitle,
  onSetFormCategory,
  onSetFormDescription,
  onSetFormColor,
  onSetFormIcon,
  onSetFormPulse,
  onSetFormSpecs,
  onSetFormTargetRoomId,
  onSetFormCustomRoomName,
  onSetFormCustomPanoramaUrl,
  onSetHotspotDrawerOpen,
  onTeleportToRoom,
}: HotspotLayerProps) {
  const overlayProps: HotspotOverlayProps = {
    hotspots,
    yaw,
    pitch,
    fov,
    showHotspots,
    isAddMode,
    activeHotspot,
    onHotspotClick,
  };

  return (
    <>
      {/* RENDERED INTERACTIVE HOTSPOTS */}
      <HotspotOverlay {...overlayProps} />

      {/* ACTIVE HOTSPOT SPECIFICATION / PORTAL CARD */}
      <AnimatePresence>
        {activeHotspot && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[92vw] p-5 rounded-3xl bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-2xl shadow-2xl font-mono pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#27272A] pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                      getColorClasses(activeHotspot.color).text
                    } ${getColorClasses(activeHotspot.color).border} bg-black/40`}
                  >
                    {activeHotspot.type === 'room_link' ? '🚪 Room Portal Link' : `📐 ${activeHotspot.category}`}
                  </span>
                  {activeHotspot.isCustom && (
                    <span className="text-[9px] font-mono text-[#3ECF8E] bg-[#3ECF8E]/10 px-1.5 py-0.2 rounded border border-[#3ECF8E]/30">
                      Custom User Hotspot
                    </span>
                  )}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white font-display">
                  {activeHotspot.title}
                </h3>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEditHotspot(activeHotspot)}
                  className="p-1.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Edit Hotspot Parameters"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onDeleteHotspot(activeHotspot.id)}
                  className="p-1.5 rounded-lg bg-[#18181B] hover:bg-rose-950 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Delete Hotspot"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onHotspotClick(null as any)}
                  className="p-1.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed mt-3 font-sans">
              {activeHotspot.description}
            </p>

            {activeHotspot.type === 'image' && activeHotspot.mediaUrl && (
              <div className="mt-3 rounded-xl overflow-hidden border border-[#27272A]">
                <img src={activeHotspot.mediaUrl} alt={activeHotspot.title} className="w-full object-cover max-h-56" />
              </div>
            )}
            {activeHotspot.type === 'video' && activeHotspot.mediaUrl && (
              <div className="mt-3 rounded-xl overflow-hidden border border-[#27272A] aspect-video bg-black">
                {/youtube\.com|youtu\.be|vimeo\.com/i.test(activeHotspot.mediaUrl) ? (
                  <iframe
                    src={activeHotspot.mediaUrl}
                    title={activeHotspot.title}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video src={activeHotspot.mediaUrl} controls className="w-full h-full" />
                )}
              </div>
            )}
            {activeHotspot.type === 'info' && activeHotspot.article && (
              <div className="mt-3 p-3 rounded-xl bg-[#09090B] border border-[#27272A] text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {activeHotspot.article}
              </div>
            )}

            {activeHotspot.type === 'audio' && activeHotspot.audioUrl && (
              <div className="mt-3">
                <audio src={activeHotspot.audioUrl} controls className="w-full" />
              </div>
            )}

            {activeHotspot.type === 'link' && activeHotspot.externalUrl && (
              <a
                href={activeHotspot.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Link</span>
              </a>
            )}

            {activeHotspot.specs && activeHotspot.specs.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[#27272A] grid grid-cols-2 sm:grid-cols-3 gap-2">
                {activeHotspot.specs.map((s, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-[#09090B] border border-[#27272A] space-y-0.5">
                    <div className="text-[9px] text-[#71717A] uppercase">{s.label}</div>
                    <div className="text-[11px] font-bold text-white truncate">{s.value}</div>
                  </div>
                ))}
              </div>
            )}

            {activeHotspot.type === 'room_link' && (
              <button
                onClick={() =>
                  onTeleportToRoom(
                    activeHotspot.targetRoomId || '',
                    activeHotspot.targetPanoramaUrl,
                    activeHotspot.targetRoomName,
                    activeHotspot.targetYaw
                  )
                }
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg"
              >
                <DoorOpen className="w-4 h-4" />
                <span>Teleport to {activeHotspot.targetRoomName || 'Destination Room'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HOTSPOT LIST DRAWER (SLIDE-OVER PANEL) */}
      <AnimatePresence>
        {hotspotDrawerOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="absolute top-0 right-0 bottom-0 w-full sm:w-96 bg-[var(--glass-bg)] border-l border-[var(--glass-border)] z-40 p-5 flex flex-col justify-between font-mono shadow-2xl pointer-events-auto overflow-y-auto backdrop-blur-xl"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#3ECF8E]" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Room Hotspots ({currentHotspots.length})
                  </h3>
                </div>
                <button
                  onClick={() => onSetHotspotDrawerOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#18181B]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  onSetHotspotDrawerOpen(false);
                  onSetIsAddMode(true);
                  showToast('Click anywhere in the 360 scene to drop your hotspot!', 'info');
                }}
                className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Hotspot to This Room</span>
              </button>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {currentHotspots.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500 text-xs">
                    No hotspots placed yet in this space. Click &quot;Add Hotspot&quot; to create one.
                  </div>
                ) : (
                  currentHotspots.map((hp) => {
                    const colorStyle = getColorClasses(hp.color);
                    return (
                      <div
                        key={hp.id}
                        className="p-3 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-white/20 transition-all space-y-2 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${colorStyle.bg} text-white`}>
                              {getHotspotIcon(hp.icon, hp.type)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-white truncate">{hp.title}</h4>
                              <div className="text-[10px] text-[#71717A] uppercase">
                                {hp.type === 'room_link' ? 'Room Link' : hp.category}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => onFocusHotspot(hp)}
                              className="p-1 rounded bg-[#09090B] hover:bg-[#27272A] text-zinc-300 hover:text-white text-[10px] flex items-center gap-1 cursor-pointer"
                              title="Look at this hotspot in 360 view"
                            >
                              <Eye className="w-3 h-3 text-[#3ECF8E]" />
                              <span>Look</span>
                            </button>
                            <button
                              onClick={() => onEditHotspot(hp)}
                              className="p-1 rounded bg-[#09090B] hover:bg-[#27272A] text-zinc-400 hover:text-white cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onDeleteHotspot(hp.id)}
                              className="p-1 rounded bg-[#09090B] hover:bg-rose-950 text-zinc-400 hover:text-rose-400 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] text-zinc-400 line-clamp-2 font-sans">
                          {hp.description}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#27272A] space-y-2">
              <button
                onClick={onExportTour}
                className="w-full py-1.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-[#3ECF8E]" />
                <span>Export Tour Config JSON</span>
              </button>

              <button
                onClick={onResetTour}
                className="w-full py-1.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs text-[#71717A] hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default Scene Hotspots</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONFIGURE 360 HOTSPOT MODAL */}
      <AnimatePresence>
        {configModalOpen && (
          <div
            id="configure-hotspot-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono animate-in fade-in duration-150"
            onClick={() => onSetConfigModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl rounded-3xl bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto backdrop-blur-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-display">
                      {editingHotspotId ? 'Edit 360 Hotspot' : 'Configure Spatial Hotspot'}
                    </h3>
                    <p className="text-[10px] text-[#71717A]">
                      Coords: X: {placingCoords?.xPercent}% · Y: {placingCoords?.yPercent}% in {currentRoom.name}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onSetConfigModalOpen(false)}
                  className="p-1.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] text-[#71717A] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={onSaveHotspot} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">
                    Hotspot Interaction Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onSetFormType('metadata')}
                      className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                        formType === 'metadata'
                          ? 'bg-[#18181B] border-[#3ECF8E] text-white font-bold'
                          : 'bg-[#09090B] border-[#27272A] text-[#71717A] hover:text-white'
                      }`}
                    >
                      <Info className="w-4 h-4 text-[#3ECF8E]" />
                      <div className="text-left">
                        <div className="text-xs">Metadata & Specs</div>
                        <div className="text-[9px] text-[#71717A] font-normal">
                          PBR material / furniture info popup
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSetFormType('room_link')}
                      className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                        formType === 'room_link'
                          ? 'bg-[#18181B] border-rose-500 text-white font-bold'
                          : 'bg-[#09090B] border-[#27272A] text-[#71717A] hover:text-white'
                      }`}
                    >
                      <DoorOpen className="w-4 h-4 text-rose-400" />
                      <div className="text-left">
                        <div className="text-xs">Link to Room (Portal)</div>
                        <div className="text-[9px] text-[#71717A] font-normal">
                          Teleport jump to another 360 space
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">
                    Hotspot Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => onSetFormTitle(e.target.value)}
                    placeholder={
                      formType === 'room_link'
                        ? 'e.g., Proceed to Cantilever Terrace'
                        : 'e.g., Bookmatched Calacatta Gold Marble'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-white text-xs placeholder:text-[#71717A] focus:border-[#3ECF8E] outline-none"
                  />
                </div>

                {formType === 'metadata' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">
                          Category Classification
                        </label>
                        <select
                          value={formCategory}
                          onChange={(e) => onSetFormCategory(e.target.value as HotspotCategory)}
                          className="w-full px-3 py-2 rounded-xl bg-[#09090B] border border-[#27272A] text-white text-xs outline-none cursor-pointer"
                        >
                          <option value="material">Material (PBR Texture)</option>
                          <option value="furniture">Furniture & FF&E</option>
                          <option value="spatial">Spatial Architecture</option>
                          <option value="lighting">Lighting & Lumens</option>
                          <option value="acoustic">Acoustic Spec</option>
                          <option value="custom">Custom Annotation</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">
                          Icon Symbol
                        </label>
                        <select
                          value={formIcon}
                          onChange={(e) => onSetFormIcon(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#09090B] border border-[#27272A] text-white text-xs outline-none cursor-pointer"
                        >
                          <option value="sparkles">Sparkles / Hero</option>
                          <option value="palette">Palette / Texture</option>
                          <option value="box">Box / 3D Asset</option>
                          <option value="layers">Layers / Glazing</option>
                          <option value="eye">Eye / Detail</option>
                          <option value="flame">Flame / Fireplace</option>
                          <option value="tag">Tag / Specification</option>
                          <option value="acoustic">Audio / Acoustic</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">
                          Technical Specs (Key/Value)
                        </label>
                        <button
                          type="button"
                          onClick={() => onSetFormSpecs([...formSpecs, { label: '', value: '' }])}
                          className="text-[10px] text-[#3ECF8E] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Spec Field</span>
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {formSpecs.map((spec, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={spec.label}
                              onChange={(e) => {
                                const updated = [...formSpecs];
                                updated[idx].label = e.target.value;
                                onSetFormSpecs(updated);
                              }}
                              placeholder="Spec Label (e.g. Origin)"
                              className="w-1/3 px-2.5 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-white text-[11px] placeholder:text-[#71717A] outline-none"
                            />
                            <input
                              type="text"
                              value={spec.value}
                              onChange={(e) => {
                                const updated = [...formSpecs];
                                updated[idx].value = e.target.value;
                                onSetFormSpecs(updated);
                              }}
                              placeholder="Spec Value (e.g. Carrara, Italy)"
                              className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-white text-[11px] placeholder:text-[#71717A] outline-none"
                            />
                            {formSpecs.length > 1 && (
                              <button
                                type="button"
                                onClick={() => onSetFormSpecs(formSpecs.filter((_, i) => i !== idx))}
                                className="p-1 rounded text-zinc-500 hover:text-rose-400"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {formType === 'room_link' && (
                  <div className="space-y-3 p-3.5 rounded-2xl bg-[#09090B] border border-[#27272A]">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">
                        Destination Room
                      </label>
                      <select
                        value={formTargetRoomId}
                        onChange={(e) => onSetFormTargetRoomId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-white text-xs outline-none cursor-pointer"
                      >
                        {rooms.map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.name} ({room.subtitle})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="pt-2 border-t border-[#27272A] space-y-1.5">
                      <div className="text-[10px] text-[#71717A]">Or Link to Custom 360 Panorama URL:</div>
                      <input
                        type="url"
                        value={formCustomPanoramaUrl}
                        onChange={(e) => onSetFormCustomPanoramaUrl(e.target.value)}
                        placeholder="https://... (Equirectangular 360 JPG/PNG)"
                        className="w-full px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-white text-xs placeholder:text-[#71717A] outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">
                    Detailed Annotation / Description
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => onSetFormDescription(e.target.value)}
                    placeholder="Provide architectural rationale, material finish notes, or navigation guidance..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#09090B] border border-[#27272A] text-white text-xs placeholder:text-[#71717A] outline-none resize-none font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">
                    Hotspot Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    {(['rose', 'emerald', 'cyan', 'amber', 'violet', 'blue'] as HotspotColor[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => onSetFormColor(c)}
                        className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                          getColorClasses(c).bg
                        } ${formColor === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
                      >
                        {formColor === c && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#27272A] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onSetConfigModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-zinc-300 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingHotspotId ? 'Save Changes' : 'Place Hotspot'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
