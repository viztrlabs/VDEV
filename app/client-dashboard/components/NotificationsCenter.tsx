'use client';

import React from 'react';
import { Bell, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export default function NotificationsCenter() {
  const notifications = [
    {
      id: 'notif-1',
      title: 'Photometric Render Milestone Published',
      message: '4 new 8K architectural daylight renders have been uploaded for Apex Tower Atrium.',
      time: '15 mins ago',
      type: 'success',
      unread: true
    },
    {
      id: 'notif-2',
      title: 'Action Required: Lighting Phase Signoff',
      message: 'Your approval is requested to proceed with the final Unreal Engine Lumen animation bake.',
      time: '2 hours ago',
      type: 'action',
      unread: true
    },
    {
      id: 'notif-3',
      title: 'Cloud Pixel Streaming Node Provisioned',
      message: 'Dedicated NVIDIA RTX 4090 cloud GPU instance ready for your live WebXR interactive walkthrough.',
      time: 'Yesterday',
      type: 'info',
      unread: false
    }
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#3ECF8E]" />
            <span>Project Activity & Pipeline Notifications</span>
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Real-time cluster events, asset uploads, and director updates
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-xl border transition-all ${
              n.unread
                ? 'bg-[#18181B] border-[#3ECF8E]/40'
                : 'bg-[#18181B]/60 border-[#27272A]'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#09090B] border border-[#27272A] text-[#3ECF8E] shrink-0 mt-0.5">
                {n.type === 'action' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                ) : n.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Info className="w-4 h-4 text-sky-400" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{n.title}</h4>
                  <span className="text-[10px] font-mono text-[#71717A]">{n.time}</span>
                </div>
                <p className="text-xs text-[#A1A1AA] mt-1">{n.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
