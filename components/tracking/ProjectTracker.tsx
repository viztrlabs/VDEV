'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { mockTrackedProjects, ALL_STAGES, TrackedProject } from '@/data/projects-tracking';
import { useAppStore } from '@/lib/store';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  Clock,
  Circle,
  FileText,
  Download,
  Eye,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Lock,
  ChevronRight,
  Layers,
  FastForward,
  RotateCcw
} from 'lucide-react';

interface ProjectTrackerProps {
  initialProjectId?: string;
}

export default function ProjectTracker({ initialProjectId }: ProjectTrackerProps = {}) {
  const { showToast, openLightbox, dispatchAlert } = useAppStore();

  const getInitialFound = () => {
    if (!initialProjectId) return null;
    return mockTrackedProjects.find(
      (p) => p.id.toUpperCase() === initialProjectId.toUpperCase()
    ) || null;
  };

  const initialFound = getInitialFound();

  const [projectIdInput, setProjectIdInput] = useState(initialFound?.id || '');
  const [accessCodeInput, setAccessCodeInput] = useState(initialFound?.accessCode || '');
  const [activeProject, setActiveProject] = useState<TrackedProject | null>(
    initialFound ? JSON.parse(JSON.stringify(initialFound)) : null
  );
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(!!initialFound);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setHasSearched(true);

    const cleanId = projectIdInput.trim().toUpperCase();
    const cleanCode = accessCodeInput.trim().toUpperCase();

    const found = mockTrackedProjects.find(
      (p) => p.id.toUpperCase() === cleanId && p.accessCode.toUpperCase() === cleanCode
    );

    if (found) {
      // Create a fresh clone so interactive stage simulations work seamlessly
      setActiveProject(JSON.parse(JSON.stringify(found)));
      showToast(`Project found: ${found.name}`, 'success');
    } else {
      setActiveProject(null);
      setError('Invalid Project ID or Access Code. Please check your credentials or try our demo tokens below.');
      showToast('Project credentials not found.', 'error');
    }
  };

  const loadSampleCredentials = (id: string, code: string) => {
    setProjectIdInput(id);
    setAccessCodeInput(code);
    const found = mockTrackedProjects.find((p) => p.id === id && p.accessCode === code);
    if (found) {
      setActiveProject(JSON.parse(JSON.stringify(found)));
      setHasSearched(true);
      setError('');
      showToast(`Loaded demo project: ${id}`, 'info');
    }
  };

  // Interactive stage switcher for live demonstration of progress transitions
  const setProjectStage = (targetStage: number) => {
    if (!activeProject) return;
    const clampedStage = Math.max(1, Math.min(7, targetStage));
    const newProgress = Math.round((clampedStage / 7) * 100);

    let newStatus: TrackedProject['status'] = 'In Production';
    if (clampedStage === 4) newStatus = 'Client Review';
    else if (clampedStage === 5) newStatus = 'Revisions';
    else if (clampedStage === 7) newStatus = 'Completed';

    const updatedStages = ALL_STAGES.map((stg) => {
      const existing = activeProject.stages.find((s) => s.stage === stg.stage);
      let status: 'completed' | 'in-progress' | 'pending' = 'pending';
      if (stg.stage < clampedStage) status = 'completed';
      else if (stg.stage === clampedStage) status = clampedStage === 7 ? 'completed' : 'in-progress';

      return {
        stage: stg.stage,
        name: stg.name,
        status,
        date: existing?.date || (status === 'completed' || status === 'in-progress' ? 'Updated today' : undefined),
        description: existing?.description || stg.desc,
        deliverables: existing?.deliverables,
      };
    });

    setActiveProject({
      ...activeProject,
      currentStage: clampedStage,
      progressPercentage: newProgress,
      status: newStatus,
      stages: updatedStages,
    });

    const stageInfo = ALL_STAGES[clampedStage - 1];

    if (clampedStage === 7) {
      dispatchAlert({
        title: 'Project Pipeline Completed & Master Deliverables Ready',
        message: `${activeProject.name} (${activeProject.id}) master package is ready for download!`,
        type: 'milestone_ready',
        projectId: activeProject.id,
        projectName: activeProject.name,
        actionUrl: `/client-dashboard`,
      });
    } else {
      dispatchAlert({
        title: 'Project Status Updated',
        message: `${activeProject.name} (${activeProject.id}) transitioned to Stage ${clampedStage}: ${stageInfo.name} (${newProgress}%).`,
        type: 'status_change',
        projectId: activeProject.id,
        projectName: activeProject.name,
        actionUrl: `/client-dashboard`,
      });
    }
  };

  return (
    <div id="project-tracker-component" className="w-full max-w-5xl mx-auto space-y-6">
      {/* SEARCH / AUTHENTICATION CARD */}
      <div className="p-6 sm:p-8 rounded-[2rem] bg-[#131314] border border-[#1E293B] shadow-xl">
        <div className="flex items-center justify-between pb-5 mb-5 border-b border-[#1E293B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0A0A0B] border border-[#1E293B] text-[#00F0FF] flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#FAFAFA] font-display">
                Project Pipeline Authenticator
              </h3>
              <p className="text-xs text-[#B9CACB]">
                Enter Project ID and Access Key for render nodes and delivery proofs.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-[#71717A]">
            <span>NODE: NYC-CL-01</span>
            <span>•</span>
            <span className="text-[#42CF8B] flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#42CF8B] animate-pulse" />
              TLS 1.3 SECURE
            </span>
          </div>
        </div>

        <form onSubmit={handleTrack} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#B9CACB] mb-1.5">
                Project ID
              </label>
              <input
                type="text"
                required
                id="tracker-project-id"
                placeholder="e.g. VZ-9021"
                value={projectIdInput}
                onChange={(e) => setProjectIdInput(e.target.value)}
                className="w-full px-5 py-3 rounded-full bg-[#0A0A0B] border border-[#1E293B] text-xs font-mono text-[#FAFAFA] focus:outline-none focus:border-[#00F0FF] transition-all shadow-inner"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#B9CACB] mb-1.5">
                Access Code
              </label>
              <input
                type="text"
                required
                id="tracker-access-code"
                placeholder="e.g. ALPHA-99"
                value={accessCodeInput}
                onChange={(e) => setAccessCodeInput(e.target.value)}
                className="w-full px-5 py-3 rounded-full bg-[#0A0A0B] border border-[#1E293B] text-xs font-mono text-[#FAFAFA] focus:outline-none focus:border-[#00F0FF] transition-all shadow-inner"
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs font-mono text-rose-400 flex items-center gap-2.5 overflow-hidden"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            id="tracker-submit-btn"
            className="w-full py-3.5 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-display font-extrabold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00F0FF]/25 active:scale-[0.99]"
          >
            <Search className="w-4 h-4" />
            <span>Authenticate & Inspect Project Progress</span>
          </button>
        </form>

        {/* Demo Quick-Click Badges */}
        <div className="mt-5 pt-4 border-t border-[#1E293B] flex flex-wrap items-center justify-between gap-2.5">
          <span className="text-[11px] font-mono text-[#71717A] flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
            PRESET DEMO TOKENS:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => loadSampleCredentials('VIZTR-DEMO', 'DEMO-2026')}
              className="px-3.5 py-1.5 rounded-full bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 text-[#00F0FF] text-[10px] font-mono font-bold border border-[#00F0FF]/40 transition-colors cursor-pointer"
            >
              ★ VIZTR-DEMO (Stage 4 Review)
            </button>
            <button
              type="button"
              onClick={() => loadSampleCredentials('VZ-9021', 'ALPHA-99')}
              className="px-3.5 py-1.5 rounded-full bg-[#0A0A0B] hover:border-[#00F0FF] text-[#B9CACB] hover:text-[#00F0FF] text-[10px] font-mono border border-[#1E293B] transition-colors cursor-pointer"
            >
              VZ-9021 (Stage 5 Revisions)
            </button>
            <button
              type="button"
              onClick={() => loadSampleCredentials('VZ-8410', 'VIP-2026')}
              className="px-3.5 py-1.5 rounded-full bg-[#0A0A0B] hover:border-[#42CF8B] text-[#B9CACB] hover:text-[#42CF8B] text-[10px] font-mono border border-[#1E293B] transition-colors cursor-pointer"
            >
              VZ-8410 (Stage 7 Completed)
            </button>
            <button
              type="button"
              onClick={() => loadSampleCredentials('VZ-7732', 'SKY-404')}
              className="px-3.5 py-1.5 rounded-full bg-[#0A0A0B] hover:border-[#00F0FF] text-[#B9CACB] hover:text-[#00F0FF] text-[10px] font-mono border border-[#1E293B] transition-colors cursor-pointer"
            >
              VZ-7732 (Stage 3 WebXR)
            </button>
          </div>
        </div>
      </div>

      {/* TRACKED PROJECT DETAILS & 7-STAGE TIMELINE WITH FRAMER MOTION TRANSITIONS */}
      <AnimatePresence mode="wait">
        {activeProject && (
          <motion.div
            key={activeProject.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            {/* Status Header Card */}
            <div className="p-6 sm:p-8 rounded-[2rem] bg-[#131314] text-white border border-[#1E293B] shadow-xl space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#1E293B]">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-[#0A0A0B] border border-[#00F0FF]/40 text-[#00F0FF] text-[10px] font-mono font-bold">
                      {activeProject.id}
                    </span>

                    {/* Animated Status Change Badge */}
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={activeProject.status}
                        initial={{ opacity: 0, scale: 0.9, y: -2 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 2 }}
                        transition={{ duration: 0.25 }}
                        className={`text-[10px] font-mono px-3 py-1 rounded-full border font-bold flex items-center gap-1.5 ${
                          activeProject.status === 'Completed'
                            ? 'bg-[#42CF8B]/15 text-[#42CF8B] border-[#42CF8B]/40'
                            : activeProject.status === 'Revisions'
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : activeProject.status === 'Client Review'
                            ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                            : 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/40'
                        }`}
                      >
                        <motion.span
                          className={`w-2 h-2 rounded-full ${
                            activeProject.status === 'Completed'
                              ? 'bg-[#42CF8B]'
                              : activeProject.status === 'Revisions'
                              ? 'bg-amber-400 animate-pulse'
                              : activeProject.status === 'Client Review'
                              ? 'bg-sky-400 animate-pulse'
                              : 'bg-[#00F0FF] animate-pulse'
                          }`}
                        />
                        {activeProject.status}
                      </motion.span>
                    </AnimatePresence>

                    <span className="text-[11px] text-[#B9CACB]">
                      {activeProject.serviceCategory}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-[#FAFAFA] font-display">
                    {activeProject.name}
                  </h3>
                  <p className="text-xs text-[#B9CACB] mt-1 flex items-center gap-2 flex-wrap">
                    <span>Client: <strong className="text-white">{activeProject.clientName}</strong></span>
                    <span>•</span>
                    <span>Target Delivery: <strong className="text-white">{activeProject.targetCompletion}</strong></span>
                  </p>
                </div>

                {/* Overall Progress Gauge */}
                <div className="flex items-center gap-3 bg-[#0A0A0B] p-3.5 rounded-2xl border border-[#1E293B] shrink-0 self-start md:self-auto shadow-inner">
                  <div className="text-right">
                    <div className="text-[9px] font-mono uppercase tracking-wider text-[#71717A]">
                      OVERALL PROGRESS
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeProject.progressPercentage}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.2 }}
                        className="text-2xl font-bold font-mono text-[#00F0FF]"
                      >
                        {activeProject.progressPercentage}%
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <motion.div
                    key={activeProject.currentStage}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="w-12 h-12 rounded-xl bg-[#131314] border border-[#1E293B] flex flex-col items-center justify-center font-bold font-mono text-[#00F0FF]"
                  >
                    <span className="text-[9px] text-[#71717A] leading-none">STAGE</span>
                    <span className="text-sm leading-tight">{activeProject.currentStage}/7</span>
                  </motion.div>
                </div>
              </div>

              {/* Framer Motion Smooth Animated Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#B9CACB]">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Layers className="w-3.5 h-3.5 text-[#00F0FF]" />
                    <span>Pipeline Progress Tracker</span>
                  </span>
                  <span className="text-[#00F0FF] font-bold">
                    Stage {activeProject.currentStage} of 7 ({ALL_STAGES[activeProject.currentStage - 1]?.name})
                  </span>
                </div>

                <div className="w-full bg-[#0A0A0B] h-3 rounded-full overflow-hidden border border-[#1E293B] relative">
                  <motion.div
                    className="bg-gradient-to-r from-[#00F0FF] via-[#42CF8B] to-[#00F0FF] h-full rounded-full relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${activeProject.progressPercentage}%` }}
                    transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* Glowing highlight tip on the progress bar */}
                    <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/70 rounded-full blur-[1px]" />
                  </motion.div>
                </div>
              </div>

              {/* Interactive Stage Stepper Controls for smooth milestone previewing */}
              <div className="pt-4 border-t border-[#1E293B] flex flex-wrap items-center justify-between gap-2.5">
                <span className="text-[10px] font-mono text-[#71717A] font-bold">
                  SIMULATE STAGE PROGRESSION:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {ALL_STAGES.map((s) => (
                    <button
                      key={s.stage}
                      onClick={() => setProjectStage(s.stage)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-mono transition-all cursor-pointer ${
                        activeProject.currentStage === s.stage
                          ? 'bg-[#00F0FF] text-black font-extrabold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                          : s.stage < activeProject.currentStage
                          ? 'bg-[#0A0A0B] text-[#42CF8B] border border-[#42CF8B]/40 hover:border-[#42CF8B]'
                          : 'bg-[#0A0A0B] text-[#71717A] border border-[#1E293B] hover:text-[#FAFAFA]'
                      }`}
                      title={`Jump to Stage ${s.stage}: ${s.name}`}
                    >
                      {s.stage}. {s.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 7-STAGE INTERACTIVE TIMELINE WITH STAGGERED MOTION */}
            <div className="p-6 sm:p-8 rounded-[2rem] bg-[#131314] border border-[#1E293B] space-y-5 shadow-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#FAFAFA] flex items-center gap-2">
                  <span>Production Pipeline Milestones</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0A0A0B] border border-[#1E293B] text-[#00F0FF] text-[10px]">
                    7 STAGES TOTAL
                  </span>
                </h4>
                <span className="text-[10px] font-mono text-[#71717A]">REAL-TIME AUDIT LOG</span>
              </div>

              <div className="relative pl-7 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1E293B]">
                {ALL_STAGES.map((stg, idx) => {
                  const stageData = activeProject.stages.find((s) => s.stage === stg.stage);
                  const isCompleted = stageData?.status === 'completed';
                  const isInProgress = stageData?.status === 'in-progress';
                  const isPending = !stageData || stageData.status === 'pending';

                  return (
                    <motion.div
                      key={stg.stage}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: idx * 0.04 }}
                      className="relative"
                    >
                      {/* Animated Stage Icon Node */}
                      <motion.div
                        animate={
                          isInProgress
                            ? { scale: [1, 1.15, 1] }
                            : isCompleted
                            ? { scale: 1 }
                            : { scale: 1 }
                        }
                        transition={
                          isInProgress
                            ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                            : { duration: 0.2 }
                        }
                        className={`absolute -left-7 top-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all shadow-md ${
                          isCompleted
                            ? 'bg-[#42CF8B] text-black shadow-[#42CF8B]/25'
                            : isInProgress
                            ? 'bg-[#00F0FF] text-black ring-4 ring-[#00F0FF]/25 shadow-[#00F0FF]/40'
                            : 'bg-[#1E293B] text-[#71717A]'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <span>{stg.stage}</span>
                        )}
                      </motion.div>

                      <div
                        className={`p-5 rounded-2xl border transition-all duration-300 ${
                          isInProgress
                            ? 'bg-[#0A0A0B] border-[#00F0FF]/60 shadow-lg shadow-[#00F0FF]/10'
                            : isCompleted
                            ? 'bg-[#0A0A0B] border-[#1E293B]'
                            : 'bg-[#0A0A0B]/60 border-[#1E293B]/60 opacity-75'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="text-xs sm:text-sm font-bold text-[#FAFAFA]">
                              Stage {stg.stage}: {stg.name}
                            </h5>
                            {isInProgress && (
                              <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-[9px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 flex items-center gap-1.5"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-ping" />
                                Active Node
                              </motion.span>
                            )}
                            {isCompleted && (
                              <span className="text-[9px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#42CF8B]/15 text-[#42CF8B] border border-[#42CF8B]/30">
                                Verified
                              </span>
                            )}
                          </div>
                          {stageData?.date && (
                            <span className="text-[10px] text-[#71717A] font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#71717A]" />
                              {stageData.date}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#B9CACB] leading-relaxed">
                          {stageData?.description || stg.desc}
                        </p>

                        {/* Associated Deliverables */}
                        {stageData?.deliverables && stageData.deliverables.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 pt-3.5 border-t border-[#1E293B] space-y-2.5"
                          >
                            <div className="text-[9px] font-mono font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                              <FileText className="w-3 h-3 text-[#00F0FF]" />
                              <span>Attached Artifacts & Proofs ({stageData.deliverables.length})</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {stageData.deliverables.map((deliv, dIdx) => (
                                <div
                                  key={dIdx}
                                  className="flex items-center justify-between p-3 rounded-xl bg-[#131314] border border-[#1E293B] text-xs hover:border-[#00F0FF]/40 transition-colors"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <FileText className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
                                    <span className="truncate text-[#FAFAFA] font-medium text-xs">
                                      {deliv.name}
                                    </span>
                                    <span className="text-[9px] text-[#71717A] font-mono">
                                      ({deliv.size})
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                    {deliv.previewUrl && (
                                      <button
                                        onClick={() =>
                                          openLightbox([{ url: deliv.previewUrl!, title: deliv.name, type: 'image' }])
                                        }
                                        className="p-1.5 rounded-full bg-[#1E293B] hover:bg-[#00F0FF] hover:text-black transition-colors cursor-pointer text-[#FAFAFA]"
                                        title="Quick View Proof"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => showToast(`Initiating download for ${deliv.name}`, 'info')}
                                      className="p-1.5 rounded-full bg-[#00F0FF] text-black hover:bg-[#33f3ff] transition-colors cursor-pointer font-bold shadow-sm shadow-[#00F0FF]/25"
                                      title="Download File"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

