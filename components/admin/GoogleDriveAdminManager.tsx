'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  HardDrive,
  Shield,
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  ExternalLink,
  Folder,
  Layers,
  FileCode,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Database,
  Cloud,
  Settings,
  Mail,
  User,
  LogOut,
  FolderPlus,
  Share2,
  Download
} from 'lucide-react';
import {
  connectGoogleDrive,
  ConnectedDriveAccount
} from '@/lib/firebase';
import {
  DriveFile,
  DriveStorageQuota,
  fetchGoogleDriveFiles,
  createDriveFolder,
  DEMO_DRIVE_FILES
} from '@/lib/google-drive';
import { useAppStore } from '@/lib/store';

const DEFAULT_ADMIN_ACCOUNTS: ConnectedDriveAccount[] = [
  {
    id: 'gdrive-acc-01',
    email: 'studio.renders@viztr.com',
    displayName: 'VizTR Render Farm 8K Master Archive',
    photoURL: undefined,
    accessToken: 'token-studio-renders',
    connectedAt: '2026-02-15T08:00:00Z',
    scopeLevel: 'Full Drive',
    isPrimary: true,
    assignedProjects: ['VIZTR-882', 'VIZTR-904', 'VIZTR-771'],
    totalStorageUsed: '1.8 TB',
    storageQuota: '5.0 TB',
    accountRole: 'SUPER_ADMIN',
  },
  {
    id: 'gdrive-acc-02',
    email: 'bim.archive@viztr.com',
    displayName: 'VizTR BIM & Structural CAD Vault',
    photoURL: undefined,
    accessToken: 'token-bim-archive',
    connectedAt: '2026-02-18T10:30:00Z',
    scopeLevel: 'Full Drive',
    isPrimary: false,
    assignedProjects: ['VIZTR-882'],
    totalStorageUsed: '640 GB',
    storageQuota: '2.0 TB',
    accountRole: 'ADMIN',
  },
  {
    id: 'gdrive-acc-03',
    email: 'client.assets@viztr.com',
    displayName: 'Client Ingestion & Deliverables Gateway',
    photoURL: undefined,
    accessToken: 'token-client-gateway',
    connectedAt: '2026-02-22T14:15:00Z',
    scopeLevel: 'Full Drive',
    isPrimary: false,
    assignedProjects: ['VIZTR-904', 'VIZTR-771'],
    totalStorageUsed: '320 GB',
    storageQuota: '1.0 TB',
    accountRole: 'ADMIN',
  },
];

export default function GoogleDriveAdminManager() {
  const { user, showToast } = useAppStore();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || !user?.role || user?.role === 'ADMIN';

  const [accounts, setAccounts] = useState<ConnectedDriveAccount[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('viztr_admin_gdrive_accounts');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_ADMIN_ACCOUNTS;
  });

  const [selectedAccountId, setSelectedAccountId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('viztr_admin_gdrive_accounts');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0].id;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_ADMIN_ACCOUNTS[0].id;
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<DriveFile[]>(DEMO_DRIVE_FILES);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // Edit Account Modal State (Super Admin editable)
  const [editingAccount, setEditingAccount] = useState<ConnectedDriveAccount | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editStorageQuota, setEditStorageQuota] = useState('');
  const [editAssignedProjects, setEditAssignedProjects] = useState<string[]>([]);
  const [editIsPrimary, setEditIsPrimary] = useState(false);

  // Delete Confirmation Modal
  const [accountToDelete, setAccountToDelete] = useState<ConnectedDriveAccount | null>(null);

  // Manual Add Account Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newQuota, setNewQuota] = useState('2.0 TB');

  const saveAccounts = (newAccounts: ConnectedDriveAccount[]) => {
    setAccounts(newAccounts);
    try {
      localStorage.setItem('viztr_admin_gdrive_accounts', JSON.stringify(newAccounts));
    } catch (e) {
      console.error(e);
    }
  };

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  const handleConnectWithGoogle = async () => {
    setIsConnecting(true);
    try {
      const result = await connectGoogleDrive();
      if (result) {
        const newAcc: ConnectedDriveAccount = {
          id: `gdrive-auth-${Date.now()}`,
          email: result.user.email || 'admin.gdrive@viztr.com',
          displayName: result.user.displayName || `VizTR Drive (${result.user.email})`,
          photoURL: result.user.photoURL || undefined,
          accessToken: result.accessToken,
          connectedAt: new Date().toISOString(),
          scopeLevel: 'Full Drive',
          isPrimary: accounts.length === 0,
          assignedProjects: ['VIZTR-882', 'VIZTR-904', 'VIZTR-771'],
          totalStorageUsed: '120 GB',
          storageQuota: '2.0 TB',
          accountRole: 'ADMIN',
        };

        const updated = [...accounts, newAcc];
        saveAccounts(updated);
        setSelectedAccountId(newAcc.id);
        showToast(`Connected Google Drive account ${newAcc.email} successfully!`, 'success');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      showToast('Opening Google Auth popup or adding custom email account...', 'info');
      setShowAddModal(true);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSaveManualAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    const newAcc: ConnectedDriveAccount = {
      id: `gdrive-manual-${Date.now()}`,
      email: newEmail.trim(),
      displayName: newDisplayName.trim() || `Drive Vault (${newEmail.trim()})`,
      accessToken: 'custom-oauth-token',
      connectedAt: new Date().toISOString(),
      scopeLevel: 'Full Drive',
      isPrimary: accounts.length === 0,
      assignedProjects: ['VIZTR-882', 'VIZTR-904'],
      totalStorageUsed: '10 GB',
      storageQuota: newQuota || '2.0 TB',
      accountRole: 'ADMIN',
    };

    const updated = [...accounts, newAcc];
    saveAccounts(updated);
    setSelectedAccountId(newAcc.id);
    setShowAddModal(false);
    setNewEmail('');
    setNewDisplayName('');
    showToast(`Linked new Google Drive storage account: ${newAcc.email}`, 'success');
  };

  const handleOpenEditModal = (acc: ConnectedDriveAccount) => {
    setEditingAccount(acc);
    setEditDisplayName(acc.displayName);
    setEditStorageQuota(acc.storageQuota || '2.0 TB');
    setEditAssignedProjects(acc.assignedProjects || []);
    setEditIsPrimary(!!acc.isPrimary);
  };

  const handleSaveEditedAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    const updated = accounts.map((acc) => {
      if (acc.id === editingAccount.id) {
        return {
          ...acc,
          displayName: editDisplayName,
          storageQuota: editStorageQuota,
          assignedProjects: editAssignedProjects,
          isPrimary: editIsPrimary,
        };
      }
      if (editIsPrimary && acc.id !== editingAccount.id) {
        return { ...acc, isPrimary: false };
      }
      return acc;
    });

    saveAccounts(updated);
    setEditingAccount(null);
    showToast(`Updated account configuration for ${editingAccount.email}.`, 'success');
  };

  const handleDeleteAccount = () => {
    if (!accountToDelete) return;
    const updated = accounts.filter((a) => a.id !== accountToDelete.id);
    saveAccounts(updated);
    if (selectedAccountId === accountToDelete.id && updated.length > 0) {
      setSelectedAccountId(updated[0].id);
    }
    setAccountToDelete(null);
    showToast(`Disconnected Google Drive account ${accountToDelete.email}.`, 'info');
  };

  const filteredFiles = files.filter((f) =>
    !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="google-drive-admin-manager" className="space-y-6">
      {/* TOP HEADER */}
      <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#09090B] border border-[#3ECF8E]/40 text-[10px] font-mono font-bold uppercase text-[#3ECF8E] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Super Admin Storage Hub</span>
            </span>
            <span className="text-xs font-mono text-[#71717A]">• Multi-Account Google Drive Fleet</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
            Google Drive Accounts & Storage Infrastructure
          </h2>
          <p className="text-xs text-[#A1A1AA]">
            Connect multiple Google Drive accounts with distinct email IDs for master 8K render storage, BIM models, and client deliverables.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="admin-connect-gdrive-btn"
            onClick={handleConnectWithGoogle}
            disabled={isConnecting}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            <span>Connect New Account</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#3ECF8E]" />
            <span>Add Mail ID</span>
          </button>
        </div>
      </div>

      {/* CONNECTED MULTI-ACCOUNT FLEET GRID */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#A1A1AA]">
            Linked Google Drive Storage Accounts ({accounts.length})
          </h3>
          <span className="text-[11px] font-mono text-[#3ECF8E]">
            {isSuperAdmin ? 'Full SuperAdmin Edit Privileges Active' : 'Admin View'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accounts.map((acc) => {
            const isSelected = acc.id === selectedAccountId;
            return (
              <motion.div
                key={acc.id}
                whileHover={{ y: -2 }}
                onClick={() => setSelectedAccountId(acc.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'bg-[#18181B] border-[#3ECF8E] shadow-xl shadow-[#3ECF8E]/10'
                    : 'bg-[#18181B]/60 border-[#27272A] hover:border-[#3ECF8E]/40'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-9 h-9 rounded-xl bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 flex items-center justify-center text-[#3ECF8E] shrink-0 font-mono font-bold text-xs">
                        <HardDrive className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-mono font-bold text-white truncate" title={acc.displayName}>
                          {acc.displayName}
                        </h4>
                        <div className="text-[11px] font-mono text-[#71717A] flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 text-[#A1A1AA] shrink-0" />
                          <span className="truncate">{acc.email}</span>
                        </div>
                      </div>
                    </div>

                    {acc.isPrimary && (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-mono font-bold uppercase shrink-0">
                        Primary Vault
                      </span>
                    )}
                  </div>

                  {/* STORAGE PROGRESS BAR */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#A1A1AA]">Drive Capacity</span>
                      <span className="text-white font-bold">{acc.totalStorageUsed || '240 GB'} / {acc.storageQuota || '2.0 TB'}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#09090B] overflow-hidden">
                      <div className="h-full bg-[#3ECF8E]" style={{ width: '35%' }} />
                    </div>
                  </div>

                  {/* ASSIGNED PROJECT TAGS */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(acc.assignedProjects || []).map((pId) => (
                      <span
                        key={pId}
                        className="px-1.5 py-0.5 rounded bg-[#09090B] border border-[#27272A] text-[9px] font-mono text-[#A1A1AA]"
                      >
                        {pId}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CONTROLS (EDITABLE BY SUPER ADMIN) */}
                <div className="flex items-center justify-between pt-2 border-t border-[#27272A]">
                  <span className="text-[10px] font-mono text-[#71717A]">
                    {acc.accountRole || 'ADMIN'}
                  </span>

                  {isSuperAdmin && (
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenEditModal(acc)}
                        className="p-1.5 rounded hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors"
                        title="Edit Drive Settings"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setAccountToDelete(acc)}
                        className="p-1.5 rounded hover:bg-rose-950 text-[#A1A1AA] hover:text-rose-400 transition-colors"
                        title="Disconnect Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* SELECTED ACCOUNT DETAIL WORKSPACE & REPOSITORY */}
      {selectedAccount && (
        <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E]">
                <span>ACCOUNT WORKSPACE</span>
                <span>•</span>
                <span>{selectedAccount.email}</span>
              </div>
              <h3 className="text-lg font-bold font-display text-white">
                {selectedAccount.displayName}
              </h3>
              <p className="text-xs text-[#A1A1AA]">
                Assigned pipeline sync folders mapped to {selectedAccount.assignedProjects?.join(', ') || 'All Commissions'}.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-56">
                <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search repository files..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
                />
              </div>

              <button
                onClick={() => showToast(`Synchronized files for ${selectedAccount.email}`, 'success')}
                className="p-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white"
                title="Refresh Account Data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ACTIVE DRIVE REPOSITORY FILES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="p-3.5 rounded-xl bg-[#09090B] border border-[#27272A] flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-[#18181B] text-[#3ECF8E] shrink-0">
                    {file.category === 'model3d' ? (
                      <Layers className="w-4 h-4" />
                    ) : file.category === 'blueprint' ? (
                      <FileText className="w-4 h-4" />
                    ) : (
                      <FileCode className="w-4 h-4" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h5 className="text-xs font-mono font-bold text-white truncate" title={file.name}>
                      {file.name}
                    </h5>
                    <div className="text-[10px] font-mono text-[#71717A] flex items-center gap-2">
                      <span>{file.size}</span>
                      <span>•</span>
                      <span className="text-[#3ECF8E]">{file.projectId || 'General'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#27272A] text-[10px] font-mono text-[#71717A]">
                  <span>{new Date(file.modifiedTime).toLocaleDateString()}</span>
                  <span className="text-emerald-400">Vault Synced</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUPER ADMIN EDIT ACCOUNT MODAL */}
      <AnimatePresence>
        {editingAccount && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-5 shadow-2xl text-xs font-mono"
            >
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm font-display">
                  <Edit2 className="w-4 h-4 text-[#3ECF8E]" />
                  <span>Super Admin Edit Drive Account</span>
                </div>
                <button
                  onClick={() => setEditingAccount(null)}
                  className="p-1 rounded hover:bg-[#27272A] text-[#A1A1AA] hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEditedAccount} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[#71717A] uppercase text-[10px]">Google Account Email</label>
                  <input
                    type="text"
                    disabled
                    value={editingAccount.email}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-[#A1A1AA] opacity-80 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#A1A1AA] uppercase text-[10px]">Display Name / Storage Label</label>
                  <input
                    type="text"
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#A1A1AA] uppercase text-[10px]">Storage Quota Allocation</label>
                  <select
                    value={editStorageQuota}
                    onChange={(e) => setEditStorageQuota(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                  >
                    <option value="1.0 TB">1.0 TB Standard</option>
                    <option value="2.0 TB">2.0 TB Professional</option>
                    <option value="5.0 TB">5.0 TB Studio Enterprise</option>
                    <option value="10.0 TB">10.0 TB 8K Multi-Pass Vault</option>
                  </select>
                </div>

                <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A]">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-white">Designate as Primary Studio Storage</span>
                    <input
                      type="checkbox"
                      checked={editIsPrimary}
                      onChange={(e) => setEditIsPrimary(e.target.checked)}
                      className="accent-[#3ECF8E]"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#27272A]">
                  <button
                    type="button"
                    onClick={() => setEditingAccount(null)}
                    className="px-3 py-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-bold uppercase"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD ACCOUNT WITH CUSTOM MAIL ID MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-5 shadow-2xl text-xs font-mono"
            >
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm font-display">
                  <Plus className="w-4 h-4 text-[#3ECF8E]" />
                  <span>Link Google Drive by Mail ID</span>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded hover:bg-[#27272A] text-[#A1A1AA] hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveManualAccount} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[#A1A1AA] uppercase text-[10px]">Google Mail ID / Workspace Email</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. director.renders@viztr.com or your-name@gmail.com"
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#A1A1AA] uppercase text-[10px]">Storage Account Label</label>
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    placeholder="e.g. Executive 8K Render Vault"
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#A1A1AA] uppercase text-[10px]">Quota Tier</label>
                  <select
                    value={newQuota}
                    onChange={(e) => setNewQuota(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                  >
                    <option value="1.0 TB">1.0 TB Standard</option>
                    <option value="2.0 TB">2.0 TB Professional</option>
                    <option value="5.0 TB">5.0 TB Studio Enterprise</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#27272A]">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-bold uppercase"
                  >
                    Link Drive Account
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE ACCOUNT MODAL */}
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
                <span>Disconnect Storage Account?</span>
              </div>
              <p className="text-[#A1A1AA]">
                Are you sure you want to disconnect <span className="text-white font-bold">{accountToDelete.email}</span> from the studio multi-account fleet?
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
                  Disconnect
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
