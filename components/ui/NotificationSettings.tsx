'use client';

import React, { useEffect, useSyncExternalStore } from 'react';
import { useAppStore } from '@/lib/store';
import {
  Bell,
  BellRing,
  BellOff,
  Volume2,
  VolumeX,
  FileCheck2,
  GitCommit,
  CheckCircle2,
  AlertTriangle,
  Play,
  Settings,
  ShieldAlert,
  Sparkles,
  Info
} from 'lucide-react';
import { playNotificationChime } from '@/lib/notifications';

const emptySubscribe = () => () => {};
const useMounted = () => useSyncExternalStore(emptySubscribe, () => true, () => false);

interface NotificationSettingsProps {
  compact?: boolean;
  className?: string;
}

export default function NotificationSettings({ compact = false, className = '' }: NotificationSettingsProps) {
  const isMounted = useMounted();
  const {
    desktopNotificationsEnabled,
    soundAlertsEnabled,
    notifyStatusChanges,
    notifyMilestoneReady,
    notificationPermission,
    toggleDesktopNotifications,
    setDesktopNotifications,
    setSoundAlerts,
    setNotifyStatusChanges,
    setNotifyMilestoneReady,
    checkNotificationPermission,
    dispatchAlert,
    showToast,
  } = useAppStore();

  useEffect(() => {
    if (isMounted) {
      checkNotificationPermission();
    }
  }, [isMounted, checkNotificationPermission]);

  if (!isMounted) {
    return (
      <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] animate-pulse h-48" />
    );
  }

  const handleTestStatusChange = () => {
    dispatchAlert({
      title: 'Project Status Updated',
      message: 'The Apex Tower (VIZTR-882) advanced to Stage 6: Final 8K Lighting Review.',
      type: 'status_change',
      projectId: 'VIZTR-882',
      projectName: 'The Apex Tower',
      actionUrl: '/client-dashboard',
    });
  };

  const handleTestMilestoneReady = () => {
    dispatchAlert({
      title: 'New Milestone Deliverable Ready',
      message: 'Master 8K Photorealistic Exterior Render (TIFF 240 MB) is ready for download.',
      type: 'milestone_ready',
      projectId: 'VIZTR-882',
      projectName: 'The Apex Tower',
      actionUrl: '/client-dashboard',
    });
  };

  const handleSoundTest = () => {
    playNotificationChime('success');
    showToast('Auditory chime test triggered.', 'info');
  };

  return (
    <div
      id="desktop-notifications-settings"
      className={`rounded-2xl bg-[#18181B] border border-[#27272A] overflow-hidden transition-all ${className}`}
    >
      {/* HEADER */}
      <div className="p-5 border-b border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#18181B]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center justify-center text-[#3ECF8E]">
            {desktopNotificationsEnabled ? <BellRing className="w-5 h-5" /> : <BellOff className="w-5 h-5 text-[#71717A]" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-display text-white">
                Real-Time Desktop & Milestone Alerts
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#09090B] border border-[#27272A] text-[#3ECF8E]">
                Live Webhooks
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA]">
              Receive instant desktop notifications for project pipeline milestones and master file deliverables.
            </p>
          </div>
        </div>

        {/* BROWSER PERMISSION STATUS BADGE */}
        <div className="flex items-center gap-2">
          {notificationPermission === 'granted' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-[11px] font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Browser Access Active</span>
            </span>
          )}
          {notificationPermission === 'denied' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 text-[11px] font-mono">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Blocked by Browser</span>
            </span>
          )}
          {notificationPermission === 'default' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-amber-400 text-[11px] font-mono">
              <Info className="w-3.5 h-3.5" />
              <span>Permission Required</span>
            </span>
          )}
        </div>
      </div>

      {/* BODY / TOGGLE CONTROLS */}
      <div className="p-5 space-y-5">
        {/* MAIN MASTER TOGGLE */}
        <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#3ECF8E]" />
              <span>Enable Real-Time Desktop Notifications</span>
            </div>
            <p className="text-[11px] text-[#A1A1AA]">
              Pushes native operating system alerts even when the studio tab is in the background.
            </p>
          </div>

          <button
            onClick={() => toggleDesktopNotifications()}
            type="button"
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              desktopNotificationsEnabled ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
            }`}
            role="switch"
            aria-checked={desktopNotificationsEnabled}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                desktopNotificationsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* GRANULAR SUBSCRIPTION CHANNELS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          {/* Status changes */}
          <div
            onClick={() => setNotifyStatusChanges(!notifyStatusChanges)}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
              notifyStatusChanges
                ? 'bg-[#18181B] border-[#3ECF8E]/60 text-white'
                : 'bg-[#09090B] border-[#27272A] text-[#71717A]'
            }`}
          >
            <input
              type="checkbox"
              checked={notifyStatusChanges}
              onChange={() => {}}
              className="mt-0.5 h-4 w-4 rounded bg-[#09090B] border-[#27272A] text-[#3ECF8E] focus:ring-0 cursor-pointer accent-[#3ECF8E]"
            />
            <div className="space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-white">
                <GitCommit className="w-3.5 h-3.5 text-[#3ECF8E]" />
                <span>Project Pipeline Status Updates</span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] leading-normal font-sans">
                Triggers when a 3D commission advances stages (e.g. Clay Approval, Lighting Passes, Client Review).
              </p>
            </div>
          </div>

          {/* Milestone Deliverables Ready */}
          <div
            onClick={() => setNotifyMilestoneReady(!notifyMilestoneReady)}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
              notifyMilestoneReady
                ? 'bg-[#18181B] border-[#3ECF8E]/60 text-white'
                : 'bg-[#09090B] border-[#27272A] text-[#71717A]'
            }`}
          >
            <input
              type="checkbox"
              checked={notifyMilestoneReady}
              onChange={() => {}}
              className="mt-0.5 h-4 w-4 rounded bg-[#09090B] border-[#27272A] text-[#3ECF8E] focus:ring-0 cursor-pointer accent-[#3ECF8E]"
            />
            <div className="space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-white">
                <FileCheck2 className="w-3.5 h-3.5 text-[#3ECF8E]" />
                <span>Milestone Files Ready for Download</span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] leading-normal font-sans">
                Instant alert as soon as high-res 8K TIFFs, WebXR GLB models, or 4K master videos are staged.
              </p>
            </div>
          </div>
        </div>

        {/* SOUND CHIME TOGGLE */}
        <div className="p-3.5 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSoundTest}
              title="Click to preview chime"
              className="p-2 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#3ECF8E] transition-colors cursor-pointer"
            >
              {soundAlertsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-[#71717A]" />}
            </button>
            <div className="space-y-0.5">
              <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <span>Harmonic Studio Chime</span>
                <span className="text-[10px] text-[#71717A]">(Click icon to test audio)</span>
              </div>
              <p className="text-[11px] text-[#A1A1AA]">
                Synthesized 2-tone melodic harmonic audio cue upon notification arrival.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSoundAlerts(!soundAlertsEnabled)}
            type="button"
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              soundAlertsEnabled ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
            }`}
            role="switch"
            aria-checked={soundAlertsEnabled}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                soundAlertsEnabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* TEST NOTIFICATION ACTIONS */}
        <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#3ECF8E]" />
              <span>Simulate Real-Time Push Events</span>
            </h4>
            <span className="text-[10px] font-mono text-[#71717A]">Immediate test dispatcher</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={handleTestStatusChange}
              className="px-3 py-2 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#3ECF8E]/40 text-xs font-mono text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <GitCommit className="w-3.5 h-3.5 text-[#3ECF8E]" />
              <span>Test Status Change Alert</span>
            </button>

            <button
              onClick={handleTestMilestoneReady}
              className="px-3 py-2 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#3ECF8E]/40 text-xs font-mono text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-[#3ECF8E]" />
              <span>Test Deliverable Ready Alert</span>
            </button>
          </div>
        </div>

        {/* BROWSER TROUBLESHOOTING TIP (if permission default or denied) */}
        {notificationPermission === 'denied' && (
          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/60 text-xs font-mono text-rose-300 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-white">Browser Permission Blocked</div>
              <p className="text-[11px] text-rose-200 leading-normal font-sans">
                To receive desktop popups, click the lock/settings icon next to your URL bar, switch <strong>Notifications</strong> to &ldquo;Allow&rdquo;, and refresh the tab.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
