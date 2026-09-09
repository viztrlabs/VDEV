'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Sparkles } from 'lucide-react';

export default function ForgotPasswordPage() {
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
          <h1 className="text-3xl font-bold font-display mb-2">Forgot Password</h1>
          <p className="text-zinc-400">Enter your email to receive a password reset link.</p>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
              <Mail className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Check Your Email</h2>
            <p className="text-zinc-400 mb-6">Password reset instructions sent to {email}</p>
            <Link href="/app/login" className="text-cyan-400 hover:underline">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
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
              Send Reset Link
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="text-center pt-4">
              <Link href="/app/login" className="text-sm text-zinc-400 hover:text-white">
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
