'use client';

import { useState, useEffect, useRef } from 'react';

interface StarterKit {
    id: string;
    name: string;
    description: string;
    gradient: string;
    icon: string;
    fork_from: number | null;
    group: 'general' | 'architecture' | 'xr';
}

interface StarterKit {
    id: string;
    name: string;
    description: string;
    gradient: string;
    icon: string;
    fork_from: number | null;
    group: 'general' | 'architecture' | 'xr';
}

const STARTER_KITS: StarterKit[] = [
    // General
    {
        id: 'blank',
        name: 'Blank Project',
        description: 'Start from scratch with an empty scene.',
        gradient: 'from-gray-600 to-gray-800',
        icon: '◻',
        fork_from: null,
        group: 'general',
    },
    // Architecture Studio
    {
        id: 'exterior-interior',
        name: 'Exterior / Interior',
        description: 'Architectural visualization with sun lighting, HDRI environment, and camera presets for exterior and interior shots.',
        gradient: 'from-blue-500 to-indigo-900',
        icon: '🏛',
        fork_from: 1001,
        group: 'architecture',
    },
    {
        id: 'animation-walkthrough',
        name: 'Animation / Walkthrough',
        description: 'Pre-animated camera path with spline tracks, timeline setup, and cinematic walkthrough keyframes.',
        gradient: 'from-cyan-500 to-blue-900',
        icon: '🎬',
        fork_from: 1002,
        group: 'architecture',
    },
    // XR World
    {
        id: 'xrar',
        name: 'XR / AR',
        description: 'WebXR extended reality and WebAR augmented reality setup with hit-test, anchors, and scene understanding.',
        gradient: 'from-emerald-500 to-green-900',
        icon: '📱',
        fork_from: 2001,
        group: 'xr',
    },
    {
        id: 'vr',
        name: 'VR Experience',
        description: 'Virtual reality with teleport locomotion, hand tracking, controller input, and immersive rendering.',
        gradient: 'from-purple-500 to-violet-900',
        icon: '🥽',
        fork_from: 2002,
        group: 'xr',
    },
    {
        id: 'virtual-tour',
        name: 'Virtual Tour',
        description: 'Interactive 360° panoramic tour with hotspot navigation, info panels, and floor plan overlay.',
        gradient: 'from-teal-500 to-emerald-900',
        icon: '🌍',
        fork_from: 2003,
        group: 'xr',
    },
    {
        id: 'gaussian-splat',
        name: 'Gaussian Splat',
        description: 'Real-time 3D Gaussian splatting viewer for photorealistic point cloud rendering.',
        gradient: 'from-amber-500 to-orange-800',
        icon: '✦',
        fork_from: 2004,
        group: 'xr',
    },
    {
        id: 'pixel-streaming',
        name: 'Pixel Streaming',
        description: 'Cloud-rendered pixel streaming with low-latency WebRTC, adaptive quality, and input forwarding.',
        gradient: 'from-red-500 to-rose-900',
        icon: '📡',
        fork_from: 2005,
        group: 'xr',
    },
];

function KitCard({ kit, selected, onSelect }: { kit: StarterKit; selected: boolean; onSelect: (kit: StarterKit) => void }) {
    return (
        <button
            onClick={() => onSelect(kit)}
            className={`group flex flex-col items-center text-left rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                selected
                    ? 'border-[#D4A843] shadow-lg shadow-[#D4A843]/10'
                    : 'border-transparent hover:border-white/20'
            }`}
        >
            {/* Thumbnail */}
            <div className={`w-full aspect-[4/3] bg-gradient-to-br ${kit.gradient} flex items-center justify-center relative`}>
                <span className="text-4xl opacity-60">{kit.icon}</span>

                {/* Selection overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity ${
                    selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                }`} />

                {/* Selected checkmark */}
                {selected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-[#D4A843] rounded-full flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Name */}
            <div className={`w-full px-3 py-2 text-center text-xs font-medium transition-colors ${
                selected
                    ? 'bg-[#D4A843]/10 text-[#D4A843]'
                    : 'bg-[#111638] text-white/70 group-hover:text-white'
            }`}>
                {kit.name}
            </div>
        </button>
    );
}

interface NewProjectModalProps {
    open: boolean;
    onClose: () => void;
    onCreate: (name: string, description: string, fork_from: number | null) => void;
}

export default function NewProjectModal({ open, onClose, onCreate }: NewProjectModalProps) {
    const [selectedKit, setSelectedKit] = useState<StarterKit>(STARTER_KITS[0]);
    const [name, setName] = useState(STARTER_KITS[0].name);
    const [description, setDescription] = useState(STARTER_KITS[0].description);
    const nameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setSelectedKit(STARTER_KITS[0]);
            setName(STARTER_KITS[0].name);
            setDescription(STARTER_KITS[0].description);
            setTimeout(() => nameRef.current?.select(), 100);
        }
    }, [open]);

    useEffect(() => {
        function handleEsc(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        if (open) document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [open, onClose]);

    function handleKitSelect(kit: StarterKit) {
        setSelectedKit(kit);
        setName(kit.name);
        setDescription(kit.description);
        setTimeout(() => nameRef.current?.select(), 50);
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl w-full max-w-5xl mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4A843] to-[#b8922e] flex items-center justify-center">
                            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-white">Start a new project</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content: Two-column layout */}
                <div className="flex min-h-[480px]">
                    {/* Left: Starter Kit Grid */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        <div className="space-y-5">
                            {/* General */}
                            <div>
                                <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">General</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {STARTER_KITS.filter(k => k.group === 'general').map((kit) => (
                                        <KitCard key={kit.id} kit={kit} selected={selectedKit.id === kit.id} onSelect={handleKitSelect} />
                                    ))}
                                </div>
                            </div>

                            {/* Architecture Studio */}
                            <div>
                                <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">Architecture Studio</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {STARTER_KITS.filter(k => k.group === 'architecture').map((kit) => (
                                        <KitCard key={kit.id} kit={kit} selected={selectedKit.id === kit.id} onSelect={handleKitSelect} />
                                    ))}
                                </div>
                            </div>

                            {/* XR World */}
                            <div>
                                <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">XR World</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {STARTER_KITS.filter(k => k.group === 'xr').map((kit) => (
                                        <KitCard key={kit.id} kit={kit} selected={selectedKit.id === kit.id} onSelect={handleKitSelect} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Sidebar Form */}
                    <div className="w-80 border-l border-white/[0.06] bg-[#111638] p-6 flex flex-col">
                        <div className="flex-1 space-y-5">
                            {/* Name */}
                            <div>
                                <label className="block text-[#D4A843] text-xs font-semibold mb-2 uppercase tracking-wider">Name</label>
                                <input
                                    ref={nameRef}
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-[#0a0e27] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4A843] transition-colors"
                                    placeholder="Project name"
                                />
                                <div className="text-right text-white/20 text-xs mt-1">{name.length} / 32</div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-[#D4A843] text-xs font-semibold mb-2 uppercase tracking-wider">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full bg-[#0a0e27] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4A843] transition-colors resize-none"
                                    placeholder="Optional description..."
                                />
                                <div className="text-right text-white/20 text-xs mt-1">{description.length} / 360</div>
                            </div>

                            {/* Selected kit description */}
                            <div className="bg-[#0a0e27] rounded-lg p-3 border border-white/[0.04]">
                                <p className="text-white/40 text-xs leading-relaxed">{selectedKit.description}</p>
                            </div>
                        </div>

                        {/* CREATE Button */}
                        <button
                            onClick={() => {
                                if (name.trim()) {
                                    onCreate(name.trim(), description.trim(), selectedKit.fork_from);
                                    onClose();
                                }
                            }}
                            disabled={!name.trim()}
                            className="w-full mt-6 bg-[#D4A843] hover:bg-[#e0b855] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-sm py-3 rounded-lg transition-colors uppercase tracking-wider"
                        >
                            Create
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
