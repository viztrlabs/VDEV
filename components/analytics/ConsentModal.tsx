'use client';

import React, { useState, useEffect } from 'react';

type ConsentStatus = 'pending' | 'accepted' | 'rejected';

interface ConsentModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onAccept: () => void;
  onReject: () => void;
  hasEssential: boolean;
}

export function ConsentModal({ isOpen, setIsOpen, onAccept, onReject, hasEssential }: ConsentModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div
        className="bg-[#18181B] border border-[#27272A] rounded-xl p-8 max-w-md w-full mx-4 transform scale-95 opacity-0 transition-all duration-300 focus:scale-101 focus:opacity-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-display text-white">
            Analytics Tracking Consent
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg bg-[#27272A] hover:bg-[#374151] text-white hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-[#71717A] mb-6">
          We use Google Analytics 4 to understand how visitors interact with our website.
          This helps us improve our services and provide better content.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={true}
              disabled={hasEssential}
              className="rounded w-4 h-4 bg-[#27272A] border border-[#3F3F46] cursor-pointer accent-color:#3ECF8E"
            />
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#71717A]">Essential</div>
              <div className="text-sm font-medium text-white">Collect anonymized data to improve the website</div>
            </div>
          </label>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={true}
              disabled={hasEssential}
              className="rounded w-4 h-4 bg-[#27272A] border border-[#3F3F46] cursor-pointer accent-color:#3ECF8E"
            />
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#71717A]">Performance</div>
              <div className="text-sm font-medium text-white">Understand visitor behavior and page performance</div>
            </div>
          </label>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={() => {
              setIsOpen(false);
              onReject();
            }}
            className="flex-1 px-4 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-[10px] font-mono text-[#71717A] hover:text-white hover:bg-[#374151] transition-all"
          >
            Reject Analytics
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              onAccept();
            }}
            className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[10px] font-mono font-bold uppercase transition-all"
          >
            Accept Analytics
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to manage analytics consent
 */
export function useAnalyticsConsent() {
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // Check if consent was previously given
  useEffect(() => {
    const stored = localStorage.getItem('viztr_analytics_consent');
    if (stored) {
      setConsentGiven(stored === 'accepted');
    }
  }, []);

  // Show modal if no consent and page is loading
  useEffect(() => {
    if (!consentGiven && !modalOpen) {
      setModalOpen(true);
    }
  }, [consentGiven, modalOpen]);

  const toggleModal = () => setModalOpen(!modalOpen);

  const accept = () => {
    setConsentGiven(true);
    localStorage.setItem('viztr_analytics_consent', 'accepted');
    setModalOpen(false);
  };

  const reject = () => {
    setConsentGiven(false);
    localStorage.setItem('viztr_analytics_consent', 'rejected');
    setModalOpen(false);
  };

  return {
    consentGiven,
    modalOpen,
    toggleModal,
    accept,
    reject,
  };
}

/**
 * Component to conditionally load GA4 based on consent
 */
export function useGA4Loading(measurementId: string) {
  const { consentGiven } = useAnalyticsConsent();

  // Only load gtag.js if consent is given AND we're in production
  useEffect(() => {
    if (consentGiven && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      // Prevent duplicate loading
      if (window.dataLayer && window.dataLayer.push) {
        // Already initialized
        return;
      }

      // Load Google Tag Manager
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.async = true;
      document.head.appendChild(script);

      const initScript = document.createElement('script');
      initScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${measurementId}', {
          page_path: window.location.pathname,
          anonymize_ip: true,
        });
      `;
      document.head.appendChild(initScript);

      return () => {
        document.head.removeChild(script);
        document.head.removeChild(initScript);
      };
    }
  }, [consentGiven, measurementId]);

  return { consentGiven };
}