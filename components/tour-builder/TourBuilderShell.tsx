'use client';

import React, { useState } from 'react';
import { TourToolbar } from './TourToolbar';
import { RoomManager } from './RoomManager';
import { PanoramaViewport } from './PanoramaViewport';
import { InspectorPanel } from './InspectorPanel';
import { Toolbar } from './Toolbar';
import { ShortcutProvider } from './ShortcutProvider';

interface TourBuilderShellProps {
  projectId: string;
  experienceId?: string;
}

export function TourBuilderShell({ projectId, experienceId }: TourBuilderShellProps) {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [activeTool, setActiveTool] = useState<string>('select');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedHotspotId, setSelectedHotspotId] = useState<string>('');

  const handleSave = async () => {
    // TODO: Implement save
    console.log('Saving...');
  };

  const handleUndo = () => {
    // TODO: Implement undo
    console.log('Undo');
  };

  const handleRedo = () => {
    // TODO: Implement redo
    console.log('Redo');
  };

  return (
    <ShortcutProvider
      activeTool={activeTool}
      onToolChange={setActiveTool}
      onSave={handleSave}
      onUndo={handleUndo}
      onRedo={handleRedo}
    >
      <div className="h-screen flex flex-col bg-[#09090B] text-white overflow-hidden">
        <TourToolbar
          projectId={projectId}
          experienceId={experienceId}
          leftOpen={leftOpen}
          rightOpen={rightOpen}
          onToggleLeft={() => setLeftOpen(!leftOpen)}
          onToggleRight={() => setRightOpen(!rightOpen)}
        />

        <div className="flex-1 flex overflow-hidden">
          {leftOpen && (
            <div className="w-64 border-r border-[#27272A] flex-shrink-0">
              <RoomManager
                selectedRoomId={selectedRoomId}
                onSelectRoom={setSelectedRoomId}
              />
            </div>
          )}

          <div className="flex-1 relative">
            <PanoramaViewport
              roomId={selectedRoomId}
              activeTool={activeTool}
              selectedHotspotId={selectedHotspotId}
              onSelectHotspot={setSelectedHotspotId}
            />
          </div>

          {rightOpen && (
            <div className="w-72 border-l border-[#27272A] flex-shrink-0">
              <InspectorPanel
                roomId={selectedRoomId}
                hotspotId={selectedHotspotId}
              />
            </div>
          )}
        </div>

        <Toolbar activeTool={activeTool} onSelectTool={setActiveTool} />
      </div>
    </ShortcutProvider>
  );
}
