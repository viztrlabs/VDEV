'use client';

import React, { useEffect, useState } from 'react';
import {
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  Save,
  RotateCcw,
  MonitorPlay,
  Type,
  Film,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';
import {
  useSiteContentDraftStore,
  publishSiteContent,
  resetSiteContentDraft,
} from '@/lib/site-content-store';
import { SiteSection, SiteField } from '@/lib/site-content';
import { useAppStore } from '@/lib/store';
import MediaPickerModal from '@/components/admin/live-editor/MediaPickerModal';

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

const DEVICE_WIDTH: Record<DeviceMode, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
};

export default function LiveSiteEditor() {
  const { showToast } = useAppStore();
  const content = useSiteContentDraftStore((s) => s.content);
  const draftStore = useSiteContentDraftStore;
  const [pageId, setPageId] = useState(content.pages[0]?.id ?? '');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [previewOn, setPreviewOn] = useState(true);
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [previewNonce, setPreviewNonce] = useState(0);
  const [mediaPicker, setMediaPicker] = useState<{
    sectionId: string;
    fieldId: string;
    mediaType: 'image' | 'video';
  } | null>(null);

  const page = content.pages.find((p) => p.id === pageId) ?? content.pages[0];
  const selectedSection = page?.sections.find((s) => s.id === selectedSectionId) ?? null;

  const setPage = (id: string) => {
    setPageId(id);
    setSelectedSectionId(null);
  };

  const openPicker = (sectionId: string, field: SiteField) => {
    if (field.kind !== 'media') return;
    setMediaPicker({ sectionId, fieldId: field.id, mediaType: field.mediaType });
  };

  if (!page) {
    return (
      <div className="rounded-2xl bg-[#131314] border border-[#27272A] p-6 text-sm text-zinc-400">
        No site pages are available to edit yet.
      </div>
    );
  }

  return (
    <div className="space-y-4" id="live-site-editor">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#131314] border border-[#27272A]">
        <div className="flex items-center gap-2">
          <MonitorPlay className="w-5 h-5 text-[#3ECF8E]" />
          <h2 className="text-base font-bold text-white">Live Site Editor</h2>
          <span className="px-2 py-0.5 rounded-full bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 text-[#3ECF8E] text-[10px] font-mono font-bold">
            SPLIT VIEW
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setPreviewOn((v) => !v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer border ${
              previewOn
                ? 'bg-[#3ECF8E]/15 border-[#3ECF8E]/40 text-[#3ECF8E]'
                : 'bg-[#18181B] border-[#27272A] text-zinc-400'
            }`}
          >
            {previewOn ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Live Preview {previewOn ? 'ON' : 'OFF'}</span>
          </button>
          {previewOn && (
            <>
              <div className="flex items-center rounded-lg border border-[#27272A] overflow-hidden">
                {(
                  [
                    ['desktop', Monitor],
                    ['tablet', Tablet],
                    ['mobile', Smartphone],
                  ] as const
                ).map(([mode, Icon]) => (
                  <button
                    key={mode}
                    onClick={() => setDevice(mode)}
                    className={`px-2 py-1.5 cursor-pointer ${
                      device === mode
                        ? 'bg-[#27272A] text-white'
                        : 'bg-[#18181B] text-zinc-500 hover:text-zinc-300'
                    }`}
                    title={mode}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPreviewNonce((n) => n + 1)}
                className="px-2.5 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-zinc-300 hover:text-white text-xs cursor-pointer"
                title="Refresh preview"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <a
            href={`${page.route}?cms-preview=1`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open preview in new tab</span>
          </a>
          <button
            onClick={() => {
              resetSiteContentDraft();
              setPreviewNonce((n) => n + 1);
              showToast('Draft reset to site defaults.', 'info');
            }}
            className="px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Draft</span>
          </button>
          <button
            onClick={() => {
              publishSiteContent();
              setPreviewNonce((n) => n + 1);
              showToast('Published! The live site now reflects your changes.', 'success');
            }}
            className="px-3.5 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Publish</span>
          </button>
        </div>
      </div>

      <div className={`grid gap-4 ${previewOn ? 'grid-cols-1 lg:grid-cols-[380px_1fr]' : 'grid-cols-1'}`}>
        <div className="space-y-3 min-w-0">
          <div className="flex gap-1.5 flex-wrap">
            {content.pages.map((p) => (
              <button
                key={p.id}
                onClick={() => setPage(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold cursor-pointer ${
                  p.id === pageId
                    ? 'bg-[#3ECF8E] text-black'
                    : 'bg-[#18181B] text-[#A1A1AA] hover:text-white border border-[#27272A]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-[#131314] border border-[#27272A] divide-y divide-[#1E293B] max-h-[420px] overflow-y-auto">
            {page.sections.map((s, idx) => (
              <div
                key={s.id}
                data-testid="section-row"
                className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[#18181B] ${
                  selectedSectionId === s.id ? 'bg-[#18181B] border-l-2 border-[#3ECF8E]' : ''
                }`}
                onClick={() => setSelectedSectionId(s.id)}
              >
                <span className={`text-xs ${s.isVisible ? 'text-white' : 'text-zinc-500 line-through'}`}>
                  {s.name}
                </span>
                <span className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => draftStore.getState().toggleSection(page.id, s.id)}
                    aria-label={s.isVisible ? 'Hide section' : 'Show section'}
                    className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    {s.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => draftStore.getState().moveSection(page.id, s.id, 'up')}
                    disabled={idx === 0}
                    aria-label="Move up"
                    className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => draftStore.getState().moveSection(page.id, s.id, 'down')}
                    disabled={idx === page.sections.length - 1}
                    aria-label="Move down"
                    className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </span>
              </div>
            ))}
          </div>

          {selectedSection && (
            <SectionFieldEditor pageId={page.id} section={selectedSection} onOpenPicker={openPicker} />
          )}
        </div>

        {previewOn && (
          <div className="rounded-2xl bg-[#131314] border border-[#27272A] p-3 min-w-0">
            <div
              className="mx-auto transition-all duration-300"
              style={{ width: DEVICE_WIDTH[device], maxWidth: '100%' }}
            >
              <iframe
                key={`${page.id}-${previewNonce}`}
                src={`${page.route}?cms-preview=1`}
                title="live-site-preview"
                className="w-full h-[70vh] rounded-xl border border-[#27272A] bg-black"
              />
            </div>
          </div>
        )}
      </div>

      <MediaPickerModal
        open={!!mediaPicker}
        onClose={() => setMediaPicker(null)}
        filter={mediaPicker?.mediaType ?? 'all'}
        onPick={(url) => {
          if (!mediaPicker) return;
          draftStore
            .getState()
            .updateMediaField(page.id, mediaPicker.sectionId, mediaPicker.fieldId, {
              urls: [url],
              isPlaceholder: false,
            });
          setMediaPicker(null);
        }}
      />
    </div>
  );
}

function SectionFieldEditor({
  pageId,
  section,
  onOpenPicker,
}: {
  pageId: string;
  section: SiteSection;
  onOpenPicker: (sectionId: string, field: SiteField) => void;
}) {
  const draftStore = useSiteContentDraftStore;
  return (
    <div className="rounded-2xl bg-[#131314] border border-[#27272A] p-4 space-y-3">
      <h3 className="text-xs font-bold text-[#3ECF8E] uppercase tracking-widest flex items-center gap-1.5">
        <Type className="w-3.5 h-3.5" />
        {section.name} — Fields
      </h3>
      {section.fields.length === 0 && (
        <p className="text-xs text-zinc-500">
          This section has no editable fields yet. Visibility and ordering still apply.
        </p>
      )}
      {section.fields.map((field) =>
        field.kind === 'text' ? (
          <label key={field.id} className="block space-y-1">
            <span className="text-[11px] text-zinc-400 font-mono">{field.label}</span>
            {field.multiline ? (
              <textarea
                value={field.value}
                rows={3}
                onChange={(e) =>
                  draftStore.getState().updateTextField(pageId, section.id, field.id, e.target.value)
                }
                className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-white"
              />
            ) : (
              <input
                type="text"
                value={field.value}
                onChange={(e) =>
                  draftStore.getState().updateTextField(pageId, section.id, field.id, e.target.value)
                }
                className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-white"
              />
            )}
          </label>
        ) : (
          <div key={field.id} className="space-y-1.5">
            <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
              {field.mediaType === 'video' ? <Film className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
              {field.label}
            </span>
            <div className="flex items-center gap-2">
              {field.urls[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={field.urls[0]}
                  alt={field.label}
                  className="w-14 h-10 object-cover rounded-lg border border-[#27272A]"
                />
              ) : (
                <div className="w-14 h-10 rounded-lg border border-dashed border-[#3F3F46] flex items-center justify-center text-[9px] text-zinc-500">
                  {field.mediaType === 'video' ? 'VIDEO' : 'IMG'}
                </div>
              )}
              <button
                onClick={() => onOpenPicker(section.id, field)}
                className="px-2.5 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-zinc-200 text-[11px] font-mono cursor-pointer"
              >
                Choose media
              </button>
            </div>
            <MediaUrlInput
              value={field.urls[0] ?? ''}
              onCommit={(url) =>
                draftStore.getState().updateMediaField(pageId, section.id, field.id, {
                  urls: [url],
                  isPlaceholder: false,
                })
              }
            />
            <label className="flex items-center gap-2 text-[11px] text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={!!field.isPlaceholder}
                onChange={(e) =>
                  draftStore
                    .getState()
                    .updateMediaField(pageId, section.id, field.id, { isPlaceholder: e.target.checked })
                }
              />
              <span>Show placeholder instead of media</span>
            </label>
            <div className="flex items-center gap-1.5">
              {(['image', 'video'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() =>
                    draftStore.getState().updateMediaField(pageId, section.id, field.id, { mediaType: t })
                  }
                  className={`px-2 py-1 rounded text-[10px] font-mono uppercase cursor-pointer border ${
                    field.mediaType === t
                      ? 'bg-[#3ECF8E]/15 border-[#3ECF8E]/40 text-[#3ECF8E]'
                      : 'bg-[#18181B] border-[#27272A] text-zinc-500'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        ),
      )}
    </div>
  );
}

function MediaUrlInput({ value, onCommit }: { value: string; onCommit: (url: string) => void }) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const commit = () => {
    if (local !== value) onCommit(local);
  };

  return (
    <input
      type="text"
      value={local}
      placeholder="Paste media URL"
      onChange={(e) => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          commit();
        }
      }}
      className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-white placeholder:text-zinc-500"
    />
  );
}
