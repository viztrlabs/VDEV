'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  getSectionDef,
  type SiteListField,
  type SiteMediaField,
  type SiteSection,
  type SiteTextField,
} from '@/lib/site-content';
import { useSiteContentDraftStore } from '@/lib/site-content-store';
import { sanitizeRichText } from '@/lib/sanitize-rich-text';
import MediaPickerModal from '@/components/admin/live-editor/MediaPickerModal';
import { useEditMode } from './EditModeContext';

const HOME_PAGE_ID = 'home';
const PADDING_OPTIONS = ['none', 'sm', 'md', 'lg'] as const;
type PlaybackKey = 'autoplay' | 'muted' | 'loop';

const inputClass =
  'w-full rounded-lg border border-[#27272A] bg-[#18181B] px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-[#3ECF8E] focus:outline-none';

interface PickerTarget {
  fieldId: string;
  index: number;
  mediaType: 'image' | 'video';
}

function fieldLabel(fieldId: string, fallback: string, section: SiteSection): string {
  return getSectionDef(section.type).fields.find((def) => def.id === fieldId)?.label ?? fallback;
}

interface TextFieldEditorProps {
  pageId: string;
  sectionId: string;
  field: SiteTextField;
  label: string;
}

function TextFieldEditor({ pageId, sectionId, field, label }: TextFieldEditorProps) {
  const controlId = `drawer-${sectionId}-${field.id}`;

  const commit = useCallback(
    (value: string) => {
      useSiteContentDraftStore.getState().updateTextField(pageId, sectionId, field.id, value);
    },
    [field.id, pageId, sectionId],
  );

  if (field.rich) {
    return (
      <div className="space-y-1">
        <p id={`${controlId}-label`} className="text-[11px] font-medium text-zinc-300">
          {label}
        </p>
        <div
          id={controlId}
          role="textbox"
          aria-multiline="true"
          aria-labelledby={`${controlId}-label`}
          contentEditable
          suppressContentEditableWarning
          data-cms-rich="true"
          onBlur={(event) => commit(sanitizeRichText(event.currentTarget.innerHTML))}
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(field.value) }}
          className="min-h-[64px] w-full rounded-lg border border-[#27272A] bg-[#18181B] px-2.5 py-1.5 text-xs leading-relaxed text-white focus:border-[#3ECF8E] focus:outline-none"
        />
      </div>
    );
  }

  if (field.multiline) {
    return (
      <div className="space-y-1">
        <label htmlFor={controlId} className="text-[11px] font-medium text-zinc-300">
          {label}
        </label>
        <textarea
          id={controlId}
          aria-label={label}
          value={field.value}
          onChange={(event) => commit(event.target.value)}
          rows={3}
          className={`${inputClass} resize-y leading-relaxed`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label htmlFor={controlId} className="text-[11px] font-medium text-zinc-300">
        {label}
      </label>
      <input
        id={controlId}
        type="text"
        aria-label={label}
        value={field.value}
        onChange={(event) => commit(event.target.value)}
        className={inputClass}
      />
    </div>
  );
}

interface MediaFieldEditorProps {
  pageId: string;
  sectionId: string;
  field: SiteMediaField;
  label: string;
  onChoose: (field: SiteMediaField, index: number) => void;
}

function MediaFieldEditor({ pageId, sectionId, field, label, onChoose }: MediaFieldEditorProps) {
  const store = useSiteContentDraftStore.getState();
  const rows = field.urls;

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium text-zinc-300">{label}</p>
      <div className="space-y-2">
        {rows.map((url, index) => (
          <div
            key={`${field.id}-${index}`}
            className="space-y-1.5 rounded-lg border border-[#27272A] bg-[#0E0E0F] p-2"
          >
            <input
              type="text"
              aria-label={`${label} ${index + 1} URL`}
              value={url}
              placeholder="https://"
              onChange={(event) =>
                store.updateMediaUrl(pageId, sectionId, field.id, index, event.target.value)
              }
              className={inputClass}
            />
            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
              <button
                type="button"
                aria-label={`Choose media for ${label} ${index + 1}`}
                onClick={() => onChoose(field, index)}
                className="rounded border border-[#27272A] px-2 py-1 font-bold text-[#3ECF8E] hover:border-[#3ECF8E]"
              >
                Choose media
              </button>
              <button
                type="button"
                aria-label={`Move ${label} ${index + 1} up`}
                disabled={index === 0}
                onClick={() => store.moveMediaUrl(pageId, sectionId, field.id, index, index - 1)}
                className="rounded border border-[#27272A] px-2 py-1 text-zinc-300 hover:border-[#3ECF8E] disabled:opacity-40"
              >
                Move up
              </button>
              <button
                type="button"
                aria-label={`Move ${label} ${index + 1} down`}
                disabled={index === rows.length - 1}
                onClick={() => store.moveMediaUrl(pageId, sectionId, field.id, index, index + 1)}
                className="rounded border border-[#27272A] px-2 py-1 text-zinc-300 hover:border-[#3ECF8E] disabled:opacity-40"
              >
                Move down
              </button>
              <button
                type="button"
                aria-label={`Remove ${label} ${index + 1}`}
                onClick={() => store.removeMediaUrl(pageId, sectionId, field.id, index)}
                className="rounded border border-[#27272A] px-2 py-1 text-rose-300 hover:border-rose-400"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => store.addMediaUrl(pageId, sectionId, field.id, '')}
        className="rounded border border-[#27272A] px-2 py-1 text-[10px] font-bold text-zinc-200 hover:border-[#3ECF8E] hover:text-white"
      >
        Add URL
      </button>
    </div>
  );
}

interface ListFieldEditorProps {
  pageId: string;
  sectionId: string;
  field: SiteListField;
  label: string;
}

function ListFieldEditor({ pageId, sectionId, field, label }: ListFieldEditorProps) {
  const canAdd = field.canAdd ?? true;
  const canRemove = field.canRemove ?? true;
  const canReorder = field.canReorder ?? true;
  const itemLabel = field.itemLabel;
  const store = useSiteContentDraftStore.getState();

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium text-zinc-300">{label}</p>
      <div className="space-y-2">
        {field.items.map((item, index) => {
          const itemName = `${itemLabel} ${index + 1}`;
          return (
            <div
              key={item.id}
              className="space-y-1.5 rounded-lg border border-[#27272A] bg-[#0E0E0F] p-2"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  {itemName}
                </p>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <button
                    type="button"
                    aria-label={`Move ${itemName} up`}
                    disabled={!canReorder || index === 0}
                    onClick={() => store.moveListItem(pageId, sectionId, field.id, item.id, 'up')}
                    className="rounded border border-[#27272A] px-1.5 py-0.5 text-zinc-300 hover:border-[#3ECF8E] disabled:opacity-40"
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${itemName} down`}
                    disabled={!canReorder || index === field.items.length - 1}
                    onClick={() => store.moveListItem(pageId, sectionId, field.id, item.id, 'down')}
                    className="rounded border border-[#27272A] px-1.5 py-0.5 text-zinc-300 hover:border-[#3ECF8E] disabled:opacity-40"
                  >
                    Move down
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${itemName}`}
                    disabled={!canRemove}
                    onClick={() => store.removeListItem(pageId, sectionId, field.id, item.id)}
                    className="rounded border border-[#27272A] px-1.5 py-0.5 text-rose-300 hover:border-rose-400 disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                {field.itemFields.map((itemField) => {
                  const controlId = `drawer-${sectionId}-${field.id}-${item.id}-${itemField.id}`;
                  const accessibleLabel = `${itemName} ${itemField.label}`;
                  const value = item.values[itemField.id] ?? '';
                  const commit = (next: string) =>
                    store.updateListItem(pageId, sectionId, field.id, item.id, {
                      [itemField.id]: next,
                    });

                  if (itemField.rich) {
                    return (
                      <div key={itemField.id}>
                        <p id={`${controlId}-label`} className="sr-only">
                          {accessibleLabel}
                        </p>
                        <div
                          id={controlId}
                          role="textbox"
                          aria-multiline="true"
                          aria-labelledby={`${controlId}-label`}
                          contentEditable
                          suppressContentEditableWarning
                          data-cms-rich="true"
                          onBlur={(event) => commit(sanitizeRichText(event.currentTarget.innerHTML))}
                          dangerouslySetInnerHTML={{ __html: sanitizeRichText(value) }}
                          className="min-h-[56px] w-full rounded-lg border border-[#27272A] bg-[#18181B] px-2.5 py-1.5 text-xs leading-relaxed text-white focus:border-[#3ECF8E] focus:outline-none"
                        />
                      </div>
                    );
                  }

                  if (itemField.multiline) {
                    return (
                      <textarea
                        key={itemField.id}
                        id={controlId}
                        aria-label={accessibleLabel}
                        value={value}
                        rows={2}
                        onChange={(event) => commit(event.target.value)}
                        className={`${inputClass} resize-y leading-relaxed`}
                      />
                    );
                  }

                  return (
                    <input
                      key={itemField.id}
                      id={controlId}
                      type="text"
                      aria-label={accessibleLabel}
                      value={value}
                      onChange={(event) => commit(event.target.value)}
                      className={inputClass}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        disabled={!canAdd}
        onClick={() => store.addListItem(pageId, sectionId, field.id)}
        className="rounded border border-[#27272A] px-2 py-1 text-[10px] font-bold text-[#3ECF8E] hover:border-[#3ECF8E] disabled:opacity-40"
      >
        {`Add ${itemLabel}`}
      </button>
    </div>
  );
}

export default function SectionDrawer() {
  const { drawerOpen, selectedSectionId, closeDrawer } = useEditMode();
  const content = useSiteContentDraftStore((state) => state.content);
  const [picker, setPicker] = useState<PickerTarget | null>(null);

  const section = useMemo(() => {
    if (!selectedSectionId) return null;
    const page = content.pages.find((entry) => entry.id === HOME_PAGE_ID);
    return page?.sections.find((entry) => entry.id === selectedSectionId) ?? null;
  }, [content, selectedSectionId]);

  const chooseMedia = useCallback((field: SiteMediaField, index: number) => {
    setPicker({ fieldId: field.id, index, mediaType: field.mediaType });
  }, []);

  const closePicker = useCallback(() => setPicker(null), []);

  const handlePick = useCallback(
    (url: string) => {
      if (!picker || !selectedSectionId) return;
      const store = useSiteContentDraftStore.getState();
      const fresh = store.content.pages
        .find((page) => page.id === HOME_PAGE_ID)
        ?.sections.find((entry) => entry.id === selectedSectionId)
        ?.fields.find((field): field is SiteMediaField => field.kind === 'media' && field.id === picker.fieldId);
      if (fresh && picker.index < fresh.urls.length) {
        store.updateMediaUrl(HOME_PAGE_ID, selectedSectionId, picker.fieldId, picker.index, url);
      } else {
        store.addMediaUrl(HOME_PAGE_ID, selectedSectionId, picker.fieldId, url);
      }
      setPicker(null);
    },
    [picker, selectedSectionId],
  );

  if (!drawerOpen || !section) return null;

  const store = useSiteContentDraftStore.getState();
  const padding = section.style.padding ?? 'md';
  const mediaStyle = section.style.media ?? {};
  const hasVideoField = section.fields.some(
    (field) => field.kind === 'media' && field.mediaType === 'video',
  );
  const playbackToggles: { key: PlaybackKey; label: string }[] = [
    { key: 'autoplay', label: 'Autoplay' },
    { key: 'muted', label: 'Muted' },
    { key: 'loop', label: 'Loop' },
  ];

  return (
    <aside
      data-testid="section-drawer"
      aria-label={`${section.name} settings`}
      className="fixed inset-y-0 right-0 z-[80] flex h-full w-full max-w-sm flex-col gap-4 overflow-y-auto border-l border-[#27272A] bg-[#131314] p-4 text-white shadow-2xl"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold">Section settings</h2>
        <button
          type="button"
          aria-label="Close drawer"
          onClick={closeDrawer}
          className="rounded border border-[#27272A] px-2 py-1 text-[10px] text-zinc-400 hover:border-[#3ECF8E] hover:text-white"
        >
          Close
        </button>
      </div>

      <section className="space-y-2">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Style</h3>

        <label htmlFor="drawer-visible" className="flex items-center gap-2 text-[11px] text-zinc-300">
          <input
            id="drawer-visible"
            type="checkbox"
            aria-label="Visible"
            checked={section.isVisible}
            onChange={() => store.toggleSection(HOME_PAGE_ID, section.id)}
            className="h-3.5 w-3.5 accent-[#3ECF8E]"
          />
          Visible
        </label>

        <div className="space-y-1">
          <label htmlFor="drawer-padding" className="text-[11px] font-medium text-zinc-300">
            Padding
          </label>
          <select
            id="drawer-padding"
            aria-label="Padding"
            value={padding}
            onChange={(event) =>
              store.updateSectionStyle(HOME_PAGE_ID, section.id, {
                padding: event.target.value as (typeof PADDING_OPTIONS)[number],
              })
            }
            className={inputClass}
          >
            {PADDING_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {hasVideoField ? (
          <div className="space-y-1.5 pt-1">
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              Video playback
            </p>
            {playbackToggles.map(({ key, label }) => (
              <label
                key={key}
                htmlFor={`drawer-playback-${key}`}
                className="flex items-center gap-2 text-[11px] text-zinc-300"
              >
                <input
                  id={`drawer-playback-${key}`}
                  type="checkbox"
                  aria-label={label}
                  checked={mediaStyle[key] ?? false}
                  onChange={(event) =>
                    store.updateSectionStyle(HOME_PAGE_ID, section.id, {
                      media: { ...mediaStyle, [key]: event.target.checked },
                    })
                  }
                  className="h-3.5 w-3.5 accent-[#3ECF8E]"
                />
                {label}
              </label>
            ))}
          </div>
        ) : null}
      </section>

      <section className="space-y-3">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Content</h3>
        {section.fields.map((field) => {
          const label = fieldLabel(field.id, field.label, section);
          if (field.kind === 'text') {
            return (
              <TextFieldEditor
                key={field.id}
                pageId={HOME_PAGE_ID}
                sectionId={section.id}
                field={field}
                label={label}
              />
            );
          }
          if (field.kind === 'media') {
            return (
              <MediaFieldEditor
                key={field.id}
                pageId={HOME_PAGE_ID}
                sectionId={section.id}
                field={field}
                label={label}
                onChoose={chooseMedia}
              />
            );
          }
          return (
            <ListFieldEditor
              key={field.id}
              pageId={HOME_PAGE_ID}
              sectionId={section.id}
              field={field}
              label={label}
            />
          );
        })}
      </section>

      <MediaPickerModal
        open={picker !== null}
        onClose={closePicker}
        filter={picker?.mediaType ?? 'all'}
        onPick={handlePick}
      />
    </aside>
  );
}
