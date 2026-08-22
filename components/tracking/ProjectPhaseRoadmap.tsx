'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/lib/store';
import {
  CheckCircle2,
  Clock,
  Circle,
  FileText,
  Download,
  Eye,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Timer,
  AlertCircle,
  Play,
  FileCode,
  FileSpreadsheet,
  Box,
  CornerDownRight,
  Check
} from 'lucide-react';

export interface StageDeliverable {
  id: string;
  name: string;
  type: 'TIFF' | 'JPG' | 'PNG' | 'DWG' | 'IFC' | 'GLB' | 'MP4' | 'PDF' | 'JSON';
  size: string;
  description?: string;
  previewUrl?: string;
  downloadUrl?: string;
  isAvailable: boolean;
}

export interface RoadmapStage {
  stage: number;
  title: string;
  subtitle: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  expectedDuration: string;
  actualDate?: string;
  leadSupervisor?: string;
  completionPercentage: number;
  deliverables?: StageDeliverable[];
  keyMilestoneNotes?: string;
}

interface ProjectPhaseRoadmapProps {
  stages: RoadmapStage[];
  currentStageNumber: number;
  projectName: string;
  projectId: string;
  className?: string;
}

export default function ProjectPhaseRoadmap({
  stages: initialStages,
  currentStageNumber,
  projectName,
  projectId,
  className = '',
}: ProjectPhaseRoadmapProps) {
  const { showToast, openLightbox, openPanorama } = useAppStore();
  const [expandedStage, setExpandedStage] = useState<number | null>(currentStageNumber);
  const [filterType, setFilterType] = useState<'all' | 'completed' | 'active' | 'deliverables'>('all');

  const toggleExpand = (stageNum: number) => {
    setExpandedStage((prev) => (prev === stageNum ? null : stageNum));
  };

  const handleDeliverableAction = (deliverable: StageDeliverable) => {
    if (!deliverable.isAvailable) {
      showToast(`Asset "${deliverable.name}" will unlock upon stage signoff.`, 'info');
      return;
    }

    if (deliverable.previewUrl) {
      openLightbox([
        {
          url: deliverable.previewUrl,
          title: deliverable.name,
          type: 'image',
          caption: `Stage Deliverable (${deliverable.type}) · ${deliverable.size}`,
        },
      ]);
    } else {
      showToast(`Downloading deliverable: ${deliverable.name} (${deliverable.size})`, 'success');
    }
  };

  const filteredStages = initialStages.filter((stg) => {
    if (filterType === 'completed') return stg.status === 'completed';
    if (filterType === 'active') return stg.status === 'in-progress';
    if (filterType === 'deliverables') return (stg.deliverables && stg.deliverables.length > 0);
    return true;
  });

  const completedCount = initialStages.filter((s) => s.status === 'completed').length;
  const overallProgress = Math.round((completedCount / initialStages.length) * 100);

  const getStatusBadge = (status: RoadmapStage['status'], stage: number) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-950/70 border border-emerald-800 text-emerald-400">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Approved & Signed</span>
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-950/70 border border-amber-700 text-amber-400 animate-pulse">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Active Pipeline Stage</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-[#71717A] bg-[#09090B] border border-[#27272A]">
            <Circle className="w-2.5 h-2.5 text-[#52525B]" />
            <span>Upcoming Phase</span>
          </span>
        );
    }
  };

  return (
    <div
      id={`project-phase-roadmap-${projectId}`}
      className={`rounded-2xl bg-[#18181B] border border-[#27272A] overflow-hidden ${className}`}
    >
      {/* HEADER BAR */}
      <div className="p-5 border-b border-[#27272A] bg-[#18181B] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-center text-[#3ECF8E]">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-display text-white">
                Project Phase Roadmap
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#09090B] border border-[#27272A] text-[#3ECF8E]">
                7-Stage Architectural Pipeline
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA]">
              Comprehensive milestone progression, expected phase turnaround, and direct access to review deliverables.
            </p>
          </div>

          {/* OVERALL PROGRESS CHIP */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#09090B] border border-[#27272A] shrink-0">
            <div className="space-y-0.5 text-right">
              <div className="text-[10px] font-mono uppercase text-[#71717A]">
                Stage {currentStageNumber} of 7
              </div>
              <div className="text-xs font-mono font-bold text-white">
                {overallProgress}% Pipeline Velocity
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-center font-mono font-bold text-xs text-[#3ECF8E]">
              {completedCount}/7
            </div>
          </div>
        </div>

        {/* ROADMAP FILTER CONTROLS */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#09090B] border border-[#27272A] overflow-x-auto text-xs font-mono">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-[#18181B] text-white font-bold border border-[#3ECF8E]/40 text-[#3ECF8E]'
                  : 'text-[#71717A] hover:text-white'
              }`}
            >
              All 7 Stages
            </button>
            <button
              onClick={() => setFilterType('active')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                filterType === 'active'
                  ? 'bg-[#18181B] text-amber-400 font-bold border border-amber-800'
                  : 'text-[#71717A] hover:text-amber-300'
              }`}
            >
              Active Stage
            </button>
            <button
              onClick={() => setFilterType('completed')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                filterType === 'completed'
                  ? 'bg-[#18181B] text-emerald-400 font-bold border border-emerald-800'
                  : 'text-[#71717A] hover:text-emerald-300'
              }`}
            >
              Completed ({completedCount})
            </button>
            <button
              onClick={() => setFilterType('deliverables')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                filterType === 'deliverables'
                  ? 'bg-[#18181B] text-[#3ECF8E] font-bold border border-[#3ECF8E]/40'
                  : 'text-[#71717A] hover:text-white'
              }`}
            >
              With Deliverables
            </button>
          </div>

          <button
            onClick={() => setExpandedStage(expandedStage === null ? currentStageNumber : null)}
            className="text-xs font-mono text-[#71717A] hover:text-white transition-colors flex items-center gap-1 shrink-0"
          >
            <span>{expandedStage === null ? 'Expand Active' : 'Collapse All'}</span>
          </button>
        </div>
      </div>

      {/* VERTICAL INTERACTIVE PIPELINE ROADMAP */}
      <div className="p-5 space-y-3">
        <div className="relative pl-6 sm:pl-8 space-y-4">
          {/* CONTINUOUS VERTICAL STEPPER CONNECTOR LINE */}
          <div className="absolute left-[17px] sm:left-[21px] top-4 bottom-4 w-0.5 bg-[#27272A]" />

          {filteredStages.map((stageItem) => {
            const isExpanded = expandedStage === stageItem.stage;
            const isCurrent = stageItem.stage === currentStageNumber;
            const isCompleted = stageItem.status === 'completed';
            const isInProgress = stageItem.status === 'in-progress';

            return (
              <div
                key={stageItem.stage}
                id={`roadmap-stage-${stageItem.stage}`}
                className="relative group"
              >
                {/* STEPPER NODE ICON (ABSOLUTE OVER CONNECTOR LINE) */}
                <div
                  className={`absolute -left-[24px] sm:-left-[28px] top-3.5 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition-all ${
                    isCompleted
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-400 shadow-sm'
                      : isInProgress
                      ? 'bg-amber-950 border-amber-500 text-amber-300 ring-4 ring-amber-500/20'
                      : 'bg-[#18181B] border-[#27272A] text-[#71717A]'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3 h-3 stroke-[3]" />
                  ) : isInProgress ? (
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  ) : (
                    <span className="text-[10px] font-mono font-bold">{stageItem.stage}</span>
                  )}
                </div>

                {/* STAGE CONTAINER CARD */}
                <div
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isInProgress
                      ? 'bg-[#09090B] border-amber-800/70 shadow-lg'
                      : isCompleted
                      ? 'bg-[#09090B] border-[#27272A] hover:border-emerald-900/60'
                      : 'bg-[#09090B]/60 border-[#27272A]/70 hover:border-[#27272A]'
                  }`}
                >
                  {/* STAGE HEADER (CLICKABLE ACCORDION) */}
                  <div
                    onClick={() => toggleExpand(stageItem.stage)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#71717A]">
                          Stage 0{stageItem.stage}
                        </span>
                        <h4
                          className={`text-sm font-bold font-display truncate transition-colors ${
                            isInProgress
                              ? 'text-white'
                              : isCompleted
                              ? 'text-zinc-100 group-hover:text-emerald-300'
                              : 'text-zinc-400'
                          }`}
                        >
                          {stageItem.title}
                        </h4>
                        {getStatusBadge(stageItem.status, stageItem.stage)}
                      </div>
                      <p className="text-xs text-[#A1A1AA] line-clamp-1">
                        {stageItem.subtitle}
                      </p>
                    </div>

                    {/* DURATION & TIMING META */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right space-y-0.5 hidden sm:block">
                        <div className="text-[11px] font-mono text-white flex items-center gap-1 justify-end">
                          <Timer className="w-3 h-3 text-[#3ECF8E]" />
                          <span>{stageItem.expectedDuration}</span>
                        </div>
                        {stageItem.actualDate && (
                          <div className="text-[10px] font-mono text-[#71717A]">
                            {stageItem.actualDate}
                          </div>
                        )}
                      </div>

                      <button
                        className="p-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-[#A1A1AA] group-hover:text-white transition-colors"
                        aria-label="Toggle details"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* STAGE EXPANDED DETAILS */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-[#27272A] bg-[#18181B]/80 p-4 space-y-4 text-xs font-mono"
                      >
                        {/* DESCRIPTION & PROTOCOL */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase text-[#71717A] font-bold tracking-wider">
                            Phase Scope & Execution Protocol
                          </span>
                          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                            {stageItem.description}
                          </p>
                        </div>

                        {/* METADATA GRID */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div className="p-2.5 rounded-lg bg-[#09090B] border border-[#27272A] space-y-1">
                            <span className="text-[10px] text-[#71717A] uppercase flex items-center gap-1">
                              <Timer className="w-3 h-3 text-[#3ECF8E]" />
                              <span>Expected Turnaround</span>
                            </span>
                            <div className="text-white font-bold">{stageItem.expectedDuration}</div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-[#09090B] border border-[#27272A] space-y-1">
                            <span className="text-[10px] text-[#71717A] uppercase flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#3ECF8E]" />
                              <span>Recorded Timestamp</span>
                            </span>
                            <div className="text-white font-bold">
                              {stageItem.actualDate || 'In Pipeline Queue'}
                            </div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-[#09090B] border border-[#27272A] space-y-1">
                            <span className="text-[10px] text-[#71717A] uppercase flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-[#3ECF8E]" />
                              <span>Lead CGI Supervisor</span>
                            </span>
                            <div className="text-white font-bold truncate">
                              {stageItem.leadSupervisor || 'VizTR Architectural Lab'}
                            </div>
                          </div>
                        </div>

                        {/* KEY MILESTONE NOTES */}
                        {stageItem.keyMilestoneNotes && (
                          <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A] flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 text-[#3ECF8E] shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <div className="text-[10px] font-bold uppercase text-white">
                                Milestone Signoff Note
                              </div>
                              <p className="text-[11px] text-[#A1A1AA] font-sans">
                                {stageItem.keyMilestoneNotes}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* STAGE SPECIFIC DELIVERABLES */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase text-[#71717A] font-bold tracking-wider flex items-center gap-1.5">
                              <FileText className="w-3 h-3 text-[#3ECF8E]" />
                              <span>
                                Stage Deliverables & Assets ({stageItem.deliverables?.length || 0})
                              </span>
                            </span>
                            {stageItem.deliverables && stageItem.deliverables.length > 0 && (
                              <span className="text-[10px] text-[#3ECF8E]">
                                {stageItem.deliverables.filter((d) => d.isAvailable).length} Ready for Download
                              </span>
                            )}
                          </div>

                          {stageItem.deliverables && stageItem.deliverables.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {stageItem.deliverables.map((deliv) => (
                                <div
                                  key={deliv.id}
                                  id={`stage-deliv-${deliv.id}`}
                                  className={`p-3 rounded-lg border flex items-center justify-between gap-2.5 transition-all ${
                                    deliv.isAvailable
                                      ? 'bg-[#09090B] border-[#27272A] hover:border-[#3ECF8E]/50'
                                      : 'bg-[#09090B]/50 border-[#27272A]/50 opacity-60'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-center shrink-0 font-bold text-[10px] text-[#3ECF8E]">
                                      {deliv.type}
                                    </div>
                                    <div className="min-w-0 space-y-0.5">
                                      <div className="text-xs font-bold text-white truncate" title={deliv.name}>
                                        {deliv.name}
                                      </div>
                                      <div className="text-[10px] text-[#71717A]">
                                        {deliv.size} · {deliv.isAvailable ? 'Available' : 'Pending Stage Signoff'}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    {deliv.previewUrl && deliv.isAvailable && (
                                      <button
                                        onClick={() => handleDeliverableAction(deliv)}
                                        className="p-1.5 rounded bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                                        title="Preview in 8K Lightbox"
                                      >
                                        <Eye className="w-3.5 h-3.5 text-[#3ECF8E]" />
                                      </button>
                                    )}

                                    <button
                                      onClick={() => handleDeliverableAction(deliv)}
                                      disabled={!deliv.isAvailable}
                                      className={`p-1.5 rounded transition-all ${
                                        deliv.isAvailable
                                          ? 'bg-[#3ECF8E]/10 hover:bg-[#3ECF8E] text-[#3ECF8E] hover:text-black border border-[#3ECF8E]/30 cursor-pointer'
                                          : 'bg-transparent text-[#52525B] cursor-not-allowed'
                                      }`}
                                      title={deliv.isAvailable ? 'Download Asset' : 'Locked'}
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A] text-center text-[#71717A] text-[11px]">
                              Internal calibration milestone — master assets bundle compiled in Stage 06 & 07.
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER PIPELINE NOTE */}
      <div className="p-3 bg-[#09090B] border-t border-[#27272A] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-[#71717A]">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#3ECF8E]" />
          <span>Stage completion notifications are dispatched to your registered email & desktop alerts automatically.</span>
        </div>
        <div className="text-[#A1A1AA]">
          Studio Turnaround Guarantee: ≤ 48h per revision cycle
        </div>
      </div>
    </div>
  );
}
