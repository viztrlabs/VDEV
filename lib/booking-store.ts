/**
 * Booking Store - Zustand store for booking management
 * 
 * Frontend state management for booking operations.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Booking,
  BookingStatus,
  BookingServiceType,
  BookingFilters,
  BookingStats,
  PaginationParams,
  PaginatedResult,
  CreateBooking,
  UpdateBooking,
  ApproveBooking,
  RejectBooking,
} from '@/lib/super-admin-store-types';

import { adminApi } from '@/lib/api/contracts';

export interface BookingState {
  // Repository (non-persisted)
  _initialized: boolean;

  // Bookings
  bookings: Booking[];
  selectedBooking: Booking | null;
  bookingsLoading: boolean;
  bookingsError: string | null;
  bookingsStats: BookingStats | null;
  bookingsPagination: PaginatedResult<Booking> | null;
  
  // Filters
  filters: BookingFilters;
  
  // Actions
  fetchBookings: (filters?: BookingFilters, pagination?: { page: number; pageSize: number }) => Promise<void>;
  fetchBookingById: (id: string) => Promise<void>;
  createBooking: (booking: { service_type: string; client_name: string; client_email: string; client_phone?: string; company?: string; project_description?: string; preferred_date: string; preferred_time: string; timezone?: string; message?: string }) => Promise<void>;
  updateBooking: (id: string, updates: Partial<{ service_type: string; client_name: string; client_email: string; client_phone?: string; company?: string; project_description?: string; preferred_date: string; preferred_time: string; timezone?: string; message?: string; status: string }>) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  approveBooking: (id: string, admin_notes?: string) => Promise<void>;
  rejectBooking: (id: string, rejection_reason: string, admin_notes?: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  setFilters: (filters: BookingFilters) => void;
  setSelectedBooking: (booking: Booking | null) => void;
  clearError: () => void;
  
  // Initialization
  initialize: () => Promise<void>;
}

const INITIAL_FILTERS: BookingFilters = {
  search: '',
  status: 'pending',
  service_type: undefined,
  date_from: undefined,
  date_to: undefined,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      _initialized: false,

      // Initial state
      bookings: [],
      selectedBooking: null,
      bookingsLoading: false,
      bookingsError: null,
      bookingsStats: null,
      bookingsPagination: null,
      filters: INITIAL_FILTERS,

      // Initialize
      initialize: async () => {
        if (get()._initialized) return;
        
        try {
          await get().fetchBookings();
          await get().fetchStats();
          set({ _initialized: true });
        } catch (error) {
          console.error('Failed to initialize booking store:', error);
        }
      },

      // Fetch bookings with filters and pagination
      fetchBookings: async (filters?: BookingFilters, pagination?: { page: number; pageSize: number }) => {
        set({ bookingsLoading: true, bookingsError: null });
        try {
          const filtersToUse = filters || get().filters;
          const paginationParams = pagination || { page: 1, pageSize: 20 };
          
          const result = await adminApi.bookings.list(
            { 
              search: filtersToUse.search,
              status: filtersToUse.status,
              service_type: filtersToUse.service_type,
              date_from: filtersToUse.date_from,
              date_to: filtersToUse.date_to,
              page: paginationParams.page,
              page_size: paginationParams.pageSize,
            }
          );

          // Handle the response format from our API
          const data = result.data || result;
          
          set({ 
            bookings: data.data || [],
            bookingsPagination: {
              data: data.data || [],
              total: data.total || 0,
              page: data.page || 1,
              pageSize: data.pageSize || 20,
              totalPages: data.totalPages || 1,
            },
            bookingsLoading: false,
            bookingsError: null,
          });
          
          if (filters) {
            set({ filters: filtersToUse });
          }
        } catch (error) {
          set({ 
            bookingsLoading: false, 
            bookingsError: error instanceof Error ? error.message : 'Failed to fetch bookings' 
          });
        }
      },

      // Fetch single booking by ID
      fetchBookingById: async (id: string) => {
        set({ bookingsLoading: true, bookingsError: null });
        try {
          const booking = await adminApi.bookings.get(id);
          set({ selectedBooking: booking.data, bookingsLoading: false });
        } catch (error) {
          set({ 
            bookingsLoading: false, 
            bookingsError: error instanceof Error ? error.message : 'Failed to fetch booking' 
          });
        }
      },

      // Create new booking
      createBooking: async (bookingData) => {
        set({ bookingsLoading: true, bookingsError: null });
        try {
          const result = await adminApi.bookings.create(bookingData);
          const newBooking = result.data;
          
          set(state => ({
            bookings: [newBooking, ...state.bookings],
            bookingsLoading: false,
            bookingsError: null,
          }));
        } catch (error) {
          set({ 
            bookingsLoading: false, 
            bookingsError: error instanceof Error ? error.message : 'Failed to create booking' 
          });
          throw error;
        }
      },

      // Update booking
      updateBooking: async (id, updates) => {
        set({ bookingsLoading: true, bookingsError: null });
        try {
          const updated = await adminApi.bookings.update(id, updates);
          
          set(state => ({
            bookings: state.bookings.map(b => b.id === id ? updated.data : b),
            selectedBooking: state.selectedBooking?.id === id ? updated.data : state.selectedBooking,
            bookingsLoading: false,
            bookingsError: null,
          }));
        } catch (error) {
          set({ 
            bookingsLoading: false, 
            bookingsError: error instanceof Error ? error.message : 'Failed to update booking' 
          });
          throw error;
        }
      },

      // Delete booking
      deleteBooking: async (id: string) => {
        set({ bookingsLoading: true, bookingsError: null });
        try {
          await adminApi.bookings.delete(id);
          
          set(state => ({
            bookings: state.bookings.filter(b => b.id !== id),
            selectedBooking: state.selectedBooking?.id === id ? null : state.selectedBooking,
            bookingsLoading: false,
            bookingsError: null,
          }));
        } catch (error) {
          set({ 
            bookingsLoading: false, 
            bookingsError: error instanceof Error ? error.message : 'Failed to delete booking' 
          });
          throw error;
        }
      },

      // Approve booking
      approveBooking: async (id: string, admin_notes?: string) => {
        set({ bookingsLoading: true, bookingsError: null });
        try {
          const updated = await adminApi.bookings.approve(id, admin_notes);
          
          set(state => ({
            bookings: state.bookings.map(b => b.id === id ? updated.data : b),
            selectedBooking: state.selectedBooking?.id === id ? updated.data : state.selectedBooking,
            bookingsLoading: false,
            bookingsError: null,
          }));
        } catch (error) {
          set({ 
            bookingsLoading: false, 
            bookingsError: error instanceof Error ? error.message : 'Failed to approve booking' 
          });
          throw error;
        }
      },

      // Reject booking
      rejectBooking: async (id: string, rejection_reason: string, admin_notes?: string) => {
        set({ bookingsLoading: true, bookingsError: null });
        try {
          const updated = await adminApi.bookings.reject(id, rejection_reason, admin_notes);
          
          set(state => ({
            bookings: state.bookings.map(b => b.id === id ? updated.data : b),
            selectedBooking: state.selectedBooking?.id === id ? updated.data : state.selectedBooking,
            bookingsLoading: false,
            bookingsError: null,
          }));
        } catch (error) {
          set({ 
            bookingsLoading: false, 
            bookingsError: error instanceof Error ? error.message : 'Failed to reject booking' 
          });
          throw error;
        }
      },

      // Fetch stats
      fetchStats: async () => {
        try {
          const stats = await adminApi.bookings.getStats();
          set({ bookingsStats: stats.data });
        } catch (error) {
          console.error('Failed to fetch booking stats:', error);
        }
      },

      // Set filters
      setFilters: (filters: BookingFilters) => {
        set({ filters });
      },

      // Set selected booking
      setSelectedBooking: (booking) => {
        set({ selectedBooking: booking });
      },

      // Clear error
      clearError: () => {
        set({ bookingsError: null });
      },
    }),
    {
      name: 'viztr-booking-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist filters and UI state
        filters: state.filters,
      }),
    }
  )
);

// Export types for convenience
export type { Booking, BookingStatus, BookingServiceType, BookingFilters, BookingStats } from '@/lib/super-admin-store-types';