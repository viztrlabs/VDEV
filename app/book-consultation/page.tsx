'use client';

import React from 'react';
import BookingForm from '@/components/forms/BookingForm';
import { Calendar, Clock, Video, ShieldCheck, Sparkles } from 'lucide-react';

export default function BookConsultationPage() {
  return (
    <main className="flex-1 w-full pb-24">
      {/* HERO */}
      <section className="relative py-24 px-6 bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <span className="px-3.5 py-1 rounded-full bg-rose-600/30 border border-rose-500/40 text-rose-400 text-xs font-bold uppercase tracking-widest inline-block">
            Direct Director Strategy
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight font-display">
            Book an Architectural Consultation
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto">
            Schedule a dedicated 30-minute video session with our Senior Architectural & Spatial Directors to map out rendering scopes, WebXR links, or marketing milestones.
          </p>
        </div>
      </section>

      {/* FORM & VALUE PROPOSITION SPLIT */}
      <section className="py-16 px-6 max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* BOOKING FORM (7 COLS) */}
          <div className="lg:col-span-7 p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Live Video Consultation
              </span>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white font-display">
                Select Your Consultation Details
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                You will receive a Google Meet calendar invitation with architectural director assignment.
              </p>
            </div>

            <BookingForm />
          </div>

          {/* WHAT TO EXPECT (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-3xl bg-zinc-950 text-white border border-zinc-800 space-y-6 shadow-xl">
              <h3 className="text-lg font-bold font-display">What We Cover During the Call</h3>
              
              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 font-bold">1</div>
                  <div>
                    <div className="font-bold text-white">CAD / BIM Asset Assessment</div>
                    <p className="text-zinc-400 mt-0.5">We review your Rhino, Revit, SketchUp, or 3ds Max files to estimate model cleanup time.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 font-bold">2</div>
                  <div>
                    <div className="font-bold text-white">Camera Angles & Lighting Scenarios</div>
                    <p className="text-zinc-400 mt-0.5">Determine key Hero views, dramatic dusk atmosphere, and interior styling moodboards.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 font-bold">3</div>
                  <div>
                    <div className="font-bold text-white">XR & Interactive Deployment Strategy</div>
                    <p className="text-zinc-400 mt-0.5">Determine if your sales team will benefit from WebXR browser links, WebAR QR codes, or Pixel Streaming.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 font-bold">4</div>
                  <div>
                    <div className="font-bold text-white">Guaranteed Delivery Schedule</div>
                    <p className="text-zinc-400 mt-0.5">Lock in your 7-stage production schedule with access key for portal tracking.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 space-y-2">
              <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>NDA Protected Strategy</span>
              </div>
              <p>
                All unreleased architectural schemes, zoning drawings, and commercial terms discussed remain under strict confidentiality.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
