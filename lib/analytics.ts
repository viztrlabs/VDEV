'use client';

export interface AnalyticsEventProps {
  category?: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

/**
 * Universal Analytics Dispatcher for VizTR Platform
 * Tracks CTA clicks, form dispatches, XR sessions, model launches, and portfolio views.
 */
export function trackEvent(eventName: string, properties?: AnalyticsEventProps) {
  if (typeof window !== 'undefined') {
    console.log(`[VizTR Analytics Event]: ${eventName}`, properties || {});

    // Ready for Google Analytics 4 (gtag) or Plausible / PostHog
    if ((window as any).gtag) {
      (window as any).gtag('event', eventName, properties);
    }
  }
}
