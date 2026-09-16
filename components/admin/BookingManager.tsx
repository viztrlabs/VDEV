'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  X,
  Mail,
  Phone,
  Building2,
  MessageSquare,
  Globe,
  Clock3,
} from 'lucide-react';
import { useBookingStore } from '@/lib/booking-store';
import { useAppStore } from '@/lib/store';
import type { Booking, BookingStatus, BookingServiceType } from '@/lib/super-admin-store-types';

const BOOKING_SERVICE_TYPES: BookingServiceType[] = [
  'Architectural',
  'Virtual Reality',
  'Pixel Streaming',
  'WebXR',
  'WebAR',
  'Virtual Tour 360',
  'Animation',
  'Still Renders',
  'Other',
];

const BOOKING_STATUSES: BookingStatus[] = [
  'pending',
  'approved',
  'rejected',
  'completed',
  'cancelled',
];

const STATUS_STYLES: Record<BookingStatus, { bg: string; text: string; border: string }> = {
  pending: { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-800/40' },
  approved: { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-800/40' },
  rejected: { bg: 'bg-rose-950/40', text: 'text-rose-400', border: 'border-rose-800/40' },
  completed: { bg: 'bg-sky-950/40', text: 'text-sky-400', border: 'border-sky-800/40' },
  cancelled: { bg: 'bg-zinc-800/40', text: 'text-zinc-400', border: 'border-zinc-700/40' },
};

const TIMEZONE_OPTIONS = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Australia/Sydney',
];

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

export default function BookingManager() {
  const { showToast } = useAppStore();
  const {
    bookings,
    selectedBooking,
    bookingsLoading,
    bookingsError,
    bookingsStats,
    filters,
    fetchBookings,
    fetchBookingById,
    createBooking,
    updateBooking,
    deleteBooking,
    approveBooking,
    rejectBooking,
    fetchStats,
    setFilters,
    setSelectedBooking,
    clearError,
    initialize,
  } = useBookingStore();

  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<BookingServiceType | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [rejectingBooking, setRejectingBooking] = useState<Booking | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [sortField, setSortField] = useState<'created_at' | 'preferred_date' | 'client_name'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const applyFilters = () => {
    const newFilters: Parameters<typeof fetchBookings>[0] = {
      search: searchInput || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      service_type: serviceTypeFilter === 'all' ? undefined : serviceTypeFilter,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    };
    setFilters(newFilters);
    fetchBookings(newFilters, { page: 1, pageSize: 20 });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setStatusFilter('all');
    setServiceTypeFilter('all');
    setDateFrom('');
    setDateTo('');
    setFilters({});
    fetchBookings({}, { page: 1, pageSize: 20 });
  };

  const handleSelectBooking = async (booking: Booking) => {
    setSelectedBooking(booking);
    await fetchBookingById(booking.id);
  };

  const handleCreate = async (data: {
    service_type: string;
    client_name: string;
    client_email: string;
    client_phone?: string;
    company?: string;
    project_description?: string;
    preferred_date: string;
    preferred_time: string;
    timezone: string;
    message?: string;
  }) => {
    try {
      await createBooking(data);
      setShowCreateModal(false);
      showToast('Booking created successfully', 'success');
      fetchStats();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to create booking', 'error');
    }
  };

  const handleUpdate = async (id: string, data: Partial<Booking>) => {
    try {
      await updateBooking(id, data as any);
      setEditingBooking(null);
      showToast('Booking updated successfully', 'success');
      fetchStats();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to update booking', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    try {
      await deleteBooking(id);
      if (selectedBooking?.id === id) setSelectedBooking(null);
      showToast('Booking deleted', 'success');
      fetchStats();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to delete booking', 'error');
    }
  };

  const handleApprove = async (id: string, notes?: string) => {
    try {
      await approveBooking(id, notes);
      showToast('Booking approved', 'success');
      fetchStats();
      if (selectedBooking?.id === id) {
        await fetchBookingById(id);
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to approve booking', 'error');
    }
  };

  const handleReject = async () => {
    if (!rejectingBooking) return;
    if (!rejectionReason.trim()) {
      showToast('Rejection reason is required', 'error');
      return;
    }
    try {
      await rejectBooking(rejectingBooking.id, rejectionReason, adminNotes);
      setRejectingBooking(null);
      setRejectionReason('');
      setAdminNotes('');
      showToast('Booking rejected', 'success');
      fetchStats();
      if (selectedBooking?.id === rejectingBooking.id) {
        await fetchBookingById(rejectingBooking.id);
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to reject booking', 'error');
    }
  };

  const sortedBookings = useMemo(() => {
    const list = [...bookings];
    list.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';
      if (sortField === 'created_at') {
        aVal = a.created_at;
        bVal = b.created_at;
      } else if (sortField === 'preferred_date') {
        aVal = a.preferred_date + a.preferred_time;
        bVal = b.preferred_date + b.preferred_time;
      } else if (sortField === 'client_name') {
        aVal = a.client_name.toLowerCase();
        bVal = b.client_name.toLowerCase();
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [bookings, sortField, sortDir]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const stats = bookingsStats || { total: 0, by_status: {} as Record<BookingStatus, number>, by_service_type: {} as Record<BookingServiceType, number> };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] font-bold uppercase">
            <Calendar className="w-4 h-4" />
            <span>MEETINGS & BOOKINGS</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            All Bookings
          </h2>
          <p className="text-xs text-[#A1A1AA]">
            Manage client consultation requests, approve or reject appointments, and track booking status across all service types.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-semibold text-xs flex items-center gap-2 transition-all shadow-lg shadow-[#3ECF8E]/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Booking</span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Pending', value: stats.by_status.pending || 0, color: 'text-amber-400' },
          { label: 'Approved', value: stats.by_status.approved || 0, color: 'text-emerald-400' },
          { label: 'Rejected', value: stats.by_status.rejected || 0, color: 'text-rose-400' },
          { label: 'Completed', value: stats.by_status.completed || 0, color: 'text-sky-400' },
          { label: 'Cancelled', value: stats.by_status.cancelled || 0, color: 'text-zinc-400' },
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
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              placeholder="Search by client name, email, company..."
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
              className="px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white focus:outline-none focus:border-[#3ECF8E]"
            >
              <option value="all">All Statuses</option>
              {BOOKING_STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <select
              value={serviceTypeFilter}
              onChange={(e) => setServiceTypeFilter(e.target.value as BookingServiceType | 'all')}
              className="px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white focus:outline-none focus:border-[#3ECF8E]"
            >
              <option value="all">All Services</option>
              {BOOKING_SERVICE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white focus:outline-none focus:border-[#3ECF8E]"
              placeholder="From"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white focus:outline-none focus:border-[#3ECF8E]"
              placeholder="To"
            />
            <button
              type="button"
              onClick={applyFilters}
              className="px-3 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Apply</span>
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-[#A1A1AA] hover:text-white text-xs font-mono transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {bookingsError && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs font-mono text-rose-400 flex items-center justify-between">
          <span>{bookingsError}</span>
          <button onClick={clearError} className="text-[#A1A1AA] hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bookings List + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings List */}
        <div className={`space-y-3 ${selectedBooking ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
          {bookingsLoading && bookings.length === 0 ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 border-4 border-[#3ECF8E]/30 border-t-[#3ECF8E] rounded-full animate-spin mx-auto" />
                <p className="text-xs font-mono text-[#71717A]">Loading bookings...</p>
              </div>
            </div>
          ) : sortedBookings.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#18181B] border border-[#27272A] text-center">
              <Calendar className="w-8 h-8 text-[#71717A] mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">No bookings found</h4>
              <p className="text-xs text-[#A1A1AA] mt-1">Try adjusting your filters or create a new booking.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedBookings.map((booking) => {
                const isSelected = selectedBooking?.id === booking.id;
                const statusStyle = STATUS_STYLES[booking.status];
                return (
                  <div
                    key={booking.id}
                    onClick={() => handleSelectBooking(booking)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? 'bg-[#27272A] border-[#3ECF8E] shadow-md shadow-[#3ECF8E]/10'
                        : 'bg-[#18181B] border-[#27272A] hover:border-[#3f3f46]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#3ECF8E] font-bold">
                          {booking.id}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          {booking.status.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#71717A]">
                        {formatDate(booking.created_at)}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white">{booking.client_name}</h4>
                      <div className="text-[11px] text-[#A1A1AA] mt-0.5">{booking.company || 'No company'}</div>
                      <div className="text-[10px] font-mono text-[#71717A] mt-0.5">{booking.client_email}</div>
                    </div>

                    <div className="pt-2 border-t border-[#27272A] flex items-center justify-between text-[10px] font-mono text-[#71717A]">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {booking.service_type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock3 className="w-3 h-3" />
                        {booking.preferred_date} {booking.preferred_time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedBooking && (
          <div className="lg:col-span-2">
            <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#3ECF8E]">
                      {selectedBooking.id}
                    </span>
                    <span className="text-[10px] font-mono text-[#71717A]">
                      Created: {formatDateTime(selectedBooking.created_at)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white font-serif mt-1">
                    {selectedBooking.client_name}
                  </h3>
                  <p className="text-xs text-[#A1A1AA]">
                    {selectedBooking.company || 'Independent Client'} • {selectedBooking.client_email}
                    {selectedBooking.client_phone && ` • ${selectedBooking.client_phone}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {selectedBooking.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApprove(selectedBooking.id, adminNotes)}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectingBooking(selectedBooking)}
                        className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditingBooking(selectedBooking)}
                    className="px-3 py-2 rounded-xl bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedBooking.id)}
                    className="p-2 rounded-lg bg-[#09090B] hover:bg-rose-950/40 border border-[#27272A] text-[#A1A1AA] hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete booking"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedBooking(null)}
                    className="p-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2">
                    <div className="text-[10px] font-mono uppercase text-[#71717A] font-bold">Service Type</div>
                    <div className="text-white font-medium flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-[#3ECF8E]" />
                      {selectedBooking.service_type}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2">
                    <div className="text-[10px] font-mono uppercase text-[#71717A] font-bold">Status</div>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase border ${STATUS_STYLES[selectedBooking.status].bg} ${STATUS_STYLES[selectedBooking.status].text} ${STATUS_STYLES[selectedBooking.status].border}`}>
                      {selectedBooking.status.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2">
                    <div className="text-[10px] font-mono uppercase text-[#71717A] font-bold">Preferred Date & Time</div>
                    <div className="text-white font-medium flex items-center gap-2">
                      <Clock3 className="w-3.5 h-3.5 text-[#3ECF8E]" />
                      {selectedBooking.preferred_date} at {selectedBooking.preferred_time}
                    </div>
                    <div className="text-[11px] text-[#A1A1AA] flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {selectedBooking.timezone}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2">
                    <div className="text-[10px] font-mono uppercase text-[#71717A] font-bold">Contact</div>
                    <div className="text-white font-medium flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#3ECF8E]" />
                      {selectedBooking.client_email}
                    </div>
                    {selectedBooking.client_phone && (
                      <div className="text-[11px] text-[#A1A1AA] flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {selectedBooking.client_phone}
                      </div>
                    )}
                    {selectedBooking.company && (
                      <div className="text-[11px] text-[#A1A1AA] flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {selectedBooking.company}
                      </div>
                    )}
                  </div>
                </div>

                {selectedBooking.project_description && (
                  <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2">
                    <div className="text-[10px] font-mono uppercase text-[#71717A] font-bold">Project Description</div>
                    <div className="text-white text-xs leading-relaxed">{selectedBooking.project_description}</div>
                  </div>
                )}

                {selectedBooking.message && (
                  <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2">
                    <div className="text-[10px] font-mono uppercase text-[#71717A] font-bold">Client Message</div>
                    <div className="text-white text-xs leading-relaxed flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-[#3ECF8E] mt-0.5 shrink-0" />
                      {selectedBooking.message}
                    </div>
                  </div>
                )}

                {selectedBooking.admin_notes && (
                  <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2">
                    <div className="text-[10px] font-mono uppercase text-[#71717A] font-bold">Admin Notes</div>
                    <div className="text-white text-xs leading-relaxed">{selectedBooking.admin_notes}</div>
                  </div>
                )}

                {selectedBooking.rejection_reason && (
                  <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/30 space-y-2">
                    <div className="text-[10px] font-mono uppercase text-rose-400 font-bold">Rejection Reason</div>
                    <div className="text-rose-200 text-xs leading-relaxed">{selectedBooking.rejection_reason}</div>
                  </div>
                )}

                <div className="pt-3 border-t border-[#27272A] flex items-center justify-between text-[10px] font-mono text-[#71717A]">
                  <span>Updated: {formatDateTime(selectedBooking.updated_at)}</span>
                  <span>ID: {selectedBooking.id}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Booking Modal */}
      {showCreateModal && (
        <BookingFormModal
          title="Create New Booking"
          onSubmit={handleCreate}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Booking Modal */}
      {editingBooking && (
        <BookingFormModal
          title="Edit Booking"
          initialData={editingBooking}
          onSubmit={(data) => handleUpdate(editingBooking.id, data as any)}
          onClose={() => setEditingBooking(null)}
        />
      )}

      {/* Reject Booking Modal */}
      {rejectingBooking && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white font-display">Reject Booking</h3>
              <button onClick={() => setRejectingBooking(null)} className="text-[#A1A1AA] hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#A1A1AA]">
              Rejecting booking for <strong className="text-white">{rejectingBooking.client_name}</strong>.
            </p>
            <div className="space-y-2">
              <label className="block text-xs font-mono text-[#A1A1AA]">Rejection Reason *</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this booking..."
                rows={4}
                className="w-full px-3 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E] resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-mono text-[#A1A1AA]">Admin Notes (optional)</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes..."
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E] resize-none"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleReject}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                Confirm Rejection
              </button>
              <button
                type="button"
                onClick={() => { setRejectingBooking(null); setRejectionReason(''); setAdminNotes(''); }}
                className="px-4 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-[#A1A1AA] hover:text-white text-xs font-mono transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// Booking Form Modal (Create / Edit)
// =====================================================================

interface BookingFormModalProps {
  title: string;
  initialData?: Booking | null;
  onSubmit: (data: {
    service_type: string;
    client_name: string;
    client_email: string;
    client_phone?: string;
    company?: string;
    project_description?: string;
    preferred_date: string;
    preferred_time: string;
    timezone: string;
    message?: string;
  }) => Promise<void>;
  onClose: () => void;
}

function BookingFormModal({ title, initialData, onSubmit, onClose }: BookingFormModalProps) {
  const [serviceType, setServiceType] = useState(initialData?.service_type || 'Architectural');
  const [clientName, setClientName] = useState(initialData?.client_name || '');
  const [clientEmail, setClientEmail] = useState(initialData?.client_email || '');
  const [clientPhone, setClientPhone] = useState(initialData?.client_phone || '');
  const [company, setCompany] = useState(initialData?.company || '');
  const [projectDescription, setProjectDescription] = useState(initialData?.project_description || '');
  const [preferredDate, setPreferredDate] = useState(initialData?.preferred_date || '');
  const [preferredTime, setPreferredTime] = useState(initialData?.preferred_time || '');
  const [timezone, setTimezone] = useState(initialData?.timezone || 'UTC');
  const [message, setMessage] = useState(initialData?.message || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        service_type: serviceType,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone || undefined,
        company: company || undefined,
        project_description: projectDescription || undefined,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        timezone,
        message: message || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white font-display">{title}</h3>
          <button onClick={onClose} className="text-[#A1A1AA] hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-[#A1A1AA]">Service Type *</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as BookingServiceType)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#3ECF8E]"
              >
                {BOOKING_SERVICE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-[#A1A1AA]">Timezone *</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#3ECF8E]"
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-[#A1A1AA]">Client Name *</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
              placeholder="Full name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-[#A1A1AA]">Client Email *</label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
              placeholder="client@example.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-[#A1A1AA]">Phone</label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
                placeholder="+1 555 0123"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-[#A1A1AA]">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
                placeholder="Acme Inc."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-[#A1A1AA]">Preferred Date *</label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-[#A1A1AA]">Preferred Time *</label>
              <input
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-[#A1A1AA]">Project Description</label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E] resize-none"
              placeholder="Brief description of the project..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-[#A1A1AA]">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E] resize-none"
              placeholder="Additional message from client..."
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] disabled:opacity-40 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {saving ? 'Saving...' : initialData ? 'Update Booking' : 'Create Booking'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-[#A1A1AA] hover:text-white text-xs font-mono transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
