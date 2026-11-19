'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { useSiteSection } from '@/lib/use-site-section';
import { getTextField, getDefaultSection } from '@/lib/site-content';
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
  if (editMode) return <EditableText fieldId={fieldId} as={Tag} className={className} />;
  if (rich) return <Tag className={className} dangerouslySetInnerHTML={{ __html: sanitizeRichText(value) }} />;
  return <Tag className={className}>{value}</Tag>;
}

export default function FinalCTASection() {
  const section = useSiteSection('final-cta') ?? getDefaultSection('final-cta');
  const content = {
    badge: getTextField(section, 'badge', ''),
    heading: getTextField(section, 'heading', ''),
    description: getTextField(section, 'description', ''),
    primaryLabel: getTextField(section, 'primaryLabel', ''),
    primaryHref: getTextField(section, 'primaryHref', ''),
    secondaryLabel: getTextField(section, 'secondaryLabel', ''),
    secondaryHref: getTextField(section, 'secondaryHref', ''),
  };

  return (
 <section
 id="final-cta-section"
 className="relative py-24 px-4 sm:px-6 bg-[#0A0A0B] border-t border-[#1E293B] text-white overflow-hidden"
 >
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none"/>

 <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#131314] border border-[#1E293B] text-xs text-[#00F0FF] font-bold uppercase tracking-widest shadow-sm">
 <span className="w-2 h-2 rounded-full bg-[#42CF8B] animate-pulse"/>
 <CmsText fieldId="badge" value={content.badge}/>
 </div>

 <CmsText fieldId="heading" value={content.heading} as="h2" className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-[#FAFAFA]"/>

 <CmsText fieldId="description" value={content.description} as="p" rich className="text-xs sm:text-sm text-[#B9CACB] max-w-xl mx-auto leading-relaxed"/>

 <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
 <Link
 href={content.primaryHref}
 id="final-cta-start-btn"
 className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-display font-extrabold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
 >
 <CmsText fieldId="primaryLabel" value={content.primaryLabel}/>
 <ArrowRight className="w-4 h-4 text-black"/>
 </Link>

 <Link
 href={content.secondaryHref}
 id="final-cta-consult-btn"
 className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#131314] hover:bg-[#1E293B] text-[#FAFAFA] font-bold text-xs uppercase tracking-wider border border-[#1E293B] hover:border-[#00F0FF]/50 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm active:scale-95"
 >
 <Calendar className="w-4 h-4 text-[#00F0FF]"/>
 <CmsText fieldId="secondaryLabel" value={content.secondaryLabel}/>
 </Link>

 </div>
 </div>
 </section>
 );
}
