'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Music, Bot, Globe, ImageIcon, Settings } from 'lucide-react';
import type { TourPreferences } from '@/hooks/use-tour-preferences';

export interface PreferencesPanelProps {
  showPreferences: boolean;
  preferences: TourPreferences;
  updatePreferences: (updates: Partial<TourPreferences>) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onResetDefaults: () => void;
  onClose?: () => void;
  audioRef?: React.RefObject<HTMLAudioElement>;
}

export default function PreferencesPanel({
  showPreferences,
  preferences,
  updatePreferences,
  showToast,
  onResetDefaults,
  onClose,
}: PreferencesPanelProps) {
  return (
    <AnimatePresence>
      {showPreferences && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose || (() => updatePreferences({}))}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#3ECF8E]" />
                Preferences
              </h3>
              <button
                onClick={onClose || (() => updatePreferences({}))}
                className="p-1.5 rounded-lg hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
              <div className="space-y-3">
                <label className="text-sm font-medium text-white">Motion Intensity</label>
                <div className="flex gap-2">
                  {(['off', 'low', 'high'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => updatePreferences({ motionIntensity: level })}
                      className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        preferences.motionIntensity === level
                          ? 'bg-[#3ECF8E] text-black font-bold'
                          : 'bg-[#27272A] text-[#A1A1AA] hover:bg-[#3F3F46] hover:text-white'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-white">Auto Rotate Speed</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={preferences.autoRotateSpeed}
                  onChange={(e) => updatePreferences({ autoRotateSpeed: parseInt(e.target.value) })}
                  className="w-full h-2 bg-[#27272A] rounded-full appearance-none cursor-pointer accent-[#3ECF8E]"
                />
                <div className="flex justify-between text-[10px] text-[#71717A] font-mono">
                  <span>Off</span>
                  <span>{preferences.autoRotateSpeed}x</span>
                  <span>Max</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-white">Default Zoom</label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={preferences.defaultZoom}
                  onChange={(e) => updatePreferences({ defaultZoom: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-[#27272A] rounded-full appearance-none cursor-pointer accent-[#3ECF8E]"
                />
                <div className="flex justify-between text-[10px] text-[#71717A] font-mono">
                  <span>0.5x</span>
                  <span>{preferences.defaultZoom.toFixed(1)}x</span>
                  <span>3x</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-white">Theme</label>
                <div className="flex gap-2">
                  {(['dark', 'light', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => updatePreferences({ theme: t })}
                      className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        preferences.theme === t
                          ? 'bg-[#3ECF8E] text-black font-bold'
                          : 'bg-[#27272A] text-[#A1A1AA] hover:bg-[#3F3F46] hover:text-white'
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#27272A] space-y-4">
                <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider">Layout & UI</h4>
                <ToggleItem label="Show Hotspots" checked={preferences.showHotspots} onChange={(v) => updatePreferences({ showHotspots: v })} />
                <ToggleItem label="Gyroscope" checked={preferences.gyroscopeEnabled} onChange={(v) => updatePreferences({ gyroscopeEnabled: v })} />
                <ToggleItem label="Hide Top Bar (Public)" checked={preferences.hideTopBar} onChange={(v) => updatePreferences({ hideTopBar: v })} />
                <ToggleItem label="Show Bottom Controls" checked={preferences.showBottomControls} onChange={(v) => updatePreferences({ showBottomControls: v })} />
                <ToggleItem label="Auto-hide on Hover" checked={preferences.showBottomControlsOnHover} onChange={(v) => updatePreferences({ showBottomControlsOnHover: v })} />
                <ToggleItem label="Show Hotspot Button" checked={preferences.showHotspotButton} onChange={(v) => updatePreferences({ showHotspotButton: v })} />
                <ToggleItem label="Show Zoom Controls" checked={preferences.showZoomControls} onChange={(v) => updatePreferences({ showZoomControls: v })} />
                <ToggleItem label="Show Scene Counter" checked={preferences.showSceneCounter} onChange={(v) => updatePreferences({ showSceneCounter: v })} />
                <ToggleItem label="Ctrl + Arrow Axis Rotation" checked={preferences.ctrlAxisRotationEnabled} onChange={(v) => updatePreferences({ ctrlAxisRotationEnabled: v })} />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Ctrl Rotation Step: {preferences.ctrlAxisRotationStep}°</label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={preferences.ctrlAxisRotationStep}
                    onChange={(e) => updatePreferences({ ctrlAxisRotationStep: parseInt(e.target.value) })}
                    className="w-full h-2 bg-[#27272A] rounded-full appearance-none cursor-pointer accent-[#3ECF8E]"
                  />
                </div>

                <ToggleItem label="Mouse Scroll Zoom" checked={preferences.scrollZoomEnabled} onChange={(v) => updatePreferences({ scrollZoomEnabled: v })} />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Scroll Zoom Step: {preferences.scrollZoomStep}°</label>
                  <input
                    type="range"
                    min="5"
                    max="20"
                    step="1"
                    value={preferences.scrollZoomStep}
                    onChange={(e) => updatePreferences({ scrollZoomStep: parseInt(e.target.value) })}
                    className="w-full h-2 bg-[#27272A] rounded-full appearance-none cursor-pointer accent-[#3ECF8E]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#27272A] space-y-4">
                <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider">Branding & Assets</h4>

                <AssetUploadRow
                  label="Client Logo"
                  hasAsset={!!preferences.clientLogoUrl}
                  onUpload={(file) => {
                    const url = URL.createObjectURL(file);
                    updatePreferences({ clientLogoUrl: url });
                    showToast('Client logo uploaded.', 'success');
                  }}
                  onDelete={() => updatePreferences({ clientLogoUrl: '' })}
                />
                <AssetUploadRow
                  label="VizTR Logo"
                  hasAsset={!!preferences.viztrLogoUrl}
                  onUpload={(file) => {
                    const url = URL.createObjectURL(file);
                    updatePreferences({ viztrLogoUrl: url });
                    showToast('VizTR logo uploaded.', 'success');
                  }}
                  onDelete={() => updatePreferences({ viztrLogoUrl: '' })}
                />
                <AssetUploadRow
                  label="Floor Plan"
                  hasAsset={!!preferences.floorPlanImageUrl}
                  accept="image/*"
                  icon={<ImageIcon className="w-3.5 h-3.5" />}
                  onUpload={(file) => {
                    const url = URL.createObjectURL(file);
                    updatePreferences({ floorPlanImageUrl: url });
                    showToast('Floor plan uploaded.', 'success');
                  }}
                  onDelete={() => updatePreferences({ floorPlanImageUrl: '' })}
                />
                <ToggleItem label="Show Floor Plan Navigator" checked={preferences.showFloorPlan} onChange={(v) => updatePreferences({ showFloorPlan: v })} />
                <AssetUploadRow
                  label="Background Music"
                  hasAsset={!!preferences.backgroundMusicUrl}
                  accept="audio/*"
                  icon={<Music className="w-3.5 h-3.5" />}
                  onUpload={(file) => {
                    const url = URL.createObjectURL(file);
                    updatePreferences({ backgroundMusicUrl: url, musicEnabled: true });
                    showToast('Background music uploaded.', 'success');
                  }}
                  onDelete={() => updatePreferences({ backgroundMusicUrl: '' })}
                />
                <ToggleItem label="Background Music" checked={preferences.musicEnabled} onChange={(v) => updatePreferences({ musicEnabled: v })} />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Music Volume: {Math.round(preferences.musicVolume * 100)}%</label>
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-[#3ECF8E]" />
                    <span className="text-xs text-white">AI Assistant</span>
                  </div>
                  <button
                    onClick={() => updatePreferences({ aiAssistantEnabled: !preferences.aiAssistantEnabled })}
                    className={`relative w-10 h-5 rounded-full transition-colors ${preferences.aiAssistantEnabled ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'}`}
                    role="switch"
                    aria-checked={preferences.aiAssistantEnabled}
                  >
                    <span className={`absolute top-0.5 transition-transform duration-200 ${preferences.aiAssistantEnabled ? 'translate-x-5' : 'translate-x-0.5'}`}>
                      <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                    </span>
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#71717A] uppercase font-bold">Google Drive Folder</label>
                  <div className="flex items-center gap-1">
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
                  {preferences.showGoogleDriveSection && preferences.googleDriveFolderId && (
                    <div className="text-[9px] text-[#71717A]">Drive folder: {preferences.googleDriveFolderId}</div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#27272A]">
                <div className="mb-3 text-center">
                  <span className="text-xs text-[#71717A]">Ctrl + Arrow keys → faster axis rotation ({preferences.ctrlAxisRotationStep}°)</span>
                </div>
                <button
                  onClick={onResetDefaults}
                  className="w-full px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Reset to Defaults
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ToggleItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-white">{label}</label>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'}`}
        role="switch"
        aria-checked={checked}
      >
        <span className={`absolute top-0.5 transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-0.5'}`}>
          <span className="w-5 h-5 rounded-full bg-white shadow-md" />
        </span>
      </button>
    </div>
  );
}

function AssetUploadRow({
  label,
  hasAsset,
  accept = 'image/*',
  icon = <Upload className="w-3.5 h-3.5" />,
  onUpload,
  onDelete,
}: {
  label: string;
  hasAsset: boolean;
  accept?: string;
  icon?: React.ReactNode;
  onUpload: (file: File) => void;
  onDelete?: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-white">{label}</label>
      <label className="cursor-pointer p-1 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#71717A] hover:text-white transition-colors">
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
          }}
        />
        {icon}
      </label>
      {hasAsset && <span className="text-[9px] text-[#3ECF8E]">✓</span>}
    </div>
  );
}
