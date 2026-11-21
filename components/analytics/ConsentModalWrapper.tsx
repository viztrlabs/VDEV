'use client';

import React, { useState, useEffect } from 'react';
import { ConsentModal } from './ConsentModal';

export default function ConsentModalWrapper() {
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('viztr_analytics_consent');
    if (stored) {
      setConsentGiven(stored === 'accepted');
      setModalOpen(false);
    } else {
      setModalOpen(true);
    }
  }, []);

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

  const toggleModal = () => setModalOpen(!modalOpen);

  return (
    <>
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <ConsentModal
          isOpen={modalOpen}
          setIsOpen={setModalOpen}
          onAccept={accept}
          onReject={reject}
          hasEssential={true}
        />
      )}
    </>
  );
}