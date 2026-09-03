'use client';

import React, { useState } from 'react';

type Field = {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'select' | 'textarea' | 'json' | 'toggle';
  options?: { label: string; value: string }[];
  placeholder?: string;
  required?: boolean;
};

type RecordModalProps = {
  open: boolean;
  title: string;
  mode: 'create' | 'edit';
  fields: Field[];
  initialValues: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onClose: () => void;
  onSubmit: () => void;
  submitting?: boolean;
};

function FieldInput({ field, value, onChange }: { field: Field; value: any; onChange: (value: any) => void }) {
  if (field.type === 'select') {
    return (
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1.5 text-[11px] font-mono text-white"
      >
        <option value="">—</option>
        {(field.options || []).map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === 'textarea') {
    return (
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={field.placeholder}
        className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1.5 text-[11px] font-mono text-white resize-none"
      />
    );
  }

  if (field.type === 'json') {
    return (
      <textarea
        value={value ? JSON.stringify(value, null, 2) : '{}'}
        onChange={(e) => {
          try {
            onChange(JSON.parse(e.target.value));
          } catch {
            // allow invalid JSON while typing
          }
        }}
        rows={4}
        placeholder="{}"
        className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1.5 text-[11px] font-mono text-white resize-none"
      />
    );
  }

  if (field.type === 'toggle') {
    return (
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-9 h-5 rounded-full relative transition-colors ${value ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${value ? 'left-4' : 'left-0.5'}`} />
      </button>
    );
  }

  return (
    <input
      type={field.type || 'text'}
      value={value ?? ''}
      onChange={(e) => (field.type === 'number' ? onChange(Number(e.target.value)) : onChange(e.target.value))}
      placeholder={field.placeholder}
      className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1.5 text-[11px] font-mono text-white"
    />
  );
}

export function RecordModal({ open, title, mode, fields, initialValues, onChange, onClose, onSubmit, submitting }: RecordModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-xl rounded-xl border border-[#27272A] bg-[#0c0c0f] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-white">{title}</h3>
          <button type="button" onClick={onClose} className="text-[#A1A1AA] hover:text-white text-[10px] font-mono">
            Close
          </button>
        </div>
        <div className="grid grid-cols-1 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {fields.map((field) => (
            <div key={field.key} className="space-y-1">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
                {field.label}
              </label>
              <FieldInput field={field} value={initialValues[field.key]} onChange={(value) => onChange({ ...initialValues, [field.key]: value })} />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-2.5 py-1.5 rounded border border-[#27272A] bg-[#09090B] text-[10px] font-mono text-[#A1A1AA] hover:text-white">
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="px-2.5 py-1.5 rounded border border-[#3ECF8E]/40 bg-[#3ECF8E]/15 text-[10px] font-mono text-[#3ECF8E] hover:bg-[#3ECF8E]/25 disabled:opacity-60"
          >
            {submitting ? 'Saving…' : mode === 'create' ? 'Create' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
