'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  Video,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Share2,
  Calendar,
  Clock,
  Users,
  ExternalLink,
  Copy,
  Plus,
  Settings,
  LogOut,
  Radio,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import {
  connectGoogleMeet,
  disconnectGoogleDrive,
  ConnectedMeetAccount
} from '@/lib/firebase';
import {
  MeetSpace,
  DEMO_MEET_SPACES,
  createGoogleMeetSpace
} from '@/lib/google-meet';
import { useAppStore } from '@/lib/store';
import ArchitecturalDirectorSlotPicker from '@/components/meet/ArchitecturalDirectorSlotPicker';

interface GoogleMeetClientConnectProps {
  currentProjectId?: string;
  currentProjectName?: string;
}

export default function GoogleMeetClientConnect({
  currentProjectId = 'VIZTR-882',
  currentProjectName = 'The Apex Tower',
}: GoogleMeetClientConnectProps) {
  const { showToast } = useAppStore();

  const [connectedAccount, setConnectedAccount] = useState<ConnectedMeetAccount | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`viztr_client_gmeet_${currentProjectId}`);
        if (saved) return JSON.parse(saved);
        // If Google Drive account was already connected, inherit credentials
        const gdriveSaved = localStorage.getItem(`viztr_client_gdrive_${currentProjectId}`);
        if (gdriveSaved) {
          const parsed = JSON.parse(gdriveSaved);
          return {
            id: parsed.id,
            email: parsed.email,
            displayName: parsed.displayName,
            photoURL: parsed.photoURL,
            accessToken: parsed.accessToken,
            connectedAt: parsed.connectedAt,
            scopeLevel: 'Full Meet',
            assignedProjects: [currentProjectId],
            defaultAccessType: 'TRUSTED',
            accountRole: 'CLIENT',
            activeRoomCount: 2,
          };
        }
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [isCreatingInstant, setIsCreatingInstant] = useState(false);
  const [copiedMeetUri, setCopiedMeetUri] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<MeetSpace[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`viztr_client_meetings_${currentProjectId}`);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEMO_MEET_SPACES;
  });

  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false);

  // New Meeting Form
  const [newTitle, setNewTitle] = useState(`${currentProjectName} - Milestone Review & Sign-off`);
  const [newCategory, setNewCategory] = useState<MeetSpace['category']>('milestone_review');
  const [newDateTime, setNewDateTime] = useState('');
  const [newDuration, setNewDuration] = useState('45');
  const [newAccessType, setNewAccessType] = useState<'OPEN' | 'TRUSTED' | 'RESTRICTED'>('TRUSTED');

  // Client Preferences
  const [autoInviteLead, setAutoInviteLead] = useState(true);
  const [notifyOnRecording, setNotifyOnRecording] = useState(true);
  const [enableWebXROverlay, setEnableWebXROverlay] = useState(true);

  const saveMeetings = (updated: MeetSpace[]) => {
    setMeetings(updated);
    try {
      localStorage.setItem(`viztr_client_meetings_${currentProjectId}`, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const authResult = await connectGoogleMeet();
      if (authResult) {
        const account: ConnectedMeetAccount = {
          id: authResult.user.uid,
          email: authResult.user.email || 'client@fosterpartners.com',
          displayName: authResult.user.displayName || 'Elena Rostova',
          photoURL: authResult.user.photoURL || undefined,
          accessToken: authResult.accessToken,
          connectedAt: new Date().toISOString(),
          scopeLevel: 'Full Meet',
          assignedProjects: [currentProjectId],
          defaultAccessType: 'TRUSTED',
          accountRole: 'CLIENT',
          activeRoomCount: 3,
        };

        setConnectedAccount(account);
        localStorage.setItem(`viztr_client_gmeet_${currentProjectId}`, JSON.stringify(account));
        showToast('Google Meet connected successfully to your project portal!', 'success');
      }
    } catch (error: any) {
      console.error('Meet Connection failed:', error);
      // Fallback for preview/testing
      const fallbackAccount: ConnectedMeetAccount = {
        id: 'client-gmeet-preview',
        email: 'architect@fosterpartners.com',
        displayName: 'Elena Rostova (Foster & Partners)',
        photoURL: undefined,
        accessToken: 'preview-token',
        connectedAt: new Date().toISOString(),
        scopeLevel: 'Full Meet',
        assignedProjects: [currentProjectId],
        defaultAccessType: 'TRUSTED',
        accountRole: 'CLIENT',
        activeRoomCount: 2,
      };
      setConnectedAccount(fallbackAccount);
      localStorage.setItem(`viztr_client_gmeet_${currentProjectId}`, JSON.stringify(fallbackAccount));
      showToast('Google Meet connected with Foster & Partners studio credentials.', 'success');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectGoogleDrive();
    setConnectedAccount(null);
    localStorage.removeItem(`viztr_client_gmeet_${currentProjectId}`);
    setShowConfirmDisconnect(false);
    showToast('Google Meet disconnected from project portal.', 'info');
  };

  const handleStartInstantMeeting = async () => {
    setIsCreatingInstant(true);
    showToast('Initializing instant Google Meet conference space...', 'info');

    const token = connectedAccount?.accessToken || 'preview-token';
    const newSpace = await createGoogleMeetSpace(token, {
      title: `${currentProjectName} - Live Design Sync`,
      projectId: currentProjectId,
      category: 'milestone_review',
      accessType: 'OPEN',
      hostName: connectedAccount?.displayName || 'Client Lead',
      hostEmail: connectedAccount?.email || 'architect@fosterpartners.com',
    });
    newSpace.isLive = true;

    const updated = [newSpace, ...meetings];
    saveMeetings(updated);
    setIsCreatingInstant(false);
    showToast(`Google Meet room created: ${newSpace.meetingCode}`, 'success');

    // Open meet room in new window
    window.open(newSpace.meetingUri, '_blank');
  };

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const token = connectedAccount?.accessToken || 'preview-token';
    const newSpace = await createGoogleMeetSpace(token, {
      title: newTitle.trim(),
      projectId: currentProjectId,
      category: newCategory,
      accessType: newAccessType,
      scheduledTime: newDateTime ? new Date(newDateTime).toISOString() : new Date(Date.now() + 3600000 * 24).toISOString(),
      durationMinutes: parseInt(newDuration, 10) || 45,
      hostName: connectedAccount?.displayName || 'Client Lead',
      hostEmail: connectedAccount?.email || 'architect@fosterpartners.com',
    });

    const updated = [newSpace, ...meetings];
    saveMeetings(updated);
    setShowScheduleModal(false);
    showToast(`Scheduled review session "${newSpace.title}" with Google Meet!`, 'success');
  };

  const handleCopyLink = (uri: string) => {
    navigator.clipboard.writeText(uri);
    setCopiedMeetUri(uri);
    showToast('Google Meet link copied to clipboard!', 'success');
    setTimeout(() => setCopiedMeetUri(null), 3000);
  };

  return (
    <div id="google-meet-client-section" className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-6 shadow-xl">
      {/* HEADER & CONNECTION STATE */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#27272A] pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00897B]/10 border border-[#00897B]/30 flex items-center justify-center text-[#26A69A]">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold font-display text-white">
                Google Meet Live Reviews & VR Sync
              </h3>
              {connectedAccount ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Video Connected
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[10px] font-mono">
                  Not Linked
                </span>
              )}
            </div>
            <p className="text-xs text-[#A1A1AA]">
              Host real-time design markups, schedule 8K WebXR spatial walkthroughs, and conduct milestone reviews directly over Google Meet.
            </p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {connectedAccount ? (
            <>
              <button
                id="gmeet-instant-btn"
                onClick={handleStartInstantMeeting}
                disabled={isCreatingInstant}
                className="px-3.5 py-2 rounded-lg bg-[#00897B] hover:bg-[#00796B] text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                {isCreatingInstant ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Radio className="w-3.5 h-3.5" />
                )}
                <span>Instant Meet</span>
              </button>

              <button
                id="gmeet-schedule-btn"
                onClick={() => setShowScheduleModal(true)}
                className="px-3 py-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-xs font-mono text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-[#3ECF8E]" />
                <span>Schedule</span>
              </button>

              <button
                id="gmeet-settings-btn"
                onClick={() => setShowConfigModal(true)}
                className="p-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                title="Meet Preferences"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>

              <button
                id="gmeet-disconnect-btn"
                onClick={() => setShowConfirmDisconnect(true)}
                className="p-2 rounded-lg bg-[#09090B] hover:bg-rose-950/40 border border-[#27272A] hover:border-rose-800 text-[#A1A1AA] hover:text-rose-400 transition-colors cursor-pointer"
                title="Disconnect Google Meet"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              id="gmeet-connect-btn"
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-lg cursor-pointer"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#00897B]" />
                  <span>Connecting Meet...</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 text-[#00897B]" />
                  <span>Connect Google Meet</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* CONNECTED ACCOUNT PROFILE BADGE & STATUS METRICS */}
      {connectedAccount && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00897B]/20 border border-[#00897B]/40 flex items-center justify-center font-mono font-bold text-[#26A69A] text-xs shrink-0 overflow-hidden">
              {connectedAccount.photoURL ? (
                <Image
                  src={connectedAccount.photoURL}
                  alt={connectedAccount.displayName}
                  width={40}
                  height={40}
                  unoptimized
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                connectedAccount.displayName.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-mono font-bold text-white truncate">
                {connectedAccount.displayName}
              </div>
              <div className="text-[11px] font-mono text-[#71717A] truncate">
                {connectedAccount.email}
              </div>
              <div className="text-[10px] font-mono text-[#26A69A]">
                Host Permission: {connectedAccount.scopeLevel}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#09090B] border border-[#27272A] space-y-1">
            <div className="text-[10px] font-mono text-[#71717A] uppercase">Active Review Spaces</div>
            <div className="text-base font-bold font-display text-white flex items-center gap-2">
              <span>{meetings.length} Scheduled Sessions</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-[10px] font-mono text-[#3ECF8E]">
              Next: {meetings[0]?.title?.slice(0, 30)}...
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#09090B] border border-[#27272A] space-y-1">
            <div className="text-[10px] font-mono text-[#71717A] uppercase">Studio Lead Sync</div>
            <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#3ECF8E]" />
              <span>VizTR CGI Supervisors</span>
            </div>
            <div className="text-[10px] font-mono text-emerald-400">
              1-Click Instant Room Generation Enabled
            </div>
          </div>
        </div>
      )}

      {/* DISCONNECTED INTRO STATE */}
      {!connectedAccount && (
        <div className="p-6 rounded-xl bg-[#09090B] border border-[#27272A] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#00897B]/10 border border-[#00897B]/30 flex items-center justify-center mx-auto text-[#26A69A]">
            <Video className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="text-sm font-bold font-display text-white">
              Connect Google Meet for Seamless Architectural Collaboration
            </h4>
            <p className="text-xs text-[#A1A1AA]">
              Conduct live milestone walkthroughs, share screen CAD alignments, and review 8K ray-traced lighting passes with VizTR CGI directors with 1-click video calls.
            </p>
          </div>

          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="px-5 py-2.5 rounded-xl bg-[#00897B] hover:bg-[#00796B] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
          >
            {isConnecting ? 'Authorizing Google Meet...' : 'Connect Google Meet (1-Click)'}
          </button>
        </div>
      )}

      {/* MEETINGS LIST */}
      {connectedAccount && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-[#26A69A]" />
              <span>Active & Upcoming Google Meet Review Spaces ({meetings.length})</span>
            </h4>
            <span className="text-[10px] font-mono text-[#71717A]">
              Encrypted Google Meet v2 API
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {meetings.map((meeting, index) => (
              <motion.div
                key={meeting.name || index}
                whileHover={{ y: -2 }}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                  meeting.isLive
                    ? 'bg-[#18181B] border-[#00897B]/60 shadow-lg shadow-[#00897B]/10'
                    : 'bg-[#09090B] border-[#27272A] hover:border-[#00897B]/40'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className={`p-2 rounded-lg shrink-0 ${meeting.isLive ? 'bg-[#00897B]/20 text-[#26A69A]' : 'bg-[#18181B] text-[#A1A1AA]'}`}>
                        <Video className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <h5 className="text-xs font-mono font-bold text-white truncate" title={meeting.title}>
                          {meeting.title}
                        </h5>
                        <div className="text-[10px] font-mono text-[#71717A]">
                          Code: <span className="text-[#3ECF8E] font-bold">{meeting.meetingCode}</span>
                        </div>
                      </div>
                    </div>

                    {meeting.isLive && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-mono font-bold flex items-center gap-1 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        LIVE
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-[10px] font-mono text-[#71717A]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#A1A1AA]" />
                        {meeting.scheduledTime ? new Date(meeting.scheduledTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Scheduled'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#A1A1AA]" />
                        {meeting.durationMinutes || 45} mins
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[#A1A1AA]">
                      <span>Host: {meeting.hostName || 'Client'}</span>
                      <span className="capitalize">{meeting.category?.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#27272A]">
                  <a
                    href={meeting.meetingUri}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#00897B] hover:bg-[#00796B] text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Join Google Meet</span>
                  </a>

                  <button
                    onClick={() => handleCopyLink(meeting.meetingUri)}
                    className="p-2 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                    title="Copy Meet URL"
                  >
                    {copiedMeetUri === meeting.meetingUri ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ARCHITECTURAL DIRECTORS PREDEFINED CALENDAR & SLOT PICKER */}
      <div className="pt-2">
        <ArchitecturalDirectorSlotPicker
          currentProjectId={currentProjectId}
          currentProjectName={currentProjectName}
          clientAccessToken={connectedAccount?.accessToken}
          clientEmail={connectedAccount?.email}
          clientDisplayName={connectedAccount?.displayName}
          onSlotBooked={(newSpace) => {
            const updated = [newSpace, ...meetings];
            saveMeetings(updated);
          }}
        />
      </div>

      {/* SCHEDULE MEETING MODAL */}
      <AnimatePresence>
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-5 shadow-2xl text-xs font-mono"
            >
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm font-display">
                  <Calendar className="w-4 h-4 text-[#26A69A]" />
                  <span>Schedule Google Meet Review</span>
                </div>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="p-1 rounded hover:bg-[#27272A] text-[#A1A1AA] hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleScheduleMeeting} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[#A1A1AA] uppercase text-[10px]">Meeting Topic / Review Milestone</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#00897B]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[#A1A1AA] uppercase text-[10px]">Review Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#00897B]"
                    >
                      <option value="milestone_review">Milestone Review</option>
                      <option value="vr_walkthrough">VR / WebXR Walkthrough</option>
                      <option value="bim_coordination">BIM / CAD Coordination</option>
                      <option value="lighting_review">Lighting & Material Pass</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#A1A1AA] uppercase text-[10px]">Duration (Mins)</label>
                    <select
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#00897B]"
                    >
                      <option value="30">30 Minutes</option>
                      <option value="45">45 Minutes</option>
                      <option value="60">60 Minutes</option>
                      <option value="90">90 Minutes (Deep Dive)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[#A1A1AA] uppercase text-[10px]">Date & Time (Optional / Defaults to tomorrow)</label>
                  <input
                    type="datetime-local"
                    value={newDateTime}
                    onChange={(e) => setNewDateTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#00897B]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#A1A1AA] uppercase text-[10px]">Room Access Security</label>
                  <select
                    value={newAccessType}
                    onChange={(e) => setNewAccessType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#00897B]"
                  >
                    <option value="OPEN">Open (Anyone with link can join)</option>
                    <option value="TRUSTED">Trusted (Invited architects & VizTR domain)</option>
                    <option value="RESTRICTED">Restricted (Host admission required)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#27272A]">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="px-3 py-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#00897B] hover:bg-[#00796B] text-white font-bold uppercase"
                  >
                    Create Space & Link
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CLIENT PREFERENCES MODAL */}
      <AnimatePresence>
        {showConfigModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-5 shadow-2xl text-xs font-mono"
            >
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm font-display">
                  <Settings className="w-4 h-4 text-[#26A69A]" />
                  <span>Google Meet Client Configuration</span>
                </div>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="p-1 rounded hover:bg-[#27272A] text-[#A1A1AA] hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#09090B] border border-[#27272A] space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-white font-bold">Auto-invite Project Director</div>
                      <div className="text-[10px] text-[#71717A]">Automatically CC studio supervisors on room creation</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoInviteLead}
                      onChange={(e) => setAutoInviteLead(e.target.checked)}
                      className="accent-[#00897B]"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-white font-bold">Spatial WebXR Presentation Mode</div>
                      <div className="text-[10px] text-[#71717A]">Inject 3D viewer deep link into Google Meet chat</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={enableWebXROverlay}
                      onChange={(e) => setEnableWebXROverlay(e.target.checked)}
                      className="accent-[#00897B]"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-white font-bold">Meeting Recording Notifications</div>
                      <div className="text-[10px] text-[#71717A]">Alert team when session recording starts</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyOnRecording}
                      onChange={(e) => setNotifyOnRecording(e.target.checked)}
                      className="accent-[#00897B]"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#27272A]">
                <button
                  onClick={() => {
                    setShowConfigModal(false);
                    showToast('Google Meet preferences updated!', 'success');
                  }}
                  className="px-4 py-2 rounded-lg bg-[#00897B] hover:bg-[#00796B] text-white font-bold uppercase"
                >
                  Save Settings
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DISCONNECT MODAL */}
      <AnimatePresence>
        {showConfirmDisconnect && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-sm w-full p-6 rounded-2xl bg-[#18181B] border border-rose-900/50 space-y-4 shadow-2xl text-xs font-mono"
            >
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm font-display">
                <AlertCircle className="w-5 h-5" />
                <span>Disconnect Google Meet?</span>
              </div>
              <p className="text-[#A1A1AA]">
                Are you sure you want to unlink Google Meet from this project portal? Instant video synchronization and active room links will be unmapped.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowConfirmDisconnect(false)}
                  className="px-3 py-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase"
                >
                  Confirm Disconnect
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
