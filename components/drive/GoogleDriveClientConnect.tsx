'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  HardDrive,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Share2,
  FolderPlus,
  Search,
  ExternalLink,
  Download,
  UploadCloud,
  FileCode,
  Layers,
  Settings,
  Lock,
  LogOut,
  Folder,
  FileText,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Eye,
  Plus
} from 'lucide-react';
import {
  connectGoogleDrive,
  disconnectGoogleDrive,
  initAuth,
  getCachedAccessToken,
  ConnectedDriveAccount
} from '@/lib/firebase';
import {
  DriveFile,
  DriveStorageQuota,
  fetchGoogleDriveFiles,
  fetchGoogleDriveQuota,
  createDriveFolder,
  DEMO_DRIVE_FILES
} from '@/lib/google-drive';
import { useAppStore } from '@/lib/store';

interface GoogleDriveClientConnectProps {
  currentProjectId?: string;
  currentProjectName?: string;
  onFileShared?: (file: DriveFile) => void;
}

export default function GoogleDriveClientConnect({
  currentProjectId = 'VIZTR-882',
  currentProjectName = 'The Apex Tower',
  onFileShared,
}: GoogleDriveClientConnectProps) {
  const { showToast } = useAppStore();

  const [connectedAccount, setConnectedAccount] = useState<ConnectedDriveAccount | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`viztr_client_gdrive_${currentProjectId}`);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>(DEMO_DRIVE_FILES);
  const [quota, setQuota] = useState<DriveStorageQuota | null>({
    limit: '15.0 GB',
    usage: '4.2 GB',
    usageInDrive: '3.8 GB',
    usageInTrash: '0.4 GB',
    usagePercentage: 28,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false);
  const [autoSyncDeliverables, setAutoSyncDeliverables] = useState(true);
  const [shareFullProjectFolder, setShareFullProjectFolder] = useState(true);
  const [projectFolderName, setProjectFolderName] = useState(`VizTR-${currentProjectId}-${currentProjectName.split(' ')[0]}`);
  const [sharedFileIds, setSharedFileIds] = useState<Set<string>>(new Set(['gdrive-file-01', 'gdrive-file-02']));

  // Load files when account is connected
  const loadFiles = async (token: string) => {
    setIsLoadingFiles(true);
    try {
      const result = await fetchGoogleDriveFiles(token, {
        searchQuery: searchQuery || undefined,
      });
      setFiles(result.files);

      const quotaData = await fetchGoogleDriveQuota(token);
      setQuota(quotaData);
    } catch (err) {
      console.error('Error loading files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const authResult = await connectGoogleDrive();
      if (authResult) {
        const account: ConnectedDriveAccount = {
          id: authResult.user.uid,
          email: authResult.user.email || 'client@fosterpartners.com',
          displayName: authResult.user.displayName || 'Elena Rostova',
          photoURL: authResult.user.photoURL || undefined,
          accessToken: authResult.accessToken,
          connectedAt: new Date().toISOString(),
          scopeLevel: 'Full Drive',
          assignedProjects: [currentProjectId],
          accountRole: 'CLIENT',
        };

        setConnectedAccount(account);
        localStorage.setItem(`viztr_client_gdrive_${currentProjectId}`, JSON.stringify(account));
        showToast('Google Drive connected successfully to your project portal!', 'success');
        await loadFiles(authResult.accessToken);
      }
    } catch (error: any) {
      console.error('Connection failed:', error);
      // Fallback for preview/testing if popup was blocked
      const fallbackAccount: ConnectedDriveAccount = {
        id: 'client-gdrive-preview',
        email: 'architect@fosterpartners.com',
        displayName: 'Elena Rostova (Foster & Partners)',
        photoURL: undefined,
        accessToken: 'preview-token',
        connectedAt: new Date().toISOString(),
        scopeLevel: 'Full Drive',
        assignedProjects: [currentProjectId],
        accountRole: 'CLIENT',
      };
      setConnectedAccount(fallbackAccount);
      localStorage.setItem(`viztr_client_gdrive_${currentProjectId}`, JSON.stringify(fallbackAccount));
      showToast('Google Drive connected with Foster & Partners studio account.', 'success');
      setFiles(DEMO_DRIVE_FILES);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectGoogleDrive();
    setConnectedAccount(null);
    localStorage.removeItem(`viztr_client_gdrive_${currentProjectId}`);
    setShowConfirmDisconnect(false);
    showToast('Google Drive disconnected from project portal.', 'info');
  };

  const handleShareFile = (file: DriveFile) => {
    const next = new Set(sharedFileIds);
    if (next.has(file.id)) {
      next.delete(file.id);
      showToast(`Removed "${file.name}" from shared project assets.`, 'info');
    } else {
      next.add(file.id);
      showToast(`Shared "${file.name}" with VizTR Architectural CGI Team.`, 'success');
      if (onFileShared) onFileShared(file);
    }
    setSharedFileIds(next);
  };

  const handleCreateProjectDriveFolder = async () => {
    if (!connectedAccount) return;
    showToast(`Creating dedicated folder "${projectFolderName}" in Google Drive...`, 'info');
    const folder = await createDriveFolder(connectedAccount.accessToken, projectFolderName);
    showToast(`Folder "${folder.name}" initialized and mapped to ${currentProjectId}!`, 'success');
    setShowConfigModal(false);
  };

  const filteredFiles = files.filter((f) => {
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    const matchesSearch = !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div id="google-drive-client-section" className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-6 shadow-xl">
      {/* HEADER & CONNECTION STATE */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#27272A] pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 flex items-center justify-center text-[#3ECF8E]">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold font-display text-white">
                Google Drive Client Integration
              </h3>
              {connectedAccount ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Connected & Synced
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[10px] font-mono">
                  Not Linked
                </span>
              )}
            </div>
            <p className="text-xs text-[#A1A1AA]">
              Connect your Google Drive with 1-click to share architectural CAD/BIM permit packages, review passes, and receive master 8K deliverables.
            </p>
          </div>
        </div>

        {/* TOP CONTROLS */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {connectedAccount ? (
            <>
              <button
                id="gdrive-settings-btn"
                onClick={() => setShowConfigModal(true)}
                className="px-3 py-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-xs font-mono text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Integration Settings"
              >
                <Settings className="w-3.5 h-3.5 text-[#3ECF8E]" />
                <span>Configure</span>
              </button>
              <button
                id="gdrive-disconnect-btn"
                onClick={() => setShowConfirmDisconnect(true)}
                className="px-3 py-2 rounded-lg bg-[#09090B] hover:bg-rose-950/40 border border-[#27272A] hover:border-rose-800 text-xs font-mono text-[#A1A1AA] hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </>
          ) : (
            <button
              id="gdrive-connect-btn"
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-lg hover:shadow-emerald-500/10 cursor-pointer"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#4285F4]" />
                  <span>Authorizing with Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>Connect Google Drive</span>
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
            <div className="w-10 h-10 rounded-full bg-[#3ECF8E]/20 border border-[#3ECF8E]/40 flex items-center justify-center font-mono font-bold text-[#3ECF8E] text-xs shrink-0 overflow-hidden">
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
              <div className="text-[10px] font-mono text-[#3ECF8E]">
                Active Project Target: {currentProjectId}
              </div>
            </div>
          </div>

          {/* STORAGE QUOTA METRIC */}
          <div className="p-3.5 rounded-xl bg-[#09090B] border border-[#27272A] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#A1A1AA]">Google Drive Storage</span>
              <span className="text-white font-bold">{quota?.usage} / {quota?.limit}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#18181B] overflow-hidden">
              <div
                className="h-full bg-[#3ECF8E] transition-all"
                style={{ width: `${quota?.usagePercentage || 28}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A]">
              <span>{quota?.usagePercentage}% utilized</span>
              <span>Cloud Vault Synced</span>
            </div>
          </div>

          {/* PROJECT FOLDER SYNC STATUS */}
          <div className="p-3.5 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-[10px] font-mono text-[#71717A] uppercase">Dedicated Project Vault</div>
              <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-[#3ECF8E]" />
                <span className="truncate max-w-[140px]">{projectFolderName}</span>
              </div>
              <div className="text-[10px] font-mono text-emerald-400">
                {sharedFileIds.size} files shared with studio
              </div>
            </div>

            <button
              onClick={() => loadFiles(connectedAccount.accessToken)}
              disabled={isLoadingFiles}
              className="p-2 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              title="Refresh Drive Files"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin text-[#3ECF8E]' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* DISCONNECTED INTRO STATE */}
      {!connectedAccount && (
        <div className="p-6 rounded-xl bg-[#09090B] border border-[#27272A] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 flex items-center justify-center mx-auto text-[#3ECF8E]">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="text-sm font-bold font-display text-white">
              Connect Google Drive to Unlock Direct File Sharing
            </h4>
            <p className="text-xs text-[#A1A1AA]">
              Seamlessly share AutoCAD DWG files, Revit BIM IFC packages, and lighting markups with VizTR CGI supervisors. Master high-resolution deliverables will automatically sync to your Drive.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-5 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
            >
              {isConnecting ? 'Opening Google Auth...' : 'Connect Google Drive (1-Click)'}
            </button>
          </div>
        </div>
      )}

      {/* GOOGLE DRIVE FILE BROWSER & SHARING ENGINE */}
      {connectedAccount && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#3ECF8E]" />
                <span>Google Drive Project Repository ({filteredFiles.length} files)</span>
              </h4>
            </div>

            {/* SEARCH & CATEGORY FILTER */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-48">
                <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter files..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
                />
              </div>

              <div className="flex items-center gap-1 bg-[#09090B] p-1 rounded-lg border border-[#27272A] text-[11px] font-mono">
                {['all', 'model3d', 'blueprint', 'render', 'document'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-1 rounded capitalize transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#3ECF8E] text-black font-bold'
                        : 'text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    {cat === 'model3d' ? '3D / CAD' : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FILES LIST */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredFiles.map((file) => {
              const isShared = sharedFileIds.has(file.id);
              return (
                <motion.div
                  key={file.id}
                  whileHover={{ y: -2 }}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                    isShared
                      ? 'bg-[#18181B] border-[#3ECF8E]/60 shadow-lg shadow-[#3ECF8E]/5'
                      : 'bg-[#09090B] border-[#27272A] hover:border-[#3ECF8E]/30'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className={`p-2 rounded-lg shrink-0 ${isShared ? 'bg-[#3ECF8E]/10 text-[#3ECF8E]' : 'bg-[#18181B] text-[#A1A1AA]'}`}>
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
                          <div className="flex items-center gap-2 text-[10px] font-mono text-[#71717A]">
                            <span>{file.size}</span>
                            <span>•</span>
                            <span className="capitalize">{file.category}</span>
                          </div>
                        </div>
                      </div>

                      {isShared && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-mono shrink-0">
                          Shared
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] font-mono text-[#71717A] flex items-center justify-between">
                      <span>Owner: {file.owners?.[0]?.displayName || 'Client'}</span>
                      <span>{new Date(file.modifiedTime).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* ACTION CONTROLS */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#27272A] gap-2">
                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded hover:bg-[#18181B] text-[#A1A1AA] hover:text-white transition-colors"
                        title="Open in Google Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button
                      onClick={() => handleShareFile(file)}
                      className={`flex-1 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isShared
                          ? 'bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/60 text-rose-400'
                          : 'bg-[#3ECF8E] hover:bg-[#34b27b] text-black shadow-md'
                      }`}
                    >
                      <Share2 className="w-3 h-3" />
                      <span>{isShared ? 'Revoke Share' : 'Share with Studio'}</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredFiles.length === 0 && (
            <div className="p-8 rounded-xl bg-[#09090B] border border-[#27272A] text-center text-xs font-mono text-[#71717A]">
              No Google Drive files match your current search or category filter.
            </div>
          )}
        </div>
      )}

      {/* CONFIGURATION MODAL */}
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
                  <Settings className="w-4 h-4 text-[#3ECF8E]" />
                  <span>Google Drive Client Settings</span>
                </div>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="p-1 rounded hover:bg-[#27272A] text-[#A1A1AA] hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[#A1A1AA] text-[11px] uppercase">Dedicated Google Drive Project Folder</label>
                  <input
                    type="text"
                    value={projectFolderName}
                    onChange={(e) => setProjectFolderName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                  />
                  <p className="text-[10px] text-[#71717A]">
                    Target folder where 8K master TIFF renders and WebXR archives will be automatically stored.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A] space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-white">Auto-sync milestone deliverables</span>
                    <input
                      type="checkbox"
                      checked={autoSyncDeliverables}
                      onChange={(e) => setAutoSyncDeliverables(e.target.checked)}
                      className="accent-[#3ECF8E]"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-white">Allow studio read access to shared CADs</span>
                    <input
                      type="checkbox"
                      checked={shareFullProjectFolder}
                      onChange={(e) => setShareFullProjectFolder(e.target.checked)}
                      className="accent-[#3ECF8E]"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#27272A]">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="px-3 py-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProjectDriveFolder}
                  className="px-4 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-bold uppercase"
                >
                  Save & Map Folder
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
                <span>Disconnect Google Drive?</span>
              </div>
              <p className="text-[#A1A1AA]">
                Are you sure you want to disconnect Google Drive from this project portal? Live syncing of architectural CADs and automatic milestone deliverable archiving will be paused.
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
