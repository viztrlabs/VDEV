'use client';

import React, { useState } from 'react';
import { Users, UserPlus, Mail, Shield, Eye, Edit3, Trash2, Send, X, CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Invited' | 'Pending';
  permissions: string[];
}

const ROLE_OPTIONS = [
  { value: 'principal', label: 'Principal Reviewer (Full Sign-off)', permissions: ['view', 'comment', 'download', 'approve', 'manage'] },
  { value: 'lead_architect', label: 'Lead BIM Architect (Comment & Download)', permissions: ['view', 'comment', 'download'] },
  { value: 'architect', label: 'Project Architect (Comment Only)', permissions: ['view', 'comment'] },
  { value: 'viewer', label: 'Development Partner (View Only)', permissions: ['view'] },
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  principal: ['view', 'comment', 'download', 'approve', 'manage'],
  lead_architect: ['view', 'comment', 'download'],
  architect: ['view', 'comment'],
  viewer: ['view'],
};

export default function ClientTeamManager() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Alexander Wright', email: 'a.wright@fosterpartners.com', role: 'Principal Reviewer (Full Sign-off)', status: 'Active', permissions: ['view', 'comment', 'download', 'approve', 'manage'] },
    { id: '2', name: 'Elena Rostova', email: 'e.rostova@fosterpartners.com', role: 'Lead BIM Architect (Comment & Download)', status: 'Active', permissions: ['view', 'comment', 'download'] },
    { id: '3', name: 'Marcus Chen', email: 'm.chen@fosterpartners.com', role: 'Development Partner (View Only)', status: 'Invited', permissions: ['view'] },
  ]);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'viewer' });
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState({ message: '', type: 'success' as 'success' | 'error' | 'info' });

  const showToastMessage = (message: string, type: 'success' | 'error' | 'info') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast({ message: '', type: 'success' }), 3000);
  };

  const handleRoleChange = (role: string) => {
    setNewMember(prev => ({ ...prev, role, permissions: ROLE_PERMISSIONS[role] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) {
      showToastMessage('Name and email are required', 'error');
      return;
    }
    if (!newMember.email.includes('@')) {
      showToastMessage('Please enter a valid email address', 'error');
      return;
    }
    if (teamMembers.some(m => m.email.toLowerCase() === newMember.email.toLowerCase())) {
      showToastMessage('A team member with this email already exists', 'error');
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would call an API endpoint
      // const res = await fetch('/api/client-dashboard/team/invite', { ... });
      await new Promise(r => setTimeout(r, 1000)); // Simulate API call

      const newMemberWithId: TeamMember = {
        id: `tm-${Date.now()}`,
        name: newMember.name,
        email: newMember.email,
        role: ROLE_OPTIONS.find(r => r.value === newMember.role)?.label || 'Development Partner (View Only)',
        status: 'Invited',
        permissions: ROLE_PERMISSIONS[newMember.role],
      };

      setTeamMembers(prev => [...prev, newMemberWithId]);
      setAddModalOpen(false);
      setNewMember({ name: '', email: '', role: 'viewer' });
      showToastMessage(`Invitation sent to ${newMember.email}`, 'success');
    } catch (error) {
      showToastMessage('Failed to send invitation. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvite = async (member: any) => {
    try {
      await new Promise(r => setTimeout(r, 500)); // Simulate API call
      showToastMessage(`Invitation resent to ${member.email}`, 'success');
    } catch {
      showToastMessage('Failed to resend invitation', 'error');
    }
  };

  const handleCancelInvite = (memberId: string) => {
    if (confirm('Are you sure you want to cancel this invitation?')) {
      setTeamMembers(prev => prev.filter(m => m.id !== memberId));
      showToastMessage('Invitation cancelled', 'success');
    }
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm('Are you sure you want to remove this team member? They will lose access to the project.')) {
      setTeamMembers(prev => prev.filter(m => m.id !== memberId));
      showToastMessage('Team member removed', 'success');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40';
      case 'Invited': return 'bg-amber-950/40 text-amber-400 border-amber-800/40';
      case 'Pending': return 'bg-blue-950/40 text-blue-400 border-blue-800/40';
      default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const getPermissionIcons = (permissions: string[]) => {
    const icons = {
      view: <Eye className="w-3 h-3" />,
      comment: <Mail className="w-3 h-3" />,
      download: <Download className="w-3 h-3" />,
      approve: <CheckCircle2 className="w-3 h-3" />,
      manage: <AlertCircle className="w-3 h-3" />,
    };
    return permissions.map(p => icons[p as keyof typeof icons]).filter(Boolean);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#353436]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#dbfcff]" />
            <span>Authorized Team & Stakeholder Access</span>
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Manage who at your architecture firm can review, comment, and approve deliverables
          </p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-[#dbfcff] hover:bg-[#34b27b] text-black font-mono font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-lg"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      <div className="space-y-3">
        {teamMembers.map((m, idx) => (
          <div key={m.id} className="p-4 rounded-xl bg-[#201f20] border border-[#353436] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#dbfcff]/20 text-[#dbfcff] font-bold text-xs flex items-center justify-center shrink-0">
                {m.name.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>{m.name}</span>
                  <span className="text-[10px] font-mono text-[#71717A]">({m.email})</span>
                </div>
                <div className="text-[11px] text-[#A1A1AA] mt-0.5">{m.role}</div>
                <div className="flex items-center gap-1 mt-1">
                  {getPermissionIcons(m.permissions)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${getStatusColor(m.status)}`}>
                {m.status}
              </span>
              {m.status === 'Invited' && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleResendInvite(m)}
                    className="p-1.5 rounded hover:bg-[#353436] text-[#A1A1AA] hover:text-[#dbfcff] transition-colors"
                    title="Resend invitation"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCancelInvite(m.id)}
                    className="p-1.5 rounded hover:bg-[#353436] text-[#A1A1AA] hover:text-red-400 transition-colors"
                    title="Cancel invitation"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {m.status === 'Active' && (
                <button
                  onClick={() => handleRemoveMember(m.id)}
                  className="p-1.5 rounded hover:bg-[#353436] text-[#A1A1AA] hover:text-red-400 transition-colors"
                  title="Remove member"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm ${addModalOpen ? 'block' : 'hidden'}`} onClick={() => setAddModalOpen(false)} role="dialog" aria-modal="true" aria-labelledby="add-member-title">
        <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]/50">
            <h3 id="add-member-title" className="text-lg font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#dbfcff]" />
              <span>Add Team Member</span>
            </h3>
            <button onClick={() => { setAddModalOpen(false); setNewMember({ name: '', email: '', role: 'viewer' }); }} className="p-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-white transition-colors" aria-label="Close modal"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">Full Name</label>
              <input type="text" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} placeholder="John Smith" required className="w-full px-3 py-2 rounded-lg bg-[#131314] border border-[#353436] text-white placeholder-[#71717A] focus:outline-none focus:border-[#dbfcff] transition-colors" />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">Email Address</label>
              <input type="email" value={newMember.email} onChange={e => setNewMember({ ...newMember, email: e.target.value })} placeholder="architect@firm.com" required className="w-full px-3 py-2 rounded-lg bg-[#131314] border border-[#353436] text-white placeholder-[#71717A] focus:outline-none focus:border-[#dbfcff] transition-colors" />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">Role & Permissions</label>
              <select value={newMember.role} onChange={e => handleRoleChange(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[#131314] border border-[#353436] text-white focus:outline-none focus:border-[#dbfcff] appearance-none cursor-pointer">
                {ROLE_OPTIONS.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
            <div className="p-3 rounded-lg bg-[#131314] border border-[#353436]">
              <p className="text-[10px] font-mono text-[#71717A] mb-2">Permissions for selected role:</p>
              <div className="flex flex-wrap gap-1.5">
                {ROLE_PERMISSIONS[newMember.role].map((perm, i) => (
                  <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#dbfcff]/20 text-[#dbfcff]">{perm}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => { setAddModalOpen(false); setNewMember({ name: '', email: '', role: 'viewer' }); }} className="px-4 py-2 rounded-lg bg-[#131314] hover:bg-[#353436] border border-[#353436] text-white text-xs font-mono transition-colors">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-[#dbfcff] hover:bg-[#34b27b] text-black font-mono font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                <span>{loading ? 'Sending...' : 'Send Invitation'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Active': return 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40';
    case 'Invited': return 'bg-amber-950/40 text-amber-400 border-amber-800/40';
    case 'Pending': return 'bg-blue-950/40 text-blue-400 border-blue-800/40';
    default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
  }
}

function getPermissionIcons(permissions: string[]) {
  const icons = { view: <Eye className="w-3 h-3" />, comment: <Mail className="w-3 h-3" />, download: <Download className="w-3 h-3" />, approve: <CheckCircle2 className="w-3 h-3" />, manage: <AlertCircle className="w-3 h-3" /> };
  return permissions.map(p => ({ view: <Eye className="w-3 h-3" />, comment: <Mail className="w-3 h-3" />, download: <Download className="w-3 h-3" />, approve: <CheckCircle2 className="w-3 h-3" />, manage: <AlertCircle className="w-3 h-3" /> }[p] as React.ReactElement)).filter(Boolean);
}

