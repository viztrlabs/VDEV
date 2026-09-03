'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSplatEditorStore, useSplatEditorActiveScene } from '@/lib/splat/splat-editor-store';
import { Box, Menu, X, ChevronDown, Download, Upload, Eye, Settings, Info } from 'lucide-react';

const SplatEditorCanvas = dynamic(
    () => import('@/components/editor/splat/SplatEditorCanvas').then(m => m.SplatEditorCanvas),
    { ssr: false, loading: () => <EditorLoading /> }
);

const EditorLoading = () => (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-[#3ECF8E] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-[#3ECF8E]">Loading SuperSplat Editor…</span>
    </div>
);

const ToolButton = ({ 
    icon: Icon, 
    label, 
    active, 
    onClick, 
    disabled = false 
}: { 
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    active?: boolean;
    onClick: () => void;
    disabled?: boolean;
}) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
            active
                ? 'bg-[#3ECF8E] text-black'
                : 'text-[#A1A1AA] hover:text-white hover:bg-[#27272A] disabled:opacity-30 disabled:cursor-not-allowed'
        }`}
        title={label}
    >
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
    </button>
);

const ViewModeButton = ({ 
    icon: Icon, 
    label, 
    active, 
    onClick 
}: { 
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    active: boolean;
    onClick: () => void;
}) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
            active
                ? 'bg-[#3ECF8E]/15 border border-[#3ECF8E]/30 text-[#3ECF8E]'
                : 'text-[#71717A] hover:text-white border border-transparent'
        }`}
        title={label}
    >
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
    </button>
);

export default function GaussianSplatEditorPage() {
    const { 
        initializeEditor, 
        isInitialized,
        activeTool,
        setActiveTool,
        scenes,
        activeSceneId,
        setActiveScene,
        addScene,
        removeScene,
        activeScene 
    } = useSplatEditorStore();

    useEffect(() => {
        initializeEditor();
    }, [initializeEditor]);

    const handleNewScene = () => {
        // Create a new empty scene or prompt for URL
        const url = prompt('Enter .splat/.ply URL (or leave empty for new scene):');
        if (url !== null) {
            const id = `scene-${Date.now()}`;
            const name = url ? url.split('/').pop()?.split('.')[0] || 'New Scene' : 'New Scene';
            addScene({ id, name, url: url || '', format: 'splat' });
            setActiveScene(id);
        }
    };

    const handleLoadUrl = () => {
        const url = prompt('Enter .splat/.ply/.ksplat URL to load:');
        if (url) {
            const id = `scene-${Date.now()}`;
            const name = url.split('/').pop()?.split('.')[0] || 'Loaded Scene';
            addScene({ id, name, url, format: url.endsWith('.ksplat') ? 'ksplat' : url.endsWith('.ply') ? 'ply' : 'splat' });
            setActiveScene(id);
        }
    };

    const handleExport = () => {
        const format = prompt('Export format (splat/ply/ksplat):', 'splat') as 'splat' | 'ply' | 'ksplat';
        if (format && ['splat', 'ply', 'ksplat'].includes(format)) {
            // Trigger export via events
            if (typeof window !== 'undefined' && (window as any).scene?.events) {
                (window as any).scene.events.fire('export', format);
            }
        }
    };

    if (!isInitialized) {
        return <EditorLoading />;
    }

    return (
        <div className="min-h-screen bg-[#09090B] text-white flex flex-col">
            {/* Top Toolbar */}
            <header className="flex items-center justify-between px-4 py-2 border-b border-[#27272A] bg-[#0c0c0f] z-20">
                <div className="flex items-center gap-3">
                    <h1 className="text-sm font-mono font-bold text-[#3ECF8E] flex items-center gap-2">
                        <Box className="w-4 h-4" />
                        SuperSplat Editor
                    </h1>
                    <span className="px-2 py-0.5 rounded bg-[#3ECF8E]/15 text-[#3ECF8E] text-[10px] font-mono">
                        v3.0.0-alpha
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <ToolButton
                        icon={Upload}
                        label="New Scene"
                        onClick={handleNewScene}
                    />
                    <ToolButton
                        icon={Download}
                        label="Load from URL"
                        onClick={handleLoadUrl}
                    />
                    <ToolButton
                        icon={Download}
                        label="Export"
                        onClick={handleExport}
                    />
                </div>

                <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A]">
                        <Eye className="w-3.5 h-3.5 text-[#A1A1AA]" />
                        <span className="text-xs font-mono text-[#A1A1AA]">Scene</span>
                        <select
                            value={activeSceneId || ''}
                            onChange={(e) => e.target.value && setActiveScene(e.target.value)}
                            className="ml-2 bg-transparent border-none outline-none text-white text-xs font-mono"
                        >
                            {scenes.map((scene) => (
                                <option key={scene.id} value={scene.id}>
                                    {scene.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-[#71717A]" />
                    </div>

                    <button
                        type="button"
                        onClick={handleNewScene}
                        className="p-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors"
                        title="Add Scene"
                    >
                        <Box className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Scene Panel */}
                <aside className="w-64 shrink-0 border-r border-[#27272A] overflow-y-auto p-3 space-y-3 bg-[#0c0c0f]">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
                        Scene
                    </div>
                    
                    {activeScene && (
                        <div className="space-y-2">
                            <div className="rounded-lg border border-[#27272A] bg-[#09090B] p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-mono font-bold text-white truncate">
                                        {activeScene.name}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded bg-[#3ECF8E]/15 text-[#3ECF8E] text-[10px] font-mono">
                                        {activeScene.format?.toUpperCase() || 'SPLAT'}
                                    </span>
                                </div>
                                
                                <div className="text-[10px] font-mono text-[#71717A] truncate">
                                    {activeScene.url}
                                </div>
                                
                                <div className="flex items-center gap-2 pt-2 border-t border-[#27272A]">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (typeof window !== 'undefined' && (window as any).scene?.events) {
                                                (window as any).scene.events.fire('camera.focus');
                                            }
                                        }}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1 rounded border border-[#27272A] text-[10px] font-mono text-[#A1A1AA] hover:text-white hover:bg-[#18181B]"
                                    >
                                        <Box className="w-3.5 h-3.5" />
                                        Focus
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeScene(activeScene.id)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1 rounded border border-rose-500/30 text-[10px] font-mono text-rose-400 hover:bg-rose-500/10"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {scenes.length === 0 && (
                        <div className="text-center text-xs text-[#71717A] font-mono py-4">
                            No scenes loaded
                        </div>
                    )}

                    <div className="pt-4 border-t border-[#27272A]">
                        <button
                            type="button"
                            onClick={handleNewScene}
                            className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded border border-[#3ECF8E]/30 text-[#3ECF8E] text-[10px] font-mono font-bold hover:bg-[#3ECF8E]/10"
                        >
                            <Box className="w-3.5 h-3.5" />
                            Add Scene
                        </button>
                    </div>
                </aside>

                {/* Main Canvas Area */}
                <main className="flex-1 flex flex-col min-w-0 relative">
                    <SplatEditorCanvas className="flex-1" />
                    
                    {/* Bottom Toolbar */}
                    <div className="absolute bottom-0 left-0 right-0 z-20 p-3 border-t border-[#27272A] bg-[#0c0c0f]">
                        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                            {/* Transform Tools */}
                            <div className="flex items-center gap-1 bg-[#18181B] border border-[#27272A] rounded-lg p-1">
                                {(['move', 'rotate', 'scale'] as const).map((tool) => (
                                    <ToolButton
                                        key={tool}
                                        icon={tool === 'move' ? Box : tool === 'rotate' ? Settings : Settings}
                                        label={tool.charAt(0).toUpperCase() + tool.slice(1)}
                                        active={activeTool === tool}
                                        onClick={() => setActiveTool(tool)}
                                    />
                                ))}
                            </div>

                            {/* Selection Tools */}
                            <div className="flex items-center gap-1 bg-[#18181B] border border-[#27272A] rounded-lg p-1">
                                {(['select', 'rectSelect', 'brushSelect', 'sphereBrushSelect', 'floodSelect', 'polygonSelect', 'lassoSelect'] as const).map((tool) => (
                                    <ToolButton
                                        key={tool}
                                        icon={Box}
                                        label={tool.replace(/([A-Z])/g, ' $1').replace('Select', '').trim() || 'Select'}
                                        active={activeTool === tool}
                                        onClick={() => setActiveTool(tool)}
                                    />
                                ))}
                            </div>

                            {/* View Overlays */}
                            <div className="flex items-center gap-1 bg-[#18181B] border border-[#27272A] rounded-lg p-1">
                                {(['Gaussians', 'Centers', 'Rings', 'Grid', 'Bound', 'Camera'] as const).map((overlay) => (
                                    <ViewModeButton
                                        key={overlay}
                                        icon={Eye}
                                        label={overlay}
                                        active={false}
                                        onClick={() => {}}
                                    />
                                ))}
                            </div>

                            {/* Info & Settings */}
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    className="p-2 rounded-lg bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors"
                                    title="Settings"
                                >
                                    <Settings className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    className="p-2 rounded-lg bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors"
                                    title="Info"
                                >
                                    <Info className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Right Sidebar - Properties/Appearance/Overlays */}
                <aside className="w-80 shrink-0 border-l border-[#27272A] overflow-y-auto p-3 space-y-3 bg-[#0c0c0f]">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
                        Properties
                    </div>

                    {activeScene && (
                        <div className="space-y-3">
                            {/* Appearance */}
                            <div className="rounded-lg border border-[#27272A] bg-[#09090B] p-3 space-y-2">
                                <div className="text-[10px] font-mono uppercase tracking-wider text-[#3ECF8E]">
                                    Appearance
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-mono text-[#A1A1AA]">
                                        <input type="checkbox" defaultChecked />
                                        <span>Show Gaussians</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-[10px] font-mono text-[#A1A1AA]">
                                        <input type="checkbox" />
                                        <span>Show Centers</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-[10px] font-mono text-[#A1A1AA]">
                                        <input type="checkbox" />
                                        <span>Show Rings</span>
                                    </label>
                                </div>
                            </div>

                            {/* Overlays */}
                            <div className="rounded-lg border border-[#27272A] bg-[#09090B] p-3 space-y-2">
                                <div className="text-[10px] font-mono uppercase tracking-wider text-[#3ECF8E]">
                                    Overlays
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-mono text-[#A1A1AA]">
                                        <input type="checkbox" defaultChecked />
                                        <span>Grid</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-[10px] font-mono text-[#A1A1AA]">
                                        <input type="checkbox" defaultChecked />
                                        <span>Bound</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-[10px] font-mono text-[#A1A1AA]">
                                        <input type="checkbox" />
                                        <span>Camera Poses</span>
                                    </label>
                                </div>
                            </div>

                            {/* Render Settings */}
                            <div className="rounded-lg border border-[#27272A] bg-[#09090B] p-3 space-y-2">
                                <div className="text-[10px] font-mono uppercase tracking-wider text-[#3ECF8E]">
                                    Render
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-mono text-[#71717A] mb-1">
                                        Stochastic Mode
                                    </label>
                                    <select className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-[10px] font-mono text-white">
                                        <option value="auto">Auto</option>
                                        <option value="disabled">Disabled</option>
                                        <option value="enabled">Enabled</option>
                                        <option value="movement">Movement</option>
                                    </select>
                                </div>
                            </div>

                            {/* Selection Stats */}
                            <div className="rounded-lg border border-[#27272A] bg-[#09090B] p-3 space-y-1">
                                <div className="text-[10px] font-mono uppercase tracking-wider text-[#3ECF8E]">
                                    Selection
                                </div>
                                <div className="text-[10px] font-mono text-[#A1A1AA]">
                                    0 gaussians selected
                                </div>
                                <div className="text-[10px] font-mono text-[#A1A1AA]">
                                    0 / 0
                                </div>
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}