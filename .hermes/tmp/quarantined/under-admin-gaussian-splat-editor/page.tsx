'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSplatEditorStore, useSplatEditorActiveScene } from '@/lib/splat/splat-editor-store';
import dynamic from 'next/dynamic';

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

export default function GaussianSplatAdminEditorPage() {
    const params = useParams<{ userId: string; projectId: string }>();
    const { initializeEditor, isInitialized } = useSplatEditorStore();

    useEffect(() => {
        initializeEditor();
    }, [initializeEditor]);

    if (!isInitialized) {
        return <EditorLoading />;
    }

    return (
        <div className="min-h-screen bg-[#09090B] text-white flex flex-col">
            <header className="flex items-center justify-between px-4 py-2 border-b border-[#27272A] bg-[#0c0c0f]">
                <div className="flex items-center gap-3">
                    <h1 className="text-sm font-mono font-bold text-[#3ECF8E] flex items-center gap-2">
                        Gaussian Splat Editor
                    </h1>
                    <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[10px] font-mono">
                        Project: {params?.projectId?.slice(0, 8)}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-[#27272A]">
                        Export
                    </button>
                    <button className="p-2 rounded-lg bg-[#3ECF8E] text-black hover:bg-[#34b876]">
                        Save
                    </button>
                </div>
            </header>
            <div className="flex-1 flex">
                <SplatEditorCanvas className="flex-1" />
            </div>
        </div>
    );
}