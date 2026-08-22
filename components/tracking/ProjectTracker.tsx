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
      <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] shadow-xl">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#27272A]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#09090B] border border-[#27272A] text-[#3ECF8E] flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#FAFAFA] font-display">
                Project Pipeline Authenticator
              </h3>
              <p className="text-xs text-[#A1A1AA]">
                Enter Project ID and Access Key for render nodes and delivery proofs.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-[#71717A]">
            <span>NODE: NYC-CL-01</span>
            <span>•</span>
            <span className="text-[#3ECF8E] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E] animate-pulse" />
              TLS 1.3 SECURE
            </span>
          </div>
        </div>

        <form onSubmit={handleTrack} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">
                Project ID
              </label>
              <input
                type="text"
                required
                id="tracker-project-id"
                placeholder="e.g. VZ-9021"
                value={projectIdInput}
                onChange={(e) => setProjectIdInput(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-[#FAFAFA] focus:outline-none focus:border-[#3ECF8E] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">
                Access Code
              </label>
              <input
                type="text"
                required
                id="tracker-access-code"
                placeholder="e.g. ALPHA-99"
                value={accessCodeInput}
                onChange={(e) => setAccessCodeInput(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-[#FAFAFA] focus:outline-none focus:border-[#3ECF8E] transition-colors"
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
                className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs font-mono text-rose-400 flex items-center gap-2 overflow-hidden"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            id="tracker-submit-btn"
            className="w-full py-2.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#3ECF8E]/20 active:scale-[0.99]"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Authenticate & Inspect Project Progress</span>
          </button>
        </form>

        {/* Demo Quick-Click Badges */}
        <div className="mt-4 pt-3 border-t border-[#27272A] flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] font-mono text-[#71717A] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#3ECF8E]" />
            PRESET DEMO TOKENS:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => loadSampleCredentials('VZ-9021', 'ALPHA-99')}
              className="px-2.5 py-1 rounded bg-[#09090B] hover:border-[#3ECF8E] text-[#3ECF8E] text-[10px] font-mono border border-[#27272A] transition-colors cursor-pointer"
            >
              VZ-9021 (Stage 5 Revisions)
            </button>
            <button
              onClick={() => loadSampleCredentials('VZ-8410', 'VIP-2026')}
              className="px-2.5 py-1 rounded bg-[#09090B] hover:border-[#3ECF8E] text-[#3ECF8E] text-[10px] font-mono border border-[#27272A] transition-colors cursor-pointer"
            >
              VZ-8410 (Stage 7 Completed)
            </button>
            <button
              onClick={() => loadSampleCredentials('VZ-7732', 'SKY-404')}
              className="px-2.5 py-1 rounded bg-[#09090B] hover:border-[#3ECF8E] text-[#3ECF8E] text-[10px] font-mono border border-[#27272A] transition-colors cursor-pointer"
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
            <div className="p-6 rounded-2xl bg-[#18181B] text-white border border-[#27272A] shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-[#09090B] border border-[#3ECF8E]/40 text-[#3ECF8E] text-[10px] font-mono font-bold">
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
                        className={`text-[10px] font-mono px-2.5 py-0.5 rounded border font-semibold flex items-center gap-1.5 ${
                          activeProject.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : activeProject.status === 'Revisions'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : activeProject.status === 'Client Review'
                            ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                            : 'bg-[#3ECF8E]/10 text-[#3ECF8E] border-[#3ECF8E]/30'
                        }`}
                      >
                        <motion.span
                          className={`w-1.5 h-1.5 rounded-full ${
                            activeProject.status === 'Completed'
                              ? 'bg-emerald-400'
                              : activeProject.status === 'Revisions'
                              ? 'bg-amber-400 animate-pulse'
                              : activeProject.status === 'Client Review'
                              ? 'bg-sky-400 animate-pulse'
                              : 'bg-[#3ECF8E] animate-pulse'
                          }`}
                        />
                        {activeProject.status}
                      </motion.span>
                    </AnimatePresence>

                    <span className="text-[11px] text-[#A1A1AA]">
                      {activeProject.serviceCategory}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-[#FAFAFA] font-display">
                    {activeProject.name}
                  </h3>
                  <p className="text-xs text-[#A1A1AA] mt-1 flex items-center gap-2 flex-wrap">
                    <span>Client: <strong className="text-white">{activeProject.clientName}</strong></span>
                    <span>•</span>
                    <span>Target Delivery: <strong className="text-white">{activeProject.targetCompletion}</strong></span>
                  </p>
                </div>

                {/* Overall Progress Gauge */}
                <div className="flex items-center gap-3 bg-[#09090B] p-3 rounded-xl border border-[#27272A] shrink-0 self-start md:self-auto shadow-inner">
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
                        className="text-2xl font-bold font-mono text-[#3ECF8E]"
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
                    className="w-11 h-11 rounded-lg bg-[#18181B] border border-[#27272A] flex flex-col items-center justify-center font-bold font-mono text-[#3ECF8E]"
                  >
                    <span className="text-[9px] text-[#71717A] leading-none">STAGE</span>
                    <span className="text-sm leading-tight">{activeProject.currentStage}/7</span>
                  </motion.div>
                </div>
              </div>

              {/* Framer Motion Smooth Animated Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#A1A1AA]">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#3ECF8E]" />
                    <span>Pipeline Progress Tracker</span>
                  </span>
                  <span className="text-[#3ECF8E] font-bold">
                    Stage {activeProject.currentStage} of 7 ({ALL_STAGES[activeProject.currentStage - 1]?.name})
                  </span>
                </div>

                <div className="w-full bg-[#09090B] h-2.5 rounded-full overflow-hidden border border-[#27272A] relative">
                  <motion.div
                    className="bg-gradient-to-r from-[#3ECF8E] via-emerald-400 to-[#3ECF8E] h-full rounded-full relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${activeProject.progressPercentage}%` }}
                    transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* Glowing highlight tip on the progress bar */}
                    <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/60 rounded-full blur-[1px]" />
                  </motion.div>
                </div>
              </div>

              {/* Interactive Stage Stepper Controls for smooth milestone previewing */}
              <div className="pt-3 border-t border-[#27272A] flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-[#71717A]">
                  SIMULATE STAGE PROGRESSION:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {ALL_STAGES.map((s) => (
                    <button
                      key={s.stage}
                      onClick={() => setProjectStage(s.stage)}
                      className={`px-2 py-1 rounded text-[10px] font-mono transition-all cursor-pointer ${
                        activeProject.currentStage === s.stage
                          ? 'bg-[#3ECF8E] text-black font-bold shadow-sm'
                          : s.stage < activeProject.currentStage
                          ? 'bg-[#09090B] text-emerald-400 border border-emerald-500/30 hover:border-emerald-500'
                          : 'bg-[#09090B] text-[#71717A] border border-[#27272A] hover:text-[#FAFAFA]'
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
            <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-5 shadow-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#FAFAFA] flex items-center gap-2">
                  <span>Production Pipeline Milestones</span>
                  <span className="px-2 py-0.5 rounded bg-[#09090B] border border-[#27272A] text-[#3ECF8E] text-[10px]">
                    7 STAGES TOTAL
                  </span>
                </h4>
                <span className="text-[10px] font-mono text-[#71717A]">REAL-TIME AUDIT LOG</span>
              </div>

              <div className="relative pl-7 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#27272A]">
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
                            ? 'bg-[#3ECF8E] text-black shadow-[#3ECF8E]/20'
                            : isInProgress
                            ? 'bg-[#3ECF8E] text-black ring-4 ring-[#3ECF8E]/20 shadow-[#3ECF8E]/40'
                            : 'bg-[#27272A] text-[#71717A]'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <span>{stg.stage}</span>
                        )}
                      </motion.div>

                      <div
                        className={`p-4 rounded-xl border transition-all ${
                          isInProgress
                            ? 'bg-[#09090B] border-[#3ECF8E]/60 shadow-lg shadow-[#3ECF8E]/5'
                            : isCompleted
                            ? 'bg-[#09090B] border-[#27272A]'
                            : 'bg-[#09090B]/60 border-[#27272A]/60 opacity-75'
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
                                className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-[#3ECF8E]/20 text-[#3ECF8E] border border-[#3ECF8E]/40 flex items-center gap-1"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E] animate-ping" />
                                Active Node
                              </motion.span>
                            )}
                            {isCompleted && (
                              <span className="text-[9px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
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

                        <p className="text-xs text-[#A1A1AA] leading-relaxed">
                          {stageData?.description || stg.desc}
                        </p>

                        {/* Associated Deliverables */}
                        {stageData?.deliverables && stageData.deliverables.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3.5 pt-3 border-t border-[#27272A] space-y-2"
                          >
                            <div className="text-[9px] font-mono font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                              <FileText className="w-3 h-3 text-[#3ECF8E]" />
                              <span>Attached Artifacts & Proofs ({stageData.deliverables.length})</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {stageData.deliverables.map((deliv, dIdx) => (
                                <div
                                  key={dIdx}
                                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#18181B] border border-[#27272A] text-xs hover:border-[#3ECF8E]/40 transition-colors"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <FileText className="w-3.5 h-3.5 text-[#3ECF8E] shrink-0" />
                                    <span className="truncate text-[#FAFAFA] font-medium text-xs">
                                      {deliv.name}
                                    </span>
                                    <span className="text-[9px] text-[#71717A] font-mono">
                                      ({deliv.size})
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0 ml-2">
                                    {deliv.previewUrl && (
                                      <button
                                        onClick={() =>
                                          openLightbox([{ url: deliv.previewUrl!, title: deliv.name, type: 'image' }])
                                        }
                                        className="p-1.5 rounded bg-[#27272A] hover:bg-[#3ECF8E] hover:text-black transition-colors cursor-pointer text-[#FAFAFA]"
                                        title="Quick View Proof"
                                      >
                                        <Eye className="w-3 h-3" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => showToast(`Initiating download for ${deliv.name}`, 'info')}
                                      className="p-1.5 rounded bg-[#3ECF8E] text-black hover:bg-[#34b27b] transition-colors cursor-pointer font-bold"
                                      title="Download File"
                                    >
                                      <Download className="w-3 h-3" />
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

