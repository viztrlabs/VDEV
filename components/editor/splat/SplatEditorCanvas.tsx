'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Import the SuperSplat editor types
import type { SplatSceneDef } from '@/lib/splat/splat-editor-store';

const EditorLoading = () => (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-[#3ECF8E] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-[#3ECF8E]">Loading SuperSplat Editor…</span>
    </div>
);

interface SplatEditorCanvasProps {
    className?: string;
}

export function SplatEditorCanvas({ className = '' }: SplatEditorCanvasProps) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (!canvasRef.current) return;

        let mounted = true;

        const initEditor = async () => {
            try {
                // Load the SuperSplat editor bundle
                const editorModule = await import('@/splat-editor/main');
                
                if (!mounted) return;

                // The main function from SuperSplat will initialize everything
                await editorModule.main();
                
                if (mounted) {
                    setIsInitialized(true);
                }
            } catch (error) {
                console.error('Failed to initialize SuperSplat editor:', error);
            }
        };

        initEditor();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div 
            ref={canvasRef} 
            id="splat-editor-container"
            className={`w-full h-full ${className}`}
        >
            {!isInitialized && (
                <div className="absolute inset-0 bg-[#09090B] flex items-center justify-center gap-2 z-50">
                    <div className="w-5 h-5 border-2 border-[#3ECF8E] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-mono text-[#3ECF8E]">Initializing SuperSplat Editor…</span>
                </div>
            )}
        </div>
    );
}