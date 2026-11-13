'use client';

import React from 'react';
import {
  Sparkles,
  Zap,
  Smartphone,
  Eye,
  TrendingUp,
  HeartHandshake,
  CloudCheck,
} from 'lucide-react';
import { useSiteSection } from '@/lib/use-site-section';
import { getDefaultSection, getListItems, getTextField } from '@/lib/site-content';
import { sanitizeRichText } from '@/lib/sanitize-rich-text';
import EditableText from '@/components/admin/live-editor/in-context/EditableText';
import { useEditMode } from '@/components/admin/live-editor/in-context/EditModeContext';

const BENEFIT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Zap,
  Smartphone,
  Eye,
  TrendingUp,
  HeartHandshake,
  CloudCheck,
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

export default function BenefitsSection() {
  const section = useSiteSection('benefits') ?? getDefaultSection('benefits');
  const eyebrow = getTextField(section, 'eyebrow', 'COMPETITIVE ADVANTAGE');
  const heading = getTextField(section, 'heading', 'Why Visionaries Choose VizTR');
  const description = getTextField(
    section,
    'description',
    'Engineered to elevate architectural presentation, accelerate pre-sales, and eliminate client review friction.',
  );
  const benefits = getListItems(section, 'benefits').map((benefit) => ({
    id: benefit.id,
    title: benefit.values.title ?? '',
    desc: benefit.values.desc ?? '',
    icon: benefit.meta?.icon ?? 'Sparkles',
  }));

  return (
    <section id="benefits-section"className="py-16 px-4 sm:px-6 bg-[#0A0A0B] border-y border-[#1E293B]">
      <div className="max-w-[1400px] mx-auto">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {benefits.map((benefit) => {
            const IconComponent = BENEFIT_ICONS[benefit.icon] ?? Sparkles;
            return (
              <div
                key={benefit.id}
                className="p-6 rounded-[2rem] bg-[#131314] border border-[#1E293B] hover:border-[#00F0FF]/40 transition-all duration-300 flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="w-10 h-10 rounded-full bg-[#0A0A0B] border border-[#1E293B] text-[#00F0FF] flex items-center justify-center mb-4 group-hover:border-[#00F0FF]/50 transition-colors shadow-inner">
                    <IconComponent className="w-4 h-4"/>
                  </div>
                  <CmsText fieldId="title" listFieldId="benefits" itemId={benefit.id} value={benefit.title} as="h3" className="text-sm font-display font-bold text-[#FAFAFA] mb-2"/>
                  <CmsText fieldId="desc" listFieldId="benefits" itemId={benefit.id} value={benefit.desc} as="p" rich className="text-xs text-[#B9CACB] leading-relaxed"/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
