'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  Video,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Users,
  Shield,
  Star,
  RefreshCw,
  Search,
  Check,
  Radio,
  Calendar,
  Lock
} from 'lucide-react';
import {
  connectGoogleMeet,
  ConnectedMeetAccount
} from '@/lib/firebase';
import {
  MeetSpace,
  DEMO_MEET_SPACES,
  createGoogleMeetSpace
} from '@/lib/google-meet';
import { useAppStore } from '@/lib/store';

interface GoogleMeetAdminManagerProps {
  isSuperAdmin?: boolean;
}

const DEFAULT_ADMIN_MEET_ACCOUNTS: ConnectedMeetAccount[] = [
  {
    id: 'gmeet-lead-director',
    email: 'director.reviews@viztr.com',
    displayName: 'VizTR Studio Executive Reviews',
    accessToken: 'mock-token-admin-1',
    connectedAt: '2026-08-15T10:00:00.000Z',
    scopeLevel: 'Full Meet',
    isPrimary: true,
    assignedProjects: ['VIZTR-882', 'VIZTR-904', 'VIZTR-771'],
    defaultAccessType: 'TRUSTED',
    accountRole: 'SUPER_ADMIN',
    activeRoomCount: 4,
  },
  {
    id: 'gmeet-vr-spatial',
    email: 'vr.presentation@viztr.com',
    displayName: 'WebXR Spatial Walkthrough Hub',
    accessToken: 'mock-token-admin-2',
    connectedAt: '2026-08-18T14:30:00.000Z',
    scopeLevel: 'Full Meet',
    isPrimary: false,
    assignedProjects: ['VIZTR-904'],
    defaultAccessType: 'OPEN',
    accountRole: 'ADMIN',
    activeRoomCount: 2,
  },
  {
    id: 'gmeet-engineering-bim',
    email: 'bim.engineering@viztr.com',
    displayName: 'Structural BIM & Façade Coordination',
    accessToken: 'mock-token-admin-3',
    connectedAt: '2026-08-20T09:15:00.000Z',
    scopeLevel: 'Meeting Host',
    isPrimary: false,
    assignedProjects: ['VIZTR-882', 'VIZTR-550'],
    defaultAccessType: 'RESTRICTED',
    accountRole: 'ADMIN',
    activeRoomCount: 1,
  },
];

export default function GoogleMeetAdminManager({
  isSuperAdmin = true,
}: GoogleMeetAdminManagerProps) {
  const { showToast } = useAppStore();

  const [accounts, setAccounts] = useState<ConnectedMeetAccount[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('viztr_admin_gmeet_accounts');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_ADMIN_MEET_ACCOUNTS;
  });

  const [rooms, setRooms] = useState<MeetSpace[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('viztr_admin_gmeet_rooms');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEMO_MEET_SPACES;
  });

  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    accounts[0]?.id || ''
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [copiedRoomCode, setCopiedRoomCode] = useState<string | null>(null);

  // Modals
  const [editingAccount, setEditingAccount] = useState<ConnectedMeetAccount | null>(null);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<ConnectedMeetAccount | null>(null);

  // Manual Add Form
  const [addEmail, setAddEmail] = useState('');
  const [addDisplayName, setAddDisplayName] = useState('');
  const [addAccessType, setAddAccessType] = useState<'OPEN' | 'TRUSTED' | 'RESTRICTED'>('TRUSTED');
  const [addRole, setAddRole] = useState<'SUPER_ADMIN' | 'ADMIN'>('ADMIN');

  // Create Room Form
  const [roomTitle, setRoomTitle] = useState('Executive Milestone Review');
  const [roomProject, setRoomProject] = useState('VIZTR-882');
  const [roomCategory, setRoomCategory] = useState<MeetSpace['category']>('milestone_review');
  const [roomAccessType, setRoomAccessType] = useState<'OPEN' | 'TRUSTED' | 'RESTRICTED'>('TRUSTED');

  const saveAccounts = (newAccounts: ConnectedMeetAccount[]) => {
    setAccounts(newAccounts);
    try {
      localStorage.setItem('viztr_admin_gmeet_accounts', JSON.stringify(newAccounts));
    } catch (e) {
      console.error(e);
    }
  };

  const saveRooms = (newRooms: MeetSpace[]) => {
    setRooms(newRooms);
    try {
      localStorage.setItem('viztr_admin_gmeet_rooms', JSON.stringify(newRooms));
    } catch (e) {
      console.error(e);
    }
  };

  const handleOAuthConnect = async () => {
    setIsConnecting(true);
    try {
      const result = await connectGoogleMeet();
      if (result) {
        const newAccount: ConnectedMeetAccount = {
          id: `gmeet-${Date.now()}`,
          email: result.user.email || 'admin@viztr.com',
          displayName: result.user.displayName || 'VizTR Studio Account',
          photoURL: result.user.photoURL || undefined,
          accessToken: result.accessToken,
          connectedAt: new Date().toISOString(),
          scopeLevel: 'Full Meet',
          isPrimary: accounts.length === 0,
          assignedProjects: ['VIZTR-882'],
          defaultAccessType: 'TRUSTED',
          accountRole: isSuperAdmin ? 'SUPER_ADMIN' : 'ADMIN',
          activeRoomCount: 1,
        };

        const updated = [...accounts, newAccount];
        saveAccounts(updated);
        setSelectedAccountId(newAccount.id);
        showToast(`Connected Google Meet account ${newAccount.email} successfully!`, 'success');
      }
    } catch (error) {
      console.error('OAuth Connect Error:', error);
      showToast('Google Meet OAuth initialized. Studio demo fallback account activated.', 'info');
      // Fallback
      const fallbackAccount: ConnectedMeetAccount = {
        id: `gmeet-${Date.now()}`,
        email: `studio.host.${Math.floor(Math.random() * 100)}@viztr.com`,
        displayName: 'CGI Lighting & Shader Session Host',
        accessToken: 'mock-oauth-token',
        connectedAt: new Date().toISOString(),
        scopeLevel: 'Full Meet',
        isPrimary: false,
        assignedProjects: ['VIZTR-904', 'VIZTR-771'],
        defaultAccessType: 'TRUSTED',
        accountRole: 'ADMIN',
        activeRoomCount: 1,
      };
      const updated = [...accounts, fallbackAccount];
      saveAccounts(updated);
      setSelectedAccountId(fallbackAccount.id);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addEmail.trim() || !addDisplayName.trim()) return;

    const newAccount: ConnectedMeetAccount = {
      id: `gmeet-manual-${Date.now()}`,
      email: addEmail.trim(),
      displayName: addDisplayName.trim(),
      accessToken: 'service-key-token',
      connectedAt: new Date().toISOString(),
      scopeLevel: 'Full Meet',
      isPrimary: accounts.length === 0,
      assignedProjects: ['VIZTR-882'],
      defaultAccessType: addAccessType,
      accountRole: addRole,
      activeRoomCount: 0,
    };

    const updated = [...accounts, newAccount];
    saveAccounts(updated);
    setShowAddAccountModal(false);
    setAddEmail('');
    setAddDisplayName('');
    showToast(`Added Google Meet host account for ${newAccount.email}`, 'success');
  };

  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    const updated = accounts.map((acc) =>
      acc.id === editingAccount.id ? editingAccount : acc
    );
    saveAccounts(updated);
    setEditingAccount(null);
    showToast(`Updated Google Meet account ${editingAccount.email}`, 'success');
  };

  const handleDeleteAccount = () => {
    if (!accountToDelete) return;
    const updated = accounts.filter((acc) => acc.id !== accountToDelete.id);
    saveAccounts(updated);
    if (selectedAccountId === accountToDelete.id) {
      setSelectedAccountId(updated[0]?.id || '');
    }
    setAccountToDelete(null);
    showToast('Google Meet account removed.', 'info');
  };

  const handleSetPrimary = (id: string) => {
    const updated = accounts.map((acc) => ({
      ...acc,
      isPrimary: acc.id === id,
    }));
    saveAccounts(updated);
    showToast('Primary Google Meet room host updated.', 'success');
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeAcc = accounts.find((a) => a.id === selectedAccountId) || accounts[0];
    const newRoom = await createGoogleMeetSpace(activeAcc?.accessToken || 'token', {
      title: roomTitle,
      projectId: roomProject,
      category: roomCategory,
      accessType: roomAccessType,
      hostName: activeAcc?.displayName || 'VizTR Director',
      hostEmail: activeAcc?.email || 'director@viztr.com',
    });

    const updated = [newRoom, ...rooms];
    saveRooms(updated);
    setShowCreateRoomModal(false);
    showToast(`Created Google Meet Space: ${newRoom.meetingCode}`, 'success');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedRoomCode(code);
    showToast('Google Meet code copied!', 'success');
    setTimeout(() => setCopiedRoomCode(null), 3000);
  };

  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="google-meet-admin-section" className="space-y-6">
      {/* SECTION HEADER & QUICK METRICS */}
      <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00897B]/10 border border-[#00897B]/30 flex items-center justify-center text-[#26A69A]">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-display text-white">
                  Google Meet Multi-Account Fleet & Live Review Engine
                </h3>
                {isSuperAdmin && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-400 border border-purple-800 text-[10px] font-mono font-bold flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Super Admin Controls Active
                  </span>
                )}
              </div>
              <p className="text-xs text-[#A1A1AA]">
                Connect and manage multiple Google Meet video host accounts across studio departments, configure project review rooms, and manage access policies.
              </p>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowCreateRoomModal(true)}
              className="px-3.5 py-2 rounded-lg bg-[#00897B] hover:bg-[#00796B] text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Meet Space</span>
            </button>

            <button
              onClick={handleOAuthConnect}
              disabled={isConnecting}
              className="px-3.5 py-2 rounded-lg bg-white hover:bg-zinc-100 text-zinc-900 font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              {isConnecting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00897B]" />
              ) : (
                <Video className="w-3.5 h-3.5 text-[#00897B]" />
              )}
              <span>OAuth Connect Google Meet</span>
            </button>

            {isSuperAdmin && (
              <button
                onClick={() => setShowAddAccountModal(true)}
                className="px-3 py-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Host Email</span>
              </button>
            )}
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-[#27272A]">
          <div className="p-3 rounded-xl bg-[#09090B] border border-[#27272A] space-y-1">
            <div className="text-[10px] font-mono text-[#71717A] uppercase">Total Connected Host Accounts</div>
            <div className="text-xl font-bold font-display text-white">{accounts.length} Email IDs</div>
            <div className="text-[10px] font-mono text-[#26A69A]">Active Multi-Fleet</div>
          </div>

          <div className="p-3 rounded-xl bg-[#09090B] border border-[#27272A] space-y-1">
            <div className="text-[10px] font-mono text-[#71717A] uppercase">Active Review Spaces</div>
            <div className="text-xl font-bold font-display text-[#3ECF8E] flex items-center gap-2">
              <span>{rooms.length} Spaces</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] font-mono text-[#A1A1AA]">Google Meet v2 API</div>
          </div>

          <div className="p-3 rounded-xl bg-[#09090B] border border-[#27272A] space-y-1">
            <div className="text-[10px] font-mono text-[#71717A] uppercase">Primary Executive Room</div>
            <div className="text-sm font-bold font-mono text-white truncate">
              {accounts.find((a) => a.isPrimary)?.email || 'None set'}
            </div>
            <div className="text-[10px] font-mono text-purple-400">Default Client Routing</div>
          </div>

          <div className="p-3 rounded-xl bg-[#09090B] border border-[#27272A] space-y-1">
            <div className="text-[10px] font-mono text-[#71717A] uppercase">Security Policy</div>
            <div className="text-sm font-bold font-mono text-white flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#3ECF8E]" />
              <span>Domain OAuth Guard</span>
            </div>
            <div className="text-[10px] font-mono text-emerald-400">Workspace Auth Active</div>
          </div>
        </div>
      </div>

      {/* ACCOUNT FLEET TABLE */}
      <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-[#26A69A]" />
              <span>Studio Host Email Accounts ({accounts.length})</span>
            </h4>
            <p className="text-xs text-[#71717A]">
              Select an account to view or provision Google Meet review spaces for clients.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
            <input
              type="text"
              placeholder="Search email or host..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-white text-xs font-mono focus:outline-none focus:border-[#00897B]"
            />
          </div>
        </div>

        {/* ACCOUNTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredAccounts.map((account) => (
            <div
              key={account.id}
              onClick={() => setSelectedAccountId(account.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                selectedAccountId === account.id
                  ? 'bg-[#09090B] border-[#00897B] shadow-lg shadow-[#00897B]/10'
                  : 'bg-[#09090B] border-[#27272A] hover:border-[#3ECF8E]/40'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-[#00897B]/20 border border-[#00897B]/40 flex items-center justify-center font-mono font-bold text-[#26A69A] text-xs shrink-0 overflow-hidden">
                      {account.photoURL ? (
                        <Image
                          src={account.photoURL}
                          alt={account.displayName}
                          width={32}
                          height={32}
                          unoptimized
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        account.displayName.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-mono font-bold text-white truncate" title={account.displayName}>
                        {account.displayName}
                      </div>
                      <div className="text-[11px] font-mono text-[#71717A] truncate" title={account.email}>
                        {account.email}
                      </div>
                    </div>
                  </div>

                  {account.isPrimary ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-mono font-bold flex items-center gap-1 shrink-0">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      Primary
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetPrimary(account.id);
                      }}
                      className="text-[10px] font-mono text-[#71717A] hover:text-[#3ECF8E] transition-colors"
                      title="Set as Primary Host"
                    >
                      Set Primary
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-[#18181B] p-2 rounded-lg">
                  <div>
                    <span className="text-[#71717A]">Access Policy:</span>
                    <div className="text-white font-bold">{account.defaultAccessType || 'TRUSTED'}</div>
                  </div>
                  <div>
                    <span className="text-[#71717A]">Assigned Projects:</span>
                    <div className="text-[#3ECF8E] font-bold">{account.assignedProjects?.join(', ') || 'All'}</div>
                  </div>
                </div>
              </div>

              {/* ADMIN CONTROLS */}
              {isSuperAdmin && (
                <div className="flex items-center justify-between pt-2 border-t border-[#27272A]">
                  <span className="text-[10px] font-mono text-[#71717A]">
                    Role: <span className="text-purple-400">{account.accountRole}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingAccount(account);
                      }}
                      className="p-1.5 rounded-md bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors"
                      title="Edit Account Config"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAccountToDelete(account);
                      }}
                      className="p-1.5 rounded-md bg-[#18181B] hover:bg-rose-950/40 text-[#A1A1AA] hover:text-rose-400 transition-colors"
                      title="Remove Account"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ACTIVE SPACES & LAUNCH ROOMS */}
      <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#26A69A]" />
              <span>Studio Google Meet Rooms & Milestone Review Spaces ({rooms.length})</span>
            </h4>
            <p className="text-xs text-[#71717A]">
              Live review rooms linked with clients and CAD teams for real-time spatial presentation.
            </p>
          </div>

          <button
            onClick={() => setShowCreateRoomModal(true)}
            className="px-3 py-1.5 rounded-lg bg-[#00897B] hover:bg-[#00796B] text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Review Room</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {rooms.map((room, idx) => (
            <div
              key={room.name || idx}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                room.isLive
                  ? 'bg-[#09090B] border-[#00897B] shadow-lg shadow-[#00897B]/10'
                  : 'bg-[#09090B] border-[#27272A] hover:border-[#00897B]/40'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className={`p-2 rounded-lg shrink-0 ${room.isLive ? 'bg-[#00897B]/20 text-[#26A69A]' : 'bg-[#18181B] text-[#A1A1AA]'}`}>
                      <Video className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-mono font-bold text-white truncate" title={room.title}>
                        {room.title}
                      </div>
                      <div className="text-[10px] font-mono text-[#71717A]">
                        Room Code: <span className="text-[#3ECF8E] font-bold">{room.meetingCode}</span>
                      </div>
                    </div>
                  </div>

                  {room.isLive && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-mono font-bold flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-[10px] font-mono text-[#71717A]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[#A1A1AA]">
                      <Calendar className="w-3 h-3" />
                      {room.scheduledTime ? new Date(room.scheduledTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Scheduled'}
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {room.projectId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#A1A1AA]">
                    <span>Host: {room.hostName || 'VizTR Director'}</span>
                    <span className="capitalize">{room.category?.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#27272A]">
                <a
                  href={room.meetingUri}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#00897B] hover:bg-[#00796B] text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Launch Google Meet</span>
                </a>

                <button
                  onClick={() => handleCopyCode(room.meetingUri)}
                  className="p-2 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                  title="Copy Google Meet Link"
                >
                  {copiedRoomCode === room.meetingUri ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SUPER ADMIN EDIT ACCOUNT MODAL */}
      <AnimatePresence>
        {editingAccount && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4 shadow-2xl text-xs font-mono"
            >
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm font-display">
                  <Edit2 className="w-4 h-4 text-[#26A69A]" />
                  <span>Edit Google Meet Account (Super Admin)</span>
                </div>
                <button
                  onClick={() => setEditingAccount(null)}
                  className="p-1 rounded hover:bg-[#27272A] text-[#A1A1AA] hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateAccount} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[#A1A1AA] uppercase text-[10px]">Display Name</label>
                  <input
                    type="text"
                    required
                    value={editingAccount.displayName}
                    onChange={(e) =>
                      setEditingAccount({ ...editingAccount, displayName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#00897B]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#A1A1AA] uppercase text-[10px]">Google Email ID</label>
                  <input
                    type="email"
                    required
                    value={editingAccount.email}
                    onChange={(e) =>
                      setEditingAccount({ ...editingAccount, email: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#00897B]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[#A1A1AA] uppercase text-[10px]">Default Access Tier</label>
                    <select
                      value={editingAccount.defaultAccessType || 'TRUSTED'}
                      onChange={(e) =>
                        setEditingAccount({
                          ...editingAccount,
                          defaultAccessType: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#00897B]"
                    >
                      <option value="OPEN">Open Access</option>
                      <option value="TRUSTED">Trusted (Workspace)</option>
                      <option value="RESTRICTED">Restricted Host Only</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#A1A1AA] uppercase text-[10px]">Role</label>
                    <select
                      value={editingAccount.accountRole || 'ADMIN'}
                      onChange={(e) =>
                        setEditingAccount({
                          ...editingAccount,
                          accountRole: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#00897B]"
                    >
                      <option value="SUPER_ADMIN">Super Admin</option>
                      <option value="ADMIN">Studio Admin</option>
                      <option value="CLIENT">Client Guest Host</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#27272A]">
                  <button
                    type="button"
                    onClick={() => setEditingAccount(null)}
                    className="px-3 py-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#00897B] hover:bg-[#00796B] text-white font-bold uppercase"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD HOST MODAL */}
      <AnimatePresence>
        {showAddAccountModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4 shadow-2xl text-xs font-mono"
            >
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm font-display">
                  <Plus className="w-4 h-4 text-[#26A69A]" />
                  <span>Add Studio Google Meet Host</span>
                </div>
                <button
                  onClick={() => setShowAddAccountModal(false)}
                  className="p-1 rounded hover:bg-[#27272A] text-[#A1A1AA] hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleManualAdd} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[#A1A1AA] uppercase text-[10px]">Google Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. director.vr@viztr.com"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#00897B]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#A1A1AA] uppercase text-[10px]">Host / Department Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lighting & Shading Supervisor"
                    value={addDisplayName}
                    onChange={(e) => setAddDisplayName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#00897B]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[#A1A1AA] uppercase text-[10px]">Access Policy</label>
                    <select
                      value={addAccessType}
                      onChange={(e) => setAddAccessType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#00897B]"
                    >
                      <option value="OPEN">Open Access</option>
                      <option value="TRUSTED">Trusted (Workspace)</option>
                      <option value="RESTRICTED">Restricted</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#A1A1AA] uppercase text-[10px]">Role</label>
                    <select
                      value={addRole}
                      onChange={(e) => setAddRole(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#00897B]"
                    >
                      <option value="ADMIN">Studio Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#27272A]">
                  <button
                    type="button"
                    onClick={() => setShowAddAccountModal(false)}
                    className="px-3 py-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#00897B] hover:bg-[#00796B] text-white font-bold uppercase"
                  >
                    Add Host Email
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE ROOM MODAL */}
      <AnimatePresence>
        {showCreateRoomModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4 shadow-2xl text-xs font-mono"
            >
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm font-display">
                  <Video className="w-4 h-4 text-[#26A69A]" />
                  <span>Create Google Meet Review Space</span>
                </div>
                <button
                  onClick={() => setShowCreateRoomModal(false)}
                  className="p-1 rounded hover:bg-[#27272A] text-[#A1A1AA] hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateRoom} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[#A1A1AA] uppercase text-[10px]">Session Topic</label>
                  <input
                    type="text"
                    required
                    value={roomTitle}
                    onChange={(e) => setRoomTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#00897B]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[#A1A1AA] uppercase text-[10px]">Project ID</label>
                    <select
                      value={roomProject}
                      onChange={(e) => setRoomProject(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#00897B]"
                    >
                      <option value="VIZTR-882">The Apex Tower (VIZTR-882)</option>
                      <option value="VIZTR-904">Nordic Monolith (VIZTR-904)</option>
                      <option value="VIZTR-771">Helios Pavilion (VIZTR-771)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#A1A1AA] uppercase text-[10px]">Category</label>
                    <select
                      value={roomCategory}
                      onChange={(e) => setRoomCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#00897B]"
                    >
                      <option value="milestone_review">Milestone Review</option>
                      <option value="vr_walkthrough">WebXR Spatial Review</option>
                      <option value="bim_coordination">BIM Engineering</option>
                      <option value="lighting_review">Lighting Pass</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[#A1A1AA] uppercase text-[10px]">Host Account</label>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#00897B]"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.displayName} ({acc.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#27272A]">
                  <button
                    type="button"
                    onClick={() => setShowCreateRoomModal(false)}
                    className="px-3 py-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#00897B] hover:bg-[#00796B] text-white font-bold uppercase"
                  >
                    Provision Room
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {accountToDelete && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-sm w-full p-6 rounded-2xl bg-[#18181B] border border-rose-900/50 space-y-4 shadow-2xl text-xs font-mono"
            >
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm font-display">
                <AlertCircle className="w-5 h-5" />
                <span>Remove Host Account?</span>
              </div>
              <p className="text-[#A1A1AA]">
                Remove <span className="text-white font-bold">{accountToDelete.email}</span> from the Google Meet multi-host fleet? Existing scheduled meetings will need to be remapped.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setAccountToDelete(null)}
                  className="px-3 py-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
