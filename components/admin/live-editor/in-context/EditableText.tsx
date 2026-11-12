'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  getListItemValues,
  getSectionDef,
  getTextField,
  type SiteListItemFieldDef,
  type SiteListField,
  type SiteSection,
  type SiteTextField,
} from '@/lib/site-content';
import { useSiteContentDraftStore } from '@/lib/site-content-store';
import { isRichTextEmpty, sanitizeRichText } from '@/lib/sanitize-rich-text';
import { useSectionInstance } from '@/components/site/SectionInstanceContext';
import { useEditMode } from './EditModeContext';

export interface EditableTextProps {
  fieldId: string;
  sectionId?: string;
  listFieldId?: string;
  itemId?: string;
  as?: React.ElementType;
  className?: string;
  placeholder?: string;
}

interface ResolvedField {
  label: string;
  multiline: boolean;
  rich: boolean;
  value: string;
}

function findSection(
  content: { pages: { id: string; sections: SiteSection[] }[] },
  pageId: string,
  sectionId: string,
): SiteSection | null {
  return content.pages.find((page) => page.id === pageId)?.sections.find((s) => s.id === sectionId) ?? null;
}

function resolveListField(
  section: SiteSection,
  fieldId: string,
  listFieldId: string,
  itemId: string,
): ResolvedField | null {
  const listField = section.fields.find(
    (field): field is SiteListField => field.kind === 'list' && field.id === listFieldId,
  );
  const def = getSectionDef(section.type).fields.find(
    (field) => field.kind === 'list' && field.id === listFieldId,
  );
  const itemDef: SiteListItemFieldDef | undefined =
    (def && def.kind === 'list'
      ? def.itemFields.find((entry) => entry.id === fieldId)
      : undefined) ?? listField?.itemFields.find((entry) => entry.id === fieldId);

  if (!itemDef) return null;

  const values = getListItemValues(section, listFieldId, itemId);
  return {
    label: itemDef.label,
    multiline: itemDef.multiline ?? false,
    rich: itemDef.rich ?? false,
    value: values[fieldId] ?? '',
  };
}

function resolveTextField(section: SiteSection, fieldId: string): ResolvedField | null {
  const stored = section.fields.find(
    (field): field is SiteTextField => field.kind === 'text' && field.id === fieldId,
  );
  const def = getSectionDef(section.type).fields.find(
    (field) => field.kind === 'text' && field.id === fieldId,
  );

  if (!stored && !def) return null;

  return {
    label: def?.label ?? stored?.label ?? fieldId,
    multiline: (def?.kind === 'text' ? def.multiline : undefined) ?? stored?.multiline ?? false,
    rich: (def?.kind === 'text' ? def.rich : undefined) ?? stored?.rich ?? false,
    value: getTextField(section, fieldId, ''),
  };
}

function normalizePlain(value: string): string {
  return value.trim();
}

function normalizeRich(value: string): string {
  const sanitized = sanitizeRichText(value);
  return isRichTextEmpty(sanitized) ? '' : sanitized;
}

function setDomContent(element: HTMLElement, value: string, rich: boolean): void {
  if (rich) {
    element.innerHTML = sanitizeRichText(value);
    return;
  }
  element.textContent = value;
}

function insertPlainText(element: HTMLElement, text: string): void {
  if (typeof document === 'undefined' || text === '') return;

  const exec = document.execCommand;
  if (typeof exec === 'function') {
    try {
      exec.call(document, 'insertText', false, text);
      return;
    } catch {
      void 0;
    }
  }

  const selection = typeof window !== 'undefined' ? window.getSelection() : null;
  if (!selection || selection.rangeCount === 0) {
    element.textContent = `${element.textContent ?? ''}${text}`;
    return;
  }

  const range = selection.getRangeAt(0);
  range.deleteContents();
  const node = document.createTextNode(text);
  range.insertNode(node);
  range.setStartAfter(node);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

export default function EditableText({
  fieldId,
  sectionId,
  listFieldId,
  itemId,
  as,
  className,
  placeholder,
}: EditableTextProps) {
  const instance = useSectionInstance();
  const { editMode } = useEditMode();
  const content = useSiteContentDraftStore((state) => state.content);

  const [editing, setEditing] = useState(false);
  const editingRef = useRef(false);
  const snapshotRef = useRef('');
  const elementRef = useRef<HTMLElement | null>(null);

  const pageId = instance?.pageId ?? 'home';
  const resolvedSectionId = instance?.sectionId ?? sectionId ?? null;
  const storedSection = resolvedSectionId ? findSection(content, pageId, resolvedSectionId) : null;
  const section = pageId && resolvedSectionId ? storedSection ?? instance?.section ?? null : null;

  const resolved =
    section && listFieldId && itemId
      ? resolveListField(section, fieldId, listFieldId, itemId)
      : section
        ? resolveTextField(section, fieldId)
        : null;

  useEffect(() => {
    if (!editing) return;
    const element = elementRef.current;
    if (!element) return;

    setDomContent(element, snapshotRef.current, resolved?.rich ?? false);
    element.focus();

    const selection = typeof window !== 'undefined' ? window.getSelection() : null;
    if (!selection || typeof document === 'undefined') return;
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }, [editing, resolved?.rich]);

  useEffect(() => {
    return () => {
      editingRef.current = false;
    };
  }, []);

  const write = useCallback(
    (next: string) => {
      if (!section || !resolvedSectionId) return;
      const store = useSiteContentDraftStore.getState();
      if (listFieldId && itemId) {
        const fresh =
          findSection(store.content, pageId, resolvedSectionId) ?? section;
        const currentValues = getListItemValues(fresh, listFieldId, itemId);
        store.updateListItem(pageId, resolvedSectionId, listFieldId, itemId, {
          ...currentValues,
          [fieldId]: next,
        });
        return;
      }
      store.updateTextField(pageId, resolvedSectionId, fieldId, next);
    },
    [fieldId, itemId, listFieldId, pageId, resolvedSectionId, section],
  );

  const finish = useCallback(
    (mode: 'commit' | 'cancel') => {
      if (!editingRef.current) return;
      editingRef.current = false;
      setEditing(false);

      const element = elementRef.current;
      const original = snapshotRef.current;
      const rich = resolved?.rich ?? false;

      if (mode === 'cancel') {
        if (element) setDomContent(element, original, rich);
        return;
      }

      const raw = element ? (rich ? element.innerHTML : element.textContent ?? '') : original;
      const next = rich ? normalizeRich(raw) : normalizePlain(raw);
      if (element) setDomContent(element, next, rich);
      if (next !== original) write(next);
    },
    [resolved?.rich, write],
  );

  const startEditing = useCallback(() => {
    if (!editMode || editingRef.current) return;
    snapshotRef.current = resolved?.value ?? '';
    editingRef.current = true;
    setEditing(true);
  }, [editMode, resolved?.value]);

  const handleBlur = useCallback(() => {
    finish('commit');
  }, [finish]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (!editingRef.current) return;
      const multiline = resolved?.multiline ?? false;

      if (event.key === 'Escape') {
        event.preventDefault();
        finish('cancel');
        return;
      }

      if (event.key === 'Enter') {
        if (multiline && !(event.metaKey || event.ctrlKey)) return;
        event.preventDefault();
        finish('commit');
      }
    },
    [finish, resolved?.multiline],
  );

  const handlePaste = useCallback((event: React.ClipboardEvent<HTMLElement>) => {
    if (!editingRef.current) return;
    const element = elementRef.current;
    if (!element) return;
    event.preventDefault();
    insertPlainText(element, event.clipboardData?.getData('text/plain') ?? '');
  }, []);

  if (!resolved) return null;

  const Tag = (as ?? 'span') as React.ElementType;
  const rich = resolved.rich;
  const displayValue = editing ? snapshotRef.current : resolved.value;
  const isEmpty = rich ? isRichTextEmpty(displayValue) : displayValue.trim() === '';
  const showPlaceholder = editMode && !editing && isEmpty;
  const placeholderText = placeholder ?? resolved.label;

  const shared = {
    ref: elementRef,
    className,
    'data-cms-field': fieldId,
    'data-cms-list-field': listFieldId,
    'data-cms-item-id': itemId,
    'data-cms-rich': rich ? 'true' : undefined,
    suppressContentEditableWarning: true,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    onPaste: handlePaste,
  };

  if (showPlaceholder) {
    return (
      <Tag
        {...shared}
        onClick={startEditing}
        className={`${className ? `${className} ` : ''}cursor-text rounded border border-dashed border-white/30 bg-white/5 px-2 py-0.5 text-[0.55em] font-mono uppercase tracking-widest text-white/40`}
      >
        <span data-cms-placeholder="true">{placeholderText}</span>
      </Tag>
    );
  }

  return (
    <Tag
      {...shared}
      onClick={startEditing}
      contentEditable={editing ? true : undefined}
      aria-multiline={editing ? resolved.multiline : undefined}
      {...(rich
        ? { dangerouslySetInnerHTML: { __html: sanitizeRichText(displayValue) } }
        : { children: displayValue })}
    />
  );
}
