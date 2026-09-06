'use client';

import { useState, useRef, useEffect } from 'react';

export interface Project {
    id: number | string;
    name: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
    thumbnails?: Record<string, string>;
    settings?: Record<string, unknown>;
}

interface ProjectCardProps {
    project: Project;
    onOpen: (id: number | string) => void;
    onDelete: (id: number | string) => void;
}

function timeAgo(dateStr?: string): string {
    if (!dateStr) return 'Unknown';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
}

export default function ProjectCard({ project, onOpen, onDelete }: ProjectCardProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    const initial = (project.name || '?')[0].toUpperCase();
    const colors = ['#D4A843', '#4A90D9', '#E85D75', '#50C878', '#9B59B6', '#FF8C42'];
    const bgColor = colors[project.name.length % colors.length];

    return (
        <div className="group relative rounded-xl border border-white/[0.08] bg-[#111638] hover:border-[#D4A843]/40 transition-all duration-200 overflow-hidden">
            <div
                className="h-32 flex items-center justify-center text-4xl font-bold text-white/20"
                style={{ background: `linear-gradient(135deg, ${bgColor}22, ${bgColor}44)` }}
            >
                {initial}
            </div>

            <div className="p-4">
                <h3 className="text-white font-semibold text-sm truncate mb-1">{project.name}</h3>
                <p className="text-white/40 text-xs mb-3">
                    Updated {timeAgo(project.updatedAt || project.createdAt)}
                </p>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onOpen(project.id)}
                        className="flex-1 bg-[#D4A843] hover:bg-[#e0b855] text-black text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
                    >
                        Open
                    </button>

                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="text-white/40 hover:text-white/80 p-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 top-full mt-1 w-36 bg-[#1a1f3d] border border-white/10 rounded-lg shadow-xl z-10 py-1">
                                <button
                                    onClick={() => { onDelete(project.id); setMenuOpen(false); }}
                                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/5"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
