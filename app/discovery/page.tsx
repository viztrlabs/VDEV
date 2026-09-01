'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Sparkles, Loader2 } from 'lucide-react';

/**
 * The discovery form has been moved into the Admin Dashboard at:
 *   /admin/dashboard?section=client-discovery&tab=intake-form
 *
 * This page now redirects visitors there. The original form UI lives in
 * `components/discovery/DiscoveryIntakeForm.tsx` and is also embedded in
 * the admin dashboard's ClientDiscoveryManager under the "Live Intake Form"
 * tab.
 */
function DiscoveryRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('section', 'client-discovery');
    params.set('tab', 'intake-form');
    const qs = searchParams.toString();
    const tail = qs ? `&${qs}` : '';
    router.replace(`/admin/dashboard?${params.toString()}${tail}`);
  }, [router, searchParams]);

  return (
    <main className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-5 p-8 rounded-2xl bg-[#18181B] border border-[#27272A]">
        <div className="w-14 h-14 rounded-2xl bg-[#3ECF8E]/20 text-[#3ECF8E] flex items-center justify-center mx-auto border border-[#3ECF8E]/40">
          <Sparkles className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white">Discovery form has moved</h1>
          <p className="text-xs text-[#A1A1AA]">
            The client discovery intake form is now embedded in the Admin Dashboard.
            You&apos;re being redirected there automatically.
          </p>
        </div>
        <Link
          href="/admin/dashboard?section=client-discovery&tab=intake-form"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-semibold text-xs"
        >
          <span>Go to Admin Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </main>
  );
}

function DiscoveryLoading() {
  return (
    <main className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-[#3ECF8E]" />
    </main>
  );
}

export default function DiscoveryRedirectPage() {
  return (
    <Suspense fallback={<DiscoveryLoading />}>
      <DiscoveryRedirectContent />
    </Suspense>
  );
}
