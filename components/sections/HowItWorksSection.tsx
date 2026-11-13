'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useSiteSection } from '@/lib/use-site-section';
import { getDefaultSection, getListItems, getTextField } from '@/lib/site-content';
import { sanitizeRichText } from '@/lib/sanitize-rich-text';
import EditableText from '@/components/admin/live-editor/in-context/EditableText';
import { useEditMode } from '@/components/admin/live-editor/in-context/EditModeContext';

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

export default function HowItWorksSection() {
  const section = useSiteSection('how-it-works') ?? getDefaultSection('how-it-works');
  const eyebrow = getTextField(section, 'eyebrow', 'PIPELINE WORKFLOW');
  const heading = getTextField(section, 'heading', 'How It Works');
  const description = getTextField(
    section,
    'description',
    'From raw CAD geometry to high-impact marketing imagery and interactive spatial links.',
  );
  const syncLabel = getTextField(section, 'syncLabel', 'Full Portal Sync');
  const steps = getListItems(section, 'steps').map((step, index) => ({
    id: step.id,
    phase: String(index + 1).padStart(2, '0'),
    title: step.values.title ?? '',
    desc: step.values.desc ?? '',
  }));

  return (
    <section id="how-it-works-section"className="py-16 px-4 sm:px-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#42CF8B] animate-pulse"/>
            <CmsText fieldId="eyebrow" value={eyebrow} className="text-[11px] font-bold uppercase tracking-widest text-[#42CF8B]"/>
          </div>
          <CmsText fieldId="heading" value={heading} as="h2" className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-[#FAFAFA]"/>
        </div>
        <CmsText fieldId="description" value={description} as="p" rich className="text-xs sm:text-sm text-[#B9CACB] max-w-md"/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {steps.map((step) => (
          <div
            key={step.id}
            className="relative p-6 rounded-[2rem] bg-[#131314] border border-[#1E293B] hover:border-[#00F0FF]/40 transition-all duration-300 flex flex-col justify-between group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-black font-display text-[#00F0FF]">
                  {step.phase}
                </span>
                <span className="text-[10px] font-bold uppercase px-3 py-1 rounded-full bg-[#0A0A0B] text-[#B9CACB] border border-[#1E293B]">
                  PHASE {step.phase}
                </span>
              </div>
              <CmsText fieldId="title" listFieldId="steps" itemId={step.id} value={step.title} as="h3" className="text-base font-display font-bold text-[#FAFAFA] mb-2"/>
              <CmsText fieldId="desc" listFieldId="steps" itemId={step.id} value={step.desc} as="p" rich className="text-xs text-[#B9CACB] leading-relaxed"/>
            </div>

            <div className="mt-5 pt-3.5 border-t border-[#1E293B] flex items-center gap-2 text-[11px] text-[#42CF8B] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#42CF8B]"/>
              <CmsText fieldId="syncLabel" value={syncLabel}/>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
