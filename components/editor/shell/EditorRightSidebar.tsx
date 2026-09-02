'use client';

import React from 'react';
import { PanelRightClose } from 'lucide-react';
import SceneConfigPanel from '@/components/editor/SceneConfigPanel';
import ViewConstraintsPanel from '@/components/editor/ViewConstraintsPanel';
import { HotspotInspector } from '@/components/editor/shell/HotspotInspector';
import type { TourRoom, Hotspot } from '@/data/tour-config';

interface EditorRightSidebarProps {
  selected: TourRoom;
  allRooms: TourRoom[];
  onUpdateRoom: (patch: Partial<TourRoom>) => void;
  onReplacePanorama: (file: File) => void;
  onUploadAudio: (file: File) => void;
  onSetFeatured: () => void;
  uploading: boolean;

  onUpdateHotspot: (hpId: string, patch: Partial<Hotspot>) => void;
  onDeleteHotspot: (hpId: string) => void;
  onCopyHotspot: (hpId: string) => void;
  onSetPortalTarget: (hpId: string, targetId: string) => void;
  onCollapse?: () => void;
}

export function EditorRightSidebar({
  selected,
  allRooms,
  onUpdateRoom,
  onReplacePanorama,
  onUploadAudio,
  onSetFeatured,
  uploading,
  onUpdateHotspot,
  onDeleteHotspot,
  onCopyHotspot,
  onSetPortalTarget,
  onCollapse,
}: EditorRightSidebarProps) {
  return (
    <aside className="w-80 shrink-0 border-l border-[#27272A] overflow-y-auto p-3 space-y-3">
      {onCollapse && (
        <div className="flex items-center justify-between -mt-1 -mx-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
            Inspector
          </span>
          <button
            type="button"
            onClick={onCollapse}
            aria-label="Collapse inspector panel"
            aria-pressed="false"
            title="Collapse panel"
            className="p-1 rounded text-[#71717A] hover:text-white hover:bg-[#18181B]"
          >
            <PanelRightClose className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <SceneConfigPanel
        room={selected}
        onUpdate={onUpdateRoom}
        onReplacePanorama={onReplacePanorama}
        onUploadAudio={onUploadAudio}
        onSetFeatured={onSetFeatured}
        isFeatured={!!selected.featured}
        uploading={uploading}
        audioUploading={uploading}
      />

      <ViewConstraintsPanel
        value={
          (selected.viewConstraints as any) || {
            top: -90,
            bottom: 90,
            left: -180,
            right: 180,
            zoomMin: 60,
            zoomMax: 150,
            mobileZoomEnabled: false,
          }
        }
        onChange={(vc) => onUpdateRoom({ viewConstraints: vc as any })}
      />

      <HotspotInspector
        selected={selected}
        allRooms={allRooms}
        onUpdateHotspot={onUpdateHotspot}
        onDeleteHotspot={onDeleteHotspot}
        onCopyHotspot={onCopyHotspot}
        onSetPortalTarget={onSetPortalTarget}
      />
    </aside>
  );
}
