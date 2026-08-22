'use client';

import React from 'react';
import ContactForm from '@/components/forms/ContactForm';
import { Mail, Phone, MapPin, Clock, ShieldCheck, Sparkles } from 'lucide-react';

export default function ContactPage() {
  return (
    <main className="flex-1 w-full pb-24">
      {/* HERO */}
      <section className="relative py-24 px-6 bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <span className="px-3.5 py-1 rounded-full bg-rose-600/30 border border-rose-500/40 text-rose-400 text-xs font-bold uppercase tracking-widest inline-block">
            Inquiries & Commissions
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight font-display">
            Start Your Architectural Project
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto">
            Directly connect with our visual directors and spatial engineers to receive an itemized proposal, timeline, and milestone schedule within 24 hours.
          </p>
        </div>
      </section>

      {/* FORM & LOCATIONS SPLIT */}
      <section className="py-16 px-6 max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* CONTACT FORM CONTAINER (7 Cols) */}
          <div className="lg:col-span-7 p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Architectural Brief Submission
              </span>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white font-display">
                Tell Us About Your Development
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                All uploaded files and preliminary project data are strictly protected under mutual NDA.
              </p>
            </div>

            <ContactForm initialService="Exterior Visualization" />
          </div>

          {/* STUDIO CONTACT DETAILS & GLOBAL HUBS (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-3xl bg-zinc-950 text-white border border-zinc-800 space-y-6 shadow-xl">
              <h3 className="text-lg font-bold font-display">Direct Communications</h3>
              
              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3.5">
                  <Mail className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-zinc-400 font-bold uppercase text-[10px]">Client Inquiries</div>
                    <a href="mailto:hello@viztr.studio" className="text-white hover:text-rose-400 transition-colors font-medium">
                      hello@viztr.studio
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Phone className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-zinc-400 font-bold uppercase text-[10px]">Direct Studio Line</div>
                    <span className="text-white font-medium">+1 (212) 555-0198 / +44 20 7946 0912</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Clock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-zinc-400 font-bold uppercase text-[10px]">Production Hours</div>
                    <span className="text-white font-medium">24/5 Worldwide Cloud Production Pipeline</span>
                  </div>
                </div>
              </div>
            </div>

            {/* GLOBAL OFFICES CARD */}
            <div className="p-8 rounded-3xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-lg">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white font-display">
                Studio Office Locations
              </h3>

              <div className="space-y-4 text-xs divide-y divide-zinc-100 dark:divide-zinc-800/80">
                <div className="pt-2 first:pt-0">
                  <div className="font-bold text-zinc-900 dark:text-white">New York (Americas)</div>
                  <p className="text-zinc-500 dark:text-zinc-400">450 Lexington Ave, 32nd Floor, New York, NY 10017</p>
                </div>

                <div className="pt-3">
                  <div className="font-bold text-zinc-900 dark:text-white">London (Europe HQ)</div>
                  <p className="text-zinc-500 dark:text-zinc-400">22 Bishopsgate, Level 18, London EC2N 4BQ</p>
                </div>

                <div className="pt-3">
                  <div className="font-bold text-zinc-900 dark:text-white">Dubai (Middle East)</div>
                  <p className="text-zinc-500 dark:text-zinc-400">DIFC Gate Precinct Building 4, Dubai, UAE</p>
                </div>

                <div className="pt-3">
                  <div className="font-bold text-zinc-900 dark:text-white">Tokyo (XR Lab)</div>
                  <p className="text-zinc-500 dark:text-zinc-400">Roppongi Hills Mori Tower 24F, Minato-ku, Tokyo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
