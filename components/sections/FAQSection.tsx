'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
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

export default function FAQSection() {
  const section = useSiteSection('faq') ?? getDefaultSection('faq');
  const eyebrow = getTextField(section, 'eyebrow', 'KNOWLEDGE BASE');
  const heading = getTextField(section, 'heading', 'Frequently Asked Questions');
  const description = getTextField(
    section,
    'description',
    'Architectural CGI, WebXR formats, and project delivery specs.',
  );
  const faq = getListItems(section, 'faq').map((entry) => ({
    id: entry.id,
    q: entry.values.q ?? '',
    a: entry.values.a ?? '',
  }));

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq-section"className="py-16 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#3b494b]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#54de99] animate-pulse"/>
            <CmsText fieldId="eyebrow" value={eyebrow} className="text-[11px] font-bold uppercase tracking-widest text-[#54de99]"/>
          </div>
          <CmsText fieldId="heading" value={heading} as="h2" className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-[#e5e2e3]"/>
        </div>
        <CmsText fieldId="description" value={description} as="p" rich className="text-xs sm:text-sm text-[#B9CACB] max-w-xs"/>
      </div>

      <div className="space-y-3">
        {faq.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={item.id}
              className="rounded-2xl bg-[#131314] border border-[#3b494b] overflow-hidden transition-all duration-300 hover:border-[#00F0FF]/30 shadow-sm"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                aria-expanded={isOpen}
              >
                <span className="text-sm sm:text-base font-display font-bold text-[#e5e2e3]">
                  {item.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#71717A] shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#00F0FF]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-[#B9CACB] leading-relaxed border-t border-[#3b494b] pt-4 animate-in fade-in duration-200">
                  <CmsText fieldId="a" listFieldId="faq" itemId={item.id} value={item.a} rich/>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
