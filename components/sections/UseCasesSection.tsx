'use client';

import React, { useState } from 'react';
import {
  Building2,
  Compass,
  Home,
  Megaphone,
  Globe,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useSiteSection } from '@/lib/use-site-section';
import { getDefaultSection, getListItems, getTextField } from '@/lib/site-content';
import { sanitizeRichText } from '@/lib/sanitize-rich-text';
import EditableText from '@/components/admin/live-editor/in-context/EditableText';
import { useEditMode } from '@/components/admin/live-editor/in-context/EditModeContext';

const USE_CASE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Compass,
  Home,
  Megaphone,
  Globe,
};

function CmsText({
  fieldId,
  listFieldId,
  itemId,
  value,
  as: Tag = 'span',
  className,
  rich,
}: {
  fieldId: string;
  listFieldId?: string;
  itemId?: string;
  value: string;
  as?: React.ElementType;
  className?: string;
  rich?: boolean;
}) {
  const { editMode } = useEditMode();
  if (editMode) {
    return <EditableText fieldId={fieldId} listFieldId={listFieldId} itemId={itemId} as={Tag} className={className}/>;
  }
  if (rich) return <Tag className={className} dangerouslySetInnerHTML={{ __html: sanitizeRichText(value) }}/>;
  return <Tag className={className}>{value}</Tag>;
}

export default function UseCasesSection() {
  const section = useSiteSection('use-cases') ?? getDefaultSection('use-cases');
  const eyebrow = getTextField(section, 'eyebrow', 'VERTICAL SPECIALIZATION');
  const heading = getTextField(section, 'heading', 'Built For Your Industry');
  const description = getTextField(
    section,
    'description',
    'Solving key commercialization and presentation hurdles across the built environment spectrum.',
  );
  const panelEyebrow = getTextField(section, 'panelEyebrow', 'INDUSTRY SPECIFICATION');
  const challengeLabel = getTextField(section, 'challengeLabel', 'The Challenge');
  const solutionLabel = getTextField(section, 'solutionLabel', 'VizTR Solution');
  const impactLabel = getTextField(section, 'impactLabel', 'Commercial Impact');
  const cases = getListItems(section, 'cases').map((useCase) => ({
    id: useCase.id,
    audience: useCase.values.audience ?? '',
    problem: useCase.values.problem ?? '',
    solution: useCase.values.solution ?? '',
    benefit: useCase.values.benefit ?? '',
    icon: useCase.meta?.icon ?? 'Building2',
  }));

  const [activeTab, setActiveTab] = useState(0);

  const current = cases[activeTab] ?? cases[0];
  const IconComponent = USE_CASE_ICONS[current?.icon ?? 'Building2'] ?? Building2;

  return (
    <section id="use-cases-section"className="py-16 px-4 sm:px-6 bg-[#131314] border-y border-[#3b494b]">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#3b494b]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#54de99] animate-pulse"/>
              <CmsText fieldId="eyebrow" value={eyebrow} className="text-[11px] font-bold uppercase tracking-widest text-[#54de99]"/>
            </div>
            <CmsText fieldId="heading" value={heading} as="h2" className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-[#e5e2e3]"/>
          </div>
          <CmsText fieldId="description" value={description} as="p" rich className="text-xs sm:text-sm text-[#B9CACB] max-w-md"/>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {cases.map((uc, idx) => {
            const TabIcon = USE_CASE_ICONS[uc.icon] ?? Building2;
            return (
              <button
                key={uc.id}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer border ${
                  activeTab === idx
                    ? 'bg-[#00F0FF] text-black border-[#00F0FF] '
                    : 'bg-[#131314] text-[#B9CACB] border-[#3b494b] hover:text-[#e5e2e3] hover:border-[#00F0FF]/40'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5"/>
                <span>{uc.audience}</span>
              </button>
            );
          })}
        </div>

        {current && (
          <div className="p-6 sm:p-8 rounded-[2rem] bg-[#131314] border border-[#3b494b] space-y-6 animate-in fade-in duration-300 shadow-xl">
            <div className="flex items-center gap-3 pb-5 border-b border-[#3b494b]">
              <div className="w-12 h-12 rounded-full bg-[#131314] border border-[#3b494b] text-[#00F0FF] flex items-center justify-center shadow-inner">
                <IconComponent className="w-5 h-5"/>
              </div>
              <div>
                <CmsText fieldId="panelEyebrow" value={panelEyebrow} className="text-[11px] uppercase font-bold text-[#00F0FF] tracking-wider"/>
                <CmsText fieldId="audience" listFieldId="cases" itemId={current.id} value={current.audience} as="h3" className="text-lg sm:text-xl font-display font-bold text-[#e5e2e3]"/>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#131314] border border-rose-500/30 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5"/>
                  <CmsText fieldId="challengeLabel" value={challengeLabel}/>
                </div>
                <CmsText fieldId="problem" listFieldId="cases" itemId={current.id} value={current.problem} as="p" rich className="text-xs text-[#B9CACB] leading-relaxed"/>
              </div>

              <div className="p-5 rounded-2xl bg-[#131314] border border-[#3b494b] space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#e5e2e3] flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#00F0FF]"/>
                  <CmsText fieldId="solutionLabel" value={solutionLabel}/>
                </div>
                <CmsText fieldId="solution" listFieldId="cases" itemId={current.id} value={current.solution} as="p" rich className="text-xs text-[#B9CACB] leading-relaxed"/>
              </div>

              <div className="p-5 rounded-2xl bg-[#131314] border border-[#54de99]/40 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#54de99] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5"/>
                  <CmsText fieldId="impactLabel" value={impactLabel}/>
                </div>
                <CmsText fieldId="benefit" listFieldId="cases" itemId={current.id} value={current.benefit} as="p" rich className="text-xs text-[#B9CACB] leading-relaxed"/>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
