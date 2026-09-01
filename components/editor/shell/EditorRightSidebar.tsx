'use client';

import React from 'react';
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
}: EditorRightSidebarProps) {
  return (
    <aside className="w-80 shrink-0 border-l border-[#27272A] overflow-y-auto p-3 space-y-3">
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
