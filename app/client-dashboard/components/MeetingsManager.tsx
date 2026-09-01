'use client';

import React from 'react';
import { Calendar, Video, Users, ExternalLink } from 'lucide-react';

export default function MeetingsManager() {
  const upcomingMeetings = [
    {
      id: 'mtg-1',
      title: 'Architectural Director Design Alignment Call',
      date: 'Tomorrow, Sep 02, 2026',
      time: '14:00 – 14:45 GMT',
      director: 'Liam Vance (Executive Creative Director)',
      meetLink: 'https://meet.google.com/viztr-arch-review',
      status: 'Confirmed'
    },
    {
      id: 'mtg-2',
      title: 'VR Spatial Configuration & Walkthrough Briefing',
      date: 'Friday, Sep 05, 2026',
      time: '16:30 – 17:15 GMT',
      director: 'Sara Lin (Realtime XR Lead)',
      meetLink: 'https://meet.google.com/viztr-xr-demo',
      status: 'Scheduled'
    }
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#3ECF8E]" />
            <span>Design Reviews & Director Meetings</span>
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Direct video synchronization calls with VizTR architectural directors
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {upcomingMeetings.map((m) => (
          <div key={m.id} className="p-4 sm:p-5 rounded-xl bg-[#18181B] border border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-[#09090B] border border-[#27272A] text-[#3ECF8E] shrink-0 mt-0.5">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white">{m.title}</h3>
                <div className="text-xs font-mono text-[#3ECF8E] mt-0.5 flex items-center gap-2">
                  <span>{m.date}</span>
                  <span>•</span>
                  <span>{m.time}</span>
                </div>
                <div className="text-[11px] text-[#A1A1AA] mt-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#71717A]" />
                  <span>With {m.director}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={m.meetLink}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Join Google Meet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
