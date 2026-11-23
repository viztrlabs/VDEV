'use client';

import React from 'react';
import ProjectTracker from '@/components/tracking/ProjectTracker';
import { useSiteSection } from '@/lib/use-site-section';
import { getDefaultSection, getTextField } from '@/lib/site-content';
import { sanitizeRichText } from '@/lib/sanitize-rich-text';
import EditableText from '@/components/admin/live-editor/in-context/EditableText';
import { useEditMode } from '@/components/admin/live-editor/in-context/EditModeContext';

function CmsText({
  fieldId,
  value,
  as: Tag = 'span',
  className,
  rich,
}: {
  fieldId: string;
  value: string;
  as?: React.ElementType;
  className?: string;
  rich?: boolean;
}) {
  const { editMode } = useEditMode();
  if (editMode) {
    return <EditableText fieldId={fieldId} as={Tag} className={className}/>;
  }
  if (rich) return <Tag className={className} dangerouslySetInnerHTML={{ __html: sanitizeRichText(value) }}/>;
  return <Tag className={className}>{value}</Tag>;
}

export default function TrackProjectSection() {
  const section = useSiteSection('track-project') ?? getDefaultSection('track-project');
  const eyebrow = getTextField(section, 'eyebrow', 'TELEMETRY & LOGS');
  const heading = getTextField(section, 'heading', 'Track Active Pipeline Milestone');
  const description = getTextField(
    section,
    'description',
    'Monitor your 7-stage production pipeline, review draft proofs, and access master files in real time.',
  );

  return (
    <section id="track-project-section"className="py-16 px-4 sm:px-6 max-w-[1400px] mx-auto">
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

      <ProjectTracker />
    </section>
  );
}
