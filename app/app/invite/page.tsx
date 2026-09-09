'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Mail, ArrowRight, Sparkles, Check } from 'lucide-react';

export default function InvitePage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center pt-20">
      <div className="max-w-md w-full mx-auto px-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <span className="text-xl font-bold">VizTR</span>
          </div>
          <h1 className="text-3xl font-bold font-display mb-2">Accept Invitation</h1>
          <p className="text-zinc-400">You have been invited to join VizTR Studio. Enter your details to get started.</p>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Invitation Accepted</h2>
            <p className="text-zinc-400 mb-6">Your account has been created successfully.</p>
            <Link
              href="/app/user"
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              Accept Invitation
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="text-center pt-4">
              <Link href="/" className="text-sm text-zinc-400 hover:text-white">
                Back to home
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
