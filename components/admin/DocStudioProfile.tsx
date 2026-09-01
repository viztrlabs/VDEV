// components/admin/DocStudioProfile.tsx
'use client';

import React, { useState } from 'react';
import { Settings, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useDocStudioStore } from './DocStudioStore';

export default function DocStudioProfile() {
  const { profile, setProfile } = useDocStudioStore();
  const [isOpen, setIsOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const handleChange = (key: string, value: string | boolean) => {
    setProfile({ [key]: value });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };
  
  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-[var(--primary)]" />
          <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
            Business Profile
          </span>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-[10px] font-mono text-[var(--primary)] flex items-center gap-1">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
          )}
        </div>
      </button>
      
      {isOpen && (
        <div className="p-4 bg-[var(--bg-primary)] space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">
                Studio Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">
                Owner / Signatory
              </label>
              <input
                type="text"
                value={profile.owner}
                onChange={(e) => handleChange('owner', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">
                Phone
              </label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">
                Email
              </label>
              <input
                type="text"
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">
                Address
              </label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">
                UPI ID
              </label>
              <input
                type="text"
                value={profile.upi_id}
                onChange={(e) => handleChange('upi_id', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">
                GSTIN
              </label>
              <input
                type="text"
                value={profile.gstin}
                onChange={(e) => handleChange('gstin', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">
                Paper Size
              </label>
              <select
                value={profile.paper_size}
                onChange={(e) => handleChange('paper_size', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="A4">A4</option>
                <option value="Letter">US Letter</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.show_logo}
                  onChange={(e) => handleChange('show_logo', e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <span className="text-xs text-[var(--text-primary)]">Show VizTR logo</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
