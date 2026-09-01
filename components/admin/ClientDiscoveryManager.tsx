'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Send,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Building2,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Code2,
  Printer,
  Share2,
  MessageCircle,
  Plus,
  RefreshCw,
  Eye,
  Trash2,
  FileCheck
} from 'lucide-react';
import { DiscoverySubmission } from '@/app/api/discovery/route';
import { useAppStore } from '@/lib/store';
import DiscoveryIntakeForm from '@/components/discovery/DiscoveryIntakeForm';

export default function ClientDiscoveryManager() {
  const { showToast } = useAppStore();
  const [submissions, setSubmissions] = useState<DiscoverySubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<DiscoverySubmission | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeTab, setActiveTab] = useState<'submissions' | 'send-link' | 'google-script' | 'intake-form'>('submissions');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Custom client link builder state
  const [inviteClientName, setInviteClientName] = useState('');
  const [inviteClientEmail, setInviteClientEmail] = useState('');
  const [inviteClientPhone, setInviteClientPhone] = useState('');

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/discovery');
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const getDiscoveryUrl = () => {
    if (typeof window !== 'undefined') {
      const base = `${window.location.origin}/discovery`;
      if (inviteClientName || inviteClientEmail) {
        const params = new URLSearchParams();
        if (inviteClientName) params.set('client', inviteClientName);
        if (inviteClientEmail) params.set('email', inviteClientEmail);
        return `${base}?${params.toString()}`;
      }
      return base;
    }
    return 'http://localhost:3000/discovery';
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getDiscoveryUrl());
    setCopiedLink(true);
    showToast('Discovery link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Project Discovery & Proposal Intake — VizTR Studio`);
    const body = encodeURIComponent(
      `Hi ${inviteClientName || 'there'},\n\n` +
      `Before we kick off your architectural / digital production commission with VizTR, we want to deeply understand your specific problem and business objectives.\n\n` +
      `Please fill out our short New Client Discovery Form here:\n${getDiscoveryUrl()}\n\n` +
      `This directly shapes your technical proposal, milestones, and delivery timeline.\n\n` +
      `Best regards,\nVizTR Studio Production Team`
    );
    window.open(`mailto:${inviteClientEmail || ''}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(
      `Hi ${inviteClientName || ''}! Please complete our quick VizTR Project Discovery Form so we can prepare your formal proposal:\n${getDiscoveryUrl()}`
    );
    const phone = inviteClientPhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const APPS_SCRIPT_CODE = `/**
 * VizTR — New Client Discovery Form (Google Apps Script builder)
 * 
 * Instructions:
 * 1. Go to script.google.com -> New Project
 * 2. Paste this code and click Run (buildDiscoveryForm)
 */
function buildDiscoveryForm() {
  const form = FormApp.create('VizTR — New Client Discovery Form');
  form.setDescription('Before we start your project, we want to deeply understand your problem. Please answer as specifically as you can; this directly shapes your proposal.');
  form.setCollectEmail(true);
  form.setProgressBar(true);

  // Section A: Client Context
  form.addPageBreakItem().setTitle('A. Client & Business Context');
  form.addTextItem().setTitle('Client / Company Name').setRequired(true);
  form.addTextItem().setTitle('Point of Contact — Name & Role').setRequired(true);
  form.addTextItem().setTitle('Contact Email').setRequired(true);
  form.addTextItem().setTitle('Contact Phone').setRequired(false);
  form.addTextItem().setTitle('Industry / Domain').setRequired(true);
  form.addTextItem().setTitle('Team size involved in this project').setRequired(false);

  // Section B: The Pain Point
  form.addPageBreakItem().setTitle('B. The Pain Point (most important section)');
  form.addParagraphTextItem().setTitle('What is the specific problem you are facing right now?').setRequired(true);
  form.addParagraphTextItem().setTitle('What are you currently doing to solve this?').setRequired(true);
  form.addParagraphTextItem().setTitle('What is the cost of NOT solving this?').setRequired(true);

  // Section C: Desired Outcome
  form.addPageBreakItem().setTitle('C. Desired Outcome');
  form.addParagraphTextItem().setTitle('If this problem were solved perfectly, what changes in 3 months?').setRequired(true);
  form.addTextItem().setTitle('What metric will you judge this by?').setRequired(false);

  // Section D: Solution Shape
  form.addPageBreakItem().setTitle('D. What Are You Looking For?');
  form.addCheckboxItem().setTitle('Select all that apply').setChoiceValues([
    'Marketing website', 'Web app (login, dashboard, accounts)', 'Mobile app',
    'SaaS platform', 'XR / AR / VR / 3D visualization', 'Internal tool',
    'Automation / integration', 'AI-powered feature', 'E-commerce', 'Not sure yet'
  ]).setRequired(true);

  // Section E: Functional Requirements
  form.addPageBreakItem().setTitle('E. Functional Requirements');
  form.addParagraphTextItem().setTitle('List every feature you want — even rough ideas').setRequired(true);
  form.addParagraphTextItem().setTitle('Rank must-have vs nice-to-have').setRequired(false);

  // Section F: Constraints
  form.addPageBreakItem().setTitle('F. Constraints');
  form.addMultipleChoiceItem().setTitle('Budget range').setChoiceValues([
    'Under ₹50,000', '₹50,000 – ₹1,50,000', '₹1,50,000 – ₹5,00,000',
    '₹5,00,000+', 'Not sure yet — need a recommendation'
  ]).setRequired(true);
  form.addTextItem().setTitle('Timeline / hard deadline (if any)').setRequired(false);

  // Section G: References
  form.addPageBreakItem().setTitle('G. Competitive / Reference Context');
  form.addParagraphTextItem().setTitle('Tools, apps, or websites you like').setRequired(false);
  form.addParagraphTextItem().setTitle('Tools, apps, or websites to avoid').setRequired(false);

  Logger.log('Form created: ' + form.getPublishedUrl());
}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopiedScript(true);
    showToast('Google Apps Script copied to clipboard!', 'success');
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleConvertToProject = (sub: DiscoverySubmission) => {
    const projectId = `VZ-${Math.floor(1000 + Math.random() * 9000)}`;
    const accessCode = `VIP-${new Date().getFullYear()}`;
    showToast(`Created Commission ${projectId} for ${sub.clientName} (Access Code: ${accessCode})`, 'success');
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (filterStatus === 'all') return true;
    return s.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-[#3ECF8E]/20 text-[#3ECF8E] text-[10px] font-mono font-bold uppercase border border-[#3ECF8E]/40">
              Direct Client Intake
            </span>
            <span className="text-xs font-mono text-[#71717A]">
              7-Section Discovery Engine
            </span>
          </div>
          <h2 className="text-2xl font-bold font-serif text-white">
            Client Discovery Form & Intake Suite
          </h2>
          <p className="text-xs text-[#A1A1AA] max-w-2xl leading-relaxed">
            Send customized discovery forms directly to architectural clients and web app leads. Deeply capture pain points, scope, budget, and metrics to auto-generate proposals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/discovery"
            target="_blank"
            className="px-4 py-2 rounded-xl bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-xs font-mono text-white flex items-center gap-2 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#3ECF8E]" />
            <span>Open Public Form</span>
            <ExternalLink className="w-3 h-3 text-[#71717A]" />
          </Link>

          <button
            type="button"
            onClick={handleCopyLink}
            className="px-4 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-semibold text-xs flex items-center gap-2 transition-all shadow-lg shadow-[#3ECF8E]/20 cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied' : 'Copy Direct Share Link'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'submissions'
                ? 'bg-[#27272A] text-[#3ECF8E] border border-[#3ECF8E]/40'
                : 'text-[#A1A1AA] hover:text-white hover:bg-[#18181B]'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Received Discovery Briefs ({submissions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('send-link')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'send-link'
                ? 'bg-[#27272A] text-[#3ECF8E] border border-[#3ECF8E]/40'
                : 'text-[#A1A1AA] hover:text-white hover:bg-[#18181B]'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Direct Client Invite Generator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('google-script')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'google-script'
                ? 'bg-[#27272A] text-[#3ECF8E] border border-[#3ECF8E]/40'
                : 'text-[#A1A1AA] hover:text-white hover:bg-[#18181B]'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Google Apps Script & Form Builder</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('intake-form')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'intake-form'
                ? 'bg-[#27272A] text-[#3ECF8E] border border-[#3ECF8E]/40'
                : 'text-[#A1A1AA] hover:text-white hover:bg-[#18181B]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Live Intake Form (was /discovery)</span>
          </button>
        </div>

        <button
          type="button"
          onClick={fetchSubmissions}
          className="p-2 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
          title="Refresh submissions"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* TAB 1: SUBMISSIONS LIST & DETAIL VIEW */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#71717A]" />
              <span className="text-xs font-mono text-[#A1A1AA]">Filter by Status:</span>
              <div className="flex items-center gap-1.5">
                {['all', 'new', 'proposal_generated', 'commissioned'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase font-bold transition-all cursor-pointer border ${
                      filterStatus === st
                        ? 'bg-[#27272A] text-[#3ECF8E] border-[#3ECF8E]/40'
                        : 'bg-[#18181B] text-[#71717A] border-[#27272A] hover:text-white'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Submissions List */}
            <div className="lg:col-span-1 space-y-3">
              {filteredSubmissions.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#18181B] border border-[#27272A] text-center text-xs font-mono text-[#71717A]">
                  No discovery briefs found in this view.
                </div>
              ) : (
                filteredSubmissions.map((sub) => {
                  const isSelected = selectedSubmission?.id === sub.id;
                  return (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSubmission(sub)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                        isSelected
                          ? 'bg-[#27272A] border-[#3ECF8E] shadow-md shadow-[#3ECF8E]/10'
                          : 'bg-[#18181B] border-[#27272A] hover:border-[#3f3f46]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#3ECF8E] font-bold">
                          {sub.id}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                            sub.status === 'new'
                              ? 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                              : sub.status === 'proposal_generated'
                              ? 'bg-sky-950/40 text-sky-400 border-sky-800/40'
                              : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                          }`}
                        >
                          {sub.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-white">{sub.clientName}</h4>
                        <div className="text-[11px] text-[#A1A1AA] mt-0.5">{sub.contactNameRole}</div>
                        <div className="text-[10px] font-mono text-[#71717A] mt-0.5">{sub.contactEmail}</div>
                      </div>

                      <div className="pt-2 border-t border-[#27272A] flex items-center justify-between text-[10px] font-mono text-[#71717A]">
                        <span>Budget: {sub.budgetRange}</span>
                        <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Detailed Submission Viewer */}
            <div className="lg:col-span-2">
              {selectedSubmission ? (
                <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#3ECF8E]">
                          {selectedSubmission.id}
                        </span>
                        <span className="text-[10px] font-mono text-[#71717A]">
                          Received: {new Date(selectedSubmission.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white font-serif mt-1">
                        {selectedSubmission.clientName}
                      </h3>
                      <p className="text-xs text-[#A1A1AA]">
                        {selectedSubmission.contactNameRole} • {selectedSubmission.contactEmail} • {selectedSubmission.contactPhone || 'No phone'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="p-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-white transition-colors cursor-pointer"
                        title="Print Discovery Brief"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleConvertToProject(selectedSubmission)}
                        className="px-3.5 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Create Project & Access Code</span>
                      </button>
                    </div>
                  </div>

                  {/* Section Details */}
                  <div className="space-y-4 text-xs">
                    {/* B. The Pain Point */}
                    <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2">
                      <div className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                        B. The Core Pain Point
                      </div>
                      <div className="text-white font-medium leading-relaxed">
                        {selectedSubmission.specificProblem}
                      </div>
                      <div className="pt-2 border-t border-[#27272A] text-[11px] text-[#A1A1AA] grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <strong className="text-white">Current Process:</strong> {selectedSubmission.currentSolution}
                        </div>
                        <div>
                          <strong className="text-white">Cost of NOT Solving:</strong> {selectedSubmission.costOfNotSolving}
                        </div>
                      </div>
                    </div>

                    {/* C. Desired Outcome */}
                    <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2">
                      <div className="text-[10px] font-mono uppercase text-sky-400 font-bold">
                        C. 3-Month Desired Outcome & Success Metric
                      </div>
                      <div className="text-white leading-relaxed">
                        {selectedSubmission.threeMonthOutcome}
                      </div>
                      {selectedSubmission.successMetric && (
                        <div className="text-[11px] font-mono text-[#3ECF8E]">
                          Target Metric: {selectedSubmission.successMetric}
                        </div>
                      )}
                    </div>

                    {/* D & E. Solution Scope & Features */}
                    <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-3">
                      <div className="text-[10px] font-mono uppercase text-purple-400 font-bold">
                        D & E. Solution Scope & Feature Requirements
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedSubmission.solutionTypes.map((type) => (
                          <span
                            key={type}
                            className="px-2.5 py-1 rounded-md bg-[#18181B] border border-[#27272A] text-white text-[11px] font-mono"
                          >
                            ✓ {type}
                          </span>
                        ))}
                      </div>
                      <div className="text-white text-xs leading-relaxed pt-1">
                        <strong>Feature Wishlist:</strong> {selectedSubmission.featureList}
                      </div>
                    </div>

                    {/* F. Constraints & Governance */}
                    <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <div className="text-[10px] font-mono uppercase text-[#71717A]">Budget Range</div>
                        <div className="text-emerald-400 font-bold font-mono mt-0.5">
                          {selectedSubmission.budgetRange}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase text-[#71717A]">Target Timeline</div>
                        <div className="text-white font-mono mt-0.5">
                          {selectedSubmission.timeline || 'Flexible'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase text-[#71717A]">Sign-Off Authority</div>
                        <div className="text-white font-mono mt-0.5">
                          {selectedSubmission.signOffOwner || selectedSubmission.contactNameRole}
                        </div>
                      </div>
                    </div>

                    {/* G. References & Context */}
                    {(selectedSubmission.referencesLiked || selectedSubmission.referencesAvoided) && (
                      <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2">
                        <div className="text-[10px] font-mono uppercase text-rose-400 font-bold">
                          G. Benchmark References
                        </div>
                        {selectedSubmission.referencesLiked && (
                          <div>
                            <strong className="text-emerald-400">Liked:</strong> {selectedSubmission.referencesLiked}
                          </div>
                        )}
                        {selectedSubmission.referencesAvoided && (
                          <div>
                            <strong className="text-rose-400">To Avoid:</strong> {selectedSubmission.referencesAvoided}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-12 rounded-2xl bg-[#18181B] border border-[#27272A] text-center space-y-3">
                  <FileText className="w-8 h-8 text-[#71717A] mx-auto" />
                  <h4 className="text-sm font-bold text-white">Select a Discovery Brief</h4>
                  <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
                    Click any client discovery submission on the left to inspect pain points, feature lists, budget, and 1-click project provisioning.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIRECT CLIENT INVITE GENERATOR */}
      {activeTab === 'send-link' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
            <div className="space-y-1 pb-3 border-b border-[#27272A]">
              <h3 className="text-base font-bold text-white font-serif">
                Customize Direct Client Link
              </h3>
              <p className="text-xs text-[#A1A1AA]">
                Pre-populate company and contact email so the client opens a personalized discovery form.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-[#A1A1AA] mb-1">
                  Client / Firm Name
                </label>
                <input
                  type="text"
                  value={inviteClientName}
                  onChange={(e) => setInviteClientName(e.target.value)}
                  placeholder="e.g. Foster & Partners Studio"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A1A1AA] mb-1">
                  Client Email Address
                </label>
                <input
                  type="email"
                  value={inviteClientEmail}
                  onChange={(e) => setInviteClientEmail(e.target.value)}
                  placeholder="e.g. a.wright@fosterpartners.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A1A1AA] mb-1">
                  Client WhatsApp / Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={inviteClientPhone}
                  onChange={(e) => setInviteClientPhone(e.target.value)}
                  placeholder="e.g. +442079460912"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2">
              <span className="text-[10px] font-mono uppercase text-[#71717A]">
                Generated Customized URL:
              </span>
              <div className="text-xs font-mono text-[#3ECF8E] break-all">
                {getDiscoveryUrl()}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2.5 px-3 rounded-xl bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-xs font-mono text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-[#3ECF8E]" />
                <span>Copy Link</span>
              </button>

              <button
                type="button"
                onClick={handleSendEmail}
                className="py-2.5 px-3 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </button>

              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E]">
                <Sparkles className="w-4 h-4" />
                <span>Email Pitch Template Preview</span>
              </div>
              <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] text-xs font-mono text-[#A1A1AA] leading-relaxed space-y-2">
                <div className="text-white font-bold">
                  Subject: Project Discovery & Proposal Intake — VizTR Studio
                </div>
                <div className="pt-2 border-t border-[#27272A] text-[11px] text-zinc-300">
                  Hi {inviteClientName || '[Client Name]'},
                  <br /><br />
                  Before we kick off your architectural / digital production commission with VizTR, we want to deeply understand your specific problem and business objectives.
                  <br /><br />
                  Please fill out our short New Client Discovery Form here:
                  <br />
                  <span className="text-[#3ECF8E]">{getDiscoveryUrl()}</span>
                  <br /><br />
                  This directly shapes your technical proposal, milestones, and delivery timeline.
                  <br /><br />
                  Best regards,<br />
                  VizTR Studio Production Team
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#09090B] border border-[#27272A] text-xs text-[#71717A] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#3ECF8E] shrink-0" />
              <span>Submissions automatically notify the Super Admin and appear in your inbox.</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GOOGLE APPS SCRIPT CODE & FORM BUILDER */}
      {activeTab === 'google-script' && (
        <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#27272A]">
            <div>
              <h3 className="text-base font-bold text-white font-serif">
                Google Apps Script Auto-Builder Code
              </h3>
              <p className="text-xs text-[#A1A1AA]">
                Run this single script in script.google.com to auto-generate the Google Form and linked Google Sheet.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href="https://script.google.com"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-xs font-mono text-white flex items-center gap-1.5 transition-colors"
              >
                <span>Open script.google.com</span>
                <ExternalLink className="w-3 h-3 text-[#71717A]" />
              </a>

              <button
                type="button"
                onClick={handleCopyScript}
                className="px-4 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#3ECF8E]/20 cursor-pointer"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Script Copied' : 'Copy Apps Script'}</span>
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] text-xs font-mono text-zinc-300 overflow-x-auto max-h-[480px] leading-relaxed">
            {APPS_SCRIPT_CODE}
          </pre>
        </div>
      )}

      {/* TAB 4: LIVE INTAKE FORM (moved from /discovery) */}
      {activeTab === 'intake-form' && (
        <div className="space-y-4">
          <DiscoveryIntakeForm variant="embedded" />
        </div>
      )}
    </div>
  );
}
