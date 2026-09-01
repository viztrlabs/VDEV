'use client';

import React, { useState } from 'react';
import {
  Eye,
  Image as ImageIcon,
  PlayCircle,
  Info,
  Folder,
  Users,
  Music,
  Save,
  CheckCircle2,
  Globe,
  Volume2,
  Smartphone,
  Link as LinkIcon,
  Sparkles,
  QrCode,
  Crown,
  Languages,
  RefreshCw,
  Copy,
} from 'lucide-react';
import type {
  VtedCollaboration,
  VtedContent,
  VtedCopyright,
  VtedLogo,
  VtedPopupIntro,
  VtedSystem,
} from '@/lib/vted-types';

interface ContentSettingsPanelProps {
  value: VtedContent;
  onChange: (next: VtedContent) => void;
  onSave: () => void;
  saved: boolean;
  sceneOptions: Array<{ id: string; name: string }>;
}

function ToggleRow({ label, value, onChange, description }: { label: string; value: boolean; onChange: (v: boolean) => void; description?: string }) {
  return (
    <div className="flex items-center justify-between p-2 rounded bg-[#09090B] border border-[#27272A]">
      <div>
        <div className="text-[10px] font-mono text-[#FAFAFA]">{label}</div>
        {description && <div className="text-[9px] text-[#71717A]">{description}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-9 h-5 rounded-full relative transition-colors ${
          value ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
            value ? 'left-4' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

function SliderRow({ label, value, onChange, min = 0, max = 100 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div>
      <label className="flex items-center justify-between text-[10px] font-mono text-[#A1A1AA]">
        <span>{label}</span>
        <span className="text-[#FAFAFA] font-bold">{value}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#3ECF8E]"
      />
    </div>
  );
}

// =============================================================
// Logo Setup
// =============================================================
function LogoTab({ logo, onChange }: { logo: VtedLogo; onChange: (next: VtedLogo) => void }) {
  const set = (patch: Partial<VtedLogo>) => onChange({ ...logo, ...patch });
  return (
    <div className="space-y-2">
      <ToggleRow
        label="Logo enabled"
        value={logo.enabled}
        onChange={(v) => set({ enabled: v })}
      />
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
          Image URL
        </label>
        <input
          value={logo.imageUrl || ''}
          onChange={(e) => set({ imageUrl: e.target.value })}
          placeholder="https://…/logo.png"
          className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
        />
      </div>
      <div>
        <label className="block text-[10px] font-mono text-[#A1A1AA]">
          Width {logo.width}px
        </label>
        <input
          type="range"
          min={40}
          max={400}
          value={logo.width}
          onChange={(e) => set({ width: Number(e.target.value) })}
          className="w-full accent-[#3ECF8E]"
        />
      </div>
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
          Redirect URL
        </label>
        <input
          value={logo.redirectUrl || ''}
          onChange={(e) => set({ redirectUrl: e.target.value })}
          placeholder="https://…"
          className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
        />
      </div>
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
          Position
        </label>
        <div className="grid grid-cols-3 gap-1">
          {(['top_left', 'top_center', 'top_right'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => set({ position: p })}
              className={`px-2 py-1.5 rounded border text-[9px] font-mono ${
                logo.position === p
                  ? 'bg-[#3ECF8E]/15 border-[#3ECF8E]/40 text-[#3ECF8E]'
                  : 'bg-[#09090B] border-[#27272A] text-[#A1A1AA]'
              }`}
            >
              {p.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================
// Popup Intro
// =============================================================
function PopupIntroTab({ popup, onChange }: { popup: VtedPopupIntro; onChange: (next: VtedPopupIntro) => void }) {
  const set = (patch: Partial<VtedPopupIntro>) => onChange({ ...popup, ...patch });
  return (
    <div className="space-y-2">
      <ToggleRow
        label="Popup intro enabled"
        value={popup.enabled}
        onChange={(v) => set({ enabled: v })}
      />
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
          Mode
        </label>
        <div className="grid grid-cols-3 gap-1">
          {(['image', 'video', 'description_tour'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => set({ mode: m })}
              className={`px-2 py-1.5 rounded border text-[9px] font-mono ${
                popup.mode === m
                  ? 'bg-[#3ECF8E]/15 border-[#3ECF8E]/40 text-[#3ECF8E]'
                  : 'bg-[#09090B] border-[#27272A] text-[#A1A1AA]'
              }`}
            >
              {m.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
      {popup.mode === 'image' && (
        <>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
              Image (Desktop)
            </label>
            <input
              value={popup.imageDesktopUrl || ''}
              onChange={(e) => set({ imageDesktopUrl: e.target.value })}
              placeholder="https://…/intro-desktop.png"
              className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
              Image (Mobile)
            </label>
            <input
              value={popup.imageMobileUrl || ''}
              onChange={(e) => set({ imageMobileUrl: e.target.value })}
              placeholder="https://…/intro-mobile.png"
              className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
            />
          </div>
        </>
      )}
      {popup.mode === 'video' && (
        <>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
              Video (Desktop)
            </label>
            <input
              value={popup.videoDesktopUrl || ''}
              onChange={(e) => set({ videoDesktopUrl: e.target.value })}
              placeholder="https://…/intro-desktop.mp4"
              className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
              Video (Mobile)
            </label>
            <input
              value={popup.videoMobileUrl || ''}
              onChange={(e) => set({ videoMobileUrl: e.target.value })}
              placeholder="https://…/intro-mobile.mp4"
              className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
            />
          </div>
          <ToggleRow
            label="Mute"
            value={!!popup.mute}
            onChange={(v) => set({ mute: v })}
          />
        </>
      )}
      {popup.mode === 'description_tour' && (
        <>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
              Description tour
            </label>
            <select
              value={popup.descriptionTourId || ''}
              onChange={(e) => set({ descriptionTourId: e.target.value })}
              className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
            >
              <option value="">— Default —</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
              Display mode
            </label>
            <div className="grid grid-cols-2 gap-1">
              {(['fullscreen', 'modal'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => set({ descriptionMode: m })}
                  className={`px-2 py-1.5 rounded border text-[9px] font-mono ${
                    popup.descriptionMode === m
                      ? 'bg-[#3ECF8E]/15 border-[#3ECF8E]/40 text-[#3ECF8E]'
                      : 'bg-[#09090B] border-[#27272A] text-[#A1A1AA]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      <ToggleRow
        label="Auto close"
        value={!!popup.autoClose}
        onChange={(v) => set({ autoClose: v })}
      />
      {popup.autoClose && (
        <div>
          <label className="block text-[10px] font-mono text-[#A1A1AA]">
            Auto close time {popup.autoCloseTime ?? 2}s
          </label>
          <input
            type="range"
            min={1}
            max={30}
            value={popup.autoCloseTime ?? 2}
            onChange={(e) => set({ autoCloseTime: Number(e.target.value) })}
            className="w-full accent-[#3ECF8E]"
          />
        </div>
      )}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
          Close button text
        </label>
        <input
          value={popup.textClose || ''}
          onChange={(e) => set({ textClose: e.target.value })}
          placeholder="Skip intro"
          className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
        />
      </div>
    </div>
  );
}

// =============================================================
// System & Storage
// =============================================================
function SystemTab({ system, onChange }: { system: VtedSystem; onChange: (next: VtedSystem) => void }) {
  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-[#27272A] bg-[#0c0c0f] p-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
          Archived images
        </div>
        {system.archivedImagesReady ? (
          <div className="text-[10px] font-mono text-[#3ECF8E]">Ready to restore</div>
        ) : (
          <div className="text-[10px] font-mono text-amber-400">No archives available</div>
        )}
        <p className="text-[9px] text-[#71717A] mt-1">
          Archived images cannot be loaded in the tour but remain available for restore.
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          <button
            type="button"
            onClick={() => onChange({ ...system, archivedImagesReady: true })}
            className="flex-1 px-2 py-1.5 rounded bg-blue-500/15 border border-blue-500/40 text-blue-300 text-[10px] font-mono font-bold"
          >
            Restore archived images
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...system, lastArchiveRefreshAt: new Date().toISOString() })}
            className="px-2 py-1.5 rounded bg-[#18181B] border border-[#27272A] text-white text-[10px] font-mono flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>
        <p className="text-[9px] text-[#71717A] mt-1">
          If the status does not update automatically, refresh this page later.
        </p>
      </div>
    </div>
  );
}

// =============================================================
// Collaboration
// =============================================================
function CollaborationTab({
  collab,
  onChange,
}: {
  collab: VtedCollaboration;
  onChange: (next: VtedCollaboration) => void;
}) {
  const [publicBase] = useState(typeof window !== 'undefined' ? window.location.origin : 'https://viztr.com');
  const url = collab.url || `${publicBase}/xr-world/virtual-tour?collab=1`;

  return (
    <div className="space-y-2">
      <ToggleRow
        label="Enable collaboration"
        value={collab.enabled}
        onChange={(v) => onChange({ ...collab, enabled: v })}
      />
      <div className="grid grid-cols-3 gap-2">
        <MetricMini label="Comments" value={collab.commentsTotal ?? 0} />
        <MetricMini label="Resolved" value={collab.commentsResolved ?? 0} color="emerald" />
        <MetricMini label="Unresolved" value={collab.commentsUnresolved ?? 0} color="amber" />
      </div>
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
          Sharing permissions
        </label>
        <div className="grid grid-cols-2 gap-1">
          {(['anyone', 'restricted'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChange({ ...collab, permissions: p })}
              className={`px-2 py-1.5 rounded border text-[10px] font-mono ${
                collab.permissions === p
                  ? 'bg-[#3ECF8E]/15 border-[#3ECF8E]/40 text-[#3ECF8E]'
                  : 'bg-[#09090B] border-[#27272A] text-[#A1A1AA]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
          Collaboration URL
        </label>
        <div className="flex items-center gap-1.5">
          <input
            value={url}
            readOnly
            className="flex-1 bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[10px] font-mono text-white"
          />
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(url)}
            className="px-2 py-1 rounded bg-[#27272A] hover:bg-[#3f3f46] text-white"
            title="Copy"
          >
            <Copy className="w-3 h-3" />
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 rounded bg-[#3ECF8E] hover:bg-[#34b876] text-black"
            title="Open"
          >
            <LinkIcon className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

function MetricMini({ label, value, color = 'default' }: { label: string; value: number; color?: 'default' | 'emerald' | 'amber' }) {
  const colors = {
    default: 'text-white',
    emerald: 'text-[#3ECF8E]',
    amber: 'text-amber-400',
  };
  return (
    <div className="rounded border border-[#27272A] bg-[#0c0c0f] p-2 text-center">
      <div className={`text-base font-mono font-bold ${colors[color]}`}>{value}</div>
      <div className="text-[9px] font-mono uppercase text-[#71717A]">{label}</div>
    </div>
  );
}

// =============================================================
// General (multi-language, description, initial scene, sound, etc.)
// =============================================================
function GeneralTab({
  content,
  onChange,
  sceneOptions,
}: {
  content: VtedContent;
  onChange: (next: VtedContent) => void;
  sceneOptions: Array<{ id: string; name: string }>;
}) {
  const set = (patch: Partial<VtedContent>) => onChange({ ...content, ...patch });
  const setCopyright = (patch: Partial<VtedCopyright>) =>
    set({ copyright: { ...(content.copyright || { enabled: false, link: '', authorName: '', description: '', qrData: '' }), ...patch } });
  const setSound = (patch: Partial<NonNullable<VtedContent['backgroundSound']>>) =>
    set({ backgroundSound: { ...(content.backgroundSound || { enabled: false, url: '', label: '', volume: 50 }), ...patch } });

  return (
    <div className="space-y-2">
      <ToggleRow
        label="Multi-language"
        value={content.multiLanguage}
        onChange={(v) => set({ multiLanguage: v })}
      />
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
          Description tour
        </label>
        <textarea
          value={content.descriptionTour || ''}
          onChange={(e) => set({ descriptionTour: e.target.value })}
          rows={3}
          className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white resize-none"
        />
      </div>
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
          Initial scene
        </label>
        <select
          value={content.initialSceneId || ''}
          onChange={(e) => set({ initialSceneId: e.target.value })}
          className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
        >
          <option value="">— First scene —</option>
          {sceneOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
          Category
        </label>
        <select
          value={content.category || 'Architecture'}
          onChange={(e) => set({ category: e.target.value })}
          className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
        >
          <option>Architecture</option>
          <option>Hospitality</option>
          <option>Residential</option>
          <option>Commercial</option>
          <option>Cultural</option>
          <option>Retail</option>
          <option>Education</option>
        </select>
      </div>

      <div className="rounded-lg border border-[#27272A] bg-[#0c0c0f] p-2 space-y-2">
        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#A1A1AA]">
          <Volume2 className="w-3 h-3" />
          Background sound
        </div>
        <ToggleRow
          label="Enabled"
          value={!!content.backgroundSound?.enabled}
          onChange={(v) => setSound({ enabled: v })}
        />
        <div>
          <label className="block text-[10px] font-mono text-[#A1A1AA]">
            URL
          </label>
          <input
            value={content.backgroundSound?.url || ''}
            onChange={(e) => setSound({ url: e.target.value })}
            placeholder="https://…/ambient.mp3"
            className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[10px] font-mono text-white"
          />
        </div>
        <SliderRow
          label="Volume"
          value={content.backgroundSound?.volume ?? 50}
          onChange={(v) => setSound({ volume: v })}
        />
      </div>

      <ToggleRow
        label="Nadir"
        value={!!content.nadir?.enabled}
        onChange={(v) => set({ nadir: { enabled: v } })}
      />

      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-2 space-y-2">
        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-amber-300">
          <Crown className="w-3 h-3" />
          Copyright (Premium)
        </div>
        <ToggleRow
          label="Copyright enabled"
          value={!!content.copyright?.enabled}
          onChange={(v) => setCopyright({ enabled: v })}
        />
        {content.copyright?.enabled && (
          <>
            <div>
              <label className="block text-[10px] font-mono text-[#A1A1AA]">Link</label>
              <input
                value={content.copyright?.link || ''}
                onChange={(e) => setCopyright({ link: e.target.value })}
                placeholder="https://panoee.com"
                className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[10px] font-mono text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-[#A1A1AA]">Author name</label>
              <input
                value={content.copyright?.authorName || ''}
                onChange={(e) => setCopyright({ authorName: e.target.value })}
                className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[10px] font-mono text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-[#A1A1AA]">Description</label>
              <input
                value={content.copyright?.description || ''}
                onChange={(e) => setCopyright({ description: e.target.value })}
                className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[10px] font-mono text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-[#A1A1AA]">QR data</label>
              <textarea
                value={content.copyright?.qrData || ''}
                onChange={(e) => setCopyright({ qrData: e.target.value })}
                rows={2}
                className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[10px] font-mono text-white resize-none"
              />
            </div>
          </>
        )}
        <p className="text-[9px] text-[#71717A]">
          Want your own copyright branding? Replace the default VizTR attribution with your own branded copyright information.
        </p>
      </div>
    </div>
  );
}

// =============================================================
// Root
// =============================================================
export default function ContentSettingsPanel({
  value,
  onChange,
  onSave,
  saved,
  sceneOptions,
}: ContentSettingsPanelProps) {
  const [tab, setTab] = useState<'general' | 'logo' | 'popup' | 'system' | 'collab'>('general');

  const set = (patch: Partial<VtedContent>) => onChange({ ...value, ...patch });

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-mono font-bold text-[#3ECF8E] flex items-center gap-2">
          <Info className="w-4 h-4" />
          Content Settings
        </h2>
        {saved && (
          <span className="flex items-center gap-1 text-[10px] font-mono text-[#3ECF8E]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Saved
          </span>
        )}
      </div>

      <div role="tablist" className="flex items-center gap-1 p-1 rounded-lg bg-[#09090B] border border-[#27272A] overflow-x-auto">
        {[
          { id: 'general', label: 'General', icon: <Info className="w-3 h-3" /> },
          { id: 'logo', label: 'Logo', icon: <ImageIcon className="w-3 h-3" /> },
          { id: 'popup', label: 'Popup Intro', icon: <PlayCircle className="w-3 h-3" /> },
          { id: 'system', label: 'System', icon: <Folder className="w-3 h-3" /> },
          { id: 'collab', label: 'Collaboration', icon: <Users className="w-3 h-3" /> },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded text-[10px] font-mono transition-all ${
              tab === t.id
                ? 'bg-[#3ECF8E]/15 text-[#3ECF8E] border border-[#3ECF8E]/30'
                : 'text-[#71717A] hover:text-white border border-transparent'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-3">
        {tab === 'general' && <GeneralTab content={value} onChange={set} sceneOptions={sceneOptions} />}
        {tab === 'logo' && (
          <LogoTab
            logo={value.logo || { enabled: false, width: 180, position: 'top_left' }}
            onChange={(logo) => set({ logo })}
          />
        )}
        {tab === 'popup' && (
          <PopupIntroTab
            popup={value.popupIntro || { enabled: false, mode: 'image' }}
            onChange={(popupIntro) => set({ popupIntro })}
          />
        )}
        {tab === 'system' && (
          <SystemTab
            system={value.system || {}}
            onChange={(system) => set({ system })}
          />
        )}
        {tab === 'collab' && (
          <CollaborationTab
            collab={value.collaboration || { enabled: false, permissions: 'anyone' }}
            onChange={(collaboration) => set({ collaboration })}
          />
        )}
      </div>

      <button
        type="button"
        onClick={onSave}
        className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b876] text-black text-xs font-bold font-mono"
      >
        <Save className="w-3.5 h-3.5" />
        Save Content
      </button>
    </div>
  );
}
