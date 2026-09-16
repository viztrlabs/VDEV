/**
 * Analytics Event Tracking
 * 
 * Type-safe event tracking for Google Analytics and custom analytics.
 */

export interface TrackEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  [key: string]: unknown;
}

export function trackEvent(event: TrackEvent) {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Analytics]', event);
    return;
  }

  const { gtag } = window as any;
  if (!gtag) return;

  gtag('event', event.action, {
    event_category: event.category,
    event_label: event.label,
    value: event.value,
    ...event,
  });
}

export const AnalyticsEvents = {
  booking: {
    created: (serviceType: string) => trackEvent({
      category: 'Booking',
      action: 'booking_created',
      label: serviceType,
    }),
    approved: (bookingId: string) => trackEvent({
      category: 'Booking',
      action: 'booking_approved',
      label: bookingId,
    }),
    rejected: (bookingId: string, reason: string) => trackEvent({
      category: 'Booking',
      action: 'booking_rejected',
      label: bookingId,
      reason,
    }),
  },
  xr: {
    launched: (experienceType: string, projectId?: string) => trackEvent({
      category: 'XR Experience',
      action: 'xr_launched',
      label: experienceType,
      project_id: projectId,
    }),
    shared: (linkType: string) => trackEvent({
      category: 'XR Experience',
      action: 'xr_link_shared',
      label: linkType,
    }),
  },
  download: {
    started: (fileType: string, projectId?: string) => trackEvent({
      category: 'Download',
      action: 'download_started',
      label: fileType,
      project_id: projectId,
    }),
    completed: (fileType: string, projectId?: string) => trackEvent({
      category: 'Download',
      action: 'download_completed',
      label: fileType,
      project_id: projectId,
    }),
  },
  contact: {
    submitted: (serviceInterest?: string) => trackEvent({
      category: 'Contact',
      action: 'contact_form_submitted',
      label: serviceInterest || 'general',
    }),
  },
  navigation: {
    sectionViewed: (sectionName: string) => trackEvent({
      category: 'Navigation',
      action: 'section_viewed',
      label: sectionName,
    }),
  },
  error: {
    occurred: (errorMessage: string, fatal = false) => trackEvent({
      category: 'Error',
      action: 'error_occurred',
      label: errorMessage,
      fatal,
    }),
  },
};

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}
