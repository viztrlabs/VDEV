'use client';

import React, { useState } from 'react';

type DeviceConfig = {
  id?: string;
  device: string;
  required?: boolean;
  fallback?: string;
  note?: string;
};

type DeviceCompatibilityProps = {
  items: DeviceConfig[];
  onChange?: (items: DeviceConfig[]) => void;
  readOnly?: boolean;
};

const defaultItems: DeviceConfig[] = [
  { device: 'iOS Safari', required: true, fallback: 'WebAR fallback' },
  { device: 'Android Chrome', required: true, fallback: 'WebAR fallback' },
  { device: 'Meta Quest Browser', required: false, fallback: 'WebXR mode' },
  { device: 'Desktop Chrome', required: false, fallback: 'Preview canvas' },
];

export function DeviceCompatibility({ items, onChange, readOnly = false }: DeviceCompatibilityProps) {
  const [local, setLocal] = useState<DeviceConfig[]>(items.length ? items : defaultItems);

  const update = (index: number, patch: Partial<DeviceConfig>) => {
    const next = local.map((item, i) => (i === index ? { ...item, ...patch } : item));
    setLocal(next);
    onChange?.(next);
  };

  const add = () => {
    const next = [...local, { device: '', required: false, fallback: '', note: '' }];
    setLocal(next);
    onChange?.(next);
  };

  const remove = (index: number) => {
    const next = local.filter((_, i) => i !== index);
    setLocal(next);
    onChange?.(next);
  };

  return (
    <div className="rounded border border-[#27272A] bg-[#0F0F11]">
      <div className="flex items-center justify-between border-b border-[#27272A] px-3 py-2">
        <div className="text-[11px] font-mono text-[#A1A1AA]">Device compatibility</div>
        {!readOnly && (
          <button
            type="button"
            onClick={add}
            className="px-2 py-1 rounded border border-[#3ECF8E]/40 bg-[#3ECF8E]/15 text-[10px] font-mono text-[#3ECF8E] hover:bg-[#3ECF8E]/25"
          >
            + Add device
          </button>
        )}
      </div>

      <div className="max-h-64 overflow-auto">
        <table className="w-full text-left text-[11px] font-mono text-[#A1A1AA]">
          <thead className="text-[#71717A]">
            <tr>
              <th className="px-3 py-2">Device</th>
              <th className="px-3 py-2">Required</th>
              <th className="px-3 py-2">Fallback</th>
              <th className="px-3 py-2">Note</th>
              {!readOnly && <th className="px-3 py-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {local.map((item, index) => (
              <tr key={`${item.device}-${index}`} className="border-t border-[#27272A]">
                <td className="px-3 py-2">
                  <input
                    disabled={readOnly}
                    value={item.device}
                    onChange={(e) => update(index, { device: e.target.value })}
                    className="w-full rounded border border-[#27272A] bg-[#09090B] px-2 py-1 text-[11px] font-mono text-white outline-none focus:border-[#3ECF8E]/60"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    disabled={readOnly}
                    checked={!!item.required}
                    onChange={(e) => update(index, { required: e.target.checked })}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    disabled={readOnly}
                    value={item.fallback ?? ''}
                    onChange={(e) => update(index, { fallback: e.target.value })}
                    className="w-full rounded border border-[#27272A] bg-[#09090B] px-2 py-1 text-[11px] font-mono text-white outline-none focus:border-[#3ECF8E]/60"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    disabled={readOnly}
                    value={item.note ?? ''}
                    onChange={(e) => update(index, { note: e.target.value })}
                    className="w-full rounded border border-[#27272A] bg-[#09090B] px-2 py-1 text-[11px] font-mono text-white outline-none focus:border-[#3ECF8E]/60"
                  />
                </td>
                {!readOnly && (
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="px-2 py-1 rounded border border-rose-500/40 bg-rose-500/10 text-[10px] font-mono text-rose-300 hover:bg-rose-500/20"
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {local.length === 0 && (
              <tr>
                <td className="px-3 py-3 text-[#71717A]" colSpan={readOnly ? 4 : 5}>
                  No device configs defined.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
