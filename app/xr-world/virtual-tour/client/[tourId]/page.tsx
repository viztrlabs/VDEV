'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Legacy /xr-world/virtual-tour/client/[tourId] -> /virtual-tour/[tourId]
export default function ClientSharePage() {
  const params = useParams();
  const router = useRouter();
  const tourId = Array.isArray(params.tourId) ? params.tourId[0] : params.tourId;
  useEffect(() => { if (tourId) router.replace(`/virtual-tour/${tourId}`); }, [tourId, router]);
  return <div className="min-h-screen bg-[#09090B] flex items-center justify-center"><div className="text-xs font-mono text-[#3ECF8E] animate-pulse">Redirecting…</div></div>;
}
