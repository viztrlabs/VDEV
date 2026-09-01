'use client';

import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function PhaseProgressTracker() {
  const phases = [
    {
      id: 'brief',
      name: 'Brief & CAD/BIM Ingestion',
      status: 'completed',
      duration: '2 Days',
      actualDate: 'Feb 02, 2026',
      deliverables: [
        { name: 'Apex_Tower_Façade_Engineering_Set_Rev4.pdf', size: '42.8 MB', status: 'approved' },
        { name: 'Apex_Tower_LOD400_CurtainWall_BIM.ifc', size: '85.0 MB', status: 'approved' }
      ]
    },
    {
      id: 'modelling',
      name: '3D Modelling & Environment',
      status: 'completed',
      duration: '4 Days',
      actualDate: 'Feb 08, 2026',
      deliverables: [
        { name: 'Level40_Podium_Cantilever_Steel_Mesh.dwg', size: '114.2 MB', status: 'approved' },
        { name: 'Urban_Context_Site_Scattering_Draft.jpg', size: '6.4 MB', status: 'approved' }
      ]
    },
    {
      id: 'clay',
      name: 'Clay Renders & Master Cameras',
      status: 'completed',
      duration: '3 Days',
      actualDate: 'Feb 14, 2026',
      deliverables: [
        { name: 'Apex_Façade_Clay_Angles_Master_Set.jpg', size: '5.8 MB', status: 'approved' },
        { name: 'Camera_Signoff_Protocol_Signed.pdf', size: '2.1 MB', status: 'approved' }
      ]
    },
    {
      id: 'lighting',
      name: 'Lighting Calibration & PBR',
      status: 'in-progress',
      duration: '5 Days',
      actualDate: 'Active',
      completionPercentage: 80,
      deliverables: [
        { name: 'PBR_Photometric_IES_Glazing_Spectra.json', size: '4.2 MB', status: 'in-progress' },
        { name: 'Twilight_Atmospheric_HDRI_Proof_4K.jpg', size: '12.1 MB', status: 'approved' }
      ]
    },
    {
      id: 'review',
      name: 'Client Collaborative Review',
      status: 'in-progress',
      duration: '3 Days',
      actualDate: 'Active',
      completionPercentage: 60,
      deliverables: [
        { name: 'Stage_05_Lighting_Milestone_Signoff.pdf', size: '8.1 MB', status: 'in-review' },
        { name: 'Client_Markup_Overlay_Composite.jpg', size: '7.5 MB', status: 'in-progress' }
      ]
    }
  ];

  return (
    <section className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-6">
      <div className="border-b border-[#27272A] pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>🎯 Project Pipeline Status</span>
        </h2>
        <p className="text-xs text-[#A1A1AA] mt-1">Track progress through each project phase</p>
      </div>

      <div className="space-y-6">
        {phases.map((phase, index) => (
          <div key={phase.id} className="relative flex items-start gap-4">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 border ${
                phase.status === 'completed'
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
                  : phase.status === 'in-progress'
                  ? 'bg-amber-950/60 border-amber-500/50 text-amber-400'
                  : 'bg-[#09090B] border-[#27272A] text-[#71717A]'
              }`}
            >
              {phase.status === 'completed' && <CheckCircle2 className="w-5 h-5" />}
              {phase.status === 'in-progress' && <Clock className="w-5 h-5 animate-spin" />}
              {phase.status === 'pending' && <AlertCircle className="w-5 h-5" />}
            </div>

            <div className="flex-1 p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-white">{phase.name}</h4>
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase w-fit border ${
                    phase.status === 'completed'
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                      : phase.status === 'in-progress'
                      ? 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {phase.status.replace('-', ' ')}
                </span>
              </div>

              <div className="text-xs font-mono text-[#71717A] flex items-center gap-4">
                <span>Expected: {phase.duration}</span>
                <span>•</span>
                <span>Actual: {phase.actualDate}</span>
              </div>

              {phase.completionPercentage && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-[#A1A1AA]">
                    <span>Phase Completion</span>
                    <span>{phase.completionPercentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#18181B] overflow-hidden border border-[#27272A]">
                    <div
                      className="h-full bg-gradient-to-r from-[#3ECF8E] to-emerald-400 rounded-full transition-all"
                      style={{ width: `${phase.completionPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {phase.deliverables && phase.deliverables.length > 0 && (
                <div className="pt-2 border-t border-[#27272A] space-y-2">
                  <span className="text-[11px] font-mono text-[#A1A1AA]">
                    Deliverables ({phase.deliverables.length}):
                  </span>
                  <ul className="space-y-1.5">
                    {phase.deliverables.map((deliverable, idx) => (
                      <li
                        key={idx}
                        className="p-2 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-between text-xs"
                      >
                        <span className="font-mono text-zinc-300 truncate max-w-[240px] sm:max-w-md">
                          {deliverable.name}
                        </span>
                        <div className="flex items-center gap-2 font-mono text-[10px] shrink-0">
                          <span className="text-[#71717A]">{deliverable.size}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded capitalize ${
                              deliverable.status === 'approved'
                                ? 'text-emerald-400 bg-emerald-950/30'
                                : deliverable.status === 'in-progress'
                                ? 'text-amber-400 bg-amber-950/30'
                                : 'text-zinc-400 bg-zinc-800'
                            }`}
                          >
                            {deliverable.status}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {index < phases.length - 1 && (
              <div className="absolute left-[17px] top-10 bottom-[-24px] w-[2px] bg-[#27272A] z-0" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}