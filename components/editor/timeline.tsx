'use client';

import React, { useState } from 'react';

type TimelineItem = {
  id?: string;
  title: string;
  start: number;
  duration: number;
  type?: string;
};

type TimelineProps = {
  items: TimelineItem[];
  onChange?: (items: TimelineItem[]) => void;
  readOnly?: boolean;
};

export function Timeline({ items, onChange, readOnly = false }: TimelineProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const maxDuration = Math.max(items.reduce((sum, item) => sum + item.duration, 0), 60);

  const handleAdd = () => {
    if (!onChange) return;
    const newItem: TimelineItem = {
      title: 'New clip',
      start: maxDuration,
      duration: 5,
      type: 'clip',
    };
    onChange([...items, newItem]);
  };

  const handleUpdate = (id: string, patch: Partial<TimelineItem>) => {
    if (!onChange) return;
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const handleDelete = (id: string) => {
    if (!onChange) return;
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="rounded border border-[#27272A] bg-[#0F0F11]">
      <div className="flex items-center justify-between border-b border-[#27272A] px-3 py-2">
        <div className="text-[11px] font-mono text-[#A1A1AA]">Timeline</div>
        {!readOnly && (
          <button
            type="button"
            onClick={handleAdd}
            className="px-2 py-1 rounded border border-[#3ECF8E]/40 bg-[#3ECF8E]/15 text-[10px] font-mono text-[#3ECF8E] hover:bg-[#3ECF8E]/25"
          >
            + Add clip
          </button>
        )}
      </div>

      <div className="max-h-64 overflow-auto">
        <table className="w-full text-left text-[11px] font-mono text-[#A1A1AA]">
          <thead className="text-[#71717A]">
            <tr>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Start</th>
              <th className="px-3 py-2">Duration</th>
              <th className="px-3 py-2">Type</th>
              {!readOnly && <th className="px-3 py-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id ?? `${item.title}-${item.start}`} className="border-t border-[#27272A]">
                <td className="px-3 py-2 text-white">{item.title}</td>
                <td className="px-3 py-2">{item.start}s</td>
                <td className="px-3 py-2">{item.duration}s</td>
                <td className="px-3 py-2">{item.type ?? 'clip'}</td>
                {!readOnly && (
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedId(item.id ?? null)}
                        className="px-2 py-1 rounded border border-[#27272A] bg-[#09090B] text-[10px] font-mono text-[#A1A1AA] hover:text-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id ?? '')}
                        className="px-2 py-1 rounded border border-rose-500/40 bg-rose-500/10 text-[10px] font-mono text-rose-300 hover:bg-rose-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="px-3 py-3 text-[#71717A]" colSpan={readOnly ? 4 : 5}>
                  No timeline items yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
