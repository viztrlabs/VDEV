'use client';

import React, { useState, useEffect } from 'react';
import {
  Key,
  Database,
  Shield,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  X,
  Loader2,
  Save,
  ArrowLeft,
  Settings,
  Globe,
  Link2,
} from 'lucide-react';
import type { GA4Credentials, GA4CredentialsInput, UpdateGA4Credentials } from '@/lib/super-admin-store-types';

interface GA4CredentialsTabProps {
  credentials: GA4Credentials | null;
  loading: boolean;
  error: string | null;
  onFetch: () => Promise<void>;
  onCreate: (input: GA4CredentialsInput) => Promise<void>;
  onUpdate: (id: string, updates: UpdateGA4Credentials) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSetActive: (id: string) => Promise<void>;
}

export default function GA4CredentialsTab({
  credentials,
  loading,
  error,
  onFetch,
  onCreate,
  onUpdate,
  onDelete,
  onSetActive,
}: GA4CredentialsTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingCred, setEditingCred] = useState<GA4Credentials | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [formData, setFormData] = useState({
    propertyId: '',
    serviceAccountEmail: '',
    privateKey: '',
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof GA4CredentialsInput, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      propertyId: '',
      serviceAccountEmail: '',
      privateKey: '',
      isActive: true,
    });
    setFormErrors({});
    setEditingCred(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    // Validation
    const newErrors: Partial<Record<keyof GA4CredentialsInput, string>> = {};
    if (!formData.propertyId.trim()) newErrors.propertyId = 'Property ID is required';
    if (!formData.serviceAccountEmail.trim()) newErrors.serviceAccountEmail = 'Service account email is required';
    if (!formData.privateKey.trim()) newErrors.privateKey = 'Private key is required';
    if (formData.privateKey && !formData.privateKey.includes('BEGIN PRIVATE KEY')) {
      newErrors.privateKey = 'Invalid private key format (must be PEM format with BEGIN/END PRIVATE KEY)';
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      setSubmitting(false);
      return;
    }

    try {
      if (editingCred) {
        await onUpdate(editingCred.id, {
          propertyId: formData.propertyId,
          serviceAccountEmail: formData.serviceAccountEmail,
          privateKey: formData.privateKey,
          isActive: formData.isActive,
        });
      } else {
        await onCreate({
          propertyId: formData.propertyId,
          serviceAccountEmail: formData.serviceAccountEmail,
          privateKey: formData.privateKey,
          isActive: formData.isActive,
        });
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to save GA4 credentials:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingCred) return;
    if (!window.confirm('Are you sure you want to delete these GA4 credentials? This action cannot be undone.')) return;

    try {
      await onDelete(editingCred.id);
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to delete GA4 credentials:', err);
    }
  };

  const handleSetActive = async () => {
    if (!editingCred) return;
    try {
      await onSetActive(editingCred.id);
    } catch (err) {
      console.error('Failed to set active GA4 credentials:', err);
    }
  };

  const formatPrivateKey = (key: string) => {
    // Show only first and last 20 chars for display
    if (key.length <= 40) return key;
    return key.slice(0, 20) + '...' + key.slice(-20);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600/30 flex items-center justify-center">
            <Key className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-white">GA4 Credentials Management</h2>
            <p className="text-xs text-[#A1A1AA] font-mono">
              Configure Google Analytics 4 Data API service account credentials
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onFetch}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#201f20] border border-[#353436] text-white text-xs font-mono font-bold hover:bg-[#353436] cursor-pointer transition-colors"
          >
            <Loader2 className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="ml-1.5">Refresh</span>
          </button>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-bold shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Credentials
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-mono text-red-400 font-bold">Error Loading Credentials</p>
            <p className="text-xs text-[#A1A1AA]">{error}</p>
          </div>
          <button onClick={onFetch} className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-mono hover:bg-red-500/30">
            Retry
          </button>
        </div>
      )}

      {/* Credentials Card */}
      {!loading && !credentials && !error && (
        <div className="p-6 rounded-2xl bg-[#201f20] border border-[#353436] text-center">
          <div className="w-16 h-16 rounded-full bg-[#353436] flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-[#71717A]" />
          </div>
          <h3 className="text-lg font-bold font-display text-white mb-2">No GA4 Credentials Configured</h3>
          <p className="text-xs text-[#A1A1AA] mb-4 max-w-md mx-auto">
            Add a Google Analytics 4 service account to enable the Super Admin Analytics dashboard.
          </p>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-bold shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add First Credentials
          </button>
        </div>
      )}

      {credentials && !loading && (
        <div className="space-y-4">
          {/* Status & Actions */}
          <div className="p-5 rounded-2xl bg-[#201f20] border border-[#353436]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  credentials.isActive 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {credentials.isActive ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider">
                    {credentials.isActive ? 'Active Credentials' : 'Inactive Credentials'}
                  </p>
                  <p className="text-sm font-bold font-display text-white">
                    GA4 Property: <span className="font-mono text-purple-400">{credentials.propertyId}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {!credentials.isActive && (
                  <button
                    onClick={handleSetActive}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold hover:bg-emerald-500/30 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Set Active
                  </button>
                )}
                <button
                  onClick={() => { setEditingCred(credentials); setFormData({
                    propertyId: credentials.propertyId,
                    serviceAccountEmail: credentials.serviceAccountEmail,
                    privateKey: credentials.privateKey,
                    isActive: credentials.isActive,
                  }); setShowModal(true); }}
                  className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-400 text-xs font-mono font-bold hover:bg-sky-500/30 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => { setEditingCred(credentials); setShowModal(true); }}
                  className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-mono font-bold hover:bg-red-500/30 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Service Account */}
            <div className="p-5 rounded-2xl bg-[#201f20] border border-[#353436] space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-[#A1A1AA]">
                <Mail className="w-4 h-4" />
                <span>Service Account Email</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs text-white bg-[#131314] px-3 py-2 rounded-lg border border-[#353436] font-mono break-all">
                  {credentials.serviceAccountEmail}
                </code>
                <button
                  onClick={() => copyToClipboard(credentials.serviceAccountEmail)}
                  className="p-2 rounded-lg bg-[#353436] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-white cursor-pointer transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Property ID */}
            <div className="p-5 rounded-2xl bg-[#201f20] border border-[#353436] space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-[#A1A1AA]">
                <Database className="w-4 h-4" />
                <span>GA4 Property ID</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs text-white bg-[#131314] px-3 py-2 rounded-lg border border-[#353436] font-mono break-all">
                  {credentials.propertyId}
                </code>
                <button
                  onClick={() => copyToClipboard(credentials.propertyId)}
                  className="p-2 rounded-lg bg-[#353436] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-white cursor-pointer transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Private Key */}
            <div className="p-5 rounded-2xl bg-[#201f20] border border-[#353436] space-y-3 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-[#A1A1AA]">
                  <Key className="w-4 h-4" />
                  <span>Private Key (PEM Format)</span>
                </div>
                <button
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="px-3 py-1.5 rounded-lg bg-[#353436] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-white text-xs font-mono cursor-pointer transition-colors"
                >
                  {showPrivateKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span className="ml-1.5">{showPrivateKey ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-[10px] text-white bg-[#131314] px-3 py-2 rounded-lg border border-[#353436] font-mono break-all max-h-24 overflow-y-auto whitespace-pre-wrap">
                  {showPrivateKey ? credentials.privateKey : formatPrivateKey(credentials.privateKey)}
                </code>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => copyToClipboard(credentials.privateKey)}
                    className="p-2 rounded-lg bg-[#353436] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-white cursor-pointer transition-colors"
                    title="Copy full private key"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => window.open(`https://console.cloud.google.com/iam-admin/serviceaccounts/details/${encodeURIComponent(credentials.serviceAccountEmail)}`, '_blank')}
                    className="p-2 rounded-lg bg-[#353436] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-white cursor-pointer transition-colors"
                    title="Open in Google Cloud Console"
                  >
                    <Link2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="p-5 rounded-2xl bg-[#201f20] border border-[#353436] space-y-3 lg:col-span-2">
              <h4 className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider">Metadata</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[#71717A]">Created</p>
                  <p className="text-white font-mono">{new Date(credentials.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[#71717A]">Last Updated</p>
                  <p className="text-white font-mono">{new Date(credentials.updatedAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[#71717A]">Created By</p>
                  <p className="text-white font-mono">{credentials.createdBy}</p>
                </div>
                <div>
                  <p className="text-[#71717A]">Status</p>
                  <p className={`text-white font-mono ${credentials.isActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {credentials.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="p-5 rounded-2xl bg-[#201f20] border border-[#353436]">
            <h4 className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider mb-3">Quick Links</h4>
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://analytics.google.com/analytics/web/?hl=en&pli=1#/p${credentials.propertyId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 text-xs font-mono cursor-pointer transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                Open GA4 Property
              </a>
              <a
                href={`https://console.cloud.google.com/iam-admin/serviceaccounts/details/${encodeURIComponent(credentials.serviceAccountEmail)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 text-xs font-mono cursor-pointer transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                Service Account Console
              </a>
              <a
                href="https://developers.google.com/analytics/devguides/reporting/data/v1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#353436] text-white border border-[#3F3F46] hover:bg-[#3F3F46] text-xs font-mono cursor-pointer transition-colors"
              >
                <Link2 className="w-3.5 h-3.5" />
                GA4 Data API Docs
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#201f20] border border-[#353436] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#353436] p-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold font-display text-white">
                  {editingCred ? 'Edit GA4 Credentials' : 'Add New GA4 Credentials'}
                </h3>
              </div>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-[#71717A] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5 text-xs font-mono">
              {/* Property ID */}
              <div>
                <label className="block text-[#A1A1AA] mb-1.5">
                  GA4 Property ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 123456789"
                  value={formData.propertyId}
                  onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg bg-[#131314] border ${
                    formErrors.propertyId ? 'border-red-500' : 'border-[#353436]'
                  } text-white focus:outline-none focus:border-purple-500 ${submitting ? 'cursor-wait' : ''}`}
                />
                {formErrors.propertyId && (
                  <p className="mt-1 text-[10px] text-red-400">{formErrors.propertyId}</p>
                )}
                <p className="mt-1 text-[10px] text-[#71717A]">
                  Numeric Property ID from GA4 Admin → Property Settings (NOT the G-XXXXXXXXXX measurement ID)
                </p>
              </div>

              {/* Service Account Email */}
              <div>
                <label className="block text-[#A1A1AA] mb-1.5">
                  Service Account Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="viztr-ga4@my-project.iam.gserviceaccount.com"
                  value={formData.serviceAccountEmail}
                  onChange={(e) => setFormData({ ...formData, serviceAccountEmail: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg bg-[#131314] border ${
                    formErrors.serviceAccountEmail ? 'border-red-500' : 'border-[#353436]'
                  } text-white focus:outline-none focus:border-purple-500 ${submitting ? 'cursor-wait' : ''}`}
                />
                {formErrors.serviceAccountEmail && (
                  <p className="mt-1 text-[10px] text-red-400">{formErrors.serviceAccountEmail}</p>
                )}
              </div>

              {/* Private Key */}
              <div>
                <label className="block text-[#A1A1AA] mb-1.5">
                  Private Key (PEM Format) <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
                  value={formData.privateKey}
                  onChange={(e) => setFormData({ ...formData, privateKey: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg bg-[#131314] border ${
                    formErrors.privateKey ? 'border-red-500' : 'border-[#353436]'
                  } text-white focus:outline-none focus:border-purple-500 font-mono text-[10px] ${submitting ? 'cursor-wait' : ''}`}
                />
                {formErrors.privateKey && (
                  <p className="mt-1 text-[10px] text-red-400">{formErrors.privateKey}</p>
                )}
                <p className="mt-1 text-[10px] text-[#71717A]">
                  Copy the entire private key from the JSON key file including BEGIN/END lines and \n characters
                </p>
              </div>

              {/* Active Toggle */}
              {editingCred && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded accent-purple-600"
                  />
                  <label htmlFor="isActive" className="text-[#A1A1AA] cursor-pointer">
                    Set as active credentials (deactivates others)
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#353436]">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 rounded-lg bg-[#353436] hover:bg-[#3F3F46] text-white font-mono text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Saving...
                    </>
                  ) : editingCred ? (
                    <>
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                      Update Credentials
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Create Credentials
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}