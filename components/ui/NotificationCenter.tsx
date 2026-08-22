'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import {
  Bell,
  BellRing,
  BellOff,
  Check,
  Trash2,
  ExternalLink,
  GitCommit,
  FileCheck2,
  Sparkles,
  Settings,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function NotificationCenter() {
  const {
    notificationsList,
    desktopNotificationsEnabled,
    soundAlertsEnabled,
    toggleDesktopNotifications,
    setSoundAlerts,
    markNotificationAsRead,
    clearAllNotifications,
    dispatchAlert,
  } = useAppStore();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notificationsList.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* TRIGGER BUTTON */}
      <button
        id="notification-center-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
        aria-label="Notification Center"
        title="Project Notifications & Alerts"
      >
        {desktopNotificationsEnabled ? (
          <Bell className="w-4 h-4 text-[#3ECF8E]" />
        ) : (
          <BellOff className="w-4 h-4 text-[#71717A]" />
        )}

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#3ECF8E] text-[9px] font-mono font-bold text-black ring-2 ring-[#09090B]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN POPOVER */}
      {isOpen && (
        <div
          id="notification-center-dropdown"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#18181B] border border-[#27272A] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* HEADER */}
          <div className="p-3.5 border-b border-[#27272A] flex items-center justify-between bg-[#18181B]">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xs text-white">Live Project Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-[#3ECF8E]/20 text-[#3ECF8E] text-[10px] font-mono font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundAlerts(!soundAlertsEnabled)}
                title={soundAlertsEnabled ? 'Sound enabled' : 'Sound muted'}
                className="p-1 rounded hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              >
                {soundAlertsEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#3ECF8E]" /> : <VolumeX className="w-3.5 h-3.5 text-[#71717A]" />}
              </button>

              <button
                onClick={() => toggleDesktopNotifications()}
                title={desktopNotificationsEnabled ? 'Desktop notifications ON' : 'Desktop notifications OFF'}
                className="p-1 rounded hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              >
                {desktopNotificationsEnabled ? <BellRing className="w-3.5 h-3.5 text-[#3ECF8E]" /> : <BellOff className="w-3.5 h-3.5 text-[#71717A]" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* QUICK TOGGLE BANNER */}
          <div className="px-3.5 py-2 bg-[#09090B] border-b border-[#27272A] flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#A1A1AA]">Desktop Push:</span>
            <button
              onClick={() => toggleDesktopNotifications()}
              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                desktopNotificationsEnabled
                  ? 'bg-[#3ECF8E]/20 text-[#3ECF8E] border border-[#3ECF8E]/40'
                  : 'bg-[#27272A] text-[#71717A]'
              }`}
            >
              {desktopNotificationsEnabled ? 'Active (Click to Pause)' : 'Paused (Click to Enable)'}
            </button>
          </div>

          {/* NOTIFICATION FEED */}
          <div className="max-h-72 overflow-y-auto divide-y divide-[#27272A]/60">
            {notificationsList.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <BellOff className="w-6 h-6 text-[#71717A] mx-auto" />
                <p className="text-xs font-mono text-[#71717A]">No notifications in archive</p>
              </div>
            ) : (
              notificationsList.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif.id)}
                  className={`p-3 text-xs font-mono transition-colors flex items-start gap-2.5 cursor-pointer ${
                    notif.read ? 'bg-[#18181B]/40 hover:bg-[#18181B]' : 'bg-[#18181B] hover:bg-[#27272A]/40'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {notif.type === 'status_change' && (
                      <div className="w-6 h-6 rounded-lg bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400">
                        <GitCommit className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {notif.type === 'milestone_ready' && (
                      <div className="w-6 h-6 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-[#3ECF8E]">
                        <FileCheck2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {notif.type === 'system' && (
                      <div className="w-6 h-6 rounded-lg bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`font-bold truncate ${notif.read ? 'text-[#A1A1AA]' : 'text-white'}`}>
                        {notif.title}
                      </span>
                      <span className="text-[9px] text-[#71717A] shrink-0">{notif.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-[#A1A1AA] leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                    {notif.actionUrl && (
                      <Link
                        href={notif.actionUrl}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[10px] text-[#3ECF8E] hover:underline pt-0.5"
                      >
                        <span>Open Commission View</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    )}
                  </div>

                  {!notif.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E] shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="p-2.5 border-t border-[#27272A] bg-[#09090B] flex items-center justify-between text-[10px] font-mono">
            {notificationsList.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-[#71717A] hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            )}

            <Link
              href="/client-dashboard"
              onClick={() => setIsOpen(false)}
              className="text-[#3ECF8E] hover:underline flex items-center gap-1 ml-auto"
            >
              <span>Manage Alerts Center →</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
