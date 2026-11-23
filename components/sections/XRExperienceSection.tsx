'use client';

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { ScanLine, Box, Headset, Compass, ArrowRight } from 'lucide-react';
import { useSiteSection } from '@/lib/use-site-section';
import { getDefaultSection, getListItems, getTextField } from '@/lib/site-content';
import { sanitizeRichText } from '@/lib/sanitize-rich-text';
import EditableText from '@/components/admin/live-editor/in-context/EditableText';
import { useEditMode } from '@/components/admin/live-editor/in-context/EditModeContext';

const EXPERIENCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ScanLine,
  Box,
  Headset,
  Compass,
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

export default function XRExperienceSection() {
  const section = useSiteSection('xr-experience') ?? getDefaultSection('xr-experience');
  const { openPanorama, openModelViewer } = useAppStore();
  const eyebrow = getTextField(section, 'eyebrow', 'LIVE INTERACTIVE RUNTIME');
  const heading = getTextField(section, 'heading', 'Experience the Future of Architecture');
  const description = getTextField(section, 'description', 'Test zero-install spatial modules directly in your browser with hardware-accelerated WebXR.');

  const experiences = getListItems(section, 'experiences').map((experience) => ({
    id: experience.id,
    title: experience.values.title ?? '',
    desc: experience.values.desc ?? '',
    cta: experience.values.cta ?? '',
    actionType: experience.meta?.actionType ?? 'link',
    actionTarget: experience.meta?.actionTarget ?? '',
    icon: experience.meta?.icon ?? '',
    color: experience.meta?.color ?? 'text-[#00F0FF]',
  }));

  const dispatchAction = (actionType: string, actionTarget: string, label: string) => {
    switch (actionType) {
      case 'modelViewer':
        openModelViewer('', actionTarget || label);
        break;
      case 'panorama':
        openPanorama('', actionTarget || label);
        break;
      default:
        break;
    }
  };

  return (
    <section id="xr-experience-section" className="py-16 px-4 sm:px-6 bg-[#131314] text-white border-y border-[#3b494b] relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto relative z-10">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {experiences.map((exp) => {
            const Icon = EXPERIENCE_ICONS[exp.icon] ?? Box;
            return (
              <div
                key={exp.id}
                className="p-6 rounded-[2rem] bg-[#131314] border border-[#3b494b] hover:border-[#00F0FF]/40 transition-all duration-300 flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="w-10 h-10 rounded-full bg-[#131314] border border-[#3b494b] flex items-center justify-center mb-4 text-[#00F0FF] group-hover:border-[#00F0FF]/50 transition-colors">
                    <Icon className={`w-4 h-4 ${exp.color}`}/>
                  </div>
                  <CmsText fieldId="title" listFieldId="experiences" itemId={exp.id} value={exp.title} as="h3" className="text-base font-display font-bold text-[#e5e2e3] mb-2"/>
                  <CmsText fieldId="desc" listFieldId="experiences" itemId={exp.id} value={exp.desc} as="p" rich className="text-xs text-[#B9CACB] leading-relaxed"/>
                </div>

                <div className="pt-5 mt-4 border-t border-[#3b494b]">
                  {exp.actionType === 'link' ? (
                    <Link
                      href={exp.actionTarget || '#'}
                      className="w-full py-2.5 rounded-full bg-[#131314] hover:bg-[#00F0FF] hover:text-black text-[#e5e2e3] border border-[#3b494b] hover:border-[#00F0FF] text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
                    >
                      <CmsText fieldId="cta" listFieldId="experiences" itemId={exp.id} value={exp.cta}/>
                      <ArrowRight className="w-3.5 h-3.5"/>
                    </Link>
                  ) : (
                    <button
                      onClick={() => dispatchAction(exp.actionType, exp.actionTarget, exp.title)}
                      className="w-full py-2.5 rounded-full bg-[#131314] hover:bg-[#00F0FF] hover:text-black text-[#e5e2e3] border border-[#3b494b] hover:border-[#00F0FF] text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <CmsText fieldId="cta" listFieldId="experiences" itemId={exp.id} value={exp.cta}/>
                      <ArrowRight className="w-3.5 h-3.5"/>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
