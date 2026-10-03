'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Toaster, toast } from 'sonner';
import { TourToolbar } from './TourToolbar';
import { RoomManager } from './RoomManager';
import { PanoramaViewport } from './PanoramaViewport';
import { InspectorPanel } from './InspectorPanel';
import { Toolbar } from './Toolbar';
import { ShortcutProvider } from './ShortcutProvider';
import { ContextMenuProvider } from './ContextMenu';
import { ValidationPanel } from './ValidationPanel';
import { OnboardingOverlay } from './OnboardingOverlay';
import { ConnectorSystem } from './ConnectorSystem';
import { IconPicker } from './IconPicker';
import { useTourStore } from '@/lib/tourClientStore';
import { buildTourManifest, manifestSceneToTourScene } from '@/lib/tourManifest';

const TourViewer = dynamic(() => import('@/components/xr/TourViewer'), { ssr: false });

interface TourBuilderShellProps {
  projectId: string;
  experienceId?: string;
}

export function TourBuilderShell({ projectId, experienceId }: TourBuilderShellProps) {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [validationOpen, setValidationOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<string>('select');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedHotspotId, setSelectedHotspotId] = useState<string>('');
  const [connectorOpen, setConnectorOpen] = useState(false);
  const [connectorTarget, setConnectorTarget] = useState<string | undefined>();
  const [connectorYaw, setConnectorYaw] = useState(0);
  const [connectorPitch, setConnectorPitch] = useState(0);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconPickerHotspotId, setIconPickerHotspotId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [clipboard, setClipboard] = useState<any>(null);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    const unsub = useTourStore.temporal.subscribe((s) => {
      setCanUndo(s.pastStates.length > 0);
      setCanRedo(s.futureStates.length > 0);
    });
    return unsub;
  }, []);

  const undo = () => {
    try { useTourStore.temporal.getState().undo(); } catch {}
  };
  const redo = () => {
    try { useTourStore.temporal.getState().redo(); } catch {}
  };

  const deleteHotspot = useTourStore((s) => s.deleteHotspot);
  const deleteScene = useTourStore((s) => s.deleteScene);
  const scenes = useTourStore((s) => s.scenes);

  const handleSave = () => {
    window.dispatchEvent(new CustomEvent('tour-builder-save'));
  };

  const handleUndo = useCallback(() => {
    undo();
    toast.info('Undone');
  }, [undo]);

  const handleRedo = useCallback(() => {
    redo();
    toast.info('Redone');
  }, [redo]);

  const handlePreview = useCallback(() => {
    setPreviewMode((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewMode) setPreviewMode(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewMode]);

  const handleViewportClick = (yaw: number, pitch: number) => {
    if (activeTool === 'connect') {
      setConnectorYaw(yaw);
      setConnectorPitch(pitch);
      setConnectorOpen(true);
    }
  };

  const manifest = useMemo(() => buildTourManifest(scenes as any), [scenes]);
  const allPreviewScenes = useMemo(
    () => manifest.scenes.map((sc) => {
      const room = scenes.find((r) => r.id === sc.id);
      return room ? manifestSceneToTourScene(room as any, manifest) : null;
    }).filter((s): s is NonNullable<typeof s> => s !== null),
    [manifest, scenes],
  );
  const previewScene = useMemo(
    () => allPreviewScenes.find((s) => s.id === selectedRoomId) ?? allPreviewScenes[0] ?? null,
    [allPreviewScenes, selectedRoomId],
  );

  const handleConnect = (sourceId: string, targetId: string, yaw: number, pitch: number, reverse?: boolean) => {
    const state = useTourStore.getState();
    state.addHotspot(sourceId, {
      type: 'navigation',
      yaw, pitch,
      title: `To ${state.scenes.find(s => s.id === targetId)?.name || 'Room'}`,
      description: '',
      targetSceneId: targetId,
      targetYaw: 0,
      targetPitch: 0,
      icon: 'navigation',
    });
    if (reverse) {
      state.addHotspot(targetId, {
        type: 'navigation',
        yaw: 0, pitch: 0,
        title: `To ${state.scenes.find(s => s.id === sourceId)?.name || 'Room'}`,
        description: '',
        targetSceneId: sourceId,
        targetYaw: yaw,
        targetPitch: pitch,
        icon: 'navigation',
      });
    }
    setConnectorOpen(false);
    toast.success('Rooms connected');
  };

  const handleIconChange = (hotspotId: string, icon: string) => {
    if (selectedRoomId) {
      useTourStore.getState().updateHotspot(selectedRoomId, hotspotId, { icon });
    }
  };

  const handleDuplicate = useCallback(() => {
    if (selectedHotspotId && selectedRoomId) {
      useTourStore.getState().duplicateHotspot(selectedRoomId, selectedHotspotId);
    }
  }, [selectedHotspotId, selectedRoomId]);

  const handleCopy = useCallback(() => {
    if (selectedHotspotId && selectedRoomId) {
      const scene = useTourStore.getState().scenes.find(s => s.id === selectedRoomId);
      const hs = scene?.hotspots.find(h => h.id === selectedHotspotId);
      if (hs) setClipboard({ ...hs });
    }
  }, [selectedHotspotId, selectedRoomId]);

  const handlePaste = useCallback(() => {
    if (clipboard && selectedRoomId) {
      const { id, createdAt, updatedAt, ...rest } = clipboard;
      useTourStore.getState().addHotspot(selectedRoomId, {
        ...rest,
        yaw: rest.yaw + 0.05,
        title: `${rest.title} (paste)`,
      });
    }
  }, [clipboard, selectedRoomId]);

  const handleDelete = useCallback(() => {
    if (selectedHotspotId && selectedRoomId) {
      if (confirm('Delete this hotspot?')) {
        deleteHotspot(selectedRoomId, selectedHotspotId);
        setSelectedHotspotId('');
        toast.success('Hotspot deleted');
      }
    } else if (selectedRoomId) {
      if (confirm('Delete this room? All hotspots will be lost.')) {
        deleteScene(selectedRoomId);
        setSelectedRoomId('');
        toast.success('Room deleted');
      }
    }
  }, [selectedHotspotId, selectedRoomId, deleteHotspot, deleteScene]);

  return (
    <ContextMenuProvider>
      <Toaster position="bottom-right" theme="dark" />
      <OnboardingOverlay onComplete={() => {}} />
      <ShortcutProvider
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onSave={handleSave}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onPreview={handlePreview}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onCopy={handleCopy}
        onPaste={handlePaste}
      >
        <div className="h-screen flex flex-col bg-[#09090B] text-white overflow-hidden">
          {previewMode ? (
            <>
              <div className="h-10 border-b border-[#27272A] flex items-center justify-end px-4 flex-shrink-0">
                <button
                  onClick={handlePreview}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono bg-[#27272A] hover:bg-[#3F3F46] text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Exit Preview (Esc)
                </button>
              </div>
              <div className="flex-1 relative">
                {previewScene ? (
                  <TourViewer
                    scene={previewScene}
                    scenes={allPreviewScenes}
                    activeSceneId={selectedRoomId || previewScene.id}
                    onSelectScene={setSelectedRoomId}
                  />
                ) : (
                  <PanoramaViewport
                    roomId={selectedRoomId}
                    activeTool="select"
                    selectedHotspotId=""
                    onSelectHotspot={() => {}}
                  />
                )}
              </div>
              <button
                onClick={handlePreview}
                className="fixed bottom-6 right-6 px-4 py-2 rounded-lg text-sm font-mono bg-black/70 hover:bg-black/90 border border-[#27272A] text-white backdrop-blur-sm transition-colors z-50"
              >
                Exit Preview (Esc)
              </button>
            </>
          ) : (
            <>
              <TourToolbar
                projectId={projectId}
                experienceId={experienceId}
                leftOpen={leftOpen}
                rightOpen={rightOpen}
                validationOpen={validationOpen}
                onToggleLeft={() => setLeftOpen(!leftOpen)}
                onToggleRight={() => setRightOpen(!rightOpen)}
                onToggleValidation={() => setValidationOpen(!validationOpen)}
                selectedRoomId={selectedRoomId}
                onSelectRoom={setSelectedRoomId}
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
                    onViewportClick={handleViewportClick}
                  />
                  {connectorOpen && selectedRoomId && (
                    <ConnectorSystem
                      sourceSceneId={selectedRoomId}
                      targetSceneId={connectorTarget}
                      yaw={connectorYaw}
                      pitch={connectorPitch}
                      onConnect={handleConnect}
                      onCancel={() => setConnectorOpen(false)}
                    />
                  )}
                  {iconPickerOpen && iconPickerHotspotId && (
                    <IconPicker
                      value={undefined}
                      onChange={(icon) => handleIconChange(iconPickerHotspotId, icon)}
                      onClose={() => { setIconPickerOpen(false); setIconPickerHotspotId(null); }}
                    />
                  )}
                </div>

                {validationOpen && (
                  <div className="w-72 border-l border-[#27272A] flex-shrink-0">
                    <ValidationPanel />
                  </div>
                )}

                {rightOpen && !validationOpen && (
                  <div className="w-72 border-l border-[#27272A] flex-shrink-0">
                    <InspectorPanel
                      roomId={selectedRoomId}
                      hotspotId={selectedHotspotId}
                    />
                  </div>
                )}
              </div>

              <Toolbar activeTool={activeTool} onSelectTool={setActiveTool} />
            </>
          )}
        </div>
      </ShortcutProvider>
    </ContextMenuProvider>
  );
}
