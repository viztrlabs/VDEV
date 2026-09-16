'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  Phone,
  Building2,
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
  Eye,
  X,
  ChevronDown,
  Archive,
  Reply,
  ExternalLink,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service_interest?: string;
  message?: string;
  status: 'new' | 'read' | 'responded' | 'archived';
  created_at: string;
  updated_at: string;
}

const CONTACT_STATUSES = ['new', 'read', 'responded', 'archived'] as const;
const SERVICE_INTERESTS = [
  'Architectural',
  'Virtual Reality',
  'Pixel Streaming',
  'WebXR',
  'WebAR',
  'Virtual Tour 360',
  'Animation',
  'Still Renders',
  'Other',
] as const;

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  new: { bg: 'bg-sky-950/40', text: 'text-sky-400', border: 'border-sky-800/40' },
  read: { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-800/40' },
  responded: { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-800/40' },
  archived: { bg: 'bg-zinc-800/40', text: 'text-zinc-400', border: 'border-zinc-700/40' },
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ContactManager() {
  const { showToast } = useAppStore();
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [replyDraft, setReplyDraft] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchInput) params.set('search', searchInput);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (serviceFilter !== 'all') params.set('service_interest', serviceFilter);
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);

      const res = await fetch(`/api/contact?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setContacts(data.data || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load contact submissions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/contact/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, status: status as any, updated_at: new Date().toISOString() } : c)));
        if (selectedContact?.id === id) {
          setSelectedContact({ ...selectedContact, status: status as any, updated_at: new Date().toISOString() });
        }
        showToast('Status updated', 'success');
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contact submission?')) return;
    try {
      const res = await fetch(`/api/contact/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setContacts((prev) => prev.filter((c) => c.id !== id));
        if (selectedContact?.id === id) {
          setSelectedContact(null);
          setShowDetail(false);
        }
        showToast('Submission deleted', 'success');
      }
    } catch (err) {
      showToast('Failed to delete', 'error');
    }
  };

  const handleReply = () => {
    if (!selectedContact) return;
    const subject = encodeURIComponent(`Re: Your VizTR inquiry - ${selectedContact.service_interest || 'General'}`);
    const body = encodeURIComponent(
      `Hi ${selectedContact.name},\n\nThank you for reaching out to VizTR Studio.\n\n${replyDraft || 'We will get back to you shortly.'}\n\nBest regards,\nVizTR Studio`
    );
    window.open(`mailto:${selectedContact.email}?subject=${subject}&body=${body}`, '_blank');
    showToast('Opening email client...', 'info');
    setReplyDraft('');
  };

  const filteredContacts = useMemo(() => {
    return contacts;
  }, [contacts]);

  const stats = useMemo(() => {
    const total = contacts.length;
    const byStatus: Record<string, number> = {};
    const byService: Record<string, number> = {};
    contacts.forEach((c) => {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      if (c.service_interest) {
        byService[c.service_interest] = (byService[c.service_interest] || 0) + 1;
      }
    });
    return { total, byStatus, byService };
  }, [contacts]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] font-bold uppercase">
            <Mail className="w-4 h-4" />
            <span>INBOX</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            Contact Submissions
          </h2>
          <p className="text-xs text-[#A1A1AA]">
            Client inquiries from the contact form. View details, update status, and reply directly.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchContacts}
          className="px-4 py-2.5 rounded-xl bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-xs font-mono text-white flex items-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'New', value: stats.byStatus.new || 0, color: 'text-sky-400' },
          { label: 'Read', value: stats.byStatus.read || 0, color: 'text-amber-400' },
          { label: 'Responded', value: stats.byStatus.responded || 0, color: 'text-emerald-400' },
          { label: 'Archived', value: stats.byStatus.archived || 0, color: 'text-zinc-400' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
            <div className="text-[10px] font-mono uppercase text-[#71717A] font-bold">{stat.label}</div>
            <div className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchContacts()}
              placeholder="Search by name, email, company, message..."
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white focus:outline-none focus:border-[#3ECF8E]"
            >
              <option value="all">All Statuses</option>
              {CONTACT_STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white focus:outline-none focus:border-[#3ECF8E]"
            >
              <option value="all">All Services</option>
              {SERVICE_INTERESTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white focus:outline-none focus:border-[#3ECF8E]"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white focus:outline-none focus:border-[#3ECF8E]"
            />
            <button
              type="button"
              onClick={fetchContacts}
              className="px-3 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Apply</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setStatusFilter('all');
                setServiceFilter('all');
                setDateFrom('');
                setDateTo('');
                fetchContacts();
              }}
              className="px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-[#A1A1AA] hover:text-white text-xs font-mono transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      {loading && contacts.length === 0 ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#3ECF8E]/30 border-t-[#3ECF8E] rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-[#71717A]">Loading submissions...</p>
          </div>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#18181B] border border-[#27272A] text-center">
          <Mail className="w-8 h-8 text-[#71717A] mx-auto mb-2" />
          <h4 className="text-sm font-bold text-white">No contact submissions found</h4>
          <p className="text-xs text-[#A1A1AA] mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className={`space-y-3 ${selectedContact && showDetail ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
            {filteredContacts.map((contact) => {
              const isSelected = selectedContact?.id === contact.id;
              const statusStyle = STATUS_STYLES[contact.status] || STATUS_STYLES.new;
              return (
                <div
                  key={contact.id}
                  onClick={() => {
                    setSelectedContact(contact);
                    setShowDetail(true);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-[#27272A] border-[#3ECF8E] shadow-md shadow-[#3ECF8E]/10'
                      : 'bg-[#18181B] border-[#27272A] hover:border-[#3f3f46]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#3ECF8E] font-bold">{contact.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                        {contact.status}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#71717A]">{formatDate(contact.created_at)}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{contact.name}</h4>
                    <div className="text-[11px] text-[#A1A1AA] mt-0.5">{contact.company || 'No company'}</div>
                    <div className="text-[10px] font-mono text-[#71717A] mt-0.5">{contact.email}</div>
                  </div>
                  {contact.service_interest && (
                    <div className="text-[10px] font-mono text-[#A1A1AA]">Service: {contact.service_interest}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Detail Panel */}
          {selectedContact && showDetail && (
            <div className="lg:col-span-2">
              <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#3ECF8E]">{selectedContact.id}</span>
                      <span className="text-[10px] font-mono text-[#71717A]">{formatDateTime(selectedContact.created_at)}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white font-serif mt-1">{selectedContact.name}</h3>
                    <p className="text-xs text-[#A1A1AA]">
                      {selectedContact.company || 'Independent'} • {selectedContact.email}
                      {selectedContact.phone && ` • ${selectedContact.phone}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={selectedContact.status}
                      onChange={(e) => handleStatusChange(selectedContact.id, e.target.value)}
                      className="px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white focus:outline-none focus:border-[#3ECF8E]"
                    >
                      {CONTACT_STATUSES.map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleReply}
                      className="px-3 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedContact.id)}
                      className="p-2 rounded-lg bg-[#09090B] hover:bg-rose-950/40 border border-[#27272A] text-[#A1A1AA] hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  {selectedContact.service_interest && (
                    <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2">
                      <div className="text-[10px] font-mono uppercase text-[#71717A] font-bold">Service Interest</div>
                      <div className="text-white font-medium">{selectedContact.service_interest}</div>
                    </div>
                  )}

                  {selectedContact.message && (
                    <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2">
                      <div className="text-[10px] font-mono uppercase text-[#71717A] font-bold">Message</div>
                      <div className="text-white text-xs leading-relaxed whitespace-pre-wrap">{selectedContact.message}</div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="text-[10px] font-mono uppercase text-[#71717A] font-bold">Quick Reply</div>
                    <textarea
                      value={replyDraft}
                      onChange={(e) => setReplyDraft(e.target.value)}
                      placeholder="Write a quick reply..."
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E] resize-none"
                    />
                    <button
                      type="button"
                      onClick={handleReply}
                      className="px-4 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Email Client
                    </button>
                  </div>

                  <div className="pt-3 border-t border-[#27272A] flex items-center justify-between text-[10px] font-mono text-[#71717A]">
                    <span>Updated: {formatDateTime(selectedContact.updated_at)}</span>
                    <span>ID: {selectedContact.id}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
