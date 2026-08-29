'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  useSuperAdminStore,
  AdminUser,
  UserRole,
  UserStatus,
  RegionGPUNode,
  FeatureToggle,
  SystemHealthLog
} from '@/lib/super-admin-store';
import { useAppStore } from '@/lib/store';
import {
  Shield,
  Users,
  TrendingUp,
  Cpu,
  SlidersHorizontal,
  Activity,
  DollarSign,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Server,
  Layers,
  Sparkles,
  Zap,
  Globe,
  Lock,
  Unlock,
  Key,
  Mail,
  Phone,
  Building,
  HardDrive,
  Copy,
  Check,
  X,
  Sliders,
  Filter,
  BarChart3,
  Download,
  Terminal,
  Eye,
  Radio,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Wifi,
  Power,
  RotateCw,
  FileText
} from 'lucide-react';

type SuperAdminTab =
  | 'users'
  | 'analytics'
  | 'revenue'
  | 'gpu-monitoring'
  | 'feature-toggles'
  | 'system-health'
  | 'permissions-matrix';

interface SuperAdminPanelProps {
  currentRoleView?: UserRole;
  onSwitchRoleView?: (role: UserRole) => void;
}

export default function SuperAdminPanel({
  currentRoleView = 'SUPER_ADMIN',
  onSwitchRoleView
}: SuperAdminPanelProps) {
  const { showToast } = useAppStore();
  const superAdmin = useSuperAdminStore();

  const [activeTab, setActiveTab] = useState<SuperAdminTab>('users');

  // Search & Filter States for Users
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // User Modals
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<AdminUser | null>(null);

  // New User Form State
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'USER' as UserRole,
    status: 'active' as UserStatus,
    department: '3D Spatial Modeling',
    company: 'VizTR Studio Contractor',
    phone: '',
    twoFactorEnabled: false,
    assignedProjectsCount: 1,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    lastLogin: 'Never'
  });

  // Feature Toggle Filter
  const [featureSearch, setFeatureSearch] = useState('');
  const [featureCategory, setFeatureCategory] = useState<string>('ALL');

  // System Logs Filter
  const [logLevelFilter, setLogLevelFilter] = useState<string>('ALL');
  const [logSearch, setLogSearch] = useState('');

  // GPU Bitrate & Resolution Controls State
  const [globalBitrateMbps, setGlobalBitrateMbps] = useState(25);
  const [resolutionPreset, setResolutionPreset] = useState<'1080p' | '1440p' | '4K'>('1080p');

  // Live Telemetry Simulation Tick
  useEffect(() => {
    if (!superAdmin.isLiveSimulationActive) return;

    const interval = setInterval(() => {
      // Slightly fluctuate GPU loads & FPS
      const currentNodes = useSuperAdminStore.getState().gpuNodes;
      currentNodes.forEach((node) => {
        if (node.status === 'maintenance') return;
        const loadDelta = (Math.random() - 0.48) * 3;
        const newLoad = Math.max(15, Math.min(96, Math.round(node.loadPercentage + loadDelta)));
        const fpsVariance = (Math.random() - 0.5) * 0.4;
        const newFps = Math.min(60.0, Math.max(58.5, parseFloat((node.avgFps + fpsVariance).toFixed(1))));
        const tempVariance = (Math.random() - 0.48) * 0.8;
        const newTemp = Math.round(node.temperatureC + tempVariance);

        useSuperAdminStore.getState().updateGPULoad(node.id, {
          loadPercentage: newLoad,
          avgFps: newFps,
          temperatureC: newTemp
        });
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [superAdmin.isLiveSimulationActive]);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard!`, 'success');
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return superAdmin.users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.department.toLowerCase().includes(userSearch.toLowerCase()) ||
        (user.company && user.company.toLowerCase().includes(userSearch.toLowerCase()));
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [superAdmin.users, userSearch, roleFilter, statusFilter]);

  // Filtered Feature Toggles
  const filteredFeatures = useMemo(() => {
    return superAdmin.featureToggles.filter((f) => {
      const matchesSearch =
        f.name.toLowerCase().includes(featureSearch.toLowerCase()) ||
        f.key.toLowerCase().includes(featureSearch.toLowerCase()) ||
        f.description.toLowerCase().includes(featureSearch.toLowerCase());
      const matchesCat = featureCategory === 'ALL' || f.category === featureCategory;
      return matchesSearch && matchesCat;
    });
  }, [superAdmin.featureToggles, featureSearch, featureCategory]);

  // Filtered System Logs
  const filteredLogs = useMemo(() => {
    return superAdmin.systemLogs.filter((log) => {
      const matchesLevel = logLevelFilter === 'ALL' || log.level === logLevelFilter.toLowerCase();
      const matchesSearch =
        log.message.toLowerCase().includes(logSearch.toLowerCase()) ||
        log.service.toLowerCase().includes(logSearch.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(logSearch.toLowerCase()));
      return matchesLevel && matchesSearch;
    });
  }, [superAdmin.systemLogs, logLevelFilter, logSearch]);

  // Handle Add User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) {
      showToast('Name and Email are required.', 'error');
      return;
    }
    superAdmin.addUser(newUserForm);
    showToast(`Created user ${newUserForm.name} with role [${newUserForm.role}].`, 'success');
    setIsAddUserModalOpen(false);
    setNewUserForm({
      name: '',
      email: '',
      role: 'USER',
      status: 'active',
      department: '3D Spatial Modeling',
      company: 'VizTR Studio Contractor',
      phone: '',
      twoFactorEnabled: false,
      assignedProjectsCount: 1,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      lastLogin: 'Never'
    });
  };

  // Handle Edit User
  const handleSaveEditedUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;
    superAdmin.updateUser(userToEdit.id, userToEdit);
    showToast(`Updated user ${userToEdit.name}.`, 'success');
    setIsEditUserModalOpen(false);
    setUserToEdit(null);
  };

  // Quick Role Change
  const handleRoleQuickChange = (userId: string, newRole: UserRole) => {
    superAdmin.changeUserRole(userId, newRole);
    showToast(`Updated user role to [${newRole}].`, 'success');
  };

  // Helper badge for role
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Shield className="w-3 h-3 text-purple-400" />
            SUPER ADMIN
          </span>
        );
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/30">
            <Zap className="w-3 h-3 text-[#3ECF8E]" />
            STUDIO ADMIN
          </span>
        );
      case 'USER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <Users className="w-3 h-3 text-sky-400" />
            3D ARTIST / USER
          </span>
        );
      case 'CLIENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Building className="w-3 h-3 text-amber-400" />
            VIP CLIENT
          </span>
        );
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        );
      case 'invited':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            Invite Pending
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <X className="w-3 h-3" />
            Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-800 text-zinc-400">
            Inactive
          </span>
        );
    }
  };

  return (
    <div className="space-y-6" id="super-admin-panel-root">
      {/* 1. TOP SUPER ADMIN HEADER & ROLE PREVIEW SWITCHBOARD */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#18181B] via-[#14151C] to-[#101014] border border-[#27272A] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#3ECF8E]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-md">
                <Shield className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
                Super Admin Governance & Infrastructure
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                ROOT PRIVILEGES ACTIVE
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA] max-w-3xl">
              Central command console for full-spectrum user RBAC management, monthly recurring revenue telemetry, global GPU Pixel Streaming nodes, feature switchboard, and live diagnostic health.
            </p>
          </div>

          {/* Global Actions & Role-Specific View Switcher */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Role View Switcher */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-[#09090B] border border-[#27272A]">
              <span className="text-[10px] font-mono font-bold text-[#71717A] px-2 uppercase">
                Active View:
              </span>
              {(['SUPER_ADMIN', 'ADMIN', 'USER', 'CLIENT'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    if (onSwitchRoleView) onSwitchRoleView(r);
                    showToast(`Switched active preview role to ${r}`, 'info');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                    currentRoleView === r
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-[#27272A]'
                  }`}
                >
                  {r === 'SUPER_ADMIN'
                    ? 'Super Admin'
                    : r === 'ADMIN'
                    ? 'Studio Admin'
                    : r === 'USER'
                    ? '3D Artist'
                    : 'VIP Client'}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                superAdmin.toggleLiveSimulation();
                showToast(
                  superAdmin.isLiveSimulationActive
                    ? 'Paused live GPU telemetry simulation'
                    : 'Resumed real-time GPU telemetry simulation',
                  'info'
                );
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                superAdmin.isLiveSimulationActive
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                  : 'bg-[#27272A]/70 border-[#3F3F46] text-zinc-400'
              }`}
              title="Toggle simulated telemetry data feed"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  superAdmin.isLiveSimulationActive ? 'bg-emerald-400 animate-ping' : 'bg-zinc-500'
                }`}
              />
              <span>{superAdmin.isLiveSimulationActive ? 'Live Telemetry ON' : 'Telemetry Paused'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#27272A] scrollbar-thin">
        {[
          { id: 'users', label: 'Admins & Users', icon: Users, count: superAdmin.users.length },
          { id: 'analytics', label: 'System Analytics', icon: BarChart3 },
          { id: 'revenue', label: 'Revenue & MRR Tracking', icon: DollarSign },
          { id: 'gpu-monitoring', label: 'GPU & Pixel Streaming Fleet', icon: Server, count: superAdmin.gpuNodes.length },
          { id: 'feature-toggles', label: 'Feature Switchboard', icon: SlidersHorizontal, count: superAdmin.featureToggles.length },
          { id: 'system-health', label: 'Global Health & Error Logs', icon: Activity, count: superAdmin.systemLogs.length },
          { id: 'permissions-matrix', label: 'RBAC Permissions Matrix', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SuperAdminTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-[#18181B] text-[#A1A1AA] hover:text-white hover:bg-[#27272A] border border-[#27272A]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#27272A] text-[#A1A1AA]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. TAB CONTENT VIEWS */}

      {/* ============================================================ */}
      {/* TAB 1: MANAGE ADMINS & USERS                                 */}
      {/* ============================================================ */}
      {activeTab === 'users' && (
        <div className="space-y-6" id="super-admin-users-tab">
          {/* Top Filter and Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
            <div className="flex items-center gap-2.5 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
                <input
                  type="text"
                  placeholder="Search users by name, email, department, company..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-purple-500 font-mono"
                />
                {userSearch && (
                  <button
                    onClick={() => setUserSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Role filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs text-zinc-300 font-mono focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="ALL">All Roles ({superAdmin.users.length})</option>
                <option value="SUPER_ADMIN">Super Admins</option>
                <option value="ADMIN">Studio Admins</option>
                <option value="USER">3D Artists / Users</option>
                <option value="CLIENT">VIP Clients</option>
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs text-zinc-300 font-mono focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="active">Active</option>
                <option value="invited">Invited</option>
                <option value="suspended">Suspended</option>
              </select>

              {/* Add User Button */}
              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Admin / User</span>
              </button>
            </div>
          </div>

          {/* User Table */}
          <div className="rounded-xl bg-[#18181B] border border-[#27272A] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#27272A] bg-[#121214] text-[#A1A1AA] font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4 font-bold">User Identity</th>
                    <th className="py-3 px-4 font-bold">Role & Authority</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold">Department / Organization</th>
                    <th className="py-3 px-4 font-bold">2FA</th>
                    <th className="py-3 px-4 font-bold">Assigned</th>
                    <th className="py-3 px-4 font-bold">Last Activity</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A]/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#71717A] font-mono">
                        No users or administrators found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-[#27272A]/40 transition-colors group"
                      >
                        {/* User Identity */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#3F3F46] shrink-0">
                              <Image
                                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                                alt={user.name}
                                fill
                                className="object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <div className="font-bold text-white font-display flex items-center gap-1.5">
                                <span>{user.name}</span>
                                {user.role === 'SUPER_ADMIN' && (
                                  <Shield className="w-3.5 h-3.5 text-purple-400 inline" />
                                )}
                              </div>
                              <div className="text-[11px] text-[#A1A1AA] font-mono flex items-center gap-1">
                                <span>{user.email}</span>
                                <button
                                  onClick={() => handleCopy(user.email, 'email')}
                                  className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity cursor-pointer"
                                  title="Copy Email"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role Selector */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            {getRoleBadge(user.role)}
                            {/* Inline Role Quick Switch */}
                            <div className="pt-1">
                              <select
                                value={user.role}
                                onChange={(e) => handleRoleQuickChange(user.id, e.target.value as UserRole)}
                                className="text-[10px] font-mono bg-[#09090B] border border-[#27272A] rounded px-1.5 py-0.5 text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                                title="Change User Role"
                              >
                                <option value="SUPER_ADMIN">Promote: SUPER_ADMIN</option>
                                <option value="ADMIN">Set: STUDIO ADMIN</option>
                                <option value="USER">Set: 3D ARTIST</option>
                                <option value="CLIENT">Set: VIP CLIENT</option>
                              </select>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {getStatusBadge(user.status)}
                        </td>

                        {/* Department / Org */}
                        <td className="py-3.5 px-4 font-mono text-zinc-300">
                          <div>{user.department}</div>
                          {user.company && (
                            <div className="text-[10px] text-[#71717A]">{user.company}</div>
                          )}
                        </td>

                        {/* 2FA */}
                        <td className="py-3.5 px-4">
                          {user.twoFactorEnabled ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              2FA Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#71717A]">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Disabled
                            </span>
                          )}
                        </td>

                        {/* Assigned Projects */}
                        <td className="py-3.5 px-4 font-mono text-zinc-300">
                          <span className="px-2 py-0.5 rounded bg-[#27272A] text-white font-bold">
                            {user.assignedProjectsCount} projects
                          </span>
                        </td>

                        {/* Last Activity */}
                        <td className="py-3.5 px-4 font-mono text-[#71717A]">
                          {user.lastLogin}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setUserToEdit({ ...user });
                                setIsEditUserModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-[#27272A]/70 hover:bg-[#27272A] border border-[#3F3F46] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                              title="Edit User Profile & Permissions"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                const newStatus: UserStatus = user.status === 'suspended' ? 'active' : 'suspended';
                                superAdmin.changeUserStatus(user.id, newStatus);
                                showToast(
                                  `User ${user.name} is now [${newStatus.toUpperCase()}].`,
                                  newStatus === 'active' ? 'success' : 'info'
                                );
                              }}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                user.status === 'suspended'
                                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400 hover:bg-emerald-900/80'
                                  : 'bg-amber-950/60 border-amber-800 text-amber-400 hover:bg-amber-900/80'
                              }`}
                              title={user.status === 'suspended' ? 'Reactivate Account' : 'Suspend Account'}
                            >
                              {user.status === 'suspended' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to permanently delete user "${user.name}" (${user.email})?`)) {
                                  superAdmin.deleteUser(user.id);
                                  showToast(`Permanently removed user ${user.name}.`, 'info');
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/80 border border-rose-800/80 text-rose-300 transition-colors cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Count */}
            <div className="p-3.5 bg-[#121214] border-t border-[#27272A] flex items-center justify-between text-xs font-mono text-[#A1A1AA]">
              <div>
                Showing {filteredUsers.length} of {superAdmin.users.length} registered accounts
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  Super Admins: {superAdmin.users.filter((u) => u.role === 'SUPER_ADMIN').length}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#3ECF8E]" />
                  Admins: {superAdmin.users.filter((u) => u.role === 'ADMIN').length}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  Artists: {superAdmin.users.filter((u) => u.role === 'USER').length}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Clients: {superAdmin.users.filter((u) => u.role === 'CLIENT').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: SYSTEM ANALYTICS & PROJECT METRICS                   */}
      {/* ============================================================ */}
      {activeTab === 'analytics' && (
        <div className="space-y-6" id="super-admin-analytics-tab">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-2">
              <div className="flex items-center justify-between text-[#A1A1AA]">
                <span className="text-xs font-mono uppercase tracking-wider font-bold">Total Platform Users</span>
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold font-display text-white">1,482</span>
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +28.4%
                </span>
              </div>
              <p className="text-[11px] text-[#71717A] font-mono">142 active enterprise accounts this week</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-2">
              <div className="flex items-center justify-between text-[#A1A1AA]">
                <span className="text-xs font-mono uppercase tracking-wider font-bold">Commissions & Projects</span>
                <Layers className="w-4 h-4 text-[#3ECF8E]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold font-display text-white">216</span>
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +14.2%
                </span>
              </div>
              <p className="text-[11px] text-[#71717A] font-mono">42 active pipelines, 174 delivered</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-2">
              <div className="flex items-center justify-between text-[#A1A1AA]">
                <span className="text-xs font-mono uppercase tracking-wider font-bold">GPU Streaming Compute</span>
                <Cpu className="w-4 h-4 text-sky-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold font-display text-white">12,480h</span>
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +44.1%
                </span>
              </div>
              <p className="text-[11px] text-[#71717A] font-mono">99.98% zero-jitter stream delivery</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-2">
              <div className="flex items-center justify-between text-[#A1A1AA]">
                <span className="text-xs font-mono uppercase tracking-wider font-bold">Multi-Cloud Storage</span>
                <HardDrive className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold font-display text-white">48.6 TB</span>
                <span className="text-xs font-mono font-bold text-sky-400 flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +6.8 TB
                </span>
              </div>
              <p className="text-[11px] text-[#71717A] font-mono">S3 + R2 + Drive synchronized</p>
            </div>
          </div>

          {/* Project Distribution & User Growth Visualizers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visualizer 1: Project Type Breakdown */}
            <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-display text-white">Project Category Distribution</h3>
                  <p className="text-xs text-[#A1A1AA]">Live commissions divided by spatial format</p>
                </div>
                <span className="text-xs font-mono text-[#3ECF8E] font-bold">Active 2025 Fleet</span>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { name: 'Unreal 5.4 Pixel Streaming Worlds', count: 78, pct: 36, color: 'bg-purple-500' },
                  { name: '8K Photoreal ArchViz Renders & CGI', count: 64, pct: 30, color: 'bg-[#3ECF8E]' },
                  { name: 'WebXR 3D Spatial & Apple Vision Pro', count: 46, pct: 21, color: 'bg-sky-500' },
                  { name: '360 Panoramic Virtual Tours & Matterport', count: 28, pct: 13, color: 'bg-amber-500' },
                ].map((item) => (
                  <div key={item.name} className="space-y-1.5 font-mono text-xs">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>{item.name}</span>
                      <span className="font-bold text-white">
                        {item.count} projects ({item.pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#27272A] overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visualizer 2: Average Turnaround & Velocity */}
            <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-display text-white">Studio Pipeline Velocity</h3>
                  <p className="text-xs text-[#A1A1AA]">Average stage progression and client approval speed</p>
                </div>
                <span className="text-xs font-mono text-purple-400 font-bold">SLA Tracker</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-[#121214] border border-[#27272A] space-y-1">
                  <div className="text-[10px] font-mono text-[#A1A1AA] uppercase">Average Turnaround</div>
                  <div className="text-xl font-bold font-display text-white">8.4 Days</div>
                  <div className="text-[10px] text-emerald-400 font-mono">-2.1 days vs 2024</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#121214] border border-[#27272A] space-y-1">
                  <div className="text-[10px] font-mono text-[#A1A1AA] uppercase">Milestone Approval Speed</div>
                  <div className="text-xl font-bold font-display text-white">4.2 Hours</div>
                  <div className="text-[10px] text-emerald-400 font-mono">Fast-tracked VIP portal</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#121214] border border-[#27272A] space-y-1">
                  <div className="text-[10px] font-mono text-[#A1A1AA] uppercase">Mesh Draco Compression</div>
                  <div className="text-xl font-bold font-display text-white">74.6% Avg</div>
                  <div className="text-[10px] text-sky-400 font-mono">1.2 GB saves daily</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#121214] border border-[#27272A] space-y-1">
                  <div className="text-[10px] font-mono text-[#A1A1AA] uppercase">Client Retention Rate</div>
                  <div className="text-xl font-bold font-display text-white">96.8%</div>
                  <div className="text-[10px] text-purple-400 font-mono">Enterprise repeat studio</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: REVENUE TRACKING & MONTHLY RECURRING REVENUE (MRR)   */}
      {/* ============================================================ */}
      {activeTab === 'revenue' && (
        <div className="space-y-6" id="super-admin-revenue-tab">
          {/* Top Revenue Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-[#18181B] to-[#121214] border border-emerald-800/40 space-y-2">
              <div className="flex items-center justify-between text-[#A1A1AA]">
                <span className="text-xs font-mono uppercase tracking-wider font-bold">Monthly Recurring (MRR)</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold font-display text-white">
                  ${superAdmin.currentMRR.toLocaleString()}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +{superAdmin.growthRateMom}%
                </span>
              </div>
              <p className="text-[11px] text-[#71717A] font-mono">Retainer studios & GPU hosting</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-[#18181B] to-[#121214] border border-purple-800/40 space-y-2">
              <div className="flex items-center justify-between text-[#A1A1AA]">
                <span className="text-xs font-mono uppercase tracking-wider font-bold">Annual Run Rate (ARR)</span>
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold font-display text-white">
                  ${(superAdmin.currentARR / 1000000).toFixed(2)}M
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" /> Proj. $2.4M
                </span>
              </div>
              <p className="text-[11px] text-[#71717A] font-mono">12-month forward projection</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-2">
              <div className="flex items-center justify-between text-[#A1A1AA]">
                <span className="text-xs font-mono uppercase tracking-wider font-bold">August Total Gross</span>
                <BarChart3 className="w-4 h-4 text-sky-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold font-display text-white">$357,000</span>
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +14.1%
                </span>
              </div>
              <p className="text-[11px] text-[#71717A] font-mono">Commissions + Subscriptions</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-2">
              <div className="flex items-center justify-between text-[#A1A1AA]">
                <span className="text-xs font-mono uppercase tracking-wider font-bold">Net Operating Margin</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold font-display text-white">80.1%</span>
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center">
                  +$286,000 Net
                </span>
              </div>
              <p className="text-[11px] text-[#71717A] font-mono">After GPU cluster & cloud egress</p>
            </div>
          </div>

          {/* Interactive Historical Revenue Trend Chart (SVG / Bar) */}
          <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold font-display text-white">Monthly Revenue & MRR Growth Trajectory</h3>
                <p className="text-xs text-[#A1A1AA]">Historical breakdown of MRR vs. one-off bespoke commissions vs. expenses</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500" /> Total Revenue
                </span>
                <span className="flex items-center gap-1.5 text-purple-400">
                  <span className="w-3 h-3 rounded-sm bg-purple-500" /> MRR Retainers
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-3 h-3 rounded-sm bg-rose-500/80" /> Cloud Expenses
                </span>
              </div>
            </div>

            {/* Bar Visualizer */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {superAdmin.revenueHistory.map((metric) => {
                const maxTotal = 400000;
                const totalHeightPct = Math.min(100, Math.round((metric.total / maxTotal) * 100));
                const mrrHeightPct = Math.min(100, Math.round((metric.mrr / maxTotal) * 100));
                const expenseHeightPct = Math.min(100, Math.round((metric.expenses / maxTotal) * 100));

                return (
                  <div
                    key={metric.month}
                    className="p-3 rounded-xl bg-[#121214] border border-[#27272A] hover:border-purple-500/50 transition-all flex flex-col justify-between group"
                  >
                    <div className="text-center font-mono space-y-1">
                      <div className="text-xs font-bold text-white">{metric.month}</div>
                      <div className="text-[10px] text-emerald-400 font-bold">${(metric.total / 1000).toFixed(0)}k Gross</div>
                    </div>

                    {/* Bars */}
                    <div className="h-40 flex items-end justify-center gap-1.5 py-2 border-b border-[#27272A]">
                      {/* Total Bar */}
                      <div className="w-4 bg-[#27272A] rounded-t relative h-full flex items-end">
                        <div
                          className="w-full bg-emerald-500 rounded-t group-hover:bg-emerald-400 transition-all"
                          style={{ height: `${totalHeightPct}%` }}
                          title={`Total: $${metric.total.toLocaleString()}`}
                        />
                      </div>

                      {/* MRR Bar */}
                      <div className="w-4 bg-[#27272A] rounded-t relative h-full flex items-end">
                        <div
                          className="w-full bg-purple-500 rounded-t group-hover:bg-purple-400 transition-all"
                          style={{ height: `${mrrHeightPct}%` }}
                          title={`MRR: $${metric.mrr.toLocaleString()}`}
                        />
                      </div>

                      {/* Expense Bar */}
                      <div className="w-2.5 bg-[#27272A] rounded-t relative h-full flex items-end">
                        <div
                          className="w-full bg-rose-500/80 rounded-t group-hover:bg-rose-400 transition-all"
                          style={{ height: `${expenseHeightPct}%` }}
                          title={`Expenses: $${metric.expenses.toLocaleString()}`}
                        />
                      </div>
                    </div>

                    <div className="pt-2 text-center text-[10px] font-mono space-y-0.5">
                      <div className="text-[#A1A1AA]">Net Margin:</div>
                      <div className="text-white font-bold">${(metric.netMargin / 1000).toFixed(0)}k</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Invoices Ledger */}
          <div className="rounded-xl bg-[#18181B] border border-[#27272A] overflow-hidden">
            <div className="p-4 bg-[#121214] border-b border-[#27272A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                  Recent High-Value Studio Invoices
                </h4>
              </div>
              <span className="text-[11px] font-mono text-[#A1A1AA]">Stripe & Wire Auto-Reconciled</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#27272A] bg-[#09090B] text-[#71717A] text-[10px] uppercase">
                    <th className="py-2.5 px-4">Invoice #</th>
                    <th className="py-2.5 px-4">Client Organization</th>
                    <th className="py-2.5 px-4">Project / Milestone</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A]/50">
                  {[
                    { id: 'INV-2025-0891', client: 'Vance Luxury Towers LLC (Dubai)', project: 'The Apex Tower (Stage 4)', amount: '$28,500.00', status: 'PAID', date: 'Aug 26, 2025' },
                    { id: 'INV-2025-0890', client: 'Nordic Monolith Architects (Stockholm)', project: 'Nordic Monolith (Retainer)', amount: '$14,200.00', status: 'PAID', date: 'Aug 24, 2025' },
                    { id: 'INV-2025-0889', client: 'Solarium Holdings (London)', project: 'VR Penthouse Experience', amount: '$36,000.00', status: 'PENDING', date: 'Aug 22, 2025' },
                    { id: 'INV-2025-0888', client: 'Tokyo Waterfront Urban Development', project: 'Unreal Pixel Streaming GPU Node Fleet', amount: '$18,500.00', status: 'PAID', date: 'Aug 19, 2025' },
                  ].map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#27272A]/30">
                      <td className="py-3 px-4 font-bold text-purple-400">{inv.id}</td>
                      <td className="py-3 px-4 text-white font-sans font-medium">{inv.client}</td>
                      <td className="py-3 px-4 text-[#A1A1AA]">{inv.project}</td>
                      <td className="py-3 px-4 font-bold text-white">{inv.amount}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => showToast(`Generated PDF receipt for ${inv.id}`, 'success')}
                          className="px-2.5 py-1 rounded bg-[#27272A] hover:bg-[#3F3F46] text-white text-[11px] font-mono transition-colors cursor-pointer"
                        >
                          PDF Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: GPU USAGE MONITORING (PIXEL STREAMING PER REGION)      */}
      {/* ============================================================ */}
      {activeTab === 'gpu-monitoring' && (
        <div className="space-y-6" id="super-admin-gpu-tab">
          {/* Header & Global GPU Control Bar */}
          <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold font-display text-white">
                  Global Unreal Engine 5.4 GPU Edge Cluster
                </h3>
              </div>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                Real-time WebRTC hardware encoding, VRAM telemetry, thermal load, and regional scale switchboard.
              </p>
            </div>

            {/* Global WebRTC Stream Tuning Controls */}
            <div className="flex items-center gap-4 flex-wrap bg-[#121214] p-2.5 rounded-lg border border-[#27272A]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#A1A1AA] uppercase">Bitrate Limit:</span>
                <span className="text-xs font-mono font-bold text-[#3ECF8E]">{globalBitrateMbps} Mbps</span>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={globalBitrateMbps}
                  onChange={(e) => {
                    setGlobalBitrateMbps(Number(e.target.value));
                    showToast(`Updated global WebRTC bitrate ceiling to ${e.target.value} Mbps`, 'info');
                  }}
                  className="w-20 accent-[#3ECF8E] cursor-pointer"
                />
              </div>

              <div className="h-4 w-px bg-[#27272A]" />

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-[#A1A1AA] uppercase">Max Res:</span>
                {(['1080p', '1440p', '4K'] as const).map((res) => (
                  <button
                    key={res}
                    onClick={() => {
                      setResolutionPreset(res);
                      showToast(`Switched global pixel streaming encoding preset to ${res}`, 'success');
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      resolutionPreset === res
                        ? 'bg-[#3ECF8E] text-black font-bold'
                        : 'bg-[#27272A] text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Regional GPU Node Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {superAdmin.gpuNodes.map((node) => {
              const isHighLoad = node.loadPercentage > 80;
              const isMedLoad = node.loadPercentage > 60 && node.loadPercentage <= 80;
              const isMaint = node.status === 'maintenance';

              return (
                <div
                  key={node.id}
                  className={`p-5 rounded-2xl border transition-all space-y-4 relative overflow-hidden ${
                    isMaint
                      ? 'bg-[#141416] border-zinc-700/60 opacity-80'
                      : isHighLoad
                      ? 'bg-gradient-to-br from-amber-950/20 via-[#18181B] to-[#121214] border-amber-800/60'
                      : 'bg-gradient-to-br from-[#18181B] via-[#14151C] to-[#121214] border-[#27272A] hover:border-purple-500/50'
                  }`}
                >
                  {/* Region Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{node.flagEmoji}</span>
                        <h4 className="font-bold text-white text-sm font-display">{node.regionName}</h4>
                      </div>
                      <div className="text-[11px] text-[#A1A1AA] font-mono">{node.regionCode}</div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                        isMaint
                          ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          : isHighLoad
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {node.status}
                    </span>
                  </div>

                  {/* GPU Specs */}
                  <div className="p-3 rounded-xl bg-[#09090B] border border-[#27272A] space-y-1 text-xs font-mono">
                    <div className="text-purple-400 font-bold flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>{node.gpuModel}</span>
                    </div>
                    <div className="text-[10px] text-[#71717A]">{node.instanceType}</div>
                  </div>

                  {/* Load Gauge */}
                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#A1A1AA]">Compute Load:</span>
                      <span
                        className={`font-bold ${
                          isHighLoad ? 'text-amber-400' : isMedLoad ? 'text-sky-400' : 'text-emerald-400'
                        }`}
                      >
                        {isMaint ? '0%' : `${node.loadPercentage}%`}
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#09090B] border border-[#27272A] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isMaint
                            ? 'bg-zinc-600'
                            : isHighLoad
                            ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                            : isMedLoad
                            ? 'bg-gradient-to-r from-sky-500 to-purple-500'
                            : 'bg-gradient-to-r from-emerald-500 to-[#3ECF8E]'
                        }`}
                        style={{ width: `${isMaint ? 0 : node.loadPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Metrics 4-Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded-lg bg-[#121214] border border-[#27272A]/80 space-y-0.5">
                      <div className="text-[10px] text-[#71717A] uppercase">Active Sessions</div>
                      <div className="font-bold text-white">
                        {node.activeSessions} / {node.maxSessions}
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-[#121214] border border-[#27272A]/80 space-y-0.5">
                      <div className="text-[10px] text-[#71717A] uppercase">VRAM Allocation</div>
                      <div className="font-bold text-sky-400">
                        {node.vramUsedGB} / {node.vramTotalGB} GB
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-[#121214] border border-[#27272A]/80 space-y-0.5">
                      <div className="text-[10px] text-[#71717A] uppercase">Ping / Latency</div>
                      <div className="font-bold text-emerald-400 flex items-center gap-1">
                        <Wifi className="w-3 h-3" />
                        {node.avgLatencyMs} ms
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-[#121214] border border-[#27272A]/80 space-y-0.5">
                      <div className="text-[10px] text-[#71717A] uppercase">Avg FPS / Temp</div>
                      <div className="font-bold text-white flex items-center gap-1">
                        <span>{node.avgFps} FPS</span>
                        <span className="text-[10px] text-amber-400">({node.temperatureC}°C)</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Scaler Bar */}
                  <div className="pt-2 border-t border-[#27272A] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-[#71717A]">Scale:</span>
                      <button
                        onClick={() => superAdmin.scaleRegionNodes(node.id, -1)}
                        className="w-6 h-6 rounded bg-[#27272A] hover:bg-[#3F3F46] text-white flex items-center justify-center text-xs font-mono font-bold cursor-pointer"
                        title="Reduce GPU Nodes"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono font-bold text-white px-1">
                        {node.activeNodes}
                      </span>
                      <button
                        onClick={() => superAdmin.scaleRegionNodes(node.id, 1)}
                        className="w-6 h-6 rounded bg-[#27272A] hover:bg-[#3F3F46] text-white flex items-center justify-center text-xs font-mono font-bold cursor-pointer"
                        title="Add GPU Node"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          superAdmin.toggleNodeMaintenance(node.id);
                          showToast(`Toggled maintenance mode for ${node.regionName}`, 'info');
                        }}
                        className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                          isMaint
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                        }`}
                      >
                        {isMaint ? 'Exit Maint.' : 'Drain / Maint.'}
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Restart GPU cluster for ${node.regionName}? Active sessions will be migrated.`)) {
                            superAdmin.restartRegionGPU(node.id);
                            showToast(`Dispatched warm restart to ${node.regionName}`, 'info');
                          }
                        }}
                        className="p-1.5 rounded bg-rose-950/50 hover:bg-rose-900 border border-rose-800/60 text-rose-400 transition-colors cursor-pointer"
                        title="Restart Regional GPU Cluster"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: FEATURE TOGGLES SWITCHBOARD                           */}
      {/* ============================================================ */}
      {activeTab === 'feature-toggles' && (
        <div className="space-y-6" id="super-admin-toggles-tab">
          {/* Top Filter and Info Bar */}
          <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
                <input
                  type="text"
                  placeholder="Filter feature flags & kill-switches..."
                  value={featureSearch}
                  onChange={(e) => setFeatureSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={featureCategory}
                onChange={(e) => setFeatureCategory(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs text-zinc-300 font-mono focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="xr">Spatial WebXR & AR</option>
                <option value="rendering">Pixel Streaming & Rendering</option>
                <option value="ai">Gemini AI Features</option>
                <option value="storage">Multi-Cloud Storage</option>
                <option value="security">Security & 2FA</option>
                <option value="core">Core Platform</option>
              </select>

              <button
                onClick={() => {
                  if (confirm('Reset all feature flags to initial factory defaults?')) {
                    superAdmin.resetFeatureToggles();
                    showToast('Reset all feature toggles to factory state.', 'info');
                  }
                }}
                className="px-3 py-2 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-zinc-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>
          </div>

          {/* Toggle Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFeatures.map((toggle) => (
              <div
                key={toggle.key}
                className={`p-5 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                  toggle.enabled
                    ? 'bg-gradient-to-br from-[#18181B] via-[#14151C] to-[#121214] border-[#27272A] hover:border-purple-500/50'
                    : 'bg-[#121214] border-zinc-800 opacity-70'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm font-display">{toggle.name}</h4>
                        <span className="px-2 py-0.2 rounded text-[9px] font-mono uppercase bg-[#27272A] text-[#A1A1AA]">
                          {toggle.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#A1A1AA] leading-relaxed">{toggle.description}</p>
                    </div>

                    {/* Master Switch */}
                    <button
                      onClick={() => {
                        superAdmin.toggleFeature(toggle.key);
                        showToast(
                          `${toggle.name} is now ${!toggle.enabled ? 'ENABLED' : 'DISABLED'}.`,
                          !toggle.enabled ? 'success' : 'info'
                        );
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        toggle.enabled ? 'bg-purple-600' : 'bg-[#27272A]'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          toggle.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#09090B] border border-[#27272A] font-mono text-[10px] text-[#71717A] flex items-center justify-between">
                    <span className="text-purple-400 font-bold">{toggle.key}</span>
                    <span>Env: {toggle.environment}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#27272A] flex items-center justify-between text-[10px] font-mono text-[#71717A]">
                  <div>Modified by {toggle.lastModifiedBy}</div>
                  <div>{new Date(toggle.lastModifiedAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 6: GLOBAL SYSTEM HEALTH & LIVE ERROR LOGS                */}
      {/* ============================================================ */}
      {activeTab === 'system-health' && (
        <div className="space-y-6" id="super-admin-health-tab">
          {/* Subsystem Health Status Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { service: 'PostgreSQL DB', status: 'Operational', ping: '12ms', color: 'emerald' },
              { service: 'Firebase Auth', status: 'Operational', ping: '24ms', color: 'emerald' },
              { service: 'Google Meet Fleet', status: 'Operational', ping: '38ms', color: 'emerald' },
              { service: 'AWS S3 & Cloudflare', status: 'Operational', ping: '16ms', color: 'emerald' },
              { service: 'TURN Signaling', status: 'Operational', ping: '19ms', color: 'emerald' },
              { service: 'Gemini AI Vision', status: 'Operational', ping: '140ms', color: 'emerald' },
            ].map((sub) => (
              <div key={sub.service} className="p-3.5 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1.5 font-mono">
                <div className="flex items-center justify-between">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-[#71717A]">{sub.ping}</span>
                </div>
                <div className="text-xs font-bold text-white truncate">{sub.service}</div>
                <div className="text-[10px] text-emerald-400 font-semibold">{sub.status}</div>
              </div>
            ))}
          </div>

          {/* Diagnostic Log Console */}
          <div className="rounded-2xl bg-[#09090B] border border-[#27272A] overflow-hidden shadow-2xl space-y-0">
            {/* Terminal Header */}
            <div className="p-4 bg-[#121214] border-b border-[#27272A] flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Terminal className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                  Live Global Diagnostic & Telemetry Stream
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold">
                  STREAMING ACTIVE
                </span>
              </div>

              {/* Filter & Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-purple-500 font-mono w-40"
                  />
                </div>

                <select
                  value={logLevelFilter}
                  onChange={(e) => setLogLevelFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-xs text-zinc-300 font-mono focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Levels</option>
                  <option value="info">INFO</option>
                  <option value="warn">WARN</option>
                  <option value="error">ERROR</option>
                  <option value="critical">CRITICAL</option>
                </select>

                <button
                  onClick={() => {
                    superAdmin.addLog({
                      level: 'warn',
                      service: 'ManualHealthCheck',
                      message: `Super Admin triggered simulated diagnostic ping to cluster. All nodes responsive.`
                    });
                    showToast('Dispatched manual health check ping.', 'info');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-mono transition-colors cursor-pointer"
                >
                  Ping Diagnostic
                </button>

                <button
                  onClick={() => {
                    superAdmin.clearLogs();
                    showToast('Cleared diagnostic logs.', 'info');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-mono transition-colors cursor-pointer"
                >
                  Clear Logs
                </button>
              </div>
            </div>

            {/* Log Stream Viewer */}
            <div className="p-4 max-h-96 overflow-y-auto space-y-2 font-mono text-xs divide-y divide-[#27272A]/40 scrollbar-thin">
              {filteredLogs.length === 0 ? (
                <div className="py-8 text-center text-[#71717A]">
                  No log entries matching the current filter.
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const isErr = log.level === 'error' || log.level === 'critical';
                  const isWarn = log.level === 'warn';

                  return (
                    <div key={log.id} className="pt-2 flex items-start gap-3 group">
                      <span className="text-[#71717A] text-[11px] shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>

                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 uppercase ${
                          log.level === 'critical'
                            ? 'bg-rose-600 text-white animate-pulse'
                            : isErr
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : isWarn
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                        }`}
                      >
                        {log.level}
                      </span>

                      <span className="text-purple-400 font-bold shrink-0">[{log.service}]</span>

                      <div className="flex-1 text-zinc-200">
                        <span>{log.message}</span>
                        {log.details && (
                          <div className="text-[11px] text-[#A1A1AA] mt-0.5">{log.details}</div>
                        )}
                      </div>

                      {log.region && (
                        <span className="text-[10px] text-[#71717A] shrink-0 font-mono">
                          {log.region}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 7: RBAC PERMISSIONS MATRIX                              */}
      {/* ============================================================ */}
      {activeTab === 'permissions-matrix' && (
        <div className="space-y-6" id="super-admin-matrix-tab">
          <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold font-display text-white">
                Role-Based Access Control (RBAC) Governance Matrix
              </h3>
            </div>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              Granular breakdown of system actions allowed across Super Admin, Studio Admin, 3D Artist, and VIP Client accounts.
            </p>
          </div>

          <div className="rounded-xl bg-[#18181B] border border-[#27272A] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#27272A] bg-[#121214] text-[#A1A1AA] uppercase text-[11px]">
                    <th className="py-3 px-4 font-bold">System Capability / Action</th>
                    <th className="py-3 px-4 font-bold text-center text-purple-400">Super Admin</th>
                    <th className="py-3 px-4 font-bold text-center text-[#3ECF8E]">Studio Admin</th>
                    <th className="py-3 px-4 font-bold text-center text-sky-400">3D Artist</th>
                    <th className="py-3 px-4 font-bold text-center text-amber-400">VIP Client</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A]/60 text-zinc-300">
                  {[
                    { action: 'Manage Super Admins & Demote Roles', superAdmin: true, admin: false, artist: false, client: false },
                    { action: 'Configure Global Feature Toggles & Switchboard', superAdmin: true, admin: false, artist: false, client: false },
                    { action: 'Scale & Restart GPU Pixel Streaming Fleet', superAdmin: true, admin: false, artist: false, client: false },
                    { action: 'View Full Revenue, MRR & Financial Ledgers', superAdmin: true, admin: false, artist: false, client: false },
                    { action: 'Full CMS Editing (Pages, Blogs, SEO, Theme)', superAdmin: true, admin: true, artist: false, client: false },
                    { action: 'Create New Projects & Assign Team Members', superAdmin: true, admin: true, artist: false, client: false },
                    { action: 'Upload & Optimize 3D Assets (Draco GLB)', superAdmin: true, admin: true, artist: true, client: false },
                    { action: 'Log Hours & Update Stage Task Status', superAdmin: true, admin: true, artist: true, client: false },
                    { action: 'View Assigned Project Pipelines & 360 Tours', superAdmin: true, admin: true, artist: true, client: true },
                    { action: 'Download Final 8K Master Deliverables & Invoices', superAdmin: true, admin: true, artist: true, client: true },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#27272A]/40 transition-colors">
                      <td className="py-3 px-4 font-sans font-medium text-white">{row.action}</td>
                      <td className="py-3 px-4 text-center">
                        {row.superAdmin ? (
                          <Check className="w-4 h-4 text-purple-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-[#71717A] mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {row.admin ? (
                          <Check className="w-4 h-4 text-[#3ECF8E] mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-[#71717A] mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {row.artist ? (
                          <Check className="w-4 h-4 text-sky-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-[#71717A] mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {row.client ? (
                          <Check className="w-4 h-4 text-amber-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-[#71717A] mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD NEW ADMIN / USER                                 */}
      {/* ============================================================ */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#18181B] border border-[#27272A] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold font-display text-white">
                  Add New Administrator or User
                </h3>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-[#71717A] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[#A1A1AA] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liam Sterling"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[#A1A1AA] mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. liam.sterling@viztr.studio"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A1A1AA] mb-1">Role Assignment *</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Root Access)</option>
                    <option value="ADMIN">ADMIN (Studio Operations)</option>
                    <option value="USER">USER (3D Artist / Team)</option>
                    <option value="CLIENT">CLIENT (External VIP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#A1A1AA] mb-1">Account Status</label>
                  <select
                    value={newUserForm.status}
                    onChange={(e) => setNewUserForm({ ...newUserForm, status: e.target.value as UserStatus })}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="active">Active (Immediate Login)</option>
                    <option value="invited">Invited (Send Email Link)</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A1A1AA] mb-1">Department</label>
                  <input
                    type="text"
                    value={newUserForm.department}
                    onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[#A1A1AA] mb-1">Company / Studio</label>
                  <input
                    type="text"
                    value={newUserForm.company}
                    onChange={(e) => setNewUserForm({ ...newUserForm, company: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-[#A1A1AA] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newUserForm.twoFactorEnabled}
                    onChange={(e) => setNewUserForm({ ...newUserForm, twoFactorEnabled: e.target.checked })}
                    className="rounded accent-purple-600"
                  />
                  <span>Enforce Two-Factor Authentication (2FA)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#27272A]">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-white font-mono text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold shadow-md cursor-pointer"
                >
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: EDIT USER & ROLE SWITCH                               */}
      {/* ============================================================ */}
      {isEditUserModalOpen && userToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#18181B] border border-[#27272A] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold font-display text-white">
                  Edit User Profile & Role Privileges
                </h3>
              </div>
              <button
                onClick={() => setIsEditUserModalOpen(false)}
                className="text-[#71717A] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedUser} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[#A1A1AA] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={userToEdit.name}
                  onChange={(e) => setUserToEdit({ ...userToEdit, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[#A1A1AA] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={userToEdit.email}
                  onChange={(e) => setUserToEdit({ ...userToEdit, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A1A1AA] mb-1">Assigned Role</label>
                  <select
                    value={userToEdit.role}
                    onChange={(e) => setUserToEdit({ ...userToEdit, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Root Authority)</option>
                    <option value="ADMIN">ADMIN (Studio Operations)</option>
                    <option value="USER">USER (3D Artist / Team)</option>
                    <option value="CLIENT">CLIENT (External VIP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#A1A1AA] mb-1">Account Status</label>
                  <select
                    value={userToEdit.status}
                    onChange={(e) => setUserToEdit({ ...userToEdit, status: e.target.value as UserStatus })}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="invited">Invited</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A1A1AA] mb-1">Department</label>
                  <input
                    type="text"
                    value={userToEdit.department}
                    onChange={(e) => setUserToEdit({ ...userToEdit, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[#A1A1AA] mb-1">Company</label>
                  <input
                    type="text"
                    value={userToEdit.company || ''}
                    onChange={(e) => setUserToEdit({ ...userToEdit, company: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-[#A1A1AA] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userToEdit.twoFactorEnabled}
                    onChange={(e) => setUserToEdit({ ...userToEdit, twoFactorEnabled: e.target.checked })}
                    className="rounded accent-purple-600"
                  />
                  <span>Two-Factor Authentication (2FA)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#27272A]">
                <button
                  type="button"
                  onClick={() => setIsEditUserModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-white font-mono text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
