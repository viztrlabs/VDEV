'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Send,
  Building2,
  AlertTriangle,
  Target,
  Layers,
  FileCode,
  DollarSign,
  Compass,
  CheckCircle2,
  ArrowRight,
  Printer,
  Check,
  ShieldCheck,
  FileText,
} from 'lucide-react';

export interface DiscoveryFormData {
  clientName: string;
  contactNameRole: string;
  contactEmail: string;
  contactPhone: string;
  industry: string;
  teamSize: string;
  referralSource: string;
  specificProblem: string;
  currentSolution: string;
  costOfNotSolving: string;
  whoFeelsPain: string;
  painType: string;
  threeMonthOutcome: string;
  successMetric: string;
  solutionTypes: string[];
  otherSolution: string;
  featureList: string;
  priorityRanking: string;
  endUsers: string;
  existingSystems: string;
  brandAssets: string;
  budgetRange: string;
  timeline: string;
  techPreferences: string;
  signOffOwner: string;
  complianceNeeds: string;
  referencesLiked: string;
  referencesAvoided: string;
}

const EMPTY_FORM: DiscoveryFormData = {
  clientName: '',
  contactNameRole: '',
  contactEmail: '',
  contactPhone: '',
  industry: '',
  teamSize: '',
  referralSource: 'Website',
  specificProblem: '',
  currentSolution: '',
  costOfNotSolving: '',
  whoFeelsPain: 'Me / the founder',
  painType: 'Recurring / ongoing',
  threeMonthOutcome: '',
  successMetric: '',
  solutionTypes: [],
  otherSolution: '',
  featureList: '',
  priorityRanking: '',
  endUsers: '',
  existingSystems: '',
  brandAssets: '',
  budgetRange: '₹1,50,000 – ₹5,00,000',
  timeline: '',
  techPreferences: '',
  signOffOwner: '',
  complianceNeeds: '',
  referencesLiked: '',
  referencesAvoided: '',
};

const SAMPLE_FORM: DiscoveryFormData = {
  clientName: 'Foster & Partners Studio Group',
  contactNameRole: 'Alexander Wright — Senior Partner',
  contactEmail: 'a.wright@fosterpartners.com',
  contactPhone: '+44 20 7946 0912',
  industry: 'Architecture & Real Estate Development',
  teamSize: '15 stakeholders',
  referralSource: 'YouTube (@RahulShips)',
  specificProblem: 'We need to showcase the 60-storey Apex Tower to international institutional investors before groundbreaking. Static 2D renders fail to communicate spatial volume and natural lighting transitions.',
  currentSolution: 'Currently using standard PDF slide decks and offline rendered still images which take weeks to revise.',
  costOfNotSolving: 'Delayed pre-sales cycle, loss of foreign buyers, and manual back-and-forth render markup meetings.',
  whoFeelsPain: 'All of the above',
  painType: 'Recurring / ongoing',
  threeMonthOutcome: 'Close 40% of pre-sale penthouse allocations using browser-based real-time 3D tours and interactive 16K panoramic walk-throughs.',
  successMetric: 'Investor conversion speed & average deal closing time cut from 4 months to 3 weeks.',
  solutionTypes: [
    'XR / AR / VR / 3D visualization',
    'Web app (login, dashboard, accounts)',
    'Marketing website',
    'AI-powered feature',
  ],
  otherSolution: 'NVIDIA RTX Cloud Pixel Streaming',
  featureList:
    'Real-time Unreal Engine Pixel Streaming, Interactive BIM model viewer, Material/Finishes swapper (travertine vs marble), Day/Sunset/Night photometric sky simulation, Client sign-off portal.',
  priorityRanking:
    'Must-have: 60fps cloud streaming & WebXR model. Nice-to-have: Multi-user voice chat in VR.',
  endUsers: 'Institutional investors, high-net-worth individuals, architectural directors, client review committee.',
  existingSystems: 'Autodesk Revit BIM models, IFC steel framing geometry, Matterport floor scans.',
  brandAssets: 'Apex Tower Design Guidebook, Foster brand typography, custom charcoal/emerald color palette.',
  budgetRange: '₹5,00,000+',
  timeline: 'Hard deadline: October 15, 2026 for Global Property Summit in Singapore.',
  techPreferences: 'Unreal Engine 5.4 Lumen, WebXR, Next.js, Supabase.',
  signOffOwner: 'Alexander Wright (Managing Partner)',
  complianceNeeds: 'NDA protected pre-launch geometry, encrypted client access codes.',
  referencesLiked: 'Apple product launch experiences, Foster + Partners flagship interactive portal.',
  referencesAvoided: 'Clunky slow 3D iframe embeds that take 20 seconds to load on mobile.',
};

const SOLUTION_OPTIONS = [
  'Marketing website',
  'Web app (login, dashboard, accounts)',
  'Mobile app',
  'SaaS platform (subscriptions/billing)',
  'XR / AR / VR / 3D visualization',
  'Internal tool / admin dashboard',
  'Automation / integration',
  'AI-powered feature',
  'E-commerce',
  'Not sure yet — need guidance',
];

const BUDGET_OPTIONS = [
  'Under ₹50,000',
  '₹50,000 – ₹1,50,000',
  '₹1,50,000 – ₹5,00,000',
  '₹5,00,000+',
  'Not sure yet — need a recommendation',
];

const REFERRAL_OPTIONS = ['Referral', 'YouTube (@RahulShips)', 'Website', 'Social Media', 'Other'];

interface DiscoveryIntakeFormProps {
  variant?: 'standalone' | 'embedded';
  onSubmitted?: (submissionId: string) => void;
}

export default function DiscoveryIntakeForm({
  variant = 'embedded',
  onSubmitted,
}: DiscoveryIntakeFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DiscoveryFormData>(EMPTY_FORM);

  const toggleSolutionType = (type: string) => {
    setFormData((prev) => {
      const exists = prev.solutionTypes.includes(type);
      return {
        ...prev,
        solutionTypes: exists
          ? prev.solutionTypes.filter((t) => t !== type)
          : [...prev.solutionTypes, type],
      };
    });
  };

  const handleInputChange = (field: keyof DiscoveryFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const fillSample = () => setFormData(SAMPLE_FORM);
  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setSubmitted(false);
    setSubmissionId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.contactEmail) {
      alert('Please fill in at least the Client Name and Contact Email.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        const id = data.submissionId || `DISC-${Date.now()}`;
        setSubmissionId(id);
        setSubmitted(true);
        onSubmitted?.(id);
        if (variant === 'standalone') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        alert(data.error || 'Failed to submit discovery form.');
      }
    } catch {
      const id = `DISC-${Date.now().toString().slice(-6)}`;
      setSubmissionId(id);
      setSubmitted(true);
      onSubmitted?.(id);
    } finally {
      setLoading(false);
    }
  };

  const isStandalone = variant === 'standalone';

  return (
    <div
      className={
        isStandalone
          ? 'min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col w-full selection:bg-[#3ECF8E] selection:text-black'
          : 'w-full'
      }
    >
      {isStandalone && (
        <section className="relative py-12 px-4 sm:px-8 border-b border-[#27272A] bg-gradient-to-b from-[#18181B] to-[#09090B] text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 text-[#3ECF8E] text-xs font-mono font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#3ECF8E] animate-pulse" />
            <span>Project Kickoff Blueprint</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-serif tracking-tight text-white max-w-3xl mx-auto">
            New Client Discovery Form
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed">
            Before we start your project, we want to deeply understand your problem — not just the solution you think you need. Please answer as specifically as you can.
          </p>
        </section>
      )}

      {!isStandalone && (
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E]">
            <FileText className="w-4 h-4" />
            <span>Live Preview — Discovery Intake Form (embedded in Admin Dashboard)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={fillSample}
              className="px-2.5 py-1 rounded bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-[10px] font-mono text-[#3ECF8E] flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3" />
              Fill Sample
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-2.5 py-1 rounded bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-[10px] font-mono text-[#A1A1AA]"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      <main
        className={
          isStandalone ? 'flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-10' : 'w-full pt-6 space-y-6'
        }
      >
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 sm:p-12 rounded-2xl bg-[#18181B] border border-[#3ECF8E]/50 shadow-2xl text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#3ECF8E]/20 text-[#3ECF8E] flex items-center justify-center mx-auto border border-[#3ECF8E]/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono text-[#3ECF8E] uppercase tracking-wider font-bold">
                Discovery Reference: {submissionId}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
                Discovery Intake Received
              </h2>
              <p className="text-sm text-[#A1A1AA] max-w-lg mx-auto leading-relaxed">
                Thank you! We&apos;ve received your discovery brief for{' '}
                <strong className="text-white">{formData.clientName || 'your company'}</strong>. Our
                technical directors are reviewing your requirements and will follow up within{' '}
                <strong>1–2 business days</strong> with your tailored proposal.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] max-w-md mx-auto text-left text-xs font-mono space-y-2">
              <div className="flex justify-between text-[#71717A]">
                <span>Client Reference:</span>
                <span className="text-white">{formData.clientName}</span>
              </div>
              <div className="flex justify-between text-[#71717A]">
                <span>Contact Email:</span>
                <span className="text-[#3ECF8E]">{formData.contactEmail}</span>
              </div>
              <div className="flex justify-between text-[#71717A]">
                <span>Selected Scope:</span>
                <span className="text-white">{formData.solutionTypes.length} Service Categories</span>
              </div>
              <div className="flex justify-between text-[#71717A]">
                <span>Budget Tier:</span>
                <span className="text-emerald-400">{formData.budgetRange}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              {isStandalone && (
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-xs font-mono text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#3ECF8E]" />
                  <span>Print / Save PDF Brief</span>
                </button>
              )}
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#3ECF8E]/20"
              >
                <span>Submit Another</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SECTION A */}
            <section className="p-6 sm:p-8 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-[#27272A]">
                <div className="p-2 rounded-lg bg-[#09090B] text-[#3ECF8E] border border-[#27272A]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-serif">
                    A. Client & Business Context
                  </h3>
                  <p className="text-xs text-[#A1A1AA]">Your organization and team composition</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <FieldLabel required>Client / Company Name</FieldLabel>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    placeholder="e.g. Foster & Partners / Vanguard Development"
                    className={inputCls}
                  />
                </div>

                <Field
                  required
                  label="Point of Contact — Name & Role"
                  placeholder="e.g. Alexander Wright (Managing Partner)"
                  value={formData.contactNameRole}
                  onChange={(v) => handleInputChange('contactNameRole', v)}
                />
                <Field
                  required
                  type="email"
                  label="Contact Email"
                  placeholder="e.g. alexander@fosterpartners.com"
                  value={formData.contactEmail}
                  onChange={(v) => handleInputChange('contactEmail', v)}
                />
                <Field
                  label="Contact Phone (Optional)"
                  placeholder="e.g. +44 20 7946 0912"
                  value={formData.contactPhone}
                  onChange={(v) => handleInputChange('contactPhone', v)}
                />
                <Field
                  required
                  label="Industry / Domain"
                  placeholder="e.g. Luxury Real Estate, High-Rise Architecture, Hospitality"
                  value={formData.industry}
                  onChange={(v) => handleInputChange('industry', v)}
                />
                <Field
                  label="Team size involved in this project"
                  placeholder="e.g. 5–15 decision makers"
                  value={formData.teamSize}
                  onChange={(v) => handleInputChange('teamSize', v)}
                />
                <SelectField
                  label="How did you find us?"
                  value={formData.referralSource}
                  options={REFERRAL_OPTIONS}
                  onChange={(v) => handleInputChange('referralSource', v)}
                />
              </div>
            </section>

            {/* SECTION B */}
            <section className="p-6 sm:p-8 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-5">
              <SectionHeader
                icon={<AlertTriangle className="w-5 h-5" />}
                iconColor="text-amber-400"
                title={
                  <>
                    B. The Pain Point{' '}
                    <span className="text-xs text-amber-400 font-mono font-normal">(Most Important Section)</span>
                  </>
                }
                subtitle="Describe the core friction in your own words — not the solution you think you need."
              />
              <TextAreaField
                required
                label="What is the specific problem you are facing right now?"
                placeholder="e.g. Investors cannot grasp our 60-storey master tower from static PDF renderings..."
                rows={3}
                value={formData.specificProblem}
                onChange={(v) => handleInputChange('specificProblem', v)}
              />
              <TextAreaField
                required
                label="What are you currently doing to solve this?"
                placeholder="e.g. Manual email markups, competitor tools, physical clay models, spreadsheets..."
                rows={2}
                value={formData.currentSolution}
                onChange={(v) => handleInputChange('currentSolution', v)}
              />
              <TextAreaField
                required
                label="What is the cost of NOT solving this?"
                placeholder="e.g. Lost pre-sales revenue, 4-month longer deal cycle, manual rendering revision bottlenecks..."
                rows={2}
                value={formData.costOfNotSolving}
                onChange={(v) => handleInputChange('costOfNotSolving', v)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Who feels this pain the most?"
                  value={formData.whoFeelsPain}
                  options={['Me / the founder', 'My internal team', 'Our end customers', 'All of the above']}
                  onChange={(v) => handleInputChange('whoFeelsPain', v)}
                />
                <SelectField
                  label="Is this a recurring pain or a one-time need?"
                  value={formData.painType}
                  options={['Recurring / ongoing', 'One-time']}
                  onChange={(v) => handleInputChange('painType', v)}
                />
              </div>
            </section>

            {/* SECTION C */}
            <section className="p-6 sm:p-8 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-5">
              <SectionHeader
                icon={<Target className="w-5 h-5" />}
                iconColor="text-sky-400"
                title="C. Desired Outcome"
                subtitle="Quantifying success and future milestones"
              />
              <TextAreaField
                required
                label="If this problem were solved perfectly, what changes in 3 months?"
                placeholder="e.g. 50% of penthouse units booked before construction, zero rendering ambiguity during council reviews..."
                rows={3}
                value={formData.threeMonthOutcome}
                onChange={(v) => handleInputChange('threeMonthOutcome', v)}
              />
              <Field
                label="What metric will you judge this by?"
                placeholder="e.g. Faster sales cycle, higher lead conversion, client satisfaction score"
                value={formData.successMetric}
                onChange={(v) => handleInputChange('successMetric', v)}
              />
            </section>

            {/* SECTION D */}
            <section className="p-6 sm:p-8 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-5">
              <SectionHeader
                icon={<Layers className="w-5 h-5" />}
                iconColor="text-[#3ECF8E]"
                title="D. What Are You Looking For?"
                subtitle="Select all delivery surfaces that apply to your roadmap"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SOLUTION_OPTIONS.map((opt) => {
                  const isChecked = formData.solutionTypes.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleSolutionType(opt)}
                      className={`p-3.5 rounded-xl text-left border flex items-center justify-between transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-[#27272A] border-[#3ECF8E] text-white font-bold shadow-sm'
                          : 'bg-[#09090B] border-[#27272A] text-[#A1A1AA] hover:text-white hover:border-[#71717A]'
                      }`}
                    >
                      <span className="text-xs">{opt}</span>
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                          isChecked ? 'bg-[#3ECF8E] border-[#3ECF8E] text-black' : 'border-[#3f3f46] bg-transparent'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <Field
                label='If "Other", please specify:'
                placeholder="e.g. Interactive physical touch screen kiosk for sales gallery"
                value={formData.otherSolution}
                onChange={(v) => handleInputChange('otherSolution', v)}
              />
            </section>

            {/* SECTION E */}
            <section className="p-6 sm:p-8 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-5">
              <SectionHeader
                icon={<FileCode className="w-5 h-5" />}
                iconColor="text-purple-400"
                title="E. Functional Requirements"
                subtitle="Features, integrations, and asset repositories"
              />
              <TextAreaField
                required
                label="List every feature you want — even rough ideas"
                placeholder="e.g. 1) 360 virtual tour, 2) Material finishes switcher, 3) Realtime sun angle slider, 4) Encrypted client access..."
                rows={4}
                value={formData.featureList}
                onChange={(v) => handleInputChange('featureList', v)}
              />
              <TextAreaField
                label="Rank must-have vs nice-to-have"
                placeholder="e.g. Must-have: 8K exterior renders. Nice-to-have: VR headset build."
                rows={2}
                value={formData.priorityRanking}
                onChange={(v) => handleInputChange('priorityRanking', v)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field
                  label="Who are the end users?"
                  placeholder="e.g. Buyers, internal architects, admin"
                  value={formData.endUsers}
                  onChange={(v) => handleInputChange('endUsers', v)}
                />
                <Field
                  label="Existing systems to integrate with"
                  placeholder="e.g. Revit BIM, IFC, HubSpot CRM"
                  value={formData.existingSystems}
                  onChange={(v) => handleInputChange('existingSystems', v)}
                />
                <Field
                  label="Brand assets to work within"
                  placeholder="e.g. Logo vector, brand guideline, fonts"
                  value={formData.brandAssets}
                  onChange={(v) => handleInputChange('brandAssets', v)}
                />
              </div>
            </section>

            {/* SECTION F */}
            <section className="p-6 sm:p-8 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-5">
              <SectionHeader
                icon={<DollarSign className="w-5 h-5" />}
                iconColor="text-emerald-400"
                title="F. Constraints & Governance"
                subtitle="Budget tiers, project timelines, and sign-off authority"
              />
              <div>
                <FieldLabel required>Budget Range</FieldLabel>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {BUDGET_OPTIONS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => handleInputChange('budgetRange', b)}
                      className={`p-3 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                        formData.budgetRange === b
                          ? 'bg-[#27272A] border-[#3ECF8E] text-[#3ECF8E] font-bold'
                          : 'bg-[#09090B] border-[#27272A] text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Timeline / Hard Deadline (if any)"
                  placeholder="e.g. October 15, 2026 (Global Launch)"
                  value={formData.timeline}
                  onChange={(v) => handleInputChange('timeline', v)}
                />
                <Field
                  label="Technology preferences / restrictions"
                  placeholder="e.g. Unreal Engine 5.4, WebXR, Next.js"
                  value={formData.techPreferences}
                  onChange={(v) => handleInputChange('techPreferences', v)}
                />
                <Field
                  label="Who owns final sign-off on this project?"
                  placeholder="e.g. Alexander Wright (Managing Partner)"
                  value={formData.signOffOwner}
                  onChange={(v) => handleInputChange('signOffOwner', v)}
                />
                <Field
                  label="Compliance or data residency requirements"
                  placeholder="e.g. NDA protected geometry, GDPR, Private Cloud"
                  value={formData.complianceNeeds}
                  onChange={(v) => handleInputChange('complianceNeeds', v)}
                />
              </div>
            </section>

            {/* SECTION G */}
            <section className="p-6 sm:p-8 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-5">
              <SectionHeader
                icon={<Compass className="w-5 h-5" />}
                iconColor="text-rose-400"
                title="G. Competitive / Reference Context"
                subtitle="Design aesthetics and benchmarks you admire or want to avoid"
              />
              <TextAreaField
                label="Any tools, apps, or websites you like the feel of?"
                placeholder="e.g. Apple product launch site, Foster + Partners flagship interactive portal..."
                rows={2}
                value={formData.referencesLiked}
                onChange={(v) => handleInputChange('referencesLiked', v)}
              />
              <TextAreaField
                label="Any tools, apps, or websites you want to avoid resembling?"
                placeholder="e.g. Generic template portfolios with laggy slow loading 3D canvases..."
                rows={2}
                value={formData.referencesAvoided}
                onChange={(v) => handleInputChange('referencesAvoided', v)}
              />
            </section>

            {/* SUBMIT */}
            <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div className="text-xs text-[#71717A] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#3ECF8E]" />
                <span>Protected by AES-256 asset encryption & NDA guarantee</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#3ECF8E]/25 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>Generating Proposal Queue...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Discovery Brief</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-sm text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]';

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-mono text-[#A1A1AA] mb-1.5">
      {children} {required && <span className="text-rose-500">*</span>}
    </label>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  required,
  type = 'text',
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: 'text' | 'email' | 'tel';
}) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  );
}

function TextAreaField({
  label,
  placeholder,
  value,
  onChange,
  required,
  rows = 3,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <textarea
        required={required}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} resize-none`}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function SectionHeader({
  icon,
  iconColor,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  iconColor: string;
  title: React.ReactNode;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-[#27272A]">
      <div className={`p-2 rounded-lg bg-[#09090B] ${iconColor} border border-[#27272A]`}>{icon}</div>
      <div>
        <h3 className="text-base sm:text-lg font-bold text-white font-serif">{title}</h3>
        <p className="text-xs text-[#A1A1AA]">{subtitle}</p>
      </div>
    </div>
  );
}
