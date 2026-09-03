'use client';

import React, { useState } from 'react';
import { RecordModal } from '@/components/editor/record-modal';
import { usePermissions } from '@/components/editor/permissions';

export type Tab = {
  key: string;
  label: string;
  columns: { key: string; label: string; render?: (value: any, row: any) => React.ReactNode }[];
  fields?: { key: string; label: string; type?: 'text' | 'number' | 'select' | 'textarea' | 'json' | 'toggle'; options?: { label: string; value: string }[] }[];
  apiEndpoint?: string;
  rowIdField?: string;
};

type ServiceEditorPanelsProps = {
  tabs: Tab[];
  tabData: Record<string, any[]>;
  loading?: boolean;
  error?: string;
};

export function ServiceEditorPanels({ tabs, tabData, loading, error }: ServiceEditorPanelsProps) {
  const [active, setActive] = useState<string>(tabs[0]?.key || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalValues, setModalValues] = useState<Record<string, any>>({});
  const [localError, setLocalError] = useState<string | undefined>();
  const { canCreate, canEdit, canDelete } = usePermissions();

  const activeTab = tabs.find((t) => t.key === active);
  const rows = tabData[active] || [];

  const openCreate = () => {
    const tab = tabs.find((t) => t.key === active);
    if (!tab?.fields) return;
    const initial: Record<string, any> = {};
    tab.fields.forEach((field) => {
      if (field.type === 'toggle') initial[field.key] = false;
      else if (field.type === 'json') initial[field.key] = {};
      else initial[field.key] = '';
    });
    setModalMode('create');
    setSelectedRow(null);
    setModalValues(initial);
    setLocalError(undefined);
    setModalOpen(true);
  };

  const openEdit = (row: any) => {
    const tab = tabs.find((t) => t.key === active);
    if (!tab?.fields) return;
    const initial: Record<string, any> = {};
    tab.fields.forEach((field) => {
      initial[field.key] = row[field.key] ?? '';
    });
    setModalMode('edit');
    setSelectedRow(row);
    setModalValues(initial);
    setLocalError(undefined);
    setModalOpen(true);
  };

  const handleDelete = async (row: any) => {
    const tab = tabs.find((t) => t.key === active);
    if (!tab?.apiEndpoint || !tab?.rowIdField) return;
    const id = row[tab.rowIdField];
    if (!id) return;
    if (!confirm('Delete this record?')) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${tab.apiEndpoint}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || json.success === false) throw new Error(json.error || 'Delete failed');
      window.location.reload();
    } catch (err: any) {
      setLocalError(err?.message || 'Delete failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    const tab = tabs.find((t) => t.key === active);
    if (!tab?.apiEndpoint || !tab?.fields) return;
    setSubmitting(true);
    setLocalError(undefined);
    try {
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      const body = modalMode === 'create' ? modalValues : { ...modalValues, id: selectedRow?.id };
      const res = await fetch(tab.apiEndpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) throw new Error(json.error || 'Save failed');
      window.location.reload();
    } catch (err: any) {
      setLocalError(err?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="rounded border border-rose-500/40 bg-rose-500/10 p-3 text-[11px] font-mono text-rose-300">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded border border-[#27272A] bg-[#0c0c0f] p-4 text-[11px] font-mono text-[#71717A]">
        Loading project data…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div role="tablist" className="flex items-center gap-1 p-1 rounded-lg bg-[#09090B] border border-[#27272A]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              className={`px-2 py-1.5 rounded border text-[10px] font-mono ${
                active === tab.key
                  ? 'bg-[#3ECF8E]/15 border-[#3ECF8E]/40 text-[#3ECF8E]'
                  : 'bg-[#09090B] border-[#27272A] text-[#A1A1AA]'
              }`}
            >
              {tab.label}
              <span className="ml-1 opacity-70">{(tabData[tab.key] || []).length}</span>
            </button>
          ))}
        </div>
        {(activeTab?.fields && activeTab.apiEndpoint && canCreate) && (
          <button
            type="button"
            onClick={openCreate}
            className="px-2.5 py-1.5 rounded border border-[#3ECF8E]/40 bg-[#3ECF8E]/15 text-[10px] font-mono text-[#3ECF8E] hover:bg-[#3ECF8E]/25"
          >
            + New
          </button>
        )}
      </div>

      <div className="rounded border border-[#27272A] bg-[#0c0c0f]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] font-mono">
            <thead>
              <tr className="border-b border-[#27272A] text-[#71717A]">
                {activeTab?.columns.map((col) => (
                  <th key={col.key} className="px-3 py-2 font-medium">
                    {col.label}
                  </th>
                ))}
                {(activeTab?.fields && activeTab.apiEndpoint) && <th className="px-3 py-2 font-medium w-28">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="border-b border-[#27272A] last:border-b-0">
                  {activeTab?.columns.map((col) => (
                    <td key={col.key} className="px-3 py-2 text-[#FAFAFA]">
                      {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '-')}
                    </td>
                  ))}
                  {(activeTab?.fields && activeTab.apiEndpoint) && (
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            className="px-2 py-1 rounded border border-[#27272A] bg-[#09090B] text-[10px] font-mono text-[#A1A1AA] hover:text-white"
                          >
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDelete(row)}
                            disabled={submitting}
                            className="px-2 py-1 rounded border border-rose-500/40 bg-rose-500/10 text-[10px] font-mono text-rose-300 hover:bg-rose-500/20 disabled:opacity-60"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={activeTab?.columns.length || 1} className="px-3 py-4 text-center text-[#71717A]">
                    No records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeTab?.fields && activeTab.apiEndpoint && (
        <RecordModal
          open={modalOpen}
          title={modalMode === 'create' ? `Create ${activeTab.label.slice(0, -1)}` : `Edit ${activeTab.label.slice(0, -1)}`}
          mode={modalMode}
          fields={activeTab.fields}
          initialValues={modalValues}
          onChange={setModalValues}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
    </div>
  );
}
