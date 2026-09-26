'use client';

import React, { memo, useMemo, useState } from 'react';
import { Upload, Loader2, Pencil, ChevronUp, ChevronDown, Copy, Trash2, Star, Plus, RefreshCw, PanelLeftClose } from 'lucide-react';
import type { TourRoom } from '@/data/tour-config';

// ============================================================================
// NodeListItem (memoized)
// ============================================================================

interface NodeListItemProps {
  room: TourRoom;
  index: number;
  isSelected: boolean;
  isFeatured: boolean;
  isEditing: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
  onStartRename: () => void;
  onCommitRename: (newName: string) => void;
  onMove: (dir: -1 | 1) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function NodeListItemBase({
  room,
  index,
  isSelected,
  isFeatured,
  isEditing,
  isFirst,
  isLast,
  onSelect,
  onStartRename,
  onCommitRename,
  onMove,
  onDuplicate,
  onDelete,
}: NodeListItemProps) {
  return (
    <div
      className={`group rounded-lg border transition-colors ${
        isSelected
          ? 'bg-[#18181B] border-[#3ECF8E]/30'
          : 'border-transparent hover:bg-[#18181B]'
      }`}
    >
      <div className="flex items-center gap-2 px-2 py-1.5">
        <div
          className="w-8 h-8 rounded bg-cover bg-center shrink-0 border border-[#27272A] cursor-pointer"
          style={{ backgroundImage: `url(${room.thumbnailUrl})` }}
          onClick={onSelect}
          role="img"
          aria-label={`${room.name} thumbnail`}
        />
        <div className="min-w-0 flex-1" onClick={onSelect}>
          {isEditing ? (
            <input
              autoFocus
              defaultValue={room.name}
              onBlur={(e) => onCommitRename(e.target.value || room.name)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                if (e.key === 'Escape') (e.target as HTMLInputElement).blur();
              }}
              className="w-full bg-[#0c0c0f] border border-[#3ECF8E]/40 rounded px-1 text-xs text-white"
            />
          ) : (
            <div className="flex items-center gap-1 text-xs font-medium truncate">
              {isFeatured && <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0" />}
              <span className="truncate">{room.name}</span>
            </div>
          )}
          <div className="text-[10px] text-[#71717A]">
            {String(index + 1).padStart(2, '0')} · {room.defaultHotspots.length} hotspots
          </div>
        </div>
      </div>
      {/* Action row */}
      <div className="flex items-center justify-end gap-0.5 px-1.5 pb-1.5 opacity-60 group-hover:opacity-100">
        <button
          type="button"
          onClick={onStartRename}
          className="p-1 rounded text-[#A1A1AA] hover:text-white hover:bg-white/10"
          title="Rename"
        >
          <Pencil className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={isFirst}
          className="p-1 rounded text-[#A1A1AA] hover:text-white hover:bg-white/10 disabled:opacity-20"
          title="Move up"
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={isLast}
          className="p-1 rounded text-[#A1A1AA] hover:text-white hover:bg-white/10 disabled:opacity-20"
          title="Move down"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={onDuplicate}
          className="p-1 rounded text-[#A1A1AA] hover:text-white hover:bg-white/10"
          title="Duplicate"
        >
          <Copy className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export const NodeListItem = memo(NodeListItemBase);

// ============================================================================
// MediaLibraryPanel
// ============================================================================

interface MediaAsset {
  name: string;
  url: string;
}

interface MediaLibraryPanelProps {
  assets: MediaAsset[];
  onAdd: (url: string) => void;
  onUploadFiles?: (files: FileList | File[]) => void;
  onDeleteAsset?: (name: string) => void;
  onRefreshMedia?: () => void;
  uploading?: boolean;
}

function MediaLibraryPanelBase({
  assets,
  onAdd,
  onUploadFiles,
  onDeleteAsset,
  onRefreshMedia,
  uploading,
}: MediaLibraryPanelProps) {
  const [open, setOpen] = useState(true);
  const unique = useMemo(() => {
    const seen = new Set<string>();
    const out: MediaAsset[] = [];
    for (const a of assets) {
      if (!a?.url || seen.has(a.url)) continue;
      seen.add(a.url);
      out.push(a);
    }
    return out;
  }, [assets]);

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#0c0c0f] overflow-hidden">
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          title={open ? 'Collapse media library' : 'Expand media library'}
          className="flex-1 min-w-0 flex items-center gap-1 px-1 py-1 text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] hover:text-white select-none"
        >
          {open ? <ChevronUp className="w-3 h-3 shrink-0" /> : <ChevronDown className="w-3 h-3 shrink-0" />}
          <span className="truncate">Media Library ({unique.length})</span>
        </button>
        {onRefreshMedia && (
          <button
            type="button"
            onClick={onRefreshMedia}
            title="Refresh media library"
            aria-label="Refresh media library"
            className="p-1 rounded text-[#71717A] hover:text-white hover:bg-white/10"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        )}
      </div>

      {open && (
        <div className="px-1 pb-1 space-y-1">
          {onUploadFiles && !uploading && (
            <label className="flex items-center gap-1 px-1.5 py-1 rounded border border-[#27272A] hover:border-[#3ECF8E]/40 text-[10px] font-mono text-[#3ECF8E] cursor-pointer">
              <Upload className="w-3 h-3" /> Upload
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && onUploadFiles(e.target.files)}
              />
            </label>
          )}
          {onUploadFiles && uploading && (
            <div className="flex items-center gap-1 px-1 py-1 text-[10px] font-mono text-[#71717A]">
              <Loader2 className="w-3 h-3 animate-spin" /> Uploading…
            </div>
          )}
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {unique.length === 0 ? (
              <div className="text-[10px] font-mono text-[#555] px-1">No assets yet</div>
            ) : (
              unique.map((a) => (
                <div
                  key={a.url}
                  className="flex items-center gap-1 rounded border border-[#27272A] p-1"
                >
                  <button
                    type="button"
                    onClick={() => onAdd(a.url)}
                    title={`Add ${a.name} as new node`}
                    className="flex-1 min-w-0 flex items-center gap-2 text-left rounded hover:border-[#3ECF8E]/40"
                  >
                    <div
                      className="w-7 h-7 rounded bg-cover bg-center shrink-0 border border-[#27272A]"
                      style={{ backgroundImage: `url(${a.url})` }}
                    />
                    <span className="text-[10px] font-mono text-[#A1A1AA] truncate">{a.name}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onAdd(a.url)}
                    title="Add as new node"
                    aria-label={`Add ${a.name}`}
                    className="p-1 rounded text-[#71717A] hover:text-[#3ECF8E] hover:bg-white/10"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  {onDeleteAsset && (
                    <button
                      type="button"
                      onClick={() => onDeleteAsset(a.name)}
                      title={`Delete ${a.name} from media library`}
                      aria-label={`Delete ${a.name}`}
                      className="p-1 rounded text-[#71717A] hover:text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          {assets.length !== unique.length && (
            <div className="text-[9px] font-mono text-[#555] px-1">
              {assets.length - unique.length} duplicate{assets.length - unique.length > 1 ? 's' : ''} hidden
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const MediaLibraryPanel = memo(MediaLibraryPanelBase);

// ============================================================================
// NodeListSidebar
// ============================================================================

interface NodeListSidebarProps {
  rooms: TourRoom[];
  selectedId: string;
  featuredId: string;
  editingNodeId: string;
  mediaAssets: MediaAsset[];
  draggingOver: boolean;
  uploading: boolean;

  onSelect: (id: string) => void;
  onStartRename: (id: string) => void;
  onCommitRename: (id: string, name: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onAddFromLibrary: (url: string) => void;
  onUploadFiles: (files: FileList | File[]) => void;
  onDeleteAsset?: (name: string) => void;
  onRefreshMedia?: () => void;
  onSetDraggingOver: (dragging: boolean) => void;
  onCollapse?: () => void;
}

export function NodeListSidebar({
  rooms,
  selectedId,
  featuredId,
  editingNodeId,
  mediaAssets,
  draggingOver,
  uploading,
  onSelect,
  onStartRename,
  onCommitRename,
  onMove,
  onDuplicate,
  onDelete,
  onAddFromLibrary,
  onUploadFiles,
  onDeleteAsset,
  onRefreshMedia,
  onSetDraggingOver,
  onCollapse,
}: NodeListSidebarProps) {
  return (
    <aside className="w-64 shrink-0 border-r border-[#27272A] overflow-y-auto p-2 space-y-1 bg-[#09090B]">
      {/* Header */}
      <div className="flex items-center justify-between px-1 pb-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">Nodes</span>
        <div className="flex items-center gap-1">
          <label className="flex items-center gap-1 px-2 py-1 rounded bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#3ECF8E] text-[10px] font-mono cursor-pointer">
            <Upload className="w-3 h-3" /> Upload
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && onUploadFiles(e.target.files)}
            />
          </label>
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              aria-label="Collapse nodes panel"
              aria-pressed="false"
              title="Collapse panel"
              className="p-1 rounded text-[#71717A] hover:text-white hover:bg-[#18181B]"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <MediaLibraryPanel
        assets={mediaAssets}
        onAdd={onAddFromLibrary}
        onUploadFiles={onUploadFiles}
        onDeleteAsset={onDeleteAsset}
        onRefreshMedia={onRefreshMedia}
        uploading={uploading}
      />

      {/* Drag-drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          onSetDraggingOver(true);
        }}
        onDragLeave={() => onSetDraggingOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          onSetDraggingOver(false);
          if (e.dataTransfer.files.length) onUploadFiles(e.dataTransfer.files);
        }}
        className={`rounded-xl border-2 border-dashed p-3 text-center text-[10px] font-mono transition-colors ${
          draggingOver
            ? 'border-[#3ECF8E] bg-[#3ECF8E]/10 text-[#3ECF8E]'
            : 'border-[#27272A] text-[#71717A]'
        }`}
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" /> Uploading…
          </span>
        ) : (
          'Drag 360° images here'
        )}
      </div>

      {/* Rooms list */}
      {rooms.map((r, idx) => (
        <NodeListItem
          key={r.id}
          room={r}
          index={idx}
          isSelected={r.id === selectedId}
          isFeatured={r.id === featuredId}
          isEditing={editingNodeId === r.id}
          isFirst={idx === 0}
          isLast={idx === rooms.length - 1}
          onSelect={() => onSelect(r.id)}
          onStartRename={() => onStartRename(r.id)}
          onCommitRename={(name) => onCommitRename(r.id, name)}
          onMove={(dir) => onMove(r.id, dir)}
          onDuplicate={() => onDuplicate(r.id)}
          onDelete={() => onDelete(r.id)}
        />
      ))}
    </aside>
  );
}
