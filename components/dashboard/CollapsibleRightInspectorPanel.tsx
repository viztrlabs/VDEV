'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Clock,
  TrendingUp,
  Activity,
  Layers,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
  User,
  Shield,
  FileCheck,
  Zap,
  Sparkles,
  ExternalLink,
  Percent,
  Timer
} from 'lucide-react';
import { ManagedProject, TimesheetEntry, DisciplineHours } from '@/lib/projects-data';
import { useAppStore } from '@/lib/store';

interface CollapsibleRightInspectorPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  project: ManagedProject;
  onLogHours?: (projectId: string, entry: Omit<TimesheetEntry, 'id'>) => void;
  userRole?: 'SUPER_ADMIN' | 'ADMIN' | 'CLIENT' | 'USER';
}

export default function CollapsibleRightInspectorPanel({
  isOpen,
  onToggle,
  project,
  onLogHours,
  userRole = 'CLIENT',
}: CollapsibleRightInspectorPanelProps) {
  const [activeTab, setActiveTab] = useState<'hours' | 'pipeline'>('hours');
  const [showLogModal, setShowLogModal] = useState(false);
  const [logMember, setLogMember] = useState('Senior CGI Specialist');
  const [logTask, setLogTask] = useState('');
  const [logHours, setLogHours] = useState('3.5');
  const [logStage, setLogStage] = useState('Stage 4: Spatial Polish');

  const { showToast } = useAppStore();

  const { hoursMonitoring, pipeline } = project;
  const { estimatedHours, hoursSpent, hourlyRate, disciplineBreakdown, timesheetEntries } = hoursMonitoring;

  // Compute burn rate calculations
  const burnPercent = Math.round((hoursSpent / Math.max(estimatedHours, 1)) * 100);
  const totalCostConsumed = Math.round(hoursSpent * hourlyRate);
  const remainingHours = Math.max(estimatedHours - hoursSpent, 0);
  const isOverBudget = hoursSpent > estimatedHours;

  const handleCreateTimeEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTask.trim()) {
      showToast('Please specify the task description.', 'error');
      return;
    }

    const hoursNum = parseFloat(logHours) || 1.0;
    if (onLogHours) {
      onLogHours(project.id, {
        date: new Date().toISOString().split('T')[0],
        teamMember: logMember,
        role: 'Production Specialist',
        task: logTask,
        hours: hoursNum,
        stage: logStage,
      });
    }

    showToast(`Logged ${hoursNum} hours for ${project.id}.`, 'success');
    setLogTask('');
    setShowLogModal(false);
  };

  return (
    <div
      className={`relative transition-all duration-300 ease-in-out shrink-0 z-30 ${
        isOpen ? 'w-80 md:w-92' : 'w-12 md:w-14'
      }`}
    >
      {/* COLLAPSED STATE ICON STRIP */}
      {!isOpen && (
        <aside className="w-12 md:w-14 h-full bg-[#18181B] border-l border-[#27272A] flex flex-col items-center py-4 justify-between select-none">
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={onToggle}
              className="p-2.5 rounded-xl bg-[#27272A] hover:bg-[#3ECF8E]/20 text-[#A1A1AA] hover:text-[#3ECF8E] transition-colors cursor-pointer"
              title="Expand Hours Monitoring & Pipeline Inspector"
              aria-label="Expand Hours Monitoring & Pipeline Inspector"
            >
              <ChevronLeft className="w-4 h-4 text-[#3ECF8E]" />
            </button>

            <div className="w-8 h-px bg-[#27272A]" />

            <button
              onClick={onToggle}
              className="p-2 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#27272A] relative transition-colors"
              title="Hours Spent & Burn Rate"
            >
              <Clock className="w-4 h-4 text-[#3ECF8E]" />
            </button>

            <button
              onClick={onToggle}
              className="p-2 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors"
              title="Pipeline Stages"
            >
              <Layers className="w-4 h-4 text-sky-400" />
            </button>

            <button
              onClick={onToggle}
              className="p-2 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors"
              title="Budget Telemetry"
            >
              <DollarSign className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          <div className="writing-mode-vertical text-[10px] font-mono text-[#71717A] tracking-widest uppercase rotate-180 py-4">
            Hours & Pipeline
          </div>
        </aside>
      )}

      {/* EXPANDED FULL RIGHT INSPECTOR PANEL */}
      {isOpen && (
        <aside className="w-80 md:w-92 h-full bg-[#18181B] border-l border-[#27272A] flex flex-col justify-between overflow-hidden shadow-2xl">
          {/* HEADER */}
          <div className="p-3.5 border-b border-[#27272A] bg-[#141416] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 text-[#3ECF8E]">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider truncate">
                  Hours & Pipeline Telemetry
                </h3>
                <p className="text-[10px] font-mono text-[#71717A] truncate">
                  {project.id} · {project.projectType}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggle}
              className="p-1.5 rounded-md bg-[#27272A] hover:bg-[#3ECF8E]/20 text-[#A1A1AA] hover:text-[#3ECF8E] transition-colors cursor-pointer"
              title="Collapse Side Panel"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* TAB BAR: HOURS MONITORING VS PIPELINE */}
          <div className="flex items-center px-3 pt-2.5 border-b border-[#27272A] bg-[#18181B] gap-2">
            <button
              onClick={() => setActiveTab('hours')}
              className={`flex-1 py-1.5 text-xs font-mono font-bold text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'hours'
                  ? 'border-[#3ECF8E] text-[#3ECF8E]'
                  : 'border-transparent text-[#71717A] hover:text-[#A1A1AA]'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Hours Spent ({hoursSpent}h)</span>
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`flex-1 py-1.5 text-xs font-mono font-bold text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'pipeline'
                  ? 'border-[#3ECF8E] text-[#3ECF8E]'
                  : 'border-transparent text-[#71717A] hover:text-[#A1A1AA]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Pipeline ({pipeline.stages.length})</span>
            </button>
          </div>

          {/* TAB 1: HOURS SPENT MONITORING */}
          {activeTab === 'hours' && (
            <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs font-mono">
              {/* PRIMARY HOURS BURN GAUGE CARD */}
              <div className="p-3.5 rounded-xl bg-[#09090B] border border-[#27272A] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-[#A1A1AA] font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#3ECF8E]" />
                    <span>Time & Burn Allocation</span>
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      isOverBudget
                        ? 'bg-rose-950/80 text-rose-400 border border-rose-800'
                        : 'bg-[#3ECF8E]/20 text-[#3ECF8E] border border-[#3ECF8E]/40'
                    }`}
                  >
                    {burnPercent}% Consumed
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-[#141416] border border-[#27272A]">
                    <div className="text-[9px] text-[#71717A]">HOURS LOGGED</div>
                    <div className="text-lg font-bold text-white">{hoursSpent.toFixed(1)} hrs</div>
                    <div className="text-[9px] text-[#3ECF8E]">@ ${hourlyRate}/hr</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#141416] border border-[#27272A]">
                    <div className="text-[9px] text-[#71717A]">ESTIMATED BUDGET</div>
                    <div className="text-lg font-bold text-white">{estimatedHours.toFixed(1)} hrs</div>
                    <div className="text-[9px] text-[#A1A1AA]">{remainingHours.toFixed(1)} hrs remaining</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="h-2 w-full rounded-full bg-[#27272A] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        burnPercent > 90 ? 'bg-amber-400' : 'bg-[#3ECF8E]'
                      }`}
                      style={{ width: `${Math.min(burnPercent, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-[#71717A]">
                    <span>Cost Value: ${totalCostConsumed.toLocaleString()}</span>
                    <span>Commission Cap: ${project.bookingAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Admin/User Action: Log Hours Button */}
                {(userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'USER') && (
                  <button
                    type="button"
                    onClick={() => setShowLogModal(true)}
                    className="w-full py-1.5 px-3 rounded-lg bg-[#27272A] hover:bg-[#3ECF8E] hover:text-black text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Time Entry</span>
                  </button>
                )}
              </div>

              {/* DISCIPLINE BREAKDOWN */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                  Discipline Breakdown
                </h4>
                <div className="space-y-2">
                  {disciplineBreakdown.map((disc, idx) => {
                    const pct = Math.round((disc.hours / Math.max(disc.budgetHours, 1)) * 100);
                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-[#09090B] border border-[#27272A] space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-white font-medium truncate">{disc.discipline}</span>
                          <span className="text-[#A1A1AA] font-mono">
                            {disc.hours}h <span className="text-[#71717A]">/ {disc.budgetHours}h</span>
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[#18181B] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(pct, 100)}%`,
                              backgroundColor: disc.color || '#3ECF8E',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RECENT TIMESHEET ENTRIES */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                    Timesheet Audit Trail ({timesheetEntries.length})
                  </h4>
                  <span className="text-[9px] text-[#71717A]">Latest entries</span>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {timesheetEntries.map((ts) => (
                    <div
                      key={ts.id}
                      className="p-2.5 rounded-lg bg-[#09090B] border border-[#27272A] space-y-1 text-[10px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-1">
                          <User className="w-3 h-3 text-[#3ECF8E]" />
                          <span>{ts.teamMember}</span>
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-[#27272A] text-[#3ECF8E] font-bold">
                          +{ts.hours} hrs
                        </span>
                      </div>
                      <p className="text-[#A1A1AA] leading-relaxed line-clamp-2">{ts.task}</p>
                      <div className="flex items-center justify-between text-[9px] text-[#71717A] pt-0.5 border-t border-[#18181B]">
                        <span>{ts.stage}</span>
                        <span>{ts.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PIPELINE STAGES & DELIVERABLES */}
          {activeTab === 'pipeline' && (
            <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs font-mono">
              {/* PIPELINE OVERVIEW BADGE */}
              <div className="p-3 rounded-xl bg-[#09090B] border border-[#27272A] space-y-1.5">
                <div className="text-[10px] uppercase tracking-wider text-[#3ECF8E] font-bold">
                  Custom Pipeline Architecture
                </div>
                <div className="text-xs font-bold text-white">{pipeline.pipelineType}</div>
                <p className="text-[10px] text-[#A1A1AA]">
                  Tailored workflow with {pipeline.stages.length} gated quality benchmarks.
                </p>
              </div>

              {/* STAGES TIMELINE */}
              <div className="space-y-3 relative pl-3 border-l border-[#27272A]">
                {pipeline.stages.map((stage, idx) => {
                  const isCompleted = stage.status === 'completed';
                  const isInProgress = stage.status === 'in_progress';
                  const isReview = stage.status === 'review';

                  return (
                    <div key={idx} className="relative space-y-1.5">
                      {/* Node Bullet on border line */}
                      <div
                        className={`absolute -left-[19px] top-1 w-3 h-3 rounded-full border-2 ${
                          isCompleted
                            ? 'bg-[#3ECF8E] border-[#3ECF8E]'
                            : isInProgress
                            ? 'bg-sky-500 border-sky-400 animate-pulse'
                            : isReview
                            ? 'bg-amber-400 border-amber-300'
                            : 'bg-[#18181B] border-[#71717A]'
                        }`}
                      />

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#A1A1AA]">
                          STAGE {stage.stageNumber}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            isCompleted
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                              : isInProgress
                              ? 'bg-sky-950/80 text-sky-400 border border-sky-800'
                              : 'bg-[#27272A] text-[#71717A]'
                          }`}
                        >
                          {stage.eta}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#09090B] border border-[#27272A] space-y-1.5">
                        <h4 className="text-[11px] font-bold text-white">{stage.title}</h4>
                        <p className="text-[10px] text-[#A1A1AA] leading-relaxed">
                          {stage.description}
                        </p>

                        <div className="flex items-center justify-between text-[9px] text-[#71717A] pt-1 border-t border-[#18181B]">
                          <span>Deliverables: {stage.deliverablesApproved}/{stage.deliverablesCount}</span>
                          {isCompleted ? (
                            <span className="text-[#3ECF8E] flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" />
                              Approved
                            </span>
                          ) : (
                            <span className="text-sky-400">In Milestone</span>
                          )}
                        </div>

                        {stage.deliverablesList && stage.deliverablesList.length > 0 && (
                          <div className="pt-1 space-y-0.5">
                            {stage.deliverablesList.map((del, dIdx) => (
                              <div
                                key={dIdx}
                                className="flex items-center gap-1.5 text-[9px] text-[#A1A1AA]"
                              >
                                <span className="w-1 h-1 rounded-full bg-[#3ECF8E]" />
                                <span className="truncate">{del}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* BOTTOM FOOTER */}
          <div className="p-3 border-t border-[#27272A] bg-[#141416] flex items-center justify-between text-[10px] font-mono text-[#71717A]">
            <span>Lead: {project.leadArchitect}</span>
            <span className="text-[#3ECF8E] font-bold">Progress: {project.progress}%</span>
          </div>

          {/* TIME ENTRY MODAL */}
          {showLogModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-[#18181B] border border-[#27272A] rounded-2xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                  <div className="flex items-center gap-2 text-white font-mono font-bold text-sm">
                    <Clock className="w-4 h-4 text-[#3ECF8E]" />
                    <span>Log Timesheet Hours · {project.id}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="text-[#71717A] hover:text-white text-lg"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleCreateTimeEntry} className="space-y-3 text-xs font-mono">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#A1A1AA] uppercase">Team Member</label>
                    <input
                      type="text"
                      value={logMember}
                      onChange={(e) => setLogMember(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#A1A1AA] uppercase">Duration (Hours)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="24"
                        value={logHours}
                        onChange={(e) => setLogHours(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#A1A1AA] uppercase">Pipeline Stage</label>
                      <select
                        value={logStage}
                        onChange={(e) => setLogStage(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                      >
                        {pipeline.stages.map((st) => (
                          <option key={st.stageNumber} value={`Stage ${st.stageNumber}: ${st.title}`}>
                            Stage {st.stageNumber}: {st.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[#A1A1AA] uppercase">Task Description & Deliverables</label>
                    <textarea
                      rows={3}
                      value={logTask}
                      onChange={(e) => setLogTask(e.target.value)}
                      placeholder="e.g. Optimized WebXR shader pass, resolved lighting bounce artifact on cantilever..."
                      className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E] text-xs resize-none"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#27272A]">
                    <button
                      type="button"
                      onClick={() => setShowLogModal(false)}
                      className="px-3 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#3ECF8E]/90 text-black font-bold text-xs cursor-pointer"
                    >
                      Save Timesheet Log
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
